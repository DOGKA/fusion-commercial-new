"use client";

import { useState, ReactNode, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

// ============================================
// TYPES
// ============================================

export type TabKey = "content" | "media" | "style" | "settings";

export interface Tab {
  key: TabKey;
  label: string;
  icon?: ReactNode;
}

export interface EditorWithPreviewProps {
  // Meta
  title: string;
  subtitle?: string;
  backUrl: string;
  isNew?: boolean;
  
  // Tabs
  tabs?: Tab[];
  activeTab?: TabKey;
  onTabChange?: (tab: TabKey) => void;
  
  // Tab Content Renderers
  renderContentTab?: () => ReactNode;
  renderMediaTab?: () => ReactNode;
  renderStyleTab?: () => ReactNode;
  renderSettingsTab?: () => ReactNode;
  
  // Preview
  renderPreview: (viewMode: "web" | "mobile" | "wide") => ReactNode;
  showWidePreview?: boolean;
  
  // Actions
  onSave: () => Promise<void>;
  onDelete?: () => Promise<void>;
  
  // State
  isSaving?: boolean;
  isDeleting?: boolean;
  isDirty?: boolean;
  
  // Validation
  canSave?: boolean;
  saveLabel?: string;
}

// ============================================
// DEFAULT TABS
// ============================================

const DEFAULT_TABS: Tab[] = [
  { key: "content", label: "İçerik" },
  { key: "media", label: "Görseller" },
  { key: "style", label: "Stil" },
  { key: "settings", label: "Ayarlar" },
];

// ============================================
// ICONS
// ============================================

const BackIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
  </svg>
);

const SaveIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
  </svg>
);

const TrashIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
  </svg>
);

const MonitorIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
  </svg>
);

const PhoneIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
  </svg>
);

const WideIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" />
  </svg>
);

const ContentIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
  </svg>
);

const MediaIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
  </svg>
);

const StyleIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
  </svg>
);

const SettingsIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
  </svg>
);

const TAB_ICONS: Record<TabKey, ReactNode> = {
  content: <ContentIcon />,
  media: <MediaIcon />,
  style: <StyleIcon />,
  settings: <SettingsIcon />,
};

// ============================================
// MAIN COMPONENT
// ============================================

export default function EditorWithPreview({
  title,
  subtitle,
  backUrl,
  isNew = false,
  tabs = DEFAULT_TABS,
  activeTab: controlledActiveTab,
  onTabChange,
  renderContentTab,
  renderMediaTab,
  renderStyleTab,
  renderSettingsTab,
  renderPreview,
  showWidePreview = false,
  onSave,
  onDelete,
  isSaving = false,
  isDeleting = false,
  isDirty = false,
  canSave = true,
  saveLabel = "Kaydet",
}: EditorWithPreviewProps) {
  const router = useRouter();
  
  // State
  const [internalActiveTab, setInternalActiveTab] = useState<TabKey>("content");
  const [viewMode, setViewMode] = useState<"web" | "mobile" | "wide">("web");
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  
  // Controlled or uncontrolled tab
  const activeTab = controlledActiveTab ?? internalActiveTab;
  const handleTabChange = (tab: TabKey) => {
    if (onTabChange) {
      onTabChange(tab);
    } else {
      setInternalActiveTab(tab);
    }
  };

  // Warn before leaving with unsaved changes
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (isDirty) {
        e.preventDefault();
        e.returnValue = "";
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [isDirty]);

  // Handle save
  const handleSave = async () => {
    if (!canSave || isSaving) return;
    await onSave();
  };

  // Handle delete
  const handleDelete = async () => {
    if (!onDelete || isDeleting) return;
    await onDelete();
    setShowDeleteConfirm(false);
  };

  // Render tab content
  const renderTabContent = () => {
    switch (activeTab) {
      case "content":
        return renderContentTab?.() ?? (
          <div className="text-center text-gray-5 py-12">
            İçerik sekmesi için içerik tanımlanmadı
          </div>
        );
      case "media":
        return renderMediaTab?.() ?? (
          <div className="text-center text-gray-5 py-12">
            Görseller sekmesi için içerik tanımlanmadı
          </div>
        );
      case "style":
        return renderStyleTab?.() ?? (
          <div className="text-center text-gray-5 py-12">
            Stil sekmesi için içerik tanımlanmadı
          </div>
        );
      case "settings":
        return renderSettingsTab?.() ?? (
          <div className="text-center text-gray-5 py-12">
            Ayarlar sekmesi için içerik tanımlanmadı
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-100px)]">
      {/* ============================================
       * HEADER
       * ============================================ */}
      <div className="flex items-center justify-between p-4 bg-white dark:bg-gray-dark rounded-t-fm-md border-b border-stroke dark:border-dark-3">
        {/* Left - Back & Title */}
        <div className="flex items-center gap-4">
          <Link
            href={backUrl}
            className="p-2 rounded-lg hover:bg-gray-2 dark:hover:bg-dark-2 transition-colors"
            title="Geri"
          >
            <BackIcon />
          </Link>
          <div>
            <h1 className="text-lg font-semibold text-dark dark:text-white">
              {title}
            </h1>
            {subtitle && (
              <p className="text-sm text-gray-5">{subtitle}</p>
            )}
          </div>
          {isDirty && (
            <span className="px-2 py-0.5 text-xs bg-yellow-dark/10 text-yellow-dark rounded-full">
              Kaydedilmemiş değişiklikler
            </span>
          )}
        </div>

        {/* Right - Actions */}
        <div className="flex items-center gap-3">
          {/* Delete Button (only for edit, not new) */}
          {!isNew && onDelete && (
            <button
              onClick={() => setShowDeleteConfirm(true)}
              disabled={isDeleting}
              className="flex items-center gap-2 px-4 py-2 border border-red/30 text-red rounded-fm-sm hover:bg-red/5 transition-colors text-sm font-medium disabled:opacity-50"
            >
              <TrashIcon />
              Sil
            </button>
          )}

          {/* Save Button */}
          <button
            onClick={handleSave}
            disabled={!canSave || isSaving}
            className="flex items-center gap-2 px-5 py-2 bg-primary text-white rounded-fm-sm hover:bg-primary/90 transition-colors text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSaving ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                Kaydediliyor...
              </>
            ) : (
              <>
                <SaveIcon />
                {saveLabel}
              </>
            )}
          </button>
        </div>
      </div>

      {/* ============================================
       * MAIN CONTENT
       * ============================================ */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left Panel - Form (6 cols) */}
        <div className="w-1/2 flex flex-col bg-white dark:bg-gray-dark border-r border-stroke dark:border-dark-3 overflow-hidden">
          {/* Tab Bar */}
          <div className="flex border-b border-stroke dark:border-dark-3">
            {tabs.map((tab) => (
              <button
                key={tab.key}
                onClick={() => handleTabChange(tab.key)}
                className={`flex items-center gap-2 px-5 py-3 text-sm font-medium transition-colors border-b-2 -mb-px ${
                  activeTab === tab.key
                    ? "text-primary border-primary"
                    : "text-gray-5 border-transparent hover:text-dark dark:hover:text-white hover:border-gray-3 dark:hover:border-dark-3"
                }`}
              >
                {tab.icon || TAB_ICONS[tab.key]}
                {tab.label}
              </button>
            ))}
          </div>

          {/* Tab Content */}
          <div className="flex-1 overflow-y-auto custom-scrollbar p-6">
            {renderTabContent()}
          </div>
        </div>

        {/* Right Panel - Preview (6 cols) - Sticky */}
        <div className="w-1/2 flex flex-col bg-gray-1 dark:bg-dark-2 overflow-hidden sticky top-0 self-start max-h-screen">
          {/* Preview Header */}
          <div className="flex items-center justify-between p-4 bg-white dark:bg-gray-dark border-b border-stroke dark:border-dark-3">
            <h3 className="text-sm font-medium text-dark dark:text-white">
              Canlı Önizleme
            </h3>

            {/* View Toggle */}
            <div className="flex items-center gap-1 bg-gray-2 dark:bg-dark-2 rounded-lg p-1">
              <button
                onClick={() => setViewMode("web")}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs transition-colors ${
                  viewMode === "web"
                    ? "bg-white dark:bg-dark-3 text-dark dark:text-white shadow-sm"
                    : "text-gray-5 hover:text-dark dark:hover:text-white"
                }`}
              >
                <MonitorIcon />
                Web
              </button>
              <button
                onClick={() => setViewMode("mobile")}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs transition-colors ${
                  viewMode === "mobile"
                    ? "bg-white dark:bg-dark-3 text-dark dark:text-white shadow-sm"
                    : "text-gray-5 hover:text-dark dark:hover:text-white"
                }`}
              >
                <PhoneIcon />
                Mobil
              </button>
              {showWidePreview && (
                <button
                  onClick={() => setViewMode("wide")}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs transition-colors ${
                    viewMode === "wide"
                      ? "bg-white dark:bg-dark-3 text-dark dark:text-white shadow-sm"
                      : "text-gray-5 hover:text-dark dark:hover:text-white"
                  }`}
                >
                  <WideIcon />
                  Geniş
                </button>
              )}
            </div>
          </div>

          {/* Preview Content */}
          <div className="flex-1 flex items-center justify-center p-8 overflow-auto">
            {renderPreview(viewMode)}
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-sm bg-white dark:bg-gray-dark rounded-fm-md shadow-fm-modal p-6">
            <div className="text-center">
              <div className="w-14 h-14 mx-auto mb-4 rounded-full bg-red/10 flex items-center justify-center">
                <svg className="w-7 h-7 text-red" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-dark dark:text-white mb-2">
                Silmek istediğinizden emin misiniz?
              </h3>
              <p className="text-sm text-gray-5 mb-6">
                Bu işlem geri alınamaz. Tüm veriler kalıcı olarak silinecektir.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  disabled={isDeleting}
                  className="flex-1 px-4 py-2.5 border border-stroke dark:border-dark-3 rounded-fm-sm hover:bg-gray-1 dark:hover:bg-dark-2 transition-colors text-sm font-medium"
                >
                  İptal
                </button>
                <button
                  onClick={handleDelete}
                  disabled={isDeleting}
                  className="flex-1 px-4 py-2.5 bg-red text-white rounded-fm-sm hover:bg-red-dark transition-colors text-sm font-medium disabled:opacity-50"
                >
                  {isDeleting ? "Siliniyor..." : "Evet, Sil"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ============================================
// FORM FIELD COMPONENTS (Utility)
// ============================================

export interface FormFieldProps {
  label: string;
  required?: boolean;
  error?: string;
  hint?: string;
  children: ReactNode;
}

export function FormField({ label, required, error, hint, children }: FormFieldProps) {
  return (
    <div className="space-y-1.5">
      <label className="block text-sm font-medium text-dark dark:text-white">
        {label}
        {required && <span className="text-red ml-0.5">*</span>}
      </label>
      {children}
      {error && (
        <p className="text-xs text-red">{error}</p>
      )}
      {hint && !error && (
        <p className="text-xs text-gray-5">{hint}</p>
      )}
    </div>
  );
}

export interface FormSectionProps {
  title: string;
  description?: string;
  children: ReactNode;
}

export function FormSection({ title, description, children }: FormSectionProps) {
  return (
    <div className="space-y-4">
      <div>
        <h4 className="text-sm font-semibold text-dark dark:text-white">{title}</h4>
        {description && (
          <p className="text-xs text-gray-5 mt-0.5">{description}</p>
        )}
      </div>
      <div className="space-y-4">
        {children}
      </div>
    </div>
  );
}

export function FormDivider() {
  return <hr className="border-stroke dark:border-dark-3 my-6" />;
}
