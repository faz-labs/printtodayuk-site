import { Product, CategoryConfig, HeroSlide } from './types';

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

export const DEFAULT_HERO_SLIDES: HeroSlide[] = [];

