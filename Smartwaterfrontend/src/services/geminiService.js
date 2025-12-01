import { GoogleGenAI } from "@google/genai";

export const analyzeImage = async (base64Image, prompt) => {
  try {
    // Ensure you have REACT_APP_API_KEY in your .env file
    const apiKey = process.env.REACT_APP_API_KEY || process.env.API_KEY;
    
    if (!apiKey) {
        console.error("API Key missing. Please set REACT_APP_API_KEY in your .env file.");
        return "Error: API Key missing. Please check your configuration.";
    }

    const ai = new GoogleGenAI({ apiKey: apiKey });
    
    // Using Gemini 3 Pro Preview for advanced image reasoning
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
    return "Failed to analyze image. Please ensure your API key is valid.";
  }
};