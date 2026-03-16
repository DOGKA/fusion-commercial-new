"use client";

import { useState } from "react";

interface OptionValue {
  id: string;
  value: string;
  hex?: string;
}

interface OptionGroup {
  id: string;
  name: string;
  type: 'select' | 'color';
  values: OptionValue[];
}

interface VariationOptionsProps {
  optionGroups: OptionGroup[];
  onChange: (groups: OptionGroup[]) => void;
}

export default function VariationOptions({ optionGroups, onChange }: VariationOptionsProps) {
  const [newGroupName, setNewGroupName] = useState("");
  const [newGroupType, setNewGroupType] = useState<'select' | 'color'>('select');
  const [newValueInputs, setNewValueInputs] = useState<Record<string, string>>({});
  const [colorInputs, setColorInputs] = useState<Record<string, string>>({});

  const addOptionGroup = () => {
    if (!newGroupName.trim()) return;
    
    const newGroup: OptionGroup = {
      id: `group_${Date.now()}`,
      name: newGroupName.trim(),
      type: newGroupType,
      values: []
    };
    
    onChange([...optionGroups, newGroup]);
    setNewGroupName("");
    setNewGroupType('select');
  };

  const removeOptionGroup = (groupId: string) => {
    onChange(optionGroups.filter(g => g.id !== groupId));
  };

  const addValue = (groupId: string, value: string, hex?: string) => {
    if (!value.trim()) return;
    
    const updatedGroups = optionGroups.map(group => {
      if (group.id === groupId) {
        const newValue: OptionValue = {
          id: `val_${Date.now()}`,
          value: value.trim(),
          ...(hex && { hex })
        };
        return { ...group, values: [...group.values, newValue] };
      }
      return group;
    });
    
    onChange(updatedGroups);
    setNewValueInputs({ ...newValueInputs, [groupId]: "" });
  };

  const removeValue = (groupId: string, valueId: string) => {
    const updatedGroups = optionGroups.map(group => {
      if (group.id === groupId) {
        return { ...group, values: group.values.filter(v => v.id !== valueId) };
      }
      return group;
    });
    
    onChange(updatedGroups);
  };

  const handleKeyPress = (e: React.KeyboardEvent, groupId: string) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      const value = newValueInputs[groupId] || "";
      addValue(groupId, value);
    }
  };

  return (
    <div className="space-y-6">
      {/* Yeni Opsiyon Grubu Ekle */}
      <div className="rounded-lg border border-stroke dark:border-dark-3 p-4 bg-gray-50 dark:bg-dark-2">
        <h4 className="text-sm font-medium mb-3">Yeni Opsiyon Grubu Ekle</h4>
        <div className="flex gap-3">
          <input
            type="text"
            value={newGroupName}
            onChange={(e) => setNewGroupName(e.target.value)}
            placeholder="Örn: Renk, Beden, Kapasite..."
            className="flex-1 rounded-lg border border-stroke bg-white dark:bg-dark px-4 py-2 text-sm dark:border-dark-3"
            onKeyPress={(e) => e.key === 'Enter' && addOptionGroup()}
          />
          <select
            value={newGroupType}
            onChange={(e) => setNewGroupType(e.target.value as 'select' | 'color')}
            className="rounded-lg border border-stroke bg-white dark:bg-dark px-4 py-2 text-sm dark:border-dark-3"
          >
            <option value="select">Seçim</option>
            <option value="color">Renk</option>
          </select>
          <button
            onClick={addOptionGroup}
            disabled={!newGroupName.trim()}
            className="px-4 py-2 rounded-lg bg-primary text-white text-sm hover:bg-primary/90 disabled:opacity-50"
          >
            Ekle
          </button>
        </div>
      </div>

      {/* Opsiyon Grupları */}
      {optionGroups.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <svg className="w-12 h-12 mx-auto mb-3 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
          <p>Henüz opsiyon grubu eklenmedi</p>
          <p className="text-sm mt-1">Yukarıdaki formu kullanarak opsiyon grubu ekleyin</p>
        </div>
      ) : (
        <div className="space-y-4">
          {optionGroups.map((group, index) => (
            <div key={group.id} className="rounded-lg border border-stroke dark:border-dark-3 p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <span className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary text-sm font-medium">
                    {index + 1}
                  </span>
                  <div>
                    <h4 className="font-medium text-dark dark:text-white">{group.name}</h4>
                    <p className="text-xs text-gray-500">
                      {group.type === 'color' ? 'Renk seçimi' : 'Metin seçimi'} • {group.values.length} değer
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => removeOptionGroup(group.id)}
                  className="p-2 rounded-lg hover:bg-red-50 text-red-500"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>

              {/* Değer Ekleme */}
              <div className="mb-3">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newValueInputs[group.id] || ""}
                    onChange={(e) => setNewValueInputs({ ...newValueInputs, [group.id]: e.target.value })}
                    onKeyPress={(e) => handleKeyPress(e, group.id)}
                    placeholder={group.type === 'color' ? "Örn: Beyaz, Siyah..." : "Örn: S, M, L, 08, 09..."}
                    className="flex-1 rounded-lg border border-stroke bg-white dark:bg-dark px-3 py-2 text-sm dark:border-dark-3"
                  />
                  {group.type === 'color' && (
                    <div className="flex items-center gap-1">
                      <input
                        type="color"
                        value={colorInputs[group.id] || '#000000'}
                        onChange={(e) => setColorInputs({ ...colorInputs, [group.id]: e.target.value })}
                        className="w-10 h-10 rounded-lg cursor-pointer border-0 p-0"
                        title="Renk seç"
                      />
                      <span className="text-xs text-gray-400 w-16">{colorInputs[group.id] || '#000000'}</span>
                    </div>
                  )}
                  <button
                    onClick={() => {
                      const hex = group.type === 'color' ? colorInputs[group.id] : undefined;
                      addValue(group.id, newValueInputs[group.id] || "", hex);
                    }}
                    className="px-3 py-2 rounded-lg border border-primary text-primary text-sm hover:bg-primary/5"
                  >
                    + Ekle
                  </button>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  {group.type === 'color' 
                    ? 'Renk adı yazın ve renk seçiciyle hex kodu belirleyin' 
                    : 'Enter tuşu ile de ekleyebilirsiniz'}
                </p>
              </div>

              {/* Değerler (Chip'ler) */}
              {group.values.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {group.values.map((value) => (
                    <div
                      key={value.id}
                      className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-gray-100 dark:bg-dark-3 text-sm"
                    >
                      {group.type === 'color' && value.hex && (
                        <span
                          className="w-4 h-4 rounded-full border border-gray-300"
                          style={{ backgroundColor: value.hex }}
                        />
                      )}
                      <span>{value.value}</span>
                      <button
                        onClick={() => removeValue(group.id, value.id)}
                        className="hover:text-red-500"
                      >
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
