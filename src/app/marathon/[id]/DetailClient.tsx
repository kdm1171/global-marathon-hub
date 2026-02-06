"use client";

import React from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Calendar, MapPin, Globe, Phone, CreditCard, Share2, Award, ChevronRight, Info, ShieldCheck } from 'lucide-react';

export default function DetailClient({ race }: { race: any }) {
  const router = useRouter();

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: race.name,
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert('링크가 복사되었습니다.');
    }
  };

  return (
    <main className="min-h-screen bg-[#F8FAFC] pb-32 font-sans selection:bg-blue-100">
      {/* Dynamic Header */}
      <nav className="sticky top-0 z-50 bg-white/70 backdrop-blur-xl border-b border-slate-200/50 px-4 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <button 
            onClick={() => router.back()}
            className="flex items-center gap-2 text-slate-900 font-bold hover:text-blue-600 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="hidden sm:block">Back to Feed</span>
          </button>
          <div className="flex items-center gap-3">
            <button 
              onClick={handleShare}
              className="p-2.5 bg-slate-100 rounded-xl text-slate-600 hover:bg-slate-200 transition-all"
            >
              <Share2 className="w-5 h-5" />
            </button>
          </div>
        </div>
      </nav>

      <div className="max-w-6xl mx-auto px-4 md:px-8 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          
          {/* Left Column: Main Info (8 slots) */}
          <div className="lg:col-span-8 space-y-10">
            <section>
              <div className="flex gap-2 mb-6">
                <span className="px-4 py-1.5 bg-blue-600 text-white text-[11px] font-black rounded-full uppercase tracking-widest shadow-lg shadow-blue-500/20">
                  {race.distance || 'Multi-Course'}
                </span>
                <span className="px-4 py-1.5 bg-emerald-50 text-emerald-600 text-[11px] font-black rounded-full uppercase tracking-widest border border-emerald-100">
                  {race.status || 'Verified'}
                </span>
              </div>
              <h1 className="text-3xl md:text-5xl font-[1000] text-slate-900 leading-[1.15] tracking-tight mb-8">
                {race.name}
              </h1>
              
              <div className="aspect-[21/9] w-full bg-slate-900 rounded-[40px] overflow-hidden relative group shadow-2xl">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-600/20 to-indigo-900/40 mix-blend-overlay" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center space-y-2 opacity-40 group-hover:opacity-100 transition-opacity">
                    <Info className="w-12 h-12 text-white mx-auto" />
                    <p className="text-white font-bold uppercase tracking-[0.3em] text-xs text-center">Course Map Preview</p>
                  </div>
                </div>
              </div>
            </section>

            <section className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              {[
                { icon: Calendar, label: "Race Date", value: race.date, color: "text-blue-600", bg: "bg-blue-50" },
                { icon: MapPin, label: "Race Venue", value: race.location, color: "text-rose-600", bg: "bg-rose-50" },
                { icon: Award, label: "Organizer", value: race.organizer, color: "text-emerald-600", bg: "bg-emerald-50" }
              ].map((item, i) => (
                <div key={i} className="p-6 bg-white rounded-[32px] border border-slate-200/60 shadow-sm hover:shadow-md transition-all">
                  <div className={`w-12 h-12 rounded-2xl ${item.bg} flex items-center justify-center mb-4 ${item.color}`}>
                    <item.icon className="w-6 h-6" />
                  </div>
                  <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest mb-1">{item.label}</p>
                  <p className="text-[15px] font-bold text-slate-900 leading-tight">{item.value}</p>
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
                <ul className="mt-6 space-y-3">
                  <li className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                    안전한 경기를 위해 의료진과 구급차가 상시 대기합니다.
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                    참가자 전원에게 기록 측정용 칩과 기념품이 제공됩니다.
                  </li>
                </ul>
              </div>
            </section>
          </div>

          {/* Right Column: Sticky Sidebar (4 slots) */}
          <div className="lg:col-span-4">
            <aside className="sticky top-[100px] space-y-6">
              <div className="bg-slate-900 rounded-[40px] p-8 shadow-2xl shadow-blue-900/20 text-white">
                <h3 className="text-xl font-black mb-6 tracking-tight">Registration</h3>
                <div className="space-y-6 mb-8">
                  <div className="flex justify-between items-center pb-4 border-b border-white/10">
                    <span className="text-slate-400 text-sm font-bold uppercase tracking-widest">Entry Fee</span>
                    <span className="text-xl font-black">50,000 KRW</span>
                  </div>
                  <div className="flex justify-between items-center pb-4 border-b border-white/10">
                    <span className="text-slate-400 text-sm font-bold uppercase tracking-widest">Eligibility</span>
                    <span className="text-sm font-bold">Everyone</span>
                  </div>
                </div>
                <a 
                  href={race.link} 
                  target="_blank" 
                  className="w-full bg-blue-600 hover:bg-blue-500 text-white font-black py-5 rounded-2xl flex items-center justify-center gap-2 transition-all active:scale-95 shadow-xl shadow-blue-600/30"
                >
                  <Globe className="w-5 h-5" />
                  공식 홈페이지 신청
                </a>
              </div>

              <div className="bg-white rounded-[40px] p-8 border border-slate-200/60 shadow-sm">
                <h3 className="text-lg font-[900] text-slate-900 mb-6 tracking-tight">Support</h3>
                <div className="space-y-3">
                  <button className="w-full flex items-center justify-between p-4 bg-slate-50 rounded-2xl text-slate-700 font-bold hover:bg-slate-100 transition-all border border-slate-100">
                    <div className="flex items-center gap-3">
                      <Phone className="w-4 h-4 text-slate-400" />
                      전화 문의
                    </div>
                    <ChevronRight className="w-4 h-4 opacity-30" />
                  </button>
                  <button className="w-full flex items-center justify-between p-4 bg-slate-50 rounded-2xl text-slate-700 font-bold hover:bg-slate-100 transition-all border border-slate-100">
                    <div className="flex items-center gap-3">
                      <Calendar className="w-4 h-4 text-slate-400" />
                      캘린더에 추가
                    </div>
                    <ChevronRight className="w-4 h-4 opacity-30" />
                  </button>
                </div>
              </div>
            </aside>
          </div>

        </div>
      </div>
    </main>
  );
}