/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { useSession } from "next-auth/react";
import { 
  CheckCircle, Clock, XCircle, Package, Truck, 
  Building2, Copy, ChevronRight,
  Phone, Mail, ShoppingBag, Check, Lock, Eye, EyeOff, Loader2, Tag
} from "lucide-react";
import { formatPrice } from "@/lib/utils";

// ═══════════════════════════════════════════════════════════════════════════
// ORDER CONFIRMATION PAGE - STEP 3
// ═══════════════════════════════════════════════════════════════════════════

const CONTAINER_MIN_HEIGHT = "800px";

interface OrderItem {
  id: string;
  productId?: string;
  title: string;
  slug?: string;
  price: number;
  quantity: number;
  image?: string | null;
  variant?: { id?: string; name?: string; value: string } | null;
}

interface OrderData {
  orderNumber: string;
  orderDate: string;
  status: "success" | "pending" | "failed";
  paymentStatus: "paid" | "pending" | "failed";
  paymentMethod: "credit_card" | "bank_transfer";
  items: OrderItem[];
  totals: {
    subtotal: number;
    shipping: number;
    discount: number;
    grandTotal: number;
  };
  couponCode?: string;
  billingAddress: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    addressLine1: string;
    city: string;
    district: string;
    postalCode: string;
  } | null;
}

// Loading fallback component
function OrderConfirmationLoading() {
  return (
    <div style={{ minHeight: "100vh", backgroundColor: "var(--background)", display: "flex", alignItems: "center", justifyContent: "center", paddingTop: "120px" }}>
      <div style={{ textAlign: "center" }}>
        <div style={{ width: "64px", height: "64px", borderRadius: "50%", backgroundColor: "var(--glass-bg)", margin: "0 auto 16px" }} className="animate-pulse" />
        <div style={{ height: "24px", width: "192px", backgroundColor: "var(--glass-bg)", borderRadius: "8px", margin: "0 auto" }} className="animate-pulse" />
      </div>
    </div>
  );
}

// Wrapper component with Suspense
export default function OrderConfirmationPage() {
  return (
    <Suspense fallback={<OrderConfirmationLoading />}>
      <OrderConfirmationContent />
    </Suspense>
  );
}

function OrderConfirmationContent() {
  const searchParams = useSearchParams();
  const orderNumber = searchParams.get("orderNumber");
  const { data: session, status: sessionStatus } = useSession();
  
  const [order, setOrder] = useState<OrderData | null>(null);
  const [loading, setLoading] = useState(true);
  const [copiedIban, setCopiedIban] = useState(false);
  
  // Password creation state
  const [password1, setPassword1] = useState("");
  const [password2, setPassword2] = useState("");
  const [showPassword1, setShowPassword1] = useState(false);
  const [showPassword2, setShowPassword2] = useState(false);
  const [passwordSaving, setPasswordSaving] = useState(false);
  const [passwordSaved, setPasswordSaved] = useState(false);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  
  // Determine if user is guest (not logged in)
  const isGuest = sessionStatus === "unauthenticated";
  const showPasswordForm = isGuest && !passwordSaved;
  const showCTAButtons = !isGuest || passwordSaved;
  
  // Password validation
  const password1Valid = password1.length >= 6;
  const password2Valid = password2.length >= 6 && password1 === password2;
  const canSavePassword = password1Valid && password2Valid;

  // Fetch order data
  useEffect(() => {
    if (!orderNumber) {
      setLoading(false);
      return;
    }

    const fetchOrder = async () => {
      try {
        const res = await fetch(`/api/orders/${orderNumber}`);
        if (res.ok) {
          const data = await res.json();
          console.log("Order data:", data);
          setOrder(data);
        }
      } catch (error) {
        console.error("Failed to fetch order:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();
  }, [orderNumber]);

  const copyIban = () => {
    navigator.clipboard.writeText("TR00 0000 0000 0000 0000 0000 00");
    setCopiedIban(true);
    setTimeout(() => setCopiedIban(false), 2000);
  };
  
  // Save password handler - sets password for the user created during checkout
  const handleSavePassword = async () => {
    if (!canSavePassword || !orderNumber) return;
    
    setPasswordSaving(true);
    setPasswordError(null);
    
    try {
      const res = await fetch(`/api/orders/${orderNumber}/set-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password: password1 }),
      });
      
      const data = await res.json();
      
      if (!res.ok) {
        setPasswordError(data.error || "Şifre oluşturulamadı");
      } else {
        setPasswordSaved(true);
        
        // Auto-login the user after password is set
        if (data.email) {
          const { signIn } = await import("next-auth/react");
          const loginResult = await signIn("credentials", {
            email: data.email,
            password: password1,
            redirect: false,
          });
          
          if (loginResult?.ok) {
            // Refresh to update session
            window.location.reload();
          }
        }
      }
    } catch {
      setPasswordError("Bir hata oluştu. Lütfen tekrar deneyin.");
    }
    
    setPasswordSaving(false);
  };

  // Loading state
  if (loading) {
    return (
      <div style={{ minHeight: "100vh", backgroundColor: "var(--background)", display: "flex", alignItems: "center", justifyContent: "center", paddingTop: "120px" }}>
        <div style={{ textAlign: "center" }}>
          <div style={{ width: "64px", height: "64px", borderRadius: "50%", backgroundColor: "var(--glass-bg)", margin: "0 auto 16px" }} className="animate-pulse" />
          <div style={{ height: "24px", width: "192px", backgroundColor: "var(--glass-bg)", borderRadius: "8px", margin: "0 auto" }} className="animate-pulse" />
        </div>
      </div>
    );
  }

  // Use fetched order or show error
  if (!order) {
    return (
      <div style={{ minHeight: "100vh", backgroundColor: "var(--background)", display: "flex", alignItems: "center", justifyContent: "center", paddingTop: "120px" }}>
        <div style={{ textAlign: "center" }}>
          <XCircle size={48} color="rgba(239,68,68,0.6)" style={{ margin: "0 auto 16px" }} />
          <h1 style={{ fontSize: "24px", fontWeight: "700", color: "var(--foreground)", marginBottom: "16px" }}>Sipariş Bulunamadı</h1>
          <p style={{ color: "var(--foreground-tertiary)", marginBottom: "24px" }}>Sipariş bilgilerine ulaşılamadı.</p>
          <Link href="/magaza" style={{ display: "inline-flex", alignItems: "center", gap: "8px", padding: "12px 24px", backgroundColor: "#10b981", color: "#fff", borderRadius: "12px", fontWeight: "500", textDecoration: "none" }}>
            Alışverişe Başla <ChevronRight size={18} />
          </Link>
        </div>
      </div>
    );
  }

  const isPending = order.paymentStatus === "pending";
  const isFailed = order.paymentStatus === "failed";
  const isSuccess = order.paymentStatus === "paid";
  const isBankTransfer = order.paymentMethod === "bank_transfer";

  const containerStyle: React.CSSProperties = {
    backgroundColor: "var(--background-secondary)",
    border: "1px solid var(--glass-border)",
    borderRadius: "16px",
    padding: "40px",
    minHeight: CONTAINER_MIN_HEIGHT
  };

  return (
    <div className="checkout-page" style={{ minHeight: "100vh", backgroundColor: "var(--background)", paddingTop: "120px", paddingBottom: "80px" }}>
      <div className="checkout-container" style={{ maxWidth: "1400px", margin: "0 auto", padding: "0 16px" }}>
        {/* Steps - All Completed */}
        <div className="checkout-steps" style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "12px", marginBottom: "32px" }}>
          <div className="checkout-step checkout-step-completed" style={{ display: "flex", alignItems: "center", gap: "8px", opacity: 0.6 }}>
            <div className="checkout-step-number" style={{ width: "32px", height: "32px", borderRadius: "50%", backgroundColor: "rgba(16,185,129,0.2)", border: "2px solid #10b981", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Check size={16} color="#10b981" strokeWidth={3} />
            </div>
            <span className="checkout-step-label" style={{ fontSize: "13px", fontWeight: "500", color: "var(--foreground)" }}>Adres & Teslimat</span>
          </div>
          <ChevronRight size={16} className="checkout-step-arrow text-foreground-muted" />
          <div className="checkout-step checkout-step-completed" style={{ display: "flex", alignItems: "center", gap: "8px", opacity: 0.6 }}>
            <div className="checkout-step-number" style={{ width: "32px", height: "32px", borderRadius: "50%", backgroundColor: "rgba(16,185,129,0.2)", border: "2px solid #10b981", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Check size={16} color="#10b981" strokeWidth={3} />
            </div>
            <span className="checkout-step-label" style={{ fontSize: "13px", fontWeight: "500", color: "var(--foreground)" }}>Ödeme</span>
          </div>
          <ChevronRight size={16} className="checkout-step-arrow text-foreground-muted" />
          <div className="checkout-step checkout-step-active" style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <div className="checkout-step-number" style={{ width: "32px", height: "32px", borderRadius: "50%", backgroundColor: "#10b981", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Check size={16} className="text-white" strokeWidth={3} />
            </div>
            <span className="checkout-step-label checkout-step-label-long" style={{ fontSize: "13px", fontWeight: "500", color: "var(--foreground)" }}>Sipariş Tamamlama</span>
          </div>
        </div>

        {/* Main Grid - Aynı genişlikte 2 sütun gibi görünsün ama ortada tek */}
        <div className="checkout-main-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}>
          {/* LEFT - Status & Bank Info */}
          <div className="checkout-left-column" style={containerStyle}>
            {/* Status Icon */}
            <div style={{ textAlign: "center", marginBottom: "32px" }}>
              <div style={{
                width: "80px",
                height: "80px",
                borderRadius: "50%",
                backgroundColor: isSuccess ? "rgba(16,185,129,0.1)" : isPending || isBankTransfer ? "rgba(251,191,36,0.1)" : "rgba(239,68,68,0.1)",
                border: `1px solid ${isSuccess ? "rgba(16,185,129,0.3)" : isPending || isBankTransfer ? "rgba(251,191,36,0.3)" : "rgba(239,68,68,0.3)"}`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                margin: "0 auto 24px"
              }}>
                {isSuccess && <CheckCircle size={40} color="#10b981" />}
                {(isPending || isBankTransfer) && <Clock size={40} color="#fbbf24" />}
                {isFailed && <XCircle size={40} color="#ef4444" />}
              </div>
              <h1 style={{ fontSize: "24px", fontWeight: "700", color: "var(--foreground)", marginBottom: "8px" }}>
                {isSuccess && "Siparişiniz Alındı!"}
                {(isPending || isBankTransfer) && "Ödeme Bekleniyor"}
                {isFailed && "Ödeme Başarısız"}
              </h1>
              <p style={{ color: "var(--foreground-tertiary)", fontSize: "14px" }}>
                {isSuccess && "Siparişiniz başarıyla oluşturuldu."}
                {(isPending || isBankTransfer) && "Havale/EFT ödemeniz bekleniyor."}
                {isFailed && "Ödeme işlemi başarısız oldu. Lütfen tekrar deneyin."}
              </p>
            </div>

            {/* Order Number */}
            <div style={{
              padding: "24px",
              backgroundColor: "var(--glass-bg)",
              border: "1px solid var(--border)",
              borderRadius: "12px",
              textAlign: "center",
              marginBottom: "24px"
            }}>
              <p style={{ fontSize: "13px", color: "var(--foreground-tertiary)", marginBottom: "4px" }}>Sipariş Numarası</p>
              <p style={{ fontSize: "24px", fontWeight: "700", color: "var(--foreground)", fontFamily: "monospace" }}>
                {order.orderNumber}
              </p>
              <p style={{ fontSize: "12px", color: "var(--foreground-muted)", marginTop: "8px" }}>
                {new Date(order.orderDate).toLocaleString("tr-TR", {
                  dateStyle: "long",
                  timeStyle: "short",
                })}
              </p>
            </div>

            {/* Bank Transfer Info */}
            {(isPending || isBankTransfer) && (
              <div style={{
                padding: "24px",
                backgroundColor: "rgba(251,191,36,0.05)",
                border: "1px solid rgba(251,191,36,0.2)",
                borderRadius: "12px",
                marginBottom: "24px"
              }}>
                <h3 style={{ fontSize: "15px", fontWeight: "600", color: "#fbbf24", marginBottom: "16px", display: "flex", alignItems: "center", gap: "8px" }}>
                  <Building2 size={18} /> Havale/EFT Bilgileri
                </h3>
                <div style={{ display: "flex", flexDirection: "column", gap: "8px", marginBottom: "16px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: "13px" }}>
                    <span style={{ color: "var(--foreground-tertiary)" }}>Banka:</span>
                    <span style={{ color: "var(--foreground)" }}>Ziraat Bankası</span>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: "13px" }}>
                    <span style={{ color: "var(--foreground-tertiary)" }}>Hesap Sahibi:</span>
                    <span style={{ color: "var(--foreground)" }}>FusionMarkt A.Ş.</span>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: "13px" }}>
                    <span style={{ color: "var(--foreground-tertiary)" }}>IBAN:</span>
                    <span style={{ color: "var(--foreground)", fontFamily: "monospace" }}>TR00 0000 0000 0000 0000 0000 00</span>
                  </div>
                </div>
                <button
                  onClick={copyIban}
                  style={{
                    width: "100%",
                    height: "40px",
                    backgroundColor: "rgba(251,191,36,0.2)",
                    border: "1px solid rgba(251,191,36,0.3)",
                    borderRadius: "8px",
                    fontSize: "13px",
                    fontWeight: "500",
                    color: "#fbbf24",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "8px"
                  }}
                >
                  {copiedIban ? <CheckCircle size={16} /> : <Copy size={16} />}
                  {copiedIban ? "Kopyalandı!" : "IBAN'ı Kopyala"}
                </button>
                <p style={{ fontSize: "11px", color: "var(--foreground-tertiary)", marginTop: "12px", textAlign: "center" }}>
                  Açıklama kısmına sipariş numaranızı yazınız: {order.orderNumber}
                </p>
              </div>
            )}

            {/* Delivery Info */}
            {order.billingAddress && (
              <div>
                <h3 style={{ fontSize: "15px", fontWeight: "600", color: "var(--foreground)", marginBottom: "16px", display: "flex", alignItems: "center", gap: "8px" }}>
                  <Truck size={18} /> Teslimat Bilgileri
                </h3>
                <div style={{ padding: "16px", backgroundColor: "var(--glass-bg)", border: "1px solid var(--border)", borderRadius: "12px" }}>
                  <p style={{ fontSize: "14px", fontWeight: "500", color: "var(--foreground)", marginBottom: "4px" }}>
                    {order.billingAddress.firstName} {order.billingAddress.lastName}
                  </p>
                  <p style={{ fontSize: "13px", color: "var(--foreground-tertiary)", marginBottom: "4px" }}>
                    {order.billingAddress.addressLine1}
                  </p>
                  <p style={{ fontSize: "13px", color: "var(--foreground-tertiary)", marginBottom: "8px" }}>
                    {order.billingAddress.district && `${order.billingAddress.district}, `}{order.billingAddress.city} {order.billingAddress.postalCode}
                  </p>
                  <div style={{ display: "flex", gap: "16px", fontSize: "12px", color: "var(--foreground-muted)" }}>
                    <span style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                      <Phone size={12} /> {order.billingAddress.phone}
                    </span>
                    {order.billingAddress.email && (
                      <span style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                        <Mail size={12} /> {order.billingAddress.email}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* RIGHT - Order Summary */}
          <div className="checkout-right-column" style={containerStyle}>
            {/* Order Items Header */}
            <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "24px" }}>
              <div style={{ width: "44px", height: "44px", borderRadius: "12px", backgroundColor: "var(--glass-bg)", border: "1px solid var(--border)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <Package size={20} className="text-foreground-secondary" />
              </div>
              <div>
                <h2 style={{ fontSize: "18px", fontWeight: "600", color: "var(--foreground)" }}>Sipariş Özeti</h2>
                <span style={{ fontSize: "13px", color: "var(--foreground-muted)" }}>{order.items.length} ürün</span>
              </div>
            </div>

            {/* Products */}
            <div style={{ display: "flex", flexDirection: "column", gap: "12px", marginBottom: "24px" }}>
              {order.items.map((item) => (
                <div key={item.id} style={{ display: "flex", gap: "16px", padding: "16px", backgroundColor: "var(--glass-bg)", border: "1px solid var(--border)", borderRadius: "12px" }}>
                  <div style={{ position: "relative", width: "64px", height: "64px", backgroundColor: "var(--background-secondary)", borderRadius: "8px", overflow: "hidden", flexShrink: 0 }}>
                    {item.image ? (
                      <Image src={item.image} alt={item.title} fill sizes="64px" style={{ objectFit: "contain" }} />
                    ) : (
                      <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center" }}>
                        <Package size={20} className="text-foreground-muted" />
                      </div>
                    )}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <h4 style={{ fontSize: "14px", fontWeight: "500", color: "var(--foreground)", marginBottom: "4px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {item.title}
                    </h4>
                    {item.variant && (
                      <p style={{ fontSize: "12px", color: "var(--foreground-muted)", marginBottom: "4px" }}>{item.variant.value}</p>
                    )}
                    <p style={{ fontSize: "12px", color: "var(--foreground-tertiary)" }}>Adet: {item.quantity}</p>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <span style={{ fontSize: "14px", fontWeight: "600", color: "var(--foreground)" }}>{formatPrice(item.price * item.quantity)}</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Totals */}
            <div style={{ borderTop: "1px solid var(--border)", paddingTop: "20px", marginBottom: "24px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "14px", marginBottom: "12px" }}>
                <span style={{ color: "var(--foreground-tertiary)" }}>Ara Toplam</span>
                <span style={{ color: "var(--foreground)" }}>{formatPrice(order.totals.subtotal)}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "14px", marginBottom: "12px" }}>
                <span style={{ color: "var(--foreground-tertiary)" }}>Kargo</span>
                <span style={{ color: order.totals.shipping === 0 ? "#10b981" : "var(--foreground)" }}>
                  {order.totals.shipping === 0 ? "Ücretsiz" : formatPrice(order.totals.shipping)}
                </span>
              </div>
              {order.totals.discount > 0 && (
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "14px", marginBottom: "12px" }}>
                  <span style={{ color: "#10b981", display: "flex", alignItems: "center", gap: "6px" }}>
                    <Tag size={14} />
                    {order.couponCode ? `Kupon (${order.couponCode})` : "İndirim"}
                  </span>
                  <span style={{ color: "#10b981", fontWeight: "500" }}>-{formatPrice(order.totals.discount)}</span>
                </div>
              )}
              <div style={{ display: "flex", justifyContent: "space-between", paddingTop: "16px", borderTop: "1px solid var(--border)" }}>
                <span style={{ fontSize: "16px", fontWeight: "600", color: "var(--foreground)" }}>Toplam</span>
                <span style={{ fontSize: "20px", fontWeight: "700", color: "var(--foreground)" }}>{formatPrice(order.totals.grandTotal)}</span>
              </div>
            </div>

            {/* Password Creation Form - For Guest Users */}
            {showPasswordForm && order?.billingAddress?.email && (
              <div style={{
                padding: "24px",
                backgroundColor: "rgba(16,185,129,0.05)",
                border: "1px solid rgba(16,185,129,0.2)",
                borderRadius: "12px",
                marginBottom: "24px"
              }}>
                <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "16px" }}>
                  <div style={{
                    width: "40px",
                    height: "40px",
                    borderRadius: "10px",
                    backgroundColor: "rgba(16,185,129,0.1)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center"
                  }}>
                    <Lock size={20} color="#10b981" />
                  </div>
                  <div>
                    <h3 style={{ fontSize: "15px", fontWeight: "600", color: "var(--foreground)", marginBottom: "2px" }}>
                      Şifre Oluşturarak Üyeliğinizi Tamamlayın
                    </h3>
                    <p style={{ fontSize: "12px", color: "var(--foreground-tertiary)" }}>
                      Siparişlerinizi takip etmek için şifre oluşturun
                    </p>
                  </div>
                </div>
                
                {/* Password 1 */}
                <div style={{ marginBottom: "12px" }}>
                  <label style={{ display: "block", fontSize: "13px", color: "var(--foreground-secondary)", marginBottom: "6px" }}>
                    Şifre
                  </label>
                  <div style={{ position: "relative" }}>
                    <input
                      type={showPassword1 ? "text" : "password"}
                      value={password1}
                      onChange={(e) => setPassword1(e.target.value)}
                      placeholder="En az 6 karakter"
                      style={{
                        width: "100%",
                        height: "48px",
                        padding: "0 48px 0 16px",
                        backgroundColor: "var(--input-bg)",
                        border: password1Valid ? "1px solid rgba(16,185,129,0.4)" : "1px solid var(--input-border)",
                        borderRadius: "12px",
                        fontSize: "15px",
                        color: "var(--foreground)",
                        outline: "none"
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword1(!showPassword1)}
                      style={{
                        position: "absolute",
                        right: "12px",
                        top: "50%",
                        transform: "translateY(-50%)",
                        background: "none",
                        border: "none",
                        cursor: "pointer",
                        color: "var(--foreground-muted)"
                      }}
                    >
                      {showPassword1 ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>
                
                {/* Password 2 - Only show when password1 is valid */}
                {password1Valid && (
                  <div style={{ marginBottom: "16px" }}>
                    <label style={{ display: "block", fontSize: "13px", color: "var(--foreground-secondary)", marginBottom: "6px" }}>
                      Şifre Tekrar
                    </label>
                    <div style={{ position: "relative" }}>
                      <input
                        type={showPassword2 ? "text" : "password"}
                        value={password2}
                        onChange={(e) => setPassword2(e.target.value)}
                        placeholder="Şifreyi tekrar girin"
                        style={{
                          width: "100%",
                          height: "48px",
                          padding: "0 48px 0 16px",
                          backgroundColor: "var(--input-bg)",
                          border: password2Valid ? "1px solid rgba(16,185,129,0.4)" : password2.length > 0 && password1 !== password2 ? "1px solid rgba(239,68,68,0.4)" : "1px solid var(--input-border)",
                          borderRadius: "12px",
                          fontSize: "15px",
                          color: "var(--foreground)",
                          outline: "none"
                        }}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword2(!showPassword2)}
                        style={{
                          position: "absolute",
                          right: "12px",
                          top: "50%",
                          transform: "translateY(-50%)",
                          background: "none",
                          border: "none",
                          cursor: "pointer",
                          color: "var(--foreground-muted)"
                        }}
                      >
                        {showPassword2 ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                    </div>
                    {password2.length > 0 && password1 !== password2 && (
                      <p style={{ fontSize: "12px", color: "#ef4444", marginTop: "6px" }}>
                        Şifreler eşleşmiyor
                      </p>
                    )}
                  </div>
                )}
                
                {/* Error Message */}
                {passwordError && (
                  <div style={{
                    padding: "12px",
                    backgroundColor: "rgba(239,68,68,0.1)",
                    border: "1px solid rgba(239,68,68,0.2)",
                    borderRadius: "8px",
                    marginBottom: "12px",
                    fontSize: "13px",
                    color: "#ef4444"
                  }}>
                    {passwordError}
                  </div>
                )}
                
                {/* Save Button */}
                <button
                  onClick={handleSavePassword}
                  disabled={!canSavePassword || passwordSaving}
                  style={{
                    width: "100%",
                    height: "48px",
                    backgroundColor: canSavePassword ? "#10b981" : "var(--glass-bg)",
                    border: "none",
                    borderRadius: "12px",
                    fontSize: "15px",
                    fontWeight: "600",
                    color: canSavePassword ? "#fff" : "var(--foreground-muted)",
                    cursor: canSavePassword ? "pointer" : "not-allowed",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "8px",
                    transition: "all 0.2s"
                  }}
                >
                  {passwordSaving ? (
                    <>
                      <Loader2 size={18} className="animate-spin" />
                      Kaydediliyor...
                    </>
                  ) : (
                    <>
                      <Check size={18} />
                      Kaydet
                    </>
                  )}
                </button>
              </div>
            )}

            {/* Action Buttons - Show after password saved or if logged in */}
            {showCTAButtons && (
              <div style={{ display: "flex", gap: "12px", marginBottom: "24px" }}>
                <Link
                  href="/hesabim"
                  style={{
                    flex: 1,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "8px",
                    height: "48px",
                    fontWeight: "500",
                    borderRadius: "12px",
                    border: "1px solid var(--border)",
                    backgroundColor: "transparent",
                    color: "var(--foreground)",
                    textDecoration: "none"
                  }}
                >
                  <ShoppingBag size={18} />
                  Siparişlerim
                </Link>
                <Link
                  href="/magaza"
                  style={{
                    flex: 1,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "8px",
                    height: "48px",
                    fontWeight: "600",
                    borderRadius: "12px",
                    backgroundColor: "#10b981",
                    color: "#fff",
                    textDecoration: "none"
                  }}
                >
                  Alışverişe Devam Et
                  <ChevronRight size={18} />
                </Link>
              </div>
            )}

            {/* Support Info */}
            <div style={{ textAlign: "center", paddingTop: "24px", borderTop: "1px solid var(--border)" }}>
              <p style={{ fontSize: "12px", color: "var(--foreground-muted)", marginBottom: "8px" }}>
                Sorularınız için bize ulaşın
              </p>
              <div style={{ display: "flex", justifyContent: "center", gap: "24px", fontSize: "13px" }}>
                <a href="mailto:info@fusionmarkt.com" style={{ color: "var(--foreground-secondary)", textDecoration: "none", display: "flex", alignItems: "center", gap: "6px" }}>
                  <Mail size={14} /> info@fusionmarkt.com
                </a>
                <a href="tel:+908508406160" style={{ color: "var(--foreground-secondary)", textDecoration: "none", display: "flex", alignItems: "center", gap: "6px" }}>
                  <Phone size={14} /> +90 850 840 6160
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
