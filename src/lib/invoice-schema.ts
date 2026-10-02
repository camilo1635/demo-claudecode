import { z } from "zod";

const date = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Fecha no válida");

/** Esquema compartido: el editor valida antes de enviar y el servidor vuelve a validar. */
export const invoiceSchema = z
  .object({
    clientId: z.string().min(1, "Selecciona un cliente"),
    number: z.string().trim().min(1, "El número es obligatorio"),
    issueDate: date,
    dueDate: date,
    status: z.enum(["pendiente", "pagada"]),
    discountPct: z.number().min(0).max(100),
    taxPct: z.number().min(0).max(100),
    notes: z.string().trim(),
    items: z
      .array(
        z.object({
          productId: z.string().nullable(),
          description: z.string().trim().min(1, "Todas las líneas necesitan descripción"),
          qty: z.number().positive("La cantidad debe ser mayor que 0"),
          unitPrice: z.number().min(0, "El precio no puede ser negativo"),
        }),
      )
      .min(1, "Añade al menos una línea"),
  })
  .refine((v) => v.dueDate >= v.issueDate, { message: "El vencimiento no puede ser anterior a la emisión" });

export type InvoiceInput = z.input<typeof invoiceSchema>;
