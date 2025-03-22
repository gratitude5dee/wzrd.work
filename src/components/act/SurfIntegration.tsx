import { useState, useEffect } from 'react';
import { toast } from '@/hooks/use-toast';
import { Loader2, RefreshCw, Maximize, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

// This component integrates the surf app into the wzrd.work application
// through an iframe that loads the surf app.
const SurfIntegration = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  
  // URL of the surf app - making sure we're using the right port
  const surfAppUrl = 'http://localhost:3000';
  
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
  }, []);
  
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