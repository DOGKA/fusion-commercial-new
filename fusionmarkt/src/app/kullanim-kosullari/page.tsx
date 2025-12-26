/* eslint-disable react/no-unescaped-entities */
"use client";

import { motion } from "framer-motion";
import { 
  ScrollText, 
  PenTool, 
  Ban, 
  Shield, 
  Award, 
  FileText,
  CheckCircle,
  XCircle,
  AlertTriangle
} from "lucide-react";

export default function KullanimKosullariPage() {
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
              <ScrollText className="w-8 h-8 text-[var(--fusion-primary)]" />
            </div>
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4">
              Site Kullanım Şartları
            </h1>
            <p className="text-lg text-[var(--foreground-secondary)]">
              CGC Hizmeti Derecelendirmeler, Yorumlar, Sorular ve Cevaplar
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
              className="glass-card p-6 md:p-8 rounded-2xl"
            >
              <h2 className="text-xl md:text-2xl font-bold mb-4">Giriş</h2>
              <p className="text-[var(--foreground-secondary)] leading-relaxed mb-4">
                Bu Kullanım Şartları, FusionMarkt Kullanıcı Sözleşmesi ve Feragatnamesi ("Kullanıcı Sözleşmesi") ve FusionMarkt Gizlilik ve Güvenlik Politikalarına ("Gizlilik Politikası") ek olarak, FusionMarkt LLC ve ASDTC Mühendislik Ticaret A.Ş. ("FusionMarkt") tarafından sunulan Derecelendirmeler ve Yorumlar ile Sorular ve Cevaplar hizmeti ("CGC Hizmeti") ile ilgili davranışlarınızı düzenler.
              </p>
              <div className="p-4 rounded-xl bg-[var(--fusion-primary)]/10 border border-[var(--fusion-primary)]/20">
                <p className="text-sm text-[var(--foreground-secondary)]">
                  <strong>Öncelik:</strong> Kullanıcı Sözleşmesi ve Gizlilik Politikası ile bu Kullanım Şartları arasında herhangi bir çelişki olması durumunda, bu Kullanım Şartları geçerli olacaktır.
                </p>
              </div>
            </motion.div>

            {/* İçerik Gönderme */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="glass-card p-6 md:p-8 rounded-2xl"
            >
              <div className="flex items-start gap-4 mb-6">
                <div className="w-12 h-12 rounded-xl bg-[var(--fusion-success)]/10 flex items-center justify-center flex-shrink-0">
                  <PenTool className="w-6 h-6 text-[var(--fusion-success)]" />
                </div>
                <h2 className="text-xl md:text-2xl font-bold">İçerik Gönderme</h2>
              </div>
              <p className="text-[var(--foreground-secondary)] leading-relaxed mb-6">
                FusionMarkt'a herhangi bir içerik göndererek, şunları beyan ve taahhüt edersiniz:
              </p>
              <div className="space-y-3">
                {[
                  "İçerikteki fikri mülkiyet haklarının tek yazarı ve sahibi olduğunuzu",
                  'İçerikte sahip olabileceğiniz tüm "manevi haklardan" gönüllü olarak feragat ettiğinizi',
                  "Gönderdiğiniz tüm içeriğin doğru olduğunu",
                  "En az 13 yaşında olduğunuzu",
                  "Sağladığınız içeriğin kullanımı bu Kullanım Şartlarını ihlal etmeyeceğini ve herhangi bir kişi veya kuruluşun zarar görmesine neden olmayacağını",
                ].map((item, index) => (
                  <div key={index} className="flex items-start gap-3 p-3 rounded-lg bg-[var(--glass-bg)] border border-[var(--glass-border)]">
                    <CheckCircle className="w-5 h-5 text-[var(--fusion-success)] flex-shrink-0 mt-0.5" />
                    <span className="text-sm text-[var(--foreground-secondary)]">{item}</span>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Yasaklı İçerikler */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="glass-card p-6 md:p-8 rounded-2xl"
            >
              <div className="flex items-start gap-4 mb-6">
                <div className="w-12 h-12 rounded-xl bg-[var(--fusion-error)]/10 flex items-center justify-center flex-shrink-0">
                  <Ban className="w-6 h-6 text-[var(--fusion-error)]" />
                </div>
                <h2 className="text-xl md:text-2xl font-bold">Yasaklı İçerikler</h2>
              </div>
              <p className="text-[var(--foreground-secondary)] leading-relaxed mb-6">
                Aşağıdaki içerikleri gönderemezsiniz:
              </p>
              <div className="space-y-3">
                {[
                  "Yanlış, hatalı veya yanıltıcı olduğu tarafınızca bilinen içerikler",
                  "Herhangi bir üçüncü tarafın telif hakkı, patent, ticari marka, ticari sır veya diğer mülkiyet haklarını veya tanıtım veya gizlilik haklarını ihlal eden içerikler",
                  "Herhangi bir yasayı, tüzüğü, yönetmeliği veya düzenlemeyi (tüketicinin korunması, haksız rekabet, ayrımcılıkla mücadele veya yanlış reklamı düzenleyenler dahil) ihlal eden içerikler",
                  "Herhangi bir kişi, ortaklık veya kuruma yönelik karalayıcı, iftira niteliğinde, nefret dolu, ırksal veya dini açıdan önyargılı veya saldırgan, yasadışı bir şekilde tehdit edici veya taciz edici içerikler",
                  "Herhangi bir üçüncü tarafça size tazminat ödenmiş veya herhangi bir karşılık verilmiş olan içerikler",
                  "Diğer web sitelerine, adreslere, e-posta adreslerine, iletişim bilgilerine veya telefon numaralarına atıfta bulunan her türlü bilgi",
                  "Herhangi bir bilgisayar virüsü, solucan veya diğer potansiyel olarak zarar verici bilgisayar programları veya dosyaları içeren içerikler",
                ].map((item, index) => (
                  <div key={index} className="flex items-start gap-3 p-3 rounded-lg bg-[var(--fusion-error)]/5 border border-[var(--fusion-error)]/10">
                    <XCircle className="w-5 h-5 text-[var(--fusion-error)] flex-shrink-0 mt-0.5" />
                    <span className="text-sm text-[var(--foreground-secondary)]">{item}</span>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Tazminat ve Zararların Tazmini */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="glass-card p-6 md:p-8 rounded-2xl"
            >
              <div className="flex items-start gap-4 mb-4">
                <div className="w-12 h-12 rounded-xl bg-[var(--fusion-warning)]/10 flex items-center justify-center flex-shrink-0">
                  <Shield className="w-6 h-6 text-[var(--fusion-warning)]" />
                </div>
                <h2 className="text-xl md:text-2xl font-bold">Tazminat ve Zararların Tazmini</h2>
              </div>
              <p className="text-[var(--foreground-secondary)] leading-relaxed">
                FusionMarkt'u (ve memurlarını, direktörlerini, acentelerini, iştiraklerini, ortak girişimlerini, çalışanlarını ve üçüncü taraf hizmet sağlayıcılarını), yukarıda belirtilen beyan ve taahhütlerinizi ihlal etmenizden veya herhangi bir yasayı veya üçüncü bir tarafın haklarını ihlal etmenizden kaynaklanan makul avukatlık ücretleri de dahil olmak üzere her türlü iddia, talep ve zarardan tazmin etmeyi ve zarar görmemesini sağlamayı kabul edersiniz.
              </p>
            </motion.div>

            {/* Lisans ve Haklar */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="glass-card p-6 md:p-8 rounded-2xl"
            >
              <div className="flex items-start gap-4 mb-4">
                <div className="w-12 h-12 rounded-xl bg-[var(--fusion-accent)]/10 flex items-center justify-center flex-shrink-0">
                  <Award className="w-6 h-6 text-[var(--fusion-accent)]" />
                </div>
                <h2 className="text-xl md:text-2xl font-bold">Lisans ve Haklar</h2>
              </div>
              <p className="text-[var(--foreground-secondary)] leading-relaxed mb-4">
                Gönderdiğiniz herhangi bir içerik için, FusionMarkt'a aşağıdaki hakları size herhangi bir tazminat ödemeksizin daimi, geri alınamaz, telifsiz, devredilebilir bir hak ve lisans olarak vermiş olursunuz:
              </p>
              <div className="grid sm:grid-cols-2 gap-3">
                {[
                  "Bu içeriği kullanma",
                  "Kopyalama ve değiştirme",
                  "Bütünüyle silme",
                  "Uyarlama ve yayınlama",
                  "Tercüme etme",
                  "Türev çalışmalar oluşturma",
                  "Satma ve dağıtma",
                  "Dünya çapında herhangi bir ortama dahil etme",
                ].map((item, index) => (
                  <div key={index} className="flex items-center gap-2 p-3 rounded-lg bg-[var(--glass-bg)] border border-[var(--glass-border)]">
                    <div className="w-2 h-2 rounded-full bg-[var(--fusion-accent)]" />
                    <span className="text-sm text-[var(--foreground-secondary)]">{item}</span>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* İçerik Kullanımı ve Yayınlanması */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="glass-card p-6 md:p-8 rounded-2xl"
            >
              <div className="flex items-start gap-4 mb-4">
                <div className="w-12 h-12 rounded-xl bg-[var(--fusion-primary)]/10 flex items-center justify-center flex-shrink-0">
                  <FileText className="w-6 h-6 text-[var(--fusion-primary)]" />
                </div>
                <h2 className="text-xl md:text-2xl font-bold">İçerik Kullanımı ve Yayınlanması</h2>
              </div>
              <p className="text-[var(--foreground-secondary)] leading-relaxed mb-4">
                Gönderdiğiniz tüm içerikler, tamamen FusionMarkt'un takdirine bağlı olarak kullanılabilir. FusionMarkt, web sitesinde yer alan ve kendi takdirine bağlı olarak içerik yönergelerini veya bu Kullanım Şartlarının başka herhangi bir hükmünü ihlal ettiğini düşündüğü herhangi bir içeriği değiştirme, daraltma, yayınlamama, kaldırma veya silme hakkını saklı tutar.
              </p>
              
              <div className="grid md:grid-cols-2 gap-4 mb-4">
                <div className="p-4 rounded-xl bg-[var(--glass-bg)] border border-[var(--glass-border)]">
                  <h4 className="font-semibold mb-2 text-sm">Yayınlama Süresi</h4>
                  <p className="text-xs text-[var(--foreground-secondary)]">
                    İncelemeler ve yazılı yorumlar genellikle 2-4 iş günü içinde yayınlanır.
                  </p>
                </div>
                <div className="p-4 rounded-xl bg-[var(--glass-bg)] border border-[var(--glass-border)]">
                  <h4 className="font-semibold mb-2 text-sm">Saklı Haklar</h4>
                  <p className="text-xs text-[var(--foreground-secondary)]">
                    FusionMarkt, yasaların izin verdiği ölçüde herhangi bir gönderiyi kaldırma veya yayınlamayı reddetme hakkını saklı tutar.
                  </p>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-[var(--fusion-warning)]/10 border border-[var(--fusion-warning)]/20">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="w-5 h-5 text-[var(--fusion-warning)] flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm text-[var(--foreground-secondary)]">
                      <strong>Sorumluluk:</strong> Gönderinizin içeriğinden yalnızca sizin sorumlu olduğunuzu kabul edersiniz. Gönderdiğiniz içeriklerin hiçbiri, FusionMarkt, temsilcileri, iştirakleri, bağlı kuruluşları, ortakları veya üçüncü taraf hizmet sağlayıcıları ve bunların ilgili yöneticileri, memurları ve çalışanları açısından herhangi bir gizlilik yükümlülüğüne tabi olmayacaktır.
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* İlgili Politikalar */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="glass-card p-6 md:p-8 rounded-2xl"
            >
              <h2 className="text-xl md:text-2xl font-bold mb-6">İlgili Politikalar</h2>
              <div className="grid sm:grid-cols-2 gap-4">
                <a 
                  href="/kullanici-sozlesmesi" 
                  className="p-4 rounded-xl bg-[var(--glass-bg)] border border-[var(--glass-border)] hover:border-[var(--fusion-primary)]/50 transition-colors group"
                >
                  <h4 className="font-semibold mb-1 group-hover:text-[var(--fusion-primary)] transition-colors">Kullanıcı Sözleşmesi</h4>
                  <p className="text-xs text-[var(--foreground-tertiary)]">Kullanıcı Sözleşmesi ve Feragatname</p>
                </a>
                <a 
                  href="/gizlilik-politikasi" 
                  className="p-4 rounded-xl bg-[var(--glass-bg)] border border-[var(--glass-border)] hover:border-[var(--fusion-primary)]/50 transition-colors group"
                >
                  <h4 className="font-semibold mb-1 group-hover:text-[var(--fusion-primary)] transition-colors">Gizlilik Politikası</h4>
                  <p className="text-xs text-[var(--foreground-tertiary)]">Gizlilik ve Güvenlik Politikaları</p>
                </a>
                <a 
                  href="/cerez-politikasi" 
                  className="p-4 rounded-xl bg-[var(--glass-bg)] border border-[var(--glass-border)] hover:border-[var(--fusion-primary)]/50 transition-colors group"
                >
                  <h4 className="font-semibold mb-1 group-hover:text-[var(--fusion-primary)] transition-colors">Çerez Politikası</h4>
                  <p className="text-xs text-[var(--foreground-tertiary)]">Çerez Kullanımı ve Tercihler</p>
                </a>
                <a 
                  href="/mesafeli-satis-sozlesmesi" 
                  className="p-4 rounded-xl bg-[var(--glass-bg)] border border-[var(--glass-border)] hover:border-[var(--fusion-primary)]/50 transition-colors group"
                >
                  <h4 className="font-semibold mb-1 group-hover:text-[var(--fusion-primary)] transition-colors">Mesafeli Satış Sözleşmesi</h4>
                  <p className="text-xs text-[var(--foreground-tertiary)]">Satış Şartları ve Koşulları</p>
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

