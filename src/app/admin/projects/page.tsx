import { getProjects } from "@/lib/projects";
import { AdminProjects } from "@/components/admin-projects";
export const dynamic = "force-dynamic";
export default async function Page() { return <AdminProjects projects={await getProjects(true)} />; }
