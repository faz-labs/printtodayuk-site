import type { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  const baseUrl = (process.env.NEXT_PUBLIC_SITE_URL || 'https://www.printtodayuk.com').replace(/\/+$/, '');

  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/cms/', '/api/'],
      },
      // GEO (Generative Engine Optimization) rules for AI search & answer engines
      {
        userAgent: [
          'GPTBot',
          'ChatGPT-User',
          'PerplexityBot',
          'ClaudeBot',
          'anthropic-ai',
          'Google-Extended',
          'Applebot-Extended',
          'Amazonbot',
          'cohere-ai',
          'Bingbot',
        ],
        allow: [
          '/',
          '/same-day-printing',
          '/all-products',
          '/clothing',
          '/product/*',
          '/category/*',
          '/artwork-guides/*',
          '/contact-us',
          '/printing-east-london',
          '/same-day-t-shirt-printing-london',
          '/document-printing-near-me',
          '/christmas-printing',
          '/new-year-2027-calendars-planners',
          '/llms.txt',
        ],
        disallow: ['/cms/', '/api/'],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}

