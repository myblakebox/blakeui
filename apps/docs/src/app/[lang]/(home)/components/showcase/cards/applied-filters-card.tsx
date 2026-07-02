"use client";

import type {Key} from "@blakeui/react";

import {Card, Dropdown, FancyButton, Label, Tag, TagGroup, Tooltip} from "@blakeui/react";
import {useState} from "react";

import {Iconify} from "@/components/iconify";

import {appliedFilters, extraFilters} from "../data/placeholder";

type Filter = (typeof appliedFilters)[number] | (typeof extraFilters)[number];

/**
 * Tag has no color prop in 1.1.2 (Chip's palette doesn't extend to it), so the
 * chip color variety comes from the same semantic soft tokens Chip uses,
 * applied as complete class strings per filter.
 */
const TAG_COLOR_CLASSES: Record<Filter["color"], string> = {
  accent: "bg-accent-soft text-accent-soft-foreground",
  danger: "bg-danger-soft text-danger-soft-foreground",
  default: "",
  success: "bg-success-soft text-success-soft-foreground",
  warning: "bg-warning-soft text-warning-soft-foreground",
};

export function AppliedFiltersCard() {
  const [filters, setFilters] = useState<Filter[]>([...appliedFilters]);
  // Only chips added after mount pop in; the initial set renders quietly.
  const [popIds, setPopIds] = useState<Set<string>>(new Set());

  // The "+" menu lists whatever presets aren't applied yet; selecting one
  // appends its chip and (by derivation) removes its row from the menu.
  const remaining = extraFilters.filter((extra) => !filters.some((f) => f.id === extra.id));
  const isExhausted = remaining.length === 0;

  const onRemove = (keys: Set<Key>) => {
    setFilters((prev) => prev.filter((filter) => !keys.has(filter.id)));
  };

  const addFilter = (id: Key) => {
    const extra = extraFilters.find((f) => f.id === id);

    if (!extra) return;

    setFilters((prev) => [...prev, extra]);
    setPopIds((prev) => new Set(prev).add(extra.id));
  };

  const reset = () => {
    setFilters([...appliedFilters]);
    setPopIds(new Set());
  };

  return (
    <Card className="w-full">
      <Card.Header className="w-full flex-row items-center gap-1.5">
        <Card.Title className="text-sm font-semibold">Applied Filters</Card.Title>
        <Tooltip delay={0}>
          <FancyButton isIconOnly aria-label="About applied filters" size="sm" variant="basic">
            <Iconify className="text-base text-muted" icon="circle-info" />
          </FancyButton>
          <Tooltip.Content>
            <Tooltip.Arrow />
            <p>Filters narrow the results below.</p>
          </Tooltip.Content>
        </Tooltip>
      </Card.Header>
      <Card.Content className="w-full">
        <div className="flex flex-wrap items-center gap-2">
          <TagGroup aria-label="Applied filters" onRemove={onRemove}>
            <TagGroup.List className="flex flex-wrap gap-2" items={filters}>
              {(filter) => (
                <Tag
                  className={`${TAG_COLOR_CLASSES[filter.color]} ${popIds.has(filter.id) ? "sc-chip-pop" : ""}`}
                  id={filter.id}
                  textValue={filter.label}
                >
                  <Iconify className="text-sm" icon={filter.icon} />
                  {filter.label}
                  <Tag.RemoveButton aria-label={`Remove ${filter.label}`} />
                </Tag>
              )}
            </TagGroup.List>
          </TagGroup>
          <Dropdown>
            <Tooltip delay={0}>
              <FancyButton
                isIconOnly
                aria-label={isExhausted ? "Add filter — all preset filters applied" : "Add filter"}
                isDisabled={isExhausted}
                size="sm"
                variant="basic"
              >
                <Iconify className="text-base" icon="plus" />
              </FancyButton>
              <Tooltip.Content>
                <Tooltip.Arrow />
                <p>{isExhausted ? "All preset filters applied" : "Add a preset filter"}</p>
              </Tooltip.Content>
            </Tooltip>
            <Dropdown.Popover>
              <Dropdown.Menu aria-label="Preset filters" items={remaining} onAction={addFilter}>
                {(extra) => (
                  <Dropdown.Item id={extra.id} textValue={extra.label}>
                    <Iconify className="text-base text-muted" icon={extra.icon} />
                    <Label>{extra.label}</Label>
                    <Iconify className="ml-auto text-sm text-muted" icon="plus" />
                  </Dropdown.Item>
                )}
              </Dropdown.Menu>
            </Dropdown.Popover>
          </Dropdown>
          {/* Lives next to the "+" (not the header) so the docs chip owns the corner. */}
          <FancyButton
            aria-label="Reset filters"
            className="ml-auto"
            size="sm"
            variant="basic"
            onPress={reset}
          >
            Reset
          </FancyButton>
        </div>
      </Card.Content>
    </Card>
  );
}
