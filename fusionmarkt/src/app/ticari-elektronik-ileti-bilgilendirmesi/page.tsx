"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { Megaphone, Mail, Phone } from "lucide-react";

export default function TicariElektronikIletiBilgilendirmesiPage() {
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
              <Megaphone className="w-8 h-8 text-[var(--fusion-primary)]" />
            </div>
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4">
              Ticari Elektronik İleti Bilgilendirme Metni
            </h1>
            <p className="text-lg text-[var(--foreground-secondary)]">
              Kampanya ve fırsat bildirimleri için verdiğiniz onay hakkında
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
              <h2 className="text-xl md:text-2xl font-bold mb-4">Onayın Kapsamı</h2>
              <p className="text-[var(--foreground-secondary)] leading-relaxed">
                ASDTC Mühendislik Ticaret A.Ş. (&quot;FusionMarkt&quot;) tarafından
                kampanya, indirim, yeni ürün ve fırsat duyurularının tarafınıza
                iletilmesi için onayınız alınmaktadır. Bu onay 6563 sayılı
                Elektronik Ticaretin Düzenlenmesi Hakkında Kanun kapsamındadır.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="glass-card p-6 md:p-8 rounded-2xl"
            >
              <h2 className="text-xl md:text-2xl font-bold mb-4">Hangi Kanallar</h2>
              <p className="text-[var(--foreground-secondary)] leading-relaxed mb-4">
                Onayınızı SMS, e-posta ve telefon araması kanalları için ayrı ayrı
                verebilir veya kaldırabilirsiniz. Bir kanala onay vermemeniz diğer
                kanalları etkilemez.
              </p>
              <p className="text-[var(--foreground-secondary)] leading-relaxed">
                Onay vermemeniz durumunda siparişleriniz, teslimat süreciniz ve
                hesabınızla ilgili zorunlu bilgilendirmeler tarafınıza iletilmeye
                devam eder. Bu iletiler ticari nitelikte olmadığı için onay
                kapsamında değildir.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="glass-card p-6 md:p-8 rounded-2xl"
            >
              <h2 className="text-xl md:text-2xl font-bold mb-4">Onayı Geri Alma</h2>
              <p className="text-[var(--foreground-secondary)] leading-relaxed">
                Verdiğiniz onayı dilediğiniz zaman, gerekçe göstermeksizin geri
                alabilirsiniz. Bunun için{" "}
                <Link
                  href="/hesabim/iletisim-tercihlerim"
                  className="text-[var(--fusion-primary)] hover:underline"
                >
                  Hesabım &gt; İletişim Tercihlerim
                </Link>{" "}
                bölümünden ilgili kanalı kapatmanız yeterlidir. Ayrıca
                gönderdiğimiz iletilerdeki ret bildirim yönteminden de
                çıkabilirsiniz.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="glass-card p-6 md:p-8 rounded-2xl"
            >
              <h2 className="text-xl md:text-2xl font-bold mb-4">Veri İşleme</h2>
              <p className="text-[var(--foreground-secondary)] leading-relaxed">
                Bu kapsamda yalnızca ad, e-posta adresi ve cep telefonu numaranız
                işlenir. Onay ve ret kayıtlarınız, mevzuat gereği ispat
                yükümlülüğümüz kapsamında saklanır. Kişisel verilerinizin
                işlenmesine ilişkin ayrıntılar için{" "}
                <Link
                  href="/gizlilik-politikasi"
                  className="text-[var(--fusion-primary)] hover:underline"
                >
                  Gizlilik Politikası
                </Link>
                nı inceleyebilirsiniz.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="glass-card p-6 md:p-8 rounded-2xl"
            >
              <h2 className="text-xl md:text-2xl font-bold mb-4">İletişim</h2>
              <div className="space-y-3 text-[var(--foreground-secondary)]">
                <div className="flex items-center gap-3">
                  <Mail className="w-5 h-5 text-[var(--fusion-primary)] flex-shrink-0" />
                  <span>info@fusionmarkt.com</span>
                </div>
                <div className="flex items-center gap-3">
                  <Phone className="w-5 h-5 text-[var(--fusion-primary)] flex-shrink-0" />
                  <span>+90 850 840 6160</span>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>
    </div>
  );
}
