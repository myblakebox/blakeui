import type {InferMetaType, InferPageType} from "fumadocs-core/source";

import {loader} from "fumadocs-core/source";

import {i18n} from "@/lib/i18n";

import {createMetaIcon} from "./meta-icon";

import {docs} from "@/.source";

// `loader()` also assign a URL to your pages
// See https://fumadocs.vercel.app/docs/headless/source-api for more info
export const source = loader({
  baseUrl: "/docs",
  i18n,
  icon(icon) {
    return createMetaIcon(icon);
  },
  source: docs.toFumadocsSource(),
});

export type Page = InferPageType<typeof source>;
export type Meta = InferMetaType<typeof source>;

/**
 * Pages hidden from the site entirely: navigation, direct URL (404), search,
 * sitemap, and llms.txt. Nothing is hidden anymore — the React Releases tab is
 * visible again, with release notes starting at v1.0.1.
 */
export function isHiddenPage(_page: {slugs: string[]}): boolean {
  return false;
}
