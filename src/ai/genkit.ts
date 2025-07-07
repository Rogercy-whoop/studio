// We must explicitly load the .env file for local development to ensure
// environment variables are available in the Node.js server environment.
// In a deployed environment (like Firebase App Hosting or Vercel),
// these variables must be set in the service's configuration.
import 'dotenv/config';

import {genkit} from 'genkit';

const geminiAPIKey = process.env.GEMINI_API_KEY;

if (!geminiAPIKey) {
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
  // For now, we'll use a basic configuration without custom plugins
  // The AI flows will handle Gemini integration directly
});
