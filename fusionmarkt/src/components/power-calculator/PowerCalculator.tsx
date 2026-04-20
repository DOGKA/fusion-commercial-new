'use client';

import React, { useState, useCallback, useMemo, useEffect, useRef } from 'react';
import Image from 'next/image';
import { 
  ChargeMode, 
  Season, 
  PortabilityPriority, 
  ChargeSpeedPreference,
  Device,
  CalculationResult
} from '@/lib/power-calculator/types';
import { SCENARIOS, getScenarioById } from '@/lib/power-calculator/scenarios';
import { TURKEY_CITIES } from '@/lib/power-calculator/turkey-solar-data';
import { PRESET_DEVICES } from '@/lib/power-calculator/products';
import { calculate, getPSH, formatHours } from '@/lib/power-calculator/calculate';
import { useCart } from '@/context/CartContext';

// İkonlar - Sadece Lucide
import { 
  Zap, 
  Sun, 
  Battery, 
  Plus, 
  Trash2, 
  RotateCcw,
  ChevronDown,
  ChevronRight,
  ChevronLeft,
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
};

// Icon map for preset devices
const DEVICE_ICONS: Record<string, LucideIcon> = {
  'laptop': Laptop,
  'smartphone': Smartphone,
  'tablet': Smartphone,
  'led-lamp': Lightbulb,
  'fan': Fan,
  'mini-fridge': Thermometer,
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
};

// Step types
type Step = 'scenario' | 'energy' | 'charge' | 'preferences' | 'results';

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

  // Senaryo seçimi - otomatik sonraki adıma geç
  const handleScenarioSelect = useCallback((scenarioId: string) => {
    setSelectedScenario(scenarioId);
    const scenario = getScenarioById(scenarioId);
    if (scenario && scenarioId !== 'custom') {
      setDailyEnergy(scenario.dailyEnergy);
      setMaxPower(scenario.maxPower);
      // Özel giriş değilse direkt şarj ayarlarına geç
      setTimeout(() => setCurrentStep('charge'), 300);
    } else {
      // Özel giriş ise enerji adımına geç
      setTimeout(() => setCurrentStep('energy'), 300);
    }
  }, []);

  // Cihaz ekleme
  const handleAddDevice = useCallback(() => {
    if (devicePower <= 0 || deviceQty <= 0 || deviceHours <= 0) return;
    
    const newDevice: Device = {
      id: Date.now().toString(),
      name: `${devicePower}W Cihaz`,
      power: devicePower,
      quantity: deviceQty,
      hoursPerDay: deviceHours,
      dailyEnergy: devicePower * deviceQty * deviceHours
    };
    
    setDevices(prev => [...prev, newDevice]);
    setDailyEnergy(prev => prev + newDevice.dailyEnergy);
    setMaxPower(prev => Math.max(prev, devicePower * deviceQty));
    
    setDevicePower(60);
    setDeviceQty(1);
    setDeviceHours(1);
  }, [devicePower, deviceQty, deviceHours]);

  // Hazır cihaz ekleme
  const handlePresetDeviceAdd = useCallback((preset: typeof PRESET_DEVICES[0]) => {
    const newDevice: Device = {
      id: Date.now().toString(),
      name: preset.name,
      power: preset.power,
      quantity: 1,
      hoursPerDay: preset.defaultHours,
      dailyEnergy: preset.power * preset.defaultHours
    };
    
    setDevices(prev => [...prev, newDevice]);
    setDailyEnergy(prev => prev + newDevice.dailyEnergy);
    setMaxPower(prev => Math.max(prev, preset.power));
  }, []);

  // Cihaz silme
  const handleRemoveDevice = useCallback((deviceId: string) => {
    const device = devices.find(d => d.id === deviceId);
    if (device) {
      setDevices(prev => prev.filter(d => d.id !== deviceId));
      setDailyEnergy(prev => Math.max(0, prev - device.dailyEnergy));
    }
  }, [devices]);

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

  // Step navigation (Tercihler ve Sonuçlar birleştirildi)
  const steps: { id: Step; label: string; icon: LucideIcon }[] = [
    { id: 'scenario', label: 'Senaryo', icon: Zap },
    { id: 'energy', label: 'Enerji', icon: Battery },
    { id: 'charge', label: 'Şarj', icon: Sun },
    { id: 'results', label: 'Sonuçlar', icon: Check },
  ];

  const currentStepIndex = steps.findIndex(s => s.id === currentStep);
  // Senaryo adımında: senaryo seçilmişse VEYA cihaz eklenip enerji değerleri varsa devam edilebilir
  const canGoNext = currentStep === 'scenario' ? (selectedScenario !== null || (devices.length > 0 && dailyEnergy > 0 && maxPower > 0)) :
                    currentStep === 'energy' ? dailyEnergy > 0 && maxPower > 0 :
                    currentStep === 'charge' ? true :
                    false;

  const goNext = () => {
    // Senaryo adımından cihaz ekleyerek devam ediyorsak, enerji adımını atla
    if (currentStep === 'scenario' && devices.length > 0 && dailyEnergy > 0) {
      setCurrentStep('charge');
      return;
    }
    
    const nextIndex = currentStepIndex + 1;
    if (nextIndex < steps.length) {
      setCurrentStep(steps[nextIndex].id);
      // Sonuçlar adımına geçince hesapla
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
              {SCENARIOS.map((scenario) => {
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

            {/* Hızlı Cihaz Ekleme */}
            <div className="border-t border-glass-border pt-4">
              <button
                onClick={() => setShowDevicePanel(!showDevicePanel)}
                className="flex items-center gap-2 text-sm font-medium text-foreground-secondary hover:text-foreground transition-colors"
              >
                <Plus size={16} />
                Cihaz Ekleyerek Hesapla
                <ChevronDown size={16} className={`transition-transform ${showDevicePanel ? 'rotate-180' : ''}`} />
              </button>

              {showDevicePanel && (
                <div className="mt-4 p-3 sm:p-4 glass-light rounded-xl">
                  {/* Hazır Cihazlar */}
                  <p className="text-[11px] sm:text-xs text-foreground-muted mb-2 sm:mb-3">Hızlı Ekle:</p>
                  <div className="flex flex-wrap gap-1.5 sm:gap-2 mb-4">
                    {PRESET_DEVICES.slice(0, 12).map((preset) => {
                      const Icon = DEVICE_ICONS[preset.id] || Zap;
                      return (
                        <button
                          key={preset.id}
                          onClick={() => handlePresetDeviceAdd(preset)}
                          className="flex items-center gap-1 sm:gap-1.5 px-2 sm:px-3 py-1 sm:py-1.5 bg-glass-bg hover:bg-glass-bg-hover border border-glass-border rounded-full text-[11px] sm:text-xs transition-colors"
                        >
                          <Icon className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                          <span>{preset.name}</span>
                          <span className="text-foreground-muted">{preset.power}W</span>
                        </button>
                      );
                    })}
                  </div>

                  {/* Eklenen Cihazlar */}
                  {devices.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 sm:gap-2 mb-4 pt-3 border-t border-glass-border">
                      {devices.map((device) => (
                        <div
                          key={device.id}
                          className="flex items-center gap-1.5 sm:gap-2 px-2 sm:px-3 py-1 sm:py-1.5 bg-fusion-primary/10 border border-fusion-primary/30 rounded-full text-[11px] sm:text-xs"
                        >
                          <span>{device.name}: {device.dailyEnergy} Wh</span>
                          <button onClick={() => handleRemoveDevice(device.id)} className="text-foreground-muted hover:text-foreground">
                            <Trash2 size={12} />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Manuel Cihaz Ekleme */}
                  <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 sm:gap-3 pt-3 border-t border-glass-border">
                    <div>
                      <label className="block text-[11px] sm:text-xs text-foreground-muted mb-1">Güç (W)</label>
                      <input
                        type="number"
                        value={devicePower}
                        onChange={(e) => setDevicePower(Number(e.target.value))}
                        className="glass-input w-full text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] sm:text-xs text-foreground-muted mb-1">Adet</label>
                      <input
                        type="number"
                        value={deviceQty}
                        onChange={(e) => setDeviceQty(Number(e.target.value))}
                        className="glass-input w-full text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] sm:text-xs text-foreground-muted mb-1">Saat/Gün</label>
                      <input
                        type="number"
                        step="0.1"
                        value={deviceHours}
                        onChange={(e) => setDeviceHours(Number(e.target.value))}
                        className="glass-input w-full text-sm"
                      />
                    </div>
                    <div className="col-span-3 sm:col-span-1 sm:flex sm:items-end">
                      <button onClick={handleAddDevice} className="px-4 py-2.5 sm:py-2 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-white text-sm font-semibold transition-colors w-full">
                        Ekle
                      </button>
                    </div>
                  </div>

                  {/* Toplam */}
                  {(dailyEnergy > 0 || maxPower > 0) && (
                    <div className="grid grid-cols-2 gap-3 sm:gap-4 mt-4 pt-3 border-t border-glass-border">
                      <div className="text-center">
                        <div className="text-base sm:text-lg font-bold text-fusion-primary">{dailyEnergy.toLocaleString()} Wh</div>
                        <div className="text-[11px] sm:text-xs text-foreground-muted">Günlük Tüketim</div>
                      </div>
                      <div className="text-center">
                        <div className="text-base sm:text-lg font-bold text-fusion-secondary">{maxPower.toLocaleString()} W</div>
                        <div className="text-[11px] sm:text-xs text-foreground-muted">Maks. Güç</div>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

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
            
            <div className="max-w-lg mx-auto space-y-6">
              {/* Energy Input Card */}
              <div className="relative p-6 rounded-2xl bg-surface-secondary border border-border backdrop-blur-sm">
                <div className="absolute -top-3 left-4 px-3 py-1 bg-fusion-primary/20 border border-fusion-primary/30 rounded-full">
                  <span className="text-xs font-medium text-fusion-primary">Günlük Tüketim</span>
                </div>
                <div className="flex items-center gap-4 mt-2">
                  <Battery className="w-8 h-8 text-fusion-primary" />
                  <input
                    type="number"
                    value={dailyEnergy || ''}
                    onChange={(e) => setDailyEnergy(Number(e.target.value))}
                    placeholder="1200"
                    className="flex-1 bg-transparent text-3xl font-bold text-foreground outline-none placeholder:text-foreground-muted/50"
                  />
                  <span className="text-lg text-foreground-muted">Wh/gün</span>
                </div>
              </div>

              {/* Power Input Card */}
              <div className="relative p-6 rounded-2xl bg-surface-secondary border border-border backdrop-blur-sm">
                <div className="absolute -top-3 left-4 px-3 py-1 bg-fusion-secondary/20 border border-fusion-secondary/30 rounded-full">
                  <span className="text-xs font-medium text-fusion-secondary">Maksimum Güç</span>
                </div>
                <div className="flex items-center gap-4 mt-2">
                  <Zap className="w-8 h-8 text-fusion-secondary" />
                  <input
                    type="number"
                    value={maxPower || ''}
                    onChange={(e) => setMaxPower(Number(e.target.value))}
                    placeholder="600"
                    className="flex-1 bg-transparent text-3xl font-bold text-foreground outline-none placeholder:text-foreground-muted/50"
                  />
                  <span className="text-lg text-foreground-muted">W</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* STEP 3: Şarj ve Güneş Ayarları */}
        {currentStep === 'charge' && (
          <div className="animate-fade-in">
            {/* Enerji Değerleri Özeti - Senaryo seçilince görünsün */}
            <div className="mb-6 p-4 rounded-2xl bg-gradient-to-r from-emerald-500/10 to-amber-500/10 border border-border backdrop-blur-sm">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Zap size={16} className="text-emerald-400" />
                  <span className="text-sm font-medium text-foreground">Enerji Değerleriniz</span>
                </div>
                <span className="flex items-center gap-1 text-xs text-foreground-muted">
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <circle cx="12" cy="12" r="10" strokeWidth="1.5"/>
                    <path strokeLinecap="round" strokeWidth="1.5" d="M12 16v-4m0-4h.01"/>
                  </svg>
                  Düzenlenebilir
                </span>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="p-3 rounded-xl bg-surface-secondary border border-border">
                  <label className="block text-xs text-foreground-muted mb-1">Günlük Tüketim</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      value={dailyEnergy}
                      onChange={(e) => setDailyEnergy(Number(e.target.value))}
                      className="flex-1 bg-transparent text-xl font-bold text-foreground outline-none w-full [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                    />
                    <span className="text-sm text-foreground-muted">Wh/gün</span>
                  </div>
                </div>
                <div className="p-3 rounded-xl bg-surface-secondary border border-border">
                  <label className="block text-xs text-foreground-muted mb-1">Maksimum Güç</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      value={maxPower}
                      onChange={(e) => setMaxPower(Number(e.target.value))}
                      className="flex-1 bg-transparent text-xl font-bold text-foreground outline-none w-full [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                    />
                    <span className="text-sm text-foreground-muted">W</span>
                  </div>
                </div>
              </div>
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
                      className="w-full px-4 py-3 rounded-xl bg-surface-secondary border border-border text-foreground outline-none focus:border-fusion-primary transition-colors"
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
                      className="w-full px-4 py-3 rounded-xl bg-surface-secondary border border-border text-foreground outline-none focus:border-fusion-primary transition-colors placeholder:text-foreground-muted/50"
                    />
                  </div>
                </div>

                {/* Mevsim Seçimi */}
                <div className="grid grid-cols-3 gap-3">
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
                        className={`p-4 rounded-xl border transition-all ${
                          isSelected
                            ? 'border-amber-400 bg-amber-400/10'
                            : 'border-border bg-surface-secondary hover:bg-background-hover'
                        }`}
                      >
                        <div className={`text-sm font-medium ${isSelected ? 'text-amber-400' : 'text-foreground-secondary'}`}>
                          {s.label}
                        </div>
                        <div className={`text-xl font-bold mt-1 ${isSelected ? 'text-foreground' : 'text-foreground-muted'}`}>
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
                  <div className="flex flex-row items-center gap-3 sm:gap-4 md:gap-3 lg:gap-5 p-3 sm:p-4 md:p-3 lg:p-5 rounded-2xl bg-surface-overlay border border-border transition-all">
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
                      <h3 className="text-sm sm:text-base lg:text-lg font-bold text-foreground leading-tight line-clamp-1">
                        {result.powerStation.station.name}
                      </h3>

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
                  <div className="flex flex-row items-center gap-3 sm:gap-4 md:gap-3 lg:gap-5 p-3 sm:p-4 md:p-3 lg:p-5 rounded-2xl bg-surface-overlay border border-border transition-all">
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
                      <h3 className="text-sm sm:text-base lg:text-lg font-bold text-foreground leading-tight line-clamp-1">
                        {result.solarPanel.panel.name}
                      </h3>

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
            className="px-3 py-1.5 text-xs font-medium rounded-lg bg-surface-secondary border border-border text-foreground-secondary hover:bg-background-hover hover:text-foreground transition-all duration-300"
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
            className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all duration-300 ${
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
            className="px-3 py-1.5 text-xs font-medium rounded-lg bg-surface-secondary border border-border text-foreground-secondary hover:bg-background-hover hover:text-foreground transition-all duration-300"
          >
            Yeniden Başla
          </button>
        )}
      </div>
    </div>
  );
}
