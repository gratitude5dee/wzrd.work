import React, { createContext, useContext, ReactNode, useEffect } from 'react';
import { StytchUIClient } from '@stytch/vanilla-js';

// Create the Stytch client with your public token
const createStytchClient = () => {
  try {
    console.log('Creating Stytch client...');
    console.log('Current hostname:', window.location.hostname);
    
    // Get the correct token for this environment
    // We're using the same token that works in the stytch-auth-demo
    const publicToken = 'public-token-test-1338ae07-6f7b-4f60-a5c6-c050ac7a2161';
    
    // ⚠️ IMPORTANT: This domain needs to be added to the allowed domains in Stytch dashboard
    // Visit: https://stytch.com/dashboard/sdk-configuration
    
    // Client options can improve compatibility
    const clientOptions = {
      cookieOptions: {
        domain: window.location.hostname === 'localhost' ? 'localhost' : window.location.hostname,
      }
    };
    
    const client = new StytchUIClient(
      publicToken,
      clientOptions
    );
    
    console.log('Stytch client created successfully');
    return client;
  } catch (error) {
    console.error('Error creating Stytch client:', error);
    
    // Check for specific domain registration error
    const errorStr = String(error);
    if (errorStr.includes('not been registered as an allowed domain')) {
      console.error('⚠️ DOMAIN REGISTRATION ERROR: You need to add your domain to the allowed domains list');
      console.error('Visit: https://stytch.com/dashboard/sdk-configuration and add:');
      console.error(`- ${window.location.origin}`);
      
      // Log instructions for localhost too
      if (window.location.hostname !== 'localhost') {
        console.error('- http://localhost:5173');
        console.error('- http://localhost:8574');
      }
    }
    
    throw error;
  }
};

const stytchClient = createStytchClient();

// Log important client details 
console.log('Stytch client details:');
console.log('- magicLinks available:', !!stytchClient.magicLinks);
console.log('- email methods available:', !!stytchClient.magicLinks?.email);
console.log('- oauth available:', !!stytchClient.oauth);

// Function to verify the Stytch configuration
const verifyStytchConfig = async () => {
  try {
    // Try to make a simple call to test the client
    console.log('Verifying Stytch configuration...');
    
    // Check if the client has been initialized
    if (stytchClient) {
      console.log('Stytch client methods:', Object.keys(stytchClient));
      console.log('Magic links methods:', Object.keys(stytchClient.magicLinks || {}));
      console.log('OAuth methods:', Object.keys(stytchClient.oauth || {}));
      console.log('Stytch configuration appears valid');
      return true;
    } else {
      console.error('Stytch client is not properly initialized');
      return false;
    }
  } catch (error) {
    console.error('Error verifying Stytch configuration:', error);
    return false;
  }
};

// Verify configuration on load
verifyStytchConfig();

// Create a context type that matches the actual SDK
type StytchContextType = {
  stytch: StytchUIClient;
  isInitialized: boolean; 
  user: any | null;
  loading: boolean;
  signOut: () => Promise<void>;
};

// Create context with default values
const StytchContext = createContext<StytchContextType>({
  stytch: stytchClient,
  isInitialized: false,
  user: null,
  loading: true,
  signOut: async () => {},
});

interface StytchProviderProps {
  children: ReactNode;
}

export const StytchProvider: React.FC<StytchProviderProps> = ({ children }) => {
  const [user, setUser] = React.useState<any | null>(null);
  const [isInitialized, setIsInitialized] = React.useState(false);
  const [loading, setLoading] = React.useState(true);

  // Set up auth state listener on mount
  React.useEffect(() => {
    console.log('Setting up Stytch auth state listener');
    
    const checkAuthStatus = async () => {
      try {
        console.log('Checking Stytch auth status...');
        // Get the current session status
        const session = await stytchClient.session.getSync();
        console.log('Session retrieved:', session ? 'Yes' : 'No');
        setUser(session ? session : null);
        setIsInitialized(true);
        setLoading(false);
      } catch (error) {
        console.error('Error checking auth status:', error);
        setUser(null);
        setIsInitialized(true);
        setLoading(false);
      }
    };

    checkAuthStatus();

    // Listen for auth changes
    const unsubscribe = stytchClient.session.onChange((session) => {
      console.log('Stytch session changed:', session ? 'Logged in' : 'Logged out');
      if (session) {
        setUser(session);
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => {
      if (typeof unsubscribe === 'function') {
        unsubscribe();
      }
    };
  }, []);

  const signOut = async () => {
    try {
      console.log('Attempting to sign out...');
      await stytchClient.session.revoke();
      console.log('Successfully signed out');
      setUser(null);
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  return (
    <StytchContext.Provider value={{ stytch: stytchClient, isInitialized, user, loading, signOut }}>
      {children}
    </StytchContext.Provider>
  );
};

export const useStytch = () => {
  const context = useContext(StytchContext);
  if (context === undefined) {
    throw new Error('useStytch must be used within a StytchProvider');
  }
  return context;
};

// Add a compatibility layer for @stytch/react hooks
// This will allow existing components using useStytchUser to continue working
export const useStytchUser = () => {
  const context = useContext(StytchContext);
  if (context === undefined) {
    throw new Error('useStytchUser must be used within a StytchProvider');
  }
  
  // Return only the user from the context to match @stytch/react's useStytchUser API
  return { user: context.user };
};

export default StytchContext; 