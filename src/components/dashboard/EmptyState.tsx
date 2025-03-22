
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
      "flex flex-col items-center justify-center rounded-xl glass-card p-8 text-center",
      "transition-all duration-500 hover:shadow-xl hover-float",
      className
    )}>
      {Icon && (
        <div className="mb-4 rounded-full bg-white/10 backdrop-blur-md p-4 animate-float border border-white/20 shadow-inner">
          <Icon className="h-10 w-10 text-white" />
        </div>
      )}
      <h3 className="mb-2 text-xl font-medium bg-gradient-to-br from-white to-white/80 bg-clip-text text-transparent">
        {title}
      </h3>
      <p className="mb-6 max-w-md text-white/70">
        {description.split('').map((char, i) => (
          <span 
            key={i} 
            className="inline-block opacity-0 animate-fadeIn" 
            style={{ 
              animationDelay: `${i * 15}ms`,
              animationDuration: '300ms',
              animationFillMode: 'forwards'
            }}
          >
            {char}
          </span>
        ))}
      </p>
      {action && (
        <Button 
          onClick={action.onClick}
          variant="gradient"
          className="relative overflow-hidden animate-breathe"
        >
          {action.label}
          <div className="absolute -inset-px opacity-0 hover:opacity-100 rounded-md transition-opacity duration-300">
            <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent animate-shimmer"></div>
          </div>
        </Button>
      )}
      
      {/* Particle effects */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-xl">
        {[...Array(6)].map((_, i) => (
          <div 
            key={i}
            className="absolute w-1 h-1 rounded-full bg-white/40"
            style={{
              top: `${20 + Math.random() * 60}%`,
              left: `${20 + Math.random() * 60}%`,
              opacity: 0.3 + Math.random() * 0.5,
              animation: `float ${3 + Math.random() * 4}s ease-in-out infinite`,
              animationDelay: `${Math.random() * 5}s`
            }}
          />
        ))}
      </div>
    </div>
  );
};

export default EmptyState;
