
import React from 'react';
import { cn } from '@/lib/utils';
import { LucideIcon } from 'lucide-react';

interface MetricCardProps {
  title: string;
  value: string | number;
  description?: string;
  icon?: LucideIcon;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  className?: string;
}

const MetricCard = ({
  title,
  value,
  description,
  icon: Icon,
  trend,
  className,
}: MetricCardProps) => {
  return (
    <div className={cn(
      "relative overflow-hidden rounded-lg border bg-card p-6 shadow-sm",
      className
    )}>
      <div className="flex justify-between space-y-2">
        <div>
          <h3 className="text-lg font-medium text-foreground/70">{title}</h3>
          <div className="flex items-baseline gap-1">
            <h2 className="text-3xl font-bold tracking-tight">{value}</h2>
            {trend && (
              <span className={cn(
                "text-sm",
                trend.isPositive ? "text-green-500" : "text-red-500"
              )}>
                {trend.isPositive ? "↑" : "↓"} {Math.abs(trend.value)}%
              </span>
            )}
          </div>
          {description && (
            <p className="text-sm text-muted-foreground mt-1">{description}</p>
          )}
        </div>
        {Icon && (
          <div className="flex items-center justify-center rounded-md bg-primary/10 p-3 text-primary">
            <Icon className="h-5 w-5" />
          </div>
        )}
      </div>
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-primary/50 to-transparent opacity-25" />
    </div>
  );
};

export default MetricCard;
