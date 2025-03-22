
import React, { useEffect, useState } from 'react';
import e2bManager, { ExecutionStatus } from '@/services/e2bService';
import { toast } from '@/hooks/use-toast';
import { EnvironmentTabs } from './environment/EnvironmentTabs';
import EnvironmentToolbar from './environment/EnvironmentToolbar';
import InitializeButton from './environment/InitializeButton';

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
    return <InitializeButton onInitialize={onInitialize} />;
  }

  return (
    <div className="flex flex-col h-full border rounded-md overflow-hidden">
      <EnvironmentTabs 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        status={status} 
      />
      
      <EnvironmentToolbar 
        isRunning={status.running}
        onRefresh={handleRefresh}
        onUpload={handleFileUpload}
        isRefreshing={isRefreshing}
      />
    </div>
  );
};

export default SandboxEnvironment;
