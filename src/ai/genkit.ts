
// We must explicitly load the .env file for local development to ensure
// environment variables are available in the Node.js server environment.
// In a deployed environment (like Firebase App Hosting or Vercel),
// these variables must be set in the service's configuration.
import 'dotenv/config';

import {genkit, type Plugin} from 'genkit';
import {openai} from 'genkitx-openai';

const openAIKey = process.env.OPENAI_API_KEY;
const groqAPIKey = process.env.GROQ_API_KEY;
const plugins: Plugin<any>[] = [];

if (openAIKey) {
  // Explicitly naming the plugin 'openai' for clarity and to avoid ambiguity.
  plugins.push(openai({apiKey: openAIKey}, 'openai'));
} else {
  // Log a clear warning to the server console instead of crashing.
  // This allows the app to start, and errors will be contained to AI calls.
  console.warn(
    '\n' +
    '******************************************************************************************\n' +
    '** WARNING: OpenAI API key not found.                                                   **\n' +
    '** The app will run, but image tagging features will fail.                              **\n' +
    '** Please add your OPENAI_API_KEY to the .env file and restart the server.              **\n' +
    '******************************************************************************************\n'
  );
}

if (groqAPIKey) {
  plugins.push(
    openai(
      // We are using the OpenAI plugin to connect to Groq's OpenAI-compatible API endpoint.
      {
        apiKey: groqAPIKey,
        baseURL: 'https://api.groq.com/openai/v1',
      },
      // We must provide a unique name for this plugin instance.
      'groq'
    )
  );
} else {
  console.warn(
    '\n' +
    '******************************************************************************************\n' +
    '** WARNING: Groq API key not found.                                                     **\n' +
    '** The app will run, but outfit generation will fall back to OpenAI if available.       **\n' +
    '** Please add your GROQ_API_KEY to the .env file and restart the server.                **\n' +
    '******************************************************************************************\n'
  );
}

export const ai = genkit({
  plugins,
  // Disabling telemetry is good practice for user projects unless they opt-in.
  enableTelemetry: false,
});
