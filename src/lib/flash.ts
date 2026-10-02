import { cookies } from "next/headers";

export type Flash = { id: string; type: "success" | "error"; text: string };

export const FLASH_COOKIE = "flash";

/** Guarda un mensaje para mostrarlo una sola vez en la siguiente respuesta (el cliente borra la cookie al mostrarlo). */
export async function setFlash(text: string, type: Flash["type"] = "success") {
  const flash: Flash = { id: crypto.randomUUID(), type, text };
  (await cookies()).set(FLASH_COOKIE, encodeURIComponent(JSON.stringify(flash)), {
    path: "/",
    maxAge: 60,
    sameSite: "lax",
  });
}

export async function readFlash(): Promise<Flash | null> {
  const raw = (await cookies()).get(FLASH_COOKIE)?.value;
  if (!raw) return null;
  try {
    const flash = JSON.parse(decodeURIComponent(raw)) as Flash;
    return typeof flash.text === "string" && typeof flash.id === "string" ? flash : null;
  } catch {
    return null;
  }
}
