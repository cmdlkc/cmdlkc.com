"use strict";

Object.assign(CONFIG, {

  /* ------------------------------------------------------------------------
     13. THE LENS
     A small, self-contained refraction effect confined to a circle around
     the cursor. Everything else on the page (logo, menu, feed) is drawn
     completely plainly — one 2D canvas, blitted straight to the screen, no
     WebGL involved at all. This is the ONLY thing on the page that bends
     anything, and it only ever bends the small patch directly under the
     pointer.

     It's genuine liquid now — the same splat-and-advect logic as
     prototypes/liquid-glass, reused rather than reinvented. v3.0 tried that
     at FULL PAGE scale (a page-wide velocity field, a pressure solve, the
     lot) and it read as too digital and too showy. What changed here isn't
     the liquid, it's the size of the pool: this is a tiny patch of it —
     maybe 48 pixels across — that lives entirely in the lens's own local
     space and travels with the pointer rather than sitting still in page
     space. Two things fall out of that for free:
       · nothing is ever left behind. There's no page-space memory for a
         wake to sit in — move away and the patch (with whatever motion it
         still has) simply isn't rendered anywhere but under the pointer.
       · sit still and it settles to genuinely flat within a fraction of a
         second — flat liquid bends nothing, so the lens goes essentially
         invisible at rest, the same way it did before.
     A fixed dome (the old approach) looks identical every single frame no
     matter what the pointer is doing, which is what read as rigid/mechanical.
     This one only wells up while you're actually moving, softer the slower
     you go, and eases back down the moment you stop.
     --------------------------------------------------------------------- */
  lens: {

    // false = no cursor effect at all. The plain page, exactly as drawn.
    // Worth flipping when judging the page on its own, or to tell the two
    // apart when something looks wrong.
    enabled: true,

    // The visible radius of the distortion, in CSS pixels (not scaled by
    // device pixel ratio — a "90" reads the same size on a retina screen).
    //   Range 40–220.  50 = tiny, almost a magnifying pinpoint.
    //                  90 = current. Noticeable but clearly small.
    //                  180 = large, starts to compete with the page.
    radius: 90,

    // How much of the outer edge of that radius fades to nothing, so the
    // lens blends into the page instead of showing a hard circular edge.
    //   Range 0–0.7.   0.05 = a crisp coin-edge cutoff.
    //                  0.35 = current. A soft, unobtrusive vignette.
    //                  0.6 = mostly feather, a hazy glow more than a shape.
    softness: 0.35,

    // How quickly the lens catches up to the actual pointer position, each
    // frame, 0–1. A little lag is most of what makes this read as a small
    // physical thing being carried along rather than a UI layer glued to
    // the cursor — on top of whatever lag the liquid itself adds.
    //   Range 0.08–1.  0.15 = a noticeable, slightly heavy trail.
    //                  0.35 = current. A soft, brief lag — still feels close.
    //                  1.0 = perfectly glued to the cursor, no lag at all.
    follow: 0.35,

    /* ---- the glass: how the liquid's surface bends light ---- */

    // How far the lens displaces what's behind it, per unit of liquid
    // height — the master dial for how strong the bend reads at full swell.
    //   Range 0–1.2.   0.08 = barely a heat-haze, easy to miss.
    //                  0.26 = current. A clearly visible ripple.
    //                  0.5 = heavy, an obvious glass dome, lines swim.
    refract: 0.26,

    // How much further blue bends than red, same idea as real glass. There
    // is no added colour — it's the page's own colour, pulled apart slightly.
    //   Range 0–0.6.   0 = perfectly colourless.
    //                  0.10 = current. A faint fringe right at the rim.
    //                  0.4 = strong prismatic fringing, rainbows on any line.
    dispersion: 0.10,

    // Brightness of the tight highlight where the liquid's surface happens
    // to face the light.
    //   Range 0–1.5.   0.1 = matte.
    //                  0.24 = current.
    //                  1.2 = wet, glossy.
    specular: 0.24,

    // Brightness of the thread of light right at the lens's own rim, where
    // the surface is seen almost edge-on.
    //   Range 0–0.8.   0.1 = barely there.
    //                  0.22 = current.
    //                  0.7 = strong outline, reads like a coin.
    rim: 0.22,

    // How steep the liquid's surface is treated as being, when working out
    // which way it bends light. Higher exaggerates every ripple.
    //   Range 0.5–6.   0.8 = gentle, broad swells.
    //                  2.2 = current.
    //                  5 = sharp, restless, fine creases.
    relief: 2.2,

    /* ---- the liquid: how that small patch moves ----
       Exactly the splat/advect model from prototypes/liquid-glass, just
       running on a small buffer local to the lens instead of the whole
       page, and without that prototype's incompressibility solve (the
       pressure/vorticity passes) — at this size, plain advection plus fast
       settling already reads as liquid; the extra solve is built for a
       page-sized pool and would be wasted here. */

    // Resolution of the little patch of liquid, in simulation cells across.
    // This is a size of SPACE, not of the visible lens — the patch always
    // covers the same area the lens draws over, just at a coarser grid.
    //   Range 24–96.   28 = soft, almost no structure to the ripple.
    //                  48 = current.
    //                  80 = crisper ripples; unlikely to be visible at this size.
    simSize: 48,

    // Below this pointer speed, in CSS pixels per second, the liquid is left
    // completely alone — holding still or drifting slowly never wells it up.
    //   Range 0–300.   0 = always active, even when barely moving.
    //                  25 = current. Only an almost-still pointer leaves it flat.
    //                  200 = you have to move briskly before anything happens.
    stillSpeed: 25,

    // The speed at which the disturbance reaches full strength. Between this
    // and `stillSpeed` it ramps up smoothly, so how much the liquid moves is
    // a consequence of how fast the pointer moved, not a fixed blob size.
    //   Range 200–3000. 500 = a light flick already reaches full strength.
    //                   900 = current. An ordinary pointer move gets there.
    //                   3000 = only a hard flick reaches full strength.
    fullSpeed: 900,

    // How much liquid the pointer pushes up, at full speed — the master
    // "how much does it well up" dial. Unlike prototypes/liquid-glass this
    // patch is disturbed EVERY frame you're moving, not just along one
    // stroke, so it builds up over a second or so of continuous motion
    // rather than needing a big number to read at all.
    //   Range 0.005–0.08. 0.008 = barely a shimmer, easy to miss entirely.
    //                     0.04 = current. Clearly liquid while moving.
    //                     0.07 = heavy, starts to compete with the page.
    displacement: 0.04,

    // How hard the pointer's motion pushes the liquid along with it — a
    // separate, secondary push from `displacement` above: this is what
    // makes a bump drift a little in the direction of travel each frame
    // before it settles, rather than just fading in place. It's multiplied
    // by a per-frame `dt` before it reaches the liquid, so it needs to be a
    // largish number to add up to anything — but this patch's grid
    // (`simSize`) is much coarser than prototypes/liquid-glass's, so it
    // takes much LESS force here to move a whole cell. Keep it well under
    // 300 — much higher and a sustained fast sweep can push the bump
    // further than one grid cell in a single frame, which looks like a
    // stutter rather than a drift.
    //   Range 40–260.  60 = the bump barely drifts, close to fading in place.
    //                  120 = current. A brief, soft drift.
    //                  240 = a noticeable trail of motion — too much for this size.
    flowForce: 120,

    // How much the ripple is stretched along the direction of travel. 1 is a
    // round bump; higher reads as a brief streak rather than a disc.
    //   Range 1–6.     1 = round, reads as a blob riding with the cursor.
    //                  2.2 = current. A short, soft streak.
    //                  5 = a long thin scratch.
    streak: 2.2,

    // How quickly the liquid settles back to flat after the pointer stops or
    // pulls away. This is the main knob for "no tracks left behind" — kept
    // fast on purpose, well below what prototypes/liquid-glass uses for its
    // page-sized pool, because a small patch that lingers reads as a trail.
    //   Range 0.80–0.99. 0.85 = settles almost instantly.
    //                    0.90 = current. Well under half a second.
    //                    0.97 = holds for a second or two — starts to feel like a wake.
    settle: 0.90,

    // How quickly the PUSH itself dies away, separate from the height
    // settling above. Lower is thicker/more damped; higher keeps sloshing
    // a little longer after you stop.
    //   Range 0.80–0.99. 0.85 = heavily damped, almost no coast.
    //                    0.92 = current.
    //                    0.98 = keeps drifting for a while after you let go.
    viscosity: 0.92,
  },

});
