import { Product, CategoryConfig } from './types';

export const PRINTING_SUBCATEGORIES = [
  'All',
  'Business Cards',
  'Flyers & Leaflets',
  'Brochures & Booklets',
  'PVC Banners',
  'Posters & Signs',
  'Canopies & Gazebos',
  'ID Cards & Lanyards',
  'Branded USBs & Pens',
  'Stickers & Labels',
];

export const CLOTHING_SUBCATEGORIES = [
  'All',
  'T-Shirts',
  'Hoodies & Sweatshirts',
  'Polo Shirts',
  'Workwear & High-Vis',
  'Caps & Headwear',
  'Tote Bags & Aprons',
];

export const INITIAL_CATEGORIES: CategoryConfig[] = [
  {
    name: 'Printing',
    subcategories: PRINTING_SUBCATEGORIES.filter((c) => c !== 'All'),
  },
  {
    name: 'Clothing',
    subcategories: CLOTHING_SUBCATEGORIES.filter((c) => c !== 'All'),
  },
];

export const SEED_PRODUCTS: Product[] = [];

