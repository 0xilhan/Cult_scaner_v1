import { GoogleGenAI } from "@google/genai";
import { AnalysisResult, PersonProfile, Source } from "../types";

// Load API key from .env (Vite rules)
const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;

// Extract JSON safely
const extractJson = (text: string): any => {
  if (!text) return null;

  try {
    return JSON.parse(text);
  } catch {}

  const matchJson = text.match(/```json\s*([\s\S]*?)\s*```/);
  if (matchJson?.[1]) {
    try {
      return JSON.parse(matchJson[1]);
    } catch {}
  }

  const matchGeneric = text.match(/```\s*([\s\S]*?)\s*```/);
  if (matchGeneric?.[1]) {
    try {
      return JSON.parse(matchGeneric[1]);
    } catch {}
  }

  return null;
};

// Fallback Avatar Generator
const generateCultAvatar = async (role: string, diagnosis: string) => {
  if (!API_KEY) return null;

  const ai = new GoogleGenAI({ apiKey: API_KEY });

  const prompt = `
    A dark, cyberpunk portrait of a mysterious character with the role "${role}".
    Cult-leader aura. Description: ${diagnosis.substring(0, 200)}.
    Neon lights, glitch effects, futuristic shadows. Portrait format.
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-image",
      contents: { parts: [{ text: prompt }] }
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
    You are a ruthless OSINT investigator for crypto.
    You analyze founders, team backgrounds, red flags, past scams,
    cult-like behaviors, and suspicious marketing.

    REQUIREMENTS:
    - Use Google Search tool results.
    - Output MUST be PURE JSON. No markdown, no commentary.
    - Include image URLs if found.
    - Include socials if found.

    JSON FORMAT:
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

  const userPrompt = `Investigate the crypto protocol: "${protocolName}". Return ONLY JSON, no markdown.`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: userPrompt,
      config: {
        systemInstruction: systemPrompt,
        tools: [{ googleSearch: {} }]
      },
      responseMimeType: "application/json" // Forces pure JSON output
    });

    // The FIX: Google GenAI SDK uses response.output_text
    const raw = response.output_text;
    if (!raw) throw new Error("Empty response from Gemini");

    // Parse JSON
    const jsonData = extractJson(raw) || JSON.parse(raw);

    // Process Profiles + Avatar fallback
    const processedProfiles = await Promise.all(
      (jsonData.profiles || []).map(async (p: PersonProfile) => {
        let img = p.imageUrl;
        const valid = img && (img.startsWith("http") || img.startsWith("data:"));

        if (!valid) {
          const gen = await generateCultAvatar(p.role, p.diagnosis);
          if (gen) img = gen;
        }

        return { ...p, imageUrl: img };
      })
    );

    // Sources (Google Search grounding)
    const chunks =
      response?.candidates?.[0]?.groundingMetadata?.groundingChunks || [];

    const sources: Source[] = chunks
      .filter((c: any) => c.web?.uri && c.web?.title)
      .map((c: any) => ({
        uri: c.web.uri,
        title: c.web.title
      }));

    const uniqueSources = Array.from(
      new Map(sources.map((s) => [s.uri, s])).values()
    );

    return {
      protocol: jsonData.protocol || protocolName,
      summary: jsonData.summary || "No summary provided.",
      profiles: processedProfiles,
      sources: uniqueSources
    };
  } catch (err) {
    console.error("SCAN ERROR:", err);
    throw err;
  }
};
