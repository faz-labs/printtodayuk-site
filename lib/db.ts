import {
  collection,
  getDocs,
  getDoc,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  setDoc,
  query,
  where,
  deleteField,
} from 'firebase/firestore';
import { db, isConfigured } from './firebase';
import {
  Product,
  CategoryConfig,
  Inquiry,
  ProductInput,
  HeroSlide,
  DynamicSection,
  DynamicSectionInput,
} from './types';
import {
  INITIAL_CATEGORIES,
  SEED_PRODUCTS,
  DEFAULT_HERO_SLIDES,
  DUMMY_CATEGORY_NAMES,
  DUMMY_PRODUCT_IDS,
} from './data';
import { slugify } from './utils';

/**
 * Strips all keys with `undefined` values recursively so Firestore never throws:
 * "unsupported field value: undefined found in field ..."
 */
export function cleanFirestoreData<T extends Record<string, any>>(obj: T): T {
  const result: any = {};
  for (const [key, value] of Object.entries(obj)) {
    if (value === undefined) {
      continue;
    } else if (Array.isArray(value)) {
      result[key] = value
        .filter((item) => item !== undefined)
        .map((item) =>
          item !== null && typeof item === 'object' && !Array.isArray(item)
            ? cleanFirestoreData(item)
            : item
        );
    } else if (value !== null && typeof value === 'object') {
      result[key] = cleanFirestoreData(value);
    } else {
      result[key] = value;
    }
  }
  return result;
}


// Helper to get local stored products if offline or for immediate synchronous hydration
export function getLocalProducts(): Product[] {
  if (typeof window === 'undefined') return [];
  try {
    const data = localStorage.getItem('print_today_products');
    if (data) {
      const parsed = JSON.parse(data);
      if (Array.isArray(parsed)) {
        return parsed;
      }
    }
  } catch {}
  return [];
}

export function saveLocalProducts(products: Product[]) {
  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem('print_today_products', JSON.stringify(products));
      window.dispatchEvent(new CustomEvent('print_today_products_updated', { detail: products }));
    } catch {}
  }
}

export function getDeletedCategories(): Set<string> {
  if (typeof window === 'undefined') return new Set();
  try {
    const data = localStorage.getItem('print_today_deleted_categories');
    if (data) {
      const arr = JSON.parse(data);
      if (Array.isArray(arr)) {
        return new Set(arr.map((s) => String(s).toLowerCase().trim()));
      }
    }
  } catch {}
  return new Set();
}

export function saveDeletedCategories(deleted: Set<string>) {
  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem('print_today_deleted_categories', JSON.stringify(Array.from(deleted)));
    } catch {}
  }
}

export function getLocalCategories(): CategoryConfig[] {
  const deletedSet = getDeletedCategories();

  if (typeof window === 'undefined') {
    return [];
  }

  try {
    const data = localStorage.getItem('print_today_categories');
    if (data !== null) {
      const parsed = JSON.parse(data);
      if (Array.isArray(parsed)) {
        return parsed
          .filter(
            (c: any) =>
              c &&
              c.name &&
              typeof c.name === 'string' &&
              c.name.toLowerCase() !== 'printing' &&
              c.name.toLowerCase() !== 'clothing' &&
              !deletedSet.has(c.name.toLowerCase().trim())
          )
          .map((c: any) => ({
            id: c.id,
            name: c.name || '',
            description: c.description || '',
            imageUrl: c.imageUrl || '',
            subcategories: Array.isArray(c.subcategories) ? c.subcategories : [],
            subcategoryImages: c.subcategoryImages && typeof c.subcategoryImages === 'object' ? c.subcategoryImages : {},
            isBestSeller: Boolean(c.isBestSeller),
          }));
      }
    }
  } catch {}

  return [];
}

export function saveLocalCategories(cats: CategoryConfig[]) {
  if (typeof window !== 'undefined') {
    try {
      const deletedSet = getDeletedCategories();
      const sanitized = cats.filter((c) => c && c.name && !deletedSet.has(c.name.toLowerCase().trim()));
      localStorage.setItem('print_today_categories_initialized', 'true');
      localStorage.setItem('print_today_categories', JSON.stringify(sanitized));
      window.dispatchEvent(new CustomEvent('print_today_categories_updated', { detail: sanitized }));
    } catch {}
  }
}

function getLocalInquiries(): Inquiry[] {
  if (typeof window === 'undefined') return [];
  try {
    const data = localStorage.getItem('print_today_inquiries');
    if (data) {
      return JSON.parse(data);
    }
  } catch {}
  return [];
}

function saveLocalInquiries(inquiries: Inquiry[]) {
  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem('print_today_inquiries', JSON.stringify(inquiries));
    } catch {}
  }
}

// ---------------- PRODUCTS CRUD ----------------

let memoryProducts: { data: Product[]; timestamp: number } | null = null;
const MEMORY_CACHE_TTL_MS = 60 * 1000; // 60 seconds

export function invalidateProductsCache() {
  memoryProducts = null;
}

export async function getProducts(category?: string): Promise<Product[]> {
  const now = Date.now();
  if (!category && memoryProducts && now - memoryProducts.timestamp < MEMORY_CACHE_TTL_MS) {
    return memoryProducts.data;
  }

  if (isConfigured && db) {
    try {
      const q = collection(db, 'products');
      let snap;
      if (category) {
        snap = await getDocs(query(q, where('category', '==', category)));
      } else {
        snap = await getDocs(q);
      }

      const products = snap.docs.map((d) => {
        const data = d.data() as any;
        return {
          id: d.id,
          ...data,
          title: data.title || '',
          category: data.category || '',
          subcategory: data.subcategory || '',
          price: typeof data.price === 'number' ? data.price : Number(data.price) || 0,
        };
      }) as Product[];
      if (!category && Array.isArray(products) && products.length > 0) {
        memoryProducts = { data: products, timestamp: now };
        saveLocalProducts(products);
      }
      return products;
    } catch (error) {
      console.warn('Firestore fetch products failed, using local fallback:', error);
    }
  }

  const local = getLocalProducts();
  if (category) {
    return local.filter((p) => p.category.toLowerCase() === category.toLowerCase());
  }
  return local;
}

export async function getProductById(idOrSlug: string): Promise<Product | null> {
  if (!idOrSlug) return null;
  const decoded = decodeURIComponent(idOrSlug).trim();

  if (isConfigured && db) {
    try {
      // 1. Slug query check first (since storefront links use human-friendly slugs)
      const qSlug = query(collection(db, 'products'), where('slug', '==', decoded));
      const snapSlug = await getDocs(qSlug);
      if (!snapSlug.empty) {
        const firstDoc = snapSlug.docs[0];
        return { id: firstDoc.id, ...firstDoc.data() } as Product;
      }

      // Also check raw string if different from decoded
      if (idOrSlug !== decoded) {
        const qRaw = query(collection(db, 'products'), where('slug', '==', idOrSlug));
        const snapRaw = await getDocs(qRaw);
        if (!snapRaw.empty) {
          const firstDoc = snapRaw.docs[0];
          return { id: firstDoc.id, ...firstDoc.data() } as Product;
        }
      }

      // 2. Direct doc ID check
      const docRef = doc(db, 'products', decoded);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        return { id: docSnap.id, ...docSnap.data() } as Product;
      }

      // 3. Resilient fallback: search all products for case-insensitive slug or ID
      const allSnap = await getDocs(collection(db, 'products'));
      const targetLower = decoded.toLowerCase();
      for (const d of allSnap.docs) {
        const data = d.data() as any;
        const prodSlug = (data.slug || '').toLowerCase().trim();
        if (prodSlug === targetLower || d.id === decoded || d.id === idOrSlug) {
          return { id: d.id, ...data } as Product;
        }
      }

      return null;
    } catch (error) {
      console.warn('Firestore fetch single product error:', error);
    }
  }

  const local = getLocalProducts();
  const targetLower = decoded.toLowerCase();
  const found = local.find(
    (p) =>
      (p.slug && p.slug.toLowerCase().trim() === targetLower) ||
      p.slug === decoded ||
      p.slug === idOrSlug ||
      p.id === decoded ||
      p.id === idOrSlug
  );
  return found || null;
}

export async function createProduct(productInput: ProductInput): Promise<Product> {
  invalidateProductsCache();
  const newProduct: Product = {
    ...productInput,
    slug: productInput.slug || slugify(productInput.title),
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };

  if (isConfigured && db) {
    try {
      const cleanData = cleanFirestoreData(newProduct);
      const docRef = await addDoc(collection(db, 'products'), cleanData);
      newProduct.id = docRef.id;
      // Also sync to local cache
      const local = getLocalProducts();
      local.unshift(newProduct);
      saveLocalProducts(local);
      return newProduct;
    } catch (error) {
      console.error('Firestore createProduct failed:', error);
      throw error;
    }
  }

  newProduct.id = `prod-${Date.now()}`;
  const local = getLocalProducts();
  local.unshift(newProduct);
  saveLocalProducts(local);
  return newProduct;
}

export async function updateProduct(
  id: string,
  updates: Partial<Product>
): Promise<Product | null> {
  invalidateProductsCache();
  const payload: any = {
    ...updates,
    updatedAt: Date.now(),
  };

  const isDiscountCleared = updates.discountedPrice === null;

  if (isConfigured && db) {
    try {
      const cleanData: any = cleanFirestoreData(payload);
      if (isDiscountCleared) {
        cleanData.discountedPrice = deleteField();
      }
      const docRef = doc(db, 'products', id);
      await updateDoc(docRef, cleanData);
    } catch (error) {
      console.error('Firestore updateProduct failed:', error);
      throw error;
    }
  }

  const local = getLocalProducts();
  const index = local.findIndex((p) => p.id === id || p.slug === id);
  if (index !== -1) {
    local[index] = { ...local[index], ...payload };
    if (isDiscountCleared) {
      delete local[index].discountedPrice;
    }
    saveLocalProducts(local);
    return local[index];
  }

  return { id, ...payload } as Product;
}

export async function deleteProduct(id: string): Promise<boolean> {
  invalidateProductsCache();
  if (isConfigured && db) {
    try {
      const docRef = doc(db, 'products', id);
      await deleteDoc(docRef);
    } catch (error) {
      console.error('Firestore deleteProduct failed:', error);
      throw error;
    }
  }

  const local = getLocalProducts();
  const filtered = local.filter((p) => p.id !== id && p.slug !== id);
  saveLocalProducts(filtered);
  return true;
}

/**
 * Permanently deletes all mock / seed dummy categories and products from live Firestore database
 * and clears local caches so only user-created content remains.
 */
export async function purgeDummyDataFromFirestore(): Promise<{ categoriesDeleted: number; productsDeleted: number }> {
  let categoriesDeleted = 0;
  let productsDeleted = 0;

  if (isConfigured && db) {
    try {
      // 1. Delete all dummy categories from Firestore
      const catSnap = await getDocs(collection(db, 'categories'));
      for (const d of catSnap.docs) {
        const data = d.data() as any;
        const name = (data.name || '').toLowerCase().trim();
        const id = d.id.toLowerCase().trim();
        const isDummy =
          DUMMY_CATEGORY_NAMES.includes(name) ||
          DUMMY_CATEGORY_NAMES.some((dn) => id === dn.replace(/[^a-z0-9]+/g, '-'));

        if (isDummy) {
          await deleteDoc(doc(db, 'categories', d.id));
          categoriesDeleted++;
        }
      }

      // 2. Delete all dummy products from Firestore
      const prodSnap = await getDocs(collection(db, 'products'));
      for (const d of prodSnap.docs) {
        const data = d.data() as any;
        const id = d.id;
        const title = (data.title || '').toLowerCase().trim();
        const isDummy =
          DUMMY_PRODUCT_IDS.includes(id) ||
          id.startsWith('gift-') ||
          title.includes('ceramic photo mug') ||
          title.includes('magic mug') ||
          title.includes('engraved metal ballpoint pen') ||
          title.includes('soft-touch stylus click pens') ||
          title.includes('stainless steel water bottle');

        if (isDummy) {
          await deleteDoc(doc(db, 'products', d.id));
          productsDeleted++;
        }
      }
    } catch (error) {
      console.error('Firestore purge dummy data failed:', error);
      throw error;
    }
  }

  // 3. Clear all local storage caches
  if (typeof window !== 'undefined') {
    try {
      localStorage.removeItem('print_today_categories');
      localStorage.removeItem('print_today_products');
      localStorage.removeItem('print_today_deleted_categories');
      localStorage.removeItem('print_today_categories_initialized');
      window.dispatchEvent(new CustomEvent('print_today_categories_updated', { detail: [] }));
    } catch {}
  }

  return { categoriesDeleted, productsDeleted };
}

/**
 * Permanently deletes ALL categories from Firestore (for users wanting a 100% fresh slate).
 */
export async function purgeAllCategoriesFromFirestore(): Promise<{ count: number }> {
  let count = 0;
  if (isConfigured && db) {
    try {
      const snap = await getDocs(collection(db, 'categories'));
      for (const d of snap.docs) {
        await deleteDoc(doc(db, 'categories', d.id));
        count++;
      }
    } catch (error) {
      console.error('Firestore purgeAllCategories error:', error);
      throw error;
    }
  }

  if (typeof window !== 'undefined') {
    try {
      localStorage.removeItem('print_today_categories');
      localStorage.removeItem('print_today_deleted_categories');
      localStorage.removeItem('print_today_categories_initialized');
      window.dispatchEvent(new CustomEvent('print_today_categories_updated', { detail: [] }));
    } catch {}
  }

  return { count };
}

// ---------------- CATEGORIES CRUD ----------------

export async function getCategories(): Promise<CategoryConfig[]> {
  const local = getLocalCategories();
  const deletedSet = getDeletedCategories();

  if (isConfigured && db) {
    try {
      const snap = await getDocs(collection(db, 'categories'));
      const firestoreCats: CategoryConfig[] = [];

      for (const d of snap.docs) {
        const data = d.data() as any;
        const name = (data.name || '').trim();
        if (
          !name ||
          name.toLowerCase() === 'printing' ||
          name.toLowerCase() === 'clothing' ||
          deletedSet.has(name.toLowerCase())
        ) {
          continue;
        }

        firestoreCats.push({
          id: d.id,
          name,
          slug: data.slug || slugify(name),
          description: data.description || '',
          imageUrl: data.imageUrl || '',
          metaTitle: data.metaTitle || '',
          metaDescription: data.metaDescription || '',
          isBestSeller: Boolean(data.isBestSeller),
        });
      }

      // Sync Firestore result to local cache
      saveLocalCategories(firestoreCats);
      return firestoreCats;
    } catch (error) {
      console.warn('Firestore fetch categories error, using local fallback:', error);
    }
  }

  return local.filter((c) => c && c.name && !deletedSet.has(c.name.toLowerCase().trim()));
}

export async function createCategory(cat: {
  name: string;
  slug?: string;
  description?: string;
  imageUrl?: string;
  metaTitle?: string;
  metaDescription?: string;
  isBestSeller?: boolean;
}): Promise<CategoryConfig> {
  const normName = cat.name.toLowerCase().trim();
  const deletedSet = getDeletedCategories();
  if (deletedSet.has(normName)) {
    deletedSet.delete(normName);
    saveDeletedCategories(deletedSet);
  }

  const slug = cat.slug?.trim() || slugify(cat.name);
  const newCat: CategoryConfig = {
    name: cat.name.trim(),
    slug,
    description: cat.description?.trim() || '',
    imageUrl: cat.imageUrl || '',
    metaTitle: cat.metaTitle?.trim() || '',
    metaDescription: cat.metaDescription?.trim() || '',
    isBestSeller: Boolean(cat.isBestSeller),
  };

  const docId = normName.replace(/[^a-z0-9]+/g, '-');

  if (isConfigured && db) {
    try {
      const cleanData = cleanFirestoreData(newCat);
      await setDoc(doc(db, 'categories', docId), cleanData);
      newCat.id = docId;
    } catch (error) {
      console.warn('Firestore createCategory warning (offline/auth):', error);
    }
  }

  const local = getLocalCategories();
  const existingIdx = local.findIndex((c) => c.name.toLowerCase().trim() === normName);
  if (existingIdx !== -1) {
    local[existingIdx] = newCat;
  } else {
    local.push(newCat);
  }
  saveLocalCategories(local);
  return newCat;
}

export async function deleteCategory(categoryName: string, categoryId?: string): Promise<boolean> {
  const normName = categoryName.toLowerCase().trim();
  const deletedSet = getDeletedCategories();
  deletedSet.add(normName);
  saveDeletedCategories(deletedSet);

  const docId = normName.replace(/[^a-z0-9]+/g, '-');
  const rawId = normName;

  if (isConfigured && db) {
    try {
      const deletePromises: Promise<any>[] = [
        deleteDoc(doc(db, 'categories', docId)),
        deleteDoc(doc(db, 'categories', rawId)),
      ];
      if (categoryId) {
        deletePromises.push(deleteDoc(doc(db, 'categories', categoryId)));
      }
      await Promise.allSettled(deletePromises);
    } catch (error) {
      console.warn('Firestore deleteCategory warning (offline/auth):', error);
    }
  }

  const local = getLocalCategories();
  const filtered = local.filter((c) => c.name.toLowerCase().trim() !== normName);
  saveLocalCategories(filtered);
  return true;
}

export async function updateCategory(
  categoryName: string,
  updates: Partial<CategoryConfig>
): Promise<CategoryConfig> {
  const docId = categoryName.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-');

  if (isConfigured && db) {
    try {
      const docRef = doc(db, 'categories', docId);
      const cleanData = cleanFirestoreData({ name: categoryName, ...updates });
      await setDoc(docRef, cleanData, { merge: true });
    } catch (error) {
      console.warn('Firestore updateCategory warning (offline/auth):', error);
    }
  }

  const local = getLocalCategories();
  const index = local.findIndex((c) => c.name.toLowerCase() === categoryName.toLowerCase());
  if (index !== -1) {
    local[index] = { ...local[index], ...updates };
    saveLocalCategories(local);
    return local[index];
  } else {
    const created: CategoryConfig = {
      name: categoryName,
      ...updates,
    };
    local.push(created);
    saveLocalCategories(local);
    return created;
  }
}

export async function updateSubcategoryImage(
  categoryName: string,
  subcategory: string,
  imageUrl: string
): Promise<CategoryConfig> {
  const local = getLocalCategories();
  const cat = local.find((c) => c.name.toLowerCase() === categoryName.toLowerCase()) || {
    name: categoryName,
    subcategories: [subcategory],
    subcategoryImages: {},
  };

  const subcategoryImages = { ...(cat.subcategoryImages || {}), [subcategory]: imageUrl };
  return updateCategory(categoryName, { subcategoryImages });
}

export async function updateCategoryImage(
  categoryName: string,
  imageUrl: string
): Promise<CategoryConfig> {
  return updateCategory(categoryName, { imageUrl });
}

// ---------------- INQUIRIES CRUD ----------------

export async function getInquiries(): Promise<Inquiry[]> {
  if (isConfigured && db) {
    try {
      const snap = await getDocs(collection(db, 'inquiries'));
      if (!snap.empty) {
        const list = snap.docs.map((d) => ({
          id: d.id,
          ...d.data(),
        })) as Inquiry[];
        return list.sort((a, b) => b.createdAt - a.createdAt);
      }
    } catch (error) {
      console.warn('Firestore fetch inquiries failed:', error);
    }
  }

  return getLocalInquiries();
}

export async function submitInquiry(
  inquiry: Omit<Inquiry, 'id' | 'createdAt'>
): Promise<{ success: boolean; id?: string }> {
  const payload: Inquiry = {
    ...inquiry,
    status: 'pending',
    createdAt: Date.now(),
  };

  if (isConfigured && db) {
    try {
      const docRef = await addDoc(collection(db, 'inquiries'), payload);
      return { success: true, id: docRef.id };
    } catch (error) {
      console.error('Firestore inquiry submission failed:', error);
      throw error;
    }
  }

  const local = getLocalInquiries();
  const newInquiry = { id: `inq-${Date.now()}`, ...payload };
  local.unshift(newInquiry);
  saveLocalInquiries(local);

  return { success: true, id: newInquiry.id };
}

export async function updateInquiryStatus(
  id: string,
  status: 'pending' | 'contacted' | 'resolved'
): Promise<boolean> {
  if (isConfigured && db) {
    try {
      const docRef = doc(db, 'inquiries', id);
      await updateDoc(docRef, { status });
    } catch (error) {
      console.error('Firestore updateInquiryStatus error:', error);
      throw error;
    }
  }

  const local = getLocalInquiries();
  const target = local.find((i) => i.id === id);
  if (target) {
    target.status = status;
    saveLocalInquiries(local);
  }
  return true;
}

export async function deleteInquiry(id: string): Promise<boolean> {
  if (isConfigured && db) {
    try {
      const docRef = doc(db, 'inquiries', id);
      await deleteDoc(docRef);
    } catch (error) {
      console.error('Firestore deleteInquiry error:', error);
      throw error;
    }
  }

  const local = getLocalInquiries();
  const filtered = local.filter((i) => i.id !== id);
  saveLocalInquiries(filtered);
  return true;
}

// ---------------- HERO BANNER SLIDES CRUD ----------------

export function getLocalHeroSlides(): HeroSlide[] {
  if (typeof window === 'undefined') return DEFAULT_HERO_SLIDES;
  try {
    const data = localStorage.getItem('print_today_hero_slides');
    if (data) {
      const parsed = JSON.parse(data);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch {}
  return DEFAULT_HERO_SLIDES;
}

export function saveLocalHeroSlides(slides: HeroSlide[]) {
  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem('print_today_hero_slides', JSON.stringify(slides));
      window.dispatchEvent(new CustomEvent('print_today_hero_slides_updated', { detail: slides }));
    } catch {}
  }
}

export async function getHeroSlides(): Promise<HeroSlide[]> {
  if (isConfigured && db) {
    try {
      const snap = await getDocs(collection(db, 'hero_slides'));
      if (!snap.empty) {
        const slides = snap.docs.map((d) => ({ id: d.id, ...d.data() })) as HeroSlide[];
        slides.sort((a, b) => (a.order || 0) - (b.order || 0));
        saveLocalHeroSlides(slides);
        return slides;
      }
    } catch (error) {
      console.warn('Firestore getHeroSlides error, using fallback:', error);
    }
  }
  return getLocalHeroSlides();
}

export async function saveHeroSlides(slides: HeroSlide[]): Promise<HeroSlide[]> {
  if (isConfigured && db) {
    try {
      // 1. Delete removed slides from Firestore so they don't persist after deletion
      const snap = await getDocs(collection(db, 'hero_slides'));
      const activeIds = new Set(slides.map((s) => s.id));
      for (const d of snap.docs) {
        if (!activeIds.has(d.id)) {
          await deleteDoc(doc(db, 'hero_slides', d.id));
        }
      }

      // 2. Save active slides
      for (const slide of slides) {
        const docRef = doc(db, 'hero_slides', slide.id);
        const cleanData = cleanFirestoreData(slide);
        await setDoc(docRef, cleanData);
      }
    } catch (error) {
      console.error('Firestore saveHeroSlides failed:', error);
    }
  }
  saveLocalHeroSlides(slides);
  return slides;
}

export async function deleteHeroSlide(slideId: string): Promise<boolean> {
  if (isConfigured && db) {
    try {
      await deleteDoc(doc(db, 'hero_slides', slideId));
    } catch (error) {
      console.error('Firestore deleteHeroSlide error:', error);
    }
  }
  const local = getLocalHeroSlides().filter((s) => s.id !== slideId);
  saveLocalHeroSlides(local);
  return true;
}

// ---------------- DYNAMIC LANDING SECTIONS CRUD ----------------

let memoryLandingSections: { data: DynamicSection[]; timestamp: number } | null = null;

export function invalidateLandingSectionsCache() {
  memoryLandingSections = null;
}

export function getLocalLandingSections(): DynamicSection[] {
  if (typeof window === 'undefined') return [];
  try {
    const data = localStorage.getItem('print_today_landing_sections');
    if (data) {
      const parsed = JSON.parse(data);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch {}
  return [];
}

export function saveLocalLandingSections(sections: DynamicSection[]) {
  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem('print_today_landing_sections', JSON.stringify(sections));
      window.dispatchEvent(new CustomEvent('print_today_sections_updated', { detail: sections }));
    } catch {}
  }
}

export async function getLandingSections(): Promise<DynamicSection[]> {
  const now = Date.now();
  if (memoryLandingSections && now - memoryLandingSections.timestamp < MEMORY_CACHE_TTL_MS) {
    return memoryLandingSections.data;
  }

  const local = getLocalLandingSections();
  if (isConfigured && db) {
    try {
      const snap = await getDocs(collection(db, 'landing_sections'));
      if (!snap.empty) {
        const sections = snap.docs.map((d) => ({
          id: d.id,
          ...d.data(),
        })) as DynamicSection[];
        sections.sort((a, b) => (a.order || 0) - (b.order || 0));
        memoryLandingSections = { data: sections, timestamp: now };
        saveLocalLandingSections(sections);
        return sections;
      }
    } catch (error) {
      console.warn('Firestore getLandingSections failed, using fallback:', error);
    }
  }
  return local.sort((a, b) => (a.order || 0) - (b.order || 0));
}

export async function createLandingSection(input: DynamicSectionInput): Promise<DynamicSection> {
  invalidateLandingSectionsCache();
  const newSection: DynamicSection = {
    ...input,
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };

  if (isConfigured && db) {
    try {
      const cleanData = cleanFirestoreData(newSection);
      const docRef = await addDoc(collection(db, 'landing_sections'), cleanData);
      newSection.id = docRef.id;
      const local = getLocalLandingSections();
      local.push(newSection);
      saveLocalLandingSections(local);
      return newSection;
    } catch (error) {
      console.error('Firestore createLandingSection failed:', error);
      throw error;
    }
  }

  newSection.id = `sec-${Date.now()}`;
  const local = getLocalLandingSections();
  local.push(newSection);
  saveLocalLandingSections(local);
  return newSection;
}

export async function updateLandingSection(
  id: string,
  updates: Partial<DynamicSection>
): Promise<DynamicSection | null> {
  invalidateLandingSectionsCache();
  const payload = {
    ...updates,
    updatedAt: Date.now(),
  };

  if (isConfigured && db) {
    try {
      const cleanData = cleanFirestoreData(payload);
      const docRef = doc(db, 'landing_sections', id);
      await updateDoc(docRef, cleanData);
    } catch (error) {
      console.error('Firestore updateLandingSection failed:', error);
      throw error;
    }
  }

  const local = getLocalLandingSections();
  const idx = local.findIndex((s) => s.id === id);
  if (idx !== -1) {
    local[idx] = { ...local[idx], ...payload };
    saveLocalLandingSections(local);
    return local[idx];
  }
  return { id, ...payload } as DynamicSection;
}

export async function deleteLandingSection(id: string): Promise<boolean> {
  invalidateLandingSectionsCache();
  if (isConfigured && db) {
    try {
      const docRef = doc(db, 'landing_sections', id);
      await deleteDoc(docRef);
    } catch (error) {
      console.error('Firestore deleteLandingSection error:', error);
      throw error;
    }
  }

  const local = getLocalLandingSections().filter((s) => s.id !== id);
  saveLocalLandingSections(local);
  return true;
}

