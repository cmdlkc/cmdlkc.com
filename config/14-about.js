"use strict";

Object.assign(CONFIG, {

  /* ------------------------------------------------------------------------
     14. THE ABOUT PAGE
     Press the star in the middle of the ring and the page zooms INTO it: the
     ring scales up past the edges of the window and is gone, the star settles
     in the middle of the top half of the page, and the text below types
     itself in a character at a time. Press anywhere (or Escape) to come back.

     It is one continuous move, not a page change — the same star, the same
     drawing, just flown into. Nothing is loaded, nothing fades to white, and
     the ring is still there the whole time, only enormous and off-screen.

     The zoom distance lives with the other sizes as `view.sizeAbout`, because
     that is where you will look for it when the ring is not quite gone.
     --------------------------------------------------------------------- */
  about: {

    // Where the star comes to rest, as a fraction of the window's height.
    // Level with the top quarter is what "the middle of the top half" means
    // in practice — the text hangs under it and the pair sit as one block.
    // 0.16 = high and tight to the top edge
    // 0.26 = current
    // 0.40 = nearly centred; the text runs off the bottom on a short window
    starY: 0.26,

    // How much bigger the star itself is on the about page. The star is drawn
    // at a fixed pixel size (`dot.radius`) rather than scaled with the ring,
    // so without this it would stay a speck while everything else flew off
    // the page and the zoom would read as the ring leaving rather than as you
    // arriving.
    // 1.0 = no growth at all; the move reads as the ring running away
    // 2.6 = current — a mark with some presence, still small
    // 6.0 = a big graphic device; starts to compete with the text
    starScale: 2.6,

    // Milliseconds for the zoom in, and for the flight back out to the ring.
    // Eased at both ends, never linear. Slower than the other moves on the
    // site on purpose: this one covers a lot of ground and a fast version
    // reads as a cut.
    // 400 = brisk, almost a jump
    // 950 = current
    // 2000 = cinematic; you will be waiting for it on the way back
    zoomTime: 950,
    returnTime: 700,

    /* ---- the typewriter ---- */

    // Characters per second. This is the whole feel of the thing: too fast
    // and it may as well have been there already, too slow and you read ahead
    // of it and wait.
    // 18 = deliberate, one word at a time; long for two paragraphs
    // 45 = current — brisk typing, comfortably readable as it lands
    // 200 = it arrives in a rush; the effect barely registers
    typeSpeed: 45,

    // How far into the zoom the typing starts, 0..1. Waiting for the whole
    // zoom leaves a beat of empty page; starting at 0 has text sliding about
    // while the ring is still crossing it.
    // 0.55 = current — the first characters land as the star is settling
    startTyping: 0.55,

    // A block caret at the end of the typed text, while it is still typing.
    // It disappears when the last character lands rather than blinking on
    // forever — a caret left on a finished page reads as an input field.
    caret: true,

    /* ---- the star's pulse under the cursor ----
       Put the pointer on the star and it breathes: a slow swell in and out,
       so the one thing left on the page answers to the cursor and feels like
       an object rather than a printed mark. Only here — the small star in the
       ring still just puffs into its points. */

    // How much it swells, as a fraction of its size. This wants to be small:
    // the star is the anchor the text hangs off, and anything you can
    // measure by eye reads as a wobble rather than as breathing.
    // 0.06 = barely there, more a shimmer than a pulse
    // 0.18 = current
    // 0.5 = it visibly throbs; the text below starts to look loose
    pulse: 0.18,

    // Milliseconds for one breath, out and back.
    // 600 = quick, closer to a heartbeat; reads as urgent
    // 1400 = current — slow, calm, easy to ignore
    // 3000 = so slow you are not sure it is moving
    pulsePeriod: 1400,

    // Milliseconds for the pulse itself to arrive and leave as the cursor
    // comes and goes. The breath always starts from the star's own size, so
    // this is the only thing standing between the cursor and a jump.
    // 80 = snaps into life · 260 current · 900 you have moved on before it does
    pulseFade: 260,

    /* ---- the text block ---- */

    // The text column, centred under the star: as wide as the window allows
    // (less `margin` on each side), up to `columnMax`.
    //
    // Deliberately NOT a fraction of the window. Half the width reads well on
    // a laptop and is a 24-character ribbon on a phone — same words, three
    // times the lines, and the text runs off the bottom of the page. A
    // ceiling plus a margin gives a comfortable measure on a wide screen and
    // uses what it has on a narrow one.
    // columnMax 380 = a narrow, bookish measure
    //           560 = current, around 70 characters at `size` 13
    //           900 = long lines; hard to find the start of the next one
    columnMax: 560,
    margin: 28,

    // Gap between the star and the first line of text, as a fraction of the
    // window's height.
    // 0.05 = tight under it · 0.10 current · 0.22 they stop reading as a pair
    textGap: 0.10,

    // Type size, line spacing and the gap between paragraphs, in pixels. The
    // face is the same Courier as everything else on the page.
    size: 13,
    lineHeight: 24,
    paraGap: 16,

    // >>> PLACEHOLDER COPY <<<
    // Two paragraphs, as asked, so the layout and the typing can be judged.
    // Replace with the real thing — any number of paragraphs works; the block
    // is laid out from whatever is in this array.
    //
    // There is no scrolling on the about page: the block is drawn where it
    // falls. Two paragraphs of about this length clear the bottom of a phone
    // window with room to spare, but if you write six, check a short window
    // before you call it done.
    paragraphs: [
      'Studio Karbon is an architectural practice working between drawing and ' +
      'building. We take on a small number of projects a year and stay on them ' +
      'from the first survey to the last site visit, which is the only way we ' +
      'know how to keep a drawing and a building the same idea.',

      'The work is mostly houses, mostly alterations, mostly on sites that ' +
      'came with something already on them. We are interested in what is ' +
      'already there — the levels, the trees, the wall someone built badly in ' +
      '1974 — and in how little has to change for a place to work properly.',
    ],
  },

});
