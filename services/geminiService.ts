import { GoogleGenAI } from "@google/genai";
import { AnalysisResult, PersonProfile, Source } from "../types";

// Load API key from Vite environment
const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;

// Helper to extract JSON if the model accidentally wraps it in markdown
const extractJson = (text: string): any => {
  if (!text) return null;

  // Direct JSON?
  try {
    return JSON.parse(text);
  } catch (e) {}

  // ```json ... ```
  const jsonBlock = text.match(/```json\s*([\s\S]*?)\s*```/);
  if (jsonBlock && jsonBlock[1]) {
    try {
      return JSON.parse(jsonBlock[1]);
    } catch {}
  }

  // ``` ... ```
  const genericBlock = text.match(/```\s*([\s\S]*?)\s*```/);
  if (genericBlock && genericBlock[1]) {
    try {
      return JSON.parse(genericBlock[1]);
    } catch {}
  }

  return null;
};

// Generate an AI fallback avatar
const generateCultAvatar = async (
  role: string,
  diagnosis: string
): Promise<string | null> => {
  if (!API_KEY) return null;

  const ai = new GoogleGenAI({ apiKey: API_KEY });

  const prompt = `A dark, cyberpunk, high-contrast portrait of a character with the role "${role}". 
  They have a cult-leader aura as described: ${diagnosis.substring(0, 120)}. 
  Neon lighting, glitch effects, dystopian atmosphere.`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-image",
      contents: { parts: [{ text: prompt }] },
    });

    const parts = response?.candidates?.[0]?.content?.parts || [];
    for (const part of parts) {
      if (part.inlineData?.data) {
        return `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
      }
    }

    return null;
  } catch (err) {
    console.warn("Avatar generation failed:", err);
    return null;
  }
};

export const scanProtocol = async (
  protocolName: string
): Promise<AnalysisResult> => {
  if (!API_KEY) throw new Error("Gemini API key missing in .env");

  const ai = new GoogleGenAI({ apiKey: API_KEY });

  const systemPrompt = `
    You are a ruthless OSINT investigator for the crypto industry.
    You dig up founder history, team background, red flags, cult-like behavior, and past scandals.

    You MUST:
    - Use Google Search results
    - Return ONLY JSON (no markdown)
    - Include profile image URLs when possible
    - Include social links when possible

    Output must strictly be a JSON object with this format:
    {
      "protocol": "",
      "summary": "",
      "profiles": [
        {
          "name": "",
          "role": "",
          "cultScore": 1-10,
          "diagnosis": "",
          "background": "",
          "conspiracies": "",
          "verdict": "SAFE" | "CAUTION" | "DANGER" | "CULT_LEADER",
          "imageUrl": "",
          "socials": {
            "twitter": "",
            "linkedin": "",
            "telegram": "",
            "farcaster": ""
          }
        }
      ]
    }
  `;

  const userPrompt = `Investigate the crypto protocol: "${protocolName}". Return JSON ONLY.`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: userPrompt,
      config: {
        systemInstruction: systemPrompt,
        tools: [{ googleSearch: {} }],
      },
      // THE IMPORTANT FIX:
      responseMimeType: "application/json",
    });

    const raw = response?.text();
    if (!raw) throw new Error("Empty response from Gemini");

    const jsonData = extractJson(raw);
    if (!jsonData) throw new Error("Invalid or missing JSON from Gemini");

    // Process profiles
    const processedProfiles = await Promise.all(
      (jsonData.profiles || []).map(async (profile: PersonProfile) => {
        let img = profile.imageUrl;
        const valid =
          img && (img.startsWith("http") || img.startsWith("data:"));

        if (!valid) {
          const generated = await generateCultAvatar(
            profile.role,
            profile.diagnosis
          );
          if (generated) img = generated;
        }

        return { ...profile, imageUrl: img };
      })
    );

    // Sources from grounding metadata
    const grounding =
      response?.candidates?.[0]?.groundingMetadata?.groundingChunks || [];

    const sources: Source[] = grounding
      .filter((c: any) => c.web?.uri && c.web?.title)
      .map((c: any) => ({
        uri: c.web.uri,
        title: c.web.title,
      }));

    const uniqueSources = Array.from(
      new Map(sources.map((s) => [s.uri, s])).values()
    );

    return {
      protocol: jsonData.protocol || protocolName,
      summary: jsonData.summary || "No summary available",
      profiles: processedProfiles,
      sources: uniqueSources,
    };
  } catch (err) {
    console.error("SCAN ERROR:", err);
    throw err;
  }
};
