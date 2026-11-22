import { test, describe } from 'node:test';
import assert from 'node:assert';
import {
  validateProductImport,
  parseImportContent,
  repriceProductData,
  generateAllVariantCombinations,
  exportPriceMatrixToCSV,
  importPriceMatrixFromCSV,
} from '../lib/productImportEngine';
import {
  generateDynamicPriceMatrix,
  resolvePriceMatrixTiers,
} from '../lib/pricingEngine';
import { Product, PriceMatrixConfig, CustomField } from '../lib/types';

describe('CMS Bulk Product Creation & Price Matrix Suite', () => {

  // Process 1: Bulk Product Import & Validation
  describe('Process 1: Product Import Validation', () => {
    test('validates a clean product array with 0 errors', () => {
      const validProducts = [
        {
          title: 'Brochures A4 16pp',
          slug: 'brochures-a4-16pp',
          category: 'Booklets',
          price: 95.0,
          quantityTiers: [
            { quantity: 25, price: 95.0 },
            { quantity: 50, price: 140.0 },
            { quantity: 100, price: 210.0 },
          ],
        },
      ];

      const report = validateProductImport(validProducts, new Set(['existing-other-product']));
      assert.strictEqual(report.valid, true);
      assert.strictEqual(report.validCount, 1);
      assert.strictEqual(report.errors.length, 0);
    });

    test('flags missing title, duplicate slugs, and invalid pricing', () => {
      const invalidProducts = [
        {
          // missing title
          slug: 'duplicate-slug',
          price: 0, // invalid price
          quantityTiers: [
            { quantity: 100, price: 50 },
            { quantity: 50, price: 30 }, // non-ascending quantity
          ],
        },
        {
          title: 'Second Product',
          slug: 'duplicate-slug', // duplicate slug in batch
          price: 20,
          quantityTiers: [{ quantity: 25, price: 20 }],
        },
      ];

      const report = validateProductImport(invalidProducts, new Set());
      assert.strictEqual(report.valid, false);
      assert.strictEqual(report.errors.length, 2);

      const err0 = report.errors.find((e) => e.productIndex === 0)?.errors.join(' ');
      assert.match(err0 || '', /"title"/i);
      assert.match(err0 || '', /positive numeric value/i);
      assert.match(err0 || '', /ascending/i);

      const err1 = report.errors.find((e) => e.productIndex === 1)?.errors.join(' ');
      assert.match(err1 || '', /Duplicate slug "duplicate-slug"/);
    });

    test('parses JSON string array, single JSON object, and CSV content', () => {
      const singleJson = JSON.stringify({
        title: 'Single Booklet',
        slug: 'single-booklet',
        price: 50,
        quantityTiers: [{ quantity: 25, price: 50 }],
      });
      const parsedSingle = parseImportContent(singleJson);
      assert.strictEqual(parsedSingle.length, 1);
      assert.strictEqual(parsedSingle[0].title, 'Single Booklet');

      const arrayJson = JSON.stringify([
        { title: 'P1', slug: 'p1', price: 10, quantityTiers: [{ quantity: 1, price: 10 }] },
        { title: 'P2', slug: 'p2', price: 20, quantityTiers: [{ quantity: 1, price: 20 }] },
      ]);
      const parsedArray = parseImportContent(arrayJson);
      assert.strictEqual(parsedArray.length, 2);

      const csvData = `title,slug,price,category\nFlyer A6,flyer-a6,15.5,Flyers\nBanner 2x1,banner-2x1,45.0,Banners`;
      const parsedCsv = parseImportContent(csvData);
      assert.strictEqual(parsedCsv.length, 2);
      assert.strictEqual(parsedCsv[0].title, 'Flyer A6');
      assert.strictEqual(parsedCsv[0].price, 15.5);
      assert.strictEqual(parsedCsv[1].slug, 'banner-2x1');
    });

    test('normalises quantityTiers passed as JSON string and auto-derives base price', () => {
      const rawWithJsonString: any[] = [
        {
          title: 'Brochure Test',
          slug: 'brochure-test',
          category: 'Brochures',
          // omitted top-level price
          quantityTiers: JSON.stringify([
            { quantity: 5, price: 57.17 },
            { quantity: 10, price: 62.85 },
          ]),
        },
      ];

      const report = validateProductImport(rawWithJsonString, new Set());
      assert.strictEqual(report.valid, true);
      assert.strictEqual(report.errors.length, 0);
      assert.strictEqual(Array.isArray(rawWithJsonString[0].quantityTiers), true);
      assert.strictEqual(rawWithJsonString[0].price, 57.17);
    });

    test('allows omitted top-level price on merge update for existing slug', () => {
      const existingSlugs = new Set(['existing-brochures']);
      const mergePayload = [
        {
          title: 'Existing Brochures',
          slug: 'existing-brochures',
          category: 'Brochures',
          // no price or quantityTiers provided
        },
      ];
      const report = validateProductImport(mergePayload, existingSlugs);
      assert.strictEqual(report.valid, true);
      assert.strictEqual(report.errors.length, 0);
    });
  });

  // Process 2: Price Matrix Table Type & Resolution
  describe('Process 2: Price Matrix Grid & Storefront Resolution', () => {
    const customFields: CustomField[] = [
      {
        id: 'fld-size',
        name: 'Size',
        required: true,
        options: ['A4', 'A5'],
      },
      {
        id: 'fld-lam',
        name: 'Lamination',
        required: true,
        options: ['Matt Lamination (+20%)', 'None'],
      },
    ];

    const matrixConfig: PriceMatrixConfig = {
      primaryFieldId: 'fld-size',
      columns: ['A4', 'A5'],
      quantities: [25, 50, 100],
      cells: {
        '25__A4': 100.0,
        '50__A4': 150.0,
        '100__A4': 200.0,
        '25__A5': 70.0,
        '50__A5': 105.0,
        '100__A5': 140.0,
      },
    };

    test('resolves tiers directly from priceMatrix matching primary column', () => {
      const resA4 = resolvePriceMatrixTiers({ 'fld-size': 'A4' }, matrixConfig, customFields);
      assert.ok(resA4.tiers);
      assert.strictEqual(resA4.tiers.length, 3);
      assert.strictEqual(resA4.tiers[0].quantity, 25);
      assert.strictEqual(resA4.tiers[0].price, 100.0);
      assert.strictEqual(resA4.tiers[2].quantity, 100);
      assert.strictEqual(resA4.tiers[2].price, 200.0);

      const resA5 = resolvePriceMatrixTiers({ 'fld-size': 'A5' }, matrixConfig, customFields);
      assert.ok(resA5.tiers);
      assert.strictEqual(resA5.tiers[0].price, 70.0);
      assert.strictEqual(resA5.tiers[2].price, 140.0);
    });

    test('generateDynamicPriceMatrix gives precedence to priceMatrix and applies unconsumed modifiers on top', () => {
      // User selects A4 size and Matt Lamination (+20%)
      const rows = generateDynamicPriceMatrix(
        50.0,
        {
          'fld-size': 'A4',
          'fld-lam': 'Matt Lamination (+20%)',
        },
        1,
        undefined,
        25,
        undefined,
        true,
        undefined,
        undefined,
        35.4,
        10,
        undefined,
        undefined,
        customFields,
        matrixConfig
      );

      assert.strictEqual(rows.length, 3);
      // Row 1: Quantity 25. Base from matrix is 100.00. Matt Lamination adds +20% -> 120.00
      assert.strictEqual(rows[0].quantity, 25);
      assert.strictEqual(rows[0].standard.price, 120.0);

      // Row 2: Quantity 50. Base from matrix is 150.00. Matt Lamination adds +20% -> 180.00
      assert.strictEqual(rows[1].quantity, 50);
      assert.strictEqual(rows[1].standard.price, 180.0);
    });

    test('CSV export and import roundtrip preserves all matrix quantities, columns and prices', () => {
      const csv = exportPriceMatrixToCSV(matrixConfig);
      assert.match(csv, /Quantity,A4,A5/);
      assert.match(csv, /25,100\.00,70\.00/);

      const imported = importPriceMatrixFromCSV(csv, 'fld-size');
      assert.deepStrictEqual(imported.columns, ['A4', 'A5']);
      assert.deepStrictEqual(imported.quantities, [25, 50, 100]);
      assert.strictEqual(imported.cells['25__A4'], 100.0);
      assert.strictEqual(imported.cells['100__A5'], 140.0);
    });

    test('resolves compound primary and secondary dropdown options (pages and paper stocks) correctly', () => {
      const bookletFields: CustomField[] = [
        {
          id: 'fld-pages',
          name: 'Number of Pages',
          required: true,
          options: ['8pp', '12pp', '64pp'],
        },
        {
          id: 'fld-paper',
          name: 'Inside Paper Stock',
          required: true,
          options: ['100gsm Bond', '130gsm Silk'],
        },
      ];

      const bookletMatrix: PriceMatrixConfig = {
        primaryFieldId: 'fld-pages',
        secondaryFieldId: 'fld-paper',
        columns: ['8pp - 100gsm Bond', '8pp - 130gsm Silk', '12pp - 100gsm Bond', '64pp - 100gsm Bond'],
        quantities: [5, 10],
        cells: {
          '5__8pp - 100gsm Bond': 61.03,
          '5__8pp - 130gsm Silk': 57.17,
          '5__12pp - 100gsm Bond': 62.85,
          '5__64pp - 100gsm Bond': 80.38,
          '10__8pp - 100gsm Bond': 75.0,
          '10__8pp - 130gsm Silk': 70.0,
          '10__12pp - 100gsm Bond': 78.0,
          '10__64pp - 100gsm Bond': 99.0,
        },
      };

      // 1. Default (8pp, 100gsm Bond) -> 61.03
      const res8_100 = resolvePriceMatrixTiers(
        { 'Number of Pages': '8pp', 'Inside Paper Stock': '100gsm Bond' },
        bookletMatrix,
        bookletFields
      );
      assert.strictEqual(res8_100.matchedColumn, '8pp - 100gsm Bond');
      assert.strictEqual(res8_100.tiers?.[0]?.price, 61.03);

      // 2. 8pp, 130gsm Silk -> 57.17
      const res8_130 = resolvePriceMatrixTiers(
        { 'Number of Pages': '8pp', 'Inside Paper Stock': '130gsm Silk' },
        bookletMatrix,
        bookletFields
      );
      assert.strictEqual(res8_130.matchedColumn, '8pp - 130gsm Silk');
      assert.strictEqual(res8_130.tiers?.[0]?.price, 57.17);

      // 3. 12pp, 100gsm Bond -> 62.85 (higher than 8pp)
      const res12 = resolvePriceMatrixTiers(
        { 'Number of Pages': '12pp', 'Inside Paper Stock': '100gsm Bond' },
        bookletMatrix,
        bookletFields
      );
      assert.strictEqual(res12.matchedColumn, '12pp - 100gsm Bond');
      assert.strictEqual(res12.tiers?.[0]?.price, 62.85);

      // 4. 64pp, 100gsm Bond -> 80.38 (much higher than 8pp)
      const res64 = resolvePriceMatrixTiers(
        { 'Number of Pages': '64pp', 'Inside Paper Stock': '100gsm Bond' },
        bookletMatrix,
        bookletFields
      );
      assert.strictEqual(res64.matchedColumn, '64pp - 100gsm Bond');
      assert.strictEqual(res64.tiers?.[0]?.price, 80.38);
    });
  });

  // Process 5: Cartesian Combinations Generator & Negative Modifiers
  describe('Process 5: Cartesian Product Generator & Usability', () => {
    test('generateAllVariantCombinations generates full Cartesian product with cloned base tiers', () => {
      const fields: CustomField[] = [
        { id: 'f1', name: 'Size', required: true, options: ['A4', 'A5'] },
        { id: 'f2', name: 'Pages', required: true, options: ['16pp', '24pp', '32pp'] },
      ];

      const combos = generateAllVariantCombinations(fields);
      // 2 sizes * 3 page counts = 6 combination tables
      const keys = Object.keys(combos);
      assert.strictEqual(keys.length, 6);
      assert.ok(keys.includes('A4 - 16pp'));
      assert.ok(keys.includes('A5 - 32pp'));

      // Each table receives cloned base tiers
      assert.strictEqual(combos['A4 - 16pp'].length, 5);
      assert.strictEqual(combos['A4 - 16pp'][0].quantity, 25);
    });
  });

  // Process 6: Pricing Rules & Solopress Reprice
  describe('Process 6: Pricing Rules (1.3x Multiplier & Price Floor)', () => {
    test('multiplies base price, tiers, and matrix cells by 1.3 and rounds UP to 2 decimal places', () => {
      const productToReprice: Partial<Product> = {
        title: 'Solopress Brochure Clone',
        price: 25.12,
        sourcePrice: 25.12,
        quantityTiers: [
          { quantity: 25, price: 25.12 },
          { quantity: 50, price: 43.15 },
        ],
        priceMatrix: {
          primaryFieldId: 'size',
          columns: ['A4'],
          quantities: [25, 50],
          cells: {
            '25__A4': 25.12,
            '50__A4': 43.15,
          },
        },
      };

      // 25.12 * 1.3 = 32.656 -> ceil -> 32.66
      // 43.15 * 1.3 = 56.095 -> ceil -> 56.10
      const repriced = repriceProductData(productToReprice as Product, 1.3);

      assert.strictEqual(repriced.priceMultiplier, 1.3);
      assert.strictEqual(repriced.price, 32.66);
      assert.strictEqual(repriced.quantityTiers?.[0]?.price, 32.66);
      assert.strictEqual(repriced.quantityTiers?.[1]?.price, 56.10);
      assert.strictEqual(repriced.priceMatrix?.cells['25__A4'], 32.66);
      assert.strictEqual(repriced.priceMatrix?.cells['50__A4'], 56.10);
    });

    test('enforces minimum price floor when specified', () => {
      const lowPriceProduct: Partial<Product> = {
        title: 'Budget Sticker',
        price: 5.0,
        quantityTiers: [{ quantity: 10, price: 5.0 }],
      };

      // 5.0 * 1.3 = 6.50, but floor is 10.00
      const repriced = repriceProductData(lowPriceProduct as Product, 1.3, 10.0);
      assert.strictEqual(repriced.price, 10.0);
      assert.strictEqual(repriced.quantityTiers?.[0]?.price, 10.0);
    });
  });
});
