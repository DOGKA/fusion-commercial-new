"use client";

/**
 * Adreslerim
 *
 * Plan 04 §3'ün uygulanmış hali. Eski görünümden farkları:
 *  - Teslimat / Fatura sekmeleri (`Address.type`; `BOTH` iki sekmede de görünür)
 *  - Yeni adres aksiyonu listenin doğal bir ızgara kartıdır
 *  - Form panelde açılıyor, `alert()`/`confirm()` yerine toast ve onay modalı var
 *  - İskelet ve hata + "Tekrar dene" durumu eklendi
 */

import { useMemo, useState } from "react";
import { Plus } from "lucide-react";
import {
  AccountConfirmDialog,
  AccountErrorState,
  AccountSkeleton,
  AccountTabBar,
} from "../../_components/shared";
import { useAddresses } from "../_lib/useAddresses";
import { matchesUsage, type UserAddress } from "../_lib/types";
import AddressCard from "./AddressCard";
import AddressFormSheet from "./AddressFormSheet";

type Tab = "SHIPPING" | "BILLING";

/** İki kolon 1024px'in altında tek kolona iner; 390px'te kart tam genişlik. */
const GRID = "grid grid-cols-1 lg:grid-cols-2 gap-4";

function AddAddressCard({ onClick }: { onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="account-btn group flex min-h-[84px] w-full items-center gap-3 rounded-xl border border-dashed border-border-hover bg-transparent p-3 text-left transition-colors hover:bg-glass-bg-hover lg:min-h-[220px] lg:flex-col lg:justify-center lg:text-center"
    >
      <span className="acc-chip-accent inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg transition-colors group-hover:bg-[color:var(--acc-accent-bg-hover)]">
        <Plus size={16} aria-hidden="true" />
      </span>
      <span className="min-w-0">
        <span className="block text-[13px] font-medium text-foreground">Adres ekle</span>
        <span className="mt-0.5 block text-[11px] leading-snug text-foreground-muted">
          Teslimat veya fatura adresi oluşturun
        </span>
      </span>
    </button>
  );
}

export default function AddressesView({
  initialAddresses,
  defaultFullName = "",
}: {
  /** Sunucuda çekilen liste (F2-45); yoksa istemci kendisi çeker. */
  initialAddresses?: UserAddress[] | null;
  /** Yeni adres formunda alıcı adının başlangıç değeri. */
  defaultFullName?: string;
}) {
  const { addresses, loading, error, reload, save, remove, setDefault } =
    useAddresses(initialAddresses);
  const [tab, setTab] = useState<Tab>("SHIPPING");
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<UserAddress | null>(null);
  const [pendingDelete, setPendingDelete] = useState<UserAddress | null>(null);
  const [deleting, setDeleting] = useState(false);
  // Form paneli `key` ile her açılışta yeniden kurulur; böylece bir önceki
  // düzenlemenin yarım kalmış değerleri taşınmaz. Aynı adres iki kez
  // düzenlendiğinde de yenilenmesi için sayaç kullanılıyor.
  const [formSeq, setFormSeq] = useState(0);

  const counts = useMemo(
    () => ({
      SHIPPING: addresses.filter((a) => matchesUsage(a, "SHIPPING")).length,
      BILLING: addresses.filter((a) => matchesUsage(a, "BILLING")).length,
    }),
    [addresses]
  );

  const visible = useMemo(
    () => addresses.filter((a) => matchesUsage(a, tab)),
    [addresses, tab]
  );

  const openNew = () => {
    setEditing(null);
    setFormSeq((n) => n + 1);
    setFormOpen(true);
  };

  const openEdit = (address: UserAddress) => {
    setEditing(address);
    setFormSeq((n) => n + 1);
    setFormOpen(true);
  };

  const confirmDelete = async () => {
    if (!pendingDelete) return;
    setDeleting(true);
    const ok = await remove(pendingDelete.id);
    setDeleting(false);
    if (ok) setPendingDelete(null);
  };

  return (
    <div>
      <div className="mb-3">
        <p className="min-w-0 text-[12px] text-foreground-muted">
          Adreslerinizde yaptığınız değişiklikler geçmiş siparişlerinizi etkilemez.
        </p>
      </div>

      {/* Sekme şeridi yükleme/hata durumunda da basılıyor: değerlendirmelerdeki
          referans davranış bu ve şeridin sonradan belirmesi sayfayı zıplatıyordu. */}
      <AccountTabBar
        ariaLabel="Adres listesi"
        value={tab}
        onChange={(value) => setTab(value as Tab)}
        items={[
          {
            value: "SHIPPING",
            label: "Teslimat",
            count: counts.SHIPPING,
            countLoading: loading,
          },
          {
            value: "BILLING",
            label: "Fatura",
            count: counts.BILLING,
            countLoading: loading,
          },
        ]}
      />

      {loading ? (
        // Her iskelet kendi sarmalayıcısını bastığı için ızgara hücresi olarak
        // ayrı ayrı yerleştiriliyor; tek bileşene count vermek hepsini tek hücreye
        // yığardı.
        <div className={GRID}>
          {Array.from({ length: 4 }).map((_, i) => (
            <AccountSkeleton key={i} variant="card" />
          ))}
        </div>
      ) : error ? (
        <AccountErrorState message={error} onRetry={reload} />
      ) : (
        <div className={GRID}>
          {visible.map((address) => (
            <AddressCard
              key={address.id}
              address={address}
              onEdit={openEdit}
              onSetDefault={setDefault}
            />
          ))}
          <AddAddressCard onClick={openNew} />
        </div>
      )}

      <AddressFormSheet
        key={`${editing?.id ?? "new"}-${formSeq}`}
        open={formOpen}
        address={editing}
        defaultFullName={defaultFullName}
        onClose={() => setFormOpen(false)}
        onSave={save}
        canDelete={addresses.length > 1}
        onRequestDelete={(address) => {
          setFormOpen(false);
          setPendingDelete(address);
        }}
      />

      <AccountConfirmDialog
        open={pendingDelete !== null}
        onClose={() => setPendingDelete(null)}
        onConfirm={confirmDelete}
        loading={deleting}
        tone="danger"
        title="Adresi sil"
        description={
          <>
            <strong>{pendingDelete?.title}</strong> adresi listenizden kaldırılacak. Bu
            adresle verdiğiniz geçmiş siparişler etkilenmez.
          </>
        }
        confirmLabel="Sil"
      />
    </div>
  );
}
