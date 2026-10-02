// Clases Tailwind compartidas para mantener la UI consistente.
// Los colores salen de los tokens de globals.css (claro/oscuro automático).
export const inputCls =
  "w-full rounded-md border border-line bg-surface px-3 py-2 text-sm outline-none transition-colors placeholder:text-muted/70 hover:border-muted focus:border-accent focus:ring-2 focus:ring-accent/20";
export const labelCls = "block space-y-1.5 text-sm font-medium";
export const hintCls = "block text-xs font-normal text-muted";
const btnBase =
  "inline-flex items-center justify-center gap-1.5 rounded-md px-3.5 py-2 text-sm font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-60";
export const btnCls = `${btnBase} border border-line bg-surface hover:bg-background`;
export const btnPrimaryCls = `${btnBase} bg-accent text-white hover:bg-accent-hover dark:text-[#06201b]`;
export const btnDangerCls = `${btnBase} border border-line bg-surface text-danger hover:border-danger hover:bg-danger-soft`;
export const cardCls = "rounded-xl border border-line bg-surface";
export const tableWrapCls = `${cardCls} overflow-x-auto`;
export const thCls = "whitespace-nowrap px-4 py-3 text-left text-xs font-medium text-muted";
export const tdCls = "px-4 py-3 align-middle";
export const trCls = "transition-colors hover:bg-background/60";
export const pageTitleCls = "text-2xl font-semibold tracking-tight";
