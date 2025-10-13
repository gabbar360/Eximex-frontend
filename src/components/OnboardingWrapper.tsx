import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import OnboardingModal from '../pages/Comanyform';

interface OnboardingWrapperProps {
  children: React.ReactNode;
}

const OnboardingWrapper: React.FC<OnboardingWrapperProps> = ({ children }) => {
  const [showOnboarding, setShowOnboarding] = useState(false);
  const user = useSelector((state: any) => state.auth?.user);

  useEffect(() => {
    // Show onboarding modal if user exists but profile is not complete
    if (user && !user.isProfileComplete) {
      setShowOnboarding(true);
    }
  }, [user]);

  const handleOnboardingClose = () => {
    setShowOnboarding(false);
    // Optionally refresh user data here
    window.location.reload();
  };

  return (
    <>
      {children}
      {showOnboarding && <OnboardingModal onClose={handleOnboardingClose} />}
    </>
  );
};

export default OnboardingWrapper;
