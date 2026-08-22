import type {BaseLayoutProps} from "fumadocs-ui/layouts/shared";

import {BlakeUILockup} from "@/components/blakeui-lockup";
import {NavThemeToggle} from "@/components/fumadocs/ui/theme-toggle";

export {getHomeLayoutLinks} from "./(home)/home-layout-links";

/**
 * Shared layout configurations
 *
 * you can customise layouts individually from:
 * Home Layout: app/(home)/layout.tsx
 * Docs Layout: app/docs/layout.tsx
 */
export const baseOptions: BaseLayoutProps = {
  nav: {
    title: <BlakeUILockup />,
    transparentMode: "always",
  },
  // Layouts that render fumadocs' stock theme-switch slot (HomeLayout) get
  // our vendored ThemeToggle with the sliding selection pill instead; the
  // vendored notebook/docs layouts already render the vendored toggle.
  slots: {
    themeSwitch: NavThemeToggle,
  },
};
