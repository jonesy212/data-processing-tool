// GoogleAnalyticsScript.tsx
import Script from 'next/script';
import React from 'react';

const GoogleAnalyticsScript: React.FC = () => {
  return (
    <Script strategy="lazyOnload" src={`https://www.googletagmanager.com/gtag/js?id=YOUR_ANALYTICS_ID`}>
      {`
        window.dataLayer = window.dataLayer || [];
        function gtag(){dataLayer.push(arguments);}
        gtag('js', new Date());
        gtag('config', 'YOUR_ANALYTICS_ID');
      `}
    </Script>
  );
};

export default GoogleAnalyticsScript;
