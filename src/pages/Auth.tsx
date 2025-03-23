import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import FadeIn from '../components/animations/FadeIn';
import { StytchLoginForm } from '../components/StytchLoginForm';
import { useStytch } from '../contexts/StytchContext';
import { Loader2 } from 'lucide-react';
import { StytchUIClient } from '@stytch/vanilla-js';

// Create a direct instance for token authentication
const createDirectAuthClient = () => {
  const publicToken = 'public-token-test-1338ae07-6f7b-4f60-a5c6-c050ac7a2161';
  
  try {
    return new StytchUIClient(publicToken, {
      cookieOptions: {
        domain: window.location.hostname === 'localhost' ? 'localhost' : window.location.hostname,
      }
    });
  } catch (error) {
    console.error('Error creating direct auth client:', error);
    return null;
  }
};

// Error boundary component to catch rendering errors
class ErrorBoundary extends React.Component<
  { children: React.ReactNode; fallback: React.ReactNode },
  { hasError: boolean; error: Error | null }
> {
  constructor(props: { children: React.ReactNode; fallback: React.ReactNode }) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("Error caught by boundary:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback;
    }
    return this.props.children;
  }
}

const Auth: React.FC = () => {
  const navigate = useNavigate();
  const { stytch: contextStytch, user } = useStytch();
  const [directClient] = useState(() => createDirectAuthClient());
  
  // Use context client if available, otherwise use direct client
  const stytch = contextStytch || directClient;
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [renderDebug, setRenderDebug] = useState<string | null>(null);
  
  // Add debugging for initialization
  useEffect(() => {
    console.log("Auth component mounted");
    
    // Debug Stytch context
    try {
      console.log("Stytch clients check:", { 
        contextStytchInitialized: !!contextStytch, 
        directClientInitialized: !!directClient,
        userPresent: !!user
      });
      
      // Check if either client has magicLinks methods
      const client = contextStytch || directClient;
      if (client) {
        console.log("Stytch magicLinks available:", !!client.magicLinks);
        console.log("Stytch magicLinks.email available:", !!client.magicLinks?.email);
      } else {
        // Check if this is likely a domain registration issue
        try {
          // Log detailed origin information to help debug domain issues
          console.log("Current origin:", window.location.origin);
          console.log("Current hostname:", window.location.hostname);
          console.log("Current protocol:", window.location.protocol);
          
          setRenderDebug("Domain may not be registered with Stytch. Check console for details.");
        } catch (innerErr) {
          console.error("Error in domain check:", innerErr);
        }
        
        setRenderDebug("No Stytch client is available. Domain may need to be registered in Stytch dashboard.");
      }
    } catch (err) {
      console.error("Error in debug logging:", err);
      
      // Check if this is a domain registration error
      const errorStr = String(err);
      if (errorStr.includes('not been registered as an allowed domain')) {
        setRenderDebug("This domain needs to be registered in Stytch dashboard: " + window.location.origin);
      } else {
        setRenderDebug("Error in Stytch context: " + (err instanceof Error ? err.message : String(err)));
      }
    }
  }, [contextStytch, directClient, user]);
  
  // Redirect if already authenticated
  useEffect(() => {
    if (user) {
      navigate('/dashboard');
    }
  }, [user, navigate]);
  
  // Function to handle token authentication
  useEffect(() => {
    const authenticateToken = async () => {
      // Check URL for any token parameters
      const url = new URL(window.location.href);
      const searchParams = url.searchParams;
      
      // Check for Stytch tokens - used for email magic links
      const token = searchParams.get('token');
      const tokenType = searchParams.get('stytch_token_type');
      
      console.log('URL parameters:', { 
        token: token ? `${token.substring(0, 5)}...` : null, 
        tokenType 
      });
      
      if (!stytch) {
        console.error('No Stytch client available for token authentication');
        setError('Authentication service is not available');
        return;
      }
      
      if (token && tokenType === 'magic_links') {
        setLoading(true);
        try {
          console.log('Attempting to authenticate token...');
          // Authenticate the magic link token
          const authResult = await stytch.magicLinks.authenticate(token, {
            session_duration_minutes: 60,
          });
          
          console.log('Token authentication successful:', authResult);
          
          // If successful, navigate to dashboard
          navigate('/dashboard');
        } catch (err: any) {
          console.error('Error authenticating token:', err);
          
          // Enhanced error logging
          if (err.error_type) {
            console.error('Stytch Error Type:', err.error_type);
          }
          if (err.error_message) {
            console.error('Stytch Error Message:', err.error_message);
          }
          if (err.status_code) {
            console.error('Stytch Status Code:', err.status_code);
          }
          
          setError(err.error_message || 'Failed to authenticate. Please try again.');
          setLoading(false);
        }
      } else if (token || tokenType) {
        console.log('Incomplete token parameters found', { token: !!token, tokenType });
      }
    };
    
    authenticateToken();
  }, [navigate, stytch]);
  
  if (loading) {
    return (
      <Layout glassmorphism withNoise className="flex items-center justify-center">
        <div className="flex flex-col items-center justify-center gap-4">
          <Loader2 className="h-10 w-10 animate-spin text-primary" />
          <p className="text-lg">Authenticating...</p>
        </div>
      </Layout>
    );
  }
  
  const LoginFormFallback = () => (
    <div className="p-6 bg-destructive/10 text-destructive rounded-lg">
      <h3 className="text-lg font-medium mb-2">Error Loading Login Form</h3>
      <p>The login form could not be loaded due to an error.</p>
      <pre className="mt-2 text-sm whitespace-pre-wrap bg-black/5 p-2 rounded">{renderDebug || "No specific error details available."}</pre>
      <button 
        className="mt-4 px-4 py-2 bg-primary text-white rounded-md"
        onClick={() => window.location.reload()}
      >
        Refresh Page
      </button>
    </div>
  );
  
  return (
    <Layout glassmorphism withNoise className="flex items-center justify-center">
      <div className="container max-w-md py-12">
        <FadeIn>
          <div className="glass rounded-2xl shadow-xl border border-white/10 p-8">
            <div className="mb-6 text-center">
              <h1 className="text-2xl font-bold mb-2">
                Welcome to WZRD
              </h1>
              <p className="text-muted-foreground">
                Sign in or sign up to continue
              </p>
            </div>
            
            {error && (
              <div className="bg-destructive/10 text-destructive px-4 py-3 rounded-lg mb-6">
                {error}
              </div>
            )}
            
            {renderDebug && (
              <div className="bg-orange-100 border-l-4 border-orange-500 text-orange-700 p-4 mb-6">
                <p className="font-bold">Debug Info:</p>
                <p>{renderDebug}</p>
              </div>
            )}
            
            <ErrorBoundary fallback={<LoginFormFallback />}>
              <StytchLoginForm />
            </ErrorBoundary>
            
            <div className="mt-6 text-center text-sm">
              <p className="text-muted-foreground">
                By continuing, you agree to our Terms of Service and Privacy Policy.
              </p>
            </div>
          </div>
        </FadeIn>
      </div>
    </Layout>
  );
};

export default Auth;
