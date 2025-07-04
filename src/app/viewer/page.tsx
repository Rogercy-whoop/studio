
'use client';

import { Construction } from 'lucide-react';

export default function ViewerPage() {
  return (
    <div className="container mx-auto flex flex-col items-center justify-center text-center py-10">
        <div className="mb-8">
            <h1 className="font-headline text-4xl font-bold tracking-tight lg:text-5xl">3D Outfit Preview</h1>
            <p className="mt-2 text-lg text-foreground/80">
                A new way to visualize your style.
            </p>
        </div>

        <div className="w-full max-w-2xl min-h-[400px] rounded-lg border-2 border-dashed bg-secondary/30 flex flex-col items-center justify-center p-8">
            <Construction className="w-16 h-16 text-accent mb-6" />
            <h2 className="font-headline text-3xl font-bold mb-2">Feature Under Development</h2>
            <p className="text-lg text-muted-foreground max-w-md">
                We're putting the finishing touches on our interactive 3D viewer. This feature will be available soon!
            </p>
        </div>
    </div>
  );
}
