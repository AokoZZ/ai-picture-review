import React from 'react';
import { CritiqueResult } from '../types';
import { ScoreChart } from './ScoreChart';

interface AnalysisDisplayProps {
  result: CritiqueResult;
  imagePreview: string;
}

export const AnalysisDisplay: React.FC<AnalysisDisplayProps> = ({ result, imagePreview }) => {
  return (
    <div className="w-full max-w-6xl animate-fade-in-up">
      
      {/* Header Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
        {/* Left: Image */}
        <div className="relative group rounded-2xl overflow-hidden shadow-2xl border border-white/10 bg-black">
            <img 
                src={imagePreview} 
                alt="Analyzed" 
                className="w-full h-full object-contain max-h-[600px]" 
            />
            <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 to-transparent">
                <h2 className="text-2xl font-bold text-white drop-shadow-md">{result.title}</h2>
            </div>
        </div>

        {/* Right: Scores & Summary */}
        <div className="flex flex-col space-y-6">
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                <ScoreChart score={result.overallScore} label="综合评分" color="#fbbf24" />
                <ScoreChart score={result.compositionScore} label="构图" color="#38bdf8" />
                <ScoreChart score={result.technicalScore} label="技术" color="#a78bfa" />
                <div className="hidden sm:block"><ScoreChart score={result.lightingScore} label="光影" color="#f472b6" /></div>
                <div className="hidden sm:block"><ScoreChart score={result.creativityScore} label="创意" color="#34d399" /></div>
            </div>

            <div className="bg-surface rounded-xl p-6 border border-white/5 flex-grow">
                <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
                    <svg className="w-5 h-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                    评价总结
                </h3>
                <p className="text-gray-300 leading-relaxed text-sm md:text-base">
                    {result.summary}
                </p>
            </div>
        </div>
      </div>

      {/* Detailed Analysis Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {/* Technical Deep Dive */}
        <div className="bg-surface rounded-xl p-6 border border-white/5">
            <h3 className="text-lg font-semibold text-primary mb-4">技术分析</h3>
            <p className="text-gray-300 text-sm leading-relaxed mb-6 border-b border-gray-700 pb-4">
                {result.technicalAnalysis}
            </p>
            <h4 className="text-sm font-medium text-gray-400 mb-3 uppercase tracking-wider">改进空间</h4>
             <ul className="space-y-2">
                {result.weaknesses.map((item, idx) => (
                    <li key={idx} className="flex items-start gap-3 text-gray-300 text-sm">
                        <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-red-400 flex-shrink-0"></span>
                        {item}
                    </li>
                ))}
            </ul>
        </div>

        {/* Artistic & Composition */}
        <div className="bg-surface rounded-xl p-6 border border-white/5">
            <h3 className="text-lg font-semibold text-secondary mb-4">艺术表现</h3>
            <p className="text-gray-300 text-sm leading-relaxed mb-6 border-b border-gray-700 pb-4">
                {result.compositionAnalysis}
            </p>
            <h4 className="text-sm font-medium text-gray-400 mb-3 uppercase tracking-wider">主要亮点</h4>
            <ul className="space-y-2">
                {result.strengths.map((item, idx) => (
                    <li key={idx} className="flex items-start gap-3 text-gray-300 text-sm">
                        <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-green-400 flex-shrink-0"></span>
                        {item}
                    </li>
                ))}
            </ul>
        </div>
      </div>

      {/* Actionable Advice Banner */}
      <div className="bg-gradient-to-r from-primary/10 to-purple-500/10 rounded-xl p-6 border border-primary/20">
        <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
            <svg className="w-5 h-5 text-yellow-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" /></svg>
            建议后续步骤
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {result.improvements.map((tip, idx) => (
                <div key={idx} className="bg-black/20 p-4 rounded-lg flex gap-3">
                    <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/20 text-primary flex items-center justify-center text-xs font-bold">{idx + 1}</span>
                    <p className="text-gray-200 text-sm">{tip}</p>
                </div>
            ))}
        </div>
      </div>

    </div>
  );
};