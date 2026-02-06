"use client";

import React from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, MapPin, Search } from 'lucide-react';

export default function MapPage() {
  const router = useRouter();

  return (
    <main className="relative h-screen bg-slate-100 overflow-hidden font-sans">
      {/* Search Overlay */}
      <div className="absolute top-6 left-4 right-4 z-20 max-w-md mx-auto">
        <div className="bg-white/90 backdrop-blur-xl rounded-[24px] shadow-2xl border border-white/20 p-2 flex items-center gap-3">
          <button 
            onClick={() => router.push('/')}
            className="p-3 hover:bg-slate-100 rounded-2xl transition-colors"
          >
            <ArrowLeft className="w-6 h-6 text-slate-900" />
          </button>
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input 
              type="text" 
              placeholder="장소 또는 대회명 검색..."
              className="w-full bg-slate-50 border-none rounded-xl py-2.5 pl-10 pr-4 text-sm focus:ring-0 placeholder:text-slate-400"
            />
          </div>
        </div>
      </div>

      {/* Map Content Placeholder */}
      <div className="w-full h-full flex flex-col items-center justify-center space-y-6">
        <div className="w-24 h-24 bg-blue-100 rounded-full flex items-center justify-center animate-pulse">
          <MapPin className="w-10 h-10 text-blue-600" />
        </div>
        <div className="text-center">
          <h2 className="text-xl font-black text-slate-900">Map View</h2>
          <p className="text-sm text-slate-500 mt-2 font-medium">내 위치 주변의 마라톤 대회를 시각화합니다.<br/>(지도 API 연동 작업 중)</p>
        </div>
        <button 
          onClick={() => router.push('/')}
          className="px-8 py-3 bg-slate-900 text-white rounded-2xl font-bold shadow-xl"
        >
          목록으로 돌아가기
        </button>
      </div>

      {/* Map Bottom Sheet Mockup */}
      <div className="absolute bottom-8 left-4 right-4 z-20 max-w-md mx-auto">
        <div className="bg-white/90 backdrop-blur-xl rounded-[28px] shadow-2xl p-6 border border-white/20">
          <div className="w-12 h-1 bg-slate-200 rounded-full mx-auto mb-6" />
          <div className="flex justify-between items-center mb-2">
            <span className="text-[11px] font-black text-blue-600 uppercase">Featured Venue</span>
            <span className="text-[11px] font-bold text-slate-400">3 Races Nearby</span>
          </div>
          <h3 className="text-lg font-extrabold text-slate-900">제주 구좌종합운동장</h3>
          <p className="text-sm text-slate-500 font-medium mt-1">제주특별자치도 제주시 구좌읍 김녕리</p>
        </div>
      </div>
    </main>
  );
}
