'use client';

import { useState, useEffect } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import Link from 'next/link';
import { Github } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';

interface SignInFormProps {
  callbackUrl: string;
  error?: string;
  registered?: boolean;
  verified?: boolean;
}

export function SignInForm({ callbackUrl, error, registered, verified }: SignInFormProps) {
  const router = useRouter();

  useEffect(() => {
    if (registered) {
      toast.success('Account created! Check your email for a verification link.');
    }
    if (verified) {
      toast.success('Email verified! You can now sign in.');
    }
  }, [registered, verified]);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [formError, setFormError] = useState('');
  const [showResend, setShowResend] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setFormError('');
    setIsLoading(true);

    try {
      const result = await signIn('credentials', {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        // Check if the failure is due to unverified email
        const checkRes = await fetch('/api/auth/check-verification', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email }),
        });
        const checkData = await checkRes.json();

        if (!checkData.verified) {
          setFormError('Please verify your email before signing in.');
          setShowResend(true);
        } else {
          setFormError('Invalid email or password');
          setShowResend(false);
        }
      } else {
        router.push(callbackUrl);
        router.refresh();
      }
    } catch {
      setFormError('Something went wrong. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }

  async function handleResendVerification() {
    if (!email) {
      setFormError('Enter your email address above, then click resend.');
      return;
    }
    setIsResending(true);
    try {
      await fetch('/api/auth/resend-verification', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      toast.success('Verification email sent! Check your inbox.');
      setShowResend(false);
      setFormError('');
    } catch {
      toast.error('Failed to resend. Please try again.');
    } finally {
      setIsResending(false);
    }
  }

  return (
    <Card className="w-full max-w-sm">
      <CardHeader className="text-center">
        <CardTitle className="text-2xl">Sign in to Dukemstash</CardTitle>
        <CardDescription>Your developer knowledge hub</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {(error || formError) && (
          <div className="rounded-md bg-destructive/10 border border-destructive/20 px-3 py-2 text-sm text-destructive">
            {formError || 'Authentication failed. Please try again.'}
            {showResend && (
              <button
                type="button"
                onClick={handleResendVerification}
                disabled={isResending}
                className="block mt-1 underline underline-offset-4 hover:text-destructive/80"
              >
                {isResending ? 'Sending...' : 'Resend verification email'}
              </button>
            )}
          </div>
        )}

        <Button
          variant="outline"
          className="w-full"
          onClick={() => signIn('github', { callbackUrl })}
        >
          <Github className="h-4 w-4 mr-2" />
          Sign in with GitHub
        </Button>

        <div className="relative">
          <Separator />
          <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-card px-2 text-xs text-muted-foreground">
            or
          </span>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="space-y-1.5">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={isLoading}
            />
          </div>
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <Label htmlFor="password">Password</Label>
              <Link
                href="/forgot-password"
                className="text-xs text-muted-foreground hover:text-primary underline underline-offset-4"
              >
                Forgot password?
              </Link>
            </div>
            <Input
              id="password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={isLoading}
            />
          </div>
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? 'Signing in...' : 'Sign in'}
          </Button>
        </form>

        <p className="text-center text-sm text-muted-foreground">
          Don&apos;t have an account?{' '}
          <Link
            href="/register"
            className="text-foreground underline underline-offset-4 hover:text-primary"
          >
            Register
          </Link>
        </p>
      </CardContent>
    </Card>
  );
}
