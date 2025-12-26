/* eslint-disable react/no-unescaped-entities */
"use client";

import { motion } from "framer-motion";
import { 
  Globe, 
  Truck, 
  Phone, 
  MessageCircle, 
  Mail,
  Package,
  AlertTriangle,
  RotateCcw,
  FileCheck,
  Clock,
  Warehouse,
  FileText,
  Percent,
  Boxes,
  Receipt,
  Ban,
  CheckCircle,
  Info
} from "lucide-react";

const restrictedCountries = [
  "İran",
  "Sudan", 
  "Küba",
  "Suriye",
  "Kuzey Kore",
  "Uganda"
];

export default function GonderimYerleriPage() {
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
              <Globe className="w-8 h-8 text-[var(--fusion-primary)]" />
            </div>
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4">
              Gönderim Yerleri
            </h1>
            <p className="text-lg text-[var(--foreground-secondary)]">
              Dünya çapında güvenilir teslimat hizmeti
            </p>
          </motion.div>
        </div>
      </section>

      {/* Content */}
      <section className="py-12 md:py-16">
        <div className="container px-4 md:px-6">
          <div className="max-w-4xl mx-auto space-y-10">
            
            {/* Nerelere Gönderim Yapıyoruz */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="glass-card p-6 md:p-8 rounded-2xl"
            >
              <div className="flex items-start gap-4 mb-6">
                <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-[var(--fusion-primary)] to-[var(--fusion-accent)] flex items-center justify-center flex-shrink-0">
                  <Globe className="w-7 h-7 text-white" />
                </div>
                <div>
                  <h2 className="text-xl md:text-2xl font-bold">Nerelere Gönderim Yapıyoruz?</h2>
                  <p className="text-sm text-[var(--fusion-success)]">Dünya çapında teslimat</p>
                </div>
              </div>
              
              <div className="p-5 rounded-xl bg-[var(--fusion-success)]/10 border border-[var(--fusion-success)]/20 mb-6">
                <div className="flex items-center gap-3">
                  <CheckCircle className="w-6 h-6 text-[var(--fusion-success)]" />
                  <p className="text-[var(--foreground-secondary)] font-medium">
                    FusionMarkt dünya çapında gönderim yapmaktadır.
                  </p>
                </div>
              </div>

              <div className="p-5 rounded-xl bg-[var(--fusion-error)]/10 border border-[var(--fusion-error)]/20">
                <div className="flex items-start gap-3 mb-4">
                  <Ban className="w-5 h-5 text-[var(--fusion-error)] flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-[var(--foreground-secondary)]">
                    <strong>Gönderim Yapılmayan Ülkeler:</strong>
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  {restrictedCountries.map((country) => (
                    <span key={country} className="px-3 py-1.5 rounded-lg bg-[var(--fusion-error)]/20 text-sm font-medium text-[var(--fusion-error)]">
                      {country}
                    </span>
                  ))}
                </div>
              </div>
            </motion.div>

            {/* Müşteri Hizmetleri */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="glass-card p-6 md:p-8 rounded-2xl"
            >
              <div className="flex items-start gap-4 mb-6">
                <div className="w-12 h-12 rounded-xl bg-[var(--fusion-accent)]/10 flex items-center justify-center flex-shrink-0">
                  <Phone className="w-6 h-6 text-[var(--fusion-accent)]" />
                </div>
                <h2 className="text-xl md:text-2xl font-bold">Müşteri Hizmetleri</h2>
              </div>
              
              <div className="grid sm:grid-cols-3 gap-4">
                <a href="tel:+908508406160" className="p-4 rounded-xl bg-[var(--glass-bg)] border border-[var(--glass-border)] hover:border-[var(--fusion-primary)]/50 transition-colors">
                  <Phone className="w-5 h-5 text-[var(--fusion-primary)] mb-2" />
                  <p className="text-xs text-[var(--foreground-tertiary)] mb-1">Telefon</p>
                  <p className="font-medium text-sm">+90 850 840 61 60</p>
                </a>
                <div className="p-4 rounded-xl bg-[var(--glass-bg)] border border-[var(--glass-border)]">
                  <MessageCircle className="w-5 h-5 text-[var(--fusion-success)] mb-2" />
                  <p className="text-xs text-[var(--foreground-tertiary)] mb-1">Canlı Sohbet</p>
                  <p className="font-medium text-sm">Türkçe, İngilizce, Deutsch</p>
                </div>
                <a href="mailto:info@fusionmarkt.com" className="p-4 rounded-xl bg-[var(--glass-bg)] border border-[var(--glass-border)] hover:border-[var(--fusion-primary)]/50 transition-colors">
                  <Mail className="w-5 h-5 text-[var(--fusion-accent)] mb-2" />
                  <p className="text-xs text-[var(--foreground-tertiary)] mb-1">E-posta</p>
                  <p className="font-medium text-sm">info@fusionmarkt.com</p>
                </a>
              </div>
            </motion.div>

            {/* Nakliye ve Ücretlendirme */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="glass-card p-6 md:p-8 rounded-2xl"
            >
              <div className="flex items-start gap-4 mb-6">
                <div className="w-12 h-12 rounded-xl bg-[var(--fusion-primary)]/10 flex items-center justify-center flex-shrink-0">
                  <Truck className="w-6 h-6 text-[var(--fusion-primary)]" />
                </div>
                <h2 className="text-xl md:text-2xl font-bold">Nakliye ve Ücretlendirme</h2>
              </div>
              
              <p className="text-[var(--foreground-secondary)] leading-relaxed mb-6">
                Uluslararası gönderimler <strong>DHL Express</strong> veya <strong>FedEx</strong> ile yapılır. Ücretler, paket ağırlığı, değer ve varış yeri baz alınarak hesaplanır.
              </p>

              <div className="grid md:grid-cols-2 gap-4 mb-6">
                <div className="p-4 rounded-xl bg-[var(--glass-bg)] border border-[var(--glass-border)]">
                  <Package className="w-5 h-5 text-[var(--fusion-primary)] mb-2" />
                  <h4 className="font-semibold mb-1">Çoklu Koli</h4>
                  <p className="text-sm text-[var(--foreground-secondary)]">
                    Siparişler birden fazla koli halinde gönderilebilir; ek ücret talep edilmez.
                  </p>
                </div>
                <div className="p-4 rounded-xl bg-[var(--glass-bg)] border border-[var(--glass-border)]">
                  <Truck className="w-5 h-5 text-[var(--fusion-accent)] mb-2" />
                  <h4 className="font-semibold mb-1">DHL Mail</h4>
                  <p className="text-sm text-[var(--foreground-secondary)]">
                    Bazı durumlarda DHL Mail kullanılabilir, teslimat ülkenin posta servisi tarafından tamamlanır.
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                <div className="p-4 rounded-xl bg-[var(--fusion-warning)]/10 border border-[var(--fusion-warning)]/20">
                  <div className="flex items-start gap-3">
                    <Info className="w-5 h-5 text-[var(--fusion-warning)] flex-shrink-0 mt-0.5" />
                    <p className="text-sm text-[var(--foreground-secondary)]">
                      <strong>Özel Sipariş:</strong> Özel sipariş ürünleri, önce tedarikçimizden depomuza ulaşabilir ve ardından size gönderilir.
                    </p>
                  </div>
                </div>
                <div className="p-4 rounded-xl bg-[var(--glass-bg)] border border-[var(--glass-border)]">
                  <div className="flex items-start gap-3">
                    <Info className="w-5 h-5 text-[var(--fusion-primary)] flex-shrink-0 mt-0.5" />
                    <p className="text-sm text-[var(--foreground-secondary)]">
                      <strong>Büyük Boyutlu Ürünler:</strong> Uluslararası nakliye firmalarıyla Kapıdan-Kapıya veya Kapıdan-Havaalanına hizmeti sunulabilir.
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Ürün Kısıtlamaları */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="glass-card p-6 md:p-8 rounded-2xl"
            >
              <div className="flex items-start gap-4 mb-4">
                <div className="w-12 h-12 rounded-xl bg-[var(--fusion-warning)]/10 flex items-center justify-center flex-shrink-0">
                  <AlertTriangle className="w-6 h-6 text-[var(--fusion-warning)]" />
                </div>
                <h2 className="text-xl md:text-2xl font-bold">Ürün Kısıtlamaları ve Uyum</h2>
              </div>
              
              <div className="space-y-3">
                <div className="flex items-start gap-3 p-3 rounded-lg bg-[var(--glass-bg)] border border-[var(--glass-border)]">
                  <CheckCircle className="w-4 h-4 text-[var(--fusion-success)] flex-shrink-0 mt-0.5" />
                  <span className="text-sm text-[var(--foreground-secondary)]">Sipariş verdiğiniz ürünlerin ülkenizde çalışacağından emin olmak için tüm teknik özellikleri kontrol ediniz.</span>
                </div>
                <div className="flex items-start gap-3 p-3 rounded-lg bg-[var(--glass-bg)] border border-[var(--glass-border)]">
                  <CheckCircle className="w-4 h-4 text-[var(--fusion-success)] flex-shrink-0 mt-0.5" />
                  <span className="text-sm text-[var(--foreground-secondary)]">Ülkenizdeki ithalat düzenlemelerinin siparişinizi engelleyip engellemediğini kontrol etmek alıcının sorumluluğundadır.</span>
                </div>
                <div className="flex items-start gap-3 p-3 rounded-lg bg-[var(--fusion-warning)]/10 border border-[var(--fusion-warning)]/20">
                  <AlertTriangle className="w-4 h-4 text-[var(--fusion-warning)] flex-shrink-0 mt-0.5" />
                  <span className="text-sm text-[var(--foreground-secondary)]">Üretici veya hükümet kısıtlamaları nedeniyle bazı ürünler Türkiye dışına gönderilemeyebilir.</span>
                </div>
              </div>
            </motion.div>

            {/* Reddedilen Teslimatlar */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="glass-card p-6 md:p-8 rounded-2xl"
            >
              <div className="flex items-start gap-4 mb-4">
                <div className="w-12 h-12 rounded-xl bg-[var(--fusion-error)]/10 flex items-center justify-center flex-shrink-0">
                  <RotateCcw className="w-6 h-6 text-[var(--fusion-error)]" />
                </div>
                <h2 className="text-xl md:text-2xl font-bold">Reddedilen ve İade Edilen Teslimatlar</h2>
              </div>
              
              <div className="p-4 rounded-xl bg-[var(--fusion-error)]/10 border border-[var(--fusion-error)]/20">
                <p className="text-sm text-[var(--foreground-secondary)]">
                  Siparişler yanlış adres veya reddedilme nedeniyle iade edilirse, FusionMarkt gönderim masraflarını ve iade maliyetlerini orijinal ödeme yönteminden tahsil etme hakkını saklı tutar.
                </p>
              </div>
            </motion.div>

            {/* İmza ve Teslimat Süreleri */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="glass-card p-6 md:p-8 rounded-2xl"
            >
              <div className="flex items-start gap-4 mb-6">
                <div className="w-12 h-12 rounded-xl bg-[var(--fusion-success)]/10 flex items-center justify-center flex-shrink-0">
                  <FileCheck className="w-6 h-6 text-[var(--fusion-success)]" />
                </div>
                <h2 className="text-xl md:text-2xl font-bold">İmza ve Teslimat Süreleri</h2>
              </div>
              
              <div className="grid md:grid-cols-2 gap-4">
                <div className="p-5 rounded-xl bg-[var(--fusion-primary)]/10 border border-[var(--fusion-primary)]/20">
                  <FileCheck className="w-6 h-6 text-[var(--fusion-primary)] mb-3" />
                  <h4 className="font-semibold mb-2">İmza Zorunluluğu</h4>
                  <p className="text-sm text-[var(--foreground-secondary)]">Tüm gönderimler imza gerektirir.</p>
                </div>
                <div className="p-5 rounded-xl bg-[var(--fusion-success)]/10 border border-[var(--fusion-success)]/20">
                  <Clock className="w-6 h-6 text-[var(--fusion-success)] mb-3" />
                  <h4 className="font-semibold mb-2">Aynı Gün Gönderim</h4>
                  <p className="text-sm text-[var(--foreground-secondary)]">Türkiye Saati (GMT+3) sabah 7'den önce verilen siparişler, stokta mevcutsa bir iş günü içinde gönderilir.</p>
                </div>
              </div>

              <div className="mt-4 p-4 rounded-xl bg-[var(--glass-bg)] border border-[var(--glass-border)]">
                <p className="text-sm text-[var(--foreground-secondary)]">
                  Siparişlerin birleştirilmesi nedeniyle teslimat süresi uzayabilir ve gecikmeler hakkında e-posta yoluyla bilgilendirilirsiniz.
                </p>
              </div>
            </motion.div>

            {/* Stok İstisnaları */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="glass-card p-6 md:p-8 rounded-2xl"
            >
              <div className="flex items-start gap-4 mb-4">
                <div className="w-12 h-12 rounded-xl bg-[var(--fusion-accent)]/10 flex items-center justify-center flex-shrink-0">
                  <Warehouse className="w-6 h-6 text-[var(--fusion-accent)]" />
                </div>
                <h2 className="text-xl md:text-2xl font-bold">Stok İstisnaları ve Teslimat Süreçleri</h2>
              </div>
              
              <p className="text-[var(--foreground-secondary)] leading-relaxed">
                İhracat yönetmeliklerinin karmaşıklığı nedeniyle özel siparişler önce depomuza teslim edilir ve daha sonra size gönderilir. Bu, FusionMarkt'un nakliye sürecinde daha iyi destek sağlamasına imkân tanır.
              </p>
            </motion.div>

            {/* Tasdikli Belgeler */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="glass-card p-6 md:p-8 rounded-2xl"
            >
              <div className="flex items-start gap-4 mb-4">
                <div className="w-12 h-12 rounded-xl bg-[var(--fusion-warning)]/10 flex items-center justify-center flex-shrink-0">
                  <FileText className="w-6 h-6 text-[var(--fusion-warning)]" />
                </div>
                <h2 className="text-xl md:text-2xl font-bold">Tasdikli Belgeler ve Ücretler</h2>
              </div>
              
              <p className="text-[var(--foreground-secondary)] leading-relaxed mb-4">
                Bazı ülkelerde sipariş belgelerinin ticaret odası tarafından tasdiklenmesi gerekebilir.
              </p>

              <div className="p-4 rounded-xl bg-[var(--fusion-warning)]/10 border border-[var(--fusion-warning)]/20">
                <p className="text-sm text-[var(--foreground-secondary)]">
                  <strong>Ücret:</strong> Her bir tasdikli belge için <strong>50 USD</strong> ücret ve gönderim masrafları tahsil edilir.
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
                <h2 className="text-xl md:text-2xl font-bold">İndirim ve Üretici Kampanyaları</h2>
              </div>
              
              <p className="text-[var(--foreground-secondary)] leading-relaxed mb-4">
                Üretici indirimleri, Türkiye dışına yapılan gönderimlerde geçerli olmayabilir.
              </p>

              <div className="p-4 rounded-xl bg-[var(--glass-bg)] border border-[var(--glass-border)]">
                <div className="flex items-start gap-3">
                  <Info className="w-5 h-5 text-[var(--fusion-primary)] flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-[var(--foreground-secondary)]">
                    Siparişinize ilişkin fiyatlandırmayı kontrol etmek için sepet bilgilerinizi inceleyin.
                  </p>
                </div>
              </div>
            </motion.div>

            {/* Çoklu Ürün Siparişleri */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="glass-card p-6 md:p-8 rounded-2xl"
            >
              <div className="flex items-start gap-4 mb-4">
                <div className="w-12 h-12 rounded-xl bg-[var(--fusion-primary)]/10 flex items-center justify-center flex-shrink-0">
                  <Boxes className="w-6 h-6 text-[var(--fusion-primary)]" />
                </div>
                <h2 className="text-xl md:text-2xl font-bold">Çoklu Ürün Siparişleri ve Gecikmeler</h2>
              </div>
              
              <p className="text-[var(--foreground-secondary)] leading-relaxed">
                Birden fazla depoda bulunan ürünlerin birleştirilmesi nedeniyle siparişlerinizin teslimat süresi uzayabilir. Siparişiniz ekstra bir iş günü gecikirse, size e-posta ile bilgi verilecektir.
              </p>
            </motion.div>

            {/* Gümrük Vergileri */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="glass-card p-6 md:p-8 rounded-2xl"
            >
              <div className="flex items-start gap-4 mb-6">
                <div className="w-12 h-12 rounded-xl bg-[var(--fusion-accent)]/10 flex items-center justify-center flex-shrink-0">
                  <Receipt className="w-6 h-6 text-[var(--fusion-accent)]" />
                </div>
                <h2 className="text-xl md:text-2xl font-bold">Gümrük Vergileri ve Diğer Ücretler</h2>
              </div>
              
              <p className="text-[var(--foreground-secondary)] leading-relaxed mb-6">
                Uluslararası siparişler genellikle ithalat vergileri ve harçlara tabidir. FusionMarkt, bazı siparişlerde bu ücretleri önceden tahsil etme seçeneği sunar.
              </p>

              <div className="grid md:grid-cols-2 gap-4 mb-6">
                <div className="p-4 rounded-xl bg-[var(--fusion-success)]/10 border border-[var(--fusion-success)]/20">
                  <h4 className="font-semibold mb-2">Ön Ödeme Hizmeti</h4>
                  <p className="text-sm text-[var(--foreground-secondary)]">
                    Sepetinize ürün eklediğinizde, ülkenize göre tahmini vergileri ve harçları görebilirsiniz.
                  </p>
                </div>
                <div className="p-4 rounded-xl bg-[var(--glass-bg)] border border-[var(--glass-border)]">
                  <h4 className="font-semibold mb-2">Sizin Adınıza Ödeme</h4>
                  <p className="text-sm text-[var(--foreground-secondary)]">
                    Ön ödeme hizmetini kabul ederseniz, FusionMarkt gerekli ithalat vergilerini sizin adınıza tahsil eder ve öder.
                  </p>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-[var(--fusion-warning)]/10 border border-[var(--fusion-warning)]/20">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="w-5 h-5 text-[var(--fusion-warning)] flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-[var(--foreground-secondary)]">
                    <strong>Önemli:</strong> Bu hizmetle birlikte, FusionMarkt'a ek ithalat ücretlerini veya teslimat konumunun yanlış beyan edilmesi durumunda ek masrafları ödeme yönteminizden tahsil etme yetkisi vermiş olursunuz.
                  </p>
                </div>
              </div>
            </motion.div>

            {/* Hükümler ve Koşullar */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="glass-card p-6 md:p-8 rounded-2xl"
            >
              <h2 className="text-xl md:text-2xl font-bold mb-4">Hükümler ve Koşullar</h2>
              
              <p className="text-[var(--foreground-secondary)] leading-relaxed mb-4">
                Ön ödeme hizmetini reddederseniz, FusionMarkt herhangi bir gümrük ücreti veya ithalatla ilgili maliyetten sorumlu olmayacaktır.
              </p>

              <div className="p-4 rounded-xl bg-[var(--glass-bg)] border border-[var(--glass-border)]">
                <p className="text-sm text-[var(--foreground-secondary)]">
                  Daha fazla bilgi için lütfen yerel ithalat ofisinize başvurun.
                </p>
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

