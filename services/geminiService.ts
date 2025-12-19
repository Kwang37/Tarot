
import { GoogleGenAI } from "@google/genai";
import { DrawnCard, Orientation, Language } from "../types";

export async function interpretReading(
  question: string,
  spreadName: string,
  drawnCards: DrawnCard[],
  lang: Language
): Promise<string> {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    return lang === 'zh' ? "错误：未检测到神谕密钥。请在设置中配置。" : "Error: No Oracle Key detected. Please configure in settings.";
  }

  // Create a new instance right before making the call to ensure it uses the latest key
  const ai = new GoogleGenAI({ apiKey });

  const cardDetails = drawnCards.map((dc, i) => {
    const name = lang === 'zh' ? dc.card.name : dc.card.nameEn;
    const meaning = dc.orientation === Orientation.UPRIGHT 
      ? (lang === 'zh' ? dc.card.meaningUp : dc.card.meaningUpEn)
      : (lang === 'zh' ? dc.card.meaningRev : dc.card.meaningRevEn);
    return `[Position: ${i + 1}] - ${name} (${dc.orientation}): ${meaning}`;
  }).join("\n");

  const prompt = `
    You are an enigmatic, world-class Tarot Oracle. A seeker asks: "${question}".
    Spread: "${spreadName}"
    Cards pulled:
    ${cardDetails}

    TASK: Provide a captivating and punchy interpretation. 
    STYLE: Mystical, evocative, but NO fluff. Avoid long-winded introductions.
    
    STRUCTURE:
    1. **The Essence** (1-2 sentences of the immediate vibe)
    2. **The Threads** (Brief insights for each card, connecting them like a story. 2 sentences max per card)
    3. **The Oracle's Verdict** (A single, powerful closing sentence of advice)

    LANGUAGE: Write strictly in ${lang === 'zh' ? 'Chinese (Simplified)' : 'English'}.
    FORMAT: Use clean Markdown with bold headers and bullet points.
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        temperature: 0.9,
        topP: 0.9,
      },
    });

    return response.text || (lang === 'zh' ? "神灵保持沉默。" : "The spirits are silent.");
  } catch (error: any) {
    console.error("Gemini Error:", error);
    if (error?.message?.includes("Requested entity was not found")) {
      return lang === 'zh' 
        ? "密钥失效或权限不足。请检查计费项目设置。" 
        : "Invalid key or insufficient permissions. Please check billing project settings.";
    }
    return lang === 'zh' ? "神秘连接中断了，请确保 API 密钥正确且已启用。" : "The mystical connection was interrupted. Ensure API key is correct and enabled.";
  }
}
