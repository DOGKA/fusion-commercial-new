'use client';

import React, { useState, useCallback, useMemo, useEffect, useRef } from 'react';
import Image from 'next/image';
import { 
  ChargeMode, 
  Season, 
  PortabilityPriority, 
  ChargeSpeedPreference,
  Device,
  ScenarioDevice,
  CalculationResult
} from '@/lib/power-calculator/types';
import { SCENARIOS, getScenarioById } from '@/lib/power-calculator/scenarios';
import { TURKEY_CITIES } from '@/lib/power-calculator/turkey-solar-data';
import { calculate, getPSH, formatHours } from '@/lib/power-calculator/calculate';
import { useCart } from '@/context/CartContext';
import { formatPrice } from '@/lib/utils';
import EnergySummaryEditor from './EnergySummaryEditor';

// İkonlar - Sadece Lucide
import { 
  Zap, 
  Sun, 
  Battery, 
  Plus, 
  Trash2, 
  ChevronDown,
  Plug,
  BatteryCharging,
  Leaf,
  Power,
  ShoppingBag,
  Check,
  Pencil,
  GraduationCap,
  Tent,
  Caravan,
  Home,
  Camera,
  Music,
  TreePine,
  Laptop,
  Ship,
  Wrench,
  Store,
  Smartphone,
  Tv,
  Lightbulb,
  Fan,
  Thermometer,
  Coffee,
  Router,
  Monitor,
  Projector,
  Speaker,
  Bed,
  Wind,
  Flame,
  Heart,
  UtensilsCrossed,
  Shield,
  Flower2,
  Wheat,
  Refrigerator,
  Radio,
  Radar,
  Flashlight,
  Sparkles,
  Scissors,
  Stethoscope,
  CreditCard,
  Droplets,
  Cloud,
  Minus,
  LucideIcon
} from 'lucide-react';

// Icon map for scenarios
const SCENARIO_ICONS: Record<string, LucideIcon> = {
  'Pencil': Pencil,
  'GraduationCap': GraduationCap,
  'Tent': Tent,
  'Caravan': Caravan,
  'Home': Home,
  'Camera': Camera,
  'Music': Music,
  'TreePine': TreePine,
  'Laptop': Laptop,
  'Ship': Ship,
  'Wrench': Wrench,
  'Store': Store,
  'Heart': Heart,
  'UtensilsCrossed': UtensilsCrossed,
  'Shield': Shield,
  'Flower2': Flower2,
  'Wheat': Wheat,
};

// Icon map for preset ve senaryo cihazları
const DEVICE_ICONS: Record<string, LucideIcon> = {
  'laptop': Laptop,
  'smartphone': Smartphone,
  'tablet': Smartphone,
  'led-lamp': Lightbulb,
  'fan': Fan,
  'mini-fridge': Thermometer,
  'fridge': Refrigerator,
  'cpap': Wind,
  'drone': Camera,
  'camera': Camera,
  'monitor': Monitor,
  'projector': Projector,
  'bluetooth-speaker': Speaker,
  'tv': Tv,
  'electric-blanket': Bed,
  'hair-dryer': Wind,
  'electric-kettle': Flame,
  'coffee-maker': Coffee,
  'router': Router,
  'pump': Droplets,
  'flashlight': Flashlight,
  'radio': Radio,
  'smoke': Cloud,
  'music': Music,
  'party-light': Sparkles,
  'sonar': Radar,
  'walkie': Radio,
  'survey': Radar,
  'pos': CreditCard,
  'security': Shield,
  'sensor': Radar,
  'mower': Scissors,
  'trimmer': Scissors,
  'medical': Stethoscope,
  'wrench': Wrench,
};

// Step types
type Step = 'scenario' | 'devices' | 'energy' | 'charge' | 'preferences' | 'results';

// Senaryo cihazlarından toplam Wh ve max W hesapla
function computeTotalsFromDevices(list: Device[]): { totalWh: number; maxW: number } {
  let totalWh = 0;
  let maxW = 0;
  for (const d of list) {
    totalWh += d.dailyEnergy;
    const peak = d.power * Math.max(1, d.quantity);
    if (peak > maxW) maxW = peak;
  }
  return { totalWh, maxW };
}

// ScenarioDevice -> Device dönüşümü (state için)
function scenarioDeviceToDevice(sd: ScenarioDevice, index: number): Device {
  const qty = sd.quantity || 1;
  return {
    id: `sd-${index}-${Date.now()}`,
    name: sd.name,
    power: sd.power,
    quantity: qty,
    hoursPerDay: sd.hoursPerDay,
    dailyEnergy: sd.power * qty * sd.hoursPerDay,
    iconKey: sd.icon,
  };
}

// Veritabanı ürün bilgisi tipi
interface DBProduct {
  id: string;
  name: string;
  slug: string;
  price: number;
  comparePrice: number | null;
  image: string | null;
  brand: string | null;
}

interface BundleSuggestionItem {
  id: string;
  quantity: number;
  product?: {
    id: string;
    name: string;
    slug: string;
    thumbnail: string | null;
    price: number;
  } | null;
}

interface BundleSuggestion {
  id: string;
  name: string;
  slug: string;
  price: number;
  totalValue: number;
  savings: number;
  savingsPercent: number;
  thumbnail?: string | null;
  stock: number;
  itemCount: number;
  items: BundleSuggestionItem[];
  isFeatured?: boolean;
}

function getPowerStationDisplayName(station: { id?: string; name: string }) {
  const model = station.id?.toUpperCase() || station.name.replace(/^IEETek\s+/i, '').trim();
  return `${model} Taşınabilir Güç Kaynağı`;
}

function getSolarPanelDisplayName(panel: { id?: string; name: string }) {
  const model = panel.id?.toUpperCase() || panel.name.replace(/^IEETek\s+/i, '').trim();
  return `${model} Katlanabilir Güneş Paneli`;
}

export default function PowerCalculator() {
  const { addItem, openCart } = useCart();

  // Wizard step
  const [currentStep, setCurrentStep] = useState<Step>('scenario');
  
  // Form durumu
  const [dailyEnergy, setDailyEnergy] = useState<number>(0);
  const [maxPower, setMaxPower] = useState<number>(0);
  const [devices, setDevices] = useState<Device[]>([]);
  const [selectedScenario, setSelectedScenario] = useState<string | null>(null);
  
  // Şarj ayarları
  const [chargeMode, setChargeMode] = useState<ChargeMode>('hybrid');
  const [selectedCity, setSelectedCity] = useState<string>('');
  const [season, setSeason] = useState<Season>('average');
  const [manualPsh, setManualPsh] = useState<number | null>(null);
  
  // Tercihler
  const [portability, setPortability] = useState<PortabilityPriority>('auto');
  const [chargeSpeed, setChargeSpeed] = useState<ChargeSpeedPreference>('balanced');
  const [autonomyDays, setAutonomyDays] = useState<number>(0);
  
  // Hızlı cihaz ekleme
  const [devicePower, setDevicePower] = useState<number>(60);
  const [deviceName, setDeviceName] = useState<string>('');
  const [deviceQty, setDeviceQty] = useState<number>(1);
  const [deviceHours, setDeviceHours] = useState<number>(1);
  const [showDevicePanel, setShowDevicePanel] = useState(false);
  
  // Sonuçlar
  const [result, setResult] = useState<CalculationResult | null>(null);

  // CTA success feedback (results cards)
  const [stationAdded, setStationAdded] = useState(false);
  const [panelAdded, setPanelAdded] = useState(false);
  const stationAddedTimeoutRef = useRef<number | null>(null);
  const panelAddedTimeoutRef = useRef<number | null>(null);
  
  // Veritabanından ürün bilgileri
  const [dbProducts, setDbProducts] = useState<Record<string, DBProduct>>({});
  const productsFetchedRef = useRef(false);
  const [bundleSuggestions, setBundleSuggestions] = useState<BundleSuggestion[]>([]);
  const [bundleSuggestionsLoading, setBundleSuggestionsLoading] = useState(false);
  
  // Ürün bilgilerini veritabanından çek
  useEffect(() => {
    if (productsFetchedRef.current) return;
    productsFetchedRef.current = true;
    
    const fetchProducts = async () => {
      try {
        const res = await fetch('/api/public/power-calculator-products');
        const data = await res.json();
        if (data.products) {
          // Using queueMicrotask to avoid setState in effect warning
          queueMicrotask(() => setDbProducts(data.products));
        }
      } catch (err) {
        console.error('Failed to fetch product data:', err);
      }
    };
    fetchProducts();
  }, []);

  // Cleanup timeouts
  useEffect(() => {
    return () => {
      if (stationAddedTimeoutRef.current) window.clearTimeout(stationAddedTimeoutRef.current);
      if (panelAddedTimeoutRef.current) window.clearTimeout(panelAddedTimeoutRef.current);
    };
  }, []);

  // PSH değerini hesapla
  const psh = useMemo(() => {
    return getPSH(selectedCity || null, season, manualPsh);
  }, [selectedCity, season, manualPsh]);

  // Seçili şehrin PSH değerleri
  const cityPshValues = useMemo(() => {
    const city = TURKEY_CITIES.find(c => c.name === selectedCity);
    return city?.psh || null;
  }, [selectedCity]);

  const recommendedStationDbProduct = useMemo(() => {
    const stationId = result?.powerStation.station?.id;
    return stationId ? dbProducts[stationId] || null : null;
  }, [result?.powerStation.station?.id, dbProducts]);

  const recommendedPanelDbProduct = useMemo(() => {
    const panelId = result?.solarPanel?.panel?.id;
    return panelId ? dbProducts[panelId] || null : null;
  }, [result?.solarPanel?.panel?.id, dbProducts]);

  // Sonuç ekranı için hazır bundle önerileri
  useEffect(() => {
    const stationDbId = recommendedStationDbProduct?.id;
    const panelDbId = recommendedPanelDbProduct?.id || null;

    if (currentStep !== 'results' || !stationDbId) {
      setBundleSuggestions([]);
      setBundleSuggestionsLoading(false);
      return;
    }

    let cancelled = false;

    const fetchBundleSuggestions = async () => {
      setBundleSuggestionsLoading(true);
      setBundleSuggestions([]);

      try {
        const response = await fetch('/api/public/bundles?limit=60');
        const data = await response.json();
        const bundles: BundleSuggestion[] = Array.isArray(data?.bundles) ? data.bundles : [];

        const matchedBundles = bundles
          .filter((bundle) => bundle.items?.some((item) => item.product?.id === stationDbId))
          .sort((a, b) => {
            const aHasPanel = panelDbId ? a.items?.some((item) => item.product?.id === panelDbId) : false;
            const bHasPanel = panelDbId ? b.items?.some((item) => item.product?.id === panelDbId) : false;

            if (aHasPanel !== bHasPanel) return aHasPanel ? -1 : 1;
            if ((a.isFeatured || false) !== (b.isFeatured || false)) return a.isFeatured ? -1 : 1;
            if (a.savingsPercent !== b.savingsPercent) return b.savingsPercent - a.savingsPercent;
            return a.price - b.price;
          })
          .slice(0, 3);

        if (!cancelled) {
          setBundleSuggestions(matchedBundles);
        }
      } catch (error) {
        console.error('Failed to fetch bundle suggestions:', error);
        if (!cancelled) {
          setBundleSuggestions([]);
        }
      } finally {
        if (!cancelled) {
          setBundleSuggestionsLoading(false);
        }
      }
    };

    fetchBundleSuggestions();

    return () => {
      cancelled = true;
    };
  }, [currentStep, recommendedPanelDbProduct?.id, recommendedStationDbProduct?.id]);

  // Senaryoları görüntüleme sırası:
  // - Özel Giriş (custom) her zaman ilk sırada
  // - Sonra dailyEnergy'ye göre küçükten büyüğe
  const sortedScenarios = useMemo(() => {
    const customFirst = SCENARIOS.filter(s => s.id === 'custom');
    const rest = SCENARIOS
      .filter(s => s.id !== 'custom')
      .slice()
      .sort((a, b) => a.dailyEnergy - b.dailyEnergy);
    return [...customFirst, ...rest];
  }, []);

  // Senaryo seçimi - cihaz detay adımına geç
  const handleScenarioSelect = useCallback((scenarioId: string) => {
    setSelectedScenario(scenarioId);
    const scenario = getScenarioById(scenarioId);
    if (scenario && scenarioId !== 'custom') {
      // Senaryonun cihazlarını yükle
      const loaded: Device[] = (scenario.devices || []).map((sd, i) => scenarioDeviceToDevice(sd, i));
      setDevices(loaded);
      if (loaded.length > 0) {
        const { totalWh, maxW } = computeTotalsFromDevices(loaded);
        setDailyEnergy(totalWh);
        setMaxPower(maxW || scenario.maxPower);
      } else {
        setDailyEnergy(scenario.dailyEnergy);
        setMaxPower(scenario.maxPower);
      }
      // Cihaz detay adımına geç
      setTimeout(() => setCurrentStep('devices'), 200);
    } else {
      // Özel giriş: enerji adımına
      setDevices([]);
      setDailyEnergy(0);
      setMaxPower(0);
      setTimeout(() => setCurrentStep('energy'), 200);
    }
  }, []);

  // Senaryo cihazlarının inline düzenlenmesi (W, saat, adet)
  const handleUpdateDeviceField = useCallback(
    (deviceId: string, field: 'power' | 'hoursPerDay' | 'quantity', value: number) => {
      setDevices(prev => {
        const next = prev.map(d => {
          if (d.id !== deviceId) return d;
          const updated: Device = { ...d };
          if (field === 'power') updated.power = Math.max(0, value);
          if (field === 'hoursPerDay') updated.hoursPerDay = Math.max(0, value);
          if (field === 'quantity') updated.quantity = Math.max(1, Math.floor(value || 1));
          updated.dailyEnergy = updated.power * Math.max(1, updated.quantity) * updated.hoursPerDay;
          return updated;
        });
        const { totalWh, maxW } = computeTotalsFromDevices(next);
        setDailyEnergy(totalWh);
        setMaxPower(maxW);
        return next;
      });
    },
    []
  );

  // Cihaz ekleme
  const handleAddDevice = useCallback(() => {
    if (devicePower <= 0 || deviceQty <= 0 || deviceHours <= 0) return;

    const newDevice: Device = {
      id: `manual-${Date.now()}`,
      name: deviceName.trim() || `${devicePower}W Cihaz`,
      power: devicePower,
      quantity: deviceQty,
      hoursPerDay: deviceHours,
      dailyEnergy: devicePower * deviceQty * deviceHours,
      iconKey: undefined,
    };

    setDevices(prev => {
      const next = [newDevice, ...prev];
      const { totalWh, maxW } = computeTotalsFromDevices(next);
      setDailyEnergy(totalWh);
      setMaxPower(maxW);
      return next;
    });

    setDeviceName('');
    setDevicePower(60);
    setDeviceQty(1);
    setDeviceHours(1);
  }, [deviceHours, deviceName, devicePower, deviceQty]);

  // Cihaz silme — total Wh ve max W yeniden hesaplanır
  const handleRemoveDevice = useCallback((deviceId: string) => {
    setDevices(prev => {
      const next = prev.filter(d => d.id !== deviceId);
      const { totalWh, maxW } = computeTotalsFromDevices(next);
      setDailyEnergy(totalWh);
      setMaxPower(maxW);
      return next;
    });
  }, []);

  // Hesaplama
  const handleCalculate = useCallback(() => {
    if (dailyEnergy <= 0 || maxPower <= 0) {
      return null;
    }

    const calcResult = calculate(
      dailyEnergy,
      maxPower,
      psh,
      autonomyDays,
      portability,
      chargeMode,
      chargeSpeed
    );

    if (calcResult) {
      setResult(calcResult);
      return calcResult;
    }
    return null;
  }, [dailyEnergy, maxPower, psh, autonomyDays, portability, chargeMode, chargeSpeed]);

  // Otomatik hesaplama - tercihler değişince (sonuçlar sayfasında)
  useEffect(() => {
    if (currentStep === 'results' && dailyEnergy > 0 && maxPower > 0) {
      queueMicrotask(() => handleCalculate());
    }
  }, [portability, chargeSpeed, currentStep, dailyEnergy, maxPower, handleCalculate]);

  // Sıfırlama
  const handleReset = useCallback(() => {
    setDailyEnergy(0);
    setMaxPower(0);
    setDevices([]);
    setSelectedScenario(null);
    setChargeMode('hybrid');
    setSelectedCity('');
    setSeason('average');
    setManualPsh(null);
    setPortability('auto');
    setChargeSpeed('balanced');
    setAutonomyDays(0);
    setResult(null);
    setCurrentStep('scenario');
  }, []);

  // Step navigation
  // - Hazır senaryo seçildi (custom hariç): 'devices' alt-adımı gösterilir
  // - Custom / seçimsiz (manuel cihaz ekleme): 'energy' alt-adımı (veya direkt charge)
  const isScenarioFlow = selectedScenario !== null && selectedScenario !== 'custom';
  const steps: { id: Step; label: string; icon: LucideIcon }[] = isScenarioFlow
    ? [
        { id: 'scenario', label: 'Senaryo', icon: Zap },
        { id: 'devices', label: 'Cihazlar', icon: Battery },
        { id: 'charge', label: 'Şarj', icon: Sun },
        { id: 'results', label: 'Sonuçlar', icon: Check },
      ]
    : [
        { id: 'scenario', label: 'Senaryo', icon: Zap },
        { id: 'energy', label: 'Enerji', icon: Battery },
        { id: 'charge', label: 'Şarj', icon: Sun },
        { id: 'results', label: 'Sonuçlar', icon: Check },
      ];

  const currentStepIndex = steps.findIndex(s => s.id === currentStep);
  const canGoNext =
    currentStep === 'scenario' ? (selectedScenario !== null || (devices.length > 0 && dailyEnergy > 0 && maxPower > 0)) :
    currentStep === 'devices' ? (devices.length > 0 && dailyEnergy > 0 && maxPower > 0) :
    currentStep === 'energy' ? dailyEnergy > 0 && maxPower > 0 :
    currentStep === 'charge' ? true :
    false;

  const goNext = () => {
    // Senaryo adımından cihaz ekleyerek devam ediyorsak, cihaz detay adımını atla
    if (currentStep === 'scenario' && selectedScenario === null && devices.length > 0 && dailyEnergy > 0) {
      setCurrentStep('charge');
      return;
    }
    const nextIndex = currentStepIndex + 1;
    if (nextIndex < steps.length) {
      setCurrentStep(steps[nextIndex].id);
      if (steps[nextIndex].id === 'results') {
        handleCalculate();
      }
    }
  };

  const goPrev = () => {
    const prevIndex = currentStepIndex - 1;
    if (prevIndex >= 0) {
      setCurrentStep(steps[prevIndex].id);
    }
  };

  return (
    <div className="power-calculator-page max-w-5xl mx-auto px-4 py-8">
      {/* Step Indicator - Simple Minimal */}
      <div className="flex items-center justify-center mb-10">
        <div className="inline-flex items-center gap-2">
          {steps.map((step, idx) => {
            const Icon = step.icon;
            const isActive = step.id === currentStep;
            const isCompleted = idx < currentStepIndex;
            const isClickable = idx <= currentStepIndex || (idx === currentStepIndex + 1 && canGoNext);
            
            return (
              <React.Fragment key={step.id}>
                <button
                  onClick={() => isClickable && setCurrentStep(step.id)}
                  disabled={!isClickable}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-xl transition-all duration-300 ${
                    isActive 
                      ? 'bg-emerald-500/20 text-emerald-400' 
                      : isCompleted 
                        ? 'text-emerald-400 hover:text-emerald-300' 
                        : isClickable
                          ? 'text-foreground hover:text-foreground'
                          : 'text-foreground/50 cursor-not-allowed'
                  }`}
                >
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center transition-colors ${
                    isActive || isCompleted ? 'text-emerald-400' : 'text-foreground'
                  }`}>
                    <Icon size={16} />
                  </div>
                  <span className={`text-sm font-medium hidden lg:block transition-colors ${
                    isActive || isCompleted ? 'text-emerald-400' : 'text-foreground'
                  }`}>
                    {step.label}
                  </span>
                </button>
                {idx < steps.length - 1 && (
                  <div className={`w-8 h-px hidden sm:block ${
                    idx < currentStepIndex ? 'bg-emerald-500' : 'bg-foreground/20'
                  }`} />
                )}
              </React.Fragment>
            );
          })}
        </div>
      </div>

      {/* Step Content - Glassmorphism Card */}
      <div className="relative p-6 md:p-8 rounded-3xl bg-surface-secondary border border-border backdrop-blur-xl shadow-2xl">
        {/* STEP 1: Senaryo Seçimi + Hızlı Cihaz Ekleme */}
        {currentStep === 'scenario' && (
          <div className="animate-fade-in">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold text-foreground mb-2">
                Kullanım Senaryonuzu Seçin
              </h2>
              <p className="text-sm text-foreground-secondary">
                Hazır senaryolardan birini seçin veya cihazlarınızı ekleyin
              </p>
            </div>
            
            {/* Senaryolar - Yatay liste: Mobil 1, Web 2 sütun */}
            <div className="pc-scenario-grid gap-2 md:gap-3 mb-6">
              {sortedScenarios.map((scenario) => {
                const Icon = SCENARIO_ICONS[scenario.icon] || Zap;
                const isSelected = selectedScenario === scenario.id;
                return (
                  <button
                    key={scenario.id}
                    onClick={() => handleScenarioSelect(scenario.id)}
                    className={`group relative flex items-center gap-3 p-3 md:p-4 rounded-xl border backdrop-blur-sm transition-all duration-300 text-left ${
                      isSelected
                        ? 'border-emerald-500 bg-emerald-500/10 shadow-[0_0_20px_rgba(16,185,129,0.15)]'
                        : 'border-border bg-surface-secondary hover:bg-background-hover hover:border-border-hover'
                    }`}
                  >
                    <div className={`w-11 h-11 rounded-lg flex items-center justify-center shrink-0 transition-all ${
                      isSelected
                        ? 'bg-emerald-500 text-white'
                        : 'bg-emerald-500/10 text-emerald-500 group-hover:bg-emerald-500/20'
                    }`}>
                      <Icon className="w-5 h-5" />
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-semibold text-foreground truncate">
                        {scenario.name}
                      </div>
                      {scenario.description && (
                        <div className="text-xs text-foreground-muted truncate">
                          {scenario.description}
                        </div>
                      )}
                    </div>

                    {scenario.dailyEnergy > 0 && (
                      <span className={`shrink-0 text-xs font-semibold px-2 py-1 rounded-md ${
                        isSelected ? 'bg-emerald-500/20 text-emerald-500' : 'bg-background-secondary text-foreground-muted'
                      }`}>
                        {scenario.dailyEnergy}Wh
                      </span>
                    )}

                    {isSelected && (
                      <div className="absolute -top-1 -right-1 w-4 h-4 bg-emerald-500 rounded-full flex items-center justify-center">
                        <Check className="w-2.5 h-2.5 text-white" />
                      </div>
                    )}
                  </button>
                );
              })}
            </div>

          </div>
        )}

        {/* STEP 2a: Senaryo Cihaz Detayları (Hazır senaryo seçildiğinde) */}
        {currentStep === 'devices' && (() => {
          const scenario = selectedScenario ? getScenarioById(selectedScenario) : null;
          const ScenarioIcon = scenario ? (SCENARIO_ICONS[scenario.icon] || Zap) : Zap;
          return (
            <div className="animate-fade-in">
              {/* Başlık */}
              <div className="flex items-start gap-3 mb-5 sm:mb-6">
                <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center shrink-0">
                  <ScenarioIcon className="w-5 h-5 sm:w-6 sm:h-6" />
                </div>
                <div className="flex-1 min-w-0">
                  <h2 className="text-lg sm:text-2xl font-bold text-foreground leading-tight">
                    {scenario?.name || 'Cihazlar'}
                  </h2>
                  <p className="text-xs sm:text-sm text-foreground-secondary mt-0.5">
                    Tipik cihazları gösteriyoruz. Güç, saat ve adet alanlarına tıklayarak kendi değerlerinize göre düzenleyin.
                  </p>
                </div>
              </div>

              {/* Cihaz kartları - mobil & desktop ortak tek sütun liste */}
              <div className="space-y-2.5 sm:space-y-3">
                {devices.map((device) => {
                  const Icon = (device.iconKey && DEVICE_ICONS[device.iconKey]) || Zap;
                  return (
                    <div
                      key={device.id}
                      className="pc-device-card relative rounded-xl border border-border bg-surface-secondary hover:border-border-hover transition-colors p-3 sm:p-4"
                    >
                      <div className="flex items-start gap-3">
                        <div className="pc-device-icon w-9 h-9 sm:w-10 sm:h-10 rounded-lg bg-emerald-500/10 text-emerald-500 flex items-center justify-center shrink-0">
                          <Icon className="w-4 h-4 sm:w-5 sm:h-5" />
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2 mb-2.5">
                            <div className="min-w-0 flex-1">
                              <div className="text-sm sm:text-[15px] font-semibold text-foreground leading-tight truncate">
                                {device.name}
                              </div>
                              <div className="text-[11px] sm:text-xs text-foreground-muted mt-0.5 tabular-nums">
                                {Math.round(device.dailyEnergy)} Wh/gün
                              </div>
                            </div>
                            <button
                              onClick={() => handleRemoveDevice(device.id)}
                              aria-label="Cihazı sil"
                              className="pc-delete-btn shrink-0 w-8 h-8 rounded-lg border border-border bg-background-secondary text-foreground-muted hover:text-red-500 hover:border-red-500/40 hover:bg-red-500/5 transition-colors flex items-center justify-center"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>

                          {/* Düzenlenebilir alanlar - 3'lü grid */}
                          <div className="pc-device-grid grid grid-cols-3 gap-2">
                            <label className="block">
                              <span className="block text-[10px] sm:text-[11px] uppercase tracking-wider text-foreground-muted font-semibold mb-1">
                                Güç (W)
                              </span>
                              <input
                                type="number"
                                min={0}
                                value={device.power || ''}
                                onChange={(e) => handleUpdateDeviceField(device.id, 'power', Number(e.target.value) || 0)}
                                className="pc-device-input w-full px-2 sm:px-2.5 py-1.5 sm:py-2 rounded-lg bg-background-secondary border border-border focus:border-emerald-500/50 text-sm font-semibold text-foreground outline-none tabular-nums [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                              />
                            </label>
                            <label className="block">
                              <span className="block text-[10px] sm:text-[11px] uppercase tracking-wider text-foreground-muted font-semibold mb-1">
                                Saat/Gün
                              </span>
                              <input
                                type="number"
                                step="0.05"
                                min={0}
                                value={device.hoursPerDay || ''}
                                onChange={(e) => handleUpdateDeviceField(device.id, 'hoursPerDay', Number(e.target.value) || 0)}
                                className="pc-device-input w-full px-2 sm:px-2.5 py-1.5 sm:py-2 rounded-lg bg-background-secondary border border-border focus:border-emerald-500/50 text-sm font-semibold text-foreground outline-none tabular-nums [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                              />
                            </label>
                            <label className="block">
                              <span className="block text-[10px] sm:text-[11px] uppercase tracking-wider text-foreground-muted font-semibold mb-1">
                                Adet
                              </span>
                              <div className="pc-qty-wrap flex items-center gap-1">
                                <button
                                  type="button"
                                  onClick={() => handleUpdateDeviceField(device.id, 'quantity', Math.max(1, device.quantity - 1))}
                                  aria-label="Adet azalt"
                                  className="pc-stepper-btn shrink-0 w-7 h-7 sm:w-8 sm:h-8 rounded-md bg-background-secondary border border-border text-foreground-muted hover:text-foreground flex items-center justify-center"
                                >
                                  <Minus size={12} />
                                </button>
                                <input
                                  type="number"
                                  min={1}
                                  value={device.quantity || 1}
                                  onChange={(e) => handleUpdateDeviceField(device.id, 'quantity', Number(e.target.value) || 1)}
                                  className="pc-qty-input w-full min-w-0 px-1 py-1.5 sm:py-2 rounded-md bg-background-secondary border border-border focus:border-emerald-500/50 text-center text-sm font-semibold text-foreground outline-none tabular-nums [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                                />
                                <button
                                  type="button"
                                  onClick={() => handleUpdateDeviceField(device.id, 'quantity', device.quantity + 1)}
                                  aria-label="Adet arttır"
                                  className="pc-stepper-btn shrink-0 w-7 h-7 sm:w-8 sm:h-8 rounded-md bg-background-secondary border border-border text-foreground-muted hover:text-foreground flex items-center justify-center"
                                >
                                  <Plus size={12} />
                                </button>
                              </div>
                            </label>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}

                {devices.length === 0 && (
                  <div className="p-6 text-center rounded-xl border border-dashed border-border text-foreground-muted text-sm">
                    Bu senaryoda cihaz yok. Aşağıdan yeni cihaz ekleyebilirsiniz.
                  </div>
                )}
              </div>

              {/* Yeni cihaz ekleme */}
              <div className="mt-4 border-t border-glass-border pt-4">
                <button
                  onClick={() => setShowDevicePanel(!showDevicePanel)}
                  className="flex items-center gap-2 text-sm font-medium text-foreground-secondary hover:text-foreground transition-colors"
                >
                  <Plus size={16} />
                  Yeni Cihaz Ekle
                  <ChevronDown size={16} className={`transition-transform ${showDevicePanel ? 'rotate-180' : ''}`} />
                </button>

                {showDevicePanel && (
                  <div className="mt-3 p-3 sm:p-4 glass-light rounded-xl">
                    <div className="pc-add-device-grid grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3">
                      <div className="col-span-2 sm:col-span-4">
                        <label className="block text-[11px] sm:text-xs text-foreground-muted mb-1">Cihaz Adı</label>
                        <input
                          type="text"
                          value={deviceName}
                          onChange={(e) => setDeviceName(e.target.value)}
                          placeholder="Örn: Karavan Kahve Makinesi"
                          className="glass-input pc-mobile-input w-full text-sm"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] sm:text-xs text-foreground-muted mb-1">Güç (W)</label>
                        <input
                          type="number"
                          value={devicePower}
                          onChange={(e) => setDevicePower(Number(e.target.value))}
                          className="glass-input pc-mobile-input w-full text-sm"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] sm:text-xs text-foreground-muted mb-1">Adet</label>
                        <input
                          type="number"
                          value={deviceQty}
                          onChange={(e) => setDeviceQty(Number(e.target.value))}
                          className="glass-input pc-mobile-input w-full text-sm"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] sm:text-xs text-foreground-muted mb-1">Saat/Gün</label>
                        <input
                          type="number"
                          step="0.1"
                          value={deviceHours}
                          onChange={(e) => setDeviceHours(Number(e.target.value))}
                          className="glass-input pc-mobile-input w-full text-sm"
                        />
                      </div>
                      <div className="col-span-2 sm:col-span-1 sm:flex sm:items-end">
                        <button
                          onClick={handleAddDevice}
                          className="pc-nav-button px-4 py-2.5 sm:py-2 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-white text-sm font-semibold transition-colors w-full"
                        >
                          Ekle
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Enerji Değerleri özeti - EN ALTTA */}
              <div className="mt-5 sm:mt-6">
                <EnergySummaryEditor
                  dailyEnergy={dailyEnergy}
                  maxPower={maxPower}
                  onDailyEnergyChange={setDailyEnergy}
                  onMaxPowerChange={setMaxPower}
                />
              </div>
            </div>
          );
        })()}

        {/* STEP 2: Enerji Değerleri (Sadece Özel Giriş için) */}
        {currentStep === 'energy' && (
          <div className="animate-fade-in">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-foreground mb-2">
                Enerji Değerleriniz
              </h2>
              <p className="text-sm text-foreground-secondary">
                Değerleri düzenleyebilir veya doğrudan devam edebilirsiniz
              </p>
            </div>
            
            <div className="max-w-lg mx-auto space-y-4 sm:space-y-6">
              {/* Energy Input Card */}
              <div className="pc-energy-manual-card relative p-4 sm:p-6 rounded-2xl bg-surface-secondary border border-border backdrop-blur-sm">
                <div className="pc-energy-chip bg-fusion-primary/20 border border-fusion-primary/30">
                  <span className="pc-energy-chip-text text-fusion-primary">Günlük Tüketim</span>
                </div>
                <div className="flex items-center gap-3 sm:gap-4 mt-2">
                  <Battery className="w-6 h-6 sm:w-8 sm:h-8 text-fusion-primary" />
                  <input
                    type="number"
                    value={dailyEnergy || ''}
                    onChange={(e) => setDailyEnergy(Number(e.target.value))}
                    placeholder="1200"
                    className="pc-energy-input flex-1 bg-transparent text-2xl sm:text-3xl font-bold text-foreground outline-none placeholder:text-foreground-muted/50"
                  />
                  <span className="text-sm sm:text-lg text-foreground-muted whitespace-nowrap">Wh/gün</span>
                </div>
              </div>

              {/* Power Input Card */}
              <div className="pc-energy-manual-card relative p-4 sm:p-6 rounded-2xl bg-surface-secondary border border-border backdrop-blur-sm">
                <div className="pc-energy-chip bg-fusion-secondary/20 border border-fusion-secondary/30">
                  <span className="pc-energy-chip-text text-fusion-secondary">Maksimum Güç</span>
                </div>
                <div className="flex items-center gap-3 sm:gap-4 mt-2">
                  <Zap className="w-6 h-6 sm:w-8 sm:h-8 text-fusion-secondary" />
                  <input
                    type="number"
                    value={maxPower || ''}
                    onChange={(e) => setMaxPower(Number(e.target.value))}
                    placeholder="600"
                    className="pc-energy-input flex-1 bg-transparent text-2xl sm:text-3xl font-bold text-foreground outline-none placeholder:text-foreground-muted/50"
                  />
                  <span className="text-sm sm:text-lg text-foreground-muted whitespace-nowrap">W</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* STEP 3: Şarj ve Güneş Ayarları */}
        {currentStep === 'charge' && (
          <div className="animate-fade-in">
            {/* Enerji Değerleri Özeti - Senaryo seçilince görünsün */}
            <div className="mb-6">
              <EnergySummaryEditor
                dailyEnergy={dailyEnergy}
                maxPower={maxPower}
                onDailyEnergyChange={setDailyEnergy}
                onMaxPowerChange={setMaxPower}
                subtitle=""
              />
            </div>

            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-foreground mb-2">
                Şarj Ayarları
              </h2>
              <p className="text-sm text-foreground-secondary">
                Nasıl şarj edeceğinizi seçin
              </p>
            </div>

            {/* Şarj Modu - Modern Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-8">
              {[
                { id: 'hybrid', label: 'Hibrit', icon: BatteryCharging, desc: 'Şebeke Prizi ve Güneş Enerjisi', badge: 'Önerilen' },
                { id: 'solar-only', label: 'Solar', icon: Sun, desc: 'Sadece Güneş' },
                { id: 'grid-only', label: 'Şebeke', icon: Plug, desc: 'Sadece Priz' },
                { id: 'no-charge', label: 'Şarj Yok', icon: Power, desc: 'Kullanım' },
              ].map((mode) => {
                const Icon = mode.icon;
                const isSelected = chargeMode === mode.id;
                return (
                  <button
                    key={mode.id}
                    onClick={() => setChargeMode(mode.id as ChargeMode)}
                    className={`group relative p-4 rounded-xl border backdrop-blur-sm transition-all duration-300 text-center ${
                      isSelected
                        ? 'border-emerald-500 bg-emerald-500/10'
                        : 'border-border bg-surface-secondary hover:bg-background-hover hover:border-border-hover'
                    }`}
                  >
                    {mode.badge && (
                      <div className="absolute -top-2.5 left-1/2 -translate-x-1/2 px-2.5 py-1 bg-emerald-500 text-[9px] font-bold text-white rounded-full whitespace-nowrap">
                        {mode.badge}
                      </div>
                    )}
                    <div className={`w-10 h-10 mx-auto rounded-lg flex items-center justify-center mb-2 transition-all ${
                      isSelected ? 'bg-emerald-500 text-white' : 'bg-glass-bg text-foreground-secondary group-hover:bg-foreground/20 dark:group-hover:bg-white/20'
                    }`}>
                      <Icon size={20} />
                    </div>
                    <div className={`text-sm font-semibold mb-0.5 ${isSelected ? 'text-emerald-400' : 'text-foreground-secondary'}`}>
                      {mode.label}
                    </div>
                    <div className="text-xs text-foreground-muted">{mode.desc}</div>
                    {isSelected && (
                      <div className="absolute -top-1 -right-1 w-4 h-4 bg-emerald-500 rounded-full flex items-center justify-center">
                        <Check size={10} className="text-white" />
                      </div>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Solar Ayarları */}
            {(chargeMode === 'hybrid' || chargeMode === 'solar-only') && (
              <div className="space-y-6 p-6 rounded-2xl bg-surface-secondary border border-border backdrop-blur-sm">
                <div className="flex items-center gap-2 text-sm font-medium text-foreground-secondary">
                  <Sun size={16} className="text-amber-400" />
                  Güneş Paneli Ayarları
                </div>

                <div className="grid lg:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs text-foreground-muted mb-2">Bulunduğunuz İl</label>
                    <select
                      value={selectedCity}
                      onChange={(e) => {
                        const value = e.target.value;
                        setSelectedCity(value);
                        if (value) {
                          setTimeout(() => {
                            setCurrentStep('results');
                            handleCalculate();
                          }, 300);
                        }
                      }}
                      className="pc-mobile-input w-full px-4 py-3 rounded-xl bg-surface-secondary border border-border text-foreground outline-none focus:border-fusion-primary transition-colors"
                    >
                      <option value="">— İl Seçin —</option>
                      {TURKEY_CITIES.map((city) => (
                        <option key={city.name} value={city.name}>
                          {city.name} ({city.region})
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs text-foreground-muted mb-2">Manuel PSH</label>
                    <input
                      type="number"
                      step="0.1"
                      value={manualPsh || ''}
                      onChange={(e) => setManualPsh(e.target.value ? Number(e.target.value) : null)}
                      placeholder="Örn: 4.5"
                      className="pc-mobile-input w-full px-4 py-3 rounded-xl bg-surface-secondary border border-border text-foreground outline-none focus:border-fusion-primary transition-colors placeholder:text-foreground-muted/50"
                    />
                  </div>
                </div>

                {/* Mevsim Seçimi */}
                <div className="pc-season-grid grid grid-cols-3 gap-3">
                  {[
                    { id: 'average', label: 'Yıllık Ort.', value: cityPshValues?.average },
                    { id: 'summer', label: 'Yaz', value: cityPshValues?.summer },
                    { id: 'winter', label: 'Kış', value: cityPshValues?.winter },
                  ].map((s) => {
                    const isSelected = season === s.id;
                    return (
                      <button
                        key={s.id}
                        onClick={() => setSeason(s.id as Season)}
                        className={`pc-season-btn p-4 rounded-xl border transition-all ${
                          isSelected
                            ? 'border-amber-400 bg-amber-400/10'
                            : 'border-border bg-surface-secondary hover:bg-background-hover'
                        }`}
                      >
                        <div className={`pc-season-label text-sm font-medium ${isSelected ? 'text-amber-400' : 'text-foreground-secondary'}`}>
                          {s.label}
                        </div>
                        <div className={`pc-season-value text-xl font-bold mt-1 ${isSelected ? 'text-foreground' : 'text-foreground-muted'}`}>
                          {s.value ? `${s.value}h` : '—'}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}

        {/* STEP 4: Tercihler + Sonuçlar (Birleşik) */}
        {currentStep === 'results' && (
          <div className="animate-fade-in">
            {/* Tercihler - Compact */}
            <div className="grid lg:grid-cols-2 gap-3 sm:gap-4 mb-6 sm:mb-8">
              {/* Taşınabilirlik */}
              <div className="p-3 sm:p-4 rounded-xl bg-surface-secondary border border-border">
                <div className="flex items-center gap-2 text-[11px] sm:text-xs font-medium text-foreground-muted mb-2.5 sm:mb-3">
                  <Leaf size={14} className="text-emerald-400" />
                  Taşınabilirlik
                </div>
                <div className="grid grid-cols-3 gap-1.5 sm:gap-2">
                  {[
                    { id: 'auto', label: 'Otomatik' },
                    { id: 'compact', label: 'Kompakt' },
                    { id: 'professional', label: 'Profesyonel' },
                  ].map((opt) => {
                    const isSelected = portability === opt.id;
                    return (
                      <button
                        key={opt.id}
                        onClick={() => setPortability(opt.id as PortabilityPriority)}
                        className={`px-2 sm:px-3 py-1.5 sm:py-2 rounded-lg text-[11px] sm:text-xs font-medium transition-all ${
                          isSelected
                            ? 'bg-emerald-500 text-white'
                            : 'bg-surface-secondary text-foreground-muted hover:bg-background-hover hover:text-foreground'
                        }`}
                      >
                        {opt.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Şarj Hızı */}
              {(chargeMode === 'hybrid' || chargeMode === 'solar-only') && (
                <div className="p-3 sm:p-4 rounded-xl bg-surface-secondary border border-border">
                  <div className="flex items-center gap-2 text-[11px] sm:text-xs font-medium text-foreground-muted mb-2.5 sm:mb-3">
                    <Zap size={14} className="text-amber-400" />
                    Şarj Hızı
                  </div>
                  <div className="grid grid-cols-3 gap-1.5 sm:gap-2">
                    {[
                      { id: 'economic', label: 'Ekonomik' },
                      { id: 'balanced', label: 'Dengeli' },
                      { id: 'fast', label: 'Hızlı' },
                    ].map((opt) => {
                      const isSelected = chargeSpeed === opt.id;
                      return (
                        <button
                          key={opt.id}
                          onClick={() => setChargeSpeed(opt.id as ChargeSpeedPreference)}
                          className={`px-2 sm:px-3 py-1.5 sm:py-2 rounded-lg text-[11px] sm:text-xs font-medium transition-all ${
                            isSelected
                              ? 'bg-amber-500 text-white'
                              : 'bg-surface-secondary text-foreground-muted hover:bg-background-hover hover:text-foreground'
                          }`}
                        >
                          {opt.label}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* Sonuçlar */}
            {result && (
              <>
                <h2 className="text-lg sm:text-xl font-semibold text-foreground mb-4 sm:mb-6 flex items-center gap-2">
                  <Check className="w-5 h-5 sm:w-6 sm:h-6 text-emerald-500" />
                  Önerilen Ürünler
                </h2>

            <div className="pc-results-grid grid grid-cols-1 lg:grid-cols-2 gap-3 lg:gap-4">
              {/* Önerilen Ürünler - Sonuç Kartları (2-col on lg+) */}
              {/* Güç İstasyonu - Yatay Kart */}
              {result.powerStation.station && (
                <div>
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <div className="flex items-center gap-1.5">
                      <Battery className="text-fusion-primary w-4 h-4" />
                      <span className="text-sm font-semibold text-foreground">Güç İstasyonu</span>
                    </div>
                    <span className="pc-result-badge inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 whitespace-nowrap leading-none">
                      <Check className="w-3 h-3" />
                      %{result.powerStation.sufficiency} Yeterli
                    </span>
                  </div>
                  <div className="p-3 sm:p-4 md:p-3 lg:p-5 rounded-2xl bg-surface-overlay border border-border transition-all">
                    <h3 className="text-sm sm:text-base lg:text-lg font-bold text-foreground leading-tight mb-3 line-clamp-2">
                      {getPowerStationDisplayName(result.powerStation.station)}
                    </h3>
                    <div className="flex flex-row items-center gap-3 sm:gap-4 md:gap-3 lg:gap-5">
                      <div className="relative aspect-square w-[108px] sm:w-[170px] md:w-[140px] lg:w-[190px] rounded-xl overflow-hidden bg-background-secondary shrink-0">
                        <Image
                          src={dbProducts[result.powerStation.station.id]?.image || result.powerStation.station.image || `/images/products/${result.powerStation.station.slug}.webp`}
                          alt={result.powerStation.station.name}
                          fill
                          sizes="(max-width: 640px) 108px, (max-width: 768px) 170px, (max-width: 1024px) 140px, 190px"
                          className="object-cover"
                          unoptimized
                        />
                      </div>

                      <div className="flex-1 min-w-0 flex flex-col py-0.5 sm:py-1">
                        <div className="flex-1 flex flex-col justify-center gap-1.5 sm:gap-1.5 lg:gap-2 my-1.5 sm:my-2 lg:my-3">
                          <div className="flex items-center justify-between gap-2">
                            <span className="text-[10px] sm:text-[10px] lg:text-[11px] uppercase tracking-wider text-foreground-muted font-semibold">Kapasite</span>
                            <span className="text-[11px] sm:text-xs lg:text-sm font-bold text-foreground tabular-nums">{result.powerStation.capacity} Wh</span>
                          </div>
                          <div className="flex items-center justify-between gap-2">
                            <span className="text-[10px] sm:text-[10px] lg:text-[11px] uppercase tracking-wider text-foreground-muted font-semibold">Çıkış</span>
                            <span className="text-[11px] sm:text-xs lg:text-sm font-bold text-foreground tabular-nums">{result.powerStation.outputPower} W</span>
                          </div>
                          <div className="flex items-center justify-between gap-2">
                            <span className="text-[10px] sm:text-[10px] lg:text-[11px] uppercase tracking-wider text-foreground-muted font-semibold">Tepe</span>
                            <span className="text-[11px] sm:text-xs lg:text-sm font-bold text-foreground tabular-nums">{result.powerStation.station.surgePower} W</span>
                          </div>
                          <div className="flex items-center justify-between gap-2">
                            <span className="text-[10px] sm:text-[10px] lg:text-[11px] uppercase tracking-wider text-foreground-muted font-semibold">Süre</span>
                            <span className="text-[11px] sm:text-xs lg:text-sm font-bold text-foreground tabular-nums">{result.powerStation.runtimeHours ? formatHours(result.powerStation.runtimeHours, 'tr') : '-'}</span>
                          </div>
                        </div>

                        <button
                          onClick={async () => {
                            if (result.powerStation.station) {
                              const stationId = result.powerStation.station.id;
                              const dbProduct = dbProducts[stationId];
                              await addItem({
                                productId: dbProduct?.id || stationId,
                                slug: dbProduct?.slug || result.powerStation.station.slug || '',
                                title: dbProduct?.name || result.powerStation.station.name,
                                brand: dbProduct?.brand || 'IEETek',
                                price: dbProduct?.price || 0,
                                image: dbProduct?.image || result.powerStation.station.image,
                              });
                              openCart();
                              setStationAdded(true);
                              if (stationAddedTimeoutRef.current) window.clearTimeout(stationAddedTimeoutRef.current);
                              stationAddedTimeoutRef.current = window.setTimeout(() => setStationAdded(false), 1200);
                            }
                          }}
                          className={`w-full py-2 sm:py-2.5 rounded-xl text-xs sm:text-sm font-semibold flex items-center justify-center gap-2 transition-all duration-300 ${
                            stationAdded
                              ? 'bg-emerald-500 text-white'
                              : 'bg-emerald-500 hover:bg-emerald-600 active:bg-emerald-700 text-white'
                          }`}
                        >
                          {stationAdded ? <Check size={16} /> : <ShoppingBag size={16} />}
                          {stationAdded ? 'Eklendi' : 'Sepete Ekle'}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Solar Panel - Yatay Kart */}
              <div>
                <div className="flex items-center justify-between gap-2 mb-2">
                  <div className="flex items-center gap-1.5">
                    <Sun className="text-yellow-500 w-4 h-4" />
                    <span className="text-sm font-semibold text-foreground">Solar Panel</span>
                  </div>
                  {result.solarPanel && result.solarPanel.panel && (
                    <span className="pc-result-badge inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-[11px] font-semibold text-amber-600 dark:text-amber-400 whitespace-nowrap leading-none">
                      <Sun className="w-3 h-3" />
                      %{Math.round((result.solarPanel.coverageRatio || 0) * 100)} Karşılama
                    </span>
                  )}
                </div>

                {result.solarPanel && result.solarPanel.panel ? (
                  <div className="p-3 sm:p-4 md:p-3 lg:p-5 rounded-2xl bg-surface-overlay border border-border transition-all">
                    <h3 className="text-sm sm:text-base lg:text-lg font-bold text-foreground leading-tight mb-3 line-clamp-2">
                      {getSolarPanelDisplayName(result.solarPanel.panel)}
                    </h3>
                    <div className="flex flex-row items-center gap-3 sm:gap-4 md:gap-3 lg:gap-5">
                    <div className="relative aspect-square w-[108px] sm:w-[170px] md:w-[140px] lg:w-[190px] rounded-xl overflow-hidden bg-background-secondary shrink-0">
                      <Image
                        src={(result.solarPanel.panel.id && dbProducts[result.solarPanel.panel.id]?.image) || result.solarPanel.panel.image || `/images/products/${result.solarPanel.panel.slug || 'placeholder'}.webp`}
                        alt={result.solarPanel.panel.name}
                        fill
                        sizes="(max-width: 640px) 108px, (max-width: 768px) 170px, (max-width: 1024px) 140px, 190px"
                        className="object-cover"
                        unoptimized
                      />
                    </div>

                    <div className="flex-1 min-w-0 flex flex-col py-0.5 sm:py-1">
                      <div className="flex-1 flex flex-col justify-center gap-1.5 sm:gap-1.5 lg:gap-2 my-1.5 sm:my-2 lg:my-3">
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-[10px] sm:text-[10px] lg:text-[11px] uppercase tracking-wider text-foreground-muted font-semibold">Güç</span>
                          <span className="text-[11px] sm:text-xs lg:text-sm font-bold text-foreground tabular-nums">{result.solarPanel.totalWattage} W</span>
                        </div>
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-[10px] sm:text-[10px] lg:text-[11px] uppercase tracking-wider text-foreground-muted font-semibold">Üretim</span>
                          <span className="text-[11px] sm:text-xs lg:text-sm font-bold text-foreground tabular-nums">{result.solarPanel.dailyProduction} Wh</span>
                        </div>
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-[10px] sm:text-[10px] lg:text-[11px] uppercase tracking-wider text-foreground-muted font-semibold">Şarj</span>
                          <span className="text-[11px] sm:text-xs lg:text-sm font-bold text-foreground tabular-nums">{result.solarPanel.chargeHours ? formatHours(result.solarPanel.chargeHours, 'tr') : '-'}</span>
                        </div>
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-[10px] sm:text-[10px] lg:text-[11px] uppercase tracking-wider text-foreground-muted font-semibold">Panel</span>
                          <span className="text-[11px] sm:text-xs lg:text-sm font-bold text-foreground tabular-nums">{result.solarPanel.panelCount}×{result.solarPanel.singlePanelWattage}W</span>
                        </div>
                      </div>

                      <button
                        onClick={async () => {
                          if (result.solarPanel?.panel) {
                            const panelId = result.solarPanel.panel.id;
                            const dbProduct = dbProducts[panelId];
                            await addItem({
                              productId: dbProduct?.id || panelId,
                              slug: dbProduct?.slug || result.solarPanel.panel.slug || '',
                              title: dbProduct?.name || result.solarPanel.panel.name,
                              brand: dbProduct?.brand || 'IEETek',
                              price: dbProduct?.price || 0,
                              image: dbProduct?.image || result.solarPanel.panel.image,
                              quantity: result.solarPanel.panelCount,
                            });
                            openCart();
                            setPanelAdded(true);
                            if (panelAddedTimeoutRef.current) window.clearTimeout(panelAddedTimeoutRef.current);
                            panelAddedTimeoutRef.current = window.setTimeout(() => setPanelAdded(false), 1200);
                          }
                        }}
                        className={`w-full py-2 sm:py-2.5 rounded-xl text-xs sm:text-sm font-semibold flex items-center justify-center gap-2 transition-all duration-300 ${
                          panelAdded
                            ? 'bg-emerald-500 text-white'
                            : 'bg-emerald-500 hover:bg-emerald-600 active:bg-emerald-700 text-white'
                        }`}
                      >
                        {panelAdded ? <Check size={16} /> : <ShoppingBag size={16} />}
                        {panelAdded ? 'Eklendi' : 'Sepete Ekle'}
                      </button>
                    </div>
                  </div>
                  </div>
                ) : (
                  <div className="flex items-center gap-3 p-3 sm:p-4 rounded-2xl bg-surface-overlay border border-border">
                    <div className="w-[60px] h-[60px] rounded-xl bg-background-secondary flex items-center justify-center shrink-0">
                      <Sun className="w-6 h-6 opacity-30" />
                    </div>
                    <p className="text-xs text-foreground-muted">
                      {chargeMode === 'grid-only' || chargeMode === 'no-charge' ? 'Bu şarj modu için solar panel önerilmiyor.' : 'Uygun solar panel bulunamadı.'}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {(bundleSuggestionsLoading || bundleSuggestions.length > 0) && (
              <div className="mt-6 sm:mt-8">
                {bundleSuggestionsLoading ? (
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 lg:gap-4">
                    {[0, 1].map((idx) => (
                      <div key={idx}>
                        <div className="h-5 w-36 rounded bg-background-secondary mb-2 animate-pulse" />
                        <div className="flex flex-row items-center gap-3 sm:gap-4 md:gap-3 lg:gap-5 p-3 sm:p-4 md:p-3 lg:p-5 rounded-2xl bg-surface-overlay border border-border animate-pulse">
                          <div className="aspect-square w-[108px] sm:w-[170px] md:w-[140px] lg:w-[190px] rounded-xl bg-background-secondary shrink-0" />
                          <div className="flex-1 min-w-0 flex flex-col gap-2">
                            <div className="h-4 rounded bg-background-secondary w-2/3" />
                            <div className="h-3 rounded bg-background-secondary w-1/2" />
                            <div className="h-3 rounded bg-background-secondary w-1/3" />
                            <div className="h-9 rounded-xl bg-background-secondary w-full mt-2" />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 lg:gap-4">
                    {bundleSuggestions.map((bundle) => {
                      const includesPanel = recommendedPanelDbProduct?.id
                        ? bundle.items?.some((item) => item.product?.id === recommendedPanelDbProduct.id)
                        : false;
                      const badgeLabel = includesPanel ? 'İstasyon + Panel Dahil' : 'İstasyon Dahil';

                      return (
                        <div key={bundle.id}>
                          <div className="flex items-center justify-between gap-2 mb-2">
                            <div className="flex items-center gap-1.5 min-w-0">
                              <ShoppingBag className="text-violet-500 w-4 h-4 shrink-0" />
                              <span className="text-sm font-semibold text-foreground truncate">
                                Hazır Paket
                              </span>
                            </div>
                            <span className="pc-result-badge inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-violet-500/10 border border-violet-500/20 text-[11px] font-semibold text-violet-600 dark:text-violet-400 whitespace-nowrap leading-none">
                              <Check className="w-3 h-3" />
                              {badgeLabel}
                            </span>
                          </div>

                          <div className="p-3 sm:p-4 md:p-3 lg:p-5 rounded-2xl bg-surface-overlay border border-border transition-all">
                            <h3 className="text-sm sm:text-base lg:text-lg font-bold text-foreground leading-tight mb-3 line-clamp-2">
                              {bundle.name}
                            </h3>
                            <div className="flex flex-row items-center gap-3 sm:gap-4 md:gap-3 lg:gap-5">
                            <div className="relative aspect-square w-[108px] sm:w-[170px] md:w-[140px] lg:w-[190px] rounded-xl overflow-hidden bg-background-secondary shrink-0">
                              {bundle.thumbnail ? (
                                <Image
                                  src={bundle.thumbnail}
                                  alt={bundle.name}
                                  fill
                                  sizes="(max-width: 640px) 108px, (max-width: 768px) 170px, (max-width: 1024px) 140px, 190px"
                                  className="object-cover"
                                  unoptimized
                                />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center text-foreground-muted">
                                  <ShoppingBag className="w-6 h-6" />
                                </div>
                              )}
                            </div>

                            <div className="flex-1 min-w-0 flex flex-col py-0.5 sm:py-1">
                              <div className="flex-1 flex flex-col justify-center gap-1.5 sm:gap-1.5 lg:gap-2 my-1.5 sm:my-2 lg:my-3">
                                <div className="flex items-center justify-between gap-2">
                                  <span className="text-[10px] sm:text-[10px] lg:text-[11px] uppercase tracking-wider text-foreground-muted font-semibold">İçerik</span>
                                  <span className="text-[11px] sm:text-xs lg:text-sm font-bold text-foreground tabular-nums">{bundle.itemCount} ürün</span>
                                </div>
                                <div className="flex items-center justify-between gap-2">
                                  <span className="text-[10px] sm:text-[10px] lg:text-[11px] uppercase tracking-wider text-foreground-muted font-semibold">Paket Fiyatı</span>
                                  <span className="text-[11px] sm:text-xs lg:text-sm font-bold text-foreground tabular-nums">{formatPrice(bundle.price)}</span>
                                </div>
                                {bundle.totalValue > bundle.price && (
                                  <>
                                    <div className="flex items-center justify-between gap-2">
                                      <span className="text-[10px] sm:text-[10px] lg:text-[11px] uppercase tracking-wider text-foreground-muted font-semibold">Tek Tek Alım</span>
                                      <span className="text-[11px] sm:text-xs lg:text-sm font-semibold text-foreground-muted tabular-nums line-through">{formatPrice(bundle.totalValue)}</span>
                                    </div>
                                    <div className="flex items-center justify-between gap-2">
                                      <span className="text-[10px] sm:text-[10px] lg:text-[11px] uppercase tracking-wider text-foreground-muted font-semibold">Kazanç</span>
                                      <span className="text-[11px] sm:text-xs lg:text-sm font-bold text-emerald-500 tabular-nums">{formatPrice(bundle.savings)}</span>
                                    </div>
                                  </>
                                )}
                              </div>

                              <button
                                type="button"
                                onClick={async () => {
                                  if (bundle.stock <= 0) return;
                                  await addItem({
                                    productId: bundle.id,
                                    slug: bundle.slug,
                                    title: bundle.name,
                                    brand: 'Bundle / Paket',
                                    price: bundle.price,
                                    originalPrice: bundle.totalValue,
                                    image: bundle.thumbnail || undefined,
                                    isBundle: true,
                                    bundleId: bundle.id,
                                  });
                                  openCart();
                                }}
                                disabled={bundle.stock <= 0}
                                className="w-full py-2 sm:py-2.5 rounded-xl text-xs sm:text-sm font-semibold flex items-center justify-center gap-2 transition-all duration-300 bg-glass-bg hover:bg-glass-bg-hover border border-glass-border text-foreground disabled:opacity-50 disabled:cursor-not-allowed"
                              >
                                <ShoppingBag size={16} />
                                Sepete Ekle
                              </button>
                            </div>
                          </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}
              </>
            )}
          </div>
        )}
      </div>

      {/* Navigation Buttons - Modern Style */}
      <div className="flex justify-between mt-8">
        {currentStep !== 'scenario' ? (
          <button
            onClick={goPrev}
            className="pc-nav-button px-4 sm:px-5 py-2.5 sm:py-3 text-sm sm:text-base font-semibold rounded-xl bg-surface-secondary border border-border text-foreground-secondary hover:bg-background-hover hover:text-foreground transition-all duration-300"
          >
            Geri
          </button>
        ) : (
          <div />
        )}

        {currentStep !== 'results' && (
          <button
            onClick={goNext}
            disabled={!canGoNext}
            className={`pc-nav-button px-4 sm:px-5 py-2.5 sm:py-3 text-sm sm:text-base font-semibold rounded-xl transition-all duration-300 ${
              canGoNext
                ? 'bg-surface-secondary border border-border text-foreground-secondary hover:bg-background-hover hover:text-foreground'
                : 'bg-glass-bg text-foreground-muted cursor-not-allowed border border-transparent'
            }`}
          >
            İleri
          </button>
        )}

        {currentStep === 'results' && (
          <button
            onClick={handleReset}
            className="pc-nav-button px-4 sm:px-5 py-2.5 sm:py-3 text-sm sm:text-base font-semibold rounded-xl bg-surface-secondary border border-border text-foreground-secondary hover:bg-background-hover hover:text-foreground transition-all duration-300"
          >
            Yeniden Başla
          </button>
        )}
      </div>
    </div>
  );
}
