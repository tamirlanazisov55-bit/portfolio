# Canvas card stacks

Goal: replace Canvas rectangular previews with three independent overlapping portrait cards, following the user-supplied reference. Preserve other projects and case galleries.

- [x] Inspect the supplied reference, existing renderer and source images. Match the OVERLOCK characters, Bosphorus/mosques and icon 05/09/13 imagery; compose Turk from existing film stills.
- [x] Prepare twelve local WebP crops, 480 × 560, to avoid remote dependencies and keep the page lightweight.
- [x] Add previewStack data and a Canvas-only renderer. Retain project names, links and metadata. No automatic video loading for the new stack previews.
- [x] Style three separate layers on a transparent stage, using the supplied shadow (2px 5px 6px, black 3%). Add restrained transform-only hover/focus motion and reduced-motion support.
- [x] Verify desktop, mobile, all four links, no clipping, no preview MP4s, hover/rest states and unchanged regular project previews. Publish through the existing GitHub Pages flow.

Verified at 1280px and 390px: all twelve images loaded; four independent three-layer stacks; no Canvas video elements; all layers contained within their stages; no horizontal overflow. Hover matrices change for all three layers and shadow is exactly rgba(0,0,0,.03) 2px 5px 6px. Existing ten project previews keep their original renderer.
