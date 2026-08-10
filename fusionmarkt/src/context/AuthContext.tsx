"use client";

import { createContext, useContext, useCallback, useMemo, ReactNode } from "react";
import { SessionProvider, useSession, signIn, signOut } from "next-auth/react";
import type { Session } from "next-auth";

// ═══════════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════════

export interface AuthUser {
  id: string;
  name?: string | null;
  email?: string | null;
  image?: string | null;
  role: string;
  phone?: string | null;
}

interface AuthContextType {
  // State
  user: AuthUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  
  // Actions
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  loginWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
  register: (data: RegisterData) => Promise<{ success: boolean; error?: string }>;
}

export interface RegisterData {
  email: string;
  password: string;
  name?: string;
  phone?: string;
  newsletter?: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// ═══════════════════════════════════════════════════════════════════════════
// AUTH PROVIDER WRAPPER (NextAuth SessionProvider)
// ═══════════════════════════════════════════════════════════════════════════

interface AuthProviderProps {
  children: ReactNode;
  session?: Session | null;
}

export function AuthProvider({ children, session }: AuthProviderProps) {
  return (
    <SessionProvider session={session}>
      <AuthContextProvider>{children}</AuthContextProvider>
    </SessionProvider>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// AUTH CONTEXT PROVIDER
// ═══════════════════════════════════════════════════════════════════════════

function AuthContextProvider({ children }: { children: ReactNode }) {
  const { data: session, status } = useSession();
  
  const isLoading = status === "loading";
  const isAuthenticated = status === "authenticated" && !!session?.user;
  
  const sessionUser = session?.user;
  const user: AuthUser | null = useMemo(
    () =>
      sessionUser
        ? {
            id: sessionUser.id,
            name: sessionUser.name,
            email: sessionUser.email,
            image: sessionUser.image,
            role: sessionUser.role || "CUSTOMER",
            phone: sessionUser.phone,
          }
        : null,
    [sessionUser]
  );

  // ─────────────────────────────────────────────────────────────────────────
  // Login with credentials
  // ─────────────────────────────────────────────────────────────────────────
  const login = useCallback(async (
    email: string,
    password: string
  ): Promise<{ success: boolean; error?: string }> => {
    try {
      const result = await signIn("credentials", {
        email: email.toLowerCase().trim(),
        password,
        redirect: false,
      });

      if (result?.error) {
        return { success: false, error: result.error };
      }

      if (result?.ok) {
        return { success: true };
      }

      return { success: false, error: "Giriş başarısız" };
    } catch (error) {
      console.error("Login error:", error);
      return { success: false, error: "Bir hata oluştu. Lütfen tekrar deneyin." };
    }
  }, []);

  // ─────────────────────────────────────────────────────────────────────────
  // Login with Google
  // ─────────────────────────────────────────────────────────────────────────
  const loginWithGoogle = useCallback(async (): Promise<void> => {
    await signIn("google", { callbackUrl: "/" });
  }, []);

  // ─────────────────────────────────────────────────────────────────────────
  // Logout
  // ─────────────────────────────────────────────────────────────────────────
  const logout = useCallback(async (): Promise<void> => {
    await signOut({ callbackUrl: "/" });
  }, []);

  // ─────────────────────────────────────────────────────────────────────────
  // Register (No auto-login - activation code required first)
  // ─────────────────────────────────────────────────────────────────────────
  const register = useCallback(async (
    data: RegisterData
  ): Promise<{ success: boolean; error?: string }> => {
    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!response.ok) {
        return { success: false, error: result.error || "Kayıt başarısız" };
      }

      // Don't auto-login - user must verify email first
      return { success: true };
    } catch (error) {
      console.error("Register error:", error);
      return { success: false, error: "Bir hata oluştu. Lütfen tekrar deneyin." };
    }
  }, []);

  const value = useMemo<AuthContextType>(
    () => ({ user, isAuthenticated, isLoading, login, loginWithGoogle, logout, register }),
    [user, isAuthenticated, isLoading, login, loginWithGoogle, logout, register]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// ═══════════════════════════════════════════════════════════════════════════
// SSG-SAFE DEFAULT VALUES
// ═══════════════════════════════════════════════════════════════════════════

const SSG_SAFE_AUTH_DEFAULTS: AuthContextType = {
  user: null,
  isAuthenticated: false,
  isLoading: true,
  login: async () => ({ success: false, error: "Not initialized" }),
  loginWithGoogle: async () => {},
  logout: async () => {},
  register: async () => ({ success: false, error: "Not initialized" }),
};

// ═══════════════════════════════════════════════════════════════════════════
// HOOK (SSG-SAFE)
// ═══════════════════════════════════════════════════════════════════════════

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  // SSG-safe: Return defaults during static generation instead of throwing
  if (context === undefined) {
    return SSG_SAFE_AUTH_DEFAULTS;
  }
  return context;
}
