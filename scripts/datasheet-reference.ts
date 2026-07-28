/**
 * Üretici datasheet'lerinden birebir aktarılmış referans değerler.
 *
 * Kaynak PDF'ler:
 *   https://cdn.fusionmarkt.com/fusionmarkt/manuals/datasheets/<slug>-datasheet.pdf
 *
 * Bu dosya tek doğruluk kaynağıdır. Sitedeki hiçbir veri buradan türetilmez;
 * tersine, `audit-datasheet-consistency.ts` sitedeki verileri buraya karşı
 * denetler. Bir değer yanlışsa önce PDF'e bakın, sonra burayı düzeltin.
 *
 * Türkiye 230Vac şebekesinde çalıştığı için, datasheet'te 120Vac ve 230Vac
 * sütunları ayrışan değerlerde (verimlilik, nominal AC akımı) 230Vac sütunu
 * alınmıştır.
 */

export type PowerStationSpec = {
  model: string;
  /** Ürün slug'ında ve blog metinlerinde arama için kullanılan anahtar. */
  key: string;
  cellType: string;
  batteryWh: number;
  batteryNominalV: number;
  batteryRangeV: string;
  lifeCycles: string;
  acChargingW: number;
  acVoltageRange: string;
  carChargingW: number;
  /** Düşük voltajlı (veya tek) solar giriş. */
  solarMaxW: number;
  dcInputRangeV: string;
  dcInputMinV: number;
  dcInputMaxV: number;
  maxPvCurrentA: number;
  /** SH4000'de ikinci, yüksek voltajlı MPPT girişi. */
  hvSolarMaxW?: number;
  hvInputRangeV?: string;
  hvInputMinV?: number;
  hvInputMaxV?: number;
  hvMaxPvCurrentA?: number;
  continuousW: number;
  surgeW: number;
  batteryToAcPct: number;
  acToBatteryPct: number;
  dimensionsMm: string;
  weightKg: number;
  ipRating: string;
  noiseDb: string;
  /**
   * Datasheet'in DC Output bölümündeki port sayıları. Singo serisinde QC3.0
   * portları da fiziksel olarak A tipi olduğu için usbAPorts'a dahildir.
   */
  usbCPorts: number;
  usbAPorts: number;
  /** Yalnızca kablosuz şarj pedi olan modellerde. */
  wirelessChargerW?: number;
};

export type SolarPanelSpec = {
  model: string;
  key: string;
  cellType: string;
  watt: number;
  /** Açık devre voltajı — MPPT uyumluluğunu belirleyen değer. */
  vocV: number;
  vmpV: number;
  iscA: number;
  impA: number;
  efficiency: string;
  ipRating: string;
  foldedMm: string;
  unfoldedMm: string;
  weightKg: number;
  workingTempC: string;
  foldType: string;
  /** Datasheet'te çıkış gücünün yanında verilen hücre grubu: "50W*4". */
  panelConfig: string;
};

export const POWER_STATIONS: PowerStationSpec[] = [
  {
    model: "P800",
    key: "p800",
    cellType: "LiFePO4",
    batteryWh: 512,
    batteryNominalV: 25.6,
    batteryRangeV: "40~60",
    lifeCycles: "4000+",
    acChargingW: 600,
    acVoltageRange: "85~130 / 180~260",
    carChargingW: 120,
    solarMaxW: 300,
    dcInputRangeV: "12~60",
    dcInputMinV: 12,
    dcInputMaxV: 60,
    maxPvCurrentA: 10,
    continuousW: 800,
    surgeW: 1600,
    batteryToAcPct: 95.0,
    acToBatteryPct: 95.0,
    dimensionsMm: "299*191.4*196.6",
    weightKg: 6.55,
    ipRating: "IP20",
    noiseDb: "<60",
    // TYPE-C1 (100W) + TYPE-C2/C3 (30W); USB-A1/A2 (30W)
    usbCPorts: 3,
    usbAPorts: 2,
  },
  {
    model: "P1800",
    key: "p1800",
    cellType: "LiFePO4",
    batteryWh: 1024,
    batteryNominalV: 51.2,
    batteryRangeV: "40~60",
    lifeCycles: "4000+",
    acChargingW: 1200,
    acVoltageRange: "85~130 / 180~260",
    carChargingW: 120,
    solarMaxW: 500,
    dcInputRangeV: "10~52",
    dcInputMinV: 10,
    dcInputMaxV: 52,
    maxPvCurrentA: 11,
    continuousW: 1800,
    surgeW: 3600,
    batteryToAcPct: 96.0,
    acToBatteryPct: 96.0,
    dimensionsMm: "361.5*269.5*232.6",
    weightKg: 12.7,
    ipRating: "IP20",
    noiseDb: "<65",
    // TYPE-C1 (100W) + TYPE-C2/C3 (30W); USB-A1/A2/A3 (30W)
    usbCPorts: 3,
    usbAPorts: 3,
  },
  {
    model: "Singo2000",
    key: "singo2000",
    cellType: "LiFePO4",
    batteryWh: 1440,
    batteryNominalV: 48,
    batteryRangeV: "40~60",
    lifeCycles: "4000+",
    acChargingW: 1200,
    acVoltageRange: "90~140 / 180~270",
    carChargingW: 120,
    solarMaxW: 500,
    dcInputRangeV: "10~50",
    dcInputMinV: 10,
    dcInputMaxV: 50,
    maxPvCurrentA: 11,
    continuousW: 2000,
    surgeW: 4000,
    batteryToAcPct: 93.0,
    acToBatteryPct: 93.0,
    dimensionsMm: "355*287*226",
    weightKg: 17.2,
    ipRating: "IP20",
    noiseDb: "<65",
    // USB-TypeC (x2); USB-A (x1) + QC3.0 (x2) — QC3.0 portları da A tipi
    usbCPorts: 2,
    usbAPorts: 3,
    wirelessChargerW: 10,
  },
  {
    model: "Singo2000Pro",
    key: "singo2000pro",
    cellType: "LiFePO4",
    batteryWh: 1920,
    batteryNominalV: 48,
    batteryRangeV: "40~60",
    lifeCycles: "4000+",
    acChargingW: 1500,
    acVoltageRange: "90~140 / 180~270",
    carChargingW: 120,
    solarMaxW: 500,
    dcInputRangeV: "10~50",
    dcInputMinV: 10,
    dcInputMaxV: 50,
    maxPvCurrentA: 11,
    continuousW: 2000,
    surgeW: 4000,
    batteryToAcPct: 93.0,
    acToBatteryPct: 93.0,
    dimensionsMm: "355*347*226",
    weightKg: 20.5,
    ipRating: "IP20",
    noiseDb: "<65",
    usbCPorts: 2,
    usbAPorts: 3,
    wirelessChargerW: 10,
  },
  {
    model: "P3200",
    key: "p3200",
    cellType: "LiFePO4",
    batteryWh: 2048,
    batteryNominalV: 51.2,
    batteryRangeV: "40~60",
    lifeCycles: "4000+",
    acChargingW: 1800,
    acVoltageRange: "85~130 / 180~260",
    carChargingW: 120,
    solarMaxW: 1000,
    dcInputRangeV: "12~80",
    dcInputMinV: 12,
    dcInputMaxV: 80,
    maxPvCurrentA: 16,
    continuousW: 3200,
    surgeW: 6400,
    batteryToAcPct: 94.0,
    acToBatteryPct: 94.0,
    dimensionsMm: "445*298*371",
    weightKg: 24.35,
    ipRating: "IP20",
    noiseDb: "<65",
    // TYPE-C1/C2 + TYPE-C3/C4; USB-A1/A2/A3/A4
    usbCPorts: 4,
    usbAPorts: 4,
  },
  {
    model: "SH4000",
    key: "sh4000",
    cellType: "LiFePO4",
    batteryWh: 5120,
    batteryNominalV: 51.2,
    batteryRangeV: "40~60",
    lifeCycles: "4000+",
    acChargingW: 3600,
    acVoltageRange: "180~270",
    carChargingW: 120,
    // LV XT60 girişi
    solarMaxW: 600,
    dcInputRangeV: "12~50",
    dcInputMinV: 12,
    dcInputMaxV: 50,
    maxPvCurrentA: 16,
    // HV MC4 girişi
    hvSolarMaxW: 3000,
    hvInputRangeV: "70~450",
    hvInputMinV: 70,
    hvInputMaxV: 450,
    hvMaxPvCurrentA: 16,
    continuousW: 4000,
    surgeW: 8000,
    batteryToAcPct: 93.0,
    acToBatteryPct: 93.0,
    // Toplam ölçü; datasheet ayrıca inverter 510*216*208, batarya 510*375*198,
    // kaide 510*82*256 olarak parçalıyor.
    dimensionsMm: "510*673*266",
    weightKg: 65,
    ipRating: "IP54",
    noiseDb: "<40",
    // Yalnızca USB-TypeC (x2); A tipi port yok.
    usbCPorts: 2,
    usbAPorts: 0,
  },
];

export const SOLAR_PANELS: SolarPanelSpec[] = [
  {
    model: "SP100",
    key: "sp100",
    cellType: "Monocrystalline",
    watt: 100,
    vocV: 21.6,
    vmpV: 18,
    iscA: 6.16,
    impA: 5.6,
    efficiency: "21~23%",
    ipRating: "IP67",
    foldedMm: "387*609*30",
    unfoldedMm: "1250*609*10",
    weightKg: 5,
    workingTempC: "-20~+70",
    foldType: "4 Fold",
    panelConfig: "25W*4",
  },
  {
    model: "SP200",
    key: "sp200",
    cellType: "Monocrystalline",
    watt: 200,
    vocV: 28.8,
    vmpV: 24,
    iscA: 9.12,
    impA: 8.33,
    efficiency: "21~23%",
    ipRating: "IP67",
    foldedMm: "610*608*45",
    unfoldedMm: "2074*608*30",
    weightKg: 8,
    workingTempC: "-20~+70",
    foldType: "4 Fold",
    panelConfig: "50W*4",
  },
  {
    model: "SP400",
    key: "sp400",
    cellType: "Monocrystalline",
    watt: 400,
    vocV: 52.8,
    vmpV: 44,
    iscA: 10,
    impA: 10,
    efficiency: "21~23%",
    ipRating: "IP67",
    foldedMm: "725*990*45",
    unfoldedMm: "2617*990*30",
    weightKg: 16.3,
    workingTempC: "-20~+70",
    foldType: "4 Fold",
    panelConfig: "100W*4",
  },
];

/**
 * Monokristal silisyum panellerde açık devre voltajının sıcaklık katsayısı.
 * IEETek datasheet'lerinde yayınlanmadığı için sektör ortalaması kullanılıyor.
 * Voc, sıcaklık STC'nin (25°C) altına düştükçe yükselir.
 */
export const VOC_TEMP_COEFF_PER_C = -0.003;

/** Verilen hücre sıcaklığında beklenen açık devre voltajı. */
export function vocAtTemperature(voc25: number, celsius: number): number {
  return voc25 * (1 + VOC_TEMP_COEFF_PER_C * (celsius - 25));
}

export type Compatibility = {
  station: string;
  panel: string;
  input: "LV" | "HV" | "tek";
  /** Seri bağlı panel sayısı; 1 ise tek panel veya paralel dizi. */
  series: number;
  ok: boolean;
  reason: string;
};

/**
 * Bir panel dizisinin bir güç kaynağına bağlanıp bağlanamayacağını datasheet
 * sınırlarına göre değerlendirir. Soğuk hava kontrolü 0°C üzerinden yapılıyor;
 * cihazların şarj sıcaklığı alt sınırı da 0°C.
 */
export function checkCompatibility(
  station: PowerStationSpec,
  panel: SolarPanelSpec,
  series = 1,
  useHv = false
): Compatibility {
  const minV = useHv ? station.hvInputMinV! : station.dcInputMinV;
  const maxV = useHv ? station.hvInputMaxV! : station.dcInputMaxV;
  const maxW = useHv ? station.hvSolarMaxW! : station.solarMaxW;
  const input = station.hvInputMinV ? (useHv ? "HV" : "LV") : "tek";

  const arrayVoc = panel.vocV * series;
  const arrayVocCold = vocAtTemperature(arrayVoc, 0);
  const arrayW = panel.watt * series;

  const base = { station: station.model, panel: panel.model, input, series } as const;

  if (arrayVoc > maxV) {
    return { ...base, ok: false, reason: `Voc ${arrayVoc.toFixed(1)}V > ${maxV}V tavanı` };
  }
  if (arrayVocCold > maxV) {
    return {
      ...base,
      ok: false,
      reason: `Voc 25°C'de ${arrayVoc.toFixed(1)}V sınırda, 0°C'de ${arrayVocCold.toFixed(1)}V ile ${maxV}V tavanını aşar`,
    };
  }
  if (arrayVoc < minV) {
    return { ...base, ok: false, reason: `Voc ${arrayVoc.toFixed(1)}V < ${minV}V alt sınırı` };
  }
  if (arrayW > maxW) {
    return {
      ...base,
      ok: true,
      reason: `bağlanır, ancak ${arrayW}W panel ${maxW}W tavanına kırpılır`,
    };
  }
  return { ...base, ok: true, reason: `uyumlu (Voc ${arrayVoc.toFixed(1)}V, ${arrayW}W)` };
}
