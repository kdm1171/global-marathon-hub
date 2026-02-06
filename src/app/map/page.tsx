"use client";

import React, { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, AlertCircle } from 'lucide-react';
import marathonData from '@/data/marathons.json';

const SCRIPT_ID = 'kakao-map-sdk';

function waitForKakao(timeout: number): Promise<void> {
  return new Promise((resolve, reject) => {
    const start = Date.now();
    const poll = () => {
      if (window.kakao?.maps?.LatLng) {
        resolve();
      } else if (Date.now() - start > timeout) {
        reject(new Error('카카오 SDK 로드 시간 초과 (API 키 또는 도메인 설정을 확인하세요)'));
      } else {
        setTimeout(poll, 100);
      }
    };
    poll();
  });
}

function loadKakaoSDK(appkey: string): Promise<void> {
  // 이미 완전히 로드된 경우
  if (window.kakao?.maps?.LatLng) {
    return Promise.resolve();
  }

  // 스크립트 태그가 이미 있으면 중복 삽입하지 않고 대기
  if (document.getElementById(SCRIPT_ID)) {
    return waitForKakao(10000);
  }

  return new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.id = SCRIPT_ID;
    script.src = `https://dapi.kakao.com/v2/maps/sdk.js?appkey=${appkey}&libraries=services&autoload=false`;
    script.async = true;

    script.onload = () => {
      try {
        window.kakao.maps.load(() => resolve());
      } catch (e) {
        reject(new Error('카카오 SDK가 로드되었으나 초기화에 실패했습니다. API 키를 확인하세요.'));
      }
    };
    script.onerror = () => reject(new Error('카카오 서버 응답 오류 또는 도메인 차단'));

    document.head.appendChild(script);
  });
}

export default function MapPage() {
  const router = useRouter();
  const mapContainer = useRef<HTMLDivElement>(null);
  const [status, setStatus] = useState<'loading' | 'ready' | 'error'>('loading');
  const [errorDetail, setErrorDetail] = useState('');

  useEffect(() => {
    let cancelled = false;

    const KAKAO_KEY = process.env.NEXT_PUBLIC_KAKAO_MAP_API_KEY;
    if (!KAKAO_KEY) {
      setStatus('error');
      setErrorDetail('API KEY가 설정되지 않았습니다.');
      return;
    }

    loadKakaoSDK(KAKAO_KEY)
      .then(() => {
        if (cancelled || !mapContainer.current) return;

        const map = new window.kakao.maps.Map(mapContainer.current, {
          center: new window.kakao.maps.LatLng(36.5, 127.5),
          level: 12,
        });
        const geocoder = new window.kakao.maps.services.Geocoder();

        marathonData.slice(0, 30).forEach((race: any) => {
          if (!race.location) return;
          const cleanAddr = race.location.split('~')[0].split('(')[0].trim();
          geocoder.addressSearch(cleanAddr, (result: any, stat: any) => {
            if (stat === window.kakao.maps.services.Status.OK) {
              const coords = new window.kakao.maps.LatLng(result[0].y, result[0].x);
              const marker = new window.kakao.maps.Marker({ map, position: coords });
              window.kakao.maps.event.addListener(marker, 'click', () => {
                alert(`${race.name}\n${race.date}`);
              });
            }
          });
        });

        setStatus('ready');
      })
      .catch((err) => {
        if (cancelled) return;
        setStatus('error');
        setErrorDetail(err.message || '지도 초기화 중 내부 오류 발생');
      });

    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <main className="relative h-screen bg-slate-50">
      <div ref={mapContainer} className="w-full h-full" />

      <div className="absolute top-6 left-4 z-20">
        <button onClick={() => router.push('/')} className="p-3 bg-white shadow-xl rounded-full hover:bg-slate-50 transition-colors">
          <ArrowLeft className="w-6 h-6 text-slate-900" />
        </button>
      </div>

      {status === 'loading' && (
        <div className="absolute inset-0 z-50 bg-white flex flex-col items-center justify-center">
          <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-4" />
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Launching Marathon Map...</p>
        </div>
      )}

      {status === 'error' && (
        <div className="absolute inset-0 z-[60] bg-white flex flex-col items-center justify-center p-10 text-center">
          <AlertCircle className="w-16 h-16 text-rose-500 mb-4" />
          <h2 className="text-xl font-black text-slate-900 mb-2">지도를 띄울 수 없습니다</h2>
          <p className="text-slate-500 text-sm mb-8 font-medium">{errorDetail}</p>
          <button onClick={() => window.location.reload()} className="px-8 py-3 bg-slate-900 text-white rounded-xl font-bold">새로고침</button>
        </div>
      )}
    </main>
  );
}
