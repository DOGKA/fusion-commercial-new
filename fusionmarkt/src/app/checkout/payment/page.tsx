/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { useTheme } from "next-themes";
import {
  ChevronRight, ChevronLeft, Check, Loader2, ShieldCheck,
  Building2, FileText, Package, Trash2, Heart,
  Edit2, Minus, Plus, ChevronDown, Tag
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useCheckout } from "@/context/CheckoutContext";
import { useCart } from "@/context/CartContext";
import { useFavorites } from "@/context/FavoritesContext";
import { formatPrice } from "@/lib/utils";
import ContractModal from "@/components/checkout/ContractModal";

// Hydration-safe mounted check (same approach as `ThemeToggle`)
import { useSyncExternalStore } from "react";
const emptySubscribe = () => () => {};
const getClientSnapshot = () => true;
const getServerSnapshot = () => false;
function useIsMounted() {
  return useSyncExternalStore(emptySubscribe, getClientSnapshot, getServerSnapshot);
}

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
  const { items, updateQuantity, removeItem, subtotal, originalSubtotal, totalSavings, clearCart, isHydrated } = useCart();
  const { addItem: addFavorite } = useFavorites();
  const { resolvedTheme } = useTheme();
  const mounted = useIsMounted();
  const isDark = mounted && resolvedTheme === "dark";

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

  // Installment (Taksit) state
  const [installmentOptions, setInstallmentOptions] = useState<Array<{
    count: number;
    installmentPrice: string;
    totalPrice: string;
  }>>([]);
  const [selectedInstallment, setSelectedInstallment] = useState(1);
  const [cardInfo, setCardInfo] = useState<{
    cardType?: string;
    cardFamily?: string;
    bankName?: string;
  } | null>(null);
  const [loadingInstallments, setLoadingInstallments] = useState(false);

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

  // Flag to prevent redirect during payment processing
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);

  // Redirect validations - wait for cart hydration first
  useEffect(() => {
    if (!isHydrated) return; // Wait for cart to load from localStorage
    if (isProcessingPayment) return; // Don't redirect during payment
    
    if (items.length === 0) {
      router.push("/checkout");
    } else if (!state.billingAddress?.firstName || !state.billingAddress?.email) {
      router.push("/checkout");
    }
  }, [items.length, state.billingAddress, router, isHydrated, isProcessingPayment]);

  useEffect(() => {
    const fetchShippingCost = async () => {
      if (items.length === 0) return;
      
      setShippingLoading(true);
      try {
        // Bundle olmayan ürünleri filtrele
        const productItems = items.filter(item => !item.isBundle && item.productId);
        
        const res = await fetch("/api/public/shipping/calculate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            items: productItems.map(item => ({
              productId: item.productId,
              quantity: item.quantity,
              price: item.price,
            })),
            cartTotal: subtotal, // Bundle dahil tam sepet toplamı
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
  }, [items, subtotal]);

  // Fetch installment options when card number has 6+ digits
  useEffect(() => {
    const cleanCardNumber = cardNumber.replace(/\s/g, "");
    
    // Reset if card number is too short
    if (cleanCardNumber.length < 6) {
      setInstallmentOptions([]);
      setSelectedInstallment(1);
      setCardInfo(null);
      return;
    }

    // Only fetch when we have exactly 6 or more digits
    const binNumber = cleanCardNumber.substring(0, 6);
    // Calculate price
    const couponDiscountAmount = appliedCoupon?.discount || 0;
    const priceToCheck = subtotal + shippingCost - couponDiscountAmount;
    
    if (priceToCheck <= 0) return;

    const fetchInstallments = async () => {
      setLoadingInstallments(true);
      try {
        const res = await fetch("/api/payment/installments", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            binNumber,
            price: priceToCheck.toFixed(2),
          }),
        });

        if (res.ok) {
          const data = await res.json();
          setInstallmentOptions(data.installments || []);
          setCardInfo({
            cardType: data.cardType,
            cardFamily: data.cardFamily,
            bankName: data.bankName,
          });
          // Default to single payment
          setSelectedInstallment(1);
        } else {
          // Default single payment if API fails
          setInstallmentOptions([{ count: 1, installmentPrice: priceToCheck.toFixed(2), totalPrice: priceToCheck.toFixed(2) }]);
        }
      } catch (error) {
        console.error("Error fetching installments:", error);
        setInstallmentOptions([{ count: 1, installmentPrice: priceToCheck.toFixed(2), totalPrice: priceToCheck.toFixed(2) }]);
      } finally {
        setLoadingInstallments(false);
      }
    };

    // Debounce the API call
    const timeoutId = setTimeout(fetchInstallments, 300);
    return () => clearTimeout(timeoutId);
  }, [cardNumber, subtotal, shippingCost, appliedCoupon]);

  // Early return - after all hooks
  if (items.length === 0 || !state.billingAddress?.firstName || !state.billingAddress?.email) {
    return (
      <div style={{ minHeight: "100vh", backgroundColor: "var(--background)", display: "flex", alignItems: "center", justifyContent: "center", paddingTop: "120px" }}>
        <div style={{ textAlign: "center" }}>
          <div style={{ width: "64px", height: "64px", borderRadius: "50%", backgroundColor: "var(--border)", margin: "0 auto 16px" }} />
          <p style={{ color: "var(--foreground-tertiary)" }}>Yönlendiriliyor...</p>
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
      variant: item.variant,
      // Bundle bilgileri
      isBundle: item.isBundle,
      bundleId: item.bundleId,
      bundleItemVariants: item.bundleItemVariants,
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
        // iyzico kuralı: basketItems toplamı = price olmalı
        // Kupon indirimi varsa, ürün fiyatlarından orantılı düşülür
        const discountRatio = couponDiscount > 0 ? (subtotal - couponDiscount) / subtotal : 1;
        
        // Basket items hazırla (iyzico için) - indirim orantılı dağıtılır
        const basketItems: Array<{id: string; name: string; category: string; price: number; quantity: number}> = items.map(item => ({
          id: item.productId,
          name: item.title.substring(0, 50),
          category: "Elektronik",
          price: Math.round(item.price * discountRatio * 100) / 100, // İndirimli fiyat (yuvarla)
          quantity: item.quantity,
        }));

        // Kargo ücreti varsa ayrı item olarak ekle
        if (shippingCost > 0) {
          basketItems.push({
            id: "SHIPPING",
            name: "Kargo Ücreti",
            category: "Hizmet",
            price: shippingCost,
            quantity: 1,
          });
        }

        // iyzico'ya gönderilecek toplam fiyat (basketItems toplamına eşit olmalı)
        const iyzicoPrice = basketItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        // Yuvarlama hatalarını düzelt (kuruş hassasiyeti)
        const roundedIyzicoPrice = Math.round(iyzicoPrice * 100) / 100;

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

        // Taksitli ödeme tutarı (faiz dahil olabilir)
        const selectedInstOpt = installmentOptions.find(opt => opt.count === selectedInstallment);
        // paidPrice: Taksit varsa taksit toplamı, yoksa normal fiyat
        const finalPrice = selectedInstOpt ? parseFloat(selectedInstOpt.totalPrice) : roundedIyzicoPrice;

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
            price: roundedIyzicoPrice, // basketItems toplamına eşit olmalı
            paidPrice: finalPrice, // Taksitli ödeme tutarı (faiz dahil)
            installment: selectedInstallment, // Taksit sayısı
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

        // Ödeme işlemi başarılı - redirect'i engelle
        setIsProcessingPayment(true);

        // Kupon bilgisini temizle
        sessionStorage.removeItem("appliedCoupon");
        
        // 3D Secure HTML'i sessionStorage'a kaydet
        sessionStorage.setItem("iyzico3DSHtml", paymentResult.htmlContent);
        
        // Sepeti temizle
        clearCart();
        
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
    backgroundColor: "var(--input-bg)",
    border: "1px solid var(--input-border)",
    borderRadius: "12px",
    fontSize: "14px",
    color: "var(--foreground)",
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
    color: "var(--foreground-secondary)",
    marginBottom: "8px"
  };

  const containerStyle: React.CSSProperties = {
    backgroundColor: "var(--background-secondary)",
    border: "1px solid var(--glass-border)",
    borderRadius: "16px",
    padding: "28px",
    minHeight: CONTAINER_MIN_HEIGHT
  };

  return (
    <div className="checkout-page" style={{ minHeight: "100vh", backgroundColor: "var(--background)", paddingTop: "120px", paddingBottom: "80px" }}>
      <div className="checkout-container" style={{ maxWidth: "1400px", margin: "0 auto", padding: "0 16px" }}>
        {/* Steps */}
        <div className="checkout-steps" style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "12px", marginBottom: "32px" }}>
          <Link href="/checkout" className="checkout-step checkout-step-completed" style={{ display: "flex", alignItems: "center", gap: "8px", textDecoration: "none" }}>
            <div className="checkout-step-number" style={{ width: "32px", height: "32px", borderRadius: "50%", backgroundColor: "var(--glass-bg)", border: "2px solid var(--foreground)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Check size={16} className="text-foreground" strokeWidth={3} />
            </div>
            <span className="checkout-step-label" style={{ fontSize: "13px", fontWeight: "500", color: "var(--foreground)" }}>Adres & Teslimat</span>
          </Link>
          <ChevronRight size={16} className="checkout-step-arrow text-foreground-muted" />
          <div className="checkout-step checkout-step-active" style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <div className="checkout-step-number" style={{ width: "32px", height: "32px", borderRadius: "50%", backgroundColor: "#10b981", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "14px", fontWeight: "700" }}>2</div>
            <span className="checkout-step-label" style={{ fontSize: "13px", fontWeight: "500", color: "var(--foreground)" }}>Ödeme</span>
          </div>
          <ChevronRight size={16} className="checkout-step-arrow text-foreground-muted" />
          <div className="checkout-step" style={{ display: "flex", alignItems: "center", gap: "8px", opacity: 0.4 }}>
            <div className="checkout-step-number" style={{ width: "32px", height: "32px", borderRadius: "50%", backgroundColor: "var(--border)", color: "var(--foreground-tertiary)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "14px", fontWeight: "700" }}>3</div>
            <span className="checkout-step-label checkout-step-label-long" style={{ fontSize: "13px", fontWeight: "500", color: "var(--foreground-tertiary)" }}>Sipariş Tamamlama</span>
          </div>
        </div>

        {/* Main Grid - HER ZAMAN yan yana */}
        <div className="checkout-main-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}>
          {/* LEFT COLUMN */}
          <div className="checkout-left-column" style={containerStyle}>
            {/* Address Summary - Checkout'tan gelen adres bilgilerini göster */}
            <div style={{ marginBottom: "24px" }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "16px" }}>
                <h2 style={{ fontSize: "18px", fontWeight: "600", color: "var(--foreground)" }}>Teslimat Adresi</h2>
                <Link href="/checkout" style={{ fontSize: "13px", color: "var(--foreground-secondary)", textDecoration: "none", display: "flex", alignItems: "center", gap: "4px" }}>
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
                    <span style={{ fontSize: "10px", padding: "2px 8px", backgroundColor: "var(--border)", color: "var(--foreground-secondary)", borderRadius: "999px" }}>Kaydedilecek</span>
                  )}
                </div>
                <p style={{ fontSize: "14px", fontWeight: "500", color: "var(--foreground)", marginBottom: "4px" }}>
                  {state.billingAddress?.firstName} {state.billingAddress?.lastName}
                </p>
                <p style={{ fontSize: "12px", color: "var(--foreground-secondary)", marginBottom: "4px" }}>
                  {state.billingAddress?.addressLine1}
                  {state.billingAddress?.addressLine2 && `, ${state.billingAddress.addressLine2}`}
                </p>
                <p style={{ fontSize: "12px", color: "var(--foreground-tertiary)", marginBottom: "4px" }}>
                  {state.billingAddress?.district}, {state.billingAddress?.city} {state.billingAddress?.postalCode}
                </p>
                <p style={{ fontSize: "12px", color: "var(--foreground-muted)" }}>{state.billingAddress?.phone}</p>
              </div>
            </div>

            {/* Payment Methods */}
            <div style={{ marginBottom: "24px" }}>
              <h2 style={{ fontSize: "18px", fontWeight: "600", color: "var(--foreground)", marginBottom: "16px" }}>Ödeme Yöntemi</h2>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginBottom: "16px" }}>
                <button
                  type="button"
                  onClick={() => setPaymentMethod("card")}
                  className="iyzico-payment-btn"
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    height: "48px",
                    borderRadius: "12px",
                    border: paymentMethod === "card" ? "1px solid var(--foreground-muted)" : "1px solid var(--border)",
                    backgroundColor: paymentMethod === "card" ? "var(--glass-bg-hover)" : "var(--input-bg)",
                    cursor: "pointer",
                    overflow: "hidden",
                  }}
                >
                  <Image
                    src="https://fusionmarkt.s3.eu-central-1.amazonaws.com/general/1766832970685-tlw1d8-iyzico_ile_ode_horizontal_white.svg"
                    alt="iyzico ile öde"
                    width={120}
                    height={28}
                    unoptimized
                    style={{
                      height: "auto",
                      width: "auto",
                      maxHeight: "28px",
                      maxWidth: "100%",
                      objectFit: "contain",
                      display: "block",
                      margin: "0 auto",
                      // Light theme: make it black; Dark theme: keep it white
                      filter: isDark ? "none" : "invert(1)",
                      opacity: paymentMethod === "card" ? 1 : 0.6,
                    }}
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
                    border: paymentMethod === "bank" ? "1px solid var(--foreground-muted)" : "1px solid var(--border)",
                    backgroundColor: paymentMethod === "bank" ? "var(--glass-bg-hover)" : "var(--input-bg)",
                    color: paymentMethod === "bank" ? "var(--foreground)" : "var(--foreground-secondary)",
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
                <div style={{ padding: "20px", backgroundColor: "var(--glass-bg)", border: "1px solid var(--border)", borderRadius: "12px" }}>
                  <div style={{ marginBottom: "16px" }}>
                    <label style={labelStyle}>Kart Üzerindeki İsim *</label>
                    <input
                      type="text"
                      value={cardHolderName}
                      onChange={(e) => setCardHolderName(e.target.value.toUpperCase())}
                      placeholder="AD SOYAD"
                      style={{ ...inputStyle, borderColor: errors.cardHolderName ? "rgba(239,68,68,0.5)" : "var(--input-border)" }}
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
                      style={{ ...inputStyle, borderColor: errors.cardNumber ? "rgba(239,68,68,0.5)" : "var(--input-border)" }}
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
                      <ChevronDown size={16} style={{ position: "absolute", right: "16px", top: "42px", color: "var(--foreground-muted)", pointerEvents: "none" }} />
                    </div>
                    <div style={{ position: "relative" }}>
                      <label style={labelStyle}>Yıl *</label>
                      <select value={expiryYear} onChange={(e) => setExpiryYear(e.target.value)} style={selectStyle}>
                        <option value="">Yıl</option>
                        {Array.from({ length: 10 }, (_, i) => new Date().getFullYear() + i).map(y => (
                          <option key={y} value={String(y).slice(-2)}>{y}</option>
                        ))}
                      </select>
                      <ChevronDown size={16} style={{ position: "absolute", right: "16px", top: "42px", color: "var(--foreground-muted)", pointerEvents: "none" }} />
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

                  {/* Installment Options (Taksit) */}
                  {cardNumber.replace(/\s/g, "").length >= 6 && (
                    <div style={{ marginTop: "20px", padding: "16px", backgroundColor: "var(--glass-bg)", border: "1px solid var(--border)", borderRadius: "10px" }}>
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "12px" }}>
                        <label style={{ fontSize: "13px", fontWeight: "500", color: "var(--foreground)" }}>
                          Taksit Seçenekleri
                        </label>
                        {cardInfo?.bankName && (
                          <span style={{ fontSize: "11px", color: "var(--foreground-tertiary)", backgroundColor: "var(--glass-bg)", padding: "4px 8px", borderRadius: "4px" }}>
                            {cardInfo.bankName}
                          </span>
                        )}
                      </div>
                      
                      {loadingInstallments ? (
                        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", padding: "20px", color: "var(--foreground-tertiary)" }}>
                          <Loader2 size={16} style={{ marginRight: "8px", animation: "spin 1s linear infinite" }} />
                          <span style={{ fontSize: "12px" }}>Taksit seçenekleri yükleniyor...</span>
                        </div>
                      ) : installmentOptions.length > 0 ? (
                        <div style={{ display: "grid", gap: "8px" }}>
                          {installmentOptions.map((opt) => (
                            <label
                              key={opt.count}
                              style={{
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "space-between",
                                padding: "12px 14px",
                                backgroundColor: selectedInstallment === opt.count ? "rgba(16,185,129,0.1)" : "var(--glass-bg)",
                                border: selectedInstallment === opt.count ? "1px solid rgba(16,185,129,0.4)" : "1px solid var(--border)",
                                borderRadius: "8px",
                                cursor: "pointer",
                                transition: "all 0.2s ease",
                              }}
                            >
                              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                                <input
                                  type="radio"
                                  name="installment"
                                  checked={selectedInstallment === opt.count}
                                  onChange={() => setSelectedInstallment(opt.count)}
                                  style={{ accentColor: "#10b981", width: "16px", height: "16px" }}
                                />
                                <span style={{ fontSize: "13px", color: selectedInstallment === opt.count ? "#10b981" : "var(--foreground)" }}>
                                  {opt.count === 1 ? "Tek Çekim" : `${opt.count} Taksit`}
                                </span>
                              </div>
                              <div style={{ textAlign: "right" }}>
                                {opt.count > 1 && (
                                  <div style={{ fontSize: "11px", color: "var(--foreground-tertiary)" }}>
                                    {formatPrice(parseFloat(opt.installmentPrice))} × {opt.count}
                                  </div>
                                )}
                                <div style={{ fontSize: "13px", fontWeight: "600", color: selectedInstallment === opt.count ? "#10b981" : "var(--foreground)" }}>
                                  {formatPrice(parseFloat(opt.totalPrice))}
                                </div>
                              </div>
                            </label>
                          ))}
                        </div>
                      ) : (
                        <div style={{ padding: "12px", textAlign: "center", color: "var(--foreground-muted)", fontSize: "12px" }}>
                          Tek çekim
                        </div>
                      )}
                    </div>
                  )}

                  <div style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "11px", color: "var(--foreground-muted)", marginTop: "16px" }}>
                    <ShieldCheck size={14} /> Ödeme bilgileriniz SSL ile şifrelenir
                  </div>
                </div>
              )}

              {/* Bank Transfer Info */}
              {paymentMethod === "bank" && (
                <div style={{ padding: "20px", backgroundColor: "var(--glass-bg)", border: "1px solid var(--border)", borderRadius: "12px" }}>
                  <p style={{ fontSize: "12px", color: "var(--foreground-secondary)", marginBottom: "12px" }}>Havale/EFT yapacağınız banka bilgileri:</p>
                  <div style={{ display: "flex", flexDirection: "column", gap: "8px", marginBottom: "16px" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: "13px" }}>
                      <span style={{ color: "var(--foreground-tertiary)" }}>Banka:</span>
                      <span style={{ color: "var(--foreground)" }}>T. Garanti BBVA Bankası A.Ş.</span>
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: "13px" }}>
                      <span style={{ color: "var(--foreground-tertiary)" }}>Hesap Sahibi:</span>
                      <span style={{ color: "var(--foreground)" }}>ASDTC Mühendislik Ticaret Ltd Şti.</span>
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: "13px" }}>
                      <span style={{ color: "var(--foreground-tertiary)" }}>Şube:</span>
                      <span style={{ color: "var(--foreground)" }}>Yıldız (408)</span>
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: "13px" }}>
                      <span style={{ color: "var(--foreground-tertiary)" }}>Hesap No:</span>
                      <span style={{ color: "var(--foreground)" }}>6290716</span>
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: "13px" }}>
                      <span style={{ color: "var(--foreground-tertiary)" }}>IBAN:</span>
                      <span style={{ color: "var(--foreground)", fontFamily: "monospace" }}>TR79 0006 2000 4080 0006 2907 16</span>
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: "13px" }}>
                      <span style={{ color: "var(--foreground-tertiary)" }}>SWIFT:</span>
                      <span style={{ color: "var(--foreground)" }}>TGBATRISXXX</span>
                    </div>
                  </div>
                  <button 
                    onClick={() => {
                      navigator.clipboard.writeText("TR79 0006 2000 4080 0006 2907 16");
                      alert("IBAN kopyalandı!");
                    }}
                    style={{ width: "100%", height: "40px", backgroundColor: "var(--border)", border: "1px solid var(--border)", borderRadius: "8px", fontSize: "13px", fontWeight: "500", color: "var(--foreground)", cursor: "pointer" }}
                  >
                    IBAN&apos;ı Kopyala
                  </button>
                  <p style={{ fontSize: "11px", color: "var(--foreground-muted)", marginTop: "12px" }}>
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
              <div style={{ width: "44px", height: "44px", borderRadius: "12px", backgroundColor: "var(--glass-bg)", border: "1px solid var(--border)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <Package size={20} color="var(--foreground-secondary)" />
              </div>
              <div>
                <h2 style={{ fontSize: "18px", fontWeight: "600", color: "var(--foreground)" }}>Siparişiniz</h2>
                <span style={{ fontSize: "13px", color: "var(--foreground-muted)" }}>{items.length} ürün</span>
              </div>
            </div>

            {/* Products */}
            <div style={{ display: "flex", flexDirection: "column", gap: "12px", marginBottom: "24px" }}>
              {items.map((item) => (
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
                    <h4 style={{ fontSize: "14px", fontWeight: "500", color: "var(--foreground)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{item.title}</h4>
                    {item.variant && <p style={{ fontSize: "12px", color: "var(--foreground-muted)" }}>{item.variant.value}</p>}
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: "8px" }}>
                      <div className="checkout-quantity-controls" style={{ display: "flex", alignItems: "center", gap: "4px", backgroundColor: "var(--glass-bg)", borderRadius: "8px", padding: "2px" }}>
                        <button onClick={() => updateQuantity(item.id, item.quantity - 1)} style={{ width: "28px", height: "28px", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--foreground-muted)", backgroundColor: "transparent", border: "none", borderRadius: "6px", cursor: "pointer" }}>
                          <Minus size={12} />
                        </button>
                        <span style={{ width: "24px", textAlign: "center", fontSize: "13px", fontWeight: "500", color: "var(--foreground)" }}>{item.quantity}</span>
                        <button onClick={() => updateQuantity(item.id, item.quantity + 1)} style={{ width: "28px", height: "28px", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--foreground-muted)", backgroundColor: "transparent", border: "none", borderRadius: "6px", cursor: "pointer" }}>
                          <Plus size={12} />
                        </button>
                      </div>
                      {/* Always show original price in white - discount shown in totals */}
                      <span style={{ fontSize: "14px", fontWeight: "600", color: "var(--foreground)" }}>
                        {formatPrice((item.originalPrice ?? item.price) * item.quantity)}
                      </span>
                    </div>
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                    <button onClick={() => handleMoveToFavorites(item)} style={{ padding: "8px", color: "var(--foreground-muted)", backgroundColor: "transparent", border: "none", borderRadius: "8px", cursor: "pointer" }} title="Favorilere Ekle">
                      <Heart size={14} />
                    </button>
                    <button onClick={() => removeItem(item.id)} style={{ padding: "8px", color: "var(--foreground-muted)", backgroundColor: "transparent", border: "none", borderRadius: "8px", cursor: "pointer" }} title="Sepetten Sil">
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Totals */}
            <div style={{ borderTop: "1px solid var(--border)", paddingTop: "20px", marginBottom: "20px" }}>
              {/* Original Subtotal - only show if there's product discount */}
              {totalSavings > 0 && (
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "14px", marginBottom: "12px" }}>
                  <span style={{ color: "var(--foreground-tertiary)" }}>Ara Toplam</span>
                  <span style={{ color: "var(--foreground-tertiary)", textDecoration: "line-through" }}>{formatPrice(originalSubtotal)}</span>
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
                  <span style={{ color: "var(--foreground-tertiary)" }}>Ara Toplam</span>
                  <span style={{ color: "var(--foreground)" }}>{formatPrice(subtotal)}</span>
                </div>
              )}
              
              {/* Shipping */}
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "14px", marginBottom: "12px" }}>
                <span style={{ color: "var(--foreground-tertiary)" }}>Kargo</span>
                <span style={{ color: shippingCost === 0 ? "#10b981" : "var(--foreground)", fontWeight: shippingCost === 0 ? "500" : "400" }}>
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
              <div style={{ display: "flex", justifyContent: "space-between", paddingTop: "16px", borderTop: "1px solid var(--border)" }}>
                <span style={{ fontSize: "16px", fontWeight: "600", color: "var(--foreground)" }}>Toplam</span>
                <div style={{ textAlign: "right" }}>
                  <span style={{ fontSize: "20px", fontWeight: "700", color: "var(--foreground)" }}>{formatPrice(total)}</span>
                  <p style={{ fontSize: "11px", color: "var(--foreground-muted)" }}>(KDV Dahil)</p>
                </div>
              </div>
            </div>

            {/* Contracts */}
            <div style={{ borderTop: "1px solid var(--border)", paddingTop: "16px", marginBottom: "16px" }}>
              <h3 style={{ fontSize: "13px", fontWeight: "500", color: "var(--foreground)", marginBottom: "12px", display: "flex", alignItems: "center", gap: "6px" }}>
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
                    border: state.contractsAccepted.termsAndConditions ? "none" : "2px solid var(--foreground-muted)",
                    backgroundColor: state.contractsAccepted.termsAndConditions ? "#10b981" : "transparent",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    cursor: "pointer",
                    flexShrink: 0,
                    boxSizing: "border-box",
                  }}
                >
                  {state.contractsAccepted.termsAndConditions && <Check size={10} className="text-white" strokeWidth={3} />}
                </div>
                <span style={{ fontSize: "11px", color: "var(--foreground-secondary)", lineHeight: "1.3" }}>
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
                    border: state.contractsAccepted.distanceSalesContract ? "none" : "2px solid var(--foreground-muted)",
                    backgroundColor: state.contractsAccepted.distanceSalesContract ? "#10b981" : "transparent",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    cursor: "pointer",
                    flexShrink: 0,
                    boxSizing: "border-box",
                  }}
                >
                  {state.contractsAccepted.distanceSalesContract && <Check size={10} className="text-white" strokeWidth={3} />}
                </div>
                <span style={{ fontSize: "11px", color: "var(--foreground-secondary)", lineHeight: "1.3" }}>
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
                    border: state.contractsAccepted.newsletter ? "none" : "2px solid var(--foreground-muted)",
                    backgroundColor: state.contractsAccepted.newsletter ? "#10b981" : "transparent",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    cursor: "pointer",
                    flexShrink: 0,
                    boxSizing: "border-box",
                  }}
                >
                  {state.contractsAccepted.newsletter && <Check size={10} className="text-white" strokeWidth={3} />}
                </div>
                <span style={{ fontSize: "11px", color: "var(--foreground-tertiary)", lineHeight: "1.3" }}>
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
                  backgroundColor: hoverConfirm ? "#059669" : "#10b981",
                  color: "#fff",
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
                  border: hoverBack ? "1px solid #10b981" : "1px solid var(--border)",
                  backgroundColor: "transparent",
                  color: hoverBack ? "#10b981" : "var(--foreground-secondary)",
                  textDecoration: "none",
                  transition: "all 0.2s ease"
                }}
              >
                <ChevronLeft size={16} />
                Geri
              </Link>
            </div>

            {/* Trust */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "8px", color: "var(--foreground-muted)", marginTop: "20px" }}>
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
