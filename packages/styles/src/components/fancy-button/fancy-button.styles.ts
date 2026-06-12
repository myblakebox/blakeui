import type {VariantProps} from "tailwind-variants";

import {tv} from "tailwind-variants";

export const fancyButtonVariants = tv({
  base: "fancy-button",
  defaultVariants: {
    fullWidth: false,
    isIconOnly: false,
    size: "md",
    variant: "primary",
  },
  variants: {
    fullWidth: {
      false: "",
      true: "fancy-button--full-width",
    },
    isIconOnly: {
      true: "fancy-button--icon-only",
    },
    size: {
      lg: "fancy-button--lg",
      md: "fancy-button--md",
      sm: "fancy-button--sm",
    },
    variant: {
      basic: "fancy-button--basic",
      danger: "fancy-button--danger",
      neutral: "fancy-button--neutral",
      primary: "fancy-button--primary",
    },
  },
});

export type FancyButtonVariants = VariantProps<typeof fancyButtonVariants>;
