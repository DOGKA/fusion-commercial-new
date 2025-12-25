"use client";

import { createContext, useContext, ReactNode } from "react";
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
  
  const user: AuthUser | null = session?.user
    ? {
        id: session.user.id,
        name: session.user.name,
        email: session.user.email,
        image: session.user.image,
        role: session.user.role || "CUSTOMER",
        phone: session.user.phone,
      }
    : null;

  // ─────────────────────────────────────────────────────────────────────────
  // Login with credentials
  // ─────────────────────────────────────────────────────────────────────────
  const login = async (
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
  };

  // ─────────────────────────────────────────────────────────────────────────
  // Login with Google
  // ─────────────────────────────────────────────────────────────────────────
  const loginWithGoogle = async (): Promise<void> => {
    await signIn("google", { callbackUrl: "/" });
  };

  // ─────────────────────────────────────────────────────────────────────────
  // Logout
  // ─────────────────────────────────────────────────────────────────────────
  const logout = async (): Promise<void> => {
    await signOut({ callbackUrl: "/" });
  };

  // ─────────────────────────────────────────────────────────────────────────
  // Register (No auto-login - activation code required first)
  // ─────────────────────────────────────────────────────────────────────────
  const register = async (
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
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated,
        isLoading,
        login,
        loginWithGoogle,
        logout,
        register,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// HOOK
// ═══════════════════════════════════════════════════════════════════════════

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
