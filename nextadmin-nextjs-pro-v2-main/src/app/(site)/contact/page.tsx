import { Metadata } from "next";

export const metadata: Metadata = {
  title: "İletişim Formları",
};

const demoMessages = [
  { id: "1", name: "Ahmet Y.", email: "ahmet@example.com", subject: "Ürün Bilgisi", message: "POWERTECH hakkında bilgi istiyorum.", status: "unread", createdAt: "2024-12-11T10:30:00" },
  { id: "2", name: "Mehmet D.", email: "mehmet@example.com", subject: "Kargo", message: "Siparişim ne zaman gelir?", status: "read", createdAt: "2024-12-10T15:20:00" },
  { id: "3", name: "Ayşe K.", email: "ayse@example.com", subject: "İade", message: "Ürün iade etmek istiyorum.", status: "replied", createdAt: "2024-12-09T09:45:00" },
];

const statusConfig = {
  unread: { label: "Okunmadı", color: "bg-red-100 text-red-600 dark:bg-red-500/10" },
  read: { label: "Okundu", color: "bg-yellow-100 text-yellow-600 dark:bg-yellow-500/10" },
  replied: { label: "Yanıtlandı", color: "bg-green-100 text-green-600 dark:bg-green-500/10" },
};

export default function ContactPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-dark dark:text-white">İletişim Formları</h1>
          <p className="text-gray-500">Müşteri mesajlarını yönetin</p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-4">
        <div className="rounded-xl border border-stroke bg-white p-4 dark:border-dark-3 dark:bg-gray-dark">
          <p className="text-2xl font-bold text-dark dark:text-white">{demoMessages.length}</p>
          <p className="text-sm text-gray-500">Toplam</p>
        </div>
        <div className="rounded-xl border border-stroke bg-white p-4 dark:border-dark-3 dark:bg-gray-dark">
          <p className="text-2xl font-bold text-red-500">{demoMessages.filter(m => m.status === "unread").length}</p>
          <p className="text-sm text-gray-500">Okunmamış</p>
        </div>
        <div className="rounded-xl border border-stroke bg-white p-4 dark:border-dark-3 dark:bg-gray-dark">
          <p className="text-2xl font-bold text-yellow-500">{demoMessages.filter(m => m.status === "read").length}</p>
          <p className="text-sm text-gray-500">Okundu</p>
        </div>
        <div className="rounded-xl border border-stroke bg-white p-4 dark:border-dark-3 dark:bg-gray-dark">
          <p className="text-2xl font-bold text-green-500">{demoMessages.filter(m => m.status === "replied").length}</p>
          <p className="text-sm text-gray-500">Yanıtlandı</p>
        </div>
      </div>

      <div className="rounded-xl border border-stroke bg-white dark:border-dark-3 dark:bg-gray-dark">
        <div className="border-b border-stroke px-6 py-4 dark:border-dark-3">
          <h2 className="text-lg font-semibold text-dark dark:text-white">Mesajlar</h2>
        </div>
        <div className="divide-y divide-stroke dark:divide-dark-3">
          {demoMessages.map((msg) => (
            <div key={msg.id} className={`px-6 py-4 hover:bg-gray-50 dark:hover:bg-dark-2 cursor-pointer ${msg.status === "unread" ? "bg-primary/5" : ""}`}>
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <span className="font-medium text-primary">{msg.name.charAt(0)}</span>
                  </div>
                  <div>
                    <p className="font-medium text-dark dark:text-white">{msg.name}</p>
                    <p className="text-sm text-gray-500">{msg.email}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`inline-flex rounded-full px-2 py-1 text-xs font-medium ${statusConfig[msg.status as keyof typeof statusConfig].color}`}>
                    {statusConfig[msg.status as keyof typeof statusConfig].label}
                  </span>
                  <span className="text-sm text-gray-500">{new Date(msg.createdAt).toLocaleDateString("tr-TR")}</span>
                </div>
              </div>
              <p className="font-medium text-dark dark:text-white mb-1">{msg.subject}</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">{msg.message}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
