export type LineInput = { qty: number; unitPrice: number };

export type Totals = {
  subtotal: number;
  discount: number;
  taxable: number;
  tax: number;
  total: number;
};

/** Subtotal → descuento → impuesto sobre la base ya descontada. */
export function computeTotals(items: LineInput[], discountPct: number, taxPct: number): Totals {
  const subtotal = items.reduce((sum, i) => sum + i.qty * i.unitPrice, 0);
  const discount = subtotal * (discountPct / 100);
  const taxable = subtotal - discount;
  const tax = taxable * (taxPct / 100);
  return { subtotal, discount, taxable, tax, total: taxable + tax };
}

export type DisplayStatus = "pendiente" | "pagada" | "vencida";

/** "Vencida" se deriva de la fecha; no se guarda en la BD. Fechas en formato YYYY-MM-DD. */
export function displayStatus(
  status: "pendiente" | "pagada",
  dueDate: string,
  today: string = new Date().toISOString().slice(0, 10),
): DisplayStatus {
  if (status === "pagada") return "pagada";
  return dueDate < today ? "vencida" : "pendiente";
}
