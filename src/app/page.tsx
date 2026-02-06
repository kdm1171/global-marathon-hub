"use client";

import React, { useState, useMemo, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Calendar, MapPin, ChevronRight, Filter, Award, Search, Sparkles, Heart, Flame } from 'lucide-react';
import marathonData from '@/data/marathons.json';

export default function HomePage() {
  const router = useRouter();
  const [filter, setFilter] = useState('전체');
  const [distFilter, setDistFilter] = useState('전체');
  const [searchTerm, setSearchTerm] = useState('');
  const [bookmarks, setBookmarks] = useState<number[]>([]);
  const [viewMode, setViewMode] = useState<'all' | 'saved'>('all');

  // 북마크 로드
  useEffect(() => {
    const saved = localStorage.getItem('run-hub-bookmarks');
    if (saved) setBookmarks(JSON.parse(saved));
  }, []);

  // 북마크 토글
  const toggleBookmark = (e: React.MouseEvent, id: number) => {
    e.stopPropagation();
    const updated = bookmarks.includes(id) 
      ? bookmarks.filter(b => b !== id)
      : [...bookmarks, id];
    setBookmarks(updated);
    localStorage.setItem('run-hub-bookmarks', JSON.stringify(updated));
  };

  const filteredData = useMemo(() => {
    const now = new Date();
    return marathonData.filter((m: any) => {
      const matchesView = viewMode === 'all' || bookmarks.includes(m.id);
      const matchesRegion = filter === '전체' || m.location.includes(filter);
      const matchesDist = distFilter === '전체' || m.distance.includes(distFilter);
      const matchesSearch = m.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                            m.organizer.toLowerCase().includes(searchTerm.toLowerCase());
      return matchesView && matchesRegion && matchesDist && matchesSearch;
    }).map((race: any) => {
      const raceDate = new Date(race.date.replace(/\./g, '-'));
      const diffTime = raceDate.getTime() - now.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      let dynamicStatus = race.status;
      if (diffDays < 0) dynamicStatus = '종료';
      else if (diffDays === 0) dynamicStatus = 'D-DAY';
      else if (diffDays <= 30) dynamicStatus = `D-${diffDays}`;
      
      return { ...race, dynamicStatus };
    }).sort((a: any, b: any) => {
      if (a.dynamicStatus === '종료' && b.dynamicStatus !== '종료') return 1;
      if (a.dynamicStatus !== '종료' && b.dynamicStatus === '종료') return -1;
      return new Date(a.date.replace(/\./g, '-')).getTime() - new Date(b.date.replace(/\./g, '-')).getTime();
    });
  }, [filter, distFilter, searchTerm, bookmarks, viewMode]);

  const regions = ['전체', '서울', '경기', '인천', '강원', '충청', '경상', '전라', '제주'];
  const distances = ['전체', 'Full', 'Half', '10km', '5km'];

  return (
    <main className="min-h-screen bg-[#F8FAFC] pb-32 font-sans selection:bg-blue-100 selection:text-blue-600 relative">
      {/* Background Decoration */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-24 -left-24 w-[500px] h-[500px] bg-blue-100 rounded-full blur-[120px] opacity-20" />
        <div className="absolute bottom-0 -right-24 w-[600px] h-[600px] bg-indigo-100 rounded-full blur-[150px] opacity-20" />
      </div>

      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-2xl border-b border-slate-200/50 px-4 py-4 md:px-8">
        <div className="max-w-6xl mx-auto flex items-center justify-between gap-6">
          <div className="flex items-center gap-2 cursor-pointer shrink-0" onClick={() => {setViewMode('all'); window.scrollTo({top:0, behavior:'smooth'});}}>
            <div className="w-10 h-10 bg-blue-600 rounded-2xl flex items-center justify-center shadow-xl shadow-blue-200">
              <Sparkles className="w-5 h-5 text-white fill-white" />
            </div>
            <h1 className="text-2xl font-[1000] italic tracking-tighter text-slate-900 hidden sm:block">RUNHUB</h1>
          </div>
          
          <div className="relative flex-1 max-w-xl">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input 
              type="text" 
              placeholder="대회명, 지역, 주최사 검색..."
              className="w-full bg-slate-100/80 border-none rounded-2xl py-3 pl-12 pr-4 text-sm focus:ring-2 focus:ring-blue-500/20 focus:bg-white transition-all outline-none"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="hidden md:flex items-center gap-2 bg-slate-100 p-1 rounded-2xl">
            <button 
              onClick={() => setViewMode('all')}
              className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${viewMode === 'all' ? 'bg-white shadow-sm text-blue-600' : 'text-slate-500'}`}
            >
              All Events
            </button>
            <button 
              onClick={() => setViewMode('saved')}
              className={`px-4 py-2 rounded-xl text-sm font-bold transition-all flex items-center gap-2 ${viewMode === 'saved' ? 'bg-white shadow-sm text-rose-500' : 'text-slate-500'}`}
            >
              <Heart className={`w-4 h-4 ${viewMode === 'saved' ? 'fill-rose-500 text-rose-500' : ''}`} />
              Saved
            </button>
          </div>
        </div>
      </header>

      {/* Filter Section */}
      <div className="bg-white/40 border-b border-slate-200/40 sticky top-[73px] z-40 backdrop-blur-md">
        <div className="max-w-6xl mx-auto px-4 md:px-8">
          <div className="overflow-x-auto no-scrollbar py-3 flex items-center gap-3 border-b border-slate-100/50 text-[12px] font-extrabold">
            <span className="text-slate-400 uppercase tracking-tighter mr-2 shrink-0">Region</span>
            {regions.map(r => (
              <button key={r} onClick={() => setFilter(r)} className={`px-5 py-1.5 rounded-full transition-all ${filter === r ? 'bg-blue-600 text-white shadow-lg shadow-blue-200' : 'bg-white text-slate-500 border border-slate-200'}`}>{r}</button>
            ))}
          </div>
          <div className="overflow-x-auto no-scrollbar py-3 flex items-center gap-3 text-[12px] font-extrabold">
            <span className="text-slate-400 uppercase tracking-tighter mr-2 shrink-0">Course</span>
            {distances.map(d => (
              <button key={d} onClick={() => setDistFilter(d)} className={`px-5 py-1.5 rounded-full transition-all ${distFilter === d ? 'bg-slate-900 text-white shadow-lg shadow-slate-300' : 'bg-white text-slate-500 border border-slate-200'}`}>{d}</button>
            ))}
          </div>
        </div>
      </div>

      {/* Grid List */}
      <div className="max-w-6xl mx-auto px-4 md:px-8 py-10">
        <div className="flex items-end justify-between mb-8 px-1">
          <div>
            <h2 className="text-3xl font-[1000] text-slate-900 tracking-tight flex items-center gap-2">
              {viewMode === 'saved' ? <Heart className="w-8 h-8 fill-rose-500 text-rose-500" /> : <Flame className="w-8 h-8 text-orange-500 fill-orange-500" />}
              {viewMode === 'all' ? 'Race Feed' : 'Saved Races'}
            </h2>
            <p className="text-[13px] font-medium text-slate-400 mt-1">
              {viewMode === 'all' ? '전국의 모든 러닝 이벤트를 한눈에' : '관심 있게 지켜보는 대회 모음'}
            </p>
          </div>
          <span className="text-xs font-black text-blue-600 bg-blue-50 px-3 py-1.5 rounded-xl uppercase tracking-widest">{filteredData.length} Results</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
          {filteredData.map((race: any) => (
            <article 
              key={race.id} 
              className="group bg-white rounded-[32px] border border-slate-200/60 overflow-hidden shadow-sm hover:shadow-[0_20px_50px_-12px_rgba(0,0,0,0.08)] transition-all duration-500 flex flex-col cursor-pointer active:scale-[0.98]"
              onClick={() => router.push(`/marathon/${race.id}`)}
            >
              <div className="p-7 flex-1 flex flex-col">
                <div className="flex justify-between items-start mb-6">
                  <span className={`px-3.5 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wider border ${
                    race.dynamicStatus === '종료' ? 'bg-slate-50 text-slate-400 border-slate-100' : 'bg-blue-50 text-blue-600 border-blue-100'
                  }`}>
                    {race.dynamicStatus}
                  </span>
                  <button 
                    onClick={(e) => toggleBookmark(e, race.id)}
                    className={`w-11 h-11 rounded-2xl flex items-center justify-center transition-all ${
                      bookmarks.includes(race.id) ? 'bg-rose-50 text-rose-500 shadow-inner' : 'bg-slate-50 text-slate-300 hover:text-rose-400'
                    }`}
                  >
                    <Heart className={`w-5 h-5 ${bookmarks.includes(race.id) ? 'fill-rose-500' : ''}`} />
                  </button>
                </div>

                <h3 className="text-[20px] font-[900] text-slate-900 mb-6 leading-tight tracking-tight group-hover:text-blue-600 transition-colors line-clamp-2">
                  {race.name}
                </h3>

                <div className="space-y-3 mb-8 flex-1">
                  <div className="flex items-center text-slate-600 font-bold text-sm">
                    <Calendar className="w-4 h-4 mr-3 text-blue-500" />
                    {race.date}
                  </div>
                  <div className="flex items-center text-slate-600 font-bold text-sm">
                    <MapPin className="w-4 h-4 mr-3 text-rose-500" />
                    <span className="truncate">{race.location}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-6 border-t border-slate-50">
                  <div className="flex gap-1.5">
                    <span className="text-[9px] font-black text-slate-400 px-2 py-1 bg-slate-50 rounded-md border border-slate-100 uppercase tracking-tighter">{race.distance || 'Multi'}</span>
                  </div>
                  <div className="w-9 h-9 rounded-full bg-slate-900 group-hover:bg-blue-600 flex items-center justify-center transition-all">
                    <ChevronRight className="w-4 h-4 text-white" />
                  </div>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>

      {/* Floating Bottom Nav */}
      <div className="fixed bottom-8 left-1/2 -translate-x-1/2 w-full max-w-sm px-4 z-50">
        <nav className="bg-slate-950/90 backdrop-blur-2xl border border-white/10 p-2 flex justify-between items-center rounded-[32px] shadow-2xl">
          <button onClick={() => setViewMode('all')} className={`flex-1 flex flex-col items-center py-2 transition-colors ${viewMode === 'all' ? 'text-white' : 'text-slate-500 hover:text-slate-300'}`}>
            <Flame className={`w-5 h-5 mb-1 ${viewMode === 'all' ? 'fill-white' : ''}`} />
            <span className="text-[9px] font-black uppercase tracking-tighter">Feed</span>
          </button>
          <button onClick={() => router.push('/map')} className="flex-1 flex flex-col items-center py-2 text-slate-500 hover:text-slate-300 transition-colors">
            <MapPin className="w-5 h-5 mb-1" />
            <span className="text-[9px] font-black uppercase tracking-tighter">Maps</span>
          </button>
          <button onClick={() => setViewMode('saved')} className={`flex-1 flex flex-col items-center py-2 transition-colors ${viewMode === 'saved' ? 'text-rose-500' : 'text-slate-500 hover:text-slate-300'}`}>
            <Heart className={`w-5 h-5 mb-1 ${viewMode === 'saved' ? 'fill-rose-500' : ''}`} />
            <span className="text-[9px] font-black uppercase tracking-tighter">Saved</span>
          </button>
        </nav>
      </div>
    </main>
  );
}
