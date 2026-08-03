/**
 * Hesabım — navigasyon kayıt defteri
 *
 * Sidebar, mobil hub listesi, kabuğun bastığı h1 ve mobil geri okunun hedefi
 * TAMAMEN buradan üretilir. Yeni bir hesap route'u eklenirken buraya kayıt
 * eklenmezse başlık boş kalır ve geri oku bozulur (plan 01 §8/8).
 */

import {
  LayoutDashboard,
  Package,
  Star,
  TicketPercent,
  Settings,
  User,
  Lock,
  Bell,
  MapPin,
  Heart,
  Repeat2,
  Headphones,
  type LucideIcon,
} from "lucide-react";

export type AccountGroupId = "main" | "userInfo" | "lists" | "support";

export interface AccountRoute {
  /** Kanonik URL. Dinamik segment ":param" ile yazılır. */
  href: string;
  /** Sidebar / mobil menüde görünen etiket */
  label: string;
  /** Kabuğun bastığı h1 metni */
  title: string;
  /** Dinamik route'larda h1'i parametreden üretmek için */
  titleFn?: (params: Record<string, string>) => string;
  icon: LucideIcon;
  group: AccountGroupId;
  /** Mobil geri okunun hedefi. Verilmezse "/hesabim". */
  parent?: string;
  /** Sidebar/mobil menüde listelenmesin (ör. detay sayfaları) */
  hiddenInNav?: boolean;
  /** Sağda renkli nokta (LİSTELERİM grubu deseni) */
  dotColor?: string;
  /** Hesap dışına çıkan bağlantı (Müşteri Hizmetleri) */
  external?: boolean;
}

export interface AccountNavGroup {
  id: AccountGroupId;
  /** Grup başlığı (örn. "LİSTELERİM"). null → başlıksız düz grup */
  heading: string | null;
  /** true → açılır grup (Kullanıcı bilgilerim deseni) */
  collapsible: boolean;
  /** Açılır grubun tetikleyici etiketi ve ikonu */
  toggleLabel?: string;
  toggleIcon?: LucideIcon;
  items: AccountRoute[];
}

const dashboard: AccountRoute = {
  href: "/hesabim",
  label: "Hesabım",
  title: "Hesabım",
  icon: LayoutDashboard,
  group: "main",
};

const orders: AccountRoute = {
  href: "/hesabim/siparisler",
  label: "Siparişlerim",
  title: "Siparişlerim",
  icon: Package,
  group: "main",
};

const orderDetail: AccountRoute = {
  href: "/hesabim/siparisler/:orderNumber",
  label: "Sipariş Detayı",
  title: "Sipariş Detayı",
  titleFn: () => "Sipariş Detayı",
  icon: Package,
  group: "main",
  parent: "/hesabim/siparisler",
  hiddenInNav: true,
};

const reviews: AccountRoute = {
  href: "/hesabim/degerlendirmelerim",
  label: "Değerlendirmelerim",
  title: "Değerlendirmelerim",
  icon: Star,
  group: "main",
};

const reviewsPending: AccountRoute = {
  href: "/hesabim/degerlendirmelerim/bekleyenler",
  label: "Değerlendirme Bekleyenler",
  title: "Değerlendirme Bekleyenler",
  icon: Star,
  group: "main",
  parent: "/hesabim/degerlendirmelerim",
  hiddenInNav: true,
};

const coupons: AccountRoute = {
  href: "/hesabim/kuponlar",
  label: "Kuponlarım",
  title: "Kuponlarım",
  icon: TicketPercent,
  group: "main",
};

const profile: AccountRoute = {
  href: "/hesabim/bilgilerim",
  label: "Üyelik bilgilerim",
  title: "Üyelik Bilgilerim",
  icon: User,
  group: "userInfo",
};

const password: AccountRoute = {
  href: "/hesabim/sifre-degisikligi",
  label: "Şifre değişikliği",
  title: "Şifre Değişikliği",
  icon: Lock,
  group: "userInfo",
};

const communication: AccountRoute = {
  href: "/hesabim/iletisim-tercihlerim",
  label: "İletişim tercihlerim",
  title: "İletişim Tercihlerim",
  icon: Bell,
  group: "userInfo",
};

const addresses: AccountRoute = {
  href: "/hesabim/adresler",
  label: "Adreslerim",
  title: "Adreslerim",
  icon: MapPin,
  group: "userInfo",
};

const favorites: AccountRoute = {
  href: "/hesabim/favorilerim",
  label: "Beğendiklerim",
  title: "Beğendiklerim",
  icon: Heart,
  group: "lists",
  // Header'daki favori rengiyle aynı ton (Header.tsx:281 bg-pink-500).
  dotColor: "var(--color-pink-500, #ec4899)",
};

const reorder: AccountRoute = {
  href: "/hesabim/tekrar-al",
  label: "Tekrar Al",
  title: "Tekrar Al",
  icon: Repeat2,
  group: "lists",
};

const support: AccountRoute = {
  href: "/iletisim",
  label: "Müşteri Hizmetleri",
  title: "Müşteri Hizmetleri",
  icon: Headphones,
  group: "support",
  external: true,
};

/**
 * Menüde LİSTELENEN gruplar.
 *
 * Bir madde ancak SAYFASI AÇILDIKTAN SONRA buraya giriyor (plan 01 §9/16):
 * menüye önce eklenirse sidebar 404'e link verir, "Yakında" ekranı ise açıkça
 * reddedilmiş bir çözüm.
 *
 * Menüdeki tüm maddelerin artık sayfası ve veri ucu var.
 */
export const ACCOUNT_NAV: AccountNavGroup[] = [
  {
    id: "main",
    heading: null,
    collapsible: false,
    items: [dashboard, orders, reviews, coupons],
  },
  {
    id: "userInfo",
    heading: null,
    collapsible: true,
    toggleLabel: "Kullanıcı bilgilerim",
    toggleIcon: Settings,
    items: [profile, password, communication, addresses],
  },
  {
    id: "lists",
    heading: "LİSTELERİM",
    collapsible: false,
    items: [favorites, reorder],
  },
  {
    id: "support",
    heading: null,
    collapsible: false,
    items: [support],
  },
];

/** Nav'da görünmeyenler dahil TÜM route'lar (matchAccountRoute buradan arar). */
export const ACCOUNT_ROUTES: AccountRoute[] = [
  dashboard,
  orders,
  orderDetail,
  reviews,
  reviewsPending,
  coupons,
  profile,
  password,
  communication,
  addresses,
  favorites,
  reorder,
];
