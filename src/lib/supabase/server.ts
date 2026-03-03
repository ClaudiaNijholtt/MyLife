import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import env from "@/config/env";

export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient(
    env.supabase.url,
    env.supabase.anonKey,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) => {
              cookieStore.set(name, value, options);
            });
          } catch {
            // setAll can be called from Server Components where mutation isn't allowed.
          }
        },
      },
    }
  );
}