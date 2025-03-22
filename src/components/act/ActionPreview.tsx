
import React from 'react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { PlayCircle, PauseCircle, StopCircle, InfoIcon, Tag, Cpu } from 'lucide-react';
import { WorkflowAction } from '@/services/recordingService';
import { cn } from '@/lib/utils';

interface ActionPreviewProps {
  action: WorkflowAction | null;
  isRunning: boolean;
  onExecute: () => void;
  onPause: () => void;
  onStop: () => void;
}

const ActionPreview: React.FC<ActionPreviewProps> = ({
  action,
  isRunning,
  onExecute,
  onPause,
  onStop
}) => {
  if (!action) {
    return (
      <Card className="border-dashed">
        <CardContent className="p-6 flex flex-col items-center justify-center text-center min-h-[200px]">
          <Cpu className="h-10 w-10 text-muted-foreground/50 mb-3" />
          <h3 className="font-medium text-muted-foreground">No Action Selected</h3>
          <p className="text-sm text-muted-foreground mt-1">
            Select an action from the list to preview and execute
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex justify-between items-start">
          <CardTitle className="text-xl">
            {action.name || `Action ${action.id.slice(0, 8)}`}
          </CardTitle>
          <Badge 
            className={cn(
              "rounded-full px-2",
              isRunning ? "bg-green-600" : ""
            )}
          >
            {isRunning ? "Running" : "Ready"}
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent className="pb-0">
        <div className="space-y-4">
          <div>
            <h4 className="text-sm font-medium flex items-center gap-1 mb-1">
              <InfoIcon className="h-3.5 w-3.5 text-muted-foreground" />
              Description
            </h4>
            <p className="text-sm text-muted-foreground">
              {action.description || "No description available for this action."}
            </p>
          </div>
          
          {action.instructions && (
            <div>
              <h4 className="text-sm font-medium mb-1">Instructions</h4>
              <div className="text-sm text-muted-foreground bg-muted p-3 rounded-md">
                {action.instructions}
              </div>
            </div>
          )}
          
          {action.tags && action.tags.length > 0 && (
            <div>
              <h4 className="text-sm font-medium flex items-center gap-1 mb-1">
                <Tag className="h-3.5 w-3.5 text-muted-foreground" />
                Tags
              </h4>
              <div className="flex flex-wrap gap-1">
                {action.tags.map(tag => (
                  <Badge key={tag} variant="secondary" className="text-xs">
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </div>
      </CardContent>
      
      <CardFooter className="flex justify-between pt-4 mt-4 border-t">
        <Button 
          variant="outline" 
          size="sm" 
          onClick={onStop}
          disabled={!isRunning}
          className="gap-1"
        >
          <StopCircle className="h-4 w-4" />
          Stop
        </Button>
        
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={onPause}
            disabled={!isRunning}
            className="gap-1"
          >
            <PauseCircle className="h-4 w-4" />
            Pause
          </Button>
          
          <Button 
            size="sm" 
            onClick={onExecute}
            disabled={isRunning}
            className="gap-1"
          >
            <PlayCircle className="h-4 w-4" />
            Execute
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
};

export default ActionPreview;
