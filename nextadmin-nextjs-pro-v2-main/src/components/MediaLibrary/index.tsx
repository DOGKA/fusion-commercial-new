"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import Image from "next/image";

// Types
interface MediaItem {
  id: string;
  provider?: string;
  filename: string;
  key: string;
  url: string;
  mimeType: string;
  size: number;
  width?: number;
  height?: number;
  alt?: string;
  title?: string;
  description?: string;
  usage?: string;
  ownerUserId?: string;
  uploadedBy?: string;
  createdAt: string;
}

interface MediaLibraryProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (media: MediaItem | MediaItem[]) => void;
  usage?: "BANNER" | "SLIDER" | "PRODUCT" | "CATEGORY" | "OTHER" | "USER_PHOTO";
  title?: string;
  multiple?: boolean;
  selectedUrls?: string[];
}

// Usage filter tabs
const USAGE_OPTIONS = [
  { value: "ALL", label: "Tümü" },
  { value: "BANNER", label: "Banner" },
  { value: "SLIDER", label: "Slider" },
  { value: "PRODUCT", label: "Ürün" },
  { value: "CATEGORY", label: "Kategori" },
  { value: "OTHER", label: "Genel" },
];

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return bytes + " B";
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
  return (bytes / (1024 * 1024)).toFixed(1) + " MB";
}

export default function MediaLibrary({
  isOpen,
  onClose,
  onSelect,
  usage = "OTHER",
  title = "Medya Kütüphanesi",
}: MediaLibraryProps) {
  // State
  const [media, setMedia] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeUsage, setActiveUsage] = useState<string>("ALL");
  const [selectedMedia, setSelectedMedia] = useState<MediaItem | null>(null);
  const [dragOver, setDragOver] = useState(false);
  
  // Upload state
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadedMedia, setUploadedMedia] = useState<MediaItem | null>(null);
  
  // SEO Panel state
  const [showSeoPanel, setShowSeoPanel] = useState(false);
  const [seoAlt, setSeoAlt] = useState("");
  const [seoTitle, setSeoTitle] = useState("");
  const [seoDescription, setSeoDescription] = useState("");
  const [savingSeo, setSavingSeo] = useState(false);
  
  // Delete state
  const [deleting, setDeleting] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Fetch media from API
  const fetchMedia = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (activeUsage !== "ALL") params.append("usage", activeUsage);
      params.append("limit", "100");
      
      const res = await fetch(`/api/admin/media?${params}`);
      if (res.ok) {
        const data = await res.json();
        setMedia(data.media || []);
      } else {
        console.error("Media fetch failed:", res.status, await res.text());
        setMedia([]);
      }
    } catch (error) {
      console.error("Error fetching media:", error);
      setMedia([]);
    } finally {
      setLoading(false);
    }
  }, [activeUsage]);

  useEffect(() => {
    if (isOpen) {
      fetchMedia();
      // Reset state when modal opens
      setSelectedMedia(null);
      setShowSeoPanel(false);
      setUploadedMedia(null);
    }
  }, [isOpen, fetchMedia]);

  // ===== UPLOAD FLOW =====
  // Step 1: Get presigned URL
  // Step 2: Upload to S3 with progress
  // Step 3: Open SEO panel for alt text
  // Step 4: Save to DB
  
  const handleUpload = async (files: FileList | File[]) => {
    if (!files || files.length === 0) return;
    
    const file = files[0]; // Single file upload for now
    
    // Validate
    const isImage = file.type.startsWith("image/");
    const isVideo = file.type.startsWith("video/");
    
    if (!isImage && !isVideo) {
      alert("Sadece görsel veya video dosyaları yükleyebilirsiniz");
      return;
    }
    
    // 10MB for images, 100MB for videos
    const maxSize = isVideo ? 100 * 1024 * 1024 : 10 * 1024 * 1024;
    if (file.size > maxSize) {
      alert(`Dosya boyutu ${isVideo ? "100MB" : "10MB"}'dan küçük olmalı`);
      return;
    }

    setUploading(true);
    setUploadProgress(0);

    try {
      // Step 1: Get presigned URL
      const presignRes = await fetch("/api/admin/media/presign", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          filename: file.name,
          mimeType: file.type,
          size: file.size,
          usage: activeUsage === "ALL" ? (usage || "OTHER") : activeUsage,
        }),
      });

      if (!presignRes.ok) {
        const err = await presignRes.json();
        throw new Error(err.error || "Presign failed");
      }

      const { uploadUrl, key, publicUrl } = await presignRes.json();
      setUploadProgress(20);

      // Step 2: Upload to S3
      const uploadRes = await fetch(uploadUrl, {
        method: "PUT",
        headers: { "Content-Type": file.type },
        body: file,
      });

      if (!uploadRes.ok) {
        throw new Error("S3 upload failed");
      }

      setUploadProgress(80);

      // Get image dimensions
      let width: number | undefined;
      let height: number | undefined;
      
      if (file.type.startsWith("image/")) {
        try {
          const img = document.createElement("img");
          const objectUrl = URL.createObjectURL(file);
          await new Promise<void>((resolve) => {
            img.onload = () => {
              width = img.naturalWidth;
              height = img.naturalHeight;
              URL.revokeObjectURL(objectUrl);
              resolve();
            };
            img.onerror = () => resolve();
            img.src = objectUrl;
          });
        } catch {
          // Ignore dimension errors
        }
      }

      setUploadProgress(100);

      // Step 3: Prepare for SEO panel
      setUploadedMedia({
        id: "", // Will be set after DB save
        filename: file.name,
        key,
        url: publicUrl,
        mimeType: file.type,
        size: file.size,
        width,
        height,
        alt: "",
        usage: activeUsage === "ALL" ? (usage || "OTHER") : activeUsage,
        createdAt: new Date().toISOString(),
      });

      // Open SEO panel
      setSeoAlt("");
      setSeoTitle(file.name.replace(/\.[^/.]+$/, "")); // Filename without extension
      setSeoDescription("");
      setShowSeoPanel(true);

    } catch (error: any) {
      console.error("Upload error:", error);
      alert(error.message || "Yükleme başarısız");
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  };

  // Step 4: Save to DB with SEO data
  const handleSaveSeo = async () => {
    if (!uploadedMedia) return;
    
    // Alt text only required for images, not videos
    const isVideo = uploadedMedia.mimeType?.startsWith("video/");
    if (!isVideo && !seoAlt.trim()) {
      alert("Alt text zorunludur (SEO için gerekli)");
      return;
    }

    setSavingSeo(true);

    try {
      const res = await fetch("/api/admin/media", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          filename: uploadedMedia.filename,
          key: uploadedMedia.key,
          url: uploadedMedia.url,
          mimeType: uploadedMedia.mimeType,
          size: uploadedMedia.size,
          width: uploadedMedia.width,
          height: uploadedMedia.height,
          alt: seoAlt.trim(),
          description: seoDescription.trim() || null,
          usage: uploadedMedia.usage || "OTHER",
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Save failed");
      }

      const savedMedia = await res.json();

      // Add to list
      setMedia((prev) => [savedMedia, ...prev]);

      // Close SEO panel
      setShowSeoPanel(false);
      setUploadedMedia(null);

      // Auto-select the new media
      setSelectedMedia(savedMedia);

    } catch (error: any) {
      console.error("Save error:", error);
      alert(error.message || "Kaydetme başarısız");
    } finally {
      setSavingSeo(false);
    }
  };

  // Delete media
  const handleDelete = async (item: MediaItem) => {
    if (!confirm(`"${item.filename}" dosyasını silmek istediğinizden emin misiniz?`)) {
      return;
    }

    setDeleting(item.id);

    try {
      const res = await fetch(`/api/admin/media/${item.id}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        const err = await res.json();
        if (res.status === 409) {
          alert(`Bu görsel kullanımda: ${err.usage?.join(", ")}`);
        } else {
          alert(err.error || "Silme başarısız");
        }
        return;
      }

        setMedia((prev) => prev.filter((m) => m.id !== item.id));
      if (selectedMedia?.id === item.id) {
        setSelectedMedia(null);
      }
    } catch (error) {
      console.error("Delete error:", error);
      alert("Silme başarısız");
    } finally {
      setDeleting(null);
    }
  };

  // Select media for use
  const handleUseMedia = () => {
    if (!selectedMedia) return;
    
    // Alt text only required for images, not videos
    const isVideo = selectedMedia.mimeType?.startsWith("video/");
    if (!isVideo && !selectedMedia.alt) {
      alert("Bu görselin alt text'i yok. Lütfen önce SEO bilgilerini doldurun.");
      return;
    }
    
    onSelect(selectedMedia);
    onClose();
  };

  // Drag & Drop
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = () => {
    setDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    handleUpload(e.dataTransfer.files);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 p-4">
      <div className="w-full max-w-6xl max-h-[90vh] rounded-2xl bg-white dark:bg-gray-dark flex flex-col overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-stroke dark:border-dark-3">
          <div>
            <h2 className="text-xl font-semibold text-dark dark:text-white">{title}</h2>
            <p className="text-sm text-gray-500">
              {selectedMedia
                ? `Seçili: ${selectedMedia.filename}`
                : "Görsel seçin veya yükleyin"}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-dark-2 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Toolbar */}
        <div className="flex items-center justify-between gap-4 px-6 py-3 bg-gray-50 dark:bg-dark-2 border-b border-stroke dark:border-dark-3">
          {/* Usage Filter Tabs */}
          <div className="flex items-center gap-2 overflow-x-auto">
            {USAGE_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                onClick={() => setActiveUsage(opt.value)}
                className={`px-3 py-1.5 text-sm rounded-lg transition-colors whitespace-nowrap ${
                  activeUsage === opt.value
                    ? "bg-primary text-white"
                    : "bg-white dark:bg-dark-3 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-dark-2"
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>

          {/* Upload Button */}
          <div className="flex items-center gap-2">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*,video/*"
              className="hidden"
              onChange={(e) => e.target.files && handleUpload(e.target.files)}
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-white text-sm rounded-lg hover:bg-primary/90 disabled:opacity-50"
            >
              {uploading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Yükleniyor... {uploadProgress}%
                </>
              ) : (
                <>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Yükle
                </>
              )}
            </button>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="flex flex-1 overflow-hidden">
          {/* Media Grid */}
        <div
            className={`flex-1 overflow-auto p-4 ${dragOver ? "bg-primary/5" : ""}`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary"></div>
            </div>
          ) : media.length === 0 ? (
            <div
                className={`h-full min-h-[300px] border-2 border-dashed rounded-xl flex flex-col items-center justify-center ${
                dragOver ? "border-primary bg-primary/5" : "border-stroke dark:border-dark-3"
              }`}
            >
                <svg className="w-16 h-16 mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <p className="text-gray-500 mb-2">Henüz görsel yok</p>
                <p className="text-sm text-gray-400">Sürükle & bırak veya yükle butonuna tıkla</p>
            </div>
          ) : (
              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-3">
              {media.map((item) => {
                const isVideo = item.mimeType?.startsWith("video/");
                return (
                <div
                  key={item.id}
                  className={`group relative aspect-square rounded-lg overflow-hidden border-2 cursor-pointer transition-all ${
                      selectedMedia?.id === item.id
                      ? "border-primary ring-2 ring-primary/30"
                      : "border-stroke dark:border-dark-3 hover:border-primary/50"
                  }`}
                    onClick={() => setSelectedMedia(item)}
                >
                  {isVideo ? (
                    <>
                      <video
                        src={item.url}
                        className="w-full h-full object-cover"
                        muted
                        preload="metadata"
                      />
                      {/* Video Badge */}
                      <div className="absolute bottom-2 left-2 px-2 py-1 bg-cyan-500 text-white text-[10px] font-bold rounded flex items-center gap-1">
                        <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M8 5v14l11-7z"/>
                        </svg>
                        VİDEO
                      </div>
                    </>
                  ) : (
                  <Image
                    src={item.url}
                      alt={item.alt || item.filename}
                    fill
                    className="object-cover"
                    unoptimized
                  />
                  )}
                  
                    {/* Selection Check */}
                    {selectedMedia?.id === item.id && (
                      <div className="absolute top-2 right-2 w-6 h-6 bg-primary rounded-full flex items-center justify-center shadow-lg">
                        <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                  )}

                    {/* Missing Alt Warning - Only for images */}
                    {!isVideo && !item.alt && (
                      <div className="absolute top-2 left-2 w-6 h-6 bg-yellow-500 rounded-full flex items-center justify-center shadow-lg" title="Alt text eksik">
                        <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                      </div>
                    )}

                  {/* Hover Overlay */}
                    <div className="absolute inset-0 bg-black/70 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2 p-2">
                      <p className="text-white text-xs text-center truncate w-full">{item.filename}</p>
                      <p className="text-white/60 text-[10px]">{formatFileSize(item.size)}</p>
                      {item.width && item.height && (
                        <p className="text-white/60 text-[10px]">{item.width}x{item.height}</p>
                      )}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(item);
                      }}
                      disabled={deleting === item.id}
                        className="mt-1 px-3 py-1 bg-red-500 text-white text-xs rounded hover:bg-red-600 disabled:opacity-50"
                    >
                      {deleting === item.id ? "..." : "Sil"}
                    </button>
                  </div>
                </div>
                );
              })}
            </div>
          )}

          {/* Drag Overlay */}
          {dragOver && (
              <div className="absolute inset-0 flex items-center justify-center bg-primary/10 pointer-events-none">
              <div className="text-center">
                  <svg className="w-16 h-16 mx-auto mb-3 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
                  <p className="text-primary font-semibold text-lg">Dosyayı buraya bırakın</p>
                </div>
              </div>
            )}
          </div>

          {/* Right Panel - Selected Media Details */}
          {selectedMedia && !showSeoPanel && (
            <div className="w-80 border-l border-stroke dark:border-dark-3 bg-gray-50 dark:bg-dark-2 p-4 overflow-y-auto">
              <h3 className="font-semibold text-dark dark:text-white mb-4">
                {selectedMedia.mimeType?.startsWith("video/") ? "Video Detayları" : "Görsel Detayları"}
              </h3>
              
              {/* Preview */}
              <div className="relative aspect-video rounded-lg overflow-hidden mb-4 bg-gray-200 dark:bg-dark-3">
                {selectedMedia.mimeType?.startsWith("video/") ? (
                  <video
                    src={selectedMedia.url}
                    className="w-full h-full object-contain"
                    controls
                    preload="metadata"
                  />
                ) : (
                <Image
                  src={selectedMedia.url}
                  alt={selectedMedia.alt || selectedMedia.filename}
                  fill
                  className="object-contain"
                  unoptimized
                />
                )}
              </div>

              {/* Info */}
              <div className="space-y-3 text-sm">
                <div>
                  <label className="text-gray-500 text-xs">Dosya Adı</label>
                  <p className="text-dark dark:text-white truncate">{selectedMedia.filename}</p>
                </div>
                
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-gray-500 text-xs">Boyut</label>
                    <p className="text-dark dark:text-white">{formatFileSize(selectedMedia.size)}</p>
                  </div>
                  {selectedMedia.width && selectedMedia.height && (
                    <div>
                      <label className="text-gray-500 text-xs">Boyutlar</label>
                      <p className="text-dark dark:text-white">{selectedMedia.width}x{selectedMedia.height}</p>
                    </div>
                  )}
                </div>

                <div>
                  <label className="text-gray-500 text-xs">Kullanım</label>
                  <p className="text-dark dark:text-white">{selectedMedia.usage || "Genel"}</p>
                </div>
              </div>

              {/* Editable SEO Fields */}
              <div className="mt-4 pt-4 border-t border-stroke dark:border-dark-3 space-y-3">
                <h4 className="text-sm font-medium text-dark dark:text-white flex items-center gap-2">
                  <svg className="w-4 h-4 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                  SEO Bilgileri
                </h4>
                
                {/* Alt Text */}
                <div>
                  <label className="text-gray-500 text-xs mb-1 block">
                    Alt Text {!selectedMedia.mimeType?.startsWith("video/") && <span className="text-red-500">*</span>}
                  </label>
                  <input
                    type="text"
                    defaultValue={selectedMedia.alt || ""}
                    placeholder="Görseli tanımlayan metin..."
                    className={`w-full px-3 py-2 text-sm rounded-lg border ${
                      !selectedMedia.alt && !selectedMedia.mimeType?.startsWith("video/")
                        ? "border-yellow-400 bg-yellow-50 dark:bg-yellow-900/20"
                        : "border-stroke dark:border-dark-3 bg-white dark:bg-dark-2"
                    } text-dark dark:text-white focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-colors`}
                    onBlur={async (e) => {
                      const newAlt = e.target.value.trim();
                      if (newAlt !== (selectedMedia.alt || "")) {
                        try {
                          const res = await fetch(`/api/admin/media/${selectedMedia.id}`, {
                            method: "PATCH",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({ alt: newAlt }),
                          });
                          if (res.ok) {
                            // Update local state
                            setMedia(prev => prev.map(m => 
                              m.id === selectedMedia.id ? { ...m, alt: newAlt } : m
                            ));
                            setSelectedMedia({ ...selectedMedia, alt: newAlt });
                          }
                        } catch (error) {
                          console.error("Failed to update alt text:", error);
                        }
                      }
                    }}
                  />
                  {!selectedMedia.alt && !selectedMedia.mimeType?.startsWith("video/") && (
                    <p className="text-yellow-600 text-xs mt-1 flex items-center gap-1">
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01" />
                      </svg>
                      SEO için alt text zorunludur
                    </p>
                  )}
                </div>

                {/* Description */}
                <div>
                  <label className="text-gray-500 text-xs mb-1 block">Açıklama</label>
                  <textarea
                    defaultValue={selectedMedia.description || ""}
                    placeholder="Detaylı açıklama (opsiyonel)"
                    rows={2}
                    className="w-full px-3 py-2 text-sm rounded-lg border border-stroke dark:border-dark-3 bg-white dark:bg-dark-2 text-dark dark:text-white focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-colors resize-none"
                    onBlur={async (e) => {
                      const newDesc = e.target.value.trim();
                      if (newDesc !== (selectedMedia.description || "")) {
                        try {
                          const res = await fetch(`/api/admin/media/${selectedMedia.id}`, {
                            method: "PATCH",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({ description: newDesc || null }),
                          });
                          if (res.ok) {
                            setMedia(prev => prev.map(m => 
                              m.id === selectedMedia.id ? { ...m, description: newDesc || undefined } : m
                            ));
                            setSelectedMedia({ ...selectedMedia, description: newDesc || undefined });
                          }
                        } catch (error) {
                          console.error("Failed to update description:", error);
                        }
                      }
                    }}
                  />
                </div>
              </div>
            </div>
          )}

          {/* SEO Panel (after upload) */}
          {showSeoPanel && uploadedMedia && (
            <div className="w-96 border-l border-stroke dark:border-dark-3 bg-white dark:bg-gray-dark p-6 overflow-y-auto">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                  <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-semibold text-dark dark:text-white">Yükleme Başarılı!</h3>
                  <p className="text-sm text-gray-500">SEO bilgilerini doldurun</p>
                </div>
              </div>

              {/* Preview */}
              <div className="relative aspect-video rounded-lg overflow-hidden mb-6 bg-gray-100 dark:bg-dark-3">
                {uploadedMedia.mimeType?.startsWith("video/") ? (
                  <video
                    src={uploadedMedia.url}
                    className="w-full h-full object-contain"
                    controls
                    preload="metadata"
                  />
                ) : (
                <Image
                  src={uploadedMedia.url}
                  alt={uploadedMedia.filename}
                  fill
                  className="object-contain"
                  unoptimized
                />
                )}
              </div>

              {/* SEO Form */}
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-dark dark:text-white mb-1">
                    Alt Text {!uploadedMedia?.mimeType?.startsWith("video/") && <span className="text-red-500">*</span>}
                  </label>
                  <input
                    type="text"
                    value={seoAlt}
                    onChange={(e) => setSeoAlt(e.target.value)}
                    placeholder={uploadedMedia?.mimeType?.startsWith("video/") ? "Video açıklaması (opsiyonel)..." : "Görseli tanımlayan metin..."}
                    className="w-full px-4 py-2.5 rounded-lg border border-stroke dark:border-dark-3 bg-white dark:bg-dark-2 text-dark dark:text-white focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-colors"
                    autoFocus
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    {uploadedMedia?.mimeType?.startsWith("video/") 
                      ? "Video açıklaması (opsiyonel)" 
                      : "SEO ve erişilebilirlik için zorunlu"}
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-dark dark:text-white mb-1">
                    Başlık
                  </label>
                  <input
                    type="text"
                    value={seoTitle}
                    onChange={(e) => setSeoTitle(e.target.value)}
                    placeholder="Görsel başlığı (opsiyonel)"
                    className="w-full px-4 py-2.5 rounded-lg border border-stroke dark:border-dark-3 bg-white dark:bg-dark-2 text-dark dark:text-white focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-dark dark:text-white mb-1">
                    Açıklama
                  </label>
                  <textarea
                    value={seoDescription}
                    onChange={(e) => setSeoDescription(e.target.value)}
                    placeholder="Detaylı açıklama (opsiyonel)"
                    rows={3}
                    className="w-full px-4 py-2.5 rounded-lg border border-stroke dark:border-dark-3 bg-white dark:bg-dark-2 text-dark dark:text-white focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-colors resize-none"
                  />
                </div>

                <div className="flex gap-3 pt-2">
                  <button
                    onClick={() => {
                      setShowSeoPanel(false);
                      setUploadedMedia(null);
                    }}
                    className="flex-1 px-4 py-2.5 text-sm border border-stroke dark:border-dark-3 rounded-lg hover:bg-gray-50 dark:hover:bg-dark-2 transition-colors"
                  >
                    İptal
                  </button>
                  <button
                    onClick={handleSaveSeo}
                    disabled={(!uploadedMedia?.mimeType?.startsWith("video/") && !seoAlt.trim()) || savingSeo}
                    className="flex-1 px-4 py-2.5 text-sm bg-primary text-white rounded-lg hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    {savingSeo ? "Kaydediliyor..." : "Kaydet"}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-stroke dark:border-dark-3 bg-gray-50 dark:bg-dark-2">
          <p className="text-sm text-gray-500">
            {media.length} medya
          </p>
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="px-5 py-2 text-sm border border-stroke dark:border-dark-3 rounded-lg hover:bg-gray-100 dark:hover:bg-dark-3 transition-colors"
            >
              İptal
            </button>
            <button
              onClick={handleUseMedia}
              disabled={!selectedMedia || (!selectedMedia.mimeType?.startsWith("video/") && !selectedMedia.alt)}
              className="px-5 py-2 text-sm bg-primary text-white rounded-lg hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              title={!selectedMedia?.mimeType?.startsWith("video/") && !selectedMedia?.alt ? "Alt text olmadan kullanılamaz" : ""}
            >
              Kullan
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
