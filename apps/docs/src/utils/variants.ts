import {buttonVariants} from "@blakeui/react";
import {tv} from "tailwind-variants";

export const docsButtonVariants = tv({
  defaultVariants: {
    size: "sm",
    variant: "tertiary",
  },
  extend: buttonVariants,
  variants: {
    variant: {
      tertiary: "relative gap-2 dark:bg-default/70",
      /**
       * Status rather than a source link. Declared as its own variant instead
       * of a `className` override so nothing has to out-specify the tertiary
       * `dark:bg-default/70` — that class is simply never emitted. The soft
       * warning tokens are already redefined per colour scheme, so there is no
       * `dark:` half to write.
       */
      warningSoft:
        "relative gap-2 bg-warning-soft text-warning-soft-foreground hover:bg-warning-soft-hover",
    },
  },
});
