"use client";

import AccountTabBar, { type AccountTabBarItem } from "./AccountTabBar";

export type AccountTabItem = AccountTabBarItem;

interface AccountTabsProps {
  items: AccountTabItem[];
  /** Erişilebilirlik etiketi, örn. "Değerlendirme sekmeleri" */
  ariaLabel: string;
}

/**
 * URL sekmeleri için ince sarmalayıcı. Görünüm ve davranış `AccountTabBar`'da;
 * bu dosya yalnızca mevcut çağrı yerlerinin (ReviewsHub) import'unu koruyor.
 */
export default function AccountTabs({ items, ariaLabel }: AccountTabsProps) {
  return <AccountTabBar items={items} ariaLabel={ariaLabel} />;
}
