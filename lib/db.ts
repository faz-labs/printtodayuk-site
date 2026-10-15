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
} from 'firebase/firestore';
import { db, isConfigured } from './firebase';
import { Product, CategoryConfig, Inquiry, ProductInput, HeroSlide } from './types';
import { INITIAL_CATEGORIES, SEED_PRODUCTS, DEFAULT_HERO_SLIDES } from './data';
import { slugify } from './utils';


// Helper to get local stored products if offline
function getLocalProducts(): Product[] {
  if (typeof window === 'undefined') return SEED_PRODUCTS;
  try {
    const data = localStorage.getItem('print_today_products');
    if (data) {
      const parsed = JSON.parse(data);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch {}
  return SEED_PRODUCTS;
}

function saveLocalProducts(products: Product[]) {
  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem('print_today_products', JSON.stringify(products));
    } catch {}
  }
}

export function getLocalCategories(): CategoryConfig[] {
  if (typeof window === 'undefined') {
    return INITIAL_CATEGORIES.filter(
      (c) => c && c.name && c.name.toLowerCase() !== 'printing' && c.name.toLowerCase() !== 'clothing'
    );
  }

  try {
    const data = localStorage.getItem('print_today_categories');

    if (data !== null) {
      const parsed: CategoryConfig[] = JSON.parse(data);
      if (Array.isArray(parsed) && parsed.length > 0) {
        const filtered = parsed.filter(
          (c) => c && c.name && c.name.toLowerCase() !== 'printing' && c.name.toLowerCase() !== 'clothing'
        );

        // Check if data only contained legacy umbrella categories 'Printing' & 'Clothing'
        const onlyLegacy =
          filtered.length === 0 ||
          filtered.every(
            (c) =>
              c &&
              c.name &&
              (c.name.toLowerCase() === 'printing' || c.name.toLowerCase() === 'clothing')
          );

        if (!onlyLegacy && filtered.length > 0) {
          return filtered;
        }
      }
    }
  } catch {}

  // Seed default independent categories
  const initialFiltered = INITIAL_CATEGORIES.filter(
    (c) => c && c.name && c.name.toLowerCase() !== 'printing' && c.name.toLowerCase() !== 'clothing'
  );
  if (typeof window !== 'undefined') {
    localStorage.setItem('print_today_categories_initialized', 'true');
    localStorage.setItem('print_today_categories', JSON.stringify(initialFiltered));
  }
  return initialFiltered;
}

export function saveLocalCategories(cats: CategoryConfig[]) {
  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem('print_today_categories_initialized', 'true');
      localStorage.setItem('print_today_categories', JSON.stringify(cats));
      window.dispatchEvent(new CustomEvent('print_today_categories_updated', { detail: cats }));
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

export async function getProducts(category?: string): Promise<Product[]> {
  if (isConfigured && db) {
    try {
      const q = collection(db, 'products');
      let snap;
      if (category) {
        snap = await getDocs(query(q, where('category', '==', category)));
      } else {
        snap = await getDocs(q);
      }

      const products = snap.docs.map((d) => ({
        id: d.id,
        ...d.data(),
      })) as Product[];
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
  if (isConfigured && db) {
    try {
      // Direct doc ID check
      const docRef = doc(db, 'products', idOrSlug);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        return { id: docSnap.id, ...docSnap.data() } as Product;
      }

      // Slug query check
      const q = query(collection(db, 'products'), where('slug', '==', idOrSlug));
      const snap = await getDocs(q);
      if (!snap.empty) {
        const firstDoc = snap.docs[0];
        return { id: firstDoc.id, ...firstDoc.data() } as Product;
      }

      // If Firestore is configured and product was not found, return null
      return null;
    } catch (error) {
      console.warn('Firestore fetch single product error:', error);
    }
  }

  const local = getLocalProducts();
  const found = local.find((p) => p.id === idOrSlug || p.slug === idOrSlug);
  return found || null;
}

export async function createProduct(productInput: ProductInput): Promise<Product> {
  const newProduct: Product = {
    ...productInput,
    slug: productInput.slug || slugify(productInput.title),
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };

  if (isConfigured && db) {
    try {
      const docRef = await addDoc(collection(db, 'products'), newProduct);
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
  const payload = {
    ...updates,
    updatedAt: Date.now(),
  };

  if (isConfigured && db) {
    try {
      const docRef = doc(db, 'products', id);
      await updateDoc(docRef, payload);
    } catch (error) {
      console.error('Firestore updateProduct failed:', error);
      throw error;
    }
  }

  const local = getLocalProducts();
  const index = local.findIndex((p) => p.id === id || p.slug === id);
  if (index !== -1) {
    local[index] = { ...local[index], ...payload };
    saveLocalProducts(local);
    return local[index];
  }

  return { id, ...payload } as Product;
}

export async function deleteProduct(id: string): Promise<boolean> {
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

// Seed initial default categories to Firestore
export async function seedDefaultCatalogToFirestore(): Promise<{ count: number }> {
  if (!isConfigured || !db) {
    throw new Error('Firebase is not configured.');
  }

  let count = 0;
  for (const cat of INITIAL_CATEGORIES) {
    const docId = cat.name.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-');
    await setDoc(doc(db, 'categories', docId), cat);
    count++;
  }

  return { count };
}

// ---------------- CATEGORIES CRUD ----------------

export async function getCategories(): Promise<CategoryConfig[]> {
  if (isConfigured && db) {
    try {
      const snap = await getDocs(collection(db, 'categories'));
      if (!snap.empty) {
        let firestoreCats = snap.docs.map((d) => ({ id: d.id, ...d.data() })) as CategoryConfig[];
        firestoreCats = firestoreCats.filter(
          (c) => c && c.name && c.name.toLowerCase() !== 'printing' && c.name.toLowerCase() !== 'clothing'
        );
        // Only adopt Firestore categories if it actually contains valid independent categories.
        // If Firestore only contains legacy umbrella categories ('Printing' / 'Clothing'),
        // firestoreCats will be empty, so DO NOT overwrite active local categories!
        if (firestoreCats.length > 0) {
          saveLocalCategories(firestoreCats);
          return firestoreCats;
        }
      }
    } catch (error) {
      console.warn('Firestore fetch categories error:', error);
    }
  }

  return getLocalCategories();
}

export async function createCategory(cat: {
  name: string;
  description?: string;
  imageUrl?: string;
  subcategories?: string[];
  subcategoryImages?: Record<string, string>;
}): Promise<CategoryConfig> {
  const newCat: CategoryConfig = {
    name: cat.name.trim(),
    description: cat.description?.trim(),
    imageUrl: cat.imageUrl,
    subcategories: cat.subcategories || [],
    subcategoryImages: cat.subcategoryImages || {},
  };

  const docId = cat.name.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-');

  if (isConfigured && db) {
    try {
      await setDoc(doc(db, 'categories', docId), newCat);
      newCat.id = docId;
    } catch (error) {
      console.warn('Firestore createCategory warning (offline/auth):', error);
    }
  }

  const local = getLocalCategories();
  const existingIdx = local.findIndex((c) => c.name.toLowerCase() === cat.name.toLowerCase());
  if (existingIdx !== -1) {
    local[existingIdx] = newCat;
  } else {
    local.push(newCat);
  }
  saveLocalCategories(local);
  return newCat;
}

export async function deleteCategory(categoryName: string, categoryId?: string): Promise<boolean> {
  const docId = categoryName.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-');
  const rawId = categoryName.toLowerCase().trim();

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
  const filtered = local.filter((c) => c.name.toLowerCase() !== categoryName.toLowerCase());
  saveLocalCategories(filtered);
  return true;
}

export async function updateCategorySubcategories(
  categoryName: string,
  subcategories: string[]
): Promise<CategoryConfig[]> {
  const docId = categoryName.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-');

  if (isConfigured && db) {
    try {
      const docRef = doc(db, 'categories', docId);
      await setDoc(docRef, { name: categoryName, subcategories }, { merge: true });
    } catch (error) {
      console.warn('Firestore updateCategorySubcategories warning (offline/auth):', error);
    }
  }

  const local = getLocalCategories();
  const index = local.findIndex((c) => c.name.toLowerCase() === categoryName.toLowerCase());
  if (index !== -1) {
    local[index].subcategories = subcategories;
  } else {
    local.push({ name: categoryName, subcategories });
  }
  saveLocalCategories(local);
  return local;
}

export async function updateCategory(
  categoryName: string,
  updates: Partial<CategoryConfig>
): Promise<CategoryConfig> {
  const docId = categoryName.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-');

  if (isConfigured && db) {
    try {
      const docRef = doc(db, 'categories', docId);
      await setDoc(docRef, { name: categoryName, ...updates }, { merge: true });
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
      subcategories: [],
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

function getLocalHeroSlides(): HeroSlide[] {
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

function saveLocalHeroSlides(slides: HeroSlide[]) {
  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem('print_today_hero_slides', JSON.stringify(slides));
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
      for (const slide of slides) {
        const docRef = doc(db, 'hero_slides', slide.id);
        await setDoc(docRef, slide, { merge: true });
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
