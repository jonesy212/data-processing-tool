// _app.tsx
import { AppProps } from "next/app";
import { AuthProvider } from "../components/auth/AuthContext";
import OnboardingComponent from "../components/onboarding/OnboardingComponent";
import { NotificationProvider } from "../components/support/NotificationContext";

import { DynamicPromptProvider } from "../components/prompts/DynamicPromptContext";
import { StoreProvider } from "../components/state/stores/StoreProvider";
import SearchComponent from "./searchs/Search";


function MyApp({ Component, pageProps }: AppProps) {
  interface Props {
    children: React.ReactNode;
    componentSpecificData: any[];
  }

  return (
    <SearchComponent
      { ...pageProps }
    >
    {({ children, componentSpecificData }: Props) => (
        <NotificationProvider>
          <DynamicPromptProvider>
            <AuthProvider>
              <StoreProvider>
                <OnboardingComponent />
                {children}
              </StoreProvider>
            </AuthProvider>
          </DynamicPromptProvider>
        </NotificationProvider>
      )}
    </SearchComponent>
  );
}



export default MyApp;
