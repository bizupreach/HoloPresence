
import { GoogleGenAI } from "@google/genai";

/**
 * While this specific WebAR app focuses on video playback,
 * a future iteration could use Gemini to generate dialogue 
 * or respond to users in a "Digital Person" context.
 */
export const getAvatarDialogue = async (prompt: string) => {
  if (!process.env.API_KEY) return "AI key not set";
  
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: prompt,
    config: {
        systemInstruction: "You are a digital avatar representing a political campaign. Be professional, direct, and persuasive."
    }
  });
  
  return response.text;
};
