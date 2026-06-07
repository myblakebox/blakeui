"use client";

import type {ComponentProps} from "react";

import {Button, Dropdown, Header, Label} from "@blakeui/react";
import {useI18n} from "fumadocs-ui/contexts/i18n";

export type LanguageSelectProps = ComponentProps<typeof Button>;

export function LanguageToggle(props: LanguageSelectProps): React.ReactElement {
  const context = useI18n();

  if (!context.locales) throw new Error("Missing `<I18nProvider />`");

  return (
    <Dropdown>
      <Button
        isIconOnly
        aria-label={context.text.chooseLanguage}
        size="sm"
        variant="tertiary"
        {...props}
      >
        {props.children}
      </Button>
      <Dropdown.Popover>
        <Dropdown.Menu
          selectedKeys={context.locale ? new Set([context.locale]) : new Set<string>()}
          selectionMode="single"
          onSelectionChange={(keys) => {
            if (keys === "all") return;
            const next = keys.values().next().value;

            if (typeof next === "string" && next !== context.locale) {
              context.onChange?.(next);
            }
          }}
        >
          <Dropdown.Section>
            <Header>{context.text.chooseLanguage}</Header>
            {context.locales.map((item) => (
              <Dropdown.Item key={item.locale} id={item.locale} textValue={item.name}>
                <Dropdown.ItemIndicator />
                <Label>{item.name}</Label>
              </Dropdown.Item>
            ))}
          </Dropdown.Section>
        </Dropdown.Menu>
      </Dropdown.Popover>
    </Dropdown>
  );
}

// Language selector is hidden in the header per design.
export function LanguageToggleText(_props: ComponentProps<"span">) {
  return null;
}

// Adapter for use as a fumadocs `slots.languageSelect.root` slot (e.g. in HomeLayout).
// Language selector is hidden in the header per design.
export function LanguageToggleSlot(_props: ComponentProps<"button">) {
  return null;
}
