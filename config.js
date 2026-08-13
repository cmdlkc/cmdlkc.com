/* ============================================================================
   STUDIO KARBON — SETTINGS
   ============================================================================

   Every number you're likely to want to change lives in this one file.
   Nothing here is code you need to understand — they're just labelled values.

   HOW TO USE IT
     1. Change a number below.
     2. Save this file.
     3. Refresh the browser.

   Keep config.js in the SAME FOLDER as gallery-scroll.html, or the page
   won't find it.

   Each setting lists a SAFE RANGE and tells you which direction does what.
   You can go outside the ranges — nothing will break — but it'll start
   looking odd rather than just different.

   CONTENTS
     1. Layout            size and spacing of the squares
     2. Scroll & fall-off how the gallery moves and how it slows down
     3. Sidebar           the navigation panel on the left
     4. Paper & grain     background colours and the analogue texture
     5. Cursor cube       the cube that replaces the mouse pointer
     6. Captions          the text that types itself out next to the cursor
   ========================================================================= */

const CONFIG = {

  /* ==========================================================================
     1. LAYOUT — the size and spacing of the squares
     ==========================================================================
     These are in "vh" units. 1vh = 1% of the window's height. Using vh instead
     of pixels means everything scales with the browser window, so the gallery
     looks the same on a laptop and on a big monitor.
     ---------------------------------------------------------------------- */
  layout: {

    // Size of each square, as a percentage of window height.
    // 66.666 is exactly two thirds, which is what the current design uses.
    //   Range 30–90.  40 = small, lots of squares visible at once.
    //                 66 = current. Roughly two squares fit on a laptop screen.
    //                 90 = near full-height, cinematic, one square at a time.
    squareSize: 66.666,

    // Space between squares, same units.
    //   Range 0–15.   0 = squares touch, reads as one continuous filmstrip.
    //                 4 = current. Clearly separate but still a set.
    //                 12 = airy, gallery-wall feeling, more scrolling needed.
    gap: 4,

    // How many placeholder squares are in the set.
    //
    // The gallery loops, so this is the number of DISTINCT squares — the page
    // quietly repeats the set as many times as it needs to fill the screen,
    // which is what lets you scroll forever without ever reaching an end.
    //   Range 2–30.  Keep it high enough that the set is wider than the
    //                screen, or you'll see the same square twice at once.
    //                At the current square size, 4 or more is safe.
    placeholderCount: 6,

    // Fill colour of the empty placeholder squares. Any CSS colour works.
    // A warm off-grey, so it sits with the paper rather than against it.
    //   '#e4ded2' = current.
    placeholderColour: '#e4ded2',

    // What a square fades to while the pointer is over it. Keep this close to
    // `placeholderColour` — the effect should register without announcing
    // itself. A difference of 10–20 points of grey is about right.
    //   '#ded8cb' = barely there, you'd notice it subconsciously.
    //   '#d9d2c4' = current. Clearly a response, still quiet.
    //   '#c9c0ad' = obvious, starts to feel like a button.
    placeholderHoverColour: '#d9d2c4',

    // How long that tint takes to fade in and out, in milliseconds.
    //   Range 80–800.    120 = quick, almost a snap.
    //                    320 = current. Reads as a considered response.
    //                    600 = slow and atmospheric. Lags behind a fast sweep.
    hoverFadeTime: 320
  },


  /* ==========================================================================
     2. SCROLL & FALL-OFF — how the gallery moves
     ==========================================================================
     The strip is treated like a physical object. Your wheel gives it a PUSH,
     and it coasts. There are no ends any more: the set of squares repeats
     seamlessly, so you can keep scrolling in either direction forever.

     With nothing to stop it, the FALL-OFF is what gives the movement shape —
     the way the speed bleeds away after you stop pushing. It's the difference
     between sliding a photograph across a desk and shoving a filing cabinet.
     ---------------------------------------------------------------------- */
  scroll: {

    // How hard one notch of the wheel pushes.
    //   Range 0.05–0.6.  0.10 = heavy, deliberate. You work for it.
    //                    0.20 = current.
    //                    0.45 = twitchy. Small movements fly across the page.
    wheelStrength: 0.20,

    // THE FALL-OFF. This is the fraction of speed KEPT each sixtieth of a
    // second, so bigger numbers mean less friction and a longer coast.
    //
    // (The maths is done from elapsed time rather than from frames, so this
    // behaves identically on a 60Hz laptop and a 165Hz monitor.)
    //   Range 0.80–0.99. 0.88 = stops almost as soon as you do. Curt.
    //                    0.955 = current. A long, unhurried glide — roughly
    //                            two seconds to coast to rest from full speed.
    //                    0.967 = what iOS uses for its scroll views.
    //                    0.985 = drifts for a long time. Starts to feel like
    //                            it isn't listening to you any more.
    fallOff: 0.955,

    // Speed limit, in pixels per sixtieth of a second (so 80 here is roughly
    // 4800 pixels a second). This mostly matters with a free-spinning wheel,
    // where it stops a hard flick turning into a blur.
    //   Range 20–200.    40 = stately, never rushes.
    //                    80 = current.
    //                    150 = fast enough that images blur when flicked.
    maxSpeed: 80,

    // Below this speed the strip is considered stopped and is parked, rather
    // than creeping along at a fraction of a pixel forever.
    //   Range 0.2–8.     1.5 = current. Any lower is imperceptible anyway.
    stopBelow: 1.5
  },


  /* ==========================================================================
     3. SIDEBAR — the navigation panel on the left
     ==========================================================================
     Slides in and out. The gallery makes room for it rather than sliding
     underneath, so nothing is ever hidden behind it.
     ---------------------------------------------------------------------- */
  sidebar: {

    // Start with the sidebar open or closed when the page loads.
    startOpen: true,

    // Width in pixels.
    //   Range 160–400.   200 = tight, more room for images.
    //                    260 = current.
    //                    340 = generous, room for longer section names.
    width: 260,

    // The sections, in order. Add, remove or rename freely — the panel
    // rebuilds itself from this list.
    sections: ['Home', 'About', 'Projects', 'Contact'],

    // Small line of text under the sections. Set to '' to leave it out.
    footer: 'Studio Karbon',

    // Ink colour for the section names.
    //   '#2b2a27' = current. Near-black, but warm enough for paper.
    textColour: '#2b2a27',

    // Section names use the same typewriter face as the captions (see
    // section 6), at this size in pixels.
    //   Range 9–20.      13 = current.
    fontSize: 13,

    // Space between letters, in `em`. Mono type set in caps reads better with
    // a little air in it.
    //   Range 0–0.3.     0.12 = current.
    letterSpacing: 0.12,

    // How long the panel takes to slide open or shut, in milliseconds.
    //   Range 120–900.   240 = brisk.
    //                    420 = current. Unhurried, matches the scrolling.
    //                    700 = slow and stately; starts to feel like waiting.
    slideTime: 420,

    // Hairline down the right-hand edge, separating panel from page.
    borderColour: '#dcd5c7'
  },


  /* ==========================================================================
     4. PAPER & GRAIN — background colours and the analogue texture
     ==========================================================================
     A fine speckle is generated once when the page loads and tiled across the
     backgrounds. It only touches the page and the sidebar — the squares
     themselves stay clean, so photographs won't be muddied by it.
     ---------------------------------------------------------------------- */
  paper: {

    // The main page. The whiter of the two papers.
    //   '#faf7f2' = current. Warm white, like a good cartridge paper.
    //   '#ffffff' = clinical, kills the analogue feel.
    //   '#f5efe4' = noticeably creamy, almost aged.
    background: '#faf7f2',

    // The sidebar. Slightly darker, as though it were a second sheet laid
    // over the first.
    //   '#efe9df' = current. About four steps down from the page.
    sidebar: '#efe9df',

    // ---- The grain ---------------------------------------------------------

    // Switch the texture off entirely.
    grainEnabled: true,

    // How visible the speckle is.
    //   Range 0–0.5.     0.02 = you'd only notice it if it were removed.
    //                    0.055 = current. Reads as paper, not as noise.
    //                    0.15 = heavy, closer to a photocopy or newsprint.
    //                    0.3 = obviously textured, competes with the images.
    grainAmount: 0.055,

    // Size of a single speck in screen pixels. 1 gives the finest possible
    // texture; larger values give a coarser, more printed look.
    //   Range 1–4.       1 = current. Fine film grain.
    //                    2 = coarser, more like a screen print.
    //                    4 = clearly blocky.
    grainScale: 1,

    // Size of the repeating tile in pixels. Bigger tiles hide the repetition
    // better but take marginally longer to generate on load.
    //   Range 64–512.    180 = current. The repeat isn't detectable at the
    //                    grain amounts above.
    grainTile: 180
  },


  /* ==========================================================================
     5. CURSOR CUBE — the cube that replaces the mouse pointer
     ==========================================================================
     Drawn from scratch every frame, and it has two distinct states:

       over the bare page   — outline only, just the edges
       over an image        — the faces fill in with shading

     The shading is a single colour, and gets its light and dark entirely from
     DITHERING: the brighter a face is, the fewer dots get printed on it,
     letting what's underneath show through. Same idea as a newspaper photo.

     The cube has no spin of its own. It turns only because your pointer
     pushes it, and it carries that spin for a moment after you stop — see
     `pointerSensitivity` and `spinFriction` below.
     ---------------------------------------------------------------------- */
  cursor: {

    // Master switch. Set to false to get the normal arrow pointer back.
    enabled: true,

    // The drawing area, in pixels. The cube sits in the middle of it, so this
    // needs to be comfortably bigger than the cube itself.
    //   Range 20–64.     34 = current. Leave this alone unless the cube is
    //                    getting clipped at the corners when it turns.
    canvasSize: 34,

    // The cube's actual size. A standard arrow pointer is around 20px tall,
    // so this is deliberately in the same neighbourhood.
    //   Range 3–12.      4.5 = noticeably smaller than a normal cursor.
    //                    6.2 = current. About 21px across.
    //                    9 = large enough to obscure what you're pointing at.
    //   If you raise this much above 8, raise `canvasSize` too.
    size: 6.2,

    // The colour. Everything is drawn in this one colour and nothing else —
    // the shading comes purely from how densely the dots are packed. The
    // captions and the sidebar's hover state both follow this.
    //   '#002FA7' = International Klein Blue.
    colour: '#002FA7',

    // ---- Rotation: driven entirely by your pointer -------------------------

    // How hard pointer movement twists the cube. Moving sideways swings it
    // around its vertical axis, moving up and down tips it — like spinning a
    // globe with your finger.
    //
    // The twist ADDS to whatever spin the cube already has, so accelerating in
    // one direction keeps winding it further that way, and changing direction
    // has to overcome the spin already there.
    //   Range 0.002–0.05. 0.006 = heavy. Takes a real sweep to get it moving.
    //                     0.016 = current. Responds to ordinary mouse movement.
    //                     0.040 = frantic. Spins up from the smallest twitch.
    pointerSensitivity: 0.016,

    // How much spin is KEPT each frame once you stop pushing. This is the
    // momentum — higher numbers coast for longer.
    //   Range 0.85–0.99. 0.88 = stops almost the moment you do.
    //                    0.955 = current. Coasts about a second after a flick.
    //                    0.99 = keeps turning for many seconds. Starts to feel
    //                           like it isn't listening to you any more.
    spinFriction: 0.955,

    // Speed limit, in radians per second, so a fast mouse sweep can't turn it
    // into an unreadable blur.
    //   Range 1–20.      3 = stays legible even when thrown hard.
    //                    7 = current.
    //                    15 = genuinely a blur at speed.
    maxSpin: 7,

    // ---- Edges -------------------------------------------------------------

    // Draw the cube's edges as solid hairlines. These are always on, including
    // over the bare page where there's no shading — they're what keeps the
    // cube readable as a cube rather than a smudge.
    //   true = current. false = shading only, and it vanishes over the page.
    drawEdges: true,

    // ---- Shading -----------------------------------------------------------
    // The faces are only shaded when the pointer is over one of the images.
    // Over the bare paper the cube is an empty outline.

    // How long the shading takes to fade in and out as you move on and off an
    // image, in milliseconds.
    //   Range 40–1000.   90 = quick, close to a snap.
    //                    260 = current. Clearly a fade, never sluggish.
    //                    700 = slow dissolve; lags noticeably if you sweep
    //                          across the gaps between squares.
    shadeFadeTime: 260,

    // Dot density on the brightest face, where 0 is blank and 1 is solid.
    //   Range 0–0.4.     0 = the lit face disappears entirely.
    //                    0.10 = current. A faint speckle, clearly a surface.
    //                    0.30 = the cube reads as fairly solid all over.
    lightestFace: 0.10,

    // Dot density on the darkest face.
    //   Range 0.5–1.0.   0.70 = soft, low-contrast, quite subtle.
    //                    0.94 = current. Nearly solid, strong contrast.
    //                    1.0 = completely solid, no texture left in the shadow.
    darkestFace: 0.94,

    // Where the light comes from, as a direction. Negative x is left, negative
    // y is up, negative z is toward you (out of the screen).
    // The current values put the light above, to the left, and in front —
    // the conventional position for making a solid object read clearly.
    //   Each value roughly -1 to 1. Only the direction matters, not the size.
    lightDirection: { x: -0.35, y: -0.62, z: -0.70 },

    // Perspective strength. Lower numbers exaggerate it, so the near face
    // looms and the far face shrinks away.
    //   Range 5–40.      6 = strong, almost fish-eye at this size.
    //                    9 = current. A gentle, believable amount.
    //                    30 = essentially flat, like an architect's isometric.
    perspective: 9
  },


  /* ==========================================================================
     6. CAPTIONS — the text that types itself out next to the cursor
     ==========================================================================
     When the pointer moves onto an image, a short description types itself
     out beside it, one character at a time, with a caret that blinks once the
     line is finished. Move to a different image and it starts over.

     The text colour always matches the cube — it's taken from
     `cursor.colour` above, so change it there and both follow.
     ---------------------------------------------------------------------- */
  caption: {

    // Master switch for the captions.
    enabled: true,

    // One line per image, in the same order as the squares. If there are more
    // squares than lines, it starts again from the top — so you can leave this
    // shorter than `placeholderCount` while you're still experimenting.
    //
    // Keep them short. This sits next to a moving cursor, so anything longer
    // than about eight words is finished typing after the pointer has left.
    texts: [
      'Private house — Kent, 2024',
      'Studio extension — Hackney, 2023',
      'Chapel conversion — Norfolk, 2023',
      'Coastal retreat — Pembrokeshire, 2022',
      'Workshop and yard — Margate, 2022',
      'Apartment refit — Lisbon, 2021'
    ],

    // The typeface. A monospaced font is what gives it the typewriter feel —
    // every character is the same width, so the line grows in even steps
    // rather than lurching. The sidebar uses this face too.
    //   "'Courier New', Courier, monospace" = current. The classic typewriter.
    //   "'Consolas', 'SF Mono', monospace"  = a cleaner, more modern terminal.
    //   Always leave `monospace` on the end as a fallback.
    font: "'Courier New', Courier, monospace",

    // Text size in pixels.
    //   Range 9–20.      10 = small print, easy to miss.
    //                    12 = current.
    //                    16 = assertive, competes with the image.
    fontSize: 12,

    // Extra space between letters, in `em` (so it scales with fontSize).
    //   Range 0–0.2.     0 = the font's natural spacing.
    //                    0.04 = current. Slightly opened up, more considered.
    //                    0.15 = wide and architectural, harder to read quickly.
    letterSpacing: 0.04,

    // Widest the caption is allowed to get before it wraps onto a second line.
    //   Range 120–400 px. 240 = current.
    maxWidth: 240,

    // ---- Timing ------------------------------------------------------------

    // Milliseconds per character.
    //   Range 8–120.     15 = very fast, a burst.
    //                    30 = current. Reads as brisk, deliberate typing.
    //                    70 = slow and dramatic; a long caption won't finish
    //                         before the pointer has moved on.
    typeSpeed: 30,

    // How irregular the typing rhythm is, where 0 is metronome-perfect.
    // A little unevenness reads as someone typing; none reads as a machine.
    //   Range 0–0.9.     0 = perfectly even.
    //                    0.45 = current.
    //                    0.8 = hesitant, uneven, almost nervous.
    typeJitter: 0.45,

    // A pause before the first character, in milliseconds. This stops a burst
    // of text firing every time the pointer just brushes past a square on its
    // way somewhere else.
    //   Range 0–500.     0 = starts instantly.
    //                    120 = current.
    //                    350 = only shows up if you actually settle on an image.
    startDelay: 120,

    // How long the whole caption takes to fade in and out.
    //   Range 60–600.    180 = current.
    fadeTime: 180,

    // ---- The caret ---------------------------------------------------------

    // Width of the caret bar in pixels. It's a drawn block rather than a text
    // character, so its weight doesn't change if you change the font.
    //   Range 1–4.       1 = current, a hairline.
    //                    3 = a chunky terminal block.
    caretWidth: 1,

    // One full blink, in milliseconds — on for half of it, off for half.
    // The caret stays solid while the line is typing, and only starts blinking
    // once the caption is complete.
    //   Range 400–1600.  530 = the classic terminal rate, quite urgent.
    //                    1000 = current. Calmer.
    //                    1400 = a slow pulse.
    caretBlinkTime: 1000,

    // ---- Placement ---------------------------------------------------------
    // How far from the pointer the caption sits, in pixels. It flips to the
    // other side automatically near the edges of the window.
    //   offsetX 18, offsetY 12 = current. Clear of the cube, still attached
    //   to it. Raise offsetX if you make the cube bigger.
    offsetX: 18,
    offsetY: 12
  }
};
