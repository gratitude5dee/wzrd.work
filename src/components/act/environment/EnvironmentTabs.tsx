
import React from 'react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Monitor, Terminal as TerminalIcon } from 'lucide-react';
import { DesktopView } from './DesktopView';
import { TerminalView } from './TerminalView';
import { ExecutionStatus } from '@/services/e2bService';

interface EnvironmentTabsProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  status: ExecutionStatus;
}

export const EnvironmentTabs: React.FC<EnvironmentTabsProps> = ({
  activeTab,
  setActiveTab,
  status
}) => {
  return (
    <>
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
          <DesktopView screenshot={status.screenshot} />
        </TabsContent>
        
        <TabsContent value="terminal" className="m-0 h-full">
          <TerminalView logs={status.logs} />
        </TabsContent>
        
        {status.running && (
          <div className="absolute bottom-3 right-3">
            <Badge variant="secondary" className="bg-primary text-primary-foreground">
              {status.currentStep}/{status.totalSteps} Steps
            </Badge>
          </div>
        )}
      </div>
    </>
  );
};

import { Badge } from '@/components/ui/badge';
