import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { shops, products } from "@/db/schema";
import { getCurrentUser } from "@/db/auth";
import { eq, and } from "drizzle-orm";

/**
 * GET /api/owner/inventory
 * Return shop details, all products (including drafts), summary statistics (total, low stock, out of stock, drafts)
 */
export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized. Please sign in." }, { status: 401 });
    }

    const [shop] = await db.select().from(shops).where(eq(shops.ownerId, user.userId)).limit(1);
    if (!shop) {
      return NextResponse.json({ error: "No shop associated with your account." }, { status: 404 });
    }

    const allProducts = await db
      .select()
      .from(products)
      .where(eq(products.shopId, shop.id))
      .orderBy(products.updatedAt);

    const totalProducts = allProducts.length;
    const publishedProducts = allProducts.filter((p) => !p.isDraft).length;
    const draftCount = allProducts.filter((p) => p.isDraft).length;
    const outOfStockCount = allProducts.filter((p) => p.stockQuantity <= 0).length;
    const lowStockCount = allProducts.filter(
      (p) => p.stockQuantity > 0 && p.stockQuantity <= p.lowStockThreshold
    ).length;

    return NextResponse.json({
      shop,
      products: allProducts,
      stats: {
        totalProducts,
        publishedProducts,
        draftCount,
        outOfStockCount,
        lowStockCount,
      },
    });
  } catch (error: any) {
    console.error("Owner inventory error:", error);
    return NextResponse.json({ error: error.message || "Failed to load inventory" }, { status: 500 });
  }
}

/**
 * POST /api/owner/inventory
 * Add a new product to shop's inventory.
 * Can be added as draft (for "Review and confirm changes before they become visible to customers") or published directly.
 */
export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized. Please sign in." }, { status: 401 });
    }

    const [shop] = await db.select().from(shops).where(eq(shops.ownerId, user.userId)).limit(1);
    if (!shop) {
      return NextResponse.json({ error: "No shop found for this account." }, { status: 404 });
    }

    const body = await req.json();
    const {
      name,
      brand,
      category,
      size,
      barcode,
      description,
      price,
      currency = "USD",
      stockQuantity,
      lowStockThreshold = 5,
      isDraft = false,
    } = body;

    // Server-side validation
    if (!name || name.trim().length === 0) {
      return NextResponse.json({ error: "Product name is required." }, { status: 400 });
    }

    const numericPrice = parseFloat(price);
    if (isNaN(numericPrice) || numericPrice < 0) {
      return NextResponse.json({ error: "Valid non-negative price is required." }, { status: 400 });
    }

    const numericStock = parseInt(stockQuantity ?? "0", 10);
    if (isNaN(numericStock) || numericStock < 0) {
      return NextResponse.json({ error: "Valid non-negative stock quantity is required." }, { status: 400 });
    }

    const [newProduct] = await db
      .insert(products)
      .values({
        shopId: shop.id,
        name: name.trim(),
        brand: brand?.trim() || null,
        category: category?.trim() || "General",
        size: size?.trim() || null,
        barcode: barcode?.trim() || null,
        description: description?.trim() || null,
        price: numericPrice,
        currency: currency.trim().toUpperCase(),
        stockQuantity: numericStock,
        lowStockThreshold: parseInt(lowStockThreshold ?? "5", 10),
        isDraft: Boolean(isDraft),
        isDemo: shop.isDemo,
        lastStockUpdated: new Date(),
      })
      .returning();

    return NextResponse.json({ success: true, product: newProduct });
  } catch (error: any) {
    console.error("Add product error:", error);
    return NextResponse.json({ error: error.message || "Failed to add product" }, { status: 500 });
  }
}
