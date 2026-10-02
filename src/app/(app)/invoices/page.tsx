import { desc, eq } from "drizzle-orm";
import Link from "next/link";
import { ConfirmButton } from "@/components/confirm-button";
import { StatusBadge } from "@/components/status-badge";
import { btnCls, btnDangerCls, btnPrimaryCls, inputCls, tdCls, thCls, trCls } from "@/components/ui";
import { db } from "@/db";
import { clients, invoiceItems, invoices } from "@/db/schema";
import { requireUser } from "@/lib/auth";
import { formatDate, formatMoney } from "@/lib/format";
import { getProfile } from "@/lib/profile";
import { computeTotals, displayStatus } from "@/lib/totals";
import { deleteInvoice, setInvoiceStatus } from "./actions";

export default async function InvoicesPage({ searchParams }: PageProps<"/invoices">) {
  const user = await requireUser();
  const { q, status } = await searchParams;
  const term = typeof q === "string" ? q.trim().toLowerCase() : "";
  const statusFilter = typeof status === "string" ? status : "";

  const profile = await getProfile(user.id);
  const [headers, items] = await Promise.all([
    db
      .select({ invoice: invoices, clientName: clients.name })
      .from(invoices)
      .innerJoin(clients, eq(clients.id, invoices.clientId))
      .where(eq(invoices.userId, user.id))
      .orderBy(desc(invoices.issueDate), desc(invoices.number)),
    db
      .select({ invoiceId: invoiceItems.invoiceId, qty: invoiceItems.qty, unitPrice: invoiceItems.unitPrice })
      .from(invoiceItems)
      .innerJoin(invoices, eq(invoices.id, invoiceItems.invoiceId))
      .where(eq(invoices.userId, user.id)),
  ]);

  const itemsByInvoice = new Map<string, typeof items>();
  for (const item of items) {
    const group = itemsByInvoice.get(item.invoiceId);
    if (group) group.push(item);
    else itemsByInvoice.set(item.invoiceId, [item]);
  }
  const all = headers.map(({ invoice, clientName }) => ({
    invoice,
    clientName,
    status: displayStatus(invoice.status, invoice.dueDate),
    total: computeTotals(itemsByInvoice.get(invoice.id) ?? [], invoice.discountPct, invoice.taxPct).total,
  }));

  const sumBy = (pred: (s: string) => boolean) => all.filter((r) => pred(r.status)).reduce((s, r) => s + r.total, 0);
  const stats = [
    ["Facturado", sumBy(() => true)],
    ["Cobrado", sumBy((s) => s === "pagada")],
    ["Pendiente", sumBy((s) => s === "pendiente")],
    ["Vencido", sumBy((s) => s === "vencida")],
  ] as const;

  const dots: Record<string, string> = {
    Facturado: "bg-foreground/40",
    Cobrado: "bg-ok",
    Pendiente: "bg-warn",
    Vencido: "bg-danger",
  };

  const rows = all.filter(
    (r) =>
      (!statusFilter || r.status === statusFilter) &&
      (!term || r.clientName.toLowerCase().includes(term) || r.invoice.number.toLowerCase().includes(term)),
  );

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h1 className="text-2xl font-semibold tracking-tight">Facturas</h1>
        <Link href="/invoices/new" className={btnPrimaryCls}>+ Nueva factura</Link>
      </div>

      <dl className="grid grid-cols-2 divide-line overflow-hidden rounded-xl border border-line bg-surface md:grid-cols-4 md:divide-x">
        {stats.map(([label, value]) => (
          <div key={label} className="border-line p-4 max-md:odd:border-r max-md:[&:nth-child(n+3)]:border-t">
            <dt className="flex items-center gap-1.5 text-sm text-muted">
              <span aria-hidden className={`size-2 rounded-full ${dots[label]}`} />
              {label}
            </dt>
            <dd className="mt-1 text-xl font-semibold tabular-nums">{formatMoney(value, profile.currency)}</dd>
          </div>
        ))}
      </dl>

      <form className="flex flex-wrap gap-2">
        <input name="q" type="search" defaultValue={q as string | undefined} placeholder="Buscar por cliente o número…" className={`${inputCls} max-w-sm flex-1`} />
        <select name="status" defaultValue={statusFilter} className={`${inputCls} w-auto`}>
          <option value="">Todos los estados</option>
          <option value="pendiente">Pendiente</option>
          <option value="pagada">Pagada</option>
          <option value="vencida">Vencida</option>
        </select>
        <button className={btnCls}>Filtrar</button>
        {(term || statusFilter) && <Link href="/invoices" className={btnCls}>Limpiar</Link>}
      </form>

      {rows.length === 0 ? (
        <div className="rounded-xl border border-dashed border-line px-6 py-14 text-center">
          <p className="text-muted">
            {all.length === 0 ? "Aún no has emitido ninguna factura." : "Ninguna factura coincide con tu búsqueda."}
          </p>
          {all.length === 0 && (
            <Link href="/invoices/new" className={`${btnPrimaryCls} mt-4`}>Crear mi primera factura</Link>
          )}
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-line bg-surface">
          <table className="w-full text-sm">
            <thead className="border-b border-line">
              <tr>
                <th className={thCls}>Nº</th>
                <th className={thCls}>Cliente</th>
                <th className={thCls}>Fecha</th>
                <th className={thCls}>Vence</th>
                <th className={`${thCls} text-right`}>Total</th>
                <th className={thCls}>Estado</th>
                <th className={thCls}></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {rows.map(({ invoice, clientName, status, total }) => (
                <tr className={trCls} key={invoice.id}>
                  <td className={`${tdCls} font-medium`}>
                    <Link href={`/invoices/${invoice.id}`} className="font-semibold text-accent hover:underline">{invoice.number}</Link>
                  </td>
                  <td className={tdCls}>{clientName}</td>
                  <td className={tdCls}>{formatDate(invoice.issueDate)}</td>
                  <td className={tdCls}>{formatDate(invoice.dueDate)}</td>
                  <td className={`${tdCls} text-right font-medium tabular-nums`}>{formatMoney(total, profile.currency)}</td>
                  <td className={tdCls}><StatusBadge status={status} /></td>
                  <td className={tdCls}><div className="flex justify-end gap-2">
                    {status !== "pagada" && (
                      <form action={setInvoiceStatus.bind(null, invoice.id, "pagada")}>
                        <button className={btnCls}>Marcar pagada</button>
                      </form>
                    )}
                    <form action={deleteInvoice.bind(null, invoice.id)}>
                      <ConfirmButton message={`¿Eliminar la factura ${invoice.number}? No se puede deshacer.`} className={btnDangerCls}>Eliminar</ConfirmButton>
                    </form>
                  </div></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
