"use client";

import React, { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, MapPin, Search, Calendar, ChevronRight } from 'lucide-react';
import Script from 'next/script';
import marathonData from '@/data/marathons.json';

declare global {
  interface Window {
    kakao: any;
  }
}

export default function MapPage() {
  const router = useRouter();
  const mapContainer = useRef<HTMLDivElement>(null);
  const [selectedRace, setSelectedRace] = useState<any>(null);
  const [isMapReady, setIsMapReady] = useState(false);
  const mapRef = useRef<any>(null);

  // 지도 초기화 핵심 함수
  const initMap = () => {
    const kakao = window.kakao;
    if (!kakao || !mapContainer.current || mapRef.current) return;

    kakao.maps.load(() => {
      const options = {
        center: new kakao.maps.LatLng(36.5, 127.5),
        level: 12
      };

      const map = new kakao.maps.Map(mapContainer.current, options);
      mapRef.current = map;
      const geocoder = new kakao.maps.services.Geocoder();

      // 마커 생성 (데이터 바인딩)
      marathonData.forEach((race: any) => {
        if (!race.location) return;
        const cleanAddr = race.location.split('(')[0].trim();

        geocoder.addressSearch(cleanAddr, (result: any, status: any) => {
          if (status === kakao.maps.services.Status.OK) {
            const coords = new kakao.maps.LatLng(result[0].y, result[0].x);
            const marker = new kakao.maps.Marker({ map, position: coords });

            kakao.maps.event.addListener(marker, 'click', () => {
              setSelectedRace(race);
              map.panTo(coords);
            });
          }
        });
      });
      setIsMapReady(true);
    });
  };

  // 스크립트가 이미 로드되어 있는 경우를 대비한 수동 체크
  useEffect(() => {
    if (window.kakao && window.kakao.maps) {
      initMap();
    }
  }, []);

  return (
    <main className="relative h-screen bg-slate-50 overflow-hidden font-sans">
      <Script
        src={`https://dapi.kakao.com/v2/maps/sdk.js?appkey=${process.env.NEXT_PUBLIC_KAKAO_MAPS_CLIENT_ID}&libraries=services&autoload=false`}
        strategy="afterInteractive"
        onLoad={initMap}
      />

      <div ref={mapContainer} className="w-full h-full" />

      {/* UI Overlays */}
      <div className="absolute top-6 left-4 right-4 z-20 max-w-md mx-auto">
        <div className="bg-white/90 backdrop-blur-xl rounded-[24px] shadow-2xl border border-white/20 p-2 flex items-center gap-3">
          <button onClick={() => router.push('/')} className="p-3 hover:bg-slate-100 rounded-2xl transition-colors">
            <ArrowLeft className="w-6 h-6 text-slate-900" />
          </button>
          <div className="flex-1 text-sm font-[900] text-slate-900 px-2 uppercase tracking-tighter italic">Running Maps</div>
          <div className="pr-4"><span className="px-2 py-1 bg-blue-600 text-white text-[10px] font-black rounded-lg uppercase">Live</span></div>
        </div>
      </div>

      {selectedRace && (
        <div className="absolute bottom-10 left-4 right-4 z-30 max-w-md mx-auto animate-in slide-in-from-bottom duration-500">
          <div className="bg-white rounded-[32px] shadow-[0_20px_60px_-10px_rgba(0,0,0,0.3)] p-7 border border-slate-100 relative overflow-hidden">
            <button onClick={() => setSelectedRace(null)} className="absolute top-4 right-6 text-slate-300 hover:text-slate-900 text-2xl">&times;</button>
            <div className="flex items-center gap-2 mb-4">
              <span className="px-3 py-1 rounded-full bg-blue-50 text-blue-600 text-[10px] font-black uppercase tracking-wider border border-blue-100">{selectedRace.status}</span>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{selectedRace.distance}</span>
            </div>
            <h3 className="text-[20px] font-black text-slate-900 mb-5 leading-tight">{selectedRace.name}</h3>
            <div className="space-y-2 mb-8">
              <div className="flex items-center text-slate-600 font-bold text-sm">
                <Calendar className="w-4 h-4 mr-3 text-blue-500" />
                {selectedRace.date}
              </div>
              <div className="flex items-center text-slate-600 font-bold text-sm">
                <MapPin className="w-4 h-4 mr-3 text-rose-500" />
                <span className="truncate text-slate-700 font-bold">{selectedRace.location}</span>
              </div>
            </div>
            <button 
              onClick={() => router.push(`/marathon/${selectedRace.id}`)}
              className="w-full py-4 bg-slate-900 text-white rounded-[20px] font-black flex items-center justify-center gap-2 hover:bg-blue-600 transition-all shadow-xl shadow-slate-200"
            >
              대회 상세정보 보기
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {!isMapReady && (
        <div className="absolute inset-0 z-50 bg-white flex flex-col items-center justify-center">
          <div className="w-12 h-12 border-4 border-blue-100 border-t-blue-600 rounded-full animate-spin mb-4" />
          <p className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] italic">Loading Runner Maps...</p>
        </div>
      )}
    </main>
  );
}
