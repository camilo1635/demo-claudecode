"use client";

import { btnCls } from "@/components/ui";

export function PrintButton() {
  return (
    <button type="button" onClick={() => window.print()} className={btnCls}>
      Imprimir / PDF
    </button>
  );
}
