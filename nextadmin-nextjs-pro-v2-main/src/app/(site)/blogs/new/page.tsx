"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import RichTextEditor from "@/components/FormElements/RichTextEditor";

const categories = [
  "Enerji Depolama",
  "Taşınabilir Güç",
  "Solar Enerji",
  "Endüstriyel Ekipman",
  "Eldiven & Güvenlik",
  "Haberler",
  "Rehber",
  "Diğer",
];

export default function NewBlogPage() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [content, setContent] = useState("");
  const [excerpt, setExcerpt] = useState("");
  const [category, setCategory] = useState("");
  const [status, setStatus] = useState("draft");
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Generate slug from title
  const generateSlug = (text: string) => {
    return text
      .toLowerCase()
      .replace(/ğ/g, "g")
      .replace(/ü/g, "u")
      .replace(/ş/g, "s")
      .replace(/ı/g, "i")
      .replace(/ö/g, "o")
      .replace(/ç/g, "c")
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-")
      .trim();
  };

  const handleTitleChange = (value: string) => {
    setTitle(value);
    if (!slug || slug === generateSlug(title)) {
      setSlug(generateSlug(value));
    }
  };

  const handleSave = async (publishStatus: string) => {
    if (!title || !slug || !content) {
      alert("Başlık, slug ve içerik zorunludur");
      return;
    }

    setSaving(true);
    setSaveSuccess(false);
    try {
      const res = await fetch("/api/blogs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          slug,
          content,
          excerpt,
          category: category || null,
          status: publishStatus,
        }),
      });

      if (res.ok) {
        setSaveSuccess(true);
        setTimeout(() => {
          router.push("/blogs");
        }, 1000);
      } else {
        const data = await res.json();
        alert(data.error || "Blog kaydedilemedi");
      }
    } catch (error) {
      console.error("Error saving blog:", error);
      alert("Blog kaydedilirken bir hata oluştu");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-dark dark:text-white">Yeni Blog Yazısı</h1>
          <p className="text-gray-500">Yeni bir blog yazısı oluşturun</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => handleSave("draft")}
            disabled={saving || saveSuccess}
            className={`px-4 py-2 rounded-lg border text-sm disabled:opacity-50 transition-colors ${
              saveSuccess 
                ? "border-green-500 text-green-500 bg-green-50 dark:bg-green-500/10" 
                : "border-stroke hover:bg-gray-50 dark:border-dark-3 dark:hover:bg-dark-2"
            }`}
          >
            {saving ? "Kaydediliyor..." : saveSuccess ? "✓ Kaydedildi" : "Taslak Kaydet"}
          </button>
          <button
            onClick={() => handleSave("published")}
            disabled={saving || saveSuccess}
            className={`px-5 py-2 rounded-lg text-white text-sm disabled:opacity-50 transition-colors ${
              saveSuccess 
                ? "bg-green-500 hover:bg-green-600" 
                : "bg-primary hover:bg-primary/90"
            }`}
          >
            {saving ? "Yayınlanıyor..." : saveSuccess ? "✓ Yayınlandı" : "Yayınla"}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Sol Panel - Ana Form */}
        <div className="lg:col-span-2 space-y-6">
          {/* Başlık */}
          <div className="rounded-xl border border-stroke bg-white p-6 dark:border-dark-3 dark:bg-gray-dark">
            <label className="mb-2 block text-sm font-medium">Başlık *</label>
            <input
              type="text"
              value={title}
              onChange={(e) => handleTitleChange(e.target.value)}
              placeholder="Blog başlığını girin..."
              className="w-full rounded-lg border border-stroke bg-transparent px-4 py-3 text-lg font-medium dark:border-dark-3 focus:border-primary focus:outline-none"
            />
          </div>

          {/* İçerik Editörü */}
          <div className="rounded-xl border border-stroke bg-white dark:border-dark-3 dark:bg-gray-dark overflow-hidden">
            <div className="p-6">
              <RichTextEditor
                value={content}
                onChange={setContent}
                placeholder="Blog içeriğini yazın..."
                minHeight="450px"
              />
            </div>
          </div>

          {/* Kısa Açıklama */}
          <div className="rounded-xl border border-stroke bg-white p-6 dark:border-dark-3 dark:bg-gray-dark">
            <label className="mb-2 block text-sm font-medium">Kısa Açıklama (Excerpt)</label>
            <textarea
              value={excerpt}
              onChange={(e) => setExcerpt(e.target.value)}
              rows={3}
              placeholder="Blog listesinde görünecek kısa açıklama..."
              className="w-full rounded-lg border border-stroke bg-transparent px-4 py-3 dark:border-dark-3 focus:border-primary focus:outline-none"
            />
            <p className="mt-2 text-xs text-gray-500">
              Boş bırakılırsa içerikten otomatik oluşturulur
            </p>
          </div>
        </div>

        {/* Sağ Panel */}
        <div className="space-y-6">
          {/* Yayın Durumu */}
          <div className="rounded-xl border border-stroke bg-white p-5 dark:border-dark-3 dark:bg-gray-dark">
            <h3 className="mb-4 font-semibold text-dark dark:text-white">Yayın Durumu</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-500">Durum:</span>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="rounded border border-stroke bg-transparent px-2 py-1 text-sm dark:border-dark-3"
                >
                  <option value="draft">Taslak</option>
                  <option value="published">Yayında</option>
                </select>
              </div>
            </div>
          </div>

          {/* Kategori */}
          <div className="rounded-xl border border-stroke bg-white p-5 dark:border-dark-3 dark:bg-gray-dark">
            <h3 className="mb-4 font-semibold text-dark dark:text-white">Kategori</h3>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full rounded-lg border border-stroke bg-transparent px-4 py-2.5 text-sm dark:border-dark-3 focus:border-primary focus:outline-none"
            >
              <option value="">Kategori Seçin...</option>
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
            {category && (
              <div className="mt-3 flex items-center gap-2">
                <span className="px-3 py-1 rounded-lg text-sm bg-primary/10 text-primary">
                  {category}
                </span>
                <button
                  onClick={() => setCategory("")}
                  className="text-gray-400 hover:text-red-500"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            )}
          </div>

          {/* URL Slug */}
          <div className="rounded-xl border border-stroke bg-white p-5 dark:border-dark-3 dark:bg-gray-dark">
            <h3 className="mb-4 font-semibold text-dark dark:text-white">URL Slug</h3>
            <div className="space-y-2">
              <input
                type="text"
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                placeholder="blog-url-slug"
                className="w-full rounded-lg border border-stroke bg-transparent px-4 py-2.5 text-sm dark:border-dark-3 focus:border-primary focus:outline-none"
              />
              <p className="text-xs text-gray-500">
                fusionmarkt.com/blog/<span className="font-medium text-primary">{slug || "..."}</span>
              </p>
            </div>
          </div>

          {/* Önizleme */}
          <div className="rounded-xl border border-stroke bg-white p-5 dark:border-dark-3 dark:bg-gray-dark">
            <h3 className="mb-4 font-semibold text-dark dark:text-white">Blog Kartı Önizleme</h3>
            <div className="rounded-lg border border-stroke p-4 dark:border-dark-3">
              {category && (
                <span className="inline-block px-2 py-0.5 rounded text-xs bg-primary/10 text-primary mb-2">
                  {category}
                </span>
              )}
              <h4 className="font-medium text-dark dark:text-white line-clamp-2 mb-2">
                {title || "Blog Başlığı"}
              </h4>
              <p className="text-sm text-gray-500 line-clamp-2">
                {excerpt || "Kısa açıklama burada görünecek..."}
              </p>
              <div className="flex items-center gap-3 mt-3 text-xs text-gray-400">
                <span>{new Date().toLocaleDateString("tr-TR")}</span>
                <span>•</span>
                <span>FusionMarkt</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

