"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import type { AddressFormValues, UserAddress } from "./types";

interface FieldError {
  error: string;
  field?: string;
}

/**
 * Adres listesi + yazma işlemleri.
 *
 * `initialAddresses` verildiğinde (SSR — F2-45) mount'taki `fetch` atlanıyor.
 * Yazma sonrası `reload()` yine çalışır — form kaydı / silme / varsayılan
 * değiştirme listeyi tazeler.
 *
 * Yazma işlemleri alan hatasını çağırana geri döndürüyor (`field`), böylece
 * form hatalı girdiyi ilgili alanın altında gösterebiliyor; eskiden tüm hatalar
 * `alert()` ile tek metne düşüyordu.
 */
export function useAddresses(initialAddresses?: UserAddress[] | null) {
  const [addresses, setAddresses] = useState<UserAddress[]>(initialAddresses ?? []);
  const [loading, setLoading] = useState(!initialAddresses);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const skipInitialFetch = useRef(Boolean(initialAddresses));

  /**
   * Yazma sonrası sunucudan gelen liste de tazelenmeli: Router Cache dinamik
   * segmentleri 30 sn tutuyor (next.config `staleTimes`), yoksa sayfadan çıkıp
   * geri dönen kullanıcı silinmiş adresi tekrar görürdü.
   */
  const invalidateServerData = useCallback(() => {
    router.refresh();
  }, [router]);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/user/addresses");
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        setError(body.error || "Adresleriniz alınamadı");
        return;
      }
      const data = await res.json();
      setAddresses(Array.isArray(data.addresses) ? data.addresses : []);
    } catch {
      setError("Bir hata oluştu. Lütfen tekrar deneyiniz.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (skipInitialFetch.current) {
      skipInitialFetch.current = false;
      return;
    }
    void load();
  }, [load]);

  const toBody = (values: AddressFormValues) => ({
    title: values.title,
    fullName: values.fullName,
    phone: values.phone,
    city: values.city,
    district: values.district,
    address: values.address,
    postalCode: values.postalCode,
    type: values.type,
    addressCategory: values.addressCategory || null,
    isDefault: values.isDefault,
    invoiceType: values.invoiceType,
    company: values.company,
    taxNumber: values.taxNumber,
    taxOffice: values.taxOffice,
  });

  const save = useCallback(
    async (values: AddressFormValues, id?: string): Promise<FieldError | null> => {
      try {
        const res = await fetch(
          id ? `/api/user/addresses/${id}` : "/api/user/addresses",
          {
            method: id ? "PUT" : "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(toBody(values)),
          }
        );
        const body = await res.json().catch(() => ({}));
        if (!res.ok) {
          return { error: body.error || "Adres kaydedilemedi", field: body.field };
        }
        await load();
        invalidateServerData();
        toast.success(id ? "Adres güncellendi" : "Adres eklendi");
        return null;
      } catch {
        return { error: "Adres kaydedilemedi. Lütfen tekrar deneyiniz." };
      }
    },
    [load, invalidateServerData]
  );

  const remove = useCallback(
    async (id: string): Promise<boolean> => {
      try {
        const res = await fetch(`/api/user/addresses/${id}`, { method: "DELETE" });
        if (!res.ok) {
          const body = await res.json().catch(() => ({}));
          toast.error(body.error || "Adres silinemedi");
          return false;
        }
        await load();
        invalidateServerData();
        toast.success("Adres silindi");
        return true;
      } catch {
        toast.error("Adres silinemedi. Lütfen tekrar deneyiniz.");
        return false;
      }
    },
    [load, invalidateServerData]
  );

  const setDefault = useCallback(
    async (id: string) => {
      try {
        const res = await fetch(`/api/user/addresses/${id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ isDefault: true }),
        });
        if (!res.ok) {
          const body = await res.json().catch(() => ({}));
          toast.error(body.error || "Varsayılan adres değiştirilemedi");
          return;
        }
        await load();
        invalidateServerData();
        toast.success("Varsayılan adres güncellendi");
      } catch {
        toast.error("Varsayılan adres değiştirilemedi.");
      }
    },
    [load, invalidateServerData]
  );

  return { addresses, loading, error, reload: load, save, remove, setDefault };
}
