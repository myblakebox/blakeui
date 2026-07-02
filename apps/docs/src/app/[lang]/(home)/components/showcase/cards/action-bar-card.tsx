"use client";

import type {Key} from "@blakeui/react";

import {Tabs} from "@blakeui/react";
import {useCallback, useEffect, useLayoutEffect, useRef, useState} from "react";

import {Iconify} from "@/components/iconify";

/**
 * Naked element — the real Tabs component (structure/selection/keyboard),
 * ported from tabs-2-demo.tsx so users find this exact look in the Tabs docs.
 *
 * KNOWN ISSUE WORKAROUND: under Next 16 / React 19.2, RAC's SelectionIndicator
 * unmounts and remounts a fresh node in the newly selected tab, so its CSS
 * transition never gets a start value — the pill snaps instead of sliding
 * (verified by DOM-marker probing; documented on the Pro side too). Only the
 * VISUAL pill is hand-rolled here: one persistent element positioned via
 * ref + ResizeObserver, styled identically to `.tabs__indicator`.
 */
export function ActionBarCard() {
  const [selected, setSelected] = useState<Key>("chats");
  const listRef = useRef<HTMLDivElement>(null);
  const pillRef = useRef<HTMLDivElement>(null);

  const positionPill = useCallback(() => {
    const list = listRef.current;
    const pill = pillRef.current;

    if (!list || !pill) return;

    const tab = list.querySelector<HTMLElement>('[role="tab"][data-selected="true"]');

    if (!tab) return;

    pill.style.translate = `${tab.offsetLeft}px ${tab.offsetTop}px`;
    pill.style.width = `${tab.offsetWidth}px`;
    pill.style.height = `${tab.offsetHeight}px`;
  }, []);

  // Before paint so the pill never visibly slides in from 0,0 on mount.
  useLayoutEffect(() => {
    positionPill();
  }, [selected, positionPill]);

  useEffect(() => {
    const list = listRef.current;

    if (!list) return;

    const observer = new ResizeObserver(positionPill);

    observer.observe(list);

    return () => observer.disconnect();
  }, [positionPill]);

  return (
    // No padding of its own: the grid gap is the only vertical rhythm.
    <div className="flex w-full justify-center">
      <Tabs
        className="sc-tabs w-full"
        selectedKey={selected}
        onSelectionChange={(key) => setSelected(key)}
      >
        {/* The pill lives in the ListContainer (the positioned ancestor):
            RAC's TabList is a collection renderer and drops non-item children. */}
        <Tabs.ListContainer className="w-full">
          <div ref={pillRef} aria-hidden="true" className="sc-tab-pill" />
          <Tabs.List ref={listRef} aria-label="Inbox view" className="w-full">
            <Tabs.Tab className="flex-1 gap-1.5" id="chats">
              <Iconify icon="comment" />
              <span>Chats</span>
            </Tabs.Tab>
            <Tabs.Tab className="flex-1 gap-1.5" id="emails">
              <Iconify icon="envelope" />
              <span>Emails</span>
            </Tabs.Tab>
          </Tabs.List>
        </Tabs.ListContainer>
      </Tabs>
    </div>
  );
}
