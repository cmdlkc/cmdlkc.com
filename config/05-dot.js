"use strict";

Object.assign(CONFIG, {

  /* ------------------------------------------------------------------------
     5. THE CENTRE DOT
     --------------------------------------------------------------------- */
  dot: {
    show: true,

    // Radius at rest, in rendered pixels (so it doubles on screen at
    // pixelSize 2).
    // 1 = a single speck · 3 current · 8 a bold full stop
    radius: 3,

    /* >>> WHY IT SOMETIMES DISAPPEARS WHILE YOU DRAG
       The dot is depth-tested against the ring, so it genuinely goes BEHIND
       it rather than floating on top. But it sits on the ring's AXIS, dead
       centre, and at this tilt the near side of the tube passes right across
       that point: the middle only clears when

           ring.radius - letter.width/2  >  (letter.height/2) / tan(tiltRest)

       which at 0.85 / 0.72 / 35.264 it does NOT. The gap is what saves it.
       The resting pose (view.restTurn 0) turns the opening towards you, so
       the wedge that is missing is exactly the piece that would have covered
       the dot, and at rest it is always visible. Turn the ring away from that
       pose with a drag and it will duck behind the tube for most of the way
       round — which is correct, and it comes back the moment you let go.

       Two one-number fixes if you want it visible at every angle:
         · view.tiltRest to 50 or more — tips it further over, but it stops
           being true isometric
         · ring.radius to 1.10 or more — opens the hole up, but makes the logo
           a thinner bracelet */

    // --- the star, under the cursor ---

    // How much the solid body of the dot swells on hover, as a fraction of
    // `radius`. This is the "slightly" part.
    // 0.0 = the body stays put and only the points grow
    // 0.35 = current
    // 1.2 = it visibly balloons; stops feeling like a precise target
    grow: 0.35,

    // How far the points reach, as a multiple of `radius`.
    // 2.0 = a barely-there nick in the outline
    // 3.2 = current
    // 8.0 = a big sparkle; starts covering the middle of the ring
    // NOTE: the diagonal rays need pixels to live in. Much below 3 they stop
    // resolving and the star collapses into a fat diamond — if you shrink
    // this, drop `diagonal` towards 0 as well rather than fighting it.
    spike: 3.2,

    // Number of main arms. 4 reads as a technical-drawing centre mark, which
    // is why it is the default. 6 gives a snowflake, 3 a caret.
    points: 4,

    // Thin extra rays sitting in the gaps between the main arms, as a
    // fraction of `spike`. These are what stop it reading as a plus sign.
    // 0.0 = off, back to a bare cross
    // 0.62 = current — just long enough to catch the eye, no more
    // 1.2 = longer than the arms; becomes an 8-point star with no hierarchy
    diagonal: 0.62,

    // How thin those diagonal rays are. Much higher than `sharpness` on
    // purpose — they should read as drawn lines, not as more of the body.
    // 3  = as chunky as the main arms; the star turns into a fat diamond
    // 18 = current — single-pixel hairlines, barely there
    // 26 = so thin they break up into dashes and mostly vanish
    diagonalSharpness: 18,

    // How sharp the points are. This is an exponent, so it bites hard.
    // 1.2 = fat blobby lobes; at this size it reads as a plus sign, not a star
    // 3.2 = current — clean tapered points
    // 6.0 = needle-thin spikes with almost nothing between them
    sharpness: 3.2,

    // How close the cursor has to get, in SCREEN pixels, before the dot
    // reacts. Deliberately larger than the dot itself — a 6px target you have
    // to hit exactly is annoying, and this is a real button: pressing the
    // star opens the ABOUT page (section 14).
    //
    // It is also the patch that suppresses everything behind it: slice
    // hovering in the resting menu, and the parked corner mark's whole-ring
    // highlight while a project is open. You cannot point at the star and at
    // the thing behind it at the same time, and the star wins. So keep this
    // modest — push it far enough and the middle of the ring stops being a
    // menu at all, because the star swallows it.
    // 8  = you have to be almost exactly on it
    // 18 = what it was; fine on the big resting ring, fiddly on the small
    //      corner mark, where the star is only a few pixels across
    // 28 = current — comfortably clickable at both sizes, and still well
    //      inside the ring's hole so the slices around it stay reachable
    // 40 = it reacts from most of the middle of the ring
    hitRadius: 28,

    // Milliseconds for the star to open and close.
    // 60 = snappy, almost a pop
    // 170 = current
    // 500 = slow bloom; you out-run it moving the cursor away
    fadeTime: 170,
  },

});
