# Style bake-off brief

Goal: find the visual medium that lets someone "step into" Book of Mormon scenes in a browser, where Claude Code can produce new scenes quickly without hand-fixing visuals. Ten styles each build the same scene. Judge on look, walkability, and how cheaply the next 200 scenes could be produced.

## The scene: Christ visits the Nephites (3 Nephi 11, 17)

- Land Bountiful, at the temple, shortly after the great destruction (3 Nephi 8-10).
- About 2,500 people gathered. Men, women, children. Simple robes and cloaks, earthy colors.
- The temple: large, ancient American stone architecture (stepped platform or solid stone building).
- Destruction around it: cracked ground, toppled walls, broken buildings, scattered stones, a few smoldering spots.
- Christ: in a white robe, standing on a raised place near the temple, soft light around him. Light descending from the sky. Keep him faceless or very simple. Never attempt a detailed face.
- Sky: clearing after darkness, warm light breaking through clouds.
- Optional: children gathered near him with a soft ring of light (3 Nephi 17).

## Hard rules

- Everything lives in `styles/<your-folder>/`. Entry point `styles/<your-folder>/index.html`. Touch nothing outside your folder.
- Runs as static files in a browser. No build step, no npm packages in the page.
- Libraries only from CDN, exact pinned versions, via import map. Three.js: `https://cdn.jsdelivr.net/npm/three@0.170.0/build/three.module.js` and addons from `https://cdn.jsdelivr.net/npm/three@0.170.0/examples/jsm/`.
- No downloaded or hand-made asset files. All visuals generated from code (geometry, canvas drawing, SVG, shaders, procedural textures). This is the core of the test: can an AI produce it from code alone.
- Split the code in two: a reusable engine/renderer, and `scene.js` that describes this scene as data (placements, counts, colors, positions of temple, ruins, crowd, Christ). A new Book of Mormon scene should mostly mean writing a new `scene.js`.
- Walkable: keyboard (WASD/arrows) plus mouse or drag to look/turn where it applies. Simple touch support (drag to move/look) so phones work. Collision with buildings is nice, not required.
- Small on-screen hint for controls and a title "3 Nephi 11: Christ at the Temple in Bountiful".
- Must run smoothly with a large crowd. Use instancing or similar for 2,500 people (or a convincing crowd if your style can't show that many).

## Verify your work

Screenshot it and look at it. Iterate until it looks good. From the project root:

```
node tools/shot.mjs <your-folder> <out.png> [waitMs] [keys]
```

`keys` holds keys before the shot, e.g. `KeyW:1500,KeyA:300`. It prints console and page errors. Save screenshots to your scratchpad or `/private/tmp/...`, never inside the project. Take at least 3 shots (start view, after walking, near Christ) and fix anything broken or ugly. Leave a final `styles/<your-folder>/preview.png` (1280x720, start view) in your folder for the gallery.

## Approval-prompt rules (follow exactly)

A tool call that needs approval opens a prompt. Nobody is watching, so the run freezes on it forever. Never trigger one:

- `cd` on its own into a directory inside the project is fine. `cd dir && ...` triggers a prompt, so use absolute paths instead.
- Give `rm` literal absolute paths. No variables, globs, or `$(...)`.
- Do not run `git` commands. Do not commit.

## Report back (your final message, under 250 words)

1. Style name and folder.
2. What it looks like, honestly (strengths and weaknesses).
3. Lines of code: engine vs `scene.js`.
4. How hard it was for you: what broke, what took iterations, what needed visual fixing.
5. Your rating 1-10 on: looks, immersion, ease of producing new scenes by AI.
6. Path to `preview.png`.
