
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { UserAnalyticsData } from '@/hooks/use-action-analytics';
import { Button } from '@/components/ui/button';
import { Download, Share2, Award, Star, TrendingUp, Zap, Clock, Coffee, Medal } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface AchievementsPanelProps {
  userData: UserAnalyticsData | null;
}

interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  value: string;
  date: string;
  color: string;
  category: 'time' | 'execution' | 'milestone';
  unlocked: boolean;
}

const AchievementsPanel: React.FC<AchievementsPanelProps> = ({ userData }) => {
  const [activeTab, setActiveTab] = useState<string>('all');
  
  if (!userData) return null;

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

  // Mock achievements - in a real app this would come from analytics
  const achievements: Achievement[] = [
    {
      id: '1',
      title: 'First Hour Saved',
      description: 'You\'ve saved your first hour of work time!',
      icon: Clock,
      value: formatTimeSaved(3600),
      date: '2023-09-15',
      color: '#8b5cf6',
      category: 'time',
      unlocked: userData.totalTimeSaved >= 3600
    },
    {
      id: '2',
      title: 'Morning Coffee',
      description: 'Save enough time to enjoy an extra coffee break',
      icon: Coffee,
      value: formatTimeSaved(900),
      date: '2023-09-10',
      color: '#10b981',
      category: 'time',
      unlocked: userData.totalTimeSaved >= 900
    },
    {
      id: '3',
      title: 'Power User',
      description: 'Execute more than 100 automated tasks',
      icon: Zap,
      value: '100 Tasks',
      date: '2023-10-01',
      color: '#f59e0b',
      category: 'execution',
      unlocked: userData.totalExecutions >= 100
    },
    {
      id: '4',
      title: 'Efficiency Expert',
      description: 'Reach 95% success rate on automated tasks',
      icon: Star,
      value: '95% Success',
      date: '2023-10-05',
      color: '#0ea5e9',
      category: 'execution',
      unlocked: userData.overallSuccessRate >= 95
    },
    {
      id: '5',
      title: 'Time Wizard',
      description: 'Save a total of 8 hours (one workday)',
      icon: Award,
      value: formatTimeSaved(28800),
      date: '2023-10-20',
      color: '#f43f5e',
      category: 'milestone',
      unlocked: userData.totalTimeSaved >= 28800
    },
    {
      id: '6',
      title: 'Consistency Champion',
      description: 'Use automation every day for a week',
      icon: Medal,
      value: '7 Day Streak',
      date: '2023-09-25',
      color: '#ec4899',
      category: 'milestone',
      unlocked: true // Mock value, would be based on streak data
    },
    {
      id: '7',
      title: 'Growth Mindset',
      description: 'Increase time savings by 20% week over week',
      icon: TrendingUp,
      value: '+20% Growth',
      date: '2023-10-15',
      color: '#14b8a6',
      category: 'milestone',
      unlocked: true // Mock value, would be based on growth data
    }
  ];

  // Filter achievements based on active tab
  const filteredAchievements = achievements.filter(achievement => {
    if (activeTab === 'all') return true;
    if (activeTab === 'unlocked') return achievement.unlocked;
    if (activeTab === 'locked') return !achievement.unlocked;
    return achievement.category === activeTab;
  });

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Award className="h-5 w-5 text-primary" />
            <span>Achievements & Milestones</span>
          </CardTitle>
          <CardDescription>
            Celebrate your productivity milestones
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid grid-cols-4 md:w-[600px] mb-6">
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="time">Time Saved</TabsTrigger>
              <TabsTrigger value="execution">Execution</TabsTrigger>
              <TabsTrigger value="milestone">Milestones</TabsTrigger>
            </TabsList>
            
            <TabsContent value={activeTab}>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredAchievements.map((achievement) => {
                  const Icon = achievement.icon;
                  
                  return (
                    <Card 
                      key={achievement.id} 
                      className={`overflow-hidden ${achievement.unlocked ? 'opacity-100' : 'opacity-60'}`}
                    >
                      <div 
                        className="h-1.5" 
                        style={{ backgroundColor: achievement.unlocked ? achievement.color : '#d1d5db' }}
                      />
                      <CardHeader className="pb-2">
                        <div className="flex justify-between items-start">
                          <div 
                            className={`p-2 rounded-full ${achievement.unlocked ? 'bg-primary/10' : 'bg-muted'}`}
                            style={{ 
                              backgroundColor: achievement.unlocked ? `${achievement.color}20` : undefined,
                              color: achievement.unlocked ? achievement.color : undefined 
                            }}
                          >
                            <Icon className="h-5 w-5" />
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {new Date(achievement.date).toLocaleDateString()}
                          </div>
                        </div>
                        <CardTitle className="text-base mt-2">{achievement.title}</CardTitle>
                        <CardDescription className="h-8">
                          {achievement.description}
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="pb-4">
                        <div className="flex items-center gap-1">
                          <span className="text-sm text-muted-foreground">Value:</span>
                          <span className="font-medium">{achievement.value}</span>
                        </div>
                      </CardContent>
                      <CardFooter className="pt-2 border-t flex justify-between">
                        <Button variant="ghost" size="sm" disabled={!achievement.unlocked}>
                          <Share2 className="h-4 w-4 mr-1" />
                          Share
                        </Button>
                        <div 
                          className={`text-xs font-medium px-2 py-1 rounded-full ${
                            achievement.unlocked 
                              ? 'bg-primary/10 text-primary' 
                              : 'bg-muted text-muted-foreground'
                          }`}
                          style={{ 
                            backgroundColor: achievement.unlocked ? `${achievement.color}20` : undefined,
                            color: achievement.unlocked ? achievement.color : undefined 
                          }}
                        >
                          {achievement.unlocked ? 'UNLOCKED' : 'LOCKED'}
                        </div>
                      </CardFooter>
                    </Card>
                  );
                })}
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Share Your Accomplishments</CardTitle>
          <CardDescription>
            Export or share your productivity achievements with your team
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div className="p-4 rounded-lg bg-primary/5 border border-primary/20">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-lg font-medium">Executive Summary</h3>
                  <p className="text-sm text-muted-foreground">
                    A concise overview of your productivity gains
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm">
                    <Share2 className="h-4 w-4 mr-1" />
                    Share
                  </Button>
                  <Button variant="default" size="sm">
                    <Download className="h-4 w-4 mr-1" />
                    Export
                  </Button>
                </div>
              </div>
              
              <div className="space-y-3">
                <div className="flex justify-between border-b py-2">
                  <span className="font-medium">Total Time Saved</span>
                  <span>{formatTimeSaved(userData.totalTimeSaved)}</span>
                </div>
                <div className="flex justify-between border-b py-2">
                  <span className="font-medium">Tasks Automated</span>
                  <span>{userData.totalExecutions}</span>
                </div>
                <div className="flex justify-between border-b py-2">
                  <span className="font-medium">Success Rate</span>
                  <span>{Math.round(userData.overallSuccessRate)}%</span>
                </div>
                <div className="flex justify-between border-b py-2">
                  <span className="font-medium">Achievements Unlocked</span>
                  <span>{achievements.filter(a => a.unlocked).length}/{achievements.length}</span>
                </div>
                <div className="flex justify-between py-2">
                  <span className="font-medium">Estimated Annual Savings</span>
                  <span className="text-primary font-medium">
                    {formatTimeSaved(userData.totalTimeSaved * 52)}
                  </span>
                </div>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 rounded-lg border">
                <h3 className="text-lg font-medium mb-2">Detailed Analytics</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Comprehensive breakdown of your productivity metrics
                </p>
                <Button variant="outline" className="w-full">
                  <Download className="h-4 w-4 mr-1" />
                  Export CSV
                </Button>
              </div>
              
              <div className="p-4 rounded-lg border">
                <h3 className="text-lg font-medium mb-2">Visualization Package</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Charts and graphics to visualize your productivity gains
                </p>
                <Button variant="outline" className="w-full">
                  <Download className="h-4 w-4 mr-1" />
                  Export PNG/PDF
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AchievementsPanel;
