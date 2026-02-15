
import { GoogleGenAI, Type, Schema } from "@google/genai";
import { SYSTEM_INSTRUCTION, DEFAULT_MODEL } from "../constants";
import { GeneratedContent } from "../types";

// Initialize the API client
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const responseSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    html: { type: Type.STRING, description: "The full HTML structure including <head> and <body>. PRETTY PRINTED." },
    css: { type: Type.STRING, description: "Custom CSS styles (excluding <style> tags). PRETTY PRINTED." },
    javascript: { type: Type.STRING, description: "JavaScript code (excluding <script> tags). PRETTY PRINTED." },
  },
  required: ["html", "css", "javascript"],
};

/**
 * Generates a website based on the user's prompt.
 */
export const generateWebsite = async (
  prompt: string,
  modelId: string
): Promise<GeneratedContent> => {
  try {
    const response = await ai.models.generateContent({
      model: modelId,
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        temperature: 0.5,
        responseMimeType: "application/json",
        responseSchema: responseSchema,
      },
      contents: prompt,
    });

    const text = response.text || "{}";
    
    // Parse the JSON response
    try {
      const content = JSON.parse(text) as GeneratedContent;
      return content;
    } catch (parseError) {
      console.error("Failed to parse Gemini response:", text);
      throw new Error("Received invalid data from AI. Please try again.");
    }

  } catch (error) {
    console.error("Gemini API Error:", error);
    throw new Error("Failed to generate website. Please check your API key or try again.");
  }
};

/**
 * Expands a simple idea into a detailed professional prompt.
 */
export const enhancePrompt = async (simpleIdea: string): Promise<string> => {
  try {
    const response = await ai.models.generateContent({
      model: DEFAULT_MODEL,
      config: {
        systemInstruction: `You are an expert web consultant and prompt engineer. 
Your task is to take a short website description (e.g., "Dentist site") and expand it into a detailed, professional prompt for an AI website builder.

Focus on including:
1. Visual Style (Color palette, typography, vibe)
2. Key Sections (Hero, Features, Services, Team, Contact)
3. Interactive Elements (Hover effects, Animations, Forms)
4. Specific functionalities related to the niche.
5. Requirement for a multi-page structure with at least 5 distinct pages (Home, About, Services, etc.).

Output only the expanded prompt text. Do not add conversational filler.`,
        temperature: 0.8,
      },
      contents: `Expand this website idea: ${simpleIdea}`,
    });

    return response.text || "";
  } catch (error) {
    console.error("Prompt Enhancement Error:", error);
    throw new Error("Failed to enhance prompt.");
  }
};
