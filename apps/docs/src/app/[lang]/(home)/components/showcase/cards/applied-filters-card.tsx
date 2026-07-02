"use client";

import type {Key} from "@blakeui/react";

import {Card, FancyButton, Tag, TagGroup, Tooltip} from "@blakeui/react";
import {useState} from "react";

import {Iconify} from "@/components/iconify";

import {appliedFilters} from "../data/placeholder";

export function AppliedFiltersCard() {
  const [filters, setFilters] = useState([...appliedFilters]);

  const onRemove = (keys: Set<Key>) => {
    setFilters((prev) => prev.filter((filter) => !keys.has(filter.id)));
  };

  const restoreFilter = () => {
    // Demo behavior: the "+" chip restores the next removed filter so the
    // card stays interactive instead of emptying out permanently.
    setFilters((prev) => {
      const next = appliedFilters.find((filter) => !prev.some((f) => f.id === filter.id));

      return next ? [...prev, next] : prev;
    });
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
                <Tag id={filter.id} textValue={filter.label}>
                  <Iconify className="text-sm text-muted" icon={filter.icon} />
                  {filter.label}
                  <Tag.RemoveButton aria-label={`Remove ${filter.label}`} />
                </Tag>
              )}
            </TagGroup.List>
          </TagGroup>
          <FancyButton
            isIconOnly
            aria-label="Add filter"
            isDisabled={filters.length === appliedFilters.length}
            size="sm"
            variant="basic"
            onPress={restoreFilter}
          >
            <Iconify className="text-base" icon="plus" />
          </FancyButton>
        </div>
      </Card.Content>
    </Card>
  );
}
