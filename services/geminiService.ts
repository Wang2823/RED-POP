
import { GoogleGenAI, Type } from "@google/genai";
import { IPAsset, DesignSuggestion } from "../types";

export const getDesignSuggestions = async (ip: IPAsset): Promise<DesignSuggestion> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  const imageParts = ip.fileAssets?.map(f => ({
    inlineData: { data: f.data, mimeType: f.mimeType }
  })) || [];

  const textPart = {
    text: `请作为一名资深的小红书快闪店空间设计师，分析以下 IP 需求并生成配套的定制印刷/制作类物料方案。
    ${ip.fileAssets && ip.fileAssets.length > 0 ? '用户已提供 IP 视觉资产图片，物料设计请参考这些资产的色调和元素。' : ''}
    IP 名称: ${ip.name}
    活动目的: ${ip.purpose.join(', ')}
    场地类型: ${ip.locationType} (面积: ${ip.size})
    交互功能需求: ${ip.uxFeatures.join(', ')}
    风格偏好: ${ip.style}
    
    输出要求：
    1. 所有文案必须使用中文。
    2. reasoning: 简述设计逻辑。
    3. materials: 生成 5 个关键定制物料（如：海报、地贴、背景墙、自拍镜、导引牌、贴纸等）。
    4. zoneName: 物料所属功能区。
    5. name: 简化的物料名称。
    6. spec: 使用 cm 作为单位。
    7. functionalSuggestion: 针对该物料的“功能建议”，描述其在空间中的具体交互作用或视觉引导作用，25字以内。
    8. material: 材质建议。`
  };

  const response = await ai.models.generateContent({
    model: 'gemini-3-pro-preview',
    contents: { parts: [...imageParts, textPart] },
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          reasoning: {
            type: Type.OBJECT,
            properties: {
              objective: { type: Type.STRING },
              layout: { type: Type.STRING },
              sustainability: { type: Type.STRING },
              psychology: { type: Type.STRING }
            },
            required: ["objective", "layout", "sustainability", "psychology"]
          },
          materials: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                id: { type: Type.STRING },
                name: { type: Type.STRING },
                zoneName: { type: Type.STRING },
                spec: { type: Type.STRING },
                material: { type: Type.STRING },
                functionalSuggestion: { type: Type.STRING },
                mockupUrl: { type: Type.STRING }
              },
              required: ["id", "name", "zoneName", "spec", "material", "functionalSuggestion", "mockupUrl"]
            }
          }
        },
        required: ["reasoning", "materials"]
      }
    }
  });

  try {
    const data = JSON.parse(response.text || '{}');
    // The mockupUrl is just a metadata hint, actual images are generated in the engine
    return data;
  } catch (e) {
    console.error("Failed to parse Gemini response", e);
    return {
      reasoning: { objective: '', layout: '', sustainability: '', psychology: '' },
      materials: []
    };
  }
};

export const generateMaterialImage = async (materialName: string, zoneName: string, ip: IPAsset, customInstruction?: string): Promise<string> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

  const imageParts = ip.fileAssets?.map(f => ({
    inlineData: { data: f.data, mimeType: f.mimeType }
  })) || [];

  const prompt = `Generate a high-quality, aesthetic mockup of a ${materialName} for a pop-up store. 
    Location: ${zoneName}. 
    Style: ${ip.style}. 
    IP Name: ${ip.name}.
    ${customInstruction ? `Refinement Instruction: ${customInstruction}` : ''}
    ${ip.fileAssets && ip.fileAssets.length > 0 ? 'Use the provided IP assets for color palette and design elements reference.' : 'Design based on the material type and pop-up aesthetic.'}
    Aspect ratio should be 3:4 for vertical materials or 4:3 for horizontal. Vertical preferred.`;

  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash-image',
    contents: {
      parts: [...imageParts, { text: prompt }]
    },
    config: {
      imageConfig: {
        aspectRatio: "3:4"
      }
    }
  });

  for (const part of response.candidates[0].content.parts) {
    if (part.inlineData) {
      return `data:image/png;base64,${part.inlineData.data}`;
    }
  }
  
  return `https://picsum.photos/seed/${encodeURIComponent(materialName)}/600/800`;
};

export const refineProjectLayout = async (currentZones: any[], instruction: string): Promise<any[]> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `请根据以下“全案重绘指令”，重新规划快闪店的功能区资产配置。
    当前配置: ${JSON.stringify(currentZones)}
    重绘指令: ${instruction}
    
    要求：
    1. 保持现有的 JSON 结构（数组，包含 name, icon, assets）。
    2. assets 必须从以下合法 ID 中选择: module, rack_s, rack_l, cabinet, table, screen, chair, spotlight, counter。
    3. 根据指令逻辑增删或修改区域和资产数量。
    4. 返回 JSON 格式。`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            instanceId: { type: Type.STRING },
            name: { type: Type.STRING },
            icon: { type: Type.STRING },
            assets: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  id: { type: Type.STRING },
                  name: { type: Type.STRING },
                  price: { type: Type.NUMBER },
                  ecoScore: { type: Type.NUMBER },
                  size: { type: Type.STRING },
                  icon: { type: Type.STRING },
                  count: { type: Type.NUMBER }
                }
              }
            }
          }
        }
      }
    }
  });

  try {
    return JSON.parse(response.text || '[]');
  } catch (e) {
    console.error("Global refine failed", e);
    return currentZones;
  }
};

export const generateXHSNote = async (ip: IPAsset, theme: string): Promise<{ title: string; content: string; tags: string[] }> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `请作为一名资深的小红书运营专家，为以下快闪活动创作一篇高点击、高互动的爆款笔记预告。
    IP 名称: ${ip.name}
    活动主题: ${theme || ip.activityTheme || '快闪店开业'}
    风格偏好: ${ip.style}
    
    要求：
    1. 标题：极具吸引力，多用感叹号和情绪化词汇。
    2. 正文：逻辑清晰，多用 emoji 分点说明，突出打卡位、互动活动、限时周边等亮点。必须包含明确的换行符以便于分行显示。
    3. 标签：提供 5-8 个热门标签。`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          title: { type: Type.STRING },
          content: { type: Type.STRING },
          tags: {
            type: Type.ARRAY,
            items: { type: Type.STRING }
          }
        },
        required: ["title", "content", "tags"]
      }
    }
  });

  try {
    return JSON.parse(response.text || '{}');
  } catch (e) {
    console.error("Failed to parse XHS note response", e);
    return {
      title: '快来打卡！超治愈 IP 快闪空降！',
      content: '家人们谁懂啊！这氛围感真的绝了！✨\n\n📍 就在某某商场，快叫上你的好闺蜜一起来玩！\n\n🎈 现场还有超多周边等你！',
      tags: ['#小红书快闪', '#IP打卡', '#周末去哪儿']
    };
  }
};

export const refineXHSNote = async (current: { title: string, content: string, tags: string[] }, instruction: string): Promise<{ title: string; content: string; tags: string[] }> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `请根据以下“调整指令”，修改现有的向小红书笔记文案。
    现有标题: ${current.title}
    现有正文: ${current.content}
    现有标签: ${current.tags.join(', ')}
    
    调整指令: ${instruction}
    
    保持小红书的爆款文风，返回 JSON 格式。`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          title: { type: Type.STRING },
          content: { type: Type.STRING },
          tags: {
            type: Type.ARRAY,
            items: { type: Type.STRING }
          }
        },
        required: ["title", "content", "tags"]
      }
    }
  });

  try {
    return JSON.parse(response.text || '{}');
  } catch (e) {
    console.error("Refine failed", e);
    return current;
  }
};

export const generateXHSImage = async (prompt: string, ip: IPAsset): Promise<string> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

  const imageParts = ip.fileAssets?.map(f => ({
    inlineData: { data: f.data, mimeType: f.mimeType }
  })) || [];

  const textPart = {
    text: `Create a Xiaohongshu-style aesthetic image. It should be vibrant and high-quality. 
    ${ip.fileAssets && ip.fileAssets.length > 0 ? 'User has provided IP assets, please refer to their colors and style.' : ''}
    Description: ${prompt}`
  };

  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash-image',
    contents: {
      parts: [...imageParts, textPart]
    },
    config: {
      imageConfig: {
        aspectRatio: "3:4"
      }
    }
  });

  for (const part of response.candidates[0].content.parts) {
    if (part.inlineData) {
      return `data:image/png;base64,${part.inlineData.data}`;
    }
  }
  
  return `https://picsum.photos/seed/${encodeURIComponent(prompt)}/600/800`;
};
