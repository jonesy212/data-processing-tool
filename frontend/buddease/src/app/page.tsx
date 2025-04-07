// @ts-nocheck
"use client";

import { useRef } from "react";
import RootLayout from "./RootLayout";
import LazyLoadedImage from "./components/LazyLoadedImage";
import styles from "./page.module.css";
import Layout from "./pages/layouts/Layouts";
import YourComponent from "./components/YourComponent"; // Make sure path is correct

export default function Home() {
  const componentRef = useRef<any>(null);

  const handleUpdate = () => {
    componentRef.current?.updateSnapshot(
      "snapshot-id",
      {}, // data
      {}, // events
      {}, // snapshotStore
      [], // dataItems
      {}, // newData
      {}, // updatedPayload
    );
  };

  return (
    <RootLayout>
      <Layout>
        <YourComponent
          ref={componentRef}
          apiConfig={{
            name: "exampleName",
            baseURL: "https://example.com",
            timeout: 1000,
            headers: {},
            description: "Example API",
            retry: {
              enabled: true,
              maxRetries: 3,
              retryDelay: 1000,
            },
            cache: {
              enabled: true,
              maxAge: 1000,
              staleWhileRevalidate: 1000,
              cacheKey: "example-cache-key",
            },
            responseType: "json",
            withCredentials: false,
          }}
        >
          <main className={styles.main}>
            <div className={styles.description}>
              <p>
                Get started by editing&nbsp;
                <code className={styles.code}>src/app/page.tsx</code>
              </p>
              <div>
                <a
                  href="https://vercel.com?utm_source=create-next-app&utm_medium=appdir-template&utm_campaign=create-next-app"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  By <LazyLoadedImage src="/vercel.svg" alt="Vercel Logo" />
                </a>
              </div>
            </div>

            <div className={styles.center}>
              <LazyLoadedImage src="/next.svg" alt="Next.js Logo" />
            </div>

            <div className={styles.grid}>
              {/* grid items here... */}
            </div>

            <button onClick={handleUpdate}>Update Snapshot</button>
          </main>
        </YourComponent>
      </Layout>
    </RootLayout>
  );
}