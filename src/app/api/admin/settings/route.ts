import { NextRequest, NextResponse } from "next/server";
import { staffJson, staffUserOrResponse } from "@/lib/auth/staff-gate";
import { getAdminSettings, setAdminSetting } from "@/lib/membership/settings";

export async function GET(request: NextRequest) {
  const auth = await staffUserOrResponse(request);
  if ("response" in auth) return auth.response;
  const gate = auth.gate;

  try {
    const settings = await getAdminSettings();
    return staffJson(gate, { settings });
  } catch (err) {
    console.error("GET /api/admin/settings", err);
    return staffJson(gate, { error: "Failed to load settings" }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  const auth = await staffUserOrResponse(request);
  if ("response" in auth) return auth.response;
  const gate = auth.gate;

  try {
    const body = await request.json();
    const updates = body.settings as Record<string, unknown> | undefined;
    if (!updates || typeof updates !== "object") {
      return staffJson(gate, { error: "settings object required" }, { status: 400 });
    }
    for (const [key, value] of Object.entries(updates)) {
      await setAdminSetting(key, value);
    }
    const settings = await getAdminSettings();
    return staffJson(gate, { settings });
  } catch (err) {
    console.error("PATCH /api/admin/settings", err);
    return staffJson(gate, { error: "Failed to update settings" }, { status: 500 });
  }
}
