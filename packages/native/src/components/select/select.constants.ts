/**
 * Display names for the Select components
 */
export const DISPLAY_NAME = {
  ROOT: 'BlakeUINative.Select.Root',
  TRIGGER: 'BlakeUINative.Select.Trigger',
  VALUE: 'BlakeUINative.Select.Value',
  PORTAL: 'BlakeUINative.Select.Portal',
  OVERLAY: 'BlakeUINative.Select.Overlay',
  CONTENT: 'BlakeUINative.Select.Content',
  ITEM: 'BlakeUINative.Select.Item',
  ITEM_LABEL: 'BlakeUINative.Select.ItemLabel',
  ITEM_DESCRIPTION: 'BlakeUINative.Select.ItemDescription',
  ITEM_INDICATOR: 'BlakeUINative.Select.ItemIndicator',
  LIST_LABEL: 'BlakeUINative.Select.ListLabel',
  CLOSE: 'BlakeUINative.Select.Close',
  TRIGGER_INDICATOR: 'BlakeUINative.Select.TriggerIndicator',
  CHEVRON_DOWN_ICON: 'BlakeUINative.Select.ChevronDownIcon',
} as const;

/**
 * Default icon size for the indicator
 */
export const DEFAULT_ICON_SIZE = 16;

/**
 * Spring configuration for indicator animation
 */
export const INDICATOR_SPRING_CONFIG = {
  damping: 140,
  stiffness: 1000,
  mass: 4,
};

/**
 * Default offset from trigger element
 */
export const DEFAULT_OFFSET = 8;

/**
 * Default alignment offset
 */
export const DEFAULT_ALIGN_OFFSET = 0;

/**
 * Default screen edge insets
 */
export const DEFAULT_INSETS = {
  top: 12,
  bottom: 12,
  left: 12,
  right: 12,
};
