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
import { Product, CategoryConfig, Inquiry, ProductInput } from './types';
import { SEED_PRODUCTS, INITIAL_CATEGORIES } from './data';
import { slugify } from './utils';

// Helper to get local stored products if offline
function getLocalProducts(): Product[] {
  if (typeof window === 'undefined') return SEED_PRODUCTS;
  try {
    const data = localStorage.getItem('print_today_products');
    if (data) {
      return JSON.parse(data);
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

function getLocalCategories(): CategoryConfig[] {
  if (typeof window === 'undefined') return INITIAL_CATEGORIES;
  try {
    const data = localStorage.getItem('print_today_categories');
    if (data) {
      return JSON.parse(data);
    }
  } catch {}
  return INITIAL_CATEGORIES;
}

function saveLocalCategories(cats: CategoryConfig[]) {
  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem('print_today_categories', JSON.stringify(cats));
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

      if (!snap.empty) {
        const products = snap.docs.map((d) => ({
          id: d.id,
          ...d.data(),
        })) as Product[];
        return products;
      }
    } catch (error) {
      console.warn('Firestore fetch products failed, using local/seed fallback:', error);
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

// Seed initial default products to Firestore
export async function seedDefaultCatalogToFirestore(): Promise<{ count: number }> {
  if (!isConfigured || !db) {
    throw new Error('Firebase is not configured.');
  }

  let count = 0;
  for (const prod of SEED_PRODUCTS) {
    const { id, ...prodData } = prod;
    await addDoc(collection(db, 'products'), {
      ...prodData,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });
    count++;
  }

  for (const cat of INITIAL_CATEGORIES) {
    await setDoc(doc(db, 'categories', cat.name.toLowerCase()), cat);
  }

  return { count };
}

// ---------------- CATEGORIES CRUD ----------------

export async function getCategories(): Promise<CategoryConfig[]> {
  if (isConfigured && db) {
    try {
      const snap = await getDocs(collection(db, 'categories'));
      if (!snap.empty) {
        return snap.docs.map((d) => ({ id: d.id, ...d.data() })) as CategoryConfig[];
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
  subcategories?: string[];
}): Promise<CategoryConfig> {
  const newCat: CategoryConfig = {
    name: cat.name.trim(),
    description: cat.description?.trim(),
    subcategories: cat.subcategories || [],
  };

  const docId = cat.name.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-');

  if (isConfigured && db) {
    try {
      await setDoc(doc(db, 'categories', docId), newCat);
      newCat.id = docId;
    } catch (error) {
      console.error('Firestore createCategory failed:', error);
      throw error;
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

export async function deleteCategory(categoryName: string): Promise<boolean> {
  const docId = categoryName.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-');

  if (isConfigured && db) {
    try {
      await deleteDoc(doc(db, 'categories', docId));
    } catch (error) {
      console.error('Firestore deleteCategory failed:', error);
      throw error;
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
      console.error('Firestore updateCategorySubcategories failed:', error);
      throw error;
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
