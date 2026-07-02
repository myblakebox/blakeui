/**
 * Focus rings extend past flush-width fields and buttons (fields:
 * ring-2/offset 0 = 2px; buttons and links: ring-2 + --ring-offset-width
 * 2px = 4px), and the measured-height glide wrappers' overflow-hidden would
 * clip them. Each glide wrapper carries this gutter as p-1 pulled back out
 * by -m-1, so the stage content keeps its exact position and width; the
 * animated height target adds the vertical gutter back (border-box sizing):
 * `height: contentHeight + RING_GUTTER_PX * 2`.
 */
export const RING_GUTTER_PX = 4;
