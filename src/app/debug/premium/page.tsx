
'use client';

import { Button } from '@/components/ui/button';
import { useUI } from '@/context/UIContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Crown } from 'lucide-react';

export default function DebugPremiumPage() {
  const { setUpgradeModalOpen } = useUI();

  return (
    <div className="container mx-auto max-w-2xl">
      <div className="text-center mb-8">
        <h1 className="font-headline text-4xl font-bold tracking-tight lg:text-5xl">Premium Plan Tester</h1>
        <p className="mt-2 text-lg text-foreground/80">
          Use this page to test the premium upgrade modal without needing to upload 5 items first.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Crown className="w-6 h-6 text-accent" />
            Test Upgrade Modal
          </CardTitle>
          <CardDescription>
            Click the button below to manually trigger the "Upgrade to Premium" pop-up. This is the same modal that appears when a user with 5 items tries to upload a sixth.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button
            onClick={() => setUpgradeModalOpen(true)}
            className="w-full text-lg py-6"
          >
            Show Upgrade Modal
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
