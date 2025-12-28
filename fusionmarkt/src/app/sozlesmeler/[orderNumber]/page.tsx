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

  useEffect(() => {
    const fetchContracts = async () => {
      try {
        setLoading(true);
        const res = await fetch(`/api/orders/${orderNumber}/contracts`);
        
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
  }, [orderNumber]);

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
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 text-emerald-500 animate-spin mx-auto mb-4" />
          <p className="text-white/60">Sözleşmeler yükleniyor...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center p-4">
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
    <div className="min-h-screen bg-[#0a0a0a] py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="bg-[#0f0f0f] rounded-t-2xl border border-white/10 border-b-0">
          <div className="p-6 flex items-center justify-between border-b border-white/10 bg-emerald-500/5">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-emerald-500/15 flex items-center justify-center">
                <FileText className="w-6 h-6 text-emerald-500" />
              </div>
              <div>
                <h1 className="text-lg font-semibold text-white">{contractTitle}</h1>
                <p className="text-sm text-white/50">Sipariş: {orderNumber}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1 px-3 py-1 bg-emerald-500/15 text-emerald-400 rounded-full text-xs font-medium">
                ✓ Onaylandı
              </span>
            </div>
          </div>

          {/* Contract Type Selector */}
          <div className="p-4 flex gap-2 border-b border-white/10">
            <button
              onClick={() => setActiveContract("terms")}
              className={`flex-1 py-3 px-4 rounded-lg text-sm font-medium transition-all ${
                activeContract === "terms"
                  ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                  : "bg-white/5 text-white/60 border border-white/10 hover:bg-white/10"
              }`}
            >
              Kullanıcı Sözleşmesi
            </button>
            <button
              onClick={() => setActiveContract("distance")}
              className={`flex-1 py-3 px-4 rounded-lg text-sm font-medium transition-all ${
                activeContract === "distance"
                  ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                  : "bg-white/5 text-white/60 border border-white/10 hover:bg-white/10"
              }`}
            >
              Mesafeli Satış Sözleşmesi
            </button>
          </div>

          {/* Info Banner */}
          <div className="p-4 bg-blue-500/10 border-b border-blue-500/20 flex items-start gap-3">
            <AlertCircle className="w-4 h-4 text-blue-400 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-blue-300">
              Bu sözleşme sipariş sırasında kabul edilmiş ve saklanmıştır. 
              Onay tarihi: <strong>{data?.acceptedAt ? formatDate(data.acceptedAt) : "-"}</strong>
            </p>
          </div>
        </div>

        {/* Contract Content */}
        <div className="bg-[#0f0f0f] border-x border-white/10 overflow-hidden">
          {currentContract?.html ? (
            <div 
              className="contract-content"
              dangerouslySetInnerHTML={{ __html: currentContract.html }}
            />
          ) : (
            <div className="p-12 text-center">
              <FileText className="w-12 h-12 text-white/20 mx-auto mb-4" />
              <p className="text-white/40">Sözleşme içeriği bulunamadı</p>
              <p className="text-white/30 text-sm mt-2">
                Bu sipariş için sözleşme kaydedilmemiş olabilir.
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="bg-[#0f0f0f] rounded-b-2xl border border-white/10 border-t-0 p-6 flex items-center justify-between">
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-4 py-2 text-white/60 hover:text-white transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
            Ana Sayfa
          </Link>
          
          <div className="flex gap-3">
            {activeContract === "terms" ? (
              <button
                onClick={() => setActiveContract("distance")}
                className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 text-white rounded-lg hover:bg-white/20 transition-colors"
              >
                Mesafeli Satış Sözleşmesi
                <ChevronRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                onClick={() => setActiveContract("terms")}
                className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 text-white rounded-lg hover:bg-white/20 transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
                Kullanıcı Sözleşmesi
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

