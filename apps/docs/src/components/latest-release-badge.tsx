import {cn} from "@/utils/cn";
import {currentVersion} from "@/utils/version";

/* -------------------------------------------------------------------------------------------------
 * LatestReleaseBadge
 * -------------------------------------------------------------------------------------------------
 * The hero's version pill: a small link that names the version currently shipped and points at its
 * release notes. It is a server component on purpose — the version is resolved during render, so the
 * pill is present in the first HTML the browser paints and can never shift the headline below it.
 *
 * Two sources, in order of preference:
 *   1. GitHub's "latest release" endpoint, revalidated hourly, which knows the real tag and the exact
 *      notes page for it.
 *   2. The version in packages/react/package.json (already re-exported by @/utils/version for the
 *      docs version selector), plus the repository's releases index.
 *
 * The second source is a static import, so a rate-limited, unreachable or malformed API never leaves
 * the hero without a badge, and no version string is ever written down here by hand.
 * -----------------------------------------------------------------------------------------------*/

const REPOSITORY_URL = "https://github.com/myblakebox/blakeui";
const RELEASES_URL = `${REPOSITORY_URL}/releases`;
const LATEST_RELEASE_API = "https://api.github.com/repos/myblakebox/blakeui/releases/latest";

interface ReleaseTarget {
  href: string;
  label: string;
}

/**
 * Collapse whatever shape a tag arrives in — `v1.4.0`, `1.4.0`, `@blakeui/react@1.4.0`, `1.4.0-beta.2`
 * — down to the `v<major>.<minor>.<patch>` the pill displays. Returns null when there is no version
 * in the string at all, which is the signal to fall through to the next source.
 */
function normalizeVersion(raw: string | undefined | null): string | null {
  const match = /(\d+)\.(\d+)\.(\d+)/.exec(raw ?? "");

  return match ? `v${match[1]}.${match[2]}.${match[3]}` : null;
}

/**
 * Only ever link back into the repository the badge is about. `html_url` is third-party data, so an
 * unexpected payload downgrades to the releases index rather than becoming the link target.
 */
function safeReleaseUrl(htmlUrl: string | undefined): string {
  return htmlUrl?.startsWith(`${REPOSITORY_URL}/releases/`) ? htmlUrl : RELEASES_URL;
}

async function fetchLatestRelease(): Promise<ReleaseTarget | null> {
  try {
    const response = await fetch(LATEST_RELEASE_API, {
      headers: {Accept: "application/vnd.github+json"},
      next: {revalidate: 3600},
    });

    if (!response.ok) return null;

    const release = (await response.json()) as {html_url?: string; tag_name?: string};
    const label = normalizeVersion(release.tag_name);

    return label ? {href: safeReleaseUrl(release.html_url), label} : null;
  } catch {
    // Offline, DNS failure, rate limit served as a non-JSON body — all the same to the hero.
    return null;
  }
}

export async function LatestReleaseBadge({className}: {className?: string}) {
  const latest = await fetchLatestRelease();
  const fallbackLabel = normalizeVersion(currentVersion);
  const label = latest?.label ?? fallbackLabel;

  // Unreachable while packages/react/package.json carries a semver version, but an empty pill would
  // be worse than no pill, so the badge withholds itself rather than rendering a blank link.
  if (!label) return null;

  /* The wash is the design system's soft-accent chip pair (--accent-soft / --accent-soft-hover), but
     the label is --foreground rather than --accent-soft-foreground: at this 12px size that pairing
     measures 4.37:1 on the dark page and misses AA, where --foreground holds 9.94:1 light and
     11.87:1 dark. The accent identity stays in the pill and in the --focus ring. */
  return (
    <a
      aria-label={`BlakeUI ${label} — view release notes`}
      href={latest?.href ?? RELEASES_URL}
      className={`release-badge ${cn(
        "inline-flex items-center rounded-full bg-accent-soft px-2 py-1 font-sans text-xs font-medium text-foreground transition-colors hover:bg-accent-soft-hover focus-visible:focus-ring motion-reduce:transition-none",
        className,
      )}`}
    >
      {label}
    </a>
  );
}

export default LatestReleaseBadge;
