import type { WithSpringConfig } from 'react-native-reanimated';

export const DISPLAY_NAME = {
  ROOT: 'BlakeUINative.Tabs.Root',
  LIST: 'BlakeUINative.Tabs.List',
  SCROLL_VIEW: 'BlakeUINative.Tabs.ScrollView',
  TRIGGER: 'BlakeUINative.Tabs.Trigger',
  LABEL: 'BlakeUINative.Tabs.Label',
  INDICATOR: 'BlakeUINative.Tabs.Indicator',
  SEPARATOR: 'BlakeUINative.Tabs.Separator',
  CONTENT: 'BlakeUINative.Tabs.Content',
} as const;

export const DEFAULT_INDICATOR_SPRING_CONFIG: WithSpringConfig = {
  stiffness: 1200,
  damping: 120,
};
