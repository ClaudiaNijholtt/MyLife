import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const url = new URL("/", request.url);
  const response = NextResponse.redirect(url);

  const { createClient } = await import("@/lib/supabase/server");
  const supabase = await createClient();
  await supabase.auth.signOut();

  return response;
}