
import React, { useEffect, useRef, useState } from 'react';
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
  const cardRef = useRef<HTMLDivElement>(null);
  const isZeroValue = value === 0 || value === '0';
  
  // Handle counting animation
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
  
  // Handle parallax effect
  useEffect(() => {
    if (!cardRef.current) return;
    
    const card = cardRef.current;
    
    const handleMouseMove = (e: MouseEvent) => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left; // x position within the element
      const y = e.clientY - rect.top; // y position within the element
      
      // Calculate rotation values (limited to subtle 3deg rotations)
      const rotateY = ((x / rect.width) - 0.5) * 3; // -1.5 to 1.5 degrees
      const rotateX = ((y / rect.height) - 0.5) * -3; // -1.5 to 1.5 degrees
      
      // Apply the transformation
      card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
    };
    
    const handleMouseLeave = () => {
      // Reset the transformation when mouse leaves
      card.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg)';
    };
    
    card.addEventListener('mousemove', handleMouseMove);
    card.addEventListener('mouseleave', handleMouseLeave);
    
    return () => {
      card.removeEventListener('mousemove', handleMouseMove);
      card.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, []);
  
  return (
    <div 
      ref={cardRef}
      className={cn(
        // Glass morphism base styles
        "relative overflow-hidden rounded-xl border border-white/20 bg-white/15 backdrop-blur-md",
        "transition-all duration-300 ease-out transform-gpu",
        // Hover effects
        "hover:bg-white/20 hover:border-white/30 hover:shadow-lg group",
        // Inner glow for zero values
        isZeroValue ? "before:absolute before:inset-0 before:bg-gradient-to-br before:from-white/5 before:via-white/10 before:to-transparent before:animate-pulse-subtle" : "",
        className
      )}
      style={{
        boxShadow: "0 10px 30px -5px rgba(0, 0, 0, 0.1), 0 1px 3px rgba(0, 0, 0, 0.05)",
      }}
    >
      {/* Gradient border overlay */}
      <div className="absolute inset-0 pointer-events-none border border-gradient-t-white/30 border-gradient-b-transparent rounded-xl opacity-0 group-hover:opacity-100 transition-opacity" />
      
      <div className="p-6 relative z-10">
        <div className="flex justify-between space-y-2">
          <div className="transform group-hover:translate-z-5 transition-transform duration-300">
            <h3 className="text-lg font-medium text-white/80 group-hover:text-white transition-colors duration-300">{title}</h3>
            <div className="flex items-baseline gap-1">
              <h2 className={cn(
                "text-3xl font-bold tracking-tight",
                isZeroValue 
                  ? "text-white/70 group-hover:bg-gradient-to-br group-hover:from-[#FF7940] group-hover:to-[#FF5B14] group-hover:bg-clip-text group-hover:text-transparent" 
                  : "bg-gradient-to-br from-white to-white/80 bg-clip-text text-transparent"
              )}>
                {displayValue}
              </h2>
              {trend && (
                <span className={cn(
                  "text-sm font-medium",
                  trend.isPositive ? "text-green-400" : "text-red-400",
                  "transition-all duration-300 group-hover:scale-110"
                )}>
                  {trend.isPositive ? "↑" : "↓"} {Math.abs(trend.value)}%
                </span>
              )}
            </div>
            {description && (
              <p className="text-sm text-white/60 group-hover:text-white/80 mt-1 transition-colors duration-300">{description}</p>
            )}
          </div>
          {Icon && (
            <div className="flex items-center justify-center rounded-md bg-white/10 p-3 text-white backdrop-blur-sm border border-white/10 shadow-inner transition-all duration-300 group-hover:bg-gradient-to-br group-hover:from-[#FF7940]/20 group-hover:to-[#FF5B14]/20 group-hover:scale-110">
              <Icon className="h-5 w-5 transition-transform duration-300" />
            </div>
          )}
        </div>
        <div className="absolute inset-x-0 bottom-0 h-1 bg-gradient-to-r from-transparent via-white/30 to-transparent opacity-25 group-hover:opacity-40 group-hover:via-[#FF7940]/50 transition-all duration-500" />
      </div>
    </div>
  );
};

export default MetricCard;
