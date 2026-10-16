export type ProductCategory = string;

export type InquiryType = 'call_me' | 'quote' | 'general';

export interface CustomField {
  id: string;
  name: string; // e.g. "Choose A Size" or "Choose A Finish"
  options: string[]; // e.g. ["85x55mm Standard", "66x55mm Mini", "Custom"]
  required?: boolean;
  defaultValue?: string;
}

export interface Product {
  id?: string;
  title: string;
  slug: string;
  description: string;
  imageUrl: string;
  images?: string[];
  price: number;
  discountedPrice?: number;
  category: ProductCategory;
  subcategory?: string; // Optional legacy field
  isSameDayAvailable: boolean;
  minQuantity?: number;
  features?: string[];
  customFields?: CustomField[];
  createdAt: number;
  updatedAt: number;
}

export interface CategoryConfig {
  id?: string;
  name: string;
  slug?: string;
  icon?: string;
  imageUrl?: string;
  description?: string;
  metaTitle?: string;
  metaDescription?: string;
  isBestSeller?: boolean;
  subcategories?: string[]; // Kept optional for backwards compatibility
  subcategoryImages?: Record<string, string>;
}

export interface Inquiry {
  id?: string;
  type?: InquiryType;
  name?: string;
  phone: string;
  email?: string;
  details?: string;
  productId?: string;
  productTitle?: string;
  productContext?: string;
  selectedOptions?: Record<string, string>;
  status?: 'pending' | 'contacted' | 'resolved';
  createdAt: number;
}

export interface HeroSlide {
  id: string;
  imageUrl: string;
  title?: string;
  linkUrl?: string;
  order?: number;
}

export type DynamicSectionType = 'horizontal_scroll' | 'grid_8_tiles';

export interface DynamicSection {
  id?: string;
  title: string;
  subtitle?: string;
  type: DynamicSectionType; // 'horizontal_scroll' (auto-scroll row) or 'grid_8_tiles' (2 rows x 4 items)
  sourceType: 'category' | 'products';
  categoryName?: string;
  productIds?: string[];
  order: number;
  isActive: boolean;
  createdAt?: number;
  updatedAt?: number;
}

export type ProductInput = Omit<Product, 'id' | 'createdAt' | 'updatedAt'>;
export type InquiryInput = Omit<Inquiry, 'id' | 'createdAt'>;
export type DynamicSectionInput = Omit<DynamicSection, 'id' | 'createdAt' | 'updatedAt'>;
