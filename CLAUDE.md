# CLAUDE.md

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

## Available skills

- `react-rules`: React con TypeScript y buenas prácticas (Zustand, Zod, React Hook Form, React Query/SWR, reglas de hooks y `useEffect`). `.claude/skills/react-rules/SKILL.md`.
- `explain-code`: explica de forma muy resumida el código base (tecnologías con versiones, funcionalidades y casos de uso). `.claude/skills/explain-code/SKILL.md`.
- `greeting`: saluda al usuario al iniciar con un mensaje de bienvenida (nombre si está disponible y uso de contexto en porcentaje). `.claude/skills/gretting/SKILL.md` (la carpeta se llama `gretting`).
- `run-dev`: ejecuta lint, corre solo 2 tests unitarios, valida con build y levanta la app con `npm run dev`. Comando: `.claude/commands/run-dev.md`.
- `temp`: ante un "hola", responde amable con fecha, clima y hora de la ciudad del usuario y un pensamiento célebre o proverbio chino. Comando: `.claude/commands/temp.md`.

- `frontend-design`: guía de diseño visual distintivo (tipografía, paleta, layout, copy, restricción y autocrítica). `.agents/skills/frontend-design/SKILL.md`.
- `find-skills`: descubre e instala skills del ecosistema cuando el usuario pregunta "cómo hago X" o "hay una skill para X". `.agents/skills/find-skills/SKILL.md`.

## Skill trigger rules

- Usa `frontend-design` cuando el usuario pida crear o mejorar diseño, UI/UX, estilos, tipografía, paleta o layout. Los tokens de UI compartidos viven en `src/components/ui.ts` y `src/app/globals.css`.
- Usa `find-skills` cuando el usuario busque una skill o capacidad instalable.
- Usa `react-rules` cuando el usuario pida crear una aplicación o componente React, o agregar/modificar componentes, hooks, estado, formularios o lógica de UI en React.
- Usa `explain-code` cuando pidan una explicación resumida del proyecto.
- Usa `greeting` al iniciar la conversación para saludar.
- Usa `run-dev` (`/run-dev`) para validar con lint, tests, build y levantar la app.
- Usa `temp` (`/temp`) cuando el usuario salude con "hola".
