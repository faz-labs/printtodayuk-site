/**
 * Print Today UK - Dynamic Print Pricing & Specification Engine
 * Supports formula-based matrix generation, speed multipliers, option modifiers,
 * working-day due date calculation, and item/total weight estimations.
 */

export interface DeliverySpeedOption {
  id: 'same_day' | 'next_day' | 'standard';
  title: string;
  subtitle: string;
  dueDate: string;
  multiplier: number;
}

export interface MatrixCellPrice {
  price: number;
  rrpPrice?: number;
  isDiscounted: boolean;
  unitPrice: number;
  isAvailable?: boolean;
}

export interface MatrixRow {
  quantity: number;
  sameDay: MatrixCellPrice;
  nextDay: MatrixCellPrice;
  standard: MatrixCellPrice;
}

// Standard ISO paper sizes in square meters
const SIZE_AREAS_M2: Record<string, number> = {
  a6: 0.105 * 0.148, // 0.01554 m²
  a5: 0.148 * 0.21,  // 0.03108 m²
  a4: 0.21 * 0.297,  // 0.06237 m²
  a3: 0.297 * 0.42,  // 0.12474 m²
  dl: 0.099 * 0.21,  // 0.02079 m²
  square: 0.148 * 0.148, // 0.0219 m²
  '85x55': 0.085 * 0.055, // 0.004675 m² (Business card)
};

/**
 * Calculates human-friendly working-day delivery dates (skipping weekends).
 */
export function getWorkingDueDates(): { sameDay: string; nextDay: string; standard: string } {
  const now = new Date();

  function addWorkingDays(startDate: Date, days: number): Date {
    const result = new Date(startDate);
    let added = 0;
    while (added < days) {
      result.setDate(result.getDate() + 1);
      const dayOfWeek = result.getDay();
      // Skip Saturday (6) and Sunday (0)
      if (dayOfWeek !== 0 && dayOfWeek !== 6) {
        added++;
      }
    }
    return result;
  }

  const formatOptions: Intl.DateTimeFormatOptions = { month: 'short', day: 'numeric' };

  // If after 12:00 PM London time, same day moves to tomorrow morning
  const isPastCutoff = now.getHours() >= 13;
  const sameDayTarget = isPastCutoff ? addWorkingDays(now, 1) : now;
  const nextDayTarget = addWorkingDays(now, 1);
  const standardTarget = addWorkingDays(now, 4);

  return {
    sameDay: sameDayTarget.toLocaleDateString('en-GB', formatOptions),
    nextDay: nextDayTarget.toLocaleDateString('en-GB', formatOptions),
    standard: standardTarget.toLocaleDateString('en-GB', formatOptions),
  };
}

/**
 * Calculates item weight and total weight in grams/kg based on dimensions and GSM.
 */
export function calculatePrintWeight(
  sizeName: string,
  stockName: string,
  quantity: number,
  sets: number = 1
): { weightPerItemGrams: number; totalWeightKg: number } {
  const cleanSize = sizeName.toLowerCase().replace(/[^a-z0-9]/g, '');
  let areaM2 = 0.03108; // Default A5

  for (const [key, area] of Object.entries(SIZE_AREAS_M2)) {
    if (cleanSize.includes(key)) {
      areaM2 = area;
      break;
    }
  }

  // Extract GSM number (e.g. "150gsm Silk" -> 150)
  const gsmMatch = stockName.match(/(\d+)\s*gsm/i);
  const gsm = gsmMatch ? parseInt(gsmMatch[1], 10) : 150;

  // Weight in grams per single printed sheet
  const rawGramsPerItem = areaM2 * gsm;
  const weightPerItemGrams = Math.max(1, Math.round(rawGramsPerItem));

  // Total weight
  const totalWeightGrams = rawGramsPerItem * quantity * sets;
  const totalWeightKg = Number((totalWeightGrams / 1000).toFixed(3));

  return {
    weightPerItemGrams,
    totalWeightKg,
  };
}

/**
 * Extracts price modifiers (percentage or flat fee) from option text.
 * Supports:
 *   "A8+500%" -> multiplier 6.0 (+500%)
 *   "A8 (+500%)" -> multiplier 6.0 (+500%)
 *   "Double Sided (+25%)" or "Double Sided +25%" -> multiplier 1.25
 *   "Matt Lamination (+£12.00)" or "Matt Lamination +£12" -> flatAddon 12
 *   "A6 (-15%)" or "A6 -15%" -> multiplier 0.85
 */
export function parseOptionModifier(optionText: string): { multiplier: number; flatAddon: number } {
  let multiplier = 1.0;
  let flatAddon = 0;

  if (!optionText) return { multiplier, flatAddon };

  // 1. Percentage match: e.g. (+500%), +500%, A8+500%, (+25%), -15%, (500%)
  const percentMatch =
    optionText.match(/\(([+-]?\d+(?:\.\d+)?)%\)/) ||
    optionText.match(/([+-]\d+(?:\.\d+)?)%/) ||
    optionText.match(/\((\d+(?:\.\d+)?)%\)/);

  if (percentMatch) {
    const percent = parseFloat(percentMatch[1]);
    multiplier = 1 + percent / 100;
  }

  // 2. Flat fee match: e.g. (+£12.50), +£12.50, +£12, (+12.50)
  const flatMatch =
    optionText.match(/\(\+[£$](\d+(?:\.\d+)?)\)/) ||
    optionText.match(/\+[£$](\d+(?:\.\d+)?)/) ||
    optionText.match(/\(\+(\d+(?:\.\d+)?)\)/);

  if (flatMatch) {
    flatAddon = parseFloat(flatMatch[1]);
  }

  return { multiplier, flatAddon };
}

/**
 * Strips pricing modifiers (+50%, +500%, (+25%), +£12, etc.) from option names
 * so the customer on the storefront only sees the clean title (e.g. "A8" or "Matt Lamination").
 * The background pricing engine still uses the raw option value to compute the correct multiplier/add-on.
 */
export function cleanOptionDisplayName(optionText: string): string {
  if (!optionText) return '';
  let cleaned = optionText.trim();

  // Strip parenthesized modifiers e.g. "(+50%)", "(-15%)", "(+£12.00)", "(+12.00)", "(500%)"
  cleaned = cleaned.replace(/\s*\([+-]?\d+(?:\.\d+)?%\)/gi, '');
  cleaned = cleaned.replace(/\s*\(\+[£$]?\d+(?:\.\d+)?\)/gi, '');
  cleaned = cleaned.replace(/\s*\([£$]\d+(?:\.\d+)?\)/gi, '');

  // Strip unparenthesized suffix modifiers e.g. "+500%", "+50%", "-15%", "+£12", "+£12.00", "+$15"
  cleaned = cleaned.replace(/\s*[+-]\d+(?:\.\d+)?%$/gi, '');
  cleaned = cleaned.replace(/\s*\+[£$]\d+(?:\.\d+)?$/gi, '');
  cleaned = cleaned.replace(/\s*-[£$]\d+(?:\.\d+)?$/gi, '');

  return cleaned.trim() || optionText.trim();
}

/**
 * Computes default industry printing multipliers if not explicitly written into option labels.
 */
export function getIndustryDefaultModifier(
  fieldName: string,
  optionValue: string
): { multiplier: number; flatAddon: number } {
  const f = fieldName.toLowerCase();
  const opt = optionValue.toLowerCase();

  // 1. Explicit modifier written in option text takes precedence
  const explicit = parseOptionModifier(optionValue);
  if (explicit.multiplier !== 1 || explicit.flatAddon !== 0) {
    return explicit;
  }

  // 2. Printed Sides
  if (f.includes('side') || opt.includes('single sided') || opt.includes('double sided')) {
    if (opt.includes('double')) return { multiplier: 1.25, flatAddon: 0 };
    return { multiplier: 1.0, flatAddon: 0 };
  }

  // 3. Finished Size
  if (f.includes('size')) {
    if (opt.includes('a6') || opt.includes('dl')) return { multiplier: 0.85, flatAddon: 0 };
    if (opt.includes('a5')) return { multiplier: 1.0, flatAddon: 0 };
    if (opt.includes('a4')) return { multiplier: 1.45, flatAddon: 0 };
    if (opt.includes('a3')) return { multiplier: 1.95, flatAddon: 0 };
  }

  // 4. Stock / Paper GSM
  if (f.includes('stock') || f.includes('paper')) {
    if (opt.includes('130gsm')) return { multiplier: 0.95, flatAddon: 0 };
    if (opt.includes('150gsm') || opt.includes('170gsm')) return { multiplier: 1.0, flatAddon: 0 };
    if (opt.includes('250gsm') || opt.includes('300gsm')) return { multiplier: 1.18, flatAddon: 0 };
    if (opt.includes('350gsm') || opt.includes('400gsm') || opt.includes('450gsm')) {
      return { multiplier: 1.35, flatAddon: 0 };
    }
  }

  // 5. Lamination
  if (f.includes('lamination') || f.includes('finish')) {
    if (opt.includes('no lamination') || opt.includes('none') || opt.includes('uncoated')) {
      return { multiplier: 1.0, flatAddon: 0 };
    }
    if (opt.includes('matt') || opt.includes('gloss')) return { multiplier: 1.15, flatAddon: 12.0 };
    if (opt.includes('soft touch') || opt.includes('velvet')) return { multiplier: 1.22, flatAddon: 16.0 };
  }

  // 6. Embellishment
  if (f.includes('embellish') || f.includes('foil') || f.includes('spot uv')) {
    if (opt.includes('no embellish') || opt.includes('none')) return { multiplier: 1.0, flatAddon: 0 };
    if (opt.includes('foil') || opt.includes('spot uv')) return { multiplier: 1.25, flatAddon: 24.0 };
  }

  return { multiplier: 1.0, flatAddon: 0 };
}

/**
 * Standard default quantity tiers.
 */
export const DEFAULT_QUANTITY_TIERS = [25, 50, 100, 200, 250, 300, 500, 1000, 2500, 5000];

/**
 * Generates commercially viable quantity tiers dynamically based on product minQuantity and maxQuantity.
 * Handles products starting from 1 (banners, tablecloths, posters) up to 250,000,
 * as well as standard sheet/card products starting at 25 or 50.
 */
export function getProductQuantityTiers(
  minQty: number = 25,
  maxQty: number = 250000
): number[] {
  const safeMin = Math.max(1, Math.round(minQty || 25));
  const safeMax = Math.max(safeMin, Math.round(maxQty || 250000));

  let candidateTiers: number[] = [];

  if (safeMin <= 5) {
    // Low-volume items (PVC Banners, Signage, Canvases, Tablecloths, Posters)
    candidateTiers = [
      1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 15, 20, 25, 50, 75, 100, 150, 200, 250,
      500, 1000, 2500, 5000, 10000, 25000, 50000, 100000, 250000,
    ];
  } else {
    // High-volume sheet/card printing (Flyers, Leaflets, Business Cards, Booklets)
    candidateTiers = [
      25, 50, 75, 100, 150, 200, 250, 300, 500, 750, 1000, 1500, 2000, 2500,
      5000, 7500, 10000, 15000, 20000, 25000, 50000, 75000, 100000, 250000,
    ];
  }

  // Ensure safeMin is included
  if (!candidateTiers.includes(safeMin)) {
    candidateTiers.push(safeMin);
  }

  // Filter within [safeMin, safeMax]
  const filtered = candidateTiers.filter((q) => q >= safeMin && q <= safeMax);

  // If filtered is empty or doesn't have safeMin, ensure safeMin is present
  if (!filtered.includes(safeMin)) {
    filtered.unshift(safeMin);
  }

  // Ensure unique and sorted ascending
  return Array.from(new Set(filtered)).sort((a, b) => a - b);
}

/**
 * Generates an entire dynamic price matrix for any product and any combination of options.
 * Base price represents the cost of `minQuantity` items on Standard delivery.
 */
export function generateDynamicPriceMatrix(
  basePrice: number,
  selectedOptions: Record<string, string>,
  numberOfSets: number = 1,
  quantityTiers?: number[],
  minQuantity: number = 25,
  maxSameDayQuantity?: number
): MatrixRow[] {
  const safeMin = Math.max(1, minQuantity || 25);
  const tiers =
    quantityTiers && quantityTiers.length > 0
      ? quantityTiers
      : getProductQuantityTiers(safeMin, 250000);

  // Aggregate total option multiplier and total flat fee
  let combinedMultiplier = 1.0;
  let combinedFlatAddon = 0.0;

  for (const [field, val] of Object.entries(selectedOptions)) {
    const mod = getIndustryDefaultModifier(field, val);
    combinedMultiplier *= mod.multiplier;
    combinedFlatAddon += mod.flatAddon;
  }

  // Turnaround speed multipliers
  const SPEED_SAME_DAY = 1.354; // +35.4% (e.g. £14.69 -> £19.89 in reference)
  const SPEED_NEXT_DAY = 1.074; // +7.4% (e.g. £14.69 -> £15.77 in reference)
  const SPEED_STANDARD = 1.0;   // Base 3-4 working days

  // Reference base anchor: product price set in CMS at minQuantity on standard delivery
  const baseAnchorPrice = basePrice && basePrice > 0 ? basePrice : 14.69;

  return tiers.map((qty) => {
    // Commercial bulk economies of scale logarithmic curve:
    // P(q) = Base * (q / safeMin)^0.42
    const scalingFactor = Math.pow(qty / safeMin, 0.42);
    const rawBasePrice = baseAnchorPrice * scalingFactor;

    // Apply combined options multiplier & flat addon
    const adjustedStandard = (rawBasePrice * combinedMultiplier + combinedFlatAddon) * numberOfSets;

    // Apply delivery speeds
    const priceStandard = Number(adjustedStandard.toFixed(2));
    const priceNextDay = Number((adjustedStandard * SPEED_NEXT_DAY).toFixed(2));
    const priceSameDay = Number((adjustedStandard * SPEED_SAME_DAY).toFixed(2));

    // Strikethrough discount for marketing (shows on select tiers like 100 units)
    const isSpecialDiscountTier = qty === 100 || (safeMin < 10 && qty === 10);
    const rrpSameDay = isSpecialDiscountTier ? Number((priceSameDay * 1.11).toFixed(2)) : undefined;
    const rrpNextDay = isSpecialDiscountTier ? Number((priceNextDay * 1.11).toFixed(2)) : undefined;
    const rrpStandard = isSpecialDiscountTier ? Number((priceStandard * 1.11).toFixed(2)) : undefined;

    // Check same-day feasibility: beyond maxSameDayQuantity, same day capacity is reached
    const isSameDayFeasible =
      !maxSameDayQuantity || maxSameDayQuantity <= 0 || qty <= maxSameDayQuantity;

    return {
      quantity: qty,
      sameDay: {
        price: priceSameDay,
        rrpPrice: rrpSameDay,
        isDiscounted: isSpecialDiscountTier,
        unitPrice: Number((priceSameDay / (qty * numberOfSets)).toFixed(3)),
        isAvailable: isSameDayFeasible,
      },
      nextDay: {
        price: priceNextDay,
        rrpPrice: rrpNextDay,
        isDiscounted: isSpecialDiscountTier,
        unitPrice: Number((priceNextDay / (qty * numberOfSets)).toFixed(3)),
        isAvailable: true,
      },
      standard: {
        price: priceStandard,
        rrpPrice: rrpStandard,
        isDiscounted: isSpecialDiscountTier,
        unitPrice: Number((priceStandard / (qty * numberOfSets)).toFixed(3)),
        isAvailable: true,
      },
    };
  });
}

/**
 * Calculates custom quantity price for arbitrary numbers typed by user (e.g. 75, 420).
 */
export function calculateCustomQuantityPrice(
  customQty: number,
  basePrice: number,
  selectedOptions: Record<string, string>,
  numberOfSets: number = 1,
  minQuantity: number = 25,
  maxSameDayQuantity?: number
): { sameDay: number; nextDay: number; standard: number; isSameDayAvailable: boolean } | null {
  if (!customQty || customQty < 1 || isNaN(customQty)) return null;

  const matrix = generateDynamicPriceMatrix(
    basePrice,
    selectedOptions,
    numberOfSets,
    [customQty],
    minQuantity,
    maxSameDayQuantity
  );
  if (matrix.length === 0) return null;

  return {
    sameDay: matrix[0].sameDay.price,
    nextDay: matrix[0].nextDay.price,
    standard: matrix[0].standard.price,
    isSameDayAvailable: matrix[0].sameDay.isAvailable !== false,
  };
}
