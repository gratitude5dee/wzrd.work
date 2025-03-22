
import React, { useState } from 'react';
import { DateRange } from 'react-day-picker';
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { 
  Lightbulb, 
  ArrowUpRight, 
  X, 
  Check, 
  Clock, 
  Star, 
  ThumbsUp, 
  Timer, 
  Sparkles, 
  CalendarClock,
  BarChart,
  BrainCog,
  RotateCcw
} from "lucide-react";

interface InsightsViewProps {
  dateRange: DateRange;
  selectedApps: string[];
  activityTypes: string[];
  searchQuery: string;
}

// Types for insights
interface Insight {
  id: string;
  title: string;
  description: string;
  category: 'optimization' | 'pattern' | 'productivity' | 'suggestion';
  applications: string[];
  relevance: number; // 0-100 relevance score
  createdAt: Date;
  actionable: boolean;
  timeImpact?: number; // Time saved per week (seconds)
  dismissed?: boolean;
  saved?: boolean;
}

const InsightsView: React.FC<InsightsViewProps> = ({
  dateRange,
  selectedApps,
  activityTypes,
  searchQuery
}) => {
  // State for insights
  const [insights, setInsights] = useState<Insight[]>([
    {
      id: '1',
      title: 'Repeated Manual File Organization',
      description: 'You spent 2.5 hours last week manually organizing files across multiple folders. Consider using automated tools or scripts to handle file organization and save time.',
      category: 'optimization',
      applications: ['finder', 'explorer'],
      relevance: 92,
      createdAt: new Date(Date.now() - 86400000 * 2), // 2 days ago
      actionable: true,
      timeImpact: 9000, // 2.5 hours in seconds
      dismissed: false,
      saved: false
    },
    {
      id: '2',
      title: 'VS Code Keyboard Shortcuts',
      description: 'You frequently use mouse clicks for common VS Code operations. Learning keyboard shortcuts for these actions could save you up to 1 hour per week.',
      category: 'productivity',
      applications: ['vscode'],
      relevance: 85,
      createdAt: new Date(Date.now() - 86400000), // 1 day ago
      actionable: true,
      timeImpact: 3600, // 1 hour in seconds
      dismissed: false,
      saved: true
    },
    {
      id: '3',
      title: 'Context Switching Pattern Detected',
      description: 'You switch between Slack and VS Code an average of 34 times per day. Batching communications could improve focus and productivity.',
      category: 'pattern',
      applications: ['slack', 'vscode'],
      relevance: 78,
      createdAt: new Date(Date.now() - 86400000 * 3), // 3 days ago
      actionable: true,
      timeImpact: 5400, // 1.5 hours in seconds
      dismissed: false,
      saved: false
    },
    {
      id: '4',
      title: 'Peak Productivity Time',
      description: 'Your most productive coding hours appear to be between 10 AM and 12 PM. Consider scheduling important coding tasks during this timeframe.',
      category: 'productivity',
      applications: ['vscode', 'terminal'],
      relevance: 75,
      createdAt: new Date(Date.now() - 86400000 * 4), // 4 days ago
      actionable: true,
      timeImpact: 1800, // 30 minutes in seconds
      dismissed: false,
      saved: false
    },
    {
      id: '5',
      title: 'Browser Tab Management',
      description: 'You regularly have 20+ tabs open in Chrome. Using tab management extensions or organizing tabs by project could improve browser performance and reduce cognitive load.',
      category: 'suggestion',
      applications: ['chrome'],
      relevance: 70,
      createdAt: new Date(Date.now() - 86400000 * 2), // 2 days ago
      actionable: true,
      timeImpact: 1200, // 20 minutes in seconds
      dismissed: false,
      saved: false
    }
  ]);
  
  // Filter the insights
  const filteredInsights = insights.filter(insight => {
    // Date range filter
    if (dateRange.from && insight.createdAt < dateRange.from) return false;
    if (dateRange.to && insight.createdAt > dateRange.to) return false;
    
    // App filter
    if (selectedApps.length > 0 && !insight.applications.some(app => selectedApps.includes(app))) {
      return false;
    }
    
    // Search query filter
    if (searchQuery && 
      !insight.title.toLowerCase().includes(searchQuery.toLowerCase()) && 
      !insight.description.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false;
    }
    
    return true;
  });
  
  // Separate insights into saved and unsaved
  const activeInsights = filteredInsights.filter(insight => !insight.dismissed);
  const savedInsights = activeInsights.filter(insight => insight.saved);
  const newInsights = activeInsights.filter(insight => !insight.saved);
  
  // Helper functions
  const formatTimeImpact = (seconds?: number) => {
    if (!seconds) return 'Minimal';
    
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    
    if (hours > 0) {
      return minutes > 0 ? `${hours}h ${minutes}m / week` : `${hours}h / week`;
    }
    
    return `${minutes}m / week`;
  };
  
  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'optimization':
        return <Sparkles className="h-4 w-4" />;
      case 'pattern':
        return <RotateCcw className="h-4 w-4" />;
      case 'productivity':
        return <Timer className="h-4 w-4" />;
      case 'suggestion':
        return <BrainCog className="h-4 w-4" />;
      default:
        return <Lightbulb className="h-4 w-4" />;
    }
  };
  
  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'optimization':
        return 'text-purple-500';
      case 'pattern':
        return 'text-blue-500';
      case 'productivity':
        return 'text-green-500';
      case 'suggestion':
        return 'text-amber-500';
      default:
        return 'text-gray-500';
    }
  };
  
  const handleSaveInsight = (id: string) => {
    setInsights(prev => prev.map(insight => 
      insight.id === id ? { ...insight, saved: true } : insight
    ));
  };
  
  const handleUnsaveInsight = (id: string) => {
    setInsights(prev => prev.map(insight => 
      insight.id === id ? { ...insight, saved: false } : insight
    ));
  };
  
  const handleDismissInsight = (id: string) => {
    setInsights(prev => prev.map(insight => 
      insight.id === id ? { ...insight, dismissed: true } : insight
    ));
  };
  
  return (
    <Tabs defaultValue="new" className="space-y-4">
      <TabsList className="grid w-full grid-cols-3">
        <TabsTrigger value="new" className="flex items-center gap-2">
          <Lightbulb className="h-4 w-4" />
          <span>New Insights</span>
          {newInsights.length > 0 && (
            <Badge className="ml-1 px-1 py-0 h-5 min-w-5 flex items-center justify-center text-xs">
              {newInsights.length}
            </Badge>
          )}
        </TabsTrigger>
        <TabsTrigger value="saved" className="flex items-center gap-2">
          <Star className="h-4 w-4" />
          <span>Saved</span>
          {savedInsights.length > 0 && (
            <Badge className="ml-1 px-1 py-0 h-5 min-w-5 flex items-center justify-center text-xs">
              {savedInsights.length}
            </Badge>
          )}
        </TabsTrigger>
        <TabsTrigger value="stats" className="flex items-center gap-2">
          <BarChart className="h-4 w-4" />
          <span>Potential Impact</span>
        </TabsTrigger>
      </TabsList>
      
      <TabsContent value="new">
        <ScrollArea className="h-full max-h-[calc(100vh-300px)]">
          <div className="space-y-4 p-1">
            {newInsights.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-64">
                <Lightbulb className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium">No new insights</h3>
                <p className="text-sm text-muted-foreground text-center max-w-md mt-2">
                  We'll keep analyzing your work patterns and suggest new insights as they become available.
                </p>
              </div>
            ) : (
              newInsights.map(insight => (
                <InsightCard
                  key={insight.id}
                  insight={insight}
                  onSave={() => handleSaveInsight(insight.id)}
                  onDismiss={() => handleDismissInsight(insight.id)}
                  getCategoryIcon={getCategoryIcon}
                  getCategoryColor={getCategoryColor}
                  formatTimeImpact={formatTimeImpact}
                />
              ))
            )}
          </div>
        </ScrollArea>
      </TabsContent>
      
      <TabsContent value="saved">
        <ScrollArea className="h-full max-h-[calc(100vh-300px)]">
          <div className="space-y-4 p-1">
            {savedInsights.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-64">
                <Star className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium">No saved insights</h3>
                <p className="text-sm text-muted-foreground text-center max-w-md mt-2">
                  Save insights from the "New" tab to refer back to them later.
                </p>
              </div>
            ) : (
              savedInsights.map(insight => (
                <InsightCard
                  key={insight.id}
                  insight={insight}
                  onUnsave={() => handleUnsaveInsight(insight.id)}
                  onDismiss={() => handleDismissInsight(insight.id)}
                  getCategoryIcon={getCategoryIcon}
                  getCategoryColor={getCategoryColor}
                  formatTimeImpact={formatTimeImpact}
                  saved
                />
              ))
            )}
          </div>
        </ScrollArea>
      </TabsContent>
      
      <TabsContent value="stats">
        <div className="space-y-6">
          {/* Time savings summary */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-medium">Time Savings Potential</CardTitle>
              <CardDescription>
                Potential time you could save by implementing insights
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col sm:flex-row gap-6 items-center justify-center py-4">
                <div className="flex flex-col items-center text-center">
                  <div className="text-4xl font-bold mb-2">
                    {formatTimeImpact(activeInsights.reduce((sum, insight) => sum + (insight.timeImpact || 0), 0))}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Total potential time savings
                  </div>
                </div>
                
                <div className="h-full w-px bg-border hidden sm:block" />
                
                <div className="flex flex-col items-center text-center">
                  <div className="text-4xl font-bold mb-2">
                    {activeInsights.filter(i => i.actionable).length}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Actionable recommendations
                  </div>
                </div>
                
                <div className="h-full w-px bg-border hidden sm:block" />
                
                <div className="flex flex-col items-center text-center">
                  <div className="text-4xl font-bold mb-2">
                    {savedInsights.length}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Insights you've saved
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
          
          {/* Category breakdown */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <CategoryCard 
              title="Optimizations" 
              icon={<Sparkles className="h-5 w-5" />} 
              count={activeInsights.filter(i => i.category === 'optimization').length} 
              savings={activeInsights.filter(i => i.category === 'optimization').reduce((sum, i) => sum + (i.timeImpact || 0), 0)}
              formatTimeImpact={formatTimeImpact}
            />
            
            <CategoryCard 
              title="Work Patterns" 
              icon={<RotateCcw className="h-5 w-5" />} 
              count={activeInsights.filter(i => i.category === 'pattern').length} 
              savings={activeInsights.filter(i => i.category === 'pattern').reduce((sum, i) => sum + (i.timeImpact || 0), 0)}
              formatTimeImpact={formatTimeImpact}
            />
            
            <CategoryCard 
              title="Productivity" 
              icon={<Timer className="h-5 w-5" />} 
              count={activeInsights.filter(i => i.category === 'productivity').length} 
              savings={activeInsights.filter(i => i.category === 'productivity').reduce((sum, i) => sum + (i.timeImpact || 0), 0)}
              formatTimeImpact={formatTimeImpact}
            />
            
            <CategoryCard 
              title="Suggestions" 
              icon={<BrainCog className="h-5 w-5" />} 
              count={activeInsights.filter(i => i.category === 'suggestion').length} 
              savings={activeInsights.filter(i => i.category === 'suggestion').reduce((sum, i) => sum + (i.timeImpact || 0), 0)}
              formatTimeImpact={formatTimeImpact}
            />
          </div>
          
          {/* Application specific insights */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-medium">Application-specific Insights</CardTitle>
              <CardDescription>
                Breakdown of insights by application
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Get all unique applications from insights */}
                {Array.from(new Set(activeInsights.flatMap(i => i.applications))).map(app => {
                  const appInsights = activeInsights.filter(i => i.applications.includes(app));
                  const totalSavings = appInsights.reduce((sum, i) => sum + (i.timeImpact || 0), 0);
                  
                  return (
                    <div key={app} className="flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="capitalize">
                          {app}
                        </Badge>
                        <span className="text-sm text-muted-foreground">
                          {appInsights.length} {appInsights.length === 1 ? 'insight' : 'insights'}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <CalendarClock className="h-3.5 w-3.5 text-muted-foreground" />
                        <span className="text-sm font-medium">
                          {formatTimeImpact(totalSavings)}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </div>
      </TabsContent>
    </Tabs>
  );
};

// Insight Card Component
interface InsightCardProps {
  insight: Insight;
  onSave?: () => void;
  onUnsave?: () => void;
  onDismiss: () => void;
  getCategoryIcon: (category: string) => JSX.Element;
  getCategoryColor: (category: string) => string;
  formatTimeImpact: (seconds?: number) => string;
  saved?: boolean;
}

const InsightCard: React.FC<InsightCardProps> = ({
  insight,
  onSave,
  onUnsave,
  onDismiss,
  getCategoryIcon,
  getCategoryColor,
  formatTimeImpact,
  saved = false
}) => {
  return (
    <Card className="transition-all duration-200 hover:shadow-md">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <div className="flex items-center gap-1.5">
            <div className={`${getCategoryColor(insight.category)}`}>
              {getCategoryIcon(insight.category)}
            </div>
            <CardTitle className="font-medium text-base">{insight.title}</CardTitle>
          </div>
          <div className="flex items-center gap-1">
            {insight.timeImpact && (
              <Badge variant="secondary" className="flex-none">
                <Clock className="mr-1 h-3 w-3" />
                {formatTimeImpact(insight.timeImpact)}
              </Badge>
            )}
          </div>
        </div>
        
        <div className="flex flex-wrap gap-1 mt-2">
          {insight.applications.map(app => (
            <Badge key={`app-${insight.id}-${app}`} variant="outline" className="capitalize text-xs">
              {app}
            </Badge>
          ))}
          <Badge 
            variant="outline" 
            className={`capitalize text-xs ${getCategoryColor(insight.category)}`}
          >
            {insight.category}
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent className="pb-2">
        <p className="text-sm">{insight.description}</p>
      </CardContent>
      
      <CardFooter className="pt-0 flex justify-between">
        <div className="text-xs text-muted-foreground">
          Created {new Date(insight.createdAt).toLocaleDateString()}
        </div>
        
        <div className="flex gap-2">
          {insight.actionable && (
            <Button size="sm" variant="outline" className="h-8 text-xs">
              <ArrowUpRight className="mr-1 h-3.5 w-3.5" />
              View Action
            </Button>
          )}
          
          {saved ? (
            <>
              <Button 
                size="sm"
                variant="outline"
                className="h-8 text-xs"
                onClick={onUnsave}
              >
                <X className="mr-1 h-3.5 w-3.5" />
                Unsave
              </Button>
            </>
          ) : (
            <>
              <Button 
                size="sm"
                variant="outline"
                className="h-8 text-xs"
                onClick={onSave}
              >
                <Star className="mr-1 h-3.5 w-3.5" />
                Save
              </Button>
              <Button 
                size="sm"
                variant="ghost"
                className="h-8 w-8 p-0"
                onClick={onDismiss}
              >
                <X className="h-3.5 w-3.5" />
                <span className="sr-only">Dismiss</span>
              </Button>
            </>
          )}
        </div>
      </CardFooter>
    </Card>
  );
};

// Category Card Component
interface CategoryCardProps {
  title: string;
  icon: JSX.Element;
  count: number;
  savings: number;
  formatTimeImpact: (seconds?: number) => string;
}

const CategoryCard: React.FC<CategoryCardProps> = ({
  title,
  icon,
  count,
  savings,
  formatTimeImpact
}) => {
  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex flex-col items-center text-center">
          <div className="mb-2 p-2 bg-muted rounded-full">
            {icon}
          </div>
          <h3 className="font-medium">{title}</h3>
          <div className="mt-4 space-y-2">
            <div>
              <span className="text-2xl font-bold">{count}</span>
              <span className="text-sm text-muted-foreground ml-1">insights</span>
            </div>
            <div>
              <span className="text-sm font-medium">{formatTimeImpact(savings)}</span>
              <span className="text-xs text-muted-foreground ml-1">potential savings</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default InsightsView;
