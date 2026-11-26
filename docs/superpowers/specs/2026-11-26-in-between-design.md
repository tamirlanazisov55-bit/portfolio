# Между делом / In Between

Approved in chat: a personal film project in Canvas, an ISPTECH-style bento grid, click-to-play video with sound, and a curated selection without repeated edits.

Use the existing case header, navigation, typography, spacing, rounded corners and bilingual metadata. Add one photographic project cover and a responsive grid of still frames with play affordances, descriptive titles and durations. Keep landscape footage uncropped during playback; preserve the two portrait films. The grid uses larger landscape cards and portrait cards on desktop, two columns on tablet, one on narrow phones.

Before interaction, load only compressed WebP posters. Assign an MP4 URL only after a user selects a film. One accessible modal player plays with native controls and sound; support close, Escape, keyboard focus containment/restoration and previous/next films. Closing unloads the video and restores scrolling. Playback failure offers a direct video link. Preserve Ru/En switching and existing cases.

Prepare H.264/AAC MP4s (maximum 1280px long edge, CRF 24, faststart) from originals without changing originals. Exclude repeated edits and near-identical variants; record the source mapping. Do not invent capture dates. Publish through the existing GitHub repository and deployment flow, not a new hosting service.

Verify desktop/mobile layout, every media URL, no MP4 requests before clicking, actual playback with audio, close/navigation/focus behavior, language switching, and unchanged ISPTECH rendering. Record total prepared asset weight.
