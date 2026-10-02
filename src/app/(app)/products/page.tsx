import { and, asc, eq, like } from "drizzle-orm";
import Link from "next/link";
import { ConfirmButton } from "@/components/confirm-button";
import { btnCls, btnDangerCls, btnPrimaryCls, inputCls, tdCls, thCls, trCls } from "@/components/ui";
import { db } from "@/db";
import { products } from "@/db/schema";
import { requireUser } from "@/lib/auth";
import { formatMoney } from "@/lib/format";
import { getProfile } from "@/lib/profile";
import { deleteProduct } from "./actions";

export default async function ProductsPage({ searchParams }: PageProps<"/products">) {
  const user = await requireUser();
  const { q } = await searchParams;
  const term = typeof q === "string" ? q.trim() : "";

  const { currency } = await getProfile(user.id);
  const rows = await db
    .select()
    .from(products)
    .where(and(eq(products.userId, user.id), term ? like(products.name, `%${term}%`) : undefined))
    .orderBy(asc(products.name));

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h1 className="text-2xl font-semibold tracking-tight">Productos</h1>
        <Link href="/products/new" className={btnPrimaryCls}>+ Nuevo producto</Link>
      </div>

      <form className="flex max-w-md gap-2">
        <input name="q" type="search" defaultValue={term} placeholder="Buscar por nombre…" className={inputCls} />
        <button className={btnCls}>Buscar</button>
      </form>

      {rows.length === 0 ? (
        <div className="rounded-xl border border-dashed border-line px-6 py-14 text-center">
          <p className="text-muted">{term ? "Ningún producto coincide con tu búsqueda." : "Aún no tienes productos."}</p>
          {!term && <Link href="/products/new" className={`${btnPrimaryCls} mt-4`}>Crear mi primer producto</Link>}
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-line bg-surface">
          <table className="w-full text-sm">
            <thead className="border-b border-line">
              <tr>
                <th className={thCls}>Nombre</th>
                <th className={thCls}>Unidad</th>
                <th className={`${thCls} text-right`}>Precio</th>
                <th className={thCls}>Estado</th>
                <th className={thCls}></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {rows.map((p) => (
                <tr className={trCls} key={p.id}>
                  <td className={tdCls}>
                    <div className="font-medium">{p.name}</div>
                    {p.description && <div className="text-xs text-muted">{p.description}</div>}
                  </td>
                  <td className={tdCls}>{p.unit}</td>
                  <td className={`${tdCls} text-right tabular-nums`}>{formatMoney(p.price, currency)}</td>
                  <td className={tdCls}>
                    <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${p.active ? "bg-ok-soft text-ok" : "bg-background text-muted"}`}>
                      {p.active ? "Activo" : "Inactivo"}
                    </span>
                  </td>
                  <td className={tdCls}><div className="flex justify-end gap-2">
                    <Link href={`/products/${p.id}/edit`} className={btnCls}>Editar</Link>
                    <form action={deleteProduct.bind(null, p.id)}>
                      <ConfirmButton message={`¿Eliminar el producto "${p.name}"?`} className={btnDangerCls}>Eliminar</ConfirmButton>
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
