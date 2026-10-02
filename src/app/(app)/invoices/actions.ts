"use server";

import { and, eq, inArray } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { db } from "@/db";
import { clients, invoiceItems, invoices, products } from "@/db/schema";
import { requireUser } from "@/lib/auth";
import { setFlash } from "@/lib/flash";
import { invoiceSchema, type InvoiceInput } from "@/lib/invoice-schema";

export type InvoiceResult = { error: string } | { id: string };

/** Crea (id = null) o actualiza una factura del usuario en sesión. */
export async function saveInvoice(id: string | null, input: InvoiceInput): Promise<InvoiceResult> {
  const user = await requireUser();
  const parsed = invoiceSchema.safeParse(input);
  if (!parsed.success) return { error: parsed.error.issues[0].message };
  const data = parsed.data;

  // El cliente y los productos referenciados deben pertenecer al usuario.
  const [client] = await db
    .select({ id: clients.id })
    .from(clients)
    .where(and(eq(clients.id, data.clientId), eq(clients.userId, user.id)))
    .limit(1);
  if (!client) return { error: "Cliente no válido" };

  const productIds = [...new Set(data.items.map((i) => i.productId).filter((p): p is string => !!p))];
  if (productIds.length) {
    const owned = await db
      .select({ id: products.id })
      .from(products)
      .where(and(eq(products.userId, user.id), inArray(products.id, productIds)));
    if (owned.length !== productIds.length) return { error: "Producto no válido" };
  }

  if (id) {
    const [existing] = await db
      .select({ id: invoices.id })
      .from(invoices)
      .where(and(eq(invoices.id, id), eq(invoices.userId, user.id)))
      .limit(1);
    if (!existing) return { error: "Factura no encontrada" };
  }

  const { items, ...header } = data;
  const invoiceId = id ?? crypto.randomUUID();

  try {
    await db.transaction(async (tx) => {
      if (id) {
        await tx.update(invoices).set(header).where(eq(invoices.id, id));
        await tx.delete(invoiceItems).where(eq(invoiceItems.invoiceId, id));
      } else {
        await tx.insert(invoices).values({ ...header, id: invoiceId, userId: user.id });
      }
      await tx.insert(invoiceItems).values(items.map((i) => ({ ...i, invoiceId })));
    });
  } catch (e) {
    if (String(e).includes("UNIQUE")) return { error: "Ya existe una factura con ese número" };
    throw e;
  }

  revalidatePath("/invoices");
  await setFlash(id ? `Factura ${data.number} actualizada` : `Factura ${data.number} creada`);
  return { id: invoiceId };
}

export async function setInvoiceStatus(id: string, status: "pendiente" | "pagada") {
  const user = await requireUser();
  await db
    .update(invoices)
    .set({ status })
    .where(and(eq(invoices.id, id), eq(invoices.userId, user.id)));
  revalidatePath("/invoices");
  revalidatePath(`/invoices/${id}`);
  await setFlash(status === "pagada" ? "Factura marcada como pagada" : "Factura marcada como pendiente");
}

export async function deleteInvoice(id: string) {
  const user = await requireUser();
  const deleted = await db
    .delete(invoices)
    .where(and(eq(invoices.id, id), eq(invoices.userId, user.id)))
    .returning({ number: invoices.number });
  revalidatePath("/invoices");
  if (deleted.length) await setFlash(`Factura ${deleted[0].number} eliminada`);
}
