/**
 * Güç Hesaplayıcı - Hesaplama Motoru
 * PowerDADcalculator algoritmasından uyarlanmıştır
 */

import { 
  ChargeMode, 
  Season, 
  PortabilityPriority,
  ChargeSpeedPreference,
  CalculationResult,
  RecommendedPowerStation,
  RecommendedSolarPanel 
} from './types';
import { POWER_STATIONS, SOLAR_PANELS } from './products';
import type { PowerStation, SolarPanel } from './products';
import { getCityByName } from './turkey-solar-data';

// === SABİTLER ===
const SYS_EFFICIENCY = 0.75;  // Sistem verimi (inverter, kablo, sıcaklık kayıpları)

/**
 * PSH değerini hesapla
 */
export function getPSH(
  cityName: string | null,
  season: Season,
  manualPsh: number | null
): number {
  // Manuel değer varsa onu kullan
  if (manualPsh && manualPsh > 0) {
    return manualPsh;
  }

  // Şehir seçilmişse
  if (cityName) {
    const city = getCityByName(cityName);
    if (city) {
      switch (season) {
        case 'summer':
          return city.psh.summer;
        case 'winter':
          return city.psh.winter;
        default:
          return city.psh.average;
      }
    }
  }

  // Varsayılan
  return 4.0;
}

/**
 * Güç kaynağı yeterlilik hesaplama
 */
function getSufficiency(capacity: number, neededWh: number): number {
  return (capacity / neededWh) * 100;
}

/**
 * Güç kaynağı öneri algoritması (Yeterlilik bazlı)
 */
export function recommendPowerStation(
  neededWh: number,
  peakW: number,
  portability: PortabilityPriority,
  _requiredSolarW: number
): PowerStation | null {
  // İlk filtre: Sürekli güç ihtiyacını karşılayanlar
  let candidates: PowerStation[] = POWER_STATIONS.filter((ps: PowerStation) => ps.continuousPower >= peakW);

  if (candidates.length === 0) {
    // Yedek: Sürekli gücü ihtiyacın %80'ini karşılayanlar
    candidates = POWER_STATIONS.filter((ps: PowerStation) => ps.continuousPower >= peakW * 0.8);
    if (candidates.length === 0) {
      return null;
    }
  }

  // Portability moduna göre filtreleme ve sıralama
  if (portability === 'compact') {
    // Hafif/Kompakt: Yeterlilik ≤ %90
    let filtered: PowerStation[] = candidates.filter((ps: PowerStation) => getSufficiency(ps.capacity, neededWh) <= 90);
    
    // Hiç uygun yoksa en düşük yeterliliğe sahip olanı al
    if (filtered.length === 0) {
      filtered = [candidates.reduce((min: PowerStation, ps: PowerStation) => 
        getSufficiency(ps.capacity, neededWh) < getSufficiency(min.capacity, neededWh) ? ps : min
      )];
    }
    
    // Sıralama: %90'a en yakın, sonra ağırlık
    filtered.sort((a: PowerStation, b: PowerStation) => {
      const suffA = getSufficiency(a.capacity, neededWh);
      const suffB = getSufficiency(b.capacity, neededWh);
      const distA = Math.abs(90 - suffA);
      const distB = Math.abs(90 - suffB);
      
      if (distA !== distB) {
        return distA - distB;
      }
      return a.weight - b.weight;
    });
    
    return filtered[0];
  }

  if (portability === 'professional') {
    // Profesyonel: Yeterlilik ≥ %140
    let filtered: PowerStation[] = candidates.filter((ps: PowerStation) => getSufficiency(ps.capacity, neededWh) >= 140);
    
    if (filtered.length === 0) {
      filtered = [candidates.reduce((max: PowerStation, ps: PowerStation) => 
        getSufficiency(ps.capacity, neededWh) > getSufficiency(max.capacity, neededWh) ? ps : max
      )];
    }
    
    // Sıralama: Kapasite küçükten büyüğe
    filtered.sort((a: PowerStation, b: PowerStation) => a.capacity - b.capacity);
    
    return filtered[0];
  }

  // Dengeli (auto): %90 < Yeterlilik ≤ %140
  let filtered: PowerStation[] = candidates.filter((ps: PowerStation) => {
    const suff = getSufficiency(ps.capacity, neededWh);
    return suff > 90 && suff <= 140;
  });
  
  if (filtered.length === 0) {
    filtered = candidates;
  }
  
  // Sıralama: %115'e en yakın, sonra ağırlık
  filtered.sort((a: PowerStation, b: PowerStation) => {
    const suffA = getSufficiency(a.capacity, neededWh);
    const suffB = getSufficiency(b.capacity, neededWh);
    const distA = Math.abs(115 - suffA);
    const distB = Math.abs(115 - suffB);
    
    if (distA !== distB) {
      return distA - distB;
    }
    return a.weight - b.weight;
  });
  
  return filtered[0];
}

/**
 * Şarj modu haritası (Güç Kaynağı → Panel kombinasyonları)
 * Datasheet'lere göre MPPT uyumluluğu kontrol edildi
 */
const CHARGE_MODE_MAP: Record<string, Record<ChargeSpeedPreference, { panel: string; count: number; connection: 'single' | 'parallel' | 'series' }>> = {
  // P800: Max 300W solar, MPPT 12-60V
  'P800': {
    'economic': { panel: 'SP100', count: 1, connection: 'single' },  // 100W, Vmp 18V ✓
    'balanced': { panel: 'SP200', count: 1, connection: 'single' },  // 200W, Vmp 24V ✓
    'fast': { panel: 'SP200', count: 1, connection: 'single' }       // Max 300W limit
  },
  // P1800: Max 500W solar, MPPT 10-52V
  'P1800': {
    'economic': { panel: 'SP100', count: 1, connection: 'single' },  // 100W, Vmp 18V ✓
    'balanced': { panel: 'SP200', count: 1, connection: 'single' },  // 200W, Vmp 24V ✓
    'fast': { panel: 'SP200', count: 2, connection: 'parallel' }     // 400W, Vmp 24V (paralel) ✓
  },
  // Singo2000Pro: Max 500W solar, MPPT 10-50V
  'Singo': {
    'economic': { panel: 'SP100', count: 1, connection: 'single' },  // 100W, Vmp 18V ✓
    'balanced': { panel: 'SP200', count: 2, connection: 'parallel' }, // 400W, Vmp 24V ✓
    'fast': { panel: 'SP200', count: 2, connection: 'parallel' }      // Max 500W limit
  },
  // P3200: Max 1000W solar, MPPT 12-80V
  'P3200': {
    'economic': { panel: 'SP200', count: 1, connection: 'single' },  // 200W, Vmp 24V ✓
    'balanced': { panel: 'SP200', count: 2, connection: 'parallel' }, // 400W, Vmp 24V ✓
    'fast': { panel: 'SP400', count: 2, connection: 'parallel' }      // 800W, Vmp 44V ✓
  },
  // SH4000: HV MPPT 70-450V (3000W), LV MPPT 12-50V (600W)
  'SH4000': {
    'economic': { panel: 'SP200', count: 2, connection: 'parallel' }, // 400W, LV input ✓
    'balanced': { panel: 'SP400', count: 2, connection: 'series' },   // 800W, Vmp 88V → HV ✓
    'fast': { panel: 'SP400', count: 4, connection: 'series' }        // 1600W, Vmp 176V → HV ✓
  }
};

/**
 * Solar panel öneri algoritması
 */
export function recommendSolarPanel(
  dailyWh: number,
  psh: number,
  powerStation: PowerStation,
  chargeSpeed: ChargeSpeedPreference
): RecommendedSolarPanel | null {
  // Güç kaynağı için şarj tablosu anahtarını bul
  let stationKey: string | null = null;
  for (const key of Object.keys(CHARGE_MODE_MAP)) {
    if (powerStation.name.includes(key)) {
      stationKey = key;
      break;
    }
  }
  
  if (!stationKey) {
    console.warn('Güç kaynağı şarj tablosunda bulunamadı:', powerStation.name);
    return null;
  }
  
  const recommendation = CHARGE_MODE_MAP[stationKey][chargeSpeed];
  if (!recommendation) {
    return null;
  }
  
  // Paneli bul
  const selectedPanel = SOLAR_PANELS.find((p: SolarPanel) => p.name.includes(recommendation.panel));
  if (!selectedPanel) {
    return null;
  }
  
  const panelCount = recommendation.count;
  const isSeries = recommendation.connection === 'series';
  
  // Voltaj hesaplamaları (seri bağlantıda katlanır)
  const arrayVoc = isSeries ? selectedPanel.voc * panelCount : selectedPanel.voc;
  const arrayVmp = isSeries ? selectedPanel.vmp * panelCount : selectedPanel.vmp;
  
  // MPPT uyumluluk kontrolü
  if (powerStation.mpptMax && arrayVoc > powerStation.mpptMax) {
    console.warn('Array Voc MPPT limitini aşıyor');
    return null;
  }
  
  // Toplam güç
  const nominalArrayW = selectedPanel.watt * panelCount;
  const actualArrayW = powerStation.solarMaxW 
    ? Math.min(nominalArrayW, powerStation.solarMaxW) 
    : nominalArrayW;
  
  // Günlük üretim
  const dailyProduction = actualArrayW * psh;
  
  // Şarj süresi
  const chargeHours = powerStation.capacity > 0 
    ? powerStation.capacity / (actualArrayW * SYS_EFFICIENCY) 
    : 0;
  
  // İhtiyaç hesaplama
  const neededPV_W = Math.ceil(dailyWh / (psh * SYS_EFFICIENCY));
  
  return {
    totalWattage: Math.round(nominalArrayW),
    panelCount,
    singlePanelWattage: selectedPanel.watt,
    dailyProduction: Math.round(dailyProduction),
    efficiencyFactor: SYS_EFFICIENCY,
    panel: selectedPanel,
    connection: recommendation.connection,
    actualWatt: Math.round(actualArrayW),
    chargeHours,
    coverageRatio: neededPV_W > 0 ? Math.min(1, actualArrayW / neededPV_W) : 1,
    isLimited: actualArrayW < neededPV_W,
    chargeSpeed
  };
}

/**
 * Ana hesaplama fonksiyonu
 */
export function calculate(
  dailyWh: number,
  peakW: number,
  psh: number,
  autonomyDays: number,
  portability: PortabilityPriority,
  chargeMode: ChargeMode,
  chargeSpeed: ChargeSpeedPreference
): CalculationResult | null {
  // Validasyon
  if (dailyWh <= 0 || peakW <= 0) {
    return null;
  }
  
  // Solar kullanılacaksa PSH gerekli
  if ((chargeMode === 'solar-only' || chargeMode === 'hybrid') && psh <= 0) {
    return null;
  }
  
  // === BATARYA KAPASİTESİ HESAPLAMA ===
  // Formül: Günlük Wh × (Otonomi + 1)
  const neededBatteryWh = dailyWh * (autonomyDays + 1);
  
  // === SOLAR PANEL İHTİYACI HESAPLAMA ===
  const neededSolarWatt = Math.ceil(dailyWh / (psh * SYS_EFFICIENCY));
  
  // === GÜÇ KAYNAĞI ÖNERİSİ ===
  const recommendedPS = recommendPowerStation(neededBatteryWh, peakW, portability, neededSolarWatt);
  
  if (!recommendedPS) {
    return null;
  }
  
  // Yeterlilik hesapla
  const sufficiency = Math.round((recommendedPS.capacity / neededBatteryWh) * 100);
  
  // Çalışma süresi
  const runtimeHours = recommendedPS.capacity > 0 && peakW > 0 
    ? (recommendedPS.capacity * SYS_EFFICIENCY) / peakW 
    : 0;
  
  // === SOLAR PANEL ÖNERİSİ ===
  let solarRecommendation: RecommendedSolarPanel | null = null;
  if (chargeMode === 'solar-only' || chargeMode === 'hybrid') {
    solarRecommendation = recommendSolarPanel(dailyWh, psh, recommendedPS, chargeSpeed);
  }
  
  // Sonuç objesi
  const powerStationResult: RecommendedPowerStation = {
    capacity: recommendedPS.capacity,
    minCapacity: neededBatteryWh,
    recommendedCapacity: recommendedPS.capacity,
    outputPower: recommendedPS.continuousPower,
    autonomyDays: Math.floor(recommendedPS.capacity / dailyWh),
    chargeTime: {
      ac: recommendedPS.chargeTimeAc ? parseFloat(recommendedPS.chargeTimeAc) : null,
      solar: solarRecommendation?.chargeHours ?? null
    },
    station: recommendedPS,
    sufficiency,
    runtimeHours
  };
  
  return {
    powerStation: powerStationResult,
    solarPanel: solarRecommendation,
    summary: {
      totalDailyEnergy: dailyWh,
      totalMaxPower: peakW,
      netEnergyBalance: solarRecommendation 
        ? solarRecommendation.dailyProduction - dailyWh 
        : -dailyWh,
      isOffGridCapable: solarRecommendation 
        ? solarRecommendation.dailyProduction >= dailyWh 
        : false,
      recommendations: []
    },
    warnings: []
  };
}

/**
 * Saat formatı
 */
export function formatHours(hours: number, lang: 'tr' | 'en' = 'tr'): string {
  if (!isFinite(hours) || hours <= 0) return '-';
  
  const hourLabel = lang === 'en' ? 'hour' : 'saat';
  const dayLabel = lang === 'en' ? 'day' : 'gün';
  
  if (hours < 24) {
    return hours.toFixed(1) + ' ' + hourLabel;
  }
  
  const days = Math.floor(hours / 24);
  const remainingHours = (hours % 24).toFixed(1);
  return days + ' ' + dayLabel + ' ' + remainingHours + ' ' + hourLabel;
}
