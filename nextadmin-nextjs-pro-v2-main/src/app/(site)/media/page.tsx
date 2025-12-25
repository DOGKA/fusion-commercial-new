"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import Image from "next/image";

interface MediaItem {
  id: string;
  filename: string;
  key: string;
  url: string;
  mimeType: string;
  size: number;
  folder: string;
  createdAt: string;
}

interface PaginationInfo {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

const FOLDER_OPTIONS = [
  { value: "all", label: "Tümü" },
  { value: "PRODUCTS", label: "Ürün Görselleri" },
  { value: "SLIDERS", label: "Slider Görselleri" },
  { value: "BANNERS", label: "Banner Görselleri" },
  { value: "CATEGORIES", label: "Kategori Görselleri" },
  { value: "BRANDS", label: "Marka Logoları" },
  { value: "GENERAL", label: "Genel Medya" },
];

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return bytes + " B";
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
  return (bytes / (1024 * 1024)).toFixed(1) + " MB";
}

function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString("tr-TR", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export default function MediaPage() {
  const [view, setView] = useState<"grid" | "list">("grid");
  const [media, setMedia] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<string[]>([]);
  const [deleting, setDeleting] = useState(false);
  const [activeFolder, setActiveFolder] = useState("all");
  const [pagination, setPagination] = useState<PaginationInfo | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const dropAreaInputRef = useRef<HTMLInputElement>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);

  // Dosya seçici aç
  const openFilePicker = () => {
    fileInputRef.current?.click();
  };

  const openDropAreaFilePicker = () => {
    dropAreaInputRef.current?.click();
  };

  // Medya dosyalarını çek
  const fetchMedia = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/media?folder=${activeFolder}&limit=100`);
      if (res.ok) {
        const data = await res.json();
        setMedia(data.media || []);
        setPagination(data.pagination || null);
      }
    } catch (error) {
      console.error("Error fetching media:", error);
    } finally {
      setLoading(false);
    }
  }, [activeFolder]);

  useEffect(() => {
    fetchMedia();
  }, [fetchMedia]);

  // Dosya yükle
  const handleUpload = async (files: FileList | File[]) => {
    if (!files || files.length === 0) {
      console.log("No files selected");
      return;
    }

    console.log("Uploading files:", files.length);
    setUploading(true);
    setUploadError(null);
    
    try {
      const formData = new FormData();
      Array.from(files).forEach((file) => {
        console.log("Adding file:", file.name, file.type, file.size);
        formData.append("files", file);
      });
      formData.append("folder", activeFolder === "all" ? "GENERAL" : activeFolder);

      const res = await fetch("/api/media", {
        method: "POST",
        body: formData,
      });

      console.log("Upload response status:", res.status);
      
      if (res.ok) {
        const data = await res.json();
        console.log("Upload success:", data);
        if (data.media) {
          setMedia((prev) => [...data.media, ...prev]);
        }
        // Input'u temizle
        if (fileInputRef.current) {
          fileInputRef.current.value = "";
        }
        if (dropAreaInputRef.current) {
          dropAreaInputRef.current.value = "";
        }
      } else {
        const errorData = await res.json();
        console.error("Upload failed:", errorData);
        const errorMsg = errorData.details 
          ? `${errorData.error}: ${errorData.details}` 
          : errorData.error || "Yükleme başarısız";
        setUploadError(errorMsg);
        alert(errorMsg);
      }
    } catch (error: any) {
      console.error("Upload error:", error);
      const errorMsg = error?.message || "Dosya yüklenirken hata oluştu";
      setUploadError(errorMsg);
      alert(errorMsg);
    } finally {
      setUploading(false);
    }
  };

  // Seçilen dosyaları sil
  const handleDeleteSelected = async () => {
    if (selectedFiles.length === 0) return;
    if (!confirm(`${selectedFiles.length} dosyayı silmek istediğinizden emin misiniz?`)) return;

    setDeleting(true);
    try {
      for (const id of selectedFiles) {
        await fetch(`/api/media?id=${id}`, { method: "DELETE" });
      }
      setMedia((prev) => prev.filter((m) => !selectedFiles.includes(m.id)));
      setSelectedFiles([]);
    } catch (error) {
      console.error("Delete error:", error);
      alert("Silme sırasında hata oluştu");
    } finally {
      setDeleting(false);
    }
  };

  // Tek dosya sil
  const handleDeleteSingle = async (item: MediaItem, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm(`"${item.filename}" dosyasını silmek istediğinizden emin misiniz?`)) return;

    try {
      const res = await fetch(`/api/media?id=${item.id}`, { method: "DELETE" });
      if (res.ok) {
        setMedia((prev) => prev.filter((m) => m.id !== item.id));
        setSelectedFiles((prev) => prev.filter((id) => id !== item.id));
      }
    } catch (error) {
      console.error("Delete error:", error);
    }
  };

  const toggleSelect = (id: string) => {
    setSelectedFiles((prev) =>
      prev.includes(id) ? prev.filter((f) => f !== id) : [...prev, id]
    );
  };

  const selectAll = () => {
    if (selectedFiles.length === media.length) {
      setSelectedFiles([]);
    } else {
      setSelectedFiles(media.map((m) => m.id));
    }
  };

  // Drag & Drop
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const files = e.dataTransfer.files;
    handleUpload(files);
  };

  // İstatistikler
  const totalSize = media.reduce((acc, m) => acc + m.size, 0);
  const imageCount = media.filter((m) => m.mimeType.startsWith("image/")).length;
  const docCount = media.filter((m) => !m.mimeType.startsWith("image/")).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-dark dark:text-white">Medya Kütüphanesi</h1>
          <p className="text-gray-500">Resim ve dosyalarınızı yönetin</p>
        </div>
        <div className="flex items-center gap-3">
          {/* View Toggle */}
          <div className="flex rounded-lg border border-stroke dark:border-dark-3">
            <button
              onClick={() => setView("grid")}
              className={`p-2 ${view === "grid" ? "bg-primary text-white" : "text-gray-500 hover:bg-gray-50 dark:hover:bg-dark-2"} rounded-l-lg`}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
              </svg>
            </button>
            <button
              onClick={() => setView("list")}
              className={`p-2 ${view === "list" ? "bg-primary text-white" : "text-gray-500 hover:bg-gray-50 dark:hover:bg-dark-2"} rounded-r-lg`}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
              </svg>
            </button>
          </div>
          
          {/* Upload Button */}
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept="image/*"
            className="hidden"
            onChange={(e) => e.target.files && handleUpload(e.target.files)}
          />
          <button
            type="button"
            onClick={openFilePicker}
            disabled={uploading}
            className="inline-flex items-center gap-2 rounded-lg bg-primary px-5 py-2.5 text-white hover:bg-primary/90 transition-colors disabled:opacity-50"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
            </svg>
            {uploading ? "Yükleniyor..." : "Yükle"}
          </button>
        </div>
      </div>

      {/* Folder Tabs */}
      <div className="flex items-center gap-2 flex-wrap">
        {FOLDER_OPTIONS.map((opt) => (
          <button
            key={opt.value}
            onClick={() => {
              setActiveFolder(opt.value);
              setSelectedFiles([]);
            }}
            className={`px-4 py-2 text-sm rounded-lg transition-colors ${
              activeFolder === opt.value
                ? "bg-primary text-white"
                : "bg-white dark:bg-gray-dark text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-dark-2 border border-stroke dark:border-dark-3"
            }`}
          >
            {opt.label}
          </button>
        ))}
      </div>

      {/* Upload Area */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`rounded-xl border-2 border-dashed p-8 text-center transition-colors ${
          dragOver
            ? "border-primary bg-primary/5"
            : "border-stroke bg-white dark:border-dark-3 dark:bg-gray-dark"
        }`}
      >
        <svg className="mx-auto w-16 h-16 text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
        </svg>
        <p className="text-gray-600 dark:text-gray-400 mb-2">
          {dragOver ? "Dosyaları bırakın" : "Dosyaları sürükleyip bırakın"}
        </p>
        <p className="text-sm text-gray-500">veya</p>
        <input
          ref={dropAreaInputRef}
          type="file"
          multiple
          accept="image/*"
          className="hidden"
          onChange={(e) => e.target.files && handleUpload(e.target.files)}
        />
        <button
          type="button"
          onClick={openDropAreaFilePicker}
          disabled={uploading}
          className="mt-2 text-primary hover:underline disabled:opacity-50"
        >
          bilgisayardan seçin
        </button>
        <p className="mt-4 text-xs text-gray-400">PNG, JPG, SVG, GIF, WebP • Max 10MB</p>
        
        {uploadError && (
          <div className="mt-4 p-3 bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/30 rounded-lg">
            <p className="text-sm text-red-600 dark:text-red-400">{uploadError}</p>
          </div>
        )}
        
        {uploading && (
          <div className="mt-4 flex items-center justify-center gap-2">
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-primary"></div>
            <span className="text-sm text-primary">Dosyalar yükleniyor...</span>
          </div>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <div className="rounded-xl border border-stroke bg-white p-4 dark:border-dark-3 dark:bg-gray-dark">
          <p className="text-2xl font-bold text-dark dark:text-white">{media.length}</p>
          <p className="text-sm text-gray-500">Toplam Dosya</p>
        </div>
        <div className="rounded-xl border border-stroke bg-white p-4 dark:border-dark-3 dark:bg-gray-dark">
          <p className="text-2xl font-bold text-dark dark:text-white">{formatFileSize(totalSize)}</p>
          <p className="text-sm text-gray-500">Kullanılan Alan</p>
        </div>
        <div className="rounded-xl border border-stroke bg-white p-4 dark:border-dark-3 dark:bg-gray-dark">
          <p className="text-2xl font-bold text-dark dark:text-white">{imageCount}</p>
          <p className="text-sm text-gray-500">Resim</p>
        </div>
        <div className="rounded-xl border border-stroke bg-white p-4 dark:border-dark-3 dark:bg-gray-dark">
          <p className="text-2xl font-bold text-dark dark:text-white">{docCount}</p>
          <p className="text-sm text-gray-500">Döküman</p>
        </div>
      </div>

      {/* Media Grid/List */}
      <div className="rounded-xl border border-stroke bg-white dark:border-dark-3 dark:bg-gray-dark">
        <div className="flex items-center justify-between border-b border-stroke px-6 py-4 dark:border-dark-3">
          <div className="flex items-center gap-4">
            <h2 className="text-lg font-semibold text-dark dark:text-white">Dosyalar</h2>
            {media.length > 0 && (
              <button
                onClick={selectAll}
                className="text-sm text-primary hover:underline"
              >
                {selectedFiles.length === media.length ? "Seçimi Kaldır" : "Tümünü Seç"}
              </button>
            )}
          </div>
          {selectedFiles.length > 0 && (
            <button
              onClick={handleDeleteSelected}
              disabled={deleting}
              className="flex items-center gap-2 text-sm text-red-500 hover:text-red-600 disabled:opacity-50"
            >
              {deleting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-500"></div>
                  Siliniyor...
                </>
              ) : (
                <>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                  {selectedFiles.length} dosya seçildi - Sil
                </>
              )}
            </button>
          )}
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary"></div>
          </div>
        ) : media.length === 0 ? (
          <div className="py-12 text-center">
            <svg className="w-16 h-16 mx-auto text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <p className="text-gray-500">Bu klasörde henüz dosya yok</p>
            <p className="text-sm text-gray-400 mt-1">Dosya yüklemek için yukarıdaki alanı kullanın</p>
          </div>
        ) : view === "grid" ? (
          <div className="grid grid-cols-2 gap-4 p-6 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
            {media.map((file) => (
              <div
                key={file.id}
                onClick={() => toggleSelect(file.id)}
                className={`group relative cursor-pointer rounded-lg border-2 p-2 transition-all ${
                  selectedFiles.includes(file.id)
                    ? "border-primary bg-primary/5"
                    : "border-transparent hover:border-stroke dark:hover:border-dark-3"
                }`}
              >
                {/* Checkbox */}
                <div className="absolute top-3 left-3 z-10">
                  <input
                    type="checkbox"
                    checked={selectedFiles.includes(file.id)}
                    onChange={() => toggleSelect(file.id)}
                    onClick={(e) => e.stopPropagation()}
                    className="h-4 w-4 rounded border-stroke text-primary focus:ring-primary"
                  />
                </div>

                {/* Delete Button */}
                <button
                  onClick={(e) => handleDeleteSingle(file, e)}
                  className="absolute top-3 right-3 z-10 p-1 rounded bg-red-500 text-white opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
                >
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>

                <div className="aspect-square rounded-lg bg-gray-100 dark:bg-dark-2 flex items-center justify-center overflow-hidden">
                  {file.mimeType.startsWith("image/") ? (
                    <Image
                      src={file.url}
                      alt={file.filename}
                      width={150}
                      height={150}
                      className="w-full h-full object-cover"
                      unoptimized
                    />
                  ) : (
                    <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                    </svg>
                  )}
                </div>
                <p className="mt-2 text-xs text-center text-gray-600 dark:text-gray-400 truncate" title={file.filename}>
                  {file.filename}
                </p>
                <p className="text-xs text-center text-gray-400">{formatFileSize(file.size)}</p>
              </div>
            ))}
          </div>
        ) : (
          <div className="divide-y divide-stroke dark:divide-dark-3">
            {media.map((file) => (
              <div
                key={file.id}
                className="flex items-center gap-4 px-6 py-4 hover:bg-gray-50 dark:hover:bg-dark-2 group"
              >
                <input
                  type="checkbox"
                  checked={selectedFiles.includes(file.id)}
                  onChange={() => toggleSelect(file.id)}
                  className="h-4 w-4 rounded border-stroke text-primary focus:ring-primary"
                />
                <div className="h-12 w-12 rounded bg-gray-100 dark:bg-dark-2 flex items-center justify-center overflow-hidden flex-shrink-0">
                  {file.mimeType.startsWith("image/") ? (
                    <Image
                      src={file.url}
                      alt={file.filename}
                      width={48}
                      height={48}
                      className="w-full h-full object-cover"
                      unoptimized
                    />
                  ) : (
                    <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                    </svg>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-dark dark:text-white truncate">{file.filename}</p>
                  <p className="text-sm text-gray-500">{formatFileSize(file.size)} • {file.folder}</p>
                </div>
                <p className="text-sm text-gray-500 hidden sm:block">{formatDate(file.createdAt)}</p>
                <div className="flex items-center gap-2">
                  <a
                    href={file.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={(e) => e.stopPropagation()}
                    className="p-2 rounded hover:bg-gray-100 dark:hover:bg-dark-3 text-gray-500"
                    title="Görüntüle"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  </a>
                  <button
                    onClick={(e) => handleDeleteSingle(file, e)}
                    className="p-2 rounded hover:bg-red-50 dark:hover:bg-red-500/10 text-gray-500 hover:text-red-500"
                    title="Sil"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Pagination Info */}
        {pagination && pagination.total > 0 && (
          <div className="px-6 py-4 border-t border-stroke dark:border-dark-3 text-sm text-gray-500">
            Toplam {pagination.total} dosya
          </div>
        )}
      </div>
    </div>
  );
}
