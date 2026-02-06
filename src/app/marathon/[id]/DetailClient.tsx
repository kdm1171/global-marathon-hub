"use client";

import React from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Calendar, MapPin, Globe, Phone, CreditCard, Share2, Award, ChevronRight } from 'lucide-react';

export default function DetailClient({ race }: { race: any }) {
  const router = useRouter();

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: race.name,
        url: window.location.href,
      });
    } else {
      alert('링크가 복사되었습니다.');
    }
  };

  return (
    <main className="min-h-screen bg-white pb-24 font-sans">
      <div className="relative h-72 bg-slate-900 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-900/40 to-transparent z-10" />
        <div className="absolute top-6 left-4 z-20">
          <button 
            onClick={() => router.back()}
            className="p-3 bg-black/20 backdrop-blur-md rounded-2xl text-white hover:bg-black/40 transition-all"
          >
            <ArrowLeft className="w-6 h-6" />
          </button>
        </div>
        <div className="absolute bottom-8 left-6 right-6 z-20">
          <div className="flex gap-2 mb-4">
            <span className="px-3 py-1 bg-blue-600 text-white text-[11px] font-black rounded-full uppercase tracking-tighter shadow-lg shadow-blue-500/40">
              {race.distance || 'Multi'}
            </span>
            <span className="px-3 py-1 bg-white/20 backdrop-blur-md text-white text-[11px] font-bold rounded-full uppercase tracking-tighter border border-white/10">
              {race.status}
            </span>
          </div>
          <h1 className="text-2xl md:text-3xl font-black text-white leading-tight tracking-tight">
            {race.name}
          </h1>
        </div>
      </div>

      <div className="max-w-md mx-auto px-6 py-10 space-y-10">
        <section className="grid grid-cols-1 gap-8">
          <div className="flex items-start group">
            <div className="w-12 h-12 rounded-2xl bg-blue-50 flex items-center justify-center mr-5 shrink-0 text-blue-600 group-hover:scale-110 transition-transform">
              <Calendar className="w-6 h-6" />
            </div>
            <div>
              <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest mb-1">Race Schedule</p>
              <p className="text-lg font-bold text-slate-900">{race.date}</p>
            </div>
          </div>

          <div className="flex items-start group">
            <div className="w-12 h-12 rounded-2xl bg-rose-50 flex items-center justify-center mr-5 shrink-0 text-rose-600 group-hover:scale-110 transition-transform">
              <MapPin className="w-6 h-6" />
            </div>
            <div>
              <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest mb-1">Race Venue</p>
              <p className="text-lg font-bold text-slate-900 leading-snug">{race.location}</p>
            </div>
          </div>

          <div className="flex items-start group">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 flex items-center justify-center mr-5 shrink-0 text-emerald-600 group-hover:scale-110 transition-transform">
              <Award className="w-6 h-6" />
            </div>
            <div>
              <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest mb-1">Organizer</p>
              <p className="text-lg font-bold text-slate-900">{race.organizer}</p>
            </div>
          </div>
        </section>

        <section className="pt-10 border-t border-slate-100">
          <h2 className="text-lg font-black text-slate-900 mb-6 tracking-tight">Information & Contact</h2>
          <div className="space-y-4">
            <a href={race.link} target="_blank" rel="noopener noreferrer" className="flex items-center justify-between p-5 bg-slate-900 rounded-[24px] text-white font-bold hover:bg-slate-800 transition-all shadow-xl shadow-slate-200">
              <div className="flex items-center">
                <Globe className="w-5 h-5 mr-4 text-blue-400" />
                공식 홈페이지 방문
              </div>
              <ChevronRight className="w-5 h-5 opacity-50" />
            </a>
            <button className="w-full flex items-center justify-between p-5 bg-slate-50 rounded-[24px] text-slate-600 font-bold hover:bg-slate-100 transition-all border border-slate-100">
              <div className="flex items-center">
                <Phone className="w-5 h-5 mr-4 text-slate-400" />
                문의처 확인
              </div>
              <span className="text-sm">준비중</span>
            </button>
          </div>
        </section>
      </div>

      <div className="fixed bottom-0 left-0 right-0 p-6 bg-white/80 backdrop-blur-2xl border-t border-slate-100 z-50">
        <div className="max-w-md mx-auto flex gap-4">
          <a 
            href={race.link} 
            target="_blank" 
            className="flex-1 bg-blue-600 text-white font-black py-5 rounded-[24px] text-center hover:bg-blue-700 transition-all active:scale-[0.97] shadow-lg shadow-blue-200"
          >
            참가 신청하기
          </a>
          <button 
            onClick={handleShare}
            className="w-16 h-16 bg-slate-100 rounded-[24px] flex items-center justify-center text-slate-900 hover:bg-slate-200 transition-all active:scale-[0.97]"
          >
            <Share2 className="w-6 h-6" />
          </button>
        </div>
      </div>
    </main>
  );
}
