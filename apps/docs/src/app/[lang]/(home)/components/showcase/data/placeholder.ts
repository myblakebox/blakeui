/**
 * All sample content for the landing hero showcase lives here so it's
 * trivially reviewable: every name, handle, email, file and tag is
 * BlakeUI-branded placeholder data — nothing lifted from third-party
 * reference designs.
 */

export const account = {
  email: "blake@blakeui.com",
  initials: "BC",
  name: "Blake Carter",
  plan: "PRO",
  version: "v3.0.0",
};

export const contact = {
  handle: "@jordanavery",
  initials: "JA",
  name: "Jordan Avery",
  subtitle: "Product Designer",
};

export const upload = {
  fileName: "blakeui-styleguide.pdf",
  sizeMb: 12,
};

export const invite = {
  members: [
    {email: "riley@blakeui.com", initials: "RC", name: "Riley Chen", permission: "edit"},
    {email: "sam@blakeui.com", initials: "SO", name: "Sam Okafor", permission: "view"},
  ],
  project: "Design System",
};

export const contactInfo = {
  email: "avery@blakeui.com",
  handle: "@averybrooks",
  initials: "AB",
  location: "Portland, OR",
  name: "Avery Brooks",
  specialty: "Design Systems",
};

export const resetPassword = {
  email: "blake@blakeui.com",
};

export const addTags = {
  maxTags: 8,
  tags: ["Design", "Figma", "UI Kit"],
};

export const appliedFilters = [
  {color: "accent", icon: "person", id: "owner", label: "Owner: Blake"},
  {color: "warning", icon: "calendar", id: "due", label: "Due: This week"},
  {color: "default", icon: "layers", id: "team", label: "Team: Design"},
  {color: "success", icon: "globe", id: "visibility", label: "Public"},
] as const;

/** Preset extras the "+" button appends one at a time; order matters. */
export const extraFilters = [
  {color: "success", icon: "circle-check", id: "status", label: "Status: Active"},
  {color: "danger", icon: "arrow-up", id: "priority", label: "Priority: High"},
  {color: "accent", icon: "person-plus", id: "assignee", label: "Assignee: Riley"},
  {color: "default", icon: "tag", id: "tag", label: "Tag: Web"},
] as const;
