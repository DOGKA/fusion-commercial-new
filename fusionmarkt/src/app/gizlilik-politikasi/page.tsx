"use client";

import { motion } from "framer-motion";
import { 
  Shield, 
  Lock, 
  Eye, 
  Database, 
  Globe, 
  Users, 
  FileCheck, 
  Mail, 
  Phone, 
  MapPin,
  Cookie,
  Settings,
  BarChart3,
  Megaphone,
  AlertCircle,
  CheckCircle,
  Building2,
  Scale
} from "lucide-react";

export default function GizlilikPolitikasiPage() {
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
              <Shield className="w-8 h-8 text-[var(--fusion-primary)]" />
            </div>
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4">
              Gizlilik Politikası ve Güvenlik
            </h1>
            <p className="text-lg text-[var(--foreground-secondary)]">
              Kişisel verilerinizin korunması bizim için önemlidir
            </p>
          </motion.div>
        </div>
      </section>

      {/* Content */}
      <section className="py-12 md:py-16">
        <div className="container px-4 md:px-6">
          <div className="max-w-4xl mx-auto space-y-10">
            
            {/* Biz Kimiz */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="glass-card p-6 md:p-8 rounded-2xl"
            >
              <div className="flex items-start gap-4 mb-4">
                <div className="w-12 h-12 rounded-xl bg-[var(--fusion-primary)]/10 flex items-center justify-center flex-shrink-0">
                  <Building2 className="w-6 h-6 text-[var(--fusion-primary)]" />
                </div>
                <h2 className="text-xl md:text-2xl font-bold">Biz Kimiz</h2>
              </div>
              <p className="text-[var(--foreground-secondary)] leading-relaxed mb-4">
                ASDTC Mühendislik Ticaret Ltd. Şti veya FusionMarkt LLC (www.fusionmarkt.com), Türkiye'de havacılık ve mühendislik teknolojisinin gelişmesinde, kritik parçaların ve elektrik ara bağlantı çözümlerinin, ağ çözümünün, elektronik bileşen çözümünün tedariki ve üretiminde en son yenilikleri destekleyen kaliteli hizmetler sunma konusunda büyük bir kapasiteye sahiptir.
              </p>
              <p className="text-[var(--foreground-secondary)] leading-relaxed mb-4">
                Mühendislik parçalarının yanı sıra kozmetik, gıda, giyim ve değerli taşlar üzerine kurulmuş bir online alışveriş platformudur.
              </p>
              <p className="text-[var(--foreground-secondary)] leading-relaxed">
                Perakende ve e-ticaret işinin doğası gereği, FusionMarkt'un başarılı bir şekilde faaliyet gösterebilmesi için genellikle tüketicilerimizden, kurumsal satış müşterilerimizden, bağlı kuruluşlarımızdan ve satıcılarımızdan kişisel bilgiler alması gerekir. FusionMarkt, özel, son derece gizli ve kişisel bilgilerin gizliliğini koruma ihtiyacının farkındadır.
              </p>
            </motion.div>

            {/* Politika Değişiklikleri */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="glass-card p-6 md:p-8 rounded-2xl"
            >
              <div className="flex items-start gap-4 mb-4">
                <div className="w-12 h-12 rounded-xl bg-[var(--fusion-warning)]/10 flex items-center justify-center flex-shrink-0">
                  <AlertCircle className="w-6 h-6 text-[var(--fusion-warning)]" />
                </div>
                <h2 className="text-xl md:text-2xl font-bold">FusionMarkt Gizlilik Politikasındaki Değişiklikler</h2>
              </div>
              <p className="text-[var(--foreground-secondary)] leading-relaxed">
                Bu gizlilik politikasını değiştirme hakkımız saklıdır. Değişiklik yaptığımızda, güncellenen politika burada yayınlanacak ve revizyon tarihi güncellenecektir. En son politika güncellemelerimiz hakkında bilgi sahibi olduğunuzdan emin olmak için tekrar başvurmanız önerilir.
              </p>
            </motion.div>

            {/* Politikanın Amacı */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="glass-card p-6 md:p-8 rounded-2xl"
            >
              <div className="flex items-start gap-4 mb-4">
                <div className="w-12 h-12 rounded-xl bg-[var(--fusion-accent)]/10 flex items-center justify-center flex-shrink-0">
                  <FileCheck className="w-6 h-6 text-[var(--fusion-accent)]" />
                </div>
                <h2 className="text-xl md:text-2xl font-bold">Bu Politikanın Amacı</h2>
              </div>
              <p className="text-[var(--foreground-secondary)] leading-relaxed mb-4">
                Bu Politika, FusionMarkt'u ve bağlı ortaklarını kapsar. FusionMarkt'un kişisel bilgilerinizi işlerken sahip olduğu yasal dayanağı, hakkınızda nasıl ve hangi verileri topladığımızı ve bu verilerle ne yaptığımızı açıklar.
              </p>
              <div className="p-4 rounded-xl bg-[var(--glass-bg)] border border-[var(--glass-border)]">
                <p className="text-sm text-[var(--foreground-secondary)]">
                  <strong>Kişisel bilgiler:</strong> Adınız, e-posta adresiniz, posta adresiniz, telefon numaranız vb. gibi sizinle ilgili her türlü bilgi.
                </p>
                <p className="text-sm text-[var(--foreground-secondary)] mt-2">
                  <strong>FusionMarkt Platformu:</strong> FusionMarkt web siteleri ve FusionMarkt mobil uygulaması.
                </p>
              </div>
            </motion.div>

            {/* Toplanan Veriler */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="glass-card p-6 md:p-8 rounded-2xl"
            >
              <div className="flex items-start gap-4 mb-6">
                <div className="w-12 h-12 rounded-xl bg-[var(--fusion-primary)]/10 flex items-center justify-center flex-shrink-0">
                  <Database className="w-6 h-6 text-[var(--fusion-primary)]" />
                </div>
                <h2 className="text-xl md:text-2xl font-bold">Sizden Topladığımız Veriler</h2>
              </div>
              
              <p className="text-[var(--foreground-secondary)] leading-relaxed mb-6">
                Kişisel bilgileri doğrudan sizden ve mobil cihazlar da dahil olmak üzere, platformumuzu kullandığınızda, bizde bir hesap açtığınızda, bize bir web formunda bilgi verdiğinizde, hesabınızı güncellediğinizde veya hesabınıza bilgi eklediğinizde, bir topluluk panosu tartışma sohbetine katıldığınızda veya bizimle başka bir şekilde iletişim kurduğunuzda kullandığınız herhangi bir cihazdan toplarız.
              </p>

              <h3 className="font-semibold text-lg mb-4">Bize Verdiğiniz Kişisel Bilgiler</h3>
              <div className="grid gap-4 mb-6">
                <div className="p-4 rounded-xl bg-[var(--glass-bg)] border border-[var(--glass-border)]">
                  <h4 className="font-semibold mb-2 flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-[var(--fusion-success)]" />
                    Hesap Kaydı
                  </h4>
                  <p className="text-sm text-[var(--foreground-secondary)]">
                    Bizde bir hesap için kaydolduğunuzda adınız, adresleriniz, telefon numaralarınız veya e-posta adresleriniz gibi tanımlayıcı bilgiler.
                  </p>
                </div>
                <div className="p-4 rounded-xl bg-[var(--glass-bg)] border border-[var(--glass-border)]">
                  <h4 className="font-semibold mb-2 flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-[var(--fusion-success)]" />
                    Satın Almalar
                  </h4>
                  <p className="text-sm text-[var(--foreground-secondary)]">
                    Bir siparişi işlemek ve satın aldığınız ürünleri size göndermek için kullanılan ad, telefon numarası, e-posta adresi, posta adresi, fatura ve diğer bilgiler.
                  </p>
                </div>
                <div className="p-4 rounded-xl bg-[var(--glass-bg)] border border-[var(--glass-border)]">
                  <h4 className="font-semibold mb-2 flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-[var(--fusion-success)]" />
                    Bizimle İletişime Geçmek
                  </h4>
                  <p className="text-sm text-[var(--foreground-secondary)]">
                    Bir web formu aracılığıyla, hesabınızı güncelleyerek veya hesabınıza bilgi ekleyerek, blog gönderilerine, topluluk tartışmalarına ve sohbetlere katılarak veya hizmetlerimizle ilgili olarak bizimle başka bir şekilde iletişim kurduğunuzda ek bilgiler sağlayabilirsiniz.
                  </p>
                </div>
                <div className="p-4 rounded-xl bg-[var(--glass-bg)] border border-[var(--glass-border)]">
                  <h4 className="font-semibold mb-2 flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-[var(--fusion-success)]" />
                    Kimlik Doğrulama
                  </h4>
                  <p className="text-sm text-[var(--foreground-secondary)]">
                    Kimliğinizi doğrulamak veya kimliğinizi belirlemek için geçerli ulusal yasalar tarafından toplamamız gereken bilgiler.
                  </p>
                </div>
              </div>

              <h3 className="font-semibold text-lg mb-4">Otomatik Olarak Topladığımız Bilgiler</h3>
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="p-4 rounded-xl bg-[var(--glass-bg)] border border-[var(--glass-border)]">
                  <Megaphone className="w-5 h-5 text-[var(--fusion-primary)] mb-2" />
                  <h4 className="font-semibold mb-1">Reklam</h4>
                  <p className="text-xs text-[var(--foreground-secondary)]">
                    Hizmetlerimizle etkileşiminiz, reklam tercihleriniz ve bizimle olan iletişiminiz hakkında bilgi.
                  </p>
                </div>
                <div className="p-4 rounded-xl bg-[var(--glass-bg)] border border-[var(--glass-border)]">
                  <BarChart3 className="w-5 h-5 text-[var(--fusion-accent)] mb-2" />
                  <h4 className="font-semibold mb-1">Reklam Analitiği</h4>
                  <p className="text-xs text-[var(--foreground-secondary)]">
                    Sayfa görüntülemeleri, trafik akışları, yönlendirme URL'leri, IP adresiniz ve tarama geçmişiniz.
                  </p>
                </div>
              </div>
            </motion.div>

            {/* EEA Hakları */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="glass-card p-6 md:p-8 rounded-2xl"
            >
              <div className="flex items-start gap-4 mb-6">
                <div className="w-12 h-12 rounded-xl bg-[var(--fusion-success)]/10 flex items-center justify-center flex-shrink-0">
                  <Scale className="w-6 h-6 text-[var(--fusion-success)]" />
                </div>
                <h2 className="text-xl md:text-2xl font-bold">EEA Kişisel Veri Haklarınız</h2>
              </div>
              <p className="text-[var(--foreground-secondary)] leading-relaxed mb-6">
                GDPR kapsamında, Avrupa Ekonomik Alanı'nda (EEA) ve Türkiye'de ikamet edenlerin aşağıdaki hakları vardır:
              </p>
              <div className="grid sm:grid-cols-2 gap-4">
                {[
                  { title: "Bilgilendirilme Hakkı", desc: "Kişisel bilgilerinizin nasıl ve ne amaçla toplandığını bilme hakkı." },
                  { title: "Erişim Talep Etme Hakkı", desc: "Kişisel bilgilerinize erişim talep etme ve işleme faaliyetleri hakkında bilgi alma hakkı." },
                  { title: "İtiraz Hakkı", desc: "Doğrudan pazarlama veya istatistiksel amaçlarla yapılan işlemlere itiraz hakkı." },
                  { title: "İşlemeyi Kısıtlama Hakkı", desc: "Kişisel bilgilerinizi geçici olarak işleme almayı durdurma hakkı." },
                  { title: "Silme Hakkı", desc: '"Unutulma hakkı" olarak da bilinir; bilgilerin silinmesini talep etme hakkıdır.' },
                  { title: "Düzeltme Hakkı", desc: "Yanlış bilgilerin düzeltilmesini talep etme hakkı." },
                  { title: "Veri Taşınabilirliği Hakkı", desc: "Kişisel bilgilerinizi başka bir hizmet sağlayıcıya aktarma hakkı." },
                ].map((right, index) => (
                  <div key={index} className="p-4 rounded-xl bg-[var(--glass-bg)] border border-[var(--glass-border)]">
                    <h4 className="font-semibold mb-1 text-sm">{right.title}</h4>
                    <p className="text-xs text-[var(--foreground-secondary)]">{right.desc}</p>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* CCPA ve KVKK - Desktop Tablo / Mobile Kartlar */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="glass-card p-6 md:p-8 rounded-2xl"
            >
              <h2 className="text-xl md:text-2xl font-bold mb-6">Kişisel Verilerin Toplanması (CCPA ve KVKK Uyumlu)</h2>
              
              {/* Desktop Tablo - md ve üstü */}
              <div className="hidden md:block overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-[var(--glass-border)]">
                      <th className="text-left py-3 px-4 font-semibold">Kategori</th>
                      <th className="text-left py-3 px-4 font-semibold">Toplanan Bilgiler</th>
                      <th className="text-left py-3 px-4 font-semibold">Amaç</th>
                    </tr>
                  </thead>
                  <tbody className="text-[var(--foreground-secondary)]">
                    <tr className="border-b border-[var(--glass-border)]/50">
                      <td className="py-3 px-4 font-medium">Tanımlayıcılar</td>
                      <td className="py-3 px-4">Ad, adres, e-posta, IP adresi, hesap adı</td>
                      <td className="py-3 px-4">Hesap Kaydı, Satın Almalar, Reklamcılık</td>
                    </tr>
                    <tr className="border-b border-[var(--glass-border)]/50">
                      <td className="py-3 px-4 font-medium">İletişim Bilgileri</td>
                      <td className="py-3 px-4">Adres, telefon, e-posta</td>
                      <td className="py-3 px-4">Hesap Kaydı, Satın Almalar, Pazarlama</td>
                    </tr>
                    <tr className="border-b border-[var(--glass-border)]/50">
                      <td className="py-3 px-4 font-medium">Finansal Bilgiler</td>
                      <td className="py-3 px-4">Kredi kartı, banka hesabı</td>
                      <td className="py-3 px-4">Satın Almalar, Ödemeler, İadeler</td>
                    </tr>
                    <tr className="border-b border-[var(--glass-border)]/50">
                      <td className="py-3 px-4 font-medium">Ticari Bilgiler</td>
                      <td className="py-3 px-4">Satın alma geçmişi, tercihler</td>
                      <td className="py-3 px-4">Reklamcılık, Reklam Analitikleri</td>
                    </tr>
                    <tr className="border-b border-[var(--glass-border)]/50">
                      <td className="py-3 px-4 font-medium">Ağ Etkinliği</td>
                      <td className="py-3 px-4">Tarama geçmişi, arama geçmişi</td>
                      <td className="py-3 px-4">Reklamcılık, Pazarlama</td>
                    </tr>
                    <tr>
                      <td className="py-3 px-4 font-medium">Konum Verileri</td>
                      <td className="py-3 px-4">Fiziksel konum veya hareketler</td>
                      <td className="py-3 px-4">Reklamcılık, Analitik</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Mobile Kartlar - md altı */}
              <div className="md:hidden space-y-3">
                {[
                  { kategori: "Tanımlayıcılar", bilgi: "Ad, adres, e-posta, IP adresi, hesap adı", amac: "Hesap Kaydı, Satın Almalar, Reklamcılık" },
                  { kategori: "İletişim Bilgileri", bilgi: "Adres, telefon, e-posta", amac: "Hesap Kaydı, Satın Almalar, Pazarlama" },
                  { kategori: "Finansal Bilgiler", bilgi: "Kredi kartı, banka hesabı", amac: "Satın Almalar, Ödemeler, İadeler" },
                  { kategori: "Ticari Bilgiler", bilgi: "Satın alma geçmişi, tercihler", amac: "Reklamcılık, Reklam Analitikleri" },
                  { kategori: "Ağ Etkinliği", bilgi: "Tarama geçmişi, arama geçmişi", amac: "Reklamcılık, Pazarlama" },
                  { kategori: "Konum Verileri", bilgi: "Fiziksel konum veya hareketler", amac: "Reklamcılık, Analitik" },
                ].map((item, index) => (
                  <div key={index} className="p-4 rounded-xl bg-[var(--glass-bg)] border border-[var(--glass-border)]">
                    <h4 className="font-semibold text-sm mb-3 text-[var(--fusion-primary)]">{item.kategori}</h4>
                    <div className="space-y-2">
                      <div>
                        <p className="text-xs text-[var(--foreground-tertiary)] mb-0.5">Toplanan Bilgiler</p>
                        <p className="text-sm text-[var(--foreground-secondary)]">{item.bilgi}</p>
                      </div>
                      <div>
                        <p className="text-xs text-[var(--foreground-tertiary)] mb-0.5">Amaç</p>
                        <p className="text-sm text-[var(--foreground-secondary)]">{item.amac}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Yasal Dayanak */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="glass-card p-6 md:p-8 rounded-2xl"
            >
              <h2 className="text-xl md:text-2xl font-bold mb-6">Veri Toplama ve İşlemenin Yasal Dayanağı</h2>
              
              <div className="space-y-6">
                <div>
                  <h3 className="font-semibold text-lg mb-3 flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-[var(--fusion-primary)]" />
                    Sözleşmenin Yerine Getirilmesi
                  </h3>
                  <ul className="text-sm text-[var(--foreground-secondary)] space-y-2 pl-4">
                    <li>• Platformumuza kullanıcı olarak kaydınızı yönetmek</li>
                    <li>• Siparişleri tamamlamak ve nakliye gereksinimlerini yerine getirmek</li>
                    <li>• Ödemeleri işlemek</li>
                    <li>• Garanti hizmetleri sunmak veya üreticiyle iletişim sağlamak</li>
                    <li>• Müşteri geri bildirimi toplamak ve platform deneyimini iyileştirmek</li>
                  </ul>
                </div>

                <div>
                  <h3 className="font-semibold text-lg mb-3 flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-[var(--fusion-accent)]" />
                    Yasal Yükümlülükler
                  </h3>
                  <ul className="text-sm text-[var(--foreground-secondary)] space-y-2 pl-4">
                    <li>• Vergi ve mali raporlama yükümlülüklerine uymak</li>
                    <li>• Yasal işlemleri takip etmek ve yükümlülükleri yerine getirmek</li>
                    <li>• Veri sahibi haklarınıza ilişkin taleplerle ilgilenmek</li>
                    <li>• Yasal talepleri ve soruşturmaları desteklemek</li>
                  </ul>
                </div>

                <div>
                  <h3 className="font-semibold text-lg mb-3 flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-[var(--fusion-success)]" />
                    Meşru Menfaatler
                  </h3>
                  <ul className="text-sm text-[var(--foreground-secondary)] space-y-2 pl-4">
                    <li>• Hizmet kalitesini artırmak için web sitesi ve müşteri deneyimi verilerini analiz etmek</li>
                    <li>• Kişiselleştirilmiş reklamlar ve kampanyalar sunmak</li>
                    <li>• Platform performansını artırmak</li>
                    <li>• Dolandırıcılığı önlemek ve kullanıcı güvenliğini artırmak</li>
                  </ul>
                </div>

                <div>
                  <h3 className="font-semibold text-lg mb-3 flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-[var(--fusion-warning)]" />
                    Rızaya Dayalı İşleme
                  </h3>
                  <ul className="text-sm text-[var(--foreground-secondary)] space-y-2 pl-4">
                    <li>• Pazarlama amaçlı e-posta, SMS ve anlık bildirimler göndermek</li>
                    <li>• Platform üzerinde ve üçüncü taraf sitelerde hedefli reklamlar sunmak</li>
                    <li>• Kişisel bilgileri iş ortaklarımızla paylaşmak ve analiz etmek</li>
                  </ul>
                </div>
              </div>
            </motion.div>

            {/* Onay Geri Çekme */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="glass-card p-6 md:p-8 rounded-2xl"
            >
              <h2 className="text-xl md:text-2xl font-bold mb-6">Onayınızı Nasıl Geri Çekebilirsiniz</h2>
              <div className="grid sm:grid-cols-3 gap-4">
                <div className="p-4 rounded-xl bg-[var(--glass-bg)] border border-[var(--glass-border)]">
                  <Mail className="w-6 h-6 text-[var(--fusion-primary)] mb-3" />
                  <h4 className="font-semibold mb-2">E-posta Pazarlama</h4>
                  <p className="text-xs text-[var(--foreground-secondary)]">
                    Profilinizdeki E-posta tercihleri sayfasından veya e-postaların altındaki bağlantılardan abonelikten çıkabilirsiniz.
                  </p>
                </div>
                <div className="p-4 rounded-xl bg-[var(--glass-bg)] border border-[var(--glass-border)]">
                  <Cookie className="w-6 h-6 text-[var(--fusion-accent)] mb-3" />
                  <h4 className="font-semibold mb-2">Reklam</h4>
                  <p className="text-xs text-[var(--foreground-secondary)]">
                    Çerez tercihleri sayfamızdaki uygun çerezlerin işaretini kaldırarak vazgeçebilirsiniz.
                  </p>
                </div>
                <div className="p-4 rounded-xl bg-[var(--glass-bg)] border border-[var(--glass-border)]">
                  <Settings className="w-6 h-6 text-[var(--fusion-success)] mb-3" />
                  <h4 className="font-semibold mb-2">Push Bildirimleri</h4>
                  <p className="text-xs text-[var(--foreground-secondary)]">
                    Web tarayıcısı ayarlarınızda veya mobil uygulama ayarlarında yapılandırabilirsiniz.
                  </p>
                </div>
              </div>
            </motion.div>

            {/* Çerezler */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="glass-card p-6 md:p-8 rounded-2xl"
            >
              <div className="flex items-start gap-4 mb-6">
                <div className="w-12 h-12 rounded-xl bg-[var(--fusion-warning)]/10 flex items-center justify-center flex-shrink-0">
                  <Cookie className="w-6 h-6 text-[var(--fusion-warning)]" />
                </div>
                <h2 className="text-xl md:text-2xl font-bold">FusionMarkt Çerezleri ve Çerez Türleri</h2>
              </div>
              <p className="text-[var(--foreground-secondary)] leading-relaxed mb-6">
                Platformumuzu ziyaret ettiğinizde, biz veya yetkili hizmet sağlayıcılarımız, reklam amacıyla size daha iyi, daha hızlı ve daha güvenli bir deneyim sunmaya yardımcı olmak üzere bilgi depolamak için çerezler, web işaretçileri ve diğer benzer teknolojileri kullanabiliriz.
              </p>
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="p-4 rounded-xl bg-[var(--glass-bg)] border border-[var(--glass-border)]">
                  <h4 className="font-semibold mb-2">Temel Web Sitesi İşlemleri</h4>
                  <p className="text-xs text-[var(--foreground-secondary)]">Sepete ürün ekleme, form gönderimi gibi işlevlerin çalışmasını sağlar.</p>
                </div>
                <div className="p-4 rounded-xl bg-[var(--glass-bg)] border border-[var(--glass-border)]">
                  <h4 className="font-semibold mb-2">Performans ve İşlevsellik</h4>
                  <p className="text-xs text-[var(--foreground-secondary)]">Platform işlevselliğini geliştirmeye yardımcı olur.</p>
                </div>
                <div className="p-4 rounded-xl bg-[var(--glass-bg)] border border-[var(--glass-border)]">
                  <h4 className="font-semibold mb-2">Analitik</h4>
                  <p className="text-xs text-[var(--foreground-secondary)]">Web sitesi kullanımını anlamamıza ve geliştirmemize yardımcı olur.</p>
                </div>
                <div className="p-4 rounded-xl bg-[var(--glass-bg)] border border-[var(--glass-border)]">
                  <h4 className="font-semibold mb-2">Reklamcılık</h4>
                  <p className="text-xs text-[var(--foreground-secondary)]">Davranışsal bilgiler toplayarak reklam mesajlarını özelleştirir.</p>
                </div>
              </div>
            </motion.div>

            {/* Bilgi Koruma */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="glass-card p-6 md:p-8 rounded-2xl"
            >
              <div className="flex items-start gap-4 mb-4">
                <div className="w-12 h-12 rounded-xl bg-[var(--fusion-success)]/10 flex items-center justify-center flex-shrink-0">
                  <Lock className="w-6 h-6 text-[var(--fusion-success)]" />
                </div>
                <h2 className="text-xl md:text-2xl font-bold">Bilgilerinizi Nasıl Koruyoruz</h2>
              </div>
              <p className="text-[var(--foreground-secondary)] leading-relaxed mb-4">
                Kişisel bilgilerinizi yetkisiz erişime karşı korumak için uygun güvenlik önlemleri uygulamaktayız. Verilerinizi korumak için çalışanlarımızı gizlilik politikaları konusunda eğitir, düzenli güvenlik denetimleri yapar ve endüstri standartlarına uygun güvenlik önlemleri uygularız.
              </p>
              <div className="p-4 rounded-xl bg-[var(--fusion-warning)]/10 border border-[var(--fusion-warning)]/20">
                <p className="text-sm text-[var(--foreground-secondary)]">
                  <strong>Önemli:</strong> Hiçbir sistem %100 güvenli değildir. Bilgilerinizi yalnızca gerekli olduğu sürece saklarız ve saklama süreleri yasal gerekliliklere uygun olarak belirlenir.
                </p>
              </div>
            </motion.div>

            {/* Uluslararası Aktarımlar */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="glass-card p-6 md:p-8 rounded-2xl"
            >
              <div className="flex items-start gap-4 mb-4">
                <div className="w-12 h-12 rounded-xl bg-[var(--fusion-primary)]/10 flex items-center justify-center flex-shrink-0">
                  <Globe className="w-6 h-6 text-[var(--fusion-primary)]" />
                </div>
                <h2 className="text-xl md:text-2xl font-bold">Uluslararası Bilgi Aktarımları</h2>
              </div>
              <p className="text-[var(--foreground-secondary)] leading-relaxed mb-4">
                FusionMarkt, küresel erişime sahip olsa da kişisel bilgilerinizi coğrafi sınırların ötesine yalnızca yasal gerekçelerle veya sizin izninizle aktarır. Talep edilmedikçe, üçüncü taraflara bu bilgileri sağlamayız.
              </p>
              <p className="text-[var(--foreground-secondary)] leading-relaxed">
                FusionMarkt, AB-ABD Veri Gizliliği Çerçevesi'ne ve Türkiye'deki Kişisel Verilerin Korunması Kanunu'na (KVKK) uyumlu olarak veri aktarımlarını düzenler.
              </p>
            </motion.div>

            {/* Şikayet */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="glass-card p-6 md:p-8 rounded-2xl"
            >
              <h2 className="text-xl md:text-2xl font-bold mb-4">Şikayet ve Sorun Bildirimi</h2>
              <p className="text-[var(--foreground-secondary)] leading-relaxed mb-4">
                FusionMarkt ile ilgili herhangi bir gizlilik şikayetiniz varsa, <a href="mailto:compliance@fusionmarkt.com" className="text-[var(--fusion-primary)] hover:underline">compliance@fusionmarkt.com</a> adresine yazabilirsiniz.
              </p>
              <p className="text-[var(--foreground-secondary)] leading-relaxed">
                Alternatif olarak, Türkiye'de KVKK veya ABD'de Veri Gizliliği Çerçevesi ile ilgili şikayetlerinizi ilgili yasal mercilere iletebilirsiniz. Çözülmeyen şikayetleriniz için BBB Ulusal Programları tarafından sunulan ücretsiz anlaşmazlık çözüm mekanizmasından yararlanabilirsiniz.
              </p>
            </motion.div>

            {/* İletişim Bilgileri */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="glass-card p-6 md:p-8 rounded-2xl"
            >
              <h2 className="text-xl md:text-2xl font-bold mb-6">İletişim Bilgileri</h2>
              <div className="p-6 rounded-xl bg-[var(--glass-bg)] border border-[var(--glass-border)]">
                <h3 className="font-bold text-lg mb-4">Hukuk Departmanı: ASDTC Mühendislik ve Ticaret A.Ş.</h3>
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <MapPin className="w-5 h-5 text-[var(--fusion-primary)] flex-shrink-0 mt-0.5" />
                    <span className="text-[var(--foreground-secondary)]">
                      Turan Güneş Bulvarı, Cezayir Cad. No:6/7 Yıldızevler, 06550 Çankaya/Ankara, Türkiye
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Mail className="w-5 h-5 text-[var(--fusion-primary)]" />
                    <a href="mailto:compliance@fusionmarkt.com" className="text-[var(--foreground-secondary)] hover:text-[var(--fusion-primary)] transition-colors">
                      compliance@fusionmarkt.com
                    </a>
                  </div>
                  <div className="flex items-center gap-3">
                    <Globe className="w-5 h-5 text-[var(--fusion-primary)]" />
                    <a href="https://www.fusionmarkt.com" className="text-[var(--foreground-secondary)] hover:text-[var(--fusion-primary)] transition-colors">
                      www.fusionmarkt.com
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

