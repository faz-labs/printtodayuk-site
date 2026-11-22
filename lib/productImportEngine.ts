/**
 * Print Today UK - Product Import, Validation, Repricing & Price Matrix Engine
 * Fulfills CMS Process 1 (Bulk Product Import), Process 2 (Price Matrix), and Process 6 (Pricing Rules).
 */

import {
  Product,
  QuantityTier,
  CustomField,
  PriceMatrixConfig,
  ProductImportValidationReport,
  ProductImportResult,
} from './types';
import { cleanOptionDisplayName } from './pricingEngine';

/**
 * Validates a list of products before importing.
 * Produces a clear, readable validation report highlighting exact errors per product.
 */
export function validateProductImport(
  products: any[],
  existingSlugs: Set<string> = new Set()
): ProductImportValidationReport {
  const errors: ProductImportValidationReport['errors'] = [];
  const warnings: ProductImportValidationReport['warnings'] = [];

  if (!Array.isArray(products) || products.length === 0) {
    return {
      valid: false,
      totalProducts: 0,
      validCount: 0,
      invalidCount: 0,
      errors: [{ productIndex: -1, errors: ['File contains no valid product records or is not a JSON array.'] }],
      warnings: [],
    };
  }

  const batchSlugs = new Set<string>();

  products.forEach((rawProd, idx) => {
    const prodErrors: string[] = [];
    const prodWarnings: string[] = [];

    if (!rawProd || typeof rawProd !== 'object') {
      errors.push({ productIndex: idx, errors: ['Item is not a valid JSON object.'] });
      return;
    }

    const title = typeof rawProd.title === 'string' ? rawProd.title.trim() : '';
    const slug = typeof rawProd.slug === 'string' ? rawProd.slug.trim().toLowerCase() : '';
    const category = typeof rawProd.category === 'string' ? rawProd.category.trim() : '';

    // 1. Required Fields
    if (!title) {
      prodErrors.push('Missing required field: "title".');
    }
    if (!slug) {
      prodErrors.push('Missing required field: "slug".');
    } else {
      // Slug uniqueness in file
      if (batchSlugs.has(slug)) {
        prodErrors.push(`Duplicate slug "${slug}" found multiple times in the import file.`);
      }
      batchSlugs.add(slug);

      // Warning if slug already exists in database (will update/replace)
      if (existingSlugs.has(slug)) {
        prodWarnings.push(`Slug "${slug}" already exists in the catalog; this import will update it.`);
      }
    }

    if (!category) {
      prodErrors.push('Missing required field: "category".');
    }

    // Auto-parse JSON strings for structured fields if passed as strings
    if (typeof rawProd.customFields === 'string') {
      try { rawProd.customFields = JSON.parse(rawProd.customFields); } catch {}
    }
    if (typeof rawProd.features === 'string') {
      try { rawProd.features = JSON.parse(rawProd.features); } catch {}
    }
    if (typeof rawProd.priceMatrix === 'string') {
      try { rawProd.priceMatrix = JSON.parse(rawProd.priceMatrix); } catch {}
    }

    // 2. Base Price validation & Auto-Derivation
    let basePrice = Number(rawProd.price);

    // Auto-derive only if price was omitted
    if (rawProd.price === undefined || rawProd.price === null || rawProd.price === '') {
      const qTiers = parseTiers(rawProd.quantityTiers);
      if (Array.isArray(qTiers) && qTiers.length > 0 && typeof qTiers[0]?.price === 'number' && qTiers[0].price > 0) {
        basePrice = qTiers[0].price;
        rawProd.price = basePrice;
      } else if (rawProd.priceMatrix?.cells) {
        const cellValues = Object.values(rawProd.priceMatrix.cells).filter((v): v is number => typeof v === 'number' && v > 0);
        if (cellValues.length > 0) {
          basePrice = Math.min(...cellValues);
          rawProd.price = basePrice;
        }
      } else if (existingSlugs.has(slug)) {
        // In merge update mode for existing product, missing price is allowed (retains existing product price)
        basePrice = 1;
      }
    }

    if (isNaN(basePrice) || basePrice <= 0) {
      prodErrors.push(`Invalid price "${rawProd.price}". Price must be a positive numeric value.`);
    }

    // 3. Image URL reachability / format check
    if (rawProd.imageUrl) {
      if (typeof rawProd.imageUrl !== 'string' || !isValidUrlString(rawProd.imageUrl)) {
        prodErrors.push(`Invalid image URL format: "${rawProd.imageUrl}". Must be http:// or https:// or valid path.`);
      }
    }

    // 4. Base Quantity Tiers validation & normalization
    if (rawProd.quantityTiers !== undefined) {
      const qTiers = parseTiers(rawProd.quantityTiers);
      if (!Array.isArray(qTiers)) {
        prodErrors.push('Invalid "quantityTiers". Must be a valid JSON array of quantity tiers or JSON string.');
      } else {
        // Normalise rawProd.quantityTiers to array so it is never saved as string
        rawProd.quantityTiers = qTiers;
        if (qTiers.length > 0) {
          validateTierList(qTiers, 'Base quantityTiers', prodErrors);
        }
      }
    }

    // 5. Custom Fields validation
    const availableOptions = new Set<string>();
    if (Array.isArray(rawProd.customFields)) {
      rawProd.customFields.forEach((cf: any, cfIdx: number) => {
        if (!cf || typeof cf !== 'object' || !cf.name) {
          prodErrors.push(`customFields[${cfIdx}] is missing a valid "name".`);
        }
        if (!Array.isArray(cf.options) || cf.options.length === 0) {
          prodErrors.push(`customFields[${cfIdx}] ("${cf.name || ''}") has no options defined.`);
        } else {
          cf.options.forEach((opt: any) => {
            if (typeof opt === 'string' && opt.trim()) {
              availableOptions.add(cleanOptionDisplayName(opt).trim().toLowerCase());
            }
          });
        }
      });
    }

    // 6. Variant Quantity Tiers validation & normalization
    if (rawProd.variantQuantityTiers) {
      if (typeof rawProd.variantQuantityTiers === 'string') {
        try { rawProd.variantQuantityTiers = JSON.parse(rawProd.variantQuantityTiers); } catch {}
      }
      if (typeof rawProd.variantQuantityTiers !== 'object' || Array.isArray(rawProd.variantQuantityTiers)) {
        prodErrors.push('"variantQuantityTiers" must be an object with variant keys as properties.');
      } else {
        for (const [varKey, tiers] of Object.entries(rawProd.variantQuantityTiers)) {
          const parsedV = parseTiers(tiers);
          if (!Array.isArray(parsedV) || parsedV.length === 0) {
            prodErrors.push(`Variant table "${varKey}" contains empty or invalid quantity tiers.`);
          } else {
            rawProd.variantQuantityTiers[varKey] = parsedV;
            validateTierList(parsedV, `Variant "${varKey}"`, prodErrors);
          }

          // Check if variant key contains only options that exist in customFields (if customFields defined)
          if (availableOptions.size > 0 && varKey !== 'default') {
            const keyParts = varKey
              .split(/\s*[-–—/|,]\s*/)
              .map((p) => cleanOptionDisplayName(p).trim().toLowerCase())
              .filter(Boolean);

            const hasAnyMatchingOption = keyParts.some((p) => availableOptions.has(p));
            if (!hasAnyMatchingOption) {
              prodWarnings.push(
                `Variant key "${varKey}" does not match any dropdown option declared in customFields.`
              );
            }
          }
        }
      }
    }

    // 7. Price Matrix validation (Process 2)
    if (rawProd.priceMatrix) {
      validatePriceMatrix(rawProd.priceMatrix, prodErrors);
    }

    if (prodErrors.length > 0) {
      errors.push({ productIndex: idx, slug, title, errors: prodErrors });
    }
    if (prodWarnings.length > 0) {
      warnings.push({ productIndex: idx, slug, warnings: prodWarnings });
    }
  });

  const validCount = products.length - errors.length;

  return {
    valid: errors.length === 0,
    totalProducts: products.length,
    validCount,
    invalidCount: errors.length,
    errors,
    warnings,
  };
}

/**
 * Validates a list of QuantityTiers for ascending quantities and numeric prices.
 */
function validateTierList(tiers: QuantityTier[], contextName: string, errors: string[]) {
  let prevQty = 0;
  tiers.forEach((tier, tIdx) => {
    const qty = Number(tier.quantity);
    if (isNaN(qty) || qty <= 0) {
      errors.push(`${contextName} tier at index ${tIdx} has invalid quantity (${tier.quantity}).`);
    } else if (qty <= prevQty) {
      errors.push(
        `${contextName} tier quantities must be in strictly ascending order: ${qty} is not greater than ${prevQty}.`
      );
    }
    prevQty = qty;

    if (tIdx === 0 && (tier.price === undefined || isNaN(Number(tier.price)) || Number(tier.price) <= 0)) {
      errors.push(`${contextName} tier 0 must have an explicit base price > 0.`);
    }
  });
}

/**
 * Validates a PriceMatrixConfig structure.
 */
function validatePriceMatrix(matrix: any, errors: string[]) {
  if (!matrix || typeof matrix !== 'object') {
    errors.push('priceMatrix must be an object.');
    return;
  }
  if (!Array.isArray(matrix.columns) || matrix.columns.length === 0) {
    errors.push('priceMatrix must have a non-empty array of "columns".');
  }
  if (!Array.isArray(matrix.quantities) || matrix.quantities.length === 0) {
    errors.push('priceMatrix must have a non-empty array of "quantities".');
  } else {
    let prev = 0;
    for (const q of matrix.quantities) {
      const n = Number(q);
      if (isNaN(n) || n <= 0 || n <= prev) {
        errors.push(`priceMatrix quantities must be strictly ascending positive numbers: ${q} is not > ${prev}.`);
        break;
      }
      prev = n;
    }
  }
  if (!matrix.cells || typeof matrix.cells !== 'object') {
    errors.push('priceMatrix must have a "cells" dictionary mapping cell coordinates to prices.');
  }
}

/**
 * Safely parses tiers if passed as a JSON string or returns the array.
 */
function parseTiers(val: any): QuantityTier[] | null {
  if (Array.isArray(val)) return val;
  if (typeof val === 'string') {
    try {
      const parsed = JSON.parse(val);
      if (Array.isArray(parsed)) return parsed;
    } catch {}
  }
  return null;
}

function isValidUrlString(url: string): boolean {
  if (!url) return false;
  if (url.startsWith('/') || url.startsWith('http://') || url.startsWith('https://')) {
    return true;
  }
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

/**
 * Parses raw JSON or CSV text into an array of product objects.
 */
export function parseImportContent(content: string, format?: 'json' | 'csv'): any[] {
  const trimmed = content.trim();
  if (!trimmed) return [];

  const isJson = format === 'json' || (!format && (trimmed.startsWith('[') || trimmed.startsWith('{')));
  if (isJson) {
    const parsed = JSON.parse(trimmed);
    return Array.isArray(parsed) ? parsed : [parsed];
  }

  // Basic CSV parser
  return parseCsvProducts(trimmed);
}

/**
 * Simple CSV to Product list converter
 */
function parseCsvProducts(csvText: string): any[] {
  const lines = csvText.split(/\r?\n/).filter((l) => l.trim().length > 0);
  if (lines.length < 2) return [];

  const headers = lines[0].split(',').map((h) => h.trim().replace(/^["']|["']$/g, ''));
  const products: any[] = [];

  for (let i = 1; i < lines.length; i++) {
    const rawCols = lines[i].split(',').map((c) => c.trim().replace(/^["']|["']$/g, ''));
    const item: Record<string, any> = {};

    headers.forEach((h, colIdx) => {
      item[h] = rawCols[colIdx] !== undefined ? rawCols[colIdx] : '';
    });

    if (item.title || item.slug) {
      if (item.price) item.price = Number(item.price) || 0;
      if (item.minQuantity) item.minQuantity = Number(item.minQuantity) || 1;
      if (item.maxQuantity) item.maxQuantity = Number(item.maxQuantity) || 250000;
      if (item.isActive !== undefined) {
        item.isActive = item.isActive === true || item.isActive === 'true' || item.isActive === '1';
      }
      products.push(item);
    }
  }

  return products;
}

/**
 * Process 6: Pricing rules support.
 * Multiplies all pricing tables (base price, quantityTiers, variantQuantityTiers, and priceMatrix)
 * by a factor (e.g. 1.3 for +30% markup), rounding up to 2 decimal places.
 */
export function repriceProductData(
  product: Product,
  multiplier: number,
  floorPrice?: number
): Product {
  const factor = typeof multiplier === 'number' && multiplier > 0 ? multiplier : 1.0;

  // Round up to 2 decimals (e.g. 10.451 -> 10.46)
  const roundUp = (val: number): number => {
    const scaled = Math.ceil(Number(val.toFixed(4)) * 100) / 100;
    return floorPrice !== undefined ? Math.max(floorPrice, scaled) : scaled;
  };

  const repriced: Product = {
    ...product,
    priceMultiplier: factor,
    sourcePrice: product.sourcePrice || product.price,
    price: roundUp(product.price * factor),
    updatedAt: Date.now(),
  };

  if (product.discountedPrice) {
    repriced.discountedPrice = roundUp(product.discountedPrice * factor);
  }

  // Reprice Base Quantity Tiers
  if (Array.isArray(product.quantityTiers)) {
    repriced.quantityTiers = product.quantityTiers.map((t, idx) => {
      if (idx === 0 && t.price !== undefined) {
        return { ...t, price: roundUp(t.price * factor) };
      }
      // If explicit price exists on tier
      if (t.price !== undefined) {
        return { ...t, price: roundUp(t.price * factor) };
      }
      return { ...t };
    });
  }

  // Reprice Variant Quantity Tiers
  if (product.variantQuantityTiers) {
    const repricedVariants: Record<string, QuantityTier[]> = {};
    for (const [key, tiers] of Object.entries(product.variantQuantityTiers)) {
      if (Array.isArray(tiers)) {
        repricedVariants[key] = tiers.map((t, idx) => {
          if (idx === 0 && t.price !== undefined) {
            return { ...t, price: roundUp(t.price * factor) };
          }
          if (t.price !== undefined) {
            return { ...t, price: roundUp(t.price * factor) };
          }
          return { ...t };
        });
      }
    }
    repriced.variantQuantityTiers = repricedVariants;
  }

  // Reprice Price Matrix
  if (product.priceMatrix && product.priceMatrix.cells) {
    const repricedCells: Record<string, number> = {};
    for (const [coord, cellPrice] of Object.entries(product.priceMatrix.cells)) {
      repricedCells[coord] = roundUp(Number(cellPrice) * factor);
    }
    repriced.priceMatrix = {
      ...product.priceMatrix,
      cells: repricedCells,
    };
  }

  return repriced;
}

/**
 * Process 5: "Generate tables from selected dropdowns"
 * Creates Cartesian product of options across the chosen custom fields.
 * Populates each combination with a copy of baseTiers.
 */
export function generateAllVariantCombinations(
  fields: CustomField[],
  selectedFieldIds?: string[],
  baseTiers: QuantityTier[] = [
    { quantity: 25, price: 45.0 },
    { quantity: 50, percentIncrease: 40 },
    { quantity: 100, percentIncrease: 80 },
    { quantity: 250, percentIncrease: 150 },
    { quantity: 500, percentIncrease: 250 },
  ]
): Record<string, QuantityTier[]> {
  const targetFields = fields.filter((f) =>
    selectedFieldIds && selectedFieldIds.length > 0 ? selectedFieldIds.includes(f.id) : true
  );

  if (targetFields.length === 0) {
    return { default: JSON.parse(JSON.stringify(baseTiers)) };
  }

  // Cartesian product
  let combinations: string[][] = [[]];

  for (const field of targetFields) {
    const nextCombos: string[][] = [];
    const cleanOpts = field.options.map((opt) => cleanOptionDisplayName(opt).trim()).filter(Boolean);

    for (const prefix of combinations) {
      for (const opt of cleanOpts) {
        nextCombos.push([...prefix, opt]);
      }
    }
    combinations = nextCombos;
  }

  const result: Record<string, QuantityTier[]> = {};
  for (const combo of combinations) {
    const key = combo.join(' - ');
    result[key] = JSON.parse(JSON.stringify(baseTiers));
  }

  return result;
}

/**
 * Export a PriceMatrixConfig to CSV format
 */
export function exportPriceMatrixToCSV(matrix: PriceMatrixConfig): string {
  const header = ['Quantity', ...matrix.columns].join(',');
  const rows = matrix.quantities.map((qty) => {
    const cellVals = matrix.columns.map((col) => {
      const key = `${qty}__${col}`;
      return matrix.cells[key] !== undefined ? matrix.cells[key].toFixed(2) : '';
    });
    return [qty, ...cellVals].join(',');
  });
  return [header, ...rows].join('\n');
}

/**
 * Import a PriceMatrixConfig from CSV text
 */
export function importPriceMatrixFromCSV(
  csvText: string,
  primaryFieldId: string,
  secondaryFieldId?: string
): PriceMatrixConfig {
  const lines = csvText.split(/\r?\n/).filter((l) => l.trim().length > 0);
  if (lines.length < 2) {
    throw new Error('CSV must have a header row and at least one quantity row.');
  }

  const headerCols = lines[0].split(',').map((c) => c.trim().replace(/^["']|["']$/g, ''));
  const columns = headerCols.slice(1);
  const quantities: number[] = [];
  const cells: Record<string, number> = {};

  for (let i = 1; i < lines.length; i++) {
    const parts = lines[i].split(',').map((c) => c.trim().replace(/^["']|["']$/g, ''));
    const qty = parseInt(parts[0], 10);
    if (!isNaN(qty) && qty > 0) {
      quantities.push(qty);
      columns.forEach((col, cIdx) => {
        const valStr = parts[cIdx + 1];
        if (valStr !== undefined && valStr !== '') {
          const price = parseFloat(valStr);
          if (!isNaN(price)) {
            cells[`${qty}__${col}`] = price;
          }
        }
      });
    }
  }

  // Sort quantities ascending
  quantities.sort((a, b) => a - b);

  return {
    primaryFieldId,
    secondaryFieldId,
    columns,
    quantities,
    cells,
  };
}
