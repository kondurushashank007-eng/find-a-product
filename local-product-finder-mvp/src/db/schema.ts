import { pgTable, text, serial, timestamp, doublePrecision, integer, boolean } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  email: text("email").notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  fullName: text("full_name").notNull(),
  role: text("role").notNull().default("shop_owner"), // 'shop_owner', 'admin'
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const shops = pgTable("shops", {
  id: serial("id").primaryKey(),
  ownerId: integer("owner_id").references(() => users.id, { onDelete: "cascade" }).notNull(),
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(),
  description: text("description"),
  category: text("category").notNull().default("Grocery & General"),
  address: text("address").notNull(),
  city: text("city").notNull(),
  state: text("state"),
  postalCode: text("postal_code"),
  latitude: doublePrecision("latitude").notNull(),
  longitude: doublePrecision("longitude").notNull(),
  phone: text("phone"),
  email: text("email"),
  openingHours: text("opening_hours").notNull().default("Mon-Sat: 8:00 AM - 8:00 PM, Sun: 10:00 AM - 6:00 PM"),
  isVerified: boolean("is_verified").default(true).notNull(),
  isDemo: boolean("is_demo").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const products = pgTable("products", {
  id: serial("id").primaryKey(),
  shopId: integer("shop_id").references(() => shops.id, { onDelete: "cascade" }).notNull(),
  name: text("name").notNull(),
  brand: text("brand"),
  category: text("category").notNull().default("General"),
  size: text("size"), // e.g. '1 kg', '500 ml', 'Pack of 6'
  barcode: text("barcode"),
  description: text("description"),
  price: doublePrecision("price").notNull(), // numeric price
  currency: text("currency").notNull().default("USD"),
  stockQuantity: integer("stock_quantity").notNull().default(0),
  lowStockThreshold: integer("low_stock_threshold").notNull().default(5),
  isDraft: boolean("is_draft").notNull().default(false), // Review and confirm workflow: draft -> published
  isDemo: boolean("is_demo").notNull().default(false),
  imageUrl: text("image_url"),
  lastStockUpdated: timestamp("last_stock_updated").defaultNow().notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const usersRelations = relations(users, ({ many }) => ({
  shops: many(shops),
}));

export const shopsRelations = relations(shops, ({ one, many }) => ({
  owner: one(users, {
    fields: [shops.ownerId],
    references: [users.id],
  }),
  products: many(products),
}));

export const productsRelations = relations(products, ({ one }) => ({
  shop: one(shops, {
    fields: [products.shopId],
    references: [shops.id],
  }),
}));

export type User = typeof users.$inferSelect;
export type Shop = typeof shops.$inferSelect;
export type Product = typeof products.$inferSelect;
