import React, { useState } from 'react';
import { ImageUploader } from './components/ImageUploader';
import { AnalysisDisplay } from './components/AnalysisDisplay';
import { SettingsPanel } from './components/SettingsPanel';
import { AnalysisState, CritiqueStyle, AIProvider, PROVIDER_MODELS } from './types';
import { analyzePhoto } from './services/aiService';
import { compressImageForAI, fileToDataUrl } from './services/imageUtils';

const App: React.FC = () => {
  const [provider, setProvider] = useState<AIProvider>(AIProvider.GOOGLE);
  // Default to first available model for Google
  const [model, setModel] = useState<string>(PROVIDER_MODELS[AIProvider.GOOGLE][0].id);
  const [style, setStyle] = useState<CritiqueStyle>(CritiqueStyle.BALANCED);
  
  const [state, setState] = useState<AnalysisState>({
    isLoading: false,
    result: null,
    error: null,
    imagePreview: null,
  });

  const handleImageSelect = async (file: File) => {
    setState(prev => ({ ...prev, isLoading: true, error: null, result: null }));
    
    try {
      // 1. Create a display preview (high res)
      const previewUrl = await fileToDataUrl(file);
      setState(prev => ({ ...prev, imagePreview: previewUrl }));

      // 2. Compress for AI (fixes 30MB limit issue)
      //    We use the same compression for all providers for consistency and speed
      const base64ForAi = await compressImageForAI(file);

      // 3. Send to AI Service
      const result = await analyzePhoto(base64ForAi, model, provider, style);
      
      setState(prev => ({
        ...prev,
        isLoading: false,
        result: result,
      }));

    } catch (err: any) {
      console.error(err);
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: err.message || "分析过程中出现错误，请检查您的 API Key 和网络连接。",
      }));
    }
  };

  const handleReset = () => {
      setState({
          isLoading: false,
          result: null,
          error: null,
          imagePreview: null
      });
  }

  return (
    <div className="min-h-screen bg-background text-gray-100 font-sans selection:bg-primary/30">
      {/* Navbar */}
      <nav className="border-b border-white/5 bg-slate-900/50 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2 cursor-pointer" onClick={handleReset}>
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-blue-600 flex items-center justify-center shadow-lg shadow-primary/20">
              <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
            <span className="text-xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400">
              AI 摄影点评大师
            </span>
          </div>
          <div className="text-sm text-gray-400 hidden sm:block">
            引擎：{provider}
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 flex flex-col items-center min-h-[calc(100vh-4rem)]">
        
        {/* Intro Text */}
        {!state.result && !state.isLoading && !state.imagePreview && (
            <div className="text-center mb-12 max-w-2xl animate-fade-in">
                <h1 className="text-4xl sm:text-5xl font-extrabold text-white mb-6 leading-tight">
                    提升你的 <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-blue-500">摄影眼</span>
                </h1>
                <p className="text-lg text-gray-400">
                    上传你的摄影作品，获取专业级的 AI 分析。
                    由 Google、OpenAI 或 Anthropic 的先进模型提供关于构图、光影和技巧的即时反馈。
                </p>
            </div>
        )}

        {/* State: Input & Settings */}
        {!state.result && !state.isLoading && (
            <div className="w-full flex flex-col items-center animate-fade-in-up delay-100">
                <SettingsPanel 
                    selectedProvider={provider}
                    setProvider={setProvider}
                    selectedModel={model} 
                    setModel={setModel} 
                    selectedStyle={style} 
                    setStyle={setStyle}
                    disabled={state.isLoading}
                />
                <ImageUploader onImageSelected={handleImageSelect} isLoading={state.isLoading} />
                
                {state.error && (
                    <div className="mt-6 p-4 bg-red-500/10 border border-red-500/20 text-red-200 rounded-xl max-w-2xl text-center">
                        <span className="font-bold block mb-1">错误</span>
                        {state.error}
                    </div>
                )}
            </div>
        )}

        {/* State: Loading */}
        {state.isLoading && (
             <div className="flex flex-col items-center justify-center py-20 animate-pulse">
                {state.imagePreview && (
                    <div className="w-32 h-32 rounded-xl overflow-hidden mb-8 border border-white/10 opacity-50 relative">
                         <img src={state.imagePreview} className="w-full h-full object-cover grayscale" />
                         <div className="absolute inset-0 bg-primary/20 animate-scan"></div>
                    </div>
                )}
                <div className="w-16 h-16 border-4 border-slate-700 border-t-primary rounded-full animate-spin mb-6"></div>
                <h3 className="text-2xl font-bold text-white mb-2">正在分析照片...</h3>
                <p className="text-gray-400">正在发送数据至 {provider} ({model})...</p>
             </div>
        )}

        {/* State: Result */}
        {state.result && state.imagePreview && (
            <>
                <AnalysisDisplay result={state.result} imagePreview={state.imagePreview} />
                <button 
                    onClick={handleReset}
                    className="mt-12 px-8 py-3 bg-slate-800 hover:bg-slate-700 text-white rounded-full font-medium transition-colors border border-white/5 flex items-center gap-2"
                >
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>
                    分析另一张照片
                </button>
            </>
        )}

      </main>
    </div>
  );
};

export default App;