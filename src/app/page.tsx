"use client";

import React, { useState, useMemo } from 'react';
import { Calendar, MapPin, ChevronRight, Filter, Award, Search } from 'lucide-react';
import marathonData from '@/data/marathons.json';

export default function HomePage() {
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
    <main className="min-h-screen bg-slate-50 pb-20">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-200 px-4 py-3">
        <div className="max-w-md mx-auto flex items-center justify-between">
          <h1 className="text-xl font-black italic tracking-tighter text-blue-600">RUN HUB</h1>
          <div className="relative flex-1 ml-4">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input 
              type="text" 
              placeholder="대회명 검색..."
              className="w-full bg-slate-100 border-none rounded-full py-2 pl-10 pr-4 text-sm focus:ring-2 focus:ring-blue-500 transition-all"
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
      </header>

      {/* Region Chips */}
      <div className="bg-white border-b border-slate-100 overflow-x-auto no-scrollbar py-3 px-4 flex gap-2">
        {regions.map(r => (
          <button
            key={r}
            onClick={() => setFilter(r)}
            className={`px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
              filter === r ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            {r}
          </button>
        ))}
      </div>

      {/* Marathon List */}
      <div className="max-w-md mx-auto px-4 py-6 space-y-4">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-sm font-bold text-slate-400 uppercase tracking-widest">Upcoming Races</h2>
          <span className="text-xs font-medium text-blue-500">{filteredData.length}개의 대회</span>
        </div>

        {filteredData.map((race: any, idx) => (
          <div key={idx} className="group bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-md transition-all active:scale-[0.98]">
            <div className="p-5">
              <div className="flex justify-between items-start mb-3">
                <span className="px-2 py-1 rounded bg-blue-50 text-blue-600 text-[10px] font-bold uppercase tracking-wider">
                  {race.status || '접수중'}
                </span>
                <button className="text-slate-300 hover:text-blue-500">
                  <Award className="w-5 h-5" />
                </button>
              </div>

              <h3 className="text-lg font-bold text-slate-900 mb-4 line-clamp-2 group-hover:text-blue-600 transition-colors">
                {race.name}
              </h3>

              <div className="space-y-2">
                <div className="flex items-center text-slate-500 text-sm">
                  <Calendar className="w-4 h-4 mr-2 text-slate-400" />
                  <span>{race.date}</span>
                </div>
                <div className="flex items-center text-slate-500 text-sm">
                  <MapPin className="w-4 h-4 mr-2 text-slate-400" />
                  <span>{race.location}</span>
                </div>
              </div>

              <div className="mt-5 flex items-center justify-between pt-4 border-t border-slate-50">
                <div className="flex gap-1">
                  {['Full', 'Half', '10km'].map(dist => (
                    <span key={dist} className="text-[10px] font-bold text-slate-400 px-1.5 py-0.5 border border-slate-200 rounded">
                      {dist}
                    </span>
                  ))}
                </div>
                <button className="flex items-center text-sm font-bold text-blue-600">
                  상세보기
                  <ChevronRight className="w-4 h-4 ml-1" />
                </button>
              </div>
            </div>
          </div>
        ))}

        {filteredData.length === 0 && (
          <div className="py-20 text-center space-y-4">
            <div className="bg-slate-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto text-slate-400">
              <Filter className="w-8 h-8" />
            </div>
            <p className="text-slate-500 font-medium text-sm">해당 조건에 맞는 대회가 없습니다.</p>
          </div>
        )}
      </div>

      {/* Bottom Nav Placeholder */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-lg border-t border-slate-200 px-8 py-3 flex justify-between items-center max-w-md mx-auto rounded-t-3xl shadow-2xl">
        <button className="flex flex-col items-center text-blue-600">
          <div className="w-6 h-6 bg-blue-100 rounded-lg flex items-center justify-center mb-1">
            <Calendar className="w-4 h-4" />
          </div>
          <span className="text-[10px] font-bold">대회일정</span>
        </button>
        <button className="flex flex-col items-center text-slate-400">
          <MapPin className="w-6 h-6 mb-1" />
          <span className="text-[10px] font-medium">지도검색</span>
        </button>
        <button className="flex flex-col items-center text-slate-400">
          <Award className="w-6 h-6 mb-1" />
          <span className="text-[10px] font-medium">마이페이지</span>
        </button>
      </nav>
    </main>
  );
}