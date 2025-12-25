"use client";

import { motion } from "framer-motion";
import { 
  DollarSign, 
  Globe, 
  CreditCard, 
  RefreshCw, 
  Shield, 
  Percent,
  AlertCircle,
  Info
} from "lucide-react";

export default function UcretlendirmePolitikasiPage() {
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
              <DollarSign className="w-8 h-8 text-[var(--fusion-primary)]" />
            </div>
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4">
              Ücretlendirme Politikası
            </h1>
            <p className="text-lg text-[var(--foreground-secondary)]">
              Uluslararası fiyatlandırma ve ödeme seçenekleri hakkında bilgi
            </p>
          </motion.div>
        </div>
      </section>

      {/* Content */}
      <section className="py-12 md:py-16">
        <div className="container px-4 md:px-6">
          <div className="max-w-4xl mx-auto space-y-10">
            
            {/* Uluslararası Fiyatlandırma */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="glass-card p-6 md:p-8 rounded-2xl"
            >
              <div className="flex items-start gap-4 mb-6">
                <div className="w-12 h-12 rounded-xl bg-[var(--fusion-primary)]/10 flex items-center justify-center flex-shrink-0">
                  <Globe className="w-6 h-6 text-[var(--fusion-primary)]" />
                </div>
                <h2 className="text-xl md:text-2xl font-bold">Uluslararası Fiyatlandırma ve Ödeme Seçenekleri</h2>
              </div>
              
              <div className="space-y-4">
                <div className="p-4 rounded-xl bg-[var(--fusion-warning)]/10 border border-[var(--fusion-warning)]/20">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-[var(--fusion-warning)] flex-shrink-0 mt-0.5" />
                    <p className="text-sm text-[var(--foreground-secondary)]">
                      Gösterilen tüm TL dışı para birimi tutarları yalnızca genel bilgi amacıyla sağlanan tahminlerdir. Herhangi bir yabancı para birimi bilgisinin doğruluğunu garanti etmiyoruz.
                    </p>
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div className="p-5 rounded-xl bg-[var(--glass-bg)] border border-[var(--glass-border)]">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-10 h-10 rounded-lg bg-[var(--fusion-primary)]/10 flex items-center justify-center">
                        <DollarSign className="w-5 h-5 text-[var(--fusion-primary)]" />
                      </div>
                      <h3 className="font-semibold">Nihai Tutar</h3>
                    </div>
                    <p className="text-sm text-[var(--foreground-secondary)]">
                      Sepetinizde gösterilen nihai tutar Türk lirası cinsindendir.
                    </p>
                  </div>
                  
                  <div className="p-5 rounded-xl bg-[var(--glass-bg)] border border-[var(--glass-border)]">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-10 h-10 rounded-lg bg-[var(--fusion-accent)]/10 flex items-center justify-center">
                        <Info className="w-5 h-5 text-[var(--fusion-accent)]" />
                      </div>
                      <h3 className="font-semibold">Ek Masraflar</h3>
                    </div>
                    <p className="text-sm text-[var(--foreground-secondary)]">
                      Tahmini ürün fiyatına gümrük, harç ve/veya vergiler dahil değildir.
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Kredi Kartı Bilgileri */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="glass-card p-6 md:p-8 rounded-2xl"
            >
              <div className="flex items-start gap-4 mb-6">
                <div className="w-12 h-12 rounded-xl bg-[var(--fusion-accent)]/10 flex items-center justify-center flex-shrink-0">
                  <CreditCard className="w-6 h-6 text-[var(--fusion-accent)]" />
                </div>
                <h2 className="text-xl md:text-2xl font-bold">Kredi Kartı İşlemleri</h2>
              </div>
              
              <div className="space-y-4">
                <p className="text-[var(--foreground-secondary)] leading-relaxed">
                  Kredi kartı şirketiniz sizden bir dönüştürme ücreti talep edebilir. Kredi kartınıza yapılacak herhangi bir ücretlendirme veya iade, ödeme para birimi cinsinden yapılacaktır.
                </p>
                
                <div className="p-4 rounded-xl bg-[var(--glass-bg)] border border-[var(--glass-border)]">
                  <div className="flex items-start gap-3">
                    <Info className="w-5 h-5 text-[var(--fusion-primary)] flex-shrink-0 mt-0.5" />
                    <p className="text-sm text-[var(--foreground-secondary)]">
                      <strong>Döviz Kuru Dalgalanmaları:</strong> Dalgalanan döviz kurları nedeniyle iade tutarları satın alma fiyatından daha fazla veya daha az olabilir.
                    </p>
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-[var(--fusion-error)]/10 border border-[var(--fusion-error)]/20">
                  <p className="text-sm text-[var(--foreground-secondary)]">
                    <strong>Kısıtlamalar:</strong> PayPal Kredisi, Google Checkout™ ve posta iadeleri uluslararası satın alımlar için geçerli değildir.
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-[var(--fusion-success)]/10 border border-[var(--fusion-success)]/20">
                  <p className="text-sm text-[var(--foreground-secondary)]">
                    <strong>Ödeme Zamanı:</strong> Uluslararası siparişlerin ücreti "Sipariş Ver" butonuna tıkladığınız anda tahsil edilir.
                  </p>
                </div>
              </div>
            </motion.div>

            {/* İadeler ve Değişimler */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="glass-card p-6 md:p-8 rounded-2xl"
            >
              <div className="flex items-start gap-4 mb-6">
                <div className="w-12 h-12 rounded-xl bg-[var(--fusion-warning)]/10 flex items-center justify-center flex-shrink-0">
                  <RefreshCw className="w-6 h-6 text-[var(--fusion-warning)]" />
                </div>
                <h2 className="text-xl md:text-2xl font-bold">İadeler ve Değişimler</h2>
              </div>
              
              <p className="text-[var(--foreground-secondary)] leading-relaxed mb-4">
                Bir ürünü bize iade ederseniz, varış ülkesindeki ihracatçı siz olursunuz. Bu mülkiyet ve her türlü kayıp riski, ürünü (satın alınan herhangi bir ürün ve beraberindeki ücretsiz ürünler) teslim almamızın ardından bize geçer.
              </p>

              <div className="grid md:grid-cols-2 gap-4">
                <div className="p-5 rounded-xl bg-[var(--glass-bg)] border border-[var(--glass-border)]">
                  <h3 className="font-semibold mb-2">Harç ve Vergi İadesi</h3>
                  <p className="text-sm text-[var(--foreground-secondary)]">
                    Nakliye şirketleri, harç ve vergilerinizi bir ücret karşılığında geri almanıza yardımcı olacaktır. Bu hizmeti başlatmak için lütfen doğrudan kargo şirketleriyle iletişime geçin.
                  </p>
                </div>
                
                <div className="p-5 rounded-xl bg-[var(--fusion-warning)]/10 border border-[var(--fusion-warning)]/20">
                  <h3 className="font-semibold mb-2">Nakliye Ücretleri</h3>
                  <p className="text-sm text-[var(--foreground-secondary)]">
                    İade nakliye ücretleri müşterinin sorumluluğundadır; teslimat ücretleri iade edilmez.
                  </p>
                </div>
              </div>
            </motion.div>

            {/* Gizlilik */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="glass-card p-6 md:p-8 rounded-2xl"
            >
              <div className="flex items-start gap-4 mb-4">
                <div className="w-12 h-12 rounded-xl bg-[var(--fusion-success)]/10 flex items-center justify-center flex-shrink-0">
                  <Shield className="w-6 h-6 text-[var(--fusion-success)]" />
                </div>
                <h2 className="text-xl md:text-2xl font-bold">Gizlilik</h2>
              </div>
              
              <p className="text-[var(--foreground-secondary)] leading-relaxed mb-4">
                Gizliliğiniz bizim için önemlidir ve güvenli veri beklentilerinizi aşmak için çalışıyoruz.
              </p>

              <div className="p-4 rounded-xl bg-[var(--glass-bg)] border border-[var(--glass-border)]">
                <p className="text-sm text-[var(--foreground-secondary)] leading-relaxed">
                  Bununla birlikte, sınır ötesi gönderiler gümrük yetkilileri tarafından denetime tabidir. Ayrıca, uluslararası taşıyıcılarımıza belirli sipariş, gönderi ve ürün bilgilerini sağlamamız istenebilir. Taşıyıcılar, gümrük işlemlerini kolaylaştırmak ve yerel yasalara uymak amacıyla bu tür bilgileri gümrük yetkililerine iletebilir.
                </p>
              </div>
            </motion.div>

            {/* İndirimler */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="glass-card p-6 md:p-8 rounded-2xl"
            >
              <div className="flex items-start gap-4 mb-4">
                <div className="w-12 h-12 rounded-xl bg-[var(--fusion-error)]/10 flex items-center justify-center flex-shrink-0">
                  <Percent className="w-6 h-6 text-[var(--fusion-error)]" />
                </div>
                <h2 className="text-xl md:text-2xl font-bold">İndirimler</h2>
              </div>
              
              <p className="text-[var(--foreground-secondary)] leading-relaxed mb-4">
                Üretici indirimleri Türkiye dışına gönderilen ürünler için veya ülkeniz için geçerli olmayabilir.
              </p>

              <div className="p-4 rounded-xl bg-[var(--fusion-primary)]/10 border border-[var(--fusion-primary)]/20">
                <div className="flex items-start gap-3">
                  <Info className="w-5 h-5 text-[var(--fusion-primary)] flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-[var(--foreground-secondary)]">
                    <strong>Öneri:</strong> Fiyatlandırmayı onaylamak için lütfen sepetinizdeki bilgileri kontrol edin.
                  </p>
                </div>
              </div>
            </motion.div>

            {/* Özet Kartları */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="grid sm:grid-cols-3 gap-4"
            >
              <div className="glass-card p-5 rounded-2xl text-center">
                <div className="w-12 h-12 rounded-xl bg-[var(--fusion-primary)]/10 flex items-center justify-center mx-auto mb-3">
                  <DollarSign className="w-6 h-6 text-[var(--fusion-primary)]" />
                </div>
                <h3 className="font-semibold mb-1">TL Bazlı</h3>
                <p className="text-xs text-[var(--foreground-tertiary)]">Nihai tutar Türk Lirası cinsindendir</p>
              </div>
              
              <div className="glass-card p-5 rounded-2xl text-center">
                <div className="w-12 h-12 rounded-xl bg-[var(--fusion-success)]/10 flex items-center justify-center mx-auto mb-3">
                  <Shield className="w-6 h-6 text-[var(--fusion-success)]" />
                </div>
                <h3 className="font-semibold mb-1">Güvenli Ödeme</h3>
                <p className="text-xs text-[var(--foreground-tertiary)]">256-Bit SSL şifreli işlemler</p>
              </div>
              
              <div className="glass-card p-5 rounded-2xl text-center">
                <div className="w-12 h-12 rounded-xl bg-[var(--fusion-accent)]/10 flex items-center justify-center mx-auto mb-3">
                  <CreditCard className="w-6 h-6 text-[var(--fusion-accent)]" />
                </div>
                <h3 className="font-semibold mb-1">Çoklu Ödeme</h3>
                <p className="text-xs text-[var(--foreground-tertiary)]">Visa, Mastercard, Troy destekli</p>
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

