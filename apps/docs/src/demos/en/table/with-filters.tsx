"use client";

import type {Dispatch, ReactNode, SetStateAction} from "react";
import type {Key, Selection, SortDescriptor} from "react-aria-components";

import {
  Avatar,
  Button,
  Checkbox,
  CheckboxGroup,
  Chip,
  EmptyState,
  Label,
  ListBox,
  Pagination,
  Popover,
  SearchField,
  Separator,
  Table,
  cn,
} from "@blakeui/react";
import {Icon} from "@iconify/react";
import {useMemo, useState} from "react";
import {useDragAndDrop} from "react-aria-components";

interface User {
  id: number;
  name: string;
  image_url: string;
  role: string;
  status: "Active" | "Inactive" | "On Leave";
  email: string;
}

const statusColorMap: Record<string, "success" | "danger" | "warning"> = {
  Active: "success",
  Inactive: "danger",
  "On Leave": "warning",
};

const users: User[] = [
  {
    email: "kate@acme.com",
    id: 4586932,
    image_url: "https://cdn.blakeui.com/avatars/red.jpg",
    name: "Kate Moore",
    role: "Chief Executive Officer",
    status: "Active",
  },
  {
    email: "john@acme.com",
    id: 5273849,
    image_url: "https://cdn.blakeui.com/avatars/green.jpg",
    name: "John Smith",
    role: "Chief Technology Officer",
    status: "Active",
  },
  {
    email: "sara@acme.com",
    id: 7492836,
    image_url: "https://cdn.blakeui.com/avatars/blue.jpg",
    name: "Sara Johnson",
    role: "Chief Marketing Officer",
    status: "On Leave",
  },
  {
    email: "michael@acme.com",
    id: 8293746,
    image_url: "https://cdn.blakeui.com/avatars/purple.jpg",
    name: "Michael Brown",
    role: "Chief Financial Officer",
    status: "Active",
  },
  {
    email: "emily@acme.com",
    id: 1234567,
    image_url: "https://cdn.blakeui.com/avatars/orange.jpg",
    name: "Emily Davis",
    role: "Product Manager",
    status: "Inactive",
  },
  {
    email: "davis@acme.com",
    id: 9876543,
    image_url: "https://cdn.blakeui.com/avatars/black.jpg",
    name: "Davis Wilson",
    role: "Lead Designer",
    status: "Active",
  },
  {
    email: "olivia@acme.com",
    id: 3456789,
    image_url: "https://cdn.blakeui.com/avatars/red.jpg",
    name: "Olivia Martinez",
    role: "Frontend Engineer",
    status: "Active",
  },
  {
    email: "james@acme.com",
    id: 4567890,
    image_url: "https://cdn.blakeui.com/avatars/green.jpg",
    name: "James Taylor",
    role: "Backend Engineer",
    status: "Active",
  },
  {
    email: "sophia@acme.com",
    id: 5678901,
    image_url: "https://cdn.blakeui.com/avatars/blue.jpg",
    name: "Sophia Anderson",
    role: "QA Engineer",
    status: "On Leave",
  },
  {
    email: "liam@acme.com",
    id: 6789012,
    image_url: "https://cdn.blakeui.com/avatars/purple.jpg",
    name: "Liam Thomas",
    role: "DevOps Engineer",
    status: "Active",
  },
  {
    email: "ava@acme.com",
    id: 7890123,
    image_url: "https://cdn.blakeui.com/avatars/orange.jpg",
    name: "Ava Jackson",
    role: "Data Analyst",
    status: "Inactive",
  },
  {
    email: "noah@acme.com",
    id: 8901234,
    image_url: "https://cdn.blakeui.com/avatars/black.jpg",
    name: "Noah White",
    role: "Security Engineer",
    status: "Active",
  },
];

const STATUS_OPTIONS = [
  {id: "Active", name: "Active"},
  {id: "Inactive", name: "Inactive"},
  {id: "On Leave", name: "On Leave"},
] as const;

// Distinct roles, derived from the data.
const ROLE_OPTIONS = Array.from(new Set(users.map((u) => u.role))).map((role) => ({
  id: role,
  name: role,
}));

const PAGE_SIZE = 5;

/**
 * Column definitions — header columns and body cells are driven from this single list (filtered by
 * visibleColumns) via Table.Collection, so the cell count always matches the column count.
 */
interface ColumnDef {
  id: string;
  label: string;
  isRowHeader?: boolean;
  cellClassName?: string;
  renderCell: (user: User) => ReactNode;
}

const DATA_COLUMNS: ColumnDef[] = [
  {
    cellClassName: "font-medium",
    id: "id",
    label: "Worker ID",
    renderCell: (user) => (
      <div className="flex items-center gap-2">
        #{user.id.toString()}{" "}
        <Button isIconOnly size="sm" variant="ghost">
          <Icon className="size-4 text-muted" icon="gravity-ui:copy" />
        </Button>
      </div>
    ),
  },
  {
    id: "name",
    isRowHeader: true,
    label: "Member",
    renderCell: (user) => (
      <div className="flex items-center gap-2.5">
        <Avatar className="size-7" size="sm">
          <Avatar.Image src={user.image_url} />
          <Avatar.Fallback>
            {user.name
              .split(" ")
              .map((n) => n[0])
              .join("")}
          </Avatar.Fallback>
        </Avatar>
        <div className="flex flex-col leading-tight">
          <span className="text-xs">{user.name}</span>
          <span className="text-xs text-muted">{user.email}</span>
        </div>
      </div>
    ),
  },
  {
    cellClassName: "min-w-52",
    id: "role",
    label: "Role",
    renderCell: (user) => user.role,
  },
  {
    cellClassName: "min-w-25",
    id: "status",
    label: "Status",
    renderCell: (user) => (
      <Chip color={statusColorMap[user.status]} size="sm" variant="soft">
        {user.status}
      </Chip>
    ),
  },
];

// Member ("name") is the anchor: always first, non-draggable, non-hideable. The remaining data
// columns can be reordered and hidden freely.
const DATA_COLUMN_BY_ID: Record<string, ColumnDef> = Object.fromEntries(
  DATA_COLUMNS.map((c) => [c.id, c]),
);
const MEMBER_COLUMN = DATA_COLUMNS.find((c) => c.id === "name") as ColumnDef;
const REORDERABLE_COLUMN_IDS = DATA_COLUMNS.filter((c) => c.id !== "name").map((c) => c.id);

function SortableColumnHeader({
  children,
  sortDirection,
}: {
  children: ReactNode;
  sortDirection?: "ascending" | "descending";
}) {
  return (
    <span className="flex items-center justify-between">
      {children}
      {!!sortDirection && (
        <Icon
          icon="gravity-ui:chevron-up"
          className={cn(
            "size-3 transform transition-transform duration-100 ease-out",
            sortDirection === "descending" ? "rotate-180" : "",
          )}
        />
      )}
    </span>
  );
}

/**
 * One reusable CheckboxGroup facet (Status or Role). Filters apply live as boxes toggle. State stays
 * a Set<Key> for the data pipeline; converted to/from string[] at the CheckboxGroup edge.
 */
function FilterFacet({
  label,
  onChange,
  options,
  scroll,
  value,
}: {
  label: string;
  onChange: (next: Set<Key>) => void;
  options: ReadonlyArray<{id: string; name: string}>;
  scroll?: boolean;
  value: Set<Key>;
}) {
  return (
    <CheckboxGroup
      value={[...value].map(String)}
      onChange={(values) => onChange(new Set<Key>(values))}
    >
      <Label>{label}</Label>
      <div
        className={cn(
          "flex flex-col gap-2",
          // Negative margin keeps the checkboxes aligned with the Status group while the interior
          // padding (+ scroll-padding) gives keyboard focus rings room before the scroll clip edge.
          scroll && "-mx-2 max-h-44 scroll-py-2 scrollbar overflow-y-auto px-2 py-1.5",
        )}
      >
        {options.map((option) => (
          <Checkbox key={option.id} value={option.id} variant="secondary">
            <Checkbox.Control>
              <Checkbox.Indicator />
            </Checkbox.Control>
            <Checkbox.Content>
              <Label>{option.name}</Label>
            </Checkbox.Content>
          </Checkbox>
        ))}
      </div>
    </CheckboxGroup>
  );
}

/**
 * Single "Filters" button → Popover holding the Status and Role facets (separated by a Separator)
 * and a "Clear all" footer. The button shows a count badge when any filter is active.
 */
function FiltersPopover({
  roleFilter,
  setRoleFilter,
  setStatusFilter,
  statusFilter,
}: {
  roleFilter: Set<Key>;
  setRoleFilter: (next: Set<Key>) => void;
  setStatusFilter: (next: Set<Key>) => void;
  statusFilter: Set<Key>;
}) {
  const activeCount = statusFilter.size + roleFilter.size;

  return (
    <Popover>
      <Button size="sm" variant="secondary">
        <Icon className="size-4" icon="gravity-ui:funnel" />
        Filters
        {activeCount > 0 && (
          <Chip color="default" size="sm" variant="soft">
            {activeCount}
          </Chip>
        )}
      </Button>
      <Popover.Content className="w-64">
        <Popover.Dialog className="flex flex-col gap-3">
          <FilterFacet
            label="Status"
            options={STATUS_OPTIONS}
            value={statusFilter}
            onChange={setStatusFilter}
          />
          <Separator />
          <FilterFacet
            scroll
            label="Role"
            options={ROLE_OPTIONS}
            value={roleFilter}
            onChange={setRoleFilter}
          />
          <Separator />
          <div className="flex justify-end">
            <Button
              isDisabled={activeCount === 0}
              size="sm"
              variant="ghost"
              onPress={() => {
                setStatusFilter(new Set());
                setRoleFilter(new Set());
              }}
            >
              Clear all
            </Button>
          </div>
        </Popover.Dialog>
      </Popover.Content>
    </Popover>
  );
}

/** A single visibility checkbox matching the table's row selection boxes (variant="secondary"). */
function VisibilityToggle({
  isDisabled,
  isSelected,
  label,
  onChange,
}: {
  isDisabled?: boolean;
  isSelected: boolean;
  label: string;
  onChange?: (isSelected: boolean) => void;
}) {
  return (
    <Checkbox
      aria-label={label}
      isDisabled={isDisabled}
      isSelected={isSelected}
      variant="secondary"
      onChange={onChange}
    >
      <Checkbox.Control>
        <Checkbox.Indicator />
      </Checkbox.Control>
    </Checkbox>
  );
}

/**
 * Columns popover: reorder + show/hide the data columns. Member is the anchor — pinned first,
 * non-draggable and always visible. Worker ID / Role / Status reorder (drag handle) and hide
 * (visibility toggle) freely. The selection and Actions columns are structural and never appear here.
 */
function ColumnsPopover({
  columnOrder,
  setColumnOrder,
  setVisibleColumns,
  visibleColumns,
}: {
  columnOrder: string[];
  setColumnOrder: Dispatch<SetStateAction<string[]>>;
  setVisibleColumns: (next: Set<Key>) => void;
  visibleColumns: Set<Key>;
}) {
  const {dragAndDropHooks} = useDragAndDrop({
    getItems: (keys) => [...keys].map((key) => ({"text/plain": String(key)})),
    onReorder(e) {
      setColumnOrder((prev) => {
        const moved = prev.filter((k) => e.keys.has(k));
        const rest = prev.filter((k) => !e.keys.has(k));
        let index = rest.indexOf(String(e.target.key));

        if (index === -1) return prev;
        if (e.target.dropPosition === "after") index += 1;
        rest.splice(index, 0, ...moved);

        return rest;
      });
    },
  });

  const toggle = (id: string, isSelected: boolean) => {
    setVisibleColumns(
      (() => {
        const next = new Set<Key>(visibleColumns);

        if (isSelected) next.add(id);
        else next.delete(id);

        return next;
      })(),
    );
  };

  const items = columnOrder
    .map((id) => DATA_COLUMN_BY_ID[id])
    .filter((column): column is ColumnDef => column !== undefined)
    .map((column) => ({id: column.id, label: column.label}));

  return (
    <Popover>
      <Button size="sm" variant="secondary">
        <Icon className="size-4" icon="gravity-ui:layout-columns-3" />
        Columns
        <Icon className="size-4 text-muted" icon="gravity-ui:chevron-down" />
      </Button>
      <Popover.Content className="w-64">
        <Popover.Dialog className="flex flex-col gap-1">
          <span className="px-2 pb-1 text-xs font-medium text-muted">Columns</span>

          {/* Member — pinned first, locked on. px-3.5 = ListBox p-1.5 (6px) + item px-2 (8px) so
              its grip/checkbox stay aligned with the reorderable rows below. */}
          <div className="flex items-center gap-2 px-3.5 py-1.5">
            <Icon className="size-4 text-muted/40" icon="gravity-ui:bars" />
            <span className="flex-1 text-sm">Member</span>
            <VisibilityToggle isDisabled isSelected label="Member (always visible)" />
          </div>

          <ListBox
            aria-label="Reorder and toggle columns"
            className="p-1.5"
            dragAndDropHooks={dragAndDropHooks}
            items={items}
            selectionMode="none"
          >
            {(item) => (
              <ListBox.Item id={item.id} textValue={item.label}>
                <div className="flex w-full items-center gap-2">
                  <Icon
                    aria-hidden
                    className="size-4 shrink-0 cursor-grab text-muted"
                    icon="gravity-ui:bars"
                  />
                  <span className="flex-1 text-sm">{item.label}</span>
                  <VisibilityToggle
                    isSelected={visibleColumns.has(item.id)}
                    label={`Toggle ${item.label}`}
                    onChange={(isSelected) => toggle(item.id, isSelected)}
                  />
                </div>
              </ListBox.Item>
            )}
          </ListBox>
        </Popover.Dialog>
      </Popover.Content>
    </Popover>
  );
}

export function WithFilters() {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<Set<Key>>(new Set());
  const [roleFilter, setRoleFilter] = useState<Set<Key>>(new Set());
  const [visibleColumns, setVisibleColumns] = useState<Set<Key>>(
    () => new Set<Key>(REORDERABLE_COLUMN_IDS),
  );
  const [columnOrder, setColumnOrder] = useState<string[]>(() => [...REORDERABLE_COLUMN_IDS]);
  const [selectedKeys, setSelectedKeys] = useState<Selection>(new Set());
  const [sortDescriptor, setSortDescriptor] = useState<SortDescriptor>({
    column: "name",
    direction: "ascending",
  });
  const [page, setPage] = useState(1);

  /* --- Data pipeline: filter -> sort -> paginate --- */
  const filteredItems = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    return users.filter((user) => {
      const matchesSearch =
        !query ||
        user.name.toLowerCase().includes(query) ||
        user.email.toLowerCase().includes(query);
      const matchesStatus = statusFilter.size === 0 || statusFilter.has(user.status);
      const matchesRole = roleFilter.size === 0 || roleFilter.has(user.role);

      return matchesSearch && matchesStatus && matchesRole;
    });
  }, [searchQuery, statusFilter, roleFilter]);

  const sortedItems = useMemo(() => {
    const items = [...filteredItems];
    const column = sortDescriptor.column as keyof User;

    items.sort((a, b) => {
      let cmp: number;

      if (column === "id") {
        cmp = Number(a.id) - Number(b.id);
      } else {
        cmp = String(a[column]).localeCompare(String(b[column]));
      }

      return sortDescriptor.direction === "descending" ? cmp * -1 : cmp;
    });

    return items;
  }, [filteredItems, sortDescriptor]);

  const filteredTotal = sortedItems.length;
  const totalPages = Math.max(1, Math.ceil(filteredTotal / PAGE_SIZE));

  // Reset to the first page whenever the filters change. Adjusting state during render (rather than
  // in an effect) is the idiomatic pattern: https://react.dev/learn/you-might-not-need-an-effect
  const filterSignature = `${searchQuery}|${[...statusFilter].sort().join(",")}|${[...roleFilter]
    .sort()
    .join(",")}`;
  const [lastFilterSignature, setLastFilterSignature] = useState(filterSignature);

  if (filterSignature !== lastFilterSignature) {
    setLastFilterSignature(filterSignature);
    setPage(1);
  }

  const currentPage = Math.min(page, totalPages);

  const paginatedItems = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE;

    return sortedItems.slice(start, start + PAGE_SIZE);
  }, [sortedItems, currentPage]);

  /* --- Selection: select-all targets the filtered set, count reflects filtered total --- */
  const filteredIdSet = useMemo(() => new Set(sortedItems.map((u) => u.id)), [sortedItems]);

  const handleSelectionChange = (keys: Selection) => {
    // React Aria emits "all" for the header select-all — expand it across the whole filtered set.
    setSelectedKeys(keys === "all" ? new Set(sortedItems.map((u) => u.id)) : keys);
  };

  const selectedCount =
    selectedKeys === "all"
      ? filteredTotal
      : [...selectedKeys].filter((key) => filteredIdSet.has(key as number)).length;

  const pages = Array.from({length: totalPages}, (_, i) => i + 1);

  // Member ("name") is always first; the rest follow columnOrder, filtered by visibleColumns. Header
  // and body both map over this list so their counts can never diverge.
  const visibleDataColumns = useMemo<ColumnDef[]>(
    () => [
      MEMBER_COLUMN,
      ...columnOrder
        .map((id) => DATA_COLUMN_BY_ID[id])
        .filter(
          (column): column is ColumnDef => column !== undefined && visibleColumns.has(column.id),
        ),
    ],
    [columnOrder, visibleColumns],
  );

  return (
    <div className="w-full max-w-4xl">
      <Table>
        {/* Toolbar — single row inset to match the header pill (no px): search left, actions right. */}
        <div className="flex items-center justify-between gap-3 py-2.5">
          <SearchField
            aria-label="Search members"
            className="w-64 min-w-0"
            value={searchQuery}
            onChange={setSearchQuery}
          >
            {/* shadow-none: drop the field's subtle elevation inside the table card. */}
            <SearchField.Group className="shadow-none">
              <SearchField.SearchIcon />
              <SearchField.Input placeholder="Search members…" />
              <SearchField.ClearButton />
            </SearchField.Group>
          </SearchField>

          <div className="flex items-center gap-2">
            <FiltersPopover
              roleFilter={roleFilter}
              setRoleFilter={setRoleFilter}
              setStatusFilter={setStatusFilter}
              statusFilter={statusFilter}
            />
            <ColumnsPopover
              columnOrder={columnOrder}
              setColumnOrder={setColumnOrder}
              setVisibleColumns={setVisibleColumns}
              visibleColumns={visibleColumns}
            />
          </div>
        </div>

        <Table.ScrollContainer>
          <Table.Content
            aria-label="Team members with filters"
            className="min-w-[800px]"
            selectedKeys={selectedKeys}
            selectionMode="multiple"
            sortDescriptor={sortDescriptor}
            onSelectionChange={handleSelectionChange}
            onSortChange={setSortDescriptor}
          >
            <Table.Header>
              <Table.Column className="pr-0">
                <Checkbox aria-label="Select all" slot="selection">
                  <Checkbox.Control>
                    <Checkbox.Indicator />
                  </Checkbox.Control>
                </Checkbox>
              </Table.Column>
              <Table.Collection items={visibleDataColumns}>
                {(column) => (
                  <Table.Column allowsSorting id={column.id} isRowHeader={column.isRowHeader}>
                    {({sortDirection}) => (
                      <SortableColumnHeader sortDirection={sortDirection}>
                        {column.label}
                      </SortableColumnHeader>
                    )}
                  </Table.Column>
                )}
              </Table.Collection>
              <Table.Column id="actions">Actions</Table.Column>
            </Table.Header>
            <Table.Body
              dependencies={[visibleDataColumns]}
              items={paginatedItems}
              renderEmptyState={() => (
                <EmptyState className="flex w-full flex-col items-center justify-center gap-4 py-16 text-center">
                  <Icon className="size-6 text-muted" icon="gravity-ui:tray" />
                  <span className="text-sm text-muted">No members match your filters</span>
                </EmptyState>
              )}
            >
              {(user) => (
                <Table.Row id={user.id}>
                  <Table.Cell className="pr-0">
                    <Checkbox
                      aria-label={`Select ${user.name}`}
                      slot="selection"
                      variant="secondary"
                    >
                      <Checkbox.Control>
                        <Checkbox.Indicator />
                      </Checkbox.Control>
                    </Checkbox>
                  </Table.Cell>
                  <Table.Collection items={visibleDataColumns}>
                    {(column) => (
                      <Table.Cell className={column.cellClassName}>
                        {column.renderCell(user)}
                      </Table.Cell>
                    )}
                  </Table.Collection>
                  <Table.Cell>
                    <div className="flex items-center justify-end gap-1">
                      <Button isIconOnly size="sm" variant="tertiary">
                        <Icon className="size-4" icon="gravity-ui:eye" />
                      </Button>
                      <Button isIconOnly size="sm" variant="tertiary">
                        <Icon className="size-4" icon="gravity-ui:pencil" />
                      </Button>
                      <Button isIconOnly size="sm" variant="danger-soft">
                        <Icon className="size-4" icon="gravity-ui:trash-bin" />
                      </Button>
                    </div>
                  </Table.Cell>
                </Table.Row>
              )}
            </Table.Body>
          </Table.Content>
        </Table.ScrollContainer>

        <Table.Footer className="justify-between">
          <span className="text-xs whitespace-nowrap text-muted">
            {selectedCount > 0
              ? `${selectedCount} of ${filteredTotal} selected`
              : `${filteredTotal} ${filteredTotal === 1 ? "result" : "results"}`}
          </span>
          <Pagination className="w-auto" size="sm">
            <Pagination.Content>
              <Pagination.Item>
                <Pagination.Previous
                  isDisabled={currentPage === 1}
                  onPress={() => setPage((p) => Math.max(1, p - 1))}
                >
                  <Pagination.PreviousIcon />
                  Prev
                </Pagination.Previous>
              </Pagination.Item>
              {pages.map((p) => (
                <Pagination.Item key={p}>
                  <Pagination.Link isActive={p === currentPage} onPress={() => setPage(p)}>
                    {p}
                  </Pagination.Link>
                </Pagination.Item>
              ))}
              <Pagination.Item>
                <Pagination.Next
                  isDisabled={currentPage === totalPages}
                  onPress={() => setPage((p) => Math.min(totalPages, p + 1))}
                >
                  Next
                  <Pagination.NextIcon />
                </Pagination.Next>
              </Pagination.Item>
            </Pagination.Content>
          </Pagination>
        </Table.Footer>
      </Table>
    </div>
  );
}
