# AGENTS.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

@AGENTS.md

## Comandos

```
npm run dev                          # servidor de desarrollo
npm run build                        # build de producción (también ejecuta tsc)
npm run lint                         # eslint
npx tsc --noEmit                     # solo tipos
npx vitest run                       # todos los tests (no hay script "test" en package.json)
npx vitest run src/lib/totals.test.ts   # un solo archivo
npx next typegen                     # regenera PageProps/LayoutProps; necesario si tsc falla con '"/ruta" does not satisfy "/"'
npx drizzle-kit generate --name <n>  # genera migración tras cambiar src/db/schema.ts
npx drizzle-kit migrate              # aplica migraciones a la BD (local.db)
```

`.env.local` solo necesita `DATABASE_URL=file:./local.db` (ver `.env.example`). `*.db` y `.env*` están en `.gitignore`.

## Arquitectura

App de facturas en español: Next.js (App Router, versión 16) + Tailwind 4 + SQLite vía Drizzle ORM y `@libsql/client`. Se usa libsql y no `better-sqlite3` porque este último no compila en el Windows del proyecto (sin binario para Node 20.18 ni Windows SDK).

- **Sin login.** `requireUser()` en `src/lib/auth.ts` devuelve un único usuario local, creándolo la primera vez (o reutilizando el primero de la tabla `users`). La tabla `users` conserva las columnas de ajustes (empresa, moneda, impuesto por defecto, prefijo). Toda consulta y acción filtra por `user.id` y valida propiedad (`and(eq(x.id, id), eq(x.userId, user.id))`); mantén ese patrón al añadir código, así reactivar multiusuario solo requiere cambiar `requireUser`.
- **Datos:** `src/db/schema.ts` define `users`, `products`, `clients`, `invoices`, `invoice_items`. `invoice_items` copia descripción y precio al facturar (no depende del precio actual del producto). Facturas: `(userId, number)` es único; `clients` se borran con `restrict`, `products` con `set null` en las líneas. `src/db/index.ts` activa `PRAGMA foreign_keys`.
- **Mutaciones con Server Actions** en un `actions.ts` junto a cada sección de `src/app/(app)/{products,clients,invoices,settings}`. Los formularios simples son client components con `useActionState` y devuelven `{ error }`; el editor de facturas (`invoices/invoice-editor.tsx`) llama a `saveInvoice` con un objeto y valida con zod en el servidor. Los archivos `"use server"` solo pueden exportar funciones async (por eso `CURRENCIES` vive en `src/lib/currencies.ts`).
- **Lógica de dinero en `src/lib/totals.ts`** (`computeTotals`: subtotal → descuento → impuesto sobre la base descontada; `displayStatus`). Se usa tanto en el editor como en listado y detalle. El estado "vencida" se deriva de `dueDate`; en la BD solo existen `pendiente`/`pagada`.
- **Numeración:** `src/lib/invoice-number.ts` calcula el siguiente `PREFIJO-0001` por usuario; el servidor rechaza duplicados por la restricción UNIQUE.
- **Impresión/PDF:** la vista `invoices/[id]/page.tsx` usa variantes `print:` de Tailwind y `PrintButton`; el layout oculta la cabecera al imprimir.

## Gotchas

- El runtime es Node 20.18: no uses APIs más nuevas (p. ej. `Map.groupBy` falló en tiempo de ejecución).
- `searchParams` y `params` son `Promise` (Next 16); los tipos `PageProps<"/ruta">` vienen de `next typegen`.
- En Next 16 `middleware` se llama `proxy.ts`; actualmente no hay ninguno.

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
