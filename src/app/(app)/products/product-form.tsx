"use client";

import Link from "next/link";
import { useActionState } from "react";
import { btnCls, btnPrimaryCls, inputCls, labelCls } from "@/components/ui";
import type { Product } from "@/db/schema";
import type { ProductState } from "./actions";

type Props = {
  action: (state: ProductState, formData: FormData) => Promise<ProductState>;
  product?: Product;
};

export function ProductForm({ action, product }: Props) {
  const [state, formAction, pending] = useActionState(action, undefined);

  return (
    <form action={formAction} className="max-w-lg space-y-4">
      <label className={labelCls}>
        Nombre
        <input name="name" required defaultValue={product?.name} className={inputCls} />
      </label>
      <label className={labelCls}>
        Descripción
        <textarea name="description" rows={3} defaultValue={product?.description} className={inputCls} />
      </label>
      <div className="grid grid-cols-2 gap-4">
        <label className={labelCls}>
          Precio
          <input
            name="price"
            type="number"
            min="0"
            step="any"
            required
            defaultValue={product?.price ?? 0}
            className={inputCls}
          />
        </label>
        <label className={labelCls}>
          Unidad
          <input name="unit" required defaultValue={product?.unit ?? "unidad"} className={inputCls} />
        </label>
      </div>
      <label className="flex items-center gap-2 text-sm">
        <input name="active" type="checkbox" defaultChecked={product?.active ?? true} />
        Activo (aparece al crear facturas)
      </label>
      {state?.error && <p className="text-sm text-danger">{state.error}</p>}
      <div className="flex gap-2">
        <button disabled={pending} className={btnPrimaryCls}>
          {pending ? "Guardando…" : "Guardar"}
        </button>
        <Link href="/products" className={btnCls}>Cancelar</Link>
      </div>
    </form>
  );
}
