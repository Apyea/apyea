import { NextResponse } from "next/server";
import { getMasterBundleForForm } from "@/lib/master-data/registry";

export async function GET() {
  try {
    const data = await getMasterBundleForForm();
    return NextResponse.json(data);
  } catch (err) {
    console.error("GET /api/master", err);
    return NextResponse.json({ error: "Failed to load master data" }, { status: 500 });
  }
}
