import { createClient } from "@supabase/supabase-js";
import { createBrowserClient } from "@supabase/ssr";

// Get Supabase URL and anon key from environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

// For build time, use placeholder values if env vars are missing
const url = supabaseUrl || "https://placeholder.supabase.co";
const anonKey = supabaseAnonKey || "placeholder-anon-key";

// Only validate in runtime (not during build)
if (typeof window !== "undefined" && !supabaseUrl) {
  console.error("NEXT_PUBLIC_SUPABASE_URL is not defined");
}

if (typeof window !== "undefined" && !supabaseAnonKey) {
  console.error("NEXT_PUBLIC_SUPABASE_ANON_KEY is not defined");
}

// Get the site URL for redirects
export const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL ||
  (typeof window !== "undefined"
    ? window.location.origin
    : "http://localhost:3000");

// Create the client with the validated URLs - browser client with SSR support
export const supabase = createBrowserClient(url, anonKey, {
  auth: {
    persistSession: true,
    detectSessionInUrl: true,
    autoRefreshToken: true,
    flowType: "pkce",
  },
});

// Only create the admin client if the service role key is defined
export const supabaseAdmin = supabaseServiceKey
  ? createClient(url, supabaseServiceKey)
  : null;
