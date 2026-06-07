import {__BASE_URL__, __CDN_URL__} from "@/utils/env";

export const siteConfig = {
  authors: [
    {
      name: "blakeUI",
      url: "https://x.com/blake_ui",
    },
  ],
  cdnUrl: __CDN_URL__,
  creator: "myblakebox",
  description:
    "Beautiful, accessible React UI components built on React Aria and Tailwind CSS v4. The modern alternative to MUI, Chakra UI, and shadcn/ui for building production-ready applications.",
  figmaCommunityFile: "https://www.figma.com/community/file/1546526812159103429",
  fullName: "blakeUI - Beautiful by default, customizable by design.",
  githubRawUrl:
    "https://raw.githubusercontent.com/myblakebox/BlakeUI/refs/heads/main/apps/docs/content/docs",
  githubRepo: "myblakebox/BlakeUI",
  githubUrl: "https://github.com/myblakebox/BlakeUI",
  links: {
    discord: "https://discord.gg/9b6yyZKmH4",
    github: "https://github.com/myblakebox",
    twitter: "https://x.com/blake_ui",
  },
  name: "blakeUI",
  ogImage: `/images/twitter-card.jpg`,
  ogImageNative: `/images/twitter-card-native.jpeg`,
  siteUrl: __BASE_URL__,
  supportEmail: "support@blakebill.com",
};

export type SiteConfig = typeof siteConfig;
