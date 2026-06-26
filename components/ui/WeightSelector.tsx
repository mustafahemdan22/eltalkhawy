'use client';

import React from 'react';
import { cn, formatPrice, discountedPrice, parseWeight, formatWeight } from '@/lib/utils';
import { Minus, Plus } from 'lucide-react';

interface WeightSelectorProps {
  selectedWeight: string;
  onChange: (weight: string) => void;
  basePrice: number;
  discount?: number | null;
  locale?: 'en' | 'ar';
}

export default function WeightSelector({
  selectedWeight,
  onChange,
  basePrice,
  discount = null,
  locale = 'en',
}: WeightSelectorProps) {
  const isRtl = locale === 'ar';
  
  const currentWeightGrams = parseWeight(selectedWeight);

  const handleDecrease = (e: React.MouseEvent) => {
    e.preventDefault();
    if (currentWeightGrams > 500) {
      onChange(formatWeight(currentWeightGrams - 500));
    }
  };

  const handleIncrease = (e: React.MouseEvent) => {
    e.preventDefault();
    if (currentWeightGrams < 10000) { // Limit up to 10kg
      onChange(formatWeight(currentWeightGrams + 500));
    }
  };

  const basePriceForWeight = Math.round(basePrice * (currentWeightGrams / 1000));
  const finalPrice = discount ? discountedPrice(basePriceForWeight, discount) : basePriceForWeight;

  return (
    <div className={cn("flex flex-col gap-2.5", isRtl && "items-end")}>
      <div 
        className={cn(
          "flex items-center justify-between bg-surface border border-muted rounded-button p-2 h-16 w-full max-w-sm select-none shadow-sm relative overflow-hidden transition-all duration-300 focus-within:border-[var(--gold)]",
          isRtl && "flex-row-reverse"
        )}
      >
        {/* Decrease Button */}
        <button
          type="button"
          onClick={handleDecrease}
          disabled={currentWeightGrams <= 500}
          aria-label={isRtl ? "تقليل الوزن" : "Decrease weight"}
          className={cn(
            "w-12 h-12 flex items-center justify-center rounded-button border border-muted bg-surface-raised text-primary transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--gold)]",
            currentWeightGrams <= 500
              ? "opacity-20 cursor-not-allowed border-muted/50 text-muted"
              : "hover:border-[var(--gold)] hover:text-[var(--gold)] hover:scale-105 active:scale-95 cursor-pointer"
          )}
        >
          <Minus className="w-4 h-4" />
        </button>

        {/* Selected Weight Display */}
        <div className="flex-1 flex flex-col items-center justify-center text-center px-4">
          <span 
            className="font-sans font-bold text-base text-primary tracking-wide transition-all duration-300"
            aria-live="polite"
          >
            {isRtl 
              ? selectedWeight.replace('1.5kg', '١.٥ كجم').replace('2.5kg', '٢.٥ كجم').replace('3.5kg', '٣.٥ كجم').replace('4.5kg', '٤.٥ كجم').replace('kg', ' كجم').replace('g', ' جم')
              : selectedWeight}
          </span>
          <div className={cn("flex items-center gap-1.5 mt-0.5", isRtl && "flex-row-reverse")}>
            <span className="text-2xs text-[var(--gold)] font-mono font-bold">
              {formatPrice(finalPrice, locale)}
            </span>
            {discount && (
              <span className="text-[10px] text-muted line-through font-mono">
                {formatPrice(basePriceForWeight, locale)}
              </span>
            )}
          </div>
        </div>

        {/* Increase Button */}
        <button
          type="button"
          onClick={handleIncrease}
          disabled={currentWeightGrams >= 10000}
          aria-label={isRtl ? "زيادة الوزن" : "Increase weight"}
          className={cn(
            "w-12 h-12 flex items-center justify-center rounded-button border border-muted bg-surface-raised text-primary transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--gold)]",
            currentWeightGrams >= 10000
              ? "opacity-20 cursor-not-allowed border-muted/50 text-muted"
              : "hover:border-[var(--gold)] hover:text-[var(--gold)] hover:scale-105 active:scale-95 cursor-pointer"
          )}
        >
          <Plus className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
