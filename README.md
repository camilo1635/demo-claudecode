# Facturas

App de facturación en español para un freelancer o pequeña empresa. Funciona con un único usuario local (sin login).

## Tecnologías

- [Next.js](https://nextjs.org) 16.3.7 (App Router) y React 19.2.8
- Tailwind CSS 4
- SQLite con Drizzle ORM 0.45 y @libsql/client 0.18 (migraciones con drizzle-kit 0.31)
- Zod 4.6 para validación en el servidor
- TypeScript 5, ESLint 9, Vitest 4.1
- Node 20.18

## Funcionalidades

- CRUD de **productos** y **clientes**.
- **Facturas**: editor con líneas, descuento e impuesto; numeración automática (`FAC-0001`); estado pendiente/pagada y "vencida" derivado de la fecha de vencimiento.
- **Impresión/PDF** de la factura.
- **Ajustes**: empresa, moneda (COP por defecto), impuesto por defecto (19 %) y prefijo de numeración.

## Puesta en marcha

1. Instala dependencias: `npm install`
2. Crea `.env.local` a partir de `.env.example`:
   ```
   DATABASE_URL=file:./local.db
   ```
3. Aplica las migraciones: `npx drizzle-kit migrate`
4. Arranca el servidor: `npm run dev` y abre [http://localhost:3000](http://localhost:3000)

## Comandos

```
npm run dev                          # servidor de desarrollo
npm run build                        # build de producción (también ejecuta tsc)
npm run lint                         # eslint
npx tsc --noEmit                     # solo tipos
npx vitest run                       # todos los tests
npx next typegen                     # regenera PageProps/LayoutProps
npx drizzle-kit generate --name <n>  # genera migración tras cambiar src/db/schema.ts
npx drizzle-kit migrate              # aplica migraciones a local.db
```

## Estructura de directorios

```
src/
├─ app/
│  ├─ layout.tsx, page.tsx, globals.css
│  └─ (app)/                 # rutas con layout compartido
│     ├─ products/  clients/  invoices/  settings/
│     │   └─ page.tsx, actions.ts, formularios, new/, [id]/edit/
├─ components/               # ui.ts, status-badge.tsx
├─ db/                       # schema.ts, index.ts
└─ lib/                      # auth, totals, invoice-number, format, currencies, profile
drizzle/                     # migraciones
```

## Componentes principales

- **`actions.ts`** en cada sección: Server Actions para crear, editar y borrar.
- **`invoices/invoice-editor.tsx`**: editor de facturas; llama a `saveInvoice` y valida con zod.
- **`invoices/[id]/page.tsx`** y **`print-button.tsx`**: detalle e impresión con variantes `print:` de Tailwind.
- **`lib/totals.ts`**: `computeTotals` (subtotal → descuento → impuesto) y `displayStatus`; tests en `totals.test.ts`.
- **`lib/invoice-number.ts`**: calcula el siguiente número por usuario.
- **`lib/auth.ts`**: `requireUser()` devuelve el usuario local; toda consulta filtra por `user.id`.

## Base de datos

SQLite en `local.db`, con `PRAGMA foreign_keys` activado.

| Tabla | Notas |
|---|---|
| `users` | Datos y ajustes (empresa, moneda, impuesto, prefijo) |
| `products` | Nombre, descripción, precio, unidad, `active` |
| `clients` | Nombre, NIT/ID, email, dirección; se borran con `restrict` |
| `invoices` | Único `(userId, number)`, fechas, estado, descuento e impuesto % |
| `invoice_items` | Copia descripción y precio al facturar; `productId` usa `set null` |

Todas las claves son UUID y las tablas se relacionan con `users` mediante `cascade`.
