import { asc } from "drizzle-orm";
import { connection } from "next/server";
import { db } from "@/db";
import { users } from "@/db/schema";

/**
 * La app no tiene login: todo pertenece a un único usuario local, que se crea
 * la primera vez. Si ya existe alguno en la BD se reutiliza el primero.
 * Todas las páginas y acciones siguen filtrando por `user.id`.
 */
export async function requireUser() {
  // Sin cookies/sesión nada obliga a renderizar por petición: sin esto Next prerenderiza
  // las páginas en el build y congela datos y fechas.
  await connection();
  const [existing] = await db.select().from(users).orderBy(asc(users.createdAt)).limit(1);
  if (existing) return { id: existing.id, name: existing.name, email: existing.email };

  await db
    .insert(users)
    .values({ name: "Usuario local", email: "local@localhost", passwordHash: "" })
    .onConflictDoNothing();
  const [created] = await db.select().from(users).orderBy(asc(users.createdAt)).limit(1);
  return { id: created.id, name: created.name, email: created.email };
}
