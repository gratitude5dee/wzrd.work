
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { RefreshCw, Share, Edit, ArrowRight, Sparkles } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from '@/components/ui/card';

export interface ActionMetrics {
  timeSaved: number; // in seconds
  executionTime: number; // in seconds
  successRate: number; // percentage
  automationLevel: number; // percentage
}

export interface ActionSummary {
  id: string;
  name: string;
  description: string;
  completedSteps: number;
  totalSteps: number;
  metrics?: ActionMetrics;
  relatedActions?: Array<{id: string, name: string}>;
}

interface SuccessDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onRunAgain: () => void;
  onModify: () => void;
  onShare?: () => void;
  summary: ActionSummary;
}

const SuccessDialog: React.FC<SuccessDialogProps> = ({
  isOpen,
  onClose,
  onRunAgain,
  onModify,
  onShare,
  summary
}) => {
  // Format time in minutes and seconds
  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    
    if (minutes === 0) {
      return `${remainingSeconds} seconds`;
    }
    
    return `${minutes} min ${remainingSeconds} sec`;
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <div className="flex items-center justify-center my-4">
            <div className="relative">
              <div className="animate-ping absolute inset-0 rounded-full bg-green-400 opacity-30"></div>
              <div className="relative flex items-center justify-center rounded-full bg-green-500 text-white h-14 w-14">
                <Sparkles className="h-6 w-6" />
              </div>
            </div>
          </div>
          
          <DialogTitle className="text-center text-xl">
            Action Completed Successfully!
          </DialogTitle>
          
          <Badge variant="outline" className="mx-auto mt-1">
            {summary.name}
          </Badge>
        </DialogHeader>
        
        <div className="space-y-4 my-4">
          <p className="text-sm text-center text-muted-foreground">
            {summary.description}
          </p>
          
          <div className="text-sm text-center">
            Completed {summary.completedSteps} of {summary.totalSteps} steps
          </div>
          
          {summary.metrics && (
            <div className="grid grid-cols-2 gap-3 mt-4">
              <Card className="bg-muted/50">
                <CardContent className="p-3 text-center">
                  <div className="text-xs text-muted-foreground">Time Saved</div>
                  <div className="text-xl font-semibold text-primary">
                    {formatTime(summary.metrics.timeSaved)}
                  </div>
                </CardContent>
              </Card>
              
              <Card className="bg-muted/50">
                <CardContent className="p-3 text-center">
                  <div className="text-xs text-muted-foreground">Execution Time</div>
                  <div className="text-xl font-semibold">
                    {formatTime(summary.metrics.executionTime)}
                  </div>
                </CardContent>
              </Card>
              
              <Card className="bg-muted/50">
                <CardContent className="p-3 text-center">
                  <div className="text-xs text-muted-foreground">Success Rate</div>
                  <div className="text-xl font-semibold text-green-500">
                    {summary.metrics.successRate}%
                  </div>
                </CardContent>
              </Card>
              
              <Card className="bg-muted/50">
                <CardContent className="p-3 text-center">
                  <div className="text-xs text-muted-foreground">Automation</div>
                  <div className="text-xl font-semibold text-accent">
                    {summary.metrics.automationLevel}%
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
          
          {summary.relatedActions && summary.relatedActions.length > 0 && (
            <div className="mt-4">
              <h4 className="text-sm font-medium mb-2">Suggested Next Steps</h4>
              <div className="space-y-2">
                {summary.relatedActions.map(action => (
                  <Button 
                    key={action.id}
                    variant="outline" 
                    className="w-full justify-between text-left font-normal"
                    onClick={() => {
                      // Would navigate to that action
                      onClose();
                    }}
                  >
                    <span>{action.name}</span>
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                ))}
              </div>
            </div>
          )}
        </div>
        
        <DialogFooter className="flex-col sm:flex-row gap-2">
          <Button
            variant="outline"
            size="sm"
            className="gap-2 sm:flex-1"
            onClick={onModify}
          >
            <Edit className="h-4 w-4" />
            Modify Action
          </Button>
          
          {onShare && (
            <Button
              variant="outline"
              size="sm"
              className="gap-2 sm:flex-1"
              onClick={onShare}
            >
              <Share className="h-4 w-4" />
              Share Results
            </Button>
          )}
          
          <Button
            variant="default"
            size="sm"
            className="gap-2 sm:flex-1"
            onClick={onRunAgain}
          >
            <RefreshCw className="h-4 w-4" />
            Run Again
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default SuccessDialog;
