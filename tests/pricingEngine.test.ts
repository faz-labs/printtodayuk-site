import { test, describe } from 'node:test';
import assert from 'node:assert';
import {
  resolveActiveVariantTiers,
  generateDynamicPriceMatrix,
  cleanOptionDisplayName,
  parseOptionModifier,
  getWorkingDueDates,
} from '../lib/pricingEngine';
import { QuantityTier, CustomField } from '../lib/types';

describe('Pricing Engine: Core & Variant Matching', () => {
  const catalogueCustomFields: CustomField[] = [
    {
      id: 'cf-1',
      name: 'Finished Size',
      required: true,
      options: ['A4'],
    },
    {
      id: 'cf-2',
      name: 'Cover Stock',
      required: true,
      options: ['250gsm Silk'],
    },
    {
      id: 'cf-3',
      name: 'Inner Stock',
      required: true,
      options: ['150gsm Silk'],
    },
    {
      id: 'cf-4',
      name: 'Lamination',
      required: true,
      options: [
        'No Lamination',
        'Matt Lamination Cover',
        'Gloss Lamination Cover',
        'Soft Touch Lamination Cover',
      ],
    },
    {
      id: 'cf-5',
      name: 'Printed Sides',
      required: true,
      options: ['Double Sided'],
    },
  ];

  const defaultTiers: QuantityTier[] = [
    { quantity: 25, price: 41.32 },
    { quantity: 50, price: 61.2 },
    { quantity: 100, price: 95.4 },
  ];

  const variantTiers: Record<string, QuantityTier[]> = {
    'A4 - 250gsm Silk - 150gsm Silk - Matt Lamination Cover - Double Sided': [
      { quantity: 25, price: 48.58 },
      { quantity: 50, price: 72.1 },
    ],
    'A4 - 250gsm Silk - 150gsm Silk - Soft Touch Lamination Cover - Double Sided': [
      { quantity: 25, price: 47.29 },
      { quantity: 50, price: 70.3 },
    ],
    'A4 - 250gsm Silk - 150gsm Silk - Gloss Lamination Cover - Double Sided': [
      { quantity: 25, price: 48.35 },
      { quantity: 50, price: 71.8 },
    ],
  };

  test('1. Default selection ("No Lamination") strictly resolves to default tiers (£41.32)', () => {
    const sel = {
      'Finished Size': 'A4',
      'Cover Stock': '250gsm Silk',
      'Inner Stock': '150gsm Silk',
      Lamination: 'No Lamination',
      'Printed Sides': 'Double Sided',
    };

    const resolved = resolveActiveVariantTiers(
      sel,
      variantTiers,
      defaultTiers,
      catalogueCustomFields
    );

    assert.ok(resolved, 'Tiers must not be null/undefined');
    assert.strictEqual(resolved[0].price, 41.32, 'Must resolve to base £41.32');
  });

  test('2. "Soft Touch Lamination Cover" resolves to soft touch tier (£47.29)', () => {
    const sel = {
      'Finished Size': 'A4',
      'Cover Stock': '250gsm Silk',
      'Inner Stock': '150gsm Silk',
      Lamination: 'Soft Touch Lamination Cover',
      'Printed Sides': 'Double Sided',
    };

    const resolved = resolveActiveVariantTiers(
      sel,
      variantTiers,
      defaultTiers,
      catalogueCustomFields
    );

    assert.ok(resolved);
    assert.strictEqual(resolved[0].price, 47.29, 'Must resolve to Soft Touch £47.29');
  });

  test('3. "Matt Lamination Cover" resolves to matt tier (£48.58)', () => {
    const sel = {
      'Finished Size': 'A4',
      'Cover Stock': '250gsm Silk',
      'Inner Stock': '150gsm Silk',
      Lamination: 'Matt Lamination Cover',
      'Printed Sides': 'Double Sided',
    };

    const resolved = resolveActiveVariantTiers(
      sel,
      variantTiers,
      defaultTiers,
      catalogueCustomFields
    );

    assert.ok(resolved);
    assert.strictEqual(resolved[0].price, 48.58, 'Must resolve to Matt £48.58');
  });

  test('4. "Gloss Lamination Cover" resolves to gloss tier (£48.35)', () => {
    const sel = {
      'Finished Size': 'A4',
      'Cover Stock': '250gsm Silk',
      'Inner Stock': '150gsm Silk',
      Lamination: 'Gloss Lamination Cover',
      'Printed Sides': 'Double Sided',
    };

    const resolved = resolveActiveVariantTiers(
      sel,
      variantTiers,
      defaultTiers,
      catalogueCustomFields
    );

    assert.ok(resolved);
    assert.strictEqual(resolved[0].price, 48.35, 'Must resolve to Gloss £48.35');
  });

  test('5. Suffix & prefix mutual exclusion (e.g. Hemmed & Eyelets vs variants with handles)', () => {
    const hemCustomFields: CustomField[] = [
      {
        id: 'cf-hem',
        name: 'Hem & Eyelets',
        required: true,
        options: [
          'Hemmed & Eyelets',
          'Hemmed & Eyelets - Left Handle, Square Corners',
          'Hemmed & Eyelets - Right Handle, Square Corners',
        ],
      },
    ];

    const hemVariants: Record<string, QuantityTier[]> = {
      'Hemmed & Eyelets - Left Handle, Square Corners': [{ quantity: 1, price: 99.0 }],
      'Hemmed & Eyelets - Right Handle, Square Corners': [{ quantity: 1, price: 99.0 }],
    };
    const hemDefault: QuantityTier[] = [{ quantity: 1, price: 50.0 }];

    // Standard Hemmed & Eyelets chosen
    const resStandard = resolveActiveVariantTiers(
      { 'Hem & Eyelets': 'Hemmed & Eyelets' },
      hemVariants,
      hemDefault,
      hemCustomFields
    );
    assert.strictEqual(
      resStandard?.[0].price,
      50.0,
      'Standard Hemmed & Eyelets must NOT match Left/Right Handle variant'
    );

    // Left Handle chosen
    const resLeft = resolveActiveVariantTiers(
      { 'Hem & Eyelets': 'Hemmed & Eyelets - Left Handle, Square Corners' },
      hemVariants,
      hemDefault,
      hemCustomFields
    );
    assert.strictEqual(
      resLeft?.[0].price,
      99.0,
      'Left handle must match Left Handle variant key'
    );
  });
});

describe('Pricing Engine: Modifiers, Speeds & Formatting', () => {
  test('6. Modifier parsing (+20%, -10%, +£15, +£2/ea)', () => {
    const modPercent = parseOptionModifier('Premium Silk (+20%)');
    assert.strictEqual(modPercent.multiplier, 1.2);

    const modFlat = parseOptionModifier('Custom Binding (+£15)');
    assert.strictEqual(modFlat.flatAddon, 15);

    const modUnit = parseOptionModifier('Individual Packaging (+£2.50/ea)');
    assert.strictEqual(modUnit.unitAddon, 2.5);
  });

  test('7. cleanOptionDisplayName strips modifiers cleanly from storefront display', () => {
    assert.strictEqual(cleanOptionDisplayName('A4 (+20%)'), 'A4');
    assert.strictEqual(cleanOptionDisplayName('Matt Lamination (+£12.50)'), 'Matt Lamination');
    assert.strictEqual(cleanOptionDisplayName('Eyelets (+£1.00/ea)'), 'Eyelets');
    assert.strictEqual(cleanOptionDisplayName('350gsm Silk +15%'), '350gsm Silk');
  });

  test('8. Delivery turnaround speed ordering guarantee (standard <= nextDay <= sameDay)', () => {
    // Intentionally pass an inverted/misconfigured percentage to verify defensive sanity
    const matrix = generateDynamicPriceMatrix(
      50.0,
      { Size: 'A4' },
      1,
      [100],
      100,
      undefined,
      true,
      undefined,
      undefined,
      10.0, // sameDay: 10%
      25.0  // nextDay: 25% (higher than sameDay!)
    );

    assert.ok(matrix.length > 0);
    const row = matrix[0];
    assert.ok(
      row.sameDay.price >= row.nextDay.price,
      `SameDay (£${row.sameDay.price}) must be >= NextDay (£${row.nextDay.price})`
    );
    assert.ok(
      row.nextDay.price >= row.standard.price,
      `NextDay (£${row.nextDay.price}) must be >= Standard (£${row.standard.price})`
    );
  });

  test('9. Working delivery dates skip Saturday & Sunday strictly', () => {
    // Test a Friday base date (e.g. 2026-11-06 is Friday)
    const friday = new Date(2026, 10, 6, 10, 0, 0); // Friday 10:00 AM
    const dueDates = getWorkingDueDates(friday);

    assert.ok(dueDates.sameDay, 'Same day due date must exist');
    assert.ok(dueDates.nextDay, 'Next day due date must exist');
    assert.ok(dueDates.standard, 'Standard due date must exist');

    // Due dates should never contain 'Sat' or 'Sun'
    assert.ok(!dueDates.sameDay.includes('Sat') && !dueDates.sameDay.includes('Sun'));
    assert.ok(!dueDates.nextDay.includes('Sat') && !dueDates.nextDay.includes('Sun'));
    assert.ok(!dueDates.standard.includes('Sat') && !dueDates.standard.includes('Sun'));
  });
});
