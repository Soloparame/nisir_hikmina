import { createServerClient } from "@supabase/ssr";
import type { EmailOtpType } from "@supabase/supabase-js";
import { NextResponse, type NextRequest } from "next/server";
import { getSupabaseKey, getSupabaseUrl } from "../../../lib/supabase/config";

function safeNextPath(next: string | null) {
  if (!next || !next.startsWith("/") || next.startsWith("//")) {
    return "/";
  }
  return next;
}

function errorRedirect(request: NextRequest, nextPath: string, message: string) {
  const fallback = nextPath.includes("reset-password")
    ? nextPath.split("?")[0]
    : "/login";
  const url = new URL(fallback, request.url);
  url.searchParams.set("error", message);
  return NextResponse.redirect(url);
}

export async function GET(request: NextRequest) {
  const code = request.nextUrl.searchParams.get("code");
  const tokenHash = request.nextUrl.searchParams.get("token_hash");
  const type = request.nextUrl.searchParams.get("type") as EmailOtpType | null;
  const nextPath = safeNextPath(request.nextUrl.searchParams.get("next"));

  const url = getSupabaseUrl();
  const key = getSupabaseKey();
  if (!url || !key) {
    return errorRedirect(
      request,
      nextPath,
      "Supabase is not configured on this site."
    );
  }

  // Supabase recovery / magic links can arrive as:
  // 1) ?code=... (PKCE)
  // 2) ?token_hash=...&type=recovery
  if (!code && !(tokenHash && type)) {
    return errorRedirect(
      request,
      nextPath,
      "Missing auth session. Open the newest reset email link, or request a new one."
    );
  }

  let response = NextResponse.redirect(new URL(nextPath, request.url));

  const supabase = createServerClient(url, key, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) =>
          request.cookies.set(name, value)
        );
        response = NextResponse.redirect(new URL(nextPath, request.url));
        cookiesToSet.forEach(({ name, value, options }) =>
          response.cookies.set(name, value, options)
        );
      },
    },
  });

  if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (error) {
      const message = /pkce|code verifier/i.test(error.message)
        ? "This reset link is outdated. Go back and request a new password reset email, then open the newest link."
        : error.message;
      return errorRedirect(request, nextPath, message);
    }
    return response;
  }

  const { error } = await supabase.auth.verifyOtp({
    type: type!,
    token_hash: tokenHash!,
  });

  if (error) {
    return errorRedirect(request, nextPath, error.message);
  }

  return response;
}
