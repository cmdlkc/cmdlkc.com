"use strict";

/* ==========================================================================
   THE LENS
   A small WebGL canvas that tracks the pointer and shows a locally
   refracted crop of whatever the base page just drew underneath it.

   It IS a fluid sim now — the same splat-then-advect logic as
   prototypes/liquid-glass, just a tiny patch of it (see LIQUID SIM below)
   instead of a whole page, and without that prototype's incompressibility
   solve (no divergence/curl/vorticity/pressure passes — plain advection
   plus fast decay is already enough liquid for something this small and
   this subtle). Two things fall out of running it LOCAL rather than in
   page space:
     · nothing is ever left behind. The patch has no page-space memory for
       a wake to sit in — move on and it simply isn't drawn anywhere but
       under the pointer.
     · sit still and it settles to genuinely flat well under a second —
       flat liquid bends nothing, so the lens goes essentially invisible
       at rest.

   Every frame:
     1. Ease the lens's own position a little way towards the real pointer
        position (`lens.follow`) — a touch of positional lag, on top of
        whatever lag the liquid itself adds.
     2. Read the raw pointer's frame-to-frame movement, turn it into a
        speed, and — above `lens.stillSpeed` — splat that motion into the
        little liquid patch (see LIQUID SIM). Every frame, regardless of
        motion, the patch is advected and decayed a step further.
     3. Crop a small square out of the base page's canvas, centred on the
        eased position, into a small offscreen 2D canvas.
     4. Upload that crop as a texture and run one shader pass over it: the
        liquid patch's height field (see LIQUID SIM) is read back to find
        which way its surface is sloped at each point, which bends the
        sample coordinates, splits colour slightly at the edges the way
        real glass does, and adds a tight highlight and rim light. Alpha
        fades to zero at the lens's outer edge so it blends into the plain
        page around it with no visible seam.
     5. Position the small canvas element itself, in CSS, exactly over the
        region that was cropped — so what you see lines up pixel-for-pixel
        with the page underneath.

   The whole thing operates on a crop maybe a few hundred pixels square,
   never the full window, which is what makes it cheap enough to run a full
   shader pass — now two, counting the liquid step — on every single frame
   regardless of whether the page itself changed.
   ========================================================================== */
function LENS(ROOT) {
(function () {
  'use strict';

  const CONFIG = ROOT.lens;
  const base = document.getElementById('glass');   // the plain, already-drawn page

  const canvas = document.createElement('canvas');
  canvas.id = 'lens';
  document.body.appendChild(canvas);
  const gl = canvas.getContext('webgl2', {
    alpha: true, antialias: false, depth: false, stencil: false, premultipliedAlpha: true
  });
  if (!gl) return;
  gl.getExtension('EXT_color_buffer_float');   // lets the liquid sim render to float textures
  const HALF = gl.HALF_FLOAT;

  // The little scratch canvas the crop is drawn into before it's uploaded.
  const crop = document.createElement('canvas');
  const cctx = crop.getContext('2d', { willReadFrequently: false });

  function compile(type, src) {
    const s = gl.createShader(type);
    gl.shaderSource(s, src); gl.compileShader(s);
    if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(s) + '\n' + src);
    return s;
  }
  function program(vs, fs) {
    const p = gl.createProgram();
    gl.attachShader(p, compile(gl.VERTEX_SHADER, vs));
    gl.attachShader(p, compile(gl.FRAGMENT_SHADER, fs));
    gl.linkProgram(p);
    if (!gl.getProgramParameter(p, gl.LINK_STATUS)) throw new Error(gl.getProgramInfoLog(p));
    const uniforms = {};
    const n = gl.getProgramParameter(p, gl.ACTIVE_UNIFORMS);
    for (let i = 0; i < n; i++) {
      const name = gl.getActiveUniform(p, i).name;
      uniforms[name] = gl.getUniformLocation(p, name);
    }
    return { p, uniforms };
  }

  const VERT = `#version 300 es
  in vec2 aPos;
  out vec2 vUv;
  void main () {
    vUv = aPos * 0.5 + 0.5;
    gl_Position = vec4(aPos, 0.0, 1.0);
  }`;

  /* ==========================================================================
     LIQUID SIM
     Straight out of prototypes/liquid-glass: a velocity field and a height
     field, splatted by the pointer and carried along by advection each
     frame, both losing a little energy as they go. The only things dropped
     are the passes that make a page-sized pool swirl convincingly
     (divergence / curl / vorticity / pressure) — at 48-ish cells across,
     for an effect this size, plain advection plus fast decay already reads
     as liquid rather than as a bouncing blob.
     ========================================================================== */
  const SPLAT = `#version 300 es
  precision highp float;
  in vec2 vUv;
  out vec4 fragColor;
  uniform sampler2D uTarget;
  uniform float radius, stretch;
  uniform vec2 point, dir;
  uniform vec3 color;
  void main () {
    vec2 p = vUv - point;
    // Stretch the splat along the direction of travel, same idea as the
    // full-size prototype: a round blob reads as "a thing is here", an
    // elongated one reads as "something went past".
    vec2 along = vec2(dot(p, dir), dot(p, vec2(-dir.y, dir.x)));
    along.x /= stretch;
    fragColor = vec4(texture(uTarget, vUv).xyz + exp(-dot(along, along) / radius) * color, 1.0);
  }`;

  const ADVECT = `#version 300 es
  precision highp float;
  precision highp sampler2D;
  in vec2 vUv;
  out vec4 fragColor;
  uniform sampler2D uSource, uVelocity;
  uniform vec2 uTexel;
  uniform float dt, dissipation;
  void main () {
    vec2 coord = vUv - dt * texture(uVelocity, vUv).xy * uTexel;
    fragColor = texture(uSource, coord) * dissipation;
  }`;

  // The glass pass reads this back to find which way the liquid's surface
  // is sloped at each point — see the fragment shader further down.
  const GLASS = `#version 300 es
  precision highp float;
  precision highp sampler2D;
  in vec2 vUv;
  out vec4 fragColor;
  uniform sampler2D uScene, uHeight;
  uniform vec2 uHeightTexel;
  uniform float uCircleR, uSoftness, uRefract, uDispersion, uSpecular, uRim, uRelief;

  float h (vec2 uv) { return texture(uHeight, uv).r; }

  void main () {
    vec2 p = (vUv - 0.5) * 2.0;
    float dist = length(p);
    float r = uCircleR > 0.0 ? dist / uCircleR : 0.0;
    if (r > 1.0) { fragColor = vec4(0.0); return; }

    vec2 e = uHeightTexel;
    float dx = h(vUv + vec2(e.x, 0.0)) - h(vUv - vec2(e.x, 0.0));
    float dy = h(vUv + vec2(0.0, e.y)) - h(vUv - vec2(0.0, e.y));
    float height = h(vUv);

    // Which way the liquid's surface is tilted. Flat gives (0,0,1) —
    // straight up — and everything below collapses to "leave it alone":
    // zero offset, zero highlight. That's what lets it disappear at rest.
    vec3 n = normalize(vec3(-dx * uRelief, -dy * uRelief, 1.0));
    vec2 offset = n.xy * uRefract * height;

    // Glass splits light: blue bends further than red. Sampling the three
    // channels at slightly different offsets is the whole of it.
    float d = uDispersion;
    vec3 col;
    col.r = texture(uScene, vUv + offset * (1.0 - d)).r;
    col.g = texture(uScene, vUv + offset).g;
    col.b = texture(uScene, vUv + offset * (1.0 + d)).b;

    vec3 lightDir = normalize(vec3(-0.45, 0.65, 0.62));
    float spec = pow(max(dot(n, lightDir), 0.0), 40.0) * uSpecular;
    float rim = pow(1.0 - n.z, 1.6) * uRim;

    // Confine the highlight to where there is actually liquid, or the
    // faintest numerical residue anywhere would pick up a rim light.
    float presence = smoothstep(0.0, 0.02, height);
    col += (spec + rim) * presence;

    float alpha = 1.0 - smoothstep(1.0 - uSoftness, 1.0, r);
    fragColor = vec4(clamp(col, 0.0, 1.0) * alpha, alpha);
  }`;

  const prog       = program(VERT, GLASS);
  const progSplat  = program(VERT, SPLAT);
  const progAdvect = program(VERT, ADVECT);

  gl.bindVertexArray(gl.createVertexArray());
  gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1,-1, 1,-1, -1,1, 1,1]), gl.STATIC_DRAW);
  gl.enableVertexAttribArray(0);
  gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);

  function makeFBO(w, h, internalFormat, format) {
    const tx = gl.createTexture();
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, tx);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texImage2D(gl.TEXTURE_2D, 0, internalFormat, w, h, 0, format, HALF, null);
    const fbo = gl.createFramebuffer();
    gl.bindFramebuffer(gl.FRAMEBUFFER, fbo);
    gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, tx, 0);
    gl.viewport(0, 0, w, h);
    gl.clearColor(0, 0, 0, 0);
    gl.clear(gl.COLOR_BUFFER_BIT);
    return { tex: tx, fbo, w, h, texelX: 1 / w, texelY: 1 / h,
      attach(id) { gl.activeTexture(gl.TEXTURE0 + id); gl.bindTexture(gl.TEXTURE_2D, tx); return id; } };
  }
  function makeDouble(w, h, internalFormat, format) {
    let a = makeFBO(w, h, internalFormat, format), b = makeFBO(w, h, internalFormat, format);
    return { w, h, texelX: 1 / w, texelY: 1 / h,
      get read() { return a; }, get write() { return b; },
      swap() { const t = a; a = b; b = t; } };
  }

  const SIM = Math.max(8, Math.round(CONFIG.simSize) || 48);
  const velocity = makeDouble(SIM, SIM, gl.RG16F, gl.RG);
  const height   = makeDouble(SIM, SIM, gl.R16F,  gl.RED);

  // How wide the splat's Gaussian falls off, in the patch's own 0..1 UV —
  // fixed rather than exposed, since `lens.displacement` already controls
  // how strongly it reads without needing a second size dial.
  const SPLAT_RADIUS = 0.06;

  function draw(target) {
    gl.bindFramebuffer(gl.FRAMEBUFFER, target ? target.fbo : null);
    gl.viewport(0, 0, target ? target.w : canvas.width, target ? target.h : canvas.height);
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
  }

  function splat(fx, fy, amount, dirX, dirY, stretch) {
    gl.useProgram(progSplat.p);
    gl.uniform2f(progSplat.uniforms.point, 0.5, 0.5);
    gl.uniform2f(progSplat.uniforms.dir, dirX, dirY);
    gl.uniform1f(progSplat.uniforms.stretch, stretch);
    gl.uniform1f(progSplat.uniforms.radius, SPLAT_RADIUS);

    gl.uniform1i(progSplat.uniforms.uTarget, velocity.read.attach(0));
    gl.uniform3f(progSplat.uniforms.color, fx, fy, 0);
    draw(velocity.write); velocity.swap();

    gl.uniform1i(progSplat.uniforms.uTarget, height.read.attach(0));
    gl.uniform3f(progSplat.uniforms.color, amount, amount, amount);
    draw(height.write); height.swap();
  }

  function stepSim(dt) {
    gl.useProgram(progAdvect.p);

    // Velocity carries itself along and loses a little energy each frame.
    gl.uniform2f(progAdvect.uniforms.uTexel, velocity.texelX, velocity.texelY);
    gl.uniform1i(progAdvect.uniforms.uVelocity, velocity.read.attach(0));
    gl.uniform1i(progAdvect.uniforms.uSource, velocity.read.attach(0));
    gl.uniform1f(progAdvect.uniforms.dt, dt);
    gl.uniform1f(progAdvect.uniforms.dissipation, Math.pow(CONFIG.viscosity, dt * 60));
    draw(velocity.write); velocity.swap();

    // The height bump is carried along by that velocity, and settles flat.
    gl.uniform2f(progAdvect.uniforms.uTexel, height.texelX, height.texelY);
    gl.uniform1i(progAdvect.uniforms.uVelocity, velocity.read.attach(0));
    gl.uniform1i(progAdvect.uniforms.uSource, height.read.attach(1));
    gl.uniform1f(progAdvect.uniforms.dissipation, Math.pow(CONFIG.settle, dt * 60));
    draw(height.write); height.swap();
  }

  const tex = gl.createTexture();
  gl.bindTexture(gl.TEXTURE_2D, tex);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

  // The crop is sized a good deal bigger than the visible lens radius, so
  // there is always real page content to sample even after the refraction
  // offset nudges a lookup outward — otherwise the very edge of the lens
  // would smear in clamped-edge pixels from the crop's own boundary.
  const MARGIN = 1.6;
  let R = 0, half = 0;

  function sizeFor() {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    R = CONFIG.radius * dpr;
    half = Math.max(8, Math.round(R * MARGIN));
    const S = half * 2;
    canvas.width = S; canvas.height = S;
    canvas.style.width  = (S / dpr) + "px";
    canvas.style.height = (S / dpr) + "px";
    crop.width = S; crop.height = S;
  }
  sizeFor();
  window.addEventListener("resize", sizeFor);

  let seen = false, over = false, px = 0, py = 0;
  const target = { x: 0, y: 0 };
  function updatePointer(x, y) {
    target.x = x; target.y = y; over = true;
    if (!seen) { px = x; py = y; seen = true; }
  }
  window.addEventListener("pointermove", e => updatePointer(e.clientX, e.clientY), { passive: true });
  window.addEventListener("touchmove", e => {
    if (e.touches[0]) updatePointer(e.touches[0].clientX, e.touches[0].clientY);
  }, { passive: true });

  // "pointerleave" on window is unreliable for "left the whole browser
  // viewport" — the classic cross-browser test is a mouseout whose
  // relatedTarget is null, fired on the document itself.
  document.addEventListener("mouseout", e => {
    if (!e.relatedTarget && !e.toElement) over = false;
  });

  let fade = 0;
  let last = performance.now();
  let lastTX = 0, lastTY = 0, tSeen = false;

  function frame(now) {
    const dt = Math.min((now - last) / 1000, 1 / 30);
    last = now;

    if (seen) {
      const k = 1 - Math.pow(1 - CONFIG.follow, dt * 60);
      px += (target.x - px) * k;
      py += (target.y - py) * k;

      // How far, and how fast, has the RAW pointer actually moved since the
      // last frame? This drives the liquid, independent of the eased (px,py)
      // position above, which only drives where the lens sits on screen.
      if (!tSeen) { lastTX = target.x; lastTY = target.y; tSeen = true; }
      const rdx = target.x - lastTX, rdy = target.y - lastTY;
      lastTX = target.x; lastTY = target.y;
      const dist = Math.hypot(rdx, rdy);
      const speed = dt > 0 ? dist / dt : 0;   // CSS pixels per second

      // Below `stillSpeed`, nothing is injected — the patch is left to
      // settle. Between `stillSpeed` and `fullSpeed` it ramps up smoothly,
      // so how much the liquid moves is a consequence of how fast the
      // pointer moved, not a fixed splat every frame.
      const lo = CONFIG.stillSpeed, hi = Math.max(CONFIG.fullSpeed, lo + 1);
      const t = Math.max(0, Math.min(1, (speed - lo) / (hi - lo)));
      const strength = t * t * (3 - 2 * t);

      if (strength > 0.002 && dist > 0.05) {
        const dirX = rdx / dist, dirY = rdy / dist;
        const push = CONFIG.flowForce * dt * strength;
        splat(dirX * push, dirY * push, CONFIG.displacement * strength, dirX, dirY, CONFIG.streak);
      }
      stepSim(dt);
    }

    const fadeTarget = (over && seen) ? 1 : 0;
    fade += (fadeTarget - fade) * (1 - Math.pow(0.0001, dt));
    canvas.style.opacity = fade < 0.004 ? "0" : String(fade);

    if (fade > 0.004) {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const sx = Math.round(px * dpr - half), sy = Math.round(py * dpr - half);
      cctx.clearRect(0, 0, crop.width, crop.height);
      cctx.drawImage(base, sx, sy, crop.width, crop.height, 0, 0, crop.width, crop.height);

      gl.bindFramebuffer(gl.FRAMEBUFFER, null);
      gl.viewport(0, 0, canvas.width, canvas.height);
      gl.clearColor(0, 0, 0, 0);
      gl.clear(gl.COLOR_BUFFER_BIT);
      gl.useProgram(prog.p);
      gl.activeTexture(gl.TEXTURE0);
      gl.bindTexture(gl.TEXTURE_2D, tex);
      // Without this a canvas source uploads with row 0 at v=0, which the
      // vertex shader's -1..1 quad turns into an upside-down image — a
      // flipped copy of the crop sitting on top of the real page beneath
      // it, which is what "distortion" actually looked like before this
      // was found: a mismatched mirror-image overlay, not a bend at all.
      gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, crop);
      gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, false);
      gl.uniform1i(prog.uniforms.uScene, 0);
      gl.uniform1i(prog.uniforms.uHeight, height.read.attach(1));
      gl.uniform2f(prog.uniforms.uHeightTexel, height.texelX, height.texelY);
      gl.uniform1f(prog.uniforms.uCircleR, half > 0 ? R / half : 0.6);
      gl.uniform1f(prog.uniforms.uSoftness, CONFIG.softness);
      gl.uniform1f(prog.uniforms.uRefract, CONFIG.refract);
      gl.uniform1f(prog.uniforms.uDispersion, CONFIG.dispersion);
      gl.uniform1f(prog.uniforms.uSpecular, CONFIG.specular);
      gl.uniform1f(prog.uniforms.uRim, CONFIG.rim);
      gl.uniform1f(prog.uniforms.uRelief, CONFIG.relief);
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);

      const dpr2 = dpr;
      canvas.style.left = (px - half / dpr2) + "px";
      canvas.style.top  = (py - half / dpr2) + "px";
    }

    requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);

  window.__lens = {
    CONFIG,
    get visible() { return fade > 0.004; },
    get position() { return { x: px, y: py }; },
    crop, base, velocity, height,
  };
})();
}
