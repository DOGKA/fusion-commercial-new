"use client";
import { EmailIcon, PasswordIcon } from "@/assets/icons";
import { signIn } from "next-auth/react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import React, { useState, useEffect } from "react";
import toast from "react-hot-toast";
import InputGroup from "../FormElements/InputGroup";
import { Checkbox } from "../ui-elements/checkbox";

export default function SigninWithPassword() {
  const [data, setData] = useState({
    email: "",
    password: "",
    remember: false,
  });

  const [loading, setLoading] = useState(false);
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

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!data.email) {
      return toast.error("E-posta adresinizi girin");
    }

    if (!data.password) {
      return toast.error("Şifrenizi girin");
    }

    setLoading(true);

    signIn("credentials", { ...data, redirect: false }).then((callback) => {
      if (callback?.error) {
        // Hata mesajlarını Türkçeleştir
        let errorMessage = callback.error;
        if (callback.error.includes("password")) {
          errorMessage = "Şifre yanlış";
        } else if (callback.error.includes("email") || callback.error.includes("user")) {
          errorMessage = "Kullanıcı bulunamadı";
        } else if (callback.error.includes("yetki") || callback.error.includes("admin")) {
          errorMessage = callback.error;
        }
        toast.error(errorMessage);
        setLoading(false);
      }

      if (callback?.ok && !callback?.error) {
        toast.success("Giriş başarılı!");
        setLoading(false);
        setData({ email: "", password: "", remember: false });
        router.push("/");
        router.refresh();
      }
    });
  };

  return (
    <form onSubmit={handleSubmit}>
      <InputGroup
        type="email"
        label="E-posta"
        className="mb-4 [&_input]:py-[15px]"
        placeholder="E-posta adresinizi girin"
        name="email"
        handleChange={handleChange}
        value={data.email}
        icon={<EmailIcon />}
      />

      <InputGroup
        type="password"
        label="Şifre"
        className="mb-5 [&_input]:py-[15px]"
        placeholder="Şifrenizi girin"
        name="password"
        handleChange={handleChange}
        value={data.password}
        icon={<PasswordIcon />}
      />

      <div className="mb-6 flex items-center justify-between gap-2 py-2 font-medium">
        <Checkbox
          label="Beni hatırla"
          name="remember"
          withIcon="check"
          minimal
          radius="md"
          onChange={(e) =>
            setData({
              ...data,
              remember: e.target.checked,
            })
          }
        />

        <Link
          href="/auth/forgot-password"
          className="text-sm hover:text-primary dark:text-gray-400 dark:hover:text-primary"
        >
          Şifremi Unuttum
        </Link>
      </div>

      <div className="mb-4.5">
        <button
          type="submit"
          disabled={loading}
          className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-lg bg-primary p-4 font-medium text-white transition hover:bg-opacity-90 disabled:opacity-70 disabled:cursor-not-allowed"
        >
          {loading ? (
            <>
              <span className="inline-block h-5 w-5 animate-spin rounded-full border-2 border-solid border-white border-t-transparent" />
              Giriş yapılıyor...
            </>
          ) : (
            "Giriş Yap"
          )}
        </button>
      </div>
    </form>
  );
}
