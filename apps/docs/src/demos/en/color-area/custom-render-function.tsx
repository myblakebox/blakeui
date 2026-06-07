"use client";

import {ColorArea} from "@blakeui/react";

export function CustomRenderFunction() {
  return (
    <ColorArea
      defaultValue="rgb(116, 52, 255)"
      render={(props) => <div {...props} data-custom="slider" />}
    >
      <ColorArea.Thumb render={(props) => <div {...props} data-custom="thumb" />} />
    </ColorArea>
  );
}
