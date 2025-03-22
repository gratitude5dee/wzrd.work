
import React, { useState, useEffect } from 'react';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import TimeOverviewPanel from '@/components/time-saved/TimeOverviewPanel';
import TimeJourneyPanel from '@/components/time-saved/TimeJourneyPanel';
import CategoryBreakdownPanel from '@/components/time-saved/CategoryBreakdownPanel';
import AchievementsPanel from '@/components/time-saved/AchievementsPanel';
import useActionAnalytics from '@/hooks/use-action-analytics';
import { Loader2 } from 'lucide-react';

const TimeSavedPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<string>('overview');
  const { userData, usagePatterns, loading: isLoading } = useActionAnalytics("current-user-id");
  const [timeframe, setTimeframe] = useState<'day' | 'week' | 'month'>('week');

  const handleTimeframeChange = (newTimeframe: 'day' | 'week' | 'month') => {
    setTimeframe(newTimeframe);
  };

  return (
    <DashboardLayout>
      <div className="flex flex-col space-y-6">
        <div className="flex flex-col space-y-2">
          <h1 className="text-3xl font-bold tracking-tight gradient-text">Time Saved</h1>
          <p className="text-muted-foreground">
            Quantify and celebrate your productivity improvements gained through WZRD.WORK.
          </p>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center h-[400px]">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : (
          <Tabs defaultValue="overview" value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-4 glass-card">
              <TabsTrigger value="overview">Metrics Dashboard</TabsTrigger>
              <TabsTrigger value="journey">Optimization Journey</TabsTrigger>
              <TabsTrigger value="categories">Task Categories</TabsTrigger>
              <TabsTrigger value="achievements">Achievements</TabsTrigger>
            </TabsList>
            
            <TabsContent value="overview">
              <TimeOverviewPanel 
                userData={userData} 
                usagePatterns={usagePatterns}
                timeframe={timeframe}
                onTimeframeChange={handleTimeframeChange}
              />
            </TabsContent>
            
            <TabsContent value="journey">
              <TimeJourneyPanel 
                userData={userData} 
                usagePatterns={usagePatterns}
                timeframe={timeframe}
                onTimeframeChange={handleTimeframeChange}
              />
            </TabsContent>
            
            <TabsContent value="categories">
              <CategoryBreakdownPanel userData={userData} />
            </TabsContent>
            
            <TabsContent value="achievements">
              <AchievementsPanel userData={userData} />
            </TabsContent>
          </Tabs>
        )}
      </div>
    </DashboardLayout>
  );
};

export default TimeSavedPage;
