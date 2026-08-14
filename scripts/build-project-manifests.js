#!/usr/bin/env node
/* ============================================================================
   BUILD PROJECT MANIFESTS
   ----------------------------------------------------------------------------
   Run from the repo root:

     node scripts/build-project-manifests.js

   Scans every folder under images/projects/ and writes a manifest.json into
   each one, listing whatever image files are sitting there. index.html
   fetches that manifest.json at load and uses it to fill in each project's
   `cover` and feed image `src` fields — see images/projects/README.md and
   section 9 of config.js for the full convention.

   No dependencies, no build tooling beyond plain Node. Re-run this any time
   you add, remove, or rename images; it only ever rewrites manifest.json.
   ============================================================================ */
'use strict';

const fs = require('fs');
const path = require('path');

const PROJECTS_DIR = path.join(__dirname, '..', 'images', 'projects');
const IMAGE_EXTS = new Set(['.jpg', '.jpeg', '.png', '.webp', '.gif', '.avif', '.svg']);

function isImageFile(name) {
  return IMAGE_EXTS.has(path.extname(name).toLowerCase());
}

function naturalSort(a, b) {
  return a.localeCompare(b, undefined, { numeric: true, sensitivity: 'base' });
}

function buildManifest(folder) {
  const dir = path.join(PROJECTS_DIR, folder);
  const files = fs.readdirSync(dir, { withFileTypes: true })
    .filter(function (e) { return e.isFile() && isImageFile(e.name); })
    .map(function (e) { return e.name; });

  const coverFile = files
    .filter(function (name) { return path.parse(name).name.toLowerCase() === 'cover'; })
    .sort(naturalSort)[0] || null;

  const images = files
    .filter(function (name) { return name !== coverFile; })
    .sort(naturalSort);

  const manifest = { cover: coverFile, images: images };
  fs.writeFileSync(
    path.join(dir, 'manifest.json'),
    JSON.stringify(manifest, null, 2) + '\n'
  );
  return manifest;
}

function main() {
  if (!fs.existsSync(PROJECTS_DIR)) {
    console.log('No images/projects/ folder found — nothing to do.');
    return;
  }

  const folders = fs.readdirSync(PROJECTS_DIR, { withFileTypes: true })
    .filter(function (e) { return e.isDirectory(); })
    .map(function (e) { return e.name; });

  if (!folders.length) {
    console.log('images/projects/ has no project folders yet — nothing to do.');
    return;
  }

  folders.forEach(function (folder) {
    const manifest = buildManifest(folder);
    const coverNote = manifest.cover ? manifest.cover : '(none)';
    console.log(
      folder + ': cover ' + coverNote + ', ' +
      manifest.images.length + ' feed image' + (manifest.images.length === 1 ? '' : 's')
    );
  });
}

main();
