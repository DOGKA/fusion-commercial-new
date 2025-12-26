"use client";

import { useState } from "react";

const SnippetTypeIcon = ({ type, className = "w-4 h-4" }: { type: string; className?: string }) => {
  const icons: Record<string, JSX.Element> = {
    all: <svg className={className} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" /><polyline points="14 2 14 8 20 8" /><line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" /><line x1="10" y1="9" x2="8" y2="9" /></svg>,
    html: <svg className={className} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><polyline points="16 18 22 12 16 6" /><polyline points="8 6 2 12 8 18" /></svg>,
    css: <svg className={className} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="13.5" cy="6.5" r="3.5" /><path d="M3 13.5a3.5 3.5 0 1 0 7 0 3.5 3.5 0 1 0-7 0" /><path d="M14 17.5a3.5 3.5 0 1 0 7 0 3.5 3.5 0 1 0-7 0" /></svg>,
    javascript: <svg className={className} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M4 14a1 1 0 0 1-.78-1.63l9.9-10.2a.5.5 0 0 1 .86.46l-1.92 6.02A1 1 0 0 0 13 10h7a1 1 0 0 1 .78 1.63l-9.9 10.2a.5.5 0 0 1-.86-.46l1.92-6.02A1 1 0 0 0 11 14z" /></svg>,
    php: <svg className={className} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="m18 16 4-4-4-4" /><path d="m6 8-4 4 4 4" /><path d="m14.5 4-5 16" /></svg>,
    text: <svg className={className} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" /><polyline points="14 2 14 8 20 8" /></svg>,
    universal: <svg className={className} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" /><line x1="2" y1="12" x2="22" y2="12" /><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" /></svg>,
  };
  return icons[type] || icons.all;
};

const snippetTypes = [
  { id: "all", label: "Tümü", count: 12 },
  { id: "html", label: "HTML", count: 3, color: "#E34F26" },
  { id: "css", label: "CSS", count: 4, color: "#1572B6" },
  { id: "javascript", label: "JavaScript", count: 2, color: "#F7DF1E" },
  { id: "php", label: "PHP", count: 1, color: "#777BB4" },
  { id: "text", label: "Text", count: 1, color: "#6B7280" },
  { id: "universal", label: "Universal", count: 1, color: "#10B981" },
];

const demoSnippets = [
  {
    id: "1",
    name: "Google Analytics 4",
    type: "javascript",
    location: "header",
    status: "active",
    priority: 10,
    code: `<!-- Google tag (gtag.js) -->
<script async src="https://www.googletagmanager.com/gtag/js?id=G-XXXXXXXX"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'G-XXXXXXXX');
</script>`,
    description: "Google Analytics 4 izleme kodu",
    lastModified: "2024-12-10",
  },
  {
    id: "2",
    name: "Facebook Pixel",
    type: "javascript",
    location: "header",
    status: "active",
    priority: 10,
    code: `<!-- Meta Pixel Code -->
<script>
!function(f,b,e,v,n,t,s)...
</script>`,
    description: "Facebook/Meta piksel kodu",
    lastModified: "2024-12-08",
  },
  {
    id: "3",
    name: "Custom Header Styles",
    type: "css",
    location: "header",
    status: "active",
    priority: 5,
    code: `.custom-header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); }`,
    description: "Özel header stilleri",
    lastModified: "2024-12-05",
  },
  {
    id: "4",
    name: "Announcement Bar",
    type: "html",
    location: "body_start",
    status: "inactive",
    priority: 1,
    code: `<div class="announcement-bar">🎉 Yeni yıl indirimi başladı! %20 indirim için YILSONU kodu</div>`,
    description: "Üst duyuru çubuğu",
    lastModified: "2024-12-01",
  },
  {
    id: "5",
    name: "WhatsApp Chat Widget",
    type: "html",
    location: "footer",
    status: "active",
    priority: 20,
    code: `<a href="https://wa.me/905551234567" class="whatsapp-float">WhatsApp</a>`,
    description: "WhatsApp canlı destek butonu",
    lastModified: "2024-11-28",
  },
  {
    id: "6",
    name: "Cookie Consent Script",
    type: "javascript",
    location: "footer",
    status: "testing",
    priority: 15,
    code: `// Cookie consent implementation`,
    description: "KVKK çerez onay scripti",
    lastModified: "2024-11-25",
  },
];

const locations = [
  { id: "header", label: "Header (<head>)", description: "Sayfa yüklenmeden önce" },
  { id: "body_start", label: "Body Başlangıcı", description: "<body> etiketinden hemen sonra" },
  { id: "body_end", label: "Body Sonu", description: "</body> etiketinden hemen önce" },
  { id: "footer", label: "Footer", description: "Footer bölümünde" },
  { id: "specific", label: "Belirli Sayfa", description: "Sadece seçilen sayfalarda" },
];

export default function SnippetsPage() {
  const [activeType, setActiveType] = useState("all");
  const [testingMode, setTestingMode] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  
  // New snippet form
  const [newSnippet, setNewSnippet] = useState({
    name: "",
    type: "javascript",
    location: "header",
    code: "",
    description: "",
    priority: 10,
  });

  const filteredSnippets = demoSnippets.filter(snippet => {
    const matchesType = activeType === "all" || snippet.type === activeType;
    const matchesSearch = snippet.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         snippet.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesType && matchesSearch;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return <span className="px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-600 dark:bg-green-500/10">Aktif</span>;
      case "inactive":
        return <span className="px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600 dark:bg-gray-500/10">Pasif</span>;
      case "testing":
        return <span className="px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-600 dark:bg-yellow-500/10">Test</span>;
      default:
        return null;
    }
  };

  const getTypeIcon = (type: string) => {
    return <SnippetTypeIcon type={type} className="w-4 h-4" />;
  };

  const getTypeColor = (type: string) => {
    const typeInfo = snippetTypes.find(t => t.id === type);
    return typeInfo?.color || "#6B7280";
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-dark dark:text-white">Code Snippets</h1>
          <p className="text-gray-500">Site genelinde kod parçacıkları ekleyin ve yönetin</p>
        </div>
        <div className="flex items-center gap-3">
          {/* Testing Mode Toggle */}
          <div className="flex items-center gap-2 px-4 py-2 rounded-lg border border-stroke dark:border-dark-3">
            <span className="text-sm text-gray-500">Test Modu</span>
            <button
              onClick={() => setTestingMode(!testingMode)}
              className={`relative w-11 h-6 rounded-full transition-colors ${testingMode ? "bg-yellow-500" : "bg-gray-300 dark:bg-dark-3"}`}
            >
              <span className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-transform ${testingMode ? "left-6" : "left-1"}`} />
            </button>
            {testingMode && <span className="text-xs text-yellow-600">🧪</span>}
          </div>
          <a href="#" className="text-sm text-primary hover:underline">Yardım</a>
          <button
            onClick={() => setShowAddModal(true)}
            className="inline-flex items-center gap-2 rounded-lg bg-primary px-5 py-2.5 text-white hover:bg-primary/90"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Yeni Snippet
          </button>
        </div>
      </div>

      {/* Testing Mode Warning */}
      {testingMode && (
        <div className="rounded-lg bg-yellow-50 border border-yellow-200 p-4 dark:bg-yellow-500/10 dark:border-yellow-500/20">
          <div className="flex items-center gap-3">
            <span className="text-2xl">🧪</span>
            <div>
              <h4 className="font-medium text-yellow-800 dark:text-yellow-400">Test Modu Aktif</h4>
              <p className="text-sm text-yellow-700 dark:text-yellow-500">
                Test modundaki snippet&apos;ler sadece admin kullanıcılara gösterilir. Canlıya almadan önce test edin.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <div className="rounded-xl border border-stroke bg-white p-4 dark:border-dark-3 dark:bg-gray-dark">
          <p className="text-2xl font-bold text-dark dark:text-white">{demoSnippets.length}</p>
          <p className="text-sm text-gray-500">Toplam Snippet</p>
        </div>
        <div className="rounded-xl border border-stroke bg-white p-4 dark:border-dark-3 dark:bg-gray-dark">
          <p className="text-2xl font-bold text-green-500">{demoSnippets.filter(s => s.status === "active").length}</p>
          <p className="text-sm text-gray-500">Aktif</p>
        </div>
        <div className="rounded-xl border border-stroke bg-white p-4 dark:border-dark-3 dark:bg-gray-dark">
          <p className="text-2xl font-bold text-yellow-500">{demoSnippets.filter(s => s.status === "testing").length}</p>
          <p className="text-sm text-gray-500">Test Modunda</p>
        </div>
        <div className="rounded-xl border border-stroke bg-white p-4 dark:border-dark-3 dark:bg-gray-dark">
          <p className="text-2xl font-bold text-gray-500">{demoSnippets.filter(s => s.status === "inactive").length}</p>
          <p className="text-sm text-gray-500">Pasif</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-4">
        {/* Type Filters */}
        <div className="flex flex-wrap gap-2">
          {snippetTypes.map((type) => (
            <button
              key={type.id}
              onClick={() => setActiveType(type.id)}
              className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                activeType === type.id
                  ? "bg-primary text-white"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-dark-2 dark:text-gray-400 dark:hover:bg-dark-3"
              }`}
            >
              <SnippetTypeIcon type={type.id} className="w-4 h-4" />
              {type.label}
              <span className={`px-1.5 py-0.5 rounded text-xs ${activeType === type.id ? "bg-white/20" : "bg-gray-200 dark:bg-dark-3"}`}>
                {type.count}
              </span>
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative ml-auto">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Snippet ara..."
            className="w-64 rounded-lg border border-stroke bg-transparent px-4 py-2 pl-10 text-sm dark:border-dark-3"
          />
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
      </div>

      {/* Snippets Table */}
      <div className="rounded-xl border border-stroke bg-white dark:border-dark-3 dark:bg-gray-dark overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-stroke dark:border-dark-3 bg-gray-50 dark:bg-dark-2">
              <th className="px-6 py-4 text-left text-sm font-medium text-gray-500">
                <input type="checkbox" className="h-4 w-4 rounded text-primary" />
              </th>
              <th className="px-6 py-4 text-left text-sm font-medium text-gray-500">Snippet</th>
              <th className="px-6 py-4 text-left text-sm font-medium text-gray-500">Tür</th>
              <th className="px-6 py-4 text-left text-sm font-medium text-gray-500">Konum</th>
              <th className="px-6 py-4 text-left text-sm font-medium text-gray-500">Öncelik</th>
              <th className="px-6 py-4 text-left text-sm font-medium text-gray-500">Durum</th>
              <th className="px-6 py-4 text-left text-sm font-medium text-gray-500">İşlemler</th>
            </tr>
          </thead>
          <tbody>
            {filteredSnippets.map((snippet) => (
              <tr key={snippet.id} className="border-b border-stroke last:border-0 dark:border-dark-3 hover:bg-gray-50 dark:hover:bg-dark-2">
                <td className="px-6 py-4">
                  <input type="checkbox" className="h-4 w-4 rounded text-primary" />
                </td>
                <td className="px-6 py-4">
                  <div>
                    <p className="font-medium text-dark dark:text-white">{snippet.name}</p>
                    <p className="text-sm text-gray-500">{snippet.description}</p>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span 
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium"
                    style={{ backgroundColor: `${getTypeColor(snippet.type)}20`, color: getTypeColor(snippet.type) }}
                  >
                    {getTypeIcon(snippet.type)} {snippet.type.toUpperCase()}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    {locations.find(l => l.id === snippet.location)?.label || snippet.location}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <span className="text-sm text-gray-600 dark:text-gray-400">{snippet.priority}</span>
                </td>
                <td className="px-6 py-4">
                  {getStatusBadge(snippet.status)}
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    <button
                      className={`p-2 rounded-lg transition-colors ${
                        snippet.status === "active" 
                          ? "bg-green-100 text-green-600 hover:bg-green-200 dark:bg-green-500/10" 
                          : "bg-gray-100 text-gray-500 hover:bg-gray-200 dark:bg-dark-3"
                      }`}
                      title={snippet.status === "active" ? "Devre Dışı Bırak" : "Aktif Et"}
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                      </svg>
                    </button>
                    <button className="p-2 rounded-lg bg-gray-100 text-gray-500 hover:bg-gray-200 dark:bg-dark-3 dark:hover:bg-dark-2" title="Düzenle">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                      </svg>
                    </button>
                    <button className="p-2 rounded-lg bg-gray-100 text-gray-500 hover:bg-gray-200 dark:bg-dark-3 dark:hover:bg-dark-2" title="Kopyala">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                      </svg>
                    </button>
                    <button className="p-2 rounded-lg bg-red-50 text-red-500 hover:bg-red-100 dark:bg-red-500/10" title="Sil">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {filteredSnippets.length === 0 && (
          <div className="text-center py-12">
            <svg className="w-12 h-12 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
            </svg>
            <p className="text-gray-500">Snippet bulunamadı</p>
          </div>
        )}
      </div>

      {/* Add Snippet Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="w-full max-w-2xl rounded-xl bg-white p-6 dark:bg-gray-dark max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-dark dark:text-white">Yeni Snippet Ekle</h3>
              <button onClick={() => setShowAddModal(false)} className="p-2 hover:bg-gray-100 rounded-lg dark:hover:bg-dark-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="space-y-4">
              {/* Name */}
              <div>
                <label className="mb-2 block text-sm font-medium">Snippet Adı *</label>
                <input
                  type="text"
                  value={newSnippet.name}
                  onChange={(e) => setNewSnippet({...newSnippet, name: e.target.value})}
                  placeholder="Örn: Google Analytics"
                  className="w-full rounded-lg border border-stroke bg-transparent px-4 py-2 dark:border-dark-3"
                />
              </div>

              {/* Type & Location */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="mb-2 block text-sm font-medium">Kod Türü</label>
                  <select
                    value={newSnippet.type}
                    onChange={(e) => setNewSnippet({...newSnippet, type: e.target.value})}
                    className="w-full rounded-lg border border-stroke bg-transparent px-4 py-2 dark:border-dark-3"
                  >
                    <option value="html">HTML</option>
                    <option value="css">CSS</option>
                    <option value="javascript">JavaScript</option>
                    <option value="php">PHP</option>
                    <option value="text">Text</option>
                    <option value="universal">Universal</option>
                  </select>
                </div>
                <div>
                  <label className="mb-2 block text-sm font-medium">Konum</label>
                  <select
                    value={newSnippet.location}
                    onChange={(e) => setNewSnippet({...newSnippet, location: e.target.value})}
                    className="w-full rounded-lg border border-stroke bg-transparent px-4 py-2 dark:border-dark-3"
                  >
                    {locations.map(loc => (
                      <option key={loc.id} value={loc.id}>{loc.label}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Priority */}
              <div>
                <label className="mb-2 block text-sm font-medium">Öncelik (1-100)</label>
                <input
                  type="number"
                  value={newSnippet.priority}
                  onChange={(e) => setNewSnippet({...newSnippet, priority: parseInt(e.target.value) || 10})}
                  min="1"
                  max="100"
                  className="w-full rounded-lg border border-stroke bg-transparent px-4 py-2 dark:border-dark-3"
                />
                <p className="mt-1 text-xs text-gray-500">Düşük sayı = daha önce yüklenir</p>
              </div>

              {/* Code */}
              <div>
                <label className="mb-2 block text-sm font-medium">Kod *</label>
                <textarea
                  value={newSnippet.code}
                  onChange={(e) => setNewSnippet({...newSnippet, code: e.target.value})}
                  rows={10}
                  placeholder="Kodunuzu buraya yapıştırın..."
                  className="w-full rounded-lg border border-stroke bg-transparent px-4 py-2 font-mono text-sm dark:border-dark-3"
                />
              </div>

              {/* Description */}
              <div>
                <label className="mb-2 block text-sm font-medium">Açıklama</label>
                <input
                  type="text"
                  value={newSnippet.description}
                  onChange={(e) => setNewSnippet({...newSnippet, description: e.target.value})}
                  placeholder="Bu snippet ne için kullanılıyor?"
                  className="w-full rounded-lg border border-stroke bg-transparent px-4 py-2 dark:border-dark-3"
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-stroke dark:border-dark-3">
              <button
                onClick={() => setShowAddModal(false)}
                className="px-4 py-2 rounded-lg border border-stroke text-sm hover:bg-gray-50 dark:border-dark-3"
              >
                İptal
              </button>
              <button className="px-4 py-2 rounded-lg bg-yellow-500 text-white text-sm hover:bg-yellow-600">
                Test Olarak Kaydet
              </button>
              <button className="px-4 py-2 rounded-lg bg-primary text-white text-sm hover:bg-primary/90">
                Kaydet ve Aktif Et
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
