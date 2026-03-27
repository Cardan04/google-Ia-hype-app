import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { Layout } from "./components/Layout";
import { Dashboard } from "./pages/Dashboard";
import { Events } from "./pages/Events";
import { Profile } from "./pages/Profile";
import { Checkout } from "./pages/Checkout";
import { Login } from "./pages/Login";
import { Signup } from "./pages/Signup";
import { Loader2 } from "lucide-react";

function PrivateRoute({ children }: { children: React.ReactNode }) {
  const { supabaseUser, user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0A0A0B] flex items-center justify-center">
        <Loader2 className="w-10 h-10 text-[#00FF00] animate-spin" />
      </div>
    );
  }

  // Allow access if either supabaseUser exists OR mock user exists (guest mode)
  if (!supabaseUser && !user) {
    return <Navigate to="/login" />;
  }

  return <Layout>{children}</Layout>;
}

export default function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route
            path="/"
            element={
              <PrivateRoute>
                <Dashboard />
              </PrivateRoute>
            }
          />
          <Route
            path="/events"
            element={
              <PrivateRoute>
                <Events />
              </PrivateRoute>
            }
          />
          <Route
            path="/profile"
            element={
              <PrivateRoute>
                <Profile />
              </PrivateRoute>
            }
          />
          <Route
            path="/checkout/:eventId"
            element={
              <PrivateRoute>
                <Checkout />
              </PrivateRoute>
            }
          />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}
