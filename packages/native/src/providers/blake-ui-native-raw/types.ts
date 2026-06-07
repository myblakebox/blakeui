import type { ReactNode } from 'react';
import type { BlakeUINativeConfig } from '../blake-ui-native/types';

/**
 * Configuration object for BlakeUINativeProviderRaw
 *
 * @description
 * A subset of {@link BlakeUINativeConfig} containing only the configuration
 * options supported by the raw provider.
 */
export type BlakeUINativeConfigRaw = Pick<
  BlakeUINativeConfig,
  'textProps' | 'animation' | 'devInfo'
>;

/**
 * Props for BlakeUINativeProviderRaw component
 *
 * @interface BlakeUINativeProviderRawProps
 *
 * @description
 * Props for the raw variant of the provider that includes only
 * a subset of functionality from {@link BlakeUINativeProviderProps}.
 */
export interface BlakeUINativeProviderRawProps {
  /**
   * Child components to render within the raw provider
   */
  children: ReactNode;

  /**
   * Configuration object for the raw provider
   *
   * @description
   * A subset of configuration options supported by the raw provider.
   * See {@link BlakeUINativeConfigRaw} for available options.
   */
  config?: BlakeUINativeConfigRaw;
}
