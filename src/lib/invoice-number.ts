import { eq } from "drizzle-orm";
import { db } from "@/db";
import { invoices } from "@/db/schema";

/** Siguiente número correlativo con el prefijo del usuario, p. ej. FAC-0007. */
export async function nextInvoiceNumber(userId: string, prefix: string) {
  const rows = await db.select({ number: invoices.number }).from(invoices).where(eq(invoices.userId, userId));
  const max = rows.reduce((m, r) => {
    if (!r.number.startsWith(prefix)) return m;
    const n = parseInt(r.number.slice(prefix.length), 10);
    return Number.isFinite(n) ? Math.max(m, n) : m;
  }, 0);
  return prefix + String(max + 1).padStart(4, "0");
}
