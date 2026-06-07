/**
 * Display names for Text components
 */
export const DISPLAY_NAME = {
  TEXT_ROOT: 'BlakeUINative.Text',
  TEXT_HEADING: 'BlakeUINative.Text.Heading',
  TEXT_PARAGRAPH: 'BlakeUINative.Text.Paragraph',
  TEXT_CODE: 'BlakeUINative.Text.Code',
} as const;

/**
 * Monospaced font family used by `Text.Code` on Android and web.
 *
 * iOS uses `'Menlo'` directly; the platform branch lives in
 * `styleSheet.code` in `text.styles.ts`.
 */
export const CODE_FONT_FAMILY = 'monospace';
