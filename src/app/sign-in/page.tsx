import { SignInForm } from '@/components/auth/SignInForm';
import { AuthNavbar } from '@/components/auth/AuthNavbar';

export default async function SignInPage({
  searchParams,
}: {
  searchParams: Promise<{ callbackUrl?: string; error?: string; registered?: string; verified?: string }>;
}) {
  const { callbackUrl, error, registered, verified } = await searchParams;

  return (
    <>
      <AuthNavbar currentPage="sign-in" />
      <div className="min-h-screen flex items-center justify-center px-4 pt-14">
        <SignInForm
          callbackUrl={callbackUrl ?? '/dashboard'}
          error={error}
          registered={registered === 'true'}
          verified={verified === 'true'}
        />
      </div>
    </>
  );
}
