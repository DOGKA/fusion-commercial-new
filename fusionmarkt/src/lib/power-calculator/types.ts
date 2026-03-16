/**
 * Güç Hesaplayıcı Tip Tanımları
 */

// Şarj modları
export type ChargeMode = 'hybrid' | 'solar-only' | 'grid-only' | 'no-charge';

// Mevsim seçenekleri
export type Season = 'average' | 'summer' | 'winter';

// Taşınabilirlik önceliği
export type PortabilityPriority = 'auto' | 'compact' | 'professional';

// Şarj hızı tercihi
export type ChargeSpeedPreference = 'balanced' | 'economic' | 'fast';

// Cihaz bilgisi
export interface Device {
  id: string;
  name: string;
  power: number;      // Watt
  quantity: number;
  hoursPerDay: number;
  dailyEnergy: number; // Wh/gün (power * quantity * hoursPerDay)
}

// Senaryo tanımı
export interface Scenario {
  id: string;
  name: string;
  nameEn: string;
  icon: string;
  dailyEnergy: number;  // Wh/gün
  maxPower: number;     // W
  description?: string;
  descriptionEn?: string;
}

// Hesaplayıcı form durumu
export interface CalculatorFormState {
  // Enerji ihtiyaçları
  dailyEnergy: number;      // Wh/gün
  maxPower: number;         // W
  devices: Device[];
  
  // Şarj ve güneş ayarları
  chargeMode: ChargeMode;
  selectedCity: string;
  season: Season;
  manualPsh: number | null;
  
  // Tercihler
  portabilityPriority: PortabilityPriority;
  chargeSpeedPreference: ChargeSpeedPreference;
  
  // UI durumu
  selectedScenario: string | null;
  language: 'tr' | 'en';
}

// Önerilen güç istasyonu
export interface RecommendedPowerStation {
  capacity: number;         // Wh
  minCapacity: number;      // Wh (güvenlik payı dahil)
  recommendedCapacity: number; // Wh (önerilen)
  outputPower: number;      // W
  autonomyDays: number;     // Otonom gün sayısı
  chargeTime: {
    ac: number | null;      // Saat (şebekeden)
    solar: number | null;   // Saat (solar panel ile)
  };
  station?: import('./products').PowerStation;
  sufficiency?: number;     // Yeterlilik yüzdesi
  runtimeHours?: number;    // Çalışma süresi (saat)
}

// Önerilen solar panel
export interface RecommendedSolarPanel {
  totalWattage: number;     // Toplam W
  panelCount: number;       // Panel sayısı
  singlePanelWattage: number; // Tek panel W
  dailyProduction: number;  // Günlük üretim Wh
  efficiencyFactor: number; // Verimlilik faktörü
  panel?: import('./products').SolarPanel;
  connection?: 'single' | 'parallel' | 'series';
  actualWatt?: number;      // Gerçek kullanılabilir W
  chargeHours?: number;     // Şarj süresi
  coverageRatio?: number;   // Karşılama oranı (0-1)
  isLimited?: boolean;      // Limit aşımı var mı
  chargeSpeed?: ChargeSpeedPreference;
}

// Hesaplama sonucu
export interface CalculationResult {
  powerStation: RecommendedPowerStation;
  solarPanel: RecommendedSolarPanel | null;
  summary: {
    totalDailyEnergy: number;
    totalMaxPower: number;
    netEnergyBalance: number; // Üretim - Tüketim
    isOffGridCapable: boolean;
    recommendations: string[];
  };
  warnings: string[];
}

// Dil çevirileri
export interface Translations {
  title: string;
  subtitle: string;
  scenarioSection: string;
  scenarioDescription: string;
  energySection: string;
  dailyEnergy: string;
  maxPower: string;
  addDevice: string;
  devicePower: string;
  deviceQuantity: string;
  deviceHours: string;
  solarSection: string;
  chargeMode: string;
  chargeModeHybrid: string;
  chargeModeSolar: string;
  chargeModeGrid: string;
  chargeModeNone: string;
  selectCity: string;
  selectSeason: string;
  seasonAverage: string;
  seasonSummer: string;
  seasonWinter: string;
  manualPsh: string;
  preferencesSection: string;
  portability: string;
  portabilityAuto: string;
  portabilityCompact: string;
  portabilityProfessional: string;
  chargeSpeed: string;
  chargeSpeedBalanced: string;
  chargeSpeedEconomic: string;
  chargeSpeedFast: string;
  calculate: string;
  reset: string;
  results: string;
  recommendedStation: string;
  recommendedPanel: string;
  capacity: string;
  outputPower: string;
  autonomyDays: string;
  chargeTime: string;
  totalWattage: string;
  panelCount: string;
  dailyProduction: string;
  pshInfo: string;
  customEntry: string;
}
