
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
      "flex flex-col items-center justify-center rounded-xl p-8 text-center backdrop-blur-md border border-white/20 shadow-xl",
      "transition-all duration-300 hover:shadow-2xl hover-float",
      className
    )}
    style={{
      backgroundColor: 'rgba(20, 20, 30, 0.5)',
    }}>
      {/* Dark overlay for better text contrast */}
      <div className="absolute inset-0 bg-gradient-to-br from-black/30 to-transparent opacity-70 pointer-events-none rounded-xl"></div>
      
      {Icon && (
        <div className="mb-4 rounded-full p-4 animate-pulse-subtle border border-white/20 backdrop-blur-sm relative z-10"
        style={{ backgroundColor: 'rgba(255, 121, 64, 0.2)' }}>
          <Icon className="h-10 w-10 text-white text-shadow" />
        </div>
      )}
      <h3 className="mb-2 text-xl font-medium text-white text-shadow relative z-10">{title}</h3>
      <p className="mb-6 max-w-md text-white/90 text-shadow-sm relative z-10">
        {description.split('').map((char, i) => (
          <span key={i} style={{ animationDelay: `${i * 20}ms` }} className="inline-block animate-fadeIn">
            {char}
          </span>
        ))}
      </p>
      {action && (
        <Button 
          onClick={action.onClick}
          className="relative overflow-hidden animate-breathe z-10"
          style={{
            background: 'linear-gradient(135deg, #FF7940 0%, #FF5B14 100%)',
            boxShadow: '0 8px 20px rgba(0, 0, 0, 0.2)',
            border: '1px solid rgba(255, 255, 255, 0.2)'
          }}
        >
          {action.label}
          <div className="absolute -inset-px opacity-0 hover:opacity-100 rounded-md transition-opacity duration-300">
            <div className="absolute inset-0 bg-gradient-to-r from-white/30 to-transparent animate-shimmer"></div>
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
