"use client";
import {useLocale} from "next-intl";
import {SidebarToggle,useSidebarState} from "./sidebar-toggle";
export function NotesWorkspace({sidebar,children}:{sidebar:React.ReactNode;children:React.ReactNode}) {
  const {collapsed,toggle}=useSidebarState("notes-sidebar");
  const en=useLocale()==="en";
  return <main className={`notes-workspace ${collapsed?"is-sidebar-collapsed":""}`}><aside className="notes-sidebar"><div className="notes-sidebar-heading"><span>{en?"Directory":"目录"}</span><SidebarToggle collapsed={collapsed} onClick={toggle} controls="public-notes-tree" label={en?"notes directory":"笔记目录"}/></div><div id="public-notes-tree" hidden={collapsed}>{sidebar}</div></aside><div className="notes-main">{children}</div></main>;
}
