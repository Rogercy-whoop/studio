
'use server';

/**
 * @fileOverview This file defines a Genkit flow for removing the background from a clothing item image.
 *
 * - removeBackground - A function that takes a clothing item image and returns a new image with a transparent background.
 * - RemoveBackgroundInput - The input type for the removeBackground function.
 * - RemoveBackgroundOutput - The output type for the removeBackground function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'zod';

const RemoveBackgroundInputSchema = z.object({
  photoDataUri: z
    .string()
    .describe(
      "A photo of a clothing item, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
});
export type RemoveBackgroundInput = z.infer<typeof RemoveBackgroundInputSchema>;

const RemoveBackgroundOutputSchema = z.object({
  photoDataUri: z.string().describe("The data URI of the new image with a transparent background."),
});
export type RemoveBackgroundOutput = z.infer<typeof RemoveBackgroundOutputSchema>;

export async function removeBackground(input: RemoveBackgroundInput): Promise<RemoveBackgroundOutput> {
  return removeBackgroundFlow(input);
}

const removeBackgroundFlow = ai.defineFlow(
  {
    name: 'removeBackgroundFlow',
    inputSchema: RemoveBackgroundInputSchema,
    outputSchema: RemoveBackgroundOutputSchema,
  },
  async (input) => {
    // This feature is temporarily disabled as it requires a specific Google AI model.
    // The application has been configured to use OpenAI-only.
    // To prevent crashes, we are just returning the original image.
    return { photoDataUri: input.photoDataUri };
  }
);
