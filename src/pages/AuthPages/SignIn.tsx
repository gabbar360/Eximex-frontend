import SEOHead from '../../components/common/SEOHead';
import AuthLayout from './AuthPageLayout';
import SignInForm from '../../components/auth/SignInForm';

export default function SignIn() {
  return (
    <>
      <SEOHead
        title="Sign In - EximEx | Global Import Export Trading Platform"
        description="Sign in to EximEx - Your comprehensive global trading platform for seamless import-export operations. Access real-time market insights and secure transactions."
        url="https://eximexperts.in/signin"
      />
      <AuthLayout>
        <SignInForm />
      </AuthLayout>
    </>
  );
}
