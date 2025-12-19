
import { GoogleGenAI } from "@google/genai";
import { DrawnCard, Orientation, Language } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || "" });

export async function interpretReading(
  question: string,
  spreadName: string,
  drawnCards: DrawnCard[],
  lang: Language
): Promise<string> {
  if (!process.env.API_KEY) {
    return lang === 'zh' ? "错误：缺少 API 密钥。" : "Error: API key missing.";
  }

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
    FORMAT: Use clean Markdown with bold headers and bullet points. Make it feel like an ancient prophecy, not a textbook.
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
  } catch (error) {
    console.error("Gemini Error:", error);
    return lang === 'zh' ? "神秘连接中断了。" : "The mystical connection was interrupted.";
  }
}
