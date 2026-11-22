import { initializeApp, getApps, getApp } from 'firebase/app';
import { getFirestore, collection, query, where, getDocs, doc, getDoc } from 'firebase/firestore';
import fs from 'fs';

// Read .env.local manually
try {
  const envContent = fs.readFileSync('.env.local', 'utf8');
  for (const line of envContent.split(/\r?\n/)) {
    const match = line.match(/^([^#=]+)=(.*)$/);
    if (match) {
      process.env[match[1].trim()] = match[2].trim();
    }
  }
} catch (e) {}

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || '',
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || '',
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || '',
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || '',
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || '',
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || '',
};

const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const db = getFirestore(app);

async function run() {
  console.log('Querying Firestore for a5-stapled-brochures...');
  const q = query(collection(db, 'products'), where('slug', '==', 'a5-stapled-brochures'));
  const snap = await getDocs(q);
  console.log('Found docs:', snap.docs.length);

  if (snap.empty) {
    console.log('Scanning all products to find matching slug or title...');
    const all = await getDocs(collection(db, 'products'));
    console.log('Total products in Firestore:', all.docs.length);
    for (const d of all.docs) {
      const data = d.data();
      if ((data.slug || '').includes('stapled') || (data.title || '').toLowerCase().includes('stapled')) {
        console.log('Potential match:', d.id, data.slug, data.title, 'isActive:', data.isActive);
      }
    }
    return;
  }

  for (const d of snap.docs) {
    const data = d.data();
    console.log('=== PRODUCT DOC ===');
    console.log('Doc ID:', d.id);
    console.log('Title:', data.title);
    console.log('Slug:', data.slug);
    console.log('isActive:', data.isActive);
    console.log('pricingDataExternal:', data.pricingDataExternal);
    console.log('quantityTiers type:', typeof data.quantityTiers, Array.isArray(data.quantityTiers));
    if (typeof data.quantityTiers === 'string') {
      console.log('quantityTiers preview (string):', data.quantityTiers.slice(0, 100));
    } else if (Array.isArray(data.quantityTiers)) {
      console.log('quantityTiers length:', data.quantityTiers.length, 'Tier 0:', data.quantityTiers[0]);
    }

    console.log('customFields:', JSON.stringify(data.customFields, null, 2));

    // Check pricingData under doc ID
    console.log('Checking pricingData under doc ID:', d.id);
    const subRef1 = doc(db, 'products', d.id, 'pricingData', 'default');
    const subSnap1 = await getDoc(subRef1);
    console.log('subSnap1 exists under doc.id?:', subSnap1.exists());
    if (subSnap1.exists()) {
      const pData = subSnap1.data();
      console.log('pData keys:', Object.keys(pData));
      if (pData.priceMatrix) {
        console.log('priceMatrix primaryFieldId:', pData.priceMatrix.primaryFieldId);
        console.log('priceMatrix secondaryFieldId:', pData.priceMatrix.secondaryFieldId);
        console.log('columns count:', pData.priceMatrix.columns?.length);
        console.log('columns sample:', pData.priceMatrix.columns?.slice(0, 5));
        console.log('quantities count:', pData.priceMatrix.quantities?.length);
        console.log('quantities sample:', pData.priceMatrix.quantities?.slice(0, 5));
        const cellKeys = Object.keys(pData.priceMatrix.cells || {});
        console.log('cells count:', cellKeys.length);
        console.log('cells sample keys:', cellKeys.slice(0, 5));
        console.log('cell 5__8pp - 100gsm Bond:', pData.priceMatrix.cells?.['5__8pp - 100gsm Bond']);
        console.log('cell 5__8pp - 130gsm Silk:', pData.priceMatrix.cells?.['5__8pp - 130gsm Silk']);
      }
    }

    const { getProductById } = await import('../lib/db');
    const { generateDynamicPriceMatrix, resolvePriceMatrixTiers } = await import('../lib/pricingEngine');
    const hydrated = await getProductById('a5-stapled-brochures');
    console.log('=== getProductById RESULT ===');
    console.log('hydrated.id:', hydrated?.id);
    console.log('hydrated.title:', hydrated?.title);
    console.log('hydrated.hasPriceMatrix:', Boolean(hydrated?.priceMatrix));
    if (hydrated?.priceMatrix) {
      console.log('hydrated matrix cols:', hydrated.priceMatrix.columns?.length);
      console.log('hydrated matrix cells count:', Object.keys(hydrated.priceMatrix.cells || {}).length);
    }

    // Now test what the storefront does:
    // What are the default customFieldValues on storefront?
    const initialOptions: Record<string, string> = {};
    hydrated?.customFields?.forEach((cf) => {
      initialOptions[cf.name] = cf.defaultValue || cf.options[0];
    });
    console.log('Storefront activeOptions default:', initialOptions);

    // Call resolvePriceMatrixTiers
    const res1 = resolvePriceMatrixTiers(initialOptions, hydrated?.priceMatrix, hydrated?.customFields);
    console.log('resolvePriceMatrixTiers with initialOptions:');
    console.log('matchedColumn:', res1.matchedColumn);
    console.log('consumedFieldKeys:', Array.from(res1.consumedFieldKeys));
    console.log('tiers found?:', Boolean(res1.tiers), res1.tiers?.length);
    if (res1.tiers) {
      console.log('Tier for qty 5:', res1.tiers.find(t => t.quantity === 5));
    }

    // Call generateDynamicPriceMatrix
    const matrixResult1 = generateDynamicPriceMatrix(
      hydrated?.price || 14.69,
      initialOptions,
      1,
      undefined,
      hydrated?.minQuantity,
      hydrated?.maxSameDayQuantity,
      Boolean(hydrated?.customFields?.length),
      hydrated?.maxQuantity,
      hydrated?.maxNextDayQuantity,
      hydrated?.sameDayIncreasePercent,
      hydrated?.nextDayIncreasePercent,
      hydrated?.quantityTiers,
      hydrated?.variantQuantityTiers,
      hydrated?.customFields,
      hydrated?.priceMatrix
    );

    const row5_1 = matrixResult1.find(r => r.quantity === 5);
    console.log('generateDynamicPriceMatrix row for qty 5 (default):', row5_1?.standard);

    // Now test selecting 8pp, 100gsm Bond specifically:
    // Find field for Pages and Paper
    const pageField = hydrated?.customFields?.find(f => f.id === 'fld-pages' || f.name.toLowerCase().includes('page'));
    const paperField = hydrated?.customFields?.find(f => f.id === 'fld-paper' || f.name.toLowerCase().includes('paper'));
    console.log('pageField:', pageField?.name, pageField?.id);
    console.log('paperField:', paperField?.name, paperField?.id);

    const testOptions8_100 = {
      ...initialOptions,
      [pageField?.name || 'Number of Pages']: '8pp',
      [paperField?.name || 'Inside Paper Stock']: '100gsm Bond',
    };
    console.log('testOptions8_100:', testOptions8_100);
    const res8_100 = resolvePriceMatrixTiers(testOptions8_100, hydrated?.priceMatrix, hydrated?.customFields);
    console.log('res8_100 matchedColumn:', res8_100.matchedColumn);
    console.log('res8_100 tiers qty 5:', res8_100.tiers?.find(t => t.quantity === 5));

    const matrixResult8_100 = generateDynamicPriceMatrix(
      hydrated?.price || 14.69,
      testOptions8_100,
      1,
      undefined,
      hydrated?.minQuantity,
      hydrated?.maxSameDayQuantity,
      Boolean(hydrated?.customFields?.length),
      hydrated?.maxQuantity,
      hydrated?.maxNextDayQuantity,
      hydrated?.sameDayIncreasePercent,
      hydrated?.nextDayIncreasePercent,
      hydrated?.quantityTiers,
      hydrated?.variantQuantityTiers,
      hydrated?.customFields,
      hydrated?.priceMatrix
    );
    console.log('matrixResult8_100 row for qty 5:', matrixResult8_100.find(r => r.quantity === 5)?.standard);

    // Test 64pp:
    const testOptions64 = {
      ...initialOptions,
      [pageField?.name || 'Number of Pages']: '64pp',
      [paperField?.name || 'Inside Paper Stock']: '100gsm Bond',
    };
    const res64 = resolvePriceMatrixTiers(testOptions64, hydrated?.priceMatrix, hydrated?.customFields);
    console.log('res64 matchedColumn:', res64.matchedColumn);
    console.log('res64 tiers qty 5:', res64.tiers?.find(t => t.quantity === 5));
    const matrixResult64 = generateDynamicPriceMatrix(
      hydrated?.price || 14.69,
      testOptions64,
      1,
      undefined,
      hydrated?.minQuantity,
      hydrated?.maxSameDayQuantity,
      Boolean(hydrated?.customFields?.length),
      hydrated?.maxQuantity,
      hydrated?.maxNextDayQuantity,
      hydrated?.sameDayIncreasePercent,
      hydrated?.nextDayIncreasePercent,
      hydrated?.quantityTiers,
      hydrated?.variantQuantityTiers,
      hydrated?.customFields,
      hydrated?.priceMatrix
    );
    console.log('matrixResult64 row for qty 5:', matrixResult64.find(r => r.quantity === 5)?.standard);
  }
}

run().catch(console.error);
