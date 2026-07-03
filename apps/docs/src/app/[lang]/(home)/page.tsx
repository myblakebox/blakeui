import {buttonVariants} from "@blakeui/react";
import LinkRoot from "fumadocs-core/link";
import {notFound} from "next/navigation";

import {Footer} from "@/components/footer";
import {getDictionary, hasLocale} from "@/lib/dictionaries";
import {i18n} from "@/lib/i18n";

import {DemoShowcase} from "./components/demo-showcase";
import {HeroAnnotations} from "./components/hero-annotations";
import {ProBanner} from "./components/pro-banner";

export const dynamic = "force-static";
export const revalidate = false;

export function generateStaticParams() {
  return i18n.languages.map((lang) => ({lang}));
}

export default async function HomePage({params}: {params: Promise<{lang: string}>}) {
  const {lang} = await params;

  if (!hasLocale(lang)) notFound();

  const dict = await getDictionary(lang);
  const {home} = dict;

  return (
    <main className="flex min-h-[calc(100vh-4rem)] flex-col">
      <section className="home-hero z-10 flex min-h-0 flex-1 flex-col items-center px-4 pt-12 text-center">
        <div className="mx-auto flex max-w-4xl flex-col items-center justify-center">
          <h1 className="mt-2 text-3xl font-normal tracking-tight text-foreground sm:text-4xl lg:mt-4 lg:text-5xl">
            <span className="whitespace-nowrap" data-annotate="underline">
              {home.titleUnderline}
            </span>{" "}
            {home.titleMiddle}{" "}
            <span className="whitespace-nowrap" data-annotate="highlight">
              {home.titleHighlight}
            </span>
          </h1>
          <p className="mt-4 text-balance text-muted md:text-lg">{home.description}</p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <LinkRoot
              className={buttonVariants({variant: "primary"})}
              href="/docs/react/getting-started"
            >
              {home.getStarted}
            </LinkRoot>
            <LinkRoot
              className={buttonVariants({variant: "secondary"})}
              href="/docs/react/components"
            >
              {home.viewComponents}
            </LinkRoot>
          </div>
        </div>
        <HeroAnnotations />
        <DemoShowcase />
      </section>
      <Footer dict={dict.footer} />
      <ProBanner />
    </main>
  );
}
