import { inputCls } from "@/components/ui";
import type { Totals } from "@/lib/totals";

type Props = {
  totals: Totals;
  discountPct: number;
  taxPct: number;
  money: (n: number) => string;
  onDiscountChange: (pct: number) => void;
  onTaxChange: (pct: number) => void;
};

const num = (v: string) => (v === "" ? 0 : Number(v));

export function InvoiceTotals({ totals, discountPct, taxPct, money, onDiscountChange, onTaxChange }: Props) {
  return (
    <div className="w-full max-w-xs space-y-2 text-sm">
      <Row label="Subtotal" value={money(totals.subtotal)} />
      <PctField id="disc" label="Descuento (%)" value={discountPct} onChange={onDiscountChange} />
      <PctField id="tax" label="Impuesto (%)" value={taxPct} onChange={onTaxChange} />
      <Row label="Impuesto" value={money(totals.tax)} />
      <div className="border-t border-foreground pt-2 text-lg font-semibold">
        <Row label="Total" value={money(totals.total)} />
      </div>
    </div>
  );
}

function PctField({ id, label, value, onChange }: { id: string; label: string; value: number; onChange: (pct: number) => void }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <label htmlFor={id}>{label}</label>
      <input id={id} type="number" min="0" max="100" step="any" value={value} onChange={(e) => onChange(num(e.target.value))} className={`${inputCls} w-24 text-right`} />
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between">
      <span>{label}</span>
      <b>{value}</b>
    </div>
  );
}
