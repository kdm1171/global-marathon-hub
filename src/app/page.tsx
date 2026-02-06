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
    <main className="min-h-screen bg-[#F8FAFC] pb-24 font-sans selection:bg-blue-100 selection:text-blue-600 relative">
      {/* Background Decoration */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-24 -left-24 w-[500px] h-[500px] bg-blue-100 rounded-full blur-[120px] opacity-30" />
        <div className="absolute bottom-0 -right-24 w-[600px] h-[600px] bg-indigo-100 rounded-full blur-[150px] opacity-30" />
      </div>

      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-2xl border-b border-slate-200/50 px-4 py-4 md:px-8">
        <div className="max-w-6xl mx-auto flex items-center justify-between gap-6">
          <div 
            className="flex items-center gap-2 cursor-pointer shrink-0" 
            onClick={() => window.location.reload()}
          >
            <div className="w-10 h-10 bg-blue-600 rounded-2xl flex items-center justify-center shadow-xl shadow-blue-200">
              <Sparkles className="w-5 h-5 text-white fill-white" />
            </div>
            <h1 className="text-2xl font-[1000] italic tracking-tighter text-slate-900 hidden sm:block">RUNHUB</h1>
          </div>
          
          <div className="relative flex-1 max-w-xl mx-auto">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input 
              type="text" 
              placeholder="대회명, 지역, 주최사 검색..."
              className="w-full bg-slate-100/80 border-none rounded-2xl py-3 pl-12 pr-4 text-sm focus:ring-2 focus:ring-blue-500/20 focus:bg-white transition-all outline-none"
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="hidden md:flex items-center gap-4">
            <button className="text-sm font-bold text-slate-500 hover:text-slate-900 transition-colors px-3 py-2">About</button>
            <button className="px-5 py-2.5 bg-slate-900 text-white rounded-xl text-sm font-bold shadow-lg shadow-slate-200 active:scale-95 transition-all">Sign In</button>
          </div>
        </div>
      </header>

      {/* Region Filter Section */}
      <div className="bg-white/40 border-b border-slate-200/40 sticky top-[73px] z-40 backdrop-blur-md">
        <div className="max-w-6xl mx-auto px-4 md:px-8">
          <div className="overflow-x-auto no-scrollbar py-4 flex items-center gap-3">
            <div className="flex items-center gap-2 pr-4 border-r border-slate-200 hidden sm:flex">
              <Filter className="w-4 h-4 text-slate-400" />
              <span className="text-xs font-black text-slate-400 uppercase tracking-tighter">Region</span>
            </div>
            {regions.map(r => (
              <button
                key={r}
                onClick={() => setFilter(r)}
                className={`px-6 py-2.5 rounded-full text-[13px] font-extrabold whitespace-nowrap transition-all duration-300 ${
                  filter === r 
                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-200 scale-105' 
                    : 'bg-white text-slate-500 border border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                }`}
              >
                {r}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="max-w-6xl mx-auto px-4 md:px-8 py-10 relative z-10">
        <div className="flex items-end justify-between mb-10 px-1">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="w-8 h-[3px] bg-blue-600 rounded-full" />
              <span className="text-[11px] font-black text-blue-600 uppercase tracking-[0.2em]">Live Calendar</span>
            </div>
            <h2 className="text-3xl md:text-4xl font-[1000] text-slate-900 tracking-tight">Race Feed</h2>
          </div>
          <div className="flex flex-col items-end gap-1">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Total Events</span>
            <span className="text-xl font-black text-slate-900">{filteredData.length}</span>
          </div>
        </div>

        {/* Responsive Grid System: 1col (mobile), 2col (tablet), 3col (pc) */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
          {filteredData.map((race: any, idx) => (
            <article 
              key={idx} 
              className="group bg-white rounded-[32px] border border-slate-200/60 overflow-hidden shadow-[0_8px_30px_-4px_rgba(0,0,0,0.04)] hover:shadow-[0_20px_50px_-8px_rgba(0,0,0,0.1)] transition-all duration-500 hover:-translate-y-2 flex flex-col cursor-pointer"
              onClick={() => router.push(`/marathon/${race.id}`)}
            >
              <div className="p-7 flex-1 flex flex-col">
                <div className="flex justify-between items-start mb-6">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="px-3.5 py-1.5 rounded-xl bg-blue-50 text-blue-600 text-[10px] font-black uppercase tracking-wider border border-blue-100">
                      {race.status || 'Active'}
                    </span>
                    <span className="px-3.5 py-1.5 rounded-xl bg-slate-50 text-slate-500 text-[10px] font-black uppercase tracking-wider border border-slate-100">
                      {race.distance || 'Multi'}
                    </span>
                  </div>
                  <button className="w-10 h-10 rounded-2xl flex items-center justify-center text-slate-300 hover:bg-rose-50 hover:text-rose-500 transition-all">
                    <Award className="w-5 h-5" />
                  </button>
                </div>

                <h3 className="text-[21px] font-[900] text-slate-900 mb-6 leading-[1.35] tracking-tight group-hover:text-blue-600 transition-colors line-clamp-2">
                  {race.name}
                </h3>

                <div className="space-y-3.5 mb-8 flex-1">
                  <div className="flex items-center text-slate-600">
                    <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center mr-3 text-slate-400">
                      <Calendar className="w-4 h-4" />
                    </div>
                    <span className="text-sm font-bold">{race.date}</span>
                  </div>
                  <div className="flex items-center text-slate-600">
                    <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center mr-3 text-slate-400">
                      <MapPin className="w-4 h-4" />
                    </div>
                    <span className="text-sm font-bold truncate">{race.location}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-6 border-t border-slate-50">
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">{race.organizer || 'Official'}</span>
                  <div className="w-10 h-10 rounded-full bg-slate-900 group-hover:bg-blue-600 flex items-center justify-center transition-all duration-300 group-hover:rotate-[360deg]">
                    <ChevronRight className="w-5 h-5 text-white" />
                  </div>
                </div>
              </div>
            </article>
          ))}
        </div>

        {filteredData.length === 0 && (
          <div className="py-40 text-center">
            <div className="bg-slate-100 w-24 h-24 rounded-[40px] flex items-center justify-center mx-auto text-slate-300 mb-6">
              <Filter className="w-12 h-12" />
            </div>
            <h3 className="text-2xl font-black text-slate-900">검색 결과가 없습니다</h3>
            <p className="text-slate-400 mt-2 font-medium">지역을 변경하거나 대회명을 다시 확인해주세요.</p>
            <button 
              onClick={() => {setFilter('전체'); setSearchTerm('');}}
              className="mt-8 px-8 py-3 bg-slate-900 text-white rounded-2xl font-bold hover:bg-blue-600 transition-colors shadow-xl shadow-slate-200"
            >
              필터 초기화
            </button>
          </div>
        )}
      </div>

      {/* Floating Action Button for PC / Mobile Nav for Mobile */}
      <div className="fixed bottom-8 left-1/2 -translate-x-1/2 w-full max-w-md px-4 md:max-w-lg z-50">
        <nav className="bg-slate-900/95 backdrop-blur-2xl border border-white/10 p-2.5 flex justify-between items-center rounded-[32px] shadow-[0_30px_60px_-12px_rgba(0,0,0,0.4)]">
          <button className="flex-1 flex flex-col items-center py-2.5 text-white">
            <Calendar className="w-5 h-5 mb-1" />
            <span className="text-[10px] font-black opacity-80 uppercase tracking-tighter">Feed</span>
          </button>
          <button 
            onClick={() => router.push('/map')}
            className="flex-1 flex flex-col items-center py-2.5 text-slate-500 hover:text-white transition-colors"
          >
            <MapPin className="w-5 h-5 mb-1" />
            <span className="text-[10px] font-black opacity-80 uppercase tracking-tighter">Map Search</span>
          </button>
          <div className="w-14 h-14 bg-blue-600 rounded-full flex items-center justify-center -mt-12 border-[6px] border-[#F8FAFC] shadow-2xl shadow-blue-500/40 active:scale-90 transition-transform cursor-pointer group">
            <Search className="w-6 h-6 text-white group-hover:scale-110 transition-transform" />
          </div>
          <button className="flex-1 flex flex-col items-center py-2.5 text-slate-500 hover:text-white transition-colors">
            <Award className="w-5 h-5 mb-1" />
            <span className="text-[10px] font-black opacity-80 uppercase tracking-tighter">Awards</span>
          </button>
          <button className="flex-1 flex flex-col items-center py-2.5 text-slate-500 hover:text-white transition-colors">
            <div className="w-6 h-6 rounded-xl bg-slate-700 mb-1 border border-white/20 overflow-hidden flex items-center justify-center text-[10px] font-bold">ME</div>
            <span className="text-[10px] font-black opacity-80 uppercase tracking-tighter">Profile</span>
          </button>
        </nav>
      </div>
    </main>
  );
}