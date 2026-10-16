import { Product, CategoryConfig } from './types';

// Dummy / seed category identifiers used to purge mock data from Firestore
export const DUMMY_CATEGORY_NAMES = [
  'brochures & booklets',
  'canopies & gazebos',
  'flyers & leaflets',
  'hoodies & sweatshirts',
  'id cards & lanyards',
  'notebooks & diaries',
  'personalised mugs',
  'polo shirts',
  'posters & signs',
  'promotional pens',
  'pvc banners',
  'stickers & labels',
  't-shirts',
  'tote bags',
  'water bottles',
  'workwear & high-vis',
  'roller banners',
  'business cards',
  'gift items',
  'printing',
  'clothing',
];

export const DUMMY_PRODUCT_IDS = [
  'gift-ceramic-mug-01',
  'gift-magic-color-mug-02',
  'gift-engraved-metal-pen-01',
  'gift-soft-touch-pens-02',
  'gift-stainless-water-bottle-01',
];

// No default mock categories - catalog is purely managed via CMS & Firestore
export const INITIAL_CATEGORIES: CategoryConfig[] = [];

// No default mock products - products are purely managed via CMS & Firestore
export const SEED_PRODUCTS: Product[] = [];

export const DEFAULT_HERO_SLIDES = [
  {
    id: 'hero-slide-1',
    imageUrl: 'https://images.unsplash.com/photo-1561070791-2526d30994b5?q=80&w=1800&auto=format&fit=crop',
    title: 'Commercial Printing & Fast Dispatch',
    linkUrl: '/category/Printing',
    order: 1,
  },
  {
    id: 'hero-slide-2',
    imageUrl: 'https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?q=80&w=1800&auto=format&fit=crop',
    title: 'Custom DTF Printed Apparel & Workwear',
    linkUrl: '/category/Clothing',
    order: 2,
  },
  {
    id: 'hero-slide-3',
    imageUrl: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?q=80&w=1800&auto=format&fit=crop',
    title: 'Personalised Corporate Gifts & Merchandise',
    linkUrl: '/category/Gift%20Items',
    order: 3,
  },
  {
    id: 'hero-slide-4',
    imageUrl: 'https://images.unsplash.com/photo-1589829085413-56de8ae18c73?q=80&w=1800&auto=format&fit=crop',
    title: 'Luxury Business Cards & Marketing Collaterals',
    linkUrl: '/category/Printing?subcat=Business%20Cards',
    order: 4,
  },
];

