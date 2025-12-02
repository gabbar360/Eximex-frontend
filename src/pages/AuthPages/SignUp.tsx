import PageMeta from '../../components/common/PageMeta';
import AuthLayout from './AuthPageLayout';
import SignUpForm from '../../components/auth/SignUpForm';

export default function SignUp() {
  return (
    <>
      <PageMeta
        title="Sign Up - EximEx | Global Import Export Trading Platform"
        description="Create your EximEx account - Join the comprehensive global trading platform for seamless import-export operations."
      />
      <AuthLayout>
        <SignUpForm />
      </AuthLayout>
    </>
  );
}
