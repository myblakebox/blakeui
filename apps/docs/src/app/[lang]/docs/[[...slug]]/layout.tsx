import type {CSSProperties, ReactNode} from "react";

import {Separator} from "@blakeui/react";

import {HeaderBanner, ProBanner} from "@/app/[lang]/(home)/components/pro-banner";
import {SHOW_BANNER} from "@/app/[lang]/(home)/components/pro-constants";
import {baseOptions} from "@/app/[lang]/layout.config";
import {BlakeUILogo} from "@/components/blakeui-logo";
import {FrameworksTabs} from "@/components/frameworks-tabs";
import {DocsLayout} from "@/components/fumadocs/layouts/notebook";
import {ThemeToggle} from "@/components/fumadocs/ui/theme-toggle";
import {source} from "@/lib/source";

const DOCS_TOP_BANNER_HEIGHT = "2rem";

export default async function Layout({
  children,
  params,
}: {
  params: Promise<{lang: string}>;
  children: ReactNode;
}) {
  // The top banner is rendered in normal flow, so --fd-banner-height would incorrectly
  // offset sticky docs elements after the banner scrolls away. Reduce only the docs
  // viewport height to keep the sidebar scroll area inside the visible viewport.
  const layoutStyle = SHOW_BANNER
    ? ({"--fd-docs-height": `calc(100dvh - ${DOCS_TOP_BANNER_HEIGHT})`} as CSSProperties)
    : undefined;

  const {lang} = await params;

  return (
    <>
      <HeaderBanner />
      <DocsLayout
        containerProps={{style: layoutStyle}}
        tabMode="navbar"
        tree={source.getPageTree(lang)}
        sidebar={{
          banner: () => (
            <div className="flex flex-col items-start justify-center gap-4 px-4 pt-4 sm:hidden">
              <div className="flex w-full items-center justify-between gap-4 pl-1">
                <BlakeUILogo />
                <ThemeToggle mode="light-dark-system" />
              </div>
              <Separator />
            </div>
          ),
          collapsible: false,
          defaultOpenLevel: 0,
          footer: () => (
            <div className="px-4 pb-4 sm:hidden">
              <FrameworksTabs />
            </div>
          ),
          headerTabsProps: {
            children: <FrameworksTabs className="hidden md:flex" />,
            filterByPathname: true,
          },
          tabs: {
            transform: (tab) => {
              return {
                ...tab,
                title: (
                  <div
                    aria-label={typeof tab.title === "string" ? tab.title : ""}
                    className="flex items-center gap-2"
                  >
                    {tab.icon}
                    <span>{tab.title}</span>
                  </div>
                ),
              };
            },
          },
        }}
        themeSwitch={{
          mode: "light-dark-system",
        }}
        {...baseOptions}
        nav={{
          ...baseOptions.nav,
          mode: "top",
          title: <BlakeUILogo />,
        }}
      >
        {children}
      </DocsLayout>
      <ProBanner />
    </>
  );
}
