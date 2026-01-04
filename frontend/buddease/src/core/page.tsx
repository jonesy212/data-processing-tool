page.tsx
"use client";

import ApiConfigService from "@/core/api/ApiConfigService";
import { endpointConfigurations, endpoints } from '@/core/api/endpointConfigurations';
import LazyLoadedImage from "@/core/components/LazyLoadedImage";
import { updateSnapshot } from '@/core/snapshots/snapshotOperations';
import { lazy, Suspense, useRef } from "react";

if (typeof window !== 'undefined') {
  import("@/core/page.module.css");
}

Dynamically import YourComponent with SSR disabled
const YourComponent = lazy(() => import("@/core/hooks/YourComponent"));

interface ComponentMethods {
  updateSnapshot: (
    id: string,
    data: object,
    events: object,
    snapshotStore: object,
    dataItems: any[],
    newData: object,
    updatedPayload: object
  ) => void;
}

export default function Home() {
  const componentRef = useRef<ComponentMethods | null>(null);

  const handleUpdate = () => {
    try {
      componentRef.current?.updateSnapshot(
        String("snapshot-id"),
        {}, // data
        {}, // events
        {}, // snapshotStore
        [], // dataItems
        {}, // newData
        {} // updatedPayload
      );
    } catch (error) {
      console.error("Update failed:", error);
    }
  };

  const apiConfig = new ApiConfigService(
    endpointConfigurations, // Your endpoint configurations
    endpoints, // Your endpoints instance
    {
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
        strategy: 'memory',  // or 'persistent' or 'hybrid'
        ttl: 3600000,  // Time to live in milliseconds
        versioning: {
          enabled: true,
          key: 'v1'
        },
        invalidation: {
          onUpdate: true,
          onDelete: true,
          pattern: undefined  // optional
        },
        persistence: {
          enabled: false,  // Set to true if you want persistent storage
          storageKey: 'api-cache',
          autoRehydrate: false
        }
      },
      responseType: "json",
      withCredentials: false,
    }
  );

  return (
    <Suspense fallback={<div>Loading...</div>}>
      <YourComponent ref={componentRef} apiConfig={apiConfig} updateSnapshot={updateSnapshot}>
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
                By{" "}
                <LazyLoadedImage
                  src={String("/vercel.svg")}
                  alt={String("Vercel Logo")}
                />
              </a>
            </div>
          </div>

          <div className={styles.center}>
            <LazyLoadedImage
              src={String("/next.svg")}
              alt={String("Next.js Logo")}
            />
          </div>

          <button onClick={handleUpdate}>Update Snapshot</button>
        </main>
      </YourComponent>
    </Suspense>
  );
}
