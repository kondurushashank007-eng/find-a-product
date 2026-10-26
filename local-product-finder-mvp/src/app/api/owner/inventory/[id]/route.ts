import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { shops, products } from "@/db/schema";
import { getCurrentUser } from "@/db/auth";
import { eq, and } from "drizzle-orm";

/**
 * GET /api/owner/inventory/[id]
 * Fetch product details for editing, strictly verifying shop ownership.
 */
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const productId = parseInt(id, 10);
    if (isNaN(productId)) {
      return NextResponse.json({ error: "Invalid product id" }, { status: 400 });
    }

    const [shop] = await db.select().from(shops).where(eq(shops.ownerId, user.userId)).limit(1);
    if (!shop) {
      return NextResponse.json({ error: "Shop not found" }, { status: 404 });
    }

    const [product] = await db
      .select()
      .from(products)
      .where(and(eq(products.id, productId), eq(products.shopId, shop.id)))
      .limit(1);

    if (!product) {
      return NextResponse.json({ error: "Product not found or access denied." }, { status: 404 });
    }

    return NextResponse.json({ product, shop });
  } catch (error: any) {
    console.error("Get product error:", error);
    return NextResponse.json({ error: error.message || "Failed to get product" }, { status: 500 });
  }
}

/**
 * PUT /api/owner/inventory/[id]
 * Update product, strictly ensuring shop owner owns it.
 */
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const productId = parseInt(id, 10);
    if (isNaN(productId)) {
      return NextResponse.json({ error: "Invalid product id" }, { status: 400 });
    }

    const [shop] = await db.select().from(shops).where(eq(shops.ownerId, user.userId)).limit(1);
    if (!shop) {
      return NextResponse.json({ error: "Shop not found" }, { status: 404 });
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
      currency,
      stockQuantity,
      lowStockThreshold,
      isDraft,
    } = body;

    const [existingProduct] = await db
      .select()
      .from(products)
      .where(and(eq(products.id, productId), eq(products.shopId, shop.id)))
      .limit(1);

    if (!existingProduct) {
      return NextResponse.json({ error: "Product not found or you do not have permission to edit it." }, { status: 403 });
    }

    const updateData: any = {
      updatedAt: new Date(),
    };

    if (name !== undefined) {
      if (!name || name.trim().length === 0) {
        return NextResponse.json({ error: "Product name cannot be empty." }, { status: 400 });
      }
      updateData.name = name.trim();
    }

    if (brand !== undefined) updateData.brand = brand?.trim() || null;
    if (category !== undefined) updateData.category = category?.trim() || "General";
    if (size !== undefined) updateData.size = size?.trim() || null;
    if (barcode !== undefined) updateData.barcode = barcode?.trim() || null;
    if (description !== undefined) updateData.description = description?.trim() || null;
    if (currency !== undefined) updateData.currency = currency?.trim().toUpperCase() || "USD";

    if (price !== undefined) {
      const p = parseFloat(price);
      if (isNaN(p) || p < 0) {
        return NextResponse.json({ error: "Price must be a non-negative number." }, { status: 400 });
      }
      updateData.price = p;
    }

    if (stockQuantity !== undefined) {
      const s = parseInt(stockQuantity, 10);
      if (isNaN(s) || s < 0) {
        return NextResponse.json({ error: "Stock quantity must be a non-negative integer." }, { status: 400 });
      }
      updateData.stockQuantity = s;
      updateData.lastStockUpdated = new Date();
    }

    if (lowStockThreshold !== undefined) {
      updateData.lowStockThreshold = Math.max(0, parseInt(lowStockThreshold, 10) || 5);
    }

    if (isDraft !== undefined) {
      updateData.isDraft = Boolean(isDraft);
    }

    const [updatedProduct] = await db
      .update(products)
      .set(updateData)
      .where(and(eq(products.id, productId), eq(products.shopId, shop.id)))
      .returning();

    return NextResponse.json({ success: true, product: updatedProduct });
  } catch (error: any) {
    console.error("Update product error:", error);
    return NextResponse.json({ error: error.message || "Failed to update product" }, { status: 500 });
  }
}

/**
 * DELETE /api/owner/inventory/[id]
 * Remove product from shop inventory.
 */
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const productId = parseInt(id, 10);
    if (isNaN(productId)) {
      return NextResponse.json({ error: "Invalid product id" }, { status: 400 });
    }

    const [shop] = await db.select().from(shops).where(eq(shops.ownerId, user.userId)).limit(1);
    if (!shop) {
      return NextResponse.json({ error: "Shop not found" }, { status: 404 });
    }

    const deleted = await db
      .delete(products)
      .where(and(eq(products.id, productId), eq(products.shopId, shop.id)))
      .returning();

    if (deleted.length === 0) {
      return NextResponse.json({ error: "Product not found or not owned by you" }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: "Product deleted successfully" });
  } catch (error: any) {
    console.error("Delete product error:", error);
    return NextResponse.json({ error: error.message || "Failed to delete product" }, { status: 500 });
  }
}
