
import React, { useState, useEffect } from 'react';
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from '@/components/ui/resizable';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import ActionList from './ActionList';
import SandboxEnvironment from './SandboxEnvironment';
import DigitalAssistant from './DigitalAssistant';
import ActionPreview from './ActionPreview';
import { WorkflowAction } from '@/services/recordingService';
import e2bManager, { ActionStep } from '@/services/e2bService';

const ActInterface: React.FC = () => {
  const [selectedAction, setSelectedAction] = useState<WorkflowAction | null>(null);
  const [isEnvironmentInitialized, setIsEnvironmentInitialized] = useState(false);
  const [isRunning, setIsRunning] = useState(false);
  const { toast } = useToast();

  const initializeEnvironment = async () => {
    try {
      await e2bManager.initialize();
      setIsEnvironmentInitialized(true);
      toast({
        title: "Environment initialized",
        description: "Sandbox environment is ready"
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

  const handleExecute = async () => {
    if (!selectedAction || !isEnvironmentInitialized) return;
    
    setIsRunning(true);
    toast({
      title: "Action started",
      description: `Executing: ${selectedAction.name || 'Selected action'}`
    });
    
    try {
      // Convert action data to steps
      // In a real application, this would come from the action itself
      const mockSteps: ActionStep[] = [
        { type: 'screenshot' },
        { type: 'wait', params: { ms: 1000 } },
        { type: 'click', params: { x: 500, y: 500 } },
        { type: 'wait', params: { ms: 500 } },
        { type: 'type', params: { text: 'Hello, E2B!' } },
        { type: 'wait', params: { ms: 1000 } },
        { type: 'screenshot' }
      ];
      
      await e2bManager.executeAction(mockSteps);
      
      toast({
        title: "Action completed",
        description: "The action has been executed successfully"
      });
    } catch (error) {
      console.error("Failed to execute action:", error);
      toast({
        title: "Execution failed",
        description: error instanceof Error ? error.message : "Failed to execute the action",
        variant: "destructive"
      });
    } finally {
      setIsRunning(false);
    }
  };

  const handlePause = async () => {
    if (!isEnvironmentInitialized || !isRunning) return;
    
    try {
      await e2bManager.pauseExecution();
      toast({
        title: "Action paused",
        description: "You can resume or stop the execution"
      });
    } catch (error) {
      console.error("Failed to pause execution:", error);
      toast({
        title: "Pause failed",
        description: error instanceof Error ? error.message : "Failed to pause the execution",
        variant: "destructive"
      });
    }
  };

  const handleStop = async () => {
    if (!isEnvironmentInitialized || !isRunning) return;
    
    try {
      await e2bManager.stopExecution();
      setIsRunning(false);
      toast({
        title: "Action stopped",
        description: "The execution has been stopped"
      });
    } catch (error) {
      console.error("Failed to stop execution:", error);
      toast({
        title: "Stop failed",
        description: error instanceof Error ? error.message : "Failed to stop the execution",
        variant: "destructive"
      });
    }
  };

  // Clean up resources when component unmounts
  useEffect(() => {
    return () => {
      if (isEnvironmentInitialized) {
        e2bManager.cleanup().catch(console.error);
      }
    };
  }, [isEnvironmentInitialized]);

  return (
    <div className="flex flex-col h-full space-y-4">
      <div className="flex items-center gap-2">
        <h2 className="text-2xl font-semibold">Act Mode</h2>
        <Badge variant="outline" className="text-xs">Beta</Badge>
      </div>
      
      <p className="text-muted-foreground mb-2">
        Execute and automate actions that WZRD has learned from your workflow recordings.
      </p>
      
      <ResizablePanelGroup
        direction="horizontal"
        className="flex-1 border rounded-md overflow-hidden"
      >
        <ResizablePanel defaultSize={25} minSize={20}>
          <ActionList
            onSelectAction={setSelectedAction}
            selectedActionId={selectedAction?.id}
          />
        </ResizablePanel>
        
        <ResizableHandle withHandle />
        
        <ResizablePanel defaultSize={75}>
          <ResizablePanelGroup direction="vertical">
            <ResizablePanel defaultSize={70}>
              <ResizablePanelGroup direction="horizontal">
                <ResizablePanel defaultSize={60}>
                  <SandboxEnvironment
                    isInitialized={isEnvironmentInitialized}
                    onInitialize={initializeEnvironment}
                  />
                </ResizablePanel>
                
                <ResizableHandle withHandle />
                
                <ResizablePanel defaultSize={40}>
                  <DigitalAssistant
                    actionId={selectedAction?.id}
                    onExecuteAction={handleExecute}
                  />
                </ResizablePanel>
              </ResizablePanelGroup>
            </ResizablePanel>
            
            <ResizableHandle withHandle />
            
            <ResizablePanel defaultSize={30}>
              <div className="p-4 h-full">
                <ActionPreview
                  action={selectedAction}
                  isRunning={isRunning}
                  onExecute={handleExecute}
                  onPause={handlePause}
                  onStop={handleStop}
                />
              </div>
            </ResizablePanel>
          </ResizablePanelGroup>
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>
  );
};

export default ActInterface;
