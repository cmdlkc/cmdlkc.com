/* ==========================================================================
   STUDIO KARBON — AXONOMETRIC LOGO + CURSOR LENS — TUNABLES
   --------------------------------------------------------------------------
   Loaded by index.html. Both files must sit in the same folder.

   This is the live site, promoted from prototypes/logo-torus/v3.1/ — see
   that folder for the version history and the "what changed" notes below.

   v2.0 is a different animal from v1.0. v1.0 was a solid, shaded object you
   tumbled with the cursor. v2.0 is a WIREFRAME NAVIGATION: white page, orange
   lines, no shading at all until you hover. It is also the site's menu — the
   ring is divided into slices, one per project.

   THE THREE STATES  (a different three from v3.1's — see below)
   1. REST     the ring sits still in axonometric, opening towards you, and it
               IS the menu. Lines only until you point at it: hover a slice and
               it fills with orange dither and its cover floats up somewhere on
               the page. Drag to turn it; let go and it eases back to exactly
               this pose.
   2. PROJECT  press a slice and the logo flies to the top-left corner while
               that project opens as a scattered feed. The parked mark keeps
               the slice you are in lit, so it says which project you are
               looking at, and it is solid rather than see-through, so the
               feed scrolls behind it. Point at the mark and the WHOLE ring
               lights instead — that is it offering to take you back. Press
               it to go.
   3. ABOUT    press the star in the middle and the page zooms into it: the
               ring flies outward past the edges of the window, the star comes
               to rest in the middle of the top half, and the about text types
               itself in underneath. The star breathes under the cursor.
               Section 14. Press anywhere to come back.

   Shading, where it happens at all, works exactly like the cube cursor on the
   main site: ONE colour, and light and dark come from how many dots get
   printed, not from mixing paler oranges.

   v3.1 = v3.0 with the whole-page liquid glass taken back out.

   v3.0 bent the ENTIRE page — logo, menu, feed, everything — through a full
   WebGL fluid simulation. Working, but wrong for this site: too digital, too
   showy, and it fought the flat/analogue paper-and-ink feel everywhere else.
   So the page itself is drawn perfectly plainly again (a straight 2D blit,
   no WebGL, no texture-of-the-whole-page trick) and the only thing left that
   bends anything is a small lens that follows the cursor — `lens.radius`
   sets how big.

   Two consequences worth knowing before you tune anything:
   · The feed scrolls by a number, not by a scrollbar. `motion.scrollEase`.
   · Section 13 (LENS) is a small, self-contained refraction effect confined
     to a circle around the pointer. It is NOT a fluid simulation — there is
     no liquid to push around, no velocity field, nothing to "settle". It
     reads a little patch of the already-drawn page and bends that patch,
     every frame, the same way, wherever the pointer currently is.
   · Set `lens.enabled: false` and you get the flat page with no cursor
     effect at all — useful for telling the two apart when something looks
     wrong, or for judging the page on its own.

   THE LETTERS — D TO D
   · Look into the gap (the resting pose, and the parked corner mark) and you
     see both cut faces at once. They are the SAME complete D section, seen
     mirrored: the profile is laid out radially, so the bowl always sits at
     the larger radius and therefore bulges left on the left-hand face and
     right on the right-hand face. A D and its mirror, facing each other
     across the opening.
   · Both faces are whole. Neither is opened up, cut back, or printed at a
     different density from the other — `shade.capFaces` is the one setting
     and it applies to both. There is no knob for treating them differently,
     by design.
   · Leaving the spine off one face to open it into a C has been tried and
     reverted: it punches a hole in the ring's surface and breaks the closed
     letterform outline. If the pair should read as something else, change
     the PROFILE (buildProfile in index.html) so the section itself is that
     shape — don't delete quads from one cap.

   WHAT CHANGED FROM v3.1 — read this first, several settings are GONE
   · NOTHING MOVES ON ITS OWN. The idle spin is gone, and so is the throw:
     `motion.idleSpin`, `pauseSpinOnHover`, `friction`, `stopBelow`,
     `flickSmoothing` and `maxSpeed` have all been deleted rather than set to
     zero, because there is no longer any code behind them. Dragging still
     turns the ring freely (`motion.sensitivity`); the moment you let go it
     eases back to the resting pose over `motion.returnTime`. A drag is a look
     at the object, not a new orientation for it.
   · The resting pose is now FIXED and faces you: the ring's opening points at
     the camera, so both cut faces — the D and its mirror — are legible
     without touching anything. `view.restTurn` turns it off that, the same
     way `view.cornerTurn` does for the parked corner mark.
   · THE SECOND PAGE IS GONE. There is no top-down menu state any more, and
     with it went `view.sizeTop`, `view.tiltTop` and `view.topOpenAt`. You
     hover and press slices directly in the resting view — one press to open a
     project instead of two.
   · The centre dot no longer opens the menu, because there is no menu. It is
     the ABOUT page now: press the star and the page zooms into it. Everything
     about that is in the new section 14, plus `view.sizeAbout`.

   WHAT CHANGED FROM v3.0
   · The full-page liquid glass is gone. See `lens` (section 13) for what
     replaced it.
   · The two cut faces (`shade.capFaces`) print noticeably denser — 0.85, up
     from 0.55 — AND no longer run through the lighting term at all. They
     used to fade in and out with which way the light was catching them as
     the ring turned, so the C would go dark and legible while the D (its
     mirror) washed out almost to nothing, or the other way round depending
     on orientation. Letterforms need a constant weight regardless of
     orientation, so the caps are flat ink now: always exactly `capFaces`
     dense (or denser, under hover), on both faces, always.

   WHAT CHANGED FROM v2.2 (carried forward from v2.3/v3.0)
   · The two faces of the cut are now always shaded (`shade.capFaces`). That
     is what makes the pair read as C and D — as bare outlines they were just
     more lines among lines. The geometry is unchanged: both faces are still
     the same D section, one seen mirrored.
   · Hovering a slice does nothing until you have opened the menu. In the
     resting state the ring is an object, not a row of buttons.
   · The hover star is back to its v2.1 size, and the diagonal rays are much
     fainter.

   WHAT CHANGED FROM v2.1
   · The gap is now measured in WHOLE SLICES (`ring.notchSlices`), not in
     degrees. `ring.notch` is gone. Two slices' worth are missing, so the
     top-down view reads as a C.
   · The menu always opens with the gap in the same place — `view.topOpenAt`,
     pointing right by default. It no longer lands wherever it happened to be.
   · The parked corner logo holds still with its gap turned towards you, and
     sits ABOVE the project feed rather than under it.
   · The hover star grew a set of thin diagonal rays (`dot.diagonal`).

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

/* CONFIG is assembled from the numbered section files that load after this
   one â€” config/01-colour.js through config/14-about.js â€” each of which adds
   its own section to it with Object.assign. They are independent: you can
   edit any one of them without touching, or even opening, the others.
   index.html lists them in order and js/boot.js checks that each one
   arrived, so a NEW section means a new file plus a line in both places. */
const CONFIG = {};
