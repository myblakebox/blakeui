import {cn} from "@blakeui/react";

/* -------------------------------------------------------------------------------------------------
 * BlakeUILockup — the delivered BlakeUI lockup (badge + wordmark), served as static SVG assets in
 * two ink variants: BLK for light surfaces, WHT for dark. Artwork used as delivered, <title> added
 * in the files; the badge accent (#436283) stays hardcoded on purpose — a brand mark does not
 * retint with theme presets.
 *
 * SIZING is anchored to the WORDMARK'S CAP HEIGHT, not the SVG box: the badge spans the full
 * 213-unit viewBox height while the wordmark caps span 103.9 units (48.8%), so sizing by SVG
 * height reads small next to nav text. 18px caps put the SVG at 37px tall in the navbar.
 *
 * The old inline `BlakeUILogo` stays for the Satori OG route (the badge's filter stack does not
 * render under Satori) and for currentColor-tinted usages (showcase watermark, banners).
 * -----------------------------------------------------------------------------------------------*/

const CAP_RATIO = 103.9 / 213;
const ASPECT = 603 / 213;
const DEFAULT_CAP_HEIGHT = 18;

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
      <img
        alt="BlakeUI"
        className="dark:hidden"
        height={svgHeight}
        src="/images/blakeui-blk.svg"
        width={svgWidth}
      />
      <img
        alt="BlakeUI"
        className="hidden dark:block"
        height={svgHeight}
        src="/images/blakeui-wht.svg"
        width={svgWidth}
      />
    </span>
  );
}
