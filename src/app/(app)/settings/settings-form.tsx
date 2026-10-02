"use client";

import { useActionState } from "react";
import { btnPrimaryCls, inputCls, labelCls } from "@/components/ui";
import type { SettingsState } from "./actions";

type Props = {
  action: (state: SettingsState, formData: FormData) => Promise<SettingsState>;
  values: { companyName: string; companyInfo: string; currency: string; defaultTax: number; invoicePrefix: string };
  currencies: readonly string[];
};

export function SettingsForm({ action, values, currencies }: Props) {
  const [state, formAction, pending] = useActionState(action, undefined);

  return (
    <form action={formAction} className="max-w-lg space-y-4">
      <label className={labelCls}>
        Nombre de la empresa
        <input name="companyName" defaultValue={values.companyName} className={inputCls} />
      </label>
      <label className={labelCls}>
        Datos (dirección, NIT, teléfono, correo)
        <textarea name="companyInfo" rows={4} defaultValue={values.companyInfo} className={inputCls} />
      </label>
      <div className="grid grid-cols-3 gap-4">
        <label className={labelCls}>
          Moneda
          <select name="currency" defaultValue={values.currency} className={inputCls}>
            {currencies.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </label>
        <label className={labelCls}>
          Impuesto por defecto (%)
          <input name="defaultTax" type="number" min="0" max="100" step="any" defaultValue={values.defaultTax} className={inputCls} />
        </label>
        <label className={labelCls}>
          Prefijo
          <input name="invoicePrefix" defaultValue={values.invoicePrefix} className={inputCls} />
        </label>
      </div>
      {state?.error && <p className="text-sm text-danger">{state.error}</p>}
      {state?.ok && <p className="text-sm text-ok">Cambios guardados</p>}
      <button disabled={pending} className={btnPrimaryCls}>
        {pending ? "Guardando…" : "Guardar"}
      </button>
    </form>
  );
}
