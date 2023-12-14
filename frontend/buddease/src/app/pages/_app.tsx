// _app.tsx
import { Provider } from 'mobx-react-lite';
import { AppProps } from 'next/app';
import { AuthProvider } from '../components/auth/AuthContext';
import OnboardingComponent from '../components/onboarding/OnboardingComponent';
import responsiveDesignStore from '../components/styling/ResponsiveDesign';
function MyApp({ Component, pageProps }: AppProps) {
  return (
    <AuthProvider>
      <Provider responsiveDesignStore={responsiveDesignStore}>
        {/* Your Onboarding component */}
        <OnboardingComponent />
        <Component {...pageProps} />
      </Provider>
    </AuthProvider>
  );
}

export default MyApp;
