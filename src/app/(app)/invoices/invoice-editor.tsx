"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { btnCls, btnPrimaryCls, inputCls, labelCls } from "@/components/ui";
import { formatMoney } from "@/lib/format";
import { invoiceSchema, type InvoiceInput } from "@/lib/invoice-schema";
import { computeTotals } from "@/lib/totals";
import { saveInvoice } from "./actions";
import { InvoiceLinesTable } from "./invoice-lines-table";
import { InvoiceTotals } from "./invoice-totals";
import { useInvoiceLines, type LineInit, type ProductOption } from "./use-invoice-lines";

export type EditorInitial = {
  clientId: string;
  number: string;
  issueDate: string;
  dueDate: string;
  status: "pendiente" | "pagada";
  discountPct: number;
  taxPct: number;
  notes: string;
  items: LineInit[];
};

type Props = {
  invoiceId: string | null;
  initial: EditorInitial;
  clients: { id: string; name: string }[];
  products: ProductOption[];
  currency: string;
  company: { name: string; info: string };
};

export function InvoiceEditor({ invoiceId, initial, clients, products, currency, company }: Props) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string>();

  const [head, setHead] = useState({
    clientId: initial.clientId,
    number: initial.number,
    issueDate: initial.issueDate,
    dueDate: initial.dueDate,
    status: initial.status,
    notes: initial.notes,
  });
  const [discountPct, setDiscountPct] = useState(initial.discountPct);
  const [taxPct, setTaxPct] = useState(initial.taxPct);
  const { lines, patch, pickProduct, add, remove } = useInvoiceLines(initial.items, products);

  const totals = computeTotals(lines, discountPct, taxPct);
  const money = (n: number) => formatMoney(n, currency);

  function submit() {
    setError(undefined);
    const payload: InvoiceInput = {
      ...head,
      discountPct,
      taxPct,
      items: lines.map((l) => ({
        productId: l.productId,
        description: l.description,
        qty: l.qty,
        unitPrice: l.unitPrice,
      })),
    };
    const check = invoiceSchema.safeParse(payload);
    if (!check.success) {
      setError(check.error.issues[0].message);
      return;
    }
    startTransition(async () => {
      const res = await saveInvoice(invoiceId, payload);
      if ("error" in res) setError(res.error);
      else router.push(`/invoices/${res.id}`);
    });
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap justify-between gap-6 rounded-xl border border-line bg-surface p-5">
        <div>
          <div className="text-lg font-semibold">{company.name || "Tu empresa"}</div>
          <pre className="whitespace-pre-wrap font-sans text-sm text-muted">
            {company.info || "Configura tus datos en “Mi empresa”"}
          </pre>
        </div>
        <div className="grid w-full max-w-xs grid-cols-[70px_1fr] items-center gap-2 text-sm">
          <label htmlFor="number">Nº</label>
          <input id="number" value={head.number} onChange={(e) => setHead({ ...head, number: e.target.value })} className={inputCls} />
          <label htmlFor="issue">Fecha</label>
          <input id="issue" type="date" value={head.issueDate} onChange={(e) => setHead({ ...head, issueDate: e.target.value })} className={inputCls} />
          <label htmlFor="due">Vence</label>
          <input id="due" type="date" value={head.dueDate} onChange={(e) => setHead({ ...head, dueDate: e.target.value })} className={inputCls} />
          <label htmlFor="status">Estado</label>
          <select id="status" value={head.status} onChange={(e) => setHead({ ...head, status: e.target.value as "pendiente" | "pagada" })} className={inputCls}>
            <option value="pendiente">Pendiente</option>
            <option value="pagada">Pagada</option>
          </select>
        </div>
      </div>

      <label className={`${labelCls} max-w-sm`}>
        Cliente
        <select value={head.clientId} onChange={(e) => setHead({ ...head, clientId: e.target.value })} className={inputCls}>
          <option value="">Selecciona…</option>
          {clients.map((c) => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>
        {clients.length === 0 && (
          <span className="mt-1 block text-xs text-muted">
            Aún no tienes clientes. <Link href="/clients/new" className="text-accent underline">Crea uno</Link>.
          </span>
        )}
      </label>

      <InvoiceLinesTable lines={lines} products={products} money={money} onPatch={patch} onPickProduct={pickProduct} onRemove={remove} />
      <button type="button" onClick={add} className={btnCls}>
        + Añadir línea
      </button>

      <div className="flex flex-wrap gap-6">
        <label className={`${labelCls} min-w-64 flex-1`}>
          Notas
          <textarea rows={5} value={head.notes} onChange={(e) => setHead({ ...head, notes: e.target.value })} placeholder="Términos de pago, datos bancarios…" className={inputCls} />
        </label>
        <InvoiceTotals
          totals={totals}
          discountPct={discountPct}
          taxPct={taxPct}
          money={money}
          onDiscountChange={setDiscountPct}
          onTaxChange={setTaxPct}
        />
      </div>

      {error && <p className="text-sm text-danger">{error}</p>}
      <div className="flex gap-2">
        <button type="button" disabled={pending} onClick={submit} className={btnPrimaryCls}>
          {pending ? "Guardando…" : "Guardar factura"}
        </button>
        <Link href={invoiceId ? `/invoices/${invoiceId}` : "/invoices"} className={btnCls}>Cancelar</Link>
      </div>
    </div>
  );
}
