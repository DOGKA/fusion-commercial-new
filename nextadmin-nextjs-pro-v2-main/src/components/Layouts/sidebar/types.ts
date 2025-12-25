import { ComponentType } from "react";

export interface NavSubItem {
  title: string;
  url: string;
  isPro?: boolean;
}

export interface NavItem {
  title: string;
  url?: string;
  icon: ComponentType<{ className?: string }>;
  items: NavSubItem[];
  isPro?: boolean;
  badge?: number | string;
}

export interface NavGroup {
  label: string;
  items: NavItem[];
}
