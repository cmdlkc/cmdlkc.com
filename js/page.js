"use strict";

/* ==========================================================================
   STUDIO KARBON — the logo, the menu, the projects, and the small lens that
   follows the cursor over them
   --------------------------------------------------------------------------
   v3.1 draws the whole page — logo, slice menu, hover previews, project
   feed, its images, its captions, the hint line — into one offscreen 2D
   canvas with fillText and strokeRect, same as v3.0. That part didn't
   change: it's still a clean way to keep one drawing pipeline for
   everything, and it's what lets the lens (below) grab a pixel-accurate
   crop of whatever happens to be under the cursor at that instant.

   What's gone is the WHOLE-PAGE refraction. v3.0 bent every pixel on
   screen through a full WebGL fluid simulation; that's been taken back out
   because it read as too digital for the site. The canvas is now blitted
   straight to the screen with a plain 2D drawImage — no WebGL anywhere in
   the base page.

   Two halves, in order:
     buildPage()  the logo engine and the page drawing. Returns the canvas.
     startLens()  a plain 2D blit of that canvas to the screen, plus — only
                  if `lens.enabled` and WebGL2 exist — a small second canvas
                  that tracks the pointer and redraws a locally refracted
                  patch on top. See the LENS section near the bottom.
   ========================================================================== */

function buildPage() {

const C = CONFIG;
const RAD = Math.PI / 180;
const clamp = (v, a, b) => (v < a ? a : v > b ? b : v);
let dirty = true;

function hexToRgb(h) {
  h = h.replace("#", "");
  if (h.length === 3) h = h[0]+h[0]+h[1]+h[1]+h[2]+h[2];
  return [parseInt(h.slice(0,2),16), parseInt(h.slice(2,4),16), parseInt(h.slice(4,6),16)];
}
const INK   = hexToRgb(C.colour.ink);
const PAPER = hexToRgb(C.colour.paper);

// Fixed-seed random, so a project's scattered layout is the same every time
// you open it instead of reshuffling under you.
function seeded(seed) {
  let a = seed >>> 0;
  return function () {
    a |= 0; a = (a + 0x6D2B79F5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/* ==========================================================================
   1.  THE PROFILE — the letter D as two flat pieces
   The D's stroke, in cross-section, is cut in two by two horizontal lines,
   at y = t and y = H - t — the heights where the counter starts and stops:

     cee — the C. Runs the long way round: up over the bottom-left corner,
           along the bottom edge, round the bowl, back along the top edge and
           over the top-left corner. BOTH CORNERS BELONG TO IT — it keeps the
           full thickness of the letter all the way to its ends. Each end is
           then cut square, straight across the stroke.
     bar — the D's spine, spanning exactly the gap between those two ends: a
           rectangle from the letter's left edge in to the counter, running
           from y = t up to y = H - t. This is what closes the C into a D.

   Each piece is {a, b}: two equal-length point lists, the cross-section
   being the ribbon between a[i] and b[i]. Point i on one side always matches
   point i on the other, which is what lets a cut face be closed with a plain
   ribbon of quads.

   Where the cut falls is the whole question, and there are three answers.
   Splitting on the profile's own point correspondence mitres the corner and
   gives the C sharp horns. Cutting vertically at x = t hands both corner
   squares to the bar, so the C's ends stop short of the letter's full width.
   Cutting horizontally — this — hands the corners to the C and leaves the
   bar spanning just the opening, which is what the sketch has.

   All three tile the D exactly; the outer silhouette and the counter are
   identical either way. Only the seam between the two pieces moves.
   ========================================================================== */
function buildProfile(L) {
  const W = L.width, H = L.height, t = L.stroke;
  const Rx = W * L.bowl, Ry = H / 2, a = W - Rx;
  const A = Math.max(3, L.arcSteps | 0), E = Math.max(1, L.edgeSteps | 0);

  /* The letter's two outlines, as before: the outside, and the counter inset
     by the stroke width. Closed loops, walking bottom edge → bowl → top edge
     → spine, with outer point i matching inner point i. */
  function path(s) {
    const p = [], rx = Rx - s, ry = Ry - s, x0 = s, y0 = s, y1 = H - s;
    for (let i = 0; i < E; i++) p.push({ x: x0 + (a - x0) * i / E, y: y0 });   // bottom
    for (let i = 0; i < A; i++) {                                              // the bowl
      const th = -Math.PI / 2 + Math.PI * i / A;
      p.push({ x: a + rx * Math.cos(th), y: H / 2 + ry * Math.sin(th) });
    }
    for (let i = 0; i < E; i++) p.push({ x: a + (x0 - a) * i / E, y: y1 });    // top
    for (let i = 0; i < E; i++) p.push({ x: x0, y: y1 + (y0 - y1) * i / E });  // spine
    return p;
  }
  const outer = path(0), inner = path(t), n = outer.length, spine = n - E;

  /* The C is that loop walked from the start of the bottom edge round to the
     start of the spine — i.e. everything EXCEPT the spine, corners included —
     with a square end added at each of the two ends.

     An end is a horizontal cut across the stroke: outer edge to counter, at
     the height where the counter turns. On the counter side that height is a
     single corner point, so the added station repeats inner[] there; the
     ribbon quad collapses to a triangle, which is exactly the corner. */
  return {
    cee: {
      a: [{ x: 0, y: t }].concat(outer.slice(0, spine + 1), [{ x: 0, y: H - t }]),
      b: [inner[0]      ].concat(inner.slice(0, spine + 1), [inner[spine]      ]),
    },
    // The spine, spanning exactly the opening the C leaves. `a` is the
    // counter side so the piece comes out wound the same way round as the C.
    bar: {
      a: [{ x: t, y: t }, { x: t, y: H - t }],
      b: [{ x: 0, y: t }, { x: 0, y: H - t }],
    },
  };
}

/* The closed boundary of a piece's cross-section: out along one edge, back
   along the other. Sweeping THIS is what produces every wall of the revolved
   object — outer face, counter face, and the two faces where the piece was
   cut.

   expandOutline() takes each segment's right-hand normal, which only points
   away from the material if the loop runs counter-clockwise, so the loop is
   measured (shoelace) and reversed if it came out the other way. Getting
   this wrong inverts the lighting on a whole object, and it is easy to get
   wrong by hand — a piece can be handed to us either way round. */
function pieceOutline(piece) {
  const raw = piece.a.concat(piece.b.slice().reverse());

  /* Drop repeated points first. A square end is a single corner point on the
     counter side, so the two lists agree there — harmless in the ribbon (the
     quad just collapses to the triangle that IS the corner) but here it would
     be a zero-length segment, and a segment with no length has no direction
     to take a normal from. */
  const same = (p, q) => Math.abs(p.x - q.x) < 1e-9 && Math.abs(p.y - q.y) < 1e-9;
  const loop = [];
  for (const p of raw) if (!loop.length || !same(p, loop[loop.length - 1])) loop.push(p);
  while (loop.length > 1 && same(loop[0], loop[loop.length - 1])) loop.pop();

  let area2 = 0;
  for (let i = 0, m = loop.length; i < m; i++) {
    const p = loop[i], q = loop[(i + 1) % m];
    area2 += p.x * q.y - q.x * p.y;
  }
  return area2 < 0 ? loop.reverse() : loop;
}

/* Expand an outline into segments ready for sweeping. Adjacent segments whose
   directions are close get averaged so the shading and the crease-line test
   flow smoothly across the joint; sharp corners are kept separate. */
function expandOutline(p, creaseDeg) {
  const n = p.length, e = [];
  for (let i = 0; i < n; i++) {
    const q = p[(i + 1) % n], dx = q.x - p[i].x, dy = q.y - p[i].y;
    const l = Math.hypot(dx, dy) || 1;
    e.push({ x: dy / l, y: -dx / l });
  }
  const cosT = Math.cos(creaseDeg * RAD);
  const avg = (A, B) => { const x=A.x+B.x, y=A.y+B.y, l=Math.hypot(x,y)||1; return {x:x/l,y:y/l}; };
  const out = [];
  for (let i = 0; i < n; i++) {
    const prev = e[(i-1+n)%n], cur = e[i], next = e[(i+1)%n], j = (i+1)%n;
    const nA = (prev.x*cur.x + prev.y*cur.y) > cosT ? avg(prev, cur) : cur;
    const nB = (cur.x*next.x + cur.y*next.y) > cosT ? avg(cur, next) : cur;
    out.push({ x: p[i].x, y: p[i].y, nx: nA.x, ny: nA.y });
    out.push({ x: p[j].x, y: p[j].y, nx: nB.x, ny: nB.y });
  }
  return out;   // 2n entries; entries (2i, 2i+1) are the ends of segment i
}

/* ==========================================================================
   2.  THE MESH
   The profile is revolved around the vertical axis, stopping short by a gap of
   `notchSlices` whole slices. The sweep is divided into SLICES — one per project — and every
   triangle remembers which slice it belongs to, which is what makes hover
   picking exact and lets the divider lines be found automatically.
   ========================================================================== */
function buildMesh(C) {
  const L = C.letter, R = C.ring;
  const prof = buildProfile(L);
  const nSlices = Math.max(1, C.projects.length);

  /* The gap is measured in WHOLE SLICES, not degrees. The ring is cut into
     (slices + notchSlices) equal wedges and the last `notchSlices` of them are
     simply not built. That keeps every slice exactly the same size however
     many projects there are, and makes the gap read as "some slices are
     missing" rather than as an arbitrary cut. */
  const wedges = nSlices + Math.max(1, R.notchSlices | 0);
  const notchDeg = 360 * (wedges - nSlices) / wedges;

  // A whole number of steps per wedge, so divider lines land exactly on slice
  // boundaries rather than one step off.
  const perSlice = Math.max(2, Math.round(R.steps / wedges));
  const M = perSlice * nSlices;

  const cx = L.width / 2, cy = L.height / 2;
  const sign = L.flip ? -1 : 1;
  const place = (x) => R.radius + sign * (x - cx);

  const th0 = R.notchAt * RAD + notchDeg * RAD / 2;
  const dth = (360 - notchDeg) * RAD / M;

  const pos = [], nrm = [], idx = [], tslice = [], tcap = [];
  const push = (px, py, pz, nx, ny, nz) => { pos.push(px,py,pz); nrm.push(nx,ny,nz); return pos.length/3 - 1; };

  /* Sweep a closed cross-section boundary through the arc. One call builds
     every wall of one object at once. */
  function sweepOutline(outline) {
    const K = outline.length, base = pos.length / 3;
    for (let j = 0; j <= M; j++) {
      const th = th0 + dth * j, ct = Math.cos(th), st = Math.sin(th);
      for (let i = 0; i < K; i++) {
        const v = outline[i], r = place(v.x);
        push(r*ct, v.y - cy, r*st, v.nx*ct, v.ny, v.nx*st);
      }
    }
    for (let j = 0; j < M; j++) {
      const sl = (j / perSlice) | 0;
      for (let i = 0; i < K; i += 2) {
        const A = base + j*K + i, B = A + 1, D = base + (j+1)*K + i, E = D + 1;
        idx.push(A,B,E, A,E,D);
        tslice.push(sl, sl); tcap.push(0, 0);
      }
    }
  }

  /* One end of an object: its cross-section, as a ribbon of quads from a[i]
     across to b[i]. OPEN — i stops at n-2 and never wraps — so a piece whose
     ribbon is the C comes out a C, and the bar comes out a bar.

     `kind` is what paint() keys the flat letterform fill off: 1 hatches the
     face, 0 leaves it to the ordinary surface shading (i.e. outline only). */
  function cap(piece, th, nx, ny, nz, sl, kind) {
    const ct = Math.cos(th), st = Math.sin(th);
    const pa = piece.a, pb = piece.b, n = pa.length, base = pos.length / 3;
    for (let i = 0; i < n; i++) {
      const o = pa[i], q = pb[i];
      const ro = place(o.x), ri = place(q.x);
      push(ro*ct, o.y - cy, ro*st, nx, ny, nz);
      push(ri*ct, q.y - cy, ri*st, nx, ny, nz);
    }
    for (let i = 0; i < n - 1; i++) {
      const A = base + 2*i, B = A + 1, D = base + 2*(i+1), E = D + 1;
      idx.push(A,B,E, A,E,D);
      tslice.push(sl, sl); tcap.push(kind, kind);
    }
  }

  const th1 = th0 + dth * M;

  /* A whole revolved object: its walls, plus a cut face at each end of the
     arc. Each piece is independent — its own sweep, its own two cut faces —
     so a piece can later be given a different arc, or dropped, without
     touching the other.

     The two ends hatch INDEPENDENTLY: `hatch0` for the face at th0, `hatch1`
     for the one at th1. That is what lets one and the same solid read as
     filled-in on one side of the gap and as an empty outline on the other. */
  function revolve(piece, hatch0, hatch1) {
    sweepOutline(expandOutline(pieceOutline(piece), R.creaseAngle));
    cap(piece, th0,  Math.sin(th0), 0, -Math.cos(th0), 0,           hatch0);
    cap(piece, th1, -Math.sin(th1), 0,  Math.cos(th1), nSlices - 1, hatch1);
  }

  /* C ON THE LEFT, D ON THE RIGHT.

     The C is hatched at both ends. The bar is hatched only at th1, so:

       th0 (screen-LEFT)   C hatched, bar an empty outline  →  reads C
       th1 (screen-RIGHT)  C hatched, bar hatched too       →  reads D

     Nothing is deleted and no surface is left open — both objects are whole
     and both sweep the full arc, so the two cut faces still add up to exactly
     the same D section, and the outer silhouette is untouched. The letters
     differ only in which of the two pieces gets filled in on that face, which
     is the one thing that CAN differ per-end without breaking the shape.

     Filling is also the only part of the drawing that can be varied this way.
     paintLines() works off the depth buffer and knows nothing about hatching,
     so the bar keeps its outline on both faces regardless — that outline is
     what makes the left face read as an open C rather than as a D with a
     piece missing.

     The C's end faces and the bar's end faces sit in the same planes, back to
     back with opposite normals, so backface culling shows exactly one of each
     pair and they never fight for the depth buffer.

     Which face lands on which side of the screen is a view question, not a
     mesh one — the profile is laid out radially (place()), so the bowl always
     sits at the larger radius and the two faces read as mirror images across
     the opening. If the C and the D swap sides, that is view.cornerTurn /
     ring.notchAt in config.js, not this. */
  revolve(prof.cee, 1, 1);
  revolve(prof.bar, 0, 1);

  // Rather than reason about winding order by hand for every case, flip any
  // triangle whose geometric facing disagrees with the surface directions on
  // its corners. After this, backface culling is one sign test.
  for (let t = 0; t < idx.length; t += 3) {
    const i0 = idx[t]*3, i1 = idx[t+1]*3, i2 = idx[t+2]*3;
    const ax=pos[i1]-pos[i0], ay=pos[i1+1]-pos[i0+1], az=pos[i1+2]-pos[i0+2];
    const bx=pos[i2]-pos[i0], by=pos[i2+1]-pos[i0+1], bz=pos[i2+2]-pos[i0+2];
    const gx=ay*bz-az*by, gy=az*bx-ax*bz, gz=ax*by-ay*bx;
    const sx=nrm[i0]+nrm[i1]+nrm[i2], sy=nrm[i0+1]+nrm[i1+1]+nrm[i2+1], sz=nrm[i0+2]+nrm[i1+2]+nrm[i2+2];
    if (gx*sx + gy*sy + gz*sz < 0) { const s = idx[t+1]; idx[t+1] = idx[t+2]; idx[t+2] = s; }
  }

  let radius = 0;
  for (let i = 0; i < pos.length; i += 3) {
    const d = Math.hypot(pos[i], pos[i+1], pos[i+2]);
    if (d > radius) radius = d;
  }

  return {
    pos: new Float32Array(pos), nrm: new Float32Array(nrm),
    idx: new Uint32Array(idx),  tri: new Uint8Array(tslice),
    cap: new Uint8Array(tcap),
    vertCount: pos.length/3, triCount: idx.length/3,
    radius, nSlices, notchDeg,
  };
}

const mesh = buildMesh(C);
const NS = mesh.nSlices;

/* ==========================================================================
   3.  BAYER
   The tile is fixed to the SCREEN, so the ring turns underneath the dots and
   they stay put — exactly like the cube cursor on the main site.
   ========================================================================== */
function buildBayer(size) {
  const S = (size === 2 || size === 4 || size === 8) ? size : 8;
  let m = [[0,2],[3,1]];
  while (m.length < S) {
    const n = m.length, o = [];
    for (let y = 0; y < n*2; y++) o.push(new Array(n*2));
    for (let y = 0; y < n; y++) for (let x = 0; x < n; x++) {
      const v = m[y][x]*4;
      o[y][x]=v; o[y][x+n]=v+2; o[y+n][x]=v+3; o[y+n][x+n]=v+1;
    }
    m = o;
  }
  const flat = new Float32Array(S*S);
  for (let y = 0; y < S; y++) for (let x = 0; x < S; x++) flat[y*S+x] = (m[y][x]+0.5)/(S*S);
  return { t: flat, size: S, mask: S-1 };
}
/* Two tiles, not one, and which is used depends on how big the logo is
   drawn. The tile is fixed to the SCREEN — that's what makes the dots stay
   put while the object turns under them — so it does NOT shrink along with
   the logo, and an 8-pixel tile inside the corner mark's six-pixel stroke is
   not a texture at all, just a couple of holes landing wherever the screen
   grid happens to fall. The answer is a finer tile down there, not a solid
   fill: a 2x2 tile is 4 screen pixels across at pixelSize 2, so even that
   stroke gets three of them and the halftone survives.

   The 2x2's four thresholds are 0.125 / 0.375 / 0.625 / 0.875, which is worth
   knowing when picking densities for the small size: 0.5 prints exactly two
   dots of four (a clean checker) and anything from 0.63 to 0.87 prints three.
   That's the whole tonal range down there — two useful greys and solid. */
const bayer     = buildBayer(C.shade.matrix);
const bayerFine = buildBayer(C.shade.fineMatrix);

/* ==========================================================================
   5.  POSE — quaternions
   --------------------------------------------------------------------------
   Orientation is a quaternion, which is the only representation that does all
   three things this needs at once:

     · free tumble       drag it any direction and it turns that way, with no
                         orientation where two of the controls collapse into
                         one (the "gimbal lock" you get from Euler angles)
     · a clean return    slide smoothly from wherever you dragged it to back
                         to the resting pose, along the shortest path

   v2.0 used a yaw and a tilt, which handled the snap but could only ever spin
   about one axis. A plain 3x3 matrix handles the tumble but cannot be
   interpolated without extra machinery. Quaternions do both.

   Convention: q = [w, x, y, z], and qToMat gives the matrix M where a world
   point becomes a view point as M * p.
   ========================================================================== */
const easeInOut = t => (t < 0.5 ? 4*t*t*t : 1 - Math.pow(-2*t + 2, 3) / 2);

function T(v) { return { v, from: v, to: v, t: 1, dur: 1 }; }
function to(tw, target, ms) {
  if (tw.to === target && tw.t >= 1) { tw.v = target; return; }
  tw.from = tw.v; tw.to = target; tw.t = 0; tw.dur = Math.max(1, ms) / 1000;
}
function step(tw, dt) {
  if (tw.t >= 1) return false;
  tw.t = Math.min(1, tw.t + dt / tw.dur);
  tw.v = tw.from + (tw.to - tw.from) * easeInOut(tw.t);
  return true;
}

// a then b, i.e. the same as the matrix product A * B
function qMul(a, b) {
  return [
    a[0]*b[0] - a[1]*b[1] - a[2]*b[2] - a[3]*b[3],
    a[0]*b[1] + a[1]*b[0] + a[2]*b[3] - a[3]*b[2],
    a[0]*b[2] - a[1]*b[3] + a[2]*b[0] + a[3]*b[1],
    a[0]*b[3] + a[1]*b[2] - a[2]*b[1] + a[3]*b[0],
  ];
}
function qAxis(ax, ay, az, deg) {
  const l = Math.hypot(ax, ay, az);
  if (l < 1e-12 || deg === 0) return [1, 0, 0, 0];
  const h = deg * RAD / 2, s = Math.sin(h) / l;
  return [Math.cos(h), ax*s, ay*s, az*s];
}
function qNorm(q) {
  const l = Math.hypot(q[0], q[1], q[2], q[3]) || 1;
  return [q[0]/l, q[1]/l, q[2]/l, q[3]/l];
}
function qToMat(q) {
  const [w, x, y, z] = q;
  return [
    1-2*(y*y+z*z),   2*(x*y - w*z),   2*(x*z + w*y),
      2*(x*y + w*z), 1-2*(x*x+z*z),   2*(y*z - w*x),
      2*(x*z - w*y),   2*(y*z + w*x), 1-2*(x*x+y*y),
  ];
}
function qSlerp(a, b, t) {
  let d = a[0]*b[0] + a[1]*b[1] + a[2]*b[2] + a[3]*b[3];
  // Two quaternions describe every orientation; pick the one that is the
  // short way round rather than the long way.
  if (d < 0) { b = [-b[0], -b[1], -b[2], -b[3]]; d = -d; }
  if (d > 0.9995) return qNorm([a[0]+(b[0]-a[0])*t, a[1]+(b[1]-a[1])*t,
                                a[2]+(b[2]-a[2])*t, a[3]+(b[3]-a[3])*t]);
  const th = Math.acos(d), s = Math.sin(th);
  const k0 = Math.sin((1-t)*th) / s, k1 = Math.sin(t*th) / s;
  return [a[0]*k0+b[0]*k1, a[1]*k0+b[1]*k1, a[2]*k0+b[2]*k1, a[3]*k0+b[3]*k1];
}

/* (v3.1 also had a nearestPose(tilt) here — the member of a tilt's family of
   poses closest to wherever the ring had spun to, so a snap tipped it up
   without unwinding a turn it never needed to undo. There is no idle spin to
   unwind any more and the resting pose is one fixed orientation, so every
   snap is now to a known pose and the function had nothing left to do.) */

/* A pose at a given tilt with a specific turn, rather than the nearest one.
   Used where the gap has to end up somewhere particular. Slerp still takes
   the short way round, so asking for "turn 20" from "turn 380" does not
   unwind a full revolution. */
function fixedPose(tiltDeg, spinDeg) {
  return qNorm(qMul(qAxis(1, 0, 0, tiltDeg), qAxis(0, 1, 0, spinDeg)));
}

/* At an angled view the gap points most directly at the camera when the ring
   is turned to (its azimuth - 90). Falls straight out of the view matrix: the
   towards-camera component of a direction at azimuth th is
   cos(tilt) * sin(th - turn), which peaks at th - turn = 90.

   Both the resting pose and the parked corner mark are built on that: the
   opening faces you, so you look into the gap and both cut faces — the D and
   its mirror — are legible. They differ only by their own extra turn. */
function facingPoseSpin(turnDeg) { return C.ring.notchAt - 90 + turnDeg; }
function restPose()   { return fixedPose(C.view.tiltRest, facingPoseSpin(C.view.restTurn)); }
function cornerPose() { return fixedPose(C.view.tiltRest, facingPoseSpin(C.view.cornerTurn)); }

let q = restPose();

// The snap between poses, as a slerp rather than a tween of numbers.
let slerpA = null, slerpB = null, slerpT = 1, slerpDur = 1;
function poseTo(target, ms) {
  slerpA = q; slerpB = target; slerpT = 0; slerpDur = Math.max(1, ms) / 1000;
}

const sizeT    = T(C.view.size);
const cxT      = T(0.5), cyT = T(0.5);   // logo centre, as a fraction of window
// The star is drawn at a fixed pixel size rather than scaled with the ring, so
// the zoom into it needs its own multiplier or it would stay a speck while
// everything around it flew off the page.
const dotZoomT = T(1);

/* Three states, though a different three from v3.1's.
     "rest"    the logo sits still in its axonometric pose, opening towards
               you, and IS the menu — hover a slice for its preview, press it
               to open it. Drag turns it; let go and it eases back here.
     "project" a project is open and the logo is parked in the corner.
     "about"   the page has zoomed INTO the centre star: same drawing, same
               pose, but scaled up until the ring is off the page, with the
               star parked high and the about text typing itself in below.
   (v3.1 had a "top" instead: pressing the ring snapped it to a top-down view
   which was the only place a slice could be picked. That second page is gone
   — you choose from the resting view directly.) */
let state = "rest";                 // "rest" | "project" | "about"
let openProject = -1;

const sliceShade = new Float32Array(NS);
const sliceTarget = new Float32Array(NS);
let hoverSlice = -1;
let dotShade = 0, dotTarget = 0, dotVisible = false;
// The star's pulse under the cursor on the about page: how much of it there
// is, and where in the breath it currently is. See starPulse().
let pulseAmt = 0, pulsePhase = 0;

/* ==========================================================================
   6.  RASTERISER
   Walk each triangle's bounding box; a pixel is inside when all three edge
   functions agree in sign. Record depth, surface direction and slice id.
   ========================================================================== */
function drawTriangle(i0, i1, i2, sl, capKind) {
  const x0=sxA[i0], y0=syA[i0], x1=sxA[i1], y1=syA[i1], x2=sxA[i2], y2=syA[i2];

  // Signed area doubles as the facing test: every triangle was wound
  // consistently at build time, so negative means we are seeing its front.
  const area = (x1-x0)*(y2-y0) - (y1-y0)*(x2-x0);
  if (area >= -1e-7) return;

  const minX = Math.max(0,   Math.floor(Math.min(x0,x1,x2)));
  const maxX = Math.min(W-1, Math.ceil (Math.max(x0,x1,x2)));
  const minY = Math.max(0,   Math.floor(Math.min(y0,y1,y2)));
  const maxY = Math.min(H-1, Math.ceil (Math.max(y0,y1,y2)));
  if (minX > maxX || minY > maxY) return;

  const inv = 1/area;
  const z0=szA[i0], z1=szA[i1], z2=szA[i2];
  const a0=vnx[i0], b0=vny[i0], c0=vnz[i0];
  const a1=vnx[i1], b1=vny[i1], c1=vnz[i1];
  const a2=vnx[i2], b2=vny[i2], c2=vnz[i2];
  const A0=y1-y2, B0=x2-x1, A1=y2-y0, B1=x0-x2, A2=y0-y1, B2=x1-x0;

  for (let y = minY; y <= maxY; y++) {
    const pyc = y + 0.5, row = y*W;
    let w0 = A0*(minX+0.5-x1) + B0*(pyc-y1);
    let w1 = A1*(minX+0.5-x2) + B1*(pyc-y2);
    let w2 = A2*(minX+0.5-x0) + B2*(pyc-y0);
    for (let x = minX; x <= maxX; x++, w0+=A0, w1+=A1, w2+=A2) {
      if (w0 > 0 || w1 > 0 || w2 > 0) continue;
      const l0=w0*inv, l1=w1*inv, l2=w2*inv;
      const z = l0*z0 + l1*z1 + l2*z2;
      const p = row + x;
      if (z <= depth[p]) continue;
      depth[p] = z;
      gnx[p] = l0*a0 + l1*a1 + l2*a2;
      gny[p] = l0*b0 + l1*b1 + l2*b2;
      gnz[p] = l0*c0 + l1*c1 + l2*c2;
      sbuf[p] = sl;
      cbuf[p] = capKind;
    }
  }
}

/* ==========================================================================
   7.  PAINT
   Two passes over the logo's bounding box only — not the whole window.
   Pass 1: paper everywhere, plus dither dots on any slice that is lit up.
   Pass 2: the lines, read straight off the depth and slice buffers.
   ========================================================================== */
const INK_R = INK[0], INK_G = INK[1], INK_B = INK[2];
const CAP_SHADE = C.shade.capFaces;
const PAP_R = PAPER[0], PAP_G = PAPER[1], PAP_B = PAPER[2];

/* The one weakened colour on the site: the ink a LIT SLICE prints in when the
   logo is small (the corner mark). Same dots, same dither — `shade.
   highlightFade` of the way from that ink to the paper, so the highlight
   reads as a translucent wash under the full-strength letterforms rather than
   as more of the same orange. Mixed once here rather than per pixel. */
const HI_MIX = clamp(C.shade.highlightFade, 0, 1);
const HI_R = Math.round(PAP_R + (INK_R - PAP_R) * (1 - HI_MIX));
const HI_G = Math.round(PAP_G + (INK_G - PAP_G) * (1 - HI_MIX));
const HI_B = Math.round(PAP_B + (INK_B - PAP_B) * (1 - HI_MIX));

function paint(box) {
  const LIGHT = (() => {
    const d = C.shade.lightDirection, l = Math.hypot(d.x,d.y,d.z) || 1;
    return [d.x/l, d.y/l, d.z/l];
  })();
  const lx=LIGHT[0], ly=LIGHT[1], lz=LIGHT[2];
  const INK_MIN = C.shade.lightestFace, INK_MAX = C.shade.darkestFace;
  const showIds = C.debug.showSliceIds;

  /* Small logo, or full size? Measured on the letter's STROKE rather than on
     the whole logo, because the stroke is the thinnest thing the dither has
     to survive inside.

     Below `shade.fineBelow` — which in practice means the mark parked in the
     corner while a project is open — three things change together, and they
     only make sense together:

       · the Bayer tile drops to `shade.fineMatrix`, so there are still dots
         inside a six-pixel stroke instead of one or two holes,
       · a lit slice prints in the FADED ink (HI_R/G/B above) rather than the
         full-strength one, so the highlight reads as a translucent wash,
       · the cut faces keep their own `capFaces` density AND the full-strength
         ink, so the C and the D sit on top of that wash as letters and stay
         readable with their slice lit.

     Two things were tried here and both were wrong. Printing SOLID lost the
     halftone altogether and the mark became an orange blob. Halving the
     highlight's DOT COVERAGE kept a halftone but a ragged one — with only
     four threshold positions to play with, half the dots is a coarser
     pattern, not a lighter tone. The dither is left exactly as it is
     everywhere else and only the colour gives way. */
  const small = C.letter.stroke * scalePx() < C.shade.fineBelow;
  const BAY = small ? bayerFine : bayer;
  const BT = BAY.t, BS = BAY.size, BM = BAY.mask;

  /* Is the logo a solid object this frame, or a see-through drawing?

     Everywhere else it is a drawing: the paper shows through everything that
     is not ink, which is right when there is nothing behind it. But the
     parked corner mark has a whole project feed scrolling past underneath,
     and a wireframe with body text running through the middle of it is
     unreadable both ways round. So in that one state the ring's SURFACE
     prints paper where it isn't inked — opaque, not transparent — and the
     feed passes behind it like a thing behind a thing.

     Only the surface. The hole in the middle of the ring is not part of the
     object and stays see-through, so you get a glimpse of the page through
     it, which is what tells you the mark is a ring and not a blob. */
  const opaqueBody = C.view.cornerOpaque && state === "project";

  for (let y = box.y0; y <= box.y1; y++) {
    const brow = (y & BM) * BS, row = y*W;
    for (let x = box.x0; x <= box.x1; x++) {
      const p = row + x, o = p*4;
      const sl = depth[p] === FAR ? -1 : sbuf[p];

      if (sl < 0) { px[o+3] = 0; continue; }          // nothing here — see through

      // Normalise once and write it back, so the line pass that follows needs
      // no square roots at all.
      let nx = gnx[p], ny = gny[p], nz = gnz[p];
      const l2 = nx*nx + ny*ny + nz*nz;
      if (l2 > 0) { const iv = 1/Math.sqrt(l2); nx*=iv; ny*=iv; nz*=iv; gnx[p]=nx; gny[p]=ny; gnz[p]=nz; }

      /* The two faces of the cut are shaded whether or not anything is
         hovered — that's what makes the letters read as letterforms instead
         of just more lines in a wireframe. cbuf is a flag: 0 = not a cap
         (the ring's ordinary swept surface, lit normally), 1 = a cut face,
         printed at the flat CAP_SHADE density below.

         Flat, deliberately outside the lighting term, AND deliberately
         independent of whatever the slice around it is doing. Caps used to
         run through the same lam-based shading as the ring's outer surface,
         so the two faces printed at different densities depending on which
         way the light caught them as the ring turned — one going dark and
         legible while its mirror washed out to nothing. They also used to
         take whichever was denser, themselves or their slice's highlight,
         which meant lighting a slice printed its cut face at full strength
         and the letter disappeared into the highlight exactly when you had
         just chosen it. A letterform has to read at a constant weight from
         every orientation and in every state, so caps are one density and
         nothing else touches them.

         One state, not two. Both cut faces are whole D sections and both
         print at exactly the same density; there is no partly-inked face. */
      const isCap = cbuf[p] !== 0;
      const lit = showIds ? (sl + 1) / (NS + 1) : sliceShade[sl];

      // Unlit, uncapped body: paper if the logo is opaque this frame,
      // see-through if it's a drawing.
      if (!isCap && lit <= 0.002) {
        if (opaqueBody) { px[o]=PAP_R; px[o+1]=PAP_G; px[o+2]=PAP_B; px[o+3]=255; }
        else px[o+3] = 0;
        continue;
      }

      // The cube cursor's shading model: tone comes from how many dots get
      // printed, not from mixing paler oranges. A lit face prints few; a face
      // in shadow prints many. (The single exception is WHICH orange a dot is
      // printed in on a small logo — see `pale` below. The pattern is still
      // the pattern; only its colour gives way.)
      let ink;
      if (isCap && !showIds) {
        ink = CAP_SHADE;
      } else {
        const lam = nx*lx + ny*ly + nz*lz;
        ink = (INK_MAX - (INK_MAX - INK_MIN) * (lam > 0 ? lam : 0)) * lit;
      }

      /* Which of the two inks this dot prints in. Everything is full-strength
         ink except a lit slice on a small logo, which prints the same dots in
         the faded colour — the letterforms and the outline stay at full
         strength on top of it. */
      const pale = small && !isCap;

      if (ink > BT[brow + (x & BM)]) {
        if (pale) { px[o]=HI_R;  px[o+1]=HI_G;  px[o+2]=HI_B;  }
        else      { px[o]=INK_R; px[o+1]=INK_G; px[o+2]=INK_B; }
        px[o+3] = 255;
      }
      else if (opaqueBody) { px[o]=PAP_R; px[o+1]=PAP_G; px[o+2]=PAP_B; px[o+3]=255; }
      else                 { px[o+3] = 0; }
    }
  }
}

function paintLines(box) {
  const sil = C.lines.silhouette;
  const dTh = C.lines.depth * mesh.radius * scalePx();
  const doD = C.lines.depth > 0;
  const cTh = Math.cos(clamp(C.lines.crease, 0, 179) * RAD);
  const doC = C.lines.crease > 0;
  const doDiv = C.lines.dividers;
  // Same tile as the fill pass — the dividers dissolve in through the very
  // grid the shading is printed on, so the two have to agree about its size.
  const BAY = C.letter.stroke * scalePx() < C.shade.fineBelow ? bayerFine : bayer;
  const BT = BAY.t, BS = BAY.size, BM = BAY.mask;

  for (let y = box.y0; y <= box.y1; y++) {
    const brow = (y & BM) * BS, row = y*W;
    for (let x = box.x0; x <= box.x1; x++) {
      const p = row + x;
      const z = depth[p];
      if (z === FAR) continue;
      const nx = gnx[p], ny = gny[p], nz = gnz[p], sl = sbuf[p];
      let edge = false, divAmt = 0;

      for (let k = 0; k < 4; k++) {
        let q;
        if      (k === 0) { if (x === 0)   { if (sil) { edge = true; break; } continue; } q = p-1; }
        else if (k === 1) { if (x === W-1) { if (sil) { edge = true; break; } continue; } q = p+1; }
        else if (k === 2) { if (y === 0)   { if (sil) { edge = true; break; } continue; } q = p-W; }
        else              { if (y === H-1) { if (sil) { edge = true; break; } continue; } q = p+W; }

        const zq = depth[q];
        if (zq === FAR) { if (sil) { edge = true; break; } continue; }
        if (doD && (z - zq) > dTh) { edge = true; break; }
        if (doC && (nx*gnx[q] + ny*gny[q] + nz*gnz[q]) < cTh) { edge = true; break; }
        // A divider only exists while one of the two slices it separates is
        // lit up. With nothing hovered the ring has no internal lines at all
        // — it reads as one object until the cursor asks it to be a menu.
        if (doDiv && sbuf[q] !== sl && sbuf[q] >= 0) {
          const a = sliceShade[sl] > sliceShade[sbuf[q]] ? sliceShade[sl] : sliceShade[sbuf[q]];
          if (a > divAmt) divAmt = a;
        }
      }

      // Dividers dissolve in and out through the same dither grid rather than
      // snapping on, so part-way through they read as a dotted line.
      if (!edge && divAmt > 0.002 && divAmt > BT[brow + (x & BM)]) edge = true;

      if (edge) { const o = p*4; px[o]=INK_R; px[o+1]=INK_G; px[o+2]=INK_B; px[o+3]=255; }
    }
  }
}

/* How much bigger the star is drawn this frame because the cursor is resting
   on it (about page only; `pulseAmt` is held at 0 everywhere else).

   A raised cosine rather than a sine: it starts at exactly 1 and swells to
   1 + `pulse`, so the star always grows out of its own size and settles back
   to it once a breath, instead of being caught halfway through one. That, and
   the eased `pulseAmt`, are the whole difference between "alive under the
   cursor" and "flashing". */
function starPulse() {
  if (pulseAmt <= 0.002) return 1;
  const ms = Math.max(50, C.about.pulsePeriod);
  const breath = 0.5 - 0.5 * Math.cos(2 * Math.PI * pulsePhase * 1000 / ms);
  return 1 + C.about.pulse * pulseAmt * breath;
}

/* The centre dot.
   Two things make it feel like part of the object rather than stuck on top:

   1. It is DEPTH TESTED. The dot sits at the ring's centre, which in view
      space is exactly z = 0 — so it is drawn only where the surface at that
      pixel is further away than 0, or where there is no surface. Turn the
      ring so its near side swings across the middle and the dot goes behind
      it, properly.

   2. It grows into a star under the cursor. At rest it is a plain disc; the
      further the hover fades in, the more the outline pulls out into points.
      Same eased fade as everything else — nothing here snaps on. */
function paintDot() {
  if (!C.dot.show) return;
  const D = C.dot;
  const t = dotShade;
  // dotZoomT is 1 everywhere except the about page, which zooms into the star.
  // The pulse rides on top of that, and only there — see starPulse().
  const z = dotZoomT.v * starPulse();
  const core  = D.radius * z * (1 + D.grow * t);
  const spike = D.radius * D.spike * z;
  const rMax  = Math.ceil(Math.max(core, spike) + 1);
  const L = logoCentre();
  const cx = Math.round(L.ox), cy = Math.round(L.oy);
  const N = Math.max(2, D.points | 0);

  for (let dy = -rMax; dy <= rMax; dy++) {
    const y = cy + dy; if (y < 0 || y >= H) continue;
    for (let dx = -rMax; dx <= rMax; dx++) {
      const x = cx + dx; if (x < 0 || x >= W) continue;
      const d = Math.sqrt(dx*dx + dy*dy);
      if (d > rMax) continue;

      // How far the outline reaches at this angle: a circle at t = 0, pulled
      // out into N points as the hover fades in.
      let rr = core;
      if (t > 0.002) {
        const ang = Math.atan2(dy, dx);
        // The four main arms.
        const lobe = Math.abs(Math.cos(N * ang / 2));
        rr = core + (spike - core) * Math.pow(lobe, D.sharpness) * t;
        // A second set turned half a lobe on, so they land in the gaps
        // between the main arms. Shorter and much thinner, which is what
        // makes it read as a star rather than as a plus sign.
        if (D.diagonal > 0) {
          const lobeD = Math.abs(Math.cos(N * (ang - Math.PI / N) / 2));
          const rd = core + (spike * D.diagonal - core) * Math.pow(lobeD, D.diagonalSharpness) * t;
          if (rd > rr) rr = rd;
        }
      }
      if (d > rr) continue;

      const p = y*W + x;
      if (depth[p] !== FAR && depth[p] > 0) continue;   // behind the ring
      const o = p*4;
      px[o]=INK_R; px[o+1]=INK_G; px[o+2]=INK_B; px[o+3]=255;
    }
  }
}

// Is the dot's own centre in front of the ring? Used both to decide whether
// it can be hovered and to keep the cursor from puffing up a dot you can't
// actually see.
function dotIsVisible() {
  const L = logoCentre();
  const x = Math.round(L.ox), y = Math.round(L.oy);
  if (x < 0 || y < 0 || x >= W || y >= H) return false;
  const d = depth[y*W + x];
  return d === FAR || d <= 0;
}

/* ==========================================================================
   4.  THE SURFACE EVERYTHING IS DRAWN ON
   --------------------------------------------------------------------------
   In v2.x the logo was a canvas and the feed was HTML sitting above it. Here
   there is no HTML at all — not one element. Everything is drawn into a
   single offscreen 2D canvas, and that canvas is what actually appears on
   screen (blitted straight across) and also what the cursor lens crops its
   small refracted patch from.

   Two canvases, then:
     logoCanvas   small, one pixel per rendered pixel, where the wireframe is
                  rasterised. Blown up with smoothing off — the hard pixel
                  edges come from here.
     scene        full window at device resolution. Paper, feed, logo, cover,
                  hint. This is the page — what gets blitted to `#glass` and
                  what the lens reads from.
   ========================================================================== */

const scene    = document.createElement("canvas");
const sctx     = scene.getContext("2d", { alpha: false, willReadFrequently: false });
const logoCanvas = document.createElement("canvas");
const ctx      = logoCanvas.getContext("2d", { alpha: true });

const PX  = Math.max(1, C.view.pixelSize | 0);
const FAR = -Infinity;   // must be exactly representable in a Float32Array,
                         // or "is this pixel empty" silently never matches

let W = 0, H = 0;              // logo buffer, in rendered pixels
let VW = 0, VH = 0;            // window, in CSS pixels
let DPR = 1;
let depth, gnx, gny, gnz, sbuf, cbuf, imgData, px;
let sxA, syA, szA, vnx, vny, vnz;

function allocVerts() {
  const V = mesh.vertCount;
  sxA = new Float32Array(V); syA = new Float32Array(V); szA = new Float32Array(V);
  vnx = new Float32Array(V); vny = new Float32Array(V); vnz = new Float32Array(V);
}
allocVerts();

function resize(cssW, cssH, dpr) {
  VW = cssW; VH = cssH; DPR = dpr;
  scene.width  = Math.round(cssW * dpr);
  scene.height = Math.round(cssH * dpr);

  W = Math.max(64, Math.round(cssW / PX));
  H = Math.max(64, Math.round(cssH / PX));
  logoCanvas.width = W; logoCanvas.height = H;

  depth = new Float32Array(W*H);
  gnx = new Float32Array(W*H); gny = new Float32Array(W*H); gnz = new Float32Array(W*H);
  sbuf = new Int16Array(W*H);
  cbuf = new Uint8Array(W*H);
  // Only the logo's own box is re-cleared each frame, so everywhere else has
  // to start out empty. A fresh Float32Array is 0, not -Infinity, and 0 reads
  // as "solid surface right at the centre of the world".
  depth.fill(FAR); sbuf.fill(-1); cbuf.fill(0);
  imgData = ctx.createImageData(W, H);
  px = imgData.data;
  ctx.clearRect(0, 0, W, H);

  prevBox = null;
  if (openProject >= 0) layoutFeed(openProject);
  if (state === "about") layoutAbout();
  dirty = true;
}

/* ==========================================================================
   8.  RENDER — the logo into its own small canvas
   ========================================================================== */
function scalePx() { return sizeT.v * Math.min(W, H) / mesh.radius; }

/* Where the logo's middle sits, in rendered pixels. Nudged inwards if it
   would hang off the edge — on a narrow window the parked logo would
   otherwise be sliced in half by the left margin. */
function logoCentre() {
  const r = mesh.radius * scalePx();
  let ox = cxT.v * W, oy = cyT.v * H;
  if (r * 2 <= W) ox = clamp(ox, r, W - r);
  if (r * 2 <= H) oy = clamp(oy, r, H - r);
  return { ox, oy, r };
}

let prevBox = null;
function logoBox() {
  const L = logoCentre(), r = L.r + 3;
  return {
    x0: clamp(Math.floor(L.ox - r), 0, W-1), x1: clamp(Math.ceil(L.ox + r), 0, W-1),
    y0: clamp(Math.floor(L.oy - r), 0, H-1), y1: clamp(Math.ceil(L.oy + r), 0, H-1),
  };
}
function unionBox(a, b) {
  if (!a) return b; if (!b) return a;
  return { x0: Math.min(a.x0,b.x0), x1: Math.max(a.x1,b.x1),
           y0: Math.min(a.y0,b.y0), y1: Math.max(a.y1,b.y1) };
}

function renderLogo() {
  const box = logoBox();
  const paintB = unionBox(prevBox, box);
  prevBox = box;

  for (let y = paintB.y0; y <= paintB.y1; y++) {
    const a = y*W + paintB.x0, b = y*W + paintB.x1 + 1;
    depth.fill(FAR, a, b); sbuf.fill(-1, a, b); cbuf.fill(0, a, b);
  }

  // Rotate into view space, then project with NO perspective divide — that is
  // what makes this axonometric rather than a photograph.
  const M = qToMat(q);
  const m0=M[0], m1=M[1], m2=M[2], m3=M[3], m4=M[4], m5=M[5], m6=M[6], m7=M[7], m8=M[8];
  const S = scalePx(), L = logoCentre(), ox = L.ox, oy = L.oy;
  const p = mesh.pos, n = mesh.nrm, V = mesh.vertCount;
  for (let i = 0, j = 0; i < V; i++, j += 3) {
    const x=p[j], y=p[j+1], z=p[j+2];
    sxA[i] = ox + (m0*x + m1*y + m2*z) * S;
    syA[i] = oy - (m3*x + m4*y + m5*z) * S;    // screen y points down
    szA[i] =      (m6*x + m7*y + m8*z);
    const nx=n[j], ny=n[j+1], nz=n[j+2];
    vnx[i] = m0*nx + m1*ny + m2*nz;
    vny[i] = m3*nx + m4*ny + m5*nz;
    vnz[i] = m6*nx + m7*ny + m8*nz;
  }

  const idx = mesh.idx, tri = mesh.tri, cap = mesh.cap;
  for (let t = 0, f = 0; t < idx.length; t += 3, f++) drawTriangle(idx[t], idx[t+1], idx[t+2], tri[f], cap[f]);

  samplePick();
  dotVisible = dotIsVisible();
  paint(paintB);
  paintLines(paintB);
  paintDot();
  // The first two numbers place the whole buffer at the origin; the last four
  // are the dirty rectangle — the only part actually copied. Passing an
  // offset in BOTH places double-shifts the image.
  ctx.putImageData(imgData, 0, 0, paintB.x0, paintB.y0,
                   paintB.x1 - paintB.x0 + 1, paintB.y1 - paintB.y0 + 1);
}

/* ==========================================================================
   9.  PICKING
   Which slice is under the cursor is read straight out of the slice buffer,
   so it is pixel-exact and automatically respects what is hidden behind what.
   ========================================================================== */
let mouseX = -1, mouseY = -1, pickSlice = -1;
function samplePick() {
  if (mouseX < 0) { pickSlice = -1; return; }
  const x = Math.round(mouseX / PX), y = Math.round(mouseY / PX);
  pickSlice = (x < 0 || y < 0 || x >= W || y >= H || depth[y*W + x] === FAR) ? -1 : sbuf[y*W + x];
}

// Is the cursor on the centre dot? Only counts while the dot is actually in
// front of the ring — you should not be able to poke something you can't see.
function dotHovered(clientX, clientY) {
  if (!C.dot.show || !dotVisible) return false;
  const L = logoCentre();
  const r = Math.max(C.dot.hitRadius, C.dot.radius * C.dot.spike * dotZoomT.v * PX);
  return Math.hypot(clientX - L.ox * PX, clientY - L.oy * PX) <= r;
}

function inLogoBox(clientX, clientY) {
  const L = logoCentre();
  return Math.abs(clientX - L.ox * PX) <= L.r * PX &&
         Math.abs(clientY - L.oy * PX) <= L.r * PX;
}

/* ==========================================================================
   10. DRAWING THE PAGE
   Plain canvas drawing: rectangles and text. No DOM anywhere — this keeps
   one drawing pipeline for everything and is what lets the lens crop a
   pixel-accurate patch from underneath the cursor.
   ========================================================================== */
const INK_CSS = C.colour.ink, PAPER_CSS = C.colour.paper;

function mono(size, spacing) {
  sctx.font = size + 'px "Courier New", Courier, monospace';
  // letterSpacing is not in every browser yet; without it the type is simply
  // tighter, which is a cosmetic loss rather than a broken layout.
  if ("letterSpacing" in sctx) sctx.letterSpacing = (spacing || 0) + "px";
}

// Images are loaded once and kept. Until one arrives its slot draws as an
// outlined placeholder, so the layout never jumps when it lands.
const imgCache = new Map();
function getImage(src) {
  if (!src) return null;
  if (imgCache.has(src)) return imgCache.get(src);
  const im = new Image();
  im.onload = () => { dirty = true; };
  im.onerror = () => { imgCache.set(src, null); };
  im.src = src;
  imgCache.set(src, im);
  return im;
}
function drawFramed(x, y, w, h, src, label) {
  const im = getImage(src);
  if (im && im.complete && im.naturalWidth) {
    // cover-fit, so a photo of any shape fills its frame without distorting
    const sc = Math.max(w / im.naturalWidth, h / im.naturalHeight);
    const dw = im.naturalWidth * sc, dh = im.naturalHeight * sc;
    sctx.save(); sctx.beginPath(); sctx.rect(x, y, w, h); sctx.clip();
    sctx.drawImage(im, x + (w - dw) / 2, y + (h - dh) / 2, dw, dh);
    sctx.restore();
  } else {
    sctx.fillStyle = PAPER_CSS;
    sctx.fillRect(x, y, w, h);
    if (label) {
      // save/restore, because textAlign and textBaseline are sticky on a 2D
      // context — leaving them set here silently centres the next paragraph
      // of body copy somewhere else on the page.
      sctx.save();
      mono(9, 2);
      sctx.globalAlpha = 0.45;
      sctx.textAlign = "center"; sctx.textBaseline = "middle";
      sctx.fillStyle = INK_CSS;
      sctx.fillText(label.toUpperCase(), x + w / 2, y + h / 2);
      sctx.restore();
    }
  }
  sctx.strokeStyle = INK_CSS;
  sctx.lineWidth = 1;
  sctx.strokeRect(Math.round(x) + 0.5, Math.round(y) + 0.5, Math.round(w), Math.round(h));
}

/* --- the project feed ---------------------------------------------------
   Laid out once when a project opens, into a list of rectangles, then just
   drawn with the scroll offset applied. Positions come from a fixed seed per
   project, so a project looks the same every time you open it rather than
   reshuffling under you.
   ---------------------------------------------------------------------- */
let feedItems = [], feedHeight = 0, feedHead = null, scrollY = 0, scrollTarget = 0;

function layoutFeed(i) {
  const pr = C.projects[i], F = C.feed;
  const colW = F.columnWidth * VW;
  const colX = (VW - colW) / 2;
  const rnd = seeded(0xC0FFEE + i * 7919);

  const logoR = C.view.sizeCorner * Math.min(W, H) * PX;
  const headY = Math.max(VH * 0.16, Math.max(C.view.cornerY * H * PX, logoR) + logoR + 30);
  feedHead = { x: colX, y: headY, title: pr.title, year: pr.year || "", blurb: pr.blurb || "" };

  feedItems = [];
  let y = VH * 0.42, bottom = y;

  (pr.feed || []).forEach((it, k) => {
    const w = colW * (F.itemMin + rnd() * (F.itemMax - F.itemMin));
    // Items alternate between a left-leaning and a right-leaning lane before
    // the scatter is added. Without that they pile up in the middle and sit
    // directly on top of each other rather than reading as a collage.
    const lane = (k % 2 === 0) ? 0.06 : 0.52;
    const x = colX + clamp(colW * lane + (rnd() - 0.5) * F.scatter * colW, 0, Math.max(0, colW - w));

    let h;
    if (it.type === "text") {
      const lines = wrapText(it.body || "", w, 12);
      h = lines.length * 22 + 8;
      feedItems.push({ type: "text", x, y, w, h, lines });
    } else {
      const bh = w / (it.ratio || 1);
      // `caption` on the config entry wins; without one the item falls back to
      // "PROJECT / n", which is all a placeholder block can honestly say. Real
      // captions run to a sentence or more, so they wrap to the item's width
      // and the item's height grows to hold however many lines that takes —
      // otherwise a long one runs off sideways over its neighbours.
      const cap = (it.caption || (pr.title + " / " + (k+1))).toUpperCase();
      const capLines = wrapText(cap, w, 9, 1.8);
      h = bh + 10 + capLines.length * 12;
      // h is the picture alone (what gets drawn); hFull includes the caption
      // under it, so the off-screen cull in drawFeed() doesn't drop an item
      // whose picture has scrolled off but whose caption is still showing.
      feedItems.push({ type: "image", x, y, w, h: bh, hFull: h, src: it.src,
                       label: pr.title + " — " + (k+1), capLines });
    }
    bottom = Math.max(bottom, y + h);
    // Advance by only part of the item's height, so the next one can ride up
    // alongside this one. That partial step is the whole difference between a
    // column and a scatter.
    y += h * (F.stackMin + rnd() * (F.stackMax - F.stackMin))
       + VH * (F.gapMin + rnd() * (F.gapMax - F.gapMin));
  });

  feedHeight = Math.max(bottom, y) + VH * 0.25;
  scrollY = scrollTarget = 0;
}

// `spacing` must match the letter-spacing the text will actually be DRAWN at,
// or the measurement is wrong and the lines overrun. Defaults to body copy's.
function wrapText(text, maxW, size, spacing) {
  mono(size, spacing === undefined ? 0.5 : spacing);
  const words = String(text).split(/\s+/), out = [];
  let line = "";
  for (const wd of words) {
    const t = line ? line + " " + wd : wd;
    if (sctx.measureText(t).width > maxW && line) { out.push(line); line = wd; }
    else line = t;
  }
  if (line) out.push(line);
  return out;
}

function drawFeed() {
  if (openProject < 0) return;
  const oy = -scrollY;

  sctx.fillStyle = INK_CSS;
  sctx.textAlign = "left"; sctx.textBaseline = "alphabetic";

  mono(15, 3.6);
  sctx.fillText(feedHead.title.toUpperCase(), feedHead.x, feedHead.y + oy);
  mono(10, 2.4);
  sctx.globalAlpha = 0.6;
  sctx.fillText(feedHead.year, feedHead.x, feedHead.y + 24 + oy);
  sctx.globalAlpha = 0.8;
  mono(11, 0.9);
  wrapText(feedHead.blurb, Math.min(420, VW * 0.4), 11)
    .forEach((l, i) => sctx.fillText(l, feedHead.x, feedHead.y + 52 + i * 20 + oy));
  sctx.globalAlpha = 1;

  for (const it of feedItems) {
    sctx.textAlign = "left"; sctx.textBaseline = "alphabetic";
    const y = it.y + oy;
    if (y > VH + 40 || y + (it.hFull || it.h) < -40) continue;   // off screen, skip it
    if (it.type === "image") {
      drawFramed(it.x, y, it.w, it.h, it.src, it.label);
      mono(9, 1.8);
      sctx.globalAlpha = 0.6;
      sctx.fillStyle = INK_CSS;
      it.capLines.forEach((l, i) => sctx.fillText(l, it.x, y + it.h + 14 + i * 12));
      sctx.globalAlpha = 1;
    } else {
      mono(12, 0.5);
      sctx.fillStyle = INK_CSS;
      it.lines.forEach((l, i) => sctx.fillText(l, it.x, y + 16 + i * 22));
    }
  }
}

/* --- the hover preview -------------------------------------------------- */
let coverFor = -1, coverAlpha = 0, coverTarget = 0, coverBox = null;
const coverRand = seeded(0x5EED);

function placeCover(i) {
  const pr = C.projects[i];
  let cw = C.cover.width * VW, ch = cw * 0.72;
  const ringPx = mesh.radius * scalePx() * PX;
  const pad = C.cover.clearance * Math.min(VW, VH);
  const ccx = VW / 2, ccy = VH / 2;
  const start = coverRand() * Math.PI * 2;

  function place(w, h) {
    const d = ringPx + pad + Math.max(w, h + 26) / 2;
    let best = null, bestGap = -Infinity;
    for (let k = 0; k < 12; k++) {
      const a = start + k * Math.PI * 2 / 12;
      const l = clamp(ccx + Math.cos(a) * d - w/2, 16, Math.max(16, VW - w - 16));
      const t = clamp(ccy + Math.sin(a) * d - h/2, 16, Math.max(16, VH - h - 42));
      const nx = clamp(ccx, l, l + w), ny = clamp(ccy, t, t + h + 26);
      const gap = Math.hypot(ccx - nx, ccy - ny) - ringPx;
      if (gap > bestGap) { bestGap = gap; best = [l, t]; }
      if (gap >= pad) break;
    }
    return { l: best[0], t: best[1], gap: bestGap };
  }

  /* On a small window there may be no room outside the ring for a card this
     size, and every direction ends up clamped back on top of it. Rather than
     let it overlap, shrink the card until it fits. */
  let spot = place(cw, ch);
  for (let n = 0; n < 8 && spot.gap < 0; n++) { cw *= 0.88; ch = cw * 0.72; spot = place(cw, ch); }
  coverBox = { x: spot.l, y: spot.t, w: cw, h: ch, title: pr.title, year: pr.year || "", src: pr.cover };
}

function drawCover() {
  if (coverAlpha <= 0.004 || !coverBox) return;
  const b = coverBox;
  sctx.save();
  sctx.globalAlpha = coverAlpha;
  drawFramed(b.x, b.y, b.w, b.h, b.src, b.title);
  mono(10, 2);
  sctx.fillStyle = INK_CSS;
  sctx.textAlign = "left"; sctx.textBaseline = "alphabetic";
  sctx.fillText(b.title.toUpperCase(), b.x, b.y + b.h + 17);
  sctx.textAlign = "right";
  sctx.fillText(b.year, b.x + b.w, b.y + b.h + 17);
  sctx.restore();
}

/* --- the about page -----------------------------------------------------
   The text that types itself in under the star. Laid out once, into a list of
   lines with their positions, then drawn with a character budget: `aboutChars`
   counts up in update() and each line takes what it can from it.

   Counting characters rather than typing into a growing string keeps the
   layout completely still. The lines are wrapped at their FULL length up
   front, so nothing reflows as the text arrives — a paragraph that wrapped
   itself again on every character would jump about and read as a bug.

   The block hangs off the star's own position (`about.starY`), so moving the
   star moves the text with it.
   ---------------------------------------------------------------------- */
let aboutLines = [], aboutChars = 0, aboutTotal = 0;

function layoutAbout() {
  const A = C.about;
  /* Width first, and NOT as a fraction of the window. A fraction that reads
     well on a laptop (say half the width) turns into a 24-character ribbon on
     a phone, which triples the number of lines and runs the text off the
     bottom of the page. So: as wide as the window allows, up to a fixed
     ceiling in characters-per-line terms. */
  const colW = Math.max(120, Math.min(A.columnMax, VW - 2 * A.margin));
  const x = (VW - colW) / 2;
  let y = (A.starY + A.textGap) * VH;

  aboutLines = [];
  (A.paragraphs || []).forEach((para, i) => {
    if (i) y += A.paraGap;
    wrapText(para, colW, A.size).forEach((line) => {
      aboutLines.push({ x, y, text: line });
      y += A.lineHeight;
    });
  });
  // The +1 per line is the newline: it costs a character's worth of time, so
  // there is a small beat at the end of each line rather than a seamless run.
  aboutTotal = aboutLines.reduce((n, l) => n + l.text.length + 1, 0);
}

function drawAbout() {
  if (state !== "about" || !aboutLines.length) return;
  const A = C.about;
  mono(A.size, 0.5);                     // same font wrapText measured with
  sctx.fillStyle = INK_CSS;
  sctx.textAlign = "left"; sctx.textBaseline = "alphabetic";

  let left = aboutChars;
  for (const l of aboutLines) {
    if (left <= 0) break;
    const n = Math.min(l.text.length, Math.floor(left));
    const shown = l.text.slice(0, n);
    sctx.fillText(shown, l.x, l.y);
    // The caret sits at the end of whatever was last typed, and only while
    // there is still something to come — a caret on a finished page reads as
    // an input field waiting for you.
    if (A.caret && aboutChars < aboutTotal && left <= l.text.length + 1) {
      const w = sctx.measureText(shown).width;
      sctx.fillRect(l.x + w + 1, l.y - A.size + 2, A.size * 0.55, A.size);
    }
    left -= l.text.length + 1;
  }
}

/* --- the hint line ------------------------------------------------------
   The line of instruction text along the bottom. It STAYS: it fades in once
   and then holds until something replaces it with a different line, which is
   what goRest/goProject/goAbout do. It used to time out 2.6 seconds after
   being set. That took a `hintUntil` deadline compared against a running
   `clock`, and both are gone — along with `clock` itself, which nothing else
   was reading. Bringing the timeout back means putting all three back.
   ------------------------------------------------------------------------ */
let hintText = "", hintAlpha = 0;
function hint(t) { hintText = t; }
function drawHint() {
  if (hintAlpha <= 0.004 || !hintText) return;
  sctx.globalAlpha = hintAlpha * 0.45;
  sctx.fillStyle = INK_CSS;
  mono(10, 2.6);
  sctx.textAlign = "center"; sctx.textBaseline = "alphabetic";
  sctx.fillText(hintText.toUpperCase(), VW / 2, VH - 22);
  sctx.globalAlpha = 1;
}

/* --- put the whole page together --------------------------------------- */
function drawPage() {
  sctx.setTransform(DPR, 0, 0, DPR, 0, 0);
  sctx.fillStyle = PAPER_CSS;
  sctx.fillRect(0, 0, VW, VH);

  drawFeed();                       // content first...

  // ...then the logo over the top of it. It is drawn small and blown up with
  // smoothing off, which is where the hard pixel edges come from.
  sctx.imageSmoothingEnabled = false;
  sctx.drawImage(logoCanvas, 0, 0, W, H, 0, 0, W * PX, H * PX);
  sctx.imageSmoothingEnabled = true;

  drawCover();
  drawAbout();
  drawHint();
}

/* ==========================================================================
   11. STATE CHANGES
   ========================================================================== */
function goRest() {
  // Coming back from the about page is a longer move than closing a project —
  // it has the whole zoom to undo — so it gets its own time.
  const ms = state === "about" ? C.about.returnTime : C.motion.snapTime;
  state = "rest";
  // Back to the one resting pose, middle of the window, full size. Nothing is
  // ever left turned part way: the ring holds this orientation until the next
  // drag, and returns to it when that drag ends.
  poseTo(restPose(), ms);
  to(sizeT, C.view.size, ms);
  to(cxT, 0.5, ms); to(cyT, 0.5, ms);
  to(dotZoomT, 1, ms);
  openProject = -1;
  aboutChars = 0;
  cornerHover = false;
  setHover(-1);
  refreshSliceTargets();     // setHover short-circuits if nothing was hovered
  hint("press a slice to open it · press the star for about");
}

/* Let go of a drag and it eases back to the resting pose. This is the only
   place the ring moves on its own, and it always moves to the same place. */
function returnToRest() { poseTo(restPose(), C.motion.returnTime); }

function goProject(i) {
  state = "project";
  openProject = i;
  // Parked in the corner it holds still, with the gap turned towards you.
  poseTo(cornerPose(), C.motion.openTime);
  to(sizeT, C.view.sizeCorner, C.motion.openTime);
  to(cxT, C.view.cornerX, C.motion.openTime);
  to(cyT, C.view.cornerY, C.motion.openTime);
  to(dotZoomT, 1, C.motion.openTime);
  aboutChars = 0;
  cornerHover = false;
  setHover(-1);
  refreshSliceTargets();     // lights slice i in the parked corner mark
  layoutFeed(i);
  hint("press the logo to go back");
}

/* The about page: one continuous zoom INTO the star.

   Nothing is swapped out or faded — the ring is still being drawn, in the
   same pose, just scaled up past the window (`view.sizeAbout`) with the star
   held at the point everything scales away from. That is what makes it read
   as flying in rather than as a page change: the star you pressed is the
   star you land on. */
function goAbout() {
  state = "about";
  const A = C.about;
  poseTo(restPose(), A.zoomTime);        // no turn — a straight move in
  to(sizeT, C.view.sizeAbout, A.zoomTime);
  to(cxT, 0.5, A.zoomTime);
  to(cyT, A.starY, A.zoomTime);
  to(dotZoomT, A.starScale, A.zoomTime);
  openProject = -1;
  aboutChars = 0;
  cornerHover = false;
  setHover(-1);
  refreshSliceTargets();
  layoutAbout();
  hint("press anywhere to go back");
}

function closeProject() { goRest(); }

/* ==========================================================================
   12. HOVER
   ========================================================================== */
/* Which slices are lit, and why. Three reasons, one per state, and they never
   overlap:

     rest      the slice under the cursor — the preview.
     project   the slice you are IN, so the parked corner mark says which one
               of the seven you are looking at. Put the pointer on that mark
               and ALL of them light instead: the whole ring coming up at once
               is the mark saying it is the way back out, and it distinguishes
               "this is where you are" from "press this".
     about     none. There is no ring on screen to light.

   Kept separate from setHover() because only the first of those is a hover in
   the ordinary sense; the other two outlive the cursor. */
let cornerHover = false;

function refreshSliceTargets() {
  sliceTarget.fill(0);
  if (state === "rest") {
    if (hoverSlice >= 0 && hoverSlice < NS) sliceTarget[hoverSlice] = 1;
  } else if (state === "project") {
    if (cornerHover) sliceTarget.fill(1);
    else if (openProject >= 0 && openProject < NS) sliceTarget[openProject] = 1;
  }
  dirty = true;
}

function setHover(sl) {
  if (sl === hoverSlice) return;
  hoverSlice = sl;
  if (sl >= 0) { if (sl !== coverFor) { coverFor = sl; placeCover(sl); } coverTarget = 1; }
  else coverTarget = 0;
  refreshSliceTargets();
}

/* ==========================================================================
   13. POINTER
   A press and a drag are the same gesture until the pointer has moved far
   enough — under `clickSlop` pixels it counts as a press and changes state,
   beyond it, it tumbles the ring.
   ========================================================================== */
let downAt = null, didDrag = false, lastMove = null;

window.addEventListener("pointerdown", (e) => {
  downAt = { x: e.clientX, y: e.clientY };
  lastMove = { x: e.clientX, y: e.clientY, t: performance.now() };
  didDrag = false;
});

window.addEventListener("pointermove", (e) => {
  mouseX = e.clientX; mouseY = e.clientY;
  dirty = true;
  if (!downAt) return;

  const moved = Math.hypot(e.clientX - downAt.x, e.clientY - downAt.y);
  if (moved > C.motion.clickSlop) didDrag = true;
  // Dragging turns it in the resting state only; with a project open the logo
  // is a small corner mark and the pointer belongs to the feed.
  if (didDrag && state === "rest" && lastMove) {
    const dx = e.clientX - lastMove.x, dy = e.clientY - lastMove.y;

    /* Free tumble. Sideways drag turns it about the screen's vertical axis,
       up-and-down about the screen's horizontal one — and any mixture of the
       two is a single rotation about the axis at right angles to the way your
       hand moved. Applied on the LEFT of the current orientation, which makes
       it relative to what you are looking at rather than to whichever way the
       ring happens to be facing. */
    const deg = Math.hypot(dx, dy) * C.motion.sensitivity;
    if (deg > 0) {
      q = qNorm(qMul(qAxis(dy, dx, 0, deg), q));
      slerpT = 1;                                    // a drag cancels a snap
    }
    lastMove = { x: e.clientX, y: e.clientY, t: performance.now() };
  }
});

window.addEventListener("pointerup", (e) => {
  const wasDrag = didDrag;
  downAt = null; didDrag = false;

  // A drag is a look, not a choice: let go and it eases straight back to the
  // resting pose rather than coasting on and stopping wherever it likes.
  // (v3.1 threw it here instead — flick momentum, friction, a speed ceiling.
  // All of that is gone, along with its settings in section 8.)
  if (wasDrag) { if (state === "rest") returnToRest(); return; }

  mouseX = e.clientX; mouseY = e.clientY;
  samplePick();
  const onLogo = inLogoBox(e.clientX, e.clientY);
  const onDot  = dotHovered(e.clientX, e.clientY);
  if (state === "rest") {
    // Straight from here into the project — there is no menu in between.
    // The star is the about page, and it wins over the slice behind it.
    if (onDot) goAbout();
    else if (pickSlice >= 0) goProject(pickSlice);
  } else if (state === "project") {
    // The parked logo is small, so anywhere in its box counts rather than
    // making you hit the ring itself.
    if (onLogo) closeProject();
  } else if (state === "about") {
    // There is nothing else on the about page to press, and the ring is off
    // the window, so anywhere at all comes back. A drag still doesn't — it
    // returned above — so a stray swipe can't close it out from under you.
    goRest();
  }
});

// The feed scrolls, but there is no scrollbar to hand the job to — the page
// is a texture. So the wheel drives a number, and the number eases.
window.addEventListener("wheel", (e) => {
  if (state !== "project") return;
  e.preventDefault();
  // Firefox reports wheel deltas in LINES, roughly 1/16 the size of Chrome's
  // pixels. Without this the feed crawls in one browser and bolts in the other.
  const k = e.deltaMode === 1 ? 16 : (e.deltaMode === 2 ? VH : 1);
  scrollTarget = clamp(scrollTarget + e.deltaY * k, 0, Math.max(0, feedHeight - VH));
  dirty = true;
}, { passive: false });

window.addEventListener("keydown", (e) => {
  if (e.key === "Escape" && state !== "rest") goRest();
});

/* ==========================================================================
   14. ONE STEP OF THE PAGE
   Called by runBase() from its own clock. Returns true if anything changed
   — redrawing and re-blitting a full-window canvas is the most expensive
   thing in this file, so it only happens when there is genuinely something
   new to show. (The lens, if it's running, redraws every frame regardless —
   it has to, since the cursor itself keeps moving even when the page is
   otherwise still.)
   ========================================================================== */
function update(dt) {
  let moving = false;

  moving = step(sizeT, dt)    || moving;
  moving = step(cxT, dt)      || moving;
  moving = step(cyT, dt)      || moving;
  moving = step(dotZoomT, dt) || moving;

  /* Snapping between poses — a return from a drag, the flight to the corner
     and back. Outside of that the orientation is left exactly where it is:
     nothing turns the ring on its own. (v3.1 ran an idle spin and coasted a
     throw here; both are gone.) */
  if (slerpT < 1) {
    slerpT = Math.min(1, slerpT + dt / slerpDur);
    q = qSlerp(slerpA, slerpB, easeInOut(slerpT));
    moving = true;
  }

  // The resting view IS the menu, so hover means something there and nowhere
  // else. The dot takes priority: if you are pointing at it, you are not
  // pointing at a slice behind it.
  const overDot = dotHovered(mouseX, mouseY);
  setHover((state === "rest" && !downAt && !overDot) ? pickSlice : -1);
  // On the about page the star holds its full star form whatever the cursor
  // is doing — it is the page's own mark there, not a hover state.
  dotTarget = (state === "about" || overDot) ? 1 : 0;

  // With a project open, the parked mark answers to the pointer as one piece:
  // point at it and the whole ring lights at once (see refreshSliceTargets).
  //
  // "At it" means at the ring's actual pixels — read out of the slice buffer,
  // same pixel-exact test the menu uses — and NOT merely inside its bounding
  // box. The box is square and the mark is a ring with a hole through it, so
  // a box test lit the thing up while the cursor was out in an empty corner
  // or down the middle of the hole, which reads as the mark highlighting for
  // no reason.
  //
  // The star is excluded on top of that. It sits in the hole, it is its own
  // target, and pointing at it must not drag the ring up with it — same
  // priority the resting menu gives it a few lines above.
  const onCorner = state === "project" && !overDot && pickSlice >= 0;
  if (onCorner !== cornerHover) { cornerHover = onCorner; refreshSliceTargets(); }

  /* The star's pulse, on the about page only. Two parts: how much pulse there
     is (`pulseAmt`, eased in and out with the cursor so it never snaps on),
     and where in the breath it is (`pulsePhase`, restarted from nothing each
     time the cursor arrives so the swell always grows out of the star's own
     size rather than jumping to wherever a free-running clock had got to). */
  const wantPulse = (state === "about" && overDot) ? 1 : 0;
  if (wantPulse && pulseAmt <= 0.002) pulsePhase = 0;
  if (wantPulse || pulseAmt > 0.002) { pulsePhase += dt; moving = true; }
  const kp = 1 - Math.pow(0.001, dt / (Math.max(1, C.about.pulseFade) / 1000));
  if (Math.abs(wantPulse - pulseAmt) > 0.001) { pulseAmt += (wantPulse - pulseAmt) * kp; moving = true; }
  else pulseAmt = wantPulse;

  /* The typewriter. Characters, not lines: `aboutChars` is a running count and
     drawAbout() spends it. It starts part way through the zoom (`startTyping`)
     so the first characters land while the star is still settling. */
  if (state === "about" && aboutChars < aboutTotal) {
    if (sizeT.t >= C.about.startTyping) aboutChars = Math.min(aboutTotal, aboutChars + C.about.typeSpeed * dt);
    moving = true;
  }

  const ks = 1 - Math.pow(0.001, dt / (Math.max(1, C.shade.fadeTime) / 1000));
  for (let i = 0; i < NS; i++) {
    const d = sliceTarget[i] - sliceShade[i];
    if (Math.abs(d) > 0.001) { sliceShade[i] += d * ks; moving = true; }
    else sliceShade[i] = sliceTarget[i];
  }
  const kd = 1 - Math.pow(0.001, dt / (Math.max(1, C.dot.fadeTime) / 1000));
  if (Math.abs(dotTarget - dotShade) > 0.001) { dotShade += (dotTarget - dotShade) * kd; moving = true; }
  else dotShade = dotTarget;

  const kc = 1 - Math.pow(0.001, dt / (Math.max(1, C.cover.fadeTime) / 1000));
  if (Math.abs(coverTarget - coverAlpha) > 0.002) { coverAlpha += (coverTarget - coverAlpha) * kc; moving = true; }
  else coverAlpha = coverTarget;

  // 1 whenever there is a hint to show, which is always once one has been set
  // — the line holds rather than timing out. Still eased, so the first one
  // fades up instead of snapping on.
  const ha = hintText ? 1 : 0;
  if (Math.abs(ha - hintAlpha) > 0.002) { hintAlpha += (ha - hintAlpha) * (1 - Math.pow(0.001, dt / 0.5)); moving = true; }
  else hintAlpha = ha;

  if (Math.abs(scrollTarget - scrollY) > 0.4) {
    scrollY += (scrollTarget - scrollY) * (1 - Math.pow(0.001, dt / 0.22));
    moving = true;
  } else scrollY = scrollTarget;

  if (!moving && !dirty) return false;
  dirty = false;
  renderLogo();
  drawPage();
  return true;
}

/* --- what the glass module is handed ----------------------------------- */
resize(window.innerWidth, window.innerHeight, Math.min(window.devicePixelRatio || 1, 2));
hint("press a slice to open it · press the star for about");

return {
  canvas: scene,
  resize, update,
  // Exposed so a screenshot script (or you, in the console) can drive it.
  goRest, goProject, goAbout, closeProject, returnToRest,
  settle() { for (const t of [sizeT, cxT, cyT, dotZoomT]) { t.t = 1; t.v = t.to; }
             if (slerpT < 1) { q = slerpB; slerpT = 1; }
             for (let i = 0; i < NS; i++) sliceShade[i] = sliceTarget[i];
             dotShade = dotTarget; coverAlpha = coverTarget;
             aboutChars = aboutTotal;
             dirty = true; renderLogo(); drawPage(); },
  setYaw(v) { q = qNorm(qMul(qAxis(1,0,0,C.view.tiltRest), qAxis(0,1,0,v))); slerpT = 1; dirty = true; },
  setPose(qq) { q = qNorm(qq); slerpT = 1; dirty = true; },
  drag(dx, dy) { const deg = Math.hypot(dx,dy) * C.motion.sensitivity;
                 q = qNorm(qMul(qAxis(dy, dx, 0, deg), q)); slerpT = 1; dirty = true; },
  probe(cx, cy) { mouseX = cx; mouseY = cy; renderLogo(); return pickSlice; },
  scrollTo(v) { scrollTarget = clamp(v, 0, Math.max(0, feedHeight - VH)); dirty = true; },
  get state() { return state; },
  get pick() { return pickSlice; },
  get dotVisible() { return dotVisible; },
  get dotShade() { return dotShade; },
  get feedHeight() { return feedHeight; },
  get scrollAt() { return Math.round(scrollY); },
  get aboutTyped() { return aboutTotal ? aboutChars / aboutTotal : 0; },
  mesh,
};

}
