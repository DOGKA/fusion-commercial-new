"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { useSession } from "next-auth/react";
import { 
  Eye, EyeOff, Shield, Check, LogOut, User, Package, 
  MapPin, Heart, Settings, ChevronRight, Loader2, 
  LayoutDashboard, Camera, Lock,
  X, Trash2, Save, Edit2, Star,
  Truck, Clock, CheckCircle, XCircle, RefreshCw, FileText,
  ExternalLink, Copy, ChevronDown, ChevronUp, AlertCircle,
  Search
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useFavorites } from "@/context/FavoritesContext";
import { useCart } from "@/context/CartContext";
import { cn } from "@/lib/utils";
import { CITIES, getDistricts } from "@/lib/turkey-cities";
import { getTrackingUrl } from "@/lib/shipping";

// ═══════════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════════

type ActivePanel = "login" | "register" | null;
type DashboardTab = "pano" | "siparisler" | "adresler" | "hesap" | "favoriler";

interface UserType {
  id?: string;
  name?: string | null;
  email?: string | null;
  image?: string | null;
  phone?: string | null;
  firstName?: string | null;
  lastName?: string | null;
  birthDate?: string | null;
}

interface OrderType {
  id: string;
  orderNumber: string;
  status: string;
  total?: number;
  grandTotal?: number;
  createdAt: string;
  items?: { title: string; quantity: number; price: number; image?: string }[];
  shippingAddress?: { firstName?: string; lastName?: string; city?: string };
  trackingNumber?: string;
  carrier?: string;
  customerNote?: string;
}

interface MenuItemType {
  id: DashboardTab;
  icon: React.ComponentType<{ size?: number; className?: string }>;
  label: string;
}

const MENU_ITEMS: MenuItemType[] = [
  { id: "pano", icon: LayoutDashboard, label: "Pano" },
  { id: "siparisler", icon: Package, label: "Siparişler" },
  { id: "adresler", icon: MapPin, label: "Adresler" },
  { id: "hesap", icon: Settings, label: "Hesap Detayları" },
  { id: "favoriler", icon: Heart, label: "Favorilerim" },
];

// ═══════════════════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════════════════

export default function HesabimPage() {
  const { user, isAuthenticated, isLoading, login, loginWithGoogle, logout, register } = useAuth();
  
  // Dashboard state
  const [activeTab, setActiveTab] = useState<DashboardTab>("pano");
  
  // Shared order expansion state (for navigating from Dashboard to specific order)
  const [expandedOrderId, setExpandedOrderId] = useState<string | null>(null);
  
  // Avatar state (shared between sidebar and account pane)
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  
  // Notification state
  const [notification, setNotification] = useState<{ type: "success" | "error"; message: string } | null>(null);
  
  // Show notification helper
  const showNotification = (type: "success" | "error", message: string) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 3000);
  };
  
  // Compute avatar URL from user data with cache buster
  // Cache buster ref - sadece bir kez oluşturulur
  const cacheBusterRef = useRef<string | null>(null);
  
  // Sync avatar to state when user image changes
  const prevUserImageRef = useRef(user?.image);
  useEffect(() => {
    if (user?.image !== prevUserImageRef.current) {
      prevUserImageRef.current = user?.image;
      // Yeni cache buster oluştur
      cacheBusterRef.current = Math.random().toString(36).substring(2, 9);
      
      queueMicrotask(() => {
        if (!user?.image) {
          setAvatarUrl(null);
        } else if (user.image.startsWith("data:")) {
          setAvatarUrl(user.image);
        } else {
          const separator = user.image.includes("?") ? "&" : "?";
          setAvatarUrl(`${user.image}${separator}t=${cacheBusterRef.current}`);
        }
      });
    }
  }, [user?.image]);
  
  // Login/Register state
  const [activePanel, setActivePanel] = useState<ActivePanel>(null);
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [loginLoading, setLoginLoading] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);
  
  const [registerEmail, setRegisterEmail] = useState("");
  const [registerPassword, setRegisterPassword] = useState("");
  const [registerName, setRegisterName] = useState("");
  const [showRegisterPassword, setShowRegisterPassword] = useState(false);
  const [newsletter, setNewsletter] = useState(false);
  const [registerLoading, setRegisterLoading] = useState(false);
  const [registerError, setRegisterError] = useState<string | null>(null);
  
  // Activation code state
  const [showActivation, setShowActivation] = useState(false);
  const [activationEmail, setActivationEmail] = useState("");
  const [activationCode, setActivationCode] = useState("");
  const [activationLoading, setActivationLoading] = useState(false);
  const [activationError, setActivationError] = useState<string | null>(null);
  const [activationSuccess, setActivationSuccess] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [resendSuccess, setResendSuccess] = useState(false);
  const [countdown, setCountdown] = useState(300); // 5 minutes in seconds
  
  const [focusedField, setFocusedField] = useState<string | null>(null);
  const [loginHover, setLoginHover] = useState(false);
  const [registerHover, setRegisterHover] = useState(false);
  const [googleHover, setGoogleHover] = useState(false);

  // Clear errors when panel changes (using ref to track changes)
  const prevActivePanelRef = useRef(activePanel);
  useEffect(() => {
    if (prevActivePanelRef.current !== activePanel) {
      prevActivePanelRef.current = activePanel;
      queueMicrotask(() => {
        setLoginError(null);
        setRegisterError(null);
      });
    }
  }, [activePanel]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError(null);
    setLoginLoading(true);
    const result = await login(loginEmail, loginPassword);
    if (!result.success) setLoginError(result.error || "Giriş başarısız");
    setLoginLoading(false);
  };

  const handleGoogleLogin = async () => {
    await loginWithGoogle();
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setRegisterError(null);
    setRegisterLoading(true);
    const result = await register({
      email: registerEmail,
      password: registerPassword,
      name: registerName,
      newsletter,
    });
    if (!result.success) {
      setRegisterError(result.error || "Kayıt başarısız");
    } else {
      // Registration successful - send activation code
      setActivationEmail(registerEmail);
      try {
        const res = await fetch("/api/auth/send-activation", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: registerEmail }),
        });
        if (res.ok) {
          setShowActivation(true);
          setCountdown(300); // Reset countdown to 5 minutes
        } else {
          const data = await res.json();
          setRegisterError(data.error || "Aktivasyon kodu gönderilemedi");
        }
      } catch {
        setRegisterError("Aktivasyon kodu gönderilemedi");
      }
    }
    setRegisterLoading(false);
  };

  // Countdown timer for activation code
  useEffect(() => {
    if (!showActivation || countdown <= 0) return;
    const timer = setInterval(() => {
      setCountdown((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [showActivation, countdown]);

  const handleActivationSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setActivationError(null);
    setActivationLoading(true);
    
    try {
      const res = await fetch("/api/auth/verify-activation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: activationEmail, code: activationCode }),
      });
      const data = await res.json();
      
      if (!res.ok) {
        setActivationError(data.error);
      } else {
        setActivationSuccess(true);
        // Auto login after successful activation
        setTimeout(async () => {
          await login(activationEmail, registerPassword);
        }, 2000);
      }
    } catch {
      setActivationError("Doğrulama sırasında bir hata oluştu");
    }
    setActivationLoading(false);
  };

  const handleResendCode = async () => {
    setResendLoading(true);
    setResendSuccess(false);
    
    try {
      const res = await fetch("/api/auth/send-activation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: activationEmail }),
      });
      if (res.ok) {
        setResendSuccess(true);
        setCountdown(300); // Reset countdown
        setTimeout(() => setResendSuccess(false), 3000);
      }
    } catch {
      console.error("Resend failed");
    }
    setResendLoading(false);
  };

  const formatCountdown = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const handleLogout = async () => {
    await logout();
  };

  const activateLogin = () => setActivePanel("login");
  const activateRegister = () => setActivePanel("register");

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 size={32} className="animate-spin text-emerald-500" />
      </div>
    );
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // AUTHENTICATED VIEW - Minimal Dashboard (Larger Layout)
  // ═══════════════════════════════════════════════════════════════════════════
  
  const CONTAINER_HEIGHT = 780; // Larger fixed height for both containers
  
  if (isAuthenticated && user) {
    return (
      <div className="min-h-screen bg-background" style={{ paddingTop: "120px", paddingBottom: "80px" }}>
        {/* Subtle Background */}
        <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
          <div className="absolute top-[-200px] left-1/2 -translate-x-1/2 w-[900px] h-[500px] bg-emerald-500/[0.03] rounded-full blur-[120px]" />
        </div>

        <div className="account-page-container relative z-10 max-w-[1280px] mx-auto px-8">
          {/* ═══════════════════ MOBILE NAV - Sadece mobilde görünür ═══════════════════ */}
          <nav className="account-mobile-nav">
            {MENU_ITEMS.map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={cn(
                  "account-mobile-nav-item",
                  activeTab === item.id && "active"
                )}
              >
                {item.label}
              </button>
            ))}
            {/* Çıkış Yap - Mobilde görünür */}
            <button
              onClick={handleLogout}
              className="account-mobile-nav-item account-mobile-logout"
            >
              <LogOut size={16} />
              <span>Çıkış</span>
            </button>
          </nav>
          
          <div className="account-page-layout flex gap-6" style={{ minHeight: `${CONTAINER_HEIGHT}px` }}>
            
            {/* ═══════════════════ LEFT SIDEBAR - Desktop'ta görünür ═══════════════════ */}
            <aside className="account-sidebar-desktop w-[300px] flex-shrink-0">
              <div 
                className="account-sidebar-card bg-background border border-border rounded-2xl overflow-hidden flex flex-col"
                style={{ height: `${CONTAINER_HEIGHT}px` }}
              >
                {/* User Info */}
                <div className="p-6 border-b border-border">
                  <div className="flex flex-col items-center text-center">
                    <div className="relative w-20 h-20 rounded-full bg-gradient-to-br from-emerald-500/20 to-cyan-500/10 flex items-center justify-center overflow-hidden mb-4 border-2 border-emerald-500/20">
                      {avatarUrl && (avatarUrl.startsWith("/") || avatarUrl.startsWith("http") || avatarUrl.startsWith("data:")) ? (
                        <Image src={avatarUrl} alt={user.name || "Profil"} fill sizes="96px" className="object-cover" />
                      ) : (
                        <User size={32} className="text-emerald-400" />
                      )}
                    </div>
                    <span className="text-[19px] font-semibold text-foreground truncate w-full block">{user.name || "Kullanıcı"}</span>
                    <p className="text-[15px] text-foreground-muted truncate w-full mt-0.5">{user.email}</p>
                  </div>
                </div>

                {/* Navigation */}
                <nav className="flex-1 py-2">
                  {MENU_ITEMS.map((item) => (
                    <button
                      key={item.id}
                      onClick={() => setActiveTab(item.id)}
                      className={cn(
                        "w-full flex items-center gap-4 px-6 py-3.5 text-left transition-all",
                        activeTab === item.id
                          ? "bg-emerald-500/[0.08] text-emerald-400 border-r-2 border-emerald-400"
                          : "text-foreground-muted hover:text-foreground hover:bg-foreground/[0.02]"
                      )}
                    >
                      <item.icon size={20} className={activeTab === item.id ? "text-emerald-400" : "text-foreground-muted"} />
                      <span className="text-[17px]">{item.label}</span>
                    </button>
                  ))}
                </nav>

                {/* Logout & Security */}
                <div className="mt-auto border-t border-border">
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-4 px-6 py-3.5 text-left text-red-400/60 hover:text-red-400 hover:bg-red-500/[0.03] transition-all"
                  >
                    <LogOut size={20} />
                    <span className="text-[17px]">Çıkış Yap</span>
                  </button>
                  <div className="flex items-center justify-center gap-2 py-3 text-foreground-muted border-t border-border">
                    <Shield size={14} />
                    <span className="text-[13px]">256-bit SSL güvenli bağlantı</span>
                  </div>
                </div>
              </div>
            </aside>

            {/* ═══════════════════ RIGHT CONTENT ═══════════════════ */}
            <main className="account-content-area flex-1 min-w-0">
              <div 
                className="account-content-card bg-background border border-border rounded-2xl p-6"
                style={{ height: `${CONTAINER_HEIGHT}px` }}
              >
                {activeTab === "pano" && <DashboardPane user={user} setActiveTab={setActiveTab} setExpandedOrderId={setExpandedOrderId} avatarUrl={avatarUrl} />}
                {activeTab === "siparisler" && <OrdersPane initialExpandedOrder={expandedOrderId} onExpandChange={setExpandedOrderId} />}
                {activeTab === "adresler" && <AddressesPane userName={user.name || undefined} />}
                {activeTab === "hesap" && <AccountPane user={user} avatarUrl={avatarUrl} setAvatarUrl={setAvatarUrl} showNotification={showNotification} onLogout={handleLogout} />}
                {activeTab === "favoriler" && <FavoritesPane />}
                
                {/* Global Notification */}
                {notification && (
                  <div className={`fixed bottom-6 right-6 z-50 flex items-center gap-3 px-4 py-3 rounded-xl shadow-lg border notification-toast ${
                    notification.type === "success" 
                      ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400" 
                      : "bg-red-500/10 border-red-500/30 text-red-400"
                  }`}>
                    {notification.type === "success" ? <CheckCircle size={18} /> : <AlertCircle size={18} />}
                    <span className="text-[14px] font-medium">{notification.message}</span>
                  </div>
                )}

                <style jsx global>{`
                  /* Light mode - page background */
                  .light .min-h-screen.bg-background {
                    background-color: #f8fafc !important;
                  }
                  /* Hide gradient background in light mode */
                  .light .fixed.inset-0.z-0 {
                    display: none !important;
                  }
                  .light .account-page-layout {
                    --background: #ffffff;
                    --foreground: #0f172a;
                    --foreground-secondary: #0f172a;
                    --foreground-tertiary: #0f172a;
                    --foreground-muted: #64748b;
                    --foreground-disabled: #94a3b8;
                  }
                  .light .account-page-layout .bg-background {
                    background-color: #ffffff !important;
                  }
                  .light .account-page-layout .bg-glass-bg {
                    background-color: #ffffff !important;
                  }
                  .light .account-page-layout .bg-glass-bg-hover {
                    background-color: #f8fafc !important;
                  }
                  .light .account-page-layout .light-white-card {
                    background-color: #ffffff !important;
                  }
                  .light .account-page-layout .account-sidebar-card,
                  .light .account-page-layout .account-content-card {
                    background-color: #ffffff !important;
                    border-color: #e2e8f0 !important;
                    border-radius: 16px !important;
                  }
                  .light .account-page-layout .text-foreground {
                    color: #0f172a !important;
                  }
                  .light .account-page-layout .text-foreground-secondary {
                    color: #0f172a !important;
                  }
                  .light .account-page-layout .text-foreground-muted {
                    color: #0f172a !important;
                  }
                  .light .account-page-layout .text-foreground-tertiary {
                    color: #0f172a !important;
                  }
                  .light .account-page-layout .text-foreground-disabled {
                    color: #9ca3af !important;
                  }
                  /* Status card backgrounds - white in light mode */
                  .light .account-page-layout .bg-emerald-500\/10 {
                    background-color: #ffffff !important;
                    border-color: #10b981 !important;
                  }
                  .light .account-page-layout .bg-amber-500\/10 {
                    background-color: #ffffff !important;
                    border-color: #f59e0b !important;
                  }
                  .light .account-page-layout .bg-red-500\/10 {
                    background-color: #ffffff !important;
                    border-color: #ef4444 !important;
                  }
                  .light .account-page-layout .bg-purple-500\/10 {
                    background-color: #ffffff !important;
                    border-color: #a855f7 !important;
                  }
                  /* Toast notification - white background in light mode */
                  .light .notification-toast.bg-emerald-500\/10 {
                    background-color: #ffffff !important;
                    border-color: #10b981 !important;
                  }
                  .light .notification-toast.bg-red-500\/10 {
                    background-color: #ffffff !important;
                    border-color: #ef4444 !important;
                  }
                  /* Modal success/error elements - white in light mode */
                  .light .account-page-layout .bg-emerald-500\/20 {
                    background-color: #d1fae5 !important;
                  }
                  .light .account-page-layout .bg-red-500\/20 {
                    background-color: #fee2e2 !important;
                  }
                  /* Sidebar and content card inner elements - white bg in light mode */
                  .light .account-page-layout .account-sidebar-card > *,
                  .light .account-page-layout .account-sidebar-card nav,
                  .light .account-page-layout .account-sidebar-card > div {
                    background-color: #ffffff !important;
                  }
                  /* Modal container - white background in light mode */
                  .light .modal-container {
                    background-color: #ffffff !important;
                  }
                  .light .modal-container .light-white-card {
                    background-color: #ffffff !important;
                  }
                `}</style>
              </div>
            </main>
          </div>
        </div>
      </div>
    );
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // LOGIN / REGISTER VIEW (Original Design with Inline Styles)
  // ═══════════════════════════════════════════════════════════════════════════
  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: 'var(--background)',
      paddingTop: '120px',
      paddingBottom: '80px',
    }}>
      {/* Background Gradient */}
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'radial-gradient(ellipse at top, rgba(16, 185, 129, 0.06) 0%, transparent 50%)',
        pointerEvents: 'none',
      }} />

      <div style={{
        maxWidth: '1000px',
        margin: '0 auto',
        padding: '0 24px',
        position: 'relative',
      }}>
        {/* Page Title */}
        <h1 style={{
          fontSize: '28px',
          fontWeight: '700',
          color: 'var(--foreground)',
          textAlign: 'center',
          marginBottom: '48px',
        }}>
          Hesabım
        </h1>

        {/* Two Column Layout */}
        <div 
          className="auth-forms-grid"
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(2, 1fr)',
            gap: '48px',
          }}
        >
          
          {/* LEFT - Giriş Yap */}
          <div 
            onClick={activateLogin}
            style={{
              backgroundColor: 'var(--surface-overlay)',
              border: activePanel === 'login'
                ? '1px solid rgba(16, 185, 129, 0.3)'
                : '1px solid var(--glass-border)',
              borderRadius: '24px',
              padding: '40px',
              opacity: activePanel === 'register' ? 0.4 : 1,
              transition: 'all 0.3s ease',
              cursor: activePanel === 'register' ? 'pointer' : 'default',
              transform: activePanel === 'login' ? 'scale(1.02)' : 'scale(1)',
              boxShadow: activePanel === 'login' ? '0 8px 32px rgba(16, 185, 129, 0.1)' : 'none',
            }}
          >
            <h2 style={{
              fontSize: '20px',
              fontWeight: '600',
              color: 'var(--foreground)',
              marginBottom: '32px',
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
            }}>
              Giriş Yap
              {activePanel === 'login' && (
                <span style={{
                  width: '8px',
                  height: '8px',
                  borderRadius: '50%',
                  backgroundColor: '#10B981',
                }}/>
              )}
            </h2>

            <form onSubmit={handleLogin}>
              {/* Error Message */}
              {loginError && (
                <div style={{
                  backgroundColor: 'rgba(239, 68, 68, 0.1)',
                  border: '1px solid rgba(239, 68, 68, 0.2)',
                  borderRadius: '12px',
                  padding: '12px 16px',
                  marginBottom: '20px',
                  fontSize: '13px',
                  color: '#EF4444',
                }}>
                  {loginError}
                </div>
              )}

              {/* Email */}
              <div style={{ marginBottom: '20px' }}>
                <label style={{
                  display: 'block',
                  fontSize: '13px',
                  fontWeight: '500',
                  color: 'var(--foreground-secondary)',
                  marginBottom: '8px',
                }}>
                  E-posta adresi <span style={{ color: '#EF4444' }}>*</span>
                </label>
                <input
                  type="email"
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                  onFocus={() => { setFocusedField('loginEmail'); activateLogin(); }}
                  onBlur={() => setFocusedField(null)}
                  required
                  disabled={activePanel === 'register' || loginLoading}
                  style={{
                    width: '100%',
                    height: '48px',
                    padding: '0 16px',
                    backgroundColor: 'var(--input-bg)',
                    border: focusedField === 'loginEmail'
                      ? '1px solid rgba(16, 185, 129, 0.5)'
                      : '1px solid var(--input-border)',
                    borderRadius: '12px',
                    fontSize: '14px',
                    color: 'var(--foreground)',
                    outline: 'none',
                    transition: 'all 0.2s ease',
                    cursor: activePanel === 'register' ? 'not-allowed' : 'text',
                  }}
                />
              </div>

              {/* Password */}
              <div style={{ marginBottom: '20px' }}>
                <label style={{
                  display: 'block',
                  fontSize: '13px',
                  fontWeight: '500',
                  color: 'var(--foreground-secondary)',
                  marginBottom: '8px',
                }}>
                  Parola <span style={{ color: '#EF4444' }}>*</span>
                </label>
                <div style={{ position: 'relative' }}>
                  <input
                    type={showPassword ? "text" : "password"}
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    onFocus={() => { setFocusedField('loginPassword'); activateLogin(); }}
                    onBlur={() => setFocusedField(null)}
                    required
                    disabled={activePanel === 'register' || loginLoading}
                    style={{
                      width: '100%',
                      height: '48px',
                      padding: '0 48px 0 16px',
                      backgroundColor: 'var(--input-bg)',
                      border: focusedField === 'loginPassword'
                        ? '1px solid rgba(16, 185, 129, 0.5)'
                        : '1px solid var(--input-border)',
                      borderRadius: '12px',
                      fontSize: '14px',
                      color: 'var(--foreground)',
                      outline: 'none',
                      transition: 'all 0.2s ease',
                      cursor: activePanel === 'register' ? 'not-allowed' : 'text',
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    disabled={activePanel === 'register'}
                    style={{
                      position: 'absolute',
                      right: '16px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      background: 'none',
                      border: 'none',
                      color: 'var(--foreground-muted)',
                      cursor: activePanel === 'register' ? 'not-allowed' : 'pointer',
                      padding: '4px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              {/* Remember Me & Forgot Password */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: '28px',
              }}>
                <label style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  cursor: activePanel === 'register' ? 'not-allowed' : 'pointer',
                  opacity: activePanel === 'register' ? 0.5 : 1,
                }}>
                  <div
                    onClick={() => { if (activePanel !== 'register') setRememberMe(!rememberMe); }}
                    style={{
                      width: '20px',
                      height: '20px',
                      borderRadius: '6px',
                      border: rememberMe ? '2px solid #10B981' : '2px solid var(--border-secondary)',
                      backgroundColor: rememberMe ? '#10B981' : 'transparent',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: activePanel === 'register' ? 'not-allowed' : 'pointer',
                      transition: 'all 0.2s ease',
                    }}
                  >
                    {rememberMe && <Check size={12} color="white" strokeWidth={3} />}
                  </div>
                  <span style={{ fontSize: '13px', color: 'var(--foreground-secondary)' }}>
                    Beni hatırla
                  </span>
                </label>
              </div>

              {/* Login Button */}
              <button
                type="submit"
                disabled={activePanel === 'register' || loginLoading}
                onMouseEnter={() => setLoginHover(true)}
                onMouseLeave={() => setLoginHover(false)}
                style={{
                  width: '100%',
                  height: '48px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  backgroundColor: activePanel === 'register' ? 'var(--btn-secondary-bg)' : (loginHover ? '#0ea371' : '#10B981'),
                  border: 'none',
                  borderRadius: '12px',
                  fontSize: '14px',
                  fontWeight: '600',
                  color: activePanel === 'register' ? 'var(--foreground-disabled)' : 'white',
                  cursor: activePanel === 'register' || loginLoading ? 'not-allowed' : 'pointer',
                  transition: 'all 0.2s ease',
                  marginBottom: '16px',
                }}
              >
                {loginLoading && <Loader2 size={18} className="animate-spin" />}
                {loginLoading ? 'Giriş yapılıyor...' : 'Giriş Yap'}
              </button>

              {/* Forgot Password Link */}
              <div style={{ textAlign: 'center' }}>
                <Link 
                  href="/sifremi-unuttum" 
                  style={{
                    fontSize: '13px',
                    color: '#10B981',
                    textDecoration: 'none',
                    pointerEvents: activePanel === 'register' ? 'none' : 'auto',
                    opacity: activePanel === 'register' ? 0.5 : 1,
                  }}
                >
                  Parolanızı mı unuttunuz?
                </Link>
              </div>

              {/* Divider */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '16px',
                margin: '24px 0',
              }}>
                <div style={{ flex: 1, height: '1px', backgroundColor: 'var(--border)' }} />
                <span style={{ fontSize: '12px', color: 'var(--foreground-muted)' }}>veya</span>
                <div style={{ flex: 1, height: '1px', backgroundColor: 'var(--border)' }} />
              </div>

              {/* Google Login */}
              <button
                type="button"
                onClick={handleGoogleLogin}
                disabled={activePanel === 'register'}
                onMouseEnter={() => setGoogleHover(true)}
                onMouseLeave={() => setGoogleHover(false)}
                style={{
                  width: '100%',
                  height: '48px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '12px',
                  backgroundColor: googleHover && activePanel !== 'register' ? 'var(--glass-bg-hover)' : 'var(--glass-bg)',
                  border: '1px solid var(--glass-border)',
                  borderRadius: '12px',
                  fontSize: '14px',
                  fontWeight: '500',
                  color: activePanel === 'register' ? 'var(--foreground-disabled)' : 'var(--foreground)',
                  cursor: activePanel === 'register' ? 'not-allowed' : 'pointer',
                  transition: 'all 0.2s ease',
                }}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" style={{ opacity: activePanel === 'register' ? 0.3 : 1 }}>
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                <span>Google ile Devam</span>
              </button>
            </form>
          </div>

          {/* RIGHT - Üye Ol */}
          <div 
            onClick={activateRegister}
            style={{
              backgroundColor: 'var(--surface-overlay)',
              border: activePanel === 'register'
                ? '1px solid rgba(16, 185, 129, 0.3)'
                : '1px solid var(--glass-border)',
              borderRadius: '24px',
              padding: '40px',
              opacity: activePanel === 'login' ? 0.7 : 1,
              transition: 'all 0.3s ease',
              cursor: activePanel === 'login' ? 'pointer' : 'default',
              transform: activePanel === 'register' ? 'scale(1.02)' : 'scale(1)',
              boxShadow: activePanel === 'register' ? '0 8px 32px rgba(16, 185, 129, 0.1)' : 'none',
            }}
          >
            <h2 style={{
              fontSize: '20px',
              fontWeight: '600',
              color: 'var(--foreground)',
              marginBottom: '32px',
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
            }}>
              {showActivation ? "Email Doğrulama" : "Üye Ol"}
              {activePanel === 'register' && (
                <span style={{
                  width: '8px',
                  height: '8px',
                  borderRadius: '50%',
                  backgroundColor: '#10B981',
                }}/>
              )}
            </h2>

            {/* Activation Code Form */}
            {showActivation ? (
              <div>
                {activationSuccess ? (
                  <div style={{
                    textAlign: 'center',
                    padding: '40px 20px',
                  }}>
                    <div style={{
                      width: '64px',
                      height: '64px',
                      borderRadius: '50%',
                      backgroundColor: 'rgba(16, 185, 129, 0.1)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      margin: '0 auto 20px',
                    }}>
                      <Check size={32} style={{ color: '#10B981' }} />
                    </div>
                    <h3 style={{ color: 'var(--foreground)', fontSize: '18px', fontWeight: '600', marginBottom: '8px' }}>
                      Email Doğrulandı!
                    </h3>
                    <p style={{ color: 'var(--foreground-muted)', fontSize: '14px' }}>
                      Hesabınıza yönlendiriliyorsunuz...
                    </p>
                  </div>
                ) : (
                  <form onSubmit={handleActivationSubmit}>
                    <p style={{
                      color: 'var(--foreground-secondary)',
                      fontSize: '14px',
                      marginBottom: '20px',
                      lineHeight: '1.6',
                    }}>
                      <strong style={{ color: '#10B981' }}>{activationEmail}</strong> adresine gönderilen 
                      <strong> F-XXXXXX</strong> formatındaki kodu girin.
                    </p>
                    
                    {/* Countdown Timer */}
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '8px',
                      marginBottom: '20px',
                      padding: '12px',
                      backgroundColor: countdown > 60 ? 'rgba(16, 185, 129, 0.1)' : 'rgba(245, 158, 11, 0.1)',
                      borderRadius: '8px',
                      border: `1px solid ${countdown > 60 ? 'rgba(16, 185, 129, 0.2)' : 'rgba(245, 158, 11, 0.2)'}`,
                    }}>
                      <span style={{ color: countdown > 60 ? '#10B981' : '#F59E0B', fontSize: '13px' }}>
                        ⏰ Kodun geçerlilik süresi: <strong>{formatCountdown(countdown)}</strong>
                      </span>
                    </div>

                    {activationError && (
                      <div style={{
                        backgroundColor: 'rgba(239, 68, 68, 0.1)',
                        border: '1px solid rgba(239, 68, 68, 0.2)',
                        borderRadius: '12px',
                        padding: '12px 16px',
                        marginBottom: '20px',
                        fontSize: '13px',
                        color: '#EF4444',
                      }}>
                        {activationError}
                      </div>
                    )}

                    {resendSuccess && (
                      <div style={{
                        backgroundColor: 'rgba(16, 185, 129, 0.1)',
                        border: '1px solid rgba(16, 185, 129, 0.2)',
                        borderRadius: '12px',
                        padding: '12px 16px',
                        marginBottom: '20px',
                        fontSize: '13px',
                        color: '#10B981',
                      }}>
                        ✅ Yeni kod gönderildi!
                      </div>
                    )}

                    {/* Activation Code Input */}
                    <div style={{ marginBottom: '20px' }}>
                      <label style={{
                        display: 'block',
                        fontSize: '13px',
                        fontWeight: '500',
                        color: 'var(--foreground-secondary)',
                        marginBottom: '8px',
                      }}>
                        Aktivasyon Kodu <span style={{ color: '#EF4444' }}>*</span>
                      </label>
                      <input
                        type="text"
                        value={activationCode}
                        onChange={(e) => setActivationCode(e.target.value.toUpperCase())}
                        placeholder="F-XXXXXX"
                        required
                        maxLength={8}
                        style={{
                          width: '100%',
                          height: '52px',
                          padding: '0 16px',
                          backgroundColor: 'var(--input-bg)',
                          border: '1px solid var(--input-border)',
                          borderRadius: '12px',
                          fontSize: '18px',
                          fontWeight: '600',
                          letterSpacing: '4px',
                          textAlign: 'center',
                          color: 'white',
                          outline: 'none',
                          transition: 'all 0.2s ease',
                        }}
                      />
                    </div>

                    {/* Submit Button */}
                    <button
                      type="submit"
                      disabled={activationLoading || countdown <= 0}
                      style={{
                        width: '100%',
                        height: '48px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '8px',
                        backgroundColor: countdown <= 0 ? 'var(--foreground-muted)' : '#10B981',
                        border: 'none',
                        borderRadius: '12px',
                        fontSize: '14px',
                        fontWeight: '600',
                        color: countdown <= 0 ? 'var(--foreground-muted)' : 'white',
                        cursor: activationLoading || countdown <= 0 ? 'not-allowed' : 'pointer',
                        transition: 'all 0.2s ease',
                        marginBottom: '16px',
                      }}
                    >
                      {activationLoading && <Loader2 size={18} className="animate-spin" />}
                      {activationLoading ? 'Doğrulanıyor...' : countdown <= 0 ? 'Süre Doldu' : 'Doğrula'}
                    </button>

                    {/* Resend Code Button - Sadece countdown süresi dolunca aktif */}
                    <button
                      type="button"
                      onClick={handleResendCode}
                      disabled={resendLoading || countdown > 0}
                      style={{
                        width: '100%',
                        height: '44px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '8px',
                        backgroundColor: 'transparent',
                        border: '1px solid var(--border)',
                        borderRadius: '12px',
                        fontSize: '13px',
                        color: countdown > 0 ? 'var(--foreground-muted)' : 'var(--foreground-secondary)',
                        cursor: resendLoading || countdown > 0 ? 'not-allowed' : 'pointer',
                        opacity: countdown > 0 ? 0.5 : 1,
                        transition: 'all 0.2s ease',
                      }}
                    >
                      {resendLoading && <Loader2 size={14} className="animate-spin" />}
                      {resendLoading ? 'Gönderiliyor...' : countdown > 0 ? `Tekrar gönder (${formatCountdown(countdown)})` : 'Kodu Tekrar Gönder'}
                    </button>
                  </form>
                )}
              </div>
            ) : (
            <form onSubmit={handleRegister}>
              {/* Error Message */}
              {registerError && (
                <div style={{
                  backgroundColor: 'rgba(239, 68, 68, 0.1)',
                  border: '1px solid rgba(239, 68, 68, 0.2)',
                  borderRadius: '12px',
                  padding: '12px 16px',
                  marginBottom: '20px',
                  fontSize: '13px',
                  color: '#EF4444',
                }}>
                  {registerError}
                </div>
              )}

              {/* Name */}
              <div style={{ marginBottom: '20px' }}>
                <label style={{
                  display: 'block',
                  fontSize: '13px',
                  fontWeight: '500',
                  color: 'var(--foreground-secondary)',
                  marginBottom: '8px',
                }}>
                  Ad Soyad
                </label>
                <input
                  type="text"
                  value={registerName}
                  onChange={(e) => setRegisterName(e.target.value)}
                  onFocus={() => { setFocusedField('registerName'); activateRegister(); }}
                  onBlur={() => setFocusedField(null)}
                  disabled={activePanel === 'login' || registerLoading}
                  placeholder="İsteğe bağlı"
                  style={{
                    width: '100%',
                    height: '48px',
                    padding: '0 16px',
                    backgroundColor: 'var(--input-bg)',
                    border: focusedField === 'registerName'
                      ? '1px solid rgba(16, 185, 129, 0.5)'
                      : '1px solid var(--input-border)',
                    borderRadius: '12px',
                    fontSize: '14px',
                    color: 'var(--foreground)',
                    outline: 'none',
                    transition: 'all 0.2s ease',
                    cursor: activePanel === 'login' ? 'not-allowed' : 'text',
                  }}
                />
              </div>

              {/* Email */}
              <div style={{ marginBottom: '20px' }}>
                <label style={{
                  display: 'block',
                  fontSize: '13px',
                  fontWeight: '500',
                  color: 'var(--foreground-secondary)',
                  marginBottom: '8px',
                }}>
                  E-posta adresi <span style={{ color: '#EF4444' }}>*</span>
                </label>
                <input
                  type="email"
                  value={registerEmail}
                  onChange={(e) => setRegisterEmail(e.target.value)}
                  onFocus={() => { setFocusedField('registerEmail'); activateRegister(); }}
                  onBlur={() => setFocusedField(null)}
                  required
                  disabled={activePanel === 'login' || registerLoading}
                  style={{
                    width: '100%',
                    height: '48px',
                    padding: '0 16px',
                    backgroundColor: 'var(--input-bg)',
                    border: focusedField === 'registerEmail'
                      ? '1px solid rgba(16, 185, 129, 0.5)'
                      : '1px solid var(--input-border)',
                    borderRadius: '12px',
                    fontSize: '14px',
                    color: 'var(--foreground)',
                    outline: 'none',
                    transition: 'all 0.2s ease',
                    cursor: activePanel === 'login' ? 'not-allowed' : 'text',
                  }}
                />
              </div>

              {/* Password */}
              <div style={{ marginBottom: '20px' }}>
                <label style={{
                  display: 'block',
                  fontSize: '13px',
                  fontWeight: '500',
                  color: 'var(--foreground-secondary)',
                  marginBottom: '8px',
                }}>
                  Parola <span style={{ color: '#EF4444' }}>*</span>
                </label>
                <div style={{ position: 'relative' }}>
                  <input
                    type={showRegisterPassword ? "text" : "password"}
                    value={registerPassword}
                    onChange={(e) => setRegisterPassword(e.target.value)}
                    onFocus={() => { setFocusedField('registerPassword'); activateRegister(); }}
                    onBlur={() => setFocusedField(null)}
                    required
                    disabled={activePanel === 'login' || registerLoading}
                    placeholder="En az 6 karakter"
                    style={{
                      width: '100%',
                      height: '48px',
                      padding: '0 48px 0 16px',
                      backgroundColor: 'var(--input-bg)',
                      border: focusedField === 'registerPassword'
                        ? '1px solid rgba(16, 185, 129, 0.5)'
                        : '1px solid var(--input-border)',
                      borderRadius: '12px',
                      fontSize: '14px',
                      color: 'var(--foreground)',
                      outline: 'none',
                      transition: 'all 0.2s ease',
                      cursor: activePanel === 'login' ? 'not-allowed' : 'text',
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowRegisterPassword(!showRegisterPassword)}
                    disabled={activePanel === 'login'}
                    style={{
                      position: 'absolute',
                      right: '16px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      background: 'none',
                      border: 'none',
                      color: 'var(--foreground-muted)',
                      cursor: activePanel === 'login' ? 'not-allowed' : 'pointer',
                      padding: '4px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    {showRegisterPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              {/* Newsletter Checkbox */}
              <label style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: '12px',
                cursor: activePanel === 'login' ? 'not-allowed' : 'pointer',
                marginBottom: '24px',
                opacity: activePanel === 'login' ? 0.5 : 1,
              }}>
                <div
                  onClick={() => { if (activePanel !== 'login') setNewsletter(!newsletter); }}
                  style={{
                    width: '20px',
                    height: '20px',
                    borderRadius: '6px',
                    border: newsletter ? '2px solid #10B981' : '2px solid var(--border)',
                    backgroundColor: newsletter ? '#10B981' : 'transparent',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                    marginTop: '2px',
                    cursor: activePanel === 'login' ? 'not-allowed' : 'pointer',
                    transition: 'all 0.2s ease',
                  }}
                >
                  {newsletter && <Check size={12} color="white" strokeWidth={3} />}
                </div>
                <span style={{ fontSize: '13px', color: 'var(--foreground-secondary)', lineHeight: '1.5' }}>
                  Haber bültenimize abone olun (isteğe bağlı)
                </span>
              </label>

              {/* Privacy Text */}
              <p style={{
                fontSize: '12px',
                color: 'var(--foreground-muted)',
                lineHeight: '1.7',
                marginBottom: '28px',
                padding: '16px',
                backgroundColor: 'var(--glass-bg)',
                borderRadius: '10px',
                border: '1px solid var(--glass-border)',
              }}>
                Kişisel verileriniz, bu web sitesi boyunca deneyiminizi desteklemek, hesabınıza erişimi yönetmek ve diğer amaçlar için kullanılacaktır. Daha fazla bilgi için{' '}
                <Link href="/gizlilik-politikasi" style={{ color: '#10B981', textDecoration: 'none' }}>
                  gizlilik politikamızı
                </Link>
                {' '}inceleyebilirsiniz.
              </p>

              {/* Register Button */}
              <button
                type="submit"
                disabled={activePanel === 'login' || registerLoading}
                onMouseEnter={() => setRegisterHover(true)}
                onMouseLeave={() => setRegisterHover(false)}
                style={{
                  width: '100%',
                  height: '48px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  backgroundColor: activePanel === 'login' ? 'var(--btn-ghost-hover)' : (registerHover ? '#0ea371' : '#10B981'),
                  border: 'none',
                  borderRadius: '12px',
                  fontSize: '14px',
                  fontWeight: '600',
                  color: activePanel === 'login' ? 'var(--foreground-muted)' : 'white',
                  cursor: activePanel === 'login' || registerLoading ? 'not-allowed' : 'pointer',
                  transition: 'all 0.2s ease',
                  marginBottom: '20px',
                }}
              >
                {registerLoading && <Loader2 size={18} className="animate-spin" />}
                {registerLoading ? 'Kayıt yapılıyor...' : 'Üye Ol'}
              </button>

            </form>
            )}
          </div>
        </div>

        {/* Security Badge */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '8px',
          marginTop: '40px',
        }}>
          <Shield size={14} style={{ color: 'var(--foreground-muted)' }} />
          <span style={{ fontSize: '11px', color: 'var(--foreground-muted)' }}>
            256-bit SSL ile güvenli bağlantı
          </span>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// DASHBOARD PANES - Minimal TSParticle Style
// ═══════════════════════════════════════════════════════════════════════════

function DashboardPane({ user, setActiveTab, setExpandedOrderId, avatarUrl }: { user: UserType; setActiveTab: (tab: DashboardTab) => void; setExpandedOrderId: (id: string | null) => void; avatarUrl?: string | null }) {
  const { itemCount: favoriteCount } = useFavorites();
  const { itemCount: cartCount } = useCart();
  const [orderCount, setOrderCount] = useState(0);
  const [addressCount, setAddressCount] = useState(0);
  const [recentOrders, setRecentOrders] = useState<OrderType[]>([]);
  const [loadingStats, setLoadingStats] = useState(true);

  // Fetch stats on mount
  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [ordersRes, addressesRes] = await Promise.all([
          fetch("/api/orders"),
          fetch("/api/user/addresses"),
        ]);
        
        if (ordersRes.ok) {
          const orders = await ordersRes.json();
          setOrderCount(orders.length);
          setRecentOrders(orders.slice(0, 3)); // Son 3 sipariş
        }
        
        if (addressesRes.ok) {
          const data = await addressesRes.json();
          setAddressCount(data.addresses?.length || 0);
        }
      } catch (e) {
        console.error("Failed to fetch stats:", e);
      } finally {
        setLoadingStats(false);
      }
    };
    
    fetchStats();
  }, []);

  const stats = {
    orders: orderCount,
    addresses: addressCount,
    favorites: favoriteCount,
    cartItems: cartCount,
  };

  // Status config for recent orders
  const statusConfig: Record<string, { label: string; color: string; bgColor: string }> = {
    PENDING: { label: "Bekliyor", color: "text-amber-400", bgColor: "bg-amber-500/10" },
    PROCESSING: { label: "Hazırlanıyor", color: "text-blue-400", bgColor: "bg-blue-500/10" },
    SHIPPED: { label: "Kargoda", color: "text-purple-400", bgColor: "bg-purple-500/10" },
    DELIVERED: { label: "Teslim", color: "text-emerald-400", bgColor: "bg-emerald-500/10" },
    CANCELLED: { label: "İptal", color: "text-red-400", bgColor: "bg-red-500/10" },
    REFUNDED: { label: "İade", color: "text-gray-400", bgColor: "bg-gray-500/10" },
  };

  // Check if valid avatar URL
  const isValidAvatar = avatarUrl && (avatarUrl.startsWith("/") || avatarUrl.startsWith("http") || avatarUrl.startsWith("data:"));

  return (
    <div className="h-full flex flex-col">
      {/* Welcome - with profile picture on mobile */}
      <div className="pb-5 border-b border-border">
        <div className="flex items-center gap-4">
          {/* Profile Picture - Only visible on mobile (lg:hidden) */}
          <div className="lg:hidden relative w-20 h-20 rounded-full bg-gradient-to-br from-emerald-500/20 to-cyan-500/10 flex items-center justify-center overflow-hidden border-2 border-emerald-500/20 flex-shrink-0">
            {isValidAvatar ? (
              <Image src={avatarUrl} alt={user.name || "Profil"} fill sizes="96px" className="object-cover" />
            ) : (
              <User size={28} className="text-emerald-400" />
            )}
          </div>
          <div>
            <span className="text-[18px] font-medium text-foreground block mb-1">
              Merhaba, {user.name || "Kullanıcı"} 👋
            </span>
            <p className="text-[15px] text-foreground-muted">
              Hesap panonuzdan siparişlerinizi, adreslerinizi ve hesap ayarlarınızı yönetebilirsiniz.
            </p>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 py-6">
        {[
          { label: "Siparişler", value: stats.orders, tab: "siparisler" as DashboardTab },
          { label: "Adresler", value: stats.addresses, tab: "adresler" as DashboardTab },
          { label: "Favoriler", value: stats.favorites, tab: "favoriler" as DashboardTab },
          { label: "Sepet", value: stats.cartItems, tab: null },
        ].map((stat) => (
          <button
            key={stat.label}
            onClick={() => stat.tab && setActiveTab(stat.tab)}
            className={cn(
              "bg-foreground/[0.02] border border-border rounded-xl p-5 text-center transition-all",
              stat.tab && "hover:bg-foreground/[0.04] hover:border-border-hover cursor-pointer"
            )}
          >
            <div className="text-[24px] font-semibold text-foreground mb-1">
              {loadingStats ? <span className="inline-block w-6 h-6 bg-foreground/10 rounded animate-pulse" /> : stat.value}
            </div>
            <div className="text-[13px] text-foreground-muted uppercase tracking-wide">{stat.label}</div>
          </button>
        ))}
      </div>

      {/* Recent Orders */}
      <div className="flex-1 flex flex-col min-h-0">
        <div className="flex items-center justify-between mb-3">
          <span className="text-[15px] font-medium text-foreground-tertiary">Son Siparişler</span>
          {recentOrders.length > 0 && (
            <button
              onClick={() => setActiveTab("siparisler")}
              className="text-[12px] text-emerald-400 hover:text-emerald-300 transition-colors"
            >
              Tümünü Gör →
            </button>
          )}
        </div>
        
        {loadingStats ? (
          <div className="flex-1 flex items-center justify-center">
            <Loader2 size={24} className="animate-spin text-foreground-muted" />
          </div>
        ) : recentOrders.length > 0 ? (
          <div className="space-y-2 overflow-y-auto">
            {recentOrders.map((order: OrderType) => {
              const config = statusConfig[order.status] || statusConfig.PENDING;
              return (
                <button
                  key={order.id}
                  onClick={() => {
                    setExpandedOrderId(order.id);
                    setActiveTab("siparisler");
                  }}
                  className="w-full flex items-center gap-4 p-3 bg-foreground/[0.02] border border-border rounded-xl hover:bg-foreground/[0.04] hover:border-border-hover transition-all text-left"
                >
                  <div className={`w-10 h-10 rounded-lg ${config.bgColor} flex items-center justify-center flex-shrink-0`}>
                    <Package size={18} className={config.color} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="order-number-text text-[13px] font-mono text-foreground">#{order.orderNumber}</span>
                      <span className={`text-[10px] px-1.5 py-0.5 rounded ${config.bgColor} ${config.color}`}>
                        {config.label}
                      </span>
                    </div>
                    <p className="text-[11px] text-foreground-muted">
                      {new Date(order.createdAt).toLocaleDateString("tr-TR")} • {order.items?.length || 0} ürün
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="text-[14px] font-medium text-foreground">
                      {new Intl.NumberFormat("tr-TR", { style: "currency", currency: "TRY" }).format(order.grandTotal ?? order.total ?? 0)}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        ) : (
          <div className="flex-1 flex items-center justify-center text-center border border-dashed border-border rounded-xl bg-foreground/[0.01]">
            <div>
              <Package size={36} className="mx-auto mb-4 text-foreground-disabled" />
              <p className="text-[15px] text-foreground-muted mb-5">Henüz siparişiniz yok</p>
              <Link href="/magaza" className="inline-flex items-center gap-2 px-4 py-2.5 bg-emerald-500/10 border border-emerald-500/20 text-foreground rounded-lg text-[15px] font-medium hover:bg-emerald-500/25 hover:border-emerald-500/30 transition-all">
                Alışverişe Başla
                <ChevronRight size={14} />
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// ORDER TYPES & CONSTANTS
// ═══════════════════════════════════════════════════════════════════════════

interface OrderItem {
  id: string;
  productId: string;
  quantity: number;
  price: number;
  subtotal: number;
  variantInfo: { id?: string; name?: string; value?: string } | null;
  product: {
    id: string;
    name: string;
    slug: string;
    thumbnail: string | null;
    images: string[];
  };
}

interface OrderAddress {
  id: string;
  title?: string;
  firstName?: string;
  lastName?: string;
  fullName?: string;
  phone: string;
  city: string;
  district?: string;
  address?: string;
  addressLine1?: string;
  postalCode?: string;
}

interface StatusHistoryItem {
  type?: string;
  status?: string;
  date?: string;
  note?: string;
  contracts?: {
    termsAndConditions?: boolean;
    distanceSalesContract?: boolean;
    newsletter?: boolean;
    acceptedAt?: string;
    termsAndConditionsHTML?: string;
    distanceSalesContractHTML?: string;
  };
}

interface Order {
  id: string;
  orderNumber: string;
  status: "PENDING" | "PROCESSING" | "SHIPPED" | "DELIVERED" | "CANCELLED" | "REFUNDED";
  paymentStatus: "PENDING" | "PAID" | "FAILED" | "REFUNDED";
  paymentMethod: string | null;
  subtotal: number;
  shippingCost: number;
  discount: number;
  tax: number;
  total: number;
  trackingNumber: string | null;
  carrierName: string | null;
  invoiceUrl: string | null;
  invoiceUploadedAt: string | null;
  createdAt: string;
  paidAt: string | null;
  confirmedAt: string | null;
  preparingAt: string | null;
  shippedAt: string | null;
  deliveredAt: string | null;
  cancelledAt: string | null;
  items: OrderItem[];
  shippingAddress: OrderAddress | null;
  billingAddress: OrderAddress | null;
  customerNote: string | null;
  statusHistory?: StatusHistoryItem[];
}

// Durum konfigürasyonları
const ORDER_STATUS_CONFIG: Record<string, { label: string; color: string; bgColor: string; icon: React.ComponentType<{ size?: number; className?: string }> }> = {
  PENDING: { 
    label: "Onay Bekliyor", 
    color: "text-amber-400", 
    bgColor: "bg-amber-500/10 border-amber-500/20",
    icon: Clock 
  },
  PROCESSING: { 
    label: "Hazırlanıyor", 
    color: "text-blue-400", 
    bgColor: "bg-blue-500/10 border-blue-500/20",
    icon: Package 
  },
  SHIPPED: { 
    label: "Kargoda", 
    color: "text-purple-400", 
    bgColor: "bg-purple-500/10 border-purple-500/20",
    icon: Truck 
  },
  DELIVERED: { 
    label: "Teslim Edildi", 
    color: "text-emerald-400", 
    bgColor: "bg-emerald-500/10 border-emerald-500/20",
    icon: CheckCircle 
  },
  CANCELLED: { 
    label: "İptal Edildi", 
    color: "text-red-400", 
    bgColor: "bg-red-500/10 border-red-500/20",
    icon: XCircle 
  },
  REFUNDED: { 
    label: "İade Edildi", 
    color: "text-gray-400", 
    bgColor: "bg-gray-500/10 border-gray-500/20",
    icon: RefreshCw 
  },
};

const PAYMENT_STATUS_CONFIG: Record<string, { label: string; color: string }> = {
  PENDING: { label: "Ödeme Bekleniyor", color: "text-amber-400" },
  PAID: { label: "Ödendi", color: "text-emerald-400" },
  FAILED: { label: "Ödeme Başarısız", color: "text-red-400" },
  REFUNDED: { label: "İade Edildi", color: "text-gray-400" },
};

// Fiyat formatlama
const formatPrice = (price: number) => {
  return new Intl.NumberFormat("tr-TR", {
    style: "currency",
    currency: "TRY",
    minimumFractionDigits: 2,
  }).format(price);
};

// Tarih formatlama
const formatDate = (dateString: string | null) => {
  if (!dateString) return "-";
  return new Date(dateString).toLocaleDateString("tr-TR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

// ═══════════════════════════════════════════════════════════════════════════
// ORDERS PANE COMPONENT
// ═══════════════════════════════════════════════════════════════════════════

interface OrdersPaneProps {
  initialExpandedOrder?: string | null;
  onExpandChange?: (orderId: string | null) => void;
}

function OrdersPane({ initialExpandedOrder, onExpandChange }: OrdersPaneProps) {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedOrder, setExpandedOrder] = useState<string | null>(initialExpandedOrder || null);
  const [copiedTracking, setCopiedTracking] = useState<string | null>(null);
  
  // Search & Filter state
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  
  // Cancel/Return Request state
  const [cancelModalOrder, setCancelModalOrder] = useState<Order | null>(null);
  const [returnModalOrder, setReturnModalOrder] = useState<Order | null>(null);
  const [cancelLoading, setCancelLoading] = useState(false);
  const [returnLoading, setReturnLoading] = useState(false);
  const [returnReason, setReturnReason] = useState<string>("");
  const [returnDescription, setReturnDescription] = useState("");
  const [returnImages, setReturnImages] = useState<File[]>([]);
  const [returnImagePreviews, setReturnImagePreviews] = useState<string[]>([]);
  const [requestError, setRequestError] = useState<string | null>(null);
  const [requestSuccess, setRequestSuccess] = useState<string | null>(null);
  
  // Request status cache (to avoid re-fetching)
  const [requestStatusCache, setRequestStatusCache] = useState<Record<string, {
    hasCancellationRequest?: boolean;
    hasReturnRequest?: boolean;
    cancellationStatus?: string;
    cancellationAdminNote?: string;
    returnStatus?: string;
    returnAdminNote?: string;
    returnAddress?: string;
    returnInstructions?: string;
  }>>({});
  
  // Filtered orders
  const filteredOrders = orders.filter(order => {
    // Search filter
    const matchesSearch = searchTerm === "" || 
      order.orderNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.items.some(item => 
        item.product?.name?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    
    // Status filter
    const matchesStatus = statusFilter === "all" || order.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  // Sync with parent's initialExpandedOrder
  useEffect(() => {
    if (initialExpandedOrder) {
      setExpandedOrder(initialExpandedOrder);
    }
  }, [initialExpandedOrder]);

  // Siparişleri API'den çek
  useEffect(() => {
    fetchOrders();
  }, []);

  // Auto-refresh every 30 seconds (when tab is visible)
  useEffect(() => {
    let intervalId: NodeJS.Timeout;

    const startPolling = () => {
      intervalId = setInterval(() => {
        // Only refresh if document is visible
        if (!document.hidden) {
          fetchOrdersSilent();
        }
      }, 30000); // 30 seconds
    };

    const handleVisibilityChange = () => {
      if (!document.hidden) {
        // Refresh immediately when tab becomes visible
        fetchOrdersSilent();
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    startPolling();

    return () => {
      clearInterval(intervalId);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, []);

  // Silent fetch (doesn't show loading state)
  const fetchOrdersSilent = async () => {
    try {
      const res = await fetch("/api/orders");
      if (res.ok) {
        const data = await res.json();
        setOrders(data);

        if (expandedOrder) {
          const expanded = data.find((order: Order) => order.id === expandedOrder);
          if (expanded) {
            fetchRequestStatus(expanded.orderNumber, true);
          }
        }
      }
    } catch {
      // Silently fail
    }
  };

  const fetchOrders = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/orders");
      if (!res.ok) {
        throw new Error("Siparişler alınamadı");
      }
      const data = await res.json();
      setOrders(data);

      if (expandedOrder) {
        const expanded = data.find((order: Order) => order.id === expandedOrder);
        if (expanded) {
          fetchRequestStatus(expanded.orderNumber, true);
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Bir hata oluştu");
    } finally {
      setLoading(false);
    }
  };

  // Kargo takip numarasını kopyala
  const copyTrackingNumber = (trackingNumber: string) => {
    navigator.clipboard.writeText(trackingNumber);
    setCopiedTracking(trackingNumber);
    setTimeout(() => setCopiedTracking(null), 2000);
  };

  // Sipariş kartını aç/kapa
  const toggleOrder = (orderId: string, orderNumber: string) => {
    const newExpanded = expandedOrder === orderId ? null : orderId;
    setExpandedOrder(newExpanded);
    onExpandChange?.(newExpanded);
    
    // Fetch request status when expanding
    if (newExpanded) {
      fetchRequestStatus(orderNumber);
    }
  };
  
  // Fetch request status for an order
  const fetchRequestStatus = async (orderNumber: string, forceRefresh = false) => {
    if (requestStatusCache[orderNumber] && !forceRefresh) return;
    
    try {
      const [cancelRes, returnRes] = await Promise.all([
        fetch(`/api/orders/${orderNumber}/cancel-request`),
        fetch(`/api/orders/${orderNumber}/return-request`),
      ]);
      
      const cancelData = cancelRes.ok ? await cancelRes.json() : {};
      const returnData = returnRes.ok ? await returnRes.json() : {};
      
      const latestReturn = returnData.returnRequests?.[0];
      
      setRequestStatusCache(prev => ({
        ...prev,
        [orderNumber]: {
          hasCancellationRequest: cancelData.hasCancellationRequest,
          hasReturnRequest: returnData.hasReturnRequest,
          cancellationStatus: cancelData.cancellationRequest?.status,
          cancellationAdminNote: cancelData.cancellationRequest?.adminNote,
          returnStatus: latestReturn?.status,
          returnAdminNote: latestReturn?.adminNote,
          returnAddress: latestReturn?.returnAddress,
          returnInstructions: latestReturn?.returnInstructions,
        },
      }));
    } catch (e) {
      console.error("Failed to fetch request status:", e);
    }
  };
  
  // Handle cancel request submission
  const handleCancelRequest = async () => {
    if (!cancelModalOrder) return;
    
    setCancelLoading(true);
    setRequestError(null);
    
    try {
      const res = await fetch(`/api/orders/${cancelModalOrder.orderNumber}/cancel-request`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });
      
      const data = await res.json();
      
      if (!res.ok) {
        setRequestError(data.error || "İptal talebi oluşturulamadı");
        return;
      }
      
      setRequestSuccess(data.message);
      setRequestStatusCache(prev => ({
        ...prev,
        [cancelModalOrder.orderNumber]: {
          ...prev[cancelModalOrder.orderNumber],
          hasCancellationRequest: true,
          cancellationStatus: "PENDING_ADMIN_APPROVAL",
        },
      }));
      
      setTimeout(() => {
        setCancelModalOrder(null);
        setRequestSuccess(null);
      }, 3000);
    } catch (e) {
      setRequestError("Bir hata oluştu. Lütfen tekrar deneyiniz.");
    } finally {
      setCancelLoading(false);
    }
  };
  
  // Handle return request submission
  const handleReturnRequest = async () => {
    if (!returnModalOrder) return;
    
    if (!returnReason) {
      setRequestError("Lütfen bir iade sebebi seçiniz");
      return;
    }
    
    setReturnLoading(true);
    setRequestError(null);
    
    try {
      // Use FormData to support file uploads
      const formData = new FormData();
      formData.append("reason", returnReason);
      if (returnDescription.trim()) {
        formData.append("description", returnDescription.trim());
      }
      
      // Append images
      returnImages.forEach((file) => {
        formData.append("images", file);
      });
      
      const res = await fetch(`/api/orders/${returnModalOrder.orderNumber}/return-request`, {
        method: "POST",
        body: formData,
      });
      
      const data = await res.json();
      
      if (!res.ok) {
        setRequestError(data.error || "İade talebi oluşturulamadı");
        return;
      }
      
      setRequestSuccess(data.message);
      setRequestStatusCache(prev => ({
        ...prev,
        [returnModalOrder.orderNumber]: {
          ...prev[returnModalOrder.orderNumber],
          hasReturnRequest: true,
          returnStatus: "PENDING_ADMIN_APPROVAL",
        },
      }));
      
      setTimeout(() => {
        setReturnModalOrder(null);
        setRequestSuccess(null);
        setReturnReason("");
        setReturnDescription("");
        setReturnImages([]);
        setReturnImagePreviews([]);
      }, 3000);
    } catch (e) {
      setRequestError("Bir hata oluştu. Lütfen tekrar deneyiniz.");
    } finally {
      setReturnLoading(false);
    }
  };
  
  // Handle image selection for return request
  const handleReturnImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    
    const newFiles = Array.from(files);
    const totalFiles = returnImages.length + newFiles.length;
    
    if (totalFiles > 3) {
      setRequestError("En fazla 3 görsel yükleyebilirsiniz");
      return;
    }
    
    // Validate file types and sizes
    for (const file of newFiles) {
      if (!["image/jpeg", "image/jpg", "image/png", "image/webp"].includes(file.type)) {
        setRequestError("Sadece JPEG, PNG ve WebP formatları desteklenir");
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        setRequestError("Her görsel 5MB'dan küçük olmalıdır");
        return;
      }
    }
    
    setRequestError(null);
    setReturnImages(prev => [...prev, ...newFiles]);
    
    // Create previews
    newFiles.forEach(file => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setReturnImagePreviews(prev => [...prev, reader.result as string]);
      };
      reader.readAsDataURL(file);
    });
  };
  
  // Remove return image
  const removeReturnImage = (index: number) => {
    setReturnImages(prev => prev.filter((_, i) => i !== index));
    setReturnImagePreviews(prev => prev.filter((_, i) => i !== index));
  };
  
  // Check if order can be cancelled
  const canCancelOrder = (order: Order) => {
    const nonCancellableStatuses = ["SHIPPED", "DELIVERED", "CANCELLED", "REFUNDED"];
    return !nonCancellableStatuses.includes(order.status);
  };
  
  // Check if order can be returned
  const canReturnOrder = (order: Order) => {
    const returnableStatuses = ["SHIPPED", "DELIVERED"];
    return returnableStatuses.includes(order.status);
  };
  
  // Close modals
  const closeModals = () => {
    setCancelModalOrder(null);
    setReturnModalOrder(null);
    setRequestError(null);
    setRequestSuccess(null);
    setReturnReason("");
    setReturnDescription("");
    setReturnImages([]);
    setReturnImagePreviews([]);
  };

  // Loading State
  if (loading) {
    return (
      <div className="h-full flex flex-col">
        <div className="flex items-center justify-between pb-4 border-b border-border">
          <span className="text-[17px] font-medium text-foreground">Siparişlerim</span>
        </div>
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <Loader2 size={32} className="animate-spin text-emerald-500 mx-auto mb-3" />
            <p className="text-[14px] text-foreground-muted">Siparişler yükleniyor...</p>
          </div>
        </div>
      </div>
    );
  }

  // Error State
  if (error) {
    return (
      <div className="h-full flex flex-col">
        <div className="flex items-center justify-between pb-4 border-b border-border">
          <span className="text-[17px] font-medium text-foreground">Siparişlerim</span>
        </div>
        <div className="flex-1 flex flex-col items-center justify-center text-center">
          <div className="w-14 h-14 rounded-xl bg-red-500/10 flex items-center justify-center mb-4">
            <AlertCircle size={24} className="text-red-400" />
          </div>
          <p className="text-[16px] text-foreground-tertiary mb-1">{error}</p>
          <button
            onClick={fetchOrders}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-emerald-500/10 border border-emerald-500/20 text-foreground rounded-lg text-[15px] font-medium hover:bg-emerald-500/25 hover:border-emerald-500/30 transition-all mt-4"
          >
            <RefreshCw size={14} />
            Tekrar Dene
          </button>
        </div>
      </div>
    );
  }

  // Empty State
  if (orders.length === 0) {
    return (
      <div className="h-full flex flex-col">
        <div className="flex items-center justify-between pb-4 border-b border-border">
          <span className="text-[17px] font-medium text-foreground">Siparişlerim</span>
        </div>
        <div className="flex-1 flex flex-col items-center justify-center text-center pt-8">
          <div className="w-14 h-14 rounded-xl bg-glass-bg flex items-center justify-center mb-4">
            <Package size={24} className="text-foreground-disabled" />
          </div>
          <p className="text-[16px] text-foreground-tertiary mb-1">Henüz siparişiniz yok</p>
          <p className="text-[15px] text-foreground-muted mb-5">İlk siparişinizi vermek için mağazayı ziyaret edin</p>
          <Link 
            href="/magaza"
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-emerald-500/10 border border-emerald-500/20 text-foreground rounded-lg text-[15px] font-medium hover:bg-emerald-500/25 hover:border-emerald-500/30 transition-all"
          >
            Mağazaya Git
            <ChevronRight size={14} />
          </Link>
        </div>
      </div>
    );
  }

  // Orders List
  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-border">
        <div className="flex items-center gap-3">
          <span className="text-[17px] font-medium text-foreground">Siparişlerim</span>
          <span className="text-[12px] px-2 py-0.5 rounded-full bg-glass-bg-hover text-foreground-tertiary">
            {filteredOrders.length}/{orders.length} sipariş
          </span>
        </div>
        <button
          onClick={fetchOrders}
          className="p-2 rounded-lg hover:bg-glass-bg-hover transition-colors"
          title="Yenile"
        >
          <RefreshCw size={16} className="text-foreground-muted" />
        </button>
      </div>

      {/* Search & Filter Bar */}
      <div className="flex items-center gap-3 py-3 border-b border-border">
        {/* Search Input */}
        <div className="flex-1 relative">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Sipariş no veya ürün ara..."
            className="w-full h-9 pl-9 pr-3 rounded-lg bg-glass-bg border border-border text-[13px] text-foreground placeholder:text-foreground-muted focus:outline-none focus:border-emerald-500/30 focus:bg-glass-bg-hover transition-all"
          />
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-foreground-muted" />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm("")}
              className="absolute right-2 top-1/2 -translate-y-1/2 p-1 rounded hover:bg-glass-bg-hover transition-colors"
            >
              <XCircle size={14} className="text-foreground-muted" />
            </button>
          )}
        </div>
        
        {/* Status Filter */}
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="h-9 px-3 pr-8 rounded-lg bg-glass-bg border border-border text-[13px] text-foreground appearance-none cursor-pointer focus:outline-none focus:border-emerald-500/30 transition-all"
          style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='rgba(255,255,255,0.4)' stroke-width='2'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 8px center' }}
        >
          <option value="all">Tüm Durumlar</option>
          <option value="PENDING">Beklemede</option>
          <option value="PROCESSING">Hazırlanıyor</option>
          <option value="SHIPPED">Kargoda</option>
          <option value="DELIVERED">Teslim Edildi</option>
          <option value="CANCELLED">İptal</option>
          <option value="REFUNDED">İade</option>
        </select>
      </div>

      {/* No Results */}
      {filteredOrders.length === 0 && orders.length > 0 && (
        <div className="flex-1 flex flex-col items-center justify-center text-center py-8">
          <Search size={32} className="text-foreground/15 mb-3" />
          <p className="text-[14px] text-foreground-tertiary mb-1">Sonuç bulunamadı</p>
          <p className="text-[13px] text-foreground-muted mb-4">Arama kriterlerinizi değiştirin</p>
          <button
            onClick={() => { setSearchTerm(""); setStatusFilter("all"); }}
            className="text-[13px] text-emerald-400 hover:text-emerald-300 transition-colors"
          >
            Filtreleri Temizle
          </button>
        </div>
      )}

      {/* Orders List */}
      <div className="flex-1 overflow-y-auto pt-4 space-y-3">
        {filteredOrders.map((order) => {
          const statusConfig = ORDER_STATUS_CONFIG[order.status];
          const paymentConfig = PAYMENT_STATUS_CONFIG[order.paymentStatus];
          const isExpanded = expandedOrder === order.id;
          const StatusIcon = statusConfig?.icon || Package;

          return (
            <div
              key={order.id}
              className="bg-glass-bg border border-border rounded-xl overflow-hidden hover:border-border-hover transition-all"
            >
              {/* Order Header - Always Visible */}
              <button
                onClick={() => toggleOrder(order.id, order.orderNumber)}
                className="order-card-header w-full p-4 flex items-center gap-4 text-left relative"
              >
                {/* Status Icon */}
                <div className={`order-status-icon w-10 h-10 rounded-lg ${statusConfig?.bgColor || 'bg-glass-bg-hover'} border flex items-center justify-center flex-shrink-0`}>
                  <StatusIcon size={18} className={statusConfig?.color || 'text-foreground-muted'} />
                </div>

                {/* Order Info */}
                <div className="order-info flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="order-number-text text-[14px] font-mono font-medium text-foreground">
                      #{order.orderNumber}
                    </span>
                    <span className={`text-[11px] px-2 py-0.5 rounded-full ${statusConfig?.bgColor || 'bg-glass-bg-hover'} border ${statusConfig?.color || 'text-foreground-tertiary'}`}>
                      {statusConfig?.label || order.status}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 text-[12px] text-foreground-muted">
                    <span>{formatDate(order.createdAt)}</span>
                    <span>•</span>
                    <span>{order.items.length} ürün</span>
                    <span>•</span>
                    <span className={paymentConfig?.color || 'text-foreground-muted'}>
                      {paymentConfig?.label || order.paymentStatus}
                    </span>
                  </div>
                </div>

                {/* Total & Expand */}
                <div className="order-total text-right flex-shrink-0">
                  <p className="text-[16px] font-semibold text-foreground mb-1">
                    {formatPrice(order.total)}
                  </p>
                  {isExpanded ? (
                    <ChevronUp size={16} className="text-foreground-muted ml-auto" />
                  ) : (
                    <ChevronDown size={16} className="text-foreground-muted ml-auto" />
                  )}
                </div>
              </button>

              {/* Expanded Content */}
              {isExpanded && (
                <div className="order-expanded-content border-t border-border p-4 space-y-4">
                  {/* Progress Timeline */}
                  <div className="order-timeline-container">
                  <div className="order-timeline flex items-center justify-between px-2">
                    {(() => {
                      // Eğer sipariş teslim edildiyse, tüm önceki adımlar da tamamlanmış demektir
                      const isDelivered = !!order.deliveredAt || order.status === "DELIVERED";
                      const isShipped = isDelivered || !!order.shippedAt || order.status === "SHIPPED";
                      const isPreparing = isShipped || !!order.preparingAt || order.status === "PROCESSING";
                      const isPaid = isPreparing || !!order.paidAt;
                      
                      return [
                        { key: "created", label: "Sipariş", date: order.createdAt, done: true },
                        { key: "paid", label: "Ödeme", date: order.paidAt, done: isPaid },
                        { key: "preparing", label: "Hazırlanıyor", date: order.preparingAt, done: isPreparing },
                        { key: "shipped", label: "Kargoda", date: order.shippedAt, done: isShipped },
                        { key: "delivered", label: "Teslim", date: order.deliveredAt, done: isDelivered },
                      ];
                    })().map((step, index, arr) => (
                      <div key={step.key} className={`order-timeline-step flex items-center ${step.done ? 'step-done' : ''}`}>
                        <div className="order-step-content flex flex-col items-center min-w-[60px]">
                          <div className={`order-step-icon w-7 h-7 rounded-full flex items-center justify-center transition-all ${
                            step.done
                              ? 'bg-emerald-500/20 border-2 border-emerald-500/50 shadow-[0_0_10px_rgba(16,185,129,0.3)]'
                              : 'bg-glass-bg border border-border'
                          }`}>
                            {step.done ? (
                              <Check size={14} className="text-emerald-400" />
                            ) : (
                              <div className="w-2 h-2 rounded-full bg-foreground-muted" />
                            )}
                          </div>
                          <span className={`order-step-label text-[11px] mt-1.5 font-medium ${step.done ? 'text-foreground/70' : 'text-foreground-muted'}`}>
                            {step.label}
                          </span>
                          {step.done && step.date && (
                            <span className="order-step-date text-[9px] text-foreground-muted mt-0.5">
                              {new Date(step.date).toLocaleDateString("tr-TR", { day: "numeric", month: "short" })}
                            </span>
                          )}
                        </div>
                        {index < arr.length - 1 && (
                          <div className={`order-step-connector flex-1 h-0.5 mx-1 min-w-[20px] transition-all ${
                            arr[index + 1].done ? 'bg-gradient-to-r from-emerald-500/50 to-emerald-500/30' : 'bg-glass-bg'
                          }`} />
                        )}
                      </div>
                    ))}
                  </div>
                  </div>

                  {/* Cancelled/Refunded Notice */}
                  {(order.status === "CANCELLED" || order.status === "REFUNDED") && (
                    <div className={`p-3 rounded-lg ${ORDER_STATUS_CONFIG[order.status].bgColor} border`}>
                      <p className={`text-[13px] ${ORDER_STATUS_CONFIG[order.status].color}`}>
                        {order.status === "CANCELLED" 
                          ? `Sipariş ${formatDate(order.cancelledAt)} tarihinde iptal edildi.`
                          : `Sipariş iade edildi.`
                        }
                      </p>
                    </div>
                  )}

                  {/* Order Items */}
                  <div className="space-y-2">
                    <p className="text-[12px] text-foreground-muted uppercase tracking-wide">Ürünler</p>
                    {order.items.map((item) => (
                      <div
                        key={item.id}
                        className="flex items-start gap-2 sm:gap-3 p-2 bg-glass-bg rounded-lg"
                      >
                        <div className="w-10 h-10 sm:w-12 sm:h-12 bg-glass-bg rounded-lg overflow-hidden relative flex-shrink-0">
                          {item.product.thumbnail || item.product.images[0] ? (
                            <Image
                              src={item.product.thumbnail || item.product.images[0]}
                              alt={item.product.name}
                              fill
                              sizes="48px"
                              className="object-contain p-1"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <Package size={16} className="text-foreground-disabled" />
                            </div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <Link
                            href={`/urun/${item.product.slug}`}
                            className="text-[13px] text-foreground hover:text-emerald-400 transition-colors line-clamp-1"
                          >
                            {item.product.name}
                          </Link>
                          {item.variantInfo && (
                            <p className="text-[11px] text-foreground-muted">
                              {item.variantInfo.name}: {item.variantInfo.value}
                            </p>
                          )}
                          <p className="text-[11px] text-foreground-muted">
                            {formatPrice(item.price)} × {item.quantity}
                          </p>
                        </div>
                        <span className="text-[13px] font-medium text-foreground">
                          {formatPrice(item.subtotal)}
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* Order Summary */}
                  <div className="bg-glass-bg rounded-lg p-3 space-y-2">
                    <div className="flex justify-between text-[12px]">
                      <span className="text-foreground-muted">Ara Toplam</span>
                      <span className="text-foreground-secondary">{formatPrice(order.subtotal)}</span>
                    </div>
                    <div className="flex justify-between text-[12px]">
                      <span className="text-foreground-muted">Kargo</span>
                      <span className={order.shippingCost === 0 ? 'text-emerald-400' : 'text-foreground-secondary'}>
                        {order.shippingCost === 0 ? 'Ücretsiz' : formatPrice(order.shippingCost)}
                      </span>
                    </div>
                    {order.discount > 0 && (
                      <div className="flex justify-between text-[12px]">
                        <span className="text-foreground-muted">İndirim</span>
                        <span className="text-emerald-400">-{formatPrice(order.discount)}</span>
                      </div>
                    )}
                    <div className="flex justify-between text-[14px] pt-2 border-t border-border">
                      <div>
                        <span className="font-medium text-foreground">Toplam</span>
                        <span className="text-[10px] text-foreground-muted ml-1">(KDV dahil)</span>
                      </div>
                      <span className="font-semibold text-foreground">{formatPrice(order.total)}</span>
                    </div>
                  </div>

                  {/* Shipping & Tracking */}
                  {order.status === "SHIPPED" && order.trackingNumber && (
                    <div className="bg-purple-500/10 border border-purple-500/20 rounded-lg p-3">
                      <p className="text-[12px] text-purple-400 mb-2 flex items-center gap-2">
                        <Truck size={14} />
                        Kargo Takip
                      </p>
                      <div className="flex items-center justify-between mb-3">
                        <div>
                          {order.carrierName && (
                            <p className="text-[12px] text-foreground-tertiary mb-1">{order.carrierName}</p>
                          )}
                          <p className="text-[14px] font-mono text-foreground">{order.trackingNumber}</p>
                        </div>
                        <button
                          onClick={() => copyTrackingNumber(order.trackingNumber!)}
                          className="p-2 rounded-lg bg-glass-bg-hover hover:bg-glass-bg-hover transition-colors"
                          title="Takip numarasını kopyala"
                        >
                          {copiedTracking === order.trackingNumber ? (
                            <Check size={14} className="text-emerald-400" />
                          ) : (
                            <Copy size={14} className="text-foreground-muted" />
                          )}
                        </button>
                      </div>
                      {/* Kargo Takip Linki */}
                      {order.carrierName && getTrackingUrl(order.carrierName, order.trackingNumber) ? (
                        <a
                          href={getTrackingUrl(order.carrierName, order.trackingNumber)!}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-purple-500/20 border border-purple-500/30 text-purple-300 rounded-lg text-[13px] font-medium hover:bg-purple-500/30 transition-all"
                        >
                          <ExternalLink size={14} />
                          Kargoyu Takip Et
                        </a>
                      ) : (
                        <p className="text-[11px] text-foreground-muted text-center">
                          Kargo firması sitesinden takip edebilirsiniz
                        </p>
                      )}
                    </div>
                  )}

                  {/* Invoice Section */}
                  <div className="flex items-center justify-between p-3 bg-glass-bg rounded-lg">
                    <div className="flex items-center gap-2">
                      <FileText size={16} className="text-foreground-muted flex-shrink-0" />
                      <span className="text-[13px] text-foreground-secondary">Fatura</span>
                    </div>
                    {order.invoiceUrl ? (
                      <a
                        href={order.invoiceUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 px-3 py-1.5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-lg text-[12px] font-medium hover:bg-emerald-500/20 transition-all"
                      >
                        <FileText size={12} />
                        Faturayı İndir
                        <ExternalLink size={10} />
                      </a>
                    ) : order.status === "DELIVERED" ? (
                      <span className="inline-flex items-center gap-1.5 text-[11px] sm:text-[12px] text-amber-400">
                        <Clock size={12} className="flex-shrink-0" />
                        <span>Hazır Olduğunda İndirebilirsiniz</span>
                      </span>
                    ) : (
                      <span className="text-[12px] text-foreground-muted">-</span>
                    )}
                  </div>


                  {/* Shipping Address */}
                  {order.shippingAddress && (
                    <div className="p-3 bg-glass-bg rounded-lg">
                      <p className="text-[12px] text-foreground-muted mb-2 flex items-center gap-2">
                        <MapPin size={12} />
                        Teslimat Adresi
                      </p>
                      <p className="text-[13px] text-foreground/70">
                        {order.shippingAddress.fullName || `${order.shippingAddress.firstName || ''} ${order.shippingAddress.lastName || ''}`.trim()}
                      </p>
                      <p className="text-[12px] text-foreground-tertiary">
                        {order.shippingAddress.address || order.shippingAddress.addressLine1}
                      </p>
                      <p className="text-[12px] text-foreground-tertiary">
                        {order.shippingAddress.district && `${order.shippingAddress.district}, `}
                        {order.shippingAddress.city}
                        {order.shippingAddress.postalCode && ` ${order.shippingAddress.postalCode}`}
                      </p>
                      <p className="text-[12px] text-foreground-muted mt-1">{order.shippingAddress.phone}</p>
                    </div>
                  )}

                  {/* Customer Note */}
                  {order.customerNote && (
                    <div className="p-3 bg-glass-bg rounded-lg">
                      <p className="text-[12px] text-foreground-muted mb-1">Sipariş Notu</p>
                      <p className="text-[13px] text-foreground-secondary italic">&quot;{order.customerNote}&quot;</p>
                    </div>
                  )}
                  
                  {/* Request Status Cards & Buttons */}
                  <div className="pt-3 border-t border-border space-y-3">
                    {/* Cancellation Request Status */}
                    {requestStatusCache[order.orderNumber]?.cancellationStatus === "PENDING_ADMIN_APPROVAL" && (
                      <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-lg">
                        <div className="flex items-start gap-2">
                          <Clock size={16} className="text-amber-400 flex-shrink-0 mt-0.5" />
                          <div>
                            <p className="text-[13px] font-medium text-amber-400">İptal Talebi Beklemede</p>
                            <p className="text-[12px] text-amber-400/80 mt-1">İptal talebiniz mağaza onayı bekliyor.</p>
                          </div>
                        </div>
                      </div>
                    )}
                    
                    {requestStatusCache[order.orderNumber]?.cancellationStatus === "APPROVED" && (
                      <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-lg">
                        <div className="flex items-start gap-2">
                          <CheckCircle size={16} className="text-emerald-400 flex-shrink-0 mt-0.5" />
                          <div>
                            <p className="text-[13px] font-medium text-emerald-400">İptal Onaylandı</p>
                            <p className="text-[12px] text-emerald-400/80 mt-1">Siparişiniz iptal edildi. Ödemeniz iade edilecektir.</p>
                          </div>
                        </div>
                      </div>
                    )}
                    
                    {requestStatusCache[order.orderNumber]?.cancellationStatus === "REJECTED" && (
                      <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
                        <div className="flex items-start gap-2">
                          <XCircle size={16} className="text-red-400 flex-shrink-0 mt-0.5" />
                          <div>
                            <p className="text-[13px] font-medium text-red-400">İptal Reddedildi</p>
                            {requestStatusCache[order.orderNumber]?.cancellationAdminNote && (
                              <p className="text-[12px] text-red-400/80 mt-1">
                                Sebep: {requestStatusCache[order.orderNumber]?.cancellationAdminNote}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    )}
                    
                    {/* Return Request Status */}
                    {requestStatusCache[order.orderNumber]?.returnStatus === "PENDING_ADMIN_APPROVAL" && (
                      <div className="p-3 bg-purple-500/10 border border-purple-500/20 rounded-lg">
                        <div className="flex items-start gap-2">
                          <Clock size={16} className="text-purple-400 flex-shrink-0 mt-0.5" />
                          <div>
                            <p className="text-[13px] font-medium text-purple-400">İade Talebi Beklemede</p>
                            <p className="text-[12px] text-purple-400/80 mt-1">İade talebiniz mağaza onayı bekliyor.</p>
                          </div>
                        </div>
                      </div>
                    )}
                    
                    {requestStatusCache[order.orderNumber]?.returnStatus === "APPROVED" && (
                      <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-lg space-y-3">
                        <div className="flex items-start gap-2">
                          <CheckCircle size={16} className="text-emerald-400 flex-shrink-0 mt-0.5" />
                          <p className="text-[13px] font-medium text-emerald-400">İadeniz Onaylandı</p>
                        </div>
                        
                        {requestStatusCache[order.orderNumber]?.returnAddress && (
                          <div className="p-3 bg-glass-bg rounded-lg">
                            <p className="text-[11px] text-foreground-muted mb-1 flex items-center gap-1">
                              <MapPin size={10} />
                              İade Adresi
                            </p>
                            <p className="text-[12px] text-foreground whitespace-pre-line">
                              {requestStatusCache[order.orderNumber]?.returnAddress}
                            </p>
                          </div>
                        )}
                        
                        <div className="p-3 bg-glass-bg rounded-lg light-white-card">
                          <p className="text-[11px] text-amber-400 mb-2 flex items-center gap-1 font-medium">
                            <AlertCircle size={10} />
                            Önemli Bilgiler
                          </p>
                          <ul className="text-[12px] text-foreground-secondary space-y-1">
                            <li className="flex items-start gap-2">
                              <span className="text-amber-400">•</span>
                              Lütfen Ürünü Orijinal Kutusuyla Gönderin
                            </li>
                          </ul>
                          {requestStatusCache[order.orderNumber]?.returnInstructions && (
                            <p className="text-[12px] text-foreground-secondary mt-2 pt-2 border-t border-amber-500/10">
                              {requestStatusCache[order.orderNumber]?.returnInstructions}
                            </p>
                          )}
                        </div>
                      </div>
                    )}
                    
                    {requestStatusCache[order.orderNumber]?.returnStatus === "REJECTED" && (
                      <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
                        <div className="flex items-start gap-2">
                          <XCircle size={16} className="text-red-400 flex-shrink-0 mt-0.5" />
                          <div>
                            <p className="text-[13px] font-medium text-red-400">İade Reddedildi</p>
                            {requestStatusCache[order.orderNumber]?.returnAdminNote && (
                              <p className="text-[12px] text-red-400/80 mt-1">
                                Sebep: {requestStatusCache[order.orderNumber]?.returnAdminNote}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    )}
                    
                    {/* Action Buttons - Only show if order is not cancelled/refunded */}
                    {order.status !== "CANCELLED" && order.status !== "REFUNDED" && (
                      <>
                        {/* Info message for shipped orders */}
                        {order.status === "SHIPPED" && !requestStatusCache[order.orderNumber]?.hasReturnRequest && (
                          <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-lg">
                            <p className="text-[12px] text-amber-400 flex items-start gap-2">
                              <AlertCircle size={14} className="flex-shrink-0 mt-0.5" />
                              <span>Ürününüz kargolandı. Bu aşamada iptal sağlayamamaktayız. İade talebiniz olursa lütfen iade işlemlerini başlatınız.</span>
                            </p>
                          </div>
                        )}
                        
                        <div className="flex flex-col sm:flex-row gap-2">
                          {/* Cancel Button */}
                          {canCancelOrder(order) && !requestStatusCache[order.orderNumber]?.hasCancellationRequest && (
                            <button
                              onClick={() => {
                                fetchRequestStatus(order.orderNumber);
                                setCancelModalOrder(order);
                              }}
                              className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-red-500/10 border border-red-500/20 text-red-400 rounded-lg text-[13px] font-medium hover:bg-red-500/20 hover:border-red-500/30 transition-all"
                            >
                              <XCircle size={14} />
                              Siparişi İptal Et
                            </button>
                          )}
                          
                          {/* Return Button */}
                          {canReturnOrder(order) && !requestStatusCache[order.orderNumber]?.hasReturnRequest && (
                            <button
                              onClick={() => {
                                fetchRequestStatus(order.orderNumber);
                                setReturnModalOrder(order);
                              }}
                              className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-purple-500/10 border border-purple-500/20 text-purple-400 rounded-lg text-[13px] font-medium hover:bg-purple-500/20 hover:border-purple-500/30 transition-all"
                            >
                              <RefreshCw size={14} />
                              İade Talebi Oluştur
                            </button>
                          )}
                        </div>
                      </>
                    )}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
      
      {/* Cancel Request Modal */}
      {cancelModalOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <div 
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={closeModals}
          />
          
          {/* Modal Content */}
          <div className="relative w-full max-w-md bg-[var(--bg-secondary)] border border-border rounded-2xl shadow-2xl overflow-hidden light-white-card modal-container">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-border">
              <h3 className="text-[16px] font-semibold text-foreground">Sipariş İptali</h3>
              <button
                onClick={closeModals}
                className="p-1.5 rounded-lg hover:bg-glass-bg-hover transition-colors"
              >
                <X size={18} className="text-foreground-muted" />
              </button>
            </div>
            
            {/* Body */}
            <div className="p-4 space-y-4">
              {requestSuccess ? (
                <div className="text-center py-4 light-white-card">
                  <div className="w-14 h-14 mx-auto mb-4 rounded-full bg-emerald-500/20 flex items-center justify-center">
                    <Check size={28} className="text-emerald-400" />
                  </div>
                  <p className="text-[14px] text-foreground">{requestSuccess}</p>
                </div>
              ) : (
                <>
                  <div className="p-3 bg-glass-bg rounded-lg">
                    <p className="text-[12px] text-foreground-muted mb-1">Sipariş No</p>
                    <p className="text-[14px] font-mono text-foreground">#{cancelModalOrder.orderNumber}</p>
                  </div>
                  
                  <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-lg light-white-card">
                    <p className="text-[13px] text-amber-400">
                      <strong>Uyarı:</strong> İptal talebiniz mağaza onayına gönderilecektir. Onay sonrası ödemeniz iade edilecektir.
                    </p>
                  </div>
                  
                  <p className="text-[14px] text-foreground-secondary text-center">
                    Bu siparişi iptal etmek istediğinize emin misiniz?
                  </p>
                  
                  {requestError && (
                    <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
                      <p className="text-[13px] text-red-400">{requestError}</p>
                    </div>
                  )}
                </>
              )}
            </div>
            
            {/* Footer */}
            {!requestSuccess && (
              <div className="flex gap-3 p-4 border-t border-border">
                <button
                  onClick={closeModals}
                  className="flex-1 px-4 py-2.5 bg-glass-bg border border-border text-foreground rounded-lg text-[14px] font-medium hover:bg-glass-bg-hover transition-all"
                >
                  Vazgeç
                </button>
                <button
                  onClick={handleCancelRequest}
                  disabled={cancelLoading}
                  className="flex-1 px-4 py-2.5 bg-red-500/20 border border-red-500/30 text-red-400 rounded-lg text-[14px] font-medium hover:bg-red-500/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {cancelLoading ? (
                    <>
                      <Loader2 size={16} className="animate-spin" />
                      İşleniyor...
                    </>
                  ) : (
                    "Evet, İptal Et"
                  )}
                </button>
              </div>
            )}
          </div>
        </div>
      )}
      
      {/* Return Request Modal */}
      {returnModalOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <div 
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={closeModals}
          />
          
          {/* Modal Content */}
          <div className="relative w-full max-w-md bg-[var(--bg-secondary)] border border-border rounded-2xl shadow-2xl overflow-hidden light-white-card modal-container">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-border">
              <h3 className="text-[16px] font-semibold text-foreground">İade Talebi</h3>
              <button
                onClick={closeModals}
                className="p-1.5 rounded-lg hover:bg-glass-bg-hover transition-colors"
              >
                <X size={18} className="text-foreground-muted" />
              </button>
            </div>
            
            {/* Body */}
            <div className="p-4 space-y-4">
              {requestSuccess ? (
                <div className="text-center py-4 light-white-card">
                  <div className="w-14 h-14 mx-auto mb-4 rounded-full bg-emerald-500/20 flex items-center justify-center">
                    <Check size={28} className="text-emerald-400" />
                  </div>
                  <p className="text-[14px] text-foreground">{requestSuccess}</p>
                </div>
              ) : (
                <>
                  <div className="p-3 bg-glass-bg rounded-lg">
                    <p className="text-[12px] text-foreground-muted mb-1">Sipariş No</p>
                    <p className="text-[14px] font-mono text-foreground">#{returnModalOrder.orderNumber}</p>
                  </div>
                  
                  {/* Return Reason Select */}
                  <div>
                    <label className="block text-[13px] text-foreground-secondary mb-2">
                      İade Sebebi <span className="text-red-400">*</span>
                    </label>
                    <select
                      value={returnReason}
                      onChange={(e) => setReturnReason(e.target.value)}
                      className="w-full h-11 px-3 rounded-lg bg-glass-bg border border-border text-[14px] text-foreground appearance-none cursor-pointer focus:outline-none focus:border-purple-500/50 transition-all"
                      style={{ 
                        backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='rgba(255,255,255,0.4)' stroke-width='2'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E")`, 
                        backgroundRepeat: 'no-repeat', 
                        backgroundPosition: 'right 12px center' 
                      }}
                    >
                      <option value="">Seçiniz...</option>
                      <option value="DAMAGED">Ürün Hasarlı Geldi</option>
                      <option value="WRONG_PRODUCT">Ürün Yanlış Gönderildi</option>
                      <option value="SPECS_MISMATCH">Teknik Özellikler Siparişimle Uyuşmamaktadır</option>
                    </select>
                  </div>
                  
                  {/* Description (optional) */}
                  <div>
                    <label className="block text-[13px] text-foreground-secondary mb-2">
                      Açıklama <span className="text-foreground-muted">(İsteğe bağlı)</span>
                    </label>
                    <textarea
                      value={returnDescription}
                      onChange={(e) => setReturnDescription(e.target.value)}
                      placeholder="Lütfen iade sebebinizi açıklayınız..."
                      rows={3}
                      className="w-full px-3 py-2.5 rounded-lg bg-glass-bg border border-border text-[14px] text-foreground placeholder:text-foreground-muted focus:outline-none focus:border-purple-500/50 transition-all resize-none"
                    />
                  </div>
                  
                  {/* Image Upload */}
                  <div>
                    <label className="block text-[13px] text-foreground-secondary mb-2">
                      Ürün Görselleri <span className="text-foreground-muted">(İsteğe bağlı, max 3)</span>
                    </label>
                    
                    {/* Image Previews */}
                    {returnImagePreviews.length > 0 && (
                      <div className="flex flex-wrap gap-2 mb-3">
                        {returnImagePreviews.map((preview, index) => (
                          <div key={index} className="relative group">
                            <img
                              src={preview}
                              alt={`Görsel ${index + 1}`}
                              className="w-20 h-20 object-cover rounded-lg border border-border"
                            />
                            <button
                              type="button"
                              onClick={() => removeReturnImage(index)}
                              className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center text-white text-xs opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                              <X size={12} />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                    
                    {/* Upload Button */}
                    {returnImages.length < 3 && (
                      <label className="flex items-center justify-center gap-2 px-4 py-3 bg-glass-bg border border-dashed border-border rounded-lg cursor-pointer hover:border-purple-500/50 hover:bg-glass-bg-hover transition-all">
                        <Camera size={18} className="text-foreground-muted" />
                        <span className="text-[13px] text-foreground-muted">
                          Görsel Ekle ({returnImages.length}/3)
                        </span>
                        <input
                          type="file"
                          accept="image/jpeg,image/jpg,image/png,image/webp"
                          multiple
                          onChange={handleReturnImageSelect}
                          className="hidden"
                        />
                      </label>
                    )}
                    <p className="text-[11px] text-foreground-muted mt-2">
                      Ürünün durumunu gösteren görseller yükleyebilirsiniz
                    </p>
                  </div>
                  
                  {requestError && (
                    <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
                      <p className="text-[13px] text-red-400">{requestError}</p>
                    </div>
                  )}
                </>
              )}
            </div>
            
            {/* Footer */}
            {!requestSuccess && (
              <div className="flex gap-3 p-4 border-t border-border">
                <button
                  onClick={closeModals}
                  className="flex-1 px-4 py-2.5 bg-glass-bg border border-border text-foreground rounded-lg text-[14px] font-medium hover:bg-glass-bg-hover transition-all"
                >
                  Vazgeç
                </button>
                <button
                  onClick={handleReturnRequest}
                  disabled={returnLoading || !returnReason}
                  className="flex-1 px-4 py-2.5 bg-purple-500/20 border border-purple-500/30 text-purple-400 rounded-lg text-[14px] font-medium hover:bg-purple-500/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {returnLoading ? (
                    <>
                      <Loader2 size={16} className="animate-spin" />
                      İşleniyor...
                    </>
                  ) : (
                    "Talep Oluştur"
                  )}
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

interface AddressData {
  id: string;
  title: string;
  phone: string;
  city: string;
  district: string;
  address: string;
  isDefault: boolean;
}

function AddressesPane({ userName }: { userName?: string }) {
  const [showForm, setShowForm] = useState(false);
  const [addresses, setAddresses] = useState<AddressData[]>([]);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    phone: "",
    city: "",
    district: "",
    address: "",
    isDefault: false,
  });
  const [editingId, setEditingId] = useState<string | null>(null);

  const fetchAddresses = async () => {
    try {
      const res = await fetch("/api/user/addresses");
      if (res.ok) {
        const data = await res.json();
        setAddresses(data.addresses || []);
      }
    } catch (e) {
      console.error("Failed to fetch addresses:", e);
    }
  };

  // Fetch addresses on mount
  useEffect(() => {
    queueMicrotask(() => {
      fetchAddresses();
    });
  }, []);

  const districts = formData.city ? getDistricts(formData.city) : [];

  const handleCityChange = (city: string) => {
    setFormData({ ...formData, city, district: "" });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      if (editingId) {
        // Update existing address
        const res = await fetch(`/api/user/addresses/${editingId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
        });
        if (res.ok) {
          await fetchAddresses();
          setEditingId(null);
        }
      } else {
        // Create new address
        const res = await fetch("/api/user/addresses", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
        });
        if (res.ok) {
          await fetchAddresses();
          setFormData({ title: "", phone: "", city: "", district: "", address: "", isDefault: false });
          setShowForm(false);
        } else {
          const data = await res.json();
          alert(data.error || "Adres eklenirken bir hata oluştu");
          return;
        }
      }
      setFormData({ title: "", phone: "", city: "", district: "", address: "", isDefault: false });
      setShowForm(false);
    } catch (e) {
      console.error("Failed to save address:", e);
      alert("Adres kaydedilemedi. Lütfen tekrar deneyin.");
    }
    setLoading(false);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Bu adresi silmek istediğinize emin misiniz?")) return;

    try {
      const res = await fetch(`/api/user/addresses/${id}`, { method: "DELETE" });
      if (res.ok) {
        await fetchAddresses();
      }
    } catch (e) {
      console.error("Failed to delete address:", e);
    }
  };

  const handleSetDefault = async (id: string) => {
    try {
      const res = await fetch(`/api/user/addresses/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isDefault: true }),
      });
      if (res.ok) {
        await fetchAddresses();
      }
    } catch (e) {
      console.error("Failed to set default address:", e);
    }
  };

  const handleEdit = (address: typeof addresses[0]) => {
    setFormData({
      title: address.title,
      phone: address.phone,
      city: address.city,
      district: address.district,
      address: address.address,
      isDefault: address.isDefault,
    });
    setEditingId(address.id);
    setShowForm(true);
  };

  const handleCancelEdit = () => {
    setFormData({ title: "", phone: "", city: "", district: "", address: "", isDefault: false });
    setEditingId(null);
    setShowForm(false);
  };

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-border">
        <span className="text-[17px] font-medium text-foreground">Adreslerim</span>
        {showForm && (
          <button 
            onClick={handleCancelEdit}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-glass-bg border border-border-hover text-foreground rounded-lg text-[15px] font-medium hover:bg-glass-bg-hover transition-all"
          >
            <X size={14} />
            İptal
          </button>
        )}
      </div>

      {/* Address Form */}
      {showForm && (
        <form onSubmit={handleSubmit} className="bg-glass-bg rounded-lg p-4 space-y-3 border border-border">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-[10px] text-foreground-muted uppercase tracking-wide">Adres Başlığı</label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="Ev, İş vb."
                required
                className="w-full mt-1 h-9 px-3 bg-glass-bg border border-border rounded-lg text-[12px] text-foreground placeholder:text-foreground-disabled outline-none focus:border-emerald-500/40"
              />
            </div>
            <div>
              <label className="text-[10px] text-foreground-muted uppercase tracking-wide">Telefon</label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="05XX XXX XX XX"
                required
                className="w-full mt-1 h-9 px-3 bg-glass-bg border border-border rounded-lg text-[12px] text-foreground placeholder:text-foreground-disabled outline-none focus:border-emerald-500/40"
              />
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-[10px] text-foreground-muted uppercase tracking-wide">İl</label>
              <select
                value={formData.city}
                onChange={(e) => handleCityChange(e.target.value)}
                required
                className="w-full mt-1 h-9 px-3 bg-background border border-border rounded-lg text-[12px] text-foreground outline-none focus:border-emerald-500/40 appearance-none cursor-pointer"
              >
                <option value="">İl Seçin</option>
                {CITIES.map(city => (
                  <option key={city} value={city}>{city}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-[10px] text-foreground-muted uppercase tracking-wide">İlçe</label>
              <select
                value={formData.district}
                onChange={(e) => setFormData({ ...formData, district: e.target.value })}
                required
                disabled={!formData.city}
                className="w-full mt-1 h-9 px-3 bg-background border border-border rounded-lg text-[12px] text-foreground outline-none focus:border-emerald-500/40 appearance-none cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <option value="">{formData.city ? "İlçe Seçin" : "Önce il seçin"}</option>
                {districts.map(district => (
                  <option key={district} value={district}>{district}</option>
                ))}
              </select>
            </div>
          </div>
          <div>
            <label className="text-[10px] text-foreground-muted uppercase tracking-wide">Açık Adres</label>
            <textarea
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              rows={2}
              required
              placeholder="Mahalle, sokak, bina no, daire no..."
              className="w-full mt-1 px-3 py-2 bg-glass-bg border border-border rounded-lg text-[12px] text-foreground placeholder:text-foreground-disabled outline-none focus:border-emerald-500/40 resize-none"
            />
          </div>
          <div className="flex items-center justify-between pt-2">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.isDefault}
                onChange={(e) => setFormData({ ...formData, isDefault: e.target.checked })}
                className="w-4 h-4 rounded border-border bg-glass-bg text-emerald-500 focus:ring-emerald-500/20"
              />
              <span className="text-[11px] text-foreground-tertiary">Varsayılan adres</span>
            </label>
            <button
              type="submit"
              disabled={loading}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-emerald-500/10 border border-emerald-500/20 text-foreground rounded-lg text-[15px] font-medium hover:bg-emerald-500/25 hover:border-emerald-500/30 transition-all disabled:opacity-50"
            >
              {loading ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
              {loading ? "Kaydediliyor..." : editingId ? "Güncelle" : "Kaydet"}
            </button>
          </div>
        </form>
      )}

      {/* Content */}
      <div className="flex-1 pt-4 overflow-y-auto">
        {addresses.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {addresses.map((addr) => (
              <div key={addr.id} className="bg-glass-bg border border-border rounded-lg p-4 flex flex-col">
                <div className="flex items-start justify-between mb-3">
                  <span className="text-[14px] font-medium text-foreground">{addr.title}</span>
                  {addr.isDefault && (
                    <span className="text-[10px] px-2 py-0.5 bg-emerald-500/20 text-emerald-400 rounded">
                      Varsayılan
                    </span>
                  )}
                </div>
                <div className="space-y-1 mb-4 flex-1">
                  <p className="text-[13px] text-foreground/70">{userName}</p>
                  <p className="text-[12px] text-foreground-tertiary leading-relaxed">{addr.address}</p>
                  <p className="text-[12px] text-foreground-tertiary">{addr.district}, {addr.city}</p>
                  <p className="text-[12px] text-foreground-tertiary">{addr.phone}</p>
                </div>
                <div className="flex flex-col gap-2 pt-3 border-t border-border">
                  {!addr.isDefault && (
                    <button
                      onClick={() => handleSetDefault(addr.id)}
                      className="w-full inline-flex items-center justify-center gap-2 px-4 py-2 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-lg text-[13px] font-medium hover:bg-emerald-500/25 hover:border-emerald-500/30 transition-all"
                    >
                      <Star size={14} />
                      Varsayılan Yap
                    </button>
                  )}
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleEdit(addr)}
                      className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-emerald-500/10 border border-emerald-500/20 text-foreground rounded-lg text-[13px] font-medium hover:bg-emerald-500/25 hover:border-emerald-500/30 transition-all"
                    >
                      <Edit2 size={14} />
                      Düzenle
                    </button>
                    <button
                      onClick={() => handleDelete(addr.id)}
                      className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-glass-bg border border-border-hover text-foreground rounded-lg text-[13px] font-medium hover:bg-glass-bg-hover transition-all"
                    >
                      <Trash2 size={14} />
                      Sil
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : !showForm ? (
          <div className="h-full flex flex-col items-center justify-center text-center">
            <div className="w-12 h-12 rounded-lg bg-glass-bg flex items-center justify-center mb-3">
              <MapPin size={20} className="text-foreground-disabled" />
            </div>
            <p className="text-[16px] text-foreground-tertiary mb-1">Kayıtlı adresiniz yok</p>
            <p className="text-[15px] text-foreground-muted mb-5">Hızlı ödeme için adres ekleyin</p>
            <button
              onClick={() => setShowForm(true)}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-emerald-500/10 border border-emerald-500/20 text-foreground rounded-lg text-[15px] font-medium hover:bg-emerald-500/25 hover:border-emerald-500/30 transition-all"
            >
              Adres Ekle
              <ChevronRight size={14} />
            </button>
          </div>
        ) : null}
      </div>
    </div>
  );
}

interface AccountPaneProps {
  user: UserType;
  avatarUrl: string | null;
  setAvatarUrl: (url: string | null) => void;
  showNotification: (type: "success" | "error", message: string) => void;
  onLogout: () => void;
}

function AccountPane({ user, avatarUrl, setAvatarUrl, showNotification, onLogout }: AccountPaneProps) {
  const { update: updateSession } = useSession();
  // Ad ve Soyad'ı ayır
  const nameParts = (user.name || "").split(" ");
  const [firstName, setFirstName] = useState(nameParts[0] || "");
  const [lastName, setLastName] = useState(nameParts.slice(1).join(" ") || "");
  const [phone, setPhone] = useState(user.phone || "");
  const [birthDate, setBirthDate] = useState(user.birthDate || "");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [passwordSuccess, setPasswordSuccess] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [avatarLoading, setAvatarLoading] = useState(false);

  const handleSaveProfile = async () => {
    setSaving(true);
    try {
      const fullName = `${firstName.trim()} ${lastName.trim()}`.trim();
      const res = await fetch("/api/user/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          name: fullName || undefined, 
          phone: phone || undefined, 
          birthDate: birthDate || undefined 
        }),
      });
      
      if (res.ok) {
        const data = await res.json();
        console.log("Profile saved:", data);
        
        // Update session with new data
        await updateSession({
          user: {
            ...user,
            name: fullName,
            phone: phone,
          }
        });
        
        setSaved(true);
        showNotification("success", "Profil bilgileri kaydedildi");
        setTimeout(() => setSaved(false), 3000);
      } else {
        const errorData = await res.json();
        console.error("Profile update failed:", errorData);
        showNotification("error", errorData.error || "Kaydetme başarısız");
      }
    } catch (e) {
      console.error("Profile save error:", e);
      showNotification("error", "Kaydetme sırasında bir hata oluştu");
    }
    setSaving(false);
  };

  const handleSendPasswordResetLink = async () => {
    setPasswordError(null);
    setPasswordSuccess(false);
    setPasswordLoading(true);
    
    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: user.email }),
      });
      const data = await res.json();
      
      if (!res.ok) {
        setPasswordError(data.error || "Bir hata oluştu");
      } else {
        setPasswordSuccess(true);
        setTimeout(() => setPasswordSuccess(false), 10000);
      }
    } catch {
      setPasswordError("Bir hata oluştu. Lütfen tekrar deneyin.");
    }
    setPasswordLoading(false);
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    // Validate file type
    const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
    if (!allowedTypes.includes(file.type)) {
      showNotification("error", "Sadece JPEG, PNG ve WebP formatları desteklenir");
      return;
    }
    
    // Validate file size (max 5MB)
    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      showNotification("error", "Dosya boyutu 5MB'dan küçük olmalıdır");
      return;
    }
    
    // Preview immediately
    const reader = new FileReader();
    reader.onload = (e) => setAvatarUrl(e.target?.result as string);
    reader.readAsDataURL(file);
    
    setAvatarLoading(true);
    try {
      const formData = new FormData();
      formData.append("avatar", file);
      
      const res = await fetch("/api/user/avatar", {
        method: "POST",
        body: formData,
      });
      
      if (res.ok) {
        const data = await res.json();
        // Add cache buster to force browser refresh
        const cacheBustedUrl = `${data.avatarUrl}?t=${Date.now()}`;
        setAvatarUrl(cacheBustedUrl);
        // Refresh session with new avatar
        await updateSession({
          user: {
            ...user,
            image: data.avatarUrl,
          }
        });
        showNotification("success", "Profil fotoğrafı yüklendi");
      } else {
        const errorData = await res.json();
        showNotification("error", errorData.error || "Yükleme başarısız");
        // Revert preview
        setAvatarUrl(user.image || null);
      }
    } catch (e) {
      console.error(e);
      showNotification("error", "Yükleme sırasında bir hata oluştu");
      setAvatarUrl(user.image || null);
    }
    setAvatarLoading(false);
  };

  const handleAvatarDelete = async () => {
    setAvatarLoading(true);
    try {
      const res = await fetch("/api/user/avatar", { method: "DELETE" });
      if (res.ok) {
        setAvatarUrl(null);
        // Refresh session with null avatar
        await updateSession({
          user: {
            ...user,
            image: null,
          }
        });
        showNotification("success", "Profil fotoğrafı kaldırıldı");
      } else {
        const errorData = await res.json();
        showNotification("error", errorData.error || "Silme başarısız");
      }
    } catch (e) {
      console.error(e);
      showNotification("error", "Silme sırasında bir hata oluştu");
    }
    setAvatarLoading(false);
  };

  const isValidImageUrl = avatarUrl && (avatarUrl.startsWith("/") || avatarUrl.startsWith("http") || avatarUrl.startsWith("data:"));

  return (
    <div className="account-details-form space-y-5">
      {/* Profile Photo Section */}
      <div className="flex items-center gap-4 pb-4 border-b border-border">
        <div className="relative w-20 h-20 rounded-full bg-gradient-to-br from-emerald-500/20 to-cyan-500/10 border-2 border-emerald-500/20 flex items-center justify-center overflow-hidden">
          {avatarLoading ? (
            <Loader2 size={24} className="animate-spin text-emerald-400/50" />
          ) : isValidImageUrl ? (
            <Image src={avatarUrl} alt="Avatar" fill sizes="96px" className="object-cover" />
          ) : (
            <User size={32} className="text-emerald-400" />
          )}
        </div>
        <div className="space-y-2">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            onChange={handleAvatarUpload}
            className="hidden"
          />
          <div className="flex items-center gap-3">
            <button
              onClick={() => fileInputRef.current?.click()}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-emerald-500/10 border border-emerald-500/20 text-foreground rounded-lg text-[17px] font-medium hover:bg-emerald-500/25 hover:border-emerald-500/30 transition-all"
            >
              <Camera size={16} />
              Yükle
            </button>
            {isValidImageUrl && (
              <button
                onClick={handleAvatarDelete}
                className="inline-flex items-center gap-2 px-4 py-2.5 bg-glass-bg border border-border-hover text-foreground rounded-lg text-[17px] font-medium hover:bg-glass-bg-hover transition-all"
              >
                <Trash2 size={16} />
                Kaldır
              </button>
            )}
          </div>
          <p className="text-[12px] text-foreground-muted">JPEG, PNG, WebP • Max 5MB</p>
        </div>
      </div>

      {/* Profile Info */}
      <div className="space-y-3">
        <span className="text-[14px] font-medium text-foreground-tertiary block">Kişisel Bilgiler</span>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-[13px] text-foreground-muted">Ad</label>
            <input
              type="text"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              placeholder="Adınız"
              className="w-full h-11 px-4 bg-glass-bg border border-border rounded-lg text-[15px] text-foreground placeholder:text-foreground-disabled outline-none focus:border-emerald-500/40 transition-all"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-[13px] text-foreground-muted">Soyad</label>
            <input
              type="text"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              placeholder="Soyadınız"
              className="w-full h-11 px-4 bg-glass-bg border border-border rounded-lg text-[15px] text-foreground placeholder:text-foreground-disabled outline-none focus:border-emerald-500/40 transition-all"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-[13px] text-foreground-muted">Telefon</label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="05XX XXX XX XX"
              className="w-full h-11 px-4 bg-glass-bg border border-border rounded-lg text-[15px] text-foreground placeholder:text-foreground-disabled outline-none focus:border-emerald-500/40 transition-all"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-[13px] text-foreground-muted">E-posta</label>
            <input
              type="email"
              value={user.email || ""}
              disabled
              className="w-full h-11 px-4 bg-glass-bg border border-border rounded-lg text-[15px] text-foreground-muted cursor-not-allowed"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-[13px] text-foreground-muted">Doğum Tarihi</label>
            <input
              type="date"
              value={birthDate}
              onChange={(e) => setBirthDate(e.target.value)}
              max={new Date().toISOString().split("T")[0]}
              className="w-full h-11 px-4 bg-glass-bg border border-border rounded-lg text-[15px] text-foreground outline-none focus:border-emerald-500/40 transition-all [color-scheme:dark]"
            />
          </div>
        </div>
        <button
          type="button"
          onClick={(e) => {
            e.preventDefault();
            handleSaveProfile();
          }}
          disabled={saving || saved}
          className={`account-save-btn inline-flex items-center gap-2 px-5 py-3 rounded-lg text-[16px] font-medium transition-all disabled:opacity-50 ${
            saved 
              ? "bg-emerald-500/20 border border-emerald-500/40 text-emerald-400" 
              : "bg-emerald-500/10 border border-emerald-500/20 text-foreground hover:bg-emerald-500/25 hover:border-emerald-500/30"
          }`}
        >
          {saving ? <Loader2 size={16} className="animate-spin" /> : saved ? <Check size={16} className="text-emerald-400" /> : <Save size={16} />}
          {saving ? "Kaydediliyor..." : saved ? "Kaydedildi" : "Kaydet"}
        </button>
      </div>

      {/* Divider */}
      <div className="h-px bg-glass-bg-hover" />

      {/* Password Section */}
      <div className="space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <span className="text-[14px] font-medium text-foreground-tertiary block">Şifre</span>
          <button
            onClick={handleSendPasswordResetLink}
            disabled={passwordLoading}
            className="account-password-btn inline-flex items-center justify-center gap-2 px-5 py-3 bg-emerald-500/10 border border-emerald-500/20 text-foreground rounded-lg text-[14px] sm:text-[15px] font-medium hover:bg-emerald-500/25 hover:border-emerald-500/30 transition-all disabled:opacity-50 w-full sm:w-auto"
          >
            {passwordLoading ? <Loader2 size={16} className="animate-spin" /> : <Lock size={16} />}
            {passwordLoading ? "Gönderiliyor..." : "Şifre Sıfırlama Linki Gönder"}
          </button>
        </div>
        
        {passwordError && (
          <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-[15px] text-red-400">
            {passwordError}
          </div>
        )}
        {passwordSuccess && (
          <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-lg text-[15px] text-foreground-400">
            Şifre sıfırlama linki email adresinize gönderildi. Lütfen email kutunuzu kontrol edin.
          </div>
        )}
      </div>

      {/* Divider */}
      <div className="h-px bg-glass-bg-hover" />

      {/* Çıkış Yap - Mobilde görünür */}
      <div className="account-logout-section pt-4">
        <button
          onClick={onLogout}
          className="account-logout-btn w-full flex items-center justify-center gap-3 px-5 py-3.5 bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl text-[15px] font-medium hover:bg-red-500/20 hover:border-red-500/30 transition-all"
        >
          <LogOut size={18} />
          <span>Çıkış Yap</span>
        </button>
      </div>
    </div>
  );
}

function FavoritesPane() {
  const { items, removeItem, clearFavorites } = useFavorites();

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("tr-TR", {
      style: "currency",
      currency: "TRY",
      minimumFractionDigits: 2,
    }).format(price);
  };

  if (items.length === 0) {
    return (
      <div className="h-full flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-border">
          <span className="text-[20px] font-medium text-foreground">Favorilerim</span>
        </div>
        
        {/* Empty State - Only CTA */}
        <div className="flex-1 flex flex-col items-center justify-center text-center py-8">
          <Link 
            href="/magaza"
            className="inline-flex items-center gap-2 px-5 py-3 bg-gradient-to-r from-pink-500 to-pink-600 hover:from-pink-400 hover:to-pink-500 rounded-xl text-[17px] font-medium transition-all shadow-lg shadow-pink-500/25 text-white"
          >
            Ürünleri Keşfet
            <ChevronRight size={18} className="text-white" />
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-border">
        <span className="text-[20px] font-medium text-foreground">Favorilerim</span>
        <div className="flex items-center gap-3">
          <span className="text-[15px] text-foreground-muted">{items.length} ürün</span>
          <button
            onClick={clearFavorites}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-glass-bg border border-border-hover text-foreground rounded-lg text-[17px] font-medium hover:bg-glass-bg-hover transition-all"
          >
            <Trash2 size={14} />
            Temizle
          </button>
        </div>
      </div>
      
      {/* Favorites List - Horizontal */}
      <div className="flex-1 pt-4 space-y-3 overflow-y-auto">
        {items.map((item) => (
          <div
            key={item.id}
            className="group relative flex gap-4 p-3 bg-glass-bg border border-border rounded-xl hover:border-border-hover transition-all"
          >
            {/* Image */}
            <Link href={`/urun/${item.slug}`} className="flex-shrink-0">
              <div className="w-20 h-20 bg-glass-bg rounded-lg relative overflow-hidden">
                {item.image ? (
                  <Image
                    src={item.image}
                    alt={item.title}
                    fill
                    sizes="80px"
                    className="object-contain p-2"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Package size={24} className="text-foreground/10" />
                  </div>
                )}
              </div>
            </Link>

            {/* Info */}
            <div className="flex-1 min-w-0 flex flex-col justify-center">
              <p className="text-[11px] text-emerald-400/70 uppercase tracking-wider mb-0.5">{item.brand}</p>
              <Link href={`/urun/${item.slug}`}>
                <span className="text-[13px] font-medium text-foreground hover:text-emerald-400 transition-colors line-clamp-1">
                  {item.title}
                </span>
              </Link>
              {item.variant && (
                <p className="text-[11px] text-foreground-muted mt-0.5">
                  {item.variant.type}: {item.variant.value}
                </p>
              )}
              <div className="flex items-center gap-2 mt-1">
                <span className="text-[14px] font-semibold text-foreground">{formatPrice(item.price)}</span>
                {item.originalPrice && item.originalPrice > item.price && (
                  <span className="text-[11px] text-foreground-muted line-through">{formatPrice(item.originalPrice)}</span>
                )}
              </div>
            </div>

            {/* Remove Button */}
            <button
              onClick={() => removeItem(item.productId, item.variant?.id)}
              className="flex-shrink-0 inline-flex items-center justify-center w-10 h-10 bg-glass-bg border border-border-hover text-foreground rounded-lg hover:bg-glass-bg-hover transition-all self-center"
            >
              <X size={12} />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
