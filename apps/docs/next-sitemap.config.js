/* eslint-disable import/no-anonymous-default-export */
const normalizeSiteUrl = (siteUrl) => {
  const url = new URL(siteUrl);

  if (url.hostname === "v3.blakeui.com") {
    url.hostname = "blakeui.com";
  }

  return url.toString().replace(/\/$/, "");
};

const contentSignalDirective = "Content-Signal: ai-train=yes, search=yes, ai-input=yes";

/** @type {import('next-sitemap').IConfig} */
export default {
  autoLastmod: true,
  changefreq: "daily",
  exclude: [
    "/api/*",
    "/llms.mdx/*",
    "/llms.txt",
    "/llms-full.txt",
    "/og/*",
    // React release notes are hidden from the site (see src/lib/source.ts isHiddenPage)
    "/docs/react/releases",
    "/docs/react/releases/*",
    "/*/docs/react/releases",
    "/*/docs/react/releases/*",
  ],
  generateIndexSitemap: true,
  generateRobotsTxt: true,
  priority: 0.7,
  robotsTxtOptions: {
    additionalSitemaps: [],
    policies: [
      {
        allow: "/",
        userAgent: "*",
      },
    ],
    transformRobotsTxt: async (_, robotsTxt) => {
      if (robotsTxt.includes(contentSignalDirective)) {
        return robotsTxt;
      }

      return robotsTxt.replace("Allow: /\n", `Allow: /\n${contentSignalDirective}\n`);
    },
  },
  siteUrl: normalizeSiteUrl(
    process.env.NEXT_PUBLIC_SITE_URL || process.env.SITE_URL || "https://blakeui.com",
  ),
  sitemapSize: 5000,
};
