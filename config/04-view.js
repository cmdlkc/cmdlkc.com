"use strict";

Object.assign(CONFIG, {

  /* ------------------------------------------------------------------------
     4. VIEW
     No perspective anywhere — parallel lines stay parallel. That is what
     makes it axonometric rather than a photograph.
     --------------------------------------------------------------------- */
  view: {

    // Screen pixels per rendered pixel. This is what gives the hard aliased
    // edge — the picture is drawn small and blown up with no smoothing.
    // 1 = smooth, the dither almost disappears
    // 2 = current
    // 4 = chunky pixel-art; the letter gets hard to read
    pixelSize: 2,

    // Radius of the logo as a fraction of the SHORTER side of the window,
    // in the resting state. This is also the size you aim at slices at now
    // that the resting view is the menu — the old, bigger `sizeTop` is gone
    // with the state it belonged to, so if slices feel fiddly to hit, this is
    // the number to raise.
    // 0.18 = small and logo-like · 0.30 current · 0.44 fills the window
    size: 0.30,

    // Same again, once a project is open and the logo has parked itself in
    // the top-left corner. Below about 0.07 the wireframe stops being
    // legible and reads as a scribble — the interior lines are only one
    // pixel wide and there is nowhere for them to go.
    // 0.07 = the smallest that still reads
    // 0.095 = current
    // 0.16 = a big corner mark; starts competing with the project title
    sizeCorner: 0.095,

    // Same again, for the ABOUT page (section 14) — the size the ring is
    // zoomed to as the page flies into the star. It is a fraction of the
    // window like the others, so 4 means the ring's radius is four windows
    // across and every part of it is somewhere off the page.
    //
    // The number that matters is whether the ring is COMPLETELY gone: the
    // hole in the middle has to clear the window from the star's position,
    // and the star sits high (`about.starY`), so it is the bottom edge that
    // gives it away — an orange arc creeps up under the about text.
    //
    // Sizes are a fraction of the SHORTER side, and the thing that has to be
    // cleared is the LONGER one, so the shape of the window decides how much
    // is enough: a landscape window is clear by about 4.5, a tall portrait
    // one needs nearly twice that. Hence a number that looks absurd — it is
    // deliberately well past "just gone" so it holds at any window shape.
    // 4  = fine on a wide window, an arc across the text on a phone
    // 9  = current — clear everywhere I can make the window go
    // 20 = no different to look at; the fly-out just gets faster
    sizeAbout: 9,

    // Where the parked logo sits, as a fraction of the window.
    cornerX: 0.085,
    cornerY: 0.10,

    // Should the parked corner mark be a SOLID OBJECT rather than a drawing?
    //
    // Everywhere else the logo is a wireframe on paper and the page shows
    // through everything that isn't ink — right, when there is nothing behind
    // it. But the corner mark has a project feed scrolling past underneath,
    // and body text running through the middle of a wireframe is unreadable
    // both ways round. With this on, the ring's surface prints paper where it
    // isn't inked, so the feed passes behind it.
    //
    // Only the surface: the hole in the middle of the ring stays see-through,
    // so you catch the page moving through it and the mark still reads as a
    // ring rather than as a blob.
    //
    // true  = current
    // false = the old see-through corner mark, feed text and all
    cornerOpaque: true,

    // The axonometric angle, in degrees. 35.264 is TRUE ISOMETRIC.
    // 0 = dead-on side elevation, 90 = straight down on the ring.
    // (v3.1 also had `tiltTop: 90` here for the top-down menu. There is no
    // top-down menu any more, so it has gone.)
    tiltRest: 35.264,

    // Extra turn, in degrees, for the RESTING pose — the one the page loads
    // in and the one a drag eases back to.
    //   0 = current. The gap points straight AT you: you look into the
    //       opening and see both cut faces, so the D and its mirror are both
    //       legible without touching anything.
    //  90 = gap turned to the RIGHT instead, so the ring reads as a C. This
    //       is what the old top-down menu did, at a different tilt.
    // -40 / 40 = part way between, seeing into the gap from one side
    restTurn: 0,

    // The same, for the logo parked in the corner while a project is open.
    // It holds dead still there, so whatever you set here is what you always
    // get. Kept separate from `restTurn` because the corner mark is a tenth
    // the size and does not necessarily want the same pose.
    //   0 = current. Gap pointing straight AT you, matching the resting pose.
    //       At corner size it reads as an arch rather than as a C, which may
    //       or may not be what you meant.
    //  90 = gap turned to the RIGHT instead, so the corner mark reads as a C.
    //       Try this if the arch bothers you — it is the only other position
    //       I would consider.
    // -40 / 40 = part way between, seeing into the gap from one side
    cornerTurn: 0,
  },

});
