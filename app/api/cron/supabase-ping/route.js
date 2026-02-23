import { NextResponse } from "next/server";
import { getSupabaseServiceClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export async function GET(request) {
  const cronSecret = process.env.CRON_SECRET;
  if (cronSecret) {
    const authHeader = request.headers.get("authorization");
    if (authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ ok: false, message: "Unauthorized." }, { status: 401 });
    }
  }

  try {
    const supabase = getSupabaseServiceClient();
    const { error } = await supabase.from("assessment_forms").select("id").limit(1);

    if (error) throw error;

    return NextResponse.json(
      {
        ok: true,
        message: "Supabase ping completed.",
        pinged_at: new Date().toISOString(),
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("Supabase cron ping failed:", error);
    return NextResponse.json(
      { ok: false, message: "Supabase ping failed." },
      { status: 500 },
    );
  }
}
