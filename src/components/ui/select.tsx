"use client";

import { createContext, useContext, type ReactNode } from "react";
import { Select as RadixSelect } from "radix-ui";
import { Check, ChevronDown } from "lucide-react";
import styles from "./select.module.css";

export type SelectOption = { value: string; label: string };

/**
 * Radix portals mount at <body>, which paints BELOW a native modal <dialog>
 * (top layer). Dialogs provide themselves as the portal container so their
 * Selects stay clickable above the dialog surface.
 */
const SelectPortalContext = createContext<HTMLElement | null>(null);

export function SelectPortalProvider({ container, children }: { container: HTMLElement | null; children: ReactNode }) {
  return <SelectPortalContext.Provider value={container}>{children}</SelectPortalContext.Provider>;
}

/** Design-system dropdown built on Radix Select — replaces native <select> menus. */
export function Select({
  value,
  onValueChange,
  options,
  placeholder = "Pilih…",
  ariaLabel,
  disabled = false,
  id,
  className,
}: {
  value: string;
  onValueChange: (value: string) => void;
  options: SelectOption[];
  placeholder?: string;
  ariaLabel?: string;
  disabled?: boolean;
  id?: string;
  className?: string;
}) {
  const portalContainer = useContext(SelectPortalContext);
  return (
    <RadixSelect.Root value={value} onValueChange={onValueChange} disabled={disabled}>
      <RadixSelect.Trigger id={id} className={`${styles.trigger} ${className ?? ""}`} aria-label={ariaLabel}>
        <RadixSelect.Value placeholder={placeholder} />
        <RadixSelect.Icon className={styles.icon}>
          <ChevronDown size={15} aria-hidden="true" />
        </RadixSelect.Icon>
      </RadixSelect.Trigger>
      <RadixSelect.Portal container={portalContainer ?? undefined}>
        <RadixSelect.Content className={styles.content} position="popper" sideOffset={7} collisionPadding={12}>
          <RadixSelect.Viewport className={styles.viewport}>
            {options.map((option) => (
              <RadixSelect.Item key={option.value} value={option.value} className={styles.item}>
                <RadixSelect.ItemIndicator className={styles.indicator}>
                  <Check size={14} aria-hidden="true" />
                </RadixSelect.ItemIndicator>
                <RadixSelect.ItemText>{option.label}</RadixSelect.ItemText>
              </RadixSelect.Item>
            ))}
          </RadixSelect.Viewport>
        </RadixSelect.Content>
      </RadixSelect.Portal>
    </RadixSelect.Root>
  );
}
