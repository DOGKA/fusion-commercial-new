/* eslint-disable react/no-unescaped-entities */
"use client";

import { motion } from "framer-motion";
import { 
  FileText, 
  Building2, 
  User, 
  Target, 
  Package, 
  CreditCard, 
  Truck,
  RotateCcw,
  Shield,
  Gavel,
  AlertTriangle,
  XCircle,
  Lock,
  Calendar,
  Mail,
  Phone,
  MapPin
} from "lucide-react";

export default function MesafeliSatisSozlesmesiPage() {
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
              Mesafeli Satış Sözleşmesi
            </h1>
            <p className="text-lg text-[var(--foreground-secondary)]">
              6502 sayılı Tüketicinin Korunması Hakkında Kanun kapsamında
            </p>
          </motion.div>
        </div>
      </section>

      {/* Content */}
      <section className="py-12 md:py-16">
        <div className="container px-4 md:px-6">
          <div className="max-w-4xl mx-auto space-y-10">
            
            {/* Taraflar - Satıcı */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="glass-card p-6 md:p-8 rounded-2xl"
            >
              <div className="flex items-start gap-4 mb-6">
                <div className="w-12 h-12 rounded-xl bg-[var(--fusion-primary)]/10 flex items-center justify-center flex-shrink-0">
                  <Building2 className="w-6 h-6 text-[var(--fusion-primary)]" />
                </div>
                <div>
                  <span className="text-xs font-medium text-[var(--fusion-primary)] uppercase tracking-wider">Taraflar</span>
                  <h2 className="text-xl md:text-2xl font-bold">Satıcı Bilgileri</h2>
                </div>
              </div>
              
              <div className="p-5 rounded-xl bg-[var(--glass-bg)] border border-[var(--glass-border)]">
                <h3 className="font-bold text-lg mb-4">ASDTC MÜHENDİSLİK TİCARET A.Ş. / FUSIONMARKT LLC</h3>
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <MapPin className="w-5 h-5 text-[var(--fusion-primary)] flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium">Genel Merkez Adresi</p>
                      <p className="text-sm text-[var(--foreground-secondary)]">
                        Turan Güneş Bulvarı, Cezayir Cd. No.6/7, Yıldızevler, ÇANKAYA, ANKARA, TÜRKİYE
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <MapPin className="w-5 h-5 text-[var(--fusion-accent)] flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium">İade Adresi</p>
                      <p className="text-sm text-[var(--foreground-secondary)]">
                        Turan Güneş Bulvarı, Cezayir Cd. No.6/7, Yıldızevler, ÇANKAYA, ANKARA, TÜRKİYE
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Phone className="w-5 h-5 text-[var(--fusion-primary)]" />
                    <a href="tel:+908508406160" className="text-sm text-[var(--foreground-secondary)] hover:text-[var(--fusion-primary)] transition-colors">
                      +90 850 840 6160
                    </a>
                  </div>
                  <div className="flex items-center gap-3">
                    <Mail className="w-5 h-5 text-[var(--fusion-primary)]" />
                    <a href="mailto:sales@fusionmarkt.com" className="text-sm text-[var(--foreground-secondary)] hover:text-[var(--fusion-primary)] transition-colors">
                      sales@fusionmarkt.com
                    </a>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Taraflar - Alıcı */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="glass-card p-6 md:p-8 rounded-2xl"
            >
              <div className="flex items-start gap-4 mb-6">
                <div className="w-12 h-12 rounded-xl bg-[var(--fusion-accent)]/10 flex items-center justify-center flex-shrink-0">
                  <User className="w-6 h-6 text-[var(--fusion-accent)]" />
                </div>
                <h2 className="text-xl md:text-2xl font-bold">Alıcı Bilgileri</h2>
              </div>
              
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="p-4 rounded-xl bg-[var(--glass-bg)] border border-[var(--glass-border)]">
                  <p className="text-xs text-[var(--foreground-tertiary)] mb-1">Ad/Soyad/Unvan</p>
                  <p className="text-sm font-medium">[ALICI Adı]</p>
                </div>
                <div className="p-4 rounded-xl bg-[var(--glass-bg)] border border-[var(--glass-border)]">
                  <p className="text-xs text-[var(--foreground-tertiary)] mb-1">T.C. Kimlik / Pasaport No</p>
                  <p className="text-sm font-medium">[Kimlik Numarası]</p>
                </div>
                <div className="p-4 rounded-xl bg-[var(--glass-bg)] border border-[var(--glass-border)]">
                  <p className="text-xs text-[var(--foreground-tertiary)] mb-1">Adres</p>
                  <p className="text-sm font-medium">[Adres]</p>
                </div>
                <div className="p-4 rounded-xl bg-[var(--glass-bg)] border border-[var(--glass-border)]">
                  <p className="text-xs text-[var(--foreground-tertiary)] mb-1">Telefon / E-posta</p>
                  <p className="text-sm font-medium">[İletişim Bilgileri]</p>
                </div>
              </div>
            </motion.div>

            {/* Konu */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="glass-card p-6 md:p-8 rounded-2xl"
            >
              <div className="flex items-start gap-4 mb-4">
                <div className="w-12 h-12 rounded-xl bg-[var(--fusion-success)]/10 flex items-center justify-center flex-shrink-0">
                  <Target className="w-6 h-6 text-[var(--fusion-success)]" />
                </div>
                <h2 className="text-xl md:text-2xl font-bold">Konu</h2>
              </div>
              <p className="text-[var(--foreground-secondary)] leading-relaxed mb-4">
                İşbu Mesafeli Satış Sözleşmesi'nin konusu, SATICI'ya ait www.fusionmarkt.com ve işbu sözleşme kapsamında ALICI tarafından online olarak verilen siparişe karşılık, satış bedelinin ALICI tarafından ödenmesi, ürünlerin teslimi ve tarafların 27.11.2014 tarihli Resmi Gazete'de yayınlanan Mesafeli Satışlar Yönetmeliği ve 6502 sayılı Tüketicinin Korunması Hakkında Kanun kapsamındaki diğer hak ve yükümlülükleri kapsamaktadır.
              </p>
              <div className="p-4 rounded-xl bg-[var(--glass-bg)] border border-[var(--glass-border)]">
                <p className="text-sm text-[var(--foreground-secondary)]">
                  <strong>Not:</strong> Montaj hizmeti işbu Sözleşme'nin konu ve kapsamı dışında tutulmuş olup, talep edilmesi halinde ayrı bir sözleşme ile düzenlenecektir.
                </p>
              </div>
            </motion.div>

            {/* Sözleşme Kapsamındaki Ürünler */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="glass-card p-6 md:p-8 rounded-2xl"
            >
              <div className="flex items-start gap-4 mb-6">
                <div className="w-12 h-12 rounded-xl bg-[var(--fusion-primary)]/10 flex items-center justify-center flex-shrink-0">
                  <Package className="w-6 h-6 text-[var(--fusion-primary)]" />
                </div>
                <h2 className="text-xl md:text-2xl font-bold">Sözleşme Kapsamındaki Ürünler</h2>
              </div>
              
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-[var(--glass-border)]">
                      <th className="text-left py-3 px-4 font-semibold">Ürün Adı</th>
                      <th className="text-left py-3 px-4 font-semibold">Ürün Kodu</th>
                      <th className="text-left py-3 px-4 font-semibold">Detay</th>
                      <th className="text-right py-3 px-4 font-semibold">Fiyat</th>
                    </tr>
                  </thead>
                  <tbody className="text-[var(--foreground-secondary)]">
                    <tr className="border-b border-[var(--glass-border)]/50">
                      <td className="py-3 px-4">[Ürün Adı]</td>
                      <td className="py-3 px-4">[Ürün Kodu]</td>
                      <td className="py-3 px-4">[Model/Renk]</td>
                      <td className="py-3 px-4 text-right font-medium">[KDV Dahil Fiyat]</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </motion.div>

            {/* Ödeme */}
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
                <h2 className="text-xl md:text-2xl font-bold">Ödeme</h2>
              </div>
              
              <div className="space-y-4">
                <div className="p-4 rounded-xl bg-[var(--fusion-warning)]/10 border border-[var(--fusion-warning)]/20">
                  <p className="text-sm text-[var(--foreground-secondary)]">
                    <strong>Minimum Sipariş:</strong> İnternet mağazasında minimum sipariş tutarı 150 TL'dir.
                  </p>
                </div>
                
                <p className="text-[var(--foreground-secondary)] leading-relaxed">
                  ALICI, işbu Sözleşme kapsamında sipariş verdiği ürün(ler) için KDV dahil satış bedelini ve kargo ücretlerini Sözleşme'de belirtilen ödeme koşullarına uygun olarak ödeyecektir.
                </p>

                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="p-4 rounded-xl bg-[var(--glass-bg)] border border-[var(--glass-border)]">
                    <h4 className="font-semibold mb-2">Kabul Edilen Kartlar</h4>
                    <p className="text-sm text-[var(--foreground-secondary)]">Visa, Amex, MasterCard kredi kartları</p>
                  </div>
                  <div className="p-4 rounded-xl bg-[var(--glass-bg)] border border-[var(--glass-border)]">
                    <h4 className="font-semibold mb-2">Ön Provizyon</h4>
                    <p className="text-sm text-[var(--foreground-secondary)]">Siparişler banka onayı sonrası işleme alınır</p>
                  </div>
                </div>

                <p className="text-sm text-[var(--foreground-tertiary)]">
                  Promosyonlar ve indirimler, ürünün sipariş tarihinde geçerli ise uygulanacaktır. SATICI, bankaların kesintileri veya ücretlerinden sorumlu değildir.
                </p>
              </div>
            </motion.div>

            {/* Teslimat */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="glass-card p-6 md:p-8 rounded-2xl"
            >
              <div className="flex items-start gap-4 mb-6">
                <div className="w-12 h-12 rounded-xl bg-[var(--fusion-success)]/10 flex items-center justify-center flex-shrink-0">
                  <Truck className="w-6 h-6 text-[var(--fusion-success)]" />
                </div>
                <h2 className="text-xl md:text-2xl font-bold">Teslimat</h2>
              </div>
              
              <p className="text-[var(--foreground-secondary)] leading-relaxed mb-4">
                ALICI tarafından internet üzerinden siparişi verilen ürün/ürünler, verilen <strong>30 (otuz) günlük</strong> yasal süre içerisinde SATICI'nın anlaşmalı kargo şirketi tarafından ALICI'ya veya ALICI'nın belirttiği adreste bulunan kişilere teslim edilir.
              </p>

              <div className="grid sm:grid-cols-2 gap-4 mb-4">
                <div className="p-4 rounded-xl bg-[var(--fusion-primary)]/10 border border-[var(--fusion-primary)]/20">
                  <h4 className="font-semibold mb-2">Aynı Gün Teslimat</h4>
                  <p className="text-sm text-[var(--foreground-secondary)]">Ürünler siparişin verildiği gün teslim edilir.</p>
                </div>
                <div className="p-4 rounded-xl bg-[var(--fusion-accent)]/10 border border-[var(--fusion-accent)]/20">
                  <h4 className="font-semibold mb-2">Randevulu Teslimat</h4>
                  <p className="text-sm text-[var(--foreground-secondary)]">ALICI'nın belirlediği tarihte teslim edilir.</p>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-[var(--glass-bg)] border border-[var(--glass-border)]">
                <p className="text-sm text-[var(--foreground-secondary)]">
                  <strong>Not:</strong> ALICI'nın teslimat sırasında adreste bulunmaması halinde dahi SATICI edimini eksiksiz olarak yerine getirmiş sayılacaktır.
                </p>
              </div>
            </motion.div>

            {/* Cayma Hakkı */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="glass-card p-6 md:p-8 rounded-2xl"
            >
              <div className="flex items-start gap-4 mb-6">
                <div className="w-12 h-12 rounded-xl bg-[var(--fusion-warning)]/10 flex items-center justify-center flex-shrink-0">
                  <RotateCcw className="w-6 h-6 text-[var(--fusion-warning)]" />
                </div>
                <h2 className="text-xl md:text-2xl font-bold">Cayma Hakkı</h2>
              </div>
              
              <div className="p-5 rounded-xl bg-[var(--fusion-success)]/10 border border-[var(--fusion-success)]/20 mb-6">
                <p className="text-[var(--foreground-secondary)]">
                  ALICI, Sözleşme kapsamındaki ürünlerin kendisine veya gösterdiği adresteki kişiye tesliminden itibaren <strong>14 (on dört) gün</strong> içinde cayma hakkını kullanabilir.
                </p>
              </div>

              <h3 className="font-semibold mb-3">Cayma Hakkı Şartları:</h3>
              <div className="space-y-3 mb-6">
                <div className="flex items-start gap-3 p-3 rounded-lg bg-[var(--glass-bg)] border border-[var(--glass-border)]">
                  <div className="w-2 h-2 rounded-full bg-[var(--fusion-success)] mt-2" />
                  <span className="text-sm text-[var(--foreground-secondary)]">Ürünler tekrar satılabilir durumda, hasarsız ve orijinal ambalajında olmalıdır</span>
                </div>
                <div className="flex items-start gap-3 p-3 rounded-lg bg-[var(--glass-bg)] border border-[var(--glass-border)]">
                  <div className="w-2 h-2 rounded-full bg-[var(--fusion-success)] mt-2" />
                  <span className="text-sm text-[var(--foreground-secondary)]">SATICI'ya yazılı veya müşteri hizmetleri aracılığıyla bildirimde bulunulmalıdır</span>
                </div>
                <div className="flex items-start gap-3 p-3 rounded-lg bg-[var(--glass-bg)] border border-[var(--glass-border)]">
                  <div className="w-2 h-2 rounded-full bg-[var(--fusion-success)] mt-2" />
                  <span className="text-sm text-[var(--foreground-secondary)]">İade masrafları SATICI tarafından karşılanacaktır</span>
                </div>
              </div>

              <h3 className="font-semibold mb-3">Cayma Hakkı Kapsamı Dışındaki Ürünler:</h3>
              <div className="space-y-2">
                <div className="flex items-start gap-3 p-3 rounded-lg bg-[var(--fusion-error)]/5 border border-[var(--fusion-error)]/10">
                  <XCircle className="w-4 h-4 text-[var(--fusion-error)] flex-shrink-0 mt-0.5" />
                  <span className="text-sm text-[var(--foreground-secondary)]">Fiyatı finansal piyasalardaki dalgalanmalara bağlı olarak değişen ürünler</span>
                </div>
                <div className="flex items-start gap-3 p-3 rounded-lg bg-[var(--fusion-error)]/5 border border-[var(--fusion-error)]/10">
                  <XCircle className="w-4 h-4 text-[var(--fusion-error)] flex-shrink-0 mt-0.5" />
                  <span className="text-sm text-[var(--foreground-secondary)]">Sağlık ve hijyen nedenleriyle iade edilemeyen ürünler</span>
                </div>
                <div className="flex items-start gap-3 p-3 rounded-lg bg-[var(--fusion-error)]/5 border border-[var(--fusion-error)]/10">
                  <XCircle className="w-4 h-4 text-[var(--fusion-error)] flex-shrink-0 mt-0.5" />
                  <span className="text-sm text-[var(--foreground-secondary)]">Kişisel ihtiyaçlara göre hazırlanan ürünler</span>
                </div>
              </div>

              <div className="mt-6 p-4 rounded-xl bg-[var(--fusion-primary)]/10 border border-[var(--fusion-primary)]/20">
                <p className="text-sm text-[var(--foreground-secondary)]">
                  <strong>İade Süresi:</strong> Cayma hakkının kullanılması halinde, ürünlerin iadesi sonrası 14 gün içinde ödenen tutar ALICI'ya iade edilir.
                </p>
              </div>
            </motion.div>

            {/* Garanti ve Sorumluluk */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="glass-card p-6 md:p-8 rounded-2xl"
            >
              <div className="flex items-start gap-4 mb-6">
                <div className="w-12 h-12 rounded-xl bg-[var(--fusion-success)]/10 flex items-center justify-center flex-shrink-0">
                  <Shield className="w-6 h-6 text-[var(--fusion-success)]" />
                </div>
                <h2 className="text-xl md:text-2xl font-bold">Garanti ve Sorumluluk</h2>
              </div>
              
              <div className="grid md:grid-cols-2 gap-4 mb-4">
                <div className="p-5 rounded-xl bg-[var(--fusion-success)]/10 border border-[var(--fusion-success)]/20">
                  <h4 className="font-bold text-2xl mb-1">2 Yıl</h4>
                  <p className="text-sm text-[var(--foreground-secondary)]">Garanti süresi, ürünün teslimat tarihinden itibaren geçerlidir.</p>
                </div>
                <div className="p-5 rounded-xl bg-[var(--glass-bg)] border border-[var(--glass-border)]">
                  <h4 className="font-semibold mb-2">Değişim Durumu</h4>
                  <p className="text-sm text-[var(--foreground-secondary)]">Garanti kapsamında değiştirilen ürünler için süre, ilk ürünün kalan garanti süresi ile sınırlıdır.</p>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-[var(--fusion-warning)]/10 border border-[var(--fusion-warning)]/20">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="w-5 h-5 text-[var(--fusion-warning)] flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-[var(--foreground-secondary)]">
                    SATICI, garanti koşullarına uymayan veya yetkisiz müdahaleye uğramış ürünler için sorumluluk kabul etmez. ALICI, ürünlerin kullanım talimatlarına uygun olarak kullanılmaması durumunda doğacak zararlardan kendisinin sorumlu olduğunu kabul eder.
                  </p>
                </div>
              </div>
            </motion.div>

            {/* Kişisel Verilerin Korunması */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="glass-card p-6 md:p-8 rounded-2xl"
            >
              <div className="flex items-start gap-4 mb-4">
                <div className="w-12 h-12 rounded-xl bg-[var(--fusion-primary)]/10 flex items-center justify-center flex-shrink-0">
                  <Lock className="w-6 h-6 text-[var(--fusion-primary)]" />
                </div>
                <h2 className="text-xl md:text-2xl font-bold">Kişisel Verilerin Korunması</h2>
              </div>
              
              <p className="text-[var(--foreground-secondary)] leading-relaxed mb-4">
                SATICI, ALICI'ya ait kişisel bilgileri ilgili mevzuat kapsamında işleyebilir ve saklayabilir. ALICI, kişisel verilerinin işlenmesi ile ilgili her türlü talebi SATICI'ya iletebilir.
              </p>

              <div className="p-4 rounded-xl bg-[var(--glass-bg)] border border-[var(--glass-border)]">
                <h4 className="font-semibold mb-2">KVKK Kapsamında Haklarınız:</h4>
                <ul className="text-sm text-[var(--foreground-secondary)] space-y-1">
                  <li>• Kişisel verilerinizin işlenip işlenmediğini öğrenme</li>
                  <li>• Eksik veya hatalı işlenmişse düzeltilmesini isteme</li>
                  <li>• İşlenme amacının ortadan kalkması durumunda silinmesini talep etme</li>
                </ul>
              </div>
            </motion.div>

            {/* Uyuşmazlıkların Çözümü */}
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
                <h2 className="text-xl md:text-2xl font-bold">Uyuşmazlıkların Çözümü ve Yetkili Mahkemeler</h2>
              </div>
              
              <p className="text-[var(--foreground-secondary)] leading-relaxed mb-4">
                İşbu Sözleşme'nin uygulanmasından ve yorumlanmasından doğabilecek her türlü uyuşmazlıkların çözümünde Türk Hukuku uygulanacaktır.
              </p>

              <div className="grid md:grid-cols-2 gap-4">
                <div className="p-4 rounded-xl bg-[var(--glass-bg)] border border-[var(--glass-border)]">
                  <h4 className="font-semibold mb-2">Tüketici Hakem Heyetleri</h4>
                  <p className="text-sm text-[var(--foreground-secondary)]">6502 sayılı Kanun kapsamında başvuru yapılabilir.</p>
                </div>
                <div className="p-4 rounded-xl bg-[var(--glass-bg)] border border-[var(--glass-border)]">
                  <h4 className="font-semibold mb-2">Tüketici Mahkemeleri</h4>
                  <p className="text-sm text-[var(--foreground-secondary)]">Hakem heyeti sınırlarını aşan uyuşmazlıklar için yetkilidir.</p>
                </div>
              </div>

              <div className="mt-4 p-4 rounded-xl bg-[var(--fusion-primary)]/10 border border-[var(--fusion-primary)]/20">
                <p className="text-sm text-[var(--foreground-secondary)]">
                  <strong>Dil:</strong> ALICI ve SATICI arasında farklı dillerde yapılan sözleşmelerde çelişki olması halinde Türkçe versiyon geçerli olacaktır.
                </p>
              </div>
            </motion.div>

            {/* Mücbir Sebep */}
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
                <h2 className="text-xl md:text-2xl font-bold">Mücbir Sebep</h2>
              </div>
              
              <p className="text-[var(--foreground-secondary)] leading-relaxed mb-4">
                Mücbir sebep halleri (doğal afetler, savaş, ayaklanma, grev, salgın hastalıklar vb.) tarafların kontrolü dışında gelişen ve tarafların yükümlülüklerini yerine getirmesini engelleyen durumlardır.
              </p>

              <div className="p-4 rounded-xl bg-[var(--glass-bg)] border border-[var(--glass-border)]">
                <p className="text-sm text-[var(--foreground-secondary)]">
                  Mücbir sebep halinde SATICI, ALICI'ya durumu bildirir ve teslimat süresi ertelenebilir veya sipariş iptal edilerek iade yapılabilir.
                </p>
              </div>
            </motion.div>

            {/* Sözleşme Onayı */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="glass-card p-6 md:p-8 rounded-2xl"
            >
              <div className="flex items-start gap-4 mb-4">
                <div className="w-12 h-12 rounded-xl bg-[var(--fusion-success)]/10 flex items-center justify-center flex-shrink-0">
                  <Calendar className="w-6 h-6 text-[var(--fusion-success)]" />
                </div>
                <h2 className="text-xl md:text-2xl font-bold">Sözleşme Tarihi ve Onayı</h2>
              </div>
              
              <p className="text-[var(--foreground-secondary)] leading-relaxed mb-6">
                Bu sözleşme, ALICI tarafından elektronik ortamda onaylandığı tarihte yürürlüğe girer.
              </p>

              <div className="grid md:grid-cols-2 gap-4">
                <div className="p-5 rounded-xl bg-[var(--glass-bg)] border border-[var(--glass-border)]">
                  <p className="text-xs text-[var(--foreground-tertiary)] mb-1">SATICI</p>
                  <p className="font-semibold">ASDTC MÜHENDİSLİK TİCARET A.Ş. | FUSIONMARKT LLC</p>
                </div>
                <div className="p-5 rounded-xl bg-[var(--glass-bg)] border border-[var(--glass-border)]">
                  <p className="text-xs text-[var(--foreground-tertiary)] mb-1">ALICI</p>
                  <p className="font-semibold">[ALICI Adı/Soyadı]</p>
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

