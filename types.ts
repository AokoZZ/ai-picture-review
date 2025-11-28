export enum AIProvider {
  GOOGLE = 'Google',
  OPENAI = 'OpenAI',
  ANTHROPIC = 'Anthropic',
}

export const PROVIDER_MODELS = {
  [AIProvider.GOOGLE]: [
    { id: 'gemini-2.5-flash', name: 'Gemini 2.5 Flash' },
    { id: 'gemini-3-pro-preview', name: 'Gemini 3 Pro' },
  ],
  [AIProvider.OPENAI]: [
    { id: 'gpt-4o', name: 'GPT-4o' },
    { id: 'gpt-4o-mini', name: 'GPT-4o Mini' },
  ],
  [AIProvider.ANTHROPIC]: [
    { id: 'claude-3-5-sonnet-20241022', name: 'Claude 3.5 Sonnet' },
    { id: 'claude-3-haiku-20240307', name: 'Claude 3 Haiku' },
  ]
};

export enum CritiqueStyle {
  BALANCED = '平衡 & 建设性',
  TECHNICAL = '硬核技术流',
  ARTISTIC = '艺术 & 情感',
  SOCIAL = '社交媒体/Instagram',
}

export interface CritiqueResult {
  overallScore: number;
  compositionScore: number;
  lightingScore: number;
  creativityScore: number;
  technicalScore: number;
  title: string;
  summary: string;
  strengths: string[];
  weaknesses: string[];
  improvements: string[];
  technicalAnalysis: string;
  compositionAnalysis: string;
}

export interface AnalysisState {
  isLoading: boolean;
  result: CritiqueResult | null;
  error: string | null;
  imagePreview: string | null;
}