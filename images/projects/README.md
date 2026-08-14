# Project images

One folder per project, matching the `folder` field on that project in
`config.js`. Drop images straight in — nothing to rename, nothing to edit
in code.

- One image named `cover` (any extension: `cover.jpg`, `cover.png`, ...)
  becomes that project's cover — the card that floats up when you hover its
  slice.
- Every other image in the folder becomes a feed image, in the order the
  files sort by name. `01.jpg`, `02.jpg`, ... is the easiest way to control
  that order; plain filenames work too, they just sort alphabetically.
- A folder can have fewer images than the project has image slots in its
  `feed` array (config.js) — the leftover slots just stay as labelled
  placeholders, same as today. It can also have more images than slots;
  the extras are simply never used yet, ready for when you add another slot.

After adding, removing, or reordering images, run:

```
node scripts/build-project-manifests.js
```

from the repo root. It scans every folder here and writes a `manifest.json`
into it, which `index.html` fetches on load to fill in `cover` and the feed
`src` fields automatically. Nothing needs to be typed into config.js by hand
unless you want to override a specific image — a `src` or `cover` already
set in config.js is left alone.

The script needs to run again any time the images change; it isn't watched
automatically. Regenerating is safe to do as often as you like — it only
ever rewrites `manifest.json`.
