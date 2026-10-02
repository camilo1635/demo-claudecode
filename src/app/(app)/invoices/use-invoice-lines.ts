import { useState } from "react";

export type Line = { key: string; productId: string | null; description: string; qty: number; unitPrice: number };
export type LineInit = Omit<Line, "key">;
export type ProductOption = { id: string; name: string; price: number };

const newLine = (): Line => ({ key: crypto.randomUUID(), productId: null, description: "", qty: 1, unitPrice: 0 });

/** Estado y operaciones inmutables de las líneas de una factura. */
export function useInvoiceLines(initial: LineInit[], products: ProductOption[]) {
  const [lines, setLines] = useState<Line[]>(() =>
    initial.length ? initial.map((i) => ({ ...i, key: crypto.randomUUID() })) : [newLine()],
  );

  const patch = (key: string, changes: Partial<Line>) =>
    setLines((ls) => ls.map((l) => (l.key === key ? { ...l, ...changes } : l)));

  const pickProduct = (key: string, productId: string) => {
    const p = products.find((x) => x.id === productId);
    patch(key, p ? { productId: p.id, description: p.name, unitPrice: p.price } : { productId: null });
  };

  const add = () => setLines((ls) => [...ls, newLine()]);
  const remove = (key: string) => setLines((ls) => (ls.length > 1 ? ls.filter((x) => x.key !== key) : ls));

  return { lines, patch, pickProduct, add, remove };
}
