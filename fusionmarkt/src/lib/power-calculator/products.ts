/**
 * Güç Kaynakları ve Solar Panel Verileri
 * IEETek/Singo Datasheet'lerinden alınmıştır
 */

export interface PowerStation {
  id: string;
  name: string;
  slug: string;
  // Batarya
  capacity: number;              // Wh
  batteryType: string;           // Batarya tipi (LiFePO4)
  batteryVoltage: number;        // V
  batteryVoltageRange: string;   // V aralığı
  lifeCycles: string;            // Ömür döngüsü
  // AC Giriş
  acChargingPower: number;       // W
  acVoltageRange: string;        // V
  // DC Giriş
  carChargingPower: number;      // W
  solarMaxW: number;             // Max solar giriş W
  dcInputVoltageRange: string;   // V
  maxDcInputCurrent: number;     // A
  mpptMin?: number;              // MPPT min voltaj
  mpptMax?: number;              // MPPT max voltaj
  // AC Çıkış
  continuousPower: number;       // W (sürekli)
  surgePower: number;            // W (tepe)
  acOutputVoltage: string;       // V
  acFrequency: string;           // Hz
  acOutlets?: number;            // AC çıkış sayısı
  // DC Çıkış
  usbC?: string;                 // USB-C özellikleri
  usbA?: string;                 // USB-A özellikleri
  carPort?: string;              // Araç çıkışı
  dcPort?: string;               // DC port özellikleri
  wirelessCharger?: number;      // Kablosuz şarj W
  dcPorts?: number;              // Toplam DC port sayısı
  // Verimlilik
  batteryToAcEfficiency: number; // %
  acToBatteryEfficiency: number; // %
  // Genel
  dimensions: string;            // mm
  weight: number;                // kg
  coolingType: string;           // Soğutma tipi
  operatingTemp: string;         // Çalışma sıcaklığı
  ipRating: string;              // IP koruma sınıfı
  noiseLevel: string;            // dB
  communication: string;         // İletişim
  chargeTimeAc?: string;         // AC şarj süresi (saat)
  image?: string;
  productUrl?: string;
  price?: string;
}

export interface SolarPanel {
  id: string;
  name: string;
  slug: string;
  // Elektriksel Parametreler
  watt: number;                  // W
  cellType: string;              // Hücre tipi
  voc: number;                   // Açık devre voltajı V
  vmp: number;                   // Maksimum güç voltajı V
  isc: number;                   // Kısa devre akımı A
  imp: number;                   // Maksimum güç akımı A
  efficiency: string;            // Verimlilik %
  operatingTemp: string;         // Çalışma sıcaklığı
  // Fiziksel Parametreler
  ipRating: string;              // IP koruma sınıfı
  foldingType: string;           // Katlanma tipi
  foldedDimension: string;       // Katlanmış boyut mm
  unfoldedDimension: string;     // Açık boyut mm
  weight: number;                // kg
  mc4Connector: string;          // MC4 bağlantı özellikleri
  image?: string;
  productUrl?: string;
  price?: string;
}

// ==========================================
// GÜÇ KAYNAKLARI (Datasheet'lerden)
// ==========================================

export const POWER_STATIONS: PowerStation[] = [
  // P800 - PowerMax Serisi
  {
    id: 'p800',
    name: 'IEETek P800',
    slug: 'ieetek-p800',
    // Batarya
    capacity: 512,
    batteryType: 'LiFePO4',
    batteryVoltage: 25.6,
    batteryVoltageRange: '40~60V',
    lifeCycles: '4000+ (@25°C, 0.5C Discharge, DOD80%)',
    // AC Giriş
    acChargingPower: 600,
    acVoltageRange: '85~130V / 180~260V',
    // DC Giriş
    carChargingPower: 120,
    solarMaxW: 300,
    dcInputVoltageRange: '12~60V',
    maxDcInputCurrent: 10,
    mpptMin: 12,
    mpptMax: 60,
    // AC Çıkış
    continuousPower: 800,
    surgePower: 1600,
    acOutputVoltage: '100/110/120V veya 220/230/240V',
    acFrequency: '50/60Hz',
    acOutlets: 2,
    // DC Çıkış
    usbC: 'TYPE-C1: 100W (5V⎓3A, 9V⎓3A, 12V⎓3A, 15V⎓3A, 20V⎓5A), TYPE-C2/C3: 30W',
    usbA: 'USB-A1/A2: 30W (5V⎓3A, 9V⎓3A, 12V⎓3A)',
    carPort: '13.2V⎓10A',
    dcPort: '13.2V⎓8A (×2)',
    wirelessCharger: undefined,
    dcPorts: 7,
    // Verimlilik
    batteryToAcEfficiency: 94,
    acToBatteryEfficiency: 94,
    // Genel
    dimensions: '299×191.4×196.6mm',
    weight: 6.55,
    coolingType: 'Forced Air Cooling',
    operatingTemp: '0~40°C (Şarj), -15~+40°C (Deşarj)',
    ipRating: 'IP20',
    noiseLevel: '<60dB',
    communication: 'Wi-Fi/Bluetooth (Opsiyonel)',
    chargeTimeAc: '0.85',
    image: 'https://mybucketajax.s3.eu-north-1.amazonaws.com/fusionmarkt/products/P800-1.png',
    productUrl: '/urun/512wh-1600w-max-lifepo4-tasinabilir-guc-kaynagi-dahili-fener-ve-kablo-seti-4000-dongu-99-99-bms-coklu-cikis-p800',
    price: '14999'
  },

  // P1800 - PowerMax Serisi
  {
    id: 'p1800',
    name: 'IEETek P1800',
    slug: 'ieetek-p1800',
    // Batarya
    capacity: 1024,
    batteryType: 'LiFePO4',
    batteryVoltage: 51.2,
    batteryVoltageRange: '40~60V',
    lifeCycles: '4000+ (@25°C, 0.5C Discharge, DOD80%)',
    // AC Giriş
    acChargingPower: 1200,
    acVoltageRange: '85~130V / 180~260V',
    // DC Giriş
    carChargingPower: 120,
    solarMaxW: 500,
    dcInputVoltageRange: '10~52V',
    maxDcInputCurrent: 11,
    mpptMin: 10,
    mpptMax: 52,
    // AC Çıkış
    continuousPower: 1800,
    surgePower: 3600,
    acOutputVoltage: '100/110/120V veya 220/230/240V',
    acFrequency: '50/60Hz',
    acOutlets: 4,
    // DC Çıkış
    usbC: 'TYPE-C1: 100W (5V⎓3A, 9V⎓3A, 12V⎓3A, 15V⎓3A, 20V⎓5A), TYPE-C2/C3: 30W',
    usbA: 'USB-A1/A2/A3: 30W (5V⎓3A, 9V⎓3A, 12V⎓3A)',
    carPort: '13.2V⎓10A',
    dcPort: '13.2V⎓8A (×2)',
    wirelessCharger: undefined,
    dcPorts: 9,
    // Verimlilik
    batteryToAcEfficiency: 94.5,
    acToBatteryEfficiency: 94.5,
    // Genel
    dimensions: '361.5×269.5×232.6mm',
    weight: 12.7,
    coolingType: 'Forced Air Cooling',
    operatingTemp: '0~40°C (Şarj), -15~+40°C (Deşarj)',
    ipRating: 'IP20',
    noiseLevel: '<65dB',
    communication: 'Wi-Fi/Bluetooth',
    chargeTimeAc: '0.85',
    image: 'https://mybucketajax.s3.eu-north-1.amazonaws.com/fusionmarkt/products/P1800-1-1.png',
    productUrl: '/urun/1024wh-3600w-max-lifepo4-tasinabilir-guc-kaynagi-ucretsiz-aplikasyon-dahili-fener-ve-kablo-seti-4000-ustu-dongu-99-99-bms-coklu-cikis-p1800',
    price: '24999'
  },

  // Singo2000Pro - Singo Serisi
  {
    id: 'singo2000pro',
    name: 'Singo 2000 Pro',
    slug: 'singo-2000-pro',
    // Batarya
    capacity: 1920,
    batteryType: 'LiFePO4',
    batteryVoltage: 48,
    batteryVoltageRange: '40~60V',
    lifeCycles: '4000+ (@25°C, 0.5C Discharge, DOD80%)',
    // AC Giriş
    acChargingPower: 1500,
    acVoltageRange: '90~140V / 180~270V',
    // DC Giriş
    carChargingPower: 120,
    solarMaxW: 500,
    dcInputVoltageRange: '10~50V',
    maxDcInputCurrent: 11,
    mpptMin: 10,
    mpptMax: 50,
    // AC Çıkış
    continuousPower: 2000,
    surgePower: 4000,
    acOutputVoltage: '120V veya 230V',
    acFrequency: '50/60Hz',
    acOutlets: 4,
    // DC Çıkış
    usbC: 'USB-TypeC ×2: 100W Max (5V, 9V, 12V: 3A; 20V: 5A)',
    usbA: 'USB-A ×1: 12W (5V, 2.4A), QC3.0 ×2: 18W Max',
    carPort: '132W (13.2V, 10A)',
    dcPort: 'DC Port ×2: 132W Max (13.2V, 10A)',
    wirelessCharger: 10,
    dcPorts: 10,
    // Verimlilik
    batteryToAcEfficiency: 92,
    acToBatteryEfficiency: 93,
    // Genel
    dimensions: '355×347×226mm',
    weight: 20.5,
    coolingType: 'Forced Air Cooling',
    operatingTemp: '0~40°C (Şarj), -15~+40°C (Deşarj)',
    ipRating: 'IP20',
    noiseLevel: '<65dB',
    communication: 'Wi-Fi',
    chargeTimeAc: '1.3',
    image: 'https://mybucketajax.s3.eu-north-1.amazonaws.com/fusionmarkt/products/SINGO2000PRO-1-7.png',
    productUrl: '/urun/1920wh-4000w-max-lifepo4-tasinabilir-guc-kaynagi-aplikasyon-kablosuz-sarj-operasyonel-kullanim-4000-ustu-dongu-99-99-bms-coklu-cikis-singo2000pro',
    price: '39999'
  },

  // P3200 - PowerMax Serisi
  {
    id: 'p3200',
    name: 'IEETek P3200',
    slug: 'ieetek-p3200',
    // Batarya
    capacity: 2048,
    batteryType: 'LiFePO4',
    batteryVoltage: 51.2,
    batteryVoltageRange: '40~60V',
    lifeCycles: '4000+ (@25°C, 0.5C Discharge, DOD80%)',
    // AC Giriş
    acChargingPower: 1800,
    acVoltageRange: '85~130V / 180~260V',
    // DC Giriş
    carChargingPower: 120,
    solarMaxW: 1000,
    dcInputVoltageRange: '12~80V',
    maxDcInputCurrent: 16,
    mpptMin: 12,
    mpptMax: 80,
    // AC Çıkış
    continuousPower: 3200,
    surgePower: 6400,
    acOutputVoltage: '100/110/120V veya 220/230/240V',
    acFrequency: '50/60Hz',
    acOutlets: 6,
    // DC Çıkış
    usbC: 'TYPE-C1/C2: 5V⎓3A, 9V⎓3A, 12V⎓3A, 15V⎓3A, 20V⎓5A; TYPE-C3/C4: 5V⎓3A, 9V⎓3A, 12V⎓2.5A, 15V⎓2A, 20V⎓1.5A',
    usbA: 'USB-A1/A2/A3/A4: 5V⎓3A, 9V⎓3A, 12V⎓3A',
    carPort: '13.2V⎓10A',
    dcPort: '5525 DC Port ×2: 13.2V⎓8A',
    wirelessCharger: undefined,
    dcPorts: 12,
    // Verimlilik
    batteryToAcEfficiency: 93,
    acToBatteryEfficiency: 93,
    // Genel
    dimensions: '445×298×371mm',
    weight: 24.35,
    coolingType: 'Forced Air Cooling',
    operatingTemp: '0~40°C (Şarj), -15~+40°C (Deşarj)',
    ipRating: 'IP20',
    noiseLevel: '<65dB',
    communication: 'Wi-Fi/Bluetooth',
    chargeTimeAc: '1.15',
    image: 'https://mybucketajax.s3.eu-north-1.amazonaws.com/fusionmarkt/products/P3200-1-1.png',
    productUrl: '/urun/2048wh-6400w-max-lifepo4-tasinabilir-guc-kaynagi-ucretsiz-aplikasyon-dahili-powerbank-jumpstarter-fener-4000-ustu-dongu-99-99-bms-coklu-cikis-p3200',
    price: '49999'
  },

  // SH4000 - Hepsi Bir Arada Enerji Depolama
  {
    id: 'sh4000',
    name: 'IEETek SH4000',
    slug: 'ieetek-sh4000',
    // Batarya
    capacity: 5120,
    batteryType: 'LiFePO4',
    batteryVoltage: 51.2,
    batteryVoltageRange: '40~60V',
    lifeCycles: '4000+ (@25°C, 0.5C Discharge, DOD80%)',
    // AC Giriş
    acChargingPower: 3600,
    acVoltageRange: '180~270V',
    // DC Giriş (Dual MPPT: HV + LV)
    carChargingPower: 120,
    solarMaxW: 3000, // HV MPPT
    dcInputVoltageRange: 'HV: 70~450V, LV: 12~50V',
    maxDcInputCurrent: 16,
    mpptMin: 70, // HV MPPT için
    mpptMax: 450,
    // AC Çıkış
    continuousPower: 4000,
    surgePower: 8000,
    acOutputVoltage: '220/230/240V',
    acFrequency: '50Hz',
    acOutlets: 4,
    // DC Çıkış
    usbC: 'USB-TypeC ×2: 100W (5V, 9V, 12V, 15V: 3A; 20V: 5A)',
    usbA: undefined,
    carPort: undefined,
    dcPort: 'XT60: 12V⎓30A, 24V⎓25A, 36V⎓20A',
    wirelessCharger: undefined,
    dcPorts: 4,
    // Verimlilik
    batteryToAcEfficiency: 93,
    acToBatteryEfficiency: 93,
    // Genel
    dimensions: '510×673×266mm (Inverter: 510×216×208mm; Battery: 510×375×198mm; Base: 510×82×256mm)',
    weight: 65,
    coolingType: 'Smart Fan Cooling',
    operatingTemp: '0~40°C (Şarj), -20~+40°C (Deşarj)',
    ipRating: 'IP54 (IP65 opsiyonel)',
    noiseLevel: '<40dB',
    communication: 'Wi-Fi/Bluetooth',
    chargeTimeAc: '1.4',
    image: 'https://mybucketajax.s3.eu-north-1.amazonaws.com/fusionmarkt/products/sh400-tasinabilir-guc-kaynagi-hibrid-7.png',
    productUrl: '/urun/5120wh-8000w-max-lifepo4-tasinabilir-guc-kaynagi-hibrid-invertor-ip54-koruma-ats-ile-uyum-4000-ustu-dongu-99-99-bms-sh4000',
    price: '79999'
  }
];

// ==========================================
// SOLAR PANELLER (Datasheet'lerden)
// ==========================================

export const SOLAR_PANELS: SolarPanel[] = [
  // SP100
  {
    id: 'sp100',
    name: 'IEETek SP100',
    slug: 'ieetek-sp100',
    // Elektriksel Parametreler
    watt: 100,
    cellType: 'Monocrystalline Silicone',
    voc: 21.6,        // Open Circuit Voltage
    vmp: 18,          // Working Voltage
    isc: 6.16,        // Short Circuit Current
    imp: 5.6,         // Working Current
    efficiency: '21~23%',
    operatingTemp: '-20°C ~ +70°C',
    // Fiziksel Parametreler
    ipRating: 'IP67',
    foldingType: '4 Fold',
    foldedDimension: '387×609×30mm',
    unfoldedDimension: '1250×609×10mm',
    weight: 5,
    mc4Connector: '18V / 5.6A',
    image: 'https://mybucketajax.s3.eu-north-1.amazonaws.com/fusionmarkt/products/SP100-1-3.png',
    productUrl: '/urun/tasinabilir-gunes-paneli-100w-ip67-su-gecirmez-3-acili-ayar-katlanabilen-gunes-enerjili-sarj-cihazi-sp100'
  },

  // SP200
  {
    id: 'sp200',
    name: 'IEETek SP200',
    slug: 'ieetek-sp200',
    // Elektriksel Parametreler
    watt: 200,
    cellType: 'Monocrystalline Silicone',
    voc: 28.8,        // Open Circuit Voltage
    vmp: 24,          // Working Voltage
    isc: 9.12,        // Short Circuit Current
    imp: 8.33,        // Working Current
    efficiency: '21~23%',
    operatingTemp: '-20°C ~ +70°C',
    // Fiziksel Parametreler
    ipRating: 'IP67',
    foldingType: '4 Fold',
    foldedDimension: '610×608×45mm',
    unfoldedDimension: '2074×608×30mm',
    weight: 8,
    mc4Connector: '24V / 8.33A',
    image: 'https://mybucketajax.s3.eu-north-1.amazonaws.com/fusionmarkt/products/SP200-1.png',
    productUrl: '/urun/tasinabilir-gunes-paneli-200w-ip67-su-gecirmez-3-acili-ayar-katlanabilen-gunes-enerjili-sarj-cihazi-sp200'
  },

  // SP400
  {
    id: 'sp400',
    name: 'IEETek SP400',
    slug: 'ieetek-sp400',
    // Elektriksel Parametreler
    watt: 400,
    cellType: 'Monocrystalline Silicone',
    voc: 52.8,        // Open Circuit Voltage
    vmp: 44,          // Working Voltage
    isc: 10,          // Short Circuit Current
    imp: 10,          // Working Current (Max)
    efficiency: '21~23%',
    operatingTemp: '-20°C ~ +70°C',
    // Fiziksel Parametreler
    ipRating: 'IP67',
    foldingType: '4 Fold',
    foldedDimension: '725×990×45mm',
    unfoldedDimension: '2617×990×30mm',
    weight: 16.3,
    mc4Connector: '44V / 10A',
    image: 'https://mybucketajax.s3.eu-north-1.amazonaws.com/fusionmarkt/products/SP400-2.png',
    productUrl: '/urun/tasinabilir-gunes-paneli-400w-ip67-su-gecirmez-3-acili-ayar-katlanabilen-gunes-enerjili-sarj-cihazi-sp400'
  }
];

// ==========================================
// HAZIR CİHAZ LİSTESİ (Hızlı ekleme için)
// ==========================================

export const PRESET_DEVICES = [
  { id: 'laptop', name: 'Laptop', power: 60, defaultHours: 5 },
  { id: 'smartphone', name: 'Akıllı Telefon', power: 15, defaultHours: 2 },
  { id: 'tablet', name: 'Tablet', power: 25, defaultHours: 3 },
  { id: 'led-lamp', name: 'LED Lamba', power: 10, defaultHours: 6 },
  { id: 'fan', name: 'Vantilatör', power: 50, defaultHours: 8 },
  { id: 'mini-fridge', name: 'Mini Buzdolabı', power: 60, defaultHours: 24 },
  { id: 'cpap', name: 'CPAP Cihazı', power: 30, defaultHours: 8 },
  { id: 'drone', name: 'Drone Şarjı', power: 100, defaultHours: 2 },
  { id: 'camera', name: 'Kamera', power: 20, defaultHours: 4 },
  { id: 'monitor', name: 'Monitör', power: 40, defaultHours: 8 },
  { id: 'projector', name: 'Projektör', power: 150, defaultHours: 3 },
  { id: 'bluetooth-speaker', name: 'Bluetooth Hoparlör', power: 20, defaultHours: 6 },
  { id: 'tv', name: 'TV (32")', power: 50, defaultHours: 5 },
  { id: 'electric-blanket', name: 'Elektrikli Battaniye', power: 100, defaultHours: 8 },
  { id: 'hair-dryer', name: 'Saç Kurutma', power: 1200, defaultHours: 0.25 },
  { id: 'electric-kettle', name: 'Su Isıtıcı', power: 1500, defaultHours: 0.1 },
  { id: 'coffee-maker', name: 'Kahve Makinesi', power: 800, defaultHours: 0.2 },
  { id: 'router', name: 'WiFi Router', power: 10, defaultHours: 24 },
];

// ==========================================
// TEKNİK ÖZELLİKLER (Backend için)
// Ürünlerin teknik detayları - Admin panelde doldurulacak
// ==========================================

export interface TechnicalSpec {
  label: string;
  labelEn: string;
  value: string;
  unit?: string;
  category: 'battery' | 'ac_input' | 'dc_input' | 'ac_output' | 'dc_output' | 'efficiency' | 'general';
}

/**
 * Güç kaynağının teknik özelliklerini tablo formatında döndürür
 */
export function getPowerStationSpecs(station: PowerStation): TechnicalSpec[] {
  return [
    // Batarya
    { label: 'Batarya Kapasitesi', labelEn: 'Battery Capacity', value: station.capacity.toString(), unit: 'Wh', category: 'battery' },
    { label: 'Batarya Tipi', labelEn: 'Battery Type', value: station.batteryType, category: 'battery' },
    { label: 'Batarya Voltajı', labelEn: 'Battery Voltage', value: station.batteryVoltage.toString(), unit: 'V', category: 'battery' },
    { label: 'Ömür Döngüsü', labelEn: 'Life Cycles', value: station.lifeCycles, category: 'battery' },
    
    // AC Giriş
    { label: 'AC Şarj Gücü', labelEn: 'AC Charging Power', value: station.acChargingPower.toString(), unit: 'W', category: 'ac_input' },
    { label: 'AC Voltaj Aralığı', labelEn: 'AC Voltage Range', value: station.acVoltageRange, category: 'ac_input' },
    
    // DC Giriş
    { label: 'Max Solar Şarj Gücü', labelEn: 'Max Solar Charging', value: station.solarMaxW.toString(), unit: 'W', category: 'dc_input' },
    { label: 'DC Giriş Voltaj Aralığı', labelEn: 'DC Input Voltage Range', value: station.dcInputVoltageRange, category: 'dc_input' },
    { label: 'Max DC Giriş Akımı', labelEn: 'Max DC Input Current', value: station.maxDcInputCurrent.toString(), unit: 'A', category: 'dc_input' },
    { label: 'Araç Şarj Gücü', labelEn: 'Car Charging Power', value: station.carChargingPower.toString(), unit: 'W', category: 'dc_input' },
    
    // AC Çıkış
    { label: 'Sürekli Çıkış Gücü', labelEn: 'Continuous Power', value: station.continuousPower.toString(), unit: 'W', category: 'ac_output' },
    { label: 'Tepe Gücü', labelEn: 'Surge Power', value: station.surgePower.toString(), unit: 'W', category: 'ac_output' },
    { label: 'AC Çıkış Voltajı', labelEn: 'AC Output Voltage', value: station.acOutputVoltage, category: 'ac_output' },
    { label: 'AC Frekansı', labelEn: 'AC Frequency', value: station.acFrequency, category: 'ac_output' },
    { label: 'AC Çıkış Sayısı', labelEn: 'AC Outlets', value: station.acOutlets?.toString() || '-', category: 'ac_output' },
    
    // DC Çıkış
    ...(station.usbC ? [{ label: 'USB-C Çıkışları', labelEn: 'USB-C Outputs', value: station.usbC, category: 'dc_output' as const }] : []),
    ...(station.usbA ? [{ label: 'USB-A Çıkışları', labelEn: 'USB-A Outputs', value: station.usbA, category: 'dc_output' as const }] : []),
    ...(station.carPort ? [{ label: 'Araç Çıkışı', labelEn: 'Car Port', value: station.carPort, category: 'dc_output' as const }] : []),
    ...(station.dcPort ? [{ label: 'DC Port', labelEn: 'DC Port', value: station.dcPort, category: 'dc_output' as const }] : []),
    ...(station.wirelessCharger ? [{ label: 'Kablosuz Şarj', labelEn: 'Wireless Charger', value: station.wirelessCharger.toString(), unit: 'W', category: 'dc_output' as const }] : []),
    
    // Verimlilik
    { label: 'Batarya → AC Verimi', labelEn: 'Battery to AC Efficiency', value: station.batteryToAcEfficiency.toString(), unit: '%', category: 'efficiency' },
    { label: 'AC → Batarya Verimi', labelEn: 'AC to Battery Efficiency', value: station.acToBatteryEfficiency.toString(), unit: '%', category: 'efficiency' },
    
    // Genel
    { label: 'Boyutlar', labelEn: 'Dimensions', value: station.dimensions, category: 'general' },
    { label: 'Ağırlık', labelEn: 'Weight', value: station.weight.toString(), unit: 'kg', category: 'general' },
    { label: 'Soğutma', labelEn: 'Cooling', value: station.coolingType, category: 'general' },
    { label: 'Çalışma Sıcaklığı', labelEn: 'Operating Temperature', value: station.operatingTemp, category: 'general' },
    { label: 'IP Koruma', labelEn: 'IP Rating', value: station.ipRating, category: 'general' },
    { label: 'Gürültü Seviyesi', labelEn: 'Noise Level', value: station.noiseLevel, category: 'general' },
    { label: 'İletişim', labelEn: 'Communication', value: station.communication, category: 'general' },
  ];
}

/**
 * Solar panelin teknik özelliklerini tablo formatında döndürür
 */
export function getSolarPanelSpecs(panel: SolarPanel): TechnicalSpec[] {
  return [
    // Elektriksel
    { label: 'Çıkış Gücü', labelEn: 'Output Power', value: panel.watt.toString(), unit: 'W', category: 'general' },
    { label: 'Hücre Tipi', labelEn: 'Cell Type', value: panel.cellType, category: 'general' },
    { label: 'Açık Devre Voltajı (Voc)', labelEn: 'Open Circuit Voltage', value: panel.voc.toString(), unit: 'V', category: 'general' },
    { label: 'Çalışma Voltajı (Vmp)', labelEn: 'Working Voltage', value: panel.vmp.toString(), unit: 'V', category: 'general' },
    { label: 'Kısa Devre Akımı (Isc)', labelEn: 'Short Circuit Current', value: panel.isc.toString(), unit: 'A', category: 'general' },
    { label: 'Çalışma Akımı (Imp)', labelEn: 'Working Current', value: panel.imp.toString(), unit: 'A', category: 'general' },
    { label: 'Verimlilik', labelEn: 'Efficiency', value: panel.efficiency, category: 'efficiency' },
    { label: 'Çalışma Sıcaklığı', labelEn: 'Operating Temperature', value: panel.operatingTemp, category: 'general' },
    
    // Fiziksel
    { label: 'IP Koruma', labelEn: 'IP Rating', value: panel.ipRating, category: 'general' },
    { label: 'Katlanma Tipi', labelEn: 'Folding Type', value: panel.foldingType, category: 'general' },
    { label: 'Katlanmış Boyut', labelEn: 'Folded Dimension', value: panel.foldedDimension, category: 'general' },
    { label: 'Açık Boyut', labelEn: 'Unfolded Dimension', value: panel.unfoldedDimension, category: 'general' },
    { label: 'Ağırlık', labelEn: 'Weight', value: panel.weight.toString(), unit: 'kg', category: 'general' },
    { label: 'MC4 Bağlantı', labelEn: 'MC4 Connector', value: panel.mc4Connector, category: 'general' },
  ];
}

/**
 * Güç kaynağını slug'a göre bul
 */
export function getPowerStationBySlug(slug: string): PowerStation | undefined {
  return POWER_STATIONS.find(ps => ps.slug === slug);
}

/**
 * Solar paneli slug'a göre bul
 */
export function getSolarPanelBySlug(slug: string): SolarPanel | undefined {
  return SOLAR_PANELS.find(sp => sp.slug === slug);
}

/**
 * Güç kaynağını ID'ye göre bul
 */
export function getPowerStationById(id: string): PowerStation | undefined {
  return POWER_STATIONS.find(ps => ps.id === id);
}

/**
 * Solar paneli ID'ye göre bul
 */
export function getSolarPanelById(id: string): SolarPanel | undefined {
  return SOLAR_PANELS.find(sp => sp.id === id);
}
