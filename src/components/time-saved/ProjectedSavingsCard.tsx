
import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { UserAnalyticsData } from '@/hooks/use-action-analytics';
import { Progress } from '@/components/ui/progress';
import { Calculator, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ProjectedSavingsCardProps {
  userData: UserAnalyticsData | null;
}

const ProjectedSavingsCard: React.FC<ProjectedSavingsCardProps> = ({ userData }) => {
  const [timeframe, setTimeframe] = useState<'month' | 'year'>('month');
  const [displayValue, setDisplayValue] = useState<string>('0');
  const cardRef = useRef<HTMLDivElement>(null);
  
  if (!userData) return null;
  
  // Calculate daily average time saved
  const dailyAverage = userData.totalTimeSaved / 
    Math.max(1, userData.executionLogs.reduce((unique, log) => {
      const date = new Date(log.created_at).toDateString();
      return unique.includes(date) ? unique : [...unique, date];
    }, [] as string[]).length);
  
  // Calculate projections based on timeframe
  const projectedDays = timeframe === 'month' ? 30 : 365;
  const projectedTimeSaved = dailyAverage * projectedDays;
  
  // Format time in a human-readable way
  const formatTimeSaved = (seconds: number): string => {
    if (seconds < 60) {
      return `${Math.round(seconds)} seconds`;
    } else if (seconds < 3600) {
      return `${Math.round(seconds / 60)} minutes`;
    } else if (seconds < 86400) {
      return `${Math.round(seconds / 3600 * 10) / 10} hours`;
    } else {
      return `${Math.round(seconds / 86400 * 10) / 10} days`;
    }
  };
  
  // Animated counter effect
  useEffect(() => {
    const formattedValue = formatTimeSaved(projectedTimeSaved);
    
    // If the value is just numbers, animate counting up
    if (/^[\d.]+ /.test(formattedValue)) {
      const numericPart = parseFloat(formattedValue.split(' ')[0]);
      const unit = formattedValue.split(' ')[1];
      
      const frameDuration = 1000 / 60; // 60fps
      const totalFrames = 30; // Complete in half a second
      const increment = numericPart / totalFrames;
      
      let currentValue = 0;
      let frame = 0;
      
      const counter = setInterval(() => {
        frame++;
        currentValue += increment;
        
        if (frame === totalFrames) {
          clearInterval(counter);
          setDisplayValue(formattedValue);
        } else {
          // Format with 1 decimal place if it has a decimal
          const formatted = numericPart >= 10 ? 
            Math.floor(currentValue) : 
            Math.floor(currentValue * 10) / 10;
          setDisplayValue(`${formatted} ${unit}`);
        }
      }, frameDuration);
      
      return () => clearInterval(counter);
    } else {
      setDisplayValue(formattedValue);
    }
  }, [projectedTimeSaved]);
  
  // Calculate progress percentage (capped at 100%)
  const progressPercentage = Math.min(100, (userData.totalTimeSaved / (dailyAverage * 30)) * 100);
  
  // Setup parallax effect
  useEffect(() => {
    if (!cardRef.current) return;
    
    const card = cardRef.current;
    
    const handleMouseMove = (e: MouseEvent) => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      
      // Calculate rotation angles - subtle effect
      const rotateY = ((x / rect.width) - 0.5) * 2;
      const rotateX = ((y / rect.height) - 0.5) * -2;
      
      card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
    };
    
    const handleMouseLeave = () => {
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
    <Card ref={cardRef} className="transform-style-3d transition-all duration-500 overflow-hidden" glass>
      {/* Dark overlay for better text contrast */}
      <div className="absolute inset-0 bg-gradient-to-br from-black/40 to-transparent opacity-70 pointer-events-none rounded-xl"></div>
      
      <CardHeader className="pb-2 parallax-content relative z-10">
        <CardTitle className="flex items-center gap-2 text-white text-shadow">
          <Sparkles className="h-5 w-5 text-orange-light animate-pulse-subtle" />
          <span className="bg-gradient-to-r from-orange-light to-orange-dark bg-clip-text text-transparent text-shadow">
            Projected Savings
          </span>
        </CardTitle>
        <CardDescription className="text-white/80 text-shadow-sm">
          Based on your current usage patterns
        </CardDescription>
      </CardHeader>
      <CardContent className="parallax-content relative z-10">
        <div className="space-y-6">
          <div className="flex justify-center gap-2 mb-4">
            <Button
              variant={timeframe === 'month' ? 'gradient' : 'glass'}
              size="sm"
              onClick={() => setTimeframe('month')}
              className={timeframe === 'month' ? "bg-gradient-orange" : "bg-black/30 text-white"}
            >
              Monthly
            </Button>
            <Button
              variant={timeframe === 'year' ? 'gradient' : 'glass'}
              size="sm"
              onClick={() => setTimeframe('year')}
              className={timeframe === 'year' ? "bg-gradient-orange" : "bg-black/30 text-white"}
            >
              Yearly
            </Button>
          </div>
          
          <div className="flex items-center gap-3 justify-center">
            <Calculator className="h-6 w-6 text-white/80" />
            <div className="text-3xl font-bold text-white text-shadow">
              {displayValue}
            </div>
          </div>
          
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-white/80 text-shadow-sm">Current Progress</span>
              <span className="text-white text-shadow-sm">{Math.round(progressPercentage)}%</span>
            </div>
            <div className="relative h-2 w-full overflow-hidden rounded-full bg-black/30">
              <div 
                className="h-full rounded-full bg-gradient-to-r from-orange-light to-orange-dark transition-all duration-500 ease-out"
                style={{ width: `${progressPercentage}%` }}
              />
            </div>
          </div>
          
          <div className="rounded-md bg-black/30 p-3 text-sm border border-white/20 backdrop-blur-sm">
            <p className="font-medium text-orange-light text-shadow-sm mb-1">Impact Analysis</p>
            <p className="text-white/80 text-shadow-sm">
              At your current rate, you'll save approximately{' '}
              <span className="font-medium text-white">
                {formatTimeSaved(projectedTimeSaved)}
              </span>{' '}
              over the next {timeframe === 'month' ? 'month' : 'year'}.
            </p>
          </div>
          
          {/* Particle decoration */}
          <div className="absolute top-0 right-0 -mt-2 -mr-2 opacity-60">
            <div className="relative w-20 h-20">
              {[...Array(5)].map((_, i) => (
                <div
                  key={i}
                  className="absolute rounded-full bg-orange-light"
                  style={{
                    width: `${2 + Math.random() * 4}px`,
                    height: `${2 + Math.random() * 4}px`,
                    top: `${Math.random() * 100}%`,
                    left: `${Math.random() * 100}%`,
                    opacity: 0.1 + Math.random() * 0.3,
                    animation: `float ${3 + Math.random() * 5}s linear infinite`,
                    animationDelay: `${Math.random() * 5}s`
                  }}
                />
              ))}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ProjectedSavingsCard;
