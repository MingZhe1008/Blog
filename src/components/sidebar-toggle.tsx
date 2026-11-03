"use client";
import { useEffect, useState } from "react";
import { PanelLeftClose, PanelLeftOpen } from "lucide-react";
import { useLocale } from "next-intl";

export function useSidebarState(storageKey: string) {
  const [collapsed,setCollapsed] = useState(false);
  useEffect(() => { try {setCollapsed(sessionStorage.getItem(storageKey)==="collapsed");} catch {} },[storageKey]);
  function toggle() {setCollapsed(previous => {const next=!previous;try {sessionStorage.setItem(storageKey,next?"collapsed":"open");} catch {}return next;});}
  return {collapsed,toggle};
}
export function SidebarToggle({collapsed,onClick,controls,label}: {collapsed:boolean;onClick:()=>void;controls:string;label:string}) {
  const en = useLocale()==="en";
  const text = `${collapsed ? (en ? "Show" : "展开") : (en ? "Hide" : "隐藏")} ${label}`;
  return <button type="button" className="sidebar-toggle" onClick={onClick} aria-controls={controls} aria-expanded={!collapsed} aria-label={text} title={text}>{collapsed?<PanelLeftOpen size={19}/>:<PanelLeftClose size={19}/>}</button>;
}
