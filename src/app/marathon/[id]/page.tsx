import React from 'react';
import { Metadata } from 'next';
import marathonData from '@/data/marathons.json';
import DetailClient from './DetailClient';
import { notFound } from 'next/navigation';

interface Props {
  params: { id: string };
}

// 동적 메타데이터 생성 (SEO)
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const race = marathonData.find(m => m.id.toString() === params.id);
  
  if (!race) return { title: '대회를 찾을 수 없습니다' };

  return {
    title: `${race.name} | RUN HUB`,
    description: `${race.date} ${race.location}에서 열리는 마라톤 대회 정보입니다.`,
    openGraph: {
      title: race.name,
      description: `${race.date} - ${race.location}`,
      images: ['/og-image.png'],
    },
  };
}

export default function MarathonDetailPage({ params }: Props) {
  const race = marathonData.find(m => m.id.toString() === params.id);

  if (!race) {
    notFound();
  }

  return <DetailClient race={race} />;
}