import PageMeta from '../../components/common/PageMeta';
import AuthLayout from './AuthPageLayout';
import SignUpForm from '../../components/auth/SignUpForm';

export default function SignUp() {
  return (
    <>
      <PageMeta
        title="Sign Up - EximEx | Join Global Import Export Platform"
        description="Create your EximEx account to access comprehensive import-export trading tools, manage international business operations, and connect with global markets."
      />
      <AuthLayout>
        <SignUpForm />
      </AuthLayout>
    </>
  );
}
