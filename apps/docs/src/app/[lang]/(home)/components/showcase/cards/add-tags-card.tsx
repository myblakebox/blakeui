"use client";

import type {Key} from "@blakeui/react";

import {
  Card,
  Checkbox,
  Chip,
  FancyButton,
  InputGroup,
  Label,
  Separator,
  Tag,
  TagGroup,
  TextField,
  Tooltip,
} from "@blakeui/react";
import {useState} from "react";

import {Iconify} from "@/components/iconify";

import {addTags} from "../data/placeholder";

/**
 * Tag has no color prop in 1.1.2, so the chip color variety comes from the
 * semantic soft tokens Chip uses, hashed per tag name so colors stay stable
 * as tags come and go.
 */
const TAG_COLOR_CLASSES = [
  "bg-accent-soft text-accent-soft-foreground",
  "bg-success-soft text-success-soft-foreground",
  "bg-warning-soft text-warning-soft-foreground",
  "", // default
  "bg-danger-soft text-danger-soft-foreground",
];

function tagColorClass(tag: string): string {
  let hash = 0;

  for (const char of tag) hash = (hash * 31 + char.charCodeAt(0)) % 997;

  return TAG_COLOR_CLASSES[hash % TAG_COLOR_CLASSES.length] as string;
}

export function AddTagsCard() {
  const [tags, setTags] = useState<string[]>([...addTags.tags]);
  const [draft, setDraft] = useState("");
  // Only chips minted after mount pop in; the initial set renders quietly.
  const [popTags, setPopTags] = useState<Set<string>>(new Set());
  const [isShaking, setIsShaking] = useState(false);
  const [liveNote, setLiveNote] = useState("");

  const isFull = tags.length >= addTags.maxTags;

  const addTag = () => {
    const trimmed = draft.trim();

    if (!trimmed || isFull) return;

    // Duplicate: quiet shake on the field plus a screen-reader note.
    if (tags.includes(trimmed)) {
      setIsShaking(true);
      setLiveNote(`"${trimmed}" is already added`);

      return;
    }

    setTags((prev) => [...prev, trimmed]);
    setPopTags((prev) => new Set(prev).add(trimmed));
    setLiveNote(`"${trimmed}" added`);
    setDraft("");
  };

  const onRemove = (keys: Set<Key>) => {
    setTags((prev) => prev.filter((tag) => !keys.has(tag)));
  };

  return (
    <Card className="w-full">
      <Card.Header className="w-full flex-row items-center gap-1.5">
        <Card.Title className="text-sm font-semibold">Add Tags</Card.Title>
        <span className="text-xs text-muted">(max.{addTags.maxTags})</span>
        <Tooltip delay={0}>
          {/* Quiet treatment: tooltip semantics kept, visual ring stripped. */}
          <FancyButton
            isIconOnly
            aria-label="About tags"
            className="border-0 bg-transparent shadow-none"
            size="sm"
            variant="basic"
          >
            <Iconify className="text-sm text-muted" icon="circle-info" />
          </FancyButton>
          <Tooltip.Content>
            <Tooltip.Arrow />
            <p>Tags help people find your work.</p>
          </Tooltip.Content>
        </Tooltip>
      </Card.Header>
      <Card.Content className="w-full gap-3">
        <TextField
          className="w-full"
          value={draft}
          onChange={setDraft}
          onKeyDown={(event) => {
            if (event.key === "Enter") addTag();
          }}
        >
          <Label className="sr-only">New tag</Label>
          {/* sc-seamless-field drops the prefix/suffix slot dividers so the
              group's outer stroke is the only line — one seamless field. */}
          <InputGroup
            className={`sc-seamless-field w-full ${isShaking ? "sc-dupe-shake" : ""}`}
            onAnimationEnd={() => setIsShaking(false)}
          >
            <InputGroup.Prefix>
              <Iconify className="text-base text-muted" icon="tag" />
            </InputGroup.Prefix>
            <InputGroup.Input className="min-w-0 flex-1" placeholder="Add a tag" />
            <InputGroup.Suffix>
              <FancyButton
                isIconOnly
                aria-label={isFull ? "Add tag — tag limit reached" : "Add tag"}
                isDisabled={isFull || !draft.trim()}
                size="sm"
                variant="basic"
                onPress={addTag}
              >
                <Iconify className="text-base" icon="plus" />
              </FancyButton>
            </InputGroup.Suffix>
          </InputGroup>
        </TextField>
        {tags.length > 0 && (
          <TagGroup aria-label="Tags" onRemove={onRemove}>
            <TagGroup.List className="flex flex-wrap gap-2">
              {tags.map((tag) => (
                <Tag
                  key={tag}
                  className={`${tagColorClass(tag)} ${popTags.has(tag) ? "sc-chip-pop" : ""}`}
                  id={tag}
                  textValue={tag}
                >
                  {tag}
                  <Tag.RemoveButton aria-label={`Remove ${tag}`} />
                </Tag>
              ))}
            </TagGroup.List>
          </TagGroup>
        )}
        {/* Dupe rejections and additions announced without visual noise. */}
        <span aria-live="polite" className="sr-only">
          {liveNote}
        </span>
        <span className="w-full text-left text-xs font-medium text-muted">Tag Settings</span>
        <div className="flex w-full items-center gap-2">
          <Checkbox defaultSelected id="display-on-profile">
            <Checkbox.Control>
              <Checkbox.Indicator />
            </Checkbox.Control>
          </Checkbox>
          <Label htmlFor="display-on-profile">Display on profile</Label>
          <Chip color="accent" size="sm" variant="soft">
            NEW
          </Chip>
        </div>
        <div className="flex w-full items-center gap-2">
          <Checkbox id="disable-commenting">
            <Checkbox.Control>
              <Checkbox.Indicator />
            </Checkbox.Control>
          </Checkbox>
          <Label htmlFor="disable-commenting">Disable commenting</Label>
        </div>
        {/* Dashed rules between the settings groups — C7's dashed language
            (1px token border) via utilities over the real Separator. */}
        <Separator className="h-0 border-t border-dashed border-border bg-transparent" />
        <div className="flex w-full items-center justify-between gap-2">
          <span className="flex items-center gap-2 text-sm">
            <Iconify className="text-base text-muted" icon="folder-open" />
            Add to portfolio
          </span>
          <FancyButton size="sm" variant="basic">
            Choose
          </FancyButton>
        </div>
        <Separator className="h-0 border-t border-dashed border-border bg-transparent" />
        <div className="flex w-full items-center justify-between gap-2">
          <span className="flex items-center gap-2 text-sm">
            <Iconify className="text-base text-muted" icon="arrow-down-to-line" />
            Add Download File
          </span>
          <FancyButton size="sm" variant="basic">
            Add
          </FancyButton>
        </div>
      </Card.Content>
    </Card>
  );
}
