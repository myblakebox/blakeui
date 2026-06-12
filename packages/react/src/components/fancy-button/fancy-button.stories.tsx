import type {Meta} from "@storybook/react";

import React from "react";

import {Icon} from "../iconify";

import {FancyButton} from "./index";

export default {
  argTypes: {
    isDisabled: {
      control: "boolean",
    },
    size: {
      control: "select",
      options: ["sm", "md", "lg"],
    },
    variant: {
      control: "select",
      options: ["primary", "neutral", "danger", "basic"],
    },
  },
  component: FancyButton,
  parameters: {
    layout: "centered",
  },
  title: "Components/Buttons/FancyButton",
} as Meta<typeof FancyButton>;

const defaultArgs: FancyButton["RootProps"] = {
  size: "md",
};

const Template = ({isDisabled, size}: FancyButton["RootProps"]) => (
  <div className="flex gap-3">
    <FancyButton isDisabled={isDisabled} size={size}>
      Primary
    </FancyButton>
    <FancyButton isDisabled={isDisabled} size={size} variant="neutral">
      Neutral
    </FancyButton>
    <FancyButton isDisabled={isDisabled} size={size} variant="danger">
      Danger
    </FancyButton>
    <FancyButton isDisabled={isDisabled} size={size} variant="basic">
      Basic
    </FancyButton>
  </div>
);

const TemplateWithIcon = ({isDisabled, size}: FancyButton["RootProps"]) => (
  <div className="flex gap-3">
    <FancyButton isDisabled={isDisabled} size={size}>
      <Icon icon="gravity-ui:globe" />
      Search
    </FancyButton>
    <FancyButton isDisabled={isDisabled} size={size} variant="neutral">
      <Icon icon="gravity-ui:plus" />
      Add Member
    </FancyButton>
    <FancyButton isDisabled={isDisabled} size={size} variant="danger">
      <Icon icon="gravity-ui:trash-bin" />
      Delete
    </FancyButton>
    <FancyButton isDisabled={isDisabled} size={size} variant="basic">
      <Icon icon="gravity-ui:envelope" />
      Email
    </FancyButton>
  </div>
);

/* Icon-only usage requires an aria-label for screen readers */
const TemplateWithIconOnly = ({isDisabled, size, variant}: FancyButton["RootProps"]) => (
  <div className="flex gap-3">
    <FancyButton
      isIconOnly
      aria-label="More options"
      isDisabled={isDisabled}
      size={size}
      variant={variant}
    >
      <Icon icon="gravity-ui:ellipsis" />
    </FancyButton>
  </div>
);

const SizesTemplate = () => (
  <div className="flex flex-col gap-6">
    <div className="flex items-center gap-3">
      <FancyButton size="sm">Small</FancyButton>
      <FancyButton size="md">Medium</FancyButton>
      <FancyButton size="lg">Large</FancyButton>
    </div>
    <div className="flex items-center gap-3">
      <FancyButton size="sm" variant="neutral">
        <Icon icon="gravity-ui:plus" />
        Small
      </FancyButton>
      <FancyButton size="md" variant="neutral">
        <Icon icon="gravity-ui:plus" />
        Medium
      </FancyButton>
      <FancyButton size="lg" variant="neutral">
        <Icon icon="gravity-ui:plus" />
        Large
      </FancyButton>
    </div>
    <div className="flex items-center gap-3">
      <FancyButton isIconOnly aria-label="More options" size="sm" variant="basic">
        <Icon icon="gravity-ui:ellipsis" />
      </FancyButton>
      <FancyButton isIconOnly aria-label="More options" size="md" variant="basic">
        <Icon icon="gravity-ui:ellipsis" />
      </FancyButton>
      <FancyButton isIconOnly aria-label="More options" size="lg" variant="basic">
        <Icon icon="gravity-ui:ellipsis" />
      </FancyButton>
    </div>
  </div>
);

export const Default = {
  args: defaultArgs,
  render: Template,
};

export const Sizes = {
  render: SizesTemplate,
};

export const FullWidth = {
  render: () => (
    <div className="w-[400px] space-y-3">
      <FancyButton fullWidth>Primary</FancyButton>
      <FancyButton fullWidth variant="neutral">
        Neutral
      </FancyButton>
      <FancyButton fullWidth variant="basic">
        Basic
      </FancyButton>
    </div>
  ),
};

export const WithIcon = {
  args: defaultArgs,
  render: TemplateWithIcon,
};

export const WithIconOnly = {
  args: defaultArgs,
  render: TemplateWithIconOnly,
};

export const Disabled = {
  args: {...defaultArgs, isDisabled: true},
  render: Template,
};
