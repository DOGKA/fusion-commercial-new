"use client";

import { useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Loader2, Shield } from "lucide-react";

/**
 * 3D Secure Verification Page
 * 
 * Bu sayfa iyzico'dan dönen 3D Secure HTML formunu gösterir.
 * Form otomatik olarak bankaya yönlendirir.
 */
export default function ThreeDSecurePage() {
  const searchParams = useSearchParams();
  const containerRef = useRef<HTMLDivElement>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // sessionStorage'dan HTML content al
    const htmlContent = sessionStorage.getItem("iyzico3DSHtml");
    
    if (!htmlContent) {
      setError("3D Secure doğrulama bilgisi bulunamadı");
      setLoading(false);
      return;
    }

    // HTML'i container'a ekle
    if (containerRef.current) {
      containerRef.current.innerHTML = htmlContent;
      
      // Form'u bul ve otomatik gönder
      const form = containerRef.current.querySelector("form");
      if (form) {
        // Kısa bir gecikme sonrası formu gönder
        setTimeout(() => {
          form.submit();
        }, 100);
      } else {
        // Script varsa çalıştır
        const scripts = containerRef.current.querySelectorAll("script");
        scripts.forEach((script) => {
          const newScript = document.createElement("script");
          if (script.src) {
            newScript.src = script.src;
          } else {
            newScript.textContent = script.textContent;
          }
          document.body.appendChild(newScript);
        });
      }
      
      setLoading(false);
    }

    // Cleanup
    return () => {
      sessionStorage.removeItem("iyzico3DSHtml");
    };
  }, []);

  if (error) {
    return (
      <div className="min-h-screen bg-[#050505] flex items-center justify-center p-4">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-red-500/10 flex items-center justify-center">
            <Shield className="w-8 h-8 text-red-500" />
          </div>
          <h1 className="text-xl font-bold text-white mb-2">3D Secure Hatası</h1>
          <p className="text-white/60">{error}</p>
          <a
            href="/checkout/payment"
            className="inline-block mt-6 px-6 py-3 bg-emerald-500 text-white font-semibold rounded-xl hover:bg-emerald-600 transition-colors"
          >
            Ödemeye Geri Dön
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#050505]">
      {loading && (
        <div className="fixed inset-0 bg-[#050505] flex items-center justify-center z-50">
          <div className="text-center">
            <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-emerald-500/10 flex items-center justify-center">
              <Shield className="w-8 h-8 text-emerald-500" />
            </div>
            <h1 className="text-xl font-bold text-white mb-2">3D Secure Doğrulama</h1>
            <p className="text-white/60 mb-4">Bankanıza yönlendiriliyorsunuz...</p>
            <Loader2 className="w-6 h-6 text-emerald-500 animate-spin mx-auto" />
          </div>
        </div>
      )}
      
      {/* iyzico HTML içeriği buraya eklenir */}
      <div 
        ref={containerRef} 
        className="w-full min-h-screen"
        style={{ display: loading ? "none" : "block" }}
      />
    </div>
  );
}

