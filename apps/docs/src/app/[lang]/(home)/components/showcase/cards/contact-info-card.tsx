"use client";

import {Avatar, Card, FancyButton, Link} from "@blakeui/react";

import {Iconify} from "@/components/iconify";

import {contactInfo} from "../data/placeholder";

const metadata = [
  {icon: "map-pin", label: "Location", value: contactInfo.location},
  {icon: "brush", label: "Specialty", value: contactInfo.specialty},
  {icon: "envelope", label: "Email", value: contactInfo.email},
];

export function ContactInfoCard() {
  return (
    <Card className="w-full">
      <Card.Header className="w-full flex-row items-center justify-between">
        <Card.Title className="text-sm font-semibold">Contact Info</Card.Title>
        <Link className="text-sm" href="#">
          View Profile
        </Link>
      </Card.Header>
      <Card.Content className="w-full gap-3">
        <div className="flex w-full items-center gap-3 rounded-xl border border-border p-3">
          <Avatar>
            <Avatar.Fallback>{contactInfo.initials}</Avatar.Fallback>
          </Avatar>
          <div className="flex min-w-0 flex-1 flex-col items-start">
            <span className="text-sm font-semibold">{contactInfo.name}</span>
            <span className="text-xs text-muted">{contactInfo.handle}</span>
          </div>
          <FancyButton isIconOnly aria-label={`Add ${contactInfo.name}`} size="sm" variant="basic">
            <Iconify className="text-base" icon="person-plus" />
          </FancyButton>
        </div>
        <ul className="flex w-full flex-col gap-3">
          {metadata.map((row) => (
            <li key={row.label} className="flex w-full items-center gap-3">
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
          ))}
        </ul>
      </Card.Content>
    </Card>
  );
}
