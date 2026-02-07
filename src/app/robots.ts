import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/api/', '/_next/'], // 핵심 API 및 내부 구조 보호
    },
    sitemap: 'https://global-marathon-hub.vercel.app/sitemap.xml',
  };
}
