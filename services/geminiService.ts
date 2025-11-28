import { GoogleGenAI, Type } from "@google/genai";
import { CritiqueStyle, CritiqueResult } from "../types";

export const analyzePhoto = async (
  base64Image: string,
  modelName: string,
  style: CritiqueStyle
): Promise<CritiqueResult> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

  let stylePrompt = "";
  switch (style) {
    case CritiqueStyle.TECHNICAL:
      stylePrompt = "Focus heavily on exposure, sharpness, noise, lens choice, chromatic aberration, and dynamic range. Be strict with scoring.";
      break;
    case CritiqueStyle.ARTISTIC:
      stylePrompt = "Focus on mood, emotion, color theory, storytelling, and visual impact. Ignore minor technical imperfections if they add character.";
      break;
    case CritiqueStyle.SOCIAL:
      stylePrompt = "Focus on visual hook, shareability, crop potential, and current trends. Keep tone engaging.";
      break;
    default:
      stylePrompt = "Provide a balanced critique covering both technical execution and artistic merit. Be constructive.";
      break;
  }

  const prompt = `
    Analyze this photograph as a world-class photography critic. 
    ${stylePrompt}
    
    Provide a detailed breakdown including:
    1. A catchy title for the photo.
    2. Scores from 0-100 for overall, composition, lighting, creativity, and technique.
    3. A summary paragraph.
    4. Key strengths (3-5 items).
    5. Weaknesses (3-5 items).
    6. Specific actionable improvements (3-5 items).
    7. Deep dive analysis on technique and composition.
  `;

  const response = await ai.models.generateContent({
    model: modelName,
    contents: {
      parts: [
        {
            inlineData: {
                mimeType: "image/jpeg",
                data: base64Image
            }
        },
        { text: prompt }
      ]
    },
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          title: { type: Type.STRING },
          overallScore: { type: Type.NUMBER },
          compositionScore: { type: Type.NUMBER },
          lightingScore: { type: Type.NUMBER },
          creativityScore: { type: Type.NUMBER },
          technicalScore: { type: Type.NUMBER },
          summary: { type: Type.STRING },
          strengths: { type: Type.ARRAY, items: { type: Type.STRING } },
          weaknesses: { type: Type.ARRAY, items: { type: Type.STRING } },
          improvements: { type: Type.ARRAY, items: { type: Type.STRING } },
          technicalAnalysis: { type: Type.STRING },
          compositionAnalysis: { type: Type.STRING },
        },
        required: ["title", "overallScore", "summary", "strengths", "improvements"],
      },
    },
  });

  const text = response.text;
  if (!text) throw new Error("No response from AI");
  
  return JSON.parse(text) as CritiqueResult;
};