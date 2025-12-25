"use client";

interface EmailSettingsProps {
  settings: {
    smtpHost: string;
    smtpPort: string;
    smtpUser: string;
    smtpPass: string;
  };
  onChange: (key: string, value: string) => void;
}

export default function EmailSettings({ settings, onChange }: EmailSettingsProps) {
  return (
    <div className="rounded-xl border border-stroke bg-white p-6 dark:border-dark-3 dark:bg-gray-dark">
      <h2 className="mb-6 text-lg font-semibold text-dark dark:text-white">SMTP Ayarları</h2>
      <div className="grid grid-cols-2 gap-4 max-w-2xl">
        <div>
          <label className="mb-2 block text-sm font-medium">SMTP Host</label>
          <input
            type="text"
            value={settings.smtpHost}
            onChange={(e) => onChange("smtpHost", e.target.value)}
            className="w-full rounded-lg border border-stroke bg-transparent px-4 py-3 dark:border-dark-3"
          />
        </div>
        <div>
          <label className="mb-2 block text-sm font-medium">SMTP Port</label>
          <input
            type="text"
            value={settings.smtpPort}
            onChange={(e) => onChange("smtpPort", e.target.value)}
            className="w-full rounded-lg border border-stroke bg-transparent px-4 py-3 dark:border-dark-3"
          />
        </div>
        <div>
          <label className="mb-2 block text-sm font-medium">Kullanıcı Adı</label>
          <input
            type="text"
            value={settings.smtpUser}
            onChange={(e) => onChange("smtpUser", e.target.value)}
            className="w-full rounded-lg border border-stroke bg-transparent px-4 py-3 dark:border-dark-3"
          />
        </div>
        <div>
          <label className="mb-2 block text-sm font-medium">Şifre</label>
          <input
            type="password"
            value={settings.smtpPass}
            onChange={(e) => onChange("smtpPass", e.target.value)}
            className="w-full rounded-lg border border-stroke bg-transparent px-4 py-3 dark:border-dark-3"
          />
        </div>
      </div>
      <button className="mt-4 px-4 py-2 rounded bg-gray-100 text-sm dark:bg-dark-2 hover:bg-gray-200 dark:hover:bg-dark-3 transition-colors">
        Test E-postası Gönder
      </button>
    </div>
  );
}
