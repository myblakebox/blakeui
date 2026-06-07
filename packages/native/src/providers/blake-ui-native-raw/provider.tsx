import React from 'react';
import { SafeAreaListener } from 'react-native-safe-area-context';
import { Uniwind } from 'uniwind';
import { useDevInfo } from '../../helpers/internal/hooks';
import { GlobalAnimationSettingsProvider } from '../animation-settings';
import { TextComponentProvider } from '../text-component/provider';
import type { BlakeUINativeProviderRawProps } from './types';

/**
 * BlakeUINativeProviderRaw Component
 *
 * @description
 * Raw provider component for BlakeUI Native that configures the application
 * with global settings but without ToastProvider and PortalHost.
 * Use this when you need to manage toast and portal functionality separately
 * (e.g. nested providers or custom setups).
 *
 * Currently provides:
 * - Global animation settings
 * - Global text component configuration
 *
 * @param {BlakeUINativeProviderRawProps} props - Provider configuration props
 * @param {ReactNode} props.children - Child components to wrap
 * @param {BlakeUINativeConfigRaw} [props.config] - Configuration object
 *
 */
const BlakeUINativeProviderRaw: React.FC<BlakeUINativeProviderRawProps> = ({
  children,
  config = {},
}) => {
  const { textProps, animation, devInfo } = config;

  useDevInfo(devInfo);

  return (
    <SafeAreaListener
      onChange={({ insets }) => {
        Uniwind.updateInsets(insets);
      }}
    >
      <GlobalAnimationSettingsProvider animation={animation}>
        <TextComponentProvider value={{ textProps }}>
          {children}
        </TextComponentProvider>
      </GlobalAnimationSettingsProvider>
    </SafeAreaListener>
  );
};

export default BlakeUINativeProviderRaw;
