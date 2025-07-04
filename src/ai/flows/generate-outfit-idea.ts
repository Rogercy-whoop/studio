
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

// Determine the model to use based on available API keys.
// This prevents the server from crashing if a key is missing.
const modelToUse = process.env.GROQ_API_KEY ? 'groq/llama3-8b-8192' : 'openai/gpt-4o';

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
  // Check if any AI plugin is available before running the flow
  if (!process.env.GROQ_API_KEY && !process.env.OPENAI_API_KEY) {
    throw new Error("No AI API key found. Please set either GROQ_API_KEY or OPENAI_API_KEY in your .env file.");
  }
  return generateOutfitIdeaFlow(input);
}

const outfitPrompt = ai.definePrompt({
  name: 'outfitPrompt',
  model: modelToUse, // Use the dynamically selected model
  tools: [getCurrentWeather],
  input: {
    schema: GenerateOutfitIdeaInputSchema,
  },
  output: {
    schema: GenerateOutfitIdeaOutputSchema,
  },
  config: {
    temperature: 0.8,
  },
  prompt: `
# ROLE
You are an expert personal stylist.

# GOAL
Generate a single, stylish outfit suggestion as a JSON object. Your description must be concise (2-3 sentences).

# CONTEXT
- Weather: Use the getCurrentWeather tool to get the current weather for the user's location and factor it into your suggestion.
{{#if occasion}}- Occasion: {{{occasion}}}{{/if}}
{{#if inspirationItems}}- Style Inspiration (from user's saved outfits):
{{#each inspirationItems}}  - {{{this.description}}}{{/each}}
{{/if}}

# TASK
Based on the context (weather, occasion, and style inspiration), create a stylish outfit.

{{#if closetItems}}
## TASK: CREATE OUTFIT FROM CLOSET

### Instructions
1.  Analyze the context and create the best possible outfit from the AVAILABLE ITEMS below.
2.  Your 'outfitDescription' should be concise (2-3 sentences), describe the look, and explain WHY you chose it based on the context.
3.  Your 'itemIds' array MUST contain the IDs of the chosen items.
4.  **Smart Suggestion Rule:** If the available items aren't a perfect match for the context, you MUST create the best outfit you can from the available items. Then, in the description, you MUST recommend a better alternative and gently encourage the user to add it to their closet if they have one.
5.  If NO suitable outfit can be made from the available items, explain why in the 'outfitDescription' and return an empty 'itemIds' array.

### Available Items
You MUST select from this list.
{{#each closetItems}}
- ID: {{this.id}}, Category: {{this.category}}{{#if this.subCategory}}, Item: {{this.subCategory}}{{/if}}, Tags: {{this.tags}}{{#if this.dominantColors}}, Colors: {{#each this.dominantColors}}{{this}} {{/each}}{{/if}}{{#if this.hasPattern}}, Pattern: {{this.patternDescription}}{{/if}}
{{/each}}

{{else}}
## TASK: CREATE GENERAL OUTFIT

### Instructions
1.  The user's closet is empty or they have chosen to ignore it. Suggest a general, creative outfit based on the context.
2.  Your 'outfitDescription' should be stylish, helpful, and concise (2-3 sentences).
3.  Your 'itemIds' array MUST be empty.
4.  Do NOT mention that the closet is empty in your description.
{{/if}}


# OUTPUT FORMAT
Your response MUST be ONLY the raw JSON object matching the schema, with no other text, comments, or markdown.
`,
});

const generateOutfitIdeaFlow = ai.defineFlow(
  {
    name: 'generateOutfitIdeaFlow',
    inputSchema: GenerateOutfitIdeaInputSchema,
    outputSchema: GenerateOutfitIdeaOutputSchema,
  },
  async (input) => {
    const response = await outfitPrompt(input);
    const output = response.output;

    if (!output) {
      console.error('AI response did not conform to schema. Full response:', JSON.stringify(response, null, 2));
      throw new Error("The AI failed to generate a valid outfit idea. Its response was not in the expected JSON format.");
    }
    
    return output;
  }
);
