"use client";

import {Accordion, Card} from "@blakeui/react";

import {Iconify} from "@/components/iconify";

const FAQS = [
  {
    answer:
      "Yes — every component is built on React Aria, so keyboard navigation, focus management, and screen reader support work out of the box.",
    id: "accessibility",
    question: "Is it accessible?",
  },
  {
    answer:
      "The core library is MIT-licensed — use it in personal and commercial projects alike, no attribution required.",
    id: "licensing",
    question: "Can I use it commercially?",
  },
  {
    answer:
      "Yes. Styles are authored on Tailwind CSS v4, and every theme token is a plain CSS variable you can override.",
    id: "tailwind",
    question: "Does it need Tailwind v4?",
  },
];

/**
 * T5 — Compact FAQ. Single-expand is the Accordion (DisclosureGroup) default;
 * the chevron rotation is the component's built-in animated indicator.
 */
export function FaqTile() {
  return (
    <Card className="w-full border border-border/50">
      <Card.Header className="w-full">
        <Card.Title>Quick answers</Card.Title>
      </Card.Header>
      <Card.Content className="w-full pt-0">
        <Accordion className="w-full">
          {FAQS.map((faq) => (
            <Accordion.Item key={faq.id} id={faq.id}>
              <Accordion.Heading>
                <Accordion.Trigger className="py-3 text-left text-sm">
                  {faq.question}
                  <Accordion.Indicator>
                    <Iconify className="text-base" icon="chevron-down" />
                  </Accordion.Indicator>
                </Accordion.Trigger>
              </Accordion.Heading>
              <Accordion.Panel>
                <Accordion.Body className="px-0 text-sm">{faq.answer}</Accordion.Body>
              </Accordion.Panel>
            </Accordion.Item>
          ))}
        </Accordion>
      </Card.Content>
    </Card>
  );
}
