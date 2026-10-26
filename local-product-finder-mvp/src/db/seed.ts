import { db } from "./index";
import { users, shops, products } from "./schema";
import bcrypt from "bcryptjs";
import { sql } from "drizzle-orm";

export async function seedDemoData() {
  // Check if demo user already exists
  const existingUsers = await db.select().from(users).limit(1);
  if (existingUsers.length > 0) {
    return { message: "Database already seeded." };
  }

  console.log("Seeding demo data...");

  // Create demo shop owner accounts
  const passwordHash = await bcrypt.hash("owner123", 10);

  const [owner1] = await db.insert(users).values({
    email: "owner@greenvalleymarket.com",
    fullName: "Elena Rostova",
    passwordHash,
    role: "shop_owner",
  }).returning();

  const [owner2] = await db.insert(users).values({
    email: "marcus@cornerbodega.com",
    fullName: "Marcus Vance",
    passwordHash,
    role: "shop_owner",
  }).returning();

  const [owner3] = await db.insert(users).values({
    email: "sophia@sunshineorganics.com",
    fullName: "Sophia Chen",
    passwordHash,
    role: "shop_owner",
  }).returning();

  // Reference coordinates centered around Downtown / Metro Area (e.g. 40.7128, -74.0060)
  const [shop1] = await db.insert(shops).values({
    ownerId: owner1.id,
    name: "Green Valley Farm Market",
    slug: "green-valley-farm-market",
    description: "Family-owned neighborhood grocer providing fresh local organic produce, artisan sourdough, pantry essentials, and farmstead dairy.",
    category: "Grocery & Organic Produce",
    address: "412 Hudson St",
    city: "New York",
    state: "NY",
    postalCode: "10014",
    latitude: 40.7291,
    longitude: -74.0076,
    phone: "(212) 555-0142",
    email: "contact@greenvalleymarket.com",
    openingHours: "Mon-Sat: 7:30 AM - 9:00 PM, Sun: 8:00 AM - 7:00 PM",
    isVerified: true,
    isDemo: true,
  }).returning();

  const [shop2] = await db.insert(shops).values({
    ownerId: owner2.id,
    name: "Vance's 24/7 Corner Bodega",
    slug: "vances-corner-bodega",
    description: "Your friendly neighborhood 24/7 bodega. Cold drinks, pantry staples, hot deli sandwiches, snacks, and daily household supplies.",
    category: "Convenience & Bodega",
    address: "185 Bleecker St",
    city: "New York",
    state: "NY",
    postalCode: "10012",
    latitude: 40.7299,
    longitude: -74.0005,
    phone: "(212) 555-0188",
    email: "marcus@cornerbodega.com",
    openingHours: "Open 24 Hours / 7 Days a Week",
    isVerified: true,
    isDemo: true,
  }).returning();

  const [shop3] = await db.insert(shops).values({
    ownerId: owner3.id,
    name: "Sunshine Natural & Spice Co.",
    slug: "sunshine-natural-spice",
    description: "Specialty grocer stocking bulk spices, aromatic rice, gluten-free baking, herbal teas, and international ingredients.",
    category: "Specialty & International Foods",
    address: "88 E 4th St",
    city: "New York",
    state: "NY",
    postalCode: "10003",
    latitude: 40.7258,
    longitude: -73.9904,
    phone: "(212) 555-0199",
    email: "info@sunshineorganics.com",
    openingHours: "Mon-Sun: 9:00 AM - 8:00 PM",
    isVerified: true,
    isDemo: true,
  }).returning();

  // Create products for Shop 1 (Green Valley Farm Market)
  const shop1Products = [
    {
      name: "Organic Whole Milk",
      brand: "Organic Valley",
      category: "Dairy & Eggs",
      size: "1 Gallon (3.78 L)",
      barcode: "093966000147",
      description: "USDA Organic whole pasteurized milk from pasture-raised cows without antibiotics or synthetic hormones.",
      price: 5.49,
      stockQuantity: 18,
      lowStockThreshold: 5,
      isDemo: true,
      isDraft: false,
      lastStockUpdated: new Date(Date.now() - 1000 * 60 * 45), // 45 mins ago
    },
    {
      name: "Artisan Sourdough Loaf",
      brand: "Green Valley Bakery",
      category: "Bakery",
      size: "700 g",
      barcode: "093966000215",
      description: "Naturally fermented sourdough bread baked daily using organic unbleached flour and sea salt.",
      price: 6.25,
      stockQuantity: 4, // low stock!
      lowStockThreshold: 5,
      isDemo: true,
      isDraft: false,
      lastStockUpdated: new Date(Date.now() - 1000 * 60 * 120), // 2 hours ago
    },
    {
      name: "Organic Long Grain Jasmine Rice",
      brand: "Lundberg Family Farms",
      category: "Pantry & Grains",
      size: "1 kg",
      barcode: "073416001024",
      description: "Fragrant, non-GMO organic jasmine white rice. Cooks fluffy and tender.",
      price: 4.89,
      stockQuantity: 24,
      lowStockThreshold: 6,
      isDemo: true,
      isDraft: false,
      lastStockUpdated: new Date(Date.now() - 1000 * 60 * 30), // 30 mins ago
    },
    {
      name: "Free-Range Large Brown Eggs",
      brand: "Vital Farms",
      category: "Dairy & Eggs",
      size: "12 count",
      barcode: "852899002013",
      description: "Certified humane pasture-raised grade A eggs from hens with outdoor space.",
      price: 6.79,
      stockQuantity: 14,
      lowStockThreshold: 5,
      isDemo: true,
      isDraft: false,
      lastStockUpdated: new Date(Date.now() - 1000 * 60 * 60),
    },
    {
      name: "Organic Fair-Trade Coffee Beans",
      brand: "Counter Culture",
      category: "Beverages",
      size: "340 g (12 oz)",
      barcode: "812345009012",
      description: "Whole bean medium roast with notes of chocolate and sweet caramel.",
      price: 14.50,
      stockQuantity: 0, // out of stock
      lowStockThreshold: 4,
      isDemo: true,
      isDraft: false,
      lastStockUpdated: new Date(Date.now() - 1000 * 60 * 360),
    },
    {
      name: "Extra Virgin Olive Oil Cold Pressed",
      brand: "California Olive Ranch",
      category: "Pantry & Oils",
      size: "500 ml",
      barcode: "855018001019",
      description: "100% California extra virgin cold-pressed olive oil for dressings and finishing.",
      price: 13.99,
      stockQuantity: 9,
      lowStockThreshold: 3,
      isDemo: true,
      isDraft: false,
      lastStockUpdated: new Date(Date.now() - 1000 * 60 * 15),
    },
  ];

  for (const p of shop1Products) {
    await db.insert(products).values({ ...p, shopId: shop1.id });
  }

  // Create products for Shop 2 (Corner Bodega)
  const shop2Products = [
    {
      name: "Organic Whole Milk",
      brand: "Lactaid",
      category: "Dairy & Eggs",
      size: "1 Gallon (3.78 L)",
      barcode: "041383090128",
      description: "100% lactose-free whole milk enriched with vitamins A & D.",
      price: 5.99,
      stockQuantity: 8,
      lowStockThreshold: 4,
      isDemo: true,
      isDraft: false,
      lastStockUpdated: new Date(Date.now() - 1000 * 60 * 90),
    },
    {
      name: "Organic Long Grain Jasmine Rice",
      brand: "Goya",
      category: "Pantry & Grains",
      size: "1 kg",
      barcode: "041331021456",
      description: "Premium aromatic Jasmine white rice, tender and slightly sticky.",
      price: 3.49, // Cheap rice option!
      stockQuantity: 35,
      lowStockThreshold: 8,
      isDemo: true,
      isDraft: false,
      lastStockUpdated: new Date(Date.now() - 1000 * 60 * 10), // 10 mins ago
    },
    {
      name: "Sourdough Sandwich Bread",
      brand: "Pepperidge Farm",
      category: "Bakery",
      size: "680 g (24 oz)",
      barcode: "014100070119",
      description: "Sliced sourdough sandwich bread, perfect for toast and hearty grilled cheeses.",
      price: 4.29,
      stockQuantity: 12,
      lowStockThreshold: 5,
      isDemo: true,
      isDraft: false,
      lastStockUpdated: new Date(Date.now() - 1000 * 60 * 180),
    },
    {
      name: "Extra Virgin Olive Oil Cold Pressed",
      brand: "Filippo Berio",
      category: "Pantry & Oils",
      size: "500 ml",
      barcode: "041736000109",
      description: "Traditional Mediterranean cold-pressed extra virgin olive oil.",
      price: 9.99,
      stockQuantity: 2, // low stock!
      lowStockThreshold: 4,
      isDemo: true,
      isDraft: false,
      lastStockUpdated: new Date(Date.now() - 1000 * 60 * 200),
    },
    {
      name: "Sparkling Mineral Water Pack",
      brand: "San Pellegrino",
      category: "Beverages",
      size: "Pack of 6 (500 ml bottles)",
      barcode: "041508800101",
      description: "Naturally effervescent Italian mineral water in glass bottles.",
      price: 7.99,
      stockQuantity: 15,
      lowStockThreshold: 5,
      isDemo: true,
      isDraft: false,
      lastStockUpdated: new Date(Date.now() - 1000 * 60 * 20),
    },
    {
      name: "Ground Colombian Coffee",
      brand: "Bustelo",
      category: "Beverages",
      size: "283 g (10 oz)",
      barcode: "074471011122",
      description: "Rich, full-bodied dark roast espresso ground coffee brick.",
      price: 5.25,
      stockQuantity: 20,
      lowStockThreshold: 6,
      isDemo: true,
      isDraft: false,
      lastStockUpdated: new Date(Date.now() - 1000 * 60 * 50),
    },
  ];

  for (const p of shop2Products) {
    await db.insert(products).values({ ...p, shopId: shop2.id });
  }

  // Create products for Shop 3 (Sunshine Natural & Spice Co.)
  const shop3Products = [
    {
      name: "Himalayan Basmati Rice",
      brand: "Royal",
      category: "Pantry & Grains",
      size: "1 kg",
      barcode: "745118002011",
      description: "Aged authentic Himalayan long-grain basmati rice with delicate aroma.",
      price: 4.19,
      stockQuantity: 40,
      lowStockThreshold: 10,
      isDemo: true,
      isDraft: false,
      lastStockUpdated: new Date(Date.now() - 1000 * 60 * 75),
    },
    {
      name: "Organic Extra Virgin Coconut Oil",
      brand: "Nutiva",
      category: "Pantry & Oils",
      size: "414 ml (14 fl oz)",
      barcode: "692752100018",
      description: "Unrefined cold-pressed organic virgin coconut oil for cooking and baking.",
      price: 8.50,
      stockQuantity: 16,
      lowStockThreshold: 4,
      isDemo: true,
      isDraft: false,
      lastStockUpdated: new Date(Date.now() - 1000 * 60 * 110),
    },
    {
      name: "Organic Fair-Trade Coffee Beans",
      brand: "Equal Exchange",
      category: "Beverages",
      size: "340 g (12 oz)",
      barcode: "736865001099",
      description: "Organic dark roast whole bean coffee sourced from small farmer co-ops.",
      price: 11.95,
      stockQuantity: 7,
      lowStockThreshold: 4,
      isDemo: true,
      isDraft: false,
      lastStockUpdated: new Date(Date.now() - 1000 * 60 * 35),
    },
    {
      name: "Gluten-Free Artisan Oat Loaf",
      brand: "Little Northern Bakehouse",
      category: "Bakery",
      size: "480 g",
      barcode: "852445000105",
      description: "Delicious certified gluten-free, vegan soft oat bread loaf.",
      price: 7.29,
      stockQuantity: 5,
      lowStockThreshold: 4,
      isDemo: true,
      isDraft: false,
      lastStockUpdated: new Date(Date.now() - 1000 * 60 * 140),
    },
    {
      name: "Organic Whole Milk",
      brand: "Horizon Organic",
      category: "Dairy & Eggs",
      size: "1 Gallon (3.78 L)",
      barcode: "074236521941",
      description: "Organic pasture-raised whole milk with DHA Omega-3.",
      price: 6.49,
      stockQuantity: 11,
      lowStockThreshold: 3,
      isDemo: true,
      isDraft: false,
      lastStockUpdated: new Date(Date.now() - 1000 * 60 * 15),
    },
  ];

  for (const p of shop3Products) {
    await db.insert(products).values({ ...p, shopId: shop3.id });
  }

  console.log("Demo data successfully seeded.");
  return { success: true };
}
