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
      <div className="min-h-screen bg-[#050505] flex items-center justify-center">
        <Loader2 size={32} className="animate-spin text-emerald-500" />
      </div>
    );
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // AUTHENTICATED VIEW - Minimal Dashboard (Larger Layout)
  // ═══════════════════════════════════════════════════════════════════════════
  
  const CONTAINER_HEIGHT = 680; // Larger fixed height for both containers
  
  if (isAuthenticated && user) {
    return (
      <div className="min-h-screen bg-[#030303]" style={{ paddingTop: "120px", paddingBottom: "80px" }}>
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
                className="bg-[#0a0a0a] border border-white/[0.06] rounded-2xl overflow-hidden flex flex-col"
                style={{ height: `${CONTAINER_HEIGHT}px` }}
              >
                {/* User Info */}
                <div className="p-6 border-b border-white/[0.05]">
                  <div className="flex flex-col items-center text-center">
                    <div className="relative w-20 h-20 rounded-full bg-gradient-to-br from-emerald-500/20 to-cyan-500/10 flex items-center justify-center overflow-hidden mb-4 border-2 border-emerald-500/20">
                      {avatarUrl && (avatarUrl.startsWith("/") || avatarUrl.startsWith("http") || avatarUrl.startsWith("data:")) ? (
                        <Image src={avatarUrl} alt={user.name || "Profil"} fill sizes="96px" className="object-cover" />
                      ) : (
                        <User size={32} className="text-emerald-400" />
                      )}
                    </div>
                    <span className="text-[19px] font-semibold text-white truncate w-full block">{user.name || "Kullanıcı"}</span>
                    <p className="text-[15px] text-white/40 truncate w-full mt-0.5">{user.email}</p>
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
                          : "text-white/50 hover:text-white/80 hover:bg-white/[0.02]"
                      )}
                    >
                      <item.icon size={20} className={activeTab === item.id ? "text-emerald-400" : "text-white/30"} />
                      <span className="text-[17px]">{item.label}</span>
                    </button>
                  ))}
                </nav>

                {/* Logout & Security */}
                <div className="mt-auto border-t border-white/[0.05]">
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-4 px-6 py-3.5 text-left text-red-400/60 hover:text-red-400 hover:bg-red-500/[0.03] transition-all"
                  >
                    <LogOut size={20} />
                    <span className="text-[17px]">Çıkış Yap</span>
                  </button>
                  <div className="flex items-center justify-center gap-2 py-3 text-white/20 border-t border-white/[0.04]">
                    <Shield size={14} />
                    <span className="text-[13px]">256-bit SSL güvenli bağlantı</span>
                  </div>
                </div>
              </div>
            </aside>

            {/* ═══════════════════ RIGHT CONTENT ═══════════════════ */}
            <main className="account-content-area flex-1 min-w-0">
              <div 
                className="account-content-card bg-[#0a0a0a] border border-white/[0.06] rounded-2xl p-6"
                style={{ height: `${CONTAINER_HEIGHT}px` }}
              >
                {activeTab === "pano" && <DashboardPane user={user} setActiveTab={setActiveTab} setExpandedOrderId={setExpandedOrderId} avatarUrl={avatarUrl} />}
                {activeTab === "siparisler" && <OrdersPane initialExpandedOrder={expandedOrderId} onExpandChange={setExpandedOrderId} />}
                {activeTab === "adresler" && <AddressesPane userName={user.name || undefined} />}
                {activeTab === "hesap" && <AccountPane user={user} avatarUrl={avatarUrl} setAvatarUrl={setAvatarUrl} showNotification={showNotification} onLogout={handleLogout} />}
                {activeTab === "favoriler" && <FavoritesPane />}
                
                {/* Global Notification */}
                {notification && (
                  <div className={`fixed bottom-6 right-6 z-50 flex items-center gap-3 px-4 py-3 rounded-xl shadow-lg border ${
                    notification.type === "success" 
                      ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400" 
                      : "bg-red-500/10 border-red-500/30 text-red-400"
                  }`}>
                    {notification.type === "success" ? <CheckCircle size={18} /> : <AlertCircle size={18} />}
                    <span className="text-[14px] font-medium">{notification.message}</span>
                  </div>
                )}
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
      backgroundColor: '#050505',
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
          color: 'white',
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
              backgroundColor: 'rgba(19, 19, 19, 0.9)',
              border: activePanel === 'login' ? '1px solid rgba(16, 185, 129, 0.3)' : '1px solid rgba(255,255,255,0.08)',
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
              color: 'white',
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
                  color: 'rgba(255,255,255,0.7)',
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
                    backgroundColor: 'rgba(255,255,255,0.03)',
                    border: focusedField === 'loginEmail' ? '1px solid rgba(16, 185, 129, 0.5)' : '1px solid rgba(255,255,255,0.12)',
                    borderRadius: '12px',
                    fontSize: '14px',
                    color: 'white',
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
                  color: 'rgba(255,255,255,0.7)',
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
                      backgroundColor: 'rgba(255,255,255,0.03)',
                      border: focusedField === 'loginPassword' ? '1px solid rgba(16, 185, 129, 0.5)' : '1px solid rgba(255,255,255,0.12)',
                      borderRadius: '12px',
                      fontSize: '14px',
                      color: 'white',
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
                      color: 'rgba(255,255,255,0.4)',
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
                      border: rememberMe ? '2px solid #10B981' : '2px solid rgba(255,255,255,0.25)',
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
                  <span style={{ fontSize: '13px', color: 'rgba(255,255,255,0.6)' }}>
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
                  backgroundColor: activePanel === 'register' ? 'rgba(255,255,255,0.1)' : (loginHover ? '#0ea371' : '#10B981'),
                  border: 'none',
                  borderRadius: '12px',
                  fontSize: '14px',
                  fontWeight: '600',
                  color: activePanel === 'register' ? 'rgba(255,255,255,0.3)' : 'white',
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
                <div style={{ flex: 1, height: '1px', backgroundColor: 'rgba(255,255,255,0.1)' }} />
                <span style={{ fontSize: '12px', color: 'rgba(255,255,255,0.4)' }}>veya</span>
                <div style={{ flex: 1, height: '1px', backgroundColor: 'rgba(255,255,255,0.1)' }} />
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
                  backgroundColor: googleHover && activePanel !== 'register' ? 'rgba(255,255,255,0.08)' : 'rgba(255,255,255,0.03)',
                  border: '1px solid rgba(255,255,255,0.12)',
                  borderRadius: '12px',
                  fontSize: '14px',
                  fontWeight: '500',
                  color: activePanel === 'register' ? 'rgba(255,255,255,0.3)' : 'white',
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
              backgroundColor: 'rgba(19, 19, 19, 0.9)',
              border: activePanel === 'register' ? '1px solid rgba(16, 185, 129, 0.3)' : '1px solid rgba(255,255,255,0.08)',
              borderRadius: '24px',
              padding: '40px',
              opacity: activePanel === 'login' ? 0.4 : 1,
              transition: 'all 0.3s ease',
              cursor: activePanel === 'login' ? 'pointer' : 'default',
              transform: activePanel === 'register' ? 'scale(1.02)' : 'scale(1)',
              boxShadow: activePanel === 'register' ? '0 8px 32px rgba(16, 185, 129, 0.1)' : 'none',
            }}
          >
            <h2 style={{
              fontSize: '20px',
              fontWeight: '600',
              color: 'white',
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
                    <h3 style={{ color: 'white', fontSize: '18px', fontWeight: '600', marginBottom: '8px' }}>
                      Email Doğrulandı!
                    </h3>
                    <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '14px' }}>
                      Hesabınıza yönlendiriliyorsunuz...
                    </p>
                  </div>
                ) : (
                  <form onSubmit={handleActivationSubmit}>
                    <p style={{
                      color: 'rgba(255,255,255,0.6)',
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
                        color: 'rgba(255,255,255,0.7)',
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
                          backgroundColor: 'rgba(255,255,255,0.03)',
                          border: '1px solid rgba(255,255,255,0.08)',
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
                        backgroundColor: countdown <= 0 ? 'rgba(255,255,255,0.1)' : '#10B981',
                        border: 'none',
                        borderRadius: '12px',
                        fontSize: '14px',
                        fontWeight: '600',
                        color: countdown <= 0 ? 'rgba(255,255,255,0.3)' : 'white',
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
                        border: '1px solid rgba(255,255,255,0.1)',
                        borderRadius: '12px',
                        fontSize: '13px',
                        color: countdown > 0 ? 'rgba(255,255,255,0.3)' : 'rgba(255,255,255,0.6)',
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
                  color: 'rgba(255,255,255,0.7)',
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
                    backgroundColor: 'rgba(255,255,255,0.03)',
                    border: focusedField === 'registerName' ? '1px solid rgba(16, 185, 129, 0.5)' : '1px solid rgba(255,255,255,0.12)',
                    borderRadius: '12px',
                    fontSize: '14px',
                    color: 'white',
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
                  color: 'rgba(255,255,255,0.7)',
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
                    backgroundColor: 'rgba(255,255,255,0.03)',
                    border: focusedField === 'registerEmail' ? '1px solid rgba(16, 185, 129, 0.5)' : '1px solid rgba(255,255,255,0.12)',
                    borderRadius: '12px',
                    fontSize: '14px',
                    color: 'white',
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
                  color: 'rgba(255,255,255,0.7)',
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
                      backgroundColor: 'rgba(255,255,255,0.03)',
                      border: focusedField === 'registerPassword' ? '1px solid rgba(16, 185, 129, 0.5)' : '1px solid rgba(255,255,255,0.12)',
                      borderRadius: '12px',
                      fontSize: '14px',
                      color: 'white',
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
                      color: 'rgba(255,255,255,0.4)',
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
                    border: newsletter ? '2px solid #10B981' : '2px solid rgba(255,255,255,0.25)',
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
                <span style={{ fontSize: '13px', color: 'rgba(255,255,255,0.6)', lineHeight: '1.5' }}>
                  Haber bültenimize abone olun (isteğe bağlı)
                </span>
              </label>

              {/* Privacy Text */}
              <p style={{
                fontSize: '12px',
                color: 'rgba(255,255,255,0.4)',
                lineHeight: '1.7',
                marginBottom: '28px',
                padding: '16px',
                backgroundColor: 'rgba(255,255,255,0.02)',
                borderRadius: '10px',
                border: '1px solid rgba(255,255,255,0.05)',
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
                  backgroundColor: activePanel === 'login' ? 'rgba(255,255,255,0.1)' : (registerHover ? '#0ea371' : '#10B981'),
                  border: 'none',
                  borderRadius: '12px',
                  fontSize: '14px',
                  fontWeight: '600',
                  color: activePanel === 'login' ? 'rgba(255,255,255,0.3)' : 'white',
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
          <Shield size={14} style={{ color: 'rgba(255,255,255,0.3)' }} />
          <span style={{ fontSize: '11px', color: 'rgba(255,255,255,0.3)' }}>
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
      <div className="pb-5 border-b border-white/[0.04]">
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
            <span className="text-[18px] font-medium text-white block mb-1">
              Merhaba, {user.name || "Kullanıcı"} 👋
            </span>
            <p className="text-[15px] text-white/40">
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
              "bg-white/[0.02] border border-white/[0.04] rounded-xl p-5 text-center transition-all",
              stat.tab && "hover:bg-white/[0.04] hover:border-white/[0.08] cursor-pointer"
            )}
          >
            <div className="text-[24px] font-semibold text-white mb-1">
              {loadingStats ? <span className="inline-block w-6 h-6 bg-white/10 rounded animate-pulse" /> : stat.value}
            </div>
            <div className="text-[13px] text-white/40 uppercase tracking-wide">{stat.label}</div>
          </button>
        ))}
      </div>

      {/* Recent Orders */}
      <div className="flex-1 flex flex-col min-h-0">
        <div className="flex items-center justify-between mb-3">
          <span className="text-[15px] font-medium text-white/50">Son Siparişler</span>
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
            <Loader2 size={24} className="animate-spin text-white/20" />
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
                  className="w-full flex items-center gap-4 p-3 bg-white/[0.02] border border-white/[0.04] rounded-xl hover:bg-white/[0.04] hover:border-white/[0.08] transition-all text-left"
                >
                  <div className={`w-10 h-10 rounded-lg ${config.bgColor} flex items-center justify-center flex-shrink-0`}>
                    <Package size={18} className={config.color} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="order-number-text text-[13px] font-mono text-white">#{order.orderNumber}</span>
                      <span className={`text-[10px] px-1.5 py-0.5 rounded ${config.bgColor} ${config.color}`}>
                        {config.label}
                      </span>
                    </div>
                    <p className="text-[11px] text-white/40">
                      {new Date(order.createdAt).toLocaleDateString("tr-TR")} • {order.items?.length || 0} ürün
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="text-[14px] font-medium text-white">
                      {new Intl.NumberFormat("tr-TR", { style: "currency", currency: "TRY" }).format(order.grandTotal ?? order.total ?? 0)}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        ) : (
          <div className="flex-1 flex items-center justify-center text-center border border-dashed border-white/[0.06] rounded-xl bg-white/[0.01]">
            <div>
              <Package size={36} className="mx-auto mb-4 text-white/15" />
              <p className="text-[15px] text-white/40 mb-5">Henüz siparişiniz yok</p>
              <Link href="/magaza" className="inline-flex items-center gap-2 px-4 py-2.5 bg-emerald-500/10 border border-emerald-500/20 text-white rounded-lg text-[15px] font-medium hover:bg-emerald-500/25 hover:border-emerald-500/30 transition-all">
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
  const toggleOrder = (orderId: string) => {
    const newExpanded = expandedOrder === orderId ? null : orderId;
    setExpandedOrder(newExpanded);
    onExpandChange?.(newExpanded);
  };

  // Loading State
  if (loading) {
    return (
      <div className="h-full flex flex-col">
        <div className="flex items-center justify-between pb-4 border-b border-white/[0.05]">
          <span className="text-[17px] font-medium text-white">Siparişlerim</span>
        </div>
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <Loader2 size={32} className="animate-spin text-emerald-500 mx-auto mb-3" />
            <p className="text-[14px] text-white/40">Siparişler yükleniyor...</p>
          </div>
        </div>
      </div>
    );
  }

  // Error State
  if (error) {
    return (
      <div className="h-full flex flex-col">
        <div className="flex items-center justify-between pb-4 border-b border-white/[0.05]">
          <span className="text-[17px] font-medium text-white">Siparişlerim</span>
        </div>
        <div className="flex-1 flex flex-col items-center justify-center text-center">
          <div className="w-14 h-14 rounded-xl bg-red-500/10 flex items-center justify-center mb-4">
            <AlertCircle size={24} className="text-red-400" />
          </div>
          <p className="text-[16px] text-white/50 mb-1">{error}</p>
          <button
            onClick={fetchOrders}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-emerald-500/10 border border-emerald-500/20 text-white rounded-lg text-[15px] font-medium hover:bg-emerald-500/25 hover:border-emerald-500/30 transition-all mt-4"
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
        <div className="flex items-center justify-between pb-4 border-b border-white/[0.05]">
          <span className="text-[17px] font-medium text-white">Siparişlerim</span>
        </div>
        <div className="flex-1 flex flex-col items-center justify-center text-center">
          <div className="w-14 h-14 rounded-xl bg-white/[0.03] flex items-center justify-center mb-4">
            <Package size={24} className="text-white/20" />
          </div>
          <p className="text-[16px] text-white/50 mb-1">Henüz siparişiniz yok</p>
          <p className="text-[15px] text-white/30 mb-5">İlk siparişinizi vermek için mağazayı ziyaret edin</p>
          <Link 
            href="/magaza"
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-emerald-500/10 border border-emerald-500/20 text-white rounded-lg text-[15px] font-medium hover:bg-emerald-500/25 hover:border-emerald-500/30 transition-all"
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
      <div className="flex items-center justify-between pb-4 border-b border-white/[0.05]">
        <div className="flex items-center gap-3">
          <span className="text-[17px] font-medium text-white">Siparişlerim</span>
          <span className="text-[12px] px-2 py-0.5 rounded-full bg-white/[0.05] text-white/50">
            {filteredOrders.length}/{orders.length} sipariş
          </span>
        </div>
        <button
          onClick={fetchOrders}
          className="p-2 rounded-lg hover:bg-white/[0.05] transition-colors"
          title="Yenile"
        >
          <RefreshCw size={16} className="text-white/40" />
        </button>
      </div>

      {/* Search & Filter Bar */}
      <div className="flex items-center gap-3 py-3 border-b border-white/[0.03]">
        {/* Search Input */}
        <div className="flex-1 relative">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Sipariş no veya ürün ara..."
            className="w-full h-9 pl-9 pr-3 rounded-lg bg-white/[0.03] border border-white/[0.06] text-[13px] text-white placeholder:text-white/30 focus:outline-none focus:border-emerald-500/30 focus:bg-white/[0.05] transition-all"
          />
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm("")}
              className="absolute right-2 top-1/2 -translate-y-1/2 p-1 rounded hover:bg-white/[0.1] transition-colors"
            >
              <XCircle size={14} className="text-white/40" />
            </button>
          )}
        </div>
        
        {/* Status Filter */}
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="h-9 px-3 pr-8 rounded-lg bg-white/[0.03] border border-white/[0.06] text-[13px] text-white appearance-none cursor-pointer focus:outline-none focus:border-emerald-500/30 transition-all"
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
          <Search size={32} className="text-white/15 mb-3" />
          <p className="text-[14px] text-white/50 mb-1">Sonuç bulunamadı</p>
          <p className="text-[13px] text-white/30 mb-4">Arama kriterlerinizi değiştirin</p>
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
              className="bg-white/[0.02] border border-white/[0.06] rounded-xl overflow-hidden hover:border-white/[0.1] transition-all"
            >
              {/* Order Header - Always Visible */}
              <button
                onClick={() => toggleOrder(order.id)}
                className="order-card-header w-full p-4 flex items-center gap-4 text-left relative"
              >
                {/* Status Icon */}
                <div className={`order-status-icon w-10 h-10 rounded-lg ${statusConfig?.bgColor || 'bg-white/[0.05]'} border flex items-center justify-center flex-shrink-0`}>
                  <StatusIcon size={18} className={statusConfig?.color || 'text-white/40'} />
                </div>

                {/* Order Info */}
                <div className="order-info flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="order-number-text text-[14px] font-mono font-medium text-white">
                      #{order.orderNumber}
                    </span>
                    <span className={`text-[11px] px-2 py-0.5 rounded-full ${statusConfig?.bgColor || 'bg-white/[0.05]'} border ${statusConfig?.color || 'text-white/50'}`}>
                      {statusConfig?.label || order.status}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 text-[12px] text-white/40">
                    <span>{formatDate(order.createdAt)}</span>
                    <span>•</span>
                    <span>{order.items.length} ürün</span>
                    <span>•</span>
                    <span className={paymentConfig?.color || 'text-white/40'}>
                      {paymentConfig?.label || order.paymentStatus}
                    </span>
                  </div>
                </div>

                {/* Total & Expand */}
                <div className="order-total text-right flex-shrink-0">
                  <p className="text-[16px] font-semibold text-white mb-1">
                    {formatPrice(order.total)}
                  </p>
                  {isExpanded ? (
                    <ChevronUp size={16} className="text-white/40 ml-auto" />
                  ) : (
                    <ChevronDown size={16} className="text-white/40 ml-auto" />
                  )}
                </div>
              </button>

              {/* Expanded Content */}
              {isExpanded && (
                <div className="order-expanded-content border-t border-white/[0.06] p-4 space-y-4">
                  {/* Progress Timeline */}
                  <div className="order-timeline-container">
                  <div className="order-timeline flex items-center justify-between px-2">
                    {[
                      { key: "created", label: "Sipariş", date: order.createdAt, done: true },
                      { key: "paid", label: "Ödeme", date: order.paidAt, done: !!order.paidAt },
                      { key: "preparing", label: "Hazırlanıyor", date: order.preparingAt, done: !!order.preparingAt },
                      { key: "shipped", label: "Kargoda", date: order.shippedAt, done: !!order.shippedAt },
                      { key: "delivered", label: "Teslim", date: order.deliveredAt, done: !!order.deliveredAt },
                    ].map((step, index, arr) => (
                      <div key={step.key} className={`order-timeline-step flex items-center ${step.done ? 'step-done' : ''}`}>
                        <div className="order-step-content flex flex-col items-center min-w-[60px]">
                          <div className={`order-step-icon w-7 h-7 rounded-full flex items-center justify-center transition-all ${
                            step.done
                              ? 'bg-emerald-500/20 border-2 border-emerald-500/50 shadow-[0_0_10px_rgba(16,185,129,0.3)]'
                              : 'bg-white/[0.03] border border-white/[0.1]'
                          }`}>
                            {step.done ? (
                              <Check size={14} className="text-emerald-400" />
                            ) : (
                              <div className="w-2 h-2 rounded-full bg-white/20" />
                            )}
                          </div>
                          <span className={`order-step-label text-[11px] mt-1.5 font-medium ${step.done ? 'text-white/70' : 'text-white/30'}`}>
                            {step.label}
                          </span>
                          {step.done && step.date && (
                            <span className="order-step-date text-[9px] text-white/40 mt-0.5">
                              {new Date(step.date).toLocaleDateString("tr-TR", { day: "numeric", month: "short" })}
                            </span>
                          )}
                        </div>
                        {index < arr.length - 1 && (
                          <div className={`order-step-connector flex-1 h-0.5 mx-1 min-w-[20px] transition-all ${
                            arr[index + 1].done ? 'bg-gradient-to-r from-emerald-500/50 to-emerald-500/30' : 'bg-white/[0.08]'
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
                    <p className="text-[12px] text-white/40 uppercase tracking-wide">Ürünler</p>
                    {order.items.map((item) => (
                      <div
                        key={item.id}
                        className="flex items-start gap-2 sm:gap-3 p-2 bg-white/[0.02] rounded-lg"
                      >
                        <div className="w-10 h-10 sm:w-12 sm:h-12 bg-white/[0.03] rounded-lg overflow-hidden relative flex-shrink-0">
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
                              <Package size={16} className="text-white/20" />
                            </div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <Link
                            href={`/urun/${item.product.slug}`}
                            className="text-[13px] text-white hover:text-emerald-400 transition-colors line-clamp-1"
                          >
                            {item.product.name}
                          </Link>
                          {item.variantInfo && (
                            <p className="text-[11px] text-white/40">
                              {item.variantInfo.name}: {item.variantInfo.value}
                            </p>
                          )}
                          <p className="text-[11px] text-white/40">
                            {formatPrice(item.price)} × {item.quantity}
                          </p>
                        </div>
                        <span className="text-[13px] font-medium text-white">
                          {formatPrice(item.subtotal)}
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* Order Summary */}
                  <div className="bg-white/[0.02] rounded-lg p-3 space-y-2">
                    <div className="flex justify-between text-[12px]">
                      <span className="text-white/40">Ara Toplam</span>
                      <span className="text-white/60">{formatPrice(order.subtotal)}</span>
                    </div>
                    <div className="flex justify-between text-[12px]">
                      <span className="text-white/40">Kargo</span>
                      <span className={order.shippingCost === 0 ? 'text-emerald-400' : 'text-white/60'}>
                        {order.shippingCost === 0 ? 'Ücretsiz' : formatPrice(order.shippingCost)}
                      </span>
                    </div>
                    {order.discount > 0 && (
                      <div className="flex justify-between text-[12px]">
                        <span className="text-white/40">İndirim</span>
                        <span className="text-emerald-400">-{formatPrice(order.discount)}</span>
                      </div>
                    )}
                    <div className="flex justify-between text-[14px] pt-2 border-t border-white/[0.06]">
                      <div>
                        <span className="font-medium text-white">Toplam</span>
                        <span className="text-[10px] text-white/40 ml-1">(KDV dahil)</span>
                      </div>
                      <span className="font-semibold text-white">{formatPrice(order.total)}</span>
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
                            <p className="text-[12px] text-white/50 mb-1">{order.carrierName}</p>
                          )}
                          <p className="text-[14px] font-mono text-white">{order.trackingNumber}</p>
                        </div>
                        <button
                          onClick={() => copyTrackingNumber(order.trackingNumber!)}
                          className="p-2 rounded-lg bg-white/[0.05] hover:bg-white/[0.1] transition-colors"
                          title="Takip numarasını kopyala"
                        >
                          {copiedTracking === order.trackingNumber ? (
                            <Check size={14} className="text-emerald-400" />
                          ) : (
                            <Copy size={14} className="text-white/40" />
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
                        <p className="text-[11px] text-white/40 text-center">
                          Kargo firması sitesinden takip edebilirsiniz
                        </p>
                      )}
                    </div>
                  )}

                  {/* Invoice Section */}
                  <div className="flex items-center justify-between p-3 bg-white/[0.02] rounded-lg">
                    <div className="flex items-center gap-2">
                      <FileText size={16} className="text-white/40" />
                      <span className="text-[13px] text-white/60">Fatura</span>
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
                      <span className="inline-flex items-center gap-2 text-[12px] text-amber-400">
                        <Clock size={12} />
                        Teslimden en geç 2 gün içinde kesilecektir
                      </span>
                    ) : (
                      <span className="text-[12px] text-white/30">-</span>
                    )}
                  </div>


                  {/* Shipping Address */}
                  {order.shippingAddress && (
                    <div className="p-3 bg-white/[0.02] rounded-lg">
                      <p className="text-[12px] text-white/40 mb-2 flex items-center gap-2">
                        <MapPin size={12} />
                        Teslimat Adresi
                      </p>
                      <p className="text-[13px] text-white/70">
                        {order.shippingAddress.fullName || `${order.shippingAddress.firstName || ''} ${order.shippingAddress.lastName || ''}`.trim()}
                      </p>
                      <p className="text-[12px] text-white/50">
                        {order.shippingAddress.address || order.shippingAddress.addressLine1}
                      </p>
                      <p className="text-[12px] text-white/50">
                        {order.shippingAddress.district && `${order.shippingAddress.district}, `}
                        {order.shippingAddress.city}
                        {order.shippingAddress.postalCode && ` ${order.shippingAddress.postalCode}`}
                      </p>
                      <p className="text-[12px] text-white/40 mt-1">{order.shippingAddress.phone}</p>
                    </div>
                  )}

                  {/* Customer Note */}
                  {order.customerNote && (
                    <div className="p-3 bg-white/[0.02] rounded-lg">
                      <p className="text-[12px] text-white/40 mb-1">Sipariş Notu</p>
                      <p className="text-[13px] text-white/60 italic">&quot;{order.customerNote}&quot;</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
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
      <div className="flex items-center justify-between pb-3 border-b border-white/[0.05]">
        <span className="text-[17px] font-medium text-white">Adreslerim</span>
        {showForm && (
          <button 
            onClick={handleCancelEdit}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-white/[0.03] border border-white/[0.08] text-white rounded-lg text-[15px] font-medium hover:bg-white/[0.06] transition-all"
          >
            <X size={14} />
            İptal
          </button>
        )}
      </div>

      {/* Address Form */}
      {showForm && (
        <form onSubmit={handleSubmit} className="bg-white/[0.02] rounded-lg p-4 space-y-3 border border-white/[0.04]">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-[10px] text-white/40 uppercase tracking-wide">Adres Başlığı</label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="Ev, İş vb."
                required
                className="w-full mt-1 h-9 px-3 bg-white/[0.03] border border-white/[0.06] rounded-lg text-[12px] text-white placeholder:text-white/20 outline-none focus:border-emerald-500/40"
              />
            </div>
            <div>
              <label className="text-[10px] text-white/40 uppercase tracking-wide">Telefon</label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="05XX XXX XX XX"
                required
                className="w-full mt-1 h-9 px-3 bg-white/[0.03] border border-white/[0.06] rounded-lg text-[12px] text-white placeholder:text-white/20 outline-none focus:border-emerald-500/40"
              />
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-[10px] text-white/40 uppercase tracking-wide">İl</label>
              <select
                value={formData.city}
                onChange={(e) => handleCityChange(e.target.value)}
                required
                className="w-full mt-1 h-9 px-3 bg-[#0a0a0a] border border-white/[0.06] rounded-lg text-[12px] text-white outline-none focus:border-emerald-500/40 appearance-none cursor-pointer"
              >
                <option value="">İl Seçin</option>
                {CITIES.map(city => (
                  <option key={city} value={city}>{city}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-[10px] text-white/40 uppercase tracking-wide">İlçe</label>
              <select
                value={formData.district}
                onChange={(e) => setFormData({ ...formData, district: e.target.value })}
                required
                disabled={!formData.city}
                className="w-full mt-1 h-9 px-3 bg-[#0a0a0a] border border-white/[0.06] rounded-lg text-[12px] text-white outline-none focus:border-emerald-500/40 appearance-none cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <option value="">{formData.city ? "İlçe Seçin" : "Önce il seçin"}</option>
                {districts.map(district => (
                  <option key={district} value={district}>{district}</option>
                ))}
              </select>
            </div>
          </div>
          <div>
            <label className="text-[10px] text-white/40 uppercase tracking-wide">Açık Adres</label>
            <textarea
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              rows={2}
              required
              placeholder="Mahalle, sokak, bina no, daire no..."
              className="w-full mt-1 px-3 py-2 bg-white/[0.03] border border-white/[0.06] rounded-lg text-[12px] text-white placeholder:text-white/20 outline-none focus:border-emerald-500/40 resize-none"
            />
          </div>
          <div className="flex items-center justify-between pt-2">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.isDefault}
                onChange={(e) => setFormData({ ...formData, isDefault: e.target.checked })}
                className="w-4 h-4 rounded border-white/20 bg-white/[0.03] text-emerald-500 focus:ring-emerald-500/20"
              />
              <span className="text-[11px] text-white/50">Varsayılan adres</span>
            </label>
            <button
              type="submit"
              disabled={loading}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-emerald-500/10 border border-emerald-500/20 text-white rounded-lg text-[15px] font-medium hover:bg-emerald-500/25 hover:border-emerald-500/30 transition-all disabled:opacity-50"
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
              <div key={addr.id} className="bg-white/[0.02] border border-white/[0.05] rounded-lg p-4 flex flex-col">
                <div className="flex items-start justify-between mb-3">
                  <span className="text-[14px] font-medium text-white">{addr.title}</span>
                  {addr.isDefault && (
                    <span className="text-[10px] px-2 py-0.5 bg-emerald-500/20 text-emerald-400 rounded">
                      Varsayılan
                    </span>
                  )}
                </div>
                <div className="space-y-1 mb-4 flex-1">
                  <p className="text-[13px] text-white/70">{userName}</p>
                  <p className="text-[12px] text-white/50 leading-relaxed">{addr.address}</p>
                  <p className="text-[12px] text-white/50">{addr.district}, {addr.city}</p>
                  <p className="text-[12px] text-white/50">{addr.phone}</p>
                </div>
                <div className="flex flex-col gap-2 pt-3 border-t border-white/[0.05]">
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
                      className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-emerald-500/10 border border-emerald-500/20 text-white rounded-lg text-[13px] font-medium hover:bg-emerald-500/25 hover:border-emerald-500/30 transition-all"
                    >
                      <Edit2 size={14} />
                      Düzenle
                    </button>
                    <button
                      onClick={() => handleDelete(addr.id)}
                      className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-white/[0.03] border border-white/[0.08] text-white rounded-lg text-[13px] font-medium hover:bg-white/[0.06] transition-all"
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
            <div className="w-12 h-12 rounded-lg bg-white/[0.03] flex items-center justify-center mb-3">
              <MapPin size={20} className="text-white/20" />
            </div>
            <p className="text-[16px] text-white/50 mb-1">Kayıtlı adresiniz yok</p>
            <p className="text-[15px] text-white/30 mb-5">Hızlı ödeme için adres ekleyin</p>
            <button
              onClick={() => setShowForm(true)}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-emerald-500/10 border border-emerald-500/20 text-white rounded-lg text-[15px] font-medium hover:bg-emerald-500/25 hover:border-emerald-500/30 transition-all"
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
      <div className="flex items-center gap-4 pb-4 border-b border-white/[0.05]">
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
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-emerald-500/10 border border-emerald-500/20 text-white rounded-lg text-[17px] font-medium hover:bg-emerald-500/25 hover:border-emerald-500/30 transition-all"
            >
              <Camera size={16} />
              Yükle
            </button>
            {isValidImageUrl && (
              <button
                onClick={handleAvatarDelete}
                className="inline-flex items-center gap-2 px-4 py-2.5 bg-white/[0.03] border border-white/[0.08] text-white rounded-lg text-[17px] font-medium hover:bg-white/[0.06] transition-all"
              >
                <Trash2 size={16} />
                Kaldır
              </button>
            )}
          </div>
          <p className="text-[12px] text-white/30">JPEG, PNG, WebP • Max 5MB</p>
        </div>
      </div>

      {/* Profile Info */}
      <div className="space-y-3">
        <span className="text-[14px] font-medium text-white/50 block">Kişisel Bilgiler</span>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-[13px] text-white/40">Ad</label>
            <input
              type="text"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              placeholder="Adınız"
              className="w-full h-11 px-4 bg-white/[0.03] border border-white/[0.06] rounded-lg text-[15px] text-white placeholder:text-white/20 outline-none focus:border-emerald-500/40 transition-all"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-[13px] text-white/40">Soyad</label>
            <input
              type="text"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              placeholder="Soyadınız"
              className="w-full h-11 px-4 bg-white/[0.03] border border-white/[0.06] rounded-lg text-[15px] text-white placeholder:text-white/20 outline-none focus:border-emerald-500/40 transition-all"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-[13px] text-white/40">Telefon</label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="05XX XXX XX XX"
              className="w-full h-11 px-4 bg-white/[0.03] border border-white/[0.06] rounded-lg text-[15px] text-white placeholder:text-white/20 outline-none focus:border-emerald-500/40 transition-all"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-[13px] text-white/40">E-posta</label>
            <input
              type="email"
              value={user.email || ""}
              disabled
              className="w-full h-11 px-4 bg-white/[0.02] border border-white/[0.04] rounded-lg text-[15px] text-white/40 cursor-not-allowed"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-[13px] text-white/40">Doğum Tarihi</label>
            <input
              type="date"
              value={birthDate}
              onChange={(e) => setBirthDate(e.target.value)}
              max={new Date().toISOString().split("T")[0]}
              className="w-full h-11 px-4 bg-white/[0.03] border border-white/[0.06] rounded-lg text-[15px] text-white outline-none focus:border-emerald-500/40 transition-all [color-scheme:dark]"
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
              : "bg-emerald-500/10 border border-emerald-500/20 text-white hover:bg-emerald-500/25 hover:border-emerald-500/30"
          }`}
        >
          {saving ? <Loader2 size={16} className="animate-spin" /> : saved ? <Check size={16} className="text-emerald-400" /> : <Save size={16} />}
          {saving ? "Kaydediliyor..." : saved ? "Kaydedildi" : "Kaydet"}
        </button>
      </div>

      {/* Divider */}
      <div className="h-px bg-white/[0.06]" />

      {/* Password Section */}
      <div className="space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <span className="text-[14px] font-medium text-white/50 block">Şifre</span>
          <button
            onClick={handleSendPasswordResetLink}
            disabled={passwordLoading}
            className="account-password-btn inline-flex items-center justify-center gap-2 px-5 py-3 bg-emerald-500/10 border border-emerald-500/20 text-white rounded-lg text-[14px] sm:text-[15px] font-medium hover:bg-emerald-500/25 hover:border-emerald-500/30 transition-all disabled:opacity-50 w-full sm:w-auto"
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
          <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-lg text-[15px] text-white-400">
            Şifre sıfırlama linki email adresinize gönderildi. Lütfen email kutunuzu kontrol edin.
          </div>
        )}
      </div>

      {/* Divider */}
      <div className="h-px bg-white/[0.06]" />

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
        <div className="flex items-center justify-between pb-3 border-b border-white/[0.05]">
          <span className="text-[20px] font-medium text-white">Favorilerim</span>
        </div>
        
        {/* Empty State - Only CTA */}
        <div className="flex-1 flex flex-col items-center justify-center text-center">
          <Link 
            href="/magaza"
            className="inline-flex items-center gap-2 px-5 py-3 bg-gradient-to-r from-pink-500 to-pink-600 hover:from-pink-400 hover:to-pink-500 text-white rounded-xl text-[17px] font-medium transition-all shadow-lg shadow-pink-500/25"
          >
            Ürünleri Keşfet
            <ChevronRight size={18} />
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-white/[0.05]">
        <span className="text-[20px] font-medium text-white">Favorilerim</span>
        <div className="flex items-center gap-3">
          <span className="text-[15px] text-white/40">{items.length} ürün</span>
          <button
            onClick={clearFavorites}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-white/[0.03] border border-white/[0.08] text-white rounded-lg text-[17px] font-medium hover:bg-white/[0.06] transition-all"
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
            className="group relative flex gap-4 p-3 bg-white/[0.02] border border-white/[0.06] rounded-xl hover:border-white/[0.12] transition-all"
          >
            {/* Image */}
            <Link href={`/urun/${item.slug}`} className="flex-shrink-0">
              <div className="w-20 h-20 bg-white/[0.02] rounded-lg relative overflow-hidden">
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
                    <Package size={24} className="text-white/10" />
                  </div>
                )}
              </div>
            </Link>

            {/* Info */}
            <div className="flex-1 min-w-0 flex flex-col justify-center">
              <p className="text-[11px] text-emerald-400/70 uppercase tracking-wider mb-0.5">{item.brand}</p>
              <Link href={`/urun/${item.slug}`}>
                <span className="text-[13px] font-medium text-white hover:text-emerald-400 transition-colors line-clamp-1">
                  {item.title}
                </span>
              </Link>
              {item.variant && (
                <p className="text-[11px] text-white/40 mt-0.5">
                  {item.variant.type}: {item.variant.value}
                </p>
              )}
              <div className="flex items-center gap-2 mt-1">
                <span className="text-[14px] font-semibold text-white">{formatPrice(item.price)}</span>
                {item.originalPrice && item.originalPrice > item.price && (
                  <span className="text-[11px] text-white/30 line-through">{formatPrice(item.originalPrice)}</span>
                )}
              </div>
            </div>

            {/* Remove Button */}
            <button
              onClick={() => removeItem(item.productId, item.variant?.id)}
              className="flex-shrink-0 inline-flex items-center justify-center w-10 h-10 bg-white/[0.03] border border-white/[0.08] text-white rounded-lg hover:bg-white/[0.06] transition-all self-center"
            >
              <X size={12} />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
