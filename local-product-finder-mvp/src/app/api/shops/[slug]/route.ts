import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { shops, products } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { calculateDistanceKm } from "@/lib/utils";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const { searchParams } = new URL(req.url);
    const userLat = searchParams.get("lat") ? parseFloat(searchParams.get("lat")!) : null;
    const userLon = searchParams.get("lon") ? parseFloat(searchParams.get("lon")!) : null;

    const [shop] = await db.select().from(shops).where(eq(shops.slug, slug)).limit(1);

    if (!shop) {
      return NextResponse.json({ error: "Shop not found" }, { status: 404 });
    }

    // Get published products for this shop
    const shopProducts = await db
      .select()
      .from(products)
      .where(and(eq(products.shopId, shop.id), eq(products.isDraft, false)))
      .orderBy(products.name);

    let distanceKm: number | null = null;
    if (userLat !== null && userLon !== null && shop.latitude && shop.longitude) {
      distanceKm = calculateDistanceKm(userLat, userLon, shop.latitude, shop.longitude);
    }

    return NextResponse.json({
      shop: {
        ...shop,
        distanceKm,
      },
      products: shopProducts,
    });
  } catch (error: any) {
    console.error("Shop detail error:", error);
    return NextResponse.json({ error: error.message || "Failed to fetch shop" }, { status: 500 });
  }
}
