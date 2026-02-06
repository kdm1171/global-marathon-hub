"use client";

import React, { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, MapPin, Search, Calendar, ChevronRight } from 'lucide-react';
import marathonData from '@/data/marathons.json';

declare global {
  interface window {
    kakao: any;
  }
}

export default function MapPage() {
  const router = useRouter();
  const mapContainer = useRef<HTMLDivElement>(null);
  const [selectedRace, setSelectedRace] = useState<any>(null);
  const [mapLoaded, setMapLoaded] = useState(false);

  useEffect(() => {
    const script = document.createElement('script');
    script.src = `//dapi.kakao.com/v2/maps/sdk.js?appkey=${process.env.NEXT_PUBLIC_KAKAO_MAPS_CLIENT_ID}&libraries=services&autoload=false`;
    script.async = true;
    
    document.head.appendChild(script);

    script.onload = () => {
      (window as any).kakao.maps.load(() => {
        if (!mapContainer.current) return;

        const options = {
          center: new (window as any).kakao.maps.LatLng(36.5, 127.5), // 한국 중심
          level: 12
        };

        const map = new (window as any).kakao.maps.Map(mapContainer.current, options);
        const geocoder = new (window as any).kakao.maps.services.Geocoder();

        // 데이터 마킹
        marathonData.forEach((race: any) => {
          // 주소로 좌표 검색
          geocoder.addressSearch(race.location.split('(')[0], (result: any, status: any) => {
            if (status === (window as any).kakao.maps.services.Status.OK) {
              const coords = new (window as any).kakao.maps.LatLng(result[0].y, result[0].x);

              const marker = new (window as any).kakao.maps.Marker({
                map: map,
                position: coords
              });

              (window as any).kakao.maps.event.addListener(marker, 'click', () => {
                setSelectedRace(race);
                map.panTo(coords);
              });
            }
          });
        });

        setMapLoaded(true);
      });
    };

    return () => {
      document.head.removeChild(script);
    };
  }, []);

  return (
    <main className="relative h-screen bg-slate-50 overflow-hidden font-sans">
      {/* Map Container */}
      <div ref={mapContainer} className="w-full h-full" />

      {/* Top Overlay */}
      <div className="absolute top-6 left-4 right-4 z-20 max-w-md mx-auto">
        <div className="bg-white/90 backdrop-blur-xl rounded-[24px] shadow-2xl border border-white/20 p-2 flex items-center gap-3">
          <button 
            onClick={() => router.push('/')}
            className="p-3 hover:bg-slate-100 rounded-2xl transition-colors"
          >
            <ArrowLeft className="w-6 h-6 text-slate-900" />
          </button>
          <div className="flex-1 text-sm font-bold text-slate-900 px-2">
            전국 대회 지도 탐색
          </div>
          <div className="pr-4">
            <span className="px-2 py-1 bg-blue-600 text-white text-[10px] font-black rounded-lg uppercase">Live</span>
          </div>
        </div>
      </div>

      {/* Selected Race Card (Bottom Sheet Style) */}
      {selectedRace && (
        <div className="absolute bottom-10 left-4 right-4 z-30 max-w-md mx-auto animate-in slide-in-from-bottom duration-500">
          <div className="bg-white rounded-[32px] shadow-[0_20px_60px_-10px_rgba(0,0,0,0.3)] p-6 border border-slate-100 relative overflow-hidden">
            <button 
              onClick={() => setSelectedRace(null)}
              className="absolute top-4 right-6 text-slate-300 hover:text-slate-900 text-2xl font-light"
            >
              &times;
            </button>
            
            <div className="flex items-center gap-2 mb-3">
              <span className="px-2.5 py-1 rounded-lg bg-blue-50 text-blue-600 text-[10px] font-black uppercase tracking-wider">
                {selectedRace.status}
              </span>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{selectedRace.distance}</span>
            </div>

            <h3 className="text-xl font-black text-slate-900 mb-4 leading-tight">
              {selectedRace.name}
            </h3>

            <div className="space-y-2 mb-6">
              <div className="flex items-center text-slate-500 text-sm">
                <Calendar className="w-4 h-4 mr-2 text-blue-500" />
                <span className="font-bold text-slate-700">{selectedRace.date}</span>
              </div>
              <div className="flex items-center text-slate-500 text-sm">
                <MapPin className="w-4 h-4 mr-2 text-rose-500" />
                <span className="font-bold text-slate-700 truncate">{selectedRace.location}</span>
              </div>
            </div>

            <button 
              onClick={() => router.push(`/marathon/${selectedRace.id}`)}
              className="w-full py-4 bg-slate-900 text-white rounded-[20px] font-black flex items-center justify-center gap-2 hover:bg-blue-600 transition-all active:scale-[0.98]"
            >
              대회 상세정보 보기
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Loading State */}
      {!mapLoaded && (
        <div className="absolute inset-0 z-50 bg-white flex flex-col items-center justify-center">
          <div className="w-16 h-16 border-4 border-blue-100 border-t-blue-600 rounded-full animate-spin mb-4" />
          <p className="text-sm font-black text-slate-400 uppercase tracking-widest italic">Loading Runner Maps...</p>
        </div>
      )}
    </main>
  );
}