"use client";

interface PaymentSettingsProps {
  settings: {
    paymentIyzico: boolean;
    paymentBank: boolean;
    paymentCod: boolean;
  };
  onChange: (key: string, value: boolean) => void;
}

export default function PaymentSettings({ settings, onChange }: PaymentSettingsProps) {
  return (
    <div className="rounded-xl border border-stroke bg-white p-6 dark:border-dark-3 dark:bg-gray-dark">
      <h2 className="mb-6 text-lg font-semibold text-dark dark:text-white">Ödeme Yöntemleri</h2>
      <div className="space-y-4">
        <label className="flex items-center justify-between p-4 rounded-lg border border-stroke dark:border-dark-3 cursor-pointer hover:bg-gray-50 dark:hover:bg-dark-2 transition-colors">
          <div>
            <p className="font-medium">Kredi Kartı (Iyzico)</p>
            <p className="text-sm text-gray-500">Online kredi kartı ödemeleri</p>
          </div>
          <input
            type="checkbox"
            checked={settings.paymentIyzico}
            onChange={(e) => onChange("paymentIyzico", e.target.checked)}
            className="h-5 w-5 rounded accent-primary"
          />
        </label>
        <label className="flex items-center justify-between p-4 rounded-lg border border-stroke dark:border-dark-3 cursor-pointer hover:bg-gray-50 dark:hover:bg-dark-2 transition-colors">
          <div>
            <p className="font-medium">Havale/EFT</p>
            <p className="text-sm text-gray-500">Banka transferi ile ödeme</p>
          </div>
          <input
            type="checkbox"
            checked={settings.paymentBank}
            onChange={(e) => onChange("paymentBank", e.target.checked)}
            className="h-5 w-5 rounded accent-primary"
          />
        </label>
        <label className="flex items-center justify-between p-4 rounded-lg border border-stroke dark:border-dark-3 cursor-pointer hover:bg-gray-50 dark:hover:bg-dark-2 transition-colors">
          <div>
            <p className="font-medium">Kapıda Ödeme</p>
            <p className="text-sm text-gray-500">Teslimatta nakit veya kart</p>
          </div>
          <input
            type="checkbox"
            checked={settings.paymentCod}
            onChange={(e) => onChange("paymentCod", e.target.checked)}
            className="h-5 w-5 rounded accent-primary"
          />
        </label>
      </div>
    </div>
  );
}
