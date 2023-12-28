// _app.tsx
import { AppProps } from 'next/app';
import { AuthProvider } from '../components/auth/AuthContext';
import OnboardingComponent from '../components/onboarding/OnboardingComponent';
import { NotificationProvider } from '../components/support/NotificationContext';

import { StoreProvider } from '../components/state/stores/StoreProvider';

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <NotificationProvider>
    <AuthProvider>
       <StoreProvider>
         <OnboardingComponent />
        <Component {...pageProps} />
      </StoreProvider>
    </AuthProvider>
    </NotificationProvider>
  );
}

export default MyApp;
