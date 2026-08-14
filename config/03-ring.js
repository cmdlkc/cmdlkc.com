"use strict";

Object.assign(CONFIG, {

  /* ------------------------------------------------------------------------
     3. THE RING AND ITS SLICES
     --------------------------------------------------------------------- */
  ring: {

    // Distance from the spin axis to the middle of the D. Must exceed
    // letter.width / 2 or the shape turns inside out.
    // 0.50 hole almost closed · 0.85 current · 1.60 thin bracelet
    radius: 0.85,

    // How big the gap is, counted in SLICES rather than in degrees.
    //
    // CHANGED IN v2.2 — v2.1 had `notch: 45`, a raw angle. The ring is now cut
    // into (number of projects + this) equal wedges, and this many of them are
    // simply left out. So every slice stays the same size whatever you do, and
    // the gap always lines up with the slice boundaries instead of drifting
    // off them. With 7 projects and 2 here: 9 wedges of 40 degrees, 7 built.
    // 1 = a single slice missing. Reads as a notched ring.
    // 2 = current — unmistakably a C from above
    // 3 = a third of the ring gone; more horseshoe than C
    notchSlices: 2,

    // Where the gap sits around the ring, in degrees, in the resting pose.
    // 90 = current. In the top-down view this puts the gap towards the top
    // left, which is where your sketch has it.
    notchAt: 90,

    // Revolve segments. This is rounded to a whole multiple of the number of
    // slices so the divider lines land exactly on slice boundaries.
    // 24 clearly polygonal · 84 current · 168 smoother, ~2x the cost
    steps: 84,

    // Above this angle a joint in the profile is a hard crease rather than a
    // smooth curve. 10 = everything facets · 35 current · 80 all goes soft
    creaseAngle: 35,
  },

});
