
import React from 'react';
import { Button } from '@/components/ui/button';
import { Upload, RefreshCw } from 'lucide-react';
import { cn } from '@/lib/utils';
import StatusBadge from './StatusBadge';
import { useToast } from '@/hooks/use-toast';

interface EnvironmentToolbarProps {
  isRunning: boolean;
  onRefresh: () => Promise<void>;
  onUpload: () => Promise<void>;
  isRefreshing: boolean;
}

const EnvironmentToolbar: React.FC<EnvironmentToolbarProps> = ({
  isRunning,
  onRefresh,
  onUpload,
  isRefreshing
}) => {
  return (
    <div className="flex justify-between items-center border-t p-2 bg-muted/30">
      <div className="flex items-center gap-1">
        <StatusBadge isRunning={isRunning} />
      </div>
      
      <div className="flex items-center gap-2">
        <Button 
          variant="outline" 
          size="sm" 
          className="h-8 gap-1"
          onClick={onUpload}
        >
          <Upload className="h-3.5 w-3.5" />
          <span className="text-xs">Upload</span>
        </Button>
        
        <Button 
          variant="outline" 
          size="sm" 
          className="h-8 gap-1"
          onClick={onRefresh}
          disabled={isRefreshing}
        >
          <RefreshCw className={cn("h-3.5 w-3.5", isRefreshing && "animate-spin")} />
          <span className="text-xs">Refresh</span>
        </Button>
      </div>
    </div>
  );
};

export default EnvironmentToolbar;
