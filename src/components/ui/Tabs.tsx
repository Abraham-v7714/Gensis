"use client";

import * as React from "react";

export type Tab = {
  id: string;
  label: string;
  content: React.ReactNode;
};

export type TabsProps = {
  tabs: Tab[];
  defaultTabId?: string;
  className?: string;
};

export const Tabs = ({ tabs, defaultTabId, className = "" }: TabsProps) => {
  const [activeTabId, setActiveTabId] = React.useState<string>(() => {
    if (defaultTabId && tabs.some((t) => t.id === defaultTabId)) {
      return defaultTabId;
    }
    return tabs.length > 0 ? tabs[0].id : "";
  });

  const tabRefs = React.useRef<Map<string, HTMLButtonElement>>(new Map());

  if (!tabs || tabs.length === 0) {
    return null;
  }

  // Ensure active tab is valid
  const currentTab = tabs.find((t) => t.id === activeTabId) || tabs[0];
  const currentTabId = currentTab.id;

  const handleKeyDown = (e: React.KeyboardEvent<HTMLButtonElement>, index: number) => {
    let nextIndex = index;
    switch (e.key) {
      case "ArrowRight":
        nextIndex = index === tabs.length - 1 ? 0 : index + 1;
        break;
      case "ArrowLeft":
        nextIndex = index === 0 ? tabs.length - 1 : index - 1;
        break;
      case "Home":
        nextIndex = 0;
        break;
      case "End":
        nextIndex = tabs.length - 1;
        break;
      default:
        return; // Let other keys behave normally
    }

    e.preventDefault();
    const nextTab = tabs[nextIndex];
    setActiveTabId(nextTab.id);
    tabRefs.current.get(nextTab.id)?.focus();
  };

  return (
    <div className={`flex flex-col gap-[var(--spacing-6)] ${className}`}>
      <div
        role="tablist"
        aria-orientation="horizontal"
        className="flex overflow-x-auto gap-[var(--spacing-6)] border-b border-[var(--color-border-subtle)] pb-[var(--spacing-2)] scrollbar-hide"
      >
        {tabs.map((tab, index) => {
          const isActive = tab.id === currentTabId;
          return (
            <button
              key={tab.id}
              ref={(node) => {
                if (node) {
                  tabRefs.current.set(tab.id, node);
                } else {
                  tabRefs.current.delete(tab.id);
                }
              }}
              role="tab"
              aria-selected={isActive}
              aria-controls={`tabpanel-${tab.id}`}
              id={`tab-${tab.id}`}
              tabIndex={isActive ? 0 : -1}
              onClick={() => setActiveTabId(tab.id)}
              onKeyDown={(e) => handleKeyDown(e, index)}
              className={[
                "font-sans text-[length:var(--text-small)] tracking-[var(--tracking-small)] uppercase pb-[var(--spacing-2)] -mb-[var(--spacing-2)] whitespace-nowrap focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-gensis-black)]",
                "transition-colors duration-[var(--duration-fast)] ease-[var(--ease-default)]",
                isActive
                  ? "text-[var(--color-fg-primary)] border-b-2 border-[var(--color-gensis-black)]"
                  : "text-[var(--color-fg-muted)] hover:text-[var(--color-fg-primary)] border-b-2 border-transparent",
              ].join(" ")}
            >
              {tab.label}
            </button>
          );
        })}
      </div>
      <div
        id={`tabpanel-${currentTabId}`}
        role="tabpanel"
        aria-labelledby={`tab-${currentTabId}`}
        tabIndex={0}
        className="font-sans text-[length:var(--text-body)] text-[var(--color-fg-secondary)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-gensis-black)]"
      >
        {currentTab.content}
      </div>
    </div>
  );
};
