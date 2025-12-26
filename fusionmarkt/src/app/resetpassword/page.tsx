"use client";

import { Suspense, useState, useEffect, useCallback, useRef } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Eye, EyeOff, Lock, Loader2, Check, ShieldAlert } from "lucide-react";

// Loading fallback
function ResetPasswordLoading() {
  return (
    <div className="min-h-screen bg-[#050505] flex items-center justify-center">
      <div className="text-center">
        <Loader2 size={40} className="animate-spin text-emerald-500 mx-auto mb-4" />
        <p className="text-white/60">Yükleniyor...</p>
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<ResetPasswordLoading />}>
      <ResetPasswordContent />
    </Suspense>
  );
}

function ResetPasswordContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get("token");
  const validationRef = useRef(false);

  const [isValidating, setIsValidating] = useState(true);
  const [isValid, setIsValid] = useState(false);
  const [isExpired, setIsExpired] = useState(false);
  const [userEmail, setUserEmail] = useState("");
  const [userName, setUserName] = useState("");

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // Update state after async operation
  const updateValidationState = useCallback((valid: boolean, expired: boolean, email: string, name: string) => {
    setIsValid(valid);
    setIsExpired(expired);
    setUserEmail(email);
    setUserName(name);
    setIsValidating(false);
  }, []);

  // Validate token on mount
  useEffect(() => {
    if (validationRef.current) return;
    validationRef.current = true;

    if (!token) {
      queueMicrotask(() => setIsValidating(false));
      return;
    }

    const validateToken = async () => {
      try {
        const res = await fetch(`/api/auth/reset-password?token=${token}`);
        const data = await res.json();

        if (data.valid) {
          updateValidationState(true, false, data.email || "", data.name || "");
        } else if (data.expired) {
          updateValidationState(false, true, "", "");
        } else {
          updateValidationState(false, false, "", "");
        }
      } catch (e) {
        console.error("Token validation error:", e);
        updateValidationState(false, false, "", "");
      }
    };

    validateToken();
  }, [token, updateValidationState]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          token,
          currentPassword,
          newPassword,
          confirmPassword,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error);
      } else {
        setSuccess(true);
        setTimeout(() => {
          router.push("/hesabim");
        }, 3000);
      }
    } catch (e) {
      console.error(e);
      setError("Bir hata oluştu. Lütfen tekrar deneyin.");
    }

    setLoading(false);
  };

  // Loading state
  if (isValidating) {
    return (
      <div className="min-h-screen bg-[#050505] flex items-center justify-center">
        <div className="text-center">
          <Loader2 size={40} className="animate-spin text-emerald-500 mx-auto mb-4" />
          <p className="text-white/60">Doğrulanıyor...</p>
        </div>
      </div>
    );
  }

  // Invalid or missing token - show 404
  if (!token || (!isValid && !isExpired)) {
    return (
      <div className="min-h-screen bg-[#050505] flex items-center justify-center px-4">
        <div className="text-center max-w-md">
          <div className="w-20 h-20 rounded-full bg-red-500/10 flex items-center justify-center mx-auto mb-6">
            <ShieldAlert size={40} className="text-red-500" />
          </div>
          <h1 className="text-[28px] font-bold text-white mb-3">404 - Sayfa Bulunamadı</h1>
          <p className="text-white/50 mb-8">
            Bu sayfa mevcut değil veya erişim yetkiniz yok.
          </p>
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-6 py-3 bg-emerald-500/10 border border-emerald-500/20 text-white rounded-lg text-[15px] font-medium hover:bg-emerald-500/25 hover:border-emerald-500/30 transition-all"
          >
            Ana Sayfaya Dön
          </Link>
        </div>
      </div>
    );
  }

  // Expired token
  if (isExpired) {
    return (
      <div className="min-h-screen bg-[#050505] flex items-center justify-center px-4">
        <div className="text-center max-w-md">
          <div className="w-20 h-20 rounded-full bg-amber-500/10 flex items-center justify-center mx-auto mb-6">
            <Lock size={40} className="text-amber-500" />
          </div>
          <h1 className="text-[28px] font-bold text-white mb-3">Link Süresi Dolmuş</h1>
          <p className="text-white/50 mb-8">
            Şifre sıfırlama linkinin süresi dolmuş. Lütfen yeni bir link talep edin.
          </p>
          <Link
            href="/hesabim"
            className="inline-flex items-center gap-2 px-6 py-3 bg-emerald-500/10 border border-emerald-500/20 text-white rounded-lg text-[15px] font-medium hover:bg-emerald-500/25 hover:border-emerald-500/30 transition-all"
          >
            Hesabıma Git
          </Link>
        </div>
      </div>
    );
  }

  // Success state
  if (success) {
    return (
      <div className="min-h-screen bg-[#050505] flex items-center justify-center px-4">
        <div className="text-center max-w-md">
          <div className="w-20 h-20 rounded-full bg-emerald-500/10 flex items-center justify-center mx-auto mb-6">
            <Check size={40} className="text-emerald-500" />
          </div>
          <h1 className="text-[28px] font-bold text-white mb-3">Şifre Güncellendi</h1>
          <p className="text-white/50 mb-2">
            Şifreniz başarıyla güncellendi.
          </p>
          <p className="text-white/30 text-sm">
            Hesabınıza yönlendiriliyorsunuz...
          </p>
        </div>
      </div>
    );
  }

  // Reset password form
  return (
    <div className="min-h-screen bg-[#050505] flex items-center justify-center px-4 py-16">
      <div className="w-full max-w-md">
        <div className="bg-white/[0.02] border border-white/[0.05] rounded-2xl p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="w-16 h-16 rounded-full bg-emerald-500/10 flex items-center justify-center mx-auto mb-4">
              <Lock size={28} className="text-emerald-500" />
            </div>
            <h1 className="text-[24px] font-bold text-white mb-2">Şifre Sıfırlama</h1>
            {userName && (
              <p className="text-white/50">Merhaba, {userName}</p>
            )}
            <p className="text-white/30 text-sm mt-1">{userEmail}</p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-[13px]">
                {error}
              </div>
            )}

            {/* Current Password */}
            <div className="space-y-2">
              <label className="text-[13px] text-white/60">Mevcut Şifre</label>
              <div className="relative">
                <input
                  type={showCurrentPassword ? "text" : "password"}
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  required
                  className="w-full h-12 px-4 pr-12 bg-white/[0.03] border border-white/[0.08] rounded-xl text-white placeholder:text-white/20 outline-none focus:border-emerald-500/40 transition-all"
                  placeholder="Mevcut şifrenizi girin"
                />
                <button
                  type="button"
                  onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60 transition-colors"
                >
                  {showCurrentPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {/* New Password */}
            <div className="space-y-2">
              <label className="text-[13px] text-white/60">Yeni Şifre</label>
              <div className="relative">
                <input
                  type={showNewPassword ? "text" : "password"}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                  minLength={6}
                  className="w-full h-12 px-4 pr-12 bg-white/[0.03] border border-white/[0.08] rounded-xl text-white placeholder:text-white/20 outline-none focus:border-emerald-500/40 transition-all"
                  placeholder="En az 6 karakter"
                />
                <button
                  type="button"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60 transition-colors"
                >
                  {showNewPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {/* Confirm Password */}
            <div className="space-y-2">
              <label className="text-[13px] text-white/60">Şifre Tekrar</label>
              <div className="relative">
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  minLength={6}
                  className="w-full h-12 px-4 pr-12 bg-white/[0.03] border border-white/[0.08] rounded-xl text-white placeholder:text-white/20 outline-none focus:border-emerald-500/40 transition-all"
                  placeholder="Yeni şifrenizi tekrar girin"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60 transition-colors"
                >
                  {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full h-12 flex items-center justify-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl text-[15px] font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  Güncelleniyor...
                </>
              ) : (
                <>
                  <Lock size={18} />
                  Şifreyi Güncelle
                </>
              )}
            </button>
          </form>

          {/* Security Note */}
          <p className="text-center text-white/30 text-[11px] mt-6">
            Güvenliğiniz için bu sayfa yalnızca geçerli bir link ile erişilebilir.
          </p>
        </div>
      </div>
    </div>
  );
}
