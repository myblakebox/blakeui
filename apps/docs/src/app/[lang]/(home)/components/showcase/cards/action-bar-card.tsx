"use client";

import type {Key} from "@blakeui/react";

import {ToggleButton, ToggleButtonGroup} from "@blakeui/react";
import {useState} from "react";

import {Iconify} from "@/components/iconify";

/**
 * Naked element — no card wrapper. The segmented-pill treatment (surface pill
 * container, selected segment raised with shadow, unselected muted) lives in
 * showcase.css under `.sc-segmented`.
 */
export function ActionBarCard() {
  const [selected, setSelected] = useState<Set<Key>>(new Set(["chats"]));

  return (
    <div className="flex w-full justify-center py-2">
      <ToggleButtonGroup
        disallowEmptySelection
        isDetached
        aria-label="Inbox view"
        className="sc-segmented w-full"
        selectedKeys={selected}
        selectionMode="single"
        onSelectionChange={(keys) => setSelected(new Set(keys))}
      >
        <ToggleButton className="flex-1" id="chats">
          <Iconify className="text-base" icon="comment" />
          Chats
        </ToggleButton>
        <ToggleButton className="flex-1" id="emails">
          <Iconify className="text-base" icon="envelope" />
          Emails
        </ToggleButton>
      </ToggleButtonGroup>
    </div>
  );
}
