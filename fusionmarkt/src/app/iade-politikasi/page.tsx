"use client";

import { motion } from "framer-motion";
import { 
  RotateCcw, 
  Calendar, 
  FileText, 
  CheckCircle,
  XCircle,
  AlertTriangle,
  Wrench,
  RefreshCw,
  CreditCard,
  Shield,
  Smartphone,
  Clock
} from "lucide-react";

const nonReturnableItems = [
  "Kurulmuş ve kullanılmış güneş panelleri",
  "Fiziksel hasar görmüş veya çizilmiş ürünler",
  "Eksik aksesuar veya parça içeren ürünler",
  "Orijinal ambalajı olmayan veya hasarlı ambalajlı ürünler",
  "Ürün sayfasında 'iade edilemez' olarak belirtilen ürünler",
];

export default function IadePolitikasiPage() {
  return (
    <main className="min-h-screen bg-[var(--background)]">
      {/* Hero Section */}
      <section className="relative pb-16 md:pb-24 overflow-hidden" style={{ paddingTop: "120px" }}>
        <div className="absolute inset-0 bg-gradient-to-b from-[var(--fusion-primary)]/5 via-transparent to-transparent" />
        <div className="container px-4 md:px-6 relative">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="max-w-3xl mx-auto text-center"
          >
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-[var(--fusion-primary)]/10 mb-6">
              <RotateCcw className="w-8 h-8 text-[var(--fusion-primary)]" />
            </div>
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4">
              İade Politikası
            </h1>
            <p className="text-lg text-[var(--foreground-secondary)]">
              14 günlük yasal cayma hakkı garantisi
            </p>
          </motion.div>
        </div>
      </section>

      {/* Content */}
      <section className="py-12 md:py-16">
        <div className="container px-4 md:px-6">
          <div className="max-w-4xl mx-auto space-y-10">
            
            {/* 14 Günlük Yasal İade */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="glass-card p-6 md:p-8 rounded-2xl"
            >
              <div className="flex items-start gap-4 mb-6">
                <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-[var(--fusion-success)] to-[var(--fusion-primary)] flex items-center justify-center flex-shrink-0">
                  <Calendar className="w-7 h-7 text-white" />
                </div>
                <div>
                  <h2 className="text-xl md:text-2xl font-bold">14 Günlük Yasal Cayma Hakkı</h2>
                  <p className="text-sm text-[var(--fusion-success)]">Mesafeli satış sözleşmesi kapsamında</p>
                </div>
              </div>
              
              <p className="text-[var(--foreground-secondary)] leading-relaxed mb-6">
                Mesafeli Satışlar Yönetmeliği kapsamında, satın aldığınız üründen memnun kalmazsanız teslim tarihinden itibaren <strong>14 gün</strong> içinde cayma hakkınızı kullanabilirsiniz.
              </p>

              <div className="p-4 rounded-xl bg-[var(--fusion-primary)]/10 border border-[var(--fusion-primary)]/20 mb-6">
                <div className="flex items-center gap-3">
                  <FileText className="w-6 h-6 text-[var(--fusion-primary)] flex-shrink-0" />
                  <p className="text-sm text-[var(--foreground-secondary)]">
                    Tüm iptal ve iade işlemleri <strong>Hesabım → Siparişlerim</strong> bölümünden çevrimiçi olarak yapılmaktadır.
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                <div className="p-4 rounded-xl bg-[var(--fusion-warning)]/10 border border-[var(--fusion-warning)]/20">
                  <div className="flex items-start gap-3">
                    <AlertTriangle className="w-5 h-5 text-[var(--fusion-warning)] flex-shrink-0 mt-0.5" />
                    <p className="text-sm text-[var(--foreground-secondary)]">
                      Eğer orijinal siparişiniz ücretsiz ürünler içeriyorsa, tam bir geri ödeme almak için tüm ilgili ürünleri iade etmelisiniz. Saklanan ücretsiz ürünlerin perakende değeri, geri ödeme tutarınızdan düşülecektir.
                    </p>
                  </div>
                </div>
                <div className="p-4 rounded-xl bg-[var(--glass-bg)] border border-[var(--glass-border)]">
                  <p className="text-sm text-[var(--foreground-secondary)]">
                    FusionMarkt, yalnızca orijinal satın alma fiyatını iade eder; <strong>nakliye ücretleri iade edilmez</strong>.
                  </p>
                </div>
              </div>
            </motion.div>

            {/* İptal ve İade Süreci */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="glass-card p-6 md:p-8 rounded-2xl"
            >
              <div className="flex items-start gap-4 mb-6">
                <div className="w-12 h-12 rounded-xl bg-[var(--fusion-primary)]/10 flex items-center justify-center flex-shrink-0">
                  <FileText className="w-6 h-6 text-[var(--fusion-primary)]" />
                </div>
                <h2 className="text-xl md:text-2xl font-bold">İptal ve İade Süreci</h2>
              </div>

              {/* Sipariş İptali */}
              <div className="mb-6 p-5 rounded-xl bg-[var(--fusion-accent)]/10 border border-[var(--fusion-accent)]/20">
                <h3 className="font-semibold text-lg mb-3 flex items-center gap-2">
                  <XCircle className="w-5 h-5 text-[var(--fusion-accent)]" />
                  Sipariş İptali (Kargoya Verilmemiş Siparişler)
                </h3>
                <p className="text-sm text-[var(--foreground-secondary)] mb-3">
                  Siparişiniz henüz kargoya verilmediyse, <strong>Hesabım → Siparişlerim</strong> bölümünden doğrudan iptal talebinde bulunabilirsiniz.
                </p>
                <ul className="text-sm text-[var(--foreground-secondary)] space-y-1 ml-4 list-disc">
                  <li>Beklemede veya hazırlanıyor durumundaki siparişler iptal edilebilir</li>
                  <li>İptal talebiniz mağaza tarafından onaylandıktan sonra ödemeniz iade edilir</li>
                </ul>
              </div>

              {/* Ürün İadesi */}
              <div className="mb-6 p-5 rounded-xl bg-[var(--fusion-success)]/10 border border-[var(--fusion-success)]/20">
                <h3 className="font-semibold text-lg mb-3 flex items-center gap-2">
                  <RotateCcw className="w-5 h-5 text-[var(--fusion-success)]" />
                  Ürün İadesi (Kargoya Verilmiş/Teslim Edilmiş Siparişler)
                </h3>
                <p className="text-sm text-[var(--foreground-secondary)] mb-3">
                  Siparişiniz kargoya verilmiş veya teslim edildiyse, iade talebi oluşturmanız gerekir.
                </p>
              </div>
              
              <div className="space-y-4">
                <div className="flex gap-4">
                  <div className="w-10 h-10 rounded-full bg-[var(--fusion-primary)] flex items-center justify-center flex-shrink-0">
                    <span className="text-white font-bold">1</span>
                  </div>
                  <div className="flex-1 p-4 rounded-xl bg-[var(--glass-bg)] border border-[var(--glass-border)]">
                    <h4 className="font-semibold mb-1">İade Talebi Oluşturun</h4>
                    <p className="text-sm text-[var(--foreground-secondary)]">
                      <strong>Hesabım → Siparişlerim</strong> bölümünden ilgili siparişi seçin ve &quot;İade Talebi&quot; butonuna tıklayın.
                    </p>
                  </div>
                </div>
                
                <div className="flex gap-4">
                  <div className="w-10 h-10 rounded-full bg-[var(--fusion-accent)] flex items-center justify-center flex-shrink-0">
                    <span className="text-white font-bold">2</span>
                  </div>
                  <div className="flex-1 p-4 rounded-xl bg-[var(--glass-bg)] border border-[var(--glass-border)]">
                    <h4 className="font-semibold mb-1">Sebep Seçin ve Fotoğraf Ekleyin</h4>
                    <p className="text-sm text-[var(--foreground-secondary)]">
                      İade sebebini seçin (hasarlı ürün, yanlış ürün, teknik uyuşmazlık) ve varsa ürün fotoğraflarını yükleyin (en fazla 3 adet).
                    </p>
                  </div>
                </div>
                
                <div className="flex gap-4">
                  <div className="w-10 h-10 rounded-full bg-[var(--fusion-success)] flex items-center justify-center flex-shrink-0">
                    <span className="text-white font-bold">3</span>
                  </div>
                  <div className="flex-1 p-4 rounded-xl bg-[var(--glass-bg)] border border-[var(--glass-border)]">
                    <h4 className="font-semibold mb-1">Onay Bekleyin</h4>
                    <p className="text-sm text-[var(--foreground-secondary)]">
                      Talebiniz incelendikten sonra size iade adresi ve talimatlar e-posta ile gönderilecektir.
                    </p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="w-10 h-10 rounded-full bg-[var(--fusion-warning)] flex items-center justify-center flex-shrink-0">
                    <span className="text-white font-bold">4</span>
                  </div>
                  <div className="flex-1 p-4 rounded-xl bg-[var(--glass-bg)] border border-[var(--glass-border)]">
                    <h4 className="font-semibold mb-1">Paketle ve Gönder</h4>
                    <p className="text-sm text-[var(--foreground-secondary)]">
                      Ürünü orijinal ambalajında, tüm aksesuarları ile birlikte belirtilen adrese kargolayın.
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-6 p-4 rounded-xl bg-[var(--fusion-warning)]/10 border border-[var(--fusion-warning)]/20">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="w-5 h-5 text-[var(--fusion-warning)] flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-[var(--foreground-secondary)]">
                    <strong>Önemli:</strong> Sigortalı kargo kullanmanızı öneririz; kaybolan veya hasar gören ürünlerden biz sorumlu değiliz.
                  </p>
                </div>
              </div>
            </motion.div>

            {/* Uygunluk Koşulları */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="glass-card p-6 md:p-8 rounded-2xl"
            >
              <div className="flex items-start gap-4 mb-6">
                <div className="w-12 h-12 rounded-xl bg-[var(--fusion-success)]/10 flex items-center justify-center flex-shrink-0">
                  <CheckCircle className="w-6 h-6 text-[var(--fusion-success)]" />
                </div>
                <h2 className="text-xl md:text-2xl font-bold">Uygunluk Koşulları</h2>
              </div>
              
              <p className="text-[var(--foreground-secondary)] leading-relaxed mb-4">
                İade edilen ürünlerin kabul edilebilmesi için aşağıdaki koşullara uyulması gereklidir:
              </p>

              <div className="space-y-3">
                {[
                  "Tüm ürünler, orijinal ambalajında, eksiksiz ve bozulmamış şekilde olmalıdır (UPC kodu dahil).",
                  "Tüm aksesuarlar, kullanım kılavuzları ve ücretsiz ürünler iade edilmelidir.",
                  "Saklanan ücretsiz ürünlerin değeri, iade tutarından düşülecektir.",
                  "FusionMarkt yalnızca ürünün orijinal satın alma fiyatını iade eder; nakliye masrafları iade edilmez.",
                ].map((item, index) => (
                  <div key={index} className="flex items-start gap-3 p-3 rounded-lg bg-[var(--glass-bg)] border border-[var(--glass-border)]">
                    <CheckCircle className="w-5 h-5 text-[var(--fusion-success)] flex-shrink-0 mt-0.5" />
                    <span className="text-sm text-[var(--foreground-secondary)]">{item}</span>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* İade Edilemeyen Ürünler */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="glass-card p-6 md:p-8 rounded-2xl"
            >
              <div className="flex items-start gap-4 mb-6">
                <div className="w-12 h-12 rounded-xl bg-[var(--fusion-error)]/10 flex items-center justify-center flex-shrink-0">
                  <XCircle className="w-6 h-6 text-[var(--fusion-error)]" />
                </div>
                <h2 className="text-xl md:text-2xl font-bold">İade Edilemeyen Ürünler</h2>
              </div>
              
              <div className="grid sm:grid-cols-2 gap-3">
                {nonReturnableItems.map((item, index) => (
                  <div key={index} className="flex items-start gap-3 p-3 rounded-lg bg-[var(--fusion-error)]/5 border border-[var(--fusion-error)]/10">
                    <XCircle className="w-4 h-4 text-[var(--fusion-error)] flex-shrink-0 mt-0.5" />
                    <span className="text-sm text-[var(--foreground-secondary)]">{item}</span>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Kusurlu veya Hasarlı Ürünler */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="glass-card p-6 md:p-8 rounded-2xl"
            >
              <div className="flex items-start gap-4 mb-4">
                <div className="w-12 h-12 rounded-xl bg-[var(--fusion-warning)]/10 flex items-center justify-center flex-shrink-0">
                  <Wrench className="w-6 h-6 text-[var(--fusion-warning)]" />
                </div>
                <h2 className="text-xl md:text-2xl font-bold">Kusurlu veya Hasarlı Ürünler</h2>
              </div>
              
              <p className="text-[var(--foreground-secondary)] leading-relaxed mb-4">
                Kusurlu ürünler, onarım, değişim veya iade için kabul edilir.
              </p>

              <div className="p-4 rounded-xl bg-[var(--fusion-success)]/10 border border-[var(--fusion-success)]/20">
                <div className="flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-[var(--fusion-success)]" />
                  <p className="text-sm text-[var(--foreground-secondary)]">
                    İade edilen kusurlu ürünler için nakliye masrafları tarafımızdan karşılanır.
                  </p>
                </div>
              </div>
            </motion.div>

            {/* Değişim Süreci */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="glass-card p-6 md:p-8 rounded-2xl"
            >
              <div className="flex items-start gap-4 mb-4">
                <div className="w-12 h-12 rounded-xl bg-[var(--fusion-accent)]/10 flex items-center justify-center flex-shrink-0">
                  <RefreshCw className="w-6 h-6 text-[var(--fusion-accent)]" />
                </div>
                <h2 className="text-xl md:text-2xl font-bold">Değişim Süreci</h2>
              </div>
              
              <div className="p-4 rounded-xl bg-[var(--glass-bg)] border border-[var(--glass-border)]">
                <div className="flex items-center gap-3">
                  <Clock className="w-5 h-5 text-[var(--fusion-accent)]" />
                  <p className="text-[var(--foreground-secondary)]">
                    Posta yoluyla yapılan değişimlerin işleme alınması için <strong>5-7 iş günü</strong> sürebilir.
                  </p>
                </div>
              </div>
            </motion.div>

            {/* Para İadeleri ve Krediler */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="glass-card p-6 md:p-8 rounded-2xl"
            >
              <div className="flex items-start gap-4 mb-6">
                <div className="w-12 h-12 rounded-xl bg-[var(--fusion-primary)]/10 flex items-center justify-center flex-shrink-0">
                  <CreditCard className="w-6 h-6 text-[var(--fusion-primary)]" />
                </div>
                <h2 className="text-xl md:text-2xl font-bold">Para İadeleri ve Krediler</h2>
              </div>
              
              <p className="text-[var(--foreground-secondary)] leading-relaxed mb-6">
                İade edilen ürünlerin incelenmesinin ardından iadeniz işleme alınır.
              </p>

              <div className="p-5 rounded-xl bg-[var(--fusion-success)]/10 border border-[var(--fusion-success)]/20">
                <CreditCard className="w-6 h-6 text-[var(--fusion-success)] mb-3" />
                <h4 className="font-semibold mb-2">Kredi Kartı / Havale İadesi</h4>
                <p className="text-sm text-[var(--foreground-secondary)]">
                  Kredi kartı ödemelerinde iade <strong>5-7 iş günü</strong> içinde kartınıza yansır. Havale/EFT ödemelerinde ise ödemeniz <strong>3 iş günü</strong> içinde gönderim yaptığınız banka hesabına iade edilir.
                </p>
              </div>

              <div className="mt-4 p-4 rounded-xl bg-[var(--glass-bg)] border border-[var(--glass-border)]">
                <p className="text-sm text-[var(--foreground-secondary)]">
                  Yalnızca orijinal satın alma fiyatı iade edilir; nakliye masrafları iade edilmez.
                </p>
              </div>
            </motion.div>

            {/* Sınırlı Sorumluluk */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="glass-card p-6 md:p-8 rounded-2xl"
            >
              <div className="flex items-start gap-4 mb-4">
                <div className="w-12 h-12 rounded-xl bg-[var(--fusion-error)]/10 flex items-center justify-center flex-shrink-0">
                  <Shield className="w-6 h-6 text-[var(--fusion-error)]" />
                </div>
                <h2 className="text-xl md:text-2xl font-bold">Sınırlı Sorumluluk</h2>
              </div>
              
              <div className="space-y-3">
                <div className="p-4 rounded-xl bg-[var(--glass-bg)] border border-[var(--glass-border)]">
                  <p className="text-sm text-[var(--foreground-secondary)]">
                    FusionMarkt, iade edilen ürünlerde kalan kişisel bilgilerden sorumlu değildir.
                  </p>
                </div>
                <div className="p-4 rounded-xl bg-[var(--glass-bg)] border border-[var(--glass-border)]">
                  <p className="text-sm text-[var(--foreground-secondary)]">
                    FusionMarkt, ürünlerin satışından veya kullanımından doğan dolaylı veya arızi hasarlardan da sorumlu tutulamaz.
                  </p>
                </div>
                <div className="p-4 rounded-xl bg-[var(--fusion-warning)]/10 border border-[var(--fusion-warning)]/20">
                  <div className="flex items-start gap-3">
                    <AlertTriangle className="w-5 h-5 text-[var(--fusion-warning)] flex-shrink-0 mt-0.5" />
                    <p className="text-sm text-[var(--foreground-secondary)]">
                      <strong>Önemli:</strong> Eksik veya hasarlı ürünlerle ilgili talepler, teslimattan sonraki <strong>iki iş günü</strong> içinde yapılmalıdır.
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* İade Öncesi Hazırlık */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="glass-card p-6 md:p-8 rounded-2xl"
            >
              <div className="flex items-start gap-4 mb-4">
                <div className="w-12 h-12 rounded-xl bg-[var(--fusion-primary)]/10 flex items-center justify-center flex-shrink-0">
                  <Smartphone className="w-6 h-6 text-[var(--fusion-primary)]" />
                </div>
                <h2 className="text-xl md:text-2xl font-bold">İade Öncesi Hazırlık</h2>
              </div>

              <p className="text-[var(--foreground-secondary)] mb-4">
                Ürünlerinizi iade etmeden önce aşağıdaki hazırlıkları yapmanız gerekmektedir:
              </p>
              
              <div className="grid md:grid-cols-2 gap-4">
                <div className="p-4 rounded-xl bg-[var(--fusion-warning)]/10 border border-[var(--fusion-warning)]/20">
                  <h4 className="font-semibold mb-2">Ayarları Sıfırlayın</h4>
                  <p className="text-sm text-[var(--foreground-secondary)]">
                    Güç istasyonları ve WiFi özellikli ürünlerde kayıtlı WiFi ağları, kullanıcı ayarları ve kişisel veriler sıfırlanmalıdır.
                  </p>
                </div>
                <div className="p-4 rounded-xl bg-[var(--fusion-warning)]/10 border border-[var(--fusion-warning)]/20">
                  <h4 className="font-semibold mb-2">Pil Şarj Durumu</h4>
                  <p className="text-sm text-[var(--foreground-secondary)]">
                    Güç istasyonlarının pil şarj seviyesini %20-50 aralığına getirin. Tam dolu veya tamamen boş pil ile kargolama önerilmez.
                  </p>
                </div>
                <div className="p-4 rounded-xl bg-[var(--fusion-warning)]/10 border border-[var(--fusion-warning)]/20">
                  <h4 className="font-semibold mb-2">Orijinal Ambalaj</h4>
                  <p className="text-sm text-[var(--foreground-secondary)]">
                    Ürünü orijinal kutusunda, koruyucu köpükler ve tüm aksesuarları ile birlikte paketleyin.
                  </p>
                </div>
                <div className="p-4 rounded-xl bg-[var(--fusion-warning)]/10 border border-[var(--fusion-warning)]/20">
                  <h4 className="font-semibold mb-2">Kablo ve Aksesuarlar</h4>
                  <p className="text-sm text-[var(--foreground-secondary)]">
                    Şarj kabloları, adaptörler, kullanım kılavuzu ve ürünle birlikte gelen tüm aksesuarlar dahil edilmelidir.
                  </p>
                </div>
              </div>
            </motion.div>

            {/* Son Güncelleme */}
            <div className="text-center text-sm text-[var(--foreground-muted)]">
              <p>Son Güncelleme: {new Date().toLocaleDateString('tr-TR', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
            </div>

          </div>
        </div>
      </section>
    </main>
  );
}

