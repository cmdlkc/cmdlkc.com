"use strict";

Object.assign(CONFIG, {

  /* ------------------------------------------------------------------------
     7. HOVER SHADING
     This is the cube cursor's model, deliberately: ONE colour, and tone comes
     from how many dots get printed. A lit face prints few dots; a face in
     shadow prints many.

     ONE EXCEPTION, and it is deliberate: `highlightFade`, right at the bottom.
     The mark parked in the corner is a tenth of the size, and there the ink
     of a lit slice is mixed towards the paper so the highlight reads as
     TRANSLUCENT — same dots, same dither, weaker colour. Everywhere else the
     rule holds absolutely: nothing is ever a paler orange.
     --------------------------------------------------------------------- */
  shade: {

    // Dot coverage on the LIGHTEST part of a hovered slice, 0..1.
    // 0.00 = the lit side prints nothing and looks empty
    // 0.18 = current
    // 0.45 = the whole slice reads as fairly solid
    lightestFace: 0.18,

    // Dot coverage on the DARKEST part. Must be above lightestFace.
    // 0.55 = gentle, the slice stays airy
    // 0.86 = current
    // 1.00 = the shadow side goes completely solid orange
    darkestFace: 0.86,

    // Where the light comes FROM, in screen space. Fixed to the screen, not
    // to the object, so the ring turns underneath it.
    // x: -1 left, +1 right · y: -1 below, +1 above · z: +1 straight at you
    lightDirection: { x: -0.45, y: 0.70, z: 0.55 },

    // Milliseconds for a slice to fade its shading in and out. Nothing here
    // snaps on.
    // 60 = almost instant, feels twitchy
    // 190 = current
    // 600 = languid; you out-run it moving between slices
    fadeTime: 190,

    // How heavily the two faces of the cut are shaded, 0..1. Unlike the slice
    // shading this is always on — it is what makes the D and its mirror read
    // as letterforms rather than as two more outlines in a drawing made of
    // outlines.
    // This is flat ink (see the paint() comment) — it does NOT run through
    // lightDirection/lightestFace/darkestFace, so both faces always print at
    // the same density no matter which way the ring is turned, AND it is
    // independent of the slice around it, so lighting a slice no longer
    // swallows the letterform standing in it.
    // 0.00 = off; back to bare wireframe faces and the letters disappear
    // 0.55 = old default — legible but noticeably airy
    // 0.85 = current — dense, close to solid, still a dither
    // 1.00 = solid orange faces, no texture left
    capFaces: 0.85,

    /* ---- what happens when the logo is drawn small ----
       i.e. the mark parked in the corner while a project is open. The Bayer
       tile is fixed to the SCREEN, so it does not shrink along with the logo:
       at full size the letter's stroke is a couple of dozen pixels wide and
       `capFaces` reads as a texture, but in the corner the stroke is nearer
       six and an 8-pixel tile is not a texture at all, just a couple of holes
       landing wherever the screen grid happens to fall.

       Two things were tried down there and both were wrong. Printing SOLID
       killed the halftone completely and the mark became an orange blob.
       Halving the DOT COVERAGE of the highlight kept a halftone but a
       ragged, gappy one — half the dots of a pattern that only has four
       positions to play with is not a lighter tone, it is a coarser one, and
       it looked worse than the blob.

       What works is leaving the dither exactly as it is everywhere else and
       weakening the COLOUR instead (`highlightFade`): every dot the highlight
       would have printed still prints, in a paler orange, so the lit slice
       reads as a translucent wash and the full-strength cut faces sit on top
       of it as letters. */

    // The stroke width, in RENDERED pixels, below which the logo counts as
    // small. (letter.stroke on screen, so it accounts for view.size, the
    // window and view.pixelSize at once.)
    //
    // There are only two sizes to separate, and they are a long way apart:
    // `view.size` 0.30 against `view.sizeCorner` 0.095 is a factor of three,
    // which on a 900x640 window is a stroke of about 16 rendered pixels at
    // rest against about 5 in the corner. So this wants to sit in the middle
    // of that gap, not at the top of it — at 16 the resting logo lands right
    // on the line and whether a hovered slice goes pale depends on the window
    // being a few pixels wider or narrower, which is horrible.
    //  0 = never; one tile and full-strength ink everywhere, however small
    // 10 = current, mid-gap. The flip only ever happens at rest on a window
    //      under about 400px, where the logo really is corner-sized.
    // 99 = always; the resting logo gets the fine tile and the faded
    //      highlight too, so hovering a slice at full size goes pale
    fineBelow: 10,

    // Bayer tile size at full size, and when small. 2, 4 or 8. The grid is
    // fixed to the SCREEN, so the object turns underneath the dots and they
    // stay put.
    //   matrix     2 = coarse and obviously chequered
    //              8 = current — newsprint halftone
    //   fineMatrix 2 = current. Four screen pixels across at pixelSize 2, so
    //                  even the corner mark's stroke gets a few of them.
    //                  Its four thresholds are 0.125/0.375/0.625/0.875, so
    //                  capFaces at 0.85 prints three dots of four down there
    //                  — dense, but still visibly a halftone rather than a
    //                  fill. Above 0.88 it goes solid.
    //              4 = a wider tonal range, but the pattern is then coarser
    //                  than the stroke it has to live in
    matrix: 8,
    fineMatrix: 2,

    // How far the ink of a LIT SLICE is mixed towards the paper when the logo
    // is small, 0..1. The dither is untouched — every dot that would print
    // still prints — but in a weaker orange, so the highlight reads as a
    // translucent wash and the full-strength cut faces sit on top of it as
    // letters. This is the one place on the site that uses a paler orange
    // instead of fewer dots, and it is deliberate; see the section header.
    //
    // THIS IS THE ONE TO EYEBALL.
    // 0.00 = no fading at all: full-strength orange, and the highlight and
    //        the letterforms are the same colour again
    // 0.50 = current — half way to the paper. The wash is obvious as a wash.
    // 0.80 = a ghost; you have to hunt for which slice you are in
    highlightFade: 0.5,
  },

});
