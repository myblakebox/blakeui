"use client";

import {Card, Dropdown, FancyButton, Label, Link, Tooltip} from "@blakeui/react";
import {useState} from "react";
import {Focusable} from "react-aria-components";

import {Iconify} from "@/components/iconify";

import {contactInfo} from "../data/placeholder";
import {GradientAvatar} from "../gradient-avatar";
import {useAutoRevert} from "../use-replay";

const HOVER_ROWS = [
  {
    detail: "Pacific Time · UTC−8",
    icon: "map-pin",
    label: "Location",
    value: contactInfo.location,
  },
  {
    detail: "Tokens, theming & component APIs",
    icon: "brush",
    label: "Specialty",
    value: contactInfo.specialty,
  },
];

export function ContactInfoCard() {
  const [isCopied, setIsCopied] = useState(false);

  // Replay rule: the "Copied" confirmation reverts to the idle copy affordance.
  useAutoRevert(isCopied, () => setIsCopied(false));

  const copyEmail = () => {
    // Fire-and-forget: the demo confirmation matters more than clipboard
    // failures (which only occur in denied-permission edge cases).
    void navigator.clipboard?.writeText(contactInfo.email).catch(() => {});
    setIsCopied(true);
  };

  return (
    <Card className="w-full">
      <Card.Header className="w-full flex-row items-center justify-between">
        <Card.Title className="text-sm font-semibold">Contact Info</Card.Title>
        <Link className="text-sm" href="#">
          View Profile
        </Link>
      </Card.Header>
      <Card.Content className="w-full gap-3">
        <div className="flex w-full items-center gap-3 rounded-xl border border-dashed border-border p-3">
          <GradientAvatar name={contactInfo.name} />
          <div className="flex min-w-0 flex-1 flex-col items-start">
            <span className="text-sm font-semibold">{contactInfo.name}</span>
            <span className="text-xs text-muted">{contactInfo.handle}</span>
          </div>
          <Dropdown>
            <FancyButton
              isIconOnly
              aria-label={`Actions for ${contactInfo.name}`}
              size="sm"
              variant="basic"
            >
              <Iconify className="text-base" icon="person-plus" />
            </FancyButton>
            {/* sc-pop carries the showcase popover motion guard (portaled);
                sc-menu-pop drops the stock md:min-w-55 so the menu fits its
                longest item, and "bottom end" opens it leftward from the
                trigger's right edge — away from the neighboring column. */}
            <Dropdown.Popover className="sc-pop sc-menu-pop" placement="bottom end">
              <Dropdown.Menu aria-label={`Actions for ${contactInfo.name}`} onAction={() => {}}>
                <Dropdown.Item id="follow" textValue="Follow">
                  <Iconify className="text-base text-muted" icon="person-plus" />
                  <Label>Follow</Label>
                </Dropdown.Item>
                <Dropdown.Item id="message" textValue="Message">
                  <Iconify className="text-base text-muted" icon="comment" />
                  <Label>Message</Label>
                </Dropdown.Item>
                <Dropdown.Item id="profile" textValue="Profile">
                  <Iconify className="text-base text-muted" icon="person" />
                  <Label>Profile</Label>
                </Dropdown.Item>
              </Dropdown.Menu>
            </Dropdown.Popover>
          </Dropdown>
        </div>
        <ul className="flex w-full flex-col gap-3">
          {HOVER_ROWS.map((row) => (
            <Tooltip key={row.label} delay={0}>
              <Focusable>
                <li
                  className="flex w-full items-center gap-3 rounded-lg transition-colors hover:bg-default-soft/60"
                  role="listitem"
                >
                  <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-default-soft">
                    <Iconify className="text-base text-muted" icon={row.icon} />
                  </div>
                  <div className="flex min-w-0 flex-col items-start">
                    <span className="text-[10px] font-medium tracking-wider text-muted uppercase">
                      {row.label}
                    </span>
                    <span className="w-full truncate text-left text-sm">{row.value}</span>
                  </div>
                </li>
              </Focusable>
              <Tooltip.Content>
                <Tooltip.Arrow />
                <p>{row.detail}</p>
              </Tooltip.Content>
            </Tooltip>
          ))}
          <li className="flex w-full items-center gap-3">
            <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-default-soft">
              <Iconify className="text-base text-muted" icon="envelope" />
            </div>
            <div className="flex min-w-0 flex-1 flex-col items-start">
              <span className="text-[10px] font-medium tracking-wider text-muted uppercase">
                Email
              </span>
              <span className="w-full truncate text-left text-sm">{contactInfo.email}</span>
            </div>
            <Tooltip delay={0}>
              <FancyButton
                isIconOnly
                aria-label={isCopied ? "Email copied" : "Copy email"}
                size="sm"
                variant="basic"
                onPress={copyEmail}
              >
                <Iconify
                  className={`text-base ${isCopied ? "text-success" : ""}`}
                  icon={isCopied ? "check" : "copy"}
                />
              </FancyButton>
              <Tooltip.Content>
                <Tooltip.Arrow />
                <p>{isCopied ? "Copied!" : "Copy email"}</p>
              </Tooltip.Content>
            </Tooltip>
          </li>
        </ul>
        {/* Copy confirmation announced for screen readers too. */}
        <span aria-live="polite" className="sr-only">
          {isCopied ? "Email copied to clipboard" : ""}
        </span>
      </Card.Content>
    </Card>
  );
}
