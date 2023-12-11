// pages/index.tsx

import { useRouter } from 'next/router';
import React, { useEffect } from 'react';
import Layout from './layouts/Layouts';

const Index: React.FC = () => {
  const router = useRouter();

  // Simulate redirection to the dashboard after registration
  useEffect(() => {
    // Assuming some condition triggers the redirection
    router.push('/dashboard');
  }, []);

  return (
    <Layout>
      <div>
        <h1>Redirecting to the Dashboard...</h1>
      </div>
    </Layout>
  );
};

export default Index;
