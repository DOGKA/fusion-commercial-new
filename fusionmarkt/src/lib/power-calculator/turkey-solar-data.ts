/**
 * Türkiye İlleri Güneş Enerjisi Verileri (PSH - Peak Sun Hours)
 * Her il için bölge bazlı yaz, kış ve yıllık ortalama güneş saati değerleri
 */

export interface CitySolarData {
  name: string;
  region: string;
  psh: {
    summer: number;    // Yaz ayları (Haziran-Ağustos)
    winter: number;    // Kış ayları (Aralık-Şubat)
    average: number;   // Yıllık ortalama
  };
}

// Bölge bazlı PSH değerleri
const REGION_PSH = {
  'Akdeniz': { summer: 7.2, winter: 3.8, average: 5.5 },
  'Ege': { summer: 6.8, winter: 3.5, average: 5.2 },
  'Marmara': { summer: 6.2, winter: 2.8, average: 4.5 },
  'İç Anadolu': { summer: 6.5, winter: 3.0, average: 4.8 },
  'Karadeniz': { summer: 5.5, winter: 2.2, average: 3.8 },
  'Doğu Anadolu': { summer: 6.0, winter: 2.5, average: 4.2 },
  'Güneydoğu Anadolu': { summer: 7.5, winter: 4.0, average: 5.8 },
} as const;

export const TURKEY_CITIES: CitySolarData[] = [
  { name: 'Adana', region: 'Akdeniz', psh: REGION_PSH['Akdeniz'] },
  { name: 'Adıyaman', region: 'Güneydoğu Anadolu', psh: REGION_PSH['Güneydoğu Anadolu'] },
  { name: 'Afyonkarahisar', region: 'Ege', psh: REGION_PSH['Ege'] },
  { name: 'Ağrı', region: 'Doğu Anadolu', psh: REGION_PSH['Doğu Anadolu'] },
  { name: 'Aksaray', region: 'İç Anadolu', psh: REGION_PSH['İç Anadolu'] },
  { name: 'Amasya', region: 'Karadeniz', psh: REGION_PSH['Karadeniz'] },
  { name: 'Ankara', region: 'İç Anadolu', psh: REGION_PSH['İç Anadolu'] },
  { name: 'Antalya', region: 'Akdeniz', psh: REGION_PSH['Akdeniz'] },
  { name: 'Ardahan', region: 'Doğu Anadolu', psh: REGION_PSH['Doğu Anadolu'] },
  { name: 'Artvin', region: 'Karadeniz', psh: REGION_PSH['Karadeniz'] },
  { name: 'Aydın', region: 'Ege', psh: REGION_PSH['Ege'] },
  { name: 'Balıkesir', region: 'Marmara', psh: REGION_PSH['Marmara'] },
  { name: 'Bartın', region: 'Karadeniz', psh: REGION_PSH['Karadeniz'] },
  { name: 'Batman', region: 'Güneydoğu Anadolu', psh: REGION_PSH['Güneydoğu Anadolu'] },
  { name: 'Bayburt', region: 'Karadeniz', psh: REGION_PSH['Karadeniz'] },
  { name: 'Bilecik', region: 'Marmara', psh: REGION_PSH['Marmara'] },
  { name: 'Bingöl', region: 'Doğu Anadolu', psh: REGION_PSH['Doğu Anadolu'] },
  { name: 'Bitlis', region: 'Doğu Anadolu', psh: REGION_PSH['Doğu Anadolu'] },
  { name: 'Bolu', region: 'Karadeniz', psh: REGION_PSH['Karadeniz'] },
  { name: 'Burdur', region: 'Akdeniz', psh: REGION_PSH['Akdeniz'] },
  { name: 'Bursa', region: 'Marmara', psh: REGION_PSH['Marmara'] },
  { name: 'Çanakkale', region: 'Marmara', psh: REGION_PSH['Marmara'] },
  { name: 'Çankırı', region: 'İç Anadolu', psh: REGION_PSH['İç Anadolu'] },
  { name: 'Çorum', region: 'Karadeniz', psh: REGION_PSH['Karadeniz'] },
  { name: 'Denizli', region: 'Ege', psh: REGION_PSH['Ege'] },
  { name: 'Diyarbakır', region: 'Güneydoğu Anadolu', psh: REGION_PSH['Güneydoğu Anadolu'] },
  { name: 'Düzce', region: 'Karadeniz', psh: REGION_PSH['Karadeniz'] },
  { name: 'Edirne', region: 'Marmara', psh: REGION_PSH['Marmara'] },
  { name: 'Elazığ', region: 'Doğu Anadolu', psh: REGION_PSH['Doğu Anadolu'] },
  { name: 'Erzincan', region: 'Doğu Anadolu', psh: REGION_PSH['Doğu Anadolu'] },
  { name: 'Erzurum', region: 'Doğu Anadolu', psh: REGION_PSH['Doğu Anadolu'] },
  { name: 'Eskişehir', region: 'İç Anadolu', psh: REGION_PSH['İç Anadolu'] },
  { name: 'Gaziantep', region: 'Güneydoğu Anadolu', psh: REGION_PSH['Güneydoğu Anadolu'] },
  { name: 'Giresun', region: 'Karadeniz', psh: REGION_PSH['Karadeniz'] },
  { name: 'Gümüşhane', region: 'Karadeniz', psh: REGION_PSH['Karadeniz'] },
  { name: 'Hakkari', region: 'Doğu Anadolu', psh: REGION_PSH['Doğu Anadolu'] },
  { name: 'Hatay', region: 'Akdeniz', psh: REGION_PSH['Akdeniz'] },
  { name: 'Iğdır', region: 'Doğu Anadolu', psh: REGION_PSH['Doğu Anadolu'] },
  { name: 'Isparta', region: 'Akdeniz', psh: REGION_PSH['Akdeniz'] },
  { name: 'İstanbul', region: 'Marmara', psh: REGION_PSH['Marmara'] },
  { name: 'İzmir', region: 'Ege', psh: REGION_PSH['Ege'] },
  { name: 'Kahramanmaraş', region: 'Akdeniz', psh: REGION_PSH['Akdeniz'] },
  { name: 'Karabük', region: 'Karadeniz', psh: REGION_PSH['Karadeniz'] },
  { name: 'Karaman', region: 'İç Anadolu', psh: REGION_PSH['İç Anadolu'] },
  { name: 'Kars', region: 'Doğu Anadolu', psh: REGION_PSH['Doğu Anadolu'] },
  { name: 'Kastamonu', region: 'Karadeniz', psh: REGION_PSH['Karadeniz'] },
  { name: 'Kayseri', region: 'İç Anadolu', psh: REGION_PSH['İç Anadolu'] },
  { name: 'Kilis', region: 'Güneydoğu Anadolu', psh: REGION_PSH['Güneydoğu Anadolu'] },
  { name: 'Kırıkkale', region: 'İç Anadolu', psh: REGION_PSH['İç Anadolu'] },
  { name: 'Kırklareli', region: 'Marmara', psh: REGION_PSH['Marmara'] },
  { name: 'Kırşehir', region: 'İç Anadolu', psh: REGION_PSH['İç Anadolu'] },
  { name: 'Kocaeli', region: 'Marmara', psh: REGION_PSH['Marmara'] },
  { name: 'Konya', region: 'İç Anadolu', psh: REGION_PSH['İç Anadolu'] },
  { name: 'Kütahya', region: 'Ege', psh: REGION_PSH['Ege'] },
  { name: 'Malatya', region: 'Doğu Anadolu', psh: REGION_PSH['Doğu Anadolu'] },
  { name: 'Manisa', region: 'Ege', psh: REGION_PSH['Ege'] },
  { name: 'Mardin', region: 'Güneydoğu Anadolu', psh: REGION_PSH['Güneydoğu Anadolu'] },
  { name: 'Mersin', region: 'Akdeniz', psh: REGION_PSH['Akdeniz'] },
  { name: 'Muğla', region: 'Ege', psh: REGION_PSH['Ege'] },
  { name: 'Muş', region: 'Doğu Anadolu', psh: REGION_PSH['Doğu Anadolu'] },
  { name: 'Nevşehir', region: 'İç Anadolu', psh: REGION_PSH['İç Anadolu'] },
  { name: 'Niğde', region: 'İç Anadolu', psh: REGION_PSH['İç Anadolu'] },
  { name: 'Ordu', region: 'Karadeniz', psh: REGION_PSH['Karadeniz'] },
  { name: 'Osmaniye', region: 'Akdeniz', psh: REGION_PSH['Akdeniz'] },
  { name: 'Rize', region: 'Karadeniz', psh: REGION_PSH['Karadeniz'] },
  { name: 'Sakarya', region: 'Marmara', psh: REGION_PSH['Marmara'] },
  { name: 'Samsun', region: 'Karadeniz', psh: REGION_PSH['Karadeniz'] },
  { name: 'Şanlıurfa', region: 'Güneydoğu Anadolu', psh: REGION_PSH['Güneydoğu Anadolu'] },
  { name: 'Siirt', region: 'Güneydoğu Anadolu', psh: REGION_PSH['Güneydoğu Anadolu'] },
  { name: 'Sinop', region: 'Karadeniz', psh: REGION_PSH['Karadeniz'] },
  { name: 'Sivas', region: 'İç Anadolu', psh: REGION_PSH['İç Anadolu'] },
  { name: 'Şırnak', region: 'Güneydoğu Anadolu', psh: REGION_PSH['Güneydoğu Anadolu'] },
  { name: 'Tekirdağ', region: 'Marmara', psh: REGION_PSH['Marmara'] },
  { name: 'Tokat', region: 'Karadeniz', psh: REGION_PSH['Karadeniz'] },
  { name: 'Trabzon', region: 'Karadeniz', psh: REGION_PSH['Karadeniz'] },
  { name: 'Tunceli', region: 'Doğu Anadolu', psh: REGION_PSH['Doğu Anadolu'] },
  { name: 'Uşak', region: 'Ege', psh: REGION_PSH['Ege'] },
  { name: 'Van', region: 'Doğu Anadolu', psh: REGION_PSH['Doğu Anadolu'] },
  { name: 'Yalova', region: 'Marmara', psh: REGION_PSH['Marmara'] },
  { name: 'Yozgat', region: 'İç Anadolu', psh: REGION_PSH['İç Anadolu'] },
  { name: 'Zonguldak', region: 'Karadeniz', psh: REGION_PSH['Karadeniz'] },
];

export function getCityByName(name: string): CitySolarData | undefined {
  return TURKEY_CITIES.find(city => city.name === name);
}

export function getCitiesByRegion(region: string): CitySolarData[] {
  return TURKEY_CITIES.filter(city => city.region === region);
}
