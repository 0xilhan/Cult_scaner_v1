import { GoogleGenAI } from "@google/genai";
import { AnalysisResult, PersonProfile, Source } from "../types";

// Helper to extract JSON from markdown code blocks
const extractJson = (text: string): any => {
  try {
    // Try to parse directly first
    return JSON.parse(text);
  } catch (e) {
    // Look for ```json ... ``` pattern
    const match = text.match(/```json\s*([\s\S]*?)\s*```/);
    if (match && match[1]) {
      try {
        return JSON.parse(match[1]);
      } catch (e2) {
        console.error("Failed to parse extracted JSON block", e2);
        return null;
      }
    }
    // Look for just ``` ... ``` pattern (sometimes model omits 'json')
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
  if (!process.env.API_KEY) return null;
  
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  // Create a safe, stylistic prompt that avoids naming real people to prevent policy blocks
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

    // Extract the image data from the response
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
  if (!process.env.API_KEY) {
    throw new Error("API Key not found in environment variables.");
  }

  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

  const systemPrompt = `
    You are a ruthless, high-tech OSINT (Open Source Intelligence) investigator for the crypto industry.
    Your job is to "diagnose" the team behind a specific crypto protocol.
    You look for cult-like behaviors, past scams, red flags, rug pull history, and marketing manipulation.
    
    You MUST use Google Search to find real, up-to-date information about the founders and team.
    You MUST attempt to find a public profile image URL for each person if available in the search results.
    You MUST attempt to find their social media handles (Twitter/X, LinkedIn, Telegram, Farcaster).
    
    Output Format:
    You must strictly output a JSON object inside a single \`\`\`json code block.
    
    The JSON structure must be:
    {
      "protocol": "Name of protocol",
      "summary": "A brief, biting summary of the project's vibe (e.g., 'Technological marvel led by egomaniacs' or 'Empty vaporware driven by hype').",
      "profiles": [
        {
          "name": "Full Name",
          "role": "Job Title / Perceived Role",
          "cultScore": number (1-10, where 10 is absolute cult leader/deity status),
          "diagnosis": "A deep psychological or professional diagnosis of this person.",
          "background": "Key past projects, successes, or failures.",
          "conspiracies": "Any rumors, allegations, or strange facts found online.",
          "verdict": "SAFE" | "CAUTION" | "DANGER" | "CULT_LEADER",
          "imageUrl": "URL of a real photo found online. Leave empty string if not found.",
          "socials": {
            "twitter": "Twitter/X URL (optional)",
            "linkedin": "LinkedIn URL (optional)",
            "telegram": "Telegram URL (optional)",
            "farcaster": "Farcaster/Warpcast URL (optional)"
          }
        }
      ]
    }

    If you cannot find specific team members, focus on the public faces or the anonymous founders (e.g., "Ryoshi" for Shiba Inu).
    Be detailed. Be critical.
  `;

  const userPrompt = `Investigate the crypto protocol: "${protocolName}". Dig deep into the team.`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: userPrompt,
      config: {
        systemInstruction: systemPrompt,
        tools: [{ googleSearch: {} }],
        // We cannot use responseSchema with googleSearch tools, so we rely on the prompt for JSON structure.
      },
    });

    const text = response.text || "";
    const jsonData = extractJson(text);

    if (!jsonData) {
      throw new Error("Failed to parse intelligence report. The model did not return valid JSON.");
    }

    // Post-processing: Handle images
    // If imageUrl is missing, we generate a "Cult Avatar"
    const processedProfiles = await Promise.all((jsonData.profiles || []).map(async (profile: PersonProfile) => {
      let finalImageUrl = profile.imageUrl;
      
      // Check if URL is valid (basic check) or missing
      const hasValidUrl = finalImageUrl && (finalImageUrl.startsWith('http') || finalImageUrl.startsWith('data:'));
      
      if (!hasValidUrl) {
        // Generate avatar
        const generated = await generateCultAvatar(profile.role, profile.diagnosis);
        if (generated) {
          finalImageUrl = generated;
        }
      }
      
      return {
        ...profile,
        imageUrl: finalImageUrl
      };
    }));

    // Extract sources from grounding metadata
    const groundingChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
    const sources: Source[] = groundingChunks
      .filter((chunk: any) => chunk.web && chunk.web.uri && chunk.web.title)
      .map((chunk: any) => ({
        title: chunk.web.title,
        uri: chunk.web.uri
      }));

    // Remove duplicates from sources based on URI
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