/* ==========================================================================
   STUDIO KARBON — AXONOMETRIC LOGO  v2.1  — TUNABLES
   --------------------------------------------------------------------------
   Loaded by logo-torus-v2.1.html. Both files must sit in the same folder.

   v2.0 is a different animal from v1.0. v1.0 was a solid, shaded object you
   tumbled with the cursor. v2.0 is a WIREFRAME NAVIGATION: white page, orange
   lines, no shading at all until you hover. It is also the site's menu — the
   ring is divided into slices, one per project.

   THE THREE STATES
   1. SPIN     the ring turns slowly in axonometric. Lines only.
   2. TOP      press it and it eases to a top-down view, showing the slices.
               Press the middle again to go back to spinning.
   3. PROJECT  hover a slice and it fills with orange dither and its cover
               floats up somewhere on the page. Click and the logo flies to
               the top-left corner while the project opens as a scattered feed.

   Shading, where it happens at all, works exactly like the cube cursor on the
   main site: ONE colour, and light and dark come from how many dots get
   printed, not from mixing paler oranges.

   WHAT CHANGED FROM v2.0 — read this before hunting for a setting
   · Dragging now tumbles it in EVERY direction, not just side to side. The
     idle spin still turns it about the ring's own axle as before.
   · The slice divider lines are gone until you hover. `lines.dividers` is now
     an on/off for "can dividers appear at all"; the OLD
     `lines.dividersWhileSpinning` no longer exists, because hovering works in
     both the resting state and the menu now.
   · `view.yawTop` is gone. The snap keeps whatever turn the ring is already
     at instead of unwinding to a fixed angle, so there was nothing to set.
   · The centre dot is hidden when the ring is in front of it, and puffs into
     a star under the cursor. Its whole section (5) is new.
   · Project previews now work in the resting spinning state too. Pressing a
     slice there still opens the MENU first, exactly as before — you never
     jump straight into a project from the spin.

   HOW TO EDIT: change a number, save, refresh. Every entry says what happens
   LOW, what it is NOW, and what happens HIGH.
   ========================================================================== */

const CONFIG = {

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

  /* ------------------------------------------------------------------------
     3. THE RING AND ITS SLICES
     --------------------------------------------------------------------- */
  ring: {

    // Distance from the spin axis to the middle of the D. Must exceed
    // letter.width / 2 or the shape turns inside out.
    // 0.50 hole almost closed · 0.85 current · 1.60 thin bracelet
    radius: 0.85,

    // Size of the missing wedge, in degrees. In v1.0 this had to be wide
    // enough to read the letter head-on. In v2.0 the top-down view does that
    // job instead, so it can afford to be tighter and more graphic.
    // 30 = a saw-kerf; the letter is invisible but the C is crisp
    // 45 = current — reads as a deliberate gap, letter legible from the side
    // 90 = a quarter gone
    notch: 45,

    // Where the gap sits around the ring, in degrees, in the resting pose.
    // 90 = current. In the top-down view this puts the gap towards the top
    // left, which is where your sketch has it.
    notchAt: 90,

    // Revolve segments. This is rounded to a whole multiple of the number of
    // slices so the divider lines land exactly on slice boundaries.
    // 24 clearly polygonal · 84 current · 168 smoother, ~2x the cost
    steps: 84,

    // Above this angle a joint in the profile is a hard crease rather than a
    // smooth curve. 10 = everything facets · 35 current · 80 all goes soft
    creaseAngle: 35,
  },

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
    // in the resting (spinning) state.
    // 0.18 = small and logo-like · 0.30 current · 0.44 fills the window
    size: 0.30,

    // Same, but for the top-down menu state. Bigger, because you have to be
    // able to aim at individual slices.
    sizeTop: 0.38,

    // Same again, once a project is open and the logo has parked itself in
    // the top-left corner. Below about 0.07 the wireframe stops being
    // legible and reads as a scribble — the interior lines are only one
    // pixel wide and there is nowhere for them to go.
    // 0.07 = the smallest that still reads
    // 0.095 = current
    // 0.16 = a big corner mark; starts competing with the project title
    sizeCorner: 0.095,

    // Where the parked logo sits, as a fraction of the window.
    cornerX: 0.085,
    cornerY: 0.10,

    // The two axonometric angles, in degrees. 35.264 is TRUE ISOMETRIC.
    // tiltRest 0 = dead-on side elevation, 90 = straight down on the ring.
    tiltRest: 35.264,
    tiltTop: 90,        // the snapped menu view. 90 is exactly overhead.
                        // 78 keeps a little thickness visible, which some
                        // people find easier to read. Try it.

    // (v2.0 had a `yawTop` here. Gone: the snap now keeps whatever turn the
    // ring is already at and only changes the tilt, so it tips up rather than
    // also unwinding a spin it never needed to undo.)
  },

  /* ------------------------------------------------------------------------
     5. THE CENTRE DOT
     --------------------------------------------------------------------- */
  dot: {
    show: true,

    // Radius at rest, in rendered pixels (so it doubles on screen at
    // pixelSize 2).
    // 1 = a single speck · 3 current · 8 a bold full stop
    radius: 3,

    /* >>> READ THIS ONE — the two things you asked for pull against each other
       The dot is now depth-tested against the ring, so it genuinely goes
       BEHIND it rather than floating on top. That is what you asked for. But
       the dot sits on the ring's AXIS, dead centre, and at the resting tilt
       the near side of the tube passes right across that point — so most of
       the time it is legitimately hidden.

       Measured, sampling 24 angles through a full turn:

         tiltRest 35.264, ring.radius 0.85   visible 13% of the turn  <- NOW
         tiltRest 50,     ring.radius 0.85   visible 100%
         tiltRest 35.264, ring.radius 1.10   visible 100%

       So in the resting spin you currently only glimpse it as the notch goes
       past. In the top-down menu it is always there, because the hole is wide
       open from that angle.

       Two one-number fixes if you want it visible throughout:
         · view.tiltRest to 50 or more — tips it further over, but it stops
           being true isometric
         · ring.radius to 1.10 or more — opens the hole up, but makes the logo
           a thinner bracelet

       The threshold for any other values: the middle clears when
           ring.radius - letter.width/2  >  (letter.height/2) / tan(tiltRest)

       Left as-is rather than reshape your logo without asking. Your call. */

    // --- the star, under the cursor ---

    // How much the solid body of the dot swells on hover, as a fraction of
    // `radius`. This is the "slightly" part.
    // 0.0 = the body stays put and only the points grow
    // 0.35 = current
    // 1.2 = it visibly balloons; stops feeling like a precise target
    grow: 0.35,

    // How far the points reach, as a multiple of `radius`.
    // 1.6 = a barely-there nick in the outline
    // 3.2 = current — clearly a star, still small
    // 7.0 = a big sparkle; starts covering the middle of the ring
    spike: 3.2,

    // Number of points. 4 reads as a technical-drawing centre mark, which is
    // why it is the default. 5 reads as a star, 6 as a snowflake, 8 as a
    // compass rose.
    points: 4,

    // How sharp the points are. This is an exponent, so it bites hard.
    // 1.2 = fat blobby lobes; at this size it reads as a plus sign, not a star
    // 3.2 = current — clean tapered points
    // 6.0 = needle-thin spikes with almost nothing between them
    sharpness: 3.2,

    // How close the cursor has to get, in SCREEN pixels, before the dot
    // reacts. Deliberately larger than the dot itself — a 6px target you have
    // to hit exactly is annoying, and this is a real button: pressing it
    // opens the menu, and pressing it again lets the ring go back to
    // spinning.
    // 8  = you have to be almost exactly on it
    // 18 = current
    // 40 = it reacts from most of the middle of the ring
    hitRadius: 18,

    // Milliseconds for the star to open and close.
    // 60 = snappy, almost a pop
    // 170 = current
    // 500 = slow bloom; you out-run it moving the cursor away
    fadeTime: 170,
  },

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

    // (v2.0 had `dividersWhileSpinning` here. Gone: hovering now works in the
    // resting state as well as in the menu, so there is no longer a state in
    // which the question makes sense.)
  },

  /* ------------------------------------------------------------------------
     7. HOVER SHADING
     This is the cube cursor's model, deliberately: ONE colour, and tone comes
     from how many dots get printed. A lit face prints few dots; a face in
     shadow prints many. Nothing is ever a paler orange.
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

    // Bayer tile size: 2, 4 or 8. The grid is fixed to the SCREEN, so the
    // object turns underneath the dots and they stay put.
    // 2 = coarse and obviously chequered · 8 current — newsprint halftone
    matrix: 8,
  },

  /* ------------------------------------------------------------------------
     8. MOTION
     --------------------------------------------------------------------- */
  motion: {

    // NOTE: this is the one place something moves without you. You asked for
    // it ("the torus spins"), so it is on — but it is the exact thing you had
    // me remove from the cube cursor, so it gets its own switch. Set to 0 and
    // the ring is dead still until you drag it.
    // Degrees per second.
    // 0  = off, user-driven only
    // 12 = current — about 30 seconds for a full turn, slow enough to ignore
    // 60 = brisk; starts to demand attention
    idleSpin: 12,

    // Hold the idle spin still while the cursor is on a slice or on the dot.
    // Without this the ring keeps turning under a stationary cursor, so the
    // highlight jumps from slice to slice on its own and the preview cards
    // pop around the page while you are trying to read one.
    // true = current
    pauseSpinOnHover: true,

    // Degrees of turn per pixel of drag, in ANY direction — sideways drag
    // turns it about the screen's vertical axis, up-and-down about the
    // horizontal one, and a diagonal does both at once. Dragging always beats
    // the idle spin; let go and the idle spin creeps back in as your throw
    // dies away.
    // 0.15 heavy · 0.42 current · 0.90 twitchy
    sensitivity: 0.42,

    // How much of a throw survives each 60th of a second. Applied per second
    // of real time, so it feels identical at 60Hz and at 240Hz.
    // 0.90 stops at once · 0.965 current · 0.995 coasts ~20s
    friction: 0.965,

    // Below this speed (degrees/sec) a throw is snapped to nothing.
    stopBelow: 0.5,

    // How much of the previous frame's drag is carried forward when measuring
    // a flick, 0..0.95. Smooths out a jittery mouse so the throw matches what
    // your hand did rather than the last single event.
    // 0.0 raw and jumpy · 0.6 current · 0.9 throws feel delayed
    flickSmoothing: 0.6,

    // Ceiling on a flick, degrees per second.
    maxSpeed: 900,

    // How far the pointer may move, in pixels, and still count as a PRESS
    // rather than a DRAG. Presses change state; drags spin the ring.
    // 3  = strict, a shaky hand turns presses into drags
    // 6  = current
    // 20 = forgiving, but small deliberate nudges get eaten
    clickSlop: 6,

    // Milliseconds for the snap between the spinning pose and the top-down
    // menu. Eased at both ends, never linear.
    // 200 = abrupt · 620 current · 1400 slow and cinematic
    snapTime: 620,

    // Milliseconds for the logo to fly to the corner when a project opens,
    // and for the feed to arrive behind it.
    openTime: 720,
  },

  /* ------------------------------------------------------------------------
     9. THE PROJECTS
     One slice per entry, in order around the ring. Add or remove entries and
     the ring re-divides itself — nothing else needs touching.

     `cover` and the image entries in `feed` are file paths, relative to this
     folder. Leave them empty and you get a labelled placeholder block, which
     is what you will see until you drop real images in.
     --------------------------------------------------------------------- */
  projects: [
    { title: 'In the Weeds',   year: '2025', cover: '',
      blurb: 'Timber frame, reclaimed brick, and a roof that had opinions.',
      feed: [
        { type: 'image', src: '', ratio: 1.40 },
        { type: 'text',  body: 'The site came with a hedge nobody had cut in nine years. We kept it.' },
        { type: 'image', src: '', ratio: 0.75 },
        { type: 'image', src: '', ratio: 1.00 },
        { type: 'text',  body: 'Drawing set, 1:50. Everything else was decided on site.' },
        { type: 'image', src: '', ratio: 1.60 },
      ] },

    { title: '4-Chambers',     year: '2025', cover: '',
      blurb: 'Four rooms that refuse to agree on a floor level.',
      feed: [
        { type: 'image', src: '', ratio: 0.80 },
        { type: 'text',  body: 'Each chamber is a half-storey off its neighbour. The stair is the building.' },
        { type: 'image', src: '', ratio: 1.50 },
        { type: 'image', src: '', ratio: 1.00 },
      ] },

    { title: 'Iteration',      year: '2024', cover: '',
      blurb: 'The same plan, drawn forty times, until it stopped changing.',
      feed: [
        { type: 'image', src: '', ratio: 1.30 },
        { type: 'image', src: '', ratio: 1.30 },
        { type: 'text',  body: 'Iterations 1 through 40. The one that got built is number 31.' },
        { type: 'image', src: '', ratio: 0.70 },
      ] },

    { title: 'Ground Truth',   year: '2024', cover: '',
      blurb: 'A survey that turned into a building.',
      feed: [
        { type: 'image', src: '', ratio: 1.70 },
        { type: 'text',  body: 'Every level was taken twice. They disagreed by 40mm and we never found out why.' },
        { type: 'image', src: '', ratio: 0.85 },
      ] },

    { title: 'Soft Structure', year: '2023', cover: '',
      blurb: 'Load-bearing fabric, tested to destruction, twice.',
      feed: [
        { type: 'image', src: '', ratio: 1.00 },
        { type: 'image', src: '', ratio: 1.20 },
        { type: 'text',  body: 'It failed at 1.8kN. Then, reinforced, at 6.2kN. The second failure was prettier.' },
      ] },

    { title: 'Nine Openings',  year: '2023', cover: '',
      blurb: 'One wall, nine windows, no two the same size.',
      feed: [
        { type: 'image', src: '', ratio: 0.65 },
        { type: 'image', src: '', ratio: 1.45 },
        { type: 'text',  body: 'The sizes come from what the neighbours could see in. Nothing else.' },
      ] },

    { title: 'About',          year: '',     cover: '',
      blurb: 'Studio Karbon. Architecture, drawings, and the occasional building.',
      feed: [
        { type: 'text',  body: 'Studio Karbon is an architectural practice. We draw carefully and build slowly.' },
        { type: 'image', src: '', ratio: 1.00 },
        { type: 'text',  body: 'cem@dilekci.com' },
      ] },
  ],

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

  /* ------------------------------------------------------------------------
     12. DEBUG
     --------------------------------------------------------------------- */
  debug: {
    stats: false,        // fps / triangle count in the corner
    showSliceIds: false, // paint each slice a different tone — useful if the
                         // divider lines ever look like they are in the wrong
                         // place
  },
};
