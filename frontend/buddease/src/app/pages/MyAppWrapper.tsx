// MyAppWrapper.tsx
import { AppProps } from 'next/app';
import { NextRouter, Router, useRouter } from 'next/router';
import MyApp from './_app';

function MyAppWrapper({ Component, pageProps }: AppProps) {
  const router = useRouter();

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

  return (
    <MyApp
      Component={Component}
      pageProps={pageProps}
      router={router as ExtendedRouter & Router}
    />
  );
}

export default MyAppWrapper;
