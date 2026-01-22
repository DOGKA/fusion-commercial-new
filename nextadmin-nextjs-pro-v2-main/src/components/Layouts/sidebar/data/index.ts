import type { NavGroup } from "../types";
import * as Icons from "../icons";

export const NAV_DATA: NavGroup[] = [
  {
    label: "E-TİCARET",
    items: [
      {
        title: "Genel Bakış",
        url: "/",
        icon: Icons.HomeIcon,
        items: [],
      },
      {
        title: "Analiz",
        url: "/analytics",
        icon: Icons.PieChart,
        items: [],
      },
      {
        title: "SEO",
        url: "/seo",
        icon: Icons.Search,
        items: [],
      },
      {
        title: "Ürünler",
        icon: Icons.FourSquare,
        items: [
          { title: "Tüm Ürünler", url: "/products" },
          { title: "Yeni Ürün Ekle", url: "/products/new" },
          { title: "Paket Ürünler", url: "/bundles" },
          { title: "Yeni Paket Oluştur", url: "/bundles/new" },
          { title: "Kategoriler", url: "/categories" },
          { title: "Markalar", url: "/brands" },
          { title: "Özellikler", url: "/attributes" },
          { title: "Filtreler", url: "/filters" },
          { title: "Rozetler", url: "/badges" },
        ],
      },
      {
        title: "Siparişler",
        icon: Icons.Alphabet,
        items: [
          { title: "Tüm Siparişler", url: "/orders" },
          { title: "İptal Talepleri", url: "/cancellation-requests" },
          { title: "İade Talepleri", url: "/return-requests" },
        ],
      },
      {
        title: "Müşteriler",
        url: "/customers",
        icon: Icons.User,
        items: [],
      },
      {
        title: "Üyeler",
        url: "/users",
        icon: Icons.Shield,
        items: [],
      },
      {
        title: "Kuponlar",
        icon: Icons.Printer,
        items: [
          { title: "Tüm Kuponlar", url: "/coupons" },
          { title: "Yeni Kupon", url: "/coupons/new" },
        ],
      },
      {
        title: "Yorumlar",
        url: "/reviews",
        icon: Icons.Star,
        items: [],
      },
    ],
  },
  {
    label: "PAZARLAMA",
    items: [
      {
        title: "Terk Edilmiş Sepetler",
        url: "/marketing/abandoned-carts",
        icon: Icons.Basket,
        items: [],
      },
      {
        title: "Sepet Analizleri",
        url: "/marketing/cart-analytics",
        icon: Icons.PieChart,
        items: [],
      },
      {
        title: "Yorum Hatırlatıcı",
        url: "/marketing/review-reminder",
        icon: Icons.Star,
        items: [],
      },
      {
        title: "Mail Takip",
        url: "/mail-track",
        icon: Icons.Envelope,
        items: [],
      },
    ],
  },
  {
    label: "İÇERİK",
    items: [
      {
        title: "Blog",
        icon: Icons.Blog,
        items: [
          { title: "Tüm Bloglar", url: "/blogs" },
          { title: "Yeni Blog", url: "/blogs/new" },
        ],
      },
      {
        title: "Bannerlar",
        icon: Icons.FourSquare,
        items: [
          { title: "Tüm Bannerlar", url: "/banners" },
          { title: "Banner Grid", url: "/banners/new" },
        ],
      },
      {
        title: "Sliderlar",
        icon: Icons.Images,
        items: [
          { title: "Tüm Sliderlar", url: "/sliders" },
          { title: "Yeni Slider", url: "/sliders/new" },
        ],
      },
      {
        title: "Medya",
        url: "/media",
        icon: Icons.Images,
        items: [],
      },
      {
        title: "İletişim Formları",
        url: "/contact",
        icon: Icons.Envelope,
        items: [],
      },
      {
        title: "S.S.S",
        url: "/faq",
        icon: Icons.Info,
        items: [],
      },
      {
        title: "Yasal Sayfalar",
        url: "/legal",
        icon: Icons.Shield,
        items: [],
      },
    ],
  },
  {
    label: "AYARLAR",
    items: [
      {
        title: "Genel Ayarlar",
        url: "/settings",
        icon: Icons.Settings,
        items: [],
      },
      {
        title: "Çerez Ayarları",
        url: "/cookies",
        icon: Icons.Shield,
        items: [],
      },
    ],
  },
];
