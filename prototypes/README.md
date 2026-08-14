# Studio Karbon — prototypes

Each feature lives in its own folder. Each version is two files that belong
together: the page, and its settings.

```
prototypes/
├── horizontal-gallery/
│   ├── horizontal-gallery-v1.0.html
│   └── horizontal-gallery-v1.0.config.js
├── fluid-cursor/
│   ├── fluid-cursor-v1.0.html
│   └── fluid-cursor-v1.0.config.js
├── liquid-glass/
│   ├── liquid-glass-v1.0.html
│   └── liquid-glass-v1.0.config.js
└── logo-torus/
    ├── v1.0/                       solid, shaded, free tumble
    │   ├── logo-torus-v1.0.html
    │   └── logo-torus-v1.0.config.js
    └── v2.0/                       wireframe ring, slice menu, project feed
        ├── logo-torus-v2.0.html
        └── logo-torus-v2.0.config.js
```

**logo-torus keeps each version in its own subfolder.** The others are still
flat, because they only have one version each. Either shape is fine — the rule
that actually matters is that a version's two files stay together.

There is also a loose copy of the v1.0 pair sitting directly in `logo-torus/`,
left over from before the subfolders existed. It is identical to what is in
`v1.0/`, so delete it whenever you feel like it.

Open any `.html` by double-clicking it. Nothing needs building or installing.

---

## The two files always travel together

The `.html` is the feature. The `.config.js` next to it holds every number you
would want to change — sizes, colours, timings, how the physics feels — each
one documented with a safe range and what happens at either end of it.

They find each other by filename, so **they must stay in the same folder** and
their names must match. If you move one without the other, the page shows a
plain message saying which file it couldn't find rather than a blank screen.

## Making a new version

1. Copy **both** files
2. Bump the number in **both** filenames, e.g. `-v1.0` → `-v1.1`
3. Open the new `.html` and update the `<script src="...">` line near the top
   so it points at the new config filename

Then work on the copy. Don't edit an old version in place — the whole point of
the number is that there's always something that worked to go back to.

Rough convention: **v1.0 → v1.1** for tuning and small changes, **v1.0 → v2.0**
when the thing works in a fundamentally different way.

---

## What each one is

**horizontal-gallery** — the site as it currently stands. Endless horizontal
scroll with a momentum fall-off, a sidebar that toggles, paper colours with
generated grain, a dithered cube cursor driven by pointer momentum, and
captions that type themselves out over each image.

**fluid-cursor** — a fluid simulation driven by the pointer, coloured as a
thin oil film. Superseded by liquid-glass, kept because the look is different
rather than worse.

**liquid-glass** — the same underlying fluid, but rendered as a clear
refracting material: it bends the page behind it instead of colouring itself.
The pointer shoves the liquid rather than painting into it, and the effect is
gated on speed, so a slow or stationary pointer leaves the surface alone.

**logo-torus** — the C/D logo. A letter D is drawn as a flat outline and spun
around a vertical axis, so the resulting ring has a D-shaped section all the
way round. A wedge is cut out; one face of the cut reads as a D, the face
opposite reads it mirrored, which is the C.

- **v1.0** — a solid object, shaded with a six-step orange dither, that you
  tumble freely with the cursor. NASA orange on paper.
- **v2.0** — a different idea, not a tune. White page, one orange, no shading
  at all: just edges and a dot. It doubles as the site's menu — press the ring
  and it eases to a top-down view divided into one slice per project, hover a
  slice to fill it with dither and float up its cover, click to open the
  project as a scattered feed.

Both are kept. v2.0 does not replace v1.0 so much as answer a different
question.

---

## A note on the live site

`index.html` and `config.js` in the folder **above** this one are what
cmdlkc.com actually serves. They're a copy of horizontal-gallery v1.0.

Nothing in `prototypes/` is published. When a prototype is ready to go live,
copy it up to the root as `index.html` with its config renamed to `config.js`,
and update the `<script src>` line to match.
