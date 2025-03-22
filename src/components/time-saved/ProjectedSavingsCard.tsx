
import React, { useState } from 'react';
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
  
  // Calculate progress percentage (capped at 100%)
  const progressPercentage = Math.min(100, (userData.totalTimeSaved / (dailyAverage * 30)) * 100);
  
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-primary" />
          <span>Projected Savings</span>
        </CardTitle>
        <CardDescription>
          Based on your current usage patterns
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          <div className="flex justify-center gap-2 mb-4">
            <Button
              variant={timeframe === 'month' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setTimeframe('month')}
            >
              Monthly
            </Button>
            <Button
              variant={timeframe === 'year' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setTimeframe('year')}
            >
              Yearly
            </Button>
          </div>
          
          <div className="flex items-center gap-2">
            <Calculator className="h-5 w-5 text-muted-foreground" />
            <div className="text-2xl font-bold">{formatTimeSaved(projectedTimeSaved)}</div>
          </div>
          
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Current Progress</span>
              <span>{Math.round(progressPercentage)}%</span>
            </div>
            <Progress value={progressPercentage} className="h-2" />
          </div>
          
          <div className="rounded-md bg-primary/10 p-3 text-sm">
            <p className="font-medium text-primary mb-1">Impact Analysis</p>
            <p className="text-muted-foreground">
              At your current rate, you'll save approximately{' '}
              <span className="font-medium text-foreground">
                {formatTimeSaved(projectedTimeSaved)}
              </span>{' '}
              over the next {timeframe === 'month' ? 'month' : 'year'}.
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ProjectedSavingsCard;
