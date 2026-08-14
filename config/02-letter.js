"use strict";

Object.assign(CONFIG, {

  /* ------------------------------------------------------------------------
     2. THE LETTERFORM
     The D profile that gets revolved. Unchanged from v1.0 — see that file's
     comments if you want the long version.
     --------------------------------------------------------------------- */
  letter: {
    height: 1.00,      // master unit; leave at 1
    width: 0.72,       // 0.55 narrow · 0.72 current · 0.95 wide and squat
    stroke: 0.20,      // must stay under (width*bowl) AND under height/2
    bowl: 0.62,        // 0.40 nearly rectangular · 0.62 current · 0.95 round
    arcSteps: 22,      // 8 polygonal · 22 current · 48 no visible gain
    edgeSteps: 1,      // straight is straight; 1 is enough
    flip: false,       // true puts the D's flat spine on the OUTSIDE
  },

});
