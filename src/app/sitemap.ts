import { MetadataRoute } from 'next';
import marathons from '@/data/marathons.json';

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://global-marathon-hub.vercel.app';

  // 기본 페이지
  const routes = ['', '/map'].map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: 'daily' as const,
    priority: 1,
  }));

  // 모든 마라톤 상세 페이지 추가 (180+)
  const marathonRoutes = marathons.map((m: any) => ({
    url: `${baseUrl}/marathon/${m.id}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: 0.8,
  }));

  return [...routes, ...marathonRoutes];
}
