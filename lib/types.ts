export type ProductCategory = string;

export type InquiryType = 'call_me' | 'quote' | 'general';

export interface CustomField {
  id: string;
  name: string; // e.g. "Choose A Size" or "Choose A Finish"
  options: string[]; // e.g. ["85x55mm Standard", "66x55mm Mini", "Custom"]
  required?: boolean;
  defaultValue?: string;
}

export interface QuantityTier {
  quantity: number;
  price?: number;            // Explicit price in £ (used for first tier / base price)
  percentIncrease?: number;  // % increase from base price (used for tier 2, 3, etc.)
}

export interface PriceMatrixConfig {
  primaryFieldId: string;        // e.g. "field_pages" (Number of Pages)
  secondaryFieldId?: string;     // e.g. "field_paper" (Inside Paper Stock) - optional
  columns: string[];             // Headers: ["8 Pages", "12 Pages", ...] or ["8 Pages - 130gsm Silk", ...]
  quantities: number[];          // Quantity rows: [25, 50, 100, 250, 500, ...]
  cells: Record<string, number>; // Key: `${quantity}__${columnName}` -> price in £
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
  maxQuantity?: number;
  maxSameDayQuantity?: number;
  maxNextDayQuantity?: number;
  sameDayIncreasePercent?: number;  // Turnaround surcharge % for same day (e.g. 35.4%)
  nextDayIncreasePercent?: number;  // Turnaround surcharge % for 1 working day (e.g. 10%)
  quantityTiers?: QuantityTier[];   // Merchant-defined explicit quantity tiers
  variantQuantityTiers?: Record<string, QuantityTier[]>; // Variant-specific quantity tiers (e.g. key is "2000 x 1500mm")
  priceMatrix?: PriceMatrixConfig;  // Process 2: Spreadsheet Price Matrix (rows=qty, cols=options)
  priceMultiplier?: number;         // Process 6: Pricing rules multiplier (e.g. 1.3)
  sourcePrice?: number;             // Process 6: Original price before multiplier
  pricingDataExternal?: boolean;    // Process 3: True when variant tables/matrix stored in Firestore subcollection
  features?: string[];
  customFields?: CustomField[];
  isActive?: boolean; // Controls whether product is published / visible on storefront
  hidePriceTable?: boolean; // When true, hides price table on storefront and displays 'Get Instant Quote via WhatsApp'
  showInMoreProducts?: boolean; // When true, lists this product alphabetically in the More Products mega menu
  createdAt: number;
  updatedAt: number;
}

export interface ProductImportValidationReport {
  valid: boolean;
  totalProducts: number;
  validCount: number;
  invalidCount: number;
  errors: Array<{ productIndex: number; slug?: string; title?: string; errors: string[] }>;
  warnings: Array<{ productIndex: number; slug?: string; warnings: string[] }>;
}

export interface ProductImportResult {
  success: boolean;
  created: number;
  updated: number;
  skipped: number;
  errors: Array<{ slug?: string; title?: string; message: string }>;
  details: Array<{ slug: string; action: 'created' | 'updated' | 'skipped' | 'error'; message?: string }>;
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
  imageUrl: string;         // Desktop / primary banner (e.g. 1920x600)
  mobileImageUrl?: string;   // Mobile-optimized banner (e.g. 800x800 or 750x900)
  title?: string;
  linkUrl?: string;
  order?: number;
}

export type DynamicSectionType = 'horizontal_scroll' | 'grid_8_tiles' | 'split_banner' | 'single_image';

export interface DynamicSection {
  id?: string;
  title: string;
  subtitle?: string;
  type: DynamicSectionType; // 'horizontal_scroll' | 'grid_8_tiles' | 'split_banner' | 'single_image'
  sourceType?: 'category' | 'products';
  categoryName?: string;
  categoryNames?: string[];
  productIds?: string[];
  // Split Banner & Single Image properties
  backgroundColor?: string;
  imageUrl?: string; // Transparent picture URL or Single Image URL
  mobileImageUrl?: string; // Optional mobile image for Single Image section
  imageWidth?: 'contained' | 'full_width'; // Layout width for Single Image section
  showSectionHeader?: boolean; // Whether to show section title/subtitle above Single Image
  layoutDirection?: 'image_left' | 'image_right'; // Left picture or right picture
  buttonText?: string;
  buttonUrl?: string;
  badgeText?: string;
  order: number;
  isActive: boolean;
  createdAt?: number;
  updatedAt?: number;
}

export type ProductInput = Omit<Product, 'id' | 'createdAt' | 'updatedAt'>;
export type InquiryInput = Omit<Inquiry, 'id' | 'createdAt'>;
export type DynamicSectionInput = Omit<DynamicSection, 'id' | 'createdAt' | 'updatedAt'>;

export type ReviewPlatform = 'google' | 'trustpilot' | 'direct';

export interface ReviewItem {
  id: string;
  author: string;
  company?: string;
  location?: string;
  rating: number; // 1 to 5
  review: string;
  product?: string;
  platform: ReviewPlatform;
  authorPhoto?: string;
  date?: string;
  isVerified?: boolean;
  isFeatured?: boolean;
  order?: number;
  createdAt?: number;
  updatedAt?: number;
}

export type ReviewInput = Omit<ReviewItem, 'id' | 'createdAt' | 'updatedAt'>;

export interface ArtworkGuide {
  id: string;
  title: string;
  slug: string;
  shortDescription: string;
  imageUrl: string;
  content: string; // Rich format HTML with headers, bold, italic, bullet points, numbering
  category?: string;
  isPublished?: boolean;
  order?: number;
  readingTime?: string;
  createdAt?: number;
  updatedAt?: number;
}

export type ArtworkGuideInput = Omit<ArtworkGuide, 'id' | 'createdAt' | 'updatedAt'>;
