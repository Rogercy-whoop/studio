
'use client';

import { useState } from 'react';
import { listModels } from './actions';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

interface Model {
  name: string;
  displayName: string;
  description: string;
}

export default function DebugModelsPage() {
  const [models, setModels] = useState<Model[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFetchModels = async () => {
    setLoading(true);
    setError(null);
    setModels(null);
    try {
      const result = await listModels();
      if (result.error) {
        setError(result.error);
      } else {
        setModels(result.models || []);
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : 'An unknown error occurred.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto max-w-2xl">
      <div className="text-center mb-8">
        <h1 className="font-headline text-4xl font-bold tracking-tight lg:text-5xl">AI Model Debugger</h1>
        <p className="mt-2 text-lg text-foreground/80">
          Use this tool to see which AI models are available with your API key.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Available Models</CardTitle>
          <CardDescription>
            Click the button below to fetch the list of models from the Google AI API. The result will be displayed here.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button onClick={handleFetchModels} disabled={loading} className="w-full">
            {loading ? 'Fetching...' : 'List Available Models'}
          </Button>

          {error && (
            <Alert variant="destructive">
              <AlertTitle>Error Fetching Models</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {models && (
             <Alert variant="default">
              <AlertTitle>Success!</AlertTitle>
              <AlertDescription>
                Your API key has access to the following models. Please tell me which model name (e.g., `models/gemini-1.5-pro-latest` or `models/text-bison-001`) you would like to use.
              </AlertDescription>
            </Alert>
          )}

          {models && (
            <div className="rounded-md border bg-secondary/30 p-4 h-96 overflow-auto">
              <pre className="text-sm whitespace-pre-wrap">
                {JSON.stringify(models, null, 2)}
              </pre>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
