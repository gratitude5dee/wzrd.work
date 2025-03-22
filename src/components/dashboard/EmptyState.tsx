
import React from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { LucideIcon } from 'lucide-react';

interface EmptyStateProps {
  title: string;
  description: string;
  icon?: LucideIcon;
  action?: {
    label: string;
    onClick: () => void;
  };
  className?: string;
}

const EmptyState = ({
  title,
  description,
  icon: Icon,
  action,
  className,
}: EmptyStateProps) => {
  return (
    <div className={cn(
      "flex flex-col items-center justify-center rounded-lg border border-dashed border-gray-300 bg-white/50 p-8 text-center dark:border-gray-700 dark:bg-black/10",
      className
    )}>
      {Icon && (
        <div className="mb-4 rounded-full bg-primary/10 p-3">
          <Icon className="h-10 w-10 text-primary" />
        </div>
      )}
      <h3 className="mb-2 text-xl font-medium">{title}</h3>
      <p className="mb-6 max-w-md text-muted-foreground">{description}</p>
      {action && (
        <Button onClick={action.onClick}>
          {action.label}
        </Button>
      )}
    </div>
  );
};

export default EmptyState;
