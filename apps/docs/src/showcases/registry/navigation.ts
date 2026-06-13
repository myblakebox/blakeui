import type {ShowcaseItem} from "../types";

import {CORE_TEAM_AUTHORS} from "../authors";
import AppleIPhoneCameraZoom from "../navigation/apple-iphone-camera-zoom";

const SHOWCASE_CDN_URL = "https://cdn.blakeui.com/docs/showcases";

export const navigationShowcases: ShowcaseItem[] = [
  {
    author: CORE_TEAM_AUTHORS["jrgarciadev"],
    component: AppleIPhoneCameraZoom,
    components: ["Tabs"],
    defaultTheme: "dark",
    description: "Interactive camera zoom showcase inspired by Apple's iPhone 17 Pro",
    file: "apple-iphone-camera-zoom.tsx",
    name: "apple-iphone-camera-zoom",
    posterUrl: `${SHOWCASE_CDN_URL}/2.jpg`,
    status: "new",
    supportsThemeSwitching: false,
    title: "Apple iPhone 17 Pro Camera Zoom",
    videoUrl: `${SHOWCASE_CDN_URL}/2.mp4`,
  },
];
