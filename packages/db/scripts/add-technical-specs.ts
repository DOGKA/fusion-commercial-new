import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Ürün slug'ları
const PRODUCT_SLUGS = {
  P800: '512wh-1600w-max-lifepo4-tasinabilir-guc-kaynagi-dahili-fener-ve-kablo-seti-4000-dongu-99-99-bms-coklu-cikis-p800',
  P1800: '1024wh-3600w-max-lifepo4-tasinabilir-guc-kaynagi-ucretsiz-aplikasyon-dahili-fener-ve-kablo-seti-4000-ustu-dongu-99-99-bms-coklu-cikis-p1800',
  SINGO2000PRO: '1920wh-4000w-max-lifepo4-tasinabilir-guc-kaynagi-aplikasyon-kablosuz-sarj-operasyonel-kullanim-4000-ustu-dongu-99-99-bms-coklu-cikis-singo2000pro',
  P3200: '2048wh-6400w-max-lifepo4-tasinabilir-guc-kaynagi-ucretsiz-aplikasyon-dahili-powerbank-jumpstarter-fener-4000-ustu-dongu-99-99-bms-coklu-cikis-p3200',
  SH4000: '5120wh-8000w-max-lifepo4-tasinabilir-guc-kaynagi-hibrid-invertor-ip54-koruma-ats-ile-uyum-4000-ustu-dongu-99-99-bms-sh4000',
  SP100: 'tasinabilir-gunes-paneli-100w-ip67-su-gecirmez-3-acili-ayar-katlanabilen-gunes-enerjili-sarj-cihazi-sp100',
  SP200: 'tasinabilir-gunes-paneli-200w-ip67-su-gecirmez-3-acili-ayar-katlanabilen-gunes-enerjili-sarj-cihazi-sp200',
  SP400: 'tasinabilir-gunes-paneli-400w-ip67-su-gecirmez-3-acili-ayar-katlanabilen-gunes-enerjili-sarj-cihazi-sp400',
};

// Teknik özellik tipi
interface TechSpec {
  label: string;
  value: string;
  group: string;
  order: number;
}

// ═══════════════════════════════════════════════════════════════
// GÜÇ KAYNAKLARI TEKNİK ÖZELLİKLERİ
// ═══════════════════════════════════════════════════════════════

const P800_SPECS: TechSpec[] = [
  // Batarya
  { label: 'Batarya Tipi', value: 'LiFePO4', group: 'Batarya', order: 1 },
  { label: 'Batarya Kapasitesi', value: '512 Wh', group: 'Batarya', order: 2 },
  { label: 'Batarya Voltajı', value: '25.6V', group: 'Batarya', order: 3 },
  { label: 'Batarya Voltaj Aralığı', value: '40~60V', group: 'Batarya', order: 4 },
  { label: 'Ömür Döngüsü', value: '4000+ (@25°C, 0.5C, DOD80%)', group: 'Batarya', order: 5 },
  // AC Giriş
  { label: 'AC Şarj Gücü', value: '600W', group: 'AC Giriş', order: 10 },
  { label: 'AC Voltaj Aralığı', value: '85~130V / 180~260V', group: 'AC Giriş', order: 11 },
  { label: 'AC Şarj Süresi', value: '~0.85 saat', group: 'AC Giriş', order: 12 },
  // DC Giriş
  { label: 'Araç Şarj Gücü', value: '120W', group: 'DC Giriş', order: 20 },
  { label: 'Max Solar Giriş', value: '300W', group: 'DC Giriş', order: 21 },
  { label: 'DC Giriş Voltaj Aralığı', value: '12~60V', group: 'DC Giriş', order: 22 },
  { label: 'Max DC Giriş Akımı', value: '10A', group: 'DC Giriş', order: 23 },
  // AC Çıkış
  { label: 'Sürekli Çıkış Gücü', value: '800W', group: 'AC Çıkış', order: 30 },
  { label: 'Tepe Güç', value: '1600W', group: 'AC Çıkış', order: 31 },
  { label: 'AC Çıkış Voltajı', value: '220/230/240V', group: 'AC Çıkış', order: 32 },
  { label: 'AC Frekansı', value: '50/60Hz', group: 'AC Çıkış', order: 33 },
  { label: 'AC Çıkış Sayısı', value: '2', group: 'AC Çıkış', order: 34 },
  // DC Çıkış
  { label: 'USB-C1', value: '100W (PD)', group: 'DC Çıkış', order: 40 },
  { label: 'USB-C2/C3', value: '30W', group: 'DC Çıkış', order: 41 },
  { label: 'USB-A', value: '30W (5V⎓3A, 9V⎓3A, 12V⎓3A)', group: 'DC Çıkış', order: 42 },
  { label: 'Araç Çıkışı', value: '13.2V⎓10A', group: 'DC Çıkış', order: 43 },
  { label: 'DC Port', value: '13.2V⎓8A (×2)', group: 'DC Çıkış', order: 44 },
  // Verimlilik
  { label: 'Batarya → AC Verimlilik', value: '%99', group: 'Verimlilik', order: 50 },
  { label: 'AC → Batarya Verimlilik', value: '%99', group: 'Verimlilik', order: 51 },
  // Genel
  { label: 'Boyutlar', value: '299×191.4×196.6mm', group: 'Genel', order: 60 },
  { label: 'Ağırlık', value: '6.55 kg', group: 'Genel', order: 61 },
  { label: 'Soğutma', value: 'Zorlamalı Hava Soğutma', group: 'Genel', order: 62 },
  { label: 'Çalışma Sıcaklığı', value: '0~40°C (Şarj), -15~+40°C (Deşarj)', group: 'Genel', order: 63 },
  { label: 'IP Koruma', value: 'IP20', group: 'Genel', order: 64 },
  { label: 'Gürültü Seviyesi', value: '<60dB', group: 'Genel', order: 65 },
  { label: 'İletişim', value: 'Wi-Fi/Bluetooth (Opsiyonel)', group: 'Genel', order: 66 },
];

const P1800_SPECS: TechSpec[] = [
  // Batarya
  { label: 'Batarya Tipi', value: 'LiFePO4', group: 'Batarya', order: 1 },
  { label: 'Batarya Kapasitesi', value: '1024 Wh', group: 'Batarya', order: 2 },
  { label: 'Batarya Voltajı', value: '51.2V', group: 'Batarya', order: 3 },
  { label: 'Batarya Voltaj Aralığı', value: '40~60V', group: 'Batarya', order: 4 },
  { label: 'Ömür Döngüsü', value: '4000+ (@25°C, 0.5C, DOD80%)', group: 'Batarya', order: 5 },
  // AC Giriş
  { label: 'AC Şarj Gücü', value: '1200W', group: 'AC Giriş', order: 10 },
  { label: 'AC Voltaj Aralığı', value: '85~130V / 180~260V', group: 'AC Giriş', order: 11 },
  // DC Giriş
  { label: 'Araç Şarj Gücü', value: '120W', group: 'DC Giriş', order: 20 },
  { label: 'Max Solar Giriş', value: '500W', group: 'DC Giriş', order: 21 },
  { label: 'DC Giriş Voltaj Aralığı', value: '10~52V', group: 'DC Giriş', order: 22 },
  { label: 'Max DC Giriş Akımı', value: '11A', group: 'DC Giriş', order: 23 },
  // AC Çıkış
  { label: 'Sürekli Çıkış Gücü', value: '1800W', group: 'AC Çıkış', order: 30 },
  { label: 'Tepe Güç', value: '3600W', group: 'AC Çıkış', order: 31 },
  { label: 'AC Çıkış Voltajı', value: '220/230/240V', group: 'AC Çıkış', order: 32 },
  { label: 'AC Frekansı', value: '50/60Hz', group: 'AC Çıkış', order: 33 },
  // DC Çıkış
  { label: 'USB-C1', value: '100W (PD)', group: 'DC Çıkış', order: 40 },
  { label: 'USB-C2/C3', value: '30W', group: 'DC Çıkış', order: 41 },
  { label: 'USB-A', value: '30W (5V⎓3A, 9V⎓3A, 12V⎓3A)', group: 'DC Çıkış', order: 42 },
  { label: 'Araç Çıkışı', value: '13.2V⎓10A', group: 'DC Çıkış', order: 43 },
  // Verimlilik
  { label: 'Batarya → AC Verimlilik', value: '%99', group: 'Verimlilik', order: 50 },
  { label: 'AC → Batarya Verimlilik', value: '%99', group: 'Verimlilik', order: 51 },
  // Genel
  { label: 'Boyutlar', value: '361.5×269.5×232.6mm', group: 'Genel', order: 60 },
  { label: 'Ağırlık', value: '12.7 kg', group: 'Genel', order: 61 },
  { label: 'Soğutma', value: 'Zorlamalı Hava Soğutma', group: 'Genel', order: 62 },
  { label: 'Çalışma Sıcaklığı', value: '0~40°C (Şarj), -15~+40°C (Deşarj)', group: 'Genel', order: 63 },
  { label: 'IP Koruma', value: 'IP20', group: 'Genel', order: 64 },
  { label: 'Gürültü Seviyesi', value: '<65dB', group: 'Genel', order: 65 },
  { label: 'İletişim', value: 'Wi-Fi/Bluetooth', group: 'Genel', order: 66 },
];

const SINGO2000PRO_SPECS: TechSpec[] = [
  // Batarya
  { label: 'Batarya Tipi', value: 'LiFePO4', group: 'Batarya', order: 1 },
  { label: 'Batarya Kapasitesi', value: '1920 Wh', group: 'Batarya', order: 2 },
  { label: 'Batarya Voltajı', value: '48V', group: 'Batarya', order: 3 },
  { label: 'Batarya Voltaj Aralığı', value: '40~60V', group: 'Batarya', order: 4 },
  { label: 'Ömür Döngüsü', value: '4000+ (@25°C, 0.5C, DOD80%)', group: 'Batarya', order: 5 },
  // AC Giriş
  { label: 'AC Şarj Gücü', value: '1500W', group: 'AC Giriş', order: 10 },
  { label: 'AC Voltaj Aralığı', value: '90~140V / 180~270V', group: 'AC Giriş', order: 11 },
  // DC Giriş
  { label: 'Araç Şarj Gücü', value: '120W', group: 'DC Giriş', order: 20 },
  { label: 'Max Solar Giriş', value: '500W', group: 'DC Giriş', order: 21 },
  { label: 'DC Giriş Voltaj Aralığı', value: '10~50V', group: 'DC Giriş', order: 22 },
  { label: 'Max DC Giriş Akımı', value: '11A', group: 'DC Giriş', order: 23 },
  // AC Çıkış
  { label: 'Sürekli Çıkış Gücü', value: '2000W', group: 'AC Çıkış', order: 30 },
  { label: 'Tepe Güç', value: '4000W', group: 'AC Çıkış', order: 31 },
  { label: 'AC Çıkış Voltajı', value: '220/230/240V', group: 'AC Çıkış', order: 32 },
  { label: 'AC Frekansı', value: '50/60Hz', group: 'AC Çıkış', order: 33 },
  // DC Çıkış
  { label: 'USB-A', value: '12W, 5V, 2.4A', group: 'DC Çıkış', order: 40 },
  { label: 'QC3.0', value: '18W (×2)', group: 'DC Çıkış', order: 41 },
  { label: 'USB-C', value: '100W (×2)', group: 'DC Çıkış', order: 42 },
  { label: 'Araç Çıkışı', value: '132W, 13.2V, 10A', group: 'DC Çıkış', order: 43 },
  { label: 'Kablosuz Şarj', value: '10W', group: 'DC Çıkış', order: 44 },
  // Verimlilik
  { label: 'Batarya → AC Verimlilik', value: '%99', group: 'Verimlilik', order: 50 },
  { label: 'AC → Batarya Verimlilik', value: '%99', group: 'Verimlilik', order: 51 },
  // Genel
  { label: 'Boyutlar', value: '355×347×226mm', group: 'Genel', order: 60 },
  { label: 'Ağırlık', value: '20.5 kg', group: 'Genel', order: 61 },
  { label: 'Soğutma', value: 'Zorlamalı Hava Soğutma', group: 'Genel', order: 62 },
  { label: 'Çalışma Sıcaklığı', value: '0~40°C (Şarj), -15~+40°C (Deşarj)', group: 'Genel', order: 63 },
  { label: 'IP Koruma', value: 'IP20', group: 'Genel', order: 64 },
  { label: 'Gürültü Seviyesi', value: '<65dB', group: 'Genel', order: 65 },
  { label: 'İletişim', value: 'Wi-Fi', group: 'Genel', order: 66 },
];

const P3200_SPECS: TechSpec[] = [
  // Batarya
  { label: 'Batarya Tipi', value: 'LiFePO4', group: 'Batarya', order: 1 },
  { label: 'Batarya Kapasitesi', value: '2048 Wh', group: 'Batarya', order: 2 },
  { label: 'Batarya Voltajı', value: '51.2V', group: 'Batarya', order: 3 },
  { label: 'Batarya Voltaj Aralığı', value: '40~60V', group: 'Batarya', order: 4 },
  { label: 'Ömür Döngüsü', value: '4000+ (@25°C, 0.5C, DOD80%)', group: 'Batarya', order: 5 },
  // AC Giriş
  { label: 'AC Şarj Gücü', value: '1800W', group: 'AC Giriş', order: 10 },
  { label: 'AC Voltaj Aralığı', value: '85~130V / 180~260V', group: 'AC Giriş', order: 11 },
  // DC Giriş
  { label: 'Araç Şarj Gücü', value: '120W', group: 'DC Giriş', order: 20 },
  { label: 'Max Solar Giriş', value: '1000W', group: 'DC Giriş', order: 21 },
  { label: 'DC Giriş Voltaj Aralığı', value: '12~80V', group: 'DC Giriş', order: 22 },
  { label: 'Max DC Giriş Akımı', value: '16A', group: 'DC Giriş', order: 23 },
  // AC Çıkış
  { label: 'Sürekli Çıkış Gücü', value: '3200W', group: 'AC Çıkış', order: 30 },
  { label: 'Tepe Güç', value: '6400W', group: 'AC Çıkış', order: 31 },
  { label: 'AC Çıkış Voltajı', value: '220/230/240V', group: 'AC Çıkış', order: 32 },
  { label: 'AC Frekansı', value: '50/60Hz', group: 'AC Çıkış', order: 33 },
  // DC Çıkış
  { label: 'USB-C1/C2', value: '100W (PD)', group: 'DC Çıkış', order: 40 },
  { label: 'USB-C3/C4', value: '30W', group: 'DC Çıkış', order: 41 },
  { label: 'USB-A', value: '30W (×4)', group: 'DC Çıkış', order: 42 },
  { label: 'Araç Çıkışı', value: '13.2V⎓10A', group: 'DC Çıkış', order: 43 },
  // Verimlilik
  { label: 'Batarya → AC Verimlilik', value: '%99', group: 'Verimlilik', order: 50 },
  { label: 'AC → Batarya Verimlilik', value: '%99', group: 'Verimlilik', order: 51 },
  // Genel
  { label: 'Boyutlar', value: '445×298×371mm', group: 'Genel', order: 60 },
  { label: 'Ağırlık', value: '24.35 kg', group: 'Genel', order: 61 },
  { label: 'Soğutma', value: 'Zorlamalı Hava Soğutma', group: 'Genel', order: 62 },
  { label: 'Çalışma Sıcaklığı', value: '0~40°C (Şarj), -15~+40°C (Deşarj)', group: 'Genel', order: 63 },
  { label: 'IP Koruma', value: 'IP20', group: 'Genel', order: 64 },
  { label: 'Gürültü Seviyesi', value: '<65dB', group: 'Genel', order: 65 },
  { label: 'İletişim', value: 'Wi-Fi/Bluetooth', group: 'Genel', order: 66 },
];

const SH4000_SPECS: TechSpec[] = [
  // Batarya
  { label: 'Batarya Tipi', value: 'LiFePO4', group: 'Batarya', order: 1 },
  { label: 'Batarya Kapasitesi', value: '5120 Wh', group: 'Batarya', order: 2 },
  { label: 'Batarya Voltajı', value: '51.2V', group: 'Batarya', order: 3 },
  { label: 'Batarya Voltaj Aralığı', value: '40~60V', group: 'Batarya', order: 4 },
  { label: 'Ömür Döngüsü', value: '4000+ (@25°C, 0.5C, DOD80%)', group: 'Batarya', order: 5 },
  // AC Giriş
  { label: 'AC Şarj Gücü', value: '3600W', group: 'AC Giriş', order: 10 },
  { label: 'AC Voltaj Aralığı', value: '180~270V', group: 'AC Giriş', order: 11 },
  // DC Giriş (HV MC4)
  { label: 'Max Solar Giriş (HV)', value: '3000W', group: 'DC Giriş (HV)', order: 20 },
  { label: 'DC Giriş Voltaj Aralığı (HV)', value: '70~450V', group: 'DC Giriş (HV)', order: 21 },
  { label: 'Max DC Giriş Akımı (HV)', value: '16A', group: 'DC Giriş (HV)', order: 22 },
  // DC Giriş (LV XT60)
  { label: 'Araç Şarj Gücü', value: '120W', group: 'DC Giriş (LV)', order: 25 },
  { label: 'Max Solar Giriş (LV)', value: '600W', group: 'DC Giriş (LV)', order: 26 },
  { label: 'DC Giriş Voltaj Aralığı (LV)', value: '12~50V', group: 'DC Giriş (LV)', order: 27 },
  // AC Çıkış
  { label: 'Sürekli Çıkış Gücü', value: '4000W', group: 'AC Çıkış', order: 30 },
  { label: 'Tepe Güç', value: '8000W', group: 'AC Çıkış', order: 31 },
  { label: 'AC Çıkış Voltajı', value: '220/230/240V', group: 'AC Çıkış', order: 32 },
  { label: 'AC Frekansı', value: '50Hz', group: 'AC Çıkış', order: 33 },
  // DC Çıkış
  { label: 'XT60', value: '12V⎓30A, 24V⎓25A, 36V⎓20A', group: 'DC Çıkış', order: 40 },
  { label: 'USB-C', value: '100W (×2)', group: 'DC Çıkış', order: 41 },
  // Verimlilik
  { label: 'Batarya → AC Verimlilik', value: '%99', group: 'Verimlilik', order: 50 },
  { label: 'AC → Batarya Verimlilik', value: '%99', group: 'Verimlilik', order: 51 },
  { label: 'PV → AC Verimlilik', value: '%99', group: 'Verimlilik', order: 52 },
  { label: 'PV → Batarya Verimlilik', value: '%99', group: 'Verimlilik', order: 53 },
  // Genel
  { label: 'Boyutlar', value: '510×673×266mm', group: 'Genel', order: 60 },
  { label: 'Ağırlık', value: '65 kg', group: 'Genel', order: 61 },
  { label: 'Soğutma', value: 'Akıllı Fan Soğutma', group: 'Genel', order: 62 },
  { label: 'Çalışma Sıcaklığı', value: '0~40°C (Şarj), -20~+40°C (Deşarj)', group: 'Genel', order: 63 },
  { label: 'IP Koruma', value: 'IP54 (IP65 Opsiyonel)', group: 'Genel', order: 64 },
  { label: 'Gürültü Seviyesi', value: '<40dB', group: 'Genel', order: 65 },
  { label: 'İletişim', value: 'Wi-Fi/Bluetooth', group: 'Genel', order: 66 },
];

// ═══════════════════════════════════════════════════════════════
// SOLAR PANEL TEKNİK ÖZELLİKLERİ
// ═══════════════════════════════════════════════════════════════

const SP100_SPECS: TechSpec[] = [
  // Elektriksel
  { label: 'Hücre Tipi', value: 'Monokristal Silikon', group: 'Elektriksel', order: 1 },
  { label: 'Çıkış Gücü', value: '100W Max. (25W×4)', group: 'Elektriksel', order: 2 },
  { label: 'MC4', value: '18V/5.6A', group: 'Elektriksel', order: 3 },
  { label: 'Çalışma Voltajı', value: '18V', group: 'Elektriksel', order: 4 },
  { label: 'Çalışma Akımı', value: '5.6A', group: 'Elektriksel', order: 5 },
  { label: 'Açık Devre Voltajı', value: '21.6V', group: 'Elektriksel', order: 6 },
  { label: 'Kısa Devre Akımı', value: '6.16A', group: 'Elektriksel', order: 7 },
  { label: 'Dönüşüm Verimliliği', value: '%21~23', group: 'Elektriksel', order: 8 },
  { label: 'Çalışma Sıcaklığı', value: '-20°C~+70°C', group: 'Elektriksel', order: 9 },
  // Fiziksel
  { label: 'IP Koruma', value: 'IP67', group: 'Fiziksel', order: 20 },
  { label: 'Katlanma Tipi', value: '4 Katlı', group: 'Fiziksel', order: 21 },
  { label: 'Katlanmış Boyut', value: '387×609×30mm', group: 'Fiziksel', order: 22 },
  { label: 'Açık Boyut', value: '1250×609×10mm', group: 'Fiziksel', order: 23 },
  { label: 'Ağırlık', value: '5 kg', group: 'Fiziksel', order: 24 },
];

const SP200_SPECS: TechSpec[] = [
  // Elektriksel
  { label: 'Hücre Tipi', value: 'Monokristal Silikon', group: 'Elektriksel', order: 1 },
  { label: 'Çıkış Gücü', value: '200W Max. (50W×4)', group: 'Elektriksel', order: 2 },
  { label: 'MC4', value: '24V/8.33A', group: 'Elektriksel', order: 3 },
  { label: 'Çalışma Voltajı', value: '24V', group: 'Elektriksel', order: 4 },
  { label: 'Çalışma Akımı', value: '8.33A', group: 'Elektriksel', order: 5 },
  { label: 'Açık Devre Voltajı', value: '28.8V', group: 'Elektriksel', order: 6 },
  { label: 'Kısa Devre Akımı', value: '9.12A', group: 'Elektriksel', order: 7 },
  { label: 'Dönüşüm Verimliliği', value: '%21~23', group: 'Elektriksel', order: 8 },
  { label: 'Çalışma Sıcaklığı', value: '-20°C~+70°C', group: 'Elektriksel', order: 9 },
  // Fiziksel
  { label: 'IP Koruma', value: 'IP67', group: 'Fiziksel', order: 20 },
  { label: 'Katlanma Tipi', value: '4 Katlı', group: 'Fiziksel', order: 21 },
  { label: 'Katlanmış Boyut', value: '610×608×45mm', group: 'Fiziksel', order: 22 },
  { label: 'Açık Boyut', value: '2074×608×30mm', group: 'Fiziksel', order: 23 },
  { label: 'Ağırlık', value: '8 kg', group: 'Fiziksel', order: 24 },
];

const SP400_SPECS: TechSpec[] = [
  // Elektriksel
  { label: 'Hücre Tipi', value: 'Monokristal Silikon', group: 'Elektriksel', order: 1 },
  { label: 'Çıkış Gücü', value: '400W Max. (100W×4)', group: 'Elektriksel', order: 2 },
  { label: 'MC4', value: '44V/10A', group: 'Elektriksel', order: 3 },
  { label: 'Çalışma Voltajı', value: '44V', group: 'Elektriksel', order: 4 },
  { label: 'Çalışma Akımı', value: '10A', group: 'Elektriksel', order: 5 },
  { label: 'Açık Devre Voltajı', value: '52.8V', group: 'Elektriksel', order: 6 },
  { label: 'Kısa Devre Akımı', value: '10A', group: 'Elektriksel', order: 7 },
  { label: 'Dönüşüm Verimliliği', value: '%21~23', group: 'Elektriksel', order: 8 },
  { label: 'Çalışma Sıcaklığı', value: '-20°C~+70°C', group: 'Elektriksel', order: 9 },
  // Fiziksel
  { label: 'IP Koruma', value: 'IP67', group: 'Fiziksel', order: 20 },
  { label: 'Katlanma Tipi', value: '4 Katlı', group: 'Fiziksel', order: 21 },
  { label: 'Katlanmış Boyut', value: '725×990×45mm', group: 'Fiziksel', order: 22 },
  { label: 'Açık Boyut', value: '2617×990×30mm', group: 'Fiziksel', order: 23 },
  { label: 'Ağırlık', value: '16.3 kg', group: 'Fiziksel', order: 24 },
];

// ═══════════════════════════════════════════════════════════════
// ANA FONKSİYON
// ═══════════════════════════════════════════════════════════════

async function addTechnicalSpecs() {
  console.log('🚀 Teknik özellikler ekleniyor...\n');

  const productSpecs: { slug: string; specs: TechSpec[] }[] = [
    { slug: PRODUCT_SLUGS.P800, specs: P800_SPECS },
    { slug: PRODUCT_SLUGS.P1800, specs: P1800_SPECS },
    { slug: PRODUCT_SLUGS.SINGO2000PRO, specs: SINGO2000PRO_SPECS },
    { slug: PRODUCT_SLUGS.P3200, specs: P3200_SPECS },
    { slug: PRODUCT_SLUGS.SH4000, specs: SH4000_SPECS },
    { slug: PRODUCT_SLUGS.SP100, specs: SP100_SPECS },
    { slug: PRODUCT_SLUGS.SP200, specs: SP200_SPECS },
    { slug: PRODUCT_SLUGS.SP400, specs: SP400_SPECS },
  ];

  for (const { slug, specs } of productSpecs) {
    // Ürünü bul
    const product = await prisma.product.findFirst({
      where: { slug },
      select: { id: true, name: true },
    });

    if (!product) {
      console.log(`❌ Ürün bulunamadı: ${slug}`);
      continue;
    }

    console.log(`📦 ${product.name} işleniyor...`);

    // Mevcut teknik özellikleri sil
    await prisma.technicalSpec.deleteMany({
      where: { productId: product.id },
    });

    // Yeni özellikleri ekle
    await prisma.technicalSpec.createMany({
      data: specs.map((spec) => ({
        productId: product.id,
        label: spec.label,
        value: spec.value,
        group: spec.group,
        order: spec.order,
      })),
    });

    console.log(`   ✅ ${specs.length} özellik eklendi\n`);
  }

  console.log('🎉 Tüm teknik özellikler başarıyla eklendi!');
}

// Script'i çalıştır
addTechnicalSpecs()
  .catch((e) => {
    console.error('❌ Hata:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
