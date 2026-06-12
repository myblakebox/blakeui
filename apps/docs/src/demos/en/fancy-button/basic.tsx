"use client";

import {FancyButton} from "@blakeui/react";

export function Basic() {
  return <FancyButton onPress={() => console.log("FancyButton pressed")}>Click me</FancyButton>;
}
