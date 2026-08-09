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
  Lock,
  Calendar,
  Mail,
  MapPin
} from "lucide-react";
import {
  DISTANCE_CONTRACT_SELLER,
  DISTANCE_CONTRACT_TEXT,
  DISTANCE_CONTRACT_VERSION_LABEL,
} from "@/lib/distance-contract-content";

export default function MesafeliSatisSozlesmesiPage() {
  return (
    <div data-page-root className="min-h-screen bg-[var(--background)]">
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
              <div className="mb-6">
                <span className="text-xs font-medium text-[var(--fusion-primary)] uppercase tracking-wider">Taraflar</span>
                <h2 className="text-xl md:text-2xl font-bold flex items-center gap-3">
                  <Building2 className="w-6 h-6 text-[var(--fusion-primary)] flex-shrink-0" />
                  Satıcı Bilgileri
                </h2>
              </div>
              
              <div className="p-5 rounded-xl bg-[var(--glass-bg)] border border-[var(--glass-border)]">
                <h3 className="font-bold text-lg mb-4">{DISTANCE_CONTRACT_SELLER.title}</h3>
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <MapPin className="w-5 h-5 text-[var(--fusion-primary)] flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium">Genel Merkez Adresi</p>
                      <p className="text-sm text-[var(--foreground-secondary)]">
                        {DISTANCE_CONTRACT_SELLER.address}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <MapPin className="w-5 h-5 text-[var(--fusion-accent)] flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium">İade Adresi</p>
                      <p className="text-sm text-[var(--foreground-secondary)]">
                        {DISTANCE_CONTRACT_SELLER.returnAddress}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <FileText className="w-5 h-5 text-[var(--fusion-primary)]" />
                    <a href={DISTANCE_CONTRACT_SELLER.contactUrl} className="text-sm text-[var(--foreground-secondary)] hover:text-[var(--fusion-primary)] transition-colors">
                      İletişim formu
                    </a>
                  </div>
                  <div className="flex items-center gap-3">
                    <Mail className="w-5 h-5 text-[var(--fusion-primary)]" />
                    <a href="mailto:sales@fusionmarkt.com" className="text-sm text-[var(--foreground-secondary)] hover:text-[var(--fusion-primary)] transition-colors">
                      {DISTANCE_CONTRACT_SELLER.email}
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
              <div className="flex items-center gap-3 mb-6">
                <User className="w-6 h-6 text-[var(--fusion-accent)] flex-shrink-0" />
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
              <div className="flex items-center gap-3 mb-4">
                <Target className="w-6 h-6 text-[var(--fusion-success)] flex-shrink-0" />
                <h2 className="text-xl md:text-2xl font-bold">Konu</h2>
              </div>
              <p className="text-[var(--foreground-secondary)] leading-relaxed mb-4">
                {DISTANCE_CONTRACT_TEXT.subject}
              </p>
              <div className="p-4 rounded-xl bg-[var(--glass-bg)] border border-[var(--glass-border)]">
                <p className="text-sm text-[var(--foreground-secondary)]">
                  {DISTANCE_CONTRACT_TEXT.montageNote}
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
              <div className="flex items-center gap-3 mb-6">
                <Package className="w-6 h-6 text-[var(--fusion-primary)] flex-shrink-0" />
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
              <div className="flex items-center gap-3 mb-6">
                <CreditCard className="w-6 h-6 text-[var(--fusion-accent)] flex-shrink-0" />
                <h2 className="text-xl md:text-2xl font-bold">Ödeme</h2>
              </div>
              
              <div className="space-y-4">
                <div className="p-4 rounded-xl bg-[var(--fusion-warning)]/10 border border-[var(--fusion-warning)]/20">
                  <p className="text-sm text-[var(--foreground-secondary)]">
                    {DISTANCE_CONTRACT_TEXT.minimumOrder}
                  </p>
                </div>
                
                <p className="text-[var(--foreground-secondary)] leading-relaxed">
                  {DISTANCE_CONTRACT_TEXT.payment}
                </p>

                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="p-4 rounded-xl bg-[var(--glass-bg)] border border-[var(--glass-border)]">
                    <h4 className="font-semibold mb-2">Kabul Edilen Kartlar</h4>
                    <p className="text-sm text-[var(--foreground-secondary)]">{DISTANCE_CONTRACT_TEXT.paymentNotes[0].replace("Kabul Edilen Kartlar: ", "")}</p>
                  </div>
                  <div className="p-4 rounded-xl bg-[var(--glass-bg)] border border-[var(--glass-border)]">
                    <h4 className="font-semibold mb-2">Ön Provizyon</h4>
                    <p className="text-sm text-[var(--foreground-secondary)]">{DISTANCE_CONTRACT_TEXT.paymentNotes[1].replace("Ön Provizyon: ", "")}</p>
                  </div>
                </div>

                <p className="text-sm text-[var(--foreground-tertiary)]">
                  {DISTANCE_CONTRACT_TEXT.promotions}
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
              <div className="flex items-center gap-3 mb-6">
                <Truck className="w-6 h-6 text-[var(--fusion-success)] flex-shrink-0" />
                <h2 className="text-xl md:text-2xl font-bold">Teslimat</h2>
              </div>
              
              <p className="text-[var(--foreground-secondary)] leading-relaxed mb-4">
                {DISTANCE_CONTRACT_TEXT.delivery}
              </p>

              <div className="grid sm:grid-cols-2 gap-4 mb-4">
                <div className="p-4 rounded-xl bg-[var(--fusion-primary)]/10 border border-[var(--fusion-primary)]/20">
                  <h4 className="font-semibold mb-2">Aynı Gün Teslimat</h4>
                  <p className="text-sm text-[var(--foreground-secondary)]">{DISTANCE_CONTRACT_TEXT.deliveryOptions[0].replace("Aynı Gün Teslimat: ", "")}</p>
                </div>
                <div className="p-4 rounded-xl bg-[var(--fusion-accent)]/10 border border-[var(--fusion-accent)]/20">
                  <h4 className="font-semibold mb-2">Randevulu Teslimat</h4>
                  <p className="text-sm text-[var(--foreground-secondary)]">{DISTANCE_CONTRACT_TEXT.deliveryOptions[1].replace("Randevulu Teslimat: ", "")}</p>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-[var(--glass-bg)] border border-[var(--glass-border)]">
                <p className="text-sm text-[var(--foreground-secondary)]">
                  {DISTANCE_CONTRACT_TEXT.deliveryNote}
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
              <div className="flex items-center gap-3 mb-6">
                <RotateCcw className="w-6 h-6 text-[var(--fusion-warning)] flex-shrink-0" />
                <h2 className="text-xl md:text-2xl font-bold">Cayma Hakkı</h2>
              </div>
              
              <div className="p-5 rounded-xl bg-[var(--fusion-success)]/10 border border-[var(--fusion-success)]/20 mb-6">
                <p className="text-[var(--foreground-secondary)]">
                  {DISTANCE_CONTRACT_TEXT.withdrawal}
                </p>
              </div>

              <h3 className="font-semibold mb-3">Cayma Hakkı Şartları:</h3>
              <div className="space-y-3 mb-6">
                {DISTANCE_CONTRACT_TEXT.withdrawalConditions.map((condition) => (
                  <div key={condition} className="flex items-start gap-3 p-3 rounded-lg bg-[var(--glass-bg)] border border-[var(--glass-border)]">
                    <div className="w-2 h-2 rounded-full bg-[var(--fusion-success)] mt-2" />
                    <span className="text-sm text-[var(--foreground-secondary)]">{condition}</span>
                  </div>
                ))}
              </div>

              <h3 className="font-semibold mb-3">Cayma Hakkı Kapsamı Dışındaki Ürünler:</h3>
              <div className="space-y-2">
                {DISTANCE_CONTRACT_TEXT.withdrawalExceptions.map((exception) => (
                  <div key={exception} className="p-3 rounded-lg bg-[var(--fusion-error)]/5 border border-[var(--fusion-error)]/10">
                    <span className="text-sm text-[var(--foreground-secondary)]">{exception}</span>
                  </div>
                ))}
              </div>

              <div className="mt-6 p-4 rounded-xl bg-[var(--fusion-primary)]/10 border border-[var(--fusion-primary)]/20">
                <p className="text-sm text-[var(--foreground-secondary)]">
                  {DISTANCE_CONTRACT_TEXT.refund}
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
              <div className="flex items-center gap-3 mb-6">
                <Shield className="w-6 h-6 text-[var(--fusion-success)] flex-shrink-0" />
                <h2 className="text-xl md:text-2xl font-bold">Garanti ve Sorumluluk</h2>
              </div>
              
              <div className="grid lg:grid-cols-2 gap-4 mb-4">
                <div className="p-5 rounded-xl bg-[var(--fusion-success)]/10 border border-[var(--fusion-success)]/20">
                  <h4 className="font-bold text-2xl mb-1">2 Yıl</h4>
                  <p className="text-sm text-[var(--foreground-secondary)]">{DISTANCE_CONTRACT_TEXT.warranty[0].replace("2 Yıl Garanti süresi, ", "Garanti süresi, ")}</p>
                </div>
                <div className="p-5 rounded-xl bg-[var(--glass-bg)] border border-[var(--glass-border)]">
                  <h4 className="font-semibold mb-2">Değişim Durumu</h4>
                  <p className="text-sm text-[var(--foreground-secondary)]">{DISTANCE_CONTRACT_TEXT.warranty[1].replace("Değişim Durumu: ", "")}</p>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-[var(--fusion-warning)]/10 border border-[var(--fusion-warning)]/20">
                <p className="text-sm text-[var(--foreground-secondary)]">
                  {DISTANCE_CONTRACT_TEXT.warranty[2]} {DISTANCE_CONTRACT_TEXT.warranty[3]}
                </p>
              </div>
            </motion.div>

            {/* Kişisel Verilerin Korunması */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="glass-card p-6 md:p-8 rounded-2xl"
            >
              <div className="flex items-center gap-3 mb-4">
                <Lock className="w-6 h-6 text-[var(--fusion-primary)] flex-shrink-0" />
                <h2 className="text-xl md:text-2xl font-bold">Kişisel Verilerin Korunması</h2>
              </div>
              
              <p className="text-[var(--foreground-secondary)] leading-relaxed mb-4">
                {DISTANCE_CONTRACT_TEXT.privacy}
              </p>

              <div className="p-4 rounded-xl bg-[var(--glass-bg)] border border-[var(--glass-border)]">
                <h4 className="font-semibold mb-2">KVKK Kapsamında Haklarınız:</h4>
                <ul className="text-sm text-[var(--foreground-secondary)] space-y-1">
                  {DISTANCE_CONTRACT_TEXT.privacyRights.map((right) => (
                    <li key={right}>• {right}</li>
                  ))}
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
              <div className="flex items-center gap-3 mb-4">
                <Gavel className="w-6 h-6 text-[var(--fusion-accent)] flex-shrink-0" />
                <h2 className="text-xl md:text-2xl font-bold">Uyuşmazlıkların Çözümü ve Yetkili Mahkemeler</h2>
              </div>
              
              <p className="text-[var(--foreground-secondary)] leading-relaxed mb-4">
                {DISTANCE_CONTRACT_TEXT.disputes}
              </p>

              <div className="grid lg:grid-cols-2 gap-4">
                <div className="p-4 rounded-xl bg-[var(--glass-bg)] border border-[var(--glass-border)]">
                  <h4 className="font-semibold mb-2">Tüketici Hakem Heyetleri</h4>
                  <p className="text-sm text-[var(--foreground-secondary)]">{DISTANCE_CONTRACT_TEXT.disputeOptions[0].replace("Tüketici Hakem Heyetleri: ", "")}</p>
                </div>
                <div className="p-4 rounded-xl bg-[var(--glass-bg)] border border-[var(--glass-border)]">
                  <h4 className="font-semibold mb-2">Tüketici Mahkemeleri</h4>
                  <p className="text-sm text-[var(--foreground-secondary)]">{DISTANCE_CONTRACT_TEXT.disputeOptions[1].replace("Tüketici Mahkemeleri: ", "")}</p>
                </div>
              </div>

              <div className="mt-4 p-4 rounded-xl bg-[var(--fusion-primary)]/10 border border-[var(--fusion-primary)]/20">
                <p className="text-sm text-[var(--foreground-secondary)]">
                  {DISTANCE_CONTRACT_TEXT.language}
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
              <div className="flex items-center gap-3 mb-4">
                <AlertTriangle className="w-6 h-6 text-[var(--fusion-error)] flex-shrink-0" />
                <h2 className="text-xl md:text-2xl font-bold">Mücbir Sebep</h2>
              </div>
              
              <p className="text-[var(--foreground-secondary)] leading-relaxed mb-4">
                {DISTANCE_CONTRACT_TEXT.forceMajeure}
              </p>

              <div className="p-4 rounded-xl bg-[var(--glass-bg)] border border-[var(--glass-border)]">
                <p className="text-sm text-[var(--foreground-secondary)]">
                  {DISTANCE_CONTRACT_TEXT.forceMajeureResult}
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
              <div className="flex items-center gap-3 mb-4">
                <Calendar className="w-6 h-6 text-[var(--fusion-success)] flex-shrink-0" />
                <h2 className="text-xl md:text-2xl font-bold">Sözleşme Tarihi ve Onayı</h2>
              </div>
              
              <p className="text-[var(--foreground-secondary)] leading-relaxed mb-6">
                {DISTANCE_CONTRACT_TEXT.acceptance}
              </p>

              <div className="grid lg:grid-cols-2 gap-4">
                <div className="p-5 rounded-xl bg-[var(--glass-bg)] border border-[var(--glass-border)]">
                  <p className="text-xs text-[var(--foreground-tertiary)] mb-1">SATICI</p>
                  <p className="font-semibold">{DISTANCE_CONTRACT_SELLER.title}</p>
                </div>
                <div className="p-5 rounded-xl bg-[var(--glass-bg)] border border-[var(--glass-border)]">
                  <p className="text-xs text-[var(--foreground-tertiary)] mb-1">ALICI</p>
                  <p className="font-semibold">[ALICI Adı/Soyadı]</p>
                </div>
              </div>
            </motion.div>

            {/* Son Güncelleme */}
            <div className="text-center text-sm text-[var(--foreground-muted)]">
              <p>Son Güncelleme: {DISTANCE_CONTRACT_VERSION_LABEL}</p>
            </div>

          </div>
        </div>
      </section>
    </div>
  );
}

