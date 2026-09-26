"use client";

import * as React from "react";
import type { ProductVariant } from "@/types/product";

export interface VariantSelectorProps {
  variants: ProductVariant[];
  selectedVariantId?: string;
  onVariantChange: (variant: ProductVariant) => void;
  className?: string;
}

/** A local derived type — not a domain model. */
type OptionGroup = {
  name: string;
  values: string[];
};

/** Derive unique, ordered option groups from the variant list. */
function deriveOptionGroups(variants: ProductVariant[]): OptionGroup[] {
  const groupMap = new Map<string, Set<string>>();

  for (const variant of variants) {
    for (const option of variant.options) {
      if (!groupMap.has(option.name)) {
        groupMap.set(option.name, new Set());
      }
      groupMap.get(option.name)!.add(option.value);
    }
  }

  return Array.from(groupMap.entries()).map(([name, valuesSet]) => ({
    name,
    values: Array.from(valuesSet),
  }));
}

/** Read the option selections from the currently selected variant, if any. */
function selectionsFromVariant(
  variant: ProductVariant | undefined
): Record<string, string> {
  if (!variant) return {};
  return Object.fromEntries(variant.options.map((o) => [o.name, o.value]));
}

/** Find a variant that exactly matches the given option selection map. */
function findMatchingVariant(
  variants: ProductVariant[],
  selections: Record<string, string>
): ProductVariant | undefined {
  return variants.find((v) =>
    v.options.every((o) => selections[o.name] === o.value)
  );
}

/**
 * Given current selections and a candidate option name/value, determine whether
 * any real variant can accommodate that value alongside the other selections.
 */
function isOptionValueCompatible(
  variants: ProductVariant[],
  currentSelections: Record<string, string>,
  optionName: string,
  optionValue: string
): boolean {
  const hypothetical = { ...currentSelections, [optionName]: optionValue };

  return variants.some((v) =>
    Object.entries(hypothetical).every(([name, value]) => {
      const match = v.options.find((o) => o.name === name);
      return match ? match.value === value : true;
    })
  );
}

export const VariantSelector = ({
  variants,
  selectedVariantId,
  onVariantChange,
  className = "",
}: VariantSelectorProps) => {
  // Resolve the currently selected variant object (may be undefined).
  const selectedVariant = React.useMemo(
    () => variants.find((v) => v.id === selectedVariantId),
    [variants, selectedVariantId]
  );

  // Local selections track the option values chosen so far.
  const [selections, setSelections] = React.useState<Record<string, string>>(
    () => selectionsFromVariant(selectedVariant)
  );

  // React-recommended derived-state pattern: store previous prop in state.
  // When selectedVariantId changes from the outside, reset local selections to match.
  // See: https://react.dev/learn/you-might-not-need-an-effect#adjusting-some-state-when-a-prop-changes
  const [prevSelectedVariantId, setPrevSelectedVariantId] = React.useState(selectedVariantId);
  if (prevSelectedVariantId !== selectedVariantId) {
    setPrevSelectedVariantId(selectedVariantId);
    setSelections(selectionsFromVariant(selectedVariant));
  }

  const optionGroups = React.useMemo(
    () => deriveOptionGroups(variants),
    [variants]
  );

  if (variants.length === 0) {
    return (
      <p className="font-sans text-[length:var(--text-small)] text-[var(--color-fg-muted)]">
        No options available.
      </p>
    );
  }

  if (optionGroups.length === 0) {
    return null;
  }

  const handleOptionChange = (optionName: string, optionValue: string) => {
    const next = { ...selections, [optionName]: optionValue };
    setSelections(next);

    const matched = findMatchingVariant(variants, next);
    if (matched) {
      onVariantChange(matched);
    }
  };

  return (
    <div className={`flex flex-col gap-[var(--spacing-6)] ${className}`}>
      {optionGroups.map((group) => {
        const selectedValue = selections[group.name];

        return (
          <fieldset key={group.name} className="border-none p-0 m-0">
            <legend className="font-sans text-[length:var(--text-small)] tracking-[var(--tracking-label)] uppercase text-[var(--color-fg-muted)] mb-[var(--spacing-3)]">
              {group.name}
            </legend>

            <div className="flex flex-wrap gap-[var(--spacing-2)]">
              {group.values.map((value) => {
                const isSelected = selectedValue === value;
                const isCompatible = isOptionValueCompatible(
                  variants,
                  selections,
                  group.name,
                  value
                );

                // A value is interactive only when it belongs to a compatible,
                // non-unavailable variant.
                const compatibleVariant = findMatchingVariant(variants, {
                  ...selections,
                  [group.name]: value,
                });
                const isUnavailable =
                  compatibleVariant?.availability === "unavailable";
                const isSoldOut =
                  compatibleVariant?.availability === "sold-out";
                const isDisabled = !isCompatible || isUnavailable || isSoldOut;

                const inputId = `option-${group.name}-${value}`;

                return (
                  <label
                    key={value}
                    htmlFor={inputId}
                    className={[
                      "relative inline-flex items-center justify-center",
                      "min-w-[var(--spacing-10)] h-[var(--spacing-10)] px-[var(--spacing-3)]",
                      "font-sans text-[length:var(--text-small)] tracking-[var(--tracking-small)]",
                      "border cursor-pointer select-none",
                      "transition-colors duration-[var(--duration-fast)] ease-[var(--ease-default)] motion-reduce:transition-none",
                      // Focus ring on the label when the sr-only radio inside is focused
                      "has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-[var(--color-gensis-black)] has-[:focus-visible]:ring-offset-2",
                      isSelected
                        ? "border-[var(--color-gensis-black)] bg-[var(--color-gensis-black)] text-[var(--color-fg-inverse)]"
                        : isDisabled
                        ? "border-[var(--color-border-subtle)] text-[var(--color-fg-muted)] cursor-not-allowed opacity-50"
                        : "border-[var(--color-border-default)] text-[var(--color-fg-primary)] hover:border-[var(--color-gensis-black)]",
                      isSoldOut && !isSelected
                        ? "line-through"
                        : "",
                    ]
                      .filter(Boolean)
                      .join(" ")}
                  >
                    <input
                      type="radio"
                      id={inputId}
                      name={group.name}
                      value={value}
                      checked={isSelected}
                      disabled={isDisabled}
                      onChange={() => handleOptionChange(group.name, value)}
                      className="sr-only"
                    />
                    {value}
                    {isSoldOut && (
                      <span className="sr-only"> (sold out)</span>
                    )}
                    {isUnavailable && (
                      <span className="sr-only"> (unavailable)</span>
                    )}
                  </label>
                );
              })}

            </div>
          </fieldset>
        );
      })}
    </div>
  );
};
