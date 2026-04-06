import { RegisterForm } from '@/components/auth/RegisterForm';
import { AuthNavbar } from '@/components/auth/AuthNavbar';

export default function RegisterPage() {
  return (
    <>
      <AuthNavbar currentPage="register" />
      <div className="min-h-screen flex items-center justify-center px-4 pt-14">
        <RegisterForm />
      </div>
    </>
  );
}
