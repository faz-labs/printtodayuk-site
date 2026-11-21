'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Product } from '@/lib/types';
import { repriceProductData } from '@/lib/productImportEngine';
import {
  CurrencyGbp,
  TrendUp,
  Sparkle,
  CheckCircle,
  WarningCircle,
  ArrowRight,
} from '@phosphor-icons/react';

interface ProductRepriceModalProps {
  product: Product | null;
  isOpen: boolean;
  onClose: () => void;
  onSaveRepriced: (repricedProduct: Product) => Promise<void>;
}

export function ProductRepriceModal({
  product,
  isOpen,
  onClose,
  onSaveRepriced,
}: ProductRepriceModalProps) {
  const [multiplier, setMultiplier] = useState<string>('1.30');
  const [floorPrice, setFloorPrice] = useState<string>('');
  const [isSaving, setIsSaving] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);

  useEffect(() => {
    if (product) {
      if (product.priceMultiplier) {
        setMultiplier(String(product.priceMultiplier));
      } else {
        setMultiplier('1.30');
      }
      setFloorPrice('');
      setNotice(null);
    }
  }, [product]);

  const parsedMultiplier = parseFloat(multiplier) || 1.0;
  const parsedFloor = floorPrice ? parseFloat(floorPrice) : undefined;

  const repricedProduct = useMemo(() => {
    if (!product) return null;
    return repriceProductData(product, parsedMultiplier, parsedFloor);
  }, [product, parsedMultiplier, parsedFloor]);

  const handleApply = async () => {
    if (!repricedProduct) return;
    setIsSaving(true);
    setNotice(null);
    try {
      await onSaveRepriced(repricedProduct);
      onClose();
    } catch (err: any) {
      setNotice(`Failed to apply repricing: ${err.message || String(err)}`);
    } finally {
      setIsSaving(false);
    }
  };

  if (!product) return null;

  const originalPrice = product.sourcePrice || product.price || 0;
  const newPrice = repricedProduct?.price || 0;
  const variantKeys = Object.keys(product.variantQuantityTiers || {});

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Process 6: Reprice Product (${product.title})`}
      maxWidth="2xl"
    >
      <div className="space-y-5" data-testid="reprice-product-modal">
        {/* Info Box */}
        <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-900 flex items-start gap-2">
          <Sparkle weight="fill" className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
          <span>
            Multiply all tables (Base Tiers, Variant Tables, and Price Matrix) by a fixed factor (e.g. <strong>x1.3</strong> for Solopress + 30% margin), rounding up to 2 decimal places.
          </span>
        </div>

        {/* Input Parameters */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 bg-slate-50 border border-slate-200 rounded-xl">
          <div>
            <label className="block text-xs font-bold text-slate-800 mb-1">
              Price Multiplier Factor (e.g. 1.30 for +30%):
            </label>
            <div className="relative flex items-center">
              <span className="absolute left-3 text-slate-400 font-bold text-xs">x</span>
              <input
                type="number"
                step="0.01"
                min="0.1"
                max="10"
                value={multiplier}
                onChange={(e) => setMultiplier(e.target.value)}
                className="w-full h-10 pl-7 pr-3 rounded-lg border border-slate-300 text-sm font-bold text-slate-900 bg-white"
                data-testid="reprice-multiplier-input"
              />
            </div>
            <div className="flex gap-1.5 mt-2">
              {['1.20', '1.30', '1.35', '1.40', '1.50'].map((preset) => (
                <button
                  key={preset}
                  type="button"
                  onClick={() => setMultiplier(preset)}
                  className={`px-2 py-0.5 rounded text-[11px] font-bold border transition-colors ${
                    multiplier === preset ? 'bg-[#012169] text-white border-[#012169]' : 'bg-white text-slate-700 border-slate-300'
                  }`}
                >
                  x{preset}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-800 mb-1">
              Optional Price Floor (Never below £):
            </label>
            <div className="relative flex items-center">
              <span className="absolute left-3 text-slate-400 font-bold text-xs">£</span>
              <input
                type="number"
                step="0.01"
                placeholder="No floor limit"
                value={floorPrice}
                onChange={(e) => setFloorPrice(e.target.value)}
                className="w-full h-10 pl-7 pr-3 rounded-lg border border-slate-300 text-sm font-medium text-slate-900 bg-white"
                data-testid="reprice-floor-input"
              />
            </div>
            <span className="text-[10px] text-slate-500 mt-1 block">
              Guarantees no item or tier falls below this minimum charge.
            </span>
          </div>
        </div>

        {/* Live Comparison Preview */}
        <div className="p-4 bg-white border border-slate-200 rounded-xl space-y-3">
          <h5 className="text-xs font-bold text-slate-900 uppercase tracking-wider text-slate-500">
            Repricing Impact Preview
          </h5>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
            <div className="p-3 bg-slate-50 rounded-lg border">
              <div className="text-slate-400 text-[10px] font-bold uppercase">Base Price</div>
              <div className="flex items-center gap-2 mt-1">
                <span className="line-through text-slate-400">£{originalPrice.toFixed(2)}</span>
                <ArrowRight weight="bold" className="h-3 w-3 text-slate-400" />
                <span className="font-black text-emerald-700 text-sm">£{newPrice.toFixed(2)}</span>
              </div>
            </div>

            <div className="p-3 bg-slate-50 rounded-lg border">
              <div className="text-slate-400 text-[10px] font-bold uppercase">Variant Tables</div>
              <div className="text-sm font-bold text-slate-800 mt-1">
                {variantKeys.length} tables will reprice
              </div>
            </div>

            <div className="p-3 bg-slate-50 rounded-lg border">
              <div className="text-slate-400 text-[10px] font-bold uppercase">Price Matrix</div>
              <div className="text-sm font-bold text-slate-800 mt-1">
                {product.priceMatrix ? `${Object.keys(product.priceMatrix.cells || {}).length} cells will reprice` : 'None'}
              </div>
            </div>
          </div>

          {/* Sample Tier Comparison */}
          {product.quantityTiers && product.quantityTiers.length > 0 && (
            <div className="border border-slate-200 rounded-lg overflow-hidden text-xs">
              <table className="w-full text-left">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-700 font-bold">
                  <tr>
                    <th className="p-2">Quantity</th>
                    <th className="p-2">Current Tier Price</th>
                    <th className="p-2">Repriced (+{( (parsedMultiplier - 1) * 100).toFixed(0)}%)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {product.quantityTiers.slice(0, 5).map((t, idx) => {
                    const newT = repricedProduct?.quantityTiers?.[idx];
                    return (
                      <tr key={idx}>
                        <td className="p-2 font-bold text-slate-900">{t.quantity}</td>
                        <td className="p-2 text-slate-600">
                          {t.price !== undefined ? `£${Number(t.price).toFixed(2)}` : `+${t.percentIncrease}%`}
                        </td>
                        <td className="p-2 font-bold text-emerald-700">
                          {newT?.price !== undefined ? `£${Number(newT.price).toFixed(2)}` : `+${newT?.percentIncrease}%`}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {notice && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs font-bold text-red-700">
            {notice}
          </div>
        )}

        {/* Buttons */}
        <div className="flex items-center justify-between pt-3 border-t border-slate-200">
          <Button variant="outline" size="sm" onClick={onClose}>
            Cancel
          </Button>

          <Button
            variant="uk-blue"
            size="sm"
            disabled={isSaving}
            onClick={handleApply}
            data-testid="apply-reprice-btn"
          >
            <TrendUp weight="bold" className="h-4 w-4 mr-1.5" />
            <span>{isSaving ? 'Repricing Product...' : `Apply x${parsedMultiplier} Repricing`}</span>
          </Button>
        </div>
      </div>
    </Modal>
  );
}
