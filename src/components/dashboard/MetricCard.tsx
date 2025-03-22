
import React, { useEffect, useState } from 'react';
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
  const [displayValue, setDisplayValue] = useState<string | number>(typeof value === 'number' ? 0 : value);
  const isZeroValue = value === 0 || value === '0';
  
  // Handle counting animation for numbers
  useEffect(() => {
    if (typeof value === 'number') {
      const duration = 1500; // animation duration in ms
      const frameDuration = 1000 / 60; // 60fps
      const totalFrames = Math.round(duration / frameDuration);
      const increment = value / totalFrames;
      
      let currentValue = 0;
      let frame = 0;
      
      const counter = setInterval(() => {
        frame++;
        currentValue += increment;
        
        if (frame === totalFrames) {
          clearInterval(counter);
          setDisplayValue(value);
        } else {
          setDisplayValue(Math.floor(currentValue));
        }
      }, frameDuration);
      
      return () => clearInterval(counter);
    } else {
      setDisplayValue(value);
    }
  }, [value]);

  return (
    <div className={cn(
      "relative overflow-hidden rounded-xl border border-white/20 backdrop-blur-md shadow-xl",
      "transition-all duration-300 hover:shadow-xl hover:scale-[1.02] hover:border-white/30",
      "group before:absolute before:inset-0 before:rounded-xl before:bg-gradient-to-br before:from-white/5 before:to-transparent before:opacity-0 before:transition-opacity hover:before:opacity-100",
      className
    )}
    style={{
      backgroundColor: 'rgba(20, 20, 30, 0.4)',
      boxShadow: '0 10px 30px rgba(0, 0, 0, 0.2)'
    }}>
      {/* Dark overlay for better text contrast */}
      <div className="absolute inset-0 bg-gradient-to-br from-black/20 to-transparent opacity-80 pointer-events-none rounded-xl"></div>
      
      <div className="p-6 relative z-10">
        <div className="flex justify-between">
          <div className="space-y-1.5">
            <h3 className="text-lg font-medium text-white text-shadow-sm">{title}</h3>
            <div className="flex items-baseline gap-1.5">
              <h2 className={cn(
                "text-3xl font-bold tracking-tight text-shadow",
                isZeroValue 
                  ? "text-white/80" 
                  : "bg-gradient-to-br from-white to-white/80 bg-clip-text text-transparent"
              )}>
                {displayValue}
              </h2>
              {trend && (
                <span className={cn(
                  "text-sm font-medium text-shadow-sm",
                  trend.isPositive ? "text-green-400" : "text-red-400",
                  "flex items-center"
                )}>
                  <span className="inline-block transition-transform group-hover:scale-110">
                    {trend.isPositive ? "↑" : "↓"} {Math.abs(trend.value)}%
                  </span>
                </span>
              )}
            </div>
            {description && (
              <p className="text-sm text-white/80 mt-1 max-w-[200px] text-shadow-sm">{description}</p>
            )}
          </div>
          {Icon && (
            <div className="flex items-center justify-center rounded-md p-3 text-white backdrop-blur-sm border border-white/10 transition-all duration-300 group-hover:border-white/20"
            style={{ backgroundColor: 'rgba(255, 121, 64, 0.2)' }}>
              <Icon className="h-5 w-5 transition-transform duration-300 group-hover:scale-110" />
            </div>
          )}
        </div>
        
        {/* Subtle bottom highlight */}
        <div className="absolute inset-x-0 bottom-0 h-1 bg-gradient-to-r from-transparent via-orange-light/50 to-transparent opacity-30 group-hover:opacity-50 transition-opacity" />
      </div>
    </div>
  );
};

export default MetricCard;
