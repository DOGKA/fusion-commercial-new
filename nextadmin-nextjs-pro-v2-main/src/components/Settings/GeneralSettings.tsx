"use client";

interface GeneralSettingsProps {
  settings: {
    siteName: string;
    siteUrl: string;
    contactEmail: string;
    phone: string;
    address: string;
    currency: string;
    timezone: string;
  };
  onChange: (key: string, value: string) => void;
}

export default function GeneralSettings({ settings, onChange }: GeneralSettingsProps) {
  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
      <div className="rounded-xl border border-stroke bg-white p-6 dark:border-dark-3 dark:bg-gray-dark">
        <h2 className="mb-6 text-lg font-semibold text-dark dark:text-white">Site Bilgileri</h2>
        <div className="space-y-4">
          <div>
            <label className="mb-2 block text-sm font-medium">Site Adı</label>
            <input
              type="text"
              value={settings.siteName}
              onChange={(e) => onChange("siteName", e.target.value)}
              className="w-full rounded-lg border border-stroke bg-transparent px-4 py-3 dark:border-dark-3"
            />
          </div>
          <div>
            <label className="mb-2 block text-sm font-medium">Site URL</label>
            <input
              type="text"
              value={settings.siteUrl}
              onChange={(e) => onChange("siteUrl", e.target.value)}
              className="w-full rounded-lg border border-stroke bg-transparent px-4 py-3 dark:border-dark-3"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-2 block text-sm font-medium">Para Birimi</label>
              <select
                value={settings.currency}
                onChange={(e) => onChange("currency", e.target.value)}
                className="w-full rounded-lg border border-stroke bg-transparent px-4 py-3 dark:border-dark-3"
              >
                <option value="TRY">Türk Lirası (₺)</option>
                <option value="USD">US Dollar ($)</option>
                <option value="EUR">Euro (€)</option>
              </select>
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium">Zaman Dilimi</label>
              <select
                value={settings.timezone}
                onChange={(e) => onChange("timezone", e.target.value)}
                className="w-full rounded-lg border border-stroke bg-transparent px-4 py-3 dark:border-dark-3"
              >
                <option value="Europe/Istanbul">İstanbul</option>
                <option value="UTC">UTC</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      <div className="rounded-xl border border-stroke bg-white p-6 dark:border-dark-3 dark:bg-gray-dark">
        <h2 className="mb-6 text-lg font-semibold text-dark dark:text-white">İletişim Bilgileri</h2>
        <div className="space-y-4">
          <div>
            <label className="mb-2 block text-sm font-medium">E-posta</label>
            <input
              type="email"
              value={settings.contactEmail}
              onChange={(e) => onChange("contactEmail", e.target.value)}
              className="w-full rounded-lg border border-stroke bg-transparent px-4 py-3 dark:border-dark-3"
            />
          </div>
          <div>
            <label className="mb-2 block text-sm font-medium">Telefon</label>
            <input
              type="text"
              value={settings.phone}
              onChange={(e) => onChange("phone", e.target.value)}
              className="w-full rounded-lg border border-stroke bg-transparent px-4 py-3 dark:border-dark-3"
            />
          </div>
          <div>
            <label className="mb-2 block text-sm font-medium">Adres</label>
            <textarea
              rows={2}
              value={settings.address}
              onChange={(e) => onChange("address", e.target.value)}
              className="w-full rounded-lg border border-stroke bg-transparent px-4 py-3 dark:border-dark-3"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
