import { eq } from "drizzle-orm";
import { redirect } from "next/navigation";
import { db } from "@/db";
import { users } from "@/db/schema";

/** Ajustes de empresa/moneda del usuario (sin el hash de contraseña). */
export async function getProfile(userId: string) {
  const [row] = await db
    .select({
      id: users.id,
      name: users.name,
      companyName: users.companyName,
      companyInfo: users.companyInfo,
      currency: users.currency,
      defaultTax: users.defaultTax,
      invoicePrefix: users.invoicePrefix,
    })
    .from(users)
    .where(eq(users.id, userId))
    .limit(1);
  if (!row) redirect("/login"); // sesión de un usuario que ya no existe
  return row;
}
