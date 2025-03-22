
import React, { useState } from 'react';
import { DateRange } from 'react-day-picker';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line
} from 'recharts';
import { 
  Activity, 
  Repeat, 
  Clock, 
  ArrowRight, 
  MousePointer, 
  Keyboard, 
  Navigation,
  Calendar,
  BarChart2
} from 'lucide-react';

interface PatternViewProps {
  dateRange: DateRange;
  selectedApps: string[];
  activityTypes: string[];
  searchQuery: string;
}

// Types for our pattern data
interface UsagePattern {
  id: string;
  name: string;
  description: string;
  frequency: number;
  applications: string[];
  activityTypes: string[];
  averageDuration: number;
  lastOccurrence: Date;
  steps: PatternStep[];
}

interface PatternStep {
  id: string;
  application: string;
  activityType: string;
  description: string;
  duration?: number;
}

interface UsageMetric {
  name: string;
  value: number;
  color?: string;
}

interface TimeSeriesData {
  date: string;
  value: number;
}

const PatternView: React.FC<PatternViewProps> = ({
  dateRange,
  selectedApps,
  activityTypes,
  searchQuery
}) => {
  // Mock pattern data - in a real application, this would come from an API
  const [patterns, setPatterns] = useState<UsagePattern[]>([
    {
      id: '1',
      name: 'Morning Setup Routine',
      description: 'Opening applications and checking emails at the start of workday',
      frequency: 18, // times in the past month
      applications: ['chrome', 'slack', 'vscode'],
      activityTypes: ['navigation', 'click'],
      averageDuration: 720, // seconds
      lastOccurrence: new Date(Date.now() - 86400000), // yesterday
      steps: [
        {
          id: '1-1',
          application: 'chrome',
          activityType: 'navigation',
          description: 'Open Gmail',
          duration: 240
        },
        {
          id: '1-2',
          application: 'slack',
          activityType: 'click',
          description: 'Check team messages',
          duration: 300
        },
        {
          id: '1-3',
          application: 'vscode',
          activityType: 'navigation',
          description: 'Open recent project',
          duration: 180
        }
      ]
    },
    {
      id: '2',
      name: 'Code-Documentation Cycle',
      description: 'Pattern of switching between code editor and documentation while working',
      frequency: 42, // times in the past month
      applications: ['vscode', 'chrome', 'notion'],
      activityTypes: ['typing', 'navigation'],
      averageDuration: 900, // seconds
      lastOccurrence: new Date(Date.now() - 43200000), // 12 hours ago
      steps: [
        {
          id: '2-1',
          application: 'vscode',
          activityType: 'typing',
          description: 'Write code in editor',
          duration: 420
        },
        {
          id: '2-2',
          application: 'chrome',
          activityType: 'navigation',
          description: 'Reference documentation',
          duration: 180
        },
        {
          id: '2-3',
          application: 'notion',
          activityType: 'typing',
          description: 'Update project notes',
          duration: 300
        }
      ]
    },
    {
      id: '3',
      name: 'Meeting Preparation',
      description: 'Pattern of preparing for meetings by gathering documents and notes',
      frequency: 12, // times in the past month
      applications: ['notion', 'slack', 'zoom'],
      activityTypes: ['navigation', 'click', 'typing'],
      averageDuration: 600, // seconds
      lastOccurrence: new Date(Date.now() - 7200000), // 2 hours ago
      steps: [
        {
          id: '3-1',
          application: 'notion',
          activityType: 'navigation',
          description: 'Open meeting notes',
          duration: 120
        },
        {
          id: '3-2',
          application: 'slack',
          activityType: 'click',
          description: 'Review relevant messages',
          duration: 180
        },
        {
          id: '3-3',
          application: 'zoom',
          activityType: 'navigation',
          description: 'Join meeting room',
          duration: 300
        }
      ]
    }
  ]);

  // Mock usage metrics
  const appUsageData: UsageMetric[] = [
    { name: 'VS Code', value: 8.2, color: '#007ACC' },
    { name: 'Chrome', value: 5.6, color: '#4285F4' },
    { name: 'Slack', value: 3.2, color: '#4A154B' },
    { name: 'Notion', value: 2.8, color: '#000000' },
    { name: 'Terminal', value: 1.5, color: '#4D4D4D' },
    { name: 'Zoom', value: 1.2, color: '#2D8CFF' }
  ];

  const activityTypeData: UsageMetric[] = [
    { name: 'Typing', value: 42, color: '#10B981' },
    { name: 'Navigation', value: 28, color: '#3B82F6' },
    { name: 'Clicking', value: 21, color: '#EC4899' },
    { name: 'Scrolling', value: 9, color: '#8B5CF6' }
  ];

  const weeklyTrendData: TimeSeriesData[] = [
    { date: 'Mon', value: 4.2 },
    { date: 'Tue', value: 6.5 },
    { date: 'Wed', value: 5.8 },
    { date: 'Thu', value: 7.2 },
    { date: 'Fri', value: 6.9 },
    { date: 'Sat', value: 2.1 },
    { date: 'Sun', value: 1.5 }
  ];

  const hourlyTrendData: TimeSeriesData[] = [
    { date: '8am', value: 1.2 },
    { date: '9am', value: 3.8 },
    { date: '10am', value: 4.5 },
    { date: '11am', value: 3.9 },
    { date: '12pm', value: 2.1 },
    { date: '1pm', value: 2.8 },
    { date: '2pm', value: 4.2 },
    { date: '3pm', value: 4.7 },
    { date: '4pm', value: 3.8 },
    { date: '5pm', value: 2.5 }
  ];

  // Filter patterns based on user selections
  const filteredPatterns = patterns.filter(pattern => {
    // Date filter - check if the last occurrence is within the date range
    if (dateRange.from && pattern.lastOccurrence < dateRange.from) return false;
    if (dateRange.to && pattern.lastOccurrence > dateRange.to) return false;
    
    // App filter - check if any of the pattern applications match the selected apps
    if (selectedApps.length > 0 && !pattern.applications.some(app => selectedApps.includes(app))) {
      return false;
    }
    
    // Activity type filter - check if any of the pattern activity types match the selected types
    if (activityTypes.length > 0 && !pattern.activityTypes.some(type => activityTypes.includes(type))) {
      return false;
    }
    
    // Search query filter - check if the pattern name or description contains the search query
    if (searchQuery && 
      !pattern.name.toLowerCase().includes(searchQuery.toLowerCase()) && 
      !pattern.description.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false;
    }
    
    return true;
  });

  // Helper function to format duration
  const formatDuration = (seconds: number) => {
    if (seconds < 60) return `${seconds}s`;
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m`;
    
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return minutes > 0 ? `${hours}h ${minutes}m` : `${hours}h`;
  };

  // Helper function to get icon for activity type
  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'click':
        return <MousePointer className="h-4 w-4" />;
      case 'typing':
        return <Keyboard className="h-4 w-4" />;
      case 'navigation':
        return <Navigation className="h-4 w-4" />;
      default:
        return <Activity className="h-4 w-4" />;
    }
  };

  return (
    <div className="space-y-6">
      <Tabs defaultValue="patterns" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="patterns" className="flex items-center gap-2">
            <Repeat className="h-4 w-4" />
            <span>Workflow Patterns</span>
          </TabsTrigger>
          <TabsTrigger value="metrics" className="flex items-center gap-2">
            <BarChart2 className="h-4 w-4" />
            <span>Usage Metrics</span>
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="patterns">
          <ScrollArea className="h-full max-h-[calc(100vh-300px)]">
            <div className="space-y-6 p-2">
              {filteredPatterns.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-64">
                  <Repeat className="h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium">No patterns found</h3>
                  <p className="text-sm text-muted-foreground text-center max-w-md mt-2">
                    Try adjusting your filters or selecting a different date range to see more workflow patterns.
                  </p>
                </div>
              ) : (
                filteredPatterns.map(pattern => (
                  <Card key={pattern.id} className="transition-all duration-200 hover:shadow-md">
                    <CardHeader className="pb-2">
                      <div className="flex items-start justify-between">
                        <div>
                          <CardTitle className="font-medium">{pattern.name}</CardTitle>
                          <CardDescription className="mt-1">{pattern.description}</CardDescription>
                        </div>
                        <Badge className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          <span>{formatDuration(pattern.averageDuration)}</span>
                        </Badge>
                      </div>
                      
                      <div className="flex flex-wrap gap-1 mt-2">
                        {pattern.applications.map(app => (
                          <Badge key={`app-${pattern.id}-${app}`} variant="outline" className="capitalize text-xs">
                            {app}
                          </Badge>
                        ))}
                        {pattern.activityTypes.map(type => (
                          <Badge key={`type-${pattern.id}-${type}`} variant="outline" className="capitalize text-xs flex items-center gap-1">
                            {getActivityIcon(type)}
                            {type}
                          </Badge>
                        ))}
                      </div>
                    </CardHeader>
                    
                    <CardContent className="pb-2">
                      <div className="space-y-2">
                        {pattern.steps.map((step, index) => (
                          <div key={step.id} className="flex items-center gap-2">
                            <div className="flex-none flex items-center justify-center w-6 h-6 rounded-full bg-muted text-xs font-medium">
                              {index + 1}
                            </div>
                            <div className="flex-1 flex items-center gap-1.5">
                              <Badge variant="outline" className="capitalize text-xs">
                                {step.application}
                              </Badge>
                              <ArrowRight className="h-3 w-3 text-muted-foreground" />
                              <span className="text-sm">{step.description}</span>
                            </div>
                            {step.duration && (
                              <Badge variant="secondary" className="text-xs">
                                {formatDuration(step.duration)}
                              </Badge>
                            )}
                          </div>
                        ))}
                      </div>
                    </CardContent>
                    
                    <CardFooter className="flex justify-between pt-2">
                      <div className="text-sm text-muted-foreground flex items-center gap-1">
                        <Repeat className="h-4 w-4" />
                        <span>{pattern.frequency} times this month</span>
                      </div>
                      <Button variant="ghost" size="sm" className="text-xs">
                        View Details
                      </Button>
                    </CardFooter>
                  </Card>
                ))
              )}
            </div>
          </ScrollArea>
        </TabsContent>
        
        <TabsContent value="metrics">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Application Usage */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base font-medium">Application Usage</CardTitle>
                <CardDescription>Hours spent per application</CardDescription>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={appUsageData}
                      layout="vertical"
                      margin={{ top: 5, right: 30, left: 60, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                      <XAxis type="number" unit="h" />
                      <YAxis type="category" dataKey="name" width={80} />
                      <Tooltip 
                        formatter={(value: number) => [`${value} hours`, 'Time Spent']}
                        contentStyle={{ background: 'var(--background)', border: '1px solid var(--border)' }}
                      />
                      <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                        {appUsageData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
            
            {/* Activity Types */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base font-medium">Activity Types</CardTitle>
                <CardDescription>Distribution of your interactions</CardDescription>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="h-64 flex items-center justify-center">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={activityTypeData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={80}
                        paddingAngle={2}
                        dataKey="value"
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                        labelLine={false}
                      >
                        {activityTypeData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip 
                        formatter={(value: number) => [`${value}%`, 'Percentage']}
                        contentStyle={{ background: 'var(--background)', border: '1px solid var(--border)' }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
            
            {/* Weekly Trend */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base font-medium">Weekly Activity</CardTitle>
                <CardDescription>Hours of activity by day</CardDescription>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart
                      data={weeklyTrendData}
                      margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" vertical={false} />
                      <XAxis dataKey="date" />
                      <YAxis unit="h" />
                      <Tooltip
                        formatter={(value: number) => [`${value} hours`, 'Activity']}
                        contentStyle={{ background: 'var(--background)', border: '1px solid var(--border)' }}
                      />
                      <Line
                        type="monotone"
                        dataKey="value"
                        stroke="var(--accent)"
                        strokeWidth={2}
                        dot={{ r: 4 }}
                        activeDot={{ r: 6 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
            
            {/* Daily Pattern */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base font-medium">Daily Pattern</CardTitle>
                <CardDescription>Activity distribution by hour</CardDescription>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart
                      data={hourlyTrendData}
                      margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" vertical={false} />
                      <XAxis dataKey="date" />
                      <YAxis unit="h" />
                      <Tooltip
                        formatter={(value: number) => [`${value} hours`, 'Activity']}
                        contentStyle={{ background: 'var(--background)', border: '1px solid var(--border)' }}
                      />
                      <Line
                        type="monotone"
                        dataKey="value"
                        stroke="var(--primary)"
                        strokeWidth={2}
                        dot={{ r: 4 }}
                        activeDot={{ r: 6 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default PatternView;
