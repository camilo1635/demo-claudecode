import { and, eq } from "drizzle-orm";
import Link from "next/link";
import { notFound } from "next/navigation";
import { StatusBadge } from "@/components/status-badge";
import { btnCls, trCls } from "@/components/ui";
import { db } from "@/db";
import { clients, invoiceItems, invoices } from "@/db/schema";
import { requireUser } from "@/lib/auth";
import { formatDate, formatMoney } from "@/lib/format";
import { getProfile } from "@/lib/profile";
import { computeTotals, displayStatus } from "@/lib/totals";
import { setInvoiceStatus } from "../actions";
import { PrintButton } from "./print-button";

export default async function InvoiceDetailPage({ params }: PageProps<"/invoices/[id]">) {
  const user = await requireUser();
  const { id } = await params;
  const [row] = await db
    .select({ invoice: invoices, client: clients })
    .from(invoices)
    .innerJoin(clients, eq(clients.id, invoices.clientId))
    .where(and(eq(invoices.id, id), eq(invoices.userId, user.id)))
    .limit(1);
  if (!row) notFound();

  const { invoice, client } = row;
  const [items, profile] = await Promise.all([
    db.select().from(invoiceItems).where(eq(invoiceItems.invoiceId, id)),
    getProfile(user.id),
  ]);

  const totals = computeTotals(items, invoice.discountPct, invoice.taxPct);
  const status = displayStatus(invoice.status, invoice.dueDate);
  const money = (n: number) => formatMoney(n, profile.currency);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2 print:hidden">
        <Link href="/invoices" className={btnCls}>← Volver</Link>
        <Link href={`/invoices/${id}/edit`} className={btnCls}>Editar</Link>
        {status !== "pagada" ? (
          <form action={setInvoiceStatus.bind(null, id, "pagada")}>
            <button className={btnCls}>Marcar pagada</button>
          </form>
        ) : (
          <form action={setInvoiceStatus.bind(null, id, "pendiente")}>
            <button className={btnCls}>Marcar pendiente</button>
          </form>
        )}
        <PrintButton />
      </div>

      <article className="space-y-8 rounded-xl border border-line bg-surface p-6 shadow-sm sm:p-10 print:border-0 print:p-0 print:shadow-none">
        <header className="flex flex-wrap justify-between gap-6">
          <div>
            <div className="text-xl font-semibold">{profile.companyName || profile.name}</div>
            <pre className="whitespace-pre-wrap font-sans text-sm text-muted">{profile.companyInfo}</pre>
          </div>
          <div className="text-right">
            <div className="text-2xl font-semibold tracking-tight text-accent">Factura</div>
            <div className="font-medium">{invoice.number}</div>
            <div className="text-sm text-muted">Emitida: {formatDate(invoice.issueDate)}</div>
            <div className="text-sm text-muted">Vence: {formatDate(invoice.dueDate)}</div>
            <div className="mt-1 print:hidden"><StatusBadge status={status} /></div>
            {status === "pagada" && <div className="hidden font-semibold uppercase print:block">Pagada</div>}
          </div>
        </header>

        <section>
          <h2 className="text-xs font-medium text-muted">Facturar a</h2>
          <div className="font-medium">{client.name}</div>
          {client.taxId && <div className="text-sm">NIT / ID: {client.taxId}</div>}
          {client.email && <div className="text-sm">{client.email}</div>}
          {client.address && <pre className="whitespace-pre-wrap font-sans text-sm">{client.address}</pre>}
        </section>

        <table className="w-full text-sm">
          <thead className="border-b border-line text-left text-xs font-medium text-muted">
            <tr>
              <th className="py-2">Descripción</th>
              <th className="py-2 text-right">Cant.</th>
              <th className="py-2 text-right">Precio</th>
              <th className="py-2 text-right">Importe</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {items.map((i) => (
              <tr className={trCls} key={i.id}>
                <td className="py-2">{i.description}</td>
                <td className="py-2 text-right">{i.qty}</td>
                <td className="py-2 text-right">{money(i.unitPrice)}</td>
                <td className="py-2 text-right">{money(i.qty * i.unitPrice)}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="flex flex-wrap justify-between gap-6">
          <div className="max-w-sm">
            {invoice.notes && (
              <>
                <h2 className="text-xs font-medium text-muted">Notas</h2>
                <pre className="whitespace-pre-wrap font-sans text-sm">{invoice.notes}</pre>
              </>
            )}
          </div>
          <dl className="w-full max-w-xs space-y-1 text-sm">
            <Line label="Subtotal" value={money(totals.subtotal)} />
            {invoice.discountPct > 0 && <Line label={`Descuento (${invoice.discountPct}%)`} value={`−${money(totals.discount)}`} />}
            <Line label={`Impuesto (${invoice.taxPct}%)`} value={money(totals.tax)} />
            <div className="flex justify-between border-t border-foreground pt-2 text-lg font-semibold">
              <dt>Total</dt>
              <dd>{money(totals.total)}</dd>
            </div>
          </dl>
        </div>
      </article>
    </div>
  );
}

function Line({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between">
      <dt>{label}</dt>
      <dd>{value}</dd>
    </div>
  );
}
