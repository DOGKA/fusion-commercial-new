'use client';

import React from 'react';
import { Zap } from 'lucide-react';

interface EnergySummaryEditorProps {
  dailyEnergy: number;
  maxPower: number;
  onDailyEnergyChange: (value: number) => void;
  onMaxPowerChange: (value: number) => void;
  title?: string;
  subtitle?: string;
}

/**
 * "Enerji Değerleriniz" özet editörü.
 * Hem cihaz detay hem şarj adımında kullanılır.
 */
export default function EnergySummaryEditor({
  dailyEnergy,
  maxPower,
  onDailyEnergyChange,
  onMaxPowerChange,
  title = 'Enerji Değerleriniz',
  subtitle = 'Değerleri düzenleyebilir veya doğrudan devam edebilirsiniz',
}: EnergySummaryEditorProps) {
  return (
    <div className="pc-energy-editor p-4 rounded-2xl bg-gradient-to-r from-emerald-500/10 to-amber-500/10 border border-border backdrop-blur-sm">
      <div className="flex items-center justify-between gap-2 mb-3">
        <div className="flex items-center gap-2">
          <Zap size={16} className="text-emerald-400" />
          <span className="pc-energy-title text-sm font-medium text-foreground">{title}</span>
        </div>
        <span className="pc-energy-meta flex items-center gap-1 text-[11px] text-foreground-muted">
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <circle cx="12" cy="12" r="10" strokeWidth="1.5" />
            <path strokeLinecap="round" strokeWidth="1.5" d="M12 16v-4m0-4h.01" />
          </svg>
          Düzenlenebilir
        </span>
      </div>

      {subtitle && (
        <p className="text-[11px] text-foreground-muted mb-3 -mt-1">{subtitle}</p>
      )}

      <div className="pc-energy-grid grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
        <div className="pc-energy-card p-3 rounded-xl bg-surface-secondary border border-border">
          <label className="block text-[11px] text-foreground-muted mb-1">Günlük Tüketim</label>
          <div className="flex items-center gap-2">
            <input
              type="number"
              min={0}
              value={dailyEnergy || ''}
              onChange={(e) => onDailyEnergyChange(Number(e.target.value) || 0)}
              className="pc-energy-input flex-1 bg-transparent text-lg sm:text-xl font-bold text-foreground outline-none w-full [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
            />
            <span className="text-xs sm:text-sm text-foreground-muted whitespace-nowrap">Wh/gün</span>
          </div>
        </div>
        <div className="pc-energy-card p-3 rounded-xl bg-surface-secondary border border-border">
          <label className="block text-[11px] text-foreground-muted mb-1">Maksimum Güç</label>
          <div className="flex items-center gap-2">
            <input
              type="number"
              min={0}
              value={maxPower || ''}
              onChange={(e) => onMaxPowerChange(Number(e.target.value) || 0)}
              className="pc-energy-input flex-1 bg-transparent text-lg sm:text-xl font-bold text-foreground outline-none w-full [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
            />
            <span className="text-xs sm:text-sm text-foreground-muted whitespace-nowrap">W</span>
          </div>
        </div>
      </div>
    </div>
  );
}
