
import React from 'react';
import { NewsArticle } from '../types';
import { ExternalLink, Star } from 'lucide-react';

interface ArticleCardProps {
  article: NewsArticle;
}

const ArticleCard: React.FC<ArticleCardProps> = ({ article }) => {
  const getScoreColor = (score?: number) => {
    if (!score) return 'bg-slate-100 text-slate-500';
    if (score >= 8) return 'bg-rose-100 text-rose-600';
    if (score >= 6) return 'bg-amber-100 text-amber-600';
    return 'bg-emerald-100 text-emerald-600';
  };

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-5 hover:shadow-lg transition-all group">
      <div className="flex justify-between items-start mb-3">
        <span className="text-xs font-medium px-2 py-1 rounded bg-slate-100 text-slate-600">
          {article.source}
        </span>
        {article.score !== undefined && (
          <div className={`flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-bold ${getScoreColor(article.score)}`}>
            <Star className="w-3 h-3 fill-current" />
            <span>{article.score}/10</span>
          </div>
        )}
      </div>
      <h3 className="text-lg font-bold text-slate-800 mb-2 leading-tight group-hover:text-emerald-600 transition-colors">
        {article.title}
      </h3>
      <p className="text-sm text-slate-500 line-clamp-2 mb-4">
        {article.summary || article.content}
      </p>
      <div className="flex items-center justify-between mt-auto pt-4 border-t border-slate-50">
        <span className="text-xs text-slate-400">{article.date}</span>
        <button className="text-emerald-500 hover:text-emerald-600 text-xs font-semibold flex items-center space-x-1">
          <span>阅读正文</span>
          <ExternalLink className="w-3 h-3" />
        </button>
      </div>
    </div>
  );
};

export default ArticleCard;
