import { AdminPageHeading } from "@/components/admin-page-heading";
import { ImportForm } from "./import-form";

export default function ImportPage() {
  return (
    <div>
      <AdminPageHeading message="importMD" />
      <ImportForm />
    </div>
  );
}
