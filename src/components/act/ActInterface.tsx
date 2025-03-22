
import { useState, useEffect } from 'react';
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from '@/components/ui/resizable';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import ActionList from './ActionList';
import SurfIntegration from './SurfIntegration';
import e2bManager from '@/services/e2bService';
import { executeAction } from '@/services/supabase';

const ActInterface = () => {
  const [selectedAction, setSelectedAction] = useState(null);
  const [isEnvironmentInitialized, setIsEnvironmentInitialized] = useState(false);
  const [executionId, setExecutionId] = useState<string | null>(null);
  const [isExecuting, setIsExecuting] = useState(false);
  const { toast } = useToast();

  // Clean up resources when component unmounts
  useEffect(() => {
    return () => {
      if (isEnvironmentInitialized) {
        e2bManager.cleanup().catch(console.error);
      }
    };
  }, [isEnvironmentInitialized]);

  // Initialize environment
  const handleInitializeEnvironment = async () => {
    try {
      setIsEnvironmentInitialized(false);
      await e2bManager.initialize();
      setIsEnvironmentInitialized(true);
      toast({
        title: "Environment initialized",
        description: "The Surf environment is ready to use"
      });
    } catch (error) {
      console.error("Failed to initialize environment:", error);
      toast({
        title: "Initialization failed",
        description: error instanceof Error ? error.message : "Failed to initialize environment",
        variant: "destructive"
      });
    }
  };

  // Execute selected action
  const handleActionExecution = async (action) => {
    if (!action?.id) {
      toast({
        title: "No action selected",
        description: "Please select an action to execute",
        variant: "destructive"
      });
      return;
    }

    setIsExecuting(true);
    
    try {
      // Retrieve user ID from local storage
      const userId = localStorage.getItem('userId') || 'anonymous';
      
      // Execute action via Supabase edge function
      const result = await executeAction(action.id, userId);
      
      if (result.success) {
        setExecutionId(result.executionId);
        toast({
          title: "Action execution started",
          description: "The action is now running in the Surf environment"
        });
      } else {
        toast({
          title: "Execution failed",
          description: result.message,
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error("Failed to execute action:", error);
      toast({
        title: "Execution failed",
        description: error instanceof Error ? error.message : "Failed to execute action",
        variant: "destructive"
      });
    } finally {
      setIsExecuting(false);
    }
  };

  return (
    <div className="flex flex-col h-full space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h2 className="text-2xl font-semibold">Act Mode</h2>
          <Badge className="text-xs">Beta</Badge>
        </div>
        
        {selectedAction && (
          <button
            onClick={() => handleActionExecution(selectedAction)}
            disabled={isExecuting || !isEnvironmentInitialized}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 disabled:opacity-50"
          >
            {isExecuting ? "Executing..." : "Execute Action"}
          </button>
        )}
      </div>
      
      <p className="text-muted-foreground mb-2">
        Execute and automate actions with Surf, an AI agent that interacts with a virtual desktop environment.
      </p>
      
      <ResizablePanelGroup
        direction="horizontal"
        className="flex-1 border rounded-md overflow-hidden"
      >
        <ResizablePanel defaultSize={20} minSize={15}>
          <ActionList
            onSelectAction={setSelectedAction}
            selectedActionId={selectedAction?.id}
          />
        </ResizablePanel>
        
        <ResizableHandle withHandle />
        
        <ResizablePanel defaultSize={80}>
          <SurfIntegration
            isInitialized={isEnvironmentInitialized}
            onInitialize={handleInitializeEnvironment}
            executionId={executionId}
          />
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>
  );
};

export default ActInterface;
