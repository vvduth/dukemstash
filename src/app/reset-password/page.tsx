import { XCircle } from 'lucide-react';
import Link from 'next/link';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { ResetPasswordForm } from '@/components/auth/ResetPasswordForm';

export default async function ResetPasswordPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>
}) {
  const { token } = await searchParams;

  if (!token) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <Card className="w-full max-w-sm text-center">
          <CardHeader>
            <XCircle className="h-12 w-12 text-destructive mx-auto mb-2" />
            <CardTitle>Invalid Link</CardTitle>
            <CardDescription>No reset token provided.</CardDescription>
          </CardHeader>
          <CardContent>
            <Link
              href="/forgot-password"
              className="inline-flex w-full items-center justify-center rounded-lg bg-primary text-primary-foreground text-sm font-medium h-8 px-2.5 transition-all hover:bg-primary/80"
            >
              Request New Reset Link
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <ResetPasswordForm token={token} />
    </div>
  );
}
