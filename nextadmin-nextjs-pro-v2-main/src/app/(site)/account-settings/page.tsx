"use client";

import { useState, useEffect, useRef } from "react";
import { useSession } from "next-auth/react";
import { 
  User, Mail, Phone, Shield, Key, Save, RefreshCw, 
  Eye, EyeOff, CheckCircle, AlertCircle, Camera, Trash2, Upload
} from "lucide-react";

// ═══════════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════════

interface ProfileData {
  name: string;
  email: string;
  phone: string;
}

interface PasswordData {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

// ═══════════════════════════════════════════════════════════════════════════
// ROLE CONFIG
// ═══════════════════════════════════════════════════════════════════════════

const ROLE_LABELS: Record<string, { label: string; color: string; bgColor: string }> = {
  SUPER_ADMIN: { label: "Süper Admin", color: "text-red-600", bgColor: "bg-red-100 dark:bg-red-500/10" },
  ADMIN: { label: "Admin", color: "text-purple-600", bgColor: "bg-purple-100 dark:bg-purple-500/10" },
  CUSTOMER: { label: "Müşteri", color: "text-gray-600", bgColor: "bg-gray-100 dark:bg-gray-500/10" },
};

// ═══════════════════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════════════════

export default function AccountSettingsPage() {
  const { data: session, update } = useSession();
  const [activeTab, setActiveTab] = useState<"profile" | "security">("profile");
  
  // Profile state
  const [profile, setProfile] = useState<ProfileData>({
    name: "",
    email: "",
    phone: "",
  });
  const [savingProfile, setSavingProfile] = useState(false);
  const [profileMessage, setProfileMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Password state
  const [password, setPassword] = useState<PasswordData>({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);
  const [passwordMessage, setPasswordMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Avatar state
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [avatarMessage, setAvatarMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load profile data
  useEffect(() => {
    if (session?.user) {
      setProfile({
        name: (session.user as any).name || "",
        email: session.user.email || "",
        phone: (session.user as any).phone || "",
      });
      setAvatarUrl(session.user.image || null);
    }
  }, [session]);

  // Upload avatar
  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate
    const allowedTypes = ["image/jpeg", "image/png", "image/webp", "image/jpg"];
    if (!allowedTypes.includes(file.type)) {
      setAvatarMessage({ type: "error", text: "Sadece JPEG, PNG ve WebP formatları desteklenir" });
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setAvatarMessage({ type: "error", text: "Dosya boyutu 5MB'dan büyük olamaz" });
      return;
    }

    setUploadingAvatar(true);
    setAvatarMessage(null);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/admin/account/avatar", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.error || "Yükleme başarısız");

      // Update local state with cache buster
      const newUrl = `${data.url}?t=${Date.now()}`;
      setAvatarUrl(newUrl);

      // Update session
      await update({
        ...session,
        user: {
          ...session?.user,
          image: data.url,
        },
      });

      setAvatarMessage({ type: "success", text: "Profil fotoğrafı güncellendi!" });

      // Clear message after 3s
      setTimeout(() => setAvatarMessage(null), 3000);
    } catch (err: any) {
      setAvatarMessage({ type: "error", text: err.message });
    } finally {
      setUploadingAvatar(false);
      // Reset input
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  // Delete avatar
  const handleDeleteAvatar = async () => {
    if (!confirm("Profil fotoğrafını silmek istediğinize emin misiniz?")) return;

    setUploadingAvatar(true);
    setAvatarMessage(null);

    try {
      const res = await fetch("/api/admin/account/avatar", {
        method: "DELETE",
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.error || "Silme başarısız");

      setAvatarUrl(null);

      // Update session
      await update({
        ...session,
        user: {
          ...session?.user,
          image: null,
        },
      });

      setAvatarMessage({ type: "success", text: "Profil fotoğrafı silindi!" });
      setTimeout(() => setAvatarMessage(null), 3000);
    } catch (err: any) {
      setAvatarMessage({ type: "error", text: err.message });
    } finally {
      setUploadingAvatar(false);
    }
  };

  // Get role config
  const userRole = (session?.user as any)?.role || "CUSTOMER";
  const roleConfig = ROLE_LABELS[userRole] || ROLE_LABELS.CUSTOMER;

  // Save profile
  const handleSaveProfile = async () => {
    setSavingProfile(true);
    setProfileMessage(null);

    try {
      const res = await fetch("/api/admin/account", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: profile.name,
          phone: profile.phone,
        }),
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.error || "Güncelleme başarısız");

      // Update session
      await update({
        ...session,
        user: {
          ...session?.user,
          name: profile.name,
        },
      });

      setProfileMessage({ type: "success", text: "Profil başarıyla güncellendi!" });
    } catch (err: any) {
      setProfileMessage({ type: "error", text: err.message });
    } finally {
      setSavingProfile(false);
    }
  };

  // Change password
  const handleChangePassword = async () => {
    setPasswordMessage(null);

    // Validations
    if (!password.currentPassword || !password.newPassword || !password.confirmPassword) {
      setPasswordMessage({ type: "error", text: "Tüm alanları doldurun" });
      return;
    }

    if (password.newPassword.length < 8) {
      setPasswordMessage({ type: "error", text: "Yeni şifre en az 8 karakter olmalı" });
      return;
    }

    if (password.newPassword !== password.confirmPassword) {
      setPasswordMessage({ type: "error", text: "Yeni şifreler eşleşmiyor" });
      return;
    }

    setChangingPassword(true);

    try {
      const res = await fetch("/api/admin/account/password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          currentPassword: password.currentPassword,
          newPassword: password.newPassword,
        }),
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.error || "Şifre değiştirme başarısız");

      setPasswordMessage({ type: "success", text: "Şifre başarıyla değiştirildi!" });
      setPassword({ currentPassword: "", newPassword: "", confirmPassword: "" });
    } catch (err: any) {
      setPasswordMessage({ type: "error", text: err.message });
    } finally {
      setChangingPassword(false);
    }
  };

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-dark dark:text-white">Hesap Ayarları</h1>
        <p className="text-gray-500">Profil bilgilerinizi ve güvenlik ayarlarınızı yönetin</p>
      </div>

      {/* User Card with Avatar Upload */}
      <div className="rounded-xl border border-stroke bg-white p-6 dark:border-dark-3 dark:bg-gray-dark">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
          {/* Avatar Section */}
          <div className="relative group">
            <div className="flex h-24 w-24 items-center justify-center rounded-full bg-primary/10 text-3xl font-bold text-primary overflow-hidden ring-4 ring-primary/20">
              {avatarUrl ? (
                <img 
                  src={avatarUrl} 
                  alt="" 
                  className="h-24 w-24 rounded-full object-cover"
                  key={avatarUrl}
                />
              ) : (
                (session?.user?.name?.[0] || session?.user?.email?.[0] || "A").toUpperCase()
              )}
            </div>
            
            {/* Upload overlay */}
            <div className="absolute inset-0 flex items-center justify-center rounded-full bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                 onClick={() => fileInputRef.current?.click()}>
              {uploadingAvatar ? (
                <RefreshCw size={24} className="text-white animate-spin" />
              ) : (
                <Camera size={24} className="text-white" />
              )}
            </div>

            {/* Hidden file input */}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              className="hidden"
              onChange={handleAvatarUpload}
              disabled={uploadingAvatar}
            />
          </div>

          {/* User Info */}
          <div className="flex-1">
            <h2 className="text-xl font-semibold text-dark dark:text-white">
              {session?.user?.name || "Admin"}
            </h2>
            <p className="text-gray-500">{session?.user?.email}</p>
            <span className={`mt-2 inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-medium ${roleConfig.bgColor} ${roleConfig.color}`}>
              <Shield size={12} />
              {roleConfig.label}
            </span>

            {/* Avatar actions */}
            <div className="mt-4 flex flex-wrap gap-2">
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={uploadingAvatar}
                className="flex items-center gap-2 rounded-lg border border-primary px-3 py-2 text-sm font-medium text-primary hover:bg-primary/10 disabled:opacity-50"
              >
                <Upload size={14} />
                Fotoğraf Yükle
              </button>
              {avatarUrl && (
                <button
                  onClick={handleDeleteAvatar}
                  disabled={uploadingAvatar}
                  className="flex items-center gap-2 rounded-lg border border-red-500 px-3 py-2 text-sm font-medium text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 disabled:opacity-50"
                >
                  <Trash2 size={14} />
                  Sil
                </button>
              )}
            </div>

            {/* Avatar message */}
            {avatarMessage && (
              <div className={`mt-3 flex items-center gap-2 text-sm ${
                avatarMessage.type === "success" ? "text-green-600" : "text-red-600"
              }`}>
                {avatarMessage.type === "success" ? <CheckCircle size={14} /> : <AlertCircle size={14} />}
                {avatarMessage.text}
              </div>
            )}

            <p className="mt-2 text-xs text-gray-500">
              JPEG, PNG veya WebP • Maksimum 5MB
            </p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-stroke dark:border-dark-3">
        <button
          onClick={() => setActiveTab("profile")}
          className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
            activeTab === "profile"
              ? "border-primary text-primary"
              : "border-transparent text-gray-500 hover:text-dark dark:hover:text-white"
          }`}
        >
          <User size={16} />
          Profil Bilgileri
        </button>
        <button
          onClick={() => setActiveTab("security")}
          className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
            activeTab === "security"
              ? "border-primary text-primary"
              : "border-transparent text-gray-500 hover:text-dark dark:hover:text-white"
          }`}
        >
          <Key size={16} />
          Güvenlik
        </button>
      </div>

      {/* Profile Tab */}
      {activeTab === "profile" && (
        <div className="rounded-xl border border-stroke bg-white p-6 dark:border-dark-3 dark:bg-gray-dark">
          <h3 className="mb-6 text-lg font-semibold text-dark dark:text-white">Profil Bilgileri</h3>
          
          <div className="space-y-4 max-w-lg">
            <div>
              <label className="mb-2 flex items-center gap-2 text-sm font-medium text-gray-600 dark:text-gray-400">
                <User size={14} />
                Ad Soyad
              </label>
              <input
                type="text"
                value={profile.name}
                onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                className="w-full rounded-lg border border-stroke bg-transparent px-4 py-3 outline-none focus:border-primary dark:border-dark-3 dark:text-white"
                placeholder="Adınız Soyadınız"
              />
            </div>

            <div>
              <label className="mb-2 flex items-center gap-2 text-sm font-medium text-gray-600 dark:text-gray-400">
                <Mail size={14} />
                E-posta
              </label>
              <input
                type="email"
                value={profile.email}
                disabled
                className="w-full rounded-lg border border-stroke bg-gray-100 px-4 py-3 text-gray-500 dark:border-dark-3 dark:bg-dark-2"
                placeholder="email@example.com"
              />
              <p className="mt-1 text-xs text-gray-500">E-posta adresi değiştirilemez</p>
            </div>

            <div>
              <label className="mb-2 flex items-center gap-2 text-sm font-medium text-gray-600 dark:text-gray-400">
                <Phone size={14} />
                Telefon
              </label>
              <input
                type="tel"
                value={profile.phone}
                onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                className="w-full rounded-lg border border-stroke bg-transparent px-4 py-3 outline-none focus:border-primary dark:border-dark-3 dark:text-white"
                placeholder="0532 123 4567"
              />
            </div>

            {profileMessage && (
              <div className={`flex items-center gap-2 rounded-lg p-3 ${
                profileMessage.type === "success" 
                  ? "bg-green-50 text-green-600 dark:bg-green-500/10" 
                  : "bg-red-50 text-red-600 dark:bg-red-500/10"
              }`}>
                {profileMessage.type === "success" ? <CheckCircle size={16} /> : <AlertCircle size={16} />}
                {profileMessage.text}
              </div>
            )}

            <button
              onClick={handleSaveProfile}
              disabled={savingProfile}
              className="flex items-center gap-2 rounded-lg bg-primary px-6 py-3 text-sm font-medium text-white hover:bg-primary/90 disabled:opacity-50"
            >
              {savingProfile ? <RefreshCw size={16} className="animate-spin" /> : <Save size={16} />}
              Kaydet
            </button>
          </div>
        </div>
      )}

      {/* Security Tab */}
      {activeTab === "security" && (
        <div className="rounded-xl border border-stroke bg-white p-6 dark:border-dark-3 dark:bg-gray-dark">
          <h3 className="mb-6 text-lg font-semibold text-dark dark:text-white">Şifre Değiştir</h3>
          
          <div className="space-y-4 max-w-lg">
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-600 dark:text-gray-400">
                Mevcut Şifre
              </label>
              <div className="relative">
                <input
                  type={showCurrentPassword ? "text" : "password"}
                  value={password.currentPassword}
                  onChange={(e) => setPassword({ ...password, currentPassword: e.target.value })}
                  className="w-full rounded-lg border border-stroke bg-transparent px-4 py-3 pr-12 outline-none focus:border-primary dark:border-dark-3 dark:text-white"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showCurrentPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-gray-600 dark:text-gray-400">
                Yeni Şifre
              </label>
              <div className="relative">
                <input
                  type={showNewPassword ? "text" : "password"}
                  value={password.newPassword}
                  onChange={(e) => setPassword({ ...password, newPassword: e.target.value })}
                  className="w-full rounded-lg border border-stroke bg-transparent px-4 py-3 pr-12 outline-none focus:border-primary dark:border-dark-3 dark:text-white"
                  placeholder="En az 8 karakter"
                />
                <button
                  type="button"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showNewPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-gray-600 dark:text-gray-400">
                Yeni Şifre (Tekrar)
              </label>
              <input
                type="password"
                value={password.confirmPassword}
                onChange={(e) => setPassword({ ...password, confirmPassword: e.target.value })}
                className="w-full rounded-lg border border-stroke bg-transparent px-4 py-3 outline-none focus:border-primary dark:border-dark-3 dark:text-white"
                placeholder="••••••••"
              />
            </div>

            {passwordMessage && (
              <div className={`flex items-center gap-2 rounded-lg p-3 ${
                passwordMessage.type === "success" 
                  ? "bg-green-50 text-green-600 dark:bg-green-500/10" 
                  : "bg-red-50 text-red-600 dark:bg-red-500/10"
              }`}>
                {passwordMessage.type === "success" ? <CheckCircle size={16} /> : <AlertCircle size={16} />}
                {passwordMessage.text}
              </div>
            )}

            <button
              onClick={handleChangePassword}
              disabled={changingPassword}
              className="flex items-center gap-2 rounded-lg bg-primary px-6 py-3 text-sm font-medium text-white hover:bg-primary/90 disabled:opacity-50"
            >
              {changingPassword ? <RefreshCw size={16} className="animate-spin" /> : <Key size={16} />}
              Şifreyi Değiştir
            </button>
          </div>
        </div>
      )}

      {/* Info Box */}
      <div className="rounded-xl border border-blue-200 bg-blue-50 p-4 dark:border-blue-500/20 dark:bg-blue-500/10">
        <div className="flex gap-3">
          <Shield className="text-blue-500 flex-shrink-0" size={20} />
          <div className="text-sm">
            <p className="font-medium text-blue-800 dark:text-blue-400">Güvenlik İpucu</p>
            <p className="mt-1 text-blue-600 dark:text-blue-300">
              Güçlü bir şifre için en az 8 karakter, büyük/küçük harf, rakam ve özel karakter kullanın.
              Şifrenizi düzenli olarak değiştirin.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
