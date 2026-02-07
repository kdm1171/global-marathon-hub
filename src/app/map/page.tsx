"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, MapPin, Calendar, ExternalLink, Clock } from 'lucide-react';
import { Map, MapMarker } from 'react-kakao-maps-sdk';
import marathonData from '@/data/marathons.json';

export default function MapPage() {
  const router = useRouter();
  const [selectedRace, setSelectedRace] = useState<any>(null);
  const [isReady, setIsReady] = useState(false);
  
  const KAKAO_KEY = process.env.NEXT_PUBLIC_KAKAO_MAP_API_KEY;
  const validRaces = marathonData.filter((r: any) => r.lat && r.lng);

  useEffect(() => {
    const checkKakao = () => {
      if (window.kakao && window.kakao.maps) {
        window.kakao.maps.load(() => setIsReady(true));
        return true;
      }
      return false;
    };
    if (!checkKakao()) {
      const interval = setInterval(() => {
        if (window.kakao && window.kakao.maps) {
          init();
          clearInterval(interval);
        }
      }, 200);
      const init = () => window.kakao.maps.load(() => setIsReady(true));
      return () => clearInterval(interval);
    }
  }, []);

  const handleLinkClick = (link: string) => {
    window.open(link, '_blank', 'noopener,noreferrer');
  };

  if (!KAKAO_KEY) return <div className="h-screen flex items-center justify-center font-black text-rose-500 text-xs tracking-widest">MAP CONFIG ERROR</div>;

  return (
    <main className="relative h-screen bg-slate-50 overflow-hidden font-sans text-slate-900">
      {isReady ? (
        <Map
          center={{ lat: 36.5, lng: 127.5 }}
          style={{ width: '100%', height: '100%' }}
          level={12}
        >
          {validRaces.map((race: any) => (
            <MapMarker
              key={race.id}
              position={{ lat: race.lat, lng: race.lng }}
              onClick={() => setSelectedRace(race)}
              image={{
                src: race.status === '종료' 
                  ? "https://t1.daumcdn.net/localimg/localimages/07/mapapidoc/markerStar.png" 
                  : "https://t1.daumcdn.net/localimg/localimages/07/mapapidoc/marker_red.png",
                size: { width: 24, height: 35 }
              }}
            />
          ))}
        </Map>
      ) : (
        <div className="absolute inset-0 z-50 bg-white flex flex-col items-center justify-center">
          <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-4" />
          <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest italic">Loading Runner Maps...</p>
        </div>
      )}

      <div className="absolute top-6 left-4 right-4 z-20 max-w-md mx-auto">
        <div className="bg-white/90 backdrop-blur-xl rounded-[24px] shadow-2xl border border-white/20 p-2 flex items-center gap-3">
          <button onClick={() => router.push('/')} className="p-3 hover:bg-slate-100 rounded-2xl transition-colors text-slate-900">
            <ArrowLeft className="w-6 h-6" />
          </button>
          <div className="flex-1 text-sm font-black uppercase tracking-tighter italic text-slate-900">Runner Map</div>
          <div className="pr-4"><div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_10px_#10b981]" /></div>
        </div>
      </div>

      {selectedRace && (
        <div className="absolute bottom-10 left-4 right-4 z-30 max-w-md mx-auto animate-in slide-in-from-bottom duration-500">
          <div className="bg-white rounded-[32px] shadow-[0_30px_60px_-15px_rgba(0,0,0,0.2)] p-8 border border-slate-100 relative">
            <button onClick={() => setSelectedRace(null)} className="absolute top-4 right-6 text-slate-300 text-2xl hover:text-slate-900 transition-colors">&times;</button>
            
            <div className="flex items-center gap-2 mb-4">
              <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase border ${
                selectedRace.status === '종료' ? 'bg-slate-50 text-slate-400' : 'bg-blue-50 text-blue-600 border-blue-100'
              }`}>
                {selectedRace.status}
              </span>
              <span className="text-[10px] font-bold text-slate-300 uppercase">{selectedRace.region} Region</span>
            </div>

            <h3 className="text-[22px] font-black mb-6 leading-tight text-slate-900 line-clamp-2">{selectedRace.name}</h3>
            
            <div className="space-y-3 mb-8">
              <div className="flex items-center text-slate-600 font-bold text-sm">
                <Calendar className="w-4 h-4 mr-3 text-blue-500" /> {selectedRace.date}
              </div>
              <div className="flex items-center text-slate-600 font-bold text-sm">
                <Clock className="w-4 h-4 mr-3 text-orange-500" /> {selectedRace.start_time}
              </div>
              <div className="flex items-center text-slate-600 font-bold text-sm">
                <MapPin className="w-4 h-4 mr-3 text-rose-500" /> <span className="truncate">{selectedRace.location_full}</span>
              </div>
            </div>

            <button 
              onClick={() => handleLinkClick(selectedRace.link)}
              className="w-full py-4 bg-slate-900 text-white rounded-[20px] font-black flex items-center justify-center gap-3 hover:bg-blue-600 transition-all shadow-xl shadow-slate-200"
            >
              공식 홈페이지 바로가기 <ExternalLink className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </main>
  );
}
