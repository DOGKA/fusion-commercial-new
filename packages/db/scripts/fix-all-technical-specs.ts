import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// ═══════════════════════════════════════════════════════════════════════════
// ÜRÜN SLUG'LARI
// ═══════════════════════════════════════════════════════════════════════════

const PRODUCT_SLUGS = {
  // Güç Kaynakları
  P800: '512wh-1600w-max-lifepo4-tasinabilir-guc-kaynagi-dahili-fener-ve-kablo-seti-4000-dongu-99-99-bms-coklu-cikis-p800',
  P1800: '1024wh-3600w-max-lifepo4-tasinabilir-guc-kaynagi-ucretsiz-aplikasyon-dahili-fener-ve-kablo-seti-4000-ustu-dongu-99-99-bms-coklu-cikis-p1800',
  SINGO1000: '1008wh-tasinabilir-guc-kaynagi-99-99-mppt-bms-coklu-koruma-kablosuz-sarj-singo1000',
  SINGO2000PRO: '1920wh-4000w-max-lifepo4-tasinabilir-guc-kaynagi-aplikasyon-kablosuz-sarj-operasyonel-kullanim-4000-ustu-dongu-99-99-bms-coklu-cikis-singo2000pro',
  P3200: '2048wh-6400w-max-lifepo4-tasinabilir-guc-kaynagi-ucretsiz-aplikasyon-dahili-powerbank-jumpstarter-fener-4000-ustu-dongu-99-99-bms-coklu-cikis-p3200',
  SH4000: '5120wh-8000w-max-lifepo4-tasinabilir-guc-kaynagi-hibrid-invertor-ip54-koruma-ats-ile-uyum-4000-ustu-dongu-99-99-bms-sh4000',
  
  // Güneş Panelleri
  SP100: 'tasinabilir-gunes-paneli-100w-ip67-su-gecirmez-3-acili-ayar-katlanabilen-gunes-enerjili-sarj-cihazi-sp100',
  SP200: 'tasinabilir-gunes-paneli-200w-ip67-su-gecirmez-3-acili-ayar-katlanabilen-gunes-enerjili-sarj-cihazi-sp200',
  SP400: 'tasinabilir-gunes-paneli-400w-ip67-su-gecirmez-3-acili-ayar-katlanabilen-gunes-enerjili-sarj-cihazi-sp400',
  
  // Teleskopik Merdivenler (Stokta olanlar)
  LADDER_1600ET: '3-8m-askeri-ve-taktik-amacli-tam-otomatik-teleskopik-merdiven-1600et-tactical',
  LADDER_TS1600ET: '3-8m-askeri-ve-taktik-amacli-tam-otomatik-teleskopik-merdiven-ts1600et-tactical',
};

// Teknik özellik tipi
interface TechSpec {
  label: string;
  value: string;
  group: string;
  order: number;
}

// ═══════════════════════════════════════════════════════════════════════════
// SINGO1000 TEKNİK ÖZELLİKLERİ (YENİ EKLENEN)
// ═══════════════════════════════════════════════════════════════════════════

const SINGO1000_SPECS: TechSpec[] = [
  // Batarya
  { label: 'Batarya Tipi', value: 'LiFePO4', group: 'Batarya', order: 1 },
  { label: 'Batarya Kapasitesi', value: '1008 Wh', group: 'Batarya', order: 2 },
  { label: 'Batarya Voltajı', value: '25.6V', group: 'Batarya', order: 3 },
  { label: 'Ömür Döngüsü', value: '4000+ (@25°C, 0.5C, DOD80%)', group: 'Batarya', order: 5 },
  // AC Giriş
  { label: 'AC Şarj Gücü', value: '1000W', group: 'AC Giriş', order: 10 },
  { label: 'AC Voltaj Aralığı', value: '100~240V', group: 'AC Giriş', order: 11 },
  // DC Giriş
  { label: 'Araç Şarj Gücü', value: '120W', group: 'DC Giriş', order: 20 },
  { label: 'Max Solar Giriş', value: '400W', group: 'DC Giriş', order: 21 },
  { label: 'DC Giriş Voltaj Aralığı', value: '12~50V', group: 'DC Giriş', order: 22 },
  // AC Çıkış
  { label: 'Sürekli Çıkış Gücü', value: '1000W', group: 'AC Çıkış', order: 30 },
  { label: 'Tepe Güç', value: '2000W', group: 'AC Çıkış', order: 31 },
  { label: 'AC Çıkış Voltajı', value: '220/230/240V', group: 'AC Çıkış', order: 32 },
  { label: 'AC Frekansı', value: '50/60Hz', group: 'AC Çıkış', order: 33 },
  { label: 'AC Çıkış Var', value: 'Evet', group: 'AC Çıkış', order: 34 },
  // DC Çıkış
  { label: 'USB-C', value: '100W (PD)', group: 'DC Çıkış', order: 40 },
  { label: 'USB-A', value: '18W (QC3.0)', group: 'DC Çıkış', order: 41 },
  { label: 'Araç Çıkışı', value: '12V⎓10A', group: 'DC Çıkış', order: 42 },
  { label: 'Kablosuz Şarj', value: 'Evet (15W)', group: 'DC Çıkış', order: 43 },
  // Özel Özellikler
  { label: 'Dahili Fener', value: 'Hayır', group: 'Özel Özellikler', order: 70 },
  { label: 'Dahili Powerbank', value: 'Hayır', group: 'Özel Özellikler', order: 71 },
  { label: 'Solar Panel Desteği', value: 'Evet (400W)', group: 'Özel Özellikler', order: 72 },
  // Genel
  { label: 'Boyutlar', value: '340×222×234mm', group: 'Genel', order: 60 },
  { label: 'Ağırlık', value: '12.5 kg', group: 'Genel', order: 61 },
  { label: 'IP Koruma', value: 'IP20', group: 'Genel', order: 64 },
];

// ═══════════════════════════════════════════════════════════════════════════
// P800 TEKNİK ÖZELLİKLERİ (GÜNCELLENDİ)
// ═══════════════════════════════════════════════════════════════════════════

const P800_SPECS: TechSpec[] = [
  // Batarya
  { label: 'Batarya Tipi', value: 'LiFePO4', group: 'Batarya', order: 1 },
  { label: 'Batarya Kapasitesi', value: '512 Wh', group: 'Batarya', order: 2 },
  { label: 'Batarya Voltajı', value: '25.6V', group: 'Batarya', order: 3 },
  { label: 'Ömür Döngüsü', value: '4000+ (@25°C, 0.5C, DOD80%)', group: 'Batarya', order: 5 },
  // AC Giriş
  { label: 'AC Şarj Gücü', value: '600W', group: 'AC Giriş', order: 10 },
  { label: 'AC Voltaj Aralığı', value: '85~130V / 180~260V', group: 'AC Giriş', order: 11 },
  // DC Giriş
  { label: 'Araç Şarj Gücü', value: '120W', group: 'DC Giriş', order: 20 },
  { label: 'Max Solar Giriş', value: '300W', group: 'DC Giriş', order: 21 },
  { label: 'DC Giriş Voltaj Aralığı', value: '12~60V', group: 'DC Giriş', order: 22 },
  // AC Çıkış
  { label: 'Sürekli Çıkış Gücü', value: '800W', group: 'AC Çıkış', order: 30 },
  { label: 'Tepe Güç', value: '1600W', group: 'AC Çıkış', order: 31 },
  { label: 'AC Çıkış Voltajı', value: '220/230/240V', group: 'AC Çıkış', order: 32 },
  { label: 'AC Frekansı', value: '50/60Hz', group: 'AC Çıkış', order: 33 },
  { label: 'AC Çıkış Var', value: 'Evet', group: 'AC Çıkış', order: 34 },
  // DC Çıkış
  { label: 'USB-C1', value: '100W (PD)', group: 'DC Çıkış', order: 40 },
  { label: 'USB-C2/C3', value: '30W', group: 'DC Çıkış', order: 41 },
  { label: 'USB-A', value: '30W (5V⎓3A, 9V⎓3A, 12V⎓3A)', group: 'DC Çıkış', order: 42 },
  { label: 'Araç Çıkışı', value: '13.2V⎓10A', group: 'DC Çıkış', order: 43 },
  { label: 'Kablosuz Şarj', value: 'Hayır', group: 'DC Çıkış', order: 44 },
  // Özel Özellikler
  { label: 'Dahili Fener', value: 'Evet', group: 'Özel Özellikler', order: 70 },
  { label: 'Dahili Powerbank', value: 'Hayır', group: 'Özel Özellikler', order: 71 },
  { label: 'Solar Panel Desteği', value: 'Evet (300W)', group: 'Özel Özellikler', order: 72 },
  // Genel
  { label: 'Boyutlar', value: '299×191.4×196.6mm', group: 'Genel', order: 60 },
  { label: 'Ağırlık', value: '6.55 kg', group: 'Genel', order: 61 },
  { label: 'IP Koruma', value: 'IP20', group: 'Genel', order: 64 },
];

// ═══════════════════════════════════════════════════════════════════════════
// P1800 TEKNİK ÖZELLİKLERİ (GÜNCELLENDİ)
// ═══════════════════════════════════════════════════════════════════════════

const P1800_SPECS: TechSpec[] = [
  // Batarya
  { label: 'Batarya Tipi', value: 'LiFePO4', group: 'Batarya', order: 1 },
  { label: 'Batarya Kapasitesi', value: '1024 Wh', group: 'Batarya', order: 2 },
  { label: 'Batarya Voltajı', value: '51.2V', group: 'Batarya', order: 3 },
  { label: 'Ömür Döngüsü', value: '4000+ (@25°C, 0.5C, DOD80%)', group: 'Batarya', order: 5 },
  // AC Giriş
  { label: 'AC Şarj Gücü', value: '1200W', group: 'AC Giriş', order: 10 },
  { label: 'AC Voltaj Aralığı', value: '85~130V / 180~260V', group: 'AC Giriş', order: 11 },
  // DC Giriş
  { label: 'Araç Şarj Gücü', value: '120W', group: 'DC Giriş', order: 20 },
  { label: 'Max Solar Giriş', value: '500W', group: 'DC Giriş', order: 21 },
  { label: 'DC Giriş Voltaj Aralığı', value: '10~52V', group: 'DC Giriş', order: 22 },
  // AC Çıkış
  { label: 'Sürekli Çıkış Gücü', value: '1800W', group: 'AC Çıkış', order: 30 },
  { label: 'Tepe Güç', value: '3600W', group: 'AC Çıkış', order: 31 },
  { label: 'AC Çıkış Voltajı', value: '220/230/240V', group: 'AC Çıkış', order: 32 },
  { label: 'AC Frekansı', value: '50/60Hz', group: 'AC Çıkış', order: 33 },
  { label: 'AC Çıkış Var', value: 'Evet', group: 'AC Çıkış', order: 34 },
  // DC Çıkış
  { label: 'USB-C1', value: '100W (PD)', group: 'DC Çıkış', order: 40 },
  { label: 'USB-C2/C3', value: '30W', group: 'DC Çıkış', order: 41 },
  { label: 'USB-A', value: '30W (5V⎓3A, 9V⎓3A, 12V⎓3A)', group: 'DC Çıkış', order: 42 },
  { label: 'Araç Çıkışı', value: '13.2V⎓10A', group: 'DC Çıkış', order: 43 },
  { label: 'Kablosuz Şarj', value: 'Hayır', group: 'DC Çıkış', order: 44 },
  // Özel Özellikler
  { label: 'Dahili Fener', value: 'Evet', group: 'Özel Özellikler', order: 70 },
  { label: 'Dahili Powerbank', value: 'Hayır', group: 'Özel Özellikler', order: 71 },
  { label: 'Solar Panel Desteği', value: 'Evet (500W)', group: 'Özel Özellikler', order: 72 },
  // Genel
  { label: 'Boyutlar', value: '361.5×269.5×232.6mm', group: 'Genel', order: 60 },
  { label: 'Ağırlık', value: '12.7 kg', group: 'Genel', order: 61 },
  { label: 'IP Koruma', value: 'IP20', group: 'Genel', order: 64 },
];

// ═══════════════════════════════════════════════════════════════════════════
// SINGO2000PRO TEKNİK ÖZELLİKLERİ (GÜNCELLENDİ)
// ═══════════════════════════════════════════════════════════════════════════

const SINGO2000PRO_SPECS: TechSpec[] = [
  // Batarya
  { label: 'Batarya Tipi', value: 'LiFePO4', group: 'Batarya', order: 1 },
  { label: 'Batarya Kapasitesi', value: '1920 Wh', group: 'Batarya', order: 2 },
  { label: 'Batarya Voltajı', value: '48V', group: 'Batarya', order: 3 },
  { label: 'Ömür Döngüsü', value: '4000+ (@25°C, 0.5C, DOD80%)', group: 'Batarya', order: 5 },
  // AC Giriş
  { label: 'AC Şarj Gücü', value: '1500W', group: 'AC Giriş', order: 10 },
  { label: 'AC Voltaj Aralığı', value: '90~140V / 180~270V', group: 'AC Giriş', order: 11 },
  // DC Giriş
  { label: 'Araç Şarj Gücü', value: '120W', group: 'DC Giriş', order: 20 },
  { label: 'Max Solar Giriş', value: '500W', group: 'DC Giriş', order: 21 },
  { label: 'DC Giriş Voltaj Aralığı', value: '10~50V', group: 'DC Giriş', order: 22 },
  // AC Çıkış
  { label: 'Sürekli Çıkış Gücü', value: '2000W', group: 'AC Çıkış', order: 30 },
  { label: 'Tepe Güç', value: '4000W', group: 'AC Çıkış', order: 31 },
  { label: 'AC Çıkış Voltajı', value: '220/230/240V', group: 'AC Çıkış', order: 32 },
  { label: 'AC Frekansı', value: '50/60Hz', group: 'AC Çıkış', order: 33 },
  { label: 'AC Çıkış Var', value: 'Evet', group: 'AC Çıkış', order: 34 },
  // DC Çıkış
  { label: 'USB-A', value: '12W, 5V, 2.4A', group: 'DC Çıkış', order: 40 },
  { label: 'QC3.0', value: '18W (×2)', group: 'DC Çıkış', order: 41 },
  { label: 'USB-C', value: '100W (×2)', group: 'DC Çıkış', order: 42 },
  { label: 'Araç Çıkışı', value: '132W, 13.2V, 10A', group: 'DC Çıkış', order: 43 },
  { label: 'Kablosuz Şarj', value: 'Evet (10W)', group: 'DC Çıkış', order: 44 },
  // Özel Özellikler
  { label: 'Dahili Fener', value: 'Hayır', group: 'Özel Özellikler', order: 70 },
  { label: 'Dahili Powerbank', value: 'Hayır', group: 'Özel Özellikler', order: 71 },
  { label: 'Solar Panel Desteği', value: 'Evet (500W)', group: 'Özel Özellikler', order: 72 },
  // Genel
  { label: 'Boyutlar', value: '355×347×226mm', group: 'Genel', order: 60 },
  { label: 'Ağırlık', value: '20.5 kg', group: 'Genel', order: 61 },
  { label: 'IP Koruma', value: 'IP20', group: 'Genel', order: 64 },
];

// ═══════════════════════════════════════════════════════════════════════════
// P3200 TEKNİK ÖZELLİKLERİ (GÜNCELLENDİ)
// ═══════════════════════════════════════════════════════════════════════════

const P3200_SPECS: TechSpec[] = [
  // Batarya
  { label: 'Batarya Tipi', value: 'LiFePO4', group: 'Batarya', order: 1 },
  { label: 'Batarya Kapasitesi', value: '2048 Wh', group: 'Batarya', order: 2 },
  { label: 'Batarya Voltajı', value: '51.2V', group: 'Batarya', order: 3 },
  { label: 'Ömür Döngüsü', value: '4000+ (@25°C, 0.5C, DOD80%)', group: 'Batarya', order: 5 },
  // AC Giriş
  { label: 'AC Şarj Gücü', value: '1800W', group: 'AC Giriş', order: 10 },
  { label: 'AC Voltaj Aralığı', value: '85~130V / 180~260V', group: 'AC Giriş', order: 11 },
  // DC Giriş
  { label: 'Araç Şarj Gücü', value: '120W', group: 'DC Giriş', order: 20 },
  { label: 'Max Solar Giriş', value: '1000W', group: 'DC Giriş', order: 21 },
  { label: 'DC Giriş Voltaj Aralığı', value: '12~80V', group: 'DC Giriş', order: 22 },
  // AC Çıkış
  { label: 'Sürekli Çıkış Gücü', value: '3200W', group: 'AC Çıkış', order: 30 },
  { label: 'Tepe Güç', value: '6400W', group: 'AC Çıkış', order: 31 },
  { label: 'AC Çıkış Voltajı', value: '220/230/240V', group: 'AC Çıkış', order: 32 },
  { label: 'AC Frekansı', value: '50/60Hz', group: 'AC Çıkış', order: 33 },
  { label: 'AC Çıkış Var', value: 'Evet', group: 'AC Çıkış', order: 34 },
  // DC Çıkış
  { label: 'USB-C1/C2', value: '100W (PD)', group: 'DC Çıkış', order: 40 },
  { label: 'USB-C3/C4', value: '30W', group: 'DC Çıkış', order: 41 },
  { label: 'USB-A', value: '30W (×4)', group: 'DC Çıkış', order: 42 },
  { label: 'Araç Çıkışı', value: '13.2V⎓10A', group: 'DC Çıkış', order: 43 },
  { label: 'Kablosuz Şarj', value: 'Hayır', group: 'DC Çıkış', order: 44 },
  // Özel Özellikler
  { label: 'Dahili Fener', value: 'Evet', group: 'Özel Özellikler', order: 70 },
  { label: 'Dahili Powerbank', value: 'Evet', group: 'Özel Özellikler', order: 71 },
  { label: 'Solar Panel Desteği', value: 'Evet (1000W)', group: 'Özel Özellikler', order: 72 },
  // Genel
  { label: 'Boyutlar', value: '445×298×371mm', group: 'Genel', order: 60 },
  { label: 'Ağırlık', value: '24.35 kg', group: 'Genel', order: 61 },
  { label: 'IP Koruma', value: 'IP20', group: 'Genel', order: 64 },
];

// ═══════════════════════════════════════════════════════════════════════════
// SH4000 TEKNİK ÖZELLİKLERİ (GÜNCELLENDİ)
// ═══════════════════════════════════════════════════════════════════════════

const SH4000_SPECS: TechSpec[] = [
  // Batarya
  { label: 'Batarya Tipi', value: 'LiFePO4', group: 'Batarya', order: 1 },
  { label: 'Batarya Kapasitesi', value: '5120 Wh', group: 'Batarya', order: 2 },
  { label: 'Batarya Voltajı', value: '51.2V', group: 'Batarya', order: 3 },
  { label: 'Ömür Döngüsü', value: '4000+ (@25°C, 0.5C, DOD80%)', group: 'Batarya', order: 5 },
  // AC Giriş
  { label: 'AC Şarj Gücü', value: '3600W', group: 'AC Giriş', order: 10 },
  { label: 'AC Voltaj Aralığı', value: '180~270V', group: 'AC Giriş', order: 11 },
  // DC Giriş (HV MC4)
  { label: 'Max Solar Giriş (HV)', value: '3000W', group: 'DC Giriş (HV)', order: 20 },
  { label: 'DC Giriş Voltaj Aralığı (HV)', value: '70~450V', group: 'DC Giriş (HV)', order: 21 },
  // AC Çıkış
  { label: 'Sürekli Çıkış Gücü', value: '4000W', group: 'AC Çıkış', order: 30 },
  { label: 'Tepe Güç', value: '8000W', group: 'AC Çıkış', order: 31 },
  { label: 'AC Çıkış Voltajı', value: '220/230/240V', group: 'AC Çıkış', order: 32 },
  { label: 'AC Frekansı', value: '50Hz', group: 'AC Çıkış', order: 33 },
  { label: 'AC Çıkış Var', value: 'Evet', group: 'AC Çıkış', order: 34 },
  // DC Çıkış
  { label: 'XT60', value: '12V⎓30A, 24V⎓25A, 36V⎓20A', group: 'DC Çıkış', order: 40 },
  { label: 'USB-C', value: '100W (×2)', group: 'DC Çıkış', order: 41 },
  { label: 'Kablosuz Şarj', value: 'Hayır', group: 'DC Çıkış', order: 44 },
  // Özel Özellikler
  { label: 'Dahili Fener', value: 'Hayır', group: 'Özel Özellikler', order: 70 },
  { label: 'Dahili Powerbank', value: 'Hayır', group: 'Özel Özellikler', order: 71 },
  { label: 'Solar Panel Desteği', value: 'Evet (3000W)', group: 'Özel Özellikler', order: 72 },
  // Genel
  { label: 'Boyutlar', value: '510×673×266mm', group: 'Genel', order: 60 },
  { label: 'Ağırlık', value: '65 kg', group: 'Genel', order: 61 },
  { label: 'IP Koruma', value: 'IP54', group: 'Genel', order: 64 },
];

// ═══════════════════════════════════════════════════════════════════════════
// GÜNEŞ PANELLERİ TEKNİK ÖZELLİKLERİ (GÜNCELLENDİ)
// ═══════════════════════════════════════════════════════════════════════════

const SP100_SPECS: TechSpec[] = [
  { label: 'Çıkış Gücü', value: '100W', group: 'Elektriksel', order: 1 },
  { label: 'Güç (Watt)', value: '100', group: 'Elektriksel', order: 2 },
  { label: 'Hücre Tipi', value: 'Monokristal Silikon', group: 'Elektriksel', order: 3 },
  { label: 'Verimlilik', value: '%21~23', group: 'Elektriksel', order: 4 },
  { label: 'Açık Devre Voltajı', value: '21.6V', group: 'Elektriksel', order: 5 },
  { label: 'Çalışma Voltajı', value: '18V', group: 'Elektriksel', order: 6 },
  { label: 'IP Koruma', value: 'IP67', group: 'Fiziksel', order: 20 },
  { label: 'Katlanabilir', value: 'Evet', group: 'Fiziksel', order: 21 },
  { label: 'Ağırlık', value: '5 kg', group: 'Fiziksel', order: 24 },
];

const SP200_SPECS: TechSpec[] = [
  { label: 'Çıkış Gücü', value: '200W', group: 'Elektriksel', order: 1 },
  { label: 'Güç (Watt)', value: '200', group: 'Elektriksel', order: 2 },
  { label: 'Hücre Tipi', value: 'Monokristal Silikon', group: 'Elektriksel', order: 3 },
  { label: 'Verimlilik', value: '%21~23', group: 'Elektriksel', order: 4 },
  { label: 'Açık Devre Voltajı', value: '28.8V', group: 'Elektriksel', order: 5 },
  { label: 'Çalışma Voltajı', value: '24V', group: 'Elektriksel', order: 6 },
  { label: 'IP Koruma', value: 'IP67', group: 'Fiziksel', order: 20 },
  { label: 'Katlanabilir', value: 'Evet', group: 'Fiziksel', order: 21 },
  { label: 'Ağırlık', value: '8 kg', group: 'Fiziksel', order: 24 },
];

const SP400_SPECS: TechSpec[] = [
  { label: 'Çıkış Gücü', value: '400W', group: 'Elektriksel', order: 1 },
  { label: 'Güç (Watt)', value: '400', group: 'Elektriksel', order: 2 },
  { label: 'Hücre Tipi', value: 'Monokristal Silikon', group: 'Elektriksel', order: 3 },
  { label: 'Verimlilik', value: '%21~23', group: 'Elektriksel', order: 4 },
  { label: 'Açık Devre Voltajı', value: '52.8V', group: 'Elektriksel', order: 5 },
  { label: 'Çalışma Voltajı', value: '44V', group: 'Elektriksel', order: 6 },
  { label: 'IP Koruma', value: 'IP67', group: 'Fiziksel', order: 20 },
  { label: 'Katlanabilir', value: 'Evet', group: 'Fiziksel', order: 21 },
  { label: 'Ağırlık', value: '16.3 kg', group: 'Fiziksel', order: 24 },
];

// ═══════════════════════════════════════════════════════════════════════════
// TELESKOPİK MERDİVENLER TEKNİK ÖZELLİKLERİ (Kullanıcının verdiği görselden)
// ═══════════════════════════════════════════════════════════════════════════

// 1600ET - Askeri Taktik (Stokta)
const LADDER_1600ET_SPECS: TechSpec[] = [
  { label: 'Model', value: '1600 ET', group: 'Genel', order: 1 },
  { label: 'Merdiven Boyutu', value: '3.8 Metre', group: 'Boyut', order: 2 },
  { label: 'Maksimum Uzunluk', value: '3.8', group: 'Boyut', order: 3 },
  { label: 'Basamak Sayısı', value: '13', group: 'Boyut', order: 4 },
  { label: 'Ağırlık', value: '11.8 kg', group: 'Boyut', order: 5 },
  { label: 'Nitelik', value: 'TAKTİK', group: 'Özellik', order: 10 },
  { label: 'Yalıtkan', value: 'Hayır', group: 'Özellik', order: 11 },
  { label: 'Merdiven Tipi', value: 'Teleskopik', group: 'Özellik', order: 12 },
  { label: 'Malzeme', value: 'Alüminyum (Kevlar Kaplı)', group: 'Özellik', order: 13 },
  { label: 'Taşıma Kapasitesi', value: '150 kg', group: 'Özellik', order: 14 },
  { label: 'Sertifikalar', value: 'OSHA, ANSI, SGS', group: 'Sertifika', order: 20 },
];

// TS1600ET - Askeri Taktik (Stokta)
const LADDER_TS1600ET_SPECS: TechSpec[] = [
  { label: 'Model', value: 'TS 1600 ET', group: 'Genel', order: 1 },
  { label: 'Merdiven Boyutu', value: '3.8 Metre', group: 'Boyut', order: 2 },
  { label: 'Maksimum Uzunluk', value: '3.8', group: 'Boyut', order: 3 },
  { label: 'Basamak Sayısı', value: '13', group: 'Boyut', order: 4 },
  { label: 'Ağırlık', value: '13.2 kg', group: 'Boyut', order: 5 },
  { label: 'Nitelik', value: 'TAKTİK', group: 'Özellik', order: 10 },
  { label: 'Yalıtkan', value: 'Hayır', group: 'Özellik', order: 11 },
  { label: 'Merdiven Tipi', value: 'Teleskopik', group: 'Özellik', order: 12 },
  { label: 'Malzeme', value: 'Alüminyum (Kevlar Kaplı)', group: 'Özellik', order: 13 },
  { label: 'Taşıma Kapasitesi', value: '150 kg', group: 'Özellik', order: 14 },
  { label: 'Sertifikalar', value: 'OSHA, ANSI, SGS', group: 'Sertifika', order: 20 },
];

// ═══════════════════════════════════════════════════════════════════════════
// ANA FONKSİYON
// ═══════════════════════════════════════════════════════════════════════════

async function fixAllTechnicalSpecs() {
  console.log('🚀 Tüm teknik özellikler düzeltiliyor...\n');

  const productSpecs: { slug: string; specs: TechSpec[]; name: string }[] = [
    // Güç Kaynakları
    { slug: PRODUCT_SLUGS.P800, specs: P800_SPECS, name: 'P800' },
    { slug: PRODUCT_SLUGS.P1800, specs: P1800_SPECS, name: 'P1800' },
    { slug: PRODUCT_SLUGS.SINGO1000, specs: SINGO1000_SPECS, name: 'Singo1000' },
    { slug: PRODUCT_SLUGS.SINGO2000PRO, specs: SINGO2000PRO_SPECS, name: 'Singo2000Pro' },
    { slug: PRODUCT_SLUGS.P3200, specs: P3200_SPECS, name: 'P3200' },
    { slug: PRODUCT_SLUGS.SH4000, specs: SH4000_SPECS, name: 'SH4000' },
    // Güneş Panelleri
    { slug: PRODUCT_SLUGS.SP100, specs: SP100_SPECS, name: 'SP100' },
    { slug: PRODUCT_SLUGS.SP200, specs: SP200_SPECS, name: 'SP200' },
    { slug: PRODUCT_SLUGS.SP400, specs: SP400_SPECS, name: 'SP400' },
    // Teleskopik Merdivenler
    { slug: PRODUCT_SLUGS.LADDER_1600ET, specs: LADDER_1600ET_SPECS, name: '1600ET' },
    { slug: PRODUCT_SLUGS.LADDER_TS1600ET, specs: LADDER_TS1600ET_SPECS, name: 'TS1600ET' },
  ];

  let successCount = 0;
  let errorCount = 0;

  for (const { slug, specs, name } of productSpecs) {
    // Ürünü bul (slug ile veya isim içeriyorsa)
    let product = await prisma.product.findFirst({
      where: { slug },
      select: { id: true, name: true, slug: true },
    });

    // Slug bulunamadıysa isimle ara
    if (!product) {
      product = await prisma.product.findFirst({
        where: { 
          OR: [
            { name: { contains: name, mode: 'insensitive' } },
            { slug: { contains: name.toLowerCase() } }
          ]
        },
        select: { id: true, name: true, slug: true },
      });
    }

    if (!product) {
      console.log(`❌ Ürün bulunamadı: ${name} (${slug})`);
      errorCount++;
      continue;
    }

    console.log(`📦 ${product.name} işleniyor...`);

    try {
      // Mevcut teknik özellikleri sil
      await prisma.technicalSpec.deleteMany({
        where: { productId: product.id },
      });

      // Yeni özellikleri ekle
      await prisma.technicalSpec.createMany({
        data: specs.map((spec) => ({
          productId: product!.id,
          label: spec.label,
          value: spec.value,
          group: spec.group,
          order: spec.order,
        })),
      });

      console.log(`   ✅ ${specs.length} özellik eklendi\n`);
      successCount++;
    } catch (error) {
      console.log(`   ❌ Hata: ${error}\n`);
      errorCount++;
    }
  }

  console.log('═══════════════════════════════════════════════════════════════');
  console.log(`🎉 İşlem tamamlandı! Başarılı: ${successCount}, Hata: ${errorCount}`);
}

// Script'i çalıştır
fixAllTechnicalSpecs()
  .catch((e) => {
    console.error('❌ Kritik Hata:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

