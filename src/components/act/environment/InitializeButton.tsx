
import React from 'react';
import { Button } from '@/components/ui/button';
import { RefreshCw } from 'lucide-react';

interface InitializeButtonProps {
  onInitialize: () => Promise<void>;
}

const InitializeButton: React.FC<InitializeButtonProps> = ({ onInitialize }) => {
  return (
    <div className="flex flex-col items-center justify-center h-full">
      <Button onClick={onInitialize} className="gap-2">
        <RefreshCw className="h-4 w-4" />
        Initialize Sandbox
      </Button>
    </div>
  );
};

export default InitializeButton;
