'use client';

import React, { useState, useCallback, useMemo, useEffect, useRef } from 'react';
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
import { translations } from '@/lib/power-calculator/translations';
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
  ShoppingCart,
  ExternalLink,
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
  Settings,
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
  const t = translations['tr'];
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
      handleCalculate();
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

  // Sonuçlara git
  const goToResults = useCallback(() => {
    const calcResult = handleCalculate();
    if (calcResult) {
      setCurrentStep('results');
    }
  }, [handleCalculate]);

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
    <div className="max-w-5xl mx-auto px-4 py-8">
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
                          ? 'text-foreground-muted hover:text-foreground'
                          : 'text-foreground-muted/50 cursor-not-allowed'
                  }`}
                >
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center ${
                    isCompleted ? 'bg-emerald-500 text-white' : isActive ? 'text-emerald-400' : ''
                  }`}>
                    {isCompleted ? <Check size={14} /> : <Icon size={16} />}
                  </div>
                  <span className={`text-sm font-medium hidden md:block ${
                    isActive || isCompleted ? 'text-emerald-400' : ''
                  }`}>
                    {step.label}
                  </span>
                </button>
                {idx < steps.length - 1 && (
                  <div className={`w-8 h-px hidden sm:block ${
                    idx < currentStepIndex ? 'bg-emerald-500' : 'bg-white/20'
                  }`} />
                )}
              </React.Fragment>
            );
          })}
        </div>
      </div>

      {/* Step Content - Glassmorphism Card */}
      <div className="relative p-6 md:p-8 rounded-3xl bg-white/5 border border-white/10 backdrop-blur-xl shadow-2xl">
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
            
            {/* Senaryolar - Modern Glass Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 mb-8">
              {SCENARIOS.map((scenario) => {
                const Icon = SCENARIO_ICONS[scenario.icon] || Zap;
                const isSelected = selectedScenario === scenario.id;
                return (
                  <button
                    key={scenario.id}
                    onClick={() => handleScenarioSelect(scenario.id)}
                    className={`group relative flex flex-col items-center gap-3 p-4 rounded-2xl border backdrop-blur-sm transition-all duration-300 ${
                      isSelected
                        ? 'border-fusion-primary bg-fusion-primary/15 shadow-[0_0_30px_rgba(0,255,170,0.15)] scale-[1.02]'
                        : 'border-white/10 bg-white/5 hover:bg-white/10 hover:border-white/20 hover:shadow-lg'
                    }`}
                  >
                    {/* Selection Glow */}
                    {isSelected && (
                      <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-fusion-primary/20 to-transparent pointer-events-none" />
                    )}
                    
                    {/* Icon */}
                    <div className={`relative w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-300 ${
                      isSelected 
                        ? 'bg-fusion-primary text-white shadow-lg' 
                        : 'bg-white/10 text-foreground-secondary group-hover:bg-white/20 group-hover:text-foreground'
                    }`}>
                      <Icon size={22} />
                    </div>
                    
                    {/* Name */}
                    <span className={`text-sm font-medium text-center leading-tight transition-colors ${
                      isSelected ? 'text-foreground' : 'text-foreground-secondary group-hover:text-foreground'
                    }`}>
                      {scenario.name}
                    </span>
                    
                    {/* Values - Yan yana */}
                    {scenario.dailyEnergy > 0 && (
                      <div className="flex items-center justify-center gap-2 flex-wrap">
                        <span className={`text-xs font-semibold ${isSelected ? 'text-fusion-primary' : 'text-foreground-muted'}`}>
                          {scenario.dailyEnergy} Wh
                        </span>
                        <span className="text-[10px] text-foreground-muted">
                          {scenario.maxPower}W Tepe Güç
                        </span>
                      </div>
                    )}

                    {/* Check Mark */}
                    {isSelected && (
                      <div className="absolute -top-1 -right-1 w-5 h-5 bg-fusion-primary rounded-full flex items-center justify-center shadow-lg">
                        <Check size={12} className="text-white" />
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
                <div className="mt-4 p-4 glass-light rounded-xl">
                  {/* Hazır Cihazlar */}
                  <p className="text-xs text-foreground-muted mb-3">Hızlı Ekle:</p>
                  <div className="flex flex-wrap gap-2 mb-4">
                    {PRESET_DEVICES.slice(0, 12).map((preset) => {
                      const Icon = DEVICE_ICONS[preset.id] || Zap;
                      return (
                        <button
                          key={preset.id}
                          onClick={() => handlePresetDeviceAdd(preset)}
                          className="flex items-center gap-1.5 px-3 py-1.5 bg-glass-bg hover:bg-glass-bg-hover border border-glass-border rounded-full text-xs transition-colors"
                        >
                          <Icon size={14} />
                          <span>{preset.name}</span>
                          <span className="text-foreground-muted">{preset.power}W</span>
                        </button>
                      );
                    })}
                  </div>

                  {/* Eklenen Cihazlar */}
                  {devices.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-4 pt-3 border-t border-glass-border">
                      {devices.map((device) => (
                        <div
                          key={device.id}
                          className="flex items-center gap-2 px-3 py-1.5 bg-fusion-primary/10 border border-fusion-primary/30 rounded-full text-xs"
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
                  <div className="grid grid-cols-4 gap-3 pt-3 border-t border-glass-border">
                    <div>
                      <label className="block text-xs text-foreground-muted mb-1">Güç (W)</label>
                      <input
                        type="number"
                        value={devicePower}
                        onChange={(e) => setDevicePower(Number(e.target.value))}
                        className="glass-input w-full text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-foreground-muted mb-1">Adet</label>
                      <input
                        type="number"
                        value={deviceQty}
                        onChange={(e) => setDeviceQty(Number(e.target.value))}
                        className="glass-input w-full text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-foreground-muted mb-1">Saat/Gün</label>
                      <input
                        type="number"
                        step="0.1"
                        value={deviceHours}
                        onChange={(e) => setDeviceHours(Number(e.target.value))}
                        className="glass-input w-full text-sm"
                      />
                    </div>
                    <div className="flex items-end">
                      <button onClick={handleAddDevice} className="px-4 py-2 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-white text-sm font-medium transition-colors w-full">
                        Ekle
                      </button>
                    </div>
                  </div>

                  {/* Toplam */}
                  {(dailyEnergy > 0 || maxPower > 0) && (
                    <div className="grid grid-cols-2 gap-4 mt-4 pt-3 border-t border-glass-border">
                      <div className="text-center">
                        <div className="text-lg font-bold text-fusion-primary">{dailyEnergy.toLocaleString()} Wh</div>
                        <div className="text-xs text-foreground-muted">Günlük Tüketim</div>
                      </div>
                      <div className="text-center">
                        <div className="text-lg font-bold text-fusion-secondary">{maxPower.toLocaleString()} W</div>
                        <div className="text-xs text-foreground-muted">Maks. Güç</div>
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
              <div className="relative p-6 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm">
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
              <div className="relative p-6 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm">
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
            <div className="mb-6 p-4 rounded-2xl bg-gradient-to-r from-emerald-500/10 to-amber-500/10 border border-white/10 backdrop-blur-sm">
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
                <div className="p-3 rounded-xl bg-white/5 border border-white/10">
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
                <div className="p-3 rounded-xl bg-white/5 border border-white/10">
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
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
              {[
                { id: 'hybrid', label: 'Hibrit', icon: BatteryCharging, desc: 'AC + Solar', badge: 'Önerilen' },
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
                        : 'border-white/10 bg-white/5 hover:bg-white/10 hover:border-white/20'
                    }`}
                  >
                    {mode.badge && (
                      <div className="absolute -top-2.5 left-1/2 -translate-x-1/2 px-2.5 py-1 bg-emerald-500 text-[9px] font-bold text-white rounded-full whitespace-nowrap">
                        {mode.badge}
                      </div>
                    )}
                    <div className={`w-10 h-10 mx-auto rounded-lg flex items-center justify-center mb-2 transition-all ${
                      isSelected ? 'bg-emerald-500 text-white' : 'bg-white/10 text-foreground-secondary group-hover:bg-white/20'
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
              <div className="space-y-6 p-6 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm">
                <div className="flex items-center gap-2 text-sm font-medium text-foreground-secondary">
                  <Sun size={16} className="text-amber-400" />
                  Güneş Paneli Ayarları
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs text-foreground-muted mb-2">Bulunduğunuz İl</label>
                    <select
                      value={selectedCity}
                      onChange={(e) => setSelectedCity(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-foreground outline-none focus:border-fusion-primary transition-colors"
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
                      className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-foreground outline-none focus:border-fusion-primary transition-colors placeholder:text-foreground-muted/50"
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
                            : 'border-white/10 bg-white/5 hover:bg-white/10'
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
            <div className="grid md:grid-cols-2 gap-4 mb-8">
              {/* Taşınabilirlik */}
              <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                <div className="flex items-center gap-2 text-xs font-medium text-foreground-muted mb-3">
                  <Leaf size={14} className="text-emerald-400" />
                  Taşınabilirlik
                </div>
                <div className="grid grid-cols-3 gap-2">
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
                        className={`px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                          isSelected
                            ? 'bg-emerald-500 text-white'
                            : 'bg-white/5 text-foreground-muted hover:bg-white/10 hover:text-foreground'
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
                <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                  <div className="flex items-center gap-2 text-xs font-medium text-foreground-muted mb-3">
                    <Zap size={14} className="text-amber-400" />
                    Şarj Hızı
                  </div>
                  <div className="grid grid-cols-3 gap-2">
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
                          className={`px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                            isSelected
                              ? 'bg-amber-500 text-white'
                              : 'bg-white/5 text-foreground-muted hover:bg-white/10 hover:text-foreground'
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
                <h2 className="text-xl font-semibold text-foreground mb-6 flex items-center gap-2">
                  <Check size={24} className="text-emerald-500" />
                  Önerilen Ürünler
                </h2>

            <div className="grid md:grid-cols-2 gap-6">
              {/* Güç Kaynağı Sonucu */}
              <div className="glass-card overflow-hidden flex flex-col">
                <div className="p-4 border-b border-glass-border">
                  <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
                    <Battery className="text-fusion-primary" />
                    {t.recommendedStation}
                  </h3>
                </div>

                {result.powerStation.station && (
                  <>
                    {/* Ürün Görseli - 1:1 */}
                    <div className="relative aspect-square bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-900">
                      <img
                        src={result.powerStation.station.image || `/images/products/${result.powerStation.station.slug}.webp`}
                        alt={result.powerStation.station.name}
                        className="absolute inset-0 w-full h-full object-cover"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          if (!target.dataset.fallback) {
                            target.dataset.fallback = 'true';
                            target.src = '/images/placeholder-product.svg';
                          }
                        }}
                      />
                      {/* Yeterlilik Badge */}
                      <div className="absolute top-3 right-3 bg-emerald-600 text-white px-3 py-1 rounded-full text-sm font-bold shadow-lg">
                        %{result.powerStation.sufficiency} Yeterli
                      </div>
                    </div>

                    <div className="p-5 flex-1 flex flex-col">
                      <div className="text-xl font-bold text-foreground mb-4">
                        {result.powerStation.station.name}
                      </div>

                      <div className="grid grid-cols-2 gap-3 mb-5">
                        <div className="glass-light rounded-lg p-3">
                          <div className="text-xs text-foreground-muted">{t.capacity}</div>
                          <div className="text-lg font-bold text-foreground">{result.powerStation.capacity} Wh</div>
                        </div>
                        <div className="glass-light rounded-lg p-3">
                          <div className="text-xs text-foreground-muted">{t.outputPower}</div>
                          <div className="text-lg font-bold text-foreground">{result.powerStation.outputPower} W</div>
                        </div>
                        <div className="glass-light rounded-lg p-3">
                          <div className="text-xs text-foreground-muted">Tepe Güç</div>
                          <div className="text-lg font-bold text-foreground">{result.powerStation.station.surgePower} W</div>
                        </div>
                        <div className="glass-light rounded-lg p-3">
                          <div className="text-xs text-foreground-muted">Çalışma Süresi</div>
                          <div className="text-lg font-bold text-foreground">
                            {result.powerStation.runtimeHours 
                              ? formatHours(result.powerStation.runtimeHours, 'tr') 
                              : '-'}
                          </div>
                        </div>
                      </div>

                      <div className="flex gap-3 mt-auto">
                        <a
                          href={result.powerStation.station.productUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="btn btn-glass flex-1 flex items-center justify-center gap-2"
                        >
                          <ExternalLink size={18} />
                          İncele
                        </a>
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
                            }
                          }}
                          className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-medium transition-colors"
                        >
                          <ShoppingCart size={18} />
                          Sepete Ekle
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </div>

              {/* Solar Panel Sonucu */}
              <div className="glass-card overflow-hidden flex flex-col">
                <div className="p-4 border-b border-glass-border">
                  <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
                    <Sun className="text-yellow-500" />
                    {t.recommendedPanel}
                  </h3>
                </div>

                {result.solarPanel ? (
                  <>
                    {/* Panel Görseli - 1:1 */}
                    <div className="relative aspect-square bg-gradient-to-br from-amber-50 to-orange-100 dark:from-amber-900/20 dark:to-orange-900/20">
                      <img
                        src={result.solarPanel.panel?.image || `/images/products/${result.solarPanel.panel?.slug}.webp`}
                        alt={result.solarPanel.panel?.name || 'Solar Panel'}
                        className="absolute inset-0 w-full h-full object-cover"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          if (!target.dataset.fallback) {
                            target.dataset.fallback = 'true';
                            target.src = '/images/placeholder-product.svg';
                          }
                        }}
                      />
                      {/* Karşılama Badge */}
                      <div className="absolute top-3 right-3 bg-amber-600 text-white px-3 py-1 rounded-full text-sm font-bold shadow-lg">
                        %{Math.round((result.solarPanel.coverageRatio || 0) * 100)} Karşılama
                      </div>
                      {/* Adet Badge */}
                      {result.solarPanel.panelCount > 1 && (
                        <div className="absolute top-3 left-3 bg-black/80 text-white px-3 py-1 rounded-full text-sm font-bold shadow-lg backdrop-blur-sm border border-white/20">
                          {result.solarPanel.panelCount} Adet
                        </div>
                      )}
                    </div>

                    <div className="p-5 flex-1 flex flex-col">
                      <div className="text-xl font-bold text-foreground mb-1">
                        {result.solarPanel.panel?.name || 'Solar Panel'}
                      </div>
                      <div className="text-sm text-foreground-secondary mb-4">
                        {result.solarPanel.panelCount} × {result.solarPanel.singlePanelWattage}W
                        {result.solarPanel.connection !== 'single' && (
                          <span className="ml-2 text-fusion-primary">
                            ({result.solarPanel.connection === 'parallel' ? 'Paralel Bağlantı' : 'Seri Bağlantı'})
                          </span>
                        )}
                      </div>

                      <div className="grid grid-cols-2 gap-3 mb-5">
                        <div className="glass-light rounded-lg p-3">
                          <div className="text-xs text-foreground-muted">{t.totalWattage}</div>
                          <div className="text-lg font-bold text-foreground">{result.solarPanel.totalWattage} W</div>
                        </div>
                        <div className="glass-light rounded-lg p-3">
                          <div className="text-xs text-foreground-muted">{t.dailyProduction}</div>
                          <div className="text-lg font-bold text-foreground">{result.solarPanel.dailyProduction} Wh</div>
                        </div>
                        <div className="glass-light rounded-lg p-3">
                          <div className="text-xs text-foreground-muted">Şarj Süresi</div>
                          <div className="text-lg font-bold text-foreground">
                            {result.solarPanel.chargeHours 
                              ? formatHours(result.solarPanel.chargeHours, 'tr') 
                              : '-'}
                          </div>
                        </div>
                        <div className="glass-light rounded-lg p-3">
                          <div className="text-xs text-foreground-muted">Ağırlık</div>
                          <div className="text-lg font-bold text-foreground">
                            {result.solarPanel.panel?.weight ? `${result.solarPanel.panel.weight * result.solarPanel.panelCount} kg` : '-'}
                          </div>
                        </div>
                      </div>

                      <div className="flex gap-3 mt-auto">
                        <a
                          href={result.solarPanel.panel?.productUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="btn btn-glass flex-1 flex items-center justify-center gap-2"
                        >
                          <ExternalLink size={18} />
                          İncele
                        </a>
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
                            }
                          }}
                          className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-medium transition-colors"
                        >
                          <ShoppingCart size={18} />
                          Sepete Ekle {result.solarPanel.panelCount > 1 ? `(${result.solarPanel.panelCount})` : ''}
                        </button>
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="p-6 text-center py-12 text-foreground-secondary flex-1 flex flex-col items-center justify-center">
                    <Sun size={48} className="mx-auto mb-4 opacity-30" />
                    {chargeMode === 'grid-only' || chargeMode === 'no-charge' ? (
                      <p>Solar panel kullanılmıyor</p>
                    ) : (
                      <p>Uyumlu solar panel bulunamadı</p>
                    )}
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
            className="flex items-center gap-2 px-6 py-3 rounded-xl bg-white/5 border border-white/10 text-foreground-secondary hover:bg-white/10 hover:text-foreground transition-all duration-300"
          >
            <ChevronLeft size={18} />
            <span className="hidden sm:inline">Geri</span>
          </button>
        ) : (
          <div />
        )}

        {currentStep !== 'results' && (
          <button
            onClick={goNext}
            disabled={!canGoNext}
            className={`flex items-center gap-2 px-8 py-3 rounded-xl font-medium transition-all duration-300 ${
              canGoNext
                ? 'bg-fusion-primary text-white shadow-lg shadow-fusion-primary/30 hover:shadow-fusion-primary/50 hover:scale-[1.02]'
                : 'bg-white/10 text-foreground-muted cursor-not-allowed'
            }`}
          >
            {currentStep === 'preferences' ? 'Sonuçları Gör' : 'Devam Et'}
            <ChevronRight size={18} />
          </button>
        )}

        {currentStep === 'results' && (
          <button
            onClick={handleReset}
            className="flex items-center gap-2 px-6 py-3 rounded-xl bg-white/5 border border-white/10 text-foreground-secondary hover:bg-white/10 hover:text-foreground transition-all duration-300"
          >
            <RotateCcw size={18} />
            Yeniden Başla
          </button>
        )}
      </div>
    </div>
  );
}
