
import React from 'react';
import { Badge } from '@/components/ui/badge';

interface StatusBadgeProps {
  isRunning: boolean;
}

const StatusBadge: React.FC<StatusBadgeProps> = ({ isRunning }) => {
  return (
    <Badge 
      variant={isRunning ? "default" : "outline"} 
      className={isRunning ? "bg-green-500" : ""}
    >
      {isRunning ? "Running" : "Ready"}
    </Badge>
  );
};

export default StatusBadge;
