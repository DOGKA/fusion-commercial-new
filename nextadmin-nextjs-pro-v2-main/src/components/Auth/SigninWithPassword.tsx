"use client";
import { signIn } from "next-auth/react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import React, { useState, useEffect } from "react";
import toast from "react-hot-toast";

export default function SigninWithPassword() {
  const [data, setData] = useState({
    email: "",
    password: "",
    remember: false,
  });

  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();

  // URL'den hata mesajı kontrolü
  useEffect(() => {
    const error = searchParams.get("error");
    const message = searchParams.get("message");
    
    if (error === "AccessDenied" && message) {
      toast.error(message);
    }
  }, [searchParams]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setData({
      ...data,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (loading) return;

    if (!data.email) {
      return toast.error("E-posta adresinizi girin");
    }

    if (!data.password) {
      return toast.error("Şifrenizi girin");
    }

    setLoading(true);

    try {
      const callback = await signIn("credentials", {
        email: data.email,
        password: data.password,
        redirect: false,
      });

      if (callback?.error) {
        // next-auth credentials genelde "CredentialsSignin" döner (detay vermez)
        const msg =
          callback.error === "CredentialsSignin"
            ? "E-posta veya şifre hatalı"
            : callback.error;
        toast.error(msg);
        return;
      }

      if (callback?.ok) {
        toast.success("Giriş başarılı!");
        setData({ email: "", password: "", remember: false });
        router.push("/");
        router.refresh();
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* Email Input */}
      <div>
        <label className="block text-sm font-medium text-white/70 mb-2">
          E-posta
        </label>
        <div className="relative">
          <input
        type="email"
        name="email"
        value={data.email}
            onChange={handleChange}
            placeholder="ornek@email.com"
            className="w-full px-4 py-3.5 pl-12 bg-white/[0.03] border border-white/[0.08] rounded-xl text-white placeholder:text-white/30 focus:outline-none focus:border-[#00FF77]/50 focus:ring-1 focus:ring-[#00FF77]/20 transition-all duration-300"
          />
          <div className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          </div>
        </div>
      </div>

      {/* Password Input */}
      <div>
        <label className="block text-sm font-medium text-white/70 mb-2">
          Şifre
        </label>
        <div className="relative">
          <input
            type={showPassword ? "text" : "password"}
        name="password"
        value={data.password}
            onChange={handleChange}
            placeholder="••••••••"
            className="w-full px-4 py-3.5 pl-12 pr-12 bg-white/[0.03] border border-white/[0.08] rounded-xl text-white placeholder:text-white/30 focus:outline-none focus:border-[#00FF77]/50 focus:ring-1 focus:ring-[#00FF77]/20 transition-all duration-300"
          />
          <div className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-white/40 hover:text-white/60 transition-colors"
          >
            {showPassword ? (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
              </svg>
            ) : (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
            )}
          </button>
        </div>
      </div>

      {/* Remember & Forgot */}
      <div className="flex items-center justify-between">
        <label className="flex items-center gap-2 cursor-pointer group">
          <div className="relative">
            <input
              type="checkbox"
          name="remember"
              checked={data.remember}
              onChange={(e) => setData({ ...data, remember: e.target.checked })}
              className="sr-only peer"
            />
            <div className="w-5 h-5 border border-white/20 rounded-md bg-white/[0.03] peer-checked:bg-[#00FF77]/20 peer-checked:border-[#00FF77]/50 transition-all duration-300 flex items-center justify-center">
              <svg className="w-3 h-3 text-[#00FF77] opacity-0 peer-checked:opacity-100 transition-opacity" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
              </svg>
            </div>
          </div>
          <span className="text-sm text-white/50 group-hover:text-white/70 transition-colors">
            Beni hatırla
          </span>
        </label>

        <Link
          href="/auth/forgot-password"
          className="text-sm text-white/50 hover:text-[#00FF77] transition-colors"
        >
          Şifremi Unuttum
        </Link>
      </div>

      {/* Submit Button */}
        <button
          type="submit"
          disabled={loading}
        className="w-full relative group overflow-hidden py-4 px-6 rounded-xl font-semibold text-[#0a0a0f] bg-gradient-to-r from-[#00FF77] via-[#79FFB7] to-[#A5FFCF] hover:shadow-lg hover:shadow-[#00FF77]/25 transition-all duration-300 disabled:opacity-70 disabled:cursor-not-allowed"
        >
        <span className="relative z-10 flex items-center justify-center gap-2">
          {loading ? (
            <>
              <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Giriş yapılıyor...
            </>
          ) : (
            <>
              Giriş Yap
              <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </>
          )}
        </span>
        </button>
    </form>
  );
}
