"use client";

import { motion } from "framer-motion";
import { 
  CreditCard, 
  Building2, 
  Shield, 
  Lock, 
  CheckCircle,
  AlertTriangle,
  MessageCircle,
  Phone,
  Mail,
  Info
} from "lucide-react";

export default function OdemeSecenekleriPage() {
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
              <CreditCard className="w-8 h-8 text-[var(--fusion-primary)]" />
            </div>
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4">
              Ödeme Seçenekleri
            </h1>
            <p className="text-lg text-[var(--foreground-secondary)]">
              Güvenli, hızlı ve kolay ödeme yöntemleri
            </p>
          </motion.div>
        </div>
      </section>

      {/* Content */}
      <section className="py-12 md:py-16">
        <div className="container px-4 md:px-6">
          <div className="max-w-4xl mx-auto space-y-10">
            
            {/* Giriş */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="glass-card p-6 md:p-8 rounded-2xl text-center"
            >
              <p className="text-[var(--foreground-secondary)] leading-relaxed">
                Sitemiz üzerinden gerçekleştireceğiniz alışverişlerde güvenli, hızlı ve kolay ödeme yapabilmeniz için aşağıdaki yöntemleri sunmaktayız:
              </p>
            </motion.div>

            {/* Kredi Kartı */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="glass-card p-6 md:p-8 rounded-2xl"
            >
              <div className="flex items-start gap-4 mb-6">
                <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-[var(--fusion-primary)] to-[var(--fusion-accent)] flex items-center justify-center flex-shrink-0">
                  <CreditCard className="w-7 h-7 text-white" />
                </div>
                <div>
                  <h2 className="text-xl md:text-2xl font-bold">Kredi Kartı ile Ödeme</h2>
                  <p className="text-sm text-[var(--fusion-primary)]">3D Secure Sistemi ile</p>
                </div>
              </div>
              
              <p className="text-[var(--foreground-secondary)] leading-relaxed mb-6">
                Kredi kartı ile yapılan ödemelerde <strong>İyzico</strong> ve <strong>PayTR</strong> altyapısı kullanılmaktadır. Ödeme işlemleri, kart sahibinin kimliğini doğrulayan <strong>3D Secure</strong> güvenlik sistemi ile gerçekleşmektedir.
              </p>

              <div className="grid sm:grid-cols-2 gap-4 mb-6">
                <div className="p-4 rounded-xl bg-[var(--fusion-success)]/10 border border-[var(--fusion-success)]/20">
                  <div className="flex items-center gap-3 mb-2">
                    <Shield className="w-5 h-5 text-[var(--fusion-success)]" />
                    <h4 className="font-semibold">Güvenli Doğrulama</h4>
                  </div>
                  <p className="text-sm text-[var(--foreground-secondary)]">
                    Kart bilgileriniz doğrudan bankanız aracılığıyla doğrulanır.
                  </p>
                </div>
                <div className="p-4 rounded-xl bg-[var(--fusion-primary)]/10 border border-[var(--fusion-primary)]/20">
                  <div className="flex items-center gap-3 mb-2">
                    <Lock className="w-5 h-5 text-[var(--fusion-primary)]" />
                    <h4 className="font-semibold">Bilgi Güvenliği</h4>
                  </div>
                  <p className="text-sm text-[var(--foreground-secondary)]">
                    Kart bilgileriniz hiçbir şekilde tarafımızca saklanmaz.
                  </p>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-[var(--glass-bg)] border border-[var(--glass-border)]">
                <div className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-[var(--fusion-success)] flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-[var(--foreground-secondary)]">
                    Ödeme işleminin başarılı bir şekilde tamamlanmasının ardından siparişiniz onaylanır ve hazırlık süreci başlar.
                  </p>
                </div>
              </div>

              {/* Kabul Edilen Kartlar */}
              <div className="mt-6 pt-6 border-t border-[var(--glass-border)]">
                <p className="text-sm text-[var(--foreground-tertiary)] mb-3">Kabul Edilen Kartlar:</p>
                <div className="flex flex-wrap gap-2">
                  {["Visa", "Mastercard", "American Express", "Troy"].map((card) => (
                    <div key={card} className="px-4 py-2 rounded-lg bg-[var(--glass-bg)] border border-[var(--glass-border)]">
                      <span className="text-sm font-medium">{card}</span>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>

            {/* Havale/EFT */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="glass-card p-6 md:p-8 rounded-2xl"
            >
              <div className="flex items-start gap-4 mb-6">
                <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-[var(--fusion-accent)] to-[var(--fusion-success)] flex items-center justify-center flex-shrink-0">
                  <Building2 className="w-7 h-7 text-white" />
                </div>
                <div>
                  <h2 className="text-xl md:text-2xl font-bold">Havale/EFT ile Ödeme</h2>
                  <p className="text-sm text-[var(--fusion-accent)]">Banka Transferi</p>
                </div>
              </div>
              
              <p className="text-[var(--foreground-secondary)] leading-relaxed mb-6">
                Havale veya EFT yoluyla ödeme yapmak isteyen kullanıcılarımız, ödeme işlemini gerçekleştirdikten sonra <strong>sipariş numarasını açıklama kısmına</strong> eklemelidir.
              </p>

              <div className="p-5 rounded-xl bg-[var(--fusion-primary)]/10 border border-[var(--fusion-primary)]/20 mb-6">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-full bg-[var(--fusion-primary)]/20 flex items-center justify-center flex-shrink-0">
                    <MessageCircle className="w-5 h-5 text-[var(--fusion-primary)]" />
                  </div>
                  <div>
                    <h4 className="font-semibold mb-1">WhatsApp ile Dekont Gönderin</h4>
                    <p className="text-sm text-[var(--foreground-secondary)] mb-2">
                      İşlemlerin daha hızlı tamamlanabilmesi adına, ödeme dekontunu WhatsApp hattımıza iletmeniz gerekmektedir.
                    </p>
                    <a 
                      href="https://wa.me/908508406160" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[#25D366] text-white text-sm font-medium hover:bg-[#20BA5C] transition-colors"
                    >
                      <Phone className="w-4 h-4" />
                      +90 850 840 6160
                    </a>
                  </div>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-[var(--glass-bg)] border border-[var(--glass-border)]">
                <div className="flex items-start gap-3">
                  <Info className="w-5 h-5 text-[var(--fusion-accent)] flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-[var(--foreground-secondary)]">
                    Havale/EFT ödemeleri, banka kayıtlarının kontrol edilip onaylanmasının ardından işleme alınır. Ödeme onay süresi, bankalar arası işlem süresine göre değişiklik gösterebilir.
                  </p>
                </div>
              </div>
            </motion.div>

            {/* Hukuki Bilgilendirme */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="glass-card p-6 md:p-8 rounded-2xl"
            >
              <div className="flex items-start gap-4 mb-6">
                <div className="w-12 h-12 rounded-xl bg-[var(--fusion-warning)]/10 flex items-center justify-center flex-shrink-0">
                  <AlertTriangle className="w-6 h-6 text-[var(--fusion-warning)]" />
                </div>
                <h2 className="text-xl md:text-2xl font-bold">Hukuki Bilgilendirme</h2>
              </div>
              
              <div className="space-y-3">
                {[
                  "Havale/EFT ile yapılan ödemelerde, gönderici bilgileri ile sipariş sahibi bilgileri arasında tutarsızlık olması durumunda, ek doğrulama talep edilebilir.",
                  "Yanlış alıcı adı, eksik sipariş numarası veya dekontun paylaşılmaması gibi durumlarda sipariş süreci uzayabilir ya da işlem iptal edilebilir.",
                  "Ödeme süresi içinde yapılmayan havale/EFT işlemleri sonucunda sipariş geçerliliğini yitirebilir.",
                  "Alıcı bilgileri ve banka hesap numaraları ödeme sayfasında ve sipariş onay e-postasında ayrıca tarafınıza bildirilecektir.",
                ].map((item, index) => (
                  <div key={index} className="flex items-start gap-3 p-3 rounded-lg bg-[var(--glass-bg)] border border-[var(--glass-border)]">
                    <div className="w-6 h-6 rounded-full bg-[var(--fusion-warning)]/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-xs font-bold text-[var(--fusion-warning)]">{index + 1}</span>
                    </div>
                    <span className="text-sm text-[var(--foreground-secondary)]">{item}</span>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Veri Koruma */}
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
                <h2 className="text-xl md:text-2xl font-bold">Veri Koruma</h2>
              </div>
              
              <p className="text-[var(--foreground-secondary)] leading-relaxed">
                Tüm ödeme işlemlerinizde, kişisel verileriniz ve ödeme bilgileriniz <strong>KVKK</strong> ve ilgili yasal mevzuat çerçevesinde korunmaktadır.
              </p>
            </motion.div>

            {/* Güvenlik Rozetleri */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="grid sm:grid-cols-3 gap-4"
            >
              <div className="glass-card p-5 rounded-2xl text-center">
                <div className="w-12 h-12 rounded-xl bg-[var(--fusion-success)]/10 flex items-center justify-center mx-auto mb-3">
                  <Lock className="w-6 h-6 text-[var(--fusion-success)]" />
                </div>
                <h3 className="font-semibold mb-1">256-Bit SSL</h3>
                <p className="text-xs text-[var(--foreground-tertiary)]">Şifreli veri transferi</p>
              </div>
              
              <div className="glass-card p-5 rounded-2xl text-center">
                <div className="w-12 h-12 rounded-xl bg-[var(--fusion-primary)]/10 flex items-center justify-center mx-auto mb-3">
                  <Shield className="w-6 h-6 text-[var(--fusion-primary)]" />
                </div>
                <h3 className="font-semibold mb-1">3D Secure</h3>
                <p className="text-xs text-[var(--foreground-tertiary)]">Banka doğrulaması</p>
              </div>
              
              <div className="glass-card p-5 rounded-2xl text-center">
                <div className="w-12 h-12 rounded-xl bg-[var(--fusion-accent)]/10 flex items-center justify-center mx-auto mb-3">
                  <CreditCard className="w-6 h-6 text-[var(--fusion-accent)]" />
                </div>
                <h3 className="font-semibold mb-1">PCI DSS</h3>
                <p className="text-xs text-[var(--foreground-tertiary)]">Ödeme güvenlik standardı</p>
              </div>
            </motion.div>

            {/* İletişim */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="glass-card p-6 md:p-8 rounded-2xl text-center"
            >
              <p className="text-[var(--foreground-secondary)] mb-4">
                Her zaman güvenli ve şeffaf bir alışveriş deneyimi sunmak için çalışıyoruz. Sorularınız için bizimle iletişime geçebilirsiniz.
              </p>
              <div className="flex flex-wrap justify-center gap-4">
                <a 
                  href="tel:+908508406160"
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[var(--fusion-primary)] text-white font-medium hover:bg-[var(--fusion-primary-hover)] transition-colors"
                >
                  <Phone className="w-4 h-4" />
                  +90 850 840 6160
                </a>
                <a 
                  href="mailto:info@fusionmarkt.com"
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[var(--glass-bg)] border border-[var(--glass-border)] font-medium hover:bg-[var(--glass-bg-hover)] transition-colors"
                >
                  <Mail className="w-4 h-4" />
                  info@fusionmarkt.com
                </a>
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

