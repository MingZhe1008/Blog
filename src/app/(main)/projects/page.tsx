import type { Metadata } from "next";
import { ProjectsView } from "./projects-view";
import { getProjects } from "@/lib/projects";
export const dynamic = "force-dynamic";

export const metadata: Metadata = { title: "项目 | MingZhe" };

export default async function ProjectsPage() {
  return <ProjectsView projects={await getProjects()} />;
}
