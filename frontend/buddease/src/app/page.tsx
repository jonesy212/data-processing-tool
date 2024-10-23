// @ts-nocheck
'use client'
// page.tsx
import RootLayout from "./RootLayout";
import LazyLoadedImage from "./components/LazyLoadedImage";
import styles from "./page.module.css";
import Layout from "./pages/layouts/Layouts";

export default function Home() {
  return (
    <RootLayout>
    <Layout>
    {" "}
      {/* Wrap the content with RootLayout */}
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
          <a
            href="https://nextjs.org/docs?utm_source=create-next-app&utm_medium=appdir-template&utm_campaign=create-next-app"
            className={styles.card}
            target="_blank"
            rel="noopener noreferrer"
          >
            <h2>
              Docs <span>-&gt;</span>
            </h2>
            <p>Find in-depth information about Next.js features and API.</p>
          </a>

          <a
            href="https://nextjs.org/learn?utm_source=create-next-app&utm_medium=appdir-template&utm_campaign=create-next-app"
            className={styles.card}
            target="_blank"
            rel="noopener noreferrer"
          >
            <h2>
              Learn <span>-&gt;</span>
            </h2>
            <p>
              Learn about Next.js in an interactive course with&nbsp;quizzes!
            </p>
          </a>

          <a
            href="https://vercel.com/templates?framework=next.js&utm_source=create-next-app&utm_medium=appdir-template&utm_campaign=create-next-app"
            className={styles.card}
            target="_blank"
            rel="noopener noreferrer"
          >
            <h2>
              Templates <span>-&gt;</span>
            </h2>
            <p>Explore starter templates for Next.js.</p>
          </a>

          <a
            href="https://vercel.com/new?utm_source=create-next-app&utm_medium=appdir-template&utm_campaign=create-next-app"
            className={styles.card}
            target="_blank"
            rel="noopener noreferrer"
          >
            <h2>
              Deploy <span>-&gt;</span>
            </h2>
            <p>
              Instantly deploy your Next.js site to a shareable URL with Vercel.
            </p>
          </a>
        </div>
      </main>
      </Layout>
    </RootLayout>
  );
}

// example usage:
// // Your React component where you want to use lazy-loaded images
// import React from 'react';
// import LazyLoadedImage from './LazyLoadedImage';

// const YourComponent = () => {
//   return (
//     <div>
//       {/* Other components */}
//       <LazyLoadedImage src="path/to/your/image.jpg" alt="Alt text" />
//       {/* Other components */}
//     </div>
//   );
// };

// export default YourComponent;
