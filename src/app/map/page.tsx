"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, MapPin, Calendar, ChevronRight, AlertCircle } from 'lucide-react';
import { Map, MapMarker, useKakaoLoader } from 'react-kakao-maps-sdk';
import marathonData from '@/data/marathons.json';

export default function MapPage() {
  const router = useRouter();
  const [selectedRace, setSelectedRace] = useState<any>(null);
  const [positions, setPositions] = useState<any[]>([]);
  
  // 가용한 모든 변수명 체크 (보안을 위해 값은 노출 안 함)
  const KAKAO_KEY = process.env.NEXT_PUBLIC_KAKAO_MAPS_CLIENT_ID || process.env.NEXT_PUBLIC_KAKAO_MAP_API_KEY;

  const [loading, error] = useKakaoLoader({
    appkey: KAKAO_KEY || "",
    libraries: ["services"],
  });

  useEffect(() => {
    if (!KAKAO_KEY) {
      console.error("🚫 RUN HUB Error: 카카오 API 키가 설정되지 않았습니다. NEXT_PUBLIC_KAKAO_MAPS_CLIENT_ID 또는 NEXT_PUBLIC_KAKAO_MAP_API_KEY를 확인하세요.");
    }
    if (error) {
      console.error("🚫 Kakao SDK Load Error:", error);
    }
  }, [KAKAO_KEY, error]);

  useEffect(() => {
    if (!loading && !error && (window as any).kakao) {
      const geocoder = new (window as any).kakao.maps.services.Geocoder();
      
      marathonData.forEach((race: any) => {
        if (!race.location) return;
        const cleanAddr = race.location.split('(')[0].trim();

        geocoder.addressSearch(cleanAddr, (result: any, status: any) => {
          if (status === (window as any).kakao.maps.services.Status.OK) {
            setPositions(prev => {
              if (prev.find(p => p.id === race.id)) return prev;
              return [...prev, { ...race, lat: result[0].y, lng: result[0].x }];
            });
          }
        });
      });
    }
  }, [loading, error]);

  // 에러 화면 개선 (사용자가 원인을 알 수 있게 함)
  if (!KAKAO_KEY || error) {
    return (
      <div className="h-screen flex flex-col items-center justify-center bg-slate-50 p-10 text-center font-sans">
        <AlertCircle className="w-16 h-16 text-rose-500 mb-6" />
        <h2 className="text-2xl font-black text-slate-900 mb-4 uppercase tracking-tighter">Maps Link Error</h2>
        <div className="space-y-2 text-slate-500 font-medium text-sm mb-10">
          {!KAKAO_KEY && <p>• 환경 변수(API KEY)가 설정되지 않았습니다.</p>}
          {error && <p>• 도메인 설정이 올바르지 않거나 네트워크 오류입니다.</p>}
          <p className="mt-4 text-slate-400 text-xs">카카오 개발자 센터에서 <b>{typeof window !== 'undefined' ? window.location.origin : '도메인'}</b>이 등록되어 있는지 확인하세요.</p>
        </div>
        <button onClick={() => router.push('/')} className="px-10 py-4 bg-slate-900 text-white rounded-[20px] font-black shadow-xl">메인으로 돌아가기</button>
      </div>
    );
  }

  return (
    <main className="relative h-screen bg-[#F1F5F9] overflow-hidden font-sans text-slate-900">
      {!loading && (
        <Map
          center={{ lat: 36.5, lng: 127.5 }}
          style={{ width: '100%', height: '100%' }}
          level={12}
        >
          {positions.map((race) => (
            <MapMarker
              key={race.id}
              position={{ lat: parseFloat(race.lat), lng: parseFloat(race.lng) }}
              onClick={() => setSelectedRace(race)}
              image={{
                src: "https://t1.daumcdn.net/localimg/localimages/07/mapapidoc/markerStar.png",
                size: { width: 24, height: 35 }
              }}
            />
          ))}
        </Map>
      )}

      {/* Overlays... (생략 없는 전체 UI 유지) */}
      <div className="absolute top-6 left-4 right-4 z-20 max-w-md mx-auto">
        <div className="bg-white/90 backdrop-blur-xl rounded-[24px] shadow-2xl border border-white/20 p-2 flex items-center gap-3">
          <button onClick={() => router.push('/')} className="p-3 hover:bg-slate-100 rounded-2xl transition-colors">
            <ArrowLeft className="w-6 h-6" />
          </button>
          <div className="flex-1 text-sm font-black uppercase tracking-tighter italic">Runner Maps</div>
          <div className="pr-4"><div className="w-2.5 h-2.5 bg-emerald-500 rounded-full animate-pulse" /></div>
        </div>
      </div>

      {selectedRace && (
        <div className="absolute bottom-10 left-4 right-4 z-30 max-w-md mx-auto animate-in slide-in-from-bottom duration-500">
          <div className="bg-white rounded-[32px] shadow-[0_20px_60px_-10px_rgba(0,0,0,0.3)] p-7 border border-slate-100 relative">
            <button onClick={() => setSelectedRace(null)} className="absolute top-4 right-6 text-slate-300 text-2xl">&times;</button>
            <h3 className="text-[20px] font-black mb-5 leading-tight">{selectedRace.name}</h3>
            <button onClick={() => router.push(`/marathon/${selectedRace.id}`)} className="w-full py-4 bg-slate-900 text-white rounded-[20px] font-black flex items-center justify-center gap-2">상세보기 <ChevronRight className="w-4 h-4" /></button>
          </div>
        </div>
      )}

      {loading && (
        <div className="absolute inset-0 z-50 bg-white flex flex-col items-center justify-center">
          <div className="w-12 h-12 border-4 border-blue-100 border-t-blue-600 rounded-full animate-spin mb-4" />
          <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest italic">Connecting Maps...</p>
        </div>
      )}
    </main>
  );
}
