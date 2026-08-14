"use strict";

Object.assign(CONFIG, {

  /* ------------------------------------------------------------------------
     9. THE PROJECTS
     One slice per entry, in order around the ring. Add or remove entries and
     the ring re-divides itself — nothing else needs touching.

     `cover` and the image entries in `feed` are file paths, relative to this
     folder. Leave them empty and you get a labelled placeholder block, which
     is what you will see until you drop real images in.

     `folder` is optional and separate from all of that: name a subfolder
     under images/projects/ (e.g. 'in-the-weeds' -> images/projects/in-the-
     weeds/) and drop photos in there — one named `cover` (any extension),
     everything else in whatever order you want them to appear in the feed.
     Then run `node scripts/build-project-manifests.js` once. It writes a
     manifest.json in that folder, and index.html fetches it on load and
     fills in this project's `cover` and feed `src` fields for you — you
     never have to type a file path by hand. A `src`/`cover` you DO type by
     hand always wins; auto-linking only fills in what's still blank.

     An image entry may also carry a `caption`, drawn under the picture in the
     feed. It wraps to the item's width and the item grows to fit, so a full
     sentence is fine. Without one the item falls back to "PROJECT / n".
     --------------------------------------------------------------------- */
  projects: [

    /* SLICE 1 — the first real project on the site. Text, captions, image
       order and image files are all taken from the AA Projects Review 2024
       page: https://pr2024.aaschool.ac.uk/students/cem-dilekci
       (Intermediate 18, Third Year). Images live in images/projects/pneu-link/
       and are the site's own 2000px versions, not the 4096px originals.
       Every `src` is written out by hand here so the order matches the AA
       page's — hand-typed paths win over the manifest, so the auto-linker
       leaves this project alone.
       The AA page also carries three YouTube films between figures 7 and 11;
       the feed only draws pictures and text, so they are text entries with
       their links rather than being dropped. */
    { title: 'Pneu-Link', year: '2024',
      cover: 'images/projects/pneu-link/cover.jpg', folder: 'pneu-link',
      blurb: 'Interlocking pneumatics linking Somerset House’s East and West Wing galleries into one morphing exhibition.',
      feed: [
        { type: 'text',  body: 'Currently, the majority of Somerset House’s spaces are private, with entire floors rented out as offices and studios operating on a 9-to-5 schedule, thereby restricting public access to much of the building. The few existing galleries are often paid-entry, underutilized shells, inadequate for the immersive exhibitions that define 21st-century art experiences.' },

        { type: 'image', src: 'images/projects/pneu-link/01-programme-diagram.jpg', ratio: 1.00,
          caption: '1: Programme Diagram of the Somerset House — Private Upper Storeys and Segregated Gallery Spaces on the Ground Floor' },
        { type: 'image', src: 'images/projects/pneu-link/02-density-graph.jpg', ratio: 1.333,
          caption: '2: Densities of the Programmes through the Year' },

        { type: 'text',  body: 'Pneu-Link aims to revolutionize this historic public institution by creating a dynamic, immersive experience with varied circulation and programmes depending on the time of the visit. This approach ensures that each visit offers a unique perspective and new parts of the exhibition, making every experience distinct.' },

        { type: 'image', src: 'images/projects/pneu-link/03-iteration-process.jpg', ratio: 1.333,
          caption: '3: Iteration Process — Exploring the Most Efficient Pneumatic Modules through Experimentation' },
        { type: 'image', src: 'images/projects/pneu-link/04-air-pump-station.jpg', ratio: 1.50,
          caption: '4: Air Pump Station — Running the Inflation and Deflation Cycles on the Inflatables' },
        { type: 'image', src: 'images/projects/pneu-link/05-testing-rig.jpg', ratio: 0.941,
          caption: '5: Testing Rig — Testing the Pneumatic Modules on Pressure, Stress and Bending Angle' },

        { type: 'text',  body: 'The project’s foundation lies in extensive research on pneumatic modules, focusing on the most efficient and versatile etch patterns to develop dynamic additions to the structure. Utilizing interlocking pneumatic systems, Pneu-Link constructs a complex, morphing exhibition space that can blossom, expand, and interact with visitors.' },

        { type: 'image', src: 'images/projects/pneu-link/06-pneumatic-modules.jpg', ratio: 0.667,
          caption: '6: Pneumatic Modules and Moulds' },
        { type: 'image', src: 'images/projects/pneu-link/07-inflation.jpg', ratio: 1.50,
          caption: '7: Inflation of the 4-Chamber Tri-Arm Module' },

        { type: 'text',  body: '8: Simulations of Interlocking Pneumatics — youtu.be/Xb85Eed_lUI' },
        { type: 'text',  body: '9: Final Interlocking Pneumatic System — youtu.be/iISIzHJqlqk' },
        { type: 'text',  body: '10: Spatial Exploration of Pneumatic Modules, a Dynamic Canopy that Adjusts to Weather Conditions — youtu.be/3eBRKXgmanQ' },

        { type: 'image', src: 'images/projects/pneu-link/11-axonometric-render.jpg', ratio: 1.778,
          caption: '11: Proposal of Pneu-Link Exhibition Extension — Connecting East and West Wing Galleries with a Dynamic Inflatable Bridge' },

        { type: 'text',  body: 'This innovative exhibition space serves as both an extension and a connection between the East and West Wing galleries, uniting them into a single cohesive gallery. Additionally, the space can extend into the upper storeys during times when the co-working spaces are closed, offering visitors access to different parts of the exhibition and creating new public areas for various activities.' },

        { type: 'image', src: 'images/projects/pneu-link/12-inflatables-diagram.jpg', ratio: 1.00,
          caption: '12: Integrated Inflatable Modules — Utilizing Deflated and Inflated States to Control Light, Circulation and Ventilation of the Interiors' },
        { type: 'image', src: 'images/projects/pneu-link/13-sectional-render.jpg', ratio: 1.778,
          caption: '13: Sectional Perspective — Illustrating the Inflatable Immersive Exhibition Extension Connecting the Two Wings' },
        { type: 'image', src: 'images/projects/pneu-link/14-interior-render.jpg', ratio: 1.778,
          caption: '14: Threshold between Exhibition and Upper Co-Working Spaces — Dynamic Inflatable Pathways Allowing Access to the Co-Working Spaces after Working Hours' },
        { type: 'image', src: 'images/projects/pneu-link/15-sectional-model.jpg', ratio: 1.50,
          caption: '15: Sectional Physical Model — Connection of the Exhibition Extension with the Existing West Wing Gallery' },
      ] },

    { title: '4-Chambers',     year: '2025', cover: '', folder: '4-chambers',
      blurb: 'Four rooms that refuse to agree on a floor level.',
      feed: [
        { type: 'image', src: '', ratio: 0.80 },
        { type: 'text',  body: 'Each chamber is a half-storey off its neighbour. The stair is the building.' },
        { type: 'image', src: '', ratio: 1.50 },
        { type: 'image', src: '', ratio: 1.00 },
      ] },

    { title: 'Iteration',      year: '2024', cover: '', folder: 'iteration',
      blurb: 'The same plan, drawn forty times, until it stopped changing.',
      feed: [
        { type: 'image', src: '', ratio: 1.30 },
        { type: 'image', src: '', ratio: 1.30 },
        { type: 'text',  body: 'Iterations 1 through 40. The one that got built is number 31.' },
        { type: 'image', src: '', ratio: 0.70 },
      ] },

    { title: 'Ground Truth',   year: '2024', cover: '', folder: 'ground-truth',
      blurb: 'A survey that turned into a building.',
      feed: [
        { type: 'image', src: '', ratio: 1.70 },
        { type: 'text',  body: 'Every level was taken twice. They disagreed by 40mm and we never found out why.' },
        { type: 'image', src: '', ratio: 0.85 },
      ] },

    { title: 'Soft Structure', year: '2023', cover: '', folder: 'soft-structure',
      blurb: 'Load-bearing fabric, tested to destruction, twice.',
      feed: [
        { type: 'image', src: '', ratio: 1.00 },
        { type: 'image', src: '', ratio: 1.20 },
        { type: 'text',  body: 'It failed at 1.8kN. Then, reinforced, at 6.2kN. The second failure was prettier.' },
      ] },

    { title: 'Nine Openings',  year: '2023', cover: '', folder: 'nine-openings',
      blurb: 'One wall, nine windows, no two the same size.',
      feed: [
        { type: 'image', src: '', ratio: 0.65 },
        { type: 'image', src: '', ratio: 1.45 },
        { type: 'text',  body: 'The sizes come from what the neighbours could see in. Nothing else.' },
      ] },

    { title: 'About',          year: '',     cover: '', folder: 'about',
      blurb: 'Studio Karbon. Architecture, drawings, and the occasional building.',
      feed: [
        { type: 'text',  body: 'Studio Karbon is an architectural practice. We draw carefully and build slowly.' },
        { type: 'image', src: '', ratio: 1.00 },
        { type: 'text',  body: 'cem@dilekci.com' },
      ] },
  ],

});
