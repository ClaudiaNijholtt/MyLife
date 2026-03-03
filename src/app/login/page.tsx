"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

export default function LoginPage() {
  const supabase = createClient();
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [error, setError] = useState<string>("");

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    const { error } =
      mode === "signup"
        ? await supabase.auth.signUp({ email, password })
        : await supabase.auth.signInWithPassword({ email, password });

    if (error) return setError(error.message);

    router.push("/");
    router.refresh();
  }

  return (
    <main className="min-h-screen bg-gray-100 p-6">
      <div className="mx-auto max-w-md bg-white rounded-2xl shadow-sm p-6">
        <h1 className="text-2xl font-bold mb-4">
          {mode === "signup" ? "Create account" : "Log in"}
        </h1>

        <form onSubmit={onSubmit} className="space-y-3">
          <input
            className="w-full rounded-2xl border px-4 py-3"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            type="email"
            required
          />
          <input
            className="w-full rounded-2xl border px-4 py-3"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            type="password"
            required
          />

          {error ? <p className="text-sm text-red-600">{error}</p> : null}

          <button className="w-full bg-black text-white py-3 rounded-2xl">
            {mode === "signup" ? "Sign up" : "Log in"}
          </button>
        </form>

        {mode === "login" && (
          <div className="mt-3 text-center">
            <Link href="/forgot-password" className="text-sm text-gray-600 hover:text-black underline">
              Forgot password?
            </Link>
          </div>
        )}

        <button
          className="mt-4 text-sm underline w-full text-center"
          onClick={() => setMode(mode === "signup" ? "login" : "signup")}
        >
          {mode === "signup" ? "I already have an account" : "Create an account"}
        </button>
      </div>
    </main>
  );
}