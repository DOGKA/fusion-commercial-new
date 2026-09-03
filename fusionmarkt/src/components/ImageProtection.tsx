"use client";

import { useEffect } from "react";

/**
 * Görsel kopyalamayı zorlaştıran global engeller: sağ tık menüsü, sürükle-bırak
 * ve geliştirici araçlarını açan klavye kısayolları.
 *
 * Bunların hiçbiri kesin koruma değil — tarayıcı menüsünden DevTools yine
 * açılabiliyor ve görsel adresi doğrudan istenebiliyor. Amaç, ürün fotoğrafını
 * refleks olarak "farklı kaydet" ile alan ziyaretçiyi durdurmak.
 *
 * Form alanları bilinçli olarak muaf: checkout ve arama girdilerinde sağ tık
 * menüsü kapanırsa yapıştırma ve yazım denetimi de gider.
 */

// contenteditable="false" düğümler düzenlenebilir sayılmamalı
const EDITABLE_SELECTOR =
  "input, textarea, select, [contenteditable]:not([contenteditable='false'])";

const DEVTOOLS_KEYS = ["i", "j", "c"];

function isEditableTarget(target: EventTarget | null): boolean {
  return target instanceof Element && target.closest(EDITABLE_SELECTOR) !== null;
}

export default function ImageProtection() {
  useEffect(() => {
    const handleContextMenu = (event: MouseEvent) => {
      if (isEditableTarget(event.target)) return;
      event.preventDefault();
    };

    const handleDragStart = (event: DragEvent) => {
      if (
        event.target instanceof Element &&
        event.target.closest("img, picture, video")
      ) {
        event.preventDefault();
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      const key = event.key.toLowerCase();

      if (event.key === "F12") {
        event.preventDefault();
        return;
      }

      // Ctrl/Cmd + Shift + I/J/C — inceleme, konsol, öğe seçici
      if (
        (event.ctrlKey || event.metaKey) &&
        event.shiftKey &&
        DEVTOOLS_KEYS.includes(key)
      ) {
        event.preventDefault();
        return;
      }

      // macOS: Cmd + Option + I/J/C ve Cmd + Option + U (kaynağı görüntüle)
      if (event.metaKey && event.altKey && [...DEVTOOLS_KEYS, "u"].includes(key)) {
        event.preventDefault();
        return;
      }

      // Ctrl + U — kaynağı görüntüle. Düzenlenebilir alanlarda altı çizili
      // biçimlendirme kısayolu olduğu için orada dokunulmuyor.
      if (
        event.ctrlKey &&
        !event.shiftKey &&
        !event.altKey &&
        key === "u" &&
        !isEditableTarget(event.target)
      ) {
        event.preventDefault();
      }
    };

    document.addEventListener("contextmenu", handleContextMenu);
    document.addEventListener("dragstart", handleDragStart);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("contextmenu", handleContextMenu);
      document.removeEventListener("dragstart", handleDragStart);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  return null;
}
