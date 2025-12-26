"use client";

import { motion } from "framer-motion";
import { Cookie, Shield, BarChart3, Megaphone, Settings, Mail, Phone, MapPin, Globe } from "lucide-react";

export default function CerezPolitikasiPage() {
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
              <Cookie className="w-8 h-8 text-[var(--fusion-primary)]" />
            </div>
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4">
              Çerez Politikası
            </h1>
            <p className="text-lg text-[var(--foreground-secondary)]">
              Platformumuzdaki çerez kullanımı hakkında bilgi edinin
            </p>
          </motion.div>
        </div>
      </section>

      {/* Content */}
      <section className="py-12 md:py-16">
        <div className="container px-4 md:px-6">
          <div className="max-w-4xl mx-auto space-y-12">
            
            {/* Platformumuzu Ziyaret */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="glass-card p-6 md:p-8 rounded-2xl"
            >
              <h2 className="text-xl md:text-2xl font-bold mb-4">Platformumuzu Ziyaret ve Çerez Kullanımı</h2>
              <p className="text-[var(--foreground-secondary)] leading-relaxed">
                Platformumuzu ziyaret ettiğinizde, biz veya yetkili hizmet sağlayıcılarımız, reklam amaçlı daha iyi, daha hızlı ve daha güvenli bir deneyim sunmak için bilgi saklamak için çerezler, web beaconları ve diğer benzer teknolojiler kullanabiliriz.
              </p>
            </motion.div>

            {/* Çerez Nedir */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="glass-card p-6 md:p-8 rounded-2xl"
            >
              <div className="flex items-start gap-4 mb-4">
                <div className="w-12 h-12 rounded-xl bg-[var(--fusion-primary)]/10 flex items-center justify-center flex-shrink-0">
                  <Cookie className="w-6 h-6 text-[var(--fusion-primary)]" />
                </div>
                <div>
                  <h2 className="text-xl md:text-2xl font-bold">Çerez Nedir?</h2>
                </div>
              </div>
              <p className="text-[var(--foreground-secondary)] leading-relaxed mb-4">
                Bir Çerez, bir web sitesinin bilgisayarınızda, telefonunuzda veya başka herhangi bir aygıtta depoladığı küçük bir metin dosyasıdır. Çerezler taramayı kolaylaştırmak ve daha kullanıcı dostu hale getirmek için gereklidir. Bilgisayarınıza zarar vermezler ve hassas kişisel bilgilerinizi saklamak için asla kullanılmazlar.
              </p>
              <p className="text-[var(--foreground-secondary)] leading-relaxed mb-4">
                Çerezleri kullanmanın amacı, web tarama deneyiminizi iyileştirmek, sitenin güvenliğini artırmak ve pazarlama ve tanıtım amaçları için kullanmaktır. Çerezler, tercihlerinizi (örneğin tercih edilen dil ve ülke gibi) hatırlamanıza, kullanım şekillerini tahmin etmenize ve daha iyi arama sonuçları sunmamıza olanak sağlar.
              </p>
              <p className="text-[var(--foreground-secondary)] leading-relaxed">
                Bilgisayarınızdan IP adresiniz ve referans web sitesinin adresi gibi bazı teknik bilgileri de topluyoruz. Bu bilgiler, sitemizi tercihlerinize uygun hale getirmemize olanak tanır. Bu bilgiler yalnızca yetkili ortaklarımız ve siz, müşterimiz FusionMarkt LLC&apos;nin yararına kullanılır.
              </p>
            </motion.div>

            {/* Çerez Türleri */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="glass-card p-6 md:p-8 rounded-2xl"
            >
              <h2 className="text-xl md:text-2xl font-bold mb-6">Platformumuzdaki Çerez Türleri</h2>
              <div className="grid md:grid-cols-2 gap-6">
                <div className="p-5 rounded-xl bg-[var(--glass-bg)] border border-[var(--glass-border)]">
                  <h3 className="font-semibold text-lg mb-3 flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-[var(--fusion-primary)]" />
                    İlk Taraf Çerezleri
                  </h3>
                  <p className="text-sm text-[var(--foreground-secondary)] leading-relaxed">
                    Bu çerezler yalnızca biz tarafından ayarlanır. Hem oturum hem de kalıcı çerezler kullanıyoruz.
                  </p>
                </div>
                <div className="p-5 rounded-xl bg-[var(--glass-bg)] border border-[var(--glass-border)]">
                  <h3 className="font-semibold text-lg mb-3 flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-[var(--fusion-accent)]" />
                    Üçüncü Taraf Çerezleri
                  </h3>
                  <p className="text-sm text-[var(--foreground-secondary)] leading-relaxed">
                    Bu çerezler platformumuzda bulunan hizmet sağlayıcılarımız tarafından talep üzerine ayarlanır. Bunlar oturum çerezleri veya kalıcı çerezler olabilir. Bu çerezler platformumuzda yer alan ve hizmet sağlamak ve müşterinin tarama deneyimini iyileştirmek için üçüncü taraflar tarafından yönetilir. Ayrıca sahte faaliyetleri tespit etmek ve önlemek için de kullanılabilirler.
                  </p>
                </div>
              </div>
            </motion.div>

            {/* Çerez Kullanım Amaçları */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="glass-card p-6 md:p-8 rounded-2xl"
            >
              <h2 className="text-xl md:text-2xl font-bold mb-6">Çerez Kullanım Amaçları</h2>
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="p-5 rounded-xl bg-[var(--glass-bg)] border border-[var(--glass-border)]">
                  <div className="w-10 h-10 rounded-lg bg-[var(--fusion-primary)]/10 flex items-center justify-center mb-3">
                    <Settings className="w-5 h-5 text-[var(--fusion-primary)]" />
                  </div>
                  <h3 className="font-semibold mb-2">Önemli Web Sitesi İşlemleri</h3>
                  <p className="text-sm text-[var(--foreground-secondary)] leading-relaxed">
                    Bu teknolojiler, platformumuzdaki hizmetleri size sunmak ve ürünleri sepete eklemek, form göndermek, video oynatmak gibi özellikleri kullanmak için gereklidir.
                  </p>
                </div>
                
                <div className="p-5 rounded-xl bg-[var(--glass-bg)] border border-[var(--glass-border)]">
                  <div className="w-10 h-10 rounded-lg bg-[var(--fusion-success)]/10 flex items-center justify-center mb-3">
                    <Shield className="w-5 h-5 text-[var(--fusion-success)]" />
                  </div>
                  <h3 className="font-semibold mb-2">Performans ve İşlevsellik</h3>
                  <p className="text-sm text-[var(--foreground-secondary)] leading-relaxed">
                    Bu teknolojiler platformumuzun işlevselliğini artırmak için kullanılır.
                  </p>
                </div>
                
                <div className="p-5 rounded-xl bg-[var(--glass-bg)] border border-[var(--glass-border)]">
                  <div className="w-10 h-10 rounded-lg bg-[var(--fusion-accent)]/10 flex items-center justify-center mb-3">
                    <BarChart3 className="w-5 h-5 text-[var(--fusion-accent)]" />
                  </div>
                  <h3 className="font-semibold mb-2">Analitik</h3>
                  <p className="text-sm text-[var(--foreground-secondary)] leading-relaxed">
                    Web sitelerimizin nasıl kullanıldığını anlamamıza ve platformumuzu geliştirmemize yardımcı olur.
                  </p>
                </div>
                
                <div className="p-5 rounded-xl bg-[var(--glass-bg)] border border-[var(--glass-border)]">
                  <div className="w-10 h-10 rounded-lg bg-[var(--fusion-warning)]/10 flex items-center justify-center mb-3">
                    <Megaphone className="w-5 h-5 text-[var(--fusion-warning)]" />
                  </div>
                  <h3 className="font-semibold mb-2">Reklamcılık</h3>
                  <p className="text-sm text-[var(--foreground-secondary)] leading-relaxed">
                    Reklam mesajlarını sizin için daha uygun hale getiren teknolojilerdir.
                  </p>
                </div>
              </div>
            </motion.div>

            {/* İletişim ve Yasal Bilgiler */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="glass-card p-6 md:p-8 rounded-2xl"
            >
              <h2 className="text-xl md:text-2xl font-bold mb-6">İletişim ve Yasal Bilgiler</h2>
              <div className="p-6 rounded-xl bg-[var(--glass-bg)] border border-[var(--glass-border)]">
                <h3 className="font-bold text-lg mb-4">ASDTC ENGINEERING CO. / FusionMarkt LLC</h3>
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <MapPin className="w-5 h-5 text-[var(--fusion-primary)] flex-shrink-0 mt-0.5" />
                    <span className="text-[var(--foreground-secondary)]">
                      Turan Güneş Bulvarı, Cezayir Cad. No:6/7 Yıldızevler, ANKARA / TÜRKİYE
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Phone className="w-5 h-5 text-[var(--fusion-primary)]" />
                    <a href="tel:+908508406160" className="text-[var(--foreground-secondary)] hover:text-[var(--fusion-primary)] transition-colors">
                      +90 850 840 6160
                    </a>
                  </div>
                  <div className="flex items-center gap-3">
                    <Mail className="w-5 h-5 text-[var(--fusion-primary)]" />
                    <a href="mailto:compliance@fusionmarkt.com" className="text-[var(--foreground-secondary)] hover:text-[var(--fusion-primary)] transition-colors">
                      compliance@fusionmarkt.com
                    </a>
                  </div>
                  <div className="flex items-center gap-3">
                    <Globe className="w-5 h-5 text-[var(--fusion-primary)]" />
                    <a href="https://fusionmarkt.com" className="text-[var(--foreground-secondary)] hover:text-[var(--fusion-primary)] transition-colors">
                      fusionmarkt.com
                    </a>
                  </div>
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

