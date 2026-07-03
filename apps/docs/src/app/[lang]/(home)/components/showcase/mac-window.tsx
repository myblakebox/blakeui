"use client";

import type {ReactNode} from "react";

import {Iconify} from "@/components/iconify";

import "./mac-window.css";

interface MacWindowProps {
  children: ReactNode;
  /** Address-pill text centered in the bar; pass an empty string to hide it. */
  title?: string;
}

/**
 * Decorative macOS-style window frame, AlignUI-flat: one continuous surface
 * behind a hairline outline — no titlebar band — whose bottom edge dissolves
 * into the page. DOM-based rather than an aspect-ratio mockup so it grows
 * with whatever live content it wraps; all chrome (dots, address pill, ghost
 * icons) is presentational and stays out of the accessibility tree.
 */
export function MacWindow({children, title = "blakeui.com"}: MacWindowProps) {
  return (
    <figure className="mac-window" role="presentation">
      <div aria-hidden="true" className="mw-titlebar">
        <span className="mw-dots">
          <span className="mw-dot mw-close" />
          <span className="mw-dot mw-min" />
          <span className="mw-dot mw-zoom" />
        </span>
        {title ? (
          <span className="mw-pill">
            <Iconify icon="lock" />
            {title}
          </span>
        ) : null}
        <span className="mw-icons">
          <Iconify icon="arrow-up-right-from-square" />
          <Iconify icon="plus" />
          <Iconify icon="copy" />
        </span>
      </div>
      <div className="mw-content">{children}</div>
    </figure>
  );
}
