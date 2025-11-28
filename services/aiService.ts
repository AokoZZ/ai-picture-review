import { GoogleGenAI, Type } from "@google/genai";
import { AIProvider, CritiqueStyle, CritiqueResult } from "../types";

const RESPONSE_SCHEMA_JSON = JSON.stringify({
  type: "object",
  properties: {
    title: { type: "string" },
    overallScore: { type: "number" },
    compositionScore: { type: "number" },
    lightingScore: { type: "number" },
    creativityScore: { type: "number" },
    technicalScore: { type: "number" },
    summary: { type: "string" },
    strengths: { type: "array", items: { type: "string" } },
    weaknesses: { type: "array", items: { type: "string" } },
    improvements: { type: "array", items: { type: "string" } },
    technicalAnalysis: { type: "string" },
    compositionAnalysis: { type: "string" },
  },
  required: ["title", "overallScore", "summary", "strengths", "improvements"]
});

const generatePrompt = (style: CritiqueStyle) => {
    let stylePrompt = "";
    switch (style) {
      case CritiqueStyle.TECHNICAL:
        stylePrompt = "请重点关注曝光、锐度、噪点、镜头选择、色差和动态范围。评分标准要严格。";
        break;
      case CritiqueStyle.ARTISTIC:
        stylePrompt = "请重点关注氛围、情感、色彩理论、故事性和视觉冲击力。如果能增加作品特色，可以忽略微小的技术瑕疵。";
        break;
      case CritiqueStyle.SOCIAL:
        stylePrompt = "请重点关注视觉吸引力、易传播性、裁剪潜力和当前趋势。保持语调生动有趣。";
        break;
      default:
        stylePrompt = "提供兼顾技术执行和艺术价值的平衡点评。建议要具有建设性。";
        break;
    }
  
    return `
      你是一位世界级的摄影评论家。请分析这张照片。
      ${stylePrompt}
      
      请提供详细的分析报告，包含以下内容：
      1. 一个引人注目的照片标题 (中文)。
      2. 0-100的评分，包含：总体评分、构图、光影、创意和技巧。
      3. 一段总结段落 (中文)。
      4. 主要优点（3-5项，中文）。
      5. 缺点/不足（3-5项，中文）。
      6. 具体的改进建议（3-5项，中文）。
      7. 关于技巧和构图的深度分析 (中文)。
  
      重要：请严格按照以下 JSON 结构返回结果。
      JSON 的 Key 必须保持英文（如 "overallScore", "summary"），但所有的字符串 Value 必须使用中文（简体中文）。
      ${RESPONSE_SCHEMA_JSON}
    `;
};

export const analyzePhoto = async (
  base64Image: string,
  modelName: string,
  provider: AIProvider,
  style: CritiqueStyle
): Promise<CritiqueResult> => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) throw new Error("API Key is missing from environment variables.");

  const prompt = generatePrompt(style);

  // --- GOOGLE GEMINI ---
  if (provider === AIProvider.GOOGLE) {
    const ai = new GoogleGenAI({ apiKey });
    const response = await ai.models.generateContent({
      model: modelName,
      contents: {
        parts: [
          { inlineData: { mimeType: "image/jpeg", data: base64Image } },
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
        }
      },
    });
    const text = response.text;
    if (!text) throw new Error("No response from Gemini");
    return JSON.parse(text) as CritiqueResult;
  }

  // --- OPENAI ---
  if (provider === AIProvider.OPENAI) {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${apiKey}`
        },
        body: JSON.stringify({
            model: modelName,
            messages: [
                {
                    role: "user",
                    content: [
                        { type: "text", text: prompt },
                        { type: "image_url", image_url: { url: `data:image/jpeg;base64,${base64Image}` } }
                    ]
                }
            ],
            response_format: { type: "json_object" },
            max_tokens: 2000
        })
    });

    if (!response.ok) {
        const err = await response.json();
        throw new Error(`OpenAI Error: ${err.error?.message || response.statusText}`);
    }

    const data = await response.json();
    const content = data.choices[0].message.content;
    return JSON.parse(content) as CritiqueResult;
  }

  // --- ANTHROPIC ---
  if (provider === AIProvider.ANTHROPIC) {
    const response = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: {
            "x-api-key": apiKey,
            "anthropic-version": "2023-06-01",
            "content-type": "application/json",
            "dangerously-allow-browser": "true" // Required for browser-side calls
        },
        body: JSON.stringify({
            model: modelName,
            max_tokens: 2000,
            messages: [
                {
                    role: "user",
                    content: [
                        {
                            type: "image",
                            source: {
                                type: "base64",
                                media_type: "image/jpeg",
                                data: base64Image
                            }
                        },
                        { type: "text", text: prompt }
                    ]
                }
            ]
        })
    });

    if (!response.ok) {
        const err = await response.json();
        throw new Error(`Anthropic Error: ${err.error?.message || response.statusText}`);
    }

    const data = await response.json();
    // Anthropic returns text, sometimes with markdown ticks. We need to clean it.
    let content = data.content[0].text;
    content = content.replace(/```json\n?|\n?```/g, "").trim();
    return JSON.parse(content) as CritiqueResult;
  }

  throw new Error("Unknown Provider");
};