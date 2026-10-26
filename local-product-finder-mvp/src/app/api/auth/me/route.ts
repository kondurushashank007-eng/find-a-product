import { NextResponse } from "next/server";
import { getCurrentUser } from "@/db/auth";
import { db } from "@/db";
import { shops } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ authenticated: false, user: null, shop: null });
  }

  const [shop] = await db.select().from(shops).where(eq(shops.ownerId, user.userId)).limit(1);

  return NextResponse.json({
    authenticated: true,
    user,
    shop: shop ? { id: shop.id, name: shop.name, slug: shop.slug, isDemo: shop.isDemo } : null,
  });
}

export async function POST() {
  const response = NextResponse.json({ success: true, message: "Logged out" });
  response.cookies.delete("session_token");
  return response;
}
