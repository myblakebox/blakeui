"use client";

import type {CSSProperties, ReactNode} from "react";
import type {Color} from "react-aria-components";

import {Button, ColorSwatchPicker, Tooltip, buttonVariants} from "@blakeui/react";
import {converter} from "culori";
import {useTheme} from "next-themes";
import {useMemo, useState} from "react";
import {parseColor} from "react-aria-components";

import {ADAPTIVE_DARK_FLIP_LIGHTNESS} from "@/app/[lang]/themes/theme-values";
import {
  calculateAccentForeground,
  getDerivedColorFormulas,
} from "@/app/[lang]/themes/utils/generate-theme-colors";
import {Iconify} from "@/components/iconify";
import {LocaleLink} from "@/components/locale-link";
import {useDictionary} from "@/hooks/use-dictionary";

import "./mac-window.css";

const ACCENT_SWATCHES = [
  "#1C1C1E", // ink
  "#4F46E5", // indigo
  "#8B5CF6", // violet
  "#DB2963", // raspberry
  "#E8590C", // tangerine
  "#0F9D8F", // teal
  "#4D7C0F", // moss
];

const toOklch = converter("oklch");

/**
 * RAC's ColorSwatchPicker derives its selection from the value and disallows
 * empty selection, so "nothing selected" can't be expressed with null —
 * instead the value is parked on a transparent color that matches no swatch
 * key, which clears the ring. (RAC uses the same '#0000' placeholder
 * internally for colorless items.)
 */
const NO_SELECTION = parseColor("#0000");

/**
 * Near-black accents disappear against dark-mode surfaces, so below this
 * lightness they flip to the value the theme builder's adaptiveColors map
 * assigns pure black in dark mode, keeping their own chroma/hue cast. That
 * figure is imported rather than restated. Only ink (l ≈ 0.23) sits under the
 * threshold; the next darkest swatch (indigo, l ≈ 0.51) passes through
 * untouched.
 */
const DARK_FLIP_MAX_LIGHTNESS = 0.3;

/**
 * Same recipe the pre-rebrand DemoShowcase used for its swatch row: the
 * swatch color becomes --accent verbatim, the foreground is picked for
 * contrast against it, and the mode-dependent derived formulas (soft/hover
 * percentages differ between light and dark) come from the theme builder's
 * own utils so the retint matches what /themes would produce.
 */
function getAccentStyleVars(color: Color, theme: "light" | "dark"): Record<string, string> {
  const oklch = toOklch(color.toString("css"));

  if (!oklch) return {};

  let l = oklch.l ?? 0;
  const c = oklch.c ?? 0;
  const h = oklch.h ?? 0;

  if (theme === "dark" && l < DARK_FLIP_MAX_LIGHTNESS) {
    l = ADAPTIVE_DARK_FLIP_LIGHTNESS;
  }

  const accent = `oklch(${(l * 100).toFixed(2)}% ${c.toFixed(4)} ${h.toFixed(2)})`;
  const accentFg = calculateAccentForeground(l, c, h);

  return {
    "--accent": accent,
    "--accent-foreground": accentFg,
    "--focus": accent,
    ...getDerivedColorFormulas(theme),
  };
}

interface MacWindowProps {
  children: ReactNode;
  /**
   * Renders the interactive right cluster (reset + accent swatches + theme
   * builder link). Off, the frame is pure decoration: the whole titlebar is
   * aria-hidden and nothing inside it is interactive.
   */
  showCluster?: boolean;
  /** Address-pill text centered in the bar; pass an empty string to hide it. */
  title?: string;
}

/**
 * macOS-style window frame, AlignUI-flat: one continuous surface behind a
 * hairline outline — no titlebar band — whose bottom edge dissolves into the
 * page. DOM-based rather than an aspect-ratio mockup so it grows with
 * whatever live content it wraps. The dots and address pill are decorative
 * (aria-hidden); the right cluster is real UI — accent swatches that retint
 * the framed content via inline vars on mw-content, and a link into the
 * theme builder.
 */
export function MacWindow({children, showCluster = true, title = "blakeui.com"}: MacWindowProps) {
  const dict = useDictionary();
  const [selectedColor, setSelectedColor] = useState<Color | null>(null);
  const {resolvedTheme} = useTheme();
  const currentTheme: "light" | "dark" = resolvedTheme === "dark" ? "dark" : "light";

  const accentVars = useMemo(
    () => (selectedColor ? getAccentStyleVars(selectedColor, currentTheme) : undefined),
    [selectedColor, currentTheme],
  );

  return (
    <figure className="mac-window" role="presentation">
      <div aria-hidden={showCluster ? undefined : true} className="mw-titlebar">
        <span aria-hidden="true" className="mw-dots">
          <span className="mw-dot mw-close" />
          <span className="mw-dot mw-min" />
          <span className="mw-dot mw-zoom" />
        </span>
        {title ? (
          <span aria-hidden="true" className="mw-pill">
            <Iconify icon="lock" />
            {title}
          </span>
        ) : null}
        {showCluster ? (
          <div className="mw-cluster">
            <Tooltip delay={0}>
              <Tooltip.Trigger>
                <Button
                  isIconOnly
                  aria-label={dict.themeBuilder.resetButton.tooltip}
                  className="text-muted"
                  size="sm"
                  variant="ghost"
                  onPress={() => setSelectedColor(null)}
                >
                  <Iconify icon="arrow-rotate-left" />
                </Button>
              </Tooltip.Trigger>
              <Tooltip.Content className="py-0">
                {dict.themeBuilder.resetButton.tooltip}
              </Tooltip.Content>
            </Tooltip>
            <ColorSwatchPicker
              aria-label={dict.themeBuilder.accentColor.label}
              size="sm"
              value={selectedColor ?? NO_SELECTION}
              onChange={setSelectedColor}
            >
              {ACCENT_SWATCHES.map((color) => (
                <ColorSwatchPicker.Item key={color} color={color}>
                  <ColorSwatchPicker.Swatch />
                  <ColorSwatchPicker.Indicator />
                </ColorSwatchPicker.Item>
              ))}
            </ColorSwatchPicker>
            <Tooltip delay={0}>
              <Tooltip.Trigger>
                <LocaleLink
                  aria-label={dict.nav.themes}
                  href="/themes"
                  className={buttonVariants({
                    className: "text-muted",
                    isIconOnly: true,
                    size: "sm",
                    variant: "ghost",
                  })}
                >
                  <Iconify icon="palette" />
                </LocaleLink>
              </Tooltip.Trigger>
              <Tooltip.Content className="py-0">{dict.nav.themes}</Tooltip.Content>
            </Tooltip>
          </div>
        ) : null}
      </div>
      <div className="mw-content" style={accentVars as CSSProperties}>
        {children}
      </div>
    </figure>
  );
}
