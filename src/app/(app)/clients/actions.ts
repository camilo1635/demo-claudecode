"use server";

import { and, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { db } from "@/db";
import { clients, invoices } from "@/db/schema";
import { requireUser } from "@/lib/auth";

export type ClientState = { error?: string } | undefined;

const clientSchema = z.object({
  name: z.string().trim().min(1, "El nombre es obligatorio"),
  taxId: z.string().trim().default(""),
  email: z.union([z.literal(""), z.string().trim().email("Correo no válido")]),
  address: z.string().trim().default(""),
});

export async function createClient(_: ClientState, formData: FormData): Promise<ClientState> {
  const user = await requireUser();
  const parsed = clientSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { error: parsed.error.issues[0].message };

  await db.insert(clients).values({ ...parsed.data, userId: user.id });
  revalidatePath("/clients");
  redirect("/clients");
}

export async function updateClient(id: string, _: ClientState, formData: FormData): Promise<ClientState> {
  const user = await requireUser();
  const parsed = clientSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { error: parsed.error.issues[0].message };

  await db
    .update(clients)
    .set(parsed.data)
    .where(and(eq(clients.id, id), eq(clients.userId, user.id)));
  revalidatePath("/clients");
  redirect("/clients");
}

/** No se puede borrar un cliente con facturas (FK restrict); en ese caso no hace nada. */
export async function deleteClient(id: string) {
  const user = await requireUser();
  const [used] = await db
    .select({ id: invoices.id })
    .from(invoices)
    .where(and(eq(invoices.clientId, id), eq(invoices.userId, user.id)))
    .limit(1);
  if (used) return;

  await db.delete(clients).where(and(eq(clients.id, id), eq(clients.userId, user.id)));
  revalidatePath("/clients");
}
