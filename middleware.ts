import { createServerClient } from "@supabase/ssr";
import type { User } from "@supabase/supabase-js";
import { NextResponse, type NextRequest } from "next/server";
import { isAdminUser } from "./lib/auth-roles";
import { isPatientUser } from "./lib/auth/session";
import { getSupabaseKey, getSupabaseUrl } from "./lib/supabase/config";

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  let response = NextResponse.next({ request });

  const isAdminRoute = pathname.startsWith("/admin");
  const isDoctorDashboard =
    /^\/doctor\/[^/]+\/dashboard/.test(pathname) ||
    /^\/doctor\/[^/]+\/chat/.test(pathname);
  const isProtectedPatientRoute =
    pathname.startsWith("/chat") || pathname.startsWith("/profile");

  const url = getSupabaseUrl();
  const key = getSupabaseKey();

  const needsAuth =
    isAdminRoute || isDoctorDashboard || isProtectedPatientRoute;

  let user: User | null = null;

  let supabase: ReturnType<typeof createServerClient> | null = null;

  if (url && key && needsAuth) {
    supabase = createServerClient(url, key, {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          );
        },
      },
    });

    const { data } = await supabase.auth.getUser();
    user = data.user;
  }

  if (!needsAuth) {
    return response;
  }

  if (isAdminRoute && pathname === "/admin/login") {
    return response;
  }

  if (pathname.match(/^\/doctor\/[^/]+\/login$/)) {
    return response;
  }

  if (pathname.match(/^\/doctor\/[^/]+\/signup$/)) {
    return response;
  }

  if (!url || !key) {
    if (isAdminRoute) {
      return NextResponse.redirect(new URL("/admin/login", request.url));
    }
    if (isProtectedPatientRoute) {
      const redirect = encodeURIComponent(pathname);
      return NextResponse.redirect(
        new URL(`/login?redirect=${redirect}`, request.url)
      );
    }
    return response;
  }

  if (isAdminRoute) {
    if (!user || !isAdminUser(user)) {
      return NextResponse.redirect(new URL("/admin/login", request.url));
    }
    return response;
  }

  if (isDoctorDashboard) {
    if (!user) {
      const code = pathname.split("/")[2];
      return NextResponse.redirect(
        new URL(`/doctor/${code}/login`, request.url)
      );
    }
    return response;
  }

  if (isProtectedPatientRoute) {
    if (!user || !isPatientUser(user)) {
      const redirect = encodeURIComponent(pathname);
      return NextResponse.redirect(
        new URL(`/login?redirect=${redirect}`, request.url)
      );
    }

    const role = user.user_metadata?.role;
    if (role === "doctor" && supabase) {
      const { data: doctor } = await supabase
        .from("doctors")
        .select("login_code")
        .eq("auth_user_id", user.id)
        .maybeSingle();

      if (doctor?.login_code) {
        return NextResponse.redirect(
          new URL(`/doctor/${doctor.login_code}/dashboard`, request.url)
        );
      }
    }

    return response;
  }

  return response;
}

export const config = {
  matcher: [
    "/admin",
    "/admin/:path*",
    "/doctor/:code/dashboard",
    "/doctor/:code/dashboard/:path*",
    "/doctor/:code/chat",
    "/doctor/:code/chat/:path*",
    "/chat",
    "/chat/:path*",
    "/profile",
    "/profile/:path*",
  ],
};
