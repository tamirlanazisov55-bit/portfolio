# In Between Implementation Plan

**Goal:** Add the approved personal video diary to Canvas without automatic video downloads.

**Architecture:** Reuse the static case template and data registry. Add an isolated film-grid renderer and one on-demand accessible player. Store optimized assets alongside existing videos.

**Tech Stack:** HTML, CSS, vanilla JavaScript, FFmpeg, Python/Pillow for media inspection.

## Constraints
- Preserve source videos and existing project behavior.
- No MP4 source before explicit play; WebP posters load lazily.
- Bilingual content; no invented recording dates.
- Existing GitHub deployment only.

## Tasks
- [x] Prepare curated media assets and a documented original-to-output mapping; inspect poster sheet and FFmpeg metadata.
- [x] Add `film-grid` rendering and accessible modal playback in `cases.js`, with scoped responsive styles in `styles.css`.
- [x] Register the project in `cases-data.js`, create `cases/in-between.html` from the existing template and refresh shared cache versions.
- [x] Run JavaScript syntax checks and asset/data validation. Preview through a local static server; verify lazy loading, playback, keyboard controls, Ru/En, desktop/mobile and ISPTECH regression.
- [ ] Commit only intended files, push the existing repository, and verify the deployment.

Execution stays in this chat. Use direct file edits, existing native browser tools for visual QA, and Git for publication. Review the complete diff before committing.
