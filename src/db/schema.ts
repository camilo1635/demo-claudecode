import { relations, sql } from "drizzle-orm";
import { index, integer, real, sqliteTable, text, unique } from "drizzle-orm/sqlite-core";

const id = () =>
  text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID());

const createdAt = () =>
  text("created_at")
    .notNull()
    .default(sql`(current_timestamp)`);

export const users = sqliteTable("users", {
  id: id(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  companyName: text("company_name").notNull().default(""),
  companyInfo: text("company_info").notNull().default(""),
  currency: text("currency").notNull().default("COP"),
  defaultTax: real("default_tax").notNull().default(19),
  invoicePrefix: text("invoice_prefix").notNull().default("FAC-"),
  createdAt: createdAt(),
});

export const products = sqliteTable(
  "products",
  {
    id: id(),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    description: text("description").notNull().default(""),
    price: real("price").notNull().default(0),
    unit: text("unit").notNull().default("unidad"),
    active: integer("active", { mode: "boolean" }).notNull().default(true),
    createdAt: createdAt(),
  },
  (t) => [index("products_user_idx").on(t.userId)],
);

export const clients = sqliteTable(
  "clients",
  {
    id: id(),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    taxId: text("tax_id").notNull().default(""),
    email: text("email").notNull().default(""),
    address: text("address").notNull().default(""),
    createdAt: createdAt(),
  },
  (t) => [index("clients_user_idx").on(t.userId)],
);

export const invoices = sqliteTable(
  "invoices",
  {
    id: id(),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    clientId: text("client_id")
      .notNull()
      .references(() => clients.id, { onDelete: "restrict" }),
    number: text("number").notNull(),
    issueDate: text("issue_date").notNull(),
    dueDate: text("due_date").notNull(),
    status: text("status", { enum: ["pendiente", "pagada"] })
      .notNull()
      .default("pendiente"),
    discountPct: real("discount_pct").notNull().default(0),
    taxPct: real("tax_pct").notNull().default(0),
    notes: text("notes").notNull().default(""),
    createdAt: createdAt(),
  },
  (t) => [unique("invoices_user_number").on(t.userId, t.number), index("invoices_user_idx").on(t.userId)],
);

export const invoiceItems = sqliteTable(
  "invoice_items",
  {
    id: id(),
    invoiceId: text("invoice_id")
      .notNull()
      .references(() => invoices.id, { onDelete: "cascade" }),
    productId: text("product_id").references(() => products.id, { onDelete: "set null" }),
    description: text("description").notNull(),
    qty: real("qty").notNull().default(1),
    unitPrice: real("unit_price").notNull().default(0),
  },
  (t) => [index("items_invoice_idx").on(t.invoiceId)],
);

export const invoicesRelations = relations(invoices, ({ one, many }) => ({
  client: one(clients, { fields: [invoices.clientId], references: [clients.id] }),
  items: many(invoiceItems),
}));

export const invoiceItemsRelations = relations(invoiceItems, ({ one }) => ({
  invoice: one(invoices, { fields: [invoiceItems.invoiceId], references: [invoices.id] }),
}));

export type User = typeof users.$inferSelect;
export type Product = typeof products.$inferSelect;
export type Client = typeof clients.$inferSelect;
export type Invoice = typeof invoices.$inferSelect;
export type InvoiceItem = typeof invoiceItems.$inferSelect;
