import { and, eq } from "drizzle-orm";
import { notFound } from "next/navigation";
import { db } from "@/db";
import { clients } from "@/db/schema";
import { requireUser } from "@/lib/auth";
import { updateClient } from "../../actions";
import { ClientForm } from "../../client-form";

export default async function EditClientPage({ params }: PageProps<"/clients/[id]/edit">) {
  const user = await requireUser();
  const { id } = await params;
  const [client] = await db
    .select()
    .from(clients)
    .where(and(eq(clients.id, id), eq(clients.userId, user.id)))
    .limit(1);
  if (!client) notFound();

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold tracking-tight">Editar cliente</h1>
      <ClientForm action={updateClient.bind(null, id)} client={client} />
    </div>
  );
}
