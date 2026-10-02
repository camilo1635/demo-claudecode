import { and, asc, eq } from "drizzle-orm";
import { notFound } from "next/navigation";
import { db } from "@/db";
import { clients, invoiceItems, invoices, products } from "@/db/schema";
import { requireUser } from "@/lib/auth";
import { getProfile } from "@/lib/profile";
import { InvoiceEditor } from "../../invoice-editor";

export default async function EditInvoicePage({ params }: PageProps<"/invoices/[id]/edit">) {
  const user = await requireUser();
  const { id } = await params;
  const [invoice] = await db
    .select()
    .from(invoices)
    .where(and(eq(invoices.id, id), eq(invoices.userId, user.id)))
    .limit(1);
  if (!invoice) notFound();

  const profile = await getProfile(user.id);
  const [items, clientRows, productRows] = await Promise.all([
    db.select().from(invoiceItems).where(eq(invoiceItems.invoiceId, id)),
    db.select({ id: clients.id, name: clients.name }).from(clients).where(eq(clients.userId, user.id)).orderBy(asc(clients.name)),
    // Incluye inactivos para no perder el producto de una línea existente.
    db.select({ id: products.id, name: products.name, price: products.price }).from(products).where(eq(products.userId, user.id)).orderBy(asc(products.name)),
  ]);

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold tracking-tight">Editar factura {invoice.number}</h1>
      <InvoiceEditor
        invoiceId={id}
        initial={{
          clientId: invoice.clientId,
          number: invoice.number,
          issueDate: invoice.issueDate,
          dueDate: invoice.dueDate,
          status: invoice.status,
          discountPct: invoice.discountPct,
          taxPct: invoice.taxPct,
          notes: invoice.notes,
          items: items.map((i) => ({
            productId: i.productId,
            description: i.description,
            qty: i.qty,
            unitPrice: i.unitPrice,
          })),
        }}
        clients={clientRows}
        products={productRows}
        currency={profile.currency}
        company={{ name: profile.companyName, info: profile.companyInfo }}
      />
    </div>
  );
}
