"use strict";

Object.assign(CONFIG, {

  /* ------------------------------------------------------------------------
     1. COLOUR
     There are only two colours in the whole thing, which is the point.
     --------------------------------------------------------------------- */
  colour: {

    // >>> THE ONE VALUE TO EYEBALL <<<
    // You asked me to match the orange in your "Iteration / 4-Chambers"
    // reference. I could only read that off the screenshot, not sample the
    // file, so this is my best estimate of it. Put the reference next to the
    // browser and nudge this until they sit together.
    //   #E8542A = current — warm printed orange, slightly deeper than NASA's
    //   #FC3D21 = NASA "worm" orange, what v1.0 used. Redder, hotter.
    //   #F0602A = a step lighter and more amber
    //   #DA4418 = a step deeper and more oxide
    ink: '#E8542A',

    // The page. Keep it near-white; the whole design depends on the lines
    // sitting on paper rather than on a tint.
    paper: '#FFFFFF',
  },

});
