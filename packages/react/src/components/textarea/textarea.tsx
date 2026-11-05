"use client";

import type {TextAreaVariants} from "@blakeui/styles";
import type {ComponentPropsWithRef} from "react";

import {textAreaVariants} from "@blakeui/styles";
import React, {use, useMemo} from "react";
import {TextArea as TextAreaPrimitive} from "react-aria-components/TextArea";

import {useResolvedClassName} from "../../utils";
import {TextFieldContext} from "../textfield";

/* -------------------------------------------------------------------------------------------------
 * TextArea Root
 * -----------------------------------------------------------------------------------------------*/
interface TextAreaRootProps
  extends ComponentPropsWithRef<typeof TextAreaPrimitive>, TextAreaVariants {}

const TextAreaRoot = ({className, fullWidth, variant, ...rest}: TextAreaRootProps) => {
  const textFieldContext = use(TextFieldContext);
  const resolvedVariant = variant ?? textFieldContext?.variant;
  const styles = useMemo(
    () => textAreaVariants({fullWidth, variant: resolvedVariant}),
    [fullWidth, resolvedVariant],
  );
  const resolvedClassName = useResolvedClassName(className, styles);

  return <TextAreaPrimitive className={resolvedClassName} data-slot="textarea" {...rest} />;
};

TextAreaRoot.displayName = "BlakeUI.TextArea";

/* -------------------------------------------------------------------------------------------------
 * Exports
 * -----------------------------------------------------------------------------------------------*/
export {TextAreaRoot};

export type {TextAreaRootProps};
