
'use client';

import { useUI } from '@/context/UIContext';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Crown, Check } from 'lucide-react';

export function UpgradeModal() {
  const { isUpgradeModalOpen, setUpgradeModalOpen } = useUI();
  const { user } = useAuth(); // Get the currently logged-in user

  // ==========================================================================================
  // HOW TO CONNECT STRIPE AND RECEIVE PAYMENTS
  // ==========================================================================================
  //
  // 1.  CREATE PAYMENT LINKS IN STRIPE:
  //     - Go to your Stripe Dashboard -> Products -> "Add Product" to create two plans:
  //       a) A monthly subscription product.
  //       b) An annual subscription product.
  //     - For each product, click "Create payment link".
  //
  // 2.  PASTE YOUR LINKS HERE:
  //     - Copy the URL for your monthly payment link and paste it below.
  const monthlyStripeLink = "https://buy.stripe.com/bJe28q1H5e63d1vdVp5AR0k"; // <-- PASTE YOUR MONTHLY STRIPE LINK HERE
  //
  //     - Copy the URL for your annual payment link and paste it below.
  const annualStripeLink = "https://buy.stripe.com/6oUbJ0bhF7HF1iNbNh5AR0l"; // <-- PASTE YOUR ANNUAL STRIPE LINK HERE
  //
  // 3.  IMPORTANT NEXT STEP - AUTOMATING PREMIUM ACCESS (WEBHOOK):
  //     After a user pays, you need a way for Stripe to tell your app to grant them
  //     premium access. This is done using a "Stripe Webhook," which is a backend
  //     function that listens for payment events from Stripe. The code below now
  //     attaches the user's ID to the Stripe links so the webhook knows WHO to upgrade.
  //
  // ==========================================================================================
  
  // We append the user's ID to the Stripe link. This is how the webhook will know
  // which user to grant premium access to after a successful payment.
  const finalMonthlyLink = user ? `${monthlyStripeLink}?client_reference_id=${user.uid}` : monthlyStripeLink;
  const finalAnnualLink = user ? `${annualStripeLink}?client_reference_id=${user.uid}` : annualStripeLink;

  return (
    <Dialog open={isUpgradeModalOpen} onOpenChange={setUpgradeModalOpen}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <div className="flex justify-center mb-2">
            <div className="w-16 h-16 bg-accent/10 rounded-full flex items-center justify-center">
              <Crown className="w-10 h-10 text-accent" />
            </div>
          </div>
          <DialogTitle className="text-center text-2xl font-headline">Upgrade to OOTD Premium</DialogTitle>
          <DialogDescription className="text-center text-base pt-1">
            You've reached your limit of 5 free closet items. Upgrade to unlock unlimited uploads and save your style forever!
          </DialogDescription>
        </DialogHeader>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 py-4">
          <Card>
            <CardHeader className="p-4">
              <CardTitle className="font-headline">Monthly</CardTitle>
              <p className="text-2xl font-bold">$4.50<span className="text-sm font-normal text-muted-foreground">/month</span></p>
              <CardDescription>Billed monthly.</CardDescription>
            </CardHeader>
            <CardContent className="p-4 pt-0">
              <ul className="space-y-2 text-sm text-foreground/90 mb-6">
                <li className="flex items-start gap-2"><Check className="w-4 h-4 text-accent flex-shrink-0 mt-1" /> <span>Unlimited Closet Items</span></li>
                <li className="flex items-start gap-2"><Check className="w-4 h-4 text-accent flex-shrink-0 mt-1" /> <span>Save Unlimited Inspirations</span></li>
              </ul>
              <Button asChild className="w-full text-lg">
                <a href={finalMonthlyLink} target="_blank" rel="noopener noreferrer">Choose Monthly</a>
              </Button>
            </CardContent>
          </Card>
          <Card className="border-accent border-2 relative">
            <Badge className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-accent text-accent-foreground font-headline">20% OFF</Badge>
            <CardHeader className="p-4">
              <CardTitle className="font-headline">Annual</CardTitle>
               <p className="text-2xl font-bold">$43.00<span className="text-sm font-normal text-muted-foreground">/year</span></p>
              <CardDescription>Billed annually.</CardDescription>
            </CardHeader>
            <CardContent className="p-4 pt-0">
              <ul className="space-y-2 text-sm text-foreground/90 mb-6">
                 <li className="flex items-start gap-2"><Check className="w-4 h-4 text-accent flex-shrink-0 mt-1" /> <span>Unlimited Closet Items</span></li>
                <li className="flex items-start gap-2"><Check className="w-4 h-4 text-accent flex-shrink-0 mt-1" /> <span>Save Unlimited Inspirations</span></li>
              </ul>
              <Button asChild className="w-full text-lg">
                <a href={finalAnnualLink} target="_blank" rel="noopener noreferrer">Choose Annual</a>
              </Button>
            </CardContent>
          </Card>
        </div>
        <p className="text-xs text-center text-muted-foreground px-4">
          Payments are securely processed by Stripe. You will be redirected to their secure checkout page.
        </p>
      </DialogContent>
    </Dialog>
  );
}
