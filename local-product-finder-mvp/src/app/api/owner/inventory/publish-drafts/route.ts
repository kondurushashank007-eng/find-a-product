import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { shops, products } from "@/db/schema";
import { getCurrentUser } from "@/db/auth";
import { eq, and, inArray } from "drizzle-orm";

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const [shop] = await db.select().from(shops).where(eq(shops.ownerId, user.userId)).limit(1);
    if (!shop) {
      return NextResponse.json({ error: "Shop not found" }, { status: 404 });
    }

    const body = await req.json();
    const { productIds } = body;

    if (!Array.isArray(productIds) || productIds.length === 0) {
      return NextResponse.json({ error: "No product IDs specified." }, { status: 400 });
    }

    const updated = await db
      .update(products)
      .set({ isDraft: false, updatedAt: new Date(), lastStockUpdated: new Date() })
      .where(and(eq(products.shopId, shop.id), inArray(products.id, productIds)))
      .returning();

    return NextResponse.json({
      success: true,
      publishedCount: updated.length,
      message: `Published ${updated.length} product(s) to live store.`,
    });
  } catch (error: any) {
    console.error("Publish drafts error:", error);
    return NextResponse.json({ error: error.message || "Failed to publish drafts" }, { status: 500 });
  }
}
