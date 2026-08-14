"use strict";

Object.assign(CONFIG, {

  /* ------------------------------------------------------------------------
     11. THE PROJECT FEED
     Scattered rather than gridded — positions are randomised, but from a
     fixed seed per project, so a project looks the same every time you open
     it rather than reshuffling under you.
     --------------------------------------------------------------------- */
  feed: {

    // Width of the scattered column as a fraction of the window.
    // 0.55 = narrow and orderly · 0.78 current · 0.96 edge to edge
    columnWidth: 0.78,

    // Width of one feed item, as a fraction of the column. Each item picks a
    // random width in this range.
    // 0.16 / 0.34 = current — several items visible at once
    // 0.40 / 0.70 = one big image at a time, more like a slideshow
    itemMin: 0.18,
    itemMax: 0.36,

    // How far items may wander sideways from their lane, as a fraction of the
    // column. Items alternate between a left and a right lane first; this is
    // the jitter on top of that.
    // 0 = two tidy columns · 0.22 current · 0.60 properly chaotic
    scatter: 0.22,

    // How far down the page each item pushes the next one, as a fraction of
    // its own height. Below 1 the next item rides up ALONGSIDE this one,
    // which is what turns a column into a scatter.
    // 0.95 / 1.00 = a plain single column, nothing ever sits side by side
    // 0.45 / 0.95 = current
    // 0.20 / 0.60 = heavy overlap; images start covering each other
    stackMin: 0.45,
    stackMax: 0.95,

    // Extra vertical gap between items, as a fraction of window height.
    gapMin: 0.01,
    gapMax: 0.10,
  },

});
