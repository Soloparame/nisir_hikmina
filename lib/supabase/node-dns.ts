/**
 * Netlify/Vercel serverless can prefer IPv6 and fail Supabase with "fetch failed".
 * Force IPv4-first when available (Node 18+).
 */
import dns from "node:dns";

if (typeof dns.setDefaultResultOrder === "function") {
  dns.setDefaultResultOrder("ipv4first");
}
