import { NextRequest, NextResponse } from "next/server";
import { seedDemoData } from "@/db/seed";

export async function POST(req: NextRequest) {
  try {
    await seedDemoData();
    return NextResponse.json({ success: true, message: "Demo data initialized." });
  } catch (error: any) {
    console.error("Seed error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
