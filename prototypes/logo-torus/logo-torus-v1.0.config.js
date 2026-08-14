/* ==========================================================================
   STUDIO KARBON — AXONOMETRIC LOGO  v1.0  — TUNABLES
   --------------------------------------------------------------------------
   Loaded by logo-torus-v1.0.html. Both files must sit in the same folder.

   WHAT THE THING IS, in plain English:
   The letter D is drawn as a flat outline (a "profile"). That profile is then
   spun around a vertical axis to sweep out a solid — like a potter's wheel.
   Because the profile is a D, the resulting doughnut has a D-shaped section
   everywhere. A wedge is then removed. The two faces of that cut are flat, and
   on them you see the D. Seen from the other side of the notch the same face
   reads mirrored — which is your C.

   HOW TO EDIT: change a number, save, refresh the browser. Nothing else.
   Every entry below says what happens if you go LOW, what it is NOW, and what
   happens if you go HIGH.
   ========================================================================== */

const CONFIG = {

  /* ------------------------------------------------------------------------
     1. THE LETTERFORM
     The D profile, drawn in a little coordinate box. x = 0 is the flat spine
     (the "extra line" that makes a D a D), x = width is the fat side of the
     bowl. y = 0 is the bottom, y = height is the top.
     --------------------------------------------------------------------- */
  letter: {

    // Overall height of the D. Everything else is measured against this, so
    // treat it as the master unit and leave it at 1. Changing it just makes
    // all the other numbers below mean something different.
    height: 1.00,

    // How wide the D is, as a multiple of its height.
    // 0.55 = narrow, condensed, quite elegant
    // 0.72 = current — a squarish, architectural D
    // 0.95 = wide and squat
    width: 0.72,

    // Thickness of the D's strokes — the spine and the bowl.
    // Must stay below BOTH (width * bowl) and (height / 2), or the counter
    // (the hole in the middle of the D) collapses and the shape goes solid.
    // 0.10 = hairline, very fine, the counter dominates
    // 0.20 = current — reads clearly at small sizes
    // 0.30 = heavy slab; counter nearly closed at width 0.72
    stroke: 0.20,

    // How much of the width is taken up by the round bowl, 0..1.
    // The remainder is a straight run of top and bottom before the curve
    // starts. Keep it below 1.0 or the flat top/bottom edges vanish.
    // 0.40 = long flat top and bottom, the D looks almost rectangular
    // 0.62 = current — a proper D
    // 0.95 = the bowl starts immediately; reads more like a fat lowercase o
    bowl: 0.62,

    // Number of straight segments used to draw the curved part of the bowl.
    // Purely a quality/speed dial. The shading is smoothed, so low values
    // show up as a faceted SILHOUETTE rather than banded shading.
    // 8  = visibly polygonal outline
    // 22 = current — smooth at logo size
    // 48 = smoother, ~2x the triangles, no visible gain
    arcSteps: 22,

    // Segments used on each of the three straight edges. Straight is straight,
    // so 1 is mathematically sufficient — this only exists in case you later
    // want to bend those edges.
    // 1 = current. Higher just costs triangles.
    edgeSteps: 1,

    // false = spine faces the middle of the ring, bowl bulges outward, so the
    //         doughnut's outside is round. This is the current setting.
    // true  = flipped; the outside of the ring becomes the flat spine and the
    //         hole becomes round. Reads harder / more mechanical.
    flip: false,
  },

  /* ------------------------------------------------------------------------
     2. THE REVOLVE — turning the D into a ring, and cutting the notch
     --------------------------------------------------------------------- */
  ring: {

    // Distance from the spin axis out to the centre of the D, in the same
    // units as letter.height. This sets how big the hole in the doughnut is.
    // MUST be greater than letter.width / 2 or the shape turns inside out.
    // 0.50 = hole almost closed, reads as a solid disc
    // 0.85 = current — a clear ring, hole about the width of a stroke
    // 1.60 = thin bracelet, the D section becomes a small detail
    radius: 0.85,

    // Size of the wedge cut out, in degrees.
    // THIS IS THE ONE THAT DECIDES WHETHER YOU CAN READ THE LETTER.
    // The cut face is a flat plane pointing sideways, so a narrow notch shows
    // it almost edge-on and the D disappears. Measured on screen:
    // 30 = the letter is not legible at all — you see a sliver of the face
    // 45 = borderline; the counter is visible but the D is ambiguous
    // 60 = current — the D reads cleanly and it still looks like a notch
    // 90 = a quarter gone; letter very clear, but now it reads as a C first
    notch: 60,

    // Where the notch sits, in degrees around the ring, before the whole logo
    // is tilted into its axonometric pose. Rotating this moves the opening
    // around the doughnut so you can aim it at the viewer.
    // 0 = notch on the +X side (right), 90 = far side, 180 = left, 270 = near
    // 75 = current. This is not arbitrary: it puts the cut face at the point
    //      on the ring where it turns most directly towards the camera in the
    //      home pose, which is what makes the D readable. If you change
    //      `notch`, keep this at (45 + notch/2) to preserve that.
    notchAt: 75,

    // Segments around the full revolve. Same story as arcSteps: it shows up in
    // the silhouette, not the shading. This is the single biggest cost driver.
    // 24  = clearly polygonal ring
    // 72  = current — smooth, ~7k triangles, comfortable 60fps
    // 160 = smoother silhouette, ~2x cost
    steps: 72,

    // Angle in degrees above which a joint in the profile counts as a sharp
    // CREASE rather than a smooth curve. Below the threshold the shading is
    // blended across the joint; above it, a hard edge is kept.
    // 10 = almost everything creases; the bowl looks faceted
    // 35 = current — bowl stays smooth, the D's square corners stay sharp
    // 80 = almost nothing creases; the corners go soft and mushy
    creaseAngle: 35,
  },

  /* ------------------------------------------------------------------------
     3. VIEW — the axonometric pose and how big it sits on the page
     There is NO perspective anywhere in this file. Parallel lines stay
     parallel, which is what makes it axonometric rather than a photograph.
     --------------------------------------------------------------------- */
  view: {

    // Size of the logo on screen, in CSS pixels (it is always square).
    size: 560,

    // How many screen pixels one rendered pixel occupies. This is what gives
    // the hard, aliased, no-anti-aliasing look — the picture is rendered small
    // and then blown up with no smoothing.
    // 1 = smooth and modern, the dithering becomes almost invisible
    // 2 = current — dither pattern clearly legible, still detailed
    // 4 = chunky and very pixel-art; the D gets hard to read
    pixelSize: 2,

    // The two angles that define the axonometric projection, in degrees.
    // 45 / 35.264 is TRUE ISOMETRIC — the three axes are equally foreshortened.
    // 45 / 30      is the "game" isometric look, slightly flatter.
    // 30 / 20      is a shallow, more elevation-like view.
    spinY: 45,      // turn about the vertical axis
    tiltX: 35.264,  // tip towards the viewer. 0 = dead-on side elevation,
                    // 90 = looking straight down on the ring (a flat annulus)
                    // Worth trying: tiltX 60 with spinY 45. It stops being
                    // true isometric, but the ring opens up and the whole
                    // silhouette reads as a C far more strongly, with the D
                    // still legible on the cut face. Currently my favourite.

    // Overall size multiplier after the auto-fit. The logo is automatically
    // scaled so it can spin to any angle without clipping, then multiplied by
    // this. Above about 1.15 the corners will clip during a spin.
    // 0.80 = lots of air around it
    // 1.00 = current
    // 1.15 = tight crop, may just touch the frame
    zoom: 1.00,
  },

  /* ------------------------------------------------------------------------
     4. COLOUR
     --------------------------------------------------------------------- */
  colour: {

    // NASA Orange. #FC3D21 is the "worm" logotype red-orange.
    // Alternatives you may want to try:
    //   '#FF4F00' International Orange (brighter, more signal-y)
    //   '#BA160C' Safety red-orange (deeper, more oxide)
    base: '#FC3D21',

    // The darkest and lightest ends of the shading ramp. These are what the
    // dithering mixes between. Keeping the shadow warm (not grey) is what
    // stops it looking like a plastic render.
    shadow: '#4A0D06',      // deep burnt end. Lighten for a softer object.
    highlight: '#FFD9C2',   // near-white warm end.

    // Page behind the logo. Matches the site's paper.
    paper: '#faf7f2',

    // Colour of the 1px outline drawn around the silhouette and creases.
    ink: '#2A0703',

    // How many steps in the shading ramp, INCLUDING both ends.
    // The dithering mixes between neighbouring steps, so the apparent number
    // of tones is roughly double this.
    // 3 = brutal, poster-like, very few tones
    // 6 = current — reads as shaded but obviously dithered
    // 12 = nearly continuous; the dithering stops being a feature
    levels: 6,

    // Where the base orange sits along the ramp from shadow(0) to highlight(1).
    // 0.35 = the object reads dark and saturated
    // 0.55 = current
    // 0.75 = the object reads pale and washed out
    baseAt: 0.55,
  },

  /* ------------------------------------------------------------------------
     5. LIGHTING
     The light is fixed to the SCREEN, not to the object — like a lamp in a
     studio. Spin the logo and the light stays put, which is what makes the
     rotation readable.
     --------------------------------------------------------------------- */
  light: {

    // Direction the light comes FROM, in screen space.
    // x: -1 = from the left, +1 = from the right
    // y: -1 = from below,    +1 = from above
    // z:  0 = grazing from the side, +1 = straight down the camera (flat)
    dir: { x: -0.45, y: 0.70, z: 0.55 },

    // How much light everything gets regardless of which way it faces. This is
    // the floor of the shading — nothing goes darker than this.
    // 0.05 = shadow sides go nearly black, very dramatic
    // 0.22 = current
    // 0.60 = flat and washed out, the form stops reading
    ambient: 0.22,

    // Strength of the directional light on top of the ambient.
    // 0.30 = subtle
    // 0.72 = current
    // 1.10 = the lit side blows out to the highlight colour
    diffuse: 0.72,

    // A thin bright edge where the surface turns away from you — reads as a
    // glancing highlight and helps the silhouette pop off the paper.
    // 0.00 = off
    // 0.28 = current
    // 0.80 = a hot halo, starts looking like a video game
    rim: 0.28,

    // How tightly the rim hugs the edge.
    // 1 = a broad wash across the whole object
    // 3 = current
    // 8 = a razor-thin line right at the silhouette
    rimTightness: 3,
  },

  /* ------------------------------------------------------------------------
     6. DITHERING
     Ordered (Bayer) dithering. The pattern is fixed to the SCREEN, so it does
     not swim around as the object rotates — the object appears to move
     through a static halftone, which is the intended effect.
     --------------------------------------------------------------------- */
  dither: {

    // Size of the Bayer tile: 2, 4 or 8. Bigger = finer, more gradual
    // gradients but a busier texture.
    // 2 = coarse, obviously chequered
    // 8 = current — classic newsprint/halftone feel
    matrix: 8,

    // How strongly the dithering is applied, 0..1.
    // 0.0 = no dithering; you get hard bands between the ramp steps
    // 1.0 = current — full dithering, smooth blends
    amount: 1.0,
  },

  /* ------------------------------------------------------------------------
     7. OUTLINES
     Drawn after shading by looking for jumps in depth and in surface angle —
     the same way a technical drawing picks out an edge.
     --------------------------------------------------------------------- */
  edges: {

    // Draw the outer silhouette against the paper.
    silhouette: true,

    // Draw lines where one surface passes in front of another — this is what
    // outlines the notch opening. Value is a distance threshold as a fraction
    // of the logo's radius.
    // 0     = off
    // 0.035 = current
    // 0.15  = only the most extreme overlaps get a line
    depth: 0.035,

    // Draw lines along sharp folds in the surface, e.g. where the flat cut
    // face meets the round outside. Value is an angle in degrees.
    // 0  = off
    // 42 = current — catches the cut faces and the D's corners
    // 80 = almost nothing qualifies
    crease: 42,
  },

  /* ------------------------------------------------------------------------
     8. SPIN — how it feels under the cursor
     Nothing here moves on its own. The logo is dead still until you drag it,
     and coasts to a stop when you let go.
     --------------------------------------------------------------------- */
  spin: {

    // Degrees of rotation per pixel of cursor movement.
    // 0.15 = heavy, feels like a big object
    // 0.42 = current — 1:1-ish, the surface follows the cursor
    // 0.90 = twitchy, hard to aim
    sensitivity: 0.42,

    // How much of the spin survives each 60th of a second after you let go.
    // This is applied per second of real time, so it feels identical on a
    // 60Hz and a 240Hz monitor.
    // 0.90  = stops almost immediately, one flick barely turns it
    // 0.965 = current — a couple of seconds of coast
    // 0.995 = spins for ~20 seconds; starts to feel like it is animating
    friction: 0.965,

    // Anything slower than this (degrees per second) is snapped to a dead
    // stop, so it does not creep imperceptibly forever.
    // 0.5 = current. Raise it if you see it crawling.
    stopBelow: 0.5,

    // Ceiling on how fast a flick can throw it, degrees per second.
    // 200  = calm, hard to spin fast
    // 900  = current
    // 3000 = a hard flick becomes a blur
    maxSpeed: 900,

    // How much of the previous frame's cursor velocity is carried forward when
    // measuring a flick. Smooths out jittery mice so the throw matches what
    // your hand did rather than the last single event.
    // 0.0 = raw, jumpy throws
    // 0.6 = current
    // 0.9 = very smoothed; throws feel delayed
    flickSmoothing: 0.6,
  },

  /* ------------------------------------------------------------------------
     9. DEBUG
     --------------------------------------------------------------------- */
  debug: {
    // Show frames-per-second and triangle count in the corner.
    stats: false,
  },
};
