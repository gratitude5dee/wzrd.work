import { useState, useEffect } from 'react';
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from '@/components/ui/resizable';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import ActionList from './ActionList';
import SurfIntegration from './SurfIntegration';
import e2bManager from '@/services/e2bService';

const ActInterface = () => {
  const [selectedAction, setSelectedAction] = useState(null);
  const [isEnvironmentInitialized, setIsEnvironmentInitialized] = useState(false);
  const { toast } = useToast();

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
        <Badge className="text-xs">Beta</Badge>
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
          <SurfIntegration />
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>
  );
};

export default ActInterface;
