
import React, { useEffect, useState } from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Monitor, Terminal as TerminalIcon, Upload, Download, RefreshCw } from 'lucide-react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import e2bManager, { ExecutionStatus } from '@/services/e2bService';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils'; // Added the missing import for cn

interface SandboxEnvironmentProps {
  isInitialized: boolean;
  onInitialize: () => Promise<void>;
}

const SandboxEnvironment: React.FC<SandboxEnvironmentProps> = ({
  isInitialized,
  onInitialize
}) => {
  const [activeTab, setActiveTab] = useState<string>('desktop');
  const [status, setStatus] = useState<ExecutionStatus>({
    running: false,
    currentStep: 0,
    totalSteps: 0,
    logs: []
  });
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Subscribe to status updates
  useEffect(() => {
    if (!isInitialized) return;

    const unsubscribe = e2bManager.onStatusChange(newStatus => {
      setStatus(newStatus);
    });

    return () => {
      unsubscribe();
    };
  }, [isInitialized]);

  const handleRefresh = async () => {
    if (!isInitialized) return;
    
    setIsRefreshing(true);
    try {
      await e2bManager.cleanup();
      await onInitialize();
      toast({
        title: "Environment refreshed",
        description: "The sandbox environment has been refreshed"
      });
    } catch (error) {
      console.error("Failed to refresh environment:", error);
      toast({
        title: "Refresh failed",
        description: error instanceof Error ? error.message : "Failed to refresh environment",
        variant: "destructive"
      });
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleFileUpload = async () => {
    if (!isInitialized) return;
    
    const input = document.createElement('input');
    input.type = 'file';
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;
      
      try {
        const filePath = await e2bManager.uploadFile(file);
        toast({
          title: "File uploaded",
          description: `${file.name} was uploaded to ${filePath}`
        });
      } catch (error) {
        console.error("Failed to upload file:", error);
        toast({
          title: "Upload failed",
          description: error instanceof Error ? error.message : "Failed to upload file",
          variant: "destructive"
        });
      }
    };
    input.click();
  };

  if (!isInitialized) {
    return (
      <div className="flex flex-col items-center justify-center h-full">
        <Button onClick={() => onInitialize()} className="gap-2">
          <RefreshCw className="h-4 w-4" />
          Initialize Sandbox
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full border rounded-md overflow-hidden">
      <div className="flex justify-between items-center border-b p-2 bg-muted/30">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="desktop" className="text-xs gap-1">
              <Monitor className="h-3.5 w-3.5" />
              <span>Desktop</span>
            </TabsTrigger>
            <TabsTrigger value="terminal" className="text-xs gap-1">
              <TerminalIcon className="h-3.5 w-3.5" />
              <span>Terminal</span>
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>
      
      <div className="flex-1 relative">
        <TabsContent value="desktop" className="m-0 h-full">
          {status.screenshot ? (
            <div className="h-full w-full overflow-hidden">
              <img 
                src={`data:image/png;base64,${status.screenshot}`} 
                alt="Sandbox Screenshot" 
                className="w-full h-full object-contain"
              />
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-center p-4">
              <Monitor className="h-16 w-16 text-muted-foreground/50 mb-3" />
              <p className="text-sm text-muted-foreground">No screenshot available</p>
              <p className="text-xs text-muted-foreground mt-1">
                Screenshots will appear here during execution
              </p>
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="terminal" className="m-0 h-full">
          <ScrollArea className="h-full bg-black text-white font-mono p-3 text-sm">
            {status.logs.length > 0 ? (
              status.logs.map((log, index) => (
                <div key={index} className="mb-1 break-all">
                  {log}
                </div>
              ))
            ) : (
              <p className="text-muted-foreground/70">Terminal output will appear here</p>
            )}
          </ScrollArea>
        </TabsContent>
        
        {status.running && (
          <div className="absolute bottom-3 right-3">
            <Badge variant="secondary" className="bg-primary text-primary-foreground">
              {status.currentStep}/{status.totalSteps} Steps
            </Badge>
          </div>
        )}
      </div>
      
      <div className="flex justify-between items-center border-t p-2 bg-muted/30">
        <div className="flex items-center gap-1">
          <Badge 
            variant={status.running ? "default" : "outline"} 
            className={status.running ? "bg-green-500" : ""}
          >
            {status.running ? "Running" : "Ready"}
          </Badge>
        </div>
        
        <div className="flex items-center gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            className="h-8 gap-1"
            onClick={handleFileUpload}
          >
            <Upload className="h-3.5 w-3.5" />
            <span className="text-xs">Upload</span>
          </Button>
          
          <Button 
            variant="outline" 
            size="sm" 
            className="h-8 gap-1"
            onClick={handleRefresh}
            disabled={isRefreshing}
          >
            <RefreshCw className={cn("h-3.5 w-3.5", isRefreshing && "animate-spin")} />
            <span className="text-xs">Refresh</span>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default SandboxEnvironment;
