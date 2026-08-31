"use client";

import type {ComponentLinksType} from "@/utils/extract-links";

import {LocaleLink} from "@/components/locale-link";
import {useDictionary} from "@/hooks/use-dictionary";
import {GithubIcon, RadixUIIcon, ReactAriaIcon, StorybookIcon, TailwindIcon} from "@/icons/dev";
import {generateComponentLinks} from "@/utils/extract-links";
import {docsButtonVariants} from "@/utils/variants";

/** The verdict a component doc declares in its frontmatter. */
export type Completeness = "behavior-required" | "styles-sufficient";

/** Where the pill sends the reader for the explanation of both verdicts. */
const COMPLETENESS_HREF = "/docs/react/getting-started/styling#completeness";

export interface ComponentLinksProps {
  completeness?: Completeness;
  links?: ComponentLinksType;
}

const ButtonLink = ({
  children,
  href,
  startContent,
  ...props
}: React.HTMLProps<HTMLAnchorElement> & {
  startContent?: React.ReactNode;
}) => {
  return (
    <a
      className={docsButtonVariants()}
      href={href}
      rel="noopener noreferrer"
      target="_blank"
      {...props}
    >
      {startContent}
      {children}
    </a>
  );
};

/**
 * Only `behavior-required` says anything worth saying — `styles-sufficient` is
 * the quiet default and renders nothing, as does a doc that declares no verdict
 * at all.
 *
 * This is an internal link, so it stays in the same tab: unlike the source
 * links beside it, it goes to our own handbook rather than someone else's site.
 *
 * The `--focus` ring, the colour-only hover transition and its reduced-motion
 * opt-out all come from `.button`. Nothing new is animated here.
 */
const CompletenessPill = ({completeness}: {completeness?: Completeness}) => {
  const dict = useDictionary().componentLinks;

  if (completeness !== "behavior-required") {
    return null;
  }

  return (
    <LocaleLink
      aria-label={dict.behaviorRequiredHint}
      className={docsButtonVariants({variant: "warningSoft"})}
      href={COMPLETENESS_HREF}
    >
      {dict.behaviorRequired}
    </LocaleLink>
  );
};

export const ComponentLinks = ({completeness, links}: ComponentLinksProps) => {
  const dict = useDictionary().componentLinks;
  const componentLinks = generateComponentLinks(links || null);

  // The pill does not depend on `links`: a component with no external sources
  // still has a completeness verdict worth showing.
  if (!componentLinks && completeness !== "behavior-required") {
    return null;
  }

  return (
    <div className="mb-4 flex flex-wrap gap-2">
      {componentLinks?.storybook ? (
        <ButtonLink
          href={`${componentLinks.storybook}--docs`}
          startContent={<StorybookIcon className="text-lg text-[#ff4785]" />}
        >
          Storybook
        </ButtonLink>
      ) : null}
      {componentLinks?.rac ? (
        <ButtonLink
          href={componentLinks.rac}
          startContent={<ReactAriaIcon className="text-lg text-[#6733FF]" />}
        >
          React Aria
        </ButtonLink>
      ) : null}
      {componentLinks?.radix ? (
        <ButtonLink href={componentLinks.radix} startContent={<RadixUIIcon className="text-lg" />}>
          Radix UI
        </ButtonLink>
      ) : null}
      {componentLinks?.themes ? (
        <ButtonLink href={componentLinks.themes} startContent={<GithubIcon size={20} />}>
          {dict.themeSource}
        </ButtonLink>
      ) : null}
      {componentLinks?.tailwind ? (
        <ButtonLink
          href={componentLinks.tailwind}
          startContent={<TailwindIcon className="text-lg text-[#38bdf8]" />}
        >
          Tailwind CSS
        </ButtonLink>
      ) : null}
      <CompletenessPill completeness={completeness} />
    </div>
  );
};
