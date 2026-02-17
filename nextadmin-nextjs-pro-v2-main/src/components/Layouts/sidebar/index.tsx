import { ArrowLeftIcon } from "@/components/Inbox/icons";
import { Logo } from "@/components/logo";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState, useCallback, useRef } from "react";
import { NAV_DATA } from "./data";
import { ChevronUp } from "./icons";
import { MenuItem } from "./menu-item";
import { useSidebarContext } from "./sidebar-context";

// Badge counts interface
interface BadgeCounts {
  orders: number;
  cancellations: number;
  returns: number;
  contacts: number;
  serviceForms: number;
}

// Map URL paths to badge count keys
const BADGE_URL_MAP: Record<string, keyof BadgeCounts> = {
  "/orders": "orders",
  "/cancellation-requests": "cancellations",
  "/return-requests": "returns",
  "/contact": "contacts",
  "/service-forms": "serviceForms",
};

export function Sidebar() {
  const pathname = usePathname();
  const { setIsOpen, isOpen, isMobile, toggleSidebar } = useSidebarContext();
  const [expandedItems, setExpandedItems] = useState<string[]>([]);
  const [badgeCounts, setBadgeCounts] = useState<BadgeCounts>({
    orders: 0,
    cancellations: 0,
    returns: 0,
    contacts: 0,
    serviceForms: 0,
  });
  const fetchTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Fetch badge counts
  const fetchBadgeCounts = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/notifications/counts");
      if (res.ok) {
        const data = await res.json();
        setBadgeCounts({
          orders: data.orders || 0,
          cancellations: data.cancellations || 0,
          returns: data.returns || 0,
          contacts: data.contacts || 0,
          serviceForms: data.serviceForms || 0,
        });
      }
    } catch (error) {
      // Silently fail - badges will show 0
    }
  }, []);

  // Fetch badge counts on mount and every 30 seconds
  useEffect(() => {
    fetchBadgeCounts();
    
    const intervalId = setInterval(fetchBadgeCounts, 30000);
    
    return () => {
      clearInterval(intervalId);
      if (fetchTimeoutRef.current) {
        clearTimeout(fetchTimeoutRef.current);
      }
    };
  }, [fetchBadgeCounts]);

  // Get badge count for a URL
  const getBadgeCount = (url: string): number => {
    const key = BADGE_URL_MAP[url];
    return key ? badgeCounts[key] : 0;
  };

  // Get total badge count for parent item with sub-items
  const getParentBadgeCount = (subItems: { url: string }[]): number => {
    return subItems.reduce((total, subItem) => total + getBadgeCount(subItem.url), 0);
  };

  const toggleExpanded = useCallback((title: string) => {
    setExpandedItems((prev) => (prev.includes(title) ? [] : [title]));
  }, []);

  useEffect(() => {
    // Keep collapsible open, when it's subpage is active
    NAV_DATA.some((section) => {
      return section.items.some((item) => {
        return item.items.some((subItem) => {
          if (subItem.url === pathname) {
            // Functional update to check current state
            setExpandedItems((prev) => {
              if (!prev.includes(item.title)) {
                return [item.title];
              }
              return prev;
            });
            return true;
          }
        });
      });
    });
  }, [pathname]);

  return (
    <>
      {/* Mobile Overlay */}
      {isMobile && isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 transition-opacity duration-300"
          onClick={() => setIsOpen(false)}
          aria-hidden="true"
        />
      )}

      <aside
        className={cn(
          "max-w-[290px] overflow-hidden border-r border-gray-200 bg-white transition-[width] duration-200 ease-linear dark:border-gray-800 dark:bg-gray-dark",
          isMobile ? "fixed bottom-0 top-0 z-50" : "sticky top-0 h-screen",
          isOpen ? "w-full" : "w-0",
        )}
        aria-label="Main navigation"
        aria-hidden={!isOpen}
        inert={!isOpen}
      >
        <div className="flex h-full flex-col py-10 pl-[25px] pr-[7px]">
          <div className="relative pr-4.5">
            <Link
              href={"/"}
              onClick={() => isMobile && toggleSidebar()}
              className="px-0 py-2.5 min-[850px]:py-0"
            >
              <Logo />
            </Link>

            {isMobile && (
              <button
                onClick={toggleSidebar}
                className="absolute left-3/4 right-4.5 top-1/2 -translate-y-1/2 text-right"
              >
                <span className="sr-only">Close Menu</span>

                <ArrowLeftIcon className="ml-auto size-7" />
              </button>
            )}
          </div>

          {/* Navigation */}
          <div className="custom-scrollbar mt-6 flex-1 overflow-y-auto pr-3 min-[850px]:mt-10">
            {NAV_DATA.map((section) => (
              <div key={section.label} className="mb-6">
                <h2 className="mb-5 text-sm font-medium text-dark-4 dark:text-dark-6">
                  {section.label}
                </h2>

                <nav role="navigation" aria-label={section.label}>
                  <ul className="space-y-2">
                    {section.items.map((item) => (
                      <li key={item.title}>
                        {item.items.length ? (
                          (() => {
                            const parentBadge = getParentBadgeCount(item.items);
                            return (
                              <div>
                                <MenuItem
                                  isActive={item.items.some(
                                    ({ url }) => url === pathname,
                                  )}
                                  onClick={() => toggleExpanded(item.title)}
                                >
                                  <item.icon
                                    className="size-6 shrink-0"
                                    aria-hidden="true"
                                  />

                                  <span>{item.title}</span>

                                  {parentBadge > 0 && !expandedItems.includes(item.title) && (
                                    <div className="ml-auto flex size-[18px] items-center justify-center rounded-full bg-red-500 text-[10px] font-medium text-white">
                                      {parentBadge > 99 ? "99+" : parentBadge}
                                    </div>
                                  )}

                                  <ChevronUp
                                    className={cn(
                                      parentBadge > 0 && !expandedItems.includes(item.title) ? "ml-2" : "ml-auto",
                                      "rotate-180 transition-transform duration-200",
                                      expandedItems.includes(item.title) &&
                                        "rotate-0",
                                    )}
                                    aria-hidden="true"
                                  />
                                </MenuItem>

                            {expandedItems.includes(item.title) && (
                              <ul
                                className="ml-9 mr-0 space-y-1.5 pb-[15px] pr-0 pt-2"
                                role="menu"
                              >
                                {item.items.map((subItem) => {
                                  const subItemBadge = getBadgeCount(subItem.url);
                                  return (
                                    <li key={subItem.title} role="none">
                                      <MenuItem
                                        as="link"
                                        href={subItem.url}
                                        isActive={pathname === subItem.url}
                                        isPro={
                                          "isPro" in subItem && subItem.isPro
                                        }
                                      >
                                        <span>{subItem.title}</span>
                                        {subItemBadge > 0 && (
                                          <div className="ml-auto flex size-[18px] items-center justify-center rounded-full bg-red-500 text-[10px] font-medium text-white">
                                            {subItemBadge > 99 ? "99+" : subItemBadge}
                                          </div>
                                        )}
                                      </MenuItem>
                                    </li>
                                  );
                                })}
                              </ul>
                            )}
                          </div>
                            );
                          })()
                        ) : (
                          (() => {
                            const href =
                              "url" in item
                                ? item.url + ""
                                : "/" +
                                  item.title.toLowerCase().split(" ").join("-");
                            
                            const itemBadge = getBadgeCount(href);

                            return (
                              <MenuItem
                                className="flex items-center gap-3 py-3"
                                as="link"
                                href={href}
                                isActive={pathname === href}
                                isPro={"isPro" in item && item.isPro}
                              >
                                <item.icon
                                  className="size-6 shrink-0"
                                  aria-hidden="true"
                                />

                                <span>{item.title}</span>

                                {itemBadge > 0 && (
                                  <div className="ml-auto flex size-[19px] items-center justify-center rounded-full bg-red-500 text-[10px] font-medium text-white">
                                    {itemBadge > 99 ? "99+" : itemBadge}
                                  </div>
                                )}
                              </MenuItem>
                            );
                          })()
                        )}
                      </li>
                    ))}
                  </ul>
                </nav>
              </div>
            ))}
          </div>
        </div>
      </aside>
    </>
  );
}
