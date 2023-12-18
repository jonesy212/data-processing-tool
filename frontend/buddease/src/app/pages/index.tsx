// pages/index.tsx
import { create } from 'mobx-persist';
import { useRouter } from 'next/router';
import React, { useEffect } from 'react';
import { rootStore } from '../components/state/stores/RootStores';
import Layout from './layouts/Layouts';
// your custom hydrate function

const hydrate = (key: string) => {
  create({
    storage: window.localStorage,
    jsonify: true,
  })('RootStore', rootStore).rehydrate();
}

const Index: React.FC = () => {
  const router = useRouter();

  // Simulate redirection to the dashboard after registration
  useEffect(() => {
    hydrate(rootStore.constructor.name);
    
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
