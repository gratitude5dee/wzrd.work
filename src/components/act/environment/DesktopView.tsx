
import React from 'react';
import { Monitor } from 'lucide-react';

interface DesktopViewProps {
  screenshot?: string;
}

export const DesktopView: React.FC<DesktopViewProps> = ({ screenshot }) => {
  if (screenshot) {
    return (
      <div className="h-full w-full overflow-hidden">
        <img 
          src={`data:image/png;base64,${screenshot}`} 
          alt="Sandbox Screenshot" 
          className="w-full h-full object-contain"
        />
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center h-full text-center p-4">
      <Monitor className="h-16 w-16 text-muted-foreground/50 mb-3" />
      <p className="text-sm text-muted-foreground">No screenshot available</p>
      <p className="text-xs text-muted-foreground mt-1">
        Screenshots will appear here during execution
      </p>
    </div>
  );
};
