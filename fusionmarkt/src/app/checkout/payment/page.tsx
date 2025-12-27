/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import {
  ChevronRight, ChevronLeft, Check, Loader2, ShieldCheck,
  CreditCard, Building2, FileText, Package, Trash2, Heart,
  Edit2, Minus, Plus, ChevronDown, Tag
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useCheckout } from "@/context/CheckoutContext";
import { useCart } from "@/context/CartContext";
import { useFavorites } from "@/context/FavoritesContext";
import { formatPrice } from "@/lib/utils";
import ContractModal from "@/components/checkout/ContractModal";

// ═══════════════════════════════════════════════════════════════════════════
// PAYMENT PAGE - STEP 2
// ═══════════════════════════════════════════════════════════════════════════

const CONTAINER_MIN_HEIGHT = "800px";

interface SavedAddress {
  id: string;
  title: string;
  address: string;
  city: string;
  district: string;
  phone: string;
  isDefault: boolean;
}

interface AddressApiResponse {
  id: string;
  title?: string;
  addressLine1?: string;
  address?: string;
  city?: string;
  district?: string;
  phone?: string;
  isDefault?: boolean;
}

export default function PaymentPage() {
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  const { state, setContractAccepted } = useCheckout();
  const { items, updateQuantity, removeItem, subtotal, originalSubtotal, totalSavings, clearCart } = useCart();
  const { addItem: addFavorite } = useFavorites();

  // Address state (used for future address selection feature)
  const [_savedAddresses, setSavedAddresses] = useState<SavedAddress[]>([]);
  const [_selectedAddressId, setSelectedAddressId] = useState<string | null>(null);
  const [_loadingAddresses, setLoadingAddresses] = useState(false);

  // Payment state
  const [paymentMethod, setPaymentMethod] = useState<"card" | "bank">("card");
  const [cardHolderName, setCardHolderName] = useState("");
  const [cardNumber, setCardNumber] = useState("");
  const [expiryMonth, setExpiryMonth] = useState("");
  const [expiryYear, setExpiryYear] = useState("");
  const [cvv, setCvv] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Hover states
  const [hoverConfirm, setHoverConfirm] = useState(false);
  const [hoverBack, setHoverBack] = useState(false);

  // Contract modal states
  const [contractModalOpen, setContractModalOpen] = useState(false);
  const [activeContractType, setActiveContractType] = useState<"termsAndConditions" | "distanceSalesContract">("termsAndConditions");

  // Generate order reference number (pre-order reference)
  const orderRefNumber = useMemo(() => {
    const timestamp = Date.now().toString(36).toUpperCase();
    const random = Math.random().toString(36).substring(2, 6).toUpperCase();
    return `FM-${timestamp.slice(-4)}-${random}`;
  }, []);

  // Coupon state from checkout page
  const [appliedCoupon, setAppliedCoupon] = useState<{
    id: string;
    code: string;
    discountType: string;
    discountValue: number;
    discount: number;
  } | null>(null);

  // Load coupon from sessionStorage
  useEffect(() => {
    const savedCoupon = sessionStorage.getItem("appliedCoupon");
    if (savedCoupon) {
      try {
        setAppliedCoupon(JSON.parse(savedCoupon));
      } catch (e) {
        console.error("Failed to parse coupon:", e);
      }
    }
  }, []);

  // Fetch saved addresses
  useEffect(() => {
    if (isAuthenticated) {
      setLoadingAddresses(true);
      fetch("/api/user/addresses")
        .then(res => res.json())
        .then(data => {
          // API { addresses: [...] } şeklinde döndürüyor
          const addressList = data.addresses || data;
          if (Array.isArray(addressList) && addressList.length > 0) {
            const formatted = addressList.map((addr: AddressApiResponse) => ({
              id: addr.id,
              title: addr.title || "Adres",
              address: `${addr.addressLine1 || addr.address || ""}, ${addr.district || ""}, ${addr.city || ""}`,
              city: addr.city || "",
              district: addr.district || "",
              phone: addr.phone || "",
              isDefault: addr.isDefault || false
            }));
            setSavedAddresses(formatted);
            const defaultAddr = formatted.find((a: SavedAddress) => a.isDefault) || formatted[0];
            if (defaultAddr) setSelectedAddressId(defaultAddr.id);
          }
        })
        .catch(() => {})
        .finally(() => setLoadingAddresses(false));
    }
  }, [isAuthenticated]);

  // Kargo ücretini API'den çek
  const [shippingCost, setShippingCost] = useState(0);
  const [_shippingLoading, setShippingLoading] = useState(true);

  // Redirect validations
  useEffect(() => {
    if (items.length === 0) {
      router.push("/checkout");
    } else if (!state.billingAddress?.firstName || !state.billingAddress?.email) {
      router.push("/checkout");
    }
  }, [items.length, state.billingAddress, router]);

  useEffect(() => {
    const fetchShippingCost = async () => {
      if (items.length === 0) return;
      
      setShippingLoading(true);
      try {
        const res = await fetch("/api/public/shipping/calculate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            items: items.map(item => ({
              productId: item.productId,
              quantity: item.quantity,
              price: item.price,
            })),
          }),
        });
        
        if (res.ok) {
          const data = await res.json();
          // API'den gelen kargo ücretini kullan
          if (data.hasFreeShipping) {
            setShippingCost(0);
          } else if (data.options?.length > 0) {
            setShippingCost(data.options[0].cost || 0);
          }
        }
      } catch (error) {
        console.error("Error fetching shipping cost:", error);
        // Hata durumunda 0 bırak, API'siz devam etme
        setShippingCost(0);
      } finally {
        setShippingLoading(false);
      }
    };
    
    fetchShippingCost();
  }, [items]);

  // Early return - after all hooks
  if (items.length === 0 || !state.billingAddress?.firstName || !state.billingAddress?.email) {
    return (
      <div style={{ minHeight: "100vh", backgroundColor: "#050505", display: "flex", alignItems: "center", justifyContent: "center", paddingTop: "120px" }}>
        <div style={{ textAlign: "center" }}>
          <div style={{ width: "64px", height: "64px", borderRadius: "50%", backgroundColor: "rgba(255,255,255,0.1)", margin: "0 auto 16px" }} />
          <p style={{ color: "rgba(255,255,255,0.5)" }}>Yönlendiriliyor...</p>
        </div>
      </div>
    );
  }

  const couponDiscount = appliedCoupon?.discount || 0;
  const total = subtotal + shippingCost - couponDiscount;

  // Card number format
  const formatCardNumber = (value: string) => {
    const digits = value.replace(/\D/g, "").slice(0, 16);
    return digits.match(/.{1,4}/g)?.join(" ") || digits;
  };

  // Move to favorites
  const handleMoveToFavorites = (item: typeof items[0]) => {
    addFavorite({
      productId: item.productId,
      title: item.title,
      slug: item.slug,
      price: item.price,
      image: item.image || "",
      brand: item.brand,
    });
    removeItem(item.id);
  };

  // Submit order
  const handleCompleteOrder = async () => {
    const newErrors: Record<string, string> = {};
    if (!state.contractsAccepted.termsAndConditions) newErrors.termsAndConditions = "Sözleşmeyi kabul etmelisiniz";
    if (!state.contractsAccepted.distanceSalesContract) newErrors.distanceSalesContract = "Sözleşmeyi kabul etmelisiniz";
    
    if (paymentMethod === "card") {
      if (!cardHolderName.trim()) newErrors.cardHolderName = "Kart sahibi adı gerekli";
      if (cardNumber.replace(/\s/g, "").length !== 16) newErrors.cardNumber = "Geçerli kart numarası girin";
      if (!expiryMonth) newErrors.expiryMonth = "Ay seçin";
      if (!expiryYear) newErrors.expiryYear = "Yıl seçin";
      if (cvv.length !== 3) newErrors.cvv = "CVV 3 haneli olmalı";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setErrors({});
    setIsSubmitting(true);

    // Sipariş verileri - items'ı şimdi kaydet çünkü sonra silinecek
    const orderItems = items.map(item => ({
      productId: item.productId,
      variantId: item.variant?.id,
      quantity: item.quantity,
      price: item.price,
    }));

    try {
      // 1. Önce siparişi oluştur (PENDING_PAYMENT status ile)
      const orderData = {
        billingAddress: state.billingAddress,
        shippingAddress: state.shippingAddress || state.billingAddress,
        shippingMethod: state.shippingMethod,
        paymentMethod: paymentMethod === "card" ? "credit_card" : "bank_transfer",
        items: orderItems,
        subtotal,
        shippingCost,
        discount: couponDiscount,
        couponId: appliedCoupon?.id,
        couponCode: appliedCoupon?.code,
        total,
        // Sözleşme onayları - API'ye gönderilecek
        contracts: {
          termsAndConditions: state.contractsAccepted.termsAndConditions,
          distanceSalesContract: state.contractsAccepted.distanceSalesContract,
          newsletter: state.contractsAccepted.newsletter,
        },
      };

      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(orderData),
      });

      const result = await res.json();

      if (!res.ok) {
        // Check if email is registered - redirect to checkout to login
        if (result.code === "EMAIL_REGISTERED") {
          alert(result.error || "Bu e-posta adresi kayıtlı. Lütfen giriş yapın.");
          router.push("/checkout");
          return;
        }
        throw new Error(result.error || "Sipariş oluşturulamadı");
      }

      const orderNumber = result.orderNumber;

      // 2. Kredi kartı ödeme ise iyzico 3D Secure başlat
      if (paymentMethod === "card") {
        // Basket items hazırla (iyzico için)
        const basketItems = items.map(item => ({
          id: item.productId,
          name: item.title.substring(0, 50),
          category: "Elektronik",
          price: item.price,
          quantity: item.quantity,
        }));

        // Buyer bilgileri
        const buyer = {
          id: state.billingAddress?.email || `guest-${Date.now()}`,
          name: state.billingAddress?.firstName || "Misafir",
          surname: state.billingAddress?.lastName || "Kullanıcı",
          email: state.billingAddress?.email || "",
          phone: state.billingAddress?.phone || "",
          identityNumber: "11111111111", // TC Kimlik (zorunlu alan)
        };

        // Shipping address
        const shippingAddr = state.shippingAddress || state.billingAddress;
        const shippingAddress = {
          contactName: `${shippingAddr?.firstName || ""} ${shippingAddr?.lastName || ""}`.trim(),
          city: shippingAddr?.city || "İstanbul",
          address: shippingAddr?.addressLine1 || "",
          zipCode: shippingAddr?.postalCode || "00000",
        };

        // 3D Secure başlat
        const paymentRes = await fetch("/api/payment/initialize", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            orderNumber,
            cardHolderName,
            cardNumber: cardNumber.replace(/\s/g, ""),
            expireMonth: expiryMonth,
            expireYear: expiryYear,
            cvc: cvv,
            buyer,
            shippingAddress,
            billingAddress: shippingAddress, // Aynı adres kullan
            basketItems,
            price: total,
            paidPrice: total,
          }),
        });

        const paymentResult = await paymentRes.json();

        if (!paymentRes.ok || !paymentResult.success) {
          throw new Error(paymentResult.error || "Ödeme başlatılamadı");
        }

        // Kullanıcı profilini güncelle (ad/soyad/telefon bilgilerini kaydet)
        if (isAuthenticated && state.billingAddress) {
          try {
            const profileData: Record<string, string> = {};
            const fullName = `${state.billingAddress.firstName || ""} ${state.billingAddress.lastName || ""}`.trim();
            if (fullName) profileData.name = fullName;
            if (state.billingAddress.phone) profileData.phone = state.billingAddress.phone;
            
            if (Object.keys(profileData).length > 0) {
              await fetch("/api/user/profile", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(profileData),
              });
            }
          } catch (profileError) {
            console.error("Profile update failed:", profileError);
          }
        }

        // Kupon bilgisini temizle
        sessionStorage.removeItem("appliedCoupon");
        
        // Sepeti temizle
        clearCart();

        // 3D Secure HTML'i sessionStorage'a kaydet
        sessionStorage.setItem("iyzico3DSHtml", paymentResult.htmlContent);
        
        // 3D Secure sayfasına yönlendir
        router.push("/checkout/3d-secure");
        return;
      }

      // Havale/EFT için normal akış
      // Kullanıcı profilini güncelle (ad/soyad/telefon bilgilerini kaydet)
      if (isAuthenticated && state.billingAddress) {
        try {
          const profileData: Record<string, string> = {};
          const fullName = `${state.billingAddress.firstName || ""} ${state.billingAddress.lastName || ""}`.trim();
          if (fullName) profileData.name = fullName;
          if (state.billingAddress.phone) profileData.phone = state.billingAddress.phone;
          
          if (Object.keys(profileData).length > 0) {
            await fetch("/api/user/profile", {
              method: "PUT",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(profileData),
            });
          }
        } catch (profileError) {
          console.error("Profile update failed:", profileError);
          // Profil güncelleme başarısız olsa bile devam et
        }
      }

      // Kupon bilgisini temizle
      sessionStorage.removeItem("appliedCoupon");
      
      // Sepeti temizle
      clearCart();
      
      // Yönlendirme yap
      window.location.href = `/order-confirmation?orderNumber=${orderNumber}`;
      
    } catch (error) {
      setErrors({ general: error instanceof Error ? error.message : "Bir hata oluştu" });
      setIsSubmitting(false);
    }
  };

  // Styles
  const inputStyle: React.CSSProperties = {
    width: "100%",
    height: "48px",
    padding: "0 16px",
    backgroundColor: "#0f0f0f",
    border: "1px solid rgba(255,255,255,0.2)",
    borderRadius: "12px",
    fontSize: "14px",
    color: "#fff",
    outline: "none"
  };

  const selectStyle: React.CSSProperties = {
    ...inputStyle,
    appearance: "none",
    cursor: "pointer"
  };

  const labelStyle: React.CSSProperties = {
    display: "flex",
    alignItems: "center",
    gap: "6px",
    fontSize: "13px",
    fontWeight: "500",
    color: "rgba(255,255,255,0.6)",
    marginBottom: "8px"
  };

  const containerStyle: React.CSSProperties = {
    backgroundColor: "#0a0a0a",
    border: "1px solid rgba(255,255,255,0.1)",
    borderRadius: "16px",
    padding: "28px",
    minHeight: CONTAINER_MIN_HEIGHT
  };

  return (
    <div className="checkout-page" style={{ minHeight: "100vh", backgroundColor: "#050505", paddingTop: "120px", paddingBottom: "80px" }}>
      <div className="checkout-container" style={{ maxWidth: "1400px", margin: "0 auto", padding: "0 16px" }}>
        {/* Steps */}
        <div className="checkout-steps" style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "12px", marginBottom: "32px" }}>
          <Link href="/checkout" className="checkout-step checkout-step-completed" style={{ display: "flex", alignItems: "center", gap: "8px", textDecoration: "none" }}>
            <div className="checkout-step-number" style={{ width: "32px", height: "32px", borderRadius: "50%", backgroundColor: "rgba(255,255,255,0.2)", border: "2px solid #fff", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Check size={16} color="#fff" strokeWidth={3} />
            </div>
            <span className="checkout-step-label" style={{ fontSize: "13px", fontWeight: "500", color: "#fff" }}>Adres & Teslimat</span>
          </Link>
          <ChevronRight size={16} color="rgba(255,255,255,0.3)" className="checkout-step-arrow" />
          <div className="checkout-step checkout-step-active" style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <div className="checkout-step-number" style={{ width: "32px", height: "32px", borderRadius: "50%", backgroundColor: "#fff", color: "#000", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "14px", fontWeight: "700" }}>2</div>
            <span className="checkout-step-label" style={{ fontSize: "13px", fontWeight: "500", color: "#fff" }}>Ödeme</span>
          </div>
          <ChevronRight size={16} color="rgba(255,255,255,0.3)" className="checkout-step-arrow" />
          <div className="checkout-step" style={{ display: "flex", alignItems: "center", gap: "8px", opacity: 0.4 }}>
            <div className="checkout-step-number" style={{ width: "32px", height: "32px", borderRadius: "50%", backgroundColor: "rgba(255,255,255,0.1)", color: "rgba(255,255,255,0.5)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "14px", fontWeight: "700" }}>3</div>
            <span className="checkout-step-label checkout-step-label-long" style={{ fontSize: "13px", fontWeight: "500", color: "rgba(255,255,255,0.5)" }}>Sipariş Tamamlama</span>
          </div>
        </div>

        {/* Main Grid - HER ZAMAN yan yana */}
        <div className="checkout-main-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}>
          {/* LEFT COLUMN */}
          <div className="checkout-left-column" style={containerStyle}>
            {/* Address Summary - Checkout'tan gelen adres bilgilerini göster */}
            <div style={{ marginBottom: "24px" }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "16px" }}>
                <h2 style={{ fontSize: "18px", fontWeight: "600", color: "#fff" }}>Teslimat Adresi</h2>
                <Link href="/checkout" style={{ fontSize: "13px", color: "rgba(255,255,255,0.6)", textDecoration: "none", display: "flex", alignItems: "center", gap: "4px" }}>
                  <Edit2 size={12} /> Düzenle
                </Link>
              </div>
              <div style={{ padding: "16px", backgroundColor: "rgba(16,185,129,0.05)", border: "1px solid rgba(16,185,129,0.2)", borderRadius: "12px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "8px" }}>
                  {/* Yeni adres mi kayıtlı adres mi göster */}
                  {state.billingAddress?.id ? (
                    <span style={{ fontSize: "10px", padding: "2px 8px", backgroundColor: "rgba(16,185,129,0.2)", color: "#10b981", borderRadius: "999px" }}>Kayıtlı Adres</span>
                  ) : (
                    <span style={{ fontSize: "10px", padding: "2px 8px", backgroundColor: "rgba(59,130,246,0.2)", color: "#3b82f6", borderRadius: "999px" }}>Yeni Adres</span>
                  )}
                  {state.billingAddress?.saveToAddresses && (
                    <span style={{ fontSize: "10px", padding: "2px 8px", backgroundColor: "rgba(255,255,255,0.1)", color: "rgba(255,255,255,0.6)", borderRadius: "999px" }}>Kaydedilecek</span>
                  )}
                </div>
                <p style={{ fontSize: "14px", fontWeight: "500", color: "#fff", marginBottom: "4px" }}>
                  {state.billingAddress?.firstName} {state.billingAddress?.lastName}
                </p>
                <p style={{ fontSize: "12px", color: "rgba(255,255,255,0.6)", marginBottom: "4px" }}>
                  {state.billingAddress?.addressLine1}
                  {state.billingAddress?.addressLine2 && `, ${state.billingAddress.addressLine2}`}
                </p>
                <p style={{ fontSize: "12px", color: "rgba(255,255,255,0.5)", marginBottom: "4px" }}>
                  {state.billingAddress?.district}, {state.billingAddress?.city} {state.billingAddress?.postalCode}
                </p>
                <p style={{ fontSize: "12px", color: "rgba(255,255,255,0.4)" }}>{state.billingAddress?.phone}</p>
              </div>
            </div>

            {/* Payment Methods */}
            <div style={{ marginBottom: "24px" }}>
              <h2 style={{ fontSize: "18px", fontWeight: "600", color: "#fff", marginBottom: "16px" }}>Ödeme Yöntemi</h2>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginBottom: "16px" }}>
                <button
                  type="button"
                  onClick={() => setPaymentMethod("card")}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "8px",
                    height: "48px",
                    borderRadius: "12px",
                    border: paymentMethod === "card" ? "1px solid rgba(255,255,255,0.4)" : "1px solid rgba(255,255,255,0.2)",
                    backgroundColor: paymentMethod === "card" ? "rgba(255,255,255,0.05)" : "#0f0f0f",
                    color: paymentMethod === "card" ? "#fff" : "rgba(255,255,255,0.6)",
                    fontSize: "13px",
                    fontWeight: "500",
                    cursor: "pointer",
                    padding: "0 12px",
                    overflow: "hidden"
                  }}
                >
                  <span className="hidden sm:inline"><CreditCard size={16} /></span>
                  <span className="hidden sm:inline">Kredi/Banka Kartı</span>
                  <img 
                    src="https://fusionmarkt.s3.eu-central-1.amazonaws.com/general/1766832970685-tlw1d8-iyzico_ile_ode_horizontal_white.svg" 
                    alt="iyzico ile öde" 
                    style={{ height: "20px", maxWidth: "100%", objectFit: "contain" }}
                    className="sm:h-4 sm:ml-1"
                  />
                </button>
                <button
                  type="button"
                  onClick={() => setPaymentMethod("bank")}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "8px",
                    height: "48px",
                    borderRadius: "12px",
                    border: paymentMethod === "bank" ? "1px solid rgba(255,255,255,0.4)" : "1px solid rgba(255,255,255,0.2)",
                    backgroundColor: paymentMethod === "bank" ? "rgba(255,255,255,0.05)" : "#0f0f0f",
                    color: paymentMethod === "bank" ? "#fff" : "rgba(255,255,255,0.6)",
                    fontSize: "13px",
                    fontWeight: "500",
                    cursor: "pointer"
                  }}
                >
                  <Building2 size={16} /> Havale / EFT
                </button>
              </div>

              {/* Card Form */}
              {paymentMethod === "card" && (
                <div style={{ padding: "20px", backgroundColor: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "12px" }}>
                  <div style={{ marginBottom: "16px" }}>
                    <label style={labelStyle}>Kart Üzerindeki İsim *</label>
                    <input
                      type="text"
                      value={cardHolderName}
                      onChange={(e) => setCardHolderName(e.target.value.toUpperCase())}
                      placeholder="AD SOYAD"
                      style={{ ...inputStyle, borderColor: errors.cardHolderName ? "rgba(239,68,68,0.5)" : "rgba(255,255,255,0.2)" }}
                    />
                  </div>
                  <div style={{ marginBottom: "16px" }}>
                    <label style={labelStyle}>Kart Numarası *</label>
                    <input
                      type="text"
                      value={cardNumber}
                      onChange={(e) => setCardNumber(formatCardNumber(e.target.value))}
                      placeholder="0000 0000 0000 0000"
                      maxLength={19}
                      style={{ ...inputStyle, borderColor: errors.cardNumber ? "rgba(239,68,68,0.5)" : "rgba(255,255,255,0.2)" }}
                    />
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "12px" }}>
                    <div style={{ position: "relative" }}>
                      <label style={labelStyle}>Ay *</label>
                      <select value={expiryMonth} onChange={(e) => setExpiryMonth(e.target.value)} style={selectStyle}>
                        <option value="">Ay</option>
                        {Array.from({ length: 12 }, (_, i) => i + 1).map(m => (
                          <option key={m} value={String(m).padStart(2, "0")}>{String(m).padStart(2, "0")}</option>
                        ))}
                      </select>
                      <ChevronDown size={16} style={{ position: "absolute", right: "16px", top: "42px", color: "rgba(255,255,255,0.3)", pointerEvents: "none" }} />
                    </div>
                    <div style={{ position: "relative" }}>
                      <label style={labelStyle}>Yıl *</label>
                      <select value={expiryYear} onChange={(e) => setExpiryYear(e.target.value)} style={selectStyle}>
                        <option value="">Yıl</option>
                        {Array.from({ length: 10 }, (_, i) => new Date().getFullYear() + i).map(y => (
                          <option key={y} value={String(y).slice(-2)}>{y}</option>
                        ))}
                      </select>
                      <ChevronDown size={16} style={{ position: "absolute", right: "16px", top: "42px", color: "rgba(255,255,255,0.3)", pointerEvents: "none" }} />
                    </div>
                    <div>
                      <label style={labelStyle}>CVV *</label>
                      <input
                        type="text"
                        value={cvv}
                        onChange={(e) => setCvv(e.target.value.replace(/\D/g, "").slice(0, 3))}
                        placeholder="***"
                        maxLength={3}
                        style={inputStyle}
                      />
                    </div>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "11px", color: "rgba(255,255,255,0.4)", marginTop: "16px" }}>
                    <ShieldCheck size={14} /> Ödeme bilgileriniz SSL ile şifrelenir
                  </div>
                </div>
              )}

              {/* Bank Transfer Info */}
              {paymentMethod === "bank" && (
                <div style={{ padding: "20px", backgroundColor: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "12px" }}>
                  <p style={{ fontSize: "12px", color: "rgba(255,255,255,0.6)", marginBottom: "12px" }}>Havale/EFT yapacağınız banka bilgileri:</p>
                  <div style={{ display: "flex", flexDirection: "column", gap: "8px", marginBottom: "16px" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: "13px" }}>
                      <span style={{ color: "rgba(255,255,255,0.5)" }}>Banka:</span>
                      <span style={{ color: "#fff" }}>T. Garanti BBVA Bankası A.Ş.</span>
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: "13px" }}>
                      <span style={{ color: "rgba(255,255,255,0.5)" }}>Hesap Sahibi:</span>
                      <span style={{ color: "#fff" }}>ASDTC Mühendislik Ticaret Ltd Şti.</span>
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: "13px" }}>
                      <span style={{ color: "rgba(255,255,255,0.5)" }}>Şube:</span>
                      <span style={{ color: "#fff" }}>Yıldız (408)</span>
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: "13px" }}>
                      <span style={{ color: "rgba(255,255,255,0.5)" }}>Hesap No:</span>
                      <span style={{ color: "#fff" }}>6290716</span>
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: "13px" }}>
                      <span style={{ color: "rgba(255,255,255,0.5)" }}>IBAN:</span>
                      <span style={{ color: "#fff", fontFamily: "monospace" }}>TR79 0006 2000 4080 0006 2907 16</span>
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: "13px" }}>
                      <span style={{ color: "rgba(255,255,255,0.5)" }}>SWIFT:</span>
                      <span style={{ color: "#fff" }}>TGBATRISXXX</span>
                    </div>
                  </div>
                  <button 
                    onClick={() => {
                      navigator.clipboard.writeText("TR79 0006 2000 4080 0006 2907 16");
                      alert("IBAN kopyalandı!");
                    }}
                    style={{ width: "100%", height: "40px", backgroundColor: "rgba(255,255,255,0.1)", border: "1px solid rgba(255,255,255,0.2)", borderRadius: "8px", fontSize: "13px", fontWeight: "500", color: "#fff", cursor: "pointer" }}
                  >
                    IBAN&apos;ı Kopyala
                  </button>
                  <p style={{ fontSize: "11px", color: "rgba(255,255,255,0.4)", marginTop: "12px" }}>
                    Açıklama kısmına sipariş numaranızı yazınız.
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* RIGHT COLUMN */}
          <div className="checkout-right-column" style={containerStyle}>
            {/* Order Summary Header */}
            <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "24px" }}>
              <div style={{ width: "44px", height: "44px", borderRadius: "12px", backgroundColor: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <Package size={20} color="rgba(255,255,255,0.6)" />
              </div>
              <div>
                <h2 style={{ fontSize: "18px", fontWeight: "600", color: "#fff" }}>Siparişiniz</h2>
                <span style={{ fontSize: "13px", color: "rgba(255,255,255,0.4)" }}>{items.length} ürün</span>
              </div>
            </div>

            {/* Products */}
            <div style={{ display: "flex", flexDirection: "column", gap: "12px", marginBottom: "24px" }}>
              {items.map((item) => (
                <div key={item.id} style={{ display: "flex", gap: "16px", padding: "16px", backgroundColor: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: "12px" }}>
                  <div style={{ position: "relative", width: "64px", height: "64px", backgroundColor: "#111", borderRadius: "8px", overflow: "hidden", flexShrink: 0 }}>
                    {item.image ? (
                      <Image src={item.image} alt={item.title} fill sizes="64px" style={{ objectFit: "contain" }} />
                    ) : (
                      <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center" }}>
                        <Package size={20} color="rgba(255,255,255,0.2)" />
                      </div>
                    )}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <h4 style={{ fontSize: "14px", fontWeight: "500", color: "rgba(255,255,255,0.9)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{item.title}</h4>
                    {item.variant && <p style={{ fontSize: "12px", color: "rgba(255,255,255,0.4)" }}>{item.variant.value}</p>}
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: "8px" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "4px", backgroundColor: "rgba(255,255,255,0.04)", borderRadius: "8px", padding: "2px" }}>
                        <button onClick={() => updateQuantity(item.id, item.quantity - 1)} style={{ width: "28px", height: "28px", display: "flex", alignItems: "center", justifyContent: "center", color: "rgba(255,255,255,0.4)", backgroundColor: "transparent", border: "none", borderRadius: "6px", cursor: "pointer" }}>
                          <Minus size={12} />
                        </button>
                        <span style={{ width: "24px", textAlign: "center", fontSize: "13px", fontWeight: "500", color: "rgba(255,255,255,0.8)" }}>{item.quantity}</span>
                        <button onClick={() => updateQuantity(item.id, item.quantity + 1)} style={{ width: "28px", height: "28px", display: "flex", alignItems: "center", justifyContent: "center", color: "rgba(255,255,255,0.4)", backgroundColor: "transparent", border: "none", borderRadius: "6px", cursor: "pointer" }}>
                          <Plus size={12} />
                        </button>
                      </div>
                      {/* Always show original price in white - discount shown in totals */}
                      <span style={{ fontSize: "14px", fontWeight: "600", color: "#fff" }}>
                        {formatPrice((item.originalPrice ?? item.price) * item.quantity)}
                      </span>
                    </div>
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                    <button onClick={() => handleMoveToFavorites(item)} style={{ padding: "8px", color: "rgba(255,255,255,0.3)", backgroundColor: "transparent", border: "none", borderRadius: "8px", cursor: "pointer" }} title="Favorilere Ekle">
                      <Heart size={14} />
                    </button>
                    <button onClick={() => removeItem(item.id)} style={{ padding: "8px", color: "rgba(255,255,255,0.3)", backgroundColor: "transparent", border: "none", borderRadius: "8px", cursor: "pointer" }} title="Sepetten Sil">
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Totals */}
            <div style={{ borderTop: "1px solid rgba(255,255,255,0.08)", paddingTop: "20px", marginBottom: "20px" }}>
              {/* Original Subtotal - only show if there's product discount */}
              {totalSavings > 0 && (
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "14px", marginBottom: "12px" }}>
                  <span style={{ color: "rgba(255,255,255,0.5)" }}>Ara Toplam</span>
                  <span style={{ color: "rgba(255,255,255,0.5)", textDecoration: "line-through" }}>{formatPrice(originalSubtotal)}</span>
                </div>
              )}
              
              {/* Product Discount */}
              {totalSavings > 0 && (
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "14px", marginBottom: "12px" }}>
                  <span style={{ color: "#10b981" }}>Ürün İndirimi</span>
                  <span style={{ color: "#10b981", fontWeight: "500" }}>-{formatPrice(totalSavings)}</span>
                </div>
              )}
              
              {/* Subtotal after product discount - only if no product discount */}
              {totalSavings === 0 && (
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "14px", marginBottom: "12px" }}>
                  <span style={{ color: "rgba(255,255,255,0.5)" }}>Ara Toplam</span>
                  <span style={{ color: "rgba(255,255,255,0.8)" }}>{formatPrice(subtotal)}</span>
                </div>
              )}
              
              {/* Shipping */}
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "14px", marginBottom: "12px" }}>
                <span style={{ color: "rgba(255,255,255,0.5)" }}>Kargo</span>
                <span style={{ color: shippingCost === 0 ? "#10b981" : "rgba(255,255,255,0.8)", fontWeight: shippingCost === 0 ? "500" : "400" }}>
                  {shippingCost === 0 ? "Ücretsiz" : formatPrice(shippingCost)}
                </span>
              </div>
              
              {/* Coupon Discount */}
              {appliedCoupon && (
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "14px", marginBottom: "12px" }}>
                  <span style={{ color: "#10b981", display: "flex", alignItems: "center", gap: "6px" }}>
                    <Tag size={14} />
                    Kupon ({appliedCoupon.code})
                  </span>
                  <span style={{ color: "#10b981", fontWeight: "500" }}>
                    -{formatPrice(couponDiscount)}
                  </span>
                </div>
              )}
              
              {/* Grand Total */}
              <div style={{ display: "flex", justifyContent: "space-between", paddingTop: "16px", borderTop: "1px solid rgba(255,255,255,0.08)" }}>
                <span style={{ fontSize: "16px", fontWeight: "600", color: "#fff" }}>Toplam</span>
                <div style={{ textAlign: "right" }}>
                  <span style={{ fontSize: "20px", fontWeight: "700", color: "#fff" }}>{formatPrice(total)}</span>
                  <p style={{ fontSize: "11px", color: "rgba(255,255,255,0.4)" }}>(KDV Dahil)</p>
                </div>
              </div>
            </div>

            {/* Contracts */}
            <div style={{ borderTop: "1px solid rgba(255,255,255,0.08)", paddingTop: "16px", marginBottom: "16px" }}>
              <h3 style={{ fontSize: "13px", fontWeight: "500", color: "#fff", marginBottom: "12px", display: "flex", alignItems: "center", gap: "6px" }}>
                <FileText size={13} /> Sözleşmeler
              </h3>
              
              {/* Terms and Conditions */}
              <div 
                style={{ 
                  display: "flex", 
                  flexDirection: "row",
                  alignItems: "center", 
                  gap: "8px",
                  marginBottom: "12px",
                  flexWrap: "nowrap",
                }}
              >
                <div
                  onClick={() => setContractAccepted({ termsAndConditions: !state.contractsAccepted.termsAndConditions })}
                  style={{
                    width: "16px",
                    height: "16px",
                    minWidth: "16px",
                    maxWidth: "16px",
                    minHeight: "16px",
                    maxHeight: "16px",
                    borderRadius: "3px",
                    border: state.contractsAccepted.termsAndConditions ? "none" : "2px solid rgba(255,255,255,0.4)",
                    backgroundColor: state.contractsAccepted.termsAndConditions ? "#10b981" : "transparent",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    cursor: "pointer",
                    flexShrink: 0,
                    boxSizing: "border-box",
                  }}
                >
                  {state.contractsAccepted.termsAndConditions && <Check size={10} color="#fff" strokeWidth={3} />}
                </div>
                <span style={{ fontSize: "11px", color: "rgba(255,255,255,0.7)", lineHeight: "1.3" }}>
                  <span
                    onClick={() => { setActiveContractType("termsAndConditions"); setContractModalOpen(true); }}
                    style={{ color: "#10b981", cursor: "pointer", textDecoration: "underline" }}
                  >Kullanıcı Sözleşmesi ve Şartlar</span>&apos;ı okudum ve kabul ediyorum. *
                </span>
              </div>

              {/* Distance Sales Contract */}
              <div 
                style={{ 
                  display: "flex", 
                  flexDirection: "row",
                  alignItems: "center", 
                  gap: "8px",
                  marginBottom: "12px",
                  flexWrap: "nowrap",
                }}
              >
                <div
                  onClick={() => setContractAccepted({ distanceSalesContract: !state.contractsAccepted.distanceSalesContract })}
                  style={{
                    width: "16px",
                    height: "16px",
                    minWidth: "16px",
                    maxWidth: "16px",
                    minHeight: "16px",
                    maxHeight: "16px",
                    borderRadius: "3px",
                    border: state.contractsAccepted.distanceSalesContract ? "none" : "2px solid rgba(255,255,255,0.4)",
                    backgroundColor: state.contractsAccepted.distanceSalesContract ? "#10b981" : "transparent",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    cursor: "pointer",
                    flexShrink: 0,
                    boxSizing: "border-box",
                  }}
                >
                  {state.contractsAccepted.distanceSalesContract && <Check size={10} color="#fff" strokeWidth={3} />}
                </div>
                <span style={{ fontSize: "11px", color: "rgba(255,255,255,0.7)", lineHeight: "1.3" }}>
                  <span
                    onClick={() => { setActiveContractType("distanceSalesContract"); setContractModalOpen(true); }}
                    style={{ color: "#10b981", cursor: "pointer", textDecoration: "underline" }}
                  >Mesafeli Satış Sözleşmesi</span>&apos;ni okudum ve kabul ediyorum. *
                </span>
              </div>

              {/* Newsletter */}
              <div 
                style={{ 
                  display: "flex", 
                  flexDirection: "row",
                  alignItems: "center", 
                  gap: "8px",
                  marginBottom: "8px",
                  flexWrap: "nowrap",
                }}
              >
                <div
                  onClick={() => setContractAccepted({ newsletter: !state.contractsAccepted.newsletter })}
                  style={{
                    width: "16px",
                    height: "16px",
                    minWidth: "16px",
                    maxWidth: "16px",
                    minHeight: "16px",
                    maxHeight: "16px",
                    borderRadius: "3px",
                    border: state.contractsAccepted.newsletter ? "none" : "2px solid rgba(255,255,255,0.4)",
                    backgroundColor: state.contractsAccepted.newsletter ? "#10b981" : "transparent",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    cursor: "pointer",
                    flexShrink: 0,
                    boxSizing: "border-box",
                  }}
                >
                  {state.contractsAccepted.newsletter && <Check size={10} color="#fff" strokeWidth={3} />}
                </div>
                <span style={{ fontSize: "11px", color: "rgba(255,255,255,0.5)", lineHeight: "1.3" }}>
                  Kampanya ve fırsatlardan haberdar olmak istiyorum. (İsteğe bağlı)
                </span>
              </div>
              {(errors.termsAndConditions || errors.distanceSalesContract) && (
                <div style={{ marginTop: "12px", padding: "10px", backgroundColor: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.3)", borderRadius: "8px", fontSize: "11px", color: "rgb(248,113,113)" }}>
                  {errors.termsAndConditions || errors.distanceSalesContract}
                </div>
              )}
              {errors.general && (
                <div style={{ marginTop: "12px", padding: "10px", backgroundColor: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.3)", borderRadius: "8px", fontSize: "11px", color: "rgb(248,113,113)" }}>
                  {errors.general}
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              <button
                onClick={handleCompleteOrder}
                disabled={isSubmitting}
                onMouseEnter={() => setHoverConfirm(true)}
                onMouseLeave={() => setHoverConfirm(false)}
                style={{
                  width: "100%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "8px",
                  height: "56px",
                  fontWeight: "600",
                  borderRadius: "12px",
                  backgroundColor: hoverConfirm ? "#10b981" : "#fff",
                  color: hoverConfirm ? "#fff" : "#000",
                  border: "none",
                  cursor: isSubmitting ? "not-allowed" : "pointer",
                  opacity: isSubmitting ? 0.5 : 1,
                  transition: "all 0.2s ease"
                }}
              >
                {isSubmitting ? (
                  <Loader2 size={20} className="animate-spin" />
                ) : (
                  <>
                    <ShieldCheck size={20} />
                    Siparişi Onayla
                    <ChevronRight size={18} />
                  </>
                )}
              </button>
              <Link
                href="/checkout"
                onMouseEnter={() => setHoverBack(true)}
                onMouseLeave={() => setHoverBack(false)}
                style={{
                  width: "100%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "8px",
                  height: "48px",
                  fontWeight: "500",
                  borderRadius: "12px",
                  border: hoverBack ? "1px solid #10b981" : "1px solid rgba(255,255,255,0.2)",
                  backgroundColor: "transparent",
                  color: hoverBack ? "#10b981" : "rgba(255,255,255,0.6)",
                  textDecoration: "none",
                  transition: "all 0.2s ease"
                }}
              >
                <ChevronLeft size={16} />
                Geri
              </Link>
            </div>

            {/* Trust */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "8px", color: "rgba(255,255,255,0.3)", marginTop: "20px" }}>
              <ShieldCheck size={16} />
              <span style={{ fontSize: "12px" }}>256-bit SSL ile güvenli ödeme</span>
            </div>
          </div>
        </div>
      </div>

      {/* Contract Modal */}
      <ContractModal
        isOpen={contractModalOpen}
        onClose={() => setContractModalOpen(false)}
        onAccept={() => {
          if (activeContractType === "termsAndConditions") {
            setContractAccepted({ termsAndConditions: true });
          } else {
            setContractAccepted({ distanceSalesContract: true });
          }
          setContractModalOpen(false);
        }}
        contractType={activeContractType}
        billingAddress={state.billingAddress}
        items={items.map(item => ({
          title: item.title,
          sku: undefined,
          variant: item.variant,
          price: item.price,
          quantity: item.quantity
        }))}
        totals={{
          subtotal,
          shipping: shippingCost,
          discount: couponDiscount,
          grandTotal: total
        }}
        orderRefNumber={orderRefNumber}
      />
    </div>
  );
}
