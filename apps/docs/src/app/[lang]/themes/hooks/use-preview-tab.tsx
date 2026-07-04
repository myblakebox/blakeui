"use client";

import {parseAsStringLiteral, useQueryState} from "nuqs";
import {useEffect} from "react";

import {tabLabels} from "../constants";

export function usePreviewTab() {
  const [selectedTab, setSelectedTab] = useQueryState(
    "template",
    parseAsStringLiteral(tabLabels).withDefault("components"),
  );

  // The template tabs are hidden, so any incoming ?template= is stale; writing
  // the default makes nuqs (clearOnDefault) drop the param from the URL.
  useEffect(() => {
    if (new URLSearchParams(window.location.search).has("template")) {
      setSelectedTab("components");
    }
  }, [setSelectedTab]);

  return {selectedTab, setSelectedTab};
}
