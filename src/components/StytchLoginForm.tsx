import React, { useEffect, useState } from 'react';
import { useStytch } from '../contexts/StytchContext';
import { StytchUIClient } from '@stytch/vanilla-js';

// Create a direct instance for the form
const createDirectStytchClient = () => {
  // Use the same token that works in the demo
  const publicToken = 'public-token-test-1338ae07-6f7b-4f60-a5c6-c050ac7a2161';
  
  try {
    return new StytchUIClient(publicToken, {
      cookieOptions: {
        domain: window.location.hostname === 'localhost' ? 'localhost' : window.location.hostname,
      }
    });
  } catch (error) {
    console.error('Error creating direct Stytch client:', error);
    return null;
  }
};

export const StytchLoginForm = () => {
  // Get the context client but also create a direct client as backup
  const { stytch: contextStytch } = useStytch();
  const [directClient] = useState(() => createDirectStytchClient());
  
  // Use context client if available, otherwise use direct client
  const stytch = contextStytch || directClient;
  
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [clientReady, setClientReady] = useState(false);
  const [domainError, setDomainError] = useState(false);
  // Dynamic redirect URL based on the current window location
  const [redirectUrl, setRedirectUrl] = useState('');

  // Check if either Stytch client is properly initialized
  useEffect(() => {
    console.log('Checking Stytch clients...');
    console.log('Context client available:', !!contextStytch);
    console.log('Direct client available:', !!directClient);
    
    const client = contextStytch || directClient;
    
    if (!client) {
      console.error('No Stytch client is available');
      
      // Check if this is likely a domain registration error
      if (navigator.onLine) {
        setDomainError(true);
        setError('This website has not been registered as an allowed domain for the Stytch SDK.');
      } else {
        setError('Authentication service is not available. Please check your internet connection.');
      }
      return;
    }
    
    try {
      // Check if magicLinks methods exist
      if (client.magicLinks?.email?.loginOrCreate) {
        setClientReady(true);
        console.log('Stytch client is ready for use');
      } else {
        console.error('Magic links methods are not available');
        setError('Authentication methods are not properly configured');
      }
    } catch (err) {
      console.error('Error checking Stytch client:', err);
      
      // Check for domain registration error
      const errorStr = String(err);
      if (errorStr.includes('not been registered as an allowed domain')) {
        setDomainError(true);
        setError('This website has not been registered as an allowed domain for the Stytch SDK.');
      } else {
        setError('Error initializing authentication service');
      }
    }
  }, [contextStytch, directClient]);

  // Update the redirect URL based on the current window location
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const host = window.location.host; // Includes host and port
      const protocol = window.location.protocol; // e.g., 'http:'
      const newRedirectUrl = `${protocol}//${host}/auth`;
      setRedirectUrl(newRedirectUrl);
      console.log('Set redirect URL to:', newRedirectUrl);
    }
  }, []);
  
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);
    
    if (!clientReady || !stytch) {
      setError('Authentication service is not ready. Please refresh the page and try again.');
      setIsLoading(false);
      return;
    }
    
    if (!email) {
      setError('Please enter your email address');
      setIsLoading(false);
      return;
    }
    
    try {
      console.log("Attempting to send magic link to:", email);
      console.log("Redirect URL:", redirectUrl);
      
      // Using loginOrCreate method from the vanilla-js SDK
      const response = await stytch.magicLinks.email.loginOrCreate(email, {
        login_magic_link_url: redirectUrl,
        signup_magic_link_url: redirectUrl,
        login_expiration_minutes: 60,
        signup_expiration_minutes: 60
      });
      
      console.log("Magic link sent successfully:", response);
      setSuccess(true);
    } catch (err: any) {
      console.error('Error sending magic link:', err);
      
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
      if (err.request_id) {
        console.error('Stytch Request ID:', err.request_id);
      }
      
      // Set a more descriptive error message if available
      setError(err.error_message || 'Failed to send magic link. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleGithubLogin = async () => {
    if (!clientReady || !stytch) {
      setError('Authentication service is not ready');
      return;
    }
    
    try {
      // Start OAuth flow with GitHub
      await stytch.oauth.github.start({
        login_redirect_url: redirectUrl,
        signup_redirect_url: redirectUrl,
      });
    } catch (err) {
      console.error('Error initiating GitHub OAuth flow:', err);
      setError('Failed to initiate GitHub login. Please try again.');
    }
  };
  
  const handleGoogleLogin = async () => {
    if (!clientReady || !stytch) {
      setError('Authentication service is not ready');
      return;
    }
    
    try {
      // Start OAuth flow with Google
      await stytch.oauth.google.start({
        login_redirect_url: redirectUrl,
        signup_redirect_url: redirectUrl,
      });
    } catch (err) {
      console.error('Error initiating Google OAuth flow:', err);
      setError('Failed to initiate Google login. Please try again.');
    }
  };
  
  // Show domain registration error UI if needed
  if (domainError) {
    return (
      <div className="w-full">
        <div className="p-4 bg-amber-50 border border-amber-200 text-amber-800 rounded-md mb-6">
          <h3 className="font-medium text-amber-900 text-lg">Domain Registration Required</h3>
          <p className="mt-2">
            This website has not been registered as an allowed domain for the Stytch SDK. 
            You need to add this domain to the allowed domains list in the Stytch dashboard.
          </p>
          <div className="mt-4 p-4 bg-amber-100 rounded text-sm font-mono">
            <h4 className="font-bold mb-2">Step-by-Step Instructions:</h4>
            <ol className="list-decimal pl-4 space-y-2">
              <li>Go to <a href="https://stytch.com/dashboard/sdk-configuration" target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">Stytch Dashboard &gt; SDK Configuration</a></li>
              <li>Log in to your Stytch account</li>
              <li>In the "Authorized domains" section, click "Add domain"</li>
              <li>Add the following domain: <strong className="bg-amber-200 px-1">{window.location.origin}</strong></li>
              <li>Also add <strong className="bg-amber-200 px-1">http://localhost:5173</strong> and <strong className="bg-amber-200 px-1">http://localhost:8573</strong> for local development</li>
              <li>Click "Save changes"</li>
              <li>Return to this page and refresh</li>
            </ol>
          </div>
          <div className="mt-4 bg-amber-100/50 p-3 rounded">
            <h4 className="font-medium mb-1">Current Domain Information:</h4>
            <p><strong>Origin:</strong> {window.location.origin}</p>
            <p><strong>Hostname:</strong> {window.location.hostname}</p>
            <p><strong>Port:</strong> {window.location.port || '(default)'}</p>
          </div>
          <div className="mt-4 flex gap-2">
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-amber-600 text-white rounded-md text-sm"
            >
              Refresh Page
            </button>
            <a
              href="https://stytch.com/dashboard/sdk-configuration"
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm"
            >
              Go to Stytch Dashboard
            </a>
          </div>
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="text-center p-6 bg-green-50 rounded-lg">
        <h2 className="text-xl font-medium text-green-800 mb-2">Magic Link Sent!</h2>
        <p className="text-green-700">
          We've sent a magic link to {email}. Please check your email and click the link to log in.
        </p>
      </div>
    );
  }
  
  // Add fallback UI when client isn't ready
  if (!clientReady && !success) {
    return (
      <div className="w-full">
        <div className="p-4 bg-orange-50 text-orange-700 rounded-md mb-4">
          <h3 className="font-medium">Authentication Service Loading</h3>
          <p className="mt-1 text-sm">
            The authentication service is initializing. If this message persists, please check the console for errors or refresh the page.
          </p>
          <button
            onClick={() => window.location.reload()}
            className="mt-3 px-4 py-2 bg-orange-600 text-white rounded-md text-sm"
          >
            Refresh Page
          </button>
        </div>
        
        <div className="space-y-2">
          <label htmlFor="email" className="block text-sm font-medium">
            Email Address
          </label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary opacity-50"
            placeholder="you@example.com"
            disabled
          />
        </div>
        
        <button
          type="button"
          disabled={true}
          className="w-full mt-4 bg-gray-400 text-white py-3 rounded-md font-medium flex items-center justify-center cursor-not-allowed"
        >
          Service Loading...
        </button>
      </div>
    );
  }
  
  return (
    <div className="w-full">
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="bg-destructive/10 text-destructive px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}
        
        <div className="space-y-2">
          <label htmlFor="email" className="block text-sm font-medium">
            Email Address
          </label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
            placeholder="you@example.com"
            required
          />
        </div>
        
        <button
          type="submit"
          disabled={isLoading}
          className="w-full bg-primary text-white py-3 rounded-md font-medium flex items-center justify-center"
        >
          {isLoading ? (
            <>
              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Sending Link...
            </>
          ) : (
            "Send Magic Link"
          )}
        </button>
        
        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-300"></div>
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-white px-2 text-gray-500">Or continue with</span>
          </div>
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <button
            type="button"
            onClick={handleGoogleLogin}
            className="flex items-center justify-center py-3 px-4 border border-gray-300 rounded-md hover:bg-gray-50"
          >
            <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
              <path
                d="M12.545 12.151L12.545 15.255L19.225 15.255C18.8369 17.664 16.729 19.5 12.545 19.5C7.97001 19.5 4.5 16.0425 4.5 12C4.5 7.95751 7.97001 4.5 12.545 4.5C14.9669 4.5 16.6856 5.37501 17.9094 6.53251L20.4825 4.0575C18.63 2.31 15.9356 1.125 12.545 1.125C6.14251 1.125 1.125 6.2175 1.125 12C1.125 17.7825 6.14251 22.875 12.545 22.875C18.7444 22.875 23.25 18.7575 23.25 12.1875C23.25 11.5575 23.175 10.7625 23.0625 10.1325L12.545 10.1325L12.545 12.151Z"
                fill="currentColor"
              />
            </svg>
            Google
          </button>
          <button
            type="button"
            onClick={handleGithubLogin}
            className="flex items-center justify-center py-3 px-4 border border-gray-300 rounded-md hover:bg-gray-50"
          >
            <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
              <path
                d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"
                fill="currentColor"
              />
            </svg>
            GitHub
          </button>
        </div>
      </form>
    </div>
  );
}; 