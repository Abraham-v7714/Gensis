"use client";

import * as React from "react";

export type AccordionItem = {
  id: string;
  title: string;
  content: React.ReactNode;
};

export type AccordionProps = {
  items: AccordionItem[];
  multiple?: boolean;
  defaultOpenIds?: string[];
  className?: string;
};

export const Accordion = ({
  items,
  multiple = false,
  defaultOpenIds = [],
  className = "",
}: AccordionProps) => {
  const [openIds, setOpenIds] = React.useState<Set<string>>(() => new Set(defaultOpenIds));

  const toggle = (id: string) => {
    setOpenIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        if (!multiple) {
          next.clear();
        }
        next.add(id);
      }
      return next;
    });
  };

  if (!items || items.length === 0) {
    return null;
  }

  return (
    <div className={`flex flex-col border-b border-[var(--color-border-subtle)] ${className}`}>
      {items.map((item) => {
        const isOpen = openIds.has(item.id);
        const panelId = `accordion-panel-${item.id}`;
        const buttonId = `accordion-button-${item.id}`;

        return (
          <div key={item.id} className="border-t border-[var(--color-border-subtle)]">
            <h3>
              <button
                type="button"
                id={buttonId}
                aria-expanded={isOpen}
                aria-controls={panelId}
                onClick={() => toggle(item.id)}
                className="flex w-full items-center justify-between py-[var(--spacing-4)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-gensis-black)] font-sans text-[length:var(--text-body)] text-[var(--color-fg-primary)] hover:text-[var(--color-fg-secondary)] transition-colors duration-[var(--duration-fast)] ease-[var(--ease-default)] motion-reduce:transition-none"
              >
                <span>{item.title}</span>
                {/* Decorative indicator — hidden from AT; state is communicated via aria-expanded */}
                <span
                  className="transition-transform duration-[var(--duration-fast)] ease-[var(--ease-default)] motion-reduce:transition-none"
                  aria-hidden="true"
                >
                  {isOpen ? "−" : "+"}
                </span>
              </button>
            </h3>
            {/*
              Use the `hidden` attribute exclusively for collapse visibility.
              The `hidden` attribute is accessible: it removes content from
              the AT tree and prevents focus, which is correct for collapsed panels.
              Do NOT mix `hidden` attribute with `className="block"/"hidden"` — they conflict.
            */}
            <div
              id={panelId}
              role="region"
              aria-labelledby={buttonId}
              hidden={!isOpen}
              className="pb-[var(--spacing-4)] font-sans text-[length:var(--text-body)] text-[var(--color-fg-secondary)]"
            >
              {item.content}
            </div>
          </div>
        );
      })}
    </div>
  );
};
