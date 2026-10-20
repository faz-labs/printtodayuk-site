import React from 'react';
import type { Metadata } from 'next';
import { getProductById, getProducts } from '@/lib/db';
import { ProductDetailClient } from '@/components/storefront/ProductDetailClient';

export const dynamic = 'force-dynamic';

interface PageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  const product = await getProductById(id).catch(() => null);

  if (!product) {
    return {
      title: 'Product Not Found | Print Today UK',
      description: 'The requested print or apparel product is not available.',
    };
  }

  const pageTitle = `${product.title} | Same Day Custom Printing London`;
  const pageDescription =
    product.description ||
    `Order custom ${product.title} in London with express same-day printing and collection or delivery.`;

  return {
    title: pageTitle,
    description: pageDescription,
    openGraph: {
      title: pageTitle,
      description: pageDescription,
      images: product.imageUrl ? [{ url: product.imageUrl, alt: product.title }] : [],
    },
    twitter: {
      card: 'summary_large_image',
      title: pageTitle,
      description: pageDescription,
      images: product.imageUrl ? [product.imageUrl] : [],
    },
  };
}

export default async function ProductDetailPage({ params }: PageProps) {
  const { id } = await params;
  const product = await getProductById(id).catch(() => null);

  const relatedProducts = product
    ? (await getProducts(product.category).catch(() => []))
        .filter((p) => p.id !== product.id && p.slug !== product.slug)
        .slice(0, 4)
    : [];

  return (
    <ProductDetailClient
      productIdOrSlug={id}
      initialProduct={product}
      initialRelatedProducts={relatedProducts}
    />
  );
}
