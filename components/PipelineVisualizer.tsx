
import React from 'react';
import { PipelineStep } from '../types';
import { CheckCircle2, Loader2, Circle } from 'lucide-react';

interface PipelineVisualizerProps {
  currentStep: PipelineStep;
}

const steps = [
  { id: PipelineStep.CRAWLING, label: '内容抓取', description: '正在从微信公众号获取最新资讯' },
  { id: PipelineStep.SUMMARIZING, label: 'AI 摘要生成', description: '智能生成简报并进行质量打分' },
  { id: PipelineStep.GENERATING_IMAGE, label: '头条配图', description: '根据内容风格生成视觉封面' },
  { id: PipelineStep.COMPLETED, label: '完成渲染', description: '生成最终移动端手机长图' },
];

const PipelineVisualizer: React.FC<PipelineVisualizerProps> = ({ currentStep }) => {
  const getStepIndex = (step: PipelineStep) => {
    return steps.findIndex(s => s.id === step);
  };

  const currentIndex = getStepIndex(currentStep);

  return (
    <div className="space-y-6">
      {steps.map((step, index) => {
        const isCompleted = index < currentIndex || currentStep === PipelineStep.COMPLETED;
        const isActive = index === currentIndex && currentStep !== PipelineStep.COMPLETED;

        return (
          <div key={step.id} className="flex items-start space-x-4">
            <div className="flex flex-col items-center">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 transition-colors ${
                isCompleted ? 'bg-emerald-500 border-emerald-500 text-white' :
                isActive ? 'border-emerald-500 text-emerald-500' : 'border-slate-300 text-slate-300'
              }`}>
                {isCompleted ? <CheckCircle2 className="w-5 h-5" /> :
                 isActive ? <Loader2 className="w-5 h-5 animate-spin" /> :
                 <Circle className="w-5 h-5" />}
              </div>
              {index < steps.length - 1 && (
                <div className={`w-0.5 h-12 my-1 ${
                  index < currentIndex ? 'bg-emerald-500' : 'bg-slate-200'
                }`} />
              )}
            </div>
            <div className="pt-1">
              <h4 className={`font-semibold ${isActive ? 'text-emerald-600' : isCompleted ? 'text-slate-800' : 'text-slate-400'}`}>
                {step.label}
              </h4>
              <p className="text-sm text-slate-500">{step.description}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default PipelineVisualizer;
