import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { shops, products } from "@/db/schema";
import { getCurrentUser } from "@/db/auth";
import { eq } from "drizzle-orm";

/**
 * Helper to parse a simple CSV row with optional quotes
 */
function parseCSV(text: string) {
  const lines = text.split(/\r?\n/).filter((l) => l.trim().length > 0);
  if (lines.length < 2) return [];

  // Parse header
  const headers = lines[0].split(",").map((h) => h.trim().replace(/^"|"$/g, "").toLowerCase());

  const rows = [];
  for (let i = 1; i < lines.length; i++) {
    const rawLine = lines[i];
    // Basic CSV tokenization handling quoted commas
    const tokens: string[] = [];
    let insideQuotes = false;
    let currentToken = "";

    for (let charIndex = 0; charIndex < rawLine.length; charIndex++) {
      const char = rawLine[charIndex];
      if (char === '"' || char === "'") {
        insideQuotes = !insideQuotes;
      } else if (char === "," && !insideQuotes) {
        tokens.push(currentToken.trim().replace(/^["']|["']$/g, ""));
        currentToken = "";
      } else {
        currentToken += char;
      }
    }
    tokens.push(currentToken.trim().replace(/^["']|["']$/g, ""));

    const row: Record<string, string> = {};
    headers.forEach((hdr, idx) => {
      row[hdr] = tokens[idx] || "";
    });
    rows.push(row);
  }
  return rows;
}

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
    const { csvContent, asDraft = true } = body;

    if (!csvContent || typeof csvContent !== "string") {
      return NextResponse.json({ error: "No valid CSV content provided." }, { status: 400 });
    }

    const rows = parseCSV(csvContent);
    if (rows.length === 0) {
      return NextResponse.json({
        error: "CSV has no data rows. Expected header columns: name, price, stock, brand, category, size, barcode, description",
      }, { status: 400 });
    }

    const imported = [];
    const errors = [];

    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];
      const name = row.name || row["product name"] || row.title;
      const rawPrice = row.price || row.cost || row["unit price"];
      const rawStock = row.stock || row.quantity || row["stock quantity"] || row.qty;

      if (!name) {
        errors.push(`Row ${i + 2}: Missing product name`);
        continue;
      }

      const price = parseFloat(rawPrice);
      if (isNaN(price) || price < 0) {
        errors.push(`Row ${i + 2} ('${name}'): Invalid price "${rawPrice}"`);
        continue;
      }

      const stockQuantity = parseInt(rawStock, 10);
      if (isNaN(stockQuantity) || stockQuantity < 0) {
        errors.push(`Row ${i + 2} ('${name}'): Invalid stock quantity "${rawStock}"`);
        continue;
      }

      const brand = row.brand || null;
      const category = row.category || "General";
      const size = row.size || row.weight || row.volume || null;
      const barcode = row.barcode || row.upc || row.ean || null;
      const description = row.description || null;
      const currency = (row.currency || "USD").toUpperCase();

      const [newProduct] = await db
        .insert(products)
        .values({
          shopId: shop.id,
          name: name.trim(),
          brand: brand?.trim() || null,
          category: category.trim(),
          size: size?.trim() || null,
          barcode: barcode?.trim() || null,
          description: description?.trim() || null,
          price,
          currency,
          stockQuantity,
          lowStockThreshold: 5,
          isDraft: asDraft, // imported items can be drafts for review before publish!
          isDemo: shop.isDemo,
          lastStockUpdated: new Date(),
        })
        .returning();

      imported.push(newProduct);
    }

    return NextResponse.json({
      success: true,
      importedCount: imported.length,
      errorCount: errors.length,
      errors: errors.slice(0, 5), // return top errors
      message: `Successfully imported ${imported.length} items${asDraft ? " as drafts (ready for review)" : ""}.`,
    });
  } catch (error: any) {
    console.error("CSV import error:", error);
    return NextResponse.json({ error: error.message || "Failed to process CSV" }, { status: 500 });
  }
}
