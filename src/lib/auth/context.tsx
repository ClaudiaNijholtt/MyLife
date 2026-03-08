"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  useRef,
  type ReactNode,
} from "react";

export type AuthUser = {
  id: string;
  email: string | null;
};

type AuthContextType = {
  user: AuthUser | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | null>(null);

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);
  const cleanupRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    initSupabase();

    return () => {
      cleanupRef.current?.();
    };
  }, []);

  async function initSupabase() {
    const { createClient } = await import("@/lib/supabase/client");
    const supabase = createClient();

    const {
      data: { user: supaUser },
    } = await supabase.auth.getUser();
    if (supaUser) {
      setUser({ id: supaUser.id, email: supaUser.email ?? null });
    }
    setLoading(false);

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_ev, session) => {
      setUser(
        session?.user
          ? { id: session.user.id, email: session.user.email ?? null }
          : null
      );
    });

    cleanupRef.current = () => subscription.unsubscribe();
  }

  const signIn = useCallback(async (email: string, password: string) => {
    const { createClient } = await import("@/lib/supabase/client");
    const { error } = await createClient().auth.signInWithPassword({
      email,
      password,
    });
    if (error) throw error;
  }, []);

  const signUp = useCallback(async (email: string, password: string) => {
    const { createClient } = await import("@/lib/supabase/client");
    const { error } = await createClient().auth.signUp({ email, password });
    if (error) throw error;
  }, []);

  const signOut = useCallback(async () => {
    const { createClient } = await import("@/lib/supabase/client");
    await createClient().auth.signOut();
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, signIn, signUp, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}
