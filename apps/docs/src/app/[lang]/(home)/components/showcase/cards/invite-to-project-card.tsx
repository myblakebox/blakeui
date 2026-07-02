"use client";

import type {Key} from "@blakeui/react";

import {
  Avatar,
  Card,
  CloseButton,
  FancyButton,
  InputGroup,
  Label,
  ListBox,
  Select,
  Separator,
  TextField,
  Tooltip,
} from "@blakeui/react";
import {useState} from "react";

import {Iconify} from "@/components/iconify";

import {invite} from "../data/placeholder";

const PERMISSIONS = [
  {id: "view", label: "can view"},
  {id: "edit", label: "can edit"},
  {id: "owner", label: "owner"},
];

type Member = (typeof invite.members)[number];

function PermissionSelect({
  className,
  label,
  onChange,
  value,
}: {
  className?: string;
  label: string;
  onChange?: (permission: string) => void;
  value: string;
}) {
  return (
    <Select
      aria-label={label}
      className={className}
      selectedKey={value}
      onSelectionChange={(key: Key | null) => key != null && onChange?.(String(key))}
    >
      <Select.Trigger>
        <Select.Value />
        <Select.Indicator />
      </Select.Trigger>
      <Select.Popover>
        <ListBox>
          {PERMISSIONS.map((permission) => (
            <ListBox.Item key={permission.id} id={permission.id} textValue={permission.label}>
              {permission.label}
              <ListBox.ItemIndicator />
            </ListBox.Item>
          ))}
        </ListBox>
      </Select.Popover>
    </Select>
  );
}

export function InviteToProjectCard() {
  const [members, setMembers] = useState<Member[]>([...invite.members]);
  const [email, setEmail] = useState("");
  const [invitePermission, setInvitePermission] = useState("view");

  const inviteMember = () => {
    const trimmed = email.trim();

    if (!trimmed.includes("@") || members.some((member) => member.email === trimmed)) return;

    const name = trimmed.split("@")[0] ?? trimmed;

    setMembers((prev) => [
      ...prev,
      {
        email: trimmed,
        initials: name.slice(0, 2).toUpperCase(),
        name,
        permission: invitePermission,
      },
    ]);
    setEmail("");
  };

  const setMemberPermission = (memberEmail: string, permission: string) => {
    setMembers((prev) =>
      prev.map((member) => (member.email === memberEmail ? {...member, permission} : member)),
    );
  };

  return (
    <Card className="relative w-full">
      <CloseButton aria-label="Dismiss invite card" className="absolute top-3 right-3" />
      <Card.Header className="w-full flex-row items-center gap-3 pr-10">
        <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-accent-soft">
          <Iconify className="text-xl text-accent-soft-foreground" icon="persons" />
        </div>
        <div className="flex min-w-0 flex-col items-start">
          <Card.Title className="text-sm font-semibold">Invite to Project</Card.Title>
          <span className="text-left text-xs text-muted">
            Collaborate on {invite.project} with your team
          </span>
        </div>
      </Card.Header>
      <Card.Content className="w-full gap-3">
        <TextField className="w-full" value={email} onChange={setEmail}>
          <div className="flex items-center gap-1.5">
            <Label className="text-xs font-medium">Invite Members</Label>
            <Tooltip delay={0}>
              <FancyButton isIconOnly aria-label="About member invites" size="sm" variant="basic">
                <Iconify className="text-sm text-muted" icon="circle-info" />
              </FancyButton>
              <Tooltip.Content>
                <Tooltip.Arrow />
                <p>Invited members get an email with a join link.</p>
              </Tooltip.Content>
            </Tooltip>
          </div>
          <div className="flex w-full items-center gap-2">
            <InputGroup className="min-w-0 flex-1">
              <InputGroup.Input placeholder="name@blakeui.com" type="email" />
            </InputGroup>
            <PermissionSelect
              className="w-[110px] shrink-0"
              label="Permission for new member"
              value={invitePermission}
              onChange={setInvitePermission}
            />
            <FancyButton size="sm" variant="primary" onPress={inviteMember}>
              Invite
            </FancyButton>
          </div>
        </TextField>
        <span className="w-full text-left text-xs font-medium text-muted">Members with access</span>
        <ul className="flex w-full flex-col gap-2">
          {members.map((member) => (
            <li key={member.email} className="flex w-full items-center gap-2">
              <Avatar size="sm">
                <Avatar.Fallback>{member.initials}</Avatar.Fallback>
              </Avatar>
              <div className="flex min-w-0 flex-1 flex-col items-start">
                <span className="w-full truncate text-left text-sm font-medium">{member.name}</span>
                <span className="w-full truncate text-left text-xs text-muted">{member.email}</span>
              </div>
              <PermissionSelect
                className="w-[110px] shrink-0"
                label={`Permission for ${member.name}`}
                value={member.permission}
                onChange={(permission) => setMemberPermission(member.email, permission)}
              />
            </li>
          ))}
        </ul>
        <Separator />
        <div className="flex w-full items-center gap-2 text-sm text-muted">
          <Iconify className="text-base" icon="link" />
          Members with link can view
        </div>
      </Card.Content>
    </Card>
  );
}
