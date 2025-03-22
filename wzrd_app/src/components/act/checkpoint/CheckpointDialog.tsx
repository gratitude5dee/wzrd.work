
import React, { useEffect } from 'react';
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Check, Edit, X, Info, AlertTriangle } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export interface CheckpointOptions {
  title: string;
  description: string;
  severity: 'info' | 'warning' | 'critical';
  screenshotUrl?: string;
  actionName?: string;
}

interface CheckpointDialogProps {
  isOpen: boolean;
  options: CheckpointOptions;
  onProceed: () => void;
  onModify: () => void;
  onCancel: () => void;
  onClose: () => void;
}

const CheckpointDialog: React.FC<CheckpointDialogProps> = ({
  isOpen,
  options,
  onProceed,
  onModify,
  onCancel,
  onClose
}) => {
  // Handle keyboard shortcuts (Esc to cancel, Enter to proceed, M to modify)
  useEffect(() => {
    if (!isOpen) return;
    
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onCancel();
      } else if (e.key === 'Enter') {
        onProceed();
      } else if (e.key === 'm' || e.key === 'M') {
        onModify();
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onProceed, onModify, onCancel]);

  const getSeverityIcon = () => {
    switch (options.severity) {
      case 'warning':
        return <AlertTriangle className="h-5 w-5 text-warning" />;
      case 'critical':
        return <AlertTriangle className="h-5 w-5 text-destructive" />;
      case 'info':
      default:
        return <Info className="h-5 w-5 text-primary" />;
    }
  };

  const getSeverityClass = () => {
    switch (options.severity) {
      case 'warning':
        return 'bg-warning/10 text-warning';
      case 'critical':
        return 'bg-destructive/10 text-destructive';
      case 'info':
      default:
        return 'bg-primary/10 text-primary';
    }
  };

  return (
    <AlertDialog open={isOpen} onOpenChange={onClose}>
      <AlertDialogContent className="max-w-xl">
        <AlertDialogHeader>
          <div className="flex items-center gap-2">
            {getSeverityIcon()}
            <AlertDialogTitle>{options.title}</AlertDialogTitle>
          </div>
          {options.actionName && (
            <Badge variant="outline" className="ml-7 mt-1">
              {options.actionName}
            </Badge>
          )}
        </AlertDialogHeader>
        
        <AlertDialogDescription className="space-y-4">
          <div className="text-sm">{options.description}</div>
          
          {options.screenshotUrl && (
            <div className="mt-2 rounded-md overflow-hidden border">
              <img 
                src={options.screenshotUrl}
                alt="Action preview"
                className="w-full object-contain max-h-60"
              />
            </div>
          )}
          
          <div className={`p-3 rounded-md text-sm mt-2 ${getSeverityClass()}`}>
            <div className="font-semibold mb-1">Keyboard shortcuts:</div>
            <div className="grid grid-cols-2 gap-x-4 gap-y-1">
              <span>Enter</span><span>Proceed as planned</span>
              <span>M</span><span>Modify next steps</span>
              <span>Esc</span><span>Cancel action</span>
            </div>
          </div>
        </AlertDialogDescription>
        
        <AlertDialogFooter className="gap-2 sm:gap-0">
          <AlertDialogCancel asChild>
            <Button variant="outline" size="sm" onClick={onCancel} className="gap-2">
              <X className="h-4 w-4" />
              Cancel
            </Button>
          </AlertDialogCancel>
          
          <Button variant="outline" size="sm" onClick={onModify} className="gap-2">
            <Edit className="h-4 w-4" />
            Modify
          </Button>
          
          <AlertDialogAction asChild>
            <Button variant="default" size="sm" onClick={onProceed} className="gap-2">
              <Check className="h-4 w-4" />
              Proceed
            </Button>
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default CheckpointDialog;
