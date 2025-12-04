import { GoogleGenAI } from "@google/genai";

export const analyzeImage = async (base64Image, prompt) => {
  try {
    // Ensure you have REACT_APP_API_KEY in your .env file (Local) or Netlify Environment Variables (Prod)
    const apiKey = process.env.REACT_APP_API_KEY || process.env.API_KEY;
    
    if (!apiKey) {
        console.error("Gemini API Key is missing. Environment variable REACT_APP_API_KEY is not set.");
        return "MISSING_KEY";
    }

    const ai = new GoogleGenAI({ apiKey: apiKey });
    
    // Using Gemini 3 Pro Preview for high-quality image reasoning
    // If this specific model is unavailable in your region, try 'gemini-2.0-flash-exp'
    const modelId = 'gemini-3-pro-preview'; 

    const response = await ai.models.generateContent({
      model: modelId,
      contents: {
        parts: [
          {
            inlineData: {
              mimeType: 'image/jpeg',
              data: base64Image
            }
          },
          {
            text: prompt
          }
        ]
      }
    });

    return response.text || "No analysis could be generated.";
  } catch (error) {
    console.error("Gemini Analysis Error:", error);
    if (error.message && error.message.includes('403')) {
      return "Error: API Key is invalid or quota exceeded.";
    }
    return "Failed to analyze image. Please ensure your API key is configured correctly.";
  }
};