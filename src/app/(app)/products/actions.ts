"use server";

import { and, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { db } from "@/db";
import { invoiceItems, products } from "@/db/schema";
import { requireUser } from "@/lib/auth";

export type ProductState = { error?: string } | undefined;

const productSchema = z.object({
  name: z.string().trim().min(1, "El nombre es obligatorio"),
  description: z.string().trim().default(""),
  price: z.coerce.number({ error: "Precio no válido" }).min(0, "El precio no puede ser negativo"),
  unit: z.string().trim().min(1, "La unidad es obligatoria"),
  active: z.preprocess((v) => v === "on", z.boolean()),
});

export async function createProduct(_: ProductState, formData: FormData): Promise<ProductState> {
  const user = await requireUser();
  const parsed = productSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { error: parsed.error.issues[0].message };

  await db.insert(products).values({ ...parsed.data, userId: user.id });
  revalidatePath("/products");
  redirect("/products");
}

export async function updateProduct(id: string, _: ProductState, formData: FormData): Promise<ProductState> {
  const user = await requireUser();
  const parsed = productSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { error: parsed.error.issues[0].message };

  await db
    .update(products)
    .set(parsed.data)
    .where(and(eq(products.id, id), eq(products.userId, user.id)));
  revalidatePath("/products");
  redirect("/products");
}

/** Si el producto ya se usó en alguna factura se desactiva en vez de borrarse. */
export async function deleteProduct(id: string) {
  const user = await requireUser();
  const [owned] = await db
    .select({ id: products.id })
    .from(products)
    .where(and(eq(products.id, id), eq(products.userId, user.id)))
    .limit(1);
  if (!owned) return;

  const [used] = await db
    .select({ id: invoiceItems.id })
    .from(invoiceItems)
    .where(eq(invoiceItems.productId, id))
    .limit(1);

  if (used) {
    await db.update(products).set({ active: false }).where(eq(products.id, id));
  } else {
    await db.delete(products).where(eq(products.id, id));
  }
  revalidatePath("/products");
}
