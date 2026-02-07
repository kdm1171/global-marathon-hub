"use client";

import React, { useState, useMemo, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Calendar, MapPin, Search, Sparkles, Heart, Flame, Clock, 
  ExternalLink, LayoutGrid, List, ChevronRight, AlertCircle, CheckCircle2 
} from 'lucide-react';
import marathonData from '@/data/marathons.json';

export default function HomePage() {
  const router = useRouter();
  const [regionFilter, setRegionFilter] = useState('전체');
  const [courseFilter, setCourseFilter] = useState('전체');
  const [searchTerm, setSearchTerm] = useState('');
  const [bookmarks, setBookmarks] = useState<number[]>([]);
  const [viewMode, setViewMode] = useState<'all' | 'saved'>('all');
  const [displayType, setDisplayType] = useState<'card' | 'list'>('card');

  useEffect(() => {
    const saved = localStorage.getItem('run-hub-bookmarks');
    if (saved) setBookmarks(JSON.parse(saved));
  }, []);

  const toggleBookmark = (e: React.MouseEvent, id: number) => {
    e.stopPropagation();
    const updated = bookmarks.includes(id) ? bookmarks.filter(b => b !== id) : [...bookmarks, id];
    setBookmarks(updated);
    localStorage.setItem('run-hub-bookmarks', JSON.stringify(updated));
  };

  const filteredData = useMemo(() => {
    const now = new Date();
    now.setHours(0, 0, 0, 0);

    return marathonData.filter((m: any) => {
      const matchesView = viewMode === 'all' || bookmarks.includes(m.id);
      const matchesRegion = regionFilter === '전체' || m.region === regionFilter;
      const matchesCourse = courseFilter === '전체' || m.race_types.some((t: string) => t.toLowerCase().includes(courseFilter.toLowerCase()));
      const matchesSearch = m.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                            m.organizer.toLowerCase().includes(searchTerm.toLowerCase());
      return matchesView && matchesRegion && matchesCourse && matchesSearch;
    }).map((race: any) => {
      // --- 4단계 정밀 태깅 로직 ---
      const compDate = new Date(race.date);
      const regStart = race.reg_start ? new Date(race.reg_start) : null;
      const regEnd = race.reg_end ? new Date(race.reg_end) : null;
      
      let status = '접수중';
      let statusColor = 'blue';

      if (now > compDate) {
        status = '대회종료';
        statusColor = 'slate';
      } else if (regEnd && now > regEnd) {
        status = '접수마감';
        statusColor = 'rose';
      } else if (regStart && now < regStart) {
        status = '접수전';
        statusColor = 'amber';
      } else if (race.status.includes('마감')) {
        status = '접수마감';
        statusColor = 'rose';
      }

      const diffDays = Math.ceil((compDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
      return { ...race, dynamicStatus: status, statusColor, diffDays };
    }).sort((a: any, b: any) => {
      const order = { '접수중': 0, '접수전': 1, '접수마감': 2, '대회종료': 3 };
      if (order[a.dynamicStatus as keyof typeof order] !== order[b.dynamicStatus as keyof typeof order]) {
        return order[a.dynamicStatus as keyof typeof order] - order[b.dynamicStatus as keyof typeof order];
      }
      return a.diffDays - b.diffDays;
    });
  }, [regionFilter, courseFilter, searchTerm, bookmarks, viewMode]);

  const regions = ['전체', '서울', '경기', '인천', '강원', '충청', '경상', '전라', '제주'];
  const courses = ['전체', 'Full', 'Half', '10km', '5km'];

  return (
    <main className="min-h-screen bg-[#F8FAFC] pb-32 font-sans relative selection:bg-blue-100">
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-2xl border-b border-slate-200/50 px-4 py-4 md:px-8">
        <div className="max-w-6xl mx-auto flex items-center justify-between gap-6">
          <div className="flex items-center gap-2 cursor-pointer shrink-0" onClick={() => window.location.reload()}>
            <div className="w-10 h-10 bg-blue-600 rounded-2xl flex items-center justify-center shadow-xl shadow-blue-200">
              <Sparkles className="w-5 h-5 text-white fill-white" />
            </div>
            <h1 className="text-2xl font-black italic tracking-tighter text-blue-600 hidden sm:block">RUNHUB</h1>
          </div>
          
          <div className="relative flex-1 max-w-xl">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input 
              type="text" 
              placeholder="대회명, 주최사 검색..."
              className="w-full bg-slate-100/80 border-none rounded-2xl py-3.5 pl-12 pr-4 text-sm focus:ring-2 focus:ring-blue-500/20 focus:bg-white transition-all outline-none"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="hidden md:flex items-center gap-2">
            <div className="flex bg-slate-100 p-1 rounded-xl mr-2">
              <button onClick={() => setDisplayType('card')} className={`p-2 rounded-lg transition-all ${displayType === 'card' ? 'bg-white shadow-sm text-blue-600' : 'text-slate-400'}`}><LayoutGrid className="w-4 h-4" /></button>
              <button onClick={() => setDisplayType('list')} className={`p-2 rounded-lg transition-all ${displayType === 'list' ? 'bg-white shadow-sm text-blue-600' : 'text-slate-400'}`}><List className="w-4 h-4" /></button>
            </div>
            <button onClick={() => setViewMode('all')} className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${viewMode === 'all' ? 'text-blue-600 bg-blue-50' : 'text-slate-500 hover:bg-slate-50'}`}>All</button>
            <button onClick={() => setViewMode('saved')} className={`px-4 py-2 rounded-xl text-sm font-bold transition-all flex items-center gap-2 ${viewMode === 'saved' ? 'text-rose-600 bg-rose-50' : 'text-slate-500 hover:bg-slate-50'}`}>
              <Heart className={`w-4 h-4 ${viewMode === 'saved' ? 'fill-rose-600' : ''}`} /> Saved
            </button>
          </div>
        </div>
      </header>

      {/* Filter Bar */}
      <div className="bg-white/40 border-b border-slate-200/40 sticky top-[73px] z-40 backdrop-blur-md">
        <div className="max-w-6xl mx-auto px-4 md:px-8 py-2">
          <div className="flex justify-center items-center gap-2 py-2 overflow-x-auto no-scrollbar border-b border-slate-100/50">
            {regions.map(r => (
              <button key={r} onClick={() => setRegionFilter(r)} className={`px-5 py-1.5 rounded-full text-[11px] font-black transition-all shrink-0 border-2 ${regionFilter === r ? 'bg-blue-600 border-blue-600 text-white shadow-lg' : 'bg-white border-slate-100 text-slate-400 hover:border-slate-200'}`}>{r}</button>
            ))}
          </div>
          <div className="flex justify-center items-center gap-2 py-2 overflow-x-auto no-scrollbar">
            {courses.map(c => (
              <button key={c} onClick={() => setCourseFilter(c)} className={`px-5 py-1.5 rounded-full text-[11px] font-black transition-all shrink-0 border-2 ${courseFilter === c ? 'bg-slate-900 border-slate-900 text-white shadow-lg' : 'bg-white border-slate-100 text-slate-400 hover:border-slate-200'}`}>{c}</button>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 md:px-8 py-10">
        <div className="flex items-center justify-between mb-8 px-1">
          <h2 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2 capitalize">
            {displayType} View <span className="text-slate-300 ml-2">/</span> <span className="text-blue-600">{filteredData.length}</span>
          </h2>
          <div className="flex md:hidden bg-slate-100 p-1 rounded-xl">
            <button onClick={() => setDisplayType('card')} className={`p-2 rounded-lg ${displayType === 'card' ? 'bg-white shadow-sm text-blue-600' : 'text-slate-400'}`}><LayoutGrid className="w-4 h-4" /></button>
            <button onClick={() => setDisplayType('list')} className={`p-2 rounded-lg ${displayType === 'list' ? 'bg-white shadow-sm text-blue-600' : 'text-slate-400'}`}><List className="w-4 h-4" /></button>
          </div>
        </div>

        {displayType === 'card' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-8">
            {filteredData.map((race: any) => (
              <CardItem key={race.id} race={race} bookmarks={bookmarks} toggleBookmark={toggleBookmark} />
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-[32px] border border-slate-200/60 overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-100">
                    <th className="px-6 py-4 text-[11px] font-black text-slate-400 uppercase">Status</th>
                    <th className="px-6 py-4 text-[11px] font-black text-slate-400 uppercase">Competition</th>
                    <th className="px-6 py-4 text-[11px] font-black text-slate-400 uppercase">Date / Time</th>
                    <th className="px-6 py-4 text-[11px] font-black text-slate-400 uppercase">Location</th>
                    <th className="px-6 py-4 text-[11px] font-black text-slate-400 uppercase text-right">Link</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {filteredData.map((race: any) => (
                    <ListItem key={race.id} race={race} bookmarks={bookmarks} toggleBookmark={toggleBookmark} />
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Floating Bottom Nav */}
      <div className="fixed bottom-8 left-1/2 -translate-x-1/2 w-full max-w-sm px-4 z-50">
        <nav className="bg-slate-950/95 backdrop-blur-3xl border border-white/10 p-2.5 flex justify-between items-center rounded-[35px] shadow-[0_20px_50px_-10px_rgba(0,0,0,0.5)]">
          <button onClick={() => setViewMode('all')} className={`flex-1 flex col items-center py-2 transition-colors ${viewMode === 'all' ? 'text-white' : 'text-slate-500'}`}>
            <Flame className={`w-5 h-5 mb-1 ${viewMode === 'all' ? 'fill-white' : ''}`} />
            <span className="text-[9px] font-black uppercase tracking-tighter">Events</span>
          </button>
          <button onClick={() => router.push('/map')} className="flex-1 flex flex-col items-center py-2 text-slate-500 hover:text-white transition-colors">
            <MapPin className="w-5 h-5 mb-1" />
            <span className="text-[9px] font-black uppercase tracking-tighter">Map</span>
          </button>
          <button onClick={() => setViewMode('saved')} className={`flex-1 flex flex-col items-center py-2 transition-colors ${viewMode === 'saved' ? 'text-rose-500' : 'text-slate-500'}`}>
            <Heart className={`w-5 h-5 mb-1 ${viewMode === 'saved' ? 'fill-rose-500' : ''}`} />
            <span className="text-[9px] font-black uppercase tracking-tighter">Saved</span>
          </button>
        </nav>
      </div>
    </main>
  );
}

function CardItem({ race, bookmarks, toggleBookmark }: any) {
  const getBadgeStyle = (color: string) => {
    const maps: any = {
      blue: 'bg-blue-50 text-blue-600 border-blue-100',
      rose: 'bg-rose-50 text-rose-600 border-rose-100',
      amber: 'bg-amber-50 text-amber-600 border-amber-100',
      slate: 'bg-slate-50 text-slate-400 border-slate-100'
    };
    return maps[color] || maps.blue;
  };

  return (
    <article 
      className={`group bg-white rounded-[40px] border border-slate-200/50 overflow-hidden shadow-sm hover:shadow-[0_30px_60px_-15px_rgba(0,0,0,0.1)] transition-all duration-500 flex flex-col cursor-pointer ${race.dynamicStatus === '대회종료' ? 'grayscale opacity-50' : 'hover:-translate-y-1'}`}
      onClick={() => window.open(race.link, '_blank')}
    >
      <div className="p-8 md:p-10 flex-1 flex flex-col">
        <div className="flex justify-between items-start mb-8">
          <div className="flex flex-col gap-2">
            <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border w-fit ${getBadgeStyle(race.statusColor)}`}>
              {race.dynamicStatus}
            </span>
            <div className="flex items-center gap-2 text-[11px] font-black text-slate-400 uppercase tracking-tighter">
              {race.region} Region <span className="w-1 h-1 bg-slate-200 rounded-full" /> {race.organizer.split('\n')[0]}
            </div>
          </div>
          <button onClick={(e) => toggleBookmark(e, race.id)} className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all ${bookmarks.includes(race.id) ? 'bg-rose-50 text-rose-500 shadow-inner' : 'bg-slate-50 text-slate-200 hover:bg-rose-50 hover:text-rose-400'}`}>
            <Heart className={`w-5 h-5 ${bookmarks.includes(race.id) ? 'fill-rose-500' : ''}`} />
          </button>
        </div>
        <h3 className="text-[24px] md:text-[28px] font-black text-slate-900 mb-8 leading-[1.2] tracking-tight group-hover:text-blue-600 transition-colors">{race.name}</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-4 gap-x-8 mb-10">
          <div className="flex items-center text-slate-600 font-bold text-[15px]"><div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center mr-4 shrink-0"><Calendar className="w-5 h-5 text-blue-500" /></div>{race.date}</div>
          <div className="flex items-center text-slate-600 font-bold text-[15px]"><div className="w-10 h-10 bg-orange-50 rounded-xl flex items-center justify-center mr-4 shrink-0"><Clock className="w-5 h-5 text-orange-500" /></div>{race.start_time}</div>
          <div className="flex items-center text-slate-600 font-bold text-[15px] sm:col-span-2"><div className="w-10 h-10 bg-rose-50 rounded-xl flex items-center justify-center mr-4 shrink-0"><MapPin className="w-5 h-5 text-rose-500" /></div><span className="line-clamp-1">{race.location_full}</span></div>
        </div>
        <div className="flex items-center justify-between pt-8 border-t border-slate-50 mt-auto">
          <div className="flex flex-wrap gap-2">
            {race.race_types.map((type: string) => (
              <span key={type} className="text-[10px] font-black text-slate-500 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-100 uppercase">{type}</span>
            ))}
          </div>
          <ExternalLink className="w-5 h-5 text-slate-300 group-hover:text-blue-600 transition-colors" />
        </div>
      </div>
    </article>
  );
}

function ListItem({ race, bookmarks, toggleBookmark }: any) {
  return (
    <tr className={`group hover:bg-slate-50 transition-colors cursor-pointer ${race.dynamicStatus === '대회종료' ? 'opacity-40 grayscale' : ''}`} onClick={() => window.open(race.link, '_blank')}>
      <td className="px-6 py-5 whitespace-nowrap">
        <span className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase border ${
          race.statusColor === 'blue' ? 'bg-blue-50 text-blue-600 border-blue-100' :
          race.statusColor === 'rose' ? 'bg-rose-50 text-rose-600 border-rose-100' :
          race.statusColor === 'amber' ? 'bg-amber-50 text-amber-600 border-amber-100' :
          'bg-slate-50 text-slate-400 border-slate-100'
        }`}>
          {race.dynamicStatus}
        </span>
      </td>
      <td className="px-6 py-5">
        <div className="flex items-center gap-3">
          <button onClick={(e) => toggleBookmark(e, race.id)} className={`shrink-0 transition-colors ${bookmarks.includes(race.id) ? 'text-rose-500' : 'text-slate-200 hover:text-rose-300'}`}>
            <Heart className={`w-4 h-4 ${bookmarks.includes(race.id) ? 'fill-current' : ''}`} />
          </button>
          <div>
            <div className="text-sm font-black text-slate-900 line-clamp-1">{race.name}</div>
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">{race.region} Region • {race.race_types.join(', ')}</div>
          </div>
        </div>
      </td>
      <td className="px-6 py-5 whitespace-nowrap">
        <div className="text-sm font-bold text-slate-700">{race.date}</div>
        <div className="text-[10px] font-medium text-slate-400">{race.start_time}</div>
      </td>
      <td className="px-6 py-5">
        <div className="text-sm font-medium text-slate-500 line-clamp-1">{race.location_full}</div>
      </td>
      <td className="px-6 py-5 text-right">
        <ExternalLink className="w-4 h-4 text-slate-300 inline-block group-hover:text-blue-600" />
      </td>
    </tr>
  );
}