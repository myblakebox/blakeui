import { useThemeColor } from '@blakeui/native';
import { isLiquidGlassAvailable } from 'expo-glass-effect';
import { Stack } from 'expo-router';

export default function Layout() {
  const themeColorBackground = useThemeColor('background');

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        gestureEnabled: true,
        gestureDirection: 'horizontal',
        fullScreenGestureEnabled: isLiquidGlassAvailable() ? false : true,
        animation: 'none',
        contentStyle: {
          backgroundColor: themeColorBackground,
        },
      }}
    >
      <Stack.Screen name="raycast" options={{ animation: 'fade' }} />
      <Stack.Screen name="super-app-paywall" options={{ animation: 'fade' }} />
    </Stack>
  );
}
