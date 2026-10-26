import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { users, shops } from "@/db/schema";
import bcrypt from "bcryptjs";
import { createSessionToken } from "@/db/auth";
import { eq } from "drizzle-orm";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, password, fullName, shopName, shopAddress, shopCity, shopState, shopPostalCode, phone, openingHours, category } = body;

    // Server-side validation
    if (!email || !password || !fullName || !shopName || !shopAddress || !shopCity) {
      return NextResponse.json(
        { error: "Email, password, full name, shop name, address, and city are required." },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: "Password must be at least 6 characters long." },
        { status: 400 }
      );
    }

    // Check if user already exists
    const [existing] = await db.select().from(users).where(eq(users.email, email.toLowerCase().trim())).limit(1);

    if (existing) {
      return NextResponse.json({ error: "An account with this email already exists. Please log in." }, { status: 409 });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const [newUser] = await db.insert(users).values({
      email: email.toLowerCase().trim(),
      fullName: fullName.trim(),
      passwordHash,
      role: "shop_owner",
    }).returning();

    // Create unique slug for shop
    const slug = shopName.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "") + "-" + Math.floor(1000 + Math.random() * 9000);

    // Approximate latitude/longitude if in NYC demo area or provide realistic random offset
    const lat = 40.7128 + (Math.random() - 0.5) * 0.05;
    const lon = -74.0060 + (Math.random() - 0.5) * 0.05;

    const [newShop] = await db.insert(shops).values({
      ownerId: newUser.id,
      name: shopName.trim(),
      slug,
      address: shopAddress.trim(),
      city: shopCity.trim(),
      state: shopState?.trim() || "NY",
      postalCode: shopPostalCode?.trim() || "10001",
      phone: phone?.trim() || null,
      openingHours: openingHours?.trim() || "Mon-Sat: 8:00 AM - 8:00 PM, Sun: 10:00 AM - 6:00 PM",
      category: category?.trim() || "General Store",
      latitude: lat,
      longitude: lon,
      isVerified: true,
      isDemo: false,
    }).returning();

    const token = await createSessionToken({
      userId: newUser.id,
      email: newUser.email,
      fullName: newUser.fullName,
      role: newUser.role,
    });

    const response = NextResponse.json({
      success: true,
      user: { id: newUser.id, email: newUser.email, fullName: newUser.fullName },
      shop: { id: newShop.id, name: newShop.name, slug: newShop.slug },
    });

    response.cookies.set("session_token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: "/",
    });

    return response;
  } catch (error: any) {
    console.error("Registration error:", error);
    return NextResponse.json({ error: error.message || "Failed to register" }, { status: 500 });
  }
}
