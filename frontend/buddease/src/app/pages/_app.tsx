// _app.tsx
import { AppProps } from 'next/app';
import { AuthProvider } from '../components/auth/AuthContext';
import OnboardingComponent from '../components/onboarding/OnboardingComponent';

import { StoreProvider } from '../components/state/stores/StoreProvider';

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <AuthProvider>
       <StoreProvider>
         <OnboardingComponent />
        <Component {...pageProps} />
      </StoreProvider>
    </AuthProvider>
  );
}

export default MyApp;
