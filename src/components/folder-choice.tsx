"use client";

import { useId, useRef, useState } from "react";
import { ChevronDown, Folder } from "lucide-react";

export function FolderChoice({ options, label, emptyLabel, onSelect }: {
  options: string[]; label: string; emptyLabel: string; onSelect: (value: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const id = useId();
  const root = useRef<HTMLDivElement>(null);
  const trigger = useRef<HTMLButtonElement>(null);
  const focusItem = (index: number) => {
    const buttons = root.current?.querySelectorAll<HTMLButtonElement>('[role="menuitem"]');
    if (buttons?.length) buttons[(index + buttons.length) % buttons.length].focus();
  };
  return <div className="folder-choice" ref={root} onBlur={event => {
    if (!event.currentTarget.contains(event.relatedTarget)) setOpen(false);
  }} onKeyDown={event => {
    if (event.key === "Escape") { event.preventDefault(); setOpen(false); trigger.current?.focus(); }
  }}>
    <button ref={trigger} type="button" className="folder-choice-trigger" disabled={!options.length}
      aria-label={label} aria-haspopup="menu" aria-expanded={open} aria-controls={open ? id : undefined}
      onClick={() => setOpen(value => !value)} onKeyDown={event => {
        if (event.key === "ArrowDown") {
          event.preventDefault(); setOpen(true); requestAnimationFrame(() => focusItem(0));
        }
      }}><Folder size={15} aria-hidden="true" /><span>{options.length ? label : emptyLabel}</span><ChevronDown size={14} aria-hidden="true" /></button>
    {open && <div className="folder-choice-menu" role="menu" id={id} aria-label={label}>
      {options.map((option, index) => <button type="button" role="menuitem" key={option}
        onKeyDown={event => {
          if (["ArrowDown", "ArrowUp", "Home", "End"].includes(event.key)) {
            event.preventDefault(); focusItem(event.key === "Home" ? 0 : event.key === "End" ? options.length - 1 : index + (event.key === "ArrowDown" ? 1 : -1));
          }
        }} onClick={() => { onSelect(option); setOpen(false); trigger.current?.focus(); }}>
        <Folder size={14} aria-hidden="true" /><span>{option}</span>
      </button>)}
    </div>}
  </div>;
}
