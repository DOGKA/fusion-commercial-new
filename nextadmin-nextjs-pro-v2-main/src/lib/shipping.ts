/**
 * Shipping / Cargo Utilities
 * Kargo takip linkleri ve yardımcı fonksiyonlar
 */

// ═══════════════════════════════════════════════════════════════════════════
// CARRIER DEFINITIONS
// ═══════════════════════════════════════════════════════════════════════════

export interface CarrierInfo {
  id: string;
  name: string;
  trackingUrl: (trackingNumber: string) => string;
  logo?: string;
  phone?: string;
  website?: string;
}

export const CARRIERS: Record<string, CarrierInfo> = {
  // Yurtiçi Kargo
  yurtici: {
    id: "yurtici",
    name: "Yurtiçi Kargo",
    trackingUrl: (tn) => `https://www.yurticikargo.com/tr/online-servisler/gonderi-sorgula?code=${tn}`,
    phone: "444 99 99",
    website: "https://www.yurticikargo.com",
  },

  // Aras Kargo
  aras: {
    id: "aras",
    name: "Aras Kargo",
    trackingUrl: (tn) => `https://www.araskargo.com.tr/taki.html?code=${tn}`,
    phone: "444 25 52",
    website: "https://www.araskargo.com.tr",
  },

  // MNG Kargo
  mng: {
    id: "mng",
    name: "MNG Kargo",
    trackingUrl: (tn) => `https://www.mngkargo.com.tr/gonderi-takip/?tracking_id=${tn}`,
    phone: "444 06 64",
    website: "https://www.mngkargo.com.tr",
  },

  // PTT Kargo
  ptt: {
    id: "ptt",
    name: "PTT Kargo",
    trackingUrl: (tn) => `https://gonderitakip.ptt.gov.tr/Track/Verify?q=${tn}`,
    phone: "444 17 88",
    website: "https://www.ptt.gov.tr",
  },

  // Sürat Kargo
  surat: {
    id: "surat",
    name: "Sürat Kargo",
    trackingUrl: (tn) => `https://www.suratkargo.com.tr/gonderi-takip?barcode=${tn}`,
    phone: "444 07 87",
    website: "https://www.suratkargo.com.tr",
  },

  // Hepsijet (Hepsiburada)
  hepsijet: {
    id: "hepsijet",
    name: "HepsiJet",
    trackingUrl: (tn) => `https://www.hepsijet.com/gonderi-takip?trackingNumber=${tn}`,
    phone: "0850 252 40 00",
    website: "https://www.hepsijet.com",
  },

  // Trendyol Express
  trendyol: {
    id: "trendyol",
    name: "Trendyol Express",
    trackingUrl: (tn) => `https://www.trendyolexpress.com/gonderi-takip/${tn}`,
    website: "https://www.trendyolexpress.com",
  },

  // UPS
  ups: {
    id: "ups",
    name: "UPS",
    trackingUrl: (tn) => `https://www.ups.com/track?loc=tr_TR&tracknum=${tn}`,
    phone: "444 00 33",
    website: "https://www.ups.com.tr",
  },

  // DHL
  dhl: {
    id: "dhl",
    name: "DHL",
    trackingUrl: (tn) => `https://www.dhl.com/tr-tr/home/tracking.html?tracking-id=${tn}`,
    phone: "444 0 345",
    website: "https://www.dhl.com.tr",
  },

  // FedEx
  fedex: {
    id: "fedex",
    name: "FedEx",
    trackingUrl: (tn) => `https://www.fedex.com/fedextrack/?trknbr=${tn}`,
    phone: "0212 444 0 333",
    website: "https://www.fedex.com/tr-tr",
  },

  // Sendeo
  sendeo: {
    id: "sendeo",
    name: "Sendeo",
    trackingUrl: (tn) => `https://www.sendeo.com.tr/takip?barcode=${tn}`,
    phone: "444 75 48",
    website: "https://www.sendeo.com.tr",
  },

  // Horoz Lojistik
  horoz: {
    id: "horoz",
    name: "Horoz Lojistik",
    trackingUrl: (tn) => `https://www.horozlojistik.com.tr/gonderi-takip?takipNo=${tn}`,
    phone: "444 04 55",
    website: "https://www.horozlojistik.com.tr",
  },
};

// ═══════════════════════════════════════════════════════════════════════════
// HELPER FUNCTIONS
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Get carrier by name (fuzzy matching)
 */
export function getCarrierByName(carrierName: string): CarrierInfo | null {
  if (!carrierName) return null;
  
  const normalized = carrierName.toLowerCase().trim();
  
  // Direct match
  if (CARRIERS[normalized]) {
    return CARRIERS[normalized];
  }
  
  // Fuzzy matching
  const fuzzyMap: Record<string, string> = {
    // Yurtiçi
    "yurtici": "yurtici",
    "yurtiçi": "yurtici",
    "yurtici kargo": "yurtici",
    "yurtiçi kargo": "yurtici",
    
    // Aras
    "aras": "aras",
    "aras kargo": "aras",
    
    // MNG
    "mng": "mng",
    "mng kargo": "mng",
    
    // PTT
    "ptt": "ptt",
    "ptt kargo": "ptt",
    
    // Sürat
    "surat": "surat",
    "sürat": "surat",
    "surat kargo": "surat",
    "sürat kargo": "surat",
    
    // HepsiJet
    "hepsijet": "hepsijet",
    "hepsi jet": "hepsijet",
    
    // Trendyol
    "trendyol": "trendyol",
    "trendyol express": "trendyol",
    
    // UPS
    "ups": "ups",
    
    // DHL
    "dhl": "dhl",
    "dhl express": "dhl",
    
    // FedEx
    "fedex": "fedex",
    "fed ex": "fedex",
    
    // Sendeo
    "sendeo": "sendeo",
    
    // Horoz
    "horoz": "horoz",
    "horoz lojistik": "horoz",
  };
  
  const carrierId = fuzzyMap[normalized];
  if (carrierId && CARRIERS[carrierId]) {
    return CARRIERS[carrierId];
  }
  
  return null;
}

/**
 * Get tracking URL for a shipment
 */
export function getTrackingUrl(carrierName: string, trackingNumber: string): string | null {
  const carrier = getCarrierByName(carrierName);
  if (!carrier || !trackingNumber) return null;
  
  return carrier.trackingUrl(trackingNumber.trim());
}

/**
 * Get all carrier names for dropdown/select
 */
export function getCarrierOptions(): { value: string; label: string }[] {
  return Object.values(CARRIERS).map(carrier => ({
    value: carrier.id,
    label: carrier.name,
  }));
}
