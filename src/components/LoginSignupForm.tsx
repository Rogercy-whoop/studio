
'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Checkbox } from '@/components/ui/checkbox';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Loader2, AlertCircle } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";

const signupSchema = z.object({
    email: z.string().email({ message: "Please enter a valid email address." }),
    password: z.string().min(8, { message: "Password must be at least 8 characters long." }),
    confirmPassword: z.string(),
    marketingConsent: z.boolean().default(false).optional(),
}).refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match.",
    path: ["confirmPassword"],
});

const loginSchema = z.object({
    email: z.string().email({ message: "Please enter a valid email address." }),
    password: z.string().min(1, { message: "Password is required." }),
});

interface LoginSignupFormProps {
  onSuccess?: () => void;
}

export function LoginSignupForm({ onSuccess }: LoginSignupFormProps) {
  const [isLoginView, setIsLoginView] = useState(true);
  const [formError, setFormError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const { login, signup } = useAuth();
  const { toast } = useToast();

  const form = useForm({
    resolver: zodResolver(isLoginView ? loginSchema : signupSchema),
    defaultValues: {
      email: '',
      password: '',
      confirmPassword: '',
      marketingConsent: false,
    },
  });

  const handleFirebaseError = (error: { code: string }) => {
    switch (error.code) {
      case 'auth/email-already-in-use':
        return 'This email is already registered. Please log in.';
      case 'auth/user-not-found':
      case 'auth/wrong-password':
      case 'auth/invalid-credential':
        return 'Invalid email or password. Please try again.';
      case 'auth/weak-password':
        return 'The password is too weak. Please choose a stronger one.';
      default:
        return 'An unexpected error occurred. Please try again.';
    }
  }

  const onSubmit = async (values: z.infer<typeof loginSchema> | z.infer<typeof signupSchema>) => {
    setLoading(true);
    setFormError(null);
    try {
      if (isLoginView) {
        await login(values.email, values.password);
        toast({ title: 'Login Successful', description: "Welcome back!" });
      } else {
        await signup(values.email, values.password);
        toast({ title: 'Signup Successful', description: "Welcome to OOTD!" });
        console.log("Marketing consent:", (values as z.infer<typeof signupSchema>).marketingConsent);
      }
      onSuccess?.();
    } catch (error: any) {
        if (error && error.code && typeof error.code === 'string') {
            setFormError(handleFirebaseError(error));
        } else {
            setFormError('An unknown error occurred.');
        }
    } finally {
        setLoading(false);
    }
  };
  
  const toggleView = () => {
    setIsLoginView(!isLoginView);
    form.reset();
    setFormError(null);
  };

  return (
    <div>
        <div className="text-center mb-4">
            <h2 className="font-headline text-2xl">{isLoginView ? 'Welcome Back!' : 'Create Your Account'}</h2>
            <p className="text-sm text-muted-foreground">{isLoginView ? 'Log in to sync your closet.' : 'Get started with your personal AI stylist.'}</p>
        </div>
        <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {formError && (
                <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Authentication Failed</AlertTitle>
                <AlertDescription>{formError}</AlertDescription>
            </Alert>
            )}
            <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
                <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                    <Input placeholder="you@example.com" {...field} />
                </FormControl>
                <FormMessage />
                </FormItem>
            )}
            />
            <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
                <FormItem>
                <FormLabel>Password</FormLabel>
                <FormControl>
                    <Input type="password" placeholder="********" {...field} />
                </FormControl>
                <FormMessage />
                </FormItem>
            )}
            />
            {!isLoginView && (
            <>
            <FormField
                control={form.control}
                name="confirmPassword"
                render={({ field }) => (
                <FormItem>
                    <FormLabel>Confirm Password</FormLabel>
                    <FormControl>
                    <Input type="password" placeholder="********" {...field} />
                    </FormControl>
                    <FormMessage />
                </FormItem>
                )}
            />
            <FormField
                control={form.control}
                name="marketingConsent"
                render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                    <FormControl>
                    <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                    />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                    <FormLabel>
                        Receive marketing emails
                    </FormLabel>
                    <p className="text-sm text-muted-foreground">
                        Receive updates and special offers from OOTD.
                    </p>
                    </div>
                </FormItem>
                )}
            />
            </>
            )}
            <Button type="submit" className="w-full text-lg py-6" disabled={loading}>
            {loading ? <Loader2 className="animate-spin" /> : (isLoginView ? 'Log In' : 'Sign Up')}
            </Button>
        </form>
        </Form>
        <div className="mt-4 flex justify-center">
            <p className="text-sm text-muted-foreground">
                {isLoginView ? "Don't have an account?" : "Already have an account?"}
                <Button variant="link" onClick={toggleView} className="p-1">
                    {isLoginView ? 'Sign Up' : 'Log In'}
                </Button>
            </p>
        </div>
    </div>
  );
}
