import Home from "@/app/page";
import Dashboard from "@/dashboards/Dashboard";
import React from "react";
import { Route, BrowserRouter as Router, Routes } from "react-router-dom";
import LoginForm from "../../pages/forms/LoginForm";
import ProtectedRoute from "../routing/ProtectedRoute";

const AppRouter: React.FC = () => {
  return (
    <Router>
      <Routes>
        <Route
          path="/login"
          element={
            <LoginForm
              onSubmit={function (username: string, password: string): void {
                throw new Error("Function not implemented.");
              }}
              setUsername={() => {}}
              setPassword={() => {}}
            />
          }
        />
        <ProtectedRoute path="/dashboard" component={Dashboard} />
        <ProtectedRoute path="/" component={Home} />
      </Routes>
    </Router>
  );
};

export default AppRouter;
