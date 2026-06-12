"use client";

import type {FancyButtonVariants} from "@blakeui/styles";
import type {ComponentPropsWithRef} from "react";

import {fancyButtonVariants} from "@blakeui/styles";
import {Button as ButtonPrimitive} from "react-aria-components/Button";

import {composeTwRenderProps} from "../../utils";

/* -------------------------------------------------------------------------------------------------
 * FancyButton Root
 * -----------------------------------------------------------------------------------------------*/
interface FancyButtonRootProps
  extends ComponentPropsWithRef<typeof ButtonPrimitive>,
    FancyButtonVariants {}

const FancyButtonRoot = ({
  children,
  className,
  fullWidth,
  isIconOnly,
  size,
  variant,
  ...rest
}: FancyButtonRootProps) => {
  const styles = fancyButtonVariants({
    fullWidth,
    isIconOnly,
    size,
    variant,
  });

  return (
    <ButtonPrimitive
      className={composeTwRenderProps(className, styles)}
      data-slot="fancy-button"
      {...rest}
    >
      {(renderProps) => (typeof children === "function" ? children(renderProps) : children)}
    </ButtonPrimitive>
  );
};

/* -------------------------------------------------------------------------------------------------
 * Exports
 * -----------------------------------------------------------------------------------------------*/
export {FancyButtonRoot};

export type {FancyButtonRootProps};
