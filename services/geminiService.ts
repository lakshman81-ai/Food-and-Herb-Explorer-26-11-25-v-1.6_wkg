
import { GoogleGenAI, Type } from "@google/genai";
import type { FoodDetails, StructuredRecipe } from '../types';
import { formatData } from '../utils/dataUtils';

// API Key is expected to be available in the environment variables
const API_KEY = process.env.API_KEY;

if (!API_KEY) {
  console.warn("Gemini API Key is not set. AI features will be disabled.");
}

const ai = new GoogleGenAI({ apiKey: API_KEY! });
const textModel = 'gemini-2.5-flash';
const visionModel = 'gemini-2.5-flash'; // This model supports vision

const fileToGenerativePart = async (file: File) => {
  const base64EncodedDataPromise = new Promise<string>((resolve) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve((reader.result as string).split(',')[1]);
    reader.readAsDataURL(file);
  });
  return {
    inlineData: { data: await base64EncodedDataPromise, mimeType: file.type },
  };
};

export const identifyFood = async (imageFile: File): Promise<string> => {
  if (!API_KEY) throw new Error("API Key is missing.");
  const imagePart = await fileToGenerativePart(imageFile);
  const prompt = "Identify the single, most prominent food item in this image. Respond with only the name of the food (e.g., \"Apple\", \"Banana\", \"Almonds\"). Do not add any other text or punctuation.";

  const response = await ai.models.generateContent({
      model: visionModel,
      contents: { parts: [{text: prompt}, imagePart] },
  });

  return response.text.trim().replace(/["."]/g, '');
};

export const getAISummary = async (foodName: string, context: string): Promise<string> => {
    if (!API_KEY) throw new Error("API Key is missing.");
    const systemPrompt = "You are a friendly and knowledgeable nutritionist. Based *only* on the provided text snippet about a food, provide a concise, easy-to-read summary for a layperson. Synthesize the given information into a coherent paragraph. Do not add any information not present in the text. Format your response using basic markdown.";
    
    const userQuery = `Here is the information for ${foodName}:\n\n"${context}"\n\nPlease provide a summary of only this information.`;

    const response = await ai.models.generateContent({
        model: textModel,
        contents: userQuery,
        config: { systemInstruction: systemPrompt }
    });
    
    return response.text;
};

export interface RecipeContext {
  baseFoods: { name: string; preparation: string | null }[];
  maximiserFoods: string[];
  nutritionalContext: string;
  ayurvedicContext: string;
  bioactivesContext: string;
  synergyContext: string;
}

export const getRecipeIdea = async (context: RecipeContext, mode: 'food' | 'herb' = 'food'): Promise<StructuredRecipe> => {
    if (!API_KEY) throw new Error("API Key is missing.");
    
    const isRemedy = mode === 'herb';
    
    const systemInstruction = isRemedy 
        ? "You are an expert in Ayurvedic medicine, herbalism, and holistic health. You create detailed therapeutic remedy mixes (or 'Yogas') and provide analysis based on provided data. You MUST respond ONLY with a valid JSON object that adheres to the provided schema. Do not include any text before or after the JSON object."
        : "You are an expert chef and nutritionist specializing in holistic health. You create a detailed recipe and provide analysis based on provided data. You MUST respond ONLY with a valid JSON object that adheres to the provided schema. Do not include any text before or after the JSON object.";

    const ingredientsList = context.baseFoods.map(f => f.name).join(', ');
    const preparationNotes = context.baseFoods
        .map(f => f.preparation ? `${f.name}: ${f.preparation}` : null)
        .filter(Boolean)
        .join('\n');
    
    let userQuery = isRemedy
        ? `Generate a therapeutic remedy mix (or herbal infusion) based on the following information. Focus on healing properties and synergy.
        
        **Primary Herb/Substance**: ${ingredientsList}
        
        **Suggested Synergists (Maximisers)**: Please incorporate these if relevant for potency: ${context.maximiserFoods.join(', ')}
        
        **Preparation/Usage Notes**: ${preparationNotes || 'N/A'}
        
        **Synergy Notes**: ${context.synergyContext || 'N/A'}

        **CONTEXT FOR ANALYSIS**:
        - **For "nutritionalBenefits"**: Summarize specific health benefits: "${context.nutritionalContext}"
        - **For "ayurvedicInsights"**: Summarize energetics: "${context.ayurvedicContext}"
        - **For "bioactivesSummary"**: Summarize active compounds: "${context.bioactivesContext}"
        - **For "estimatedMacros" and "estimatedMicros"**: Provide a rough estimation of key active compounds or dosage relevance instead of standard macros if not applicable.
        - **For "notes"**: Explain the therapeutic logic of this mix.`
        : `Generate a healthy and creative recipe based on the following information.

        **Base Ingredients**: ${ingredientsList}
        
        **Suggested Supporting Ingredients (Maximisers)**: Please incorporate these where it makes sense: ${context.maximiserFoods.join(', ')}
        
        **Ideal Preparation Notes**: ${preparationNotes || 'N/A'}
        
        **Synergy Notes**: ${context.synergyContext || 'N/A'}

        **CONTEXT FOR ANALYSIS SECTIONS**:
        - **For "nutritionalBenefits"**: Summarize these points: "${context.nutritionalContext}"
        - **For "ayurvedicInsights"**: Summarize these points: "${context.ayurvedicContext}"
        - **For "bioactivesSummary"**: Summarize these points: "${context.bioactivesContext}"
        - **For "estimatedMacros" and "estimatedMicros"**: Based on the final recipe you create, provide a plausible estimation per serving.
        - **For "notes"**: Justify your choice of cooking methods and ingredients.`;
    
    const response = await ai.models.generateContent({
        model: textModel,
        contents: userQuery,
        config: {
            systemInstruction: systemInstruction,
            responseMimeType: "application/json",
            responseSchema: {
                type: Type.OBJECT,
                properties: {
                    recipeName: { type: Type.STRING, description: isRemedy ? "Name of the remedy mix" : "Name of the recipe" },
                    description: { type: Type.STRING },
                    ingredients: { type: Type.ARRAY, items: { type: Type.STRING } },
                    instructions: { type: Type.ARRAY, items: { type: Type.STRING } },
                    chefsTip: { type: Type.STRING, description: isRemedy ? "Practitioner's tip for usage" : "Chef's tip" },
                    nutritionalBenefits: { type: Type.STRING },
                    ayurvedicInsights: { type: Type.STRING },
                    estimatedMacros: { type: Type.STRING },
                    estimatedMicros: { type: Type.STRING },
                    bioactivesSummary: { type: Type.STRING },
                    notes: { type: Type.STRING },
                },
                required: ["recipeName", "description", "ingredients", "instructions", "chefsTip", "nutritionalBenefits", "ayurvedicInsights", "estimatedMacros", "estimatedMicros", "bioactivesSummary", "notes"]
            }
        }
    });

    try {
        const recipeJson = JSON.parse(response.text);
        return recipeJson as StructuredRecipe;
    } catch (e) {
        console.error("Failed to parse AI recipe response:", e);
        console.error("Raw AI response:", response.text);
        throw new Error("AI returned an invalid response format. Please try again.");
    }
};
