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
 * Examples:
 *   "Double Sided (+25%)" -> multiplier 1.25
 *   "Matt Lamination (+£12.00)" -> flatAddon 12
 *   "A6 (-15%)" -> multiplier 0.85
 */
export function parseOptionModifier(optionText: string): { multiplier: number; flatAddon: number } {
  let multiplier = 1.0;
  let flatAddon = 0;

  if (!optionText) return { multiplier, flatAddon };

  // Check for percentage e.g. (+25%) or (-10%)
  const percentMatch = optionText.match(/\(([+-]?\d+(?:\.\d+)?)%\)/);
  if (percentMatch) {
    const percent = parseFloat(percentMatch[1]);
    multiplier = 1 + percent / 100;
  }

  // Check for flat fee e.g. (+£12.50)
  const flatMatch = optionText.match(/\(\+[£$](\d+(?:\.\d+)?)\)/);
  if (flatMatch) {
    flatAddon = parseFloat(flatMatch[1]);
  }

  return { multiplier, flatAddon };
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
 * Standard quantity tiers used by commercial printers.
 */
export const DEFAULT_QUANTITY_TIERS = [25, 50, 100, 200, 250, 300, 500, 1000, 2500, 5000];

/**
 * Generates an entire dynamic price matrix for any product and any combination of options.
 */
export function generateDynamicPriceMatrix(
  basePrice: number,
  selectedOptions: Record<string, string>,
  numberOfSets: number = 1,
  quantityTiers: number[] = DEFAULT_QUANTITY_TIERS
): MatrixRow[] {
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

  // Reference base anchor: standard flyer baseline at 25 units is around £14.69
  const baseAnchorPrice = Math.max(14.69, basePrice);

  return quantityTiers.map((qty) => {
    // Commercial bulk economies of scale logarithmic curve:
    // P(q) = Base * (q / 25)^0.42
    const scalingFactor = Math.pow(qty / 25, 0.42);
    const rawBasePrice = baseAnchorPrice * scalingFactor;

    // Apply combined options multiplier & flat addon
    const adjustedStandard = (rawBasePrice * combinedMultiplier + combinedFlatAddon) * numberOfSets;

    // Apply delivery speeds
    const priceStandard = Number(adjustedStandard.toFixed(2));
    const priceNextDay = Number((adjustedStandard * SPEED_NEXT_DAY).toFixed(2));
    const priceSameDay = Number((adjustedStandard * SPEED_SAME_DAY).toFixed(2));

    // Strikethrough discount for marketing (shows on select tiers like 100 units)
    const isSpecialDiscountTier = qty === 100;
    const rrpSameDay = isSpecialDiscountTier ? Number((priceSameDay * 1.11).toFixed(2)) : undefined;
    const rrpNextDay = isSpecialDiscountTier ? Number((priceNextDay * 1.11).toFixed(2)) : undefined;
    const rrpStandard = isSpecialDiscountTier ? Number((priceStandard * 1.11).toFixed(2)) : undefined;

    return {
      quantity: qty,
      sameDay: {
        price: priceSameDay,
        rrpPrice: rrpSameDay,
        isDiscounted: isSpecialDiscountTier,
        unitPrice: Number((priceSameDay / (qty * numberOfSets)).toFixed(3)),
      },
      nextDay: {
        price: priceNextDay,
        rrpPrice: rrpNextDay,
        isDiscounted: isSpecialDiscountTier,
        unitPrice: Number((priceNextDay / (qty * numberOfSets)).toFixed(3)),
      },
      standard: {
        price: priceStandard,
        rrpPrice: rrpStandard,
        isDiscounted: isSpecialDiscountTier,
        unitPrice: Number((priceStandard / (qty * numberOfSets)).toFixed(3)),
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
  numberOfSets: number = 1
): { sameDay: number; nextDay: number; standard: number } | null {
  if (!customQty || customQty < 1 || isNaN(customQty)) return null;

  const matrix = generateDynamicPriceMatrix(basePrice, selectedOptions, numberOfSets, [customQty]);
  if (matrix.length === 0) return null;

  return {
    sameDay: matrix[0].sameDay.price,
    nextDay: matrix[0].nextDay.price,
    standard: matrix[0].standard.price,
  };
}
