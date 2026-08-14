"use strict";

Object.assign(CONFIG, {

  /* ------------------------------------------------------------------------
     10. THE HOVER COVER CARD
     The preview that floats up somewhere on the page when you hover a slice.
     --------------------------------------------------------------------- */
  cover: {

    // Width as a fraction of the window.
    // 0.12 = a thumbnail · 0.22 current · 0.40 dominates the page
    width: 0.22,

    // Gap between the EDGE of the ring and the nearest edge of the card, as a
    // fraction of the shorter side of the window. Measured from the ring's
    // edge rather than from the middle of the window, and the card's own size
    // is taken into account, so it can never land on the slice you are
    // pointing at however big you make it.
    // 0.01 = card almost touching the ring
    // 0.04 = current
    // 0.12 = pushed right out to the margins; gets clamped on small windows
    clearance: 0.04,

    // Milliseconds to fade in and out.
    fadeTime: 260,
  },

});
