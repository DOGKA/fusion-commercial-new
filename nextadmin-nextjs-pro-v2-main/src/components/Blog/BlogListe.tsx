"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { ChevronUpIcon } from "@/assets/icons";
import {
  BLOG_STATUS_LABEL,
  coverThumb,
  sitePostUrl,
  type BlogListItem,
  type BlogStatus,
} from "@/lib/blog/shared";

const STATUS_STYLE: Record<BlogStatus, string> = {
  PUBLISHED: "text-green",
  DRAFT: "text-amber-600",
  ARCHIVED: "text-dark-5",
};

const FILTERS: { value: BlogStatus | "ALL" | "NO_COVER"; label: string }[] = [
  { value: "ALL", label: "Tümü" },
  { value: "PUBLISHED", label: "Yayında" },
  { value: "DRAFT", label: "Taslak" },
  { value: "ARCHIVED", label: "Arşiv" },
  { value: "NO_COVER", label: "Kapaksız" },
];

const DATE = new Intl.DateTimeFormat("tr-TR", { day: "numeric", month: "short", year: "numeric" });

const smallButton =
  "rounded-lg border border-stroke px-3 py-1.5 text-xs font-semibold text-dark-4 hover:bg-gray-1 disabled:opacity-50 dark:border-dark-3 dark:text-dark-6 dark:hover:bg-dark-2";

function fold(value: string): string {
  return value.toLocaleLowerCase("tr-TR").normalize("NFD").replace(/[\u0300-\u036f]/g, "");
}

type ListResult = { posts: BlogListItem[]; categories: string[] } | { error: string };

async function fetchPosts(): Promise<ListResult> {
  const response = await fetch("/api/blogs", { cache: "no-store" });
  const data = await response.json();
  return response.ok
    ? { posts: data.posts, categories: data.categories }
    : { error: data.error ?? "Yazılar alınamadı." };
}

export default function BlogListe() {
  const [posts, setPosts] = useState<BlogListItem[] | null>(null);
  const [categories, setCategories] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<(typeof FILTERS)[number]["value"]>("ALL");
  const [category, setCategory] = useState("");
  const [query, setQuery] = useState("");
  const [busy, setBusy] = useState<string | null>(null);

  const apply = useCallback((result: ListResult) => {
    if ("error" in result) {
      setError(result.error);
      return;
    }
    setPosts(result.posts);
    setCategories(result.categories);
    setError(null);
  }, []);

  const load = useCallback(async () => apply(await fetchPosts()), [apply]);

  useEffect(() => {
    let active = true;
    fetchPosts().then((result) => {
      if (active) apply(result);
    });
    return () => {
      active = false;
    };
  }, [apply]);

  const counts = useMemo(() => {
    const result: Record<string, number> = { ALL: posts?.length ?? 0, NO_COVER: 0 };
    for (const post of posts ?? []) {
      result[post.status] = (result[post.status] ?? 0) + 1;
      if (!post.featuredImage) result.NO_COVER += 1;
    }
    return result;
  }, [posts]);

  const visible = useMemo(() => {
    const needle = fold(query.trim());
    return (posts ?? []).filter(
      (post) =>
        (filter === "ALL" ||
          (filter === "NO_COVER" ? !post.featuredImage : post.status === filter)) &&
        (!category || post.category === category) &&
        (!needle || fold(post.title).includes(needle) || post.slug.includes(needle))
    );
  }, [posts, filter, category, query]);

  async function setStatus(post: BlogListItem, status: BlogStatus) {
    setBusy(post.id);
    const response = await fetch(`/api/blogs/${post.id}`, {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ status }),
    });
    const data = await response.json();
    setBusy(null);
    if (!response.ok) {
      setError(data.error ?? "Durum değiştirilemedi.");
      return;
    }
    await load();
  }

  async function remove(post: BlogListItem) {
    if (!window.confirm(`"${post.title}" kalıcı olarak silinsin mi?`)) return;
    setBusy(post.id);
    const response = await fetch(`/api/blogs/${post.id}`, { method: "DELETE" });
    const data = await response.json();
    setBusy(null);
    if (!response.ok) {
      setError(data.error ?? "Yazı silinemedi.");
      return;
    }
    setPosts((current) => current?.filter((item) => item.id !== post.id) ?? null);
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex flex-wrap rounded-lg border border-stroke bg-white p-1 dark:border-dark-3 dark:bg-gray-dark">
          {FILTERS.map((item) => (
            <button
              key={item.value}
              type="button"
              onClick={() => setFilter(item.value)}
              className={`rounded-md px-3 py-1.5 text-sm font-medium transition ${
                filter === item.value
                  ? "bg-primary text-white"
                  : "text-dark-4 hover:bg-gray-1 dark:text-dark-6 dark:hover:bg-dark-2"
              }`}
            >
              {item.label}
              <span className={`ml-1.5 text-xs ${filter === item.value ? "text-white/70" : "text-dark-5"}`}>
                {counts[item.value] ?? 0}
              </span>
            </button>
          ))}
        </div>
        <div className="relative">
          <select
            value={category}
            onChange={(event) => setCategory(event.target.value)}
            className="appearance-none rounded-lg border border-stroke bg-white py-2.5 pl-3.5 pr-10 text-sm outline-none transition focus:border-primary dark:border-dark-3 dark:bg-gray-dark"
          >
            <option value="">Tüm kategoriler</option>
            {categories.map((name) => (
              <option key={name} value={name}>
                {name}
              </option>
            ))}
          </select>
          <ChevronUpIcon
            width={18}
            height={18}
            className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 rotate-180 text-dark-5 dark:text-dark-6"
          />
        </div>
        <input
          type="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Başlıkta ara…"
          className="min-w-56 flex-1 rounded-lg border border-stroke bg-white px-3.5 py-2.5 text-sm outline-none transition focus:border-primary dark:border-dark-3 dark:bg-gray-dark"
        />
        <Link
          href="/blogs/new"
          className="rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-white hover:bg-primary/90"
        >
          + Yeni yazı
        </Link>
      </div>

      {error && (
        <p className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600 dark:border-red-500/30 dark:bg-red-500/10">
          {error}
        </p>
      )}

      <div className="overflow-hidden rounded-xl border border-stroke bg-white dark:border-dark-3 dark:bg-gray-dark">
        {posts === null ? (
          <div className="space-y-3 p-5">
            {Array.from({ length: 6 }, (_, i) => (
              <div key={i} className="h-16 animate-pulse rounded-lg bg-gray-2 dark:bg-dark-2" />
            ))}
          </div>
        ) : visible.length === 0 ? (
          <p className="p-10 text-center text-sm text-dark-5">Bu filtreye uyan yazı yok.</p>
        ) : (
          <ul className="divide-y divide-stroke dark:divide-dark-3">
            {visible.map((post) => {
              const thumb = coverThumb(post.featuredImage);
              const date = post.publishedAt ?? post.updatedAt;
              return (
                <li key={post.id} className="flex items-center gap-4 px-5 py-3.5 hover:bg-gray-1 dark:hover:bg-dark-2">
                  <Link href={`/blogs/${post.id}`} className="shrink-0">
                    {thumb ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={thumb} alt="" className="h-14 w-24 rounded-lg object-cover" loading="lazy" />
                    ) : (
                      <span className="flex h-14 w-24 items-center justify-center rounded-lg bg-gray-2 text-[11px] text-dark-5 dark:bg-dark-2">
                        Kapak yok
                      </span>
                    )}
                  </Link>
                  <div className="min-w-0 flex-1">
                    <Link
                      href={`/blogs/${post.id}`}
                      className="line-clamp-1 text-sm font-semibold text-dark hover:text-primary dark:text-white"
                    >
                      {post.title}
                    </Link>
                    <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-dark-5 dark:text-dark-6">
                      <span className={STATUS_STYLE[post.status]}>{BLOG_STATUS_LABEL[post.status]}</span>
                      {post.category && <span>{post.category}</span>}
                      {date && <span>{DATE.format(new Date(date))}</span>}
                      <span>{post.viewCount.toLocaleString("tr-TR")} görüntülenme</span>
                    </div>
                  </div>
                  <div className="flex shrink-0 items-center gap-2">
                    {post.status === "PUBLISHED" ? (
                      <>
                        <a href={sitePostUrl(post.slug)} target="_blank" rel="noreferrer" className={smallButton}>
                          Sitede gör
                        </a>
                        <button
                          type="button"
                          disabled={busy === post.id}
                          onClick={() => setStatus(post, "DRAFT")}
                          className={smallButton}
                        >
                          Yayından kaldır
                        </button>
                      </>
                    ) : (
                      <button
                        type="button"
                        disabled={busy === post.id}
                        onClick={() => setStatus(post, "PUBLISHED")}
                        className="rounded-lg bg-green px-3 py-1.5 text-xs font-semibold text-white hover:bg-green-dark disabled:opacity-50"
                      >
                        Yayınla
                      </button>
                    )}
                    <Link href={`/blogs/${post.id}`} className={smallButton}>
                      Düzenle
                    </Link>
                    <button
                      type="button"
                      disabled={busy === post.id}
                      onClick={() => remove(post)}
                      className="rounded-lg px-2 py-1.5 text-xs font-semibold text-red-500 hover:bg-red-50 disabled:opacity-50 dark:hover:bg-red-500/10"
                    >
                      Sil
                    </button>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}
