// MyAppWrapper.tsx
import { AppProps } from 'next/app';
import { NextRouter, Router, useRouter } from 'next/router';
import { PhaseHookConfig, createPhaseHook } from '../components/hooks/phaseHooks/PhaseHooks';
import { generateUtilityFunctions } from '../generators/GenerateUtilityFunctions';
import MyApp from './_app';
function MyAppWrapper({ Component, pageProps }: AppProps) {
  // Extend AppProps to include hooks

  // Define a generic type for hooks
  type Hooks = Record<string, PhaseHookConfig>;

  // interface ExtendedAppProps extends AppProps {
  //   hooks: Record<string, any>;
  // }


  const router = useRouter();

  // Generate utility functions
  const utilities = generateUtilityFunctions();

  // Extend NextRouter with additional properties
  type ExtendedRouter = NextRouter & {
    components: any;
    sdc: any;
    sbc: any;
    sub: any;
    clc: any;
    pageLoader: any;
    _bps: any;
    _wrapApp: any;
  };

  // Generate hooks dynamically based on your phases
  const hooks: Record<string, any> = {
    components: createPhaseHook({
      name: "Components Phase",
      condition: () => true,
      asyncEffect: async () => {
        // updated return type to match PhaseHookConfig
        return () => {};
      },
    } as PhaseHookConfig),

    pageLoader: createPhaseHook({
      name: "Page Loader Phase",
      condition: () => true,
      asyncEffect: async () => {
        // trigger animation
        return () => {};
      },
    } as PhaseHookConfig),

    sdc: createPhaseHook({
      name: "SDC Phase",
      condition: () => true,
      asyncEffect: async () => {
        // trigger animation
        return () => {};
      },
    } as PhaseHookConfig),
    sbc: createPhaseHook({
      name: "SBC Phase",
      condition: () => true,
      asyncEffect: async () => {
        // trigger animation
        return () => {};
      },
    } as PhaseHookConfig),
    sub: createPhaseHook({
      name: "SUB Phase",
      condition: () => true,
      asyncEffect: async () => {
        // trigger animation
        return () => {};
      },
    } as PhaseHookConfig),
    clc: createPhaseHook({
      name: "CLC Phase",
      condition: () => true,
      asyncEffect: async () => {
        // trigger animation
        return () => {};
      },
    } as PhaseHookConfig),
  };

  // Extend AppProps to include hooks
 

  type ExtendedAppProps = AppProps & {
    hooks: Record<string, any>;
    utilities: any;

  };

  return (
    <MyApp
      Component={Component}
      pageProps={pageProps}
      router={router as ExtendedRouter & Router}
      // hooks={hooks as ExtendedAppProps['hooks'] as Hooks}
      // utilities={utilities}
    />
  );
}

export default MyAppWrapper;
