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

export function AddTagsCard() {
  const [tags, setTags] = useState<string[]>([...addTags.tags]);
  const [draft, setDraft] = useState("");

  const isFull = tags.length >= addTags.maxTags;

  const addTag = () => {
    const trimmed = draft.trim();

    if (!trimmed || isFull || tags.includes(trimmed)) return;

    setTags((prev) => [...prev, trimmed]);
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
          <FancyButton isIconOnly aria-label="About tags" size="sm" variant="basic">
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
          <InputGroup className="w-full">
            <InputGroup.Prefix>
              <Iconify className="text-base text-muted" icon="tag" />
            </InputGroup.Prefix>
            <InputGroup.Input placeholder="Add a tag" />
            <InputGroup.Suffix>
              <FancyButton
                isIconOnly
                aria-label="Add tag"
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
                <Tag key={tag} id={tag} textValue={tag}>
                  {tag}
                  <Tag.RemoveButton aria-label={`Remove ${tag}`} />
                </Tag>
              ))}
            </TagGroup.List>
          </TagGroup>
        )}
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
        <Separator />
        <div className="flex w-full items-center justify-between gap-2">
          <span className="flex items-center gap-2 text-sm">
            <Iconify className="text-base text-muted" icon="folder-open" />
            Add to portfolio
          </span>
          <FancyButton size="sm" variant="basic">
            Choose
          </FancyButton>
        </div>
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
