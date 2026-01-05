
import React, { useState, useRef } from 'react';
import Layout from './components/Layout';
import ArticleCard from './components/ArticleCard';
import PipelineVisualizer from './components/PipelineVisualizer';
import PosterMockup from './components/PosterMockup';
import { simulateCrawling, summarizeArticles, generateCoverImage } from './services/geminiService';
import { NewsArticle, PipelineStep, RoundupData } from './types';
import { Play, RotateCcw, Download, Search, Sparkles, Loader2 } from 'lucide-react';
import { toPng } from 'html-to-image';

const App: React.FC = () => {
  const [step, setStep] = useState<PipelineStep>(PipelineStep.IDLE);
  const [articles, setArticles] = useState<NewsArticle[]>([]);
  const [roundup, setRoundup] = useState<RoundupData | null>(null);
  const [isDownloading, setIsDownloading] = useState(false);
  const posterRef = useRef<HTMLDivElement>(null);

  const runPipeline = async () => {
    try {
      setStep(PipelineStep.CRAWLING);
      const fetchedArticles = await simulateCrawling();
      setArticles(fetchedArticles);

      setStep(PipelineStep.SUMMARIZING);
      const { summary, scoredArticles } = await summarizeArticles(fetchedArticles);
      setArticles(scoredArticles);

      setStep(PipelineStep.GENERATING_IMAGE);
      const headline = scoredArticles[0];
      const secondaries = scoredArticles.slice(1, 4); 

      const coverUrl = await generateCoverImage(headline.title);
      
      const todayFormatted = new Date().toLocaleDateString('zh-CN', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      });

      setRoundup({
        title: "今日公众号 AI 采编精选",
        date: todayFormatted,
        summaryText: summary,
        headlineArticle: headline,
        secondaryArticles: secondaries,
        coverImageUrl: coverUrl
      });

      setStep(PipelineStep.COMPLETED);
    } catch (error) {
      console.error("Pipeline failed", error);
      setStep(PipelineStep.IDLE);
    }
  };

  const handleDownload = async () => {
    if (!posterRef.current) return;
    setIsDownloading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const dataUrl = await toPng(posterRef.current, {
        cacheBust: true,
        quality: 1,
        pixelRatio: 2,
      });
      
      const link = document.createElement('a');
      link.download = `WeNews-Daily-${new Date().toISOString().split('T')[0]}.png`;
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error('Download failed', err);
      alert('保存图片失败，请重试');
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <Layout>
      <div className="space-y-8">
        {/* Top Control Section */}
        <section className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-[2rem] p-8 border border-slate-200 shadow-sm">
              <div className="flex justify-between items-center mb-8">
                <div>
                  <h2 className="text-2xl font-black text-slate-800 tracking-tight">今日抓取实况</h2>
                  <p className="text-slate-500">
                    实时监控：量子位、虎嗅、晚点、差评等顶级公众号源
                  </p>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="flex items-center px-4 py-2 bg-emerald-50 border border-emerald-100 rounded-xl text-xs font-bold text-emerald-600">
                    <Sparkles className="w-3 h-3 mr-2" />
                    今日热点模式
                  </div>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {articles.length > 0 ? (
                  articles.map(article => (
                    <ArticleCard key={article.id} article={article} />
                  ))
                ) : (
                  <div className="col-span-full py-24 flex flex-col items-center justify-center text-slate-300 border-2 border-dashed border-slate-100 rounded-[2rem]">
                    <Search className="w-16 h-16 mb-4 opacity-10" />
                    <p className="font-semibold text-slate-400">点击右侧按钮，一键抓取今日资讯</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="space-y-6 pipeline-controls">
            <div className="bg-white rounded-[2rem] p-8 border border-slate-200 shadow-sm sticky top-28">
              <div className="flex items-center space-x-2 mb-6">
                <h2 className="text-xl font-bold text-slate-800 uppercase tracking-tighter">自动化流程</h2>
              </div>
              
              <div className="space-y-6">
                <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100">
                   <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">生成日期</p>
                   <p className="text-lg font-black text-slate-800">{new Date().toLocaleDateString('zh-CN', { month: 'long', day: 'numeric', weekday: 'long' })}</p>
                </div>
                
                <div className="py-6 border-y border-slate-100">
                  <PipelineVisualizer currentStep={step} />
                </div>

                <button 
                  onClick={runPipeline}
                  disabled={step !== PipelineStep.IDLE && step !== PipelineStep.COMPLETED}
                  className={`w-full py-5 rounded-2xl font-black text-lg flex items-center justify-center space-x-3 transition-all shadow-xl ${
                    step === PipelineStep.IDLE || step === PipelineStep.COMPLETED
                    ? 'bg-emerald-600 text-white hover:bg-emerald-700 shadow-emerald-200 scale-[1.02] active:scale-95'
                    : 'bg-slate-100 text-slate-400 cursor-not-allowed shadow-none'
                  }`}
                >
                  <Play className="w-6 h-6 fill-current" />
                  <span>生成今日精选</span>
                </button>
                
                <button 
                  onClick={() => { setStep(PipelineStep.IDLE); setArticles([]); setRoundup(null); }}
                  className="w-full py-3 text-slate-400 text-sm font-bold flex items-center justify-center space-x-2 hover:text-rose-500 transition-colors"
                >
                  <RotateCcw className="w-4 h-4" />
                  <span>清除今日数据</span>
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* Result Preview Section */}
        {roundup && (
          <section className="bg-white rounded-[3rem] p-10 border border-slate-200 shadow-sm animate-in fade-in slide-in-from-bottom-8 duration-1000">
            <div className="flex flex-col xl:flex-row gap-20 items-start">
              <div className="flex-1 space-y-10">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
                  <div>
                    <h2 className="text-4xl font-black text-slate-900 mb-2">生成产物</h2>
                    <p className="text-slate-500 text-lg">
                      已按“1条头条 + {roundup.secondaryArticles.length}条精选”模式完成排版
                    </p>
                  </div>
                  <div className="flex space-x-4">
                    <button 
                      onClick={handleDownload}
                      disabled={isDownloading}
                      className="flex items-center space-x-2 bg-emerald-500 text-white px-8 py-4 rounded-2xl font-black hover:bg-emerald-600 transition-all shadow-2xl shadow-emerald-200 disabled:opacity-50"
                    >
                      {isDownloading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Download className="w-5 h-5" />}
                      <span>{isDownloading ? '正在生成图片...' : '保存长图到本地'}</span>
                    </button>
                  </div>
                </div>
                
                <div className="bg-slate-50 rounded-[2.5rem] p-10 border border-slate-100">
                  <h3 className="text-xl font-black text-slate-900 mb-8 flex items-center">
                    <span className="w-2 h-8 bg-emerald-500 rounded-full mr-4"></span>
                    内容明细 ({roundup.date})
                  </h3>
                  <div className="space-y-10">
                    <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-200/50">
                      <p className="text-[10px] font-bold text-rose-500 uppercase tracking-widest mb-3">Top Headline</p>
                      <p className="text-2xl font-black text-slate-900 mb-4 leading-tight">{roundup.headlineArticle.title}</p>
                      <div className="flex items-center space-x-4">
                        <span className="text-xs font-bold px-3 py-1 bg-slate-100 rounded-full">{roundup.headlineArticle.source}</span>
                        <span className="text-xs text-slate-400">{roundup.headlineArticle.date}</span>
                      </div>
                    </div>
                    
                    <div>
                      <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-6">Secondary Stories</p>
                      <div className="grid grid-cols-1 gap-4">
                        {roundup.secondaryArticles.map((a, i) => (
                          <div key={a.id} className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex items-center justify-between">
                            <div className="flex items-start space-x-4">
                              <span className="text-emerald-500 font-black text-lg pt-1">0{i+1}</span>
                              <div>
                                <p className="text-base font-bold text-slate-800 leading-snug">{a.title}</p>
                                <p className="text-xs text-slate-400 mt-1">{a.source} · {a.date}</p>
                              </div>
                            </div>
                            <div className="bg-slate-50 px-3 py-1 rounded-full text-[10px] font-bold text-slate-400">
                              RANK #{a.score}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="xl:w-[420px] w-full flex-shrink-0 flex justify-center bg-slate-100/50 py-16 px-6 rounded-[4rem] border border-slate-200/50 overflow-hidden">
                <div ref={posterRef}>
                  <PosterMockup data={roundup} />
                </div>
              </div>
            </div>
          </section>
        )}
      </div>
    </Layout>
  );
};

export default App;
