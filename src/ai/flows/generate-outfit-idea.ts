
'use server';

/**
 * @fileOverview Generates outfit ideas based on weather, occasion, and user's closet.
 * This flow takes the current weather, an occasion, and an optional list of items
 * from the user's closet and returns a descriptive outfit suggestion.
 *
 * - generateOutfitIdea - A function that generates outfit ideas.
 * - GenerateOutfitIdeaInput - The input type for the generateOutfitIdea function.
 * - GenerateOutfitIdeaOutput - The return type for the generateOutfitIdea function.
 */

import {ai} from '@/ai/genkit';
import {getCurrentWeather} from '@/ai/tools/weather';
import {z} from 'zod';

// We'll use Gemini directly instead of through genkit plugins
const modelToUse = 'gemini-1.5-pro';

const ClothingItemSchema = z.object({
  id: z.string().describe('A unique identifier for the clothing item.'),
  category: z
    .string()
    .describe(
      'The general category of the clothing item (e.g., top, bottom, shoes).'
    ),
  subCategory: z
    .string()
    .optional()
    .describe('A more specific category (e.g., t-shirt, jeans, sneaker).'),
  tags: z
    .array(z.string())
    .describe("Descriptive tags for the clothing item (style, material, etc.)."),
  dominantColors: z
    .array(z.string())
    .optional()
    .describe('An array of dominant color hex codes.'),
  hasPattern: z.boolean().optional().describe('Whether the item has a discernible pattern.'),
  patternDescription: z
    .string()
    .optional()
    .describe('A brief description of the pattern if one exists.'),
});

const InspirationItemSchema = z.object({
  description: z.string().describe("The description of a previously saved outfit inspiration."),
  items: z.array(ClothingItemSchema).describe("The items included in the outfit."),
});

const GenerateOutfitIdeaInputSchema = z.object({
  latitude: z.number().optional().describe('The user\'s current latitude for weather lookup.'),
  longitude: z.number().optional().describe('The user\'s current longitude for weather lookup.'),
  occasion: z.string().optional().describe('The occasion or event the user is dressing for. This is optional.'),
  closetItems: z.array(ClothingItemSchema).optional().describe("A list of clothing items available in the user's closet."),
  inspirationItems: z.array(InspirationItemSchema).optional().describe("A list of previously saved outfits that the user liked, to infer their personal style."),
});

export type GenerateOutfitIdeaInput = z.infer<typeof GenerateOutfitIdeaInputSchema>;

const GenerateOutfitIdeaOutputSchema = z.object({
  outfitDescription: z.string().describe('A concise, 2-3 sentence description of the suggested outfit.'),
  itemIds: z.array(z.string()).describe("An array of IDs of the clothing items from the closet that make up the suggested outfit. This can be empty if no suitable items are found."),
});

export type GenerateOutfitIdeaOutput = z.infer<typeof GenerateOutfitIdeaOutputSchema>;

export async function generateOutfitIdea(input: GenerateOutfitIdeaInput): Promise<GenerateOutfitIdeaOutput> {
  // Check if Gemini API key is available before running the flow
  if (!process.env.GEMINI_API_KEY) {
    throw new Error("No Gemini API key found. Please set GEMINI_API_KEY in your .env file.");
  }
  return generateOutfitIdeaFlow(input);
}

// Direct Gemini integration for outfit generation
const generateOutfitWithGemini = async (input: GenerateOutfitIdeaInput): Promise<GenerateOutfitIdeaOutput> => {
  const { GoogleGenerativeAI } = await import('@google/generative-ai');
  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
  const model = genAI.getGenerativeModel({ model: 'gemini-1.5-pro' });

  // Build the prompt
  let prompt = `You are an expert personal stylist. Generate a single, stylish outfit suggestion as a JSON object. Your description must be concise (2-3 sentences).

# CONTEXT
- Weather: ${input.latitude && input.longitude ? 'Use weather data for the location' : 'Weather data not available'}
${input.occasion ? `- Occasion: ${input.occasion}` : ''}
${input.inspirationItems ? `- Style Inspiration: ${input.inspirationItems.map(item => item.description).join(', ')}` : ''}

# TASK
Based on the context, create a stylish outfit.

${input.closetItems ? `
## TASK: CREATE OUTFIT FROM CLOSET

### Available Items
${input.closetItems.map(item => 
  `- ID: ${item.id}, Category: ${item.category}${item.subCategory ? `, Item: ${item.subCategory}` : ''}, Tags: ${item.tags.join(', ')}`
).join('\n')}

Your 'outfitDescription' should be concise (2-3 sentences), describe the look, and explain WHY you chose it based on the context.
Your 'itemIds' array MUST contain the IDs of the chosen items.
` : `
## TASK: CREATE GENERAL OUTFIT
Your 'outfitDescription' should be stylish, helpful, and concise (2-3 sentences).
Your 'itemIds' array MUST be empty.
`}

# OUTPUT FORMAT
Return ONLY a JSON object with this exact structure:
{
  "outfitDescription": "2-3 sentence description",
  "itemIds": ["id1", "id2", ...]
}`;

  const result = await model.generateContent(prompt);
  const response = await result.response;
  const text = response.text();
  
  try {
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      return {
        outfitDescription: parsed.outfitDescription || 'A stylish outfit suggestion',
        itemIds: parsed.itemIds || []
      };
    }
  } catch (error) {
    console.error('Failed to parse Gemini response:', error);
  }
  
    // Fallback response
  return {
    outfitDescription: 'A stylish outfit suggestion based on your preferences and available items.',
    itemIds: input.closetItems ? input.closetItems.slice(0, 2).map(item => item.id) : []
  };
};
});

const generateOutfitIdeaFlow = async (input: GenerateOutfitIdeaInput): Promise<GenerateOutfitIdeaOutput> => {
  return generateOutfitWithGemini(input);
};
