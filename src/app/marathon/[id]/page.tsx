import React from 'react';
import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import marathons from '@/data/marathons.json';
import DetailClient from './DetailClient';

interface Props {
  params: { id: string };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const marathon = marathons.find(m => m.id === parseInt(params.id));
  if (!marathon) return { title: '대회를 찾을 수 없습니다' };

  const title = `${marathon.name} 일정 및 접수 정보 | RUN HUB`;
  const description = `${marathon.date}에 개최되는 ${marathon.name}의 상세 정보입니다. 장소: ${marathon.location}. 지금 RUN HUB에서 확인하세요.`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: 'website',
      url: `https://global-marathon-hub.vercel.app/marathon/${params.id}`,
      images: [{ url: '/og-image.png' }],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
    },
  };
}

export default function MarathonDetailPage({ params }: Props) {
  const marathon = marathons.find(m => m.id === parseInt(params.id));
  if (!marathon) notFound();

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Event',
    name: marathon.name,
    startDate: marathon.date,
    location: {
      '@type': 'Place',
      name: marathon.location,
      address: {
        '@type': 'PostalAddress',
        addressLocality: marathon.location,
        addressCountry: 'KR',
      },
    },
    description: `${marathon.name} 마라톤 대회 정보`,
    organizer: {
      '@type': 'Organization',
      name: marathon.organizer,
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <DetailClient race={marathon} />
    </>
  );
}
