/**
 * Print Today UK - Dynamic Print Pricing & Specification Engine
 * Supports formula-based matrix generation, speed multipliers, option modifiers,
 * working-day due date calculation, and item/total weight estimations.
 */
import { QuantityTier } from '@/lib/types';
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
 *   "+30%", "-30%", "+ 30%", "- 30%"
 *   "(+30%)", "(-30%)", "(+ 30%)", "(- 30%)"
 *   "A4 +30%", "A4 -30%", "A4 (+30%)", "A4 (-30%)", "A4 + 30%", "A4 - 30%"
 *   "Matt Lamination +£12.00", "Matt Lamination (+£12)", "Matt Lamination +£12"
 *   "2 Sets (+100%)", "3 Sets (+200%)"
 */
export function parseOptionModifier(optionText: string): { multiplier: number; flatAddon: number; unitAddon: number } {
  let multiplier = 1.0;
  let flatAddon = 0;
  let unitAddon = 0;

  if (!optionText) return { multiplier, flatAddon, unitAddon };

  // 1. Percentage match (Parenthesized e.g. "(+30%)", "(-20%)", "(+ 30%)")
  const parenPercentMatch = optionText.match(/\(\s*([+-]?)\s*(\d+(?:\.\d+)?)\s*%\s*\)/);
  if (parenPercentMatch) {
    const sign = parenPercentMatch[1] === '-' ? -1 : 1;
    const num = parseFloat(parenPercentMatch[2]);
    if (!isNaN(num)) {
      multiplier = Math.max(0.01, 1 + (sign * num) / 100);
    }
  } else {
    // Unparenthesized e.g. "+30%", "-30%", "+ 30%", "- 30%", "A4 +30%", "A4 -30%"
    const unparenPercentMatch = optionText.match(/([+-])\s*(\d+(?:\.\d+)?)\s*%/);
    if (unparenPercentMatch) {
      const sign = unparenPercentMatch[1] === '-' ? -1 : 1;
      const num = parseFloat(unparenPercentMatch[2]);
      if (!isNaN(num)) {
        multiplier = Math.max(0.01, 1 + (sign * num) / 100);
      }
    }
  }

  // 2. Per-unit fee match (e.g. "+£9.00/ea", "+£9/unit", "(+£9.00/ea)", "+£9 each", "+£9 per unit")
  const unitMatch = optionText.match(/([+-]?)\s*[£$]\s*(\d+(?:\.\d+)?)\s*(?:\/|\s*per\s*)?(?:ea|unit|each|piece|item)/i);
  if (unitMatch) {
    const sign = unitMatch[1] === '-' ? -1 : 1;
    const num = parseFloat(unitMatch[2]);
    if (!isNaN(num)) {
      unitAddon = sign * num;
    }
  } else {
    // 3. Flat fee match (e.g. "(+£12.50)", "(+£12)", "+£12", "+ £12", "(-£5)")
    const parenFlatMatch = optionText.match(/\(\s*([+-]?)\s*[£$]\s*(\d+(?:\.\d+)?)\s*\)/);
    if (parenFlatMatch) {
      const sign = parenFlatMatch[1] === '-' ? -1 : 1;
      const num = parseFloat(parenFlatMatch[2]);
      if (!isNaN(num)) {
        flatAddon = sign * num;
      }
    } else {
      const unparenFlatMatch = optionText.match(/([+-])\s*[£$]\s*(\d+(?:\.\d+)?)/);
      if (unparenFlatMatch) {
        const sign = unparenFlatMatch[1] === '-' ? -1 : 1;
        const num = parseFloat(unparenFlatMatch[2]);
        if (!isNaN(num)) {
          flatAddon = sign * num;
        }
      }
    }
  }

  return { multiplier, flatAddon, unitAddon };
}

/**
 * Strips pricing modifiers (+30%, -30%, (+30%), +£12, +£9.00/ea, etc.) from option names
 * so the customer on the storefront NEVER sees pricing adjustment text (e.g. they see "A4" or "2000 x 1500mm").
 * The background pricing engine still uses the raw option value to compute the correct multiplier/add-on.
 */
export function cleanOptionDisplayName(optionText: string): string {
  if (!optionText) return '';
  let cleaned = optionText.trim();

  // Strip per-unit fee modifiers e.g. "(+£9.00/ea)", "+£9.00/ea", "+£9/unit", "+£9 each"
  cleaned = cleaned.replace(/\s*\(\s*[+-]?\s*[£$]\s*\d+(?:\.\d+)?\s*(?:\/|\s*per\s*)?(?:ea|unit|each|piece|item)\s*\)/gi, '');
  cleaned = cleaned.replace(/\s*[+-]?\s*[£$]\s*\d+(?:\.\d+)?\s*(?:\/|\s*per\s*)?(?:ea|unit|each|piece|item)/gi, '');

  // Strip parenthesized percentage modifiers e.g. "(+30%)", "(-30%)", "(+ 30%)", "(30%)"
  cleaned = cleaned.replace(/\s*\(\s*[+-]?\s*\d+(?:\.\d+)?\s*%\s*\)/gi, '');

  // Strip parenthesized flat fee modifiers e.g. "(+£12)", "(+£12.00)", "(+12)", "(-£5)"
  cleaned = cleaned.replace(/\s*\(\s*[+-]?\s*[£$]\s*\d+(?:\.\d+)?\s*\)/gi, '');
  cleaned = cleaned.replace(/\s*\(\s*\+\s*\d+(?:\.\d+)?\s*\)/gi, '');

  // Strip unparenthesized percentage modifiers e.g. "+30%", "-30%", "+ 30%", "- 30%"
  cleaned = cleaned.replace(/\s*[+-]\s*\d+(?:\.\d+)?\s*%/gi, '');

  // Strip unparenthesized flat fee modifiers e.g. "+£12", "+£12.00", "+ £12", "-£5"
  cleaned = cleaned.replace(/\s*[+-]\s*[£$]\s*\d+(?:\.\d+)?/gi, '');

  cleaned = cleaned.trim();

  // If the option was literally just "+30%" or "-30%" and cleaning made it blank,
  // return the original string so the dropdown option is not blank:
  if (!cleaned) {
    return optionText.trim();
  }

  return cleaned;
}

/**
 * Computes option modifiers.
 * For CMS configured custom fields, ONLY explicit modifiers (+30%, -30%, +£9.00/ea, etc.) written by the admin apply.
 * Generic fallbacks are only applied for legacy products with no CMS fields.
 */
export function getIndustryDefaultModifier(
  fieldName: string,
  optionValue: string,
  isCMSCustomField: boolean = false
): { multiplier: number; flatAddon: number; unitAddon: number } {
  // 1. Explicit modifier written in option text (+30%, -30%, +£12, +£9.00/ea) always takes precedence
  const explicit = parseOptionModifier(optionValue);
  if (explicit.multiplier !== 1 || explicit.flatAddon !== 0 || explicit.unitAddon !== 0) {
    return explicit;
  }

  // If this product uses CMS custom fields, do NOT inject hardcoded industry multipliers!
  // Options only affect price if the admin explicitly specified +X% or -X% or +£X.
  if (isCMSCustomField) {
    return { multiplier: 1.0, flatAddon: 0, unitAddon: 0 };
  }

  const f = fieldName.toLowerCase();
  const opt = optionValue.toLowerCase();

  // 2. Printed Sides (Fallback only)
  if (f.includes('side') || opt.includes('single sided') || opt.includes('double sided')) {
    if (opt.includes('double')) return { multiplier: 1.25, flatAddon: 0, unitAddon: 0 };
    return { multiplier: 1.0, flatAddon: 0, unitAddon: 0 };
  }

  // 3. Finished Size (Fallback only)
  if (f.includes('size')) {
    if (opt.includes('a6') || opt.includes('dl')) return { multiplier: 0.85, flatAddon: 0, unitAddon: 0 };
    if (opt.includes('a5')) return { multiplier: 1.0, flatAddon: 0, unitAddon: 0 };
    if (opt.includes('a4')) return { multiplier: 1.45, flatAddon: 0, unitAddon: 0 };
    if (opt.includes('a3')) return { multiplier: 1.95, flatAddon: 0, unitAddon: 0 };
  }

  // 4. Stock / Paper GSM (Fallback only)
  if (f.includes('stock') || f.includes('paper')) {
    if (opt.includes('130gsm')) return { multiplier: 0.95, flatAddon: 0, unitAddon: 0 };
    if (opt.includes('150gsm') || opt.includes('170gsm')) return { multiplier: 1.0, flatAddon: 0, unitAddon: 0 };
    if (opt.includes('250gsm') || opt.includes('300gsm')) return { multiplier: 1.18, flatAddon: 0, unitAddon: 0 };
    if (opt.includes('350gsm') || opt.includes('400gsm') || opt.includes('450gsm')) {
      return { multiplier: 1.35, flatAddon: 0, unitAddon: 0 };
    }
  }

  // 5. Lamination (Fallback only)
  if (f.includes('lamination') || f.includes('finish')) {
    if (opt.includes('no lamination') || opt.includes('none') || opt.includes('uncoated')) {
      return { multiplier: 1.0, flatAddon: 0, unitAddon: 0 };
    }
    if (opt.includes('matt') || opt.includes('gloss')) return { multiplier: 1.15, flatAddon: 12.0, unitAddon: 0 };
    if (opt.includes('soft touch') || opt.includes('velvet')) return { multiplier: 1.22, flatAddon: 16.0, unitAddon: 0 };
  }

  // 6. Embellishment (Fallback only)
  if (f.includes('embellish') || f.includes('foil') || f.includes('spot uv')) {
    if (opt.includes('no embellish') || opt.includes('none')) return { multiplier: 1.0, flatAddon: 0, unitAddon: 0 };
    if (opt.includes('foil') || opt.includes('spot uv')) return { multiplier: 1.25, flatAddon: 24.0, unitAddon: 0 };
  }

  return { multiplier: 1.0, flatAddon: 0, unitAddon: 0 };
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

  // Ensure safeMin and safeMax are candidates
  if (!candidateTiers.includes(safeMin)) {
    candidateTiers.push(safeMin);
  }
  if (!candidateTiers.includes(safeMax)) {
    candidateTiers.push(safeMax);
  }

  // Filter within [safeMin, safeMax]
  const filtered = candidateTiers.filter((q) => q >= safeMin && q <= safeMax);

  // If filtered is empty or doesn't have safeMin, ensure safeMin is present
  if (!filtered.includes(safeMin)) {
    filtered.unshift(safeMin);
  }
  // Ensure safeMax is explicitly included as the ceiling
  if (!filtered.includes(safeMax)) {
    filtered.push(safeMax);
  }

  // Ensure unique and sorted ascending
  return Array.from(new Set(filtered)).sort((a, b) => a - b);
}

/**
 * Computes base price for any given quantity based on explicit merchant-configured Quantity Tiers
 * or falls back to commercial bulk economies of scale logarithmic curve.
 */
export function getTierBasePrice(
  qty: number,
  tiers: QuantityTier[] | undefined,
  fallbackBasePrice: number,
  safeMin: number = 25
): number {
  if (!tiers || tiers.length === 0) {
    const scalingFactor = Math.pow(qty / safeMin, 0.42);
    return fallbackBasePrice * scalingFactor;
  }

  // Base tier is index 0
  const baseTier = tiers[0];
  const anchorPrice =
    typeof baseTier.price === 'number' && !isNaN(baseTier.price) && baseTier.price > 0
      ? baseTier.price
      : typeof baseTier.price === 'string' && parseFloat(baseTier.price) > 0
      ? parseFloat(baseTier.price)
      : fallbackBasePrice;

  // Helper to compute exact standard price for a configured tier
  const getExactTierPrice = (t: QuantityTier, index: number): number => {
    if (index === 0) return anchorPrice;
    const pct =
      typeof t.percentIncrease === 'number'
        ? t.percentIncrease
        : typeof t.percentIncrease === 'string'
        ? parseFloat(t.percentIncrease)
        : NaN;
    if (!isNaN(pct)) {
      return anchorPrice * (1 + pct / 100);
    }
    const fixedPrice =
      typeof t.price === 'number'
        ? t.price
        : typeof t.price === 'string'
        ? parseFloat(t.price)
        : NaN;
    if (!isNaN(fixedPrice) && fixedPrice > 0) {
      return fixedPrice;
    }
    // Proportional fallback
    const q = Number(t.quantity);
    const baseQ = Number(baseTier.quantity) || 1;
    return anchorPrice * Math.pow(q / baseQ, 0.42);
  };

  const numericQty = Number(qty);

  // 1. Exact match with a configured tier (type-safe comparison)
  const matchIdx = tiers.findIndex((t) => Number(t.quantity) === numericQty);
  if (matchIdx !== -1) {
    return getExactTierPrice(tiers[matchIdx], matchIdx);
  }

  // 2. Below first tier: pro-rate from first tier unit price
  const firstQty = Number(tiers[0].quantity) || safeMin;
  if (numericQty < firstQty) {
    const firstPrice = getExactTierPrice(tiers[0], 0);
    const unitPrice = firstPrice / Math.max(1, firstQty);
    return Math.max(1, unitPrice * numericQty);
  }

  // 3. Above last tier: pro-rate from last tier unit price
  const lastIdx = tiers.length - 1;
  const lastTier = tiers[lastIdx];
  const lastQty = Number(lastTier.quantity);
  if (numericQty > lastQty) {
    const lastPrice = getExactTierPrice(lastTier, lastIdx);
    const unitPrice = lastPrice / Math.max(1, lastQty);
    return unitPrice * numericQty;
  }

  // 4. In-between two tiers: interpolate linearly
  for (let i = 0; i < tiers.length - 1; i++) {
    const tLower = tiers[i];
    const tUpper = tiers[i + 1];
    const qLower = Number(tLower.quantity);
    const qUpper = Number(tUpper.quantity);
    if (numericQty >= qLower && numericQty <= qUpper) {
      const pLower = getExactTierPrice(tLower, i);
      const pUpper = getExactTierPrice(tUpper, i + 1);
      const span = qUpper - qLower;
      if (span <= 0) return pLower;
      const ratio = (numericQty - qLower) / span;
      return pLower + (pUpper - pLower) * ratio;
    }
  }

  return anchorPrice;
}

function normalizeToken(token: string): string {
  const t = String(token || '').toLowerCase().trim();
  if (t === 'dsp' || t === 'ds' || t === 'double') return 'double sided';
  if (t === 'ssp' || t === 'ss' || t === 'single') return 'single sided';
  return t;
}

/**
 * Resolves the most specific matching quantity tier table from variantQuantityTiers.
 * Supports both single keys (e.g. "A6", "170gsm") and compound multi-attribute keys
 * (e.g. "A6 - 170gsm - DSP", "A5 | 250gsm | Double Sided").
 */
export function resolveActiveVariantTiers(
  selectedOptions: Record<string, string>,
  variantQuantityTiers?: Record<string, QuantityTier[]>,
  defaultTiers?: QuantityTier[]
): QuantityTier[] | undefined {
  if (!variantQuantityTiers || Object.keys(variantQuantityTiers).length === 0) {
    return defaultTiers;
  }

  // Pre-process customer selections into normalized search tokens
  const customerTokens: string[] = [];
  for (const [field, val] of Object.entries(selectedOptions)) {
    const cleanVal = cleanOptionDisplayName(val).toLowerCase().trim();
    customerTokens.push(cleanVal);
    customerTokens.push(`${field}: ${cleanVal}`.toLowerCase().trim());
    if (cleanVal.includes('double')) customerTokens.push('dsp', 'double sided');
    if (cleanVal.includes('single')) customerTokens.push('ssp', 'single sided');

    const parts = cleanVal.split(/[\s,()/-]+/).filter(Boolean);
    for (const p of parts) {
      customerTokens.push(p);
    }
  }

  let bestMatchedTiers = defaultTiers;
  let highestScore = 0;

  for (const [variantKey, vTiers] of Object.entries(variantQuantityTiers)) {
    if (!vTiers || vTiers.length === 0) continue;

    const cleanK = cleanOptionDisplayName(variantKey).toLowerCase().trim();
    const rawK = variantKey.toLowerCase().trim();

    // Split compound key by delimiters: ' - ', ' | ', '/', ','
    const keyParts = variantKey
      .split(/\s*[-|/,]\s*/)
      .map((k) => k.trim())
      .filter(Boolean);

    if (keyParts.length > 1) {
      // Compound key: ALL parts must match a selection
      let allPartsMatch = true;
      let matchScore = 0;

      for (const part of keyParts) {
        const cleanPart = cleanOptionDisplayName(part).toLowerCase().trim();
        const normPart = normalizeToken(cleanPart);

        const matched = customerTokens.some((ct) => {
          const normCt = normalizeToken(ct);
          return normCt === normPart || normCt.includes(normPart) || normPart.includes(normCt);
        });

        if (matched) {
          matchScore += 1;
        } else {
          allPartsMatch = false;
          break;
        }
      }

      if (allPartsMatch && matchScore > highestScore) {
        highestScore = matchScore;
        bestMatchedTiers = vTiers;
      }
    } else {
      // Single key (e.g. "A6" or "170gsm")
      const matched = customerTokens.some((ct) => {
        const normCt = normalizeToken(ct);
        const normK = normalizeToken(cleanK);
        return (
          rawK === ct ||
          cleanK === ct ||
          normK === normCt ||
          (normK.length >= 2 && (normCt.includes(normK) || normK.includes(normCt)))
        );
      });

      if (matched && highestScore === 0) {
        highestScore = 1;
        bestMatchedTiers = vTiers;
      }
    }
  }

  return bestMatchedTiers;
}

/**
 * Generates an entire dynamic price matrix for any product and any combination of options.
 * Base price represents the cost of `minQuantity` items on Standard delivery.
 * When `productQuantityTiers` are defined, uses explicit merchant tiers and Base Price + % logic.
 */
export function generateDynamicPriceMatrix(
  basePrice: number,
  selectedOptions: Record<string, string>,
  numberOfSets: number = 1,
  quantityTiers?: number[],
  minQuantity: number = 25,
  maxSameDayQuantity?: number,
  isCMSCustomFieldProduct: boolean = false,
  maxQuantity?: number,
  maxNextDayQuantity?: number,
  sameDayIncreasePercent?: number,
  nextDayIncreasePercent?: number,
  productQuantityTiers?: QuantityTier[],
  variantQuantityTiers?: Record<string, QuantityTier[]>
): MatrixRow[] {
  const safeMin = Math.max(1, minQuantity || 25);
  const safeMax = maxQuantity && maxQuantity >= safeMin ? maxQuantity : 250000;

  // Approach B: Resolve active variant-specific quantity tiers (supports compound keys like A6-170gsm-DSP)
  const activeProductTiers = resolveActiveVariantTiers(
    selectedOptions,
    variantQuantityTiers,
    productQuantityTiers
  );

  // Determine tiers:
  // 1. If explicit quantityTiers array passed (e.g. custom quantity single-element array [customQty]), use that.
  // 2. Otherwise if active configured quantityTiers exist, use those quantities!
  // 3. Otherwise generate candidate tiers based on safeMin and safeMax.
  const tiers =
    quantityTiers && quantityTiers.length > 0
      ? quantityTiers
      : activeProductTiers && activeProductTiers.length > 0
      ? activeProductTiers.map((t) => Number(t.quantity))
      : getProductQuantityTiers(safeMin, safeMax);

  // Turnaround speed multipliers
  // Configured via CMS product fields with industry standard fallbacks
  const sameDayPct =
    typeof sameDayIncreasePercent === 'number' && !isNaN(sameDayIncreasePercent)
      ? sameDayIncreasePercent
      : 35.4;
  const SPEED_SAME_DAY = 1.0 + sameDayPct / 100;

  const nextDayPct =
    typeof nextDayIncreasePercent === 'number' && !isNaN(nextDayIncreasePercent)
      ? nextDayIncreasePercent
      : 7.4;
  const SPEED_NEXT_DAY = 1.0 + nextDayPct / 100;

  // Reference base anchor: product price set in CMS at minQuantity on standard delivery
  const baseAnchorPrice =
    activeProductTiers && activeProductTiers.length > 0 && typeof activeProductTiers[0].price === 'number' && activeProductTiers[0].price > 0
      ? activeProductTiers[0].price
      : basePrice && basePrice > 0
      ? basePrice
      : 14.69;

  // Aggregate total option percentage delta, total flat fee, and total per-unit fee (Approach A)
  let totalPercentDelta = 0.0;
  let combinedFlatAddon = 0.0;
  let combinedUnitAddon = 0.0;

  // If the product uses explicit merchant quantity tiers or CMS custom fields, do not inject hardcoded fallback modifiers
  const hasExplicitTiers = Boolean(activeProductTiers && activeProductTiers.length > 0);
  const skipHardcodedDefaults = isCMSCustomFieldProduct || hasExplicitTiers;

  for (const [field, val] of Object.entries(selectedOptions)) {
    // If the field is "Number of Sets", sets are multiplied separately via numberOfSets parameter
    const isSetField =
      /\bsets?\b/i.test(field) &&
      !field.toLowerCase().includes('cassette') &&
      !field.toLowerCase().includes('offset');
    if (isSetField) {
      continue;
    }
    const mod = getIndustryDefaultModifier(field, val, skipHardcodedDefaults);
    totalPercentDelta += (mod.multiplier - 1.0);
    combinedFlatAddon += mod.flatAddon;
    combinedUnitAddon += mod.unitAddon;
  }

  // Additive combined multiplier: Base (1.0) + sum of all option percentage deltas
  const combinedMultiplier = Math.max(0.05, 1.0 + totalPercentDelta);

  return tiers.map((qty) => {
    // Compute raw standard tier price (either through explicit merchant tiers or scaling curve)
    const rawBasePrice = getTierBasePrice(qty, activeProductTiers, baseAnchorPrice, safeMin);

    // Apply combined options multiplier, flat addon, and per-unit addon (Approach A)
    const adjustedStandard =
      (rawBasePrice * combinedMultiplier + combinedFlatAddon + combinedUnitAddon * qty) * numberOfSets;

    // Apply delivery speeds
    const priceStandard = Number(adjustedStandard.toFixed(2));
    const priceNextDay = Number((adjustedStandard * SPEED_NEXT_DAY).toFixed(2));
    const priceSameDay = Number((adjustedStandard * SPEED_SAME_DAY).toFixed(2));

    // Check same-day feasibility: if cutoff limit is specified (including 0), qty must be <= maxSameDayQuantity
    const isSameDayFeasible =
      typeof maxSameDayQuantity === 'number'
        ? qty <= maxSameDayQuantity
        : true;

    // Check 1-day feasibility: if cutoff limit is specified (including 0), qty must be <= maxNextDayQuantity
    const isNextDayFeasible =
      typeof maxNextDayQuantity === 'number'
        ? qty <= maxNextDayQuantity
        : true;

    return {
      quantity: qty,
      sameDay: {
        price: priceSameDay,
        isDiscounted: false,
        unitPrice: Number((priceSameDay / (qty * numberOfSets)).toFixed(3)),
        isAvailable: isSameDayFeasible,
      },
      nextDay: {
        price: priceNextDay,
        isDiscounted: false,
        unitPrice: Number((priceNextDay / (qty * numberOfSets)).toFixed(3)),
        isAvailable: isNextDayFeasible,
      },
      standard: {
        price: priceStandard,
        isDiscounted: false,
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
  maxSameDayQuantity?: number,
  isCMSCustomFieldProduct: boolean = false,
  maxQuantity?: number,
  maxNextDayQuantity?: number,
  sameDayIncreasePercent?: number,
  nextDayIncreasePercent?: number,
  productQuantityTiers?: QuantityTier[],
  variantQuantityTiers?: Record<string, QuantityTier[]>
): {
  sameDay: number;
  nextDay: number;
  standard: number;
  isSameDayAvailable: boolean;
  isNextDayAvailable: boolean;
} | null {
  if (!customQty || customQty < 1 || isNaN(customQty)) return null;

  const matrix = generateDynamicPriceMatrix(
    basePrice,
    selectedOptions,
    numberOfSets,
    [customQty],
    minQuantity,
    maxSameDayQuantity,
    isCMSCustomFieldProduct,
    maxQuantity,
    maxNextDayQuantity,
    sameDayIncreasePercent,
    nextDayIncreasePercent,
    productQuantityTiers,
    variantQuantityTiers
  );
  if (matrix.length === 0) return null;

  return {
    sameDay: matrix[0].sameDay.price,
    nextDay: matrix[0].nextDay.price,
    standard: matrix[0].standard.price,
    isSameDayAvailable: matrix[0].sameDay.isAvailable !== false,
    isNextDayAvailable: matrix[0].nextDay.isAvailable !== false,
  };
}
