// pages/index.tsx
import RootLayout from "@/app/RootLayout";
import useMessagingSystem from "@/app/components/communications/chat/useMessagingSystem";
import { UserRole } from "@/app/components/users/UserRole";
import generateTimeBasedCode from "@/app/models/realtime/TimeBasedCodeGenerator";
import PaymentForm from "@/app/payment/PaymentForm";
import { rootStores } from "@/app/state/stores/RootStores";
import { User } from "@/app/users/User";
import { useAuth } from "@/context/AuthContext";
import { authToken } from "@/server/auth/authToken";
import { create } from "mobx-persist";
import { useRouter } from "next/router";
import React, { useEffect, useState } from "react";
import io, { Socket } from "socket.io-client";
import generateDynamicContent from '../components/documents/DynamicContentGenerator';
import YourApp from "./YourApp";
import Layout from "./layouts/Layouts";
import { Persona } from "./personas/Persona";

 // pages/index.tsx

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

  // Simulate redirection to the dashboard after registration
  useEffect(() => {
    hydrate(rootStores.constructor.name);

    const authenticateUser = async () => {
      const timeBasedCode = generateTimeBasedCode();
      const user: User = {
        // user object
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

      authDispatch({ type: "LOGIN", payload: { user: {} as User, roles: [], nfts: [], authToken: authToken } });
    };

    const establishSocketConnection = () => {
      const newSocket = io(
        "http://" + window.location.hostname + ":" + location.port
      );

      newSocket.on("connect", () => {
        setSocket(newSocket);
      });

      // Return the socket instance
      return newSocket;
    };

    const socket = establishSocketConnection();


    interface MessagingSystemOptions {
      onMessageReceived: (message: string) => void;
      socket: Socket
      // other properties...
    }

    // Use the useMessagingSystem hook without assigning onMessageReceived to a variable
    useMessagingSystem({
      onMessageReceived: (message: string) => {
        return console.log("Received message:", message);
      },
    } as MessagingSystemOptions);

    const storedRoute = localStorage.getItem("lastRoute");

    if (storedRoute) {
      // Redirect to the last visited route
      router.push(storedRoute);
      // Clear the stored route after redirecting
      localStorage.removeItem("lastRoute");
    } else {
      // Assuming some condition triggers the redirection
      router.push("/dashboard");
    }

    // Check if the user is not authenticated, then authenticate
    if (!authState.isAuthenticated) {
      authenticateUser();
    } else {
      const newSocket = establishSocketConnection();

      return () => {
        newSocket.disconnect();
      };
    }
  }, [authState.isAuthenticated, router, authDispatch, socket]);

  // Generate dynamic content using the function
  const appName = "MyApp"; // Replace with actual logic to fetch app name
  const currentDate = new Date().toLocaleDateString(); // Get current date
  const dynamicContent = generateDynamicContent(appName, currentDate);


  return (
    <RootLayout>

      <Layout>
        <div>
          <YourApp />
          <h1>Redirecting to the Dashboard...</h1>
          <PaymentForm /> {/* Include the PaymentForm component */}
          {/* Render the dynamic content */}

          <div>{dynamicContent}</div>

        </div>
      </Layout>
    </RootLayout>
  );
};

export default Index;
