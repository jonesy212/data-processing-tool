// pages/index.tsx
import generateDynamicContent from '@/core/documents/DynamicContentGenerator';
import type { UserRole } from "@/core/models/UserRole";
import generateTimeBasedCode from "@/core/models/realtime/TimeBasedCodeGenerator";
import { Persona } from "@/core/pages/personas/Persona";
import PaymentForm from "@/core/payment/PaymentForm";
import { authToken } from "@/core/server/auth/authToken";
import { useAuth } from "@/core/state/context/AuthContext";
import { rootStores } from "@/core/state/stores/RootStores";
import { UserAttachment, UserEntity, UserExcludedFields, UserIncludedFields, UserK, UserMeta } from '@/core/typings/entities/UserEntity';
import { User } from "@/core/users/User";
import { create } from "mobx-persist";
import { useRouter } from "next/router";
import React, { useEffect, useState } from "react";
import io, { Socket } from "socket.io-client";
import YourApp from "./YourApp";
import Layout from "./layouts/Layouts";

// Import ApiSynchronizationScript if you haven't already
import ApiSynchronizationScript from "@/core/app/scripts/ApiSynchronizationScript"; // Adjust path as needed

// your custom hydrate function
const hydrate = (key: string) => {
  create({
    storage: window.localStorage,
    jsonify: true,
  })("RootStore", rootStores).rehydrate();
};

const Index: React.FC<{}> = () => {
  const router = useRouter();
  const { state: authState, dispatch: authDispatch } = useAuth();
  const [socket, setSocket] = useState<Socket | null>(null);
  const [syncScript] = useState(() => 
    new ApiSynchronizationScript(
      'https://your-api.com',
      authToken,
      'UserEntity'
    )
  );
  const [isLoading, setIsLoading] = useState(true);

  // Initialize once on mount - hydrate stores
  useEffect(() => {
    hydrate(rootStores.constructor.name);
  }, []);

  // Initialize socket connection
  useEffect(() => {
    const initializeSocket = async () => {
      try {
        // You might want to get the actual server URL from environment/config
        const serverUrl = process.env.NEXT_PUBLIC_SOCKET_SERVER || 'http://localhost:3001';
        const socketInstance = io(serverUrl, {
          transports: ['websocket', 'polling'],
          withCredentials: true,
          auth: {
            token: authToken
          }
        });

        socketInstance.on('connect', () => {
          console.log('Socket connected:', socketInstance.id);
        });

        socketInstance.on('connect_error', (error) => {
          console.error('Socket connection error:', error);
        });

        setSocket(socketInstance);
      } catch (error) {
        console.error('Failed to initialize socket:', error);
      }
    };

    if (authState.isAuthenticated) {
      initializeSocket();
    }
  }, [authState.isAuthenticated]);

  // Authentication effect
  useEffect(() => {
    const authenticateUser = async () => {
      try {
        const timeBasedCode = generateTimeBasedCode();
        const user: User<UserEntity, UserK, UserMeta, UserAttachment, UserExcludedFields, UserIncludedFields> = {
          _id: "123",
          id: 1,
          username: "testUser",
          email: "test@test.com",
          tier: "free",
          userType: "standard",
          hasQuota: true,
          fullName: null,
          bio: null,
          profilePicture: null,
          processingTasks: [],
          uploadQuota: 0,
          role: {} as UserRole,
          timeBasedCode: timeBasedCode,
          persona: {} as Persona,
          snapshots: [],
          token: authToken
        };

        authDispatch({ 
          type: "LOGIN", 
          payload: { 
            user: {} as User, 
            roles: [], 
            nfts: [], 
            authToken: authToken 
          } 
        });
      } catch (error) {
        console.error('Authentication failed:', error);
      } finally {
        // Set loading to false after authentication attempt
        setIsLoading(false);
      }
    };

    if (!authState.isAuthenticated) {
      authenticateUser();
    } else {
      // If already authenticated, set loading to false
      setIsLoading(false);
    }
  }, [authState.isAuthenticated, authDispatch]);

  // Final redirect effect after initialization
  useEffect(() => {
    if (!isLoading) {
      const timer = setTimeout(() => {
        const storedRoute = localStorage.getItem("lastRoute");
        if (storedRoute) {
          router.push(storedRoute);
          localStorage.removeItem("lastRoute");
        } else {
          router.push("/dashboard");
        }
      }, 2000); // 2 second delay for initialization

      return () => clearTimeout(timer);
    }
  }, [isLoading, router]);

  // Generate dynamic content using the function
  const appName = "MyApp"; // Replace with actual logic to fetch app name
  const currentDate = new Date().toLocaleDateString(); // Get current date
  const dynamicContent = generateDynamicContent(appName, currentDate);

  if (isLoading) {
    return (
      <div className="loading-screen">
        <div className="spinner"></div>
        <h2>Initializing application...</h2>
        <p>Please wait while we set up your environment</p>
      </div>
    );
  }

  return (
    <Layout>
      <div>
        <YourApp />
        <h1>Redirecting to the Dashboard...</h1>
        <PaymentForm /> {/* Include the PaymentForm component */}
        {/* Render the dynamic content */}
        <div>{dynamicContent}</div>
      </div>
    </Layout>
  );
};

export default Index;