
'use server';

export async function listModels() {
  const apiKey = process.env.GOOGLE_API_KEY;

  if (!apiKey) {
    return { error: 'GOOGLE_API_KEY is not set in your environment variables.' };
  }

  try {
    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`
    );

    if (!res.ok) {
      const errorBody = await res.text();
      throw new Error(`API request failed with status ${res.status}: ${errorBody}`);
    }

    const json = await res.json();
    return { models: json.models };
  } catch (error) {
    console.error('Failed to fetch models:', error);
    return { error: error instanceof Error ? error.message : 'An unknown error occurred.' };
  }
}
