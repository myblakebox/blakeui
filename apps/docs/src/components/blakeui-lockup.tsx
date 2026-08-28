import {cn} from "@blakeui/react";

import {LockupBlk} from "@/components/brand/lockup-blk";
import {LockupWht} from "@/components/brand/lockup-wht";

/* -------------------------------------------------------------------------------------------------
 * BlakeUILockup — the delivered BlakeUI lockup (badge + wordmark), inlined from the delivered SVG
 * artwork in two ink variants: BLK for light surfaces, WHT for dark. Artwork used as delivered,
 * <title> in the files carries the accessible name; the badge accent (#436283) stays hardcoded on
 * purpose — a brand mark does not retint with theme presets.
 *
 * INLINED, not <img src>: WebKit rasterises an <img>-loaded SVG at deviceScaleFactor 1, so the
 * badge's filtered <g> is drawn at 1 raster px per CSS px and stretched 2x on Retina while the
 * unfiltered wordmark stays sharp. Inline <svg> rasterises the filter at true device resolution.
 *
 * SIZING is anchored to the WORDMARK'S CAP HEIGHT, not the SVG box: the delivered 147-unit
 * viewBox bounds the artwork tightly (no dead space), with the wordmark caps spanning 103.9
 * units of it (70.7%). 24px caps put the SVG at 34px tall in the navbar: level with the
 * tallest other element in the 56px bar and 11px clear top and bottom.
 *
 * The size is pinned with an inline `style` as well as width/height attributes: fumadocs' notebook
 * sidebar/navbar carry `[&_svg]:size-4`, which would otherwise win over the attributes and shrink
 * the lockup to an icon. `h-auto` stands in for the img-only `height:auto` Tailwind preflight used
 * to supply, so the box is identical to the <img> it replaced.
 *
 * The old inline `BlakeUILogo` stays for the Satori OG route (the badge's filter stack does not
 * render under Satori) and for currentColor-tinted usages (showcase watermark, banners).
 * -----------------------------------------------------------------------------------------------*/

const CAP_RATIO = 103.9 / 147;
const ASPECT = 584 / 147;
const DEFAULT_CAP_HEIGHT = 24;

interface BlakeUILockupProps {
  className?: string;
  /** Wordmark cap height in px — the lockup scales so the caps render exactly this tall. */
  capHeight?: number;
}

export function BlakeUILockup({capHeight = DEFAULT_CAP_HEIGHT, className}: BlakeUILockupProps) {
  const svgHeight = Math.round(capHeight / CAP_RATIO);
  const svgWidth = Math.round(svgHeight * ASPECT);

  return (
    <span className={cn("inline-flex shrink-0", className)}>
      <LockupBlk
        className="h-auto dark:hidden"
        height={svgHeight}
        style={{height: svgHeight, width: svgWidth}}
        width={svgWidth}
      />
      <LockupWht
        className="hidden h-auto dark:block"
        height={svgHeight}
        style={{height: svgHeight, width: svgWidth}}
        width={svgWidth}
      />
    </span>
  );
}
