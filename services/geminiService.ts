import { GoogleGenAI } from "@google/genai";
import { AnalysisResult, PersonProfile, Source } from "../types";

// Load API key from Vite environment
const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;

// Helper to extract JSON from markdown code blocks
const extractJson = (text: string): any => {
  try {
    return JSON.parse(text);
  } catch (e) {
    const match = text.match(/```json\s*([\s\S]*?)\s*```/);
    if (match && match[1]) {
      try {
        return JSON.parse(match[1]);
      } catch (e2) {
        console.error("Failed to parse extracted JSON block", e2);
        return null;
      }
    }

    const matchGeneric = text.match(/```\s*([\s\S]*?)\s*```/);
    if (matchGeneric && matchGeneric[1]) {
      try {
        return JSON.parse(matchGeneric[1]);
      } catch (e3) {
        return null;
      }
    }
    return null;
  }
};

// Function to generate an avatar if no real image is found
const generateCultAvatar = async (role: string, diagnosis: string): Promise<string | null> => {
  if (!API_KEY) return null;

  const ai = new GoogleGenAI({ apiKey: API_KEY });

  const prompt = `A stylistic, dark, high-contrast digital art portrait of a character with the role of "${role}". 
  The character has a "cult leader" aura described as: ${diagnosis.substring(0, 100)}. 
  Cyberpunk aesthetic, neon lighting, mysterious atmosphere, glitch effects. Head and shoulders composition.`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: [{ text: prompt }]
      }
    });

    if (response.candidates && response.candidates[0]?.content?.parts) {
      for (const part of response.candidates[0].content.parts) {
        if (part.inlineData && part.inlineData.data) {
          return `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
        }
      }
    }
    return null;
  } catch (error) {
    console.warn("Avatar generation failed:", error);
    return null;
  }
};

export const scanProtocol = async (protocolName: string): Promise<AnalysisResult> => {
  if (!API_KEY) {
    throw new Error("API Key missing. Add it in .env file as VITE_GEMINI_API_KEY");
  }

  const ai = new GoogleGenAI({ apiKey: API_KEY });

  const systemPrompt = `
    You are a ruthless, high-tech OSINT investigator...
  `;

  const userPrompt = `Investigate the crypto protocol: "${protocolName}".`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: userPrompt,
      config: {
        systemInstruction: systemPrompt,
        tools: [{ googleSearch: {} }]
      },
    });

    const text = response.text || "";
    const jsonData = extractJson(text);

    if (!jsonData) {
      throw new Error("Failed to parse intelligence report.");
    }

    const processedProfiles = await Promise.all(
      (jsonData.profiles || []).map(async (profile: PersonProfile) => {
        let finalImageUrl = profile.imageUrl;
        const hasValidUrl = finalImageUrl && (finalImageUrl.startsWith('http') || finalImageUrl.startsWith('data:'));

        if (!hasValidUrl) {
          const generated = await generateCultAvatar(profile.role, profile.diagnosis);
          if (generated) finalImageUrl = generated;
        }

        return {
          ...profile,
          imageUrl: finalImageUrl
        };
      })
    );

    const groundingChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
    const sources: Source[] = groundingChunks
      .filter((chunk: any) => chunk.web && chunk.web.uri && chunk.web.title)
      .map((chunk: any) => ({
        title: chunk.web.title,
        uri: chunk.web.uri
      }));

    const uniqueSources = Array.from(new Map(sources.map((item) => [item.uri, item])).values());

    return {
      protocol: jsonData.protocol || protocolName,
      summary: jsonData.summary || "No summary provided.",
      profiles: processedProfiles,
      sources: uniqueSources,
    };

  } catch (error) {
    console.error("Gemini Scan Error:", error);
    throw error;
  }
};
