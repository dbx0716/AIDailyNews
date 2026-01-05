
import React from 'react';
import { RoundupData } from '../types';
import { TrendingUp, Calendar } from 'lucide-react';

interface PosterMockupProps {
  data: RoundupData;
}

const PosterMockup: React.FC<PosterMockupProps> = ({ data }) => {
  return (
    <div className="relative mx-auto w-[340px] bg-slate-900 rounded-[3rem] p-3 shadow-2xl border-[8px] border-slate-800 overflow-hidden">
      {/* Dynamic notch area */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-6 bg-slate-800 rounded-b-2xl z-20"></div>
      
      <div className="w-full bg-white rounded-[2rem] overflow-hidden min-h-[600px] flex flex-col pb-10">
        {/* TOP STORY / HEADLINE */}
        <div className="relative w-full aspect-[16/10] overflow-hidden bg-slate-200">
          {data.coverImageUrl ? (
            <img src={data.coverImageUrl} className="w-full h-full object-cover" alt="Headline" />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-emerald-500 text-white p-6 text-center italic font-serif">
              Generating Visual Cover...
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent"></div>
          <div className="absolute bottom-0 left-0 p-5 w-full">
            <div className="flex items-center space-x-2 mb-2">
              <span className="bg-rose-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-tighter">今日头条</span>
              <span className="text-white/70 text-[10px] flex items-center"><Calendar className="w-3 h-3 mr-1" /> {data.date}</span>
            </div>
            <h1 className="text-white font-bold text-xl leading-tight mb-2 drop-shadow-md">
              {data.headlineArticle.title}
            </h1>
            <div className="flex items-center justify-between text-white/80">
              <span className="text-[10px] font-medium opacity-90">来源：{data.headlineArticle.source}</span>
              <span className="text-[10px] font-bold text-emerald-400">评分 {data.headlineArticle.score}/10</span>
            </div>
          </div>
        </div>

        {/* SUMMARY BLOCK */}
        <div className="p-5 bg-emerald-50/50 border-b border-emerald-100/50">
          <div className="flex items-center space-x-2 mb-2 text-emerald-700">
            <TrendingUp className="w-4 h-4" />
            <span className="text-[11px] font-bold uppercase tracking-widest">AI 简报</span>
          </div>
          <p className="text-sm text-slate-700 leading-relaxed font-medium">
            {data.summaryText}
          </p>
        </div>

        {/* SECONDARY STORIES (Max 3) */}
        <div className="flex-1 p-5 space-y-6">
          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest border-b border-slate-100 pb-2">
            精彩推荐 (今日精选)
          </div>
          {data.secondaryArticles.map((article, idx) => (
            <div key={article.id} className="group relative">
              <div className="flex justify-between items-start mb-1.5">
                <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded">
                  {article.source}
                </span>
                <span className="text-[10px] text-slate-400">Hot Ranking #{idx + 2}</span>
              </div>
              <h3 className="text-sm font-bold text-slate-900 mb-2 leading-snug group-hover:text-emerald-600 transition-colors">
                {article.title}
              </h3>
              <p className="text-[11px] text-slate-500 leading-relaxed line-clamp-3">
                {article.summary || article.content}
              </p>
            </div>
          ))}
        </div>

        {/* FOOTER REMOVED AS PER USER REQUEST */}
      </div>
    </div>
  );
};

export default PosterMockup;
