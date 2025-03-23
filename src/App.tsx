import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate, useNavigate } from "react-router-dom";
import { StytchProvider } from './contexts/StytchContext';
import { useStytch } from './contexts/StytchContext';
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
import TimeSavedPage from "./pages/TimeSavedPage";
import NotFound from "./pages/NotFound";
import { Loader2 } from "lucide-react";
import React from "react"; // Added explicit React import

// Create the query client outside of the component
const queryClient = new QueryClient();

// Protected route component
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, loading: contextLoading } = useStytch();
  const [loading, setLoading] = React.useState(true);
  const navigate = useNavigate();
  
  React.useEffect(() => {
    console.log("ProtectedRoute: checking auth");
    
    const checkAuth = async () => {
      try {
        if (!contextLoading) {
          console.log("ProtectedRoute: context loading complete, user:", !!user);
          setLoading(false);
          
          if (!user) {
            console.log("ProtectedRoute: no user, redirecting to /auth");
            navigate('/auth', { replace: true });
          }
        }
      } catch (error) {
        console.error("ProtectedRoute: error checking auth", error);
        setLoading(false);
        navigate('/auth', { replace: true });
      }
    };
    
    checkAuth();
  }, [contextLoading, user, navigate]);
  
  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
        <span className="ml-2 text-muted-foreground">Loading...</span>
      </div>
    );
  }
  
  if (!user) {
    return null; // Will be redirected by the useEffect
  }
  
  return <>{children}</>;
};

// Define App as a proper React functional component
const App = () => {
  return (
    <BrowserRouter>
      <QueryClientProvider client={queryClient}>
        <StytchProvider>
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
              
              {/* Time Saved route */}
              <Route 
                path="/dashboard/time-saved" 
                element={
                  <ProtectedRoute>
                    <TimeSavedPage />
                  </ProtectedRoute>
                } 
              />
              
              {/* Catch-all route */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </TooltipProvider>
        </StytchProvider>
      </QueryClientProvider>
    </BrowserRouter>
  );
};

export default App;
