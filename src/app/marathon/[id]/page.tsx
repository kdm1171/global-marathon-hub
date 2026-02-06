"use client";

import React from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Calendar, MapPin, Globe, Phone, CreditCard, Share2 } from 'lucide-react';

export default function MarathonDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  
  // 실제 데이터 매칭 로직은 나중에 추가 (현재는 Mockup)
  const race = {
    title: "제20회 제주국제마라톤대회",
    date: "2024.05.19",
    location: "제주 제주시 구좌읍 (구좌종합운동장)",
    entry_fee: "50,000원",
    phone: "064-123-4567",
    website: "http://example.com",
    courses: ["Full", "Half", "10km", "5km"]
  };

  return (
    <main className="min-h-screen bg-white pb-24">
      {/* Hero Section */}
      <div className="relative h-64 bg-slate-900 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent z-10" />
        <div className="absolute top-6 left-4 z-20">
          <button 
            onClick={() => router.back()}
            className="p-2 bg-white/20 backdrop-blur-md rounded-full text-white"
          >
            <ArrowLeft className="w-6 h-6" />
          </button>
        </div>
        <div className="absolute bottom-6 left-6 right-6 z-20">
          <div className="flex gap-2 mb-3">
            {race.courses.map(c => (
              <span key={c} className="px-2 py-0.5 bg-blue-600 text-white text-[10px] font-bold rounded">
                {c}
              </span>
            ))}
          </div>
          <h1 className="text-2xl font-bold text-white leading-tight">
            {race.title}
          </h1>
        </div>
      </div>

      {/* Info Body */}
      <div className="px-6 py-8 space-y-8">
        <section className="grid grid-cols-1 gap-6">
          <div className="flex items-start">
            <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center mr-4 shrink-0 text-slate-500">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-tighter mb-1">Race Date</p>
              <p className="text-base font-semibold text-slate-900">{race.date}</p>
            </div>
          </div>

          <div className="flex items-start">
            <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center mr-4 shrink-0 text-slate-500">
              <MapPin className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-tighter mb-1">Venue</p>
              <p className="text-base font-semibold text-slate-900">{race.location}</p>
            </div>
          </div>

          <div className="flex items-start">
            <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center mr-4 shrink-0 text-slate-500">
              <CreditCard className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-tighter mb-1">Entry Fee</p>
              <p className="text-base font-semibold text-slate-900">{race.entry_fee}</p>
            </div>
          </div>
        </section>

        <section className="pt-8 border-t border-slate-100">
          <h2 className="text-sm font-bold text-slate-900 mb-4">Contact & Support</h2>
          <div className="space-y-3">
            <a href={`tel:${race.phone}`} className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl text-slate-700 font-medium hover:bg-slate-100 transition-colors">
              <div className="flex items-center">
                <Phone className="w-4 h-4 mr-3 text-slate-400" />
                전화 문의하기
              </div>
              <p className="text-sm font-bold">{race.phone}</p>
            </a>
            <a href={race.website} target="_blank" className="flex items-center justify-between p-4 bg-blue-50 rounded-2xl text-blue-700 font-medium hover:bg-blue-100 transition-colors">
              <div className="flex items-center">
                <Globe className="w-4 h-4 mr-3 text-blue-500" />
                공식 홈페이지 방문
              </div>
              <Globe className="w-4 h-4 opacity-50" />
            </a>
          </div>
        </section>
      </div>

      {/* Action Bar */}
      <div className="fixed bottom-0 left-0 right-0 p-6 bg-white/80 backdrop-blur-md border-t border-slate-100 max-w-md mx-auto">
        <div className="flex gap-3">
          <button className="flex-1 bg-slate-900 text-white font-bold py-4 rounded-2xl hover:bg-slate-800 transition-all active:scale-95 shadow-lg shadow-slate-200">
            참가 신청하기
          </button>
          <button className="w-14 h-14 bg-slate-100 rounded-2xl flex items-center justify-center text-slate-600 hover:bg-slate-200 transition-all">
            <Share2 className="w-6 h-6" />
          </button>
        </div>
      </div>
    </main>
  );
}
