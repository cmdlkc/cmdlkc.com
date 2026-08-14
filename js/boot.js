"use strict";

/* ==========================================================================
   BOOT
   --------------------------------------------------------------------------
   Loaded last. Checks that every other file actually arrived — naming the one
   that didn't, rather than failing blank — and then starts the page: fill in
   the project images, build the page, run it.

     config/00-header.js   defines CONFIG (and holds the version history)
     config/01..14-*.js    every tunable number, one file per numbered section
     js/page.js            buildPage() — the logo engine and the page drawing
     js/lens.js            LENS() — the refracted patch that follows the cursor
     js/boot.js            this file

   Each of those is its own <script src> in index.html, so any one of them can
   go missing on its own: a renamed file, a typo'd path, a folder left behind
   when the site was copied somewhere. That is what the checks below are for.
   ========================================================================== */

/* Every section config/ is expected to contribute, and the file that should
   have contributed it. Add a section and you add it in THREE places: a new
   file in config/, a <script> line in index.html, and a line here. */
const SECTION_FILES = {
  colour:   '01-colour',    letter: '02-letter',  ring:  '03-ring',   view:   '04-view',
  dot:      '05-dot',       lines:  '06-lines',   shade: '07-shade',  motion: '08-motion',
  projects: '09-projects',  cover:  '10-cover',   feed:  '11-feed',   debug:  '12-debug',
  lens:     '13-lens',      about:  '14-about',
};

function fatal(file, why) {
  document.body.innerHTML =
    '<div id="fatal"><strong>Couldn\'t find <code>' + file + '</code></strong>' +
    '<br><br>' + why + '<br><br>Check the <code>&lt;script src="..."&gt;</code> ' +
    'lines near the bottom of index.html against what is actually on disk — ' +
    'those paths are relative to index.html, and every one of them has to ' +
    'resolve.</div>';
}

function start() {
  if (typeof CONFIG === "undefined") {
    return fatal('config/00-header.js',
      'That is the file that creates <code>CONFIG</code>. Every other config ' +
      'file adds its own section to that one object, so nothing at all works ' +
      'without it — and it has to load first.');
  }
  for (const key in SECTION_FILES) {
    if (!CONFIG[key]) {
      return fatal('config/' + SECTION_FILES[key] + '.js',
        '<code>CONFIG</code> itself loaded, but its <code>' + key + '</code> ' +
        'section never arrived.');
    }
  }
  if (typeof buildPage !== "function") {
    return fatal('js/page.js',
      'It defines <code>buildPage()</code>, which draws the entire page — the ' +
      'logo, the menu, the previews and the project feed.');
  }
  if (typeof LENS !== "function") {
    return fatal('js/lens.js',
      'It defines <code>LENS()</code>, the small refracted patch that follows ' +
      'the cursor. To run the site without it, set <code>lens.enabled</code> ' +
      'to false in <code>config/13-lens.js</code> rather than deleting this file.');
  }
  loadProjectImages(CONFIG).then(function () {
    window.PAGE = buildPage();
    startLens();
  });
}

/* ==========================================================================
   AUTO-LINKED PROJECT IMAGES
   --------------------------------------------------------------------------
   Each project below can name a `folder` (see section 9 of config.js). If it
   does, this looks for images/projects/<folder>/manifest.json — a small file
   listing whatever image files are sitting in that folder, written by
   `node scripts/build-project-manifests.js` after you drop photos in.

   Nothing is required: a project with no `folder`, or one whose manifest
   doesn't exist yet (nothing dropped in, or opened via double-click instead
   of a real server), is untouched — `cover` and every feed image `src` stay
   whatever config.js already says, which is '' unless you typed a path in by
   hand. drawFramed() already treats an empty src as a labelled placeholder,
   so there is nothing else to fall back to here.

   Runs to completion BEFORE buildPage(), so by the time anything is laid out
   or drawn, every project's images are either filled in or definitely not
   coming — no images popping in after the fact, no re-layout needed.
   ========================================================================== */
function loadProjectImages(CONFIG) {
  return Promise.all(CONFIG.projects.map(function (pr) {
    if (!pr.folder) return null;
    const base = "images/projects/" + pr.folder + "/";
    return fetch(base + "manifest.json")
      .then(function (res) { return res.ok ? res.json() : null; })
      .then(function (manifest) {
        if (!manifest) return;
        if (manifest.cover && !pr.cover) pr.cover = base + manifest.cover;
        const pool = (manifest.images || []).slice();
        let n = 0;
        pr.feed.forEach(function (item) {
          if (item.type === "image" && !item.src && n < pool.length) {
            item.src = base + pool[n++];
          }
        });
      })
      .catch(function () { /* no server, or nothing dropped in yet */ });
  }));
}

/* ==========================================================================
   THE PLAIN PAGE
   The base layer, always running: draw PAGE's canvas straight to the screen.
   No WebGL, no texture-of-the-whole-page trick — just a 2D blit, exactly
   like every other canvas-based prototype on this site. This runs whether
   or not the lens (below) is available or turned on.
   ========================================================================== */
function runBase() {
  const canvas = document.getElementById("glass");
  const ctx = canvas.getContext("2d");
  let last = performance.now();
  function frame(now) {
    const dt = Math.min((now - last) / 1000, 1/30);
    last = now;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    if (canvas.width !== Math.round(window.innerWidth * dpr)) {
      canvas.width  = Math.round(window.innerWidth  * dpr);
      canvas.height = Math.round(window.innerHeight * dpr);
      PAGE.resize(window.innerWidth, window.innerHeight, dpr);
    }
    if (PAGE.update(dt)) ctx.drawImage(PAGE.canvas, 0, 0);
    requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);
}

function startLens() {
  runBase();
  if (!CONFIG.lens.enabled) return;
  const probe = document.createElement("canvas").getContext("webgl2");
  if (!probe) { console.warn("WebGL2 unavailable; running without the cursor lens."); return; }
  LENS(CONFIG);
}

/* --- go ----------------------------------------------------------------- */
start();
