import { and, asc, eq } from "drizzle-orm";
import { db } from "@/db";
import { clients, products } from "@/db/schema";
import { requireUser } from "@/lib/auth";
import { addDaysISO, todayISO } from "@/lib/format";
import { nextInvoiceNumber } from "@/lib/invoice-number";
import { getProfile } from "@/lib/profile";
import { InvoiceEditor } from "../invoice-editor";

export default async function NewInvoicePage() {
  const user = await requireUser();
  const profile = await getProfile(user.id);
  const [clientRows, productRows, number] = await Promise.all([
    db.select({ id: clients.id, name: clients.name }).from(clients).where(eq(clients.userId, user.id)).orderBy(asc(clients.name)),
    db
      .select({ id: products.id, name: products.name, price: products.price })
      .from(products)
      .where(and(eq(products.userId, user.id), eq(products.active, true)))
      .orderBy(asc(products.name)),
    nextInvoiceNumber(user.id, profile.invoicePrefix),
  ]);
  const today = todayISO();

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold tracking-tight">Nueva factura</h1>
      <InvoiceEditor
        invoiceId={null}
        initial={{
          clientId: "",
          number,
          issueDate: today,
          dueDate: addDaysISO(today, 30),
          status: "pendiente",
          discountPct: 0,
          taxPct: profile.defaultTax,
          notes: "",
          items: [],
        }}
        clients={clientRows}
        products={productRows}
        currency={profile.currency}
        company={{ name: profile.companyName, info: profile.companyInfo }}
      />
    </div>
  );
}
