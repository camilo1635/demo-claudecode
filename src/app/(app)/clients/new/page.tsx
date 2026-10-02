import { createClient } from "../actions";
import { ClientForm } from "../client-form";

export default function NewClientPage() {
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold tracking-tight">Nuevo cliente</h1>
      <ClientForm action={createClient} />
    </div>
  );
}
