
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import Index from "./pages/Index";
import About from "./pages/About";
import Contact from "./pages/Contact";
import Auth from "./pages/Auth";
import Dashboard from "./pages/Dashboard";
import RecordingsPage from "./pages/RecordingsPage";
import NewRecordingPage from "./pages/NewRecordingPage";
import RecordingDetailsPage from "./pages/RecordingDetailsPage";
import ActPage from "./pages/ActPage";
import ActivityPage from "./pages/ActivityPage";
import NotFound from "./pages/NotFound";
import { Loader2 } from "lucide-react";
import React from "react"; // Added explicit React import

// Create the query client outside of the component
const queryClient = new QueryClient();

// Protected route component
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, isLoading } = useAuth();
  
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
        <span className="ml-2 text-muted-foreground">Loading...</span>
      </div>
    );
  }
  
  if (!user) {
    return <Navigate to="/auth" replace />;
  }
  
  return <>{children}</>;
};

// Define App as a proper React functional component
const App = () => {
  return (
    <BrowserRouter>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/about" element={<About />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="/auth" element={<Auth />} />
              
              {/* Protected routes */}
              <Route 
                path="/dashboard" 
                element={
                  <ProtectedRoute>
                    <Dashboard />
                  </ProtectedRoute>
                } 
              />
              
              {/* Recording routes */}
              <Route 
                path="/dashboard/recordings" 
                element={
                  <ProtectedRoute>
                    <RecordingsPage />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/dashboard/recordings/new" 
                element={
                  <ProtectedRoute>
                    <NewRecordingPage />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/dashboard/recordings/:id" 
                element={
                  <ProtectedRoute>
                    <RecordingDetailsPage />
                  </ProtectedRoute>
                } 
              />
              
              {/* Act route */}
              <Route 
                path="/dashboard/act" 
                element={
                  <ProtectedRoute>
                    <ActPage />
                  </ProtectedRoute>
                } 
              />
              
              {/* Activity route */}
              <Route 
                path="/dashboard/activity" 
                element={
                  <ProtectedRoute>
                    <ActivityPage />
                  </ProtectedRoute>
                } 
              />
              
              {/* Catch-all route */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </TooltipProvider>
        </AuthProvider>
      </QueryClientProvider>
    </BrowserRouter>
  );
};

export default App;
