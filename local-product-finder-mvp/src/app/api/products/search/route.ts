import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { products, shops } from "@/db/schema";
import { sql, eq, and, or, ilike, lte, gte } from "drizzle-orm";
import { parseQueryWithGemmaAI } from "@/lib/gemma-ai";
import { calculateDistanceKm } from "@/lib/utils";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const q = searchParams.get("q")?.trim() || "";
    const brand = searchParams.get("brand")?.trim();
    const category = searchParams.get("category")?.trim();
    const barcode = searchParams.get("barcode")?.trim();
    const minPrice = searchParams.get("minPrice") ? parseFloat(searchParams.get("minPrice")!) : undefined;
    const maxPrice = searchParams.get("maxPrice") ? parseFloat(searchParams.get("maxPrice")!) : undefined;
    const inStockOnly = searchParams.get("inStockOnly") === "true";
    const userLat = searchParams.get("lat") ? parseFloat(searchParams.get("lat")!) : null;
    const userLon = searchParams.get("lon") ? parseFloat(searchParams.get("lon")!) : null;
    const maxDistanceKm = searchParams.get("maxDistance") ? parseFloat(searchParams.get("maxDistance")!) : undefined;
    const sortBy = searchParams.get("sortBy") || "distance"; // 'distance', 'price_asc', 'price_desc', 'stock_desc', 'updated_desc'
    const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
    const limit = Math.max(1, parseInt(searchParams.get("limit") || "10", 10));
    const useAi = searchParams.get("ai") !== "false";

    let parsedAi: any = null;
    let effectiveQuery = q;
    let effectiveBrand = brand;
    let effectiveCategory = category;
    let effectiveInStock = inStockOnly;
    let clarifyingQuestion: string | undefined = undefined;

    // AI query interpretation
    if (q && useAi) {
      parsedAi = await parseQueryWithGemmaAI(q);
      if (parsedAi.clarifyingQuestion) {
        clarifyingQuestion = parsedAi.clarifyingQuestion;
      }
      if (parsedAi.brand && !effectiveBrand) {
        effectiveBrand = parsedAi.brand;
      }
      if (parsedAi.category && !effectiveCategory) {
        effectiveCategory = parsedAi.category;
      }
      if (parsedAi.inStockOnly) {
        effectiveInStock = true;
      }
      // Use clean product query if AI extracted it
      if (parsedAi.productQuery) {
        effectiveQuery = parsedAi.productQuery;
      }
    }

    // Build conditions
    const conditions = [];

    // Only published products visible to customers (isDraft = false)
    conditions.push(eq(products.isDraft, false));

    if (effectiveQuery) {
      conditions.push(
        or(
          ilike(products.name, `%${effectiveQuery}%`),
          ilike(products.description, `%${effectiveQuery}%`),
          ilike(products.brand, `%${effectiveQuery}%`),
          ilike(products.category, `%${effectiveQuery}%`),
          ilike(products.barcode, `%${effectiveQuery}%`)
        )
      );
    }

    if (barcode) {
      conditions.push(eq(products.barcode, barcode));
    }

    if (effectiveBrand) {
      conditions.push(ilike(products.brand, `%${effectiveBrand}%`));
    }

    if (effectiveCategory) {
      conditions.push(ilike(products.category, `%${effectiveCategory}%`));
    }

    if (effectiveInStock) {
      conditions.push(gte(products.stockQuantity, 1));
    }

    if (minPrice !== undefined && !isNaN(minPrice)) {
      conditions.push(gte(products.price, minPrice));
    }

    if (maxPrice !== undefined && !isNaN(maxPrice)) {
      conditions.push(lte(products.price, maxPrice));
    }

    // Query products joining shops
    const results = await db
      .select({
        id: products.id,
        name: products.name,
        brand: products.brand,
        category: products.category,
        size: products.size,
        barcode: products.barcode,
        description: products.description,
        price: products.price,
        currency: products.currency,
        stockQuantity: products.stockQuantity,
        lowStockThreshold: products.lowStockThreshold,
        isDemo: products.isDemo,
        lastStockUpdated: products.lastStockUpdated,
        imageUrl: products.imageUrl,
        shopId: shops.id,
        shopName: shops.name,
        shopSlug: shops.slug,
        shopAddress: shops.address,
        shopCity: shops.city,
        shopState: shops.state,
        shopPhone: shops.phone,
        shopOpeningHours: shops.openingHours,
        shopLatitude: shops.latitude,
        shopLongitude: shops.longitude,
        shopIsDemo: shops.isDemo,
      })
      .from(products)
      .innerJoin(shops, eq(products.shopId, shops.id))
      .where(conditions.length > 0 ? and(...conditions) : undefined);

    // Calculate distance for each result if lat/lon is available
    let itemsWithDistance = results.map((item) => {
      let distanceKm: number | null = null;
      if (userLat !== null && userLon !== null && item.shopLatitude && item.shopLongitude) {
        distanceKm = calculateDistanceKm(userLat, userLon, item.shopLatitude, item.shopLongitude);
      }
      return {
        ...item,
        distanceKm,
      };
    });

    // Distance filter
    if (maxDistanceKm !== undefined && userLat !== null && userLon !== null) {
      itemsWithDistance = itemsWithDistance.filter(
        (item) => item.distanceKm !== null && item.distanceKm <= maxDistanceKm
      );
    }

    // Sorting
    itemsWithDistance.sort((a, b) => {
      if (sortBy === "distance") {
        if (a.distanceKm === null && b.distanceKm === null) return 0;
        if (a.distanceKm === null) return 1;
        if (b.distanceKm === null) return -1;
        return a.distanceKm - b.distanceKm;
      }
      if (sortBy === "price_asc") {
        return a.price - b.price;
      }
      if (sortBy === "price_desc") {
        return b.price - a.price;
      }
      if (sortBy === "stock_desc") {
        return b.stockQuantity - a.stockQuantity;
      }
      if (sortBy === "updated_desc") {
        return new Date(b.lastStockUpdated).getTime() - new Date(a.lastStockUpdated).getTime();
      }
      return 0;
    });

    const totalCount = itemsWithDistance.length;
    const startIndex = (page - 1) * limit;
    const paginatedItems = itemsWithDistance.slice(startIndex, startIndex + limit);

    // Gather available brands and categories for filtering
    const allAvailableCategories = Array.from(new Set(results.map((r) => r.category).filter(Boolean)));
    const allAvailableBrands = Array.from(new Set(results.map((r) => r.brand).filter(Boolean)));

    return NextResponse.json({
      items: paginatedItems,
      pagination: {
        page,
        limit,
        totalCount,
        totalPages: Math.ceil(totalCount / limit),
        hasMore: startIndex + limit < totalCount,
      },
      aiInterpretation: parsedAi ? {
        originalQuery: q,
        interpretedQuery: effectiveQuery,
        brand: effectiveBrand,
        category: effectiveCategory,
        pricePreference: parsedAi.pricePreference,
        inStockOnly: effectiveInStock,
        clarifyingQuestion,
        source: parsedAi.source,
      } : null,
      facets: {
        categories: allAvailableCategories,
        brands: allAvailableBrands,
      },
    });
  } catch (error: any) {
    console.error("Product search error:", error);
    return NextResponse.json({ error: error.message || "Failed to search products" }, { status: 500 });
  }
}
