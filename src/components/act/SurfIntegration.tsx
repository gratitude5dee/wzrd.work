import { useState, useEffect, useRef } from 'react';
import { useToast } from '@/hooks/use-toast';
import { Loader2, RefreshCw, Maximize, X, PlayCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { getExecutionStatus } from '@/services/supabase';

interface SurfIntegrationProps {
  isInitialized?: boolean;
  onInitialize?: () => Promise<void>;
  executionId?: string | null;
}

// This component integrates the surf app into the wzrd.work application
// through an iframe that loads the surf app.
const SurfIntegration: React.FC<SurfIntegrationProps> = ({ 
  isInitialized = false,
  onInitialize,
  executionId = null
}) => {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [executionStatus, setExecutionStatus] = useState<{
    status: string;
    progress?: number; // Changed from required to optional to match getExecutionStatus return type
    output?: string;
    error?: string;
  } | null>(null);
  
  const statusCheckInterval = useRef<number | null>(null);
  const { toast } = useToast();
  
  // URL of the surf app - making sure we're using the right port
  const surfAppUrl = 'http://localhost:3000';
  
  // Handle execution status polling
  useEffect(() => {
    if (executionId) {
      // Start polling for execution status
      const checkStatus = async () => {
        try {
          const status = await getExecutionStatus(executionId);
          setExecutionStatus(status);
          
          // If execution is completed or failed, stop polling
          if (status.status === 'completed' || status.status === 'failed') {
            if (statusCheckInterval.current) {
              window.clearInterval(statusCheckInterval.current);
              statusCheckInterval.current = null;
            }
            
            // Show toast with execution result
            if (status.status === 'completed') {
              toast({
                title: "Execution completed",
                description: "The action has been executed successfully"
              });
            } else if (status.status === 'failed') {
              toast({
                title: "Execution failed",
                description: status.error || "The action execution failed",
                variant: "destructive"
              });
            }
          }
        } catch (error) {
          console.error('Error checking execution status:', error);
        }
      };
      
      // Check immediately and then set interval
      checkStatus();
      statusCheckInterval.current = window.setInterval(checkStatus, 2000);
      
      return () => {
        if (statusCheckInterval.current) {
          window.clearInterval(statusCheckInterval.current);
          statusCheckInterval.current = null;
        }
      };
    }
  }, [executionId, toast]);
  
  const handleIframeLoad = () => {
    setIsLoading(false);
    toast({
      title: "Surf loaded",
      description: "Surf application is ready to use"
    });
  };
  
  const handleIframeError = () => {
    setIsLoading(false);
    setError('Failed to load the Surf application. Please make sure the Surf app is running on http://localhost:3000');
    toast({
      title: "Load failed",
      description: "Could not load the Surf application",
      variant: "destructive"
    });
  };
  
  const refreshIframe = () => {
    setIsLoading(true);
    setError(null);
    const iframe = document.getElementById('surf-iframe') as HTMLIFrameElement;
    if (iframe) {
      iframe.src = iframe.src;
    }
  };
  
  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };
  
  // Initialize Surf environment
  const handleInitialize = async () => {
    if (onInitialize) {
      await onInitialize();
    }
  };
  
  // Listen for messages from the iframe
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      // Only accept messages from the Surf app
      if (event.origin !== new URL(surfAppUrl).origin) return;
      
      // Handle specific message types
      if (event.data && event.data.type) {
        switch (event.data.type) {
          case 'SURF_READY':
            setIsLoading(false);
            break;
          case 'SURF_ERROR':
            setError(event.data.error || 'An error occurred in the Surf application');
            toast({
              title: "Surf error",
              description: event.data.error || 'An error occurred',
              variant: "destructive"
            });
            break;
          // Handle other message types as needed
        }
      }
    };
    
    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [toast]);
  
  // Display initialization prompt if not initialized
  if (!isInitialized) {
    return (
      <div className="flex flex-col items-center justify-center h-full border rounded-md p-8">
        <h3 className="text-lg font-medium mb-4">Initialize Surf Environment</h3>
        <p className="text-muted-foreground mb-6 text-center max-w-md">
          Surf Computer Use Agent needs to be initialized before you can execute actions. 
          This will create a sandboxed environment where actions can be performed safely.
        </p>
        <Button 
          onClick={handleInitialize} 
          className="flex items-center gap-2"
        >
          <PlayCircle className="h-5 w-5" />
          Initialize Environment
        </Button>
      </div>
    );
  }
  
  return (
    <div className={`flex flex-col ${isFullscreen ? 'fixed inset-0 z-50 bg-background' : 'h-full'} border rounded-md overflow-hidden`}>
      <div className="p-2 border-b flex items-center justify-between bg-muted/30">
        <h3 className="text-sm font-medium">Surf - Computer Use Agent</h3>
        
        <div className="flex items-center gap-2">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={refreshIframe}
                  disabled={isLoading}
                >
                  <RefreshCw className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Refresh</TooltipContent>
            </Tooltip>
            
            <Tooltip>
              <TooltipTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={toggleFullscreen}
                >
                  {isFullscreen ? <X className="h-4 w-4" /> : <Maximize className="h-4 w-4" />}
                </Button>
              </TooltipTrigger>
              <TooltipContent>{isFullscreen ? 'Exit fullscreen' : 'Fullscreen'}</TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </div>
      
      {executionStatus && (
        <div className="p-2 border-b bg-accent/10">
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium">
              Execution status: {executionStatus.status}
            </span>
            <span className="text-sm">
              Progress: {executionStatus.progress || 0}%
            </span>
          </div>
          {executionStatus.error && (
            <div className="mt-1 text-sm text-red-500">
              {executionStatus.error}
            </div>
          )}
        </div>
      )}
      
      <div className="relative flex-1 overflow-hidden">
        {isLoading && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-background/80 z-10">
            <Loader2 className="h-8 w-8 animate-spin text-primary mb-2" />
            <p className="text-sm text-muted-foreground">Loading Surf application...</p>
          </div>
        )}
        
        {error ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-background p-4">
            <p className="text-sm text-muted-foreground mb-4 text-center">{error}</p>
            <Button onClick={refreshIframe} variant="outline" size="sm">
              Retry
            </Button>
          </div>
        ) : (
          <iframe
            id="surf-iframe"
            src={surfAppUrl}
            className="w-full h-full border-0"
            onLoad={handleIframeLoad}
            onError={handleIframeError}
            allow="clipboard-read; clipboard-write; microphone; camera"
            title="Surf Application"
          />
        )}
      </div>
    </div>
  );
};

export default SurfIntegration;
