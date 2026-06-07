import type {ReactNode} from "react";

import {HomeLayout} from "fumadocs-ui/layouts/home";
import {notFound} from "next/navigation";

import {baseOptions} from "@/app/[lang]/layout.config";
import {LanguageToggleSlot, LanguageToggleText} from "@/components/fumadocs/ui/language-toggle";
import {SearchToggle} from "@/components/fumadocs/ui/search-toggle";
import {getDictionary, hasLocale} from "@/lib/dictionaries";

import {getHomeLayoutLinks} from "./home-layout-links";

export default async function Layout({
  children,
  params,
}: {
  children: ReactNode;
  params: Promise<{lang: string}>;
}) {
  const {lang} = await params;

  if (!hasLocale(lang)) notFound();

  const dict = await getDictionary(lang);

  return (
    <HomeLayout
      {...baseOptions}
      links={getHomeLayoutLinks(dict, lang)}
      searchToggle={{
        components: {
          sm: <SearchToggle hideIfDisabled className="p-2" />,
        },
      }}
      slots={{
        languageSelect: {
          root: LanguageToggleSlot,
          text: LanguageToggleText,
        },
      }}
      themeSwitch={{
        mode: "light-dark-system",
      }}
    >
      {children}
    </HomeLayout>
  );
}
