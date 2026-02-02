import { GoogleGenAI } from "@google/genai";
import { Category } from "../types";

// Helper to get AI instance safely
const getAIClient = () => {
  if (!process.env.API_KEY) {
    throw new Error("API_KEY not found in environment variables");
  }
  return new GoogleGenAI({ apiKey: process.env.API_KEY });
};

export const generateProductDescription = async (
  name: string,
  category: Category,
  details: string
): Promise<string> => {
  try {
    const ai = getAIClient();
    const model = "gemini-3-flash-preview";
    
    const prompt = `
      Você é um assistente criativo para o 'Ateliê da Josi', especializado em artesanato e confeitaria.
      Escreva uma descrição atraente, carinhosa e vendedora para um novo produto.
      
      Produto: ${name}
      Categoria: ${category}
      Detalhes adicionais: ${details}
      
      Mantenha o tom acolhedor e profissional. Máximo de 3 parágrafos curtos. Use emojis moderadamente.
      Responda em Português do Brasil.
    `;

    const response = await ai.models.generateContent({
      model,
      contents: prompt,
    });

    return response.text || "Não foi possível gerar a descrição no momento.";
  } catch (error) {
    console.error("Erro ao gerar descrição:", error);
    return "Erro ao conectar com a IA. Por favor, tente novamente ou escreva manualmente.";
  }
};