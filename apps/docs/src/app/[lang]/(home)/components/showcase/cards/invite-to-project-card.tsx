"use client";

import type {Key} from "@blakeui/react";

import {
  Card,
  CloseButton,
  FancyButton,
  InputGroup,
  Label,
  ListBox,
  Select,
  Spinner,
  Tag,
  TagGroup,
  TextField,
  Tooltip,
} from "@blakeui/react";
import {useEffect, useRef, useState} from "react";

import {Iconify} from "@/components/iconify";

import {invite} from "../data/placeholder";
import {GradientAvatar} from "../gradient-avatar";
import {prefersReducedMotion, useAutoRevert} from "../use-replay";

const PERMISSIONS = [
  {id: "view", label: "can view"},
  {id: "edit", label: "can edit"},
  {id: "owner", label: "owner"},
];

const SEND_DURATION_MS = 1000;

type InviteState = "idle" | "sending" | "sent";
type Member = (typeof invite.members)[number];

function PermissionSelect({
  className,
  isEmbedded,
  label,
  onChange,
  value,
}: {
  className?: string;
  /** Borderless trigger for nesting inside an InputGroup slot. */
  isEmbedded?: boolean;
  label: string;
  onChange?: (permission: string) => void;
  value: string;
}) {
  return (
    <Select
      aria-label={label}
      className={`${isEmbedded ? "sc-embedded-select" : ""} ${className ?? ""}`}
      selectedKey={value}
      onSelectionChange={(key: Key | null) => key != null && onChange?.(String(key))}
    >
      <Select.Trigger>
        <Select.Value />
        <Select.Indicator />
      </Select.Trigger>
      {/* sc-pop scopes the showcase popover motion guard (popovers portal
          out of .component-showcase, so the class rides along instead).
          The embedded trigger is tiny, so its popover opts out of the
          trigger-width minimum — otherwise options crowd the ✓ indicator. */}
      <Select.Popover className={`sc-pop ${isEmbedded ? "sc-embedded-pop" : ""}`}>
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
  const [invitees, setInvitees] = useState<string[]>([]);
  const [draft, setDraft] = useState("");
  const [invitePermission, setInvitePermission] = useState("view");
  const [inviteState, setInviteState] = useState<InviteState>("idle");
  const [isShaking, setIsShaking] = useState(false);
  const [liveNote, setLiveNote] = useState("");
  const sendTimeoutRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  useEffect(() => () => clearTimeout(sendTimeoutRef.current), []);

  // Replay rule: the sent state settles back to the idle Invite button.
  useAutoRevert(inviteState === "sent", () => setInviteState("idle"));

  // Single-email field: one minted chip at a time.
  const isFull = invitees.length >= 1;

  const mintInvitee = () => {
    const trimmed = draft.trim().replace(/,$/, "");

    if (isFull || !trimmed || !trimmed.includes("@")) return;

    // Already a member: quiet shake + note.
    if (members.some((member) => member.email === trimmed)) {
      setIsShaking(true);
      setLiveNote(`"${trimmed}" is already a member`);

      return;
    }

    setInvitees([trimmed]);
    setLiveNote(`"${trimmed}" ready to invite`);
    setDraft("");
  };

  const onRemoveInvitees = (keys: Set<Key>) => {
    setInvitees((prev) => prev.filter((email) => !keys.has(email)));
  };

  const sendInvites = () => {
    if (inviteState !== "idle" || invitees.length === 0) return;

    const finish = () => {
      // Invited names join the member rows; chips clear for the next replay.
      setMembers((prev) => [
        ...prev,
        ...invitees.map((email) => {
          const name = email.split("@")[0] ?? email;

          return {
            email,
            initials: name.slice(0, 2).toUpperCase(),
            name,
            permission: invitePermission,
          };
        }),
      ]);
      setLiveNote(`${invitees.length} ${invitees.length === 1 ? "invite" : "invites"} sent`);
      setInvitees([]);
      setInviteState("sent");
    };

    // Reduced motion: the pending spinner becomes an instant swap to success.
    if (prefersReducedMotion()) {
      finish();

      return;
    }

    setInviteState("sending");
    sendTimeoutRef.current = setTimeout(finish, SEND_DURATION_MS);
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
          <Iconify className="text-xl text-accent-soft-foreground" icon="person-plus" />
        </div>
        <div className="flex min-w-0 flex-col items-start">
          <Card.Title className="text-sm font-semibold">Invite to Project</Card.Title>
          <span className="text-left text-xs text-muted">
            Collaborate on {invite.project} with your team
          </span>
        </div>
      </Card.Header>
      <Card.Content className="w-full gap-3">
        <TextField className="w-full" value={draft} onChange={setDraft}>
          <div className="flex items-center gap-1.5">
            <Label className="text-xs font-medium">Invite Members</Label>
            <Tooltip delay={0}>
              {/* Quiet treatment: tooltip semantics kept, visual ring stripped
                  (same as C4's Applied Filters info icon). */}
              <FancyButton
                isIconOnly
                aria-label="About member invites"
                className="border-0 bg-transparent shadow-none"
                size="sm"
                variant="basic"
              >
                <Iconify className="text-sm text-muted" icon="circle-info" />
              </FancyButton>
              <Tooltip.Content>
                <Tooltip.Arrow />
                <p>Invited members get an email with a join link.</p>
              </Tooltip.Content>
            </Tooltip>
          </div>
          {/* Tag input (AlignUI pattern), capped at ONE chip: the minted email
              lives INSIDE the field and the text input collapses while a chip
              is present (readOnly, zero width — kept mounted so Backspace
              still removes the chip and restores it). Single-line always. */}
          <div className="flex w-full items-center gap-2">
            <InputGroup
              className={`min-w-0 flex-1 gap-1.5 py-1 ps-3 ${isShaking ? "sc-dupe-shake" : ""}`}
              onAnimationEnd={() => setIsShaking(false)}
            >
              {!!isFull && (
                <TagGroup
                  aria-label="Invitee"
                  className="contents"
                  size="sm"
                  onRemove={onRemoveInvitees}
                >
                  <TagGroup.List className="contents">
                    {invitees.map((email) => (
                      <Tag key={email} className="sc-chip-pop min-w-0" id={email} textValue={email}>
                        <span className="truncate">{email}</span>
                        <Tag.RemoveButton aria-label={`Remove ${email}`} />
                      </Tag>
                    ))}
                  </TagGroup.List>
                </TagGroup>
              )}
              <InputGroup.Input
                aria-label="Invitee email"
                className={isFull ? "w-2 min-w-0 grow-0 p-0 opacity-0" : "min-w-20 flex-1 p-0"}
                placeholder={isFull ? undefined : "name@blakeui.com"}
                readOnly={isFull}
                type="email"
                onKeyDown={(event) => {
                  if (event.key === "Enter" || event.key === ",") {
                    event.preventDefault();
                    mintInvitee();
                  } else if (event.key === "Backspace" && draft === "") {
                    setInvitees([]);
                  }
                }}
              />
              {/* ms-auto pins the select to the field's END in every state —
                  minting a chip collapses the input, but the select stays put. */}
              <InputGroup.Suffix className="ms-auto">
                <PermissionSelect
                  isEmbedded
                  label="Permission for new members"
                  value={invitePermission}
                  onChange={setInvitePermission}
                />
              </InputGroup.Suffix>
            </InputGroup>
            <FancyButton
              isDisabled={invitees.length === 0 && inviteState === "idle"}
              isPending={inviteState === "sending"}
              size="sm"
              variant="primary"
              onPress={sendInvites}
            >
              {inviteState === "sending" ? (
                <Spinner color="current" size="sm" />
              ) : inviteState === "sent" ? (
                <Iconify className="text-base" icon="check" />
              ) : (
                "Invite"
              )}
            </FancyButton>
          </div>
        </TextField>
        {/* Minting, dupes and sends announced without visual noise. */}
        <span aria-live="polite" className="sr-only">
          {liveNote}
        </span>
        <span className="w-full text-left text-xs font-medium text-muted">Members with access</span>
        <ul className="flex w-full flex-col gap-2">
          {members.map((member) => (
            <li key={member.email} className="flex w-full items-center gap-2">
              <GradientAvatar name={member.name} size="sm" />
              <div className="flex min-w-0 flex-1 flex-col items-start">
                <span className="w-full truncate text-left text-sm font-medium">{member.name}</span>
                {/* Live readout: re-renders as this row's Select changes. */}
                <span className="w-full truncate text-left text-xs text-muted">
                  {member.email} &middot;{" "}
                  {PERMISSIONS.find((p) => p.id === member.permission)?.label}
                </span>
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
      </Card.Content>
    </Card>
  );
}
