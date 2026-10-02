"use client";

import { useEffect, useState } from "react";
import type { Flash } from "@/lib/flash";

const DURATION_MS = 5000;

// Aviso superior de un solo uso: se cierra solo o con el botón.
export function FlashMessage({ flash }: { flash: Flash | null }) {
  const [current, setCurrent] = useState<Flash | null>(flash);
  const [seenId, setSeenId] = useState(flash?.id);

  // Nuevo mensaje desde el servidor (ajuste de estado durante el render).
  if (flash && flash.id !== seenId) {
    setSeenId(flash.id);
    setCurrent(flash);
  }

  useEffect(() => {
    if (!current) return;
    // Consumir la cookie: el mensaje dura una sola petición.
    document.cookie = "flash=; Max-Age=0; path=/";
    const t = setTimeout(() => setCurrent(null), DURATION_MS);
    return () => clearTimeout(t);
  }, [current]);

  if (!current) return null;
  const ok = current.type === "success";
  return (
    <div className="pointer-events-none fixed inset-x-0 top-3 z-50 flex justify-center px-4 print:hidden">
      <div
        role={ok ? "status" : "alert"}
        className={`pointer-events-auto flex w-full max-w-md items-start gap-3 rounded-lg border px-4 py-3 text-sm shadow-lg ${
          ok ? "border-ok/40 bg-surface text-foreground" : "border-danger/40 bg-danger-soft text-danger"
        }`}
      >
        <span aria-hidden className={`mt-1 size-2 shrink-0 rounded-full ${ok ? "bg-ok" : "bg-danger"}`} />
        <p className="flex-1">{current.text}</p>
        <button
          type="button"
          onClick={() => setCurrent(null)}
          aria-label="Cerrar aviso"
          className="-my-1 -mr-1 rounded px-1.5 text-lg leading-none text-muted hover:text-foreground"
        >
          ×
        </button>
      </div>
    </div>
  );
}
