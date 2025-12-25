import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Mail Takip",
};

const demoEmails = [
  { id: "1", to: "ahmet@example.com", subject: "Siparişiniz Kargoya Verildi", type: "order", status: "delivered", openedAt: "2024-12-11T11:30:00", sentAt: "2024-12-11T10:00:00" },
  { id: "2", to: "mehmet@example.com", subject: "Sepetinizi Unutmayın!", type: "abandoned", status: "opened", openedAt: "2024-12-11T09:15:00", sentAt: "2024-12-11T08:00:00" },
  { id: "3", to: "ayse@example.com", subject: "Hoş Geldiniz!", type: "welcome", status: "delivered", openedAt: null, sentAt: "2024-12-10T14:30:00" },
  { id: "4", to: "ali@example.com", subject: "Siparişiniz Onaylandı", type: "order", status: "opened", openedAt: "2024-12-10T10:45:00", sentAt: "2024-12-10T10:00:00" },
  { id: "5", to: "zeynep@example.com", subject: "%20 İndirim Kuponu", type: "marketing", status: "bounced", openedAt: null, sentAt: "2024-12-09T16:00:00" },
];

const typeConfig = {
  order: { label: "Sipariş", color: "bg-blue-100 text-blue-600 dark:bg-blue-500/10" },
  abandoned: { label: "Terk Edilmiş Sepet", color: "bg-yellow-100 text-yellow-600 dark:bg-yellow-500/10" },
  welcome: { label: "Hoş Geldin", color: "bg-green-100 text-green-600 dark:bg-green-500/10" },
  marketing: { label: "Pazarlama", color: "bg-purple-100 text-purple-600 dark:bg-purple-500/10" },
};

const statusConfig = {
  delivered: { label: "Teslim Edildi", color: "text-green-500" },
  opened: { label: "Açıldı", color: "text-blue-500" },
  bounced: { label: "Geri Döndü", color: "text-red-500" },
  pending: { label: "Beklemede", color: "text-yellow-500" },
};

export default function MailTrackPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-dark dark:text-white">Mail Takip</h1>
        <p className="text-gray-500">Gönderilen e-postaları takip edin</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-5">
        <div className="rounded-xl border border-stroke bg-white p-4 dark:border-dark-3 dark:bg-gray-dark">
          <p className="text-2xl font-bold text-dark dark:text-white">{demoEmails.length}</p>
          <p className="text-sm text-gray-500">Toplam</p>
        </div>
        <div className="rounded-xl border border-stroke bg-white p-4 dark:border-dark-3 dark:bg-gray-dark">
          <p className="text-2xl font-bold text-green-500">{demoEmails.filter(e => e.status === "delivered").length}</p>
          <p className="text-sm text-gray-500">Teslim</p>
        </div>
        <div className="rounded-xl border border-stroke bg-white p-4 dark:border-dark-3 dark:bg-gray-dark">
          <p className="text-2xl font-bold text-blue-500">{demoEmails.filter(e => e.status === "opened").length}</p>
          <p className="text-sm text-gray-500">Açıldı</p>
        </div>
        <div className="rounded-xl border border-stroke bg-white p-4 dark:border-dark-3 dark:bg-gray-dark">
          <p className="text-2xl font-bold text-red-500">{demoEmails.filter(e => e.status === "bounced").length}</p>
          <p className="text-sm text-gray-500">Geri Döndü</p>
        </div>
        <div className="rounded-xl border border-stroke bg-white p-4 dark:border-dark-3 dark:bg-gray-dark">
          <p className="text-2xl font-bold text-primary">%{Math.round((demoEmails.filter(e => e.openedAt).length / demoEmails.length) * 100)}</p>
          <p className="text-sm text-gray-500">Açılma Oranı</p>
        </div>
      </div>

      {/* Email Table */}
      <div className="rounded-xl border border-stroke bg-white dark:border-dark-3 dark:bg-gray-dark">
        <div className="border-b border-stroke px-6 py-4 dark:border-dark-3">
          <h2 className="text-lg font-semibold text-dark dark:text-white">Gönderilen E-postalar</h2>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-stroke dark:border-dark-3">
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-500">Alıcı</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-500">Konu</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-500">Tip</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-500">Durum</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-500">Gönderim</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-500">Açılma</th>
              </tr>
            </thead>
            <tbody>
              {demoEmails.map((email) => (
                <tr key={email.id} className="border-b border-stroke last:border-0 dark:border-dark-3">
                  <td className="px-6 py-4">
                    <span className="text-dark dark:text-white">{email.to}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-gray-600 dark:text-gray-400">{email.subject}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex rounded-full px-2 py-1 text-xs font-medium ${typeConfig[email.type as keyof typeof typeConfig].color}`}>
                      {typeConfig[email.type as keyof typeof typeConfig].label}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`font-medium ${statusConfig[email.status as keyof typeof statusConfig].color}`}>
                      {statusConfig[email.status as keyof typeof statusConfig].label}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm text-gray-500">
                      {new Date(email.sentAt).toLocaleDateString("tr-TR", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" })}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    {email.openedAt ? (
                      <span className="text-sm text-gray-500">
                        {new Date(email.openedAt).toLocaleDateString("tr-TR", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" })}
                      </span>
                    ) : (
                      <span className="text-sm text-gray-400">-</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
