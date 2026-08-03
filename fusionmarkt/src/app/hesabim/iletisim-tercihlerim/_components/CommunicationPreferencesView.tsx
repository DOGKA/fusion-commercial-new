"use client";

/**
 * İletişim Tercihlerim
 *
 * Kaydet butonu YOK: toggle'a dokunulduğu anda yerel durum değişir ve istek
 * gider; istek başarısız olursa durum geri alınır.
 *
 * İzinler üç durumludur (bkz. lib/consent.ts). `null` ("hiç sorulmadı") UI'da
 * KAPALI çizilir — kullanıcıya "reddettiniz" demiyoruz, izin olmadığı için
 * kapalı gösteriyoruz. Ayrım sunucuda korunur.
 */

import { useState } from "react";
import { Info } from "lucide-react";
import toast from "react-hot-toast";
import Link from "next/link";
import {
  AccountToggle,
  AccountSkeleton,
  AccountErrorState,
} from "@/app/hesabim/_components/shared";
import {
  useAccountProfile,
  type AccountPreferences,
} from "@/app/hesabim/_lib/useAccountProfile";

type PreferenceKey = "sms" | "email" | "call" | "personalization";

interface PreferenceRow {
  key: PreferenceKey;
  label: string;
  description: string;
}

const IYS_ROWS: PreferenceRow[] = [
  { key: "sms", label: "SMS", description: "Kampanya ve fırsat mesajları" },
  { key: "email", label: "E-posta", description: "Kampanya bültenleri ve duyurular" },
  {
    key: "call",
    label: "Telefon Araması",
    description: "Kampanya bilgilendirme aramaları",
  },
];

export default function CommunicationPreferencesView() {
  const { profile, loading, error, refetch, patch } = useAccountProfile();
  const [saving, setSaving] = useState<PreferenceKey | null>(null);

  if (loading && !profile) return <AccountSkeleton variant="form" />;
  if (error && !profile) {
    return <AccountErrorState message={error} onRetry={refetch} />;
  }
  if (!profile) return null;

  const prefs = profile.preferences;
  const neverAsked = (["sms", "email", "call", "personalization"] as PreferenceKey[]).some(
    (key) => prefs[key] === null
  );

  async function handleToggle(key: PreferenceKey, next: boolean) {
    const previous: AccountPreferences = { ...prefs };

    patch({ preferences: { ...prefs, [key]: next } });
    setSaving(key);

    try {
      const res = await fetch("/api/user/preferences", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ [key]: next }),
      });

      if (!res.ok) throw new Error("failed");

      const data = await res.json();
      if (data?.preferences) {
        patch({ preferences: data.preferences });
      }
    } catch {
      patch({ preferences: previous });
      toast.error("Tercihiniz kaydedilemedi, lütfen tekrar deneyin.");
    } finally {
      setSaving(null);
    }
  }

  function renderRow(row: PreferenceRow) {
    const labelId = `pref-label-${row.key}`;
    return (
      <div key={row.key} className="account-toggle-row">
        <div className="account-toggle-row__text">
          <span id={labelId} className="account-toggle-row__label">
            {row.label}
          </span>
          <span className="account-toggle-row__desc">{row.description}</span>
        </div>
        <AccountToggle
          checked={prefs[row.key] === true}
          onChange={(next) => void handleToggle(row.key, next)}
          labelledBy={labelId}
          disabled={saving === row.key}
        />
      </div>
    );
  }

  return (
    <div className="account-prefs">
      <p className="account-prefs__intro">
        Ticari Elektronik İleti Bilgilendirme Metni kapsamında kampanyalardan
        haberdar olmak için tercih ettiğiniz yöntemleri belirtebilirsiniz.
      </p>

      {neverAsked && (
        <div className="account-prefs__notice" role="status">
          <Info size={16} aria-hidden="true" />
          <span>
            İletişim tercihlerinizi henüz belirtmediniz. Aşağıdan seçim yaparak
            kampanyalarımızdan haberdar olabilirsiniz.
          </span>
        </div>
      )}

      <div className="account-toggle-group">{IYS_ROWS.map(renderRow)}</div>

      <p className="account-prefs__group-note">
        Aşağıdaki tercih İleti Yönetim Sistemi (İYS) kapsamında değildir.
      </p>

      <div className="account-toggle-group">
        <div className="account-toggle-row">
          <div className="account-toggle-row__text">
            <span id="pref-label-personalization" className="account-toggle-row__label">
              Kişiselleştirilmiş Deneyim
            </span>
            <span className="account-toggle-row__desc">
              Size özel öneriler sunabilmemiz için verilerinizin işlenmesine açık
              rıza.{" "}
              {/* `account-inline-link`: metin akışındaki bağlantılar mobildeki
                  44px dokunma tabanından muaf (plan 07 K-4), yoksa cümlenin
                  ortasında satır yüksekliği kadar boşluk açılıyor. */}
              <Link
                href="/acik-riza-metni"
                className="account-prefs__link account-inline-link"
              >
                Açık Rıza Metni
              </Link>
            </span>
          </div>
          <AccountToggle
            checked={prefs.personalization === true}
            onChange={(next) => void handleToggle("personalization", next)}
            labelledBy="pref-label-personalization"
            disabled={saving === "personalization"}
          />
        </div>
      </div>

      <p className="account-prefs__footnote">
        Ticari ileti izinleriyle ilgili ayrıntılar için{" "}
        <Link
          href="/ticari-elektronik-ileti-bilgilendirmesi"
          className="account-prefs__link account-inline-link"
        >
          Ticari Elektronik İleti Bilgilendirme Metni
        </Link>
        ni inceleyebilirsiniz.
      </p>
    </div>
  );
}
