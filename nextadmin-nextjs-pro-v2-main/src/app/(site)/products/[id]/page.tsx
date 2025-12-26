"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import RichTextEditor from "@/components/FormElements/RichTextEditor";
import MediaLibrary from "@/components/MediaLibrary";
import VariationOptions from "@/components/VariationOptions";
import VariationGenerator from "@/components/VariationGenerator";
import VariantTable from "@/components/VariantTable";

// Kategoriler API'den çekilecek - state'te tutulacak

// Varsayılan markalar (veritabanındaki gerçek markalar)
const defaultBrands = [
  { id: "1", name: "Traffi Gloves" },
  { id: "2", name: "Initial Entropy Energy" },
  { id: "3", name: "Telescopics" },
  { id: "4", name: "RGP Balls" },
];

// Ürünler API'den çekilecek - interface tanımı
interface LinkedProduct {
  id: string;
  name: string;
  category: string;
  price: number;
  image: string;
}

const defaultFeatureIcons = [
  { name: "Garanti", svg: `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M9 12.75 11.25 15 15 9.75m-3-7.036A11.959 11.959 0 0 1 3.598 6 11.99 11.99 0 0 0 3 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285Z" /></svg>` },
  { name: "Kargo", svg: `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M8.25 18.75a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 0 1-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m3 0h1.125c.621 0 1.129-.504 1.09-1.124a17.902 17.902 0 0 0-3.213-9.193 2.056 2.056 0 0 0-1.58-.86H14.25M16.5 18.75h-2.25m0-11.177v-.958c0-.568-.422-1.048-.987-1.106a48.554 48.554 0 0 0-10.026 0 1.106 1.106 0 0 0-.987 1.106v7.635m12-6.677v6.677m0 4.5v-4.5m0 0h-12" /></svg>` },
  { name: "İade", svg: `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182m0-4.991v4.99" /></svg>` },
  { name: "Destek", svg: `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0 1.172 1.025 1.172 2.687 0 3.712-.203.179-.43.326-.67.442-.745.361-1.45.999-1.45 1.827v.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 5.25h.008v.008H12v-.008Z" /></svg>` },
  { name: "Kalite", svg: `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M11.48 3.499a.562.562 0 0 1 1.04 0l2.125 5.111a.563.563 0 0 0 .475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 0 0-.182.557l1.285 5.385a.562.562 0 0 1-.84.61l-4.725-2.885a.562.562 0 0 0-.586 0L6.982 20.54a.562.562 0 0 1-.84-.61l1.285-5.386a.562.562 0 0 0-.182-.557l-4.204-3.602a.562.562 0 0 1 .321-.988l5.518-.442a.563.563 0 0 0 .475-.345L11.48 3.5Z" /></svg>` },
  { name: "Pil", svg: `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M21 10.5h.375c.621 0 1.125.504 1.125 1.125v2.25c0 .621-.504 1.125-1.125 1.125H21M4.5 10.5H18V15H4.5v-4.5ZM3.75 18h15A2.25 2.25 0 0 0 21 15.75v-6a2.25 2.25 0 0 0-2.25-2.25h-15A2.25 2.25 0 0 0 1.5 9.75v6A2.25 2.25 0 0 0 3.75 18Z" /></svg>` },
];

interface Feature {
  id: string;
  title: string;
  description: string;
  svg: string;
  color: string;
}

// Teknik Özellik Tanımları için interface'ler
interface FeaturePresetValue {
  value: string;
  label: string;
}

interface CategoryFeatureDefinition {
  id: string;
  name: string;
  slug: string;
  inputType: 'TEXT' | 'NUMBER' | 'SELECT';
  unit: string | null;
  description: string | null;
  placeholder: string | null;
  presetValues: FeaturePresetValue[];
  sortOrder: number;
  isRequired: boolean;
  isDefault: boolean;
}

interface TechnicalFeatureValue {
  featureId: string;
  featureName: string;
  inputType: 'TEXT' | 'NUMBER' | 'SELECT';
  unit: string | null;
  presetValues: FeaturePresetValue[];
  value: string;
  displayOrder: number;
}

export default function EditProductPage() {
  const params = useParams();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [product, setProduct] = useState<any>(null);
  
  // Form states
  const [productName, setProductName] = useState("");
  const [description, setDescription] = useState("");
  const [shortDescription, setShortDescription] = useState("");
  const [productType, setProductType] = useState("simple");
  const [regularPrice, setRegularPrice] = useState("");
  const [salePrice, setSalePrice] = useState("");
  const [saleEndDate, setSaleEndDate] = useState("");
  const [showSaleDatePicker, setShowSaleDatePicker] = useState(false);
  const [sku, setSku] = useState("");
  const [stockAmount, setStockAmount] = useState("");
  const [weight, setWeight] = useState("");
  const [shippingClassId, setShippingClassId] = useState("");
  const [shippingClasses, setShippingClasses] = useState<{ id: string; name: string; alwaysFree: boolean }[]>([]);
  const [brand, setBrand] = useState("");
  const [metaTitle, setMetaTitle] = useState("");
  const [metaDescription, setMetaDescription] = useState("");
  const [isActive, setIsActive] = useState(true);
  const [isFeatured, setIsFeatured] = useState(false);
  const [isNew, setIsNew] = useState(false);
  const [productImages, setProductImages] = useState<string[]>([]);
  const [thumbnail, setThumbnail] = useState("");
  const [categoryName, setCategoryName] = useState("");
  const [showMediaModal, setShowMediaModal] = useState(false);
  const [mediaSelectMode, setMediaSelectMode] = useState<"thumbnail" | "gallery" | "video">("thumbnail");
  const [productVideo, setProductVideo] = useState("");
  const [uploading, setUploading] = useState(false);
  
  const [activeTab, setActiveTab] = useState("general");
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [categories, setCategories] = useState<Array<{ id: string; name: string }>>([]);
  const [tags, setTags] = useState("");
  const [features, setFeatures] = useState<Feature[]>([]);
  const [newFeature, setNewFeature] = useState<Partial<Feature>>({ title: "", description: "", svg: "", color: "#5750F1" });
  const [showFeatureModal, setShowFeatureModal] = useState(false);
  const [editingFeatureId, setEditingFeatureId] = useState<string | null>(null);
  
  // Varyasyon State'leri
  const [optionGroups, setOptionGroups] = useState<Array<{
    id: string;
    name: string;
    type: 'select' | 'color';
    values: Array<{ id: string; value: string; hex?: string }>;
  }>>([]);
  const [variants, setVariants] = useState<Array<{
    id: string;
    combinationKey: string;
    combination: Record<string, string>;
    sku: string;
    price: string;
    salePrice: string;
    stock: string;
    image: string;
    isActive: boolean;
    displayValue: string;
    colorCode: string;
  }>>([]);
  const [selectedVariants, setSelectedVariants] = useState<string[]>([]);
  const [skuPrefix, setSkuPrefix] = useState("");
  const [variantImageSelect, setVariantImageSelect] = useState<string | null>(null);
  
  // Bağlantılı Ürünler State'leri
  const [frequentlyBoughtTogether, setFrequentlyBoughtTogether] = useState<string[]>([]);
  const [customersAlsoViewed, setCustomersAlsoViewed] = useState<string[]>([]);
  const [upsellProducts, setUpsellProducts] = useState<string[]>([]);
  const [crossSellProducts, setCrossSellProducts] = useState<string[]>([]);
  const [linkedProductSearch, setLinkedProductSearch] = useState("");
  const [allProducts, setAllProducts] = useState<LinkedProduct[]>([]);

  // Teknik Özellikler State'leri
  const [availableTechFeatures, setAvailableTechFeatures] = useState<CategoryFeatureDefinition[]>([]);
  const [technicalFeatureValues, setTechnicalFeatureValues] = useState<TechnicalFeatureValue[]>([]);
  const [loadingTechFeatures, setLoadingTechFeatures] = useState(false);

  const tabs = [
    { id: "general", label: "Genel" },
    { id: "pricing", label: "Fiyatlandırma" },
    { id: "inventory", label: "Envanter & Kargo" },
    ...(productType === "variable" ? [{ id: "variations", label: "Varyasyonlar" }] : []),
    { id: "linked", label: "Bağlantılı Ürünler" },
    { id: "technical", label: "Teknik Özellikler" },
    { id: "features", label: "Özellikler" },
    { id: "seo", label: "SEO" },
    { id: "advanced", label: "Gelişmiş" },
  ];

  // Kategorileri API'den çek
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await fetch("/api/categories?includeAll=true");
        if (res.ok) {
          const data = await res.json();
          setCategories(data.categories || data || []);
        }
      } catch (error) {
        console.error("Error fetching categories:", error);
      }
    };
    fetchCategories();
  }, []);

  // Kargo sınıflarını API'den çek
  useEffect(() => {
    const fetchShippingClasses = async () => {
      try {
        const res = await fetch("/api/admin/shipping/classes");
        if (res.ok) {
          const data = await res.json();
          setShippingClasses(data || []);
        }
      } catch (error) {
        console.error("Error fetching shipping classes:", error);
      }
    };
    fetchShippingClasses();
  }, []);

  // Kategori değiştiğinde teknik özellikleri çek
  useEffect(() => {
    const fetchCategoryFeatures = async () => {
      if (!selectedCategories[0]) {
        setAvailableTechFeatures([]);
        return;
      }

      setLoadingTechFeatures(true);
      try {
        const res = await fetch(`/api/admin/categories/${selectedCategories[0]}/features`);
        if (res.ok) {
          const data = await res.json();
          setAvailableTechFeatures(data.features || []);
          
          // Mevcut değerleri kontrol et ve uyumsuz olanları temizle
          setTechnicalFeatureValues(prev => {
            const validPrev = prev.filter(v => 
              (data.features || []).some((f: CategoryFeatureDefinition) => f.id === v.featureId)
            );
            
            // Eğer yeni ürün veya değer yoksa, varsayılan özellikleri ekle
            if (validPrev.length === 0) {
              const defaultFeatures = (data.features || [])
                .filter((f: CategoryFeatureDefinition) => f.isDefault)
                .map((f: CategoryFeatureDefinition, index: number) => ({
                  featureId: f.id,
                  featureName: f.name,
                  inputType: f.inputType,
                  unit: f.unit,
                  presetValues: f.presetValues,
                  value: '',
                  displayOrder: index,
                }));
              return defaultFeatures;
            }
            
            return validPrev;
          });
        }
      } catch (error) {
        console.error("Error fetching category features:", error);
      } finally {
        setLoadingTechFeatures(false);
      }
    };
    
    fetchCategoryFeatures();
  }, [selectedCategories]);

  // Teknik Özellik Yönetim Fonksiyonları
  const addTechnicalFeature = (featureId: string) => {
    const feature = availableTechFeatures.find(f => f.id === featureId);
    if (!feature) return;
    
    // Duplicate kontrolü
    if (technicalFeatureValues.some(v => v.featureId === featureId)) return;
    
    setTechnicalFeatureValues(prev => [
      ...prev,
      {
        featureId: feature.id,
        featureName: feature.name,
        inputType: feature.inputType,
        unit: feature.unit,
        presetValues: feature.presetValues,
        value: '',
        displayOrder: prev.length,
      }
    ]);
  };

  const updateTechnicalFeatureValue = (featureId: string, value: string) => {
    setTechnicalFeatureValues(prev =>
      prev.map(v =>
        v.featureId === featureId ? { ...v, value } : v
      )
    );
  };

  const removeTechnicalFeature = (featureId: string) => {
    setTechnicalFeatureValues(prev =>
      prev.filter(v => v.featureId !== featureId)
    );
  };

  // Kullanılmamış (henüz eklenebilir) özellikler
  const unusedTechFeatures = availableTechFeatures.filter(
    f => !technicalFeatureValues.some(v => v.featureId === f.id)
  );

  // Tüm ürünleri API'den çek (Bağlantılı ürünler için)
  useEffect(() => {
    const fetchAllProducts = async () => {
      try {
        const res = await fetch("/api/products?limit=1000");
        if (res.ok) {
          const data = await res.json();
          const products = data.products || data || [];
          setAllProducts(products.map((p: any) => ({
            id: p.id,
            name: p.name,
            category: p.category?.name || "Kategori Yok",
            price: Number(p.price) || 0,
            image: p.thumbnail || p.images?.[0] || "",
          })));
        }
      } catch (error) {
        console.error("Error fetching all products:", error);
      }
    };
    fetchAllProducts();
  }, []);

  // Ürün verilerini çek
  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const res = await fetch(`/api/products/${params.id}`);
        if (res.ok) {
          const data = await res.json();
          setProduct(data);
          setProductName(data.name || "");
          setDescription(data.description || "");
          setShortDescription(data.shortDescription || "");
          setProductType(data.productType?.toLowerCase() || "simple");
          setRegularPrice(data.comparePrice?.toString() || data.price?.toString() || "");
          setSalePrice(data.comparePrice ? data.price?.toString() : "");
          setSku(data.sku || "");
          setStockAmount(data.stock?.toString() || "0");
          setWeight(data.weight?.toString() || "");
          setShippingClassId(data.shippingClassId || "");
          setBrand(data.brand || "");
          setMetaTitle(data.metaTitle || "");
          setMetaDescription(data.metaDescription || "");
          setIsActive(data.isActive ?? true);
          setIsFeatured(data.isFeatured ?? false);
          setIsNew(data.isNew ?? false);
          setProductImages(data.images || []);
          setThumbnail(data.thumbnail || (data.images && data.images[0]) || "");
          setProductVideo(data.videoUrl || "");
          setCategoryName(data.category?.name || "");
          
          // Kategori ID'sini selectedCategories'e ekle
          if (data.categoryId) {
            setSelectedCategories([data.categoryId]);
          }
          
          // Key Features'ları yükle
          if (data.keyFeatures && data.keyFeatures.length > 0) {
            const loadedFeatures = data.keyFeatures.map((kf: any) => ({
              id: kf.id,
              title: kf.title,
              description: "",
              svg: kf.icon || defaultFeatureIcons[0].svg,
              color: "#22C55E"
            }));
            setFeatures(loadedFeatures);
          }
          
          // Varyantları yükle (productType API'den gelen değere göre zaten ayarlandı)
          if (data.variants && data.variants.length > 0) {
            
            // Varyantları forma dönüştür
            const loadedVariants = data.variants.map((v: any) => {
              // combinationKey'den combination objesi oluştur
              const combination: Record<string, string> = {};
              if (v.combinationKey) {
                v.combinationKey.split("|").forEach((pair: string) => {
                  const [key, value] = pair.split(":");
                  if (key && value) {
                    combination[key.trim()] = value.trim();
                  }
                });
              }
              
              return {
                id: v.id,
                combinationKey: v.combinationKey || "",
                combination,
                sku: v.sku || "",
                price: v.price?.toString() || "",
                salePrice: v.salePrice?.toString() || "",
                stock: v.stock?.toString() || "0",
                image: v.image || "",
                isActive: v.isActive ?? true,
                displayValue: v.value || "",
                colorCode: v.colorCode || "",
              };
            });
            setVariants(loadedVariants);
            
            // OptionGroups'u varyantlardan oluştur (name ve value alanlarından)
            const optionGroupsMap = new Map<string, Set<string>>();
            
            data.variants.forEach((v: any) => {
              // Varyantın name'i opsiyon grubu adı (örn: "Eldiven Numarası", "Renk")
              const groupName = v.name || (v.type === 'color' ? 'Renk' : 'Beden');
              const groupValue = v.value || '';
              
              if (groupValue) {
                if (!optionGroupsMap.has(groupName)) {
                  optionGroupsMap.set(groupName, new Set());
                }
                optionGroupsMap.get(groupName)!.add(groupValue);
              }
            });
            
            const loadedOptionGroups = Array.from(optionGroupsMap.entries()).map(([name, values], idx) => {
              const isColor = name.toLowerCase().includes("renk") || name.toLowerCase().includes("color");
              
              return {
              id: `og_${idx}`,
              name,
                type: isColor ? "color" as const : "select" as const,
                values: Array.from(values).map((val, i) => {
                  // Renk için hex kodu bul
                  let hex = undefined;
                  if (isColor) {
                    const variant = data.variants.find((v: any) => v.value === val);
                    hex = variant?.colorCode || undefined;
                  }
                  
                  return {
                id: `ov_${idx}_${i}`,
                value: val,
                    hex,
                  };
                }),
              };
            });
            setOptionGroups(loadedOptionGroups);
          }
          
          // İlişkili ürünleri yükle
          if (data.relatedFrom && data.relatedFrom.length > 0) {
            const frequently = data.relatedFrom
              .filter((r: any) => r.relationType === 'FREQUENTLY_BOUGHT')
              .map((r: any) => r.relatedProductId);
            const alsoViewed = data.relatedFrom
              .filter((r: any) => r.relationType === 'ALSO_VIEWED')
              .map((r: any) => r.relatedProductId);
            const upsell = data.relatedFrom
              .filter((r: any) => r.relationType === 'UPSELL')
              .map((r: any) => r.relatedProductId);
            const crossSell = data.relatedFrom
              .filter((r: any) => r.relationType === 'CROSS_SELL')
              .map((r: any) => r.relatedProductId);

            setFrequentlyBoughtTogether(frequently);
            setCustomersAlsoViewed(alsoViewed);
            setUpsellProducts(upsell);
            setCrossSellProducts(crossSell);
          }

          // Teknik Özellik Değerlerini yükle
          if (data.productFeatureValues && data.productFeatureValues.length > 0) {
            // Silinmiş özellikleri filtrele (feature null olanlar)
            const validFeatureValues = data.productFeatureValues.filter(
              (pfv: any) => pfv.feature !== null && pfv.feature !== undefined
            );
            const deletedCount = data.productFeatureValues.length - validFeatureValues.length;
            
            const loadedTechValues = validFeatureValues.map((pfv: any, index: number) => ({
              featureId: pfv.featureId,
              featureName: pfv.feature?.name || 'Bilinmeyen Özellik',
              inputType: pfv.feature?.inputType || 'TEXT',
              unit: pfv.unit || pfv.feature?.unit || null,
              presetValues: (pfv.feature?.presetValues || []).map((pv: any) => ({
                value: pv.value,
                label: pv.label || pv.value,
              })),
              value: pfv.valueText || (pfv.valueNumber !== null ? String(pfv.valueNumber) : ''),
              displayOrder: pfv.displayOrder ?? index,
            }));
            setTechnicalFeatureValues(loadedTechValues);
            
            // Silinmiş özellik varsa uyarı göster
            if (deletedCount > 0) {
              console.warn(`⚠️ ${deletedCount} adet silinmiş özellik değeri temizlendi.`);
            }
          }
        }
      } catch (error) {
        console.error("Error fetching product:", error);
      } finally {
        setLoading(false);
      }
    };
    if (params.id) fetchProduct();
  }, [params.id]);

  const validateProduct = (): { valid: boolean; errors: string[] } => {
    const errors: string[] = [];

    if (!productName.trim()) errors.push("Ürün adı gerekli");
    if (!regularPrice) errors.push("Fiyat gerekli");

    // Variable ürün validasyonu
    if (productType === "variable") {
      // Opsiyon grubu zorunlu değil - varyantlardan otomatik oluşturulur
      if (variants.length === 0) {
        errors.push("Varyasyonlu ürün için en az 1 varyant oluşturulmalı");
      }
      
      // Varyant validasyonu - SKU ve fiyat kontrolü kaldırıldı (otomatik doldurulacak)
    }

    return { valid: errors.length === 0, errors };
  };

  const handleSave = async () => {
    // Validasyon
    const validation = validateProduct();
    if (!validation.valid) {
      alert("Lütfen eksikleri tamamlayın:\n\n" + validation.errors.join("\n"));
      return;
    }

    setSaving(true);
    try {
      const price = salePrice ? parseFloat(salePrice) : parseFloat(regularPrice);
      const comparePrice = salePrice ? parseFloat(regularPrice) : null;
      
      const payload = {
        name: productName, 
        description, 
        shortDescription, 
        price, 
        comparePrice,
        saleEndDate: saleEndDate || null,
        sku, 
        stock: parseInt(stockAmount) || 0, 
        brand, 
        categoryId: selectedCategories[0] || null,
        weight: weight ? parseFloat(weight) : null,
        shippingClassId: shippingClassId || null,
        metaTitle, 
        metaDescription, 
        isActive, 
        isFeatured, 
        isNew,
        thumbnail, 
        images: productImages,
        videoUrl: productVideo || null,
          productType: productType.toUpperCase(),
        // Bağlantılı ürünler
        frequentlyBoughtTogether,
        customersAlsoViewed,
        upsellProducts,
        crossSellProducts,
        // Varyantları da gönder (görseller dahil)
        variants: productType === "variable" ? variants : [],
        // Teknik Özellik Değerleri
        productFeatureValues: technicalFeatureValues
          .filter(fv => fv.value) // Sadece değer girilmiş olanları gönder
          .map((fv, index) => ({
            featureId: fv.featureId,
            value: fv.value,
            unit: fv.unit,
            inputType: fv.inputType,
            displayOrder: index,
          })),
      };
      
      console.log('📦 Saving product with categoryId:', payload.categoryId);
      console.log('📦 Selected categories:', selectedCategories);
      
      const res = await fetch(`/api/products/${params.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      
      if (res.ok) {
        alert("Ürün başarıyla güncellendi!");
        // Sayfayı yenile
        window.location.reload();
      } else {
        const error = await res.json();
        alert("Güncelleme başarısız: " + (error.error || "Bilinmeyen hata"));
      }
    } catch (error) {
      console.error("Error saving:", error);
      alert("Bir hata oluştu!");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm("Bu ürünü silmek istediğinizden emin misiniz?")) return;
    try {
      const res = await fetch(`/api/products/${params.id}`, { method: "DELETE" });
      if (res.ok) router.push("/products");
    } catch (error) {
      console.error("Error deleting:", error);
    }
  };

  const addFeature = () => {
    if (newFeature.title && newFeature.svg) {
      if (editingFeatureId) {
        // Düzenleme modu
        setFeatures(features.map(f => 
          f.id === editingFeatureId 
            ? { ...newFeature, id: editingFeatureId } as Feature 
            : f
        ));
        setEditingFeatureId(null);
      } else {
        // Yeni ekleme modu
        setFeatures([...features, { ...newFeature, id: Date.now().toString() } as Feature]);
      }
      setNewFeature({ title: "", description: "", svg: "", color: "#5750F1" });
      setShowFeatureModal(false);
    }
  };

  const editFeature = (feature: Feature) => {
    setNewFeature({
      title: feature.title,
      description: feature.description,
      svg: feature.svg,
      color: feature.color
    });
    setEditingFeatureId(feature.id);
    setShowFeatureModal(true);
  };

  const removeFeature = (id: string) => {
    setFeatures(features.filter(f => f.id !== id));
  };

  // Görsel yükleme - file input handler
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, mode: "thumbnail" | "gallery") => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploading(true);
    try {
      const formData = new FormData();
      Array.from(files).forEach((file) => formData.append("files", file));

      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (res.ok) {
        const data = await res.json();
        const urls = data.urls || [data.url];
        
        if (mode === "thumbnail") {
          setThumbnail(urls[0]);
          if (!productImages.includes(urls[0])) {
            setProductImages([urls[0], ...productImages]);
          }
        } else {
          setProductImages([...productImages, ...urls]);
        }
      } else {
        alert("Görsel yüklenirken hata oluştu");
      }
    } catch (error) {
      console.error("Upload error:", error);
      alert("Görsel yüklenemedi");
    } finally {
      setUploading(false);
    }
  };

  // Galeriden ana görsel seç
  const selectAsThumbnail = (imageUrl: string) => {
    setThumbnail(imageUrl);
  };

  // Galeriden görsel sil
  const removeFromGallery = (imageUrl: string) => {
    setProductImages(productImages.filter(img => img !== imageUrl));
    if (thumbnail === imageUrl && productImages.length > 1) {
      setThumbnail(productImages.find(img => img !== imageUrl) || "");
    } else if (thumbnail === imageUrl) {
      setThumbnail("");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px]">
        <p className="text-gray-500 mb-4">Ürün bulunamadı</p>
        <Link href="/products" className="text-primary hover:underline">Ürünlere Dön</Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/products" className="flex items-center justify-center w-10 h-10 rounded-lg border border-stroke hover:bg-gray-100 dark:border-dark-3 dark:hover:bg-dark-2">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-dark dark:text-white">Ürün Düzenle</h1>
            <p className="text-gray-500 text-sm truncate max-w-md">{productName}</p>
          </div>
        </div>
        <div className="flex gap-3">
          <button onClick={handleDelete} className="px-4 py-2 rounded-lg border border-red-500 text-red-500 text-sm hover:bg-red-50 dark:hover:bg-red-500/10">
            Sil
          </button>
          <button onClick={handleSave} disabled={saving} className="px-5 py-2 rounded-lg bg-primary text-white text-sm hover:bg-primary/90 disabled:opacity-50">
            {saving ? "Kaydediliyor..." : "Kaydet"}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Sol Panel - Ana Form */}
        <div className="lg:col-span-2 space-y-6">
          {/* KATEGORİ - En Üstte */}
          <div className="rounded-xl border-2 border-primary/30 bg-gradient-to-r from-primary/5 to-transparent p-6 dark:border-primary/20 dark:bg-gray-dark">
            <div className="flex items-center gap-3 mb-4">
              <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-primary/10">
                <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
              </div>
              <div>
                <h3 className="font-semibold text-dark dark:text-white">Kategori Seçimi *</h3>
                <p className="text-xs text-gray-500">Ürün kategorisi, teknik özellik seçeneklerini belirler</p>
              </div>
            </div>
            <select
              value={selectedCategories[0] || ""}
              onChange={async (e) => {
                const newCategoryId = e.target.value;
                
                // Eğer mevcut teknik özellikler varsa, uyumsuz olanları kontrol et
                if (newCategoryId && technicalFeatureValues.length > 0 && selectedCategories[0] !== newCategoryId) {
                  try {
                    const res = await fetch(`/api/admin/categories/${newCategoryId}/features`);
                    if (res.ok) {
                      const data = await res.json();
                      const newFeatureIds = (data.features || []).map((f: any) => f.id);
                      const incompatibleFeatures = technicalFeatureValues.filter(
                        v => !newFeatureIds.includes(v.featureId)
                      );
                      
                      if (incompatibleFeatures.length > 0) {
                        const featureNames = incompatibleFeatures.map(f => f.featureName).join(', ');
                        const confirmed = confirm(
                          `⚠️ Kategori Değişikliği Uyarısı\n\n` +
                          `Bu kategoride şu ${incompatibleFeatures.length} özellik mevcut değil ve kaldırılacak:\n\n` +
                          `• ${featureNames}\n\n` +
                          `Devam etmek istiyor musunuz?`
                        );
                        
                        if (!confirmed) {
                          // Seçimi geri al
                          e.target.value = selectedCategories[0] || "";
                          return;
                        }
                      }
                    }
                  } catch (error) {
                    console.error("Error checking category features:", error);
                  }
                }
                
                if (newCategoryId) {
                  setSelectedCategories([newCategoryId]);
                  // Kategori adını da güncelle
                  const selectedCat = categories.find(c => c.id === newCategoryId);
                  setCategoryName(selectedCat?.name || "");
                } else {
                  setSelectedCategories([]);
                  setCategoryName("");
                }
              }}
              className="w-full rounded-lg border border-stroke bg-white px-4 py-3 text-sm font-medium dark:border-dark-3 dark:bg-dark-2 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
            >
              <option value="">Kategori Seçin...</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
            {selectedCategories[0] && (
              <p className="mt-2 text-xs text-green-600 dark:text-green-400 flex items-center gap-1">
                <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                Seçili: {categoryName}
              </p>
            )}
            {!selectedCategories[0] && (
              <p className="mt-2 text-xs text-amber-600 dark:text-amber-400 flex items-center gap-1">
                <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                Teknik özellik eklemek için önce kategori seçin
              </p>
            )}
          </div>

          {/* Ürün Adı */}
          <div className="rounded-xl border border-stroke bg-white p-6 dark:border-dark-3 dark:bg-gray-dark">
            <label className="mb-2 block text-sm font-medium">Ürün Adı *</label>
            <input
              type="text"
              value={productName}
              onChange={(e) => setProductName(e.target.value)}
              placeholder="Ürün adını girin..."
              className="w-full rounded-lg border border-stroke bg-transparent px-4 py-3 text-lg font-medium dark:border-dark-3 focus:border-primary focus:outline-none"
            />
          </div>

          {/* Tabs */}
          <div className="rounded-xl border border-stroke bg-white dark:border-dark-3 dark:bg-gray-dark overflow-hidden">
            <div className="flex overflow-x-auto border-b border-stroke dark:border-dark-3">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-5 py-3 text-sm font-medium whitespace-nowrap border-b-2 transition-colors ${
                    activeTab === tab.id
                      ? "border-primary text-primary bg-primary/5"
                      : "border-transparent text-gray-500 hover:text-dark dark:hover:text-white"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            <div className="p-6">
              {/* General Tab */}
              {activeTab === "general" && (
                <div className="space-y-6">
                  {/* Açıklama - Rich Text Editor */}
                  <div>
                    <label className="mb-2 block text-sm font-medium">Ürün Açıklaması</label>
                    <RichTextEditor
                      value={description}
                      onChange={setDescription}
                      placeholder="Ürün hakkında detaylı bilgi yazın..."
                      minHeight="350px"
                    />
                  </div>

                  {/* Kısa Açıklama */}
                  <div>
                    <label className="mb-2 block text-sm font-medium">Kısa Açıklama</label>
                    <textarea
                      rows={3}
                      value={shortDescription}
                      onChange={(e) => setShortDescription(e.target.value)}
                      placeholder="Ürün listesinde görünecek kısa açıklama..."
                      className="w-full rounded-lg border border-stroke bg-transparent px-4 py-3 dark:border-dark-3 focus:border-primary focus:outline-none"
                    />
                  </div>

                  {/* Ürün Tipi */}
                  <div>
                    <label className="mb-2 block text-sm font-medium">Ürün Tipi</label>
                    <select 
                      value={productType} 
                      onChange={(e) => {
                        const newType = e.target.value;
                        
                        // Variable'dan başka tipe geçerken uyarı
                        if (productType === "variable" && newType !== "variable" && variants.length > 0) {
                          if (confirm(`${variants.length} varyant silinecek. Devam etmek istiyor musunuz?`)) {
                            setProductType(newType);
                            setVariants([]);
                            setOptionGroups([]);
                          }
                        } else {
                          setProductType(newType);
                        }
                      }} 
                      className="w-full rounded-lg border border-stroke bg-transparent px-4 py-3 dark:border-dark-3"
                    >
                      <option value="simple">Basit Ürün</option>
                      <option value="variable">Varyasyonlu Ürün</option>
                      <option value="grouped">Gruplu Ürün</option>
                      <option value="external">Harici/Affiliate Ürün</option>
                    </select>
                  </div>
                </div>
              )}

              {/* Pricing Tab */}
              {activeTab === "pricing" && (
                <div className="space-y-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="mb-2 block text-sm font-medium">Normal Fiyat (₺) *</label>
                      <input
                        type="number"
                        value={regularPrice}
                        onChange={(e) => setRegularPrice(e.target.value)}
                        placeholder="0.00"
                        className="w-full rounded-lg border border-stroke bg-transparent px-4 py-3 dark:border-dark-3 focus:border-primary focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="mb-2 block text-sm font-medium">İndirimli Fiyat (₺)</label>
                      <input
                        type="number"
                        value={salePrice}
                        onChange={(e) => setSalePrice(e.target.value)}
                        placeholder="0.00"
                        className="w-full rounded-lg border border-stroke bg-transparent px-4 py-3 dark:border-dark-3 focus:border-primary focus:outline-none"
                      />
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <button 
                      type="button"
                      onClick={() => setShowSaleDatePicker(!showSaleDatePicker)}
                      className="text-sm text-primary hover:underline"
                    >
                      {showSaleDatePicker ? "İndirim Tarihini Gizle" : "İndirim Tarihi Planla"}
                    </button>
                    {saleEndDate && (
                      <span className="text-sm text-gray-500">
                        Bitiş: {new Date(saleEndDate).toLocaleDateString('tr-TR')}
                      </span>
                    )}
                  </div>
                  
                  {showSaleDatePicker && (
                    <div className="p-4 rounded-lg border border-stroke dark:border-dark-3 bg-gray-50 dark:bg-dark-2">
                      <label className="mb-2 block text-sm font-medium">İndirim Bitiş Tarihi</label>
                      <input
                        type="datetime-local"
                        value={saleEndDate}
                        onChange={(e) => setSaleEndDate(e.target.value)}
                        className="w-full rounded-lg border border-stroke bg-transparent px-4 py-3 dark:border-dark-3 focus:border-primary focus:outline-none"
                      />
                      <p className="mt-2 text-xs text-gray-500">İndirimli fiyat bu tarihte sona erecek</p>
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="mb-2 block text-sm font-medium">Vergi Durumu</label>
                      <select className="w-full rounded-lg border border-stroke bg-transparent px-4 py-3 dark:border-dark-3">
                        <option value="taxable">Vergiye Tabi</option>
                        <option value="shipping">Sadece Kargo</option>
                        <option value="none">Yok</option>
                      </select>
                    </div>
                    <div>
                      <label className="mb-2 block text-sm font-medium">Vergi Sınıfı</label>
                      <select className="w-full rounded-lg border border-stroke bg-transparent px-4 py-3 dark:border-dark-3">
                        <option value="standard">Standart</option>
                        <option value="reduced">İndirimli Oran</option>
                        <option value="zero">Sıfır Oran</option>
                      </select>
                    </div>
                  </div>
                </div>
              )}

              {/* Inventory Tab */}
              {activeTab === "inventory" && (
                <div className="space-y-6">
                  <div>
                    <label className="mb-2 block text-sm font-medium">SKU (Stok Kodu)</label>
                    <input
                      type="text"
                      value={sku}
                      onChange={(e) => setSku(e.target.value)}
                      placeholder="Benzersiz stok kodu..."
                      className="w-full rounded-lg border border-stroke bg-transparent px-4 py-3 dark:border-dark-3 focus:border-primary focus:outline-none"
                    />
                  </div>

                  <label className="flex items-center gap-3 cursor-pointer">
                    <input type="checkbox" className="h-5 w-5 rounded text-primary" defaultChecked />
                    <span className="text-sm font-medium">Stok Yönetimini Etkinleştir</span>
                  </label>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="mb-2 block text-sm font-medium">Stok Miktarı</label>
                      <input
                        type="number"
                        value={stockAmount}
                        onChange={(e) => setStockAmount(e.target.value)}
                        placeholder="0"
                        className="w-full rounded-lg border border-stroke bg-transparent px-4 py-3 dark:border-dark-3 focus:border-primary focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="mb-2 block text-sm font-medium">Düşük Stok Eşiği</label>
                      <input
                        type="number"
                        placeholder="5"
                        className="w-full rounded-lg border border-stroke bg-transparent px-4 py-3 dark:border-dark-3 focus:border-primary focus:outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-medium">Stok Durumu</label>
                    <select className="w-full rounded-lg border border-stroke bg-transparent px-4 py-3 dark:border-dark-3">
                      <option value="instock">Stokta</option>
                      <option value="outofstock">Stokta Yok</option>
                      <option value="onbackorder">Ön Siparişte</option>
                    </select>
                  </div>

                  <label className="flex items-center gap-3 cursor-pointer">
                    <input type="checkbox" className="h-5 w-5 rounded text-primary" />
                    <span className="text-sm font-medium">Tek başına satılır (ön sipariş/stokta yok durumunda bile)</span>
                  </label>

                  {/* Kargo Bilgileri */}
                  <div className="pt-6 mt-6 border-t border-stroke dark:border-dark-3">
                    <h3 className="text-sm font-semibold mb-4 flex items-center gap-2">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.25 18.75a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 0 1-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m3 0h1.125c.621 0 1.129-.504 1.09-1.124a17.902 17.902 0 0 0-3.213-9.193 2.056 2.056 0 0 0-1.58-.86H14.25M16.5 18.75h-2.25m0-11.177v-.958c0-.568-.422-1.048-.987-1.106a48.554 48.554 0 0 0-10.026 0 1.106 1.106 0 0 0-.987 1.106v7.635m12-6.677v6.677m0 4.5v-4.5m0 0h-12" />
                      </svg>
                      Kargo Bilgileri
                    </h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="mb-2 block text-sm font-medium">Ağırlık (kg)</label>
                        <input
                          type="number"
                          step="0.01"
                          placeholder="0.00"
                          className="w-full rounded-lg border border-stroke bg-transparent px-4 py-3 dark:border-dark-3 focus:border-primary focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="mb-2 block text-sm font-medium">Kargo Sınıfı</label>
                        <select
                          value={shippingClassId}
                          onChange={(e) => setShippingClassId(e.target.value)}
                          className="w-full rounded-lg border border-stroke bg-transparent px-4 py-3 dark:border-dark-3"
                        >
                          <option value="">Kargo sınıfı yok</option>
                          {shippingClasses.map((cls) => (
                            <option key={cls.id} value={cls.id}>
                              {cls.name} {cls.alwaysFree && "(Ücretsiz)"}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div className="mt-4">
                      <label className="mb-2 block text-sm font-medium">Boyutlar (cm)</label>
                      <div className="grid grid-cols-3 gap-4">
                        <input
                          type="number"
                          placeholder="Uzunluk"
                          className="w-full rounded-lg border border-stroke bg-transparent px-4 py-3 dark:border-dark-3 focus:border-primary focus:outline-none"
                        />
                        <input
                          type="number"
                          placeholder="Genişlik"
                          className="w-full rounded-lg border border-stroke bg-transparent px-4 py-3 dark:border-dark-3 focus:border-primary focus:outline-none"
                        />
                        <input
                          type="number"
                          placeholder="Yükseklik"
                          className="w-full rounded-lg border border-stroke bg-transparent px-4 py-3 dark:border-dark-3 focus:border-primary focus:outline-none"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Linked Products Tab - Bağlantılı Ürünler */}
              {activeTab === "linked" && (
                <div className="space-y-8">
                  {/* Birlikte Sıkça Alınan Ürünler */}
                  <div>
                    <div className="mb-4">
                      <h3 className="font-semibold text-dark dark:text-white flex items-center gap-2">
                        <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                        </svg>
                        Birlikte Sıkça Alınan Ürünler
                      </h3>
                      <p className="text-sm text-gray-500">Bu ürünle birlikte alınabilecek tamamlayıcı ürünleri seçin (Örn: Güç kaynağı + Solar Panel)</p>
                    </div>
                    
                    {/* Seçili Ürünler */}
                    <div className="flex flex-wrap gap-2 mb-3">
                      {frequentlyBoughtTogether.map((productId) => {
                        const product = allProducts.find(p => p.id === productId);
                        if (!product) return null;
                        return (
                          <span key={productId} className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-green-50 text-green-700 dark:bg-green-500/10 dark:text-green-400 text-sm">
                            {product.name}
                            <button
                              onClick={() => setFrequentlyBoughtTogether(frequentlyBoughtTogether.filter(id => id !== productId))}
                              className="hover:bg-green-100 dark:hover:bg-green-500/20 rounded p-0.5"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                              </svg>
                            </button>
                          </span>
                        );
                      })}
                    </div>

                    {/* Ürün Seçici */}
                    <div className="relative">
                      <input
                        type="text"
                        placeholder="Ürün ara ve ekle..."
                        value={linkedProductSearch}
                        onChange={(e) => setLinkedProductSearch(e.target.value)}
                        className="w-full rounded-lg border border-stroke bg-transparent px-4 py-2 pl-10 dark:border-dark-3 focus:border-primary focus:outline-none"
                      />
                      <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                      </svg>
                    </div>
                    
                    {linkedProductSearch && (
                      <div className="mt-2 rounded-lg border border-stroke dark:border-dark-3 divide-y divide-stroke dark:divide-dark-3 max-h-48 overflow-y-auto">
                        {allProducts
                          .filter(p => p.name.toLowerCase().includes(linkedProductSearch.toLowerCase()) && !frequentlyBoughtTogether.includes(p.id))
                          .map(product => (
                            <button
                              key={product.id}
                              onClick={() => {
                                setFrequentlyBoughtTogether([...frequentlyBoughtTogether, product.id]);
                                setLinkedProductSearch("");
                              }}
                              className="w-full flex items-center gap-3 p-3 hover:bg-gray-50 dark:hover:bg-dark-2 text-left"
                            >
                              <div className="w-10 h-10 rounded bg-gray-100 dark:bg-dark-3 flex items-center justify-center">
                                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                </svg>
                              </div>
                              <div className="flex-1">
                                <p className="font-medium text-dark dark:text-white text-sm">{product.name}</p>
                                <p className="text-xs text-gray-500">{product.category} - {product.price.toLocaleString('tr-TR')}₺</p>
                              </div>
                              <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                              </svg>
                            </button>
                          ))}
                      </div>
                    )}
                  </div>

                  {/* Kullanıcılar Bunlara da Baktı */}
                  <div className="border-t border-stroke dark:border-dark-3 pt-6">
                    <div className="mb-4">
                      <h3 className="font-semibold text-dark dark:text-white flex items-center gap-2">
                        <svg className="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                        Kullanıcılar Bunlara da Baktı
                      </h3>
                      <p className="text-sm text-gray-500">Bu ürünü görüntüleyen kullanıcılara önerilecek alternatif/ilgili ürünler</p>
                    </div>
                    
                    {/* Seçili Ürünler */}
                    <div className="flex flex-wrap gap-2 mb-3">
                      {customersAlsoViewed.map((productId) => {
                        const product = allProducts.find(p => p.id === productId);
                        if (!product) return null;
                        return (
                          <span key={productId} className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-blue-50 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400 text-sm">
                            {product.name}
                            <button
                              onClick={() => setCustomersAlsoViewed(customersAlsoViewed.filter(id => id !== productId))}
                              className="hover:bg-blue-100 dark:hover:bg-blue-500/20 rounded p-0.5"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                              </svg>
                            </button>
                          </span>
                        );
                      })}
                    </div>

                    <select
                      onChange={(e) => {
                        if (e.target.value && !customersAlsoViewed.includes(e.target.value)) {
                          setCustomersAlsoViewed([...customersAlsoViewed, e.target.value]);
                        }
                        e.target.value = "";
                      }}
                      className="w-full rounded-lg border border-stroke bg-transparent px-4 py-2 dark:border-dark-3"
                    >
                      <option value="">Ürün seçin...</option>
                      {allProducts.filter(p => !customersAlsoViewed.includes(p.id)).map(product => (
                        <option key={product.id} value={product.id}>{product.name} - {product.price.toLocaleString('tr-TR')}₺</option>
                      ))}
                    </select>
                  </div>

                  {/* Yukarı Satış (Upsell) */}
                  <div className="border-t border-stroke dark:border-dark-3 pt-6">
                    <div className="mb-4">
                      <h3 className="font-semibold text-dark dark:text-white flex items-center gap-2">
                        <svg className="w-5 h-5 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                        </svg>
                        Yukarı Satış (Upsell)
                      </h3>
                      <p className="text-sm text-gray-500">Daha üst segment ürünler (Örn: 3600W yerine 5000W güç kaynağı)</p>
                    </div>
                    
                    <div className="flex flex-wrap gap-2 mb-3">
                      {upsellProducts.map((productId) => {
                        const product = allProducts.find(p => p.id === productId);
                        if (!product) return null;
                        return (
                          <span key={productId} className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-purple-50 text-purple-700 dark:bg-purple-500/10 dark:text-purple-400 text-sm">
                            {product.name}
                            <button
                              onClick={() => setUpsellProducts(upsellProducts.filter(id => id !== productId))}
                              className="hover:bg-purple-100 dark:hover:bg-purple-500/20 rounded p-0.5"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                              </svg>
                            </button>
                          </span>
                        );
                      })}
                    </div>

                    <select
                      onChange={(e) => {
                        if (e.target.value && !upsellProducts.includes(e.target.value)) {
                          setUpsellProducts([...upsellProducts, e.target.value]);
                        }
                        e.target.value = "";
                      }}
                      className="w-full rounded-lg border border-stroke bg-transparent px-4 py-2 dark:border-dark-3"
                    >
                      <option value="">Ürün seçin...</option>
                      {allProducts.filter(p => !upsellProducts.includes(p.id)).map(product => (
                        <option key={product.id} value={product.id}>{product.name} - {product.price.toLocaleString('tr-TR')}₺</option>
                      ))}
                    </select>
                  </div>

                  {/* Çapraz Satış (Cross-sell) */}
                  <div className="border-t border-stroke dark:border-dark-3 pt-6">
                    <div className="mb-4">
                      <h3 className="font-semibold text-dark dark:text-white flex items-center gap-2">
                        <svg className="w-5 h-5 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                        </svg>
                        Çapraz Satış (Sepette Öner)
                      </h3>
                      <p className="text-sm text-gray-500">Sepet sayfasında önerilecek ürünler (Örn: Kablo, aksesuar)</p>
                    </div>
                    
                    <div className="flex flex-wrap gap-2 mb-3">
                      {crossSellProducts.map((productId) => {
                        const product = allProducts.find(p => p.id === productId);
                        if (!product) return null;
                        return (
                          <span key={productId} className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-orange-50 text-orange-700 dark:bg-orange-500/10 dark:text-orange-400 text-sm">
                            {product.name}
                            <button
                              onClick={() => setCrossSellProducts(crossSellProducts.filter(id => id !== productId))}
                              className="hover:bg-orange-100 dark:hover:bg-orange-500/20 rounded p-0.5"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                              </svg>
                            </button>
                          </span>
                        );
                      })}
                    </div>

                    <select
                      onChange={(e) => {
                        if (e.target.value && !crossSellProducts.includes(e.target.value)) {
                          setCrossSellProducts([...crossSellProducts, e.target.value]);
                        }
                        e.target.value = "";
                      }}
                      className="w-full rounded-lg border border-stroke bg-transparent px-4 py-2 dark:border-dark-3"
                    >
                      <option value="">Ürün seçin...</option>
                      {allProducts.filter(p => !crossSellProducts.includes(p.id)).map(product => (
                        <option key={product.id} value={product.id}>{product.name} - {product.price.toLocaleString('tr-TR')}₺</option>
                      ))}
                    </select>
                  </div>

                  {/* Önizleme */}
                  {(frequentlyBoughtTogether.length > 0 || customersAlsoViewed.length > 0) && (
                    <div className="border-t border-stroke dark:border-dark-3 pt-6">
                      <h3 className="font-semibold text-dark dark:text-white mb-4">Ürün Sayfası Önizleme</h3>
                      <div className="grid grid-cols-2 gap-4">
                        {frequentlyBoughtTogether.length > 0 && (
                          <div className="rounded-lg border border-stroke p-4 dark:border-dark-3">
                            <h4 className="text-sm font-medium mb-3 text-green-600 flex items-center gap-2">
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z" /><path d="M3 6h18" /><path d="M16 10a4 4 0 0 1-8 0" /></svg>
                              Birlikte Sıkça Alınan
                            </h4>
                            <div className="space-y-2">
                              {frequentlyBoughtTogether.slice(0, 3).map(id => {
                                const p = allProducts.find(pr => pr.id === id);
                                return p && (
                                  <div key={id} className="flex items-center gap-2 text-sm">
                                    <div className="w-8 h-8 rounded bg-gray-100 dark:bg-dark-3" />
                                    <span className="truncate">{p.name}</span>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        )}
                        {customersAlsoViewed.length > 0 && (
                          <div className="rounded-lg border border-stroke p-4 dark:border-dark-3">
                            <h4 className="text-sm font-medium mb-3 text-blue-600 flex items-center gap-1.5">
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                              </svg>
                              Bunlara da Baktılar
                            </h4>
                            <div className="space-y-2">
                              {customersAlsoViewed.slice(0, 3).map(id => {
                                const p = allProducts.find(pr => pr.id === id);
                                return p && (
                                  <div key={id} className="flex items-center gap-2 text-sm">
                                    <div className="w-8 h-8 rounded bg-gray-100 dark:bg-dark-3" />
                                    <span className="truncate">{p.name}</span>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* TEKNİK ÖZELLİKLER Tab - Kategori bazlı teknik bilgiler */}
              {activeTab === "technical" && (
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-semibold text-dark dark:text-white">Teknik Özellikler</h3>
                      <p className="text-sm text-gray-500">
                        Ürünün teknik detayları - Frontend&apos;de tablo olarak görünür
                      </p>
                    </div>
                  </div>

                  {/* Kategori seçilmemişse uyarı */}
                  {!selectedCategories[0] ? (
                    <div className="rounded-lg border-2 border-dashed border-amber-300 bg-amber-50 dark:border-amber-500/30 dark:bg-amber-500/10 p-8 text-center">
                      <svg className="w-12 h-12 mx-auto mb-3 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                      </svg>
                      <h4 className="font-semibold text-amber-800 dark:text-amber-300 mb-1">
                        Önce Kategori Seçin
                      </h4>
                      <p className="text-sm text-amber-600 dark:text-amber-400">
                        Teknik özellik eklemek için sayfanın üstünden bir kategori seçmeniz gerekiyor.
                        <br />
                        Her kategorinin kendine özgü özellik tanımları vardır.
                      </p>
                    </div>
                  ) : loadingTechFeatures ? (
                    <div className="flex items-center justify-center py-12">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                      <span className="ml-3 text-gray-500">Özellikler yükleniyor...</span>
                    </div>
                  ) : availableTechFeatures.length === 0 ? (
                    <div className="rounded-lg border border-stroke bg-gray-50 dark:border-dark-3 dark:bg-dark-2 p-8 text-center">
                      <svg className="w-12 h-12 mx-auto mb-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                      </svg>
                      <h4 className="font-semibold text-dark dark:text-white mb-1">
                        Bu Kategoride Özellik Tanımı Yok
                      </h4>
                      <p className="text-sm text-gray-500">
                        Seçilen kategori için henüz özellik tanımı yapılmamış.
                        <br />
                        Admin panelden bu kategoriye özellik tanımları ekleyebilirsiniz.
                      </p>
                    </div>
                  ) : (
                    <>
                      {/* Eklenen Özellikler Listesi */}
                      {technicalFeatureValues.length > 0 && (
                        <div className="space-y-3">
                          {technicalFeatureValues.map((techValue, index) => (
                            <div 
                              key={techValue.featureId}
                              className="flex items-center gap-3 p-4 rounded-lg border border-stroke bg-gray-50 dark:border-dark-3 dark:bg-dark-2"
                            >
                              <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-primary/10 text-primary font-semibold text-sm">
                                {index + 1}
                              </div>
                              
                              <div className="flex-1 grid grid-cols-2 gap-4">
                                {/* Özellik Adı */}
                                <div>
                                  <label className="block text-xs text-gray-500 mb-1">Özellik</label>
                                  <div className="font-medium text-dark dark:text-white flex items-center gap-2">
                                    {techValue.featureName}
                                    {techValue.unit && (
                                      <span className="text-xs text-gray-400">({techValue.unit})</span>
                                    )}
                                  </div>
                                </div>
                                
                                {/* Değer Alanı - inputType'a göre */}
                                <div>
                                  <label className="block text-xs text-gray-500 mb-1">Değer</label>
                                  {techValue.inputType === 'SELECT' ? (
                                    <select
                                      value={techValue.value}
                                      onChange={(e) => updateTechnicalFeatureValue(techValue.featureId, e.target.value)}
                                      className="w-full rounded-lg border border-stroke bg-white px-3 py-2 text-sm dark:border-dark-3 dark:bg-dark-3 focus:border-primary focus:outline-none"
                                    >
                                      <option value="">Seçiniz...</option>
                                      {techValue.presetValues.map((pv) => (
                                        <option key={pv.value} value={pv.value}>
                                          {pv.label}
                                        </option>
                                      ))}
                                    </select>
                                  ) : (
                                    <div className="flex items-center gap-2">
                                      <input
                                        type={techValue.inputType === 'NUMBER' ? 'number' : 'text'}
                                        value={techValue.value}
                                        onChange={(e) => updateTechnicalFeatureValue(techValue.featureId, e.target.value)}
                                        placeholder={techValue.inputType === 'NUMBER' ? '0' : 'Değer girin...'}
                                        className="flex-1 rounded-lg border border-stroke bg-white px-3 py-2 text-sm dark:border-dark-3 dark:bg-dark-3 focus:border-primary focus:outline-none"
                                      />
                                      {techValue.unit && (
                                        <span className="text-sm text-gray-500 whitespace-nowrap">{techValue.unit}</span>
                                      )}
                                    </div>
                                  )}
                                </div>
                              </div>
                              
                              {/* Sil Butonu */}
                              <button
                                onClick={() => removeTechnicalFeature(techValue.featureId)}
                                className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg transition-colors"
                                title="Kaldır"
                              >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                              </button>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Yeni Özellik Ekle */}
                      {unusedTechFeatures.length > 0 && (
                        <div className="border-t border-stroke dark:border-dark-3 pt-4">
                          <label className="block text-sm font-medium mb-2">Özellik Ekle</label>
                          <div className="flex items-center gap-3">
                            <select
                              onChange={(e) => {
                                if (e.target.value) {
                                  addTechnicalFeature(e.target.value);
                                  e.target.value = '';
                                }
                              }}
                              className="flex-1 rounded-lg border border-stroke bg-white px-4 py-2.5 text-sm dark:border-dark-3 dark:bg-dark-2 focus:border-primary focus:outline-none"
                            >
                              <option value="">Özellik seçin...</option>
                              {unusedTechFeatures.map((feature) => (
                                <option key={feature.id} value={feature.id}>
                                  {feature.name}
                                  {feature.unit ? ` (${feature.unit})` : ''}
                                  {feature.isRequired ? ' *' : ''}
                                </option>
                              ))}
                            </select>
                          </div>
                          <p className="text-xs text-gray-500 mt-2">
                            Bu kategoride {unusedTechFeatures.length} özellik daha eklenebilir
                          </p>
                        </div>
                      )}

                      {/* Tüm özellikler eklenmişse bilgi */}
                      {unusedTechFeatures.length === 0 && technicalFeatureValues.length > 0 && (
                        <div className="rounded-lg bg-green-50 dark:bg-green-500/10 border border-green-200 dark:border-green-500/30 p-4 text-center">
                          <svg className="w-6 h-6 mx-auto mb-2 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                          <p className="text-sm text-green-700 dark:text-green-400">
                            Bu kategorideki tüm özellikler eklendi
                          </p>
                        </div>
                      )}
                    </>
                  )}
                </div>
              )}

              {/* Features Tab - ÖNEMLİ: Ürün Özellikleri */}
              {activeTab === "features" && (
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-semibold text-dark dark:text-white">Ürün Özellikleri (Features)</h3>
                      <p className="text-sm text-gray-500">Ürün sayfasında gösterilecek özellikler</p>
                    </div>
                    <button
                      onClick={() => {
                        setEditingFeatureId(null);
                        setNewFeature({ title: "", description: "", svg: "", color: "#5750F1" });
                        setShowFeatureModal(true);
                      }}
                      className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm text-white hover:bg-primary/90"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                      </svg>
                      Özellik Ekle
                    </button>
                  </div>

                  {/* Features List */}
                  <div className="space-y-3">
                    {features.map((feature, index) => (
                      <div
                        key={feature.id}
                        className="flex items-center gap-4 p-4 rounded-lg border border-stroke dark:border-dark-3 bg-gray-50 dark:bg-dark-2"
                      >
                        <div className="flex items-center gap-2 text-gray-400 cursor-move">
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8h16M4 16h16" />
                          </svg>
                          <span className="text-sm font-medium">{index + 1}</span>
                        </div>
                        
                        <div
                          className="w-10 h-10 rounded-lg flex items-center justify-center"
                          style={{ backgroundColor: `${feature.color}20`, color: feature.color }}
                          dangerouslySetInnerHTML={{ __html: feature.svg.replace('currentColor', feature.color) }}
                        />
                        
                        <div className="flex-1">
                          <p className="font-medium text-dark dark:text-white">{feature.title}</p>
                          <p className="text-sm text-gray-500">{feature.description}</p>
                        </div>

                        <div className="flex items-center gap-2">
                          <button 
                            onClick={() => editFeature(feature)}
                            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-dark-3 text-gray-500"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                            </svg>
                          </button>
                          <button
                            onClick={() => removeFeature(feature.id)}
                            className="p-2 rounded-lg hover:bg-red-50 text-red-500"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>

                  {features.length === 0 && (
                    <div className="text-center py-8 text-gray-500">
                      <svg className="w-12 h-12 mx-auto mb-3 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      <p>Henüz özellik eklenmedi</p>
                    </div>
                  )}

                  {/* Hazır İkon Şablonları */}
                  <div className="border-t border-stroke dark:border-dark-3 pt-4">
                    <h4 className="text-sm font-medium mb-3">Hazır İkon Şablonları</h4>
                    <div className="flex flex-wrap gap-2">
                      {defaultFeatureIcons.map((icon) => (
                        <button
                          key={icon.name}
                          onClick={() => setNewFeature({ ...newFeature, svg: icon.svg, title: icon.name })}
                          className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-stroke hover:border-primary hover:bg-primary/5 dark:border-dark-3 transition-colors"
                        >
                          <span className="w-5 h-5 text-gray-600" dangerouslySetInnerHTML={{ __html: icon.svg }} />
                          <span className="text-sm">{icon.name}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Variations Tab */}
              {activeTab === "variations" && productType === "variable" && (
                <div className="space-y-6">
                  {/* Opsiyonlar Bölümü */}
                  <div className="rounded-lg border border-stroke dark:border-dark-3 p-6">
                    <h3 className="font-semibold text-dark dark:text-white mb-4 flex items-center gap-2">
                      <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
                      </svg>
                      Varyasyon Opsiyonları
                    </h3>
                    <p className="text-sm text-gray-500 mb-6">
                      Ürün varyasyonları için özellik grupları ekleyin (Renk, Beden, Kapasite vb.)
                    </p>
                    
                    <VariationOptions 
                      optionGroups={optionGroups}
                      onChange={setOptionGroups}
                    />
                  </div>

                  {/* Varyasyon Üretimi */}
                  {optionGroups.length > 0 && (
                    <div className="rounded-lg border border-stroke dark:border-dark-3 p-6">
                      <h3 className="font-semibold text-dark dark:text-white mb-4 flex items-center gap-2">
                        <svg className="w-5 h-5 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                        </svg>
                        Varyasyon Üretimi
                      </h3>
                      <p className="text-sm text-gray-500 mb-4">
                        Seçilen opsiyonlardan otomatik varyant kombinasyonları oluşturun
                      </p>
                      
                      <VariationGenerator
                        optionGroups={optionGroups}
                        existingVariants={variants}
                        skuPrefix={skuPrefix}
                        onGenerate={setVariants}
                      />
                    </div>
                  )}

                  {/* Varyant Tablosu */}
                  {variants.length > 0 && (
                    <div className="rounded-lg border border-stroke dark:border-dark-3 p-6">
                      <div className="flex items-center justify-between mb-4">
                        <div>
                          <h3 className="font-semibold text-dark dark:text-white flex items-center gap-2">
                            <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                            </svg>
                            Varyant Yönetimi
                          </h3>
                          <p className="text-sm text-gray-500 mt-1">
                            Oluşturulan varyantları yönetin
                          </p>
                        </div>
                        <div>
                          <label className="text-sm font-medium mr-2">SKU Prefix:</label>
                          <input
                            type="text"
                            value={skuPrefix}
                            onChange={(e) => setSkuPrefix(e.target.value)}
                            placeholder="Örn: PROD"
                            className="w-32 px-3 py-2 rounded-lg border border-stroke dark:border-dark-3 bg-transparent text-sm"
                          />
                        </div>
                      </div>
                      
                      <VariantTable
                        variants={variants}
                        selectedVariants={selectedVariants}
                        onUpdate={setVariants}
                        onSelectionChange={setSelectedVariants}
                        onImageSelect={(variantId) => {
                          setVariantImageSelect(variantId);
                          setShowMediaModal(true);
                        }}
                      />
                    </div>
                  )}
                </div>
              )}

              {/* SEO Tab */}
              {activeTab === "seo" && (
                <div className="space-y-6">
                  <div>
                    <label className="mb-2 block text-sm font-medium">SEO Başlık</label>
                    <input
                      type="text"
                      placeholder="Arama sonuçlarında görünecek başlık..."
                      className="w-full rounded-lg border border-stroke bg-transparent px-4 py-3 dark:border-dark-3 focus:border-primary focus:outline-none"
                    />
                    <p className="mt-1 text-xs text-gray-500">Önerilen: 50-60 karakter</p>
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-medium">Meta Açıklama</label>
                    <textarea
                      rows={3}
                      placeholder="Arama sonuçlarında görünecek açıklama..."
                      className="w-full rounded-lg border border-stroke bg-transparent px-4 py-3 dark:border-dark-3 focus:border-primary focus:outline-none"
                    />
                    <p className="mt-1 text-xs text-gray-500">Önerilen: 150-160 karakter</p>
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-medium">URL Slug</label>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-gray-500">fusionmarkt.com/urun/</span>
                      <input
                        type="text"
                        placeholder="urun-adi"
                        className="flex-1 rounded-lg border border-stroke bg-transparent px-4 py-3 dark:border-dark-3 focus:border-primary focus:outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-medium">Focus Anahtar Kelime</label>
                    <input
                      type="text"
                      placeholder="Ana anahtar kelime..."
                      className="w-full rounded-lg border border-stroke bg-transparent px-4 py-3 dark:border-dark-3 focus:border-primary focus:outline-none"
                    />
                  </div>

                  {/* SEO Önizleme */}
                  <div className="rounded-lg border border-stroke p-4 dark:border-dark-3 bg-gray-50 dark:bg-dark-2">
                    <p className="text-sm font-medium mb-2">Google Önizleme</p>
                    <div className="space-y-1">
                      <p className="text-[#1a0dab] text-lg hover:underline cursor-pointer">Ürün Adı - FusionMarkt</p>
                      <p className="text-[#006621] text-sm">fusionmarkt.com › urun › urun-adi</p>
                      <p className="text-sm text-gray-600">Meta açıklama buraya gelecek. Arama sonuçlarında kullanıcıların göreceği açıklama metni...</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Advanced Tab */}
              {activeTab === "advanced" && (
                <div className="space-y-6">
                  <div>
                    <label className="mb-2 block text-sm font-medium">Satın Alma Notu</label>
                    <textarea
                      rows={3}
                      placeholder="Sipariş sonrası müşteriye gönderilecek özel not..."
                      className="w-full rounded-lg border border-stroke bg-transparent px-4 py-3 dark:border-dark-3 focus:border-primary focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-medium">Menü Sırası</label>
                    <input
                      type="number"
                      placeholder="0"
                      className="w-full rounded-lg border border-stroke bg-transparent px-4 py-3 dark:border-dark-3 focus:border-primary focus:outline-none"
                    />
                  </div>

                  <label className="flex items-center gap-3 cursor-pointer">
                    <input type="checkbox" className="h-5 w-5 rounded text-primary" />
                    <span className="text-sm font-medium">Yorumları Etkinleştir</span>
                  </label>

                  {/* Custom Tabs */}
                  <div className="border-t border-stroke dark:border-dark-3 pt-4">
                    <h4 className="font-medium mb-3">Özel Sekmeler</h4>
                    <div className="space-y-4">
                      <div className="p-4 rounded-lg border border-stroke dark:border-dark-3">
                        <input
                          type="text"
                          placeholder="Sekme 1 Başlığı"
                          className="w-full rounded-lg border border-stroke bg-transparent px-4 py-2 mb-2 dark:border-dark-3"
                        />
                        <textarea
                          rows={3}
                          placeholder="Sekme 1 İçeriği"
                          className="w-full rounded-lg border border-stroke bg-transparent px-4 py-2 dark:border-dark-3"
                        />
                      </div>
                    </div>
                    <button className="mt-3 text-sm text-primary hover:underline">+ Sekme Ekle</button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Sağ Panel */}
        <div className="space-y-6">
          {/* Ürün Durumu */}
          <div className="rounded-xl border border-stroke bg-white p-5 dark:border-dark-3 dark:bg-gray-dark">
            <h3 className="mb-4 font-semibold text-dark dark:text-white">Ürün Durumu</h3>
            <div className="space-y-4">
              <label className="flex items-center gap-3 cursor-pointer">
                <input type="checkbox" checked={isActive} onChange={(e) => setIsActive(e.target.checked)} className="h-5 w-5 rounded text-primary" />
                <div>
                  <span className="text-sm font-medium text-dark dark:text-white">Aktif</span>
                  <p className="text-xs text-gray-500">Ürün mağazada görünsün</p>
                </div>
              </label>
              <label className="flex items-center gap-3 cursor-pointer">
                <input type="checkbox" checked={isFeatured} onChange={(e) => setIsFeatured(e.target.checked)} className="h-5 w-5 rounded text-primary" />
                <div>
                  <span className="text-sm font-medium text-dark dark:text-white">Öne Çıkan</span>
                  <p className="text-xs text-gray-500">Ana sayfada göster</p>
                </div>
              </label>
              <label className="flex items-center gap-3 cursor-pointer">
                <input type="checkbox" checked={isNew} onChange={(e) => setIsNew(e.target.checked)} className="h-5 w-5 rounded text-primary" />
                <div>
                  <span className="text-sm font-medium text-dark dark:text-white">Yeni Ürün</span>
                  <p className="text-xs text-gray-500">&quot;Yeni&quot; etiketi göster</p>
                </div>
              </label>
            </div>
          </div>

          {/* Ürün Görseli */}
          <div className="rounded-xl border border-stroke bg-white p-5 dark:border-dark-3 dark:bg-gray-dark">
            <h3 className="mb-4 font-semibold text-dark dark:text-white">Ana Görsel</h3>
            {thumbnail ? (
              <div className="relative">
                <div className="relative aspect-square rounded-lg overflow-hidden border-2 border-primary">
                  <Image src={thumbnail} alt={productName} fill className="object-cover" unoptimized />
                </div>
                <div className="flex gap-2 mt-3">
                  <button
                    onClick={() => {
                      setMediaSelectMode("thumbnail");
                      setShowMediaModal(true);
                    }}
                    className="flex-1 py-2 text-center text-sm text-primary border border-primary rounded-lg hover:bg-primary/5"
                  >
                    Değiştir
                  </button>
                  <button
                    onClick={() => setThumbnail("")}
                    className="px-4 py-2 text-sm text-red-500 border border-red-500 rounded-lg hover:bg-red-50"
                  >
                    Kaldır
                  </button>
                </div>
              </div>
            ) : (
              <button
                onClick={() => {
                  setMediaSelectMode("thumbnail");
                  setShowMediaModal(true);
                }}
                className="w-full border-2 border-dashed border-stroke rounded-lg p-8 text-center dark:border-dark-3 hover:border-primary transition-colors cursor-pointer"
              >
                <svg className="w-10 h-10 mx-auto mb-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <p className="text-sm text-gray-500">Medya kütüphanesinden seçin</p>
                <p className="text-xs text-gray-400 mt-1">veya yeni görsel yükleyin</p>
              </button>
            )}
          </div>

          {/* Ürün Galerisi */}
          <div className="rounded-xl border border-stroke bg-white p-5 dark:border-dark-3 dark:bg-gray-dark">
            <h3 className="mb-4 font-semibold text-dark dark:text-white">Ürün Galerisi ({productImages.length} görsel)</h3>
            <div className="grid grid-cols-3 gap-2 mb-3">
              {productImages.length > 0 ? productImages.map((img, i) => (
                <div key={i} className={`group relative aspect-square rounded-lg overflow-hidden border-2 ${img === thumbnail ? 'border-primary' : 'border-stroke dark:border-dark-3'}`}>
                  <Image src={img} alt={`${productName} - ${i + 1}`} fill className="object-cover" unoptimized />
                  {img === thumbnail && (
                    <div className="absolute top-1 left-1 px-1.5 py-0.5 bg-primary text-white text-[10px] rounded">Ana</div>
                  )}
                  {/* Hover Actions */}
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1">
                    {img !== thumbnail && (
                      <button
                        onClick={() => selectAsThumbnail(img)}
                        className="p-1.5 bg-white rounded-lg hover:bg-primary hover:text-white transition-colors"
                        title="Ana görsel yap"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                        </svg>
                      </button>
                    )}
                    <button
                      onClick={() => removeFromGallery(img)}
                      className="p-1.5 bg-white rounded-lg hover:bg-red-500 hover:text-white transition-colors"
                      title="Sil"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </div>
              )) : (
                <div className="col-span-3 text-center py-6 text-gray-400">
                  <p className="text-sm">Henüz görsel yok</p>
                </div>
              )}
            </div>
            <button
              onClick={() => {
                setMediaSelectMode("gallery");
                setShowMediaModal(true);
              }}
              className="block w-full py-2 text-center text-sm text-primary border border-primary rounded-lg hover:bg-primary/5"
            >
              + Galeri Görseli Ekle
            </button>
            <p className="text-xs text-gray-400 mt-2 text-center">Medya kütüphanesinden seçin</p>
          </div>

          {/* Ürün Videosu */}
          <div className="rounded-xl border border-stroke bg-white p-5 dark:border-dark-3 dark:bg-gray-dark">
            <h3 className="mb-4 font-semibold text-dark dark:text-white flex items-center gap-2">
              <svg className="w-5 h-5 text-cyan-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Ürün Videosu
            </h3>
            {productVideo ? (
              <div className="space-y-3">
                <div className="relative aspect-video rounded-lg overflow-hidden border-2 border-cyan-500 bg-black">
                  <video 
                    src={productVideo} 
                    className="w-full h-full object-contain"
                    controls
                    preload="metadata"
                  />
                </div>
                <div className="flex items-center gap-2 p-2 bg-cyan-50 dark:bg-cyan-500/10 rounded-lg">
                  <svg className="w-4 h-4 text-cyan-500 flex-shrink-0" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                    <path fillRule="evenodd" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" clipRule="evenodd" />
                  </svg>
                  <span className="text-xs text-cyan-700 dark:text-cyan-400 font-medium">
                    Videolu ürün - Ürün kartında video etiketi görünecek
                  </span>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      setMediaSelectMode("video");
                      setShowMediaModal(true);
                    }}
                    className="flex-1 py-2 text-center text-sm text-cyan-500 border border-cyan-500 rounded-lg hover:bg-cyan-50 dark:hover:bg-cyan-500/10"
                  >
                    Değiştir
                  </button>
                  <button
                    onClick={() => setProductVideo("")}
                    className="px-4 py-2 text-sm text-red-500 border border-red-500 rounded-lg hover:bg-red-50"
                  >
                    Kaldır
                  </button>
                </div>
              </div>
            ) : (
              <button
                onClick={() => {
                  setMediaSelectMode("video");
                  setShowMediaModal(true);
                }}
                className="w-full border-2 border-dashed border-stroke rounded-lg p-6 text-center dark:border-dark-3 hover:border-cyan-500 transition-colors cursor-pointer group"
              >
                <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-cyan-50 dark:bg-cyan-500/10 flex items-center justify-center group-hover:bg-cyan-100 dark:group-hover:bg-cyan-500/20 transition-colors">
                  <svg className="w-6 h-6 text-cyan-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <p className="text-sm text-gray-500 mb-1">Ürün Videosu Ekle</p>
                <p className="text-xs text-gray-400">Video eklendiğinde ürün kartında &quot;Video İncele&quot; etiketi görünür</p>
              </button>
            )}
          </div>

          {/* Markalar */}
          <div className="rounded-xl border border-stroke bg-white p-5 dark:border-dark-3 dark:bg-gray-dark">
            <h3 className="mb-4 font-semibold text-dark dark:text-white">Marka</h3>
            <select 
              value={brand || ""}
              onChange={(e) => setBrand(e.target.value)}
              className="w-full rounded-lg border border-stroke bg-transparent px-4 py-2 text-sm dark:border-dark-3 focus:border-primary focus:outline-none"
            >
              <option value="">Marka Seçin...</option>
              {defaultBrands.map((b) => (
                <option key={b.id} value={b.name}>{b.name}</option>
              ))}
            </select>
            <p className="mt-2 text-xs text-gray-500">
              Seçili marka: {brand || "Seçilmedi"}
            </p>
          </div>

          {/* Etiketler */}
          <div className="rounded-xl border border-stroke bg-white p-5 dark:border-dark-3 dark:bg-gray-dark">
            <h3 className="mb-4 font-semibold text-dark dark:text-white">Etiketler</h3>
            <input
              type="text"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              placeholder="Etiketleri virgülle ayırın"
              className="w-full rounded-lg border border-stroke bg-transparent px-4 py-2 text-sm dark:border-dark-3 focus:border-primary focus:outline-none"
            />
          </div>
        </div>
      </div>

      {/* Feature Modal */}
      {showFeatureModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="w-full max-w-lg rounded-xl bg-white p-6 dark:bg-gray-dark">
            <h3 className="text-lg font-semibold text-dark dark:text-white mb-4">
              {editingFeatureId ? "Özelliği Düzenle" : "Yeni Özellik Ekle"}
            </h3>
            
            <div className="space-y-4">
              <div>
                <label className="mb-2 block text-sm font-medium">Başlık *</label>
                <input
                  type="text"
                  value={newFeature.title || ""}
                  onChange={(e) => setNewFeature({ ...newFeature, title: e.target.value })}
                  placeholder="Örn: 2 Yıl Garanti"
                  className="w-full rounded-lg border border-stroke bg-transparent px-4 py-2 dark:border-dark-3"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium">Açıklama</label>
                <input
                  type="text"
                  value={newFeature.description || ""}
                  onChange={(e) => setNewFeature({ ...newFeature, description: e.target.value })}
                  placeholder="Örn: Tüm ürünlerimiz 2 yıl garantilidir"
                  className="w-full rounded-lg border border-stroke bg-transparent px-4 py-2 dark:border-dark-3"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium">SVG İkon *</label>
                <textarea
                  value={newFeature.svg || ""}
                  onChange={(e) => setNewFeature({ ...newFeature, svg: e.target.value })}
                  placeholder='<svg xmlns="http://www.w3.org/2000/svg"...'
                  rows={4}
                  className="w-full rounded-lg border border-stroke bg-transparent px-4 py-2 font-mono text-xs dark:border-dark-3"
                />
                <p className="mt-1 text-xs text-gray-500">Heroicons, Lucide veya başka bir SVG kütüphanesinden kopyalayın</p>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium">Renk</label>
                <div className="flex items-center gap-3">
                  <input
                    type="color"
                    value={newFeature.color || "#5750F1"}
                    onChange={(e) => setNewFeature({ ...newFeature, color: e.target.value })}
                    className="h-10 w-20 rounded cursor-pointer"
                  />
                  <input
                    type="text"
                    value={newFeature.color || "#5750F1"}
                    onChange={(e) => setNewFeature({ ...newFeature, color: e.target.value })}
                    className="flex-1 rounded-lg border border-stroke bg-transparent px-4 py-2 dark:border-dark-3"
                  />
                </div>
              </div>

              {/* Preview */}
              {newFeature.svg && (
                <div className="border-t border-stroke dark:border-dark-3 pt-4">
                  <p className="text-sm font-medium mb-2">Önizleme</p>
                  <div className="flex items-center gap-3 p-3 rounded-lg bg-gray-50 dark:bg-dark-2">
                    <div
                      className="w-10 h-10 rounded-lg flex items-center justify-center"
                      style={{ backgroundColor: `${newFeature.color}20` }}
                      dangerouslySetInnerHTML={{ __html: newFeature.svg?.replace('currentColor', newFeature.color || '#5750F1') || '' }}
                    />
                    <div>
                      <p className="font-medium text-dark dark:text-white">{newFeature.title || "Başlık"}</p>
                      <p className="text-sm text-gray-500">{newFeature.description || "Açıklama"}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => {
                  setShowFeatureModal(false);
                  setEditingFeatureId(null);
                  setNewFeature({ title: "", description: "", svg: "", color: "#5750F1" });
                }}
                className="px-4 py-2 rounded-lg border border-stroke text-sm hover:bg-gray-50 dark:border-dark-3"
              >
                İptal
              </button>
              <button
                onClick={addFeature}
                disabled={!newFeature.title || !newFeature.svg}
                className="px-4 py-2 rounded-lg bg-primary text-white text-sm hover:bg-primary/90 disabled:opacity-50"
              >
                {editingFeatureId ? "Kaydet" : "Ekle"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Media Library Modal */}
      <MediaLibrary
        isOpen={showMediaModal}
        onClose={() => {
          setShowMediaModal(false);
          setVariantImageSelect(null);
        }}
        usage="PRODUCT"
        multiple={mediaSelectMode === "gallery" && !variantImageSelect}
        selectedUrls={
          variantImageSelect 
            ? [variants.find(v => v.id === variantImageSelect)?.image || ""].filter(Boolean)
            : mediaSelectMode === "thumbnail" 
              ? (thumbnail ? [thumbnail] : []) 
              : mediaSelectMode === "video"
                ? (productVideo ? [productVideo] : [])
                : productImages
        }
        onSelect={(urls) => {
          const urlArray = Array.isArray(urls) ? urls : [urls];
          
          // Varyant görseli seçimi
          if (variantImageSelect) {
            if (urlArray.length > 0) {
              const selectedUrl = typeof urlArray[0] === 'string' ? urlArray[0] : urlArray[0]?.url || '';
              const updatedVariants = variants.map(v => 
                v.id === variantImageSelect ? { ...v, image: selectedUrl } : v
              );
              setVariants(updatedVariants);
            }
            setVariantImageSelect(null);
            setShowMediaModal(false);
            return;
          }
          
          // Video seçimi
          if (mediaSelectMode === "video") {
            if (urlArray.length > 0) {
              const selectedUrl = typeof urlArray[0] === 'string' ? urlArray[0] : urlArray[0]?.url || '';
              setProductVideo(selectedUrl);
            }
            setShowMediaModal(false);
            return;
          }
          
          // Normal ürün görseli seçimi
          if (mediaSelectMode === "thumbnail") {
            if (urlArray.length > 0) {
              const selectedUrl = typeof urlArray[0] === 'string' ? urlArray[0] : urlArray[0]?.url || '';
              setThumbnail(selectedUrl);
              if (selectedUrl && !productImages.includes(selectedUrl)) {
                setProductImages([selectedUrl, ...productImages]);
              }
            }
          } else {
            const newImages = urlArray
              .map((item: any) => typeof item === 'string' ? item : item?.url || '')
              .filter((url: string) => url && !productImages.includes(url));
            setProductImages([...productImages, ...newImages]);
          }
        }}
      />
    </div>
  );
}
