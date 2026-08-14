"use strict";

Object.assign(CONFIG, {

  /* ------------------------------------------------------------------------
     6. LINES
     Worked out from the depth buffer, the same way a technical drawing picks
     out an edge: something is a line if what is next to it is a long way
     behind, faces a very different direction, or is a different slice.
     Everything hidden behind the solid is removed automatically.
     --------------------------------------------------------------------- */
  lines: {

    // The outer contour against the paper.
    silhouette: true,

    // Where one surface passes in front of another. This is what draws the
    // notch opening and the inner hole. Threshold as a fraction of the
    // logo's radius. 0 = off · 0.030 current · 0.15 only extreme overlaps
    depth: 0.030,

    // Folds in the surface, in degrees. 0 = off · 42 current · 80 almost none
    crease: 42,

    // The radial lines between slices.
    //
    // CHANGED IN v2.1 — this no longer means "always draw them". A divider is
    // now drawn only while one of the two slices it separates is lit up under
    // the cursor, and it dissolves in through the same dither grid as the
    // shading. With nothing hovered the ring has no internal lines at all.
    // Set to false to suppress them even on hover.
    dividers: true,

    // (v2.0 had `dividersWhileSpinning` here. Gone: the resting state IS the
    // menu now, so there is no longer a state in which the question makes
    // sense.)
  },

});
