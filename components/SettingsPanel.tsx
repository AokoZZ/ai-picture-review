import React, { useEffect } from 'react';
import { AIProvider, PROVIDER_MODELS, CritiqueStyle } from '../types';

interface SettingsPanelProps {
  selectedProvider: AIProvider;
  setProvider: (p: AIProvider) => void;
  selectedModel: string;
  setModel: (m: string) => void;
  selectedStyle: CritiqueStyle;
  setStyle: (s: CritiqueStyle) => void;
  disabled: boolean;
}

export const SettingsPanel: React.FC<SettingsPanelProps> = ({ 
  selectedProvider,
  setProvider,
  selectedModel, 
  setModel, 
  selectedStyle, 
  setStyle,
  disabled
}) => {

  // Auto-select first model when provider changes
  useEffect(() => {
    const models = PROVIDER_MODELS[selectedProvider];
    if (models && models.length > 0) {
        // Only reset if current model is not valid for new provider
        if (!models.find(m => m.id === selectedModel)) {
            setModel(models[0].id);
        }
    }
  }, [selectedProvider]);

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8 w-full max-w-5xl">
      
      {/* Provider Selector */}
      <div className="bg-surface p-4 rounded-xl border border-white/5">
        <label className="block text-sm font-medium text-gray-400 mb-2">AI 提供商</label>
        <select
          value={selectedProvider}
          onChange={(e) => setProvider(e.target.value as AIProvider)}
          disabled={disabled}
          className="w-full bg-slate-900 border border-slate-700 text-white rounded-lg p-2.5 focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
        >
          {Object.values(AIProvider).map((p) => (
            <option key={p} value={p}>{p}</option>
          ))}
        </select>
      </div>

      {/* Model Selector */}
      <div className="bg-surface p-4 rounded-xl border border-white/5">
        <label className="block text-sm font-medium text-gray-400 mb-2">模型</label>
        <select
          value={selectedModel}
          onChange={(e) => setModel(e.target.value)}
          disabled={disabled}
          className="w-full bg-slate-900 border border-slate-700 text-white rounded-lg p-2.5 focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
        >
          {PROVIDER_MODELS[selectedProvider].map((m) => (
            <option key={m.id} value={m.id}>{m.name}</option>
          ))}
        </select>
      </div>

      {/* Style Selector */}
      <div className="bg-surface p-4 rounded-xl border border-white/5">
        <label className="block text-sm font-medium text-gray-400 mb-2">点评风格</label>
        <select
          value={selectedStyle}
          onChange={(e) => setStyle(e.target.value as CritiqueStyle)}
          disabled={disabled}
          className="w-full bg-slate-900 border border-slate-700 text-white rounded-lg p-2.5 focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
        >
          {Object.values(CritiqueStyle).map((style) => (
            <option key={style} value={style}>
              {style}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
};