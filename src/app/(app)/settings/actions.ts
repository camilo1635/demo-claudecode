"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { db } from "@/db";
import { users } from "@/db/schema";
import { requireUser } from "@/lib/auth";
import { CURRENCIES } from "@/lib/currencies";

export type SettingsState = { error?: string; ok?: boolean } | undefined;

const settingsSchema = z.object({
  companyName: z.string().trim(),
  companyInfo: z.string().trim(),
  currency: z.enum(CURRENCIES),
  defaultTax: z.coerce.number({ error: "Impuesto no válido" }).min(0).max(100, "El impuesto debe estar entre 0 y 100"),
  invoicePrefix: z.string().trim().max(10, "El prefijo admite hasta 10 caracteres"),
});

export async function saveSettings(_: SettingsState, formData: FormData): Promise<SettingsState> {
  const user = await requireUser();
  const parsed = settingsSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { error: parsed.error.issues[0].message };

  await db.update(users).set(parsed.data).where(eq(users.id, user.id));
  revalidatePath("/", "layout");
  return { ok: true };
}
