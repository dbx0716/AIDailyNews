
import { GoogleGenAI, Type } from "@google/genai";
import { NewsArticle } from "../types";

const getAI = () => new GoogleGenAI({ apiKey: process.env.API_KEY as string });

/**
 * 模拟从著名公众号抓取【今日】热点新闻
 * 预设源：量子位、差评、机器之心、晚点LatePost、财新、虎嗅、小声比比
 */
export const simulateCrawling = async (): Promise<NewsArticle[]> => {
  const ai = getAI();
  const today = new Date().toLocaleDateString('zh-CN', { year: 'numeric', month: 'long', day: 'numeric' });
  
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `你是一个自动化爬虫脚本。请模拟抓取【今日：${today}】微信公众号平台的顶级热点。
    数据源要求：量子位、机器之心、差评、晚点LatePost、财新、虎嗅、小声比比。
    内容要求：挑选6篇具有深度的文章，涵盖AI进展、商业大事、或社会爆红话题。
    所有生成的文章日期必须严格标注为：${today}。`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            id: { type: Type.STRING },
            title: { type: Type.STRING },
            source: { type: Type.STRING },
            content: { type: Type.STRING },
            date: { type: Type.STRING, description: `必须是 ${today}` }
          },
          required: ["id", "title", "source", "content", "date"]
        }
      }
    }
  });

  try {
    return JSON.parse(response.text?.trim() || '[]');
  } catch (e) {
    console.error("Failed to parse crawled articles", e);
    return [];
  }
};

export const summarizeArticles = async (articles: NewsArticle[]): Promise<{ summary: string; scoredArticles: NewsArticle[] }> => {
  const ai = getAI();
  const prompt = `你是一个资深媒体主编。请从以下今日抓取的文章中，选出【唯一一个】最重要的作为“今日头条”，另外选出【最多3个】具有代表性的作为“次要精选”。
  
  筛选标准：
  1. 影响力：对行业或社会的重塑能力。
  2. 深度：内容是否扎实。
  3. 话题性：是否为今日热议。
  
  请根据这些标准打分(1-10)。
  
  文章列表:
  ${articles.map(a => `ID: ${a.id} | 标题: ${a.title} | 来源: ${a.source} | 内容: ${a.content}`).join('\n\n')}
  `;

  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          summary: { type: Type.STRING, description: "今日简讯总览（50字以内，语气专业）" },
          scoredArticles: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                id: { type: Type.STRING },
                summary: { type: Type.STRING, description: "单句精炼摘要" },
                score: { type: Type.NUMBER }
              }
            }
          }
        },
        required: ["summary", "scoredArticles"]
      }
    }
  });

  try {
    const result = JSON.parse(response.text?.trim() || '{}');
    const scoredMap = new Map(result.scoredArticles.map((sa: any) => [sa.id, sa]));
    
    return {
      summary: result.summary,
      scoredArticles: articles.map(a => ({
        ...a,
        summary: (scoredMap.get(a.id) as any)?.summary || '',
        score: (scoredMap.get(a.id) as any)?.score || 5
      })).sort((a, b) => (b.score || 0) - (a.score || 0))
    };
  } catch (e) {
    console.error("Failed to summarize", e);
    return { summary: "总结生成失败", scoredArticles: articles };
  }
};

export const generateCoverImage = async (headlineTitle: string): Promise<string | undefined> => {
  const ai = getAI();
  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash-image',
    contents: {
      parts: [{ text: `A high-end professional digital art illustration for a major news event: "${headlineTitle}". Cinematic lighting, editorial photography style, minimalist but impactful, corporate aesthetics, 16:9 aspect ratio, no text in image.` }]
    },
    config: {
      imageConfig: {
        aspectRatio: "16:9"
      }
    }
  });

  if (response.candidates?.[0]?.content?.parts) {
    for (const part of response.candidates[0].content.parts) {
      if (part.inlineData) {
        return `data:image/png;base64,${part.inlineData.data}`;
      }
    }
  }
  return undefined;
};
