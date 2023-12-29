// pages/index.tsx
import { create } from "mobx-persist";
import { useRouter } from "next/router";
import React, { useEffect, useState } from "react";
import io, { Socket } from "socket.io-client";
import { useAuth } from "../components/auth/AuthContext";
import { rootStores } from "../components/state/stores/RootStores";
import { User } from "../components/todos/tasks/User";
import Layout from "./layouts/Layouts";

// your custom hydrate function
const hydrate = (key: string) => {
  create({
    storage: window.localStorage,
    jsonify: true,
  })("RootStore", rootStores).rehydrate();
};

const Index: React.FC = () => {
  const router = useRouter();
  const { state: authState, dispatch: authDispatch } = useAuth();
  const [socket, setSocket] = useState<Socket | null>(null);

  // Simulate redirection to the dashboard after registration
  useEffect(() => {
    hydrate(rootStores.constructor.name);

    const authenticateUser = async () => {
      const user: User = {
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
        uploadQuota: 0
      };

      authDispatch({ type: "LOGIN", payload: user });
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
  }, [authState.isAuthenticated, router, authDispatch]); // Added dependencies to useEffect

  return (
    <Layout>
      <div>
        <h1>Redirecting to the Dashboard...</h1>
      </div>
    </Layout>
  );
};

export default Index;
