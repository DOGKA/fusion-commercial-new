/**
 * NextAuth Configuration - FusionMarkt
 * Credentials + Google SSO authentication
 */

import { prisma } from "@repo/db";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import {
  DefaultSession,
  getServerSession,
  type NextAuthOptions,
} from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import bcrypt from "bcrypt";
import type { User as PrismaUser } from "@prisma/client";

// ═══════════════════════════════════════════════════════════════════════════
// TYPE EXTENSIONS
// ═══════════════════════════════════════════════════════════════════════════

declare module "next-auth" {
  interface Session extends DefaultSession {
    user: {
      id: string;
      role: string;
      phone?: string | null;
    } & DefaultSession["user"];
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    uid: string;
    role: string;
    phone?: string | null;
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// AUTH OPTIONS
// ═══════════════════════════════════════════════════════════════════════════

export const authOptions: NextAuthOptions = {
  pages: {
    signIn: "/hesabim",
    signOut: "/hesabim",
    error: "/hesabim",
  },
  adapter: PrismaAdapter(prisma),
  secret: process.env.NEXTAUTH_SECRET || process.env.SECRET,
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },

  // FRONTEND - Ayrı cookie adı kullanarak admin session'ından ayır
  cookies: {
    sessionToken: {
      name: "shop-session-token",
      options: {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        secure: process.env.NODE_ENV === "production",
      },
    },
    callbackUrl: {
      name: "shop-callback-url",
      options: {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        secure: process.env.NODE_ENV === "production",
      },
    },
    csrfToken: {
      name: "shop-csrf-token",
      options: {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        secure: process.env.NODE_ENV === "production",
      },
    },
  },

  providers: [
    // ─────────────────────────────────────────────────────────────────────────
    // Credentials Provider (Email + Password)
    // ─────────────────────────────────────────────────────────────────────────
    CredentialsProvider({
      id: "credentials",
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Parola", type: "password" },
      },

      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("E-posta ve parola gereklidir");
        }

        // Find user by email
        const user = await prisma.user.findUnique({
          where: { email: credentials.email.toLowerCase().trim() },
        });

        if (!user) {
          throw new Error("Bu e-posta adresi ile kayıtlı kullanıcı bulunamadı");
        }

        if (!user.password) {
          throw new Error("Bu hesap sosyal giriş ile oluşturulmuş. Google ile giriş yapın.");
        }

        // Verify password
        const isValid = await bcrypt.compare(credentials.password, user.password);
        if (!isValid) {
          throw new Error("Parola hatalı");
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          image: user.image,
          role: user.role,
          phone: user.phone,
        };
      },
    }),

    // ─────────────────────────────────────────────────────────────────────────
    // Google Provider (SSO)
    // ─────────────────────────────────────────────────────────────────────────
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
      allowDangerousEmailAccountLinking: true,
    }),
  ],

  callbacks: {
    // ─────────────────────────────────────────────────────────────────────────
    // JWT Callback - Token oluşturma/güncelleme
    // ─────────────────────────────────────────────────────────────────────────
    async jwt({ token, user, trigger, session }) {
      // Session update trigger (profile update etc.)
      if (trigger === "update" && session?.user) {
        return {
          ...token,
          ...session.user,
          picture: session.user.image,
        };
      }

      // Initial sign in
      if (user) {
        return {
          ...token,
          uid: user.id,
          role: (user as PrismaUser).role || "CUSTOMER",
          phone: (user as PrismaUser).phone,
          picture: user.image,
        };
      }

      return token;
    },

    // ─────────────────────────────────────────────────────────────────────────
    // Session Callback - Client'a gönderilen session
    // ─────────────────────────────────────────────────────────────────────────
    async session({ session, token }) {
      if (session?.user) {
        return {
          ...session,
          user: {
            ...session.user,
            id: token.uid || token.sub,
            role: token.role || "CUSTOMER",
            phone: token.phone,
            image: token.picture,
          },
        };
      }
      return session;
    },
  },
};

// ═══════════════════════════════════════════════════════════════════════════
// HELPER FUNCTIONS
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Get server-side session
 * Use in Server Components and API routes
 */
export const getAuthSession = async () => {
  return getServerSession(authOptions);
};

/**
 * Hash password for registration
 */
export const hashPassword = async (password: string): Promise<string> => {
  return bcrypt.hash(password, 12);
};

/**
 * Verify password
 */
export const verifyPassword = async (
  password: string,
  hashedPassword: string
): Promise<boolean> => {
  return bcrypt.compare(password, hashedPassword);
};
