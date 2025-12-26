/* eslint-disable react/no-unescaped-entities */
"use client";

import { motion } from "framer-motion";
import { 
  FileText, 
  Copyright, 
  Bookmark, 
  Ban, 
  ExternalLink, 
  AlertTriangle, 
  Scale, 
  MessageSquare,
  Gavel,
  XCircle,
  Globe,
  ShieldAlert,
  Mail,
  HelpCircle
} from "lucide-react";

export default function KullaniciSozlesmesiPage() {
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
              <FileText className="w-8 h-8 text-[var(--fusion-primary)]" />
            </div>
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4">
              Kullanıcı Sözleşmesi ve Feragatname
            </h1>
            <p className="text-lg text-[var(--foreground-secondary)]">
              Platformumuzu kullanmadan önce lütfen bu şartları dikkatlice okuyun
            </p>
          </motion.div>
        </div>
      </section>

      {/* Content */}
      <section className="py-12 md:py-16">
        <div className="container px-4 md:px-6">
          <div className="max-w-4xl mx-auto space-y-10">
            
            {/* Uyarı Banner */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="p-6 rounded-2xl bg-[var(--fusion-warning)]/10 border border-[var(--fusion-warning)]/20"
            >
              <div className="flex items-start gap-4">
                <AlertTriangle className="w-6 h-6 text-[var(--fusion-warning)] flex-shrink-0 mt-1" />
                <div>
                  <h2 className="font-bold text-lg mb-2">LÜTFEN BU SİTEYİ KULLANMADAN ÖNCE AŞAĞIDAKİ HÜKÜM VE KOŞULLARI DİKKATLİCE OKUYUN.</h2>
                  <p className="text-[var(--foreground-secondary)] text-sm">
                    Bu siteye erişim ve sitenin kullanımı aşağıdaki hüküm ve koşullara ve yürürlükteki tüm yasalara tabidir. FusionMarkt'un takdirine bağlı olarak herhangi bir zamanda değiştirilebileceğinden, lütfen bu hüküm ve koşulları periyodik olarak gözden geçirin. Herhangi bir hüküm veya koşulu kabul etmiyorsanız, bu siteyi kullanmamalısınız.
                  </p>
                </div>
              </div>
            </motion.div>

            {/* Telif Hakkı */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="glass-card p-6 md:p-8 rounded-2xl"
            >
              <div className="flex items-start gap-4 mb-4">
                <div className="w-12 h-12 rounded-xl bg-[var(--fusion-primary)]/10 flex items-center justify-center flex-shrink-0">
                  <Copyright className="w-6 h-6 text-[var(--fusion-primary)]" />
                </div>
                <h2 className="text-xl md:text-2xl font-bold">Telif Hakkı Bildirimi</h2>
              </div>
              <p className="text-[var(--foreground-secondary)] leading-relaxed">
                Bu World Wide Web sitesi ve burada kullanılan metin ve resimler ve bunların düzenlenmesi dahil ancak bunlarla sınırlı olmamak üzere tüm içeriğin telif hakkı ©2024 FusionMarkt LLC ve ASDTC Engineering Co.'ya aittir.
              </p>
            </motion.div>

            {/* Ticari Markalar */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="glass-card p-6 md:p-8 rounded-2xl"
            >
              <div className="flex items-start gap-4 mb-4">
                <div className="w-12 h-12 rounded-xl bg-[var(--fusion-accent)]/10 flex items-center justify-center flex-shrink-0">
                  <Bookmark className="w-6 h-6 text-[var(--fusion-accent)]" />
                </div>
                <h2 className="text-xl md:text-2xl font-bold">Ticari Markalar Bildirimi</h2>
              </div>
              <p className="text-[var(--foreground-secondary)] leading-relaxed mb-4">
                FusionMarkt LLC ve ASDTC Engineering Co. ve burada atıfta bulunulan diğer tüm FusionMarkt isimleri, işletmeleri ve ürünleri ticari markalar veya tescilli ticari markalardır. Burada atıfta bulunulan diğer tüm ürünler ve şirket adları, varsa, ilgili sahiplerinin ticari markaları olabilir.
              </p>
              <div className="p-4 rounded-xl bg-[var(--fusion-error)]/10 border border-[var(--fusion-error)]/20">
                <p className="text-sm text-[var(--foreground-secondary)]">
                  <strong>Önemli:</strong> FusionMarkt, ticari olmayan uygulamalar da dahil olmak üzere, burada atıfta bulunulan herhangi bir ticari adın, ticari markanın, tescilli ticari markanın, logonun veya telif hakkıyla korunan herhangi bir materyalin herhangi bir amaçla kullanılmasına izin vermez.
                </p>
              </div>
            </motion.div>

            {/* Kullanımla İlgili Kısıtlamalar */}
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
                <h2 className="text-xl md:text-2xl font-bold">Kullanımla İlgili Kısıtlamalar</h2>
              </div>
              <p className="text-[var(--foreground-secondary)] leading-relaxed mb-6">
                Web sitesini kullanmanıza izin verilmesi karşılığında, aşağıdaki eylemlerin önemli bir ihlal teşkil edeceğini kabul edersiniz:
              </p>
              <div className="space-y-3">
                {[
                  "Yazılı iznimiz olmadan web sitesi veya web sitesi kullanıcıları hakkında bilgi toplamak",
                  "Yazılı iznimiz olmadan web sitesinde yer alan herhangi bir içeriği veya bilgiyi değiştirmek, çerçevelemek, oluşturmak, yansıtmak, kesmek, enjekte etmek, filtrelemek veya değiştirmek",
                  "Web sitesini herhangi bir derin bağlantı, sayfa kazıma, robot, tarama, dizin, örümcek, tıklama spam, makro programları veya diğer otomatik cihaz ile kullanmak",
                  "Siteye rekabet amacıyla veya FusionMarkt ile iş yapmak dışında ticari amaçlarla erişmek veya siteyi kullanmak",
                  "Web sitesine, web sitesinden veya web sitesi aracılığıyla iletilen bilgilerin kaynağını gizlemek",
                  "Başka bir kişinin kimliğine bürünmek",
                  "Virüs veya diğer zararlı bilgisayar kodlarını dağıtmak",
                  "Başka bir kişi veya kuruluşun web sitesine erişmek veya web sitesini kullanmak için sizi taklit etmesine izin vermek",
                  "Web sitesini yerel, ulusal veya uluslararası yasaları ihlal eden herhangi bir amaç için kullanmak",
                  "Web sitesinin kullanıcıya veya başkalarına zarar vermeyi amaçlayan bir şekilde kullanılması",
                  "Kullanım Koşullarının ihlal edilmesini önlemek amacıyla tarafımızdan uygulanan herhangi bir önlemi atlatmak",
                ].map((item, index) => (
                  <div key={index} className="flex items-start gap-3 p-3 rounded-lg bg-[var(--glass-bg)] border border-[var(--glass-border)]">
                    <XCircle className="w-4 h-4 text-[var(--fusion-error)] flex-shrink-0 mt-0.5" />
                    <span className="text-sm text-[var(--foreground-secondary)]">{item}</span>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Üçüncü Taraf Siteleri */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="glass-card p-6 md:p-8 rounded-2xl"
            >
              <div className="flex items-start gap-4 mb-4">
                <div className="w-12 h-12 rounded-xl bg-[var(--fusion-warning)]/10 flex items-center justify-center flex-shrink-0">
                  <ExternalLink className="w-6 h-6 text-[var(--fusion-warning)]" />
                </div>
                <h2 className="text-xl md:text-2xl font-bold">Üçüncü Taraf Siteleri</h2>
              </div>
              <p className="text-[var(--foreground-secondary)] leading-relaxed mb-4">
                FusionMarkt zaman zaman üçüncü taraflarca işletilen internet sitelerine ("üçüncü taraf siteleri") bağlantılar ve işaretçiler sağlayabilir ve zaman zaman bu web sitesinde üçüncü taraflardan materyaller sağlayabilir. Bu üçüncü taraf siteleri ve üçüncü taraf materyalleri yalnızca size kolaylık sağlamak amacıyla sunulmaktadır.
              </p>
              <p className="text-[var(--foreground-secondary)] leading-relaxed">
                FusionMarkt, bu üçüncü taraf sitelerinde bulunan herhangi bir bilgi, ürün veya hizmeti hiçbir şekilde işletmez veya kontrol etmez ve FusionMarkt bunların içeriğinden sorumlu değildir. FusionMarkt'un bu sitelere bir bağlantı sağlamış olması, FusionMarkt tarafından bu sitelere, hizmetlerine, gösterilen ürünlere, sahiplerine veya sağlayıcılarına ilişkin bir onay, yetkilendirme, sponsorluk veya bağlılık anlamına gelmez.
              </p>
            </motion.div>

            {/* Yasal Uyarı */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="glass-card p-6 md:p-8 rounded-2xl"
            >
              <div className="flex items-start gap-4 mb-4">
                <div className="w-12 h-12 rounded-xl bg-[var(--fusion-error)]/10 flex items-center justify-center flex-shrink-0">
                  <AlertTriangle className="w-6 h-6 text-[var(--fusion-error)]" />
                </div>
                <h2 className="text-xl md:text-2xl font-bold">Yasal Uyarı</h2>
              </div>
              <p className="text-[var(--foreground-secondary)] leading-relaxed">
                İnternette bulunan herhangi bir bilgi, yazılım veya ürünün kullanımında belirli riskler vardır; FusionMarkt, internet üzerinden herhangi bir şey almadan, kullanmadan, güvenmeden veya satın almadan önce bu riskleri tamamen anladığınızdan emin olmanız konusunda sizi uyarır.
              </p>
            </motion.div>

            {/* Sorumluluğun Sınırlandırılması */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="glass-card p-6 md:p-8 rounded-2xl"
            >
              <div className="flex items-start gap-4 mb-4">
                <div className="w-12 h-12 rounded-xl bg-[var(--fusion-primary)]/10 flex items-center justify-center flex-shrink-0">
                  <Scale className="w-6 h-6 text-[var(--fusion-primary)]" />
                </div>
                <h2 className="text-xl md:text-2xl font-bold">Sorumluluğun Sınırlandırılması</h2>
              </div>
              <p className="text-[var(--foreground-secondary)] leading-relaxed mb-4">
                FusionMarkt, bu siteyi kullanımınızdan kaynaklanan veya bu sitede sağlanan ve/veya yer alan materyalle ilgili olarak ortaya çıkan herhangi bir enfeksiyon, kirlenme, işletim veya iletimde gecikme, hat arızası, hata, eksiklik, kesinti veya kusurdan sorumlu değildir.
              </p>
              <p className="text-[var(--foreground-secondary)] leading-relaxed mb-4">
                FusionMarkt, hiçbir durumda, FusionMarkt Web Sitesindeki veya FusionMarkt Web Sitesi aracılığıyla erişilen bilgi veya materyallerin kullanımından veya kullanılamamasından kaynaklanan veya bunlarla herhangi bir şekilde bağlantılı olan, sözleşme, ihmal, kusursuz sorumluluk veya başka teoriler altında bir eylemde olsun, kullanım kaybı, kar kaybı veya veri kaybı dahil ancak bunlarla sınırlı olmamak üzere, herhangi bir nedenden kaynaklanan herhangi bir özel, doğrudan, dolaylı, arızi veya sonuç olarak ortaya çıkan zararlardan veya herhangi bir türden diğer zararlardan sorumlu tutulamaz.
              </p>
              <div className="p-4 rounded-xl bg-[var(--glass-bg)] border border-[var(--glass-border)]">
                <p className="text-sm text-[var(--foreground-secondary)]">
                  <strong>Yükümlülük Sınırı:</strong> FusionMarkt'un tüm talepler, zararlar, kayıplar ve dava nedenleri için size karşı toplam yükümlülüğü, hiçbir durumda, talebinize yol açtığı iddia edilen işlemle bağlantılı olarak FusionMarkt'a tarafınızdan ödenen tutarları aşmayacaktır.
                </p>
              </div>
            </motion.div>

            {/* İletişimler ve Gönderimler */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="glass-card p-6 md:p-8 rounded-2xl"
            >
              <div className="flex items-start gap-4 mb-4">
                <div className="w-12 h-12 rounded-xl bg-[var(--fusion-success)]/10 flex items-center justify-center flex-shrink-0">
                  <MessageSquare className="w-6 h-6 text-[var(--fusion-success)]" />
                </div>
                <h2 className="text-xl md:text-2xl font-bold">İletişimler ve Gönderimler</h2>
              </div>
              <p className="text-[var(--foreground-secondary)] leading-relaxed mb-4">
                FusionMarkt'a veya bu web sitesine herhangi bir gönderi ileterek veya yayınlayarak, FusionMarkt'a ve bağlı kuruluşlarına, bu tür gönderilerin içeriğini herhangi bir amaçla kullanmak için münhasır olmayan, telifsiz, kalıcı, geri alınamaz ve tamamen alt lisans verilebilir bir hak verirsiniz.
              </p>
              <p className="text-[var(--foreground-secondary)] leading-relaxed mb-4">
                Bu haklar, bu tür içeriği çoğaltma, değiştirme, uyarlama, yayınlama, tercüme etme, bunlardan türev çalışmalar oluşturma, dağıtma ve dünya çapında herhangi bir ortamda sergileme haklarını içerir.
              </p>
              <p className="text-[var(--foreground-secondary)] leading-relaxed">
                Ayrıca, burada verilen lisansın, bu tür bilgileri içeren ürün veya hizmetlerin geliştirilmesi, üretilmesi ve pazarlanması dahil herhangi bir amaç için bu tür gönderimlerde yer alan herhangi bir fikir, kavram, know-how veya tekniğin kullanılmasını içerdiğini kabul edersiniz.
              </p>
            </motion.div>

            {/* Yetki ve Yasa Seçimi */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="glass-card p-6 md:p-8 rounded-2xl"
            >
              <div className="flex items-start gap-4 mb-4">
                <div className="w-12 h-12 rounded-xl bg-[var(--fusion-accent)]/10 flex items-center justify-center flex-shrink-0">
                  <Gavel className="w-6 h-6 text-[var(--fusion-accent)]" />
                </div>
                <h2 className="text-xl md:text-2xl font-bold">Yetki ve Yasa Seçimi</h2>
              </div>
              <p className="text-[var(--foreground-secondary)] leading-relaxed mb-4">
                Bu anlaşma ve bu web sitesinden kaynaklanan ve bu web sitesiyle ilgili her türlü ihtilaf, Türkiye Cumhuriyeti yasalarına göre yorumlanacaktır.
              </p>
              <div className="p-4 rounded-xl bg-[var(--glass-bg)] border border-[var(--glass-border)]">
                <p className="text-sm text-[var(--foreground-secondary)]">
                  <strong>Yargı Yetkisi:</strong> Bu anlaşma veya bu web sitesi ile ilgili herhangi bir yasal işlem yalnızca Ankara, Türkiye'deki mahkemelerde yapılacaktır ve bu siteyi kullanarak bu mahkemelerde kişisel yargı yetkisine izin vermiş olursunuz.
                </p>
              </div>
            </motion.div>

            {/* Fesih */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="glass-card p-6 md:p-8 rounded-2xl"
            >
              <div className="flex items-start gap-4 mb-4">
                <div className="w-12 h-12 rounded-xl bg-[var(--fusion-error)]/10 flex items-center justify-center flex-shrink-0">
                  <XCircle className="w-6 h-6 text-[var(--fusion-error)]" />
                </div>
                <h2 className="text-xl md:text-2xl font-bold">Fesih</h2>
              </div>
              <p className="text-[var(--foreground-secondary)] leading-relaxed mb-4">
                FusionMarkt veya siz bu Sözleşmeyi istediğiniz zaman feshedebilirsiniz. Bu web sitesinden elde edilen tüm materyalleri imha ederek bu Sözleşmeyi feshedebilirsiniz.
              </p>
              <p className="text-[var(--foreground-secondary)] leading-relaxed">
                FusionMarkt, kendi kararına göre, bu Sözleşmenin herhangi bir şartını veya koşulunu ihlal etmeniz halinde, bu Sözleşmeyi bildirimde bulunmaksızın derhal feshedebilir.
              </p>
            </motion.div>

            {/* Uluslararası Nakliye ve İhracat */}
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
                <h2 className="text-xl md:text-2xl font-bold">Uluslararası Nakliye ve İhracat</h2>
              </div>
              
              <div className="grid md:grid-cols-2 gap-4">
                <div className="p-5 rounded-xl bg-[var(--glass-bg)] border border-[var(--glass-border)]">
                  <h3 className="font-semibold mb-3 flex items-center gap-2">
                    <Globe className="w-5 h-5 text-[var(--fusion-primary)]" />
                    Uluslararası Nakliye
                  </h3>
                  <p className="text-sm text-[var(--foreground-secondary)]">
                    Bazı üreticiler, bazı ürünlerini Türkiye dışında satmamızı kısıtlamaktadır.
                  </p>
                </div>
                <div className="p-5 rounded-xl bg-[var(--glass-bg)] border border-[var(--glass-border)]">
                  <h3 className="font-semibold mb-3 flex items-center gap-2">
                    <ShieldAlert className="w-5 h-5 text-[var(--fusion-warning)]" />
                    İhracat Yasaklaması
                  </h3>
                  <p className="text-sm text-[var(--foreground-secondary)]">
                    Sattığımız ürünler, Türkiye Cumhuriyeti ihracat kontrol yasalarına ve düzenlemelerine tabidir. Bu ürünlerin ihracatı için gerekli lisansları veya izinleri almaktan müşterilerimiz sorumludur.
                  </p>
                </div>
              </div>
              
              <div className="mt-4 p-4 rounded-xl bg-[var(--fusion-warning)]/10 border border-[var(--fusion-warning)]/20">
                <p className="text-sm text-[var(--foreground-secondary)]">
                  <strong>Uyarı:</strong> Türkiye Cumhuriyeti ve ABD'nin ihracat düzenlemelerine uyulmaması halinde FusionMarkt hiçbir sorumluluk kabul etmez.
                </p>
              </div>
            </motion.div>

            {/* Sorular */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="glass-card p-6 md:p-8 rounded-2xl"
            >
              <div className="flex items-start gap-4 mb-4">
                <div className="w-12 h-12 rounded-xl bg-[var(--fusion-success)]/10 flex items-center justify-center flex-shrink-0">
                  <HelpCircle className="w-6 h-6 text-[var(--fusion-success)]" />
                </div>
                <h2 className="text-xl md:text-2xl font-bold">Sorularınız mı Var?</h2>
              </div>
              <p className="text-[var(--foreground-secondary)] leading-relaxed mb-4">
                Bu Sözleşmenin herhangi bir bölümüyle ilgili sorularınız varsa veya burada açıkça verilmeyen kullanım haklarıyla ilgili bilgi almak istiyorsanız, lütfen sorularınızı e-posta yoluyla bize iletin.
              </p>
              <a 
                href="mailto:websupport@fusionmarkt.com"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[var(--fusion-primary)] text-white font-medium hover:bg-[var(--fusion-primary-hover)] transition-colors"
              >
                <Mail className="w-5 h-5" />
                websupport@fusionmarkt.com
              </a>
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

