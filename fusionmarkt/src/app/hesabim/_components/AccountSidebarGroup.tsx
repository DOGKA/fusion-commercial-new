"use client";

import { useId } from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import type { AccountNavGroup } from "../_lib/account-nav";
import { isAccountRouteActive } from "../_lib/account-nav.helpers";

interface AccountSidebarGroupProps {
  group: AccountNavGroup;
  pathname: string;
}

function GroupLink({
  href,
  label,
  Icon,
  active,
  dotColor,
  external,
}: {
  href: string;
  label: string;
  Icon: AccountNavGroup["items"][number]["icon"];
  active: boolean;
  dotColor?: string;
  external?: boolean;
}) {
  return (
    <Link
      href={href}
      aria-current={active ? "page" : undefined}
      className={cn(
        "account-sidebar-link",
        active && "account-sidebar-link--active"
      )}
      {...(external ? { prefetch: false } : {})}
    >
      {/* Rengi bağlantının kendisinden alır: aktif dalda `.account-sidebar-link
          --active` zaten ton token'ına çözülüyor, sabit emerald light temada
          eşiğin altında kalıyordu. */}
      <Icon
        size={20}
        aria-hidden="true"
        className={active ? undefined : "text-foreground-muted"}
      />
      {/* flex-1 YOK: nokta ve chevron `margin-left:auto` ile sağa yaslanıyor,
          büyüyen bir etiket o boşluğu yer. min-w-0 kırpmayı serbest bırakır. */}
      <span className="min-w-0 truncate">{label}</span>
      {dotColor && (
        <span
          aria-hidden="true"
          className="account-sidebar-dot"
          style={{ background: dotColor }}
        />
      )}
    </Link>
  );
}

export default function AccountSidebarGroup({
  group,
  pathname,
}: AccountSidebarGroupProps) {
  const headingId = useId();

  if (!group.collapsible) {
    return (
      <div>
        {group.heading && (
          <h2 className="account-sidebar-heading" id={headingId}>
            {group.heading}
          </h2>
        )}
        <ul role="list" aria-labelledby={group.heading ? headingId : undefined}>
          {group.items.map((item) => (
            <li key={item.href}>
              <GroupLink
                href={item.href}
                label={item.label}
                Icon={item.icon}
                active={isAccountRouteActive(item.href, pathname)}
                dotColor={item.dotColor}
                external={item.external}
              />
            </li>
          ))}
        </ul>
      </div>
    );
  }

  const ToggleIcon = group.toggleIcon;

  return (
    <div>
      <div
        id={headingId}
        className="account-sidebar-group__toggle"
      >
        {ToggleIcon && (
          <ToggleIcon
            size={20}
            aria-hidden="true"
            className="text-foreground-muted"
          />
        )}
        <span className="min-w-0 truncate">{group.toggleLabel}</span>
      </div>

      <ul
        role="list"
        aria-labelledby={headingId}
        className="account-sidebar-group__panel"
      >
        {group.items.map((item) => (
          <li key={item.href}>
            <GroupLink
              href={item.href}
              label={item.label}
              Icon={item.icon}
              active={isAccountRouteActive(item.href, pathname)}
              dotColor={item.dotColor}
            />
          </li>
        ))}
      </ul>
    </div>
  );
}
