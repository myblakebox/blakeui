import React from 'react';
import { Text as RNText, type TextProps as RNTextProps } from 'react-native';
import { useTextComponent } from '../../external/hooks';
import { cn } from '../../external/utils';

/**
 * Props for BlakeText component
 */
export interface BlakeTextProps extends RNTextProps {
  /**
   * Additional CSS classes that will be merged with the default 'font-normal' class
   */
  className?: string;
}

/**
 * BlakeText component that automatically applies global text configuration
 * from BlakeUINativeProvider.
 *
 * This component is distinct from React Native's Text component and includes
 * a default 'font-normal' className that can be extended via the className prop.
 *
 * Global text props that can be configured:
 * - adjustsFontSizeToFit: Auto-scale text to fit constraints
 * - allowFontScaling: Respect Text Size accessibility settings
 * - maxFontSizeMultiplier: Maximum font scale when allowFontScaling is enabled
 * - minimumFontScale: Minimum scale when adjustsFontSizeToFit is enabled (iOS only)
 *
 * @example
 * ```tsx
 * <BlakeText>Hello World</BlakeText>
 * ```
 *
 * @example
 * With custom className:
 * ```tsx
 * <BlakeText className="text-lg font-bold">Hello World</BlakeText>
 * ```
 *
 * @example
 * Global configuration in BlakeUINativeProvider:
 * ```tsx
 * <BlakeUINativeProvider config={{
 *   textProps: {
 *     allowFontScaling: false,
 *     adjustsFontSizeToFit: false,
 *     maxFontSizeMultiplier: 1.5
 *   }
 * }}>
 *   <App />
 * </BlakeUINativeProvider>
 * ```
 */
export const BlakeText = React.forwardRef<RNText, BlakeTextProps>(
  (props, ref) => {
    const { className, ...restProps } = props;
    const { textProps } = useTextComponent();

    const mergedProps = Object.assign({}, textProps, restProps);

    return (
      <RNText
        ref={ref}
        className={cn('font-normal', className)}
        {...mergedProps}
      />
    );
  }
);

BlakeText.displayName = 'BlakeText';
