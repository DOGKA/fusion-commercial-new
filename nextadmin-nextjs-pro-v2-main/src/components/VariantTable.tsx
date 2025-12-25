"use client";

import { useState } from "react";
import Image from "next/image";

// Renk açık mı koyu mu kontrol et (text rengi için)
const isLightColor = (hex: string): boolean => {
  if (!hex || !hex.startsWith('#')) return true;
  const c = hex.substring(1);
  const rgb = parseInt(c, 16);
  const r = (rgb >> 16) & 0xff;
  const g = (rgb >>  8) & 0xff;
  const b = (rgb >>  0) & 0xff;
  const luma = 0.299 * r + 0.587 * g + 0.114 * b;
  return luma > 128;
};

interface Variant {
  id: string;
  combinationKey: string;
  combination: Record<string, string>;
  sku: string;
  price: string;
  salePrice: string;
  stock: string;
  image: string;
  isActive: boolean;
  // Squircle'da gösterilecek değerler
  displayValue: string;  // Text gösterimi (örn: "XL", "08", "Beyaz")
  colorCode: string;     // Renk hex kodu (örn: "#FFFFFF", boşsa text gösterilir)
}

interface VariantTableProps {
  variants: Variant[];
  selectedVariants: string[];
  onUpdate: (variants: Variant[]) => void;
  onSelectionChange: (selected: string[]) => void;
  onImageSelect?: (variantId: string) => void;
}

export default function VariantTable({ 
  variants, 
  selectedVariants,
  onUpdate, 
  onSelectionChange,
  onImageSelect 
}: VariantTableProps) {
  const [editingCell, setEditingCell] = useState<{ variantId: string; field: string } | null>(null);
  const [showBulkPriceModal, setShowBulkPriceModal] = useState(false);
  const [showBulkStockModal, setShowBulkStockModal] = useState(false);
  const [bulkPrice, setBulkPrice] = useState("");
  const [bulkStock, setBulkStock] = useState("");
  const [bulkStockAction, setBulkStockAction] = useState<"set" | "add" | "subtract">("set");

  const handleCellEdit = (variantId: string, field: keyof Variant, value: any) => {
    const updatedVariants = variants.map(v => 
      v.id === variantId ? { ...v, [field]: value } : v
    );
    onUpdate(updatedVariants);
  };

  const handleDelete = (variantId: string) => {
    if (confirm('Bu varyantı silmek istediğinizden emin misiniz?')) {
      onUpdate(variants.filter(v => v.id !== variantId));
    }
  };

  const handleDeleteAll = () => {
    if (confirm(`${variants.length} varyantın tümünü silmek istediğinizden emin misiniz?`)) {
      onUpdate([]);
    }
  };

  const toggleSelect = (variantId: string) => {
    if (selectedVariants.includes(variantId)) {
      onSelectionChange(selectedVariants.filter(id => id !== variantId));
    } else {
      onSelectionChange([...selectedVariants, variantId]);
    }
  };

  const toggleSelectAll = () => {
    if (selectedVariants.length === variants.length) {
      onSelectionChange([]);
    } else {
      onSelectionChange(variants.map(v => v.id));
    }
  };

  const applyBulkPrice = () => {
    if (!bulkPrice || selectedVariants.length === 0) return;
    
    const updatedVariants = variants.map(v => 
      selectedVariants.includes(v.id) ? { ...v, price: bulkPrice } : v
    );
    onUpdate(updatedVariants);
    setShowBulkPriceModal(false);
    setBulkPrice("");
  };

  const applyBulkStock = () => {
    if (!bulkStock || selectedVariants.length === 0) return;
    
    const updatedVariants = variants.map(v => {
      if (!selectedVariants.includes(v.id)) return v;
      
      const currentStock = parseInt(v.stock) || 0;
      const changeAmount = parseInt(bulkStock) || 0;
      
      let newStock = currentStock;
      if (bulkStockAction === "set") {
        newStock = changeAmount;
      } else if (bulkStockAction === "add") {
        newStock = currentStock + changeAmount;
      } else if (bulkStockAction === "subtract") {
        newStock = Math.max(0, currentStock - changeAmount);
      }
      
      return { ...v, stock: newStock.toString() };
    });
    
    onUpdate(updatedVariants);
    setShowBulkStockModal(false);
    setBulkStock("");
  };

  const toggleBulkActive = (active: boolean) => {
    if (selectedVariants.length === 0) return;
    
    const updatedVariants = variants.map(v => 
      selectedVariants.includes(v.id) ? { ...v, isActive: active } : v
    );
    onUpdate(updatedVariants);
  };

  if (variants.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500">
        <svg className="w-16 h-16 mx-auto mb-4 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
        </svg>
        <p className="text-lg font-medium mb-2">Henüz varyant oluşturulmadı</p>
        <p className="text-sm">Yukarıdaki "Varyantları Oluştur" butonunu kullanın</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-3 flex-wrap">
          <span className="text-sm text-gray-600 dark:text-gray-400">
            {variants.length} varyant • {selectedVariants.length} seçili
          </span>
          
          {selectedVariants.length > 0 && (
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowBulkPriceModal(true)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-stroke dark:border-dark-3 text-sm hover:bg-gray-50 dark:hover:bg-dark-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Fiyat
              </button>
              <button
                onClick={() => setShowBulkStockModal(true)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-stroke dark:border-dark-3 text-sm hover:bg-gray-50 dark:hover:bg-dark-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                </svg>
                Stok
              </button>
              <button
                onClick={() => toggleBulkActive(true)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-green-500 text-green-600 text-sm hover:bg-green-50 dark:hover:bg-green-500/10"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Aktif
              </button>
              <button
                onClick={() => toggleBulkActive(false)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-red-500 text-red-600 text-sm hover:bg-red-50 dark:hover:bg-red-500/10"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
                Pasif
              </button>
            </div>
          )}
        </div>
        <button
          onClick={handleDeleteAll}
          className="inline-flex items-center gap-1.5 text-sm text-red-600 hover:text-red-700"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
          Tümünü Temizle
        </button>
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-lg border border-stroke dark:border-dark-3">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 dark:bg-dark-2">
            <tr>
              <th className="p-3 text-left">
                <input
                  type="checkbox"
                  checked={selectedVariants.length === variants.length}
                  onChange={toggleSelectAll}
                  className="rounded"
                />
              </th>
              <th className="p-3 text-left font-medium">Kombinasyon</th>
              <th className="p-3 text-left font-medium">Görünüm</th>
              <th className="p-3 text-left font-medium">SKU</th>
              <th className="p-3 text-left font-medium">Fiyat (₺)</th>
              <th className="p-3 text-left font-medium">İndirim (₺)</th>
              <th className="p-3 text-left font-medium">Stok</th>
              <th className="p-3 text-left font-medium">Görsel</th>
              <th className="p-3 text-left font-medium">Aktif</th>
              <th className="p-3 text-left font-medium">İşlem</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-stroke dark:divide-dark-3">
            {variants.map((variant) => (
              <tr key={variant.id} className="hover:bg-gray-50 dark:hover:bg-dark-2">
                {/* Checkbox */}
                <td className="p-3">
                  <input
                    type="checkbox"
                    checked={selectedVariants.includes(variant.id)}
                    onChange={() => toggleSelect(variant.id)}
                    className="rounded"
                  />
                </td>

                {/* Kombinasyon */}
                <td className="p-3">
                  <div className="flex flex-wrap gap-1">
                    {Object.entries(variant.combination).map(([key, value]) => (
                      <span
                        key={key}
                        className="inline-flex items-center px-2 py-1 rounded-md bg-primary/10 text-primary text-xs font-medium"
                      >
                        {key}: {value}
                      </span>
                    ))}
                  </div>
                </td>

                {/* Görünüm - Squircle önizleme + düzenleme */}
                <td className="px-2 py-3">
                  <div className="flex items-center gap-3">
                    {/* Squircle Önizleme */}
                    <div
                      className="w-9 h-9 rounded-lg border-2 flex-shrink-0 flex items-center justify-center text-[11px] font-semibold shadow-sm"
                      style={{
                        backgroundColor: variant.colorCode || '#f3f4f6',
                        borderColor: variant.colorCode ? variant.colorCode : '#e5e7eb',
                        color: variant.colorCode ? (isLightColor(variant.colorCode) ? '#1f2937' : '#fff') : '#374151',
                      }}
                      title={variant.colorCode ? `Renk: ${variant.colorCode}` : 'Text gösterimi'}
                    >
                      {!variant.colorCode && (variant.displayValue?.substring(0, 3) || '?')}
                    </div>
                    
                    {/* Düzenleme Alanları */}
                    <div className="flex items-center gap-2">
                      {/* Display Value */}
                      <input
                        type="text"
                        value={variant.displayValue || ''}
                        onChange={(e) => handleCellEdit(variant.id, 'displayValue', e.target.value)}
                        placeholder="XL, 08..."
                        className="w-14 px-2 py-1.5 rounded-md border border-stroke dark:border-dark-3 bg-white dark:bg-dark text-xs text-center"
                        title="Squircle'da gösterilecek text"
                      />
                      {/* Color Code */}
                      <div className="flex items-center">
                        <input
                          type="color"
                          value={variant.colorCode || '#f3f4f6'}
                          onChange={(e) => handleCellEdit(variant.id, 'colorCode', e.target.value)}
                          className="w-8 h-8 rounded-md cursor-pointer border border-stroke dark:border-dark-3 p-0.5"
                          title="Renk seç"
                        />
                        {variant.colorCode && (
                          <button
                            onClick={() => handleCellEdit(variant.id, 'colorCode', '')}
                            className="ml-1 p-1 rounded hover:bg-red-50 dark:hover:bg-red-500/10 text-red-500"
                            title="Rengi kaldır"
                          >
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </td>

                {/* SKU */}
                <td className="p-3">
                  {editingCell?.variantId === variant.id && editingCell?.field === 'sku' ? (
                    <input
                      type="text"
                      value={variant.sku}
                      onChange={(e) => handleCellEdit(variant.id, 'sku', e.target.value)}
                      onBlur={() => setEditingCell(null)}
                      autoFocus
                      className={`w-full px-2 py-1 rounded border ${!variant.sku.trim() ? 'border-red-300 bg-red-50' : 'border-stroke'} dark:border-dark-3 bg-transparent`}
                    />
                  ) : (
                    <div
                      onClick={() => setEditingCell({ variantId: variant.id, field: 'sku' })}
                      className={`cursor-pointer hover:bg-gray-100 dark:hover:bg-dark-3 px-2 py-1 rounded ${!variant.sku.trim() ? 'bg-red-50 border border-red-200' : ''}`}
                    >
                      {variant.sku || <span className="text-red-500 font-medium text-xs">SKU ekle</span>}
                    </div>
                  )}
                </td>

                {/* Price */}
                <td className="p-3">
                  {editingCell?.variantId === variant.id && editingCell?.field === 'price' ? (
                    <input
                      type="number"
                      value={variant.price}
                      onChange={(e) => handleCellEdit(variant.id, 'price', e.target.value)}
                      onBlur={() => setEditingCell(null)}
                      autoFocus
                      className={`w-20 px-2 py-1 rounded border ${!variant.price || parseFloat(variant.price) <= 0 ? 'border-red-300 bg-red-50' : 'border-stroke'} dark:border-dark-3 bg-transparent`}
                    />
                  ) : (
                    <div
                      onClick={() => setEditingCell({ variantId: variant.id, field: 'price' })}
                      className={`cursor-pointer hover:bg-gray-100 dark:hover:bg-dark-3 px-2 py-1 rounded ${!variant.price || parseFloat(variant.price) <= 0 ? 'bg-red-50 border border-red-200' : ''}`}
                    >
                      {variant.price || <span className="text-red-500 font-medium text-xs">0</span>}
                    </div>
                  )}
                </td>

                {/* Sale Price */}
                <td className="p-3">
                  {editingCell?.variantId === variant.id && editingCell?.field === 'salePrice' ? (
                    <input
                      type="number"
                      value={variant.salePrice}
                      onChange={(e) => handleCellEdit(variant.id, 'salePrice', e.target.value)}
                      onBlur={() => setEditingCell(null)}
                      autoFocus
                      className="w-20 px-2 py-1 rounded border border-stroke dark:border-dark-3 bg-transparent"
                    />
                  ) : (
                    <div
                      onClick={() => setEditingCell({ variantId: variant.id, field: 'salePrice' })}
                      className="cursor-pointer hover:bg-gray-100 dark:hover:bg-dark-3 px-2 py-1 rounded"
                    >
                      {variant.salePrice || <span className="text-gray-400">-</span>}
                    </div>
                  )}
                </td>

                {/* Stock */}
                <td className="p-3">
                  {editingCell?.variantId === variant.id && editingCell?.field === 'stock' ? (
                    <input
                      type="number"
                      value={variant.stock}
                      onChange={(e) => handleCellEdit(variant.id, 'stock', e.target.value)}
                      onBlur={() => setEditingCell(null)}
                      autoFocus
                      className="w-20 px-2 py-1 rounded border border-stroke dark:border-dark-3 bg-transparent"
                    />
                  ) : (
                    <div
                      onClick={() => setEditingCell({ variantId: variant.id, field: 'stock' })}
                      className="cursor-pointer hover:bg-gray-100 dark:hover:bg-dark-3 px-2 py-1 rounded"
                    >
                      {variant.stock}
                    </div>
                  )}
                </td>

                {/* Image */}
                <td className="p-3">
                  {variant.image ? (
                    <div className="relative w-12 h-12 rounded overflow-hidden border border-stroke dark:border-dark-3">
                      <Image
                        src={variant.image}
                        alt={variant.sku}
                        fill
                        className="object-cover"
                      />
                    </div>
                  ) : (
                    <button
                      onClick={() => onImageSelect?.(variant.id)}
                      className="w-12 h-12 rounded border-2 border-dashed border-stroke dark:border-dark-3 flex items-center justify-center hover:border-primary"
                    >
                      <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                      </svg>
                    </button>
                  )}
                </td>

                {/* Active */}
                <td className="p-3">
                  <button
                    onClick={() => handleCellEdit(variant.id, 'isActive', !variant.isActive)}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      variant.isActive ? 'bg-primary' : 'bg-gray-300 dark:bg-dark-3'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        variant.isActive ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </td>

                {/* Actions */}
                <td className="p-3">
                  <button
                    onClick={() => handleDelete(variant.id)}
                    className="p-2 rounded hover:bg-red-50 text-red-500"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Bulk Price Modal */}
      {showBulkPriceModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="w-full max-w-md rounded-xl bg-white dark:bg-gray-dark p-6">
            <h3 className="text-lg font-semibold text-dark dark:text-white mb-4">
              Seçili Varyantlara Fiyat Uygula
            </h3>
            <p className="text-sm text-gray-500 mb-4">
              {selectedVariants.length} varyanta fiyat uygulanacak
            </p>
            
            <div className="mb-6">
              <label className="mb-2 block text-sm font-medium">Fiyat (₺)</label>
              <input
                type="number"
                value={bulkPrice}
                onChange={(e) => setBulkPrice(e.target.value)}
                placeholder="0.00"
                className="w-full rounded-lg border border-stroke dark:border-dark-3 bg-transparent px-4 py-3"
                autoFocus
              />
            </div>

            <div className="flex justify-end gap-3">
              <button
                onClick={() => {
                  setShowBulkPriceModal(false);
                  setBulkPrice("");
                }}
                className="px-4 py-2 rounded-lg border border-stroke text-sm hover:bg-gray-50 dark:border-dark-3"
              >
                İptal
              </button>
              <button
                onClick={applyBulkPrice}
                disabled={!bulkPrice}
                className="px-4 py-2 rounded-lg bg-primary text-white text-sm hover:bg-primary/90 disabled:opacity-50"
              >
                Uygula
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Bulk Stock Modal */}
      {showBulkStockModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="w-full max-w-md rounded-xl bg-white dark:bg-gray-dark p-6">
            <h3 className="text-lg font-semibold text-dark dark:text-white mb-4">
              Seçili Varyantlara Stok Ayarla
            </h3>
            <p className="text-sm text-gray-500 mb-4">
              {selectedVariants.length} varyanta stok işlemi uygulanacak
            </p>
            
            <div className="space-y-4 mb-6">
              <div>
                <label className="mb-2 block text-sm font-medium">İşlem Tipi</label>
                <select
                  value={bulkStockAction}
                  onChange={(e) => setBulkStockAction(e.target.value as any)}
                  className="w-full rounded-lg border border-stroke dark:border-dark-3 bg-transparent px-4 py-3"
                >
                  <option value="set">Stok Ata (Mevcut değeri değiştir)</option>
                  <option value="add">Stok Ekle (Mevcut değere ekle)</option>
                  <option value="subtract">Stok Çıkar (Mevcut değerden çıkar)</option>
                </select>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium">Miktar</label>
                <input
                  type="number"
                  value={bulkStock}
                  onChange={(e) => setBulkStock(e.target.value)}
                  placeholder="0"
                  className="w-full rounded-lg border border-stroke dark:border-dark-3 bg-transparent px-4 py-3"
                />
              </div>
            </div>

            <div className="flex justify-end gap-3">
              <button
                onClick={() => {
                  setShowBulkStockModal(false);
                  setBulkStock("");
                }}
                className="px-4 py-2 rounded-lg border border-stroke text-sm hover:bg-gray-50 dark:border-dark-3"
              >
                İptal
              </button>
              <button
                onClick={applyBulkStock}
                disabled={!bulkStock}
                className="px-4 py-2 rounded-lg bg-primary text-white text-sm hover:bg-primary/90 disabled:opacity-50"
              >
                Uygula
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
