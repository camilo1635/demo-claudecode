import { inputCls, trCls } from "@/components/ui";
import type { Line, ProductOption } from "./use-invoice-lines";

type Props = {
  lines: Line[];
  products: ProductOption[];
  money: (n: number) => string;
  onPatch: (key: string, changes: Partial<Line>) => void;
  onPickProduct: (key: string, productId: string) => void;
  onRemove: (key: string) => void;
};

const num = (v: string) => (v === "" ? 0 : Number(v));

export function InvoiceLinesTable({ lines, products, money, onPatch, onPickProduct, onRemove }: Props) {
  return (
    <div className="overflow-x-auto rounded-xl border border-line bg-surface">
      <table className="w-full text-sm">
        <thead className="border-b border-line text-left text-xs font-medium text-muted">
          <tr>
            <th className="px-3 py-2">Producto</th>
            <th className="px-3 py-2">Descripción</th>
            <th className="w-24 px-3 py-2">Cant.</th>
            <th className="w-32 px-3 py-2">Precio</th>
            <th className="w-32 px-3 py-2 text-right">Importe</th>
            <th className="w-10" />
          </tr>
        </thead>
        <tbody className="divide-y divide-line">
          {lines.map((l) => (
            <tr className={trCls} key={l.key}>
              <td className="px-3 py-2">
                <select value={l.productId ?? ""} onChange={(e) => onPickProduct(l.key, e.target.value)} className={inputCls} aria-label="Producto">
                  <option value="">Texto libre</option>
                  {products.map((p) => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
                </select>
              </td>
              <td className="px-3 py-2">
                <input value={l.description} onChange={(e) => onPatch(l.key, { description: e.target.value })} placeholder="Descripción" className={inputCls} aria-label="Descripción" />
              </td>
              <td className="px-3 py-2">
                <input type="number" min="0" step="any" value={l.qty} onChange={(e) => onPatch(l.key, { qty: num(e.target.value) })} className={`${inputCls} text-right`} aria-label="Cantidad" />
              </td>
              <td className="px-3 py-2">
                <input type="number" min="0" step="any" value={l.unitPrice} onChange={(e) => onPatch(l.key, { unitPrice: num(e.target.value) })} className={`${inputCls} text-right`} aria-label="Precio" />
              </td>
              <td className="px-3 py-2 text-right tabular-nums">{money(l.qty * l.unitPrice)}</td>
              <td className="px-1">
                <button type="button" aria-label="Quitar línea" onClick={() => onRemove(l.key)} className="rounded-md px-2 py-1 text-muted transition-colors hover:bg-danger-soft hover:text-danger">
                  ✕
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
