// We must explicitly load the .env file for local development to ensure
// environment variables are available in the Node.js server environment.
// In a deployed environment (like Firebase App Hosting or Vercel),
// these variables must be set in the service's configuration.
import 'dotenv/config';

import {genkit} from 'genkit';
import {GoogleGenerativeAI} from '@google/generative-ai';

const geminiAPIKey = process.env.GEMINI_API_KEY;
const plugins: any[] = [];

// Custom Gemini plugin for genkit
const createGeminiPlugin = (apiKey: string) => {
  const genAI = new GoogleGenerativeAI(apiKey);
  
  return {
    name: 'gemini',
    models: {
      'gemini/gemini-1.5-flash': {
        generateContent: async (request: any) => {
          const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
          const result = await model.generateContent(request.prompt);
          const response = await result.response;
          return { text: response.text() };
        },
      },
      'gemini/gemini-1.5-pro': {
        generateContent: async (request: any) => {
          const model = genAI.getGenerativeModel({ model: 'gemini-1.5-pro' });
          const result = await model.generateContent(request.prompt);
          const response = await result.response;
          return { text: response.text() };
        },
      },
      'gemini/gemini-1.5-flash-latest': {
        generateContent: async (request: any) => {
          const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash-latest' });
          const result = await model.generateContent(request.prompt);
          const response = await result.response;
          return { text: response.text() };
        },
      },
    },
  };
};

if (geminiAPIKey) {
  plugins.push(createGeminiPlugin(geminiAPIKey));
} else {
  console.warn(
    '\n' +
    '******************************************************************************************\n' +
    '** WARNING: Gemini API key not found.                                                   **\n' +
    '** The app will run, but AI features will fail.                                         **\n' +
    '** Please add your GEMINI_API_KEY to the .env file and restart the server.              **\n' +
    '******************************************************************************************\n'
  );
}

export const ai = genkit({
  plugins,
});
