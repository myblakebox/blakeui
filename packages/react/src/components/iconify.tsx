"use client";

import type {IconProps} from "@iconify/react";

import {Icon as IconifyIcon} from "@iconify/react";
import icIcons from "@iconify-json/ic/icons.json";
import React, {forwardRef, useId, useMemo} from "react";

import {resolveTwoToneIconName} from "./icon-map";

type IconData = {body: string; width?: number; height?: number};

const icIconSet = icIcons.icons as Record<string, IconData>;
const icDefaultSize = icIcons.height ?? 24;

// Renders a MUI Material Icons Two Tone glyph inline, dimming its secondary
// layer to 15% (Material ships it at 30%). Colour is inherited via
// currentColor, so it follows the surrounding text / theme foreground.
function TwoToneSvg({
  iconData,
  ref,
  ...props
}: {
  iconData: IconData;
  ref?: React.Ref<SVGSVGElement>;
} & Omit<IconProps, "icon">) {
  const {className, height = "1em", style, width = "1em", ...restProps} = props;

  const viewBox =
    iconData.width && iconData.height ? `0 0 ${iconData.width} ${iconData.height}` : "0 0 24 24";

  const uniqueId = useId().replace(/:/g, "");

  const processedBody = useMemo(() => {
    const body = iconData.body.replace(/opacity="0?\.3"/g, 'opacity="0.15"');

    if (!body.includes("id=")) {
      return body;
    }

    const regex = /\bid=["']([^"']+)["']|url\(#([^)]+)\)|(?:href|xlink:href)=["']#([^"']+)["']/g;

    return body.replace(regex, (match, g1, g2, g3) => {
      const id = g1 || g2 || g3;

      if (!id) return match;

      const newId = `${id}-${uniqueId}`;

      if (g1) return `id="${newId}"`;
      if (g2) return `url(#${newId})`;
      if (g3) return `href="#${newId}"`;

      return match;
    });
  }, [iconData.body, uniqueId]);

  return (
    <svg
      ref={ref}
      aria-hidden="true"
      className={className}
      height={height}
      role="img"
      style={style}
      viewBox={viewBox}
      width={width}
      xmlns="http://www.w3.org/2000/svg"
      {...restProps}
      dangerouslySetInnerHTML={{__html: processedBody}}
    />
  );
}

export type IconifyProps = IconProps & {icon?: IconProps["icon"] | string};

/**
 * Drop-in replacement for `@iconify/react`'s `Icon` that maps legacy gravity-ui
 * names to MUI Material Icons (Two Tone) and renders them inline. Brand logos
 * and unmapped names fall through to the online Icon component unchanged.
 */
const Icon = forwardRef<SVGSVGElement, IconifyProps>(({icon, ...props}, ref) => {
  if (typeof icon === "string") {
    const twoToneName = resolveTwoToneIconName(icon);
    const data = twoToneName ? icIconSet[twoToneName] : undefined;

    if (data) {
      return (
        <TwoToneSvg
          ref={ref}
          iconData={{
            body: data.body,
            height: data.height ?? icDefaultSize,
            width: data.width ?? icDefaultSize,
          }}
          {...props}
        />
      );
    }
  }

  return <IconifyIcon {...props} ref={ref} icon={icon} />;
});

Icon.displayName = "BlakeUI.Icon";

export {Icon};
