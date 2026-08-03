"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { ShieldCheck } from "lucide-react";

export default function AcikRizaMetniPage() {
  return (
    <div data-page-root className="min-h-screen bg-[var(--background)]">
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
              <ShieldCheck className="w-8 h-8 text-[var(--fusion-primary)]" />
            </div>
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4">
              Açık Rıza Metni
            </h1>
            <p className="text-lg text-[var(--foreground-secondary)]">
              Kişiselleştirilmiş deneyim için verilerinizin işlenmesi hakkında
            </p>
          </motion.div>
        </div>
      </section>

      <section className="py-12 md:py-16">
        <div className="container px-4 md:px-6">
          <div className="max-w-4xl mx-auto space-y-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="glass-card p-6 md:p-8 rounded-2xl"
            >
              <h2 className="text-xl md:text-2xl font-bold mb-4">Rızanın Konusu</h2>
              <p className="text-[var(--foreground-secondary)] leading-relaxed">
                ASDTC Mühendislik Ticaret A.Ş. (&quot;FusionMarkt&quot;) olarak, size
                ilgi alanlarınıza uygun ürün önerileri ve içerik sunabilmemiz için
                alışveriş ve gezinme verilerinizin işlenmesine ilişkin açık
                rızanızı talep ediyoruz. Bu rıza 6698 sayılı Kişisel Verilerin
                Korunması Kanunu kapsamındadır.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="glass-card p-6 md:p-8 rounded-2xl"
            >
              <h2 className="text-xl md:text-2xl font-bold mb-4">İşlenen Veriler</h2>
              <ul className="space-y-2 text-[var(--foreground-secondary)] leading-relaxed list-disc pl-5">
                <li>Görüntülediğiniz ve beğendiklerinize eklediğiniz ürünler</li>
                <li>Sipariş geçmişiniz ve sepet hareketleriniz</li>
                <li>Site içi arama ve kategori gezinme kayıtlarınız</li>
              </ul>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="glass-card p-6 md:p-8 rounded-2xl"
            >
              <h2 className="text-xl md:text-2xl font-bold mb-4">İşleme Amacı</h2>
              <p className="text-[var(--foreground-secondary)] leading-relaxed">
                Bu veriler yalnızca size daha uygun ürün önerileri sunmak, ana sayfa
                ve kampanya içeriklerini ilgi alanlarınıza göre düzenlemek amacıyla
                işlenir. Üçüncü kişilere satılmaz.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="glass-card p-6 md:p-8 rounded-2xl"
            >
              <h2 className="text-xl md:text-2xl font-bold mb-4">Rızanın Geri Alınması</h2>
              <p className="text-[var(--foreground-secondary)] leading-relaxed">
                Rızanız tamamen isteğe bağlıdır; vermemeniz alışveriş yapmanıza engel
                değildir. Dilediğiniz zaman{" "}
                <Link
                  href="/hesabim/iletisim-tercihlerim"
                  className="text-[var(--fusion-primary)] hover:underline"
                >
                  Hesabım &gt; İletişim Tercihlerim
                </Link>{" "}
                bölümünden geri alabilirsiniz. Geri aldığınızda kişiselleştirme
                durur; öneriler herkese gösterilen genel içeriğe döner.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="glass-card p-6 md:p-8 rounded-2xl"
            >
              <h2 className="text-xl md:text-2xl font-bold mb-4">Haklarınız</h2>
              <p className="text-[var(--foreground-secondary)] leading-relaxed">
                KVKK md.11 kapsamında verilerinize erişme, düzeltilmesini veya
                silinmesini isteme haklarına sahipsiniz. Talepleriniz için
                info@fusionmarkt.com adresine yazabilirsiniz. Ayrıntılar için{" "}
                <Link
                  href="/gizlilik-politikasi"
                  className="text-[var(--fusion-primary)] hover:underline"
                >
                  Gizlilik Politikası
                </Link>
                nı inceleyebilirsiniz.
              </p>
            </motion.div>
          </div>
        </div>
      </section>
    </div>
  );
}
