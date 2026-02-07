"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  ArrowLeft, Calendar, MapPin, Clock, 
  Award, Heart, Share2, Globe, Navigation,
  Flame, CheckCircle2
} from 'lucide-react';

export default function DetailClient({ race }: { race: any }) {
  const router = useRouter();
  const [isSaved, setIsSaved] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('run-hub-bookmarks');
    if (saved) {
      const bookmarks = JSON.parse(saved);
      setIsSaved(bookmarks.includes(race.id));
    }
  }, [race.id]);

  const toggleSave = () => {
    const saved = localStorage.getItem('run-hub-bookmarks');
    let bookmarks = saved ? JSON.parse(saved) : [];
    if (isSaved) {
      bookmarks = bookmarks.filter((id: number) => id !== race.id);
    } else {
      bookmarks.push(race.id);
    }
    localStorage.setItem('run-hub-bookmarks', JSON.stringify(bookmarks));
    setIsSaved(!isSaved);
  };

  const getStatusStyle = (status: string) => {
    if (status === '접수중') return 'bg-blue-50 text-blue-600 border-blue-100';
    if (status === '종료' || status === '접수마감') return 'bg-slate-50 text-slate-400 border-slate-100';
    return 'bg-orange-50 text-orange-600 border-orange-100';
  };

  return (
    <main className="min-h-screen bg-[#F8FAFC] pb-24 font-sans selection:bg-blue-100">
      {/* Header */}
      <div className="bg-white border-b border-slate-200/60 sticky top-0 z-50 px-4 py-4 backdrop-blur-xl bg-white/80">
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <button onClick={() => router.back()} className="p-2.5 hover:bg-slate-100 rounded-2xl transition-colors">
            <ArrowLeft className="w-6 h-6 text-slate-900" />
          </button>
          <div className="flex gap-2">
            <button onClick={toggleSave} className={`p-2.5 rounded-2xl transition-all ${isSaved ? 'bg-rose-50 text-rose-500' : 'hover:bg-slate-100 text-slate-400'}`}>
              <Heart className={`w-6 h-6 ${isSaved ? 'fill-rose-500' : ''}`} />
            </button>
            <button className="p-2.5 hover:bg-slate-100 rounded-2xl transition-colors text-slate-400">
              <Share2 className="w-6 h-6" />
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-8 md:py-12">
        {/* Title Section */}
        <div className="mb-10">
          <div className="flex items-center gap-3 mb-6">
            <span className={`px-4 py-1.5 rounded-full text-[11px] font-black uppercase tracking-widest border ${getStatusStyle(race.status)}`}>
              {race.status}
            </span>
            <span className="text-[11px] font-black text-slate-300 uppercase tracking-tighter">{race.region} Region</span>
          </div>
          <h1 className="text-[32px] md:text-[40px] font-[1000] text-slate-900 leading-[1.1] tracking-tight mb-6">{race.name}</h1>
          <p className="text-slate-500 font-bold text-lg leading-relaxed">{race.organizer.split('\n')[0]}</p>
        </div>

        {/* Specs Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-12">
          <div className="bg-white p-6 rounded-[32px] border border-slate-200/60 shadow-sm flex items-start gap-5">
            <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center shrink-0"><Calendar className="w-6 h-6 text-blue-600" /></div>
            <div>
              <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest mb-1">Date</p>
              <p className="text-[17px] font-black text-slate-900">{race.date}</p>
            </div>
          </div>

          <div className="bg-white p-6 rounded-[32px] border border-slate-200/60 shadow-sm flex items-start gap-5">
            <div className="w-12 h-12 bg-orange-50 rounded-2xl flex items-center justify-center shrink-0"><Clock className="w-6 h-6 text-orange-600" /></div>
            <div>
              <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest mb-1">Schedule</p>
              <p className="text-[17px] font-black text-slate-900">{race.start_time || '별도공지'}</p>
            </div>
          </div>

          <div className="bg-white p-6 rounded-[32px] border border-slate-200/60 shadow-sm flex items-start gap-5 md:col-span-2">
            <div className="w-12 h-12 bg-rose-50 rounded-2xl flex items-center justify-center shrink-0"><MapPin className="w-6 h-6 text-rose-600" /></div>
            <div>
              <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest mb-1">Gathering Place</p>
              <p className="text-[17px] font-black text-slate-900 mb-2">{race.location_full}</p>
            </div>
          </div>
        </div>

        {/* Action Button */}
        <a 
          href={race.link} 
          target="_blank" 
          rel="noreferrer"
          className="block w-full py-6 bg-slate-900 text-white rounded-[28px] text-center font-black text-xl shadow-2xl shadow-slate-300 hover:bg-blue-600 hover:scale-[1.02] transition-all active:scale-[0.98] mb-12"
        >
          {race.is_official ? '공식 홈페이지 바로가기' : '대회 정보 확인'}
        </a>

        {/* Static Courses Section */}
        <div className="bg-blue-600 rounded-[40px] p-10 text-white relative overflow-hidden">
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-6">
              <Flame className="w-8 h-8 fill-orange-400 text-orange-400" />
              <h3 className="text-2xl font-black italic tracking-tighter uppercase">Available Courses</h3>
            </div>
            <p className="text-blue-100 font-bold mb-8 leading-relaxed">
              본 대회에서 운영되는 코스 정보입니다.<br/>
              자세한 코스 맵은 공식 홈페이지를 참조하세요.
            </p>
            <div className="grid grid-cols-1 gap-3">
              {race.race_types?.map((type: string) => (
                <div key={type} className="bg-white/10 backdrop-blur-md rounded-2xl p-5 border border-white/10 flex items-center gap-4">
                  <div className="w-2 h-2 bg-blue-300 rounded-full" />
                  <span className="font-black text-lg">{type}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="absolute -bottom-24 -right-24 w-64 h-64 bg-white/10 rounded-full blur-3xl" />
        </div>
      </div>
    </main>
  );
}
