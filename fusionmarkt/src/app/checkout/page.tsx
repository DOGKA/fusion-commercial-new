"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { 
  ChevronRight, User, Building2, Check, Loader2,
  ShieldCheck, Truck, CreditCard, Phone, Mail, MapPin,
  FileText, Minus, Plus, Trash2, Heart, Package,
  Tag, ChevronDown, Plus as PlusIcon
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useCheckout } from "@/context/CheckoutContext";
import { useCart } from "@/context/CartContext";
import { useFavorites } from "@/context/FavoritesContext";
import { formatPrice, isValidEmail, getEmailError } from "@/lib/utils";
import { CITIES, getDistricts } from "@/lib/turkey-cities";
import type { AddressFormData, InvoiceType } from "@/types/checkout";
import KargoTimer from "@/components/product/KargoTimer";

// ═══════════════════════════════════════════════════════════════════════════
// CHECKOUT PAGE - STEP 1: Address & Shipping
// ═══════════════════════════════════════════════════════════════════════════

const CONTAINER_MIN_HEIGHT = "800px";

interface SavedAddress {
  id: string;
  title: string;
  fullName: string;
  firstName: string;
  lastName: string;
  addressLine1: string;
  city: string;
  district: string;
  postalCode: string;
  phone: string;
  isDefault: boolean;
}

interface AddressApiItem {
  id: string;
  title?: string;
  fullName?: string;
  firstName?: string;
  lastName?: string;
  addressLine1?: string;
  address?: string;
  city?: string;
  district?: string;
  postalCode?: string;
  phone?: string;
  email?: string;
  isDefault?: boolean;
  invoiceType?: string;
}

export default function CheckoutPage() {
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  const { setBillingAddress } = useCheckout();
  const { items, updateQuantity, removeItem, subtotal, originalSubtotal, totalSavings } = useCart();
  const { addItem: addFavorite } = useFavorites();
  
  // Refs to prevent re-fetching
  const hasFetchedProfile = useRef(false);
  const hasFetchedAddresses = useRef(false);
  
  // Saved addresses
  const [savedAddresses, setSavedAddresses] = useState<SavedAddress[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(null);
  const [showNewAddressForm, setShowNewAddressForm] = useState(false);
  const [loadingAddresses, setLoadingAddresses] = useState(false);

  // Form state
  const [invoiceType, setInvoiceType] = useState<InvoiceType>("person");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [tcKimlikNo, setTcKimlikNo] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [taxNumber, setTaxNumber] = useState("");
  const [taxOffice, setTaxOffice] = useState("");
  const [city, setCity] = useState("");
  const [district, setDistrict] = useState("");
  const [addressLine1, setAddressLine1] = useState("");
  const [addressLine2, setAddressLine2] = useState("");
  const [postalCode, setPostalCode] = useState("");
  const [orderNotes, setOrderNotes] = useState("");
  
  const [isSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  // Email check state (for guest checkout)
  const [checkingEmail, setCheckingEmail] = useState(false);
  const [emailRegistered, setEmailRegistered] = useState(false);
  const [registeredUserName, setRegisteredUserName] = useState<string | null>(null);
  const [showLoginForm, setShowLoginForm] = useState(false);
  const [loginPassword, setLoginPassword] = useState("");
  const [loginError, setLoginError] = useState("");
  const [loggingIn, setLoggingIn] = useState(false);
  
  const [showCoupon, setShowCoupon] = useState(false);
  const [couponCode, setCouponCode] = useState("");
  const [couponLoading, setCouponLoading] = useState(false);
  const [couponError, setCouponError] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState<{
    id: string;
    code: string;
    discountType: string;
    discountValue: number;
    discount: number;
    description?: string;
  } | null>(null);
  const [saveToAddresses, setSaveToAddresses] = useState(false); // Kayıtlı adreslerime ekle
  
  // Kişisel bilgileri düzenleme modu
  const [editingPersonalInfo, setEditingPersonalInfo] = useState(false);

  // Shipping options state
  const [shippingOptions, setShippingOptions] = useState<{
    id: string;
    name: string;
    description: string;
    cost: number;
    isFree: boolean;
    estimatedDays: string;
    type: string;
  }[]>([]);
  const [, setShippingMessage] = useState<string | null>(null);
  const [amountToFreeShipping, setAmountToFreeShipping] = useState<number>(0);
  const [freeShippingThreshold, setFreeShippingThreshold] = useState<number>(2000);
  const [loadingShipping, setLoadingShipping] = useState(false);
  const [selectedShippingId, setSelectedShippingId] = useState<string>("free-shipping");

  // Hover states
  const [hoverProceed, setHoverProceed] = useState(false);

  // Districts based on selected city
  const districts = city ? getDistricts(city) : [];

  // Kargo seçeneklerini API'den çek
  useEffect(() => {
    const fetchShippingOptions = async () => {
      if (items.length === 0) return;
      
      setLoadingShipping(true);
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
            city: city || undefined,
          }),
        });
        
        if (res.ok) {
          const data = await res.json();
          setShippingOptions(data.options || []);
          setShippingMessage(data.message || null);
          setAmountToFreeShipping(data.amountToFreeShipping || 0);
          setFreeShippingThreshold(data.freeShippingThreshold || 2000);
          
          // Varsayılan olarak ücretsiz kargo veya ilk seçeneği seç
          if (data.hasFreeShipping) {
            setSelectedShippingId("free-shipping");
          } else if (data.options?.length > 0) {
            setSelectedShippingId(data.options[0].id);
          }
        }
      } catch (error) {
        console.error("Error fetching shipping options:", error);
        // Hata durumunda boş bırak - API'den veri gelmeden devam etme
        setShippingOptions([]);
        setShippingMessage("Kargo seçenekleri yüklenemedi. Lütfen sayfayı yenileyin.");
      } finally {
        setLoadingShipping(false);
      }
    };
    
    fetchShippingOptions();
  }, [items, city]);

  // Kupon uygula
  const applyCoupon = async () => {
    if (!couponCode.trim()) {
      setCouponError("Kupon kodu giriniz");
      return;
    }
    
    setCouponLoading(true);
    setCouponError("");
    
    try {
      // Sepet ürünlerini kategori kontrolü için hazırla
      const cartItems = items.map(item => ({
        productId: item.productId,
        quantity: item.quantity,
        price: item.price,
        salePrice: item.originalPrice ? item.price : undefined,
      }));

      const res = await fetch("/api/public/validate-coupon", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          code: couponCode.trim(), 
          cartTotal: subtotal,
          cartItems, // Kategori kontrolü için sepet ürünleri
        }),
      });
      
      const data = await res.json();
      
      if (!data.valid) {
        setCouponError(data.error || "Geçersiz kupon");
        setAppliedCoupon(null);
        sessionStorage.removeItem("appliedCoupon");
      } else {
        setAppliedCoupon(data.coupon);
        setCouponError("");
        // Payment sayfası için sessionStorage'a kaydet
        sessionStorage.setItem("appliedCoupon", JSON.stringify(data.coupon));
      }
    } catch {
      setCouponError("Kupon doğrulanamadı");
      setAppliedCoupon(null);
    } finally {
      setCouponLoading(false);
    }
  };

  // Kupon kaldır
  const removeCoupon = () => {
    setAppliedCoupon(null);
    setCouponCode("");
    setCouponError("");
    sessionStorage.removeItem("appliedCoupon");
  };

  // Auto-fill user info - API'den güncel bilgileri çek
  useEffect(() => {
    if (isAuthenticated && !hasFetchedProfile.current) {
      hasFetchedProfile.current = true;
      // Güncel kullanıcı bilgilerini API'den çek
      fetch("/api/user/profile")
        .then(res => res.json())
        .then(data => {
          if (data.user) {
            const u = data.user;
            // Ad/Soyad - setter ile kontrol
            if (u.name) {
              const nameParts = u.name.split(" ");
              setFirstName(prev => prev || nameParts[0] || "");
              setLastName(prev => prev || nameParts.slice(1).join(" ") || "");
            }
            // Email
            if (u.email) setEmail(prev => prev || u.email);
            // Telefon
            if (u.phone) setPhone(prev => prev || u.phone);
          }
        })
        .catch(err => console.error("Failed to fetch user profile:", err));
    }
  }, [isAuthenticated]);

  // Fetch saved addresses
  useEffect(() => {
    if (isAuthenticated && !hasFetchedAddresses.current) {
      hasFetchedAddresses.current = true;
      setLoadingAddresses(true);
      fetch("/api/user/addresses")
        .then(res => res.json())
        .then(data => {
          console.log("Fetched addresses data:", data);
          // API { addresses: [...] } şeklinde döndürüyor
          const addressList = data.addresses || data;
          if (Array.isArray(addressList) && addressList.length > 0) {
            const formatted = addressList.map((addr: AddressApiItem) => {
              // fullName'den firstName ve lastName çıkar
              const fullName = addr.fullName || "";
              const nameParts = fullName.split(" ");
              const addrFirstName = addr.firstName || nameParts[0] || "";
              const addrLastName = addr.lastName || nameParts.slice(1).join(" ") || "";
              
              return {
                id: addr.id,
                title: addr.title || "Adres",
                fullName: fullName,
                firstName: addrFirstName,
                lastName: addrLastName,
                addressLine1: addr.addressLine1 || addr.address || "",
                city: addr.city || "",
                district: addr.district || "",
                postalCode: addr.postalCode || "",
                phone: addr.phone || "",
                isDefault: addr.isDefault || false
              };
            });
            setSavedAddresses(formatted);
            
            // Varsayılan adresi seç ve bilgileri doldur
            const defaultAddr = formatted.find((a: SavedAddress) => a.isDefault) || formatted[0];
            if (defaultAddr) {
              setSelectedAddressId(defaultAddr.id);
              setCity(defaultAddr.city);
              setDistrict(defaultAddr.district);
              setAddressLine1(defaultAddr.addressLine1);
              setPostalCode(defaultAddr.postalCode);
              // Telefon varsa doldur - functional update
              if (defaultAddr.phone) setPhone(prev => prev || defaultAddr.phone);
              // Ad/soyad yoksa adresten al - functional update
              if (defaultAddr.firstName) setFirstName(prev => prev || defaultAddr.firstName);
              if (defaultAddr.lastName) setLastName(prev => prev || defaultAddr.lastName);
            }
          } else {
            setShowNewAddressForm(true);
          }
        })
        .catch((err) => {
          console.error("Address fetch error:", err);
          setShowNewAddressForm(true);
        })
        .finally(() => setLoadingAddresses(false));
    } else if (!isAuthenticated) {
      setShowNewAddressForm(true);
    }
  }, [isAuthenticated]);

  // When selecting an address, fill the form with all info
  const handleSelectAddress = (addr: SavedAddress) => {
    setSelectedAddressId(addr.id);
    setCity(addr.city);
    setDistrict(addr.district);
    setAddressLine1(addr.addressLine1);
    setPostalCode(addr.postalCode);
    // Telefon ve ad/soyad bilgilerini de doldur
    if (addr.phone) setPhone(addr.phone);
    if (addr.firstName) setFirstName(addr.firstName);
    if (addr.lastName) setLastName(addr.lastName);
    setShowNewAddressForm(false);
  };

  // Sync form to context
  const syncFormToContext = useCallback(() => {
    const formData: AddressFormData & { id?: string; saveToAddresses?: boolean } = {
      firstName, lastName, phone, email, invoiceType,
      tcKimlikNo, taxNumber, taxOffice, companyName,
      country: "Türkiye", city, district, postalCode,
      addressLine1, addressLine2, orderNotes,
      // Kayıtlı adres seçildiyse ID'sini ekle
      id: selectedAddressId || undefined,
      // Yeni adres ise kaydetme seçeneği
      saveToAddresses: !selectedAddressId && showNewAddressForm ? saveToAddresses : undefined,
    };
    setBillingAddress(formData as AddressFormData);
  }, [firstName, lastName, phone, email, invoiceType, tcKimlikNo, taxNumber, taxOffice, companyName, city, district, postalCode, addressLine1, addressLine2, orderNotes, selectedAddressId, showNewAddressForm, saveToAddresses, setBillingAddress]);

  useEffect(() => {
    syncFormToContext();
  }, [syncFormToContext]);

  // Reset district when city changes (only for new address)
  useEffect(() => {
    if (!selectedAddressId && showNewAddressForm) {
      setDistrict("");
    }
  }, [city, selectedAddressId, showNewAddressForm]);

  // Check if email is registered (for guest checkout)
  const checkEmailRegistered = useCallback(async (emailToCheck: string) => {
    if (!emailToCheck || isAuthenticated) return;
    
    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(emailToCheck)) return;
    
    setCheckingEmail(true);
    try {
      const res = await fetch("/api/auth/check-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: emailToCheck }),
      });
      const data = await res.json();
      
      if (data.exists) {
        setEmailRegistered(true);
        setRegisteredUserName(data.userName);
        setShowLoginForm(true);
      } else {
        setEmailRegistered(false);
        setRegisteredUserName(null);
        setShowLoginForm(false);
      }
    } catch (error) {
      console.error("Email check error:", error);
    } finally {
      setCheckingEmail(false);
    }
  }, [isAuthenticated]);
  
  // Debounced email check
  useEffect(() => {
    if (!email || isAuthenticated) return;
    
    const timer = setTimeout(() => {
      checkEmailRegistered(email);
    }, 800); // 800ms debounce
    
    return () => clearTimeout(timer);
  }, [email, isAuthenticated, checkEmailRegistered]);
  
  // Handle login for registered email
  const handleEmailLogin = async () => {
    if (!email || !loginPassword) return;
    
    setLoggingIn(true);
    setLoginError("");
    
    try {
      const { signIn } = await import("next-auth/react");
      const result = await signIn("credentials", {
        email,
        password: loginPassword,
        redirect: false,
      });
      
      if (result?.error) {
        setLoginError("Şifre hatalı. Lütfen tekrar deneyin.");
      } else {
        // Login successful - refresh page to load user data
        window.location.reload();
      }
    } catch (error) {
      console.error("Login error:", error);
      setLoginError("Giriş yapılırken bir hata oluştu.");
    } finally {
      setLoggingIn(false);
    }
  };

  // Phone mask
  const formatPhone = (value: string) => {
    const digits = value.replace(/\D/g, "").slice(0, 11);
    if (digits.length <= 4) return digits;
    if (digits.length <= 7) return `${digits.slice(0, 4)} ${digits.slice(4)}`;
    if (digits.length <= 9) return `${digits.slice(0, 4)} ${digits.slice(4, 7)} ${digits.slice(7)}`;
    return `${digits.slice(0, 4)} ${digits.slice(4, 7)} ${digits.slice(7, 9)} ${digits.slice(9)}`;
  };

  // Empty cart check
  if (items.length === 0) {
    return (
      <div style={{ minHeight: "100vh", backgroundColor: "#050505", display: "flex", alignItems: "center", justifyContent: "center", paddingTop: "120px" }}>
        <div style={{ textAlign: "center" }}>
          <Package size={48} color="rgba(255,255,255,0.2)" style={{ margin: "0 auto 16px" }} />
          <h1 style={{ fontSize: "24px", fontWeight: "700", color: "#fff", marginBottom: "16px" }}>Sepetiniz Boş</h1>
          <p style={{ color: "rgba(255,255,255,0.5)", marginBottom: "24px" }}>Ödeme yapmak için sepetinize ürün ekleyin.</p>
          <Link href="/magaza" style={{ display: "inline-flex", alignItems: "center", gap: "8px", padding: "12px 24px", backgroundColor: "#fff", color: "#000", borderRadius: "12px", fontWeight: "500", textDecoration: "none" }}>
            Alışverişe Başla <ChevronRight size={18} />
          </Link>
        </div>
      </div>
    );
  }

  const handleProceedToPayment = () => {
    syncFormToContext();
    const newErrors: Record<string, string> = {};
    if (!firstName) newErrors.firstName = "Ad gerekli";
    if (!lastName) newErrors.lastName = "Soyad gerekli";
    if (!phone) newErrors.phone = "Telefon gerekli";
    
    // Email validasyonu
    const emailError = getEmailError(email);
    if (emailError) newErrors.email = emailError;
    
    if (!city) newErrors.city = "İl seçin";
    if (!district) newErrors.district = "İlçe seçin";
    if (!addressLine1) newErrors.addressLine1 = "Adres gerekli";
    
    // Kurumsal seçilmişse ek alanlar zorunlu
    if (invoiceType === "company") {
      if (!companyName) newErrors.companyName = "Şirket adı gerekli";
      if (!taxNumber) newErrors.taxNumber = "Vergi numarası gerekli";
      if (!taxOffice) newErrors.taxOffice = "Vergi dairesi gerekli";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    setErrors({});
    router.push("/checkout/payment");
  };

  // Calculate shipping and discount
  const selectedShipping = shippingOptions.find(opt => opt.id === selectedShippingId);
  const shippingCost = selectedShipping?.isFree ? 0 : (selectedShipping?.cost || 0);
  const couponDiscount = appliedCoupon?.discount || 0;
  const total = subtotal + shippingCost - couponDiscount;

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

  const hasSavedAddresses = savedAddresses.length > 0;
  
  // Kişisel bilgiler tam mı kontrol et
  const isPersonalInfoComplete = firstName && lastName && phone && email && isValidEmail(email);

  return (
    <div className="checkout-page" style={{ minHeight: "100vh", backgroundColor: "#050505", paddingTop: "120px", paddingBottom: "80px" }}>
      <div className="checkout-container" style={{ maxWidth: "1400px", margin: "0 auto", padding: "0 16px" }}>
        {/* Steps */}
        <div className="checkout-steps" style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "12px", marginBottom: "32px" }}>
          <div className="checkout-step checkout-step-active" style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <div className="checkout-step-number" style={{ width: "32px", height: "32px", borderRadius: "50%", backgroundColor: "#fff", color: "#000", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "14px", fontWeight: "700" }}>1</div>
            <span className="checkout-step-label" style={{ fontSize: "13px", fontWeight: "500", color: "#fff" }}>Adres & Teslimat</span>
          </div>
          <ChevronRight size={16} color="rgba(255,255,255,0.3)" className="checkout-step-arrow" />
          <div className="checkout-step" style={{ display: "flex", alignItems: "center", gap: "8px", opacity: 0.4 }}>
            <div className="checkout-step-number" style={{ width: "32px", height: "32px", borderRadius: "50%", backgroundColor: "rgba(255,255,255,0.1)", color: "rgba(255,255,255,0.5)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "14px", fontWeight: "700" }}>2</div>
            <span className="checkout-step-label" style={{ fontSize: "13px", fontWeight: "500", color: "rgba(255,255,255,0.5)" }}>Ödeme</span>
          </div>
          <ChevronRight size={16} color="rgba(255,255,255,0.3)" className="checkout-step-arrow" />
          <div className="checkout-step" style={{ display: "flex", alignItems: "center", gap: "8px", opacity: 0.4 }}>
            <div className="checkout-step-number" style={{ width: "32px", height: "32px", borderRadius: "50%", backgroundColor: "rgba(255,255,255,0.1)", color: "rgba(255,255,255,0.5)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "14px", fontWeight: "700" }}>3</div>
            <span className="checkout-step-label checkout-step-label-long" style={{ fontSize: "13px", fontWeight: "500", color: "rgba(255,255,255,0.5)" }}>Sipariş Tamamlama</span>
          </div>
        </div>

        {/* Main Grid */}
        <div className="checkout-main-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}>
          {/* LEFT COLUMN */}
          <div className="checkout-left-column" style={containerStyle}>
            {/* User Info - Kayıtlı bilgiler veya form */}
            <div style={{ marginBottom: "24px" }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "16px" }}>
                <h2 style={{ fontSize: "18px", fontWeight: "600", color: "#fff" }}>Kişisel Bilgiler</h2>
                {isPersonalInfoComplete && !editingPersonalInfo && (
                  <button 
                    type="button"
                    onClick={() => setEditingPersonalInfo(true)}
                    style={{ 
                      fontSize: "13px", 
                      color: "rgba(255,255,255,0.6)", 
                      background: "none",
                      border: "none",
                      cursor: "pointer",
                      display: "flex", 
                      alignItems: "center", 
                      gap: "4px" 
                    }}
                  >
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/></svg>
                    Düzenle
                  </button>
                )}
              </div>
              
              {/* Kişisel bilgiler tam ve düzenleme modunda değilse kompakt kart göster */}
              {isPersonalInfoComplete && !editingPersonalInfo ? (
                <div style={{ padding: "16px", backgroundColor: "rgba(16,185,129,0.05)", border: "1px solid rgba(16,185,129,0.2)", borderRadius: "12px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "8px" }}>
                    <span style={{ fontSize: "10px", padding: "2px 8px", backgroundColor: "rgba(16,185,129,0.2)", color: "#10b981", borderRadius: "999px" }}>Kayıtlı Bilgiler</span>
                  </div>
                  <p style={{ fontSize: "14px", fontWeight: "500", color: "#fff", marginBottom: "4px" }}>
                    {firstName.toUpperCase()} {lastName.toUpperCase()}
                  </p>
                  <p style={{ fontSize: "12px", color: "rgba(255,255,255,0.6)", marginBottom: "4px" }}>
                    {email}
                  </p>
                  <p style={{ fontSize: "12px", color: "rgba(255,255,255,0.4)" }}>{phone}</p>
                </div>
              ) : (
                /* Kişisel bilgiler eksikse veya düzenleme modundaysa form göster */
                <>
                  <div className="checkout-personal-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginBottom: "12px" }}>
                    <div>
                      <label style={labelStyle}><User size={13} /> Ad *</label>
                      <input
                        type="text"
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}
                        placeholder="Adınız"
                        style={{ ...inputStyle, borderColor: errors.firstName ? "rgba(239,68,68,0.5)" : "rgba(255,255,255,0.2)" }}
                      />
                    </div>
                    <div>
                      <label style={labelStyle}>Soyad *</label>
                      <input
                        type="text"
                        value={lastName}
                        onChange={(e) => setLastName(e.target.value)}
                        placeholder="Soyadınız"
                        style={{ ...inputStyle, borderColor: errors.lastName ? "rgba(239,68,68,0.5)" : "rgba(255,255,255,0.2)" }}
                      />
                    </div>
                  </div>
                  <div className="checkout-personal-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                    <div>
                      <label style={labelStyle}><Phone size={13} /> Telefon *</label>
                      <input
                        type="tel"
                        value={phone}
                        onChange={(e) => setPhone(formatPhone(e.target.value))}
                        placeholder="0532 123 45 67"
                        style={{ ...inputStyle, borderColor: errors.phone ? "rgba(239,68,68,0.5)" : "rgba(255,255,255,0.2)" }}
                      />
                    </div>
                    <div>
                      <label style={labelStyle}><Mail size={13} /> E-posta *</label>
                      <div style={{ position: "relative" }}>
                        <input
                          type="email"
                          value={email}
                          onChange={(e) => {
                            setEmail(e.target.value);
                            // Clear email error when typing
                            if (errors.email) {
                              setErrors(prev => ({ ...prev, email: "" }));
                            }
                            // Reset login state when email changes
                            if (emailRegistered) {
                              setEmailRegistered(false);
                              setShowLoginForm(false);
                              setLoginPassword("");
                              setLoginError("");
                            }
                          }}
                          onBlur={() => {
                            // Validate email on blur
                            if (email && !isValidEmail(email)) {
                              const error = getEmailError(email);
                              if (error) setErrors(prev => ({ ...prev, email: error }));
                            }
                          }}
                          placeholder="ornek@email.com"
                          style={{ 
                            ...inputStyle, 
                            borderColor: emailRegistered ? "rgba(251, 191, 36, 0.5)" : errors.email ? "rgba(239,68,68,0.5)" : "rgba(255,255,255,0.2)",
                            paddingRight: checkingEmail ? "40px" : "12px"
                          }}
                          disabled={isAuthenticated}
                        />
                        {checkingEmail && (
                          <div style={{ position: "absolute", right: "12px", top: "50%", transform: "translateY(-50%)" }}>
                            <Loader2 size={16} className="animate-spin" style={{ color: "rgba(255,255,255,0.5)" }} />
                          </div>
                        )}
                      </div>
                      
                      {/* Email registered warning and login form */}
                      {!isAuthenticated && emailRegistered && showLoginForm && (
                        <div style={{ 
                          marginTop: "12px", 
                          padding: "16px", 
                          backgroundColor: "rgba(251, 191, 36, 0.1)", 
                          border: "1px solid rgba(251, 191, 36, 0.3)",
                          borderRadius: "12px"
                        }}>
                          <div style={{ display: "flex", alignItems: "flex-start", gap: "12px", marginBottom: "12px" }}>
                            <div style={{ 
                              width: "32px", height: "32px", borderRadius: "8px", 
                              backgroundColor: "rgba(251, 191, 36, 0.2)", 
                              display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 
                            }}>
                              <User size={16} style={{ color: "#fbbf24" }} />
                            </div>
                            <div>
                              <p style={{ fontSize: "13px", fontWeight: "600", color: "#fbbf24", margin: "0 0 4px 0" }}>
                                Bu e-posta kayıtlı!
                              </p>
                              <p style={{ fontSize: "12px", color: "rgba(255,255,255,0.7)", margin: 0 }}>
                                {registeredUserName ? `Merhaba ${registeredUserName.split(" ")[0]}! ` : ""}
                                Devam etmek için şifrenizi girin.
                              </p>
                            </div>
                          </div>
                          
                          <div style={{ display: "flex", gap: "8px", marginBottom: loginError ? "8px" : 0 }}>
                            <input
                              type="password"
                              value={loginPassword}
                              onChange={(e) => setLoginPassword(e.target.value)}
                              onKeyDown={(e) => e.key === "Enter" && handleEmailLogin()}
                              placeholder="Şifreniz"
                              style={{ 
                                ...inputStyle, 
                                flex: 1,
                                height: "40px",
                                backgroundColor: "rgba(0,0,0,0.3)",
                                borderColor: loginError ? "rgba(239,68,68,0.5)" : "rgba(255,255,255,0.2)"
                              }}
                            />
                            <button
                              type="button"
                              onClick={handleEmailLogin}
                              disabled={loggingIn || !loginPassword}
                              style={{
                                height: "40px",
                                padding: "0 16px",
                                backgroundColor: "#10b981",
                                color: "#fff",
                                border: "none",
                                borderRadius: "8px",
                                fontSize: "13px",
                                fontWeight: "600",
                                cursor: loggingIn || !loginPassword ? "not-allowed" : "pointer",
                                opacity: loggingIn || !loginPassword ? 0.6 : 1,
                                display: "flex",
                                alignItems: "center",
                                gap: "6px"
                              }}
                            >
                              {loggingIn ? <Loader2 size={14} className="animate-spin" /> : <Check size={14} />}
                              Giriş Yap
                            </button>
                          </div>
                          
                          {loginError && (
                            <p style={{ fontSize: "12px", color: "#ef4444", margin: 0 }}>{loginError}</p>
                          )}
                          
                          <div style={{ marginTop: "12px", paddingTop: "12px", borderTop: "1px solid rgba(255,255,255,0.1)" }}>
                            <Link 
                              href="/sifremi-unuttum" 
                              style={{ fontSize: "12px", color: "rgba(255,255,255,0.5)", textDecoration: "none" }}
                            >
                              Şifremi unuttum
                            </Link>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  {/* Düzenleme modundaysa Kaydet butonu göster */}
                  {editingPersonalInfo && (
                    <button
                      type="button"
                      onClick={() => {
                        if (isPersonalInfoComplete) {
                          setEditingPersonalInfo(false);
                        }
                      }}
                      disabled={!isPersonalInfoComplete}
                      style={{
                        marginTop: "12px",
                        padding: "10px 20px",
                        backgroundColor: isPersonalInfoComplete ? "#10b981" : "rgba(255,255,255,0.1)",
                        color: isPersonalInfoComplete ? "#fff" : "rgba(255,255,255,0.4)",
                        border: "none",
                        borderRadius: "8px",
                        fontSize: "13px",
                        fontWeight: "500",
                        cursor: isPersonalInfoComplete ? "pointer" : "not-allowed",
                        display: "flex",
                        alignItems: "center",
                        gap: "6px"
                      }}
                    >
                      <Check size={14} />
                      Bilgileri Kaydet
                    </button>
                  )}
                </>
              )}
            </div>

            {/* Invoice Type */}
            <div style={{ marginBottom: "24px" }}>
              <label style={labelStyle}>Fatura Tipi</label>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                <button
                  type="button"
                  onClick={() => setInvoiceType("person")}
                  style={{
                    display: "flex", alignItems: "center", justifyContent: "center", gap: "8px",
                    height: "48px", borderRadius: "12px",
                    border: invoiceType === "person" ? "1px solid rgba(255,255,255,0.4)" : "1px solid rgba(255,255,255,0.2)",
                    backgroundColor: invoiceType === "person" ? "rgba(255,255,255,0.05)" : "#0f0f0f",
                    color: invoiceType === "person" ? "#fff" : "rgba(255,255,255,0.6)",
                    fontSize: "13px", fontWeight: "500", cursor: "pointer"
                  }}
                >
                  <User size={16} /> Bireysel
                </button>
                <button
                  type="button"
                  onClick={() => setInvoiceType("company")}
                  style={{
                    display: "flex", alignItems: "center", justifyContent: "center", gap: "8px",
                    height: "48px", borderRadius: "12px",
                    border: invoiceType === "company" ? "1px solid rgba(255,255,255,0.4)" : "1px solid rgba(255,255,255,0.2)",
                    backgroundColor: invoiceType === "company" ? "rgba(255,255,255,0.05)" : "#0f0f0f",
                    color: invoiceType === "company" ? "#fff" : "rgba(255,255,255,0.6)",
                    fontSize: "13px", fontWeight: "500", cursor: "pointer"
                  }}
                >
                  <Building2 size={16} /> Kurumsal
                </button>
              </div>
            </div>

            {/* Company Fields - Sadece kurumsal seçildiğinde */}
            {invoiceType === "company" && (
              <div style={{ padding: "20px", backgroundColor: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "12px", marginBottom: "24px" }}>
                <div style={{ marginBottom: "12px" }}>
                  <label style={labelStyle}><Building2 size={13} /> Şirket Adı *</label>
                  <input
                    type="text"
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    placeholder="Şirket ünvanı"
                    style={{ ...inputStyle, borderColor: errors.companyName ? "rgba(239,68,68,0.5)" : "rgba(255,255,255,0.2)" }}
                  />
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                  <div>
                    <label style={labelStyle}><FileText size={13} /> Vergi Numarası *</label>
                    <input
                      type="text"
                      value={taxNumber}
                      onChange={(e) => setTaxNumber(e.target.value.replace(/\D/g, "").slice(0, 10))}
                      placeholder="1234567890"
                      style={{ ...inputStyle, borderColor: errors.taxNumber ? "rgba(239,68,68,0.5)" : "rgba(255,255,255,0.2)" }}
                    />
                  </div>
                  <div>
                    <label style={labelStyle}>Vergi Dairesi *</label>
                    <input
                      type="text"
                      value={taxOffice}
                      onChange={(e) => setTaxOffice(e.target.value)}
                      placeholder="Vergi dairesi adı"
                      style={{ ...inputStyle, borderColor: errors.taxOffice ? "rgba(239,68,68,0.5)" : "rgba(255,255,255,0.2)" }}
                    />
                  </div>
                </div>
              </div>
            )}

            {/* T.C. Kimlik No - Bireysel için */}
            {invoiceType === "person" && (
              <div style={{ marginBottom: "24px" }}>
                <label style={labelStyle}>T.C. Kimlik No (İsteğe bağlı)</label>
                <input
                  type="text"
                  value={tcKimlikNo}
                  onChange={(e) => setTcKimlikNo(e.target.value.replace(/\D/g, "").slice(0, 11))}
                  placeholder="11 haneli T.C. Kimlik numaranız"
                  style={inputStyle}
                />
              </div>
            )}

            {/* Saved Addresses */}
            {isAuthenticated && hasSavedAddresses && (
              <div style={{ marginBottom: "24px" }}>
                <h2 style={{ fontSize: "18px", fontWeight: "600", color: "#fff", marginBottom: "16px" }}>Teslimat Adresi</h2>
                {loadingAddresses ? (
                  <div style={{ textAlign: "center", padding: "32px" }}>
                    <Loader2 size={24} className="animate-spin" style={{ color: "rgba(255,255,255,0.3)" }} />
                  </div>
                ) : (
                  <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                    {savedAddresses.map((addr) => (
                      <div
                        key={addr.id}
                        onClick={() => handleSelectAddress(addr)}
                        style={{
                          padding: "16px",
                          borderRadius: "12px",
                          border: selectedAddressId === addr.id ? "1px solid #10b981" : "1px solid rgba(255,255,255,0.1)",
                          backgroundColor: selectedAddressId === addr.id ? "rgba(16,185,129,0.05)" : "rgba(255,255,255,0.02)",
                          cursor: "pointer"
                        }}
                      >
                        <div style={{ display: "flex", alignItems: "flex-start", gap: "12px" }}>
                          <div style={{
                            width: "20px", height: "20px", borderRadius: "50%",
                            border: selectedAddressId === addr.id ? "2px solid #10b981" : "2px solid rgba(255,255,255,0.3)",
                            display: "flex", alignItems: "center", justifyContent: "center",
                            flexShrink: 0, marginTop: "2px"
                          }}>
                            {selectedAddressId === addr.id && <div style={{ width: "10px", height: "10px", borderRadius: "50%", backgroundColor: "#10b981" }} />}
                          </div>
                          <div style={{ flex: 1 }}>
                            <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "4px" }}>
                              <span style={{ fontSize: "14px", fontWeight: "500", color: "#fff" }}>{addr.title}</span>
                              {addr.isDefault && <span style={{ fontSize: "10px", padding: "2px 8px", backgroundColor: "rgba(16,185,129,0.2)", color: "#10b981", borderRadius: "999px" }}>Varsayılan</span>}
                            </div>
                            <p style={{ fontSize: "12px", color: "rgba(255,255,255,0.5)", marginBottom: "4px" }}>
                              {addr.addressLine1}, {addr.district}, {addr.city}
                            </p>
                            <p style={{ fontSize: "12px", color: "rgba(255,255,255,0.4)" }}>{addr.phone}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                    <button
                      type="button"
                      onClick={() => { 
                        if (showNewAddressForm) {
                          // Form açıksa kapat ve varsayılan adresi seç
                          setShowNewAddressForm(false);
                          const defaultAddr = savedAddresses.find(a => a.isDefault) || savedAddresses[0];
                          if (defaultAddr) {
                            setSelectedAddressId(defaultAddr.id);
                            setCity(defaultAddr.city);
                            setDistrict(defaultAddr.district);
                            setAddressLine1(defaultAddr.addressLine1);
                            setPostalCode(defaultAddr.postalCode);
                          }
                        } else {
                          // Form kapalıysa aç
                          setSelectedAddressId(null); 
                          setShowNewAddressForm(true); 
                          setCity(""); 
                          setDistrict(""); 
                          setAddressLine1(""); 
                          setPostalCode("");
                        }
                      }}
                      style={{
                        display: "flex", alignItems: "center", justifyContent: "center", gap: "8px",
                        padding: "16px", borderRadius: "12px",
                        border: showNewAddressForm && !selectedAddressId ? "1px solid #10b981" : "1px dashed rgba(255,255,255,0.2)",
                        backgroundColor: "transparent",
                        color: showNewAddressForm && !selectedAddressId ? "#10b981" : "rgba(255,255,255,0.6)",
                        fontSize: "13px", fontWeight: "500", cursor: "pointer"
                      }}
                    >
                      <PlusIcon size={16} /> {showNewAddressForm ? "İptal" : "Yeni Adres Ekle"}
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* New Address Form - sadece butona basılınca veya kayıtlı adres yoksa göster */}
            {!loadingAddresses && (showNewAddressForm || (!isAuthenticated) || (!hasSavedAddresses && isAuthenticated)) && (
              <div style={{ marginBottom: "24px" }}>
                {hasSavedAddresses && showNewAddressForm && <h3 style={{ fontSize: "16px", fontWeight: "500", color: "#fff", marginBottom: "16px" }}>Yeni Adres</h3>}
                {!hasSavedAddresses && <h2 style={{ fontSize: "18px", fontWeight: "600", color: "#fff", marginBottom: "16px" }}>Teslimat Adresi</h2>}
                
                <div className="checkout-address-grid-3" style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "12px", marginBottom: "12px" }}>
                  <div>
                    <label style={labelStyle}>Ülke</label>
                    <input type="text" value="Türkiye" disabled style={{ ...inputStyle, opacity: 0.6, cursor: "not-allowed" }} />
                  </div>
                  <div style={{ position: "relative" }}>
                    <label style={labelStyle}><MapPin size={13} /> İl *</label>
                    <select
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      style={{ ...selectStyle, borderColor: errors.city ? "rgba(239,68,68,0.5)" : "rgba(255,255,255,0.2)" }}
                    >
                      <option value="">İl Seçin</option>
                      {CITIES.map((c) => (<option key={c} value={c}>{c}</option>))}
                    </select>
                    <ChevronDown size={16} style={{ position: "absolute", right: "16px", top: "42px", color: "rgba(255,255,255,0.3)", pointerEvents: "none" }} />
                  </div>
                  <div style={{ position: "relative" }}>
                    <label style={labelStyle}>İlçe *</label>
                    <select
                      value={district}
                      onChange={(e) => setDistrict(e.target.value)}
                      disabled={!city}
                      style={{ ...selectStyle, borderColor: errors.district ? "rgba(239,68,68,0.5)" : "rgba(255,255,255,0.2)", opacity: !city ? 0.5 : 1 }}
                    >
                      <option value="">İlçe Seçin</option>
                      {districts.map((d) => (<option key={d} value={d}>{d}</option>))}
                    </select>
                    <ChevronDown size={16} style={{ position: "absolute", right: "16px", top: "42px", color: "rgba(255,255,255,0.3)", pointerEvents: "none" }} />
                  </div>
                </div>

                <div style={{ marginBottom: "12px" }}>
                  <label style={labelStyle}><MapPin size={13} /> Adres *</label>
                  <input
                    type="text"
                    value={addressLine1}
                    onChange={(e) => setAddressLine1(e.target.value)}
                    placeholder="Mahalle, Sokak, Bina No"
                    style={{ ...inputStyle, borderColor: errors.addressLine1 ? "rgba(239,68,68,0.5)" : "rgba(255,255,255,0.2)" }}
                  />
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginBottom: "16px" }}>
                  <div>
                    <label style={labelStyle}>Adres Devamı</label>
                    <input type="text" value={addressLine2} onChange={(e) => setAddressLine2(e.target.value)} placeholder="Daire, Kat vb." style={inputStyle} />
                  </div>
                  <div>
                    <label style={labelStyle}>Posta Kodu</label>
                    <input type="text" value={postalCode} onChange={(e) => setPostalCode(e.target.value.replace(/\D/g, "").slice(0, 5))} placeholder="34000" style={inputStyle} />
                  </div>
                </div>

                {/* Kayıtlı adreslerime ekle - sadece giriş yapmış kullanıcılar için */}
                {isAuthenticated && (
                  <label style={{ display: "flex", alignItems: "center", gap: "12px", cursor: "pointer", padding: "12px 16px", backgroundColor: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "12px" }}>
                    <div
                      onClick={() => setSaveToAddresses(!saveToAddresses)}
                      style={{
                        width: "20px",
                        height: "20px",
                        borderRadius: "6px",
                        border: saveToAddresses ? "2px solid #10b981" : "2px solid rgba(255,255,255,0.3)",
                        backgroundColor: saveToAddresses ? "#10b981" : "transparent",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        flexShrink: 0
                      }}
                    >
                      {saveToAddresses && <Check size={12} color="#fff" strokeWidth={3} />}
                    </div>
                    <span style={{ fontSize: "13px", color: "rgba(255,255,255,0.7)" }}>
                      Bu adresi kayıtlı adreslerime ekle
                    </span>
                  </label>
                )}
              </div>
            )}

            {/* Order Notes */}
            <div>
              <label style={labelStyle}>Sipariş Notları (İsteğe bağlı)</label>
              <textarea
                value={orderNotes}
                onChange={(e) => setOrderNotes(e.target.value)}
                placeholder="Siparişinizle ilgili eklemek istediğiniz notlar..."
                rows={3}
                style={{
                  width: "100%",
                  padding: "12px 16px",
                  backgroundColor: "#0f0f0f",
                  border: "1px solid rgba(255,255,255,0.2)",
                  borderRadius: "12px",
                  fontSize: "14px",
                  color: "#fff",
                  outline: "none",
                  resize: "none"
                }}
              />
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
                    
                    {/* Price, Discount, Quantity - Stacked layout */}
                    <div className="flex flex-col gap-1.5 mt-2">
                      {/* Row 1: Original price */}
                      <div className="flex items-baseline gap-1">
                        <span className="text-[15px] font-semibold text-white">
                          {formatPrice((item.originalPrice ?? item.price) * item.quantity)}
                        </span>
                        <span className="text-[11px] text-white/40">₺</span>
                      </div>
                      
                      {/* Row 2: Discounted price + savings - only if there's a discount */}
                      {item.originalPrice && item.originalPrice > item.price && (
                        <div className="flex flex-wrap items-center gap-x-1.5 gap-y-0.5">
                          <span className="text-[10px] text-white/50">İndirimli Fiyat:</span>
                          <span className="text-[11px] text-white font-medium">{formatPrice(item.price * item.quantity)} ₺</span>
                          <span className="text-[10px] text-white/30">•</span>
                          <span className="text-[10px] text-emerald-400 font-medium">{formatPrice((item.originalPrice - item.price) * item.quantity)} ₺ kazanç</span>
                        </div>
                      )}
                      
                      {/* Row 3: Quantity Controls - smaller on mobile */}
                      <div className="checkout-quantity-controls flex items-center self-start bg-white/[0.04] border border-white/[0.06] rounded p-px md:rounded-md md:p-0.5">
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          className="w-5 h-5 md:w-6 md:h-6 flex items-center justify-center text-white/40 hover:text-white hover:bg-white/[0.08] transition-all rounded-sm md:rounded"
                          type="button"
                        >
                          <Minus className="w-2.5 h-2.5 md:w-3 md:h-3" />
                        </button>
                        <span className="w-5 md:w-6 text-center text-[10px] md:text-[12px] font-medium text-white/80">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          className="w-5 h-5 md:w-6 md:h-6 flex items-center justify-center text-white/40 hover:text-white hover:bg-white/[0.08] transition-all rounded-sm md:rounded"
                          type="button"
                        >
                          <Plus className="w-2.5 h-2.5 md:w-3 md:h-3" />
                        </button>
                      </div>
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

            {/* Coupon */}
            <div style={{ borderTop: "1px solid rgba(255,255,255,0.08)", paddingTop: "20px", marginBottom: "20px" }}>
              {appliedCoupon ? (
                // Kupon uygulandı
                <div style={{ 
                  display: "flex", 
                  alignItems: "center", 
                  justifyContent: "space-between",
                  padding: "12px 16px", 
                  backgroundColor: "rgba(16,185,129,0.1)", 
                  border: "1px solid rgba(16,185,129,0.3)", 
                  borderRadius: "12px" 
                }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                    <Check size={18} style={{ color: "#10b981" }} />
                    <div>
                      <span style={{ fontSize: "14px", fontWeight: "600", color: "#10b981" }}>
                        {appliedCoupon.code}
                      </span>
                      <span style={{ fontSize: "13px", color: "rgba(255,255,255,0.5)", marginLeft: "8px" }}>
                        -{formatPrice(appliedCoupon.discount)}
                      </span>
                    </div>
                  </div>
                  <button 
                    onClick={removeCoupon}
                    style={{ 
                      padding: "6px 12px", 
                      backgroundColor: "transparent", 
                      border: "1px solid rgba(255,255,255,0.2)", 
                      borderRadius: "8px", 
                      fontSize: "12px", 
                      color: "rgba(255,255,255,0.5)", 
                      cursor: "pointer" 
                    }}
                  >
                    Kaldır
                  </button>
                </div>
              ) : !showCoupon ? (
                <button onClick={() => setShowCoupon(true)} style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "14px", color: "rgba(255,255,255,0.5)", backgroundColor: "transparent", border: "none", cursor: "pointer" }}>
                  <Tag size={16} /> Kuponunuz var mı?
                </button>
              ) : (
                <div>
                  <div style={{ display: "flex", gap: "12px" }}>
                    <input
                      type="text"
                      value={couponCode}
                      onChange={(e) => {
                        setCouponCode(e.target.value.toUpperCase());
                        setCouponError("");
                      }}
                      onKeyDown={(e) => e.key === "Enter" && applyCoupon()}
                      placeholder="Kupon kodu"
                      disabled={couponLoading}
                      style={{ 
                        flex: 1, 
                        height: "44px", 
                        padding: "0 16px", 
                        backgroundColor: "#0f0f0f", 
                        border: couponError ? "1px solid #ef4444" : "1px solid rgba(255,255,255,0.2)", 
                        borderRadius: "12px", 
                        fontSize: "14px", 
                        color: "#fff", 
                        outline: "none" 
                      }}
                    />
                    <button 
                      onClick={applyCoupon}
                      disabled={couponLoading || !couponCode.trim()}
                      style={{ 
                        padding: "0 20px", 
                        height: "44px", 
                        backgroundColor: couponLoading ? "rgba(255,255,255,0.05)" : "rgba(255,255,255,0.1)", 
                        border: "1px solid rgba(255,255,255,0.2)", 
                        borderRadius: "12px", 
                        fontSize: "14px", 
                        fontWeight: "500", 
                        color: "#fff", 
                        cursor: couponLoading ? "wait" : "pointer",
                        display: "flex",
                        alignItems: "center",
                        gap: "8px"
                      }}
                    >
                      {couponLoading && <Loader2 size={16} className="animate-spin" />}
                      Uygula
                    </button>
                  </div>
                  {couponError && (
                    <p style={{ fontSize: "12px", color: "#ef4444", marginTop: "8px" }}>
                      {couponError}
                    </p>
                  )}
                </div>
              )}
            </div>

            {/* Free Shipping Progress Bar */}
            {amountToFreeShipping > 0 && (
              <div style={{ 
                padding: "12px 16px", 
                background: "linear-gradient(to right, rgba(245,158,11,0.1), rgba(249,115,22,0.05))",
                border: "1px solid rgba(245,158,11,0.2)", 
                borderRadius: "12px",
                marginBottom: "16px"
              }}>
                <p style={{ fontSize: "12px", fontWeight: "500", color: "#fbbf24", margin: 0, marginBottom: "8px" }}>
                  <span style={{ fontWeight: "700" }}>{formatPrice(amountToFreeShipping)}</span> daha ekle, <span style={{ fontWeight: "700" }}>ücretsiz kargo</span> kazan!
                </p>
                <div style={{ 
                  height: "6px", 
                  backgroundColor: "rgba(255,255,255,0.1)", 
                  borderRadius: "4px",
                  overflow: "hidden"
                }}>
                  <div style={{ 
                    height: "100%", 
                    background: "linear-gradient(to right, #fbbf24, #34d399)",
                    borderRadius: "4px",
                    transition: "width 0.5s ease",
                    width: `${Math.min(100, (subtotal / freeShippingThreshold) * 100)}%`
                  }} />
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", marginTop: "6px" }}>
                  <span style={{ fontSize: "10px", color: "rgba(255,255,255,0.3)" }}>{formatPrice(subtotal)}</span>
                  <span style={{ fontSize: "10px", color: "rgba(52,211,153,0.6)" }}>{formatPrice(freeShippingThreshold)} Ücretsiz Kargo</span>
                </div>
              </div>
            )}

            {/* Shipping Options */}
            <div style={{ borderTop: "1px solid rgba(255,255,255,0.08)", paddingTop: "20px", marginBottom: "20px" }}>
              <h3 style={{ fontSize: "15px", fontWeight: "500", color: "#fff", marginBottom: "16px", display: "flex", alignItems: "center", gap: "8px" }}>
                <Truck size={18} /> Kargo Seçenekleri
              </h3>
              
              {loadingShipping ? (
                <div style={{ textAlign: "center", padding: "20px" }}>
                  <Loader2 size={24} className="animate-spin" style={{ color: "rgba(255,255,255,0.3)" }} />
                </div>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                  {shippingOptions.map((option) => (
                    <label
                      key={option.id}
                      style={{
                        display: "flex", alignItems: "flex-start", justifyContent: "space-between",
                        padding: "16px", borderRadius: "12px",
                        border: selectedShippingId === option.id 
                          ? option.isFree ? "1px solid #10b981" : "1px solid #f59e0b"
                          : "1px solid rgba(255,255,255,0.1)",
                        backgroundColor: selectedShippingId === option.id 
                          ? option.isFree ? "rgba(16,185,129,0.1)" : "rgba(245,158,11,0.05)"
                          : "rgba(255,255,255,0.02)",
                        cursor: "pointer"
                      }}
                    >
                      <div style={{ display: "flex", alignItems: "flex-start", gap: "12px", flex: 1 }}>
                        <div style={{ width: "20px", height: "20px", borderRadius: "50%", border: selectedShippingId === option.id ? (option.isFree ? "2px solid #10b981" : "2px solid #f59e0b") : "2px solid rgba(255,255,255,0.3)", display: "flex", alignItems: "center", justifyContent: "center", marginTop: "2px" }}>
                          {selectedShippingId === option.id && <div style={{ width: "10px", height: "10px", borderRadius: "50%", backgroundColor: option.isFree ? "#10b981" : "#f59e0b" }} />}
                        </div>
                        <div style={{ flex: 1 }}>
                          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "8px" }}>
                            <span style={{ fontSize: "14px", fontWeight: "500", color: "#fff" }}>{option.name}</span>
                            <span style={{ fontSize: "14px", fontWeight: "600", color: option.isFree ? "#10b981" : "#fff" }}>
                              {option.isFree ? "Ücretsiz" : formatPrice(option.cost)}
                            </span>
                          </div>
                          {/* Kargo Timer */}
                          <KargoTimer variant="odeme" isFreeShipping={option.isFree} />
                        </div>
                      </div>
                      <input 
                        type="radio" 
                        name="shipping" 
                        checked={selectedShippingId === option.id} 
                        onChange={() => setSelectedShippingId(option.id)} 
                        style={{ display: "none" }} 
                      />
                    </label>
                  ))}
                </div>
              )}
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

            {/* Validation Errors */}
            {Object.keys(errors).length > 0 && (
              <div style={{ 
                marginBottom: "16px", 
                padding: "12px 16px", 
                backgroundColor: "rgba(239,68,68,0.1)", 
                border: "1px solid rgba(239,68,68,0.3)", 
                borderRadius: "12px" 
              }}>
                <p style={{ fontSize: "13px", fontWeight: "500", color: "#f87171", marginBottom: "8px" }}>
                  Lütfen eksik bilgileri tamamlayın:
                </p>
                <ul style={{ margin: 0, paddingLeft: "16px" }}>
                  {Object.values(errors).slice(0, 5).map((error, i) => (
                    <li key={i} style={{ fontSize: "12px", color: "#fca5a5", marginBottom: "4px" }}>
                      {error}
                    </li>
                  ))}
                  {Object.keys(errors).length > 5 && (
                    <li style={{ fontSize: "12px", color: "#fca5a5" }}>
                      ...ve {Object.keys(errors).length - 5} eksik alan daha
                    </li>
                  )}
                </ul>
              </div>
            )}

            {/* Continue Button */}
            <button
              onClick={handleProceedToPayment}
              disabled={isSubmitting}
              onMouseEnter={() => setHoverProceed(true)}
              onMouseLeave={() => setHoverProceed(false)}
              style={{
                width: "100%",
                display: "flex", alignItems: "center", justifyContent: "center", gap: "8px",
                height: "56px", fontWeight: "600", borderRadius: "12px",
                backgroundColor: hoverProceed ? "#10b981" : "#fff",
                color: hoverProceed ? "#fff" : "#000",
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
                  <CreditCard size={20} />
                  Ödemeye Geç
                  <ChevronRight size={18} />
                </>
              )}
            </button>

            {/* Trust */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "8px", color: "rgba(255,255,255,0.3)", marginTop: "20px" }}>
              <ShieldCheck size={16} />
              <span style={{ fontSize: "12px" }}>256-bit SSL ile güvenli ödeme</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
