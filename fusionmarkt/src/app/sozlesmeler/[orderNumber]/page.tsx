"use client";

import { useEffect, useState } from "react";
import { useParams, useSearchParams } from "next/navigation";
import { FileText, Loader2, AlertCircle, ChevronLeft, ChevronRight } from "lucide-react";
import Link from "next/link";

interface ContractData {
  orderNumber: string;
  acceptedAt: string;
  contracts: {
    termsAndConditions: {
      accepted: boolean;
      html: string | null;
    };
    distanceSalesContract: {
      accepted: boolean;
      html: string | null;
    };
    newsletter: boolean;
  };
}

export default function ContractViewPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const orderNumber = params.orderNumber as string;
  const contractType = searchParams.get("contract") || "terms";

  const [data, setData] = useState<ContractData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeContract, setActiveContract] = useState<"terms" | "distance">(
    contractType === "distance" ? "distance" : "terms"
  );

  // Get token from URL for secure access
  const token = searchParams.get("token");

  useEffect(() => {
    const fetchContracts = async () => {
      try {
        setLoading(true);
        // Include token in API request if available
        const tokenParam = token ? `?token=${token}` : "";
        const res = await fetch(`/api/orders/${orderNumber}/contracts${tokenParam}`);
        
        if (!res.ok) {
          const errData = await res.json();
          throw new Error(errData.error || "Sözleşmeler yüklenemedi");
        }

        const contractData = await res.json();
        setData(contractData);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Bir hata oluştu");
      } finally {
        setLoading(false);
      }
    };

    if (orderNumber) {
      fetchContracts();
    }
  }, [orderNumber, token]);

  const formatDate = (dateStr: string) => {
    return new Intl.DateTimeFormat("tr-TR", {
      day: "2-digit",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(new Date(dateStr));
  };

  const currentContract = activeContract === "terms" 
    ? data?.contracts.termsAndConditions 
    : data?.contracts.distanceSalesContract;

  const contractTitle = activeContract === "terms" 
    ? "Kullanıcı Sözleşmesi ve Şartlar" 
    : "Mesafeli Satış Sözleşmesi";

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 text-emerald-500 animate-spin mx-auto mb-4" />
          <p className="text-white/60">Sözleşmeler yükleniyor...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-[#111] rounded-2xl border border-white/10 p-8 text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h1 className="text-xl font-semibold text-white mb-2">Sözleşme Bulunamadı</h1>
          <p className="text-white/60 mb-6">{error}</p>
          <Link 
            href="/"
            className="inline-flex items-center gap-2 px-6 py-3 bg-emerald-500 text-white rounded-lg font-medium hover:bg-emerald-600 transition-colors"
          >
            Ana Sayfaya Dön
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pt-20 sm:pt-24 pb-4 sm:pb-8 px-3 sm:px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="bg-[#0f0f0f] rounded-t-2xl border border-white/10 border-b-0">
          <div className="p-4 sm:p-6 flex flex-row items-center justify-between gap-3 border-b border-white/10 bg-emerald-500/5">
            <div className="flex items-center gap-3 sm:gap-4">
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-emerald-500/15 flex items-center justify-center flex-shrink-0">
                <FileText className="w-5 h-5 sm:w-6 sm:h-6 text-emerald-500" />
              </div>
              <div className="min-w-0">
                <h1 className="text-base sm:text-lg font-semibold text-white truncate">{contractTitle}</h1>
                <p className="text-xs sm:text-sm text-white/50">Sipariş: {orderNumber}</p>
              </div>
            </div>
            <div className="flex items-center">
              <span className="inline-flex items-center gap-1 px-3 py-1 bg-emerald-500/15 text-emerald-400 rounded-full text-xs font-medium">
                ✓ Onaylandı
              </span>
            </div>
          </div>

          {/* Contract Type Selector */}
          <div className="p-3 sm:p-4 flex flex-col sm:flex-row gap-2 border-b border-white/10">
            <button
              onClick={() => setActiveContract("terms")}
              className={`flex-1 py-2.5 sm:py-3 px-3 sm:px-4 rounded-lg text-xs sm:text-sm font-medium transition-all ${
                activeContract === "terms"
                  ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                  : "bg-white/5 text-white/60 border border-white/10 hover:bg-white/10"
              }`}
            >
              Kullanıcı Sözleşmesi
            </button>
            <button
              onClick={() => setActiveContract("distance")}
              className={`flex-1 py-2.5 sm:py-3 px-3 sm:px-4 rounded-lg text-xs sm:text-sm font-medium transition-all ${
                activeContract === "distance"
                  ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                  : "bg-white/5 text-white/60 border border-white/10 hover:bg-white/10"
              }`}
            >
              Mesafeli Satış Sözleşmesi
            </button>
          </div>

          {/* Info Banner */}
          <div className="p-3 sm:p-4 bg-blue-500/10 border-b border-blue-500/20 flex items-start gap-2 sm:gap-3">
            <AlertCircle className="w-4 h-4 text-blue-400 flex-shrink-0 mt-0.5" />
            <p className="text-xs sm:text-sm text-blue-300">
              Bu sözleşme sipariş sırasında kabul edilmiş ve saklanmıştır. 
              Onay tarihi: <strong>{data?.acceptedAt ? formatDate(data.acceptedAt) : "-"}</strong>
            </p>
          </div>
        </div>

        {/* Contract Content */}
        <div className="bg-[#0f0f0f] border-x border-white/10 overflow-hidden">
          {currentContract?.html ? (
            <div 
              className="contract-content p-4 sm:p-6 text-white/80 text-sm sm:text-base leading-relaxed"
              dangerouslySetInnerHTML={{ __html: currentContract.html }}
            />
          ) : (
            <div className="p-8 sm:p-12 text-center">
              <FileText className="w-10 h-10 sm:w-12 sm:h-12 text-white/20 mx-auto mb-4" />
              <p className="text-white/40 text-sm sm:text-base">Sözleşme içeriği bulunamadı</p>
              <p className="text-white/30 text-xs sm:text-sm mt-2">
                Bu sipariş için sözleşme kaydedilmemiş olabilir.
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="bg-[#0f0f0f] rounded-b-2xl border border-white/10 border-t-0 p-4 sm:p-6 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <Link
            href="/"
            className="inline-flex items-center justify-center sm:justify-start gap-2 px-4 py-2 text-white/60 hover:text-white transition-colors order-2 sm:order-1"
          >
            <ChevronLeft className="w-4 h-4" />
            Ana Sayfa
          </Link>
          
          <div className="flex order-1 sm:order-2">
            {activeContract === "terms" ? (
              <button
                onClick={() => setActiveContract("distance")}
                className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-white/10 text-white rounded-lg hover:bg-white/20 transition-colors text-sm"
              >
                Mesafeli Satış Sözleşmesi
                <ChevronRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                onClick={() => setActiveContract("terms")}
                className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-white/10 text-white rounded-lg hover:bg-white/20 transition-colors text-sm"
              >
                <ChevronLeft className="w-4 h-4" />
                Kullanıcı Sözleşmesi
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Contract Content Styles */}
      <style jsx global>{`
        .contract-content h1,
        .contract-content h2,
        .contract-content h3,
        .contract-content h4 {
          color: #10b981;
          margin-top: 1.5rem;
          margin-bottom: 0.75rem;
          font-weight: 600;
        }
        .contract-content h1 {
          font-size: 1.25rem;
          text-align: center;
        }
        .contract-content h2 {
          font-size: 1rem;
          border-bottom: 2px solid #10b981;
          padding-bottom: 0.5rem;
        }
        .contract-content h3 {
          font-size: 0.9rem;
        }
        .contract-content p {
          margin-bottom: 0.75rem;
          line-height: 1.6;
        }
        .contract-content ul,
        .contract-content ol {
          margin-left: 1.5rem;
          margin-bottom: 0.75rem;
        }
        .contract-content li {
          margin-bottom: 0.25rem;
        }
        .contract-content table {
          width: 100%;
          border-collapse: collapse;
          margin: 1rem 0;
          font-size: 0.875rem;
        }
        .contract-content th,
        .contract-content td {
          border: 1px solid rgba(255,255,255,0.1);
          padding: 0.5rem;
          text-align: left;
        }
        .contract-content th {
          background-color: rgba(16,185,129,0.1);
          color: #10b981;
        }
        .contract-content strong {
          color: #ffffff;
        }
        .contract-content a {
          color: #10b981;
          text-decoration: underline;
        }
        @media (max-width: 640px) {
          .contract-content h1 {
            font-size: 1.1rem;
          }
          .contract-content h2 {
            font-size: 0.9rem;
          }
          .contract-content h3 {
            font-size: 0.85rem;
          }
          .contract-content {
            font-size: 0.8rem;
          }
          .contract-content table {
            display: block;
            overflow-x: auto;
            font-size: 0.75rem;
          }
        }
      `}</style>
    </div>
  );
}

