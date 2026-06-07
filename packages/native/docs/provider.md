# BlakeUINativeProvider

Configure BlakeUI Native provider with text, animation, and toast settings

## Overview

The provider serves as the main entry point for BlakeUI Native, wrapping your application with essential contexts and configurations:

- **Safe Area Insets**: Automatically handles safe area insets updates via `SafeAreaListener` and syncs them with Uniwind for use in Tailwind classes (e.g., `pb-safe-offset-3`)
- **Text Configuration**: Global text component settings for consistency across all BlakeUI components
- **Animation Configuration**: Global animation control to disable all animations across the application
- **Toast Configuration**: Global toast system configuration including insets, default props, and wrapper components
- **Portal Management**: Handles overlays, modals, and other components that render on top of the app hierarchy

## Basic Setup

Wrap your application root with the provider:

```tsx
import { BlakeUINativeProvider } from '@blakeui/native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

export default function App() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <BlakeUINativeProvider>{/* Your app content */}</BlakeUINativeProvider>
    </GestureHandlerRootView>
  );
}
```

## Configuration Options

The provider accepts a `config` prop with the following options:

### Text Component Configuration

Global settings for all Text components within BlakeUI Native. These props are carefully selected to include only those that make sense to configure globally across all Text components in the application:

```tsx
import { BlakeUINativeProvider } from '@blakeui/native';
import type { BlakeUINativeConfig } from '@blakeui/native';

const config: BlakeUINativeConfig = {
  textProps: {
    // Disable font scaling for accessibility
    allowFontScaling: false,

    // Auto-adjust font size to fit container
    adjustsFontSizeToFit: false,

    // Maximum font size multiplier when scaling
    maxFontSizeMultiplier: 1.5,

    // Minimum font scale (iOS only, 0.01-1.0)
    minimumFontScale: 0.5,
  },
};

export default function App() {
  return (
    <BlakeUINativeProvider config={config}>
      {/* Your app content */}
    </BlakeUINativeProvider>
  );
}
```

### Animation Configuration

Global animation configuration for the entire application:

```tsx
const config: BlakeUINativeConfig = {
  // Disable all animations across the application (cascades to all children)
  animation: 'disable-all',
};
```

<Callout type="warning">
  **Note**: When set to `'disable-all'`, all animations across the application will be disabled. This is useful for accessibility or performance optimization.
</Callout>

### Developer Information Configuration

Control developer-facing informational messages displayed in the console:

```tsx
const config: BlakeUINativeConfig = {
  devInfo: {
    // Disable styling principles information message
    stylingPrinciples: false,
  },
};
```

<Callout type="info">
  **Note**: By default, informational messages are enabled. Set `stylingPrinciples: false` to disable the styling principles message that appears in the console during development.
</Callout>

### Toast Configuration

Configure the global toast system including insets, default props, and wrapper components. You can also disable the toast provider entirely:

**Option 1: Disable Toast Provider**

```tsx
const config: BlakeUINativeConfig = {
  // Disable toast provider entirely
  toast: false,
  // or
  toast: 'disabled',
};
```

<Callout type="info">
  **Note**: When toast is disabled (`false` or `'disabled'`), the `ToastProvider` will not be rendered, and toast functionality will not be available in your application.
</Callout>

**Option 2: Configure Toast Provider**

```tsx
import { KeyboardAvoidingView } from 'react-native';

const config: BlakeUINativeConfig = {
  toast: {
    // Global toast configuration (used as defaults for all toasts)
    defaultProps: {
      variant: 'default',
      placement: 'top',
      isSwipeable: true,
      animation: true,
    },
    // Insets for spacing from screen edges (added to safe area insets)
    insets: {
      top: 0, // Default: iOS = 0, Android = 12
      bottom: 6, // Default: iOS = 6, Android = 12
      left: 12, // Default: 12
      right: 12, // Default: 12
    },
    // Maximum number of visible toasts before opacity starts fading
    maxVisibleToasts: 3,
    // Custom wrapper function to wrap the toast content
    contentWrapper: (children) => (
      <KeyboardAvoidingView
        behavior="padding"
        keyboardVerticalOffset={24}
        className="flex-1"
      >
        {children}
      </KeyboardAvoidingView>
    ),
  },
};
```

## Complete Example

Here's a comprehensive example showing all configuration options:

```tsx
import { BlakeUINativeProvider } from '@blakeui/native';
import type { BlakeUINativeConfig } from '@blakeui/native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

const config: BlakeUINativeConfig = {
  // Global text configuration
  textProps: {
    minimumFontScale: 0.5,
    maxFontSizeMultiplier: 1.5,
    allowFontScaling: true,
    adjustsFontSizeToFit: false,
  },
  // Global animation configuration
  animation: 'disable-all', // Optional: disable all animations
  // Developer information messages configuration
  devInfo: {
    stylingPrinciples: true, // Optional: disable styling principles message
  },
  // Global toast configuration
  // Option 1: Configure toast with custom settings
  toast: {
    defaultProps: {
      variant: 'default',
      placement: 'top',
    },
    insets: {
      top: 0,
      bottom: 6,
      left: 12,
      right: 12,
    },
    maxVisibleToasts: 3,
  },
  // Option 2: Disable toast entirely
  // toast: false,
  // or
  // toast: 'disabled',
};

export default function App() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <BlakeUINativeProvider config={config}>
        <YourApp />
      </BlakeUINativeProvider>
    </GestureHandlerRootView>
  );
}
```

## Integration with Expo Router

When using Expo Router, wrap your root layout:

```tsx
// app/_layout.tsx
import { BlakeUINativeProvider } from '@blakeui/native';
import type { BlakeUINativeConfig } from '@blakeui/native';
import { Stack } from 'expo-router';

const config: BlakeUINativeConfig = {
  textProps: {
    minimumFontScale: 0.5,
    maxFontSizeMultiplier: 1.5,
  },
};

export default function RootLayout() {
  return (
    <BlakeUINativeProvider config={config}>
      <Stack />
    </BlakeUINativeProvider>
  );
}
```

## Architecture

### Provider Hierarchy

The `BlakeUINativeProvider` internally composes multiple providers:

```
BlakeUINativeProvider
├── SafeAreaListener (handles safe area insets updates)
│   └── GlobalAnimationSettingsProvider (animation configuration)
│       └── TextComponentProvider (text configuration)
│           └── ToastProvider (toast configuration, conditionally rendered)
│               └── Your App
│               └── PortalHost (for overlays)
```

<Callout type="info">
  **Note**: The `ToastProvider` is conditionally rendered based on the `toast` configuration. If `toast` is set to `false` or `'disabled'`, the `ToastProvider` will not be rendered, and the app content and `PortalHost` will be rendered directly under `TextComponentProvider`.
</Callout>

### Safe Area Insets Handling

The provider automatically wraps your application with [`SafeAreaListener`](https://appandflow.github.io/react-native-safe-area-context/api/safe-area-listener) from `react-native-safe-area-context`. This component listens to safe area insets and frame changes without triggering re-renders, and automatically updates Uniwind with the latest insets via the `onChange` callback.

## Raw Provider

`BlakeUINativeProviderRaw` is a lightweight variant of `BlakeUINativeProvider` designed for bundle optimization. It excludes `ToastProvider` and `PortalHost`, giving you a bare minimum starting point where you only install and add what you actually need.

### When to Use

Use `BlakeUINativeProviderRaw` when you want full control over which dependencies are included in your bundle. With the raw provider imported from `@blakeui/native/provider-raw`, the following dependencies are optional and only required if you use the corresponding components:

- **react-native-screens** -- required for overlay components (Popover, Dialog)
- **@gorhom/bottom-sheet** -- required for BottomSheet component
- **react-native-svg** -- required for components that use icons (Accordion, Alert, Checkbox, etc.)

### Setup

```tsx
import {
  BlakeUINativeProviderRaw,
  type BlakeUINativeConfigRaw,
} from '@blakeui/native/provider-raw';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

const config: BlakeUINativeConfigRaw = {
  textProps: {
    maxFontSizeMultiplier: 1.5,
  },
};

export default function App() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <BlakeUINativeProviderRaw config={config}>
        {/* Your app content */}
      </BlakeUINativeProviderRaw>
    </GestureHandlerRootView>
  );
}
```

### Adding Toast and Portal Manually

If you need toast or portal functionality with the raw provider, add them yourself:

```tsx
import { BlakeUINativeProviderRaw } from '@blakeui/native/provider-raw';
import { PortalHost } from '@blakeui/native/portal';
import { ToastProvider } from '@blakeui/native/toast';

export default function App() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <BlakeUINativeProviderRaw>
        <ToastProvider>
          {/* Your app content */}
          <PortalHost />
        </ToastProvider>
      </BlakeUINativeProviderRaw>
    </GestureHandlerRootView>
  );
}
```

### Provider Hierarchy

```
BlakeUINativeProviderRaw
├── SafeAreaListener (handles safe area insets updates)
│   └── GlobalAnimationSettingsProvider (animation configuration)
│       └── TextComponentProvider (text configuration)
│           └── Your App
```

## Best Practices

### 1. Single Provider Instance

Always use a single `BlakeUINativeProvider` at the root of your app. Don't nest multiple providers:

```tsx
// ❌ Bad
<BlakeUINativeProvider>
  <SomeComponent>
    <BlakeUINativeProvider> {/* Don't do this */}
      <AnotherComponent />
    </BlakeUINativeProvider>
  </SomeComponent>
</BlakeUINativeProvider>

// ✅ Good
<BlakeUINativeProvider>
  <SomeComponent>
    <AnotherComponent />
  </SomeComponent>
</BlakeUINativeProvider>
```

### 2. Configuration Object

Define your configuration outside the component to prevent recreating on each render:

```tsx
// ❌ Bad
function App() {
  return (
    <BlakeUINativeProvider
      config={{
        textProps: {
          /* inline config */
        },
      }}
    >
      {/* ... */}
    </BlakeUINativeProvider>
  );
}

// ✅ Good
const config: BlakeUINativeConfig = {
  textProps: {
    maxFontSizeMultiplier: 1.5,
  },
};

function App() {
  return (
    <BlakeUINativeProvider config={config}>{/* ... */}</BlakeUINativeProvider>
  );
}
```

### 3. Text Configuration

Consider accessibility when configuring text props:

```tsx
const config: BlakeUINativeConfig = {
  textProps: {
    // Allow font scaling for accessibility
    allowFontScaling: true,
    // But limit maximum scale
    maxFontSizeMultiplier: 1.5,
  },
};
```

## TypeScript Support

The provider is fully typed. Import types for better IDE support:

```tsx
import { BlakeUINativeProvider, type BlakeUINativeConfig } from '@blakeui/native';

const config: BlakeUINativeConfig = {
  // Full type safety and autocomplete
  textProps: {
    allowFontScaling: true,
    maxFontSizeMultiplier: 1.5,
  },
  animation: 'disable-all', // Optional: disable all animations
  devInfo: {
    stylingPrinciples: true, // Optional: disable styling principles message
  },
  // Toast configuration options:
  // - false or 'disabled': Disable toast provider
  // - ToastProviderProps object: Configure toast settings
  toast: {
    defaultProps: {
      variant: 'default',
      placement: 'top',
    },
    insets: {
      top: 0,
      bottom: 6,
      left: 12,
      right: 12,
    },
  },
};
```
