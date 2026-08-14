/* ============================================================================
   FLUID CURSOR — v1.0 — SETTINGS
   ============================================================================

   Every number you're likely to want to change lives in this one file.
   Nothing here is code you need to understand — they're just labelled values.

   HOW TO USE IT
     1. Change a number below.
     2. Save this file.
     3. Refresh the browser.

   Keep this file in the SAME FOLDER as fluid-cursor-v1.0.html, or the page won't find it.

   MAKING A NEW VERSION
     Copy BOTH files, bump the number in both filenames, and update the
     <script src> line at the top of the new .html to match. Never edit an
     old version in place — the point of the number is that you can always
     go back to something that worked.

   Each setting lists a SAFE RANGE and tells you which direction does what.
   You can go outside the ranges — nothing will break — but it'll start
   looking odd rather than just different.
   ========================================================================= */

const CONFIG = {

  /* ==========================================================================
     1. THE GLASS — how it bends light
     ========================================================================== */

  // How far the glass displaces what's behind it. This is the master dial for
  // how "thick" the material reads.
  //   Range 0–0.25.  0.02 = a faint heat-haze.
  //                  0.072 = current. Clearly a lens, still readable.
  //                  0.18 = heavy, aggressive distortion.
  refraction: 0.072,

  // How much further blue bends than red. Real glass splits light this way —
  // it's where the colour fringing comes from. There is no palette here; the
  // colour is the page's own, pulled apart.
  //   Range 0–0.15. 0 = perfectly colourless, slightly clinical.
  //                 0.035 = current. A whisper of colour on the folds.
  //                 0.10 = strong prismatic fringing.
  dispersion: 0.035,

  // Brightness of the tight highlight where the surface catches the light.
  //   Range 0–1.5.  0.15 = matte, more like water than glass.
  //                 0.42 = current.
  //                 1.2 = wet, glossy, almost mercury.
  specular: 0.42,

  // Brightness of the thread around every fold. Surfaces seen edge-on reflect
  // far more than flat ones, and this is what gives glass its drawn outline.
  //   Range 0–0.6.  0.08 = barely there.
  //                 0.26 = current.
  //                 0.45 = strong outlines, closer to a soap bubble.
  rimLight: 0.26,

  // How steep the surface is treated as being. Higher exaggerates every fold,
  // so both the bending and the highlights get more dramatic.
  //   Range 1–40.   6 = gentle, broad swells.
  //                 5 = current.
  //                 32 = sharp, restless, lots of fine creases.
  surfaceRelief: 5.0,

  // How much the surface is softened before it's read. This is the difference
  // between glass and froth.
  //   Range 0–8.    0.8 = crisp, slightly noisy.
  //                 2.4 = current. Smooth swells with clean creases.
  //                 6 = very soft, loses the folds.
  smoothing: 2.4,

  /* ==========================================================================
     2. THE LIQUID — how it moves
     ========================================================================== */

  // How hard the pointer shoves the liquid, based on how fast it's moving.
  //   Range 1000–30000. 4000 = you have to work for it.
  //                     11000 = current.
  //                     25000 = violent; small movements throw it everywhere.
  pointerForce: 11000,

  // An EXTRA shove proportional to how sharply the pointer changes speed.
  // Moving at a constant rate gives a steady wake; snapping the hand into
  // motion or whipping it round gives a burst. This is what makes the liquid
  // feel like it has weight and is being knocked about rather than followed.
  //   Range 0–3.    0 = speed only; the liquid feels inert and obedient.
  //                 1.1 = current. Reacts to a flick.
  //                 2.5 = very twitchy, erupts on any change of direction.
  accelerationBoost: 1.1,

  // How much liquid the pointer pushes out from under itself. This is the
  // bulge that gets carried away and stretched by the flow.
  //   Range 0–0.6.  0.06 = a thin film.
  //                 0.11 = current.
  //                 0.4 = a heavy, sloshing mass.
  displacement: 0.11,

  // Width of the pointer's push, as a fraction of the screen.
  //   Range 0.05–1. 0.15 = a narrow finger.
  //                 0.42 = current.
  //                 0.8 = a broad palm.
  pointerSize: 0.42,

  // Spacing of the pushes along the pointer's path. A fast sweep crosses a
  // third of the screen between frames, so the path is walked and pushed at
  // intervals rather than once per frame — otherwise the wake is dotted.
  //   Range 0.004–0.06. 0.016 = current.
  strokeSpacing: 0.016,

  // How quickly the liquid settles back to flat after you stop.
  //   Range 0.9–1.0. 0.95 = settles almost at once.
  //                  0.968 = current. About two seconds.
  //                  0.99 = holds for a long time.
  settle: 0.968,

  // How quickly the motion itself dies away. Lower is thicker and more
  // syrupy; higher keeps it sloshing.
  //   Range 0.9–1.0. 0.96 = viscous, like honey.
  //                  0.978 = current.
  //                  0.995 = thin and restless, keeps travelling.
  viscosity: 0.978,

  // Strength of the small swirls. Glass wants much less of this than smoke —
  // it's what separates a clean rolling swell from froth.
  //   Range 0–40.   0 = glassy but lifeless.
  //                 5 = current. Slow curling folds.
  //                 20 = choppy and turbulent.
  swirl: 5,

  /* ==========================================================================
     3. THE PAGE UNDERNEATH — only here so there's something to bend
     ==========================================================================
     Replace all of this when the effect moves onto the real site. Refraction
     is invisible over a flat colour, so it needs structure behind it.
     ---------------------------------------------------------------------- */
  page: {
    background: '#eef0f8',
    ink: '#0b0b0d',
    heading: ['Bold Ideas,', 'Brought to Life'],
    kicker: 'SCROLL TO EXPLORE',
    footnote: 'We combine design, motion, 3D, and development to create',
    markCount: 4                       // the little + marks across the top
  },

  /* ==========================================================================
     4. QUALITY
     ========================================================================== */
  motionDetail: 128,     // grid for the movement. 64 cheap, 256 heavy.
  surfaceDetail: 512,    // grid for the surface. This is what you see.
  solverPasses: 20       // incompressibility passes per frame. Below 12 looks gassy.
};
