"use client";

import { useState, useEffect, useMemo } from "react";
import dynamic from "next/dynamic";

// React Quill New - React 19 uyumlu versiyon
const ReactQuill = dynamic(() => import("react-quill-new"), {
  ssr: false,
  loading: () => (
    <div className="h-64 flex items-center justify-center border border-stroke rounded-lg dark:border-dark-3">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
    </div>
  ),
});

import "react-quill-new/dist/quill.snow.css";

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  minHeight?: string;
}

export default function RichTextEditor({
  value,
  onChange,
  placeholder = "İçerik yazın...",
  minHeight = "300px",
}: RichTextEditorProps) {
  const [activeTab, setActiveTab] = useState<"text" | "html">("text");
  const [htmlCode, setHtmlCode] = useState(value);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Dışarıdan gelen value değiştiğinde senkronize et
  useEffect(() => {
    setHtmlCode(value);
  }, [value]);

  // Quill modülleri
  const modules = useMemo(
    () => ({
      toolbar: {
        container: [
          [{ header: [1, 2, 3, 4, 5, 6, false] }],
          [{ font: [] }],
          [{ size: ["small", false, "large", "huge"] }],
          ["bold", "italic", "underline", "strike"],
          [{ color: [] }, { background: [] }],
          [{ script: "sub" }, { script: "super" }],
          [{ list: "ordered" }, { list: "bullet" }],
          [{ indent: "-1" }, { indent: "+1" }],
          [{ direction: "rtl" }],
          [{ align: [] }],
          ["blockquote", "code-block"],
          ["link", "image", "video"],
          ["clean"],
        ],
      },
      clipboard: {
        matchVisual: false,
      },
    }),
    []
  );

  const formats = [
    "header",
    "font",
    "size",
    "bold",
    "italic",
    "underline",
    "strike",
    "color",
    "background",
    "script",
    "list",
    "indent",
    "direction",
    "align",
    "blockquote",
    "code-block",
    "link",
    "image",
    "video",
  ];

  // Tab değişiminde içerik senkronizasyonu
  const handleTabChange = (tab: "text" | "html") => {
    if (tab === "text" && activeTab === "html") {
      // HTML -> Text: HTML kodunu render et
      onChange(htmlCode);
    } else if (tab === "html" && activeTab === "text") {
      // Text -> HTML: Mevcut içeriği HTML olarak göster
      setHtmlCode(value);
    }
    setActiveTab(tab);
  };

  // Text editör değişimi
  const handleTextChange = (content: string) => {
    onChange(content);
    setHtmlCode(content);
  };

  // HTML textarea değişimi
  const handleHtmlChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setHtmlCode(e.target.value);
  };

  // HTML'den Text'e geçerken HTML'i uygula
  const applyHtml = () => {
    onChange(htmlCode);
    setActiveTab("text");
  };

  if (!mounted) {
    return (
      <div
        className="border border-stroke rounded-lg dark:border-dark-3"
        style={{ minHeight }}
      >
        <div className="h-64 flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="rich-text-editor">
      {/* Tab Başlıkları */}
      <div className="flex border-b border-stroke dark:border-dark-3 mb-0">
        <button
          type="button"
          onClick={() => handleTabChange("text")}
          className={`px-4 py-2.5 text-sm font-medium transition-colors flex items-center gap-2 ${
            activeTab === "text"
              ? "text-primary border-b-2 border-primary bg-primary/5"
              : "text-gray-500 hover:text-dark dark:hover:text-white"
          }`}
        >
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
            />
          </svg>
          Görsel Editör
        </button>
        <button
          type="button"
          onClick={() => handleTabChange("html")}
          className={`px-4 py-2.5 text-sm font-medium transition-colors flex items-center gap-2 ${
            activeTab === "html"
              ? "text-primary border-b-2 border-primary bg-primary/5"
              : "text-gray-500 hover:text-dark dark:hover:text-white"
          }`}
        >
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4"
            />
          </svg>
          HTML Kodu
        </button>
      </div>

      {/* İçerik Alanı */}
      <div
        className="border border-t-0 border-stroke rounded-b-lg dark:border-dark-3 overflow-hidden"
        style={{ minHeight }}
      >
        {activeTab === "text" ? (
          <div className="quill-wrapper">
            <ReactQuill
              theme="snow"
              value={value}
              onChange={handleTextChange}
              modules={modules}
              formats={formats}
              placeholder={placeholder}
              style={{ height: `calc(${minHeight} - 42px)` }}
            />
          </div>
        ) : (
          <div className="relative h-full">
            <textarea
              value={htmlCode}
              onChange={handleHtmlChange}
              placeholder="HTML kodunuzu buraya yapıştırın..."
              className="w-full h-full p-4 font-mono text-sm bg-gray-900 text-green-400 resize-none focus:outline-none"
              style={{ minHeight: `calc(${minHeight} - 50px)` }}
              spellCheck={false}
            />
            <div className="absolute bottom-0 left-0 right-0 p-3 bg-gray-800 border-t border-gray-700 flex items-center justify-between">
              <p className="text-xs text-gray-400">
                HTML kodunu yazın veya yapıştırın, ardından "Uygula" butonuna
                basın
              </p>
              <button
                type="button"
                onClick={applyHtml}
                className="px-4 py-1.5 bg-primary text-white text-sm rounded-lg hover:bg-primary/90 transition-colors"
              >
                Uygula ve Önizle
              </button>
            </div>
          </div>
        )}
      </div>

      {/* HTML Önizleme (HTML modundayken) */}
      {activeTab === "html" && htmlCode && (
        <div className="mt-4">
          <div className="flex items-center gap-2 mb-2">
            <svg
              className="w-4 h-4 text-gray-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
              />
            </svg>
            <span className="text-sm font-medium text-gray-500">
              HTML Önizleme
            </span>
          </div>
          <div
            className="p-4 border border-stroke rounded-lg bg-white dark:bg-dark-2 dark:border-dark-3 prose prose-sm max-w-none dark:prose-invert overflow-auto"
            style={{ maxHeight: "300px" }}
            dangerouslySetInnerHTML={{ __html: htmlCode }}
          />
        </div>
      )}

      {/* Quill Stil Düzeltmeleri */}
      <style jsx global>{`
        .quill-wrapper .ql-container {
          font-family: inherit;
          font-size: 14px;
        }
        .quill-wrapper .ql-editor {
          min-height: 200px;
          padding: 16px;
        }
        .quill-wrapper .ql-editor.ql-blank::before {
          font-style: normal;
          color: #9ca3af;
        }
        .quill-wrapper .ql-toolbar {
          border-top: none !important;
          border-left: none !important;
          border-right: none !important;
          border-bottom: 1px solid #e5e7eb !important;
          background: #f9fafb;
        }
        .dark .quill-wrapper .ql-toolbar {
          background: #1f2937;
          border-color: #374151 !important;
        }
        .dark .quill-wrapper .ql-toolbar button {
          color: #9ca3af;
        }
        .dark .quill-wrapper .ql-toolbar button:hover {
          color: #fff;
        }
        .dark .quill-wrapper .ql-toolbar .ql-stroke {
          stroke: #9ca3af;
        }
        .dark .quill-wrapper .ql-toolbar .ql-fill {
          fill: #9ca3af;
        }
        .dark .quill-wrapper .ql-toolbar button:hover .ql-stroke {
          stroke: #fff;
        }
        .dark .quill-wrapper .ql-toolbar button:hover .ql-fill {
          fill: #fff;
        }
        .dark .quill-wrapper .ql-container {
          border-color: #374151 !important;
          background: #111827;
        }
        .dark .quill-wrapper .ql-editor {
          color: #e5e7eb;
        }
        .quill-wrapper .ql-container {
          border: none !important;
        }
        .quill-wrapper .ql-toolbar.ql-snow {
          border-radius: 0;
        }
        .quill-wrapper .ql-picker-label {
          color: #374151;
        }
        .dark .quill-wrapper .ql-picker-label {
          color: #9ca3af;
        }
        .quill-wrapper .ql-picker-options {
          background: #fff;
          border: 1px solid #e5e7eb;
        }
        .dark .quill-wrapper .ql-picker-options {
          background: #1f2937;
          border-color: #374151;
        }
        .dark .quill-wrapper .ql-picker-item {
          color: #e5e7eb;
        }
      `}</style>
    </div>
  );
}
