import { NextResponse } from "next/server";
import "@/lib/supabase/node-dns";
import { getSupabaseConfigStatus, getSupabaseKey, getSupabaseUrl } from "@/lib/supabase/config";
import { supabaseFetch } from "@/lib/supabase/fetch";

export const dynamic = "force-dynamic";

/** GET /api/health/supabase — verify env + server can reach Supabase (for Netlify debugging). */
export async function GET() {
  const status = getSupabaseConfigStatus();

  if (!status.configured) {
    return NextResponse.json({
      ok: false,
      ...status,
      hint: "Add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY (or PUBLISHABLE_KEY) in Netlify → Environment variables, then trigger Deploy → Trigger deploy.",
    });
  }

  const url = getSupabaseUrl()!;
  const key = getSupabaseKey()!;
  try {
    const res = await supabaseFetch(`${url}/auth/v1/health`, {
      headers: { apikey: key },
    });
    return NextResponse.json({
      ok: res.ok,
      ...status,
      supabaseReachable: res.ok,
      httpStatus: res.status,
    });
  } catch (e) {
    return NextResponse.json({
      ok: false,
      ...status,
      supabaseReachable: false,
      error: e instanceof Error ? e.message : String(e),
    });
  }
}
