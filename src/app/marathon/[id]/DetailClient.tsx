"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Calendar, MapPin, Globe, Phone, Share2, Award, ChevronRight, Info, ShieldCheck, Heart } from 'lucide-react';

export default function DetailClient({ race }: { race: any }) {
  const router = useRouter();
  const [isSaved, setIsSaved] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('run-hub-bookmarks');
    if (saved) {
      const ids = JSON.parse(saved);
      setIsSaved(ids.includes(race.id));
    }
  }, [race.id]);

  const toggleSave = () => {
    const saved = localStorage.getItem('run-hub-bookmarks');
    let ids = saved ? JSON.parse(saved) : [];
    if (ids.includes(race.id)) {
      ids = ids.filter((id: number) => id !== race.id);
      setIsSaved(false);
    } else {
      ids.push(race.id);
      setIsSaved(true);
    }
    localStorage.setItem('run-hub-bookmarks', JSON.stringify(ids));
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({ title: race.name, url: window.location.href });
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert('링크가 복사되었습니다.');
    }
  };

  return (
    <main className="min-h-screen bg-[#F8FAFC] pb-32 font-sans selection:bg-blue-100">
      <nav className="sticky top-0 z-50 bg-white/70 backdrop-blur-xl border-b border-slate-200/50 px-4 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <button onClick={() => router.back()} className="flex items-center gap-2 text-slate-900 font-bold hover:text-blue-600 transition-colors">
            <ArrowLeft className="w-5 h-5" />
            <span className="hidden sm:block">Back to Feed</span>
          </button>
          <div className="flex items-center gap-2">
            <button onClick={toggleSave} className={`p-2.5 rounded-xl transition-all ${isSaved ? 'bg-rose-50 text-rose-500' : 'bg-slate-100 text-slate-400 hover:text-rose-400'}`}>
              <Heart className={`w-5 h-5 ${isSaved ? 'fill-rose-500' : ''}`} />
            </button>
            <button onClick={handleShare} className="p-2.5 bg-slate-100 rounded-xl text-slate-600 hover:bg-slate-200 transition-all">
              <Share2 className="w-5 h-5" />
            </button>
          </div>
        </div>
      </nav>

      <div className="max-w-6xl mx-auto px-4 md:px-8 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          
          <div className="lg:col-span-8 space-y-10">
            <section>
              <div className="flex gap-2 mb-6">
                <span className="px-4 py-1.5 bg-blue-600 text-white text-[11px] font-black rounded-full uppercase tracking-widest shadow-lg shadow-blue-500/20">{race.distance || 'Multi'}</span>
                <span className="px-4 py-1.5 bg-emerald-50 text-emerald-600 text-[11px] font-black rounded-full uppercase tracking-widest border border-emerald-100">Verified</span>
              </div>
              <h1 className="text-3xl md:text-5xl font-[1000] text-slate-900 leading-tight tracking-tight mb-8">{race.name}</h1>
              <div className="aspect-[21/9] w-full bg-slate-900 rounded-[40px] overflow-hidden relative group shadow-2xl">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-600/20 to-indigo-900/40 mix-blend-overlay" />
                <div className="absolute inset-0 flex flex-col items-center justify-center opacity-40 group-hover:opacity-100 transition-opacity">
                  <Info className="w-12 h-12 text-white mb-2" />
                  <p className="text-white font-bold uppercase tracking-[0.3em] text-[10px]">Information Archive</p>
                </div>
              </div>
            </section>

            <section className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              {[
                { icon: Calendar, label: "Race Date", value: race.date, color: "text-blue-600", bg: "bg-blue-50" },
                { icon: MapPin, label: "Race Venue", value: race.location, color: "text-rose-600", bg: "bg-rose-50" },
                { icon: Award, label: "Organizer", value: race.organizer, color: "text-emerald-600", bg: "bg-emerald-50" }
              ].map((item, i) => (
                <div key={i} className="p-6 bg-white rounded-[32px] border border-slate-200/60 shadow-sm">
                  <div className={`w-12 h-12 rounded-2xl ${item.bg} flex items-center justify-center mb-4 ${item.color}`}><item.icon className="w-6 h-6" /></div>
                  <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest mb-1">{item.label}</p>
                  <p className="text-[15px] font-bold text-slate-900">{item.value}</p>
                </div>
              ))}
            </section>

            <section className="p-8 bg-white rounded-[40px] border border-slate-200/60 shadow-sm">
              <h2 className="text-2xl font-[900] text-slate-900 mb-6 tracking-tight flex items-center gap-3">
                <ShieldCheck className="w-7 h-7 text-blue-600" />
                대회 상세 안내
              </h2>
              <div className="prose prose-slate max-w-none text-slate-600 font-medium leading-relaxed">
                <p>본 대회는 {race.organizer}에서 주관하는 공식 마라톤 대회입니다. 상세 코스 및 참가 자격, 기념품 안내는 아래 공식 홈페이지를 통해 확인하실 수 있습니다.</p>
              </div>
            </section>
          </div>

          <div className="lg:col-span-4">
            <aside className="sticky top-[100px] space-y-6">
              <div className="bg-slate-900 rounded-[40px] p-8 shadow-2xl shadow-blue-900/20 text-white">
                <h3 className="text-xl font-black mb-6 tracking-tight tracking-widest uppercase text-[12px] text-slate-400">Registration</h3>
                <div className="space-y-6 mb-8">
                  <div className="flex justify-between items-center pb-4 border-b border-white/10">
                    <span className="text-slate-400 text-sm font-bold">Entry Fee</span>
                    <span className="text-xl font-black italic">50,000 KRW</span>
                  </div>
                </div>
                <a href={race.link} target="_blank" className="w-full bg-blue-600 hover:bg-blue-500 text-white font-black py-5 rounded-2xl flex items-center justify-center gap-2 transition-all active:scale-95 shadow-xl shadow-blue-600/30">
                  <Globe className="w-5 h-5" />
                  공식 홈페이지 신청
                </a>
              </div>
            </aside>
          </div>
        </div>
      </div>
    </main>
  );
}
