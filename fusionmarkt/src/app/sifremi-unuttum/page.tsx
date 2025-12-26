/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import { useState } from "react";
import Link from "next/link";
import { Lock, Mail, ArrowLeft, CheckCircle, AlertCircle, Loader2, Shield } from "lucide-react";

// ═══════════════════════════════════════════════════════════════════════════
// FORGOT PASSWORD PAGE - /sifremi-unuttum
// ═══════════════════════════════════════════════════════════════════════════

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [focused, setFocused] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email.trim()) {
      setError("E-posta adresi gereklidir");
      return;
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError("Geçerli bir e-posta adresi giriniz");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.toLowerCase().trim() }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Bir hata oluştu");
      } else {
        setSuccess(true);
      }
    } catch (e) {
      setError("Bir hata oluştu. Lütfen tekrar deneyin.");
    }

    setLoading(false);
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        backgroundColor: "#050505",
        paddingTop: "120px",
        paddingBottom: "80px",
      }}
    >
      {/* Background Gradient */}
      <div
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: "radial-gradient(ellipse at top, rgba(16, 185, 129, 0.06) 0%, transparent 50%)",
          pointerEvents: "none",
        }}
      />

      <div
        style={{
          maxWidth: "480px",
          margin: "0 auto",
          padding: "0 24px",
          position: "relative",
        }}
      >
        {/* Back Link */}
        <Link
          href="/hesabim"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "8px",
            fontSize: "14px",
            color: "rgba(255,255,255,0.5)",
            textDecoration: "none",
            marginBottom: "32px",
            transition: "color 0.2s",
          }}
        >
          <ArrowLeft size={16} />
          Giriş Yap
        </Link>

        {/* Main Card */}
        <div
          style={{
            backgroundColor: "rgba(19, 19, 19, 0.9)",
            border: "1px solid rgba(255,255,255,0.08)",
            borderRadius: "24px",
            padding: "40px",
          }}
        >
          {/* Icon */}
          <div
            style={{
              width: "64px",
              height: "64px",
              borderRadius: "16px",
              backgroundColor: "rgba(16, 185, 129, 0.1)",
              border: "1px solid rgba(16, 185, 129, 0.2)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto 24px",
            }}
          >
            <Lock size={28} color="#10b981" />
          </div>

          {/* Title */}
          <h1
            style={{
              fontSize: "24px",
              fontWeight: "700",
              color: "white",
              textAlign: "center",
              marginBottom: "12px",
            }}
          >
            Şifremi Unuttum
          </h1>

          <p
            style={{
              fontSize: "14px",
              color: "rgba(255,255,255,0.5)",
              textAlign: "center",
              marginBottom: "32px",
            }}
          >
            E-posta adresinizi girin, size şifre sıfırlama linki gönderelim.
          </p>

          {/* Success State */}
          {success ? (
            <div
              style={{
                padding: "24px",
                backgroundColor: "rgba(16, 185, 129, 0.1)",
                border: "1px solid rgba(16, 185, 129, 0.2)",
                borderRadius: "16px",
                textAlign: "center",
              }}
            >
              <CheckCircle
                size={48}
                color="#10b981"
                style={{ margin: "0 auto 16px" }}
              />
              <h3
                style={{
                  fontSize: "18px",
                  fontWeight: "600",
                  color: "#10b981",
                  marginBottom: "8px",
                }}
              >
                Link Gönderildi!
              </h3>
              <p
                style={{
                  fontSize: "14px",
                  color: "rgba(255,255,255,0.6)",
                  marginBottom: "20px",
                }}
              >
                Şifre sıfırlama linki <strong style={{ color: "#fff" }}>{email}</strong> adresine gönderildi.
                Lütfen e-posta kutunuzu kontrol edin.
              </p>
              <p
                style={{
                  fontSize: "12px",
                  color: "rgba(255,255,255,0.4)",
                }}
              >
                E-posta gelmediyse spam/junk klasörünü kontrol edin.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit}>
              {/* Error Message */}
              {error && (
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "12px",
                    padding: "14px 16px",
                    backgroundColor: "rgba(239, 68, 68, 0.1)",
                    border: "1px solid rgba(239, 68, 68, 0.2)",
                    borderRadius: "12px",
                    marginBottom: "20px",
                  }}
                >
                  <AlertCircle size={18} color="#ef4444" />
                  <span style={{ fontSize: "14px", color: "#ef4444" }}>{error}</span>
                </div>
              )}

              {/* Email Input */}
              <div style={{ marginBottom: "24px" }}>
                <label
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    fontSize: "14px",
                    fontWeight: "500",
                    color: "rgba(255,255,255,0.7)",
                    marginBottom: "10px",
                  }}
                >
                  <Mail size={16} />
                  E-posta Adresi
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onFocus={() => setFocused(true)}
                  onBlur={() => setFocused(false)}
                  placeholder="ornek@email.com"
                  required
                  style={{
                    width: "100%",
                    height: "52px",
                    padding: "0 16px",
                    backgroundColor: "rgba(255,255,255,0.03)",
                    border: focused
                      ? "1px solid rgba(16, 185, 129, 0.5)"
                      : "1px solid rgba(255,255,255,0.12)",
                    borderRadius: "14px",
                    fontSize: "15px",
                    color: "white",
                    outline: "none",
                    transition: "all 0.2s ease",
                  }}
                />
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="inline-flex items-center gap-2 w-full justify-center px-5 py-3 bg-emerald-500/10 border border-emerald-500/20 text-white rounded-lg text-[17px] font-medium hover:bg-emerald-500/25 hover:border-emerald-500/30 transition-all disabled:opacity-50"
                style={{
                  height: "52px",
                  cursor: loading ? "not-allowed" : "pointer",
                }}
              >
                {loading ? (
                  <Loader2 size={18} className="animate-spin" />
                ) : (
                  <Lock size={18} />
                )}
                {loading ? "Gönderiliyor..." : "Şifre Sıfırlama Linki Gönder"}
              </button>
            </form>
          )}

          {/* Back to Login */}
          <div style={{ textAlign: "center", marginTop: "24px" }}>
            <Link
              href="/hesabim"
              style={{
                fontSize: "14px",
                color: "rgba(255,255,255,0.5)",
                textDecoration: "none",
              }}
            >
              Giriş sayfasına dön
            </Link>
          </div>
        </div>

        {/* Security Badge */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "8px",
            marginTop: "32px",
          }}
        >
          <Shield size={14} style={{ color: "rgba(255,255,255,0.3)" }} />
          <span style={{ fontSize: "11px", color: "rgba(255,255,255,0.3)" }}>
            256-bit SSL ile güvenli bağlantı
          </span>
        </div>
      </div>
    </div>
  );
}
