// _app.tsx
import { AppProps } from 'next/app';
import OnboardingComponent from '../components/OnboardingComponent';
import { AuthProvider } from './../components/AuthContext';

function MyApp({ Component, pageProps }: AppProps) {
  return (
      <AuthProvider>
          {/* Your Onboarding component */}
      <OnboardingComponent />
      <Component {...pageProps} />
    </AuthProvider>
  );
}

export default MyApp;
