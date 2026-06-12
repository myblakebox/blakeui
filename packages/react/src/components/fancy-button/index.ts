import type {ComponentProps} from "react";

import {FancyButtonRoot} from "./fancy-button";

/* -------------------------------------------------------------------------------------------------
 * Compound Component
 * -----------------------------------------------------------------------------------------------*/
export const FancyButton = Object.assign(FancyButtonRoot, {
  Root: FancyButtonRoot,
});

export type FancyButton = {
  Props: ComponentProps<typeof FancyButtonRoot>;
  RootProps: ComponentProps<typeof FancyButtonRoot>;
};

/* -------------------------------------------------------------------------------------------------
 * Named Component
 * -----------------------------------------------------------------------------------------------*/
export {FancyButtonRoot};

export type {FancyButtonRootProps, FancyButtonRootProps as FancyButtonProps} from "./fancy-button";

/* -------------------------------------------------------------------------------------------------
 * Variants
 * -----------------------------------------------------------------------------------------------*/
export {fancyButtonVariants} from "@blakeui/styles";

export type {FancyButtonVariants} from "@blakeui/styles";
