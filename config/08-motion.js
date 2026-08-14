"use strict";

Object.assign(CONFIG, {

  /* ------------------------------------------------------------------------
     8. MOTION
     --------------------------------------------------------------------- */
  motion: {

    /* NOTHING HERE MOVES ON ITS OWN. The ring holds its resting pose until
       you drag it, and goes back to that same pose when you let go — the only
       unattended motion left on the page is the return, and the flights to
       and from the corner when a project opens.

       Gone with the idle spin and the throw, in case you go looking for them:
       `idleSpin`, `pauseSpinOnHover`, `friction`, `stopBelow`,
       `flickSmoothing`, `maxSpeed`. Deleted rather than zeroed — there is no
       code left behind any of them. */

    // Degrees of turn per pixel of drag, in ANY direction — sideways drag
    // turns it about the screen's vertical axis, up-and-down about the
    // horizontal one, and a diagonal does both at once. The ring follows your
    // hand exactly while you hold it; it does not carry on afterwards.
    // 0.15 heavy · 0.42 current · 0.90 twitchy
    sensitivity: 0.42,

    // Milliseconds for the ring to ease back to its resting pose after you
    // let go of a drag. Eased at both ends, never linear, and it always takes
    // the short way round however far you turned it.
    // 160 = it springs back almost as fast as you release; feels rubbery
    // 520 = current — unhurried, clearly a return rather than a snap
    // 1200 = slow and deliberate; you will out-run it starting a second drag
    returnTime: 520,

    // How far the pointer may move, in pixels, and still count as a PRESS
    // rather than a DRAG. A press on a slice opens that project; a drag turns
    // the ring and opens nothing.
    // 3  = strict, a shaky hand turns presses into drags
    // 6  = current
    // 20 = forgiving, but small deliberate nudges get eaten
    clickSlop: 6,

    // Milliseconds for the logo to come back to the middle of the page when a
    // project closes. Eased at both ends, never linear.
    // 200 = abrupt · 620 current · 1400 slow and cinematic
    snapTime: 620,

    // Milliseconds for the logo to fly to the corner when a project opens,
    // and for the feed to arrive behind it.
    openTime: 720,
  },

});
