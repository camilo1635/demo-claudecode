import type { DisplayStatus } from "@/lib/totals";

const styles: Record<DisplayStatus, string> = {
  pagada: "bg-ok-soft text-ok",
  pendiente: "bg-warn-soft text-warn",
  vencida: "bg-danger-soft text-danger",
};

export function StatusBadge({ status }: { status: DisplayStatus }) {
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium capitalize ${styles[status]}`}>
      <span aria-hidden className="size-1.5 rounded-full bg-current" />
      {status}
    </span>
  );
}
