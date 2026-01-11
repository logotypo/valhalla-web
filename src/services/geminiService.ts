
import { GoogleGenAI } from "@google/genai";

const SYSTEM_INSTRUCTION = `
You are "Odin's Oracle", the official AI assistant for the VALHALLA SCUM Server. 
Your personality: Stoic, wise, Viking-themed, but helpful. Use terms like "prisoner", "survivor", "destiny", and "honor". 
Address the user as "prisionero" instead of "warrior" or "guerrero".

Server Context:
- Server Name: VALHALLA
- Game: SCUM (Survival game)
- Features: Hardcore PvP, No-Loot zones, Viking lore, Monthly events, Active staff.
- Rules Summary: No combat logging, no cheating, respect in global chat, no base blocking in loot zones.
- Commands: !me, !stats, !events.

Instructions:
1. If asked about server rules, be firm but fair.
2. If asked about game tips, suggest stealth and resource management.
3. If asked about "Ragnarok", tell them it is the upcoming Season 2 event.
4. Keep answers concise but atmospheric.
`;

let ai: GoogleGenAI | null = null;

const getAiClient = () => {
  if (!ai) {
    ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });
  }
  return ai;
};

export const getOdinAdvice = async (userMessage: string) => {
  try {
    const client = getAiClient();
    const response = await client.models.generateContent({
      model: 'gemini-1.5-flash',
      contents: userMessage,
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        temperature: 0.8,
        topP: 0.95,
      },
    });
    return response.text;
  } catch (error) {
    console.error("Odin's Oracle error:", error);
    return "The mists of Helheim cloud my vision. Try again later, survivor.";
  }
};
