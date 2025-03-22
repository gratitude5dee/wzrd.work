
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { UserAnalyticsData, UsagePatternData } from '@/hooks/use-action-analytics';
import { Clock, TrendingUp, BarChart2, Zap } from 'lucide-react';
import MetricCard from '@/components/dashboard/MetricCard';
import OverviewChart from '@/components/time-saved/OverviewChart';
import ProjectedSavingsCard from '@/components/time-saved/ProjectedSavingsCard';

interface TimeOverviewPanelProps {
  userData: UserAnalyticsData | null;
  usagePatterns: UsagePatternData | null;
  timeframe: 'day' | 'week' | 'month';
  onTimeframeChange: (timeframe: 'day' | 'week' | 'month') => void;
}

const TimeOverviewPanel: React.FC<TimeOverviewPanelProps> = ({
  userData,
  usagePatterns,
  timeframe,
  onTimeframeChange
}) => {
  if (!userData) return null;

  // Format time saved in a human-readable format
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

  // Calculate weekly trend for time saved
  const calculateTrend = (): { value: number; isPositive: boolean } => {
    if (!usagePatterns || !usagePatterns.executionTimes.length) {
      return { value: 0, isPositive: true };
    }
    
    const recentValues = usagePatterns.executionTimes.slice(-7);
    if (recentValues.length < 2) return { value: 0, isPositive: true };
    
    const oldAvg = recentValues.slice(0, Math.ceil(recentValues.length / 2)).reduce((sum, item) => sum + item.value, 0) / 
                   Math.ceil(recentValues.length / 2);
    const newAvg = recentValues.slice(Math.ceil(recentValues.length / 2)).reduce((sum, item) => sum + item.value, 0) / 
                   Math.floor(recentValues.length / 2);
    
    const percentChange = oldAvg === 0 ? 0 : Math.round((newAvg - oldAvg) / oldAvg * 100);
    return { value: Math.abs(percentChange), isPositive: percentChange >= 0 };
  };

  const trend = calculateTrend();

  return (
    <div className="space-y-6">
      <div className="flex justify-end space-x-2">
        <Button 
          variant={timeframe === 'day' ? 'default' : 'outline'} 
          size="sm" 
          onClick={() => onTimeframeChange('day')}
        >
          Day
        </Button>
        <Button 
          variant={timeframe === 'week' ? 'default' : 'outline'} 
          size="sm" 
          onClick={() => onTimeframeChange('week')}
        >
          Week
        </Button>
        <Button 
          variant={timeframe === 'month' ? 'default' : 'outline'} 
          size="sm" 
          onClick={() => onTimeframeChange('month')}
        >
          Month
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          title="Total Time Saved"
          value={formatTimeSaved(userData.totalTimeSaved)}
          icon={Clock}
          trend={trend}
          description="Cumulative time saved through automation"
        />
        <MetricCard
          title="Success Rate"
          value={`${Math.round(userData.overallSuccessRate)}%`}
          icon={TrendingUp}
          trend={{ value: 5, isPositive: true }}
          description="Average success rate across all actions"
        />
        <MetricCard
          title="Total Executions"
          value={userData.totalExecutions}
          icon={BarChart2}
          description="Number of automated tasks executed"
        />
        <MetricCard
          title="Avg. Time Saved/Task"
          value={userData.totalExecutions > 0 ? formatTimeSaved(userData.totalTimeSaved / userData.totalExecutions) : '0'}
          icon={Zap}
          description="Average time saved per task execution"
        />
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Time Savings Trend</CardTitle>
            <CardDescription>
              View your time savings trend over the selected period
            </CardDescription>
          </CardHeader>
          <CardContent className="h-[300px]">
            <OverviewChart usagePatterns={usagePatterns} />
          </CardContent>
        </Card>
        
        <ProjectedSavingsCard userData={userData} />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Before & After Comparison</CardTitle>
          <CardDescription>
            See the difference automation has made to your workflows
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-6">
            <div className="flex flex-col space-y-2 p-4 rounded-lg bg-muted/50 border">
              <h3 className="text-lg font-medium">Before Automation</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span>Manual task time:</span>
                  <span>{formatTimeSaved(userData.totalTimeSaved * 1.5)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Error rate:</span>
                  <span>25%</span>
                </div>
                <div className="flex justify-between">
                  <span>Context switching:</span>
                  <span>High</span>
                </div>
                <div className="flex justify-between">
                  <span>User satisfaction:</span>
                  <span>Medium</span>
                </div>
              </div>
            </div>
            
            <div className="flex flex-col space-y-2 p-4 rounded-lg bg-primary/10 border border-primary/20">
              <h3 className="text-lg font-medium text-primary">After Automation</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span>Automated task time:</span>
                  <span className="font-medium">{formatTimeSaved(userData.totalTimeSaved * 0.5)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Error rate:</span>
                  <span className="font-medium">{Math.round(100 - userData.overallSuccessRate)}%</span>
                </div>
                <div className="flex justify-between">
                  <span>Context switching:</span>
                  <span className="font-medium">Low</span>
                </div>
                <div className="flex justify-between">
                  <span>User satisfaction:</span>
                  <span className="font-medium">High</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default TimeOverviewPanel;
