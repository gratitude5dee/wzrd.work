
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { UserAnalyticsData, UsagePatternData } from '@/hooks/use-action-analytics';
import { Milestone, Award, Clock, TrendingUp, ChevronRight } from 'lucide-react';
import { Progress } from '@/components/ui/progress';

interface TimeJourneyPanelProps {
  userData: UserAnalyticsData | null;
  usagePatterns: UsagePatternData | null;
  timeframe: 'day' | 'week' | 'month';
  onTimeframeChange: (timeframe: 'day' | 'week' | 'month') => void;
}

const TimeJourneyPanel: React.FC<TimeJourneyPanelProps> = ({
  userData,
  usagePatterns,
  timeframe,
  onTimeframeChange
}) => {
  if (!userData) return null;

  // Define milestones (in seconds)
  const milestones = [
    { threshold: 60, label: '1 minute saved', icon: Clock },
    { threshold: 300, label: '5 minutes saved', icon: Clock },
    { threshold: 1800, label: '30 minutes saved', icon: Clock },
    { threshold: 3600, label: '1 hour saved', icon: Clock },
    { threshold: 18000, label: '5 hours saved', icon: Clock },
    { threshold: 86400, label: '1 day saved', icon: Clock },
    { threshold: 432000, label: '5 days saved', icon: Clock },
    { threshold: 864000, label: '10 days saved', icon: Clock },
  ];

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

  // Get the next milestone
  const getNextMilestone = () => {
    const nextMilestone = milestones.find(m => m.threshold > userData.totalTimeSaved);
    return nextMilestone || milestones[milestones.length - 1];
  };

  // Calculate progress to next milestone
  const calculateProgress = () => {
    const nextMilestone = getNextMilestone();
    const previousMilestone = milestones[Math.max(0, milestones.indexOf(nextMilestone) - 1)];
    const previousThreshold = previousMilestone ? previousMilestone.threshold : 0;
    
    const total = nextMilestone.threshold - previousThreshold;
    const current = userData.totalTimeSaved - previousThreshold;
    
    return (current / total) * 100;
  };

  const nextMilestone = getNextMilestone();
  const progress = calculateProgress();

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

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Milestone className="h-5 w-5 text-primary" />
            <span>Your Optimization Journey</span>
          </CardTitle>
          <CardDescription>
            Track your productivity improvements over time
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="text-lg font-medium">Next Milestone</h3>
                  <p className="text-muted-foreground">{nextMilestone.label}</p>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="h-5 w-5 text-primary" />
                  <span className="font-medium">{formatTimeSaved(userData.totalTimeSaved)}</span>
                  <span className="text-muted-foreground">of {formatTimeSaved(nextMilestone.threshold)}</span>
                </div>
              </div>
              <Progress value={progress} className="h-2" />
            </div>

            <div className="grid grid-cols-2 gap-4 mt-6">
              {milestones.map((milestone, index) => {
                const isAchieved = userData.totalTimeSaved >= milestone.threshold;
                const Icon = milestone.icon;
                
                return (
                  <div
                    key={index}
                    className={`flex items-center gap-3 p-3 rounded-lg border ${
                      isAchieved ? 'bg-primary/10 border-primary/30' : 'bg-muted/30'
                    }`}
                  >
                    <div
                      className={`flex items-center justify-center w-10 h-10 rounded-full ${
                        isAchieved ? 'bg-primary/20 text-primary' : 'bg-muted text-muted-foreground'
                      }`}
                    >
                      <Icon className="h-5 w-5" />
                    </div>
                    <div>
                      <h4 className={`font-medium ${isAchieved ? 'text-primary' : ''}`}>
                        {milestone.label}
                      </h4>
                      <p className="text-xs text-muted-foreground">
                        {isAchieved ? 'Achieved' : 'Not yet achieved'}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-primary" />
            <span>Productivity Improvement Breakdown</span>
          </CardTitle>
          <CardDescription>
            Detailed analysis of your productivity journey
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 rounded-lg bg-primary/10 border border-primary/20 flex flex-col items-center justify-center text-center">
                <Award className="h-8 w-8 text-primary mb-2" />
                <h3 className="text-lg font-medium">Achieved Milestones</h3>
                <p className="text-3xl font-bold">
                  {milestones.filter(m => userData.totalTimeSaved >= m.threshold).length}
                </p>
                <p className="text-sm text-muted-foreground">out of {milestones.length} total</p>
              </div>

              <div className="p-4 rounded-lg bg-muted border flex flex-col items-center justify-center text-center">
                <TrendingUp className="h-8 w-8 text-primary mb-2" />
                <h3 className="text-lg font-medium">Weekly Growth</h3>
                <div className="flex items-center">
                  <span className="text-3xl font-bold">+15%</span>
                </div>
                <p className="text-sm text-muted-foreground">in time saved</p>
              </div>

              <div className="p-4 rounded-lg bg-muted border flex flex-col items-center justify-center text-center">
                <Clock className="h-8 w-8 text-primary mb-2" />
                <h3 className="text-lg font-medium">Consistency</h3>
                <p className="text-3xl font-bold">86%</p>
                <p className="text-sm text-muted-foreground">task automation rate</p>
              </div>
            </div>

            <div className="mt-6 space-y-4">
              <h3 className="text-lg font-medium">Notable Achievements</h3>
              <div className="space-y-3">
                {milestones
                  .filter(m => userData.totalTimeSaved >= m.threshold)
                  .slice(-3)
                  .map((milestone, index) => {
                    const Icon = milestone.icon;
                    return (
                      <div key={index} className="flex items-center justify-between p-3 rounded-lg bg-primary/5 border border-primary/20">
                        <div className="flex items-center gap-3">
                          <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/20 text-primary">
                            <Icon className="h-4 w-4" />
                          </div>
                          <div>
                            <h4 className="font-medium">{milestone.label}</h4>
                            <p className="text-xs text-muted-foreground">
                              Achieved {new Date().toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                        <Button variant="ghost" size="sm">
                          <ChevronRight className="h-4 w-4" />
                        </Button>
                      </div>
                    );
                  })}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default TimeJourneyPanel;
