import { asc, eq } from "drizzle-orm";
import Link from "next/link";
import { ConfirmButton } from "@/components/confirm-button";
import { btnCls, btnDangerCls, btnPrimaryCls, tdCls, thCls, trCls } from "@/components/ui";
import { db } from "@/db";
import { clients, invoices } from "@/db/schema";
import { requireUser } from "@/lib/auth";
import { deleteClient } from "./actions";

export default async function ClientsPage() {
  const user = await requireUser();
  const rows = await db.select().from(clients).where(eq(clients.userId, user.id)).orderBy(asc(clients.name));
  const withInvoices = new Set(
    (await db.selectDistinct({ id: invoices.clientId }).from(invoices).where(eq(invoices.userId, user.id))).map(
      (r) => r.id,
    ),
  );

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h1 className="text-2xl font-semibold tracking-tight">Clientes</h1>
        <Link href="/clients/new" className={btnPrimaryCls}>+ Nuevo cliente</Link>
      </div>

      {rows.length === 0 ? (
        <div className="rounded-xl border border-dashed border-line px-6 py-14 text-center">
          <p className="text-muted">Aún no tienes clientes. Necesitas al menos uno para emitir facturas.</p>
          <Link href="/clients/new" className={`${btnPrimaryCls} mt-4`}>Crear mi primer cliente</Link>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-line bg-surface">
          <table className="w-full text-sm">
            <thead className="border-b border-line">
              <tr>
                <th className={thCls}>Nombre</th>
                <th className={thCls}>NIT / ID</th>
                <th className={thCls}>Correo</th>
                <th className={thCls}></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {rows.map((c) => (
                <tr className={trCls} key={c.id}>
                  <td className={`${tdCls} font-medium`}>{c.name}</td>
                  <td className={tdCls}>{c.taxId || "—"}</td>
                  <td className={tdCls}>{c.email || "—"}</td>
                  <td className={tdCls}><div className="flex items-center justify-end gap-2">
                    <Link href={`/clients/${c.id}/edit`} className={btnCls}>Editar</Link>
                    {withInvoices.has(c.id) ? (
                      <span className="text-xs text-muted" title="No se puede eliminar un cliente con facturas">Con facturas</span>
                    ) : (
                      <form action={deleteClient.bind(null, c.id)}>
                        <ConfirmButton message={`¿Eliminar al cliente "${c.name}"?`} className={btnDangerCls}>Eliminar</ConfirmButton>
                      </form>
                    )}
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
