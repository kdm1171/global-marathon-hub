"use client";

import React, { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { Calendar, MapPin, ChevronRight, Filter, Award, Search, Sparkles } from 'lucide-react';
import marathonData from '@/data/marathons.json';

export default function HomePage() {
  const router = useRouter();
  const [filter, setFilter] = useState('전체');
  const [searchTerm, setSearchTerm] = useState('');

  const filteredData = useMemo(() => {
    return marathonData.filter((m: any) => {
      const matchesFilter = filter === '전체' || m.location.includes(filter);
      const matchesSearch = m.name.toLowerCase().includes(searchTerm.toLowerCase());
      return matchesFilter && matchesSearch;
    });
  }, [filter, searchTerm]);

  const regions = ['전체', '서울', '경기', '인천', '강원', '충청', '경상', '전라', '제주'];

  return (
    <main className="min-h-screen bg-[#F8FAFC] pb-24 font-sans selection:bg-blue-100 selection:text-blue-600">
      {/* Dynamic Background Decoration for PC */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden opacity-40">
        <div className="absolute -top-24 -left-24 w-96 h-96 bg-blue-200 rounded-full blur-3xl opacity-20" />
        <div className="absolute top-1/2 -right-24 w-80 h-80 bg-indigo-200 rounded-full blur-3xl opacity-20" />
      </div>

      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/70 backdrop-blur-xl border-b border-slate-200/60 px-4 py-4">
        <div className="max-w-md mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-1.5">
            <div className="w-8 h-8 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-200">
              <Sparkles className="w-4 h-4 text-white fill-white" />
            </div>
            <h1 className="text-xl font-[900] italic tracking-tighter text-slate-900">RUNHUB</h1>
          </div>
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input 
              type="text" 
              placeholder="어떤 대회를 찾으시나요?"
              className="w-full bg-slate-100/80 border-none rounded-2xl py-2.5 pl-10 pr-4 text-sm focus:ring-2 focus:ring-blue-500/20 focus:bg-white transition-all outline-none placeholder:text-slate-400"
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
      </header>

      {/* Region Chips - PC Centering Fixed */}
      <div className="bg-white/50 border-b border-slate-200/40 sticky top-[73px] z-40 backdrop-blur-md">
        <div className="max-w-md mx-auto px-4">
          <div className="overflow-x-auto no-scrollbar py-4 flex gap-2.5">
            {regions.map(r => (
              <button
                key={r}
                onClick={() => setFilter(r)}
                className={`px-5 py-2 rounded-2xl text-[13px] font-bold whitespace-nowrap transition-all duration-300 ${
                  filter === r 
                    ? 'bg-slate-900 text-white shadow-md shadow-slate-200 scale-105' 
                    : 'bg-white text-slate-500 border border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                }`}
              >
                {r}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Marathon List */}
      <div className="max-w-md mx-auto px-4 py-8 space-y-6 relative z-10">
        <div className="flex items-end justify-between px-1">
          <div>
            <h2 className="text-2xl font-black text-slate-900 tracking-tight">Race Feed</h2>
            <p className="text-[13px] font-medium text-slate-400 mt-0.5">실시간으로 업데이트되는 대회 일정</p>
          </div>
          <span className="text-[13px] font-bold text-blue-600 bg-blue-50 px-3 py-1 rounded-full">{filteredData.length}</span>
        </div>

        <div className="space-y-5">
          {filteredData.map((race: any, idx) => (
            <article key={idx} className="group bg-white rounded-[28px] border border-slate-200/70 overflow-hidden shadow-[0_4px_20px_-2px_rgba(0,0,0,0.05)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] transition-all duration-500 hover:-translate-y-1">
              <div className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center gap-2">
                    <span className="px-3 py-1 rounded-full bg-emerald-50 text-emerald-600 text-[11px] font-black uppercase tracking-wider border border-emerald-100">
                      {race.status || 'D-DAY'}
                    </span>
                    <span className="w-1 h-1 rounded-full bg-slate-200" />
                    <span className="text-[11px] font-bold text-slate-400 uppercase">{race.organizer || 'Official'}</span>
                  </div>
                  <button className="w-10 h-10 rounded-full flex items-center justify-center text-slate-300 hover:bg-slate-50 hover:text-rose-500 transition-all">
                    <Award className="w-5 h-5" />
                  </button>
                </div>

                <h3 className="text-[19px] font-extrabold text-slate-900 mb-5 leading-[1.4] tracking-tight group-hover:text-blue-600 transition-colors">
                  {race.name}
                </h3>

                <div className="grid grid-cols-2 gap-3 mb-6">
                  <div className="flex items-center p-3 bg-slate-50 rounded-2xl border border-slate-100">
                    <Calendar className="w-4 h-4 mr-2.5 text-blue-500" />
                    <span className="text-[13px] font-bold text-slate-700">{race.date}</span>
                  </div>
                  <div className="flex items-center p-3 bg-slate-50 rounded-2xl border border-slate-100">
                    <MapPin className="w-4 h-4 mr-2.5 text-rose-500" />
                    <span className="text-[13px] font-bold text-slate-700 truncate">{race.location.split(' ')[0]} {race.location.split(' ')[1]}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-5 border-t border-slate-50">
                  <div className="flex gap-1.5">
                    {['Full', 'Half', '10k'].map(dist => (
                      <span key={dist} className="text-[10px] font-black text-slate-400 px-2 py-1 bg-slate-50 rounded-lg uppercase">
                        {dist}
                      </span>
                    ))}
                  </div>
                  <button 
                    onClick={() => router.push(`/marathon/${race.id}`)}
                    className="group/btn flex items-center text-sm font-black text-slate-900 hover:text-blue-600 transition-colors"
                  >
                    View Details
                    <div className="ml-2 w-6 h-6 rounded-full bg-slate-900 group-hover/btn:bg-blue-600 flex items-center justify-center transition-colors">
                      <ChevronRight className="w-3.5 h-3.5 text-white" />
                    </div>
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>

        {filteredData.length === 0 && (
          <div className="py-32 text-center space-y-5">
            <div className="bg-slate-100 w-20 h-20 rounded-[32px] flex items-center justify-center mx-auto text-slate-300">
              <Filter className="w-10 h-10" />
            </div>
            <div>
              <p className="text-slate-900 font-bold text-lg">검색 결과가 없어요</p>
              <p className="text-slate-400 text-sm mt-1">다른 지역이나 키워드로 검색해보세요.</p>
            </div>
            <button 
              onClick={() => {setFilter('전체'); setSearchTerm('');}}
              className="text-blue-600 font-bold text-sm underline underline-offset-4"
            >
              필터 초기화하기
            </button>
          </div>
        )}
      </div>

      {/* Bottom Nav - Elevated Design */}
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 w-full max-w-[340px] z-50">
        <nav className="bg-slate-900/90 backdrop-blur-2xl border border-white/10 p-2 flex justify-between items-center rounded-[32px] shadow-[0_20px_50px_rgba(0,0,0,0.3)]">
          <button 
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className="flex-1 flex flex-col items-center py-2 text-white"
          >
            <Calendar className="w-5 h-5 mb-1" />
            <span className="text-[9px] font-bold opacity-80 uppercase tracking-tighter">Feed</span>
          </button>
          <button 
            onClick={() => router.push('/map')}
            className="flex-1 flex flex-col items-center py-2 text-slate-500 hover:text-white transition-colors"
          >
            <MapPin className="w-5 h-5 mb-1" />
            <span className="text-[9px] font-bold opacity-80 uppercase tracking-tighter">Map</span>
          </button>
          <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center -mt-10 border-4 border-[#F8FAFC] shadow-xl shadow-blue-500/20 active:scale-90 transition-transform cursor-pointer">
            <Search className="w-5 h-5 text-white" />
          </div>
          <button className="flex-1 flex flex-col items-center py-2 text-slate-500 hover:text-white transition-colors">
            <Award className="w-5 h-5 mb-1" />
            <span className="text-[9px] font-bold opacity-80 uppercase tracking-tighter">My</span>
          </button>
          <button className="flex-1 flex flex-col items-center py-2 text-slate-500 hover:text-white transition-colors">
            <div className="w-5 h-5 rounded-full bg-slate-700 mb-1 border border-white/20" />
            <span className="text-[9px] font-bold opacity-80 uppercase tracking-tighter">Profile</span>
          </button>
        </nav>
      </div>
    </main>
  );
}
