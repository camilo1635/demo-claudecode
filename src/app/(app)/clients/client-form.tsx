"use client";

import Link from "next/link";
import { useActionState } from "react";
import { btnCls, btnPrimaryCls, inputCls, labelCls } from "@/components/ui";
import type { Client } from "@/db/schema";
import type { ClientState } from "./actions";

type Props = {
  action: (state: ClientState, formData: FormData) => Promise<ClientState>;
  client?: Client;
};

export function ClientForm({ action, client }: Props) {
  const [state, formAction, pending] = useActionState(action, undefined);

  return (
    <form action={formAction} className="max-w-lg space-y-4">
      <label className={labelCls}>
        Nombre
        <input name="name" required defaultValue={client?.name} className={inputCls} />
      </label>
      <div className="grid grid-cols-2 gap-4">
        <label className={labelCls}>
          NIT / ID fiscal
          <input name="taxId" defaultValue={client?.taxId} className={inputCls} />
        </label>
        <label className={labelCls}>
          Correo
          <input name="email" type="email" defaultValue={client?.email} className={inputCls} />
        </label>
      </div>
      <label className={labelCls}>
        Dirección
        <textarea name="address" rows={3} defaultValue={client?.address} className={inputCls} />
      </label>
      {state?.error && <p className="text-sm text-danger">{state.error}</p>}
      <div className="flex gap-2">
        <button disabled={pending} className={btnPrimaryCls}>
          {pending ? "Guardando…" : "Guardar"}
        </button>
        <Link href="/clients" className={btnCls}>Cancelar</Link>
      </div>
    </form>
  );
}
