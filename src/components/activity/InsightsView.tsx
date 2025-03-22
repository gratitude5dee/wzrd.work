
import React, { useState } from 'react';
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle,
  CardDescription,
  CardFooter
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Lightbulb, 
  Clock, 
  BarChart, 
  ArrowRight, 
  Bookmark, 
  X,
  ThumbsUp,
  ThumbsDown,
  Star,
  Zap,
  Timer,
  ArrowUpRight,
  Activity,
  FileText,
  ChevronRight
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { cn } from '@/lib/utils';
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

interface InsightsViewProps {
  dateRange: { start: Date; end: Date };
  selectedApps: string[];
  activityTypes: string[];
  searchQuery: string;
}

// Sample data for insights
const generateInsights = () => {
  return [
    {
      id: 'insight-1',
      title: 'Reduce Context Switching',
      description: 'You switch between VS Code and Chrome 58 times per day. Consider using browser extensions within VS Code to reduce context switching.',
      impact: 'high',
      category: 'productivity',
      timeSaved: 32,
      apps: ['vscode', 'chrome'],
      dismissed: false,
      saved: false,
      implemented: false,
      details: {
        problem: 'Frequent context switching between editor and browser reduces concentration and productivity.',
        solution: 'Install Browser Preview for VS Code or related extensions that allow viewing web content within your editor.',
        estimatedImpact: 'Reducing context switches by 50% could save approximately 32 minutes per day based on your usage patterns.',
        steps: [
          'Install Browser Preview extension in VS Code',
          'Configure keyboard shortcuts for preview',
          'Use embedded preview for documentation and simple browsing'
        ]
      }
    },
    {
      id: 'insight-2',
      title: 'Automate Email Processing',
      description: 'You spend about 72 minutes daily sorting emails in Outlook. An automated rule system could save significant time.',
      impact: 'high',
      category: 'automation',
      timeSaved: 45,
      apps: ['outlook'],
      dismissed: false,
      saved: true,
      implemented: false,
      details: {
        problem: 'Manual email sorting and processing takes significant time each day.',
        solution: 'Create Outlook rules to automatically categorize, flag, and file emails based on sender, subject, or content.',
        estimatedImpact: 'Automation could reduce email processing time by up to 45 minutes daily.',
        steps: [
          'Analyze your most common email categories',
          'Create rules in Outlook for automatic sorting',
          'Set up quick steps for common actions',
          'Review and refine rules weekly'
        ]
      }
    },
    {
      id: 'insight-3',
      title: 'Optimize Terminal Workflow',
      description: 'You frequently type the same commands in Terminal. Consider creating aliases or scripts for repetitive tasks.',
      impact: 'medium',
      category: 'efficiency',
      timeSaved: 15,
      apps: ['terminal'],
      dismissed: false,
      saved: false,
      implemented: false,
      details: {
        problem: 'Repetitive typing of complex commands wastes time and introduces potential for errors.',
        solution: 'Create shell aliases and scripts for frequently used command sequences.',
        estimatedImpact: 'Could save approximately 15 minutes daily and reduce command errors.',
        steps: [
          'Identify most common command patterns',
          'Create aliases in your shell configuration',
          'Consider implementing shell functions for more complex operations',
          'Document your custom commands'
        ]
      }
    },
    {
      id: 'insight-4',
      title: 'Meetings Scheduling Pattern',
      description: 'Most of your productive coding happens before 11 AM. Consider scheduling meetings in the afternoon.',
      impact: 'high',
      category: 'scheduling',
      timeSaved: 60,
      apps: ['vscode', 'terminal', 'outlook'],
      dismissed: false,
      saved: false,
      implemented: true,
      details: {
        problem: 'Morning meetings interrupt your most productive coding hours.',
        solution: 'Implement a meeting schedule that preserves morning hours for deep work.',
        estimatedImpact: 'Could increase productive coding time by up to 60 minutes daily.',
        steps: [
          'Block morning hours in your calendar as "Deep Work"',
          'Set expectations with colleagues about your availability',
          'Suggest afternoon slots when scheduling meetings',
          'Use an email signature noting your meeting preferences'
        ]
      }
    },
    {
      id: 'insight-5',
      title: 'Standardize Project Documentation',
      description: 'You spend significant time searching through Word and Excel files. A standardized documentation system could improve efficiency.',
      impact: 'medium',
      category: 'organization',
      timeSaved: 25,
      apps: ['word', 'excel'],
      dismissed: false,
      saved: false,
      implemented: false,
      details: {
        problem: 'Inconsistent documentation formats and locations lead to wasted search time.',
        solution: 'Implement a standardized documentation structure and location for all projects.',
        estimatedImpact: 'Could save approximately 25 minutes daily in search and context-switching time.',
        steps: [
          'Create a documentation template for all projects',
          'Establish a central repository for documents',
          'Tag and categorize existing documents',
          'Train team members on the new system'
        ]
      }
    },
  ];
};

// Category icons mapping
const categoryIcons: Record<string, React.ReactNode> = {
  productivity: <Zap className="h-4 w-4" />,
  automation: <Activity className="h-4 w-4" />,
  efficiency: <Timer className="h-4 w-4" />,
  scheduling: <Clock className="h-4 w-4" />,
  organization: <FileText className="h-4 w-4" />,
};

// Impact colors mapping
const getImpactColors = (impact: string) => {
  switch (impact) {
    case 'high':
      return 'bg-green-100 text-green-700 border-green-200';
    case 'medium':
      return 'bg-yellow-100 text-yellow-700 border-yellow-200';
    case 'low':
      return 'bg-blue-100 text-blue-700 border-blue-200';
    default:
      return 'bg-gray-100 text-gray-700 border-gray-200';
  }
};

const InsightsView: React.FC<InsightsViewProps> = ({
  dateRange,
  selectedApps,
  activityTypes,
  searchQuery,
}) => {
  const [insights, setInsights] = useState(generateInsights());
  const [view, setView] = useState<'all' | 'saved' | 'implemented'>('all');
  
  // Filter insights based on selected view, apps, and search query
  const filteredInsights = insights.filter(insight => {
    // Filter by view
    if (view === 'saved' && !insight.saved) return false;
    if (view === 'implemented' && !insight.implemented) return false;
    
    // Filter by selected apps
    if (selectedApps.length > 0) {
      const hasSelectedApp = insight.apps.some(app => selectedApps.includes(app));
      if (!hasSelectedApp) return false;
    }
    
    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return (
        insight.title.toLowerCase().includes(query) ||
        insight.description.toLowerCase().includes(query) ||
        insight.category.toLowerCase().includes(query)
      );
    }
    
    return !insight.dismissed;
  });
  
  // Total time saved from all insights
  const totalPotentialTimeSaved = filteredInsights.reduce((total, insight) => {
    return total + (insight.dismissed ? 0 : insight.timeSaved);
  }, 0);
  
  // Handle saving and dismissing insights
  const handleToggleSaved = (insightId: string) => {
    setInsights(prev =>
      prev.map(insight =>
        insight.id === insightId ? { ...insight, saved: !insight.saved } : insight
      )
    );
  };
  
  const handleToggleImplemented = (insightId: string) => {
    setInsights(prev =>
      prev.map(insight =>
        insight.id === insightId ? { ...insight, implemented: !insight.implemented } : insight
      )
    );
  };
  
  const handleDismiss = (insightId: string) => {
    setInsights(prev =>
      prev.map(insight =>
        insight.id === insightId ? { ...insight, dismissed: true } : insight
      )
    );
  };
  
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row justify-between md:items-center">
            <div>
              <CardTitle>AI-Generated Insights</CardTitle>
              <CardDescription className="mt-1">
                Personalized suggestions based on your activity patterns
              </CardDescription>
            </div>
            
            <div className="mt-4 md:mt-0">
              <div className="bg-muted rounded-lg p-1 flex">
                <Button 
                  variant={view === 'all' ? 'secondary' : 'ghost'} 
                  size="sm"
                  className="rounded-sm"
                  onClick={() => setView('all')}
                >
                  All
                </Button>
                <Button 
                  variant={view === 'saved' ? 'secondary' : 'ghost'} 
                  size="sm"
                  className="rounded-sm"
                  onClick={() => setView('saved')}
                >
                  Saved
                </Button>
                <Button 
                  variant={view === 'implemented' ? 'secondary' : 'ghost'} 
                  size="sm"
                  className="rounded-sm"
                  onClick={() => setView('implemented')}
                >
                  Implemented
                </Button>
              </div>
            </div>
          </div>
        </CardHeader>
        
        <CardContent>
          <div className="mb-6 bg-muted/40 rounded-lg p-4 flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="bg-accent/15 text-accent rounded-full p-2.5">
                <Lightbulb className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-medium">Optimization Potential</h3>
                <p className="text-sm text-muted-foreground">
                  Implementing these insights could save you significant time
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-1">
              <div className="text-2xl font-bold">{totalPotentialTimeSaved}</div>
              <div className="text-sm text-muted-foreground">minutes<br/>per day</div>
            </div>
          </div>
          
          {filteredInsights.length > 0 ? (
            <div className="space-y-4">
              {filteredInsights.map(insight => (
                <Card key={insight.id} className="overflow-hidden border-l-4" style={{ 
                  borderLeftColor: insight.impact === 'high' ? '#22c55e' : 
                                     insight.impact === 'medium' ? '#eab308' : '#3b82f6' 
                }}>
                  <CardContent className="p-0">
                    <div className="p-4">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex flex-col space-y-2">
                          <div className="flex items-center gap-2">
                            <h3 className="font-medium">{insight.title}</h3>
                            {insight.implemented && (
                              <Badge variant="outline" className="bg-accent/10 text-accent border-accent/20">
                                Implemented
                              </Badge>
                            )}
                          </div>
                          
                          <p className="text-sm text-muted-foreground">{insight.description}</p>
                          
                          <div className="flex flex-wrap items-center gap-2 pt-1">
                            <Badge variant="outline" className={getImpactColors(insight.impact)}>
                              {insight.impact} impact
                            </Badge>
                            
                            <Badge variant="outline" className="flex items-center gap-1 bg-background">
                              {categoryIcons[insight.category]}
                              {insight.category}
                            </Badge>
                            
                            <Badge variant="outline" className="flex items-center gap-1 bg-background">
                              <Clock className="h-3 w-3" />
                              Saves {insight.timeSaved} min/day
                            </Badge>
                            
                            {insight.apps.map(app => (
                              <Badge key={app} variant="outline" className="bg-background">
                                {app}
                              </Badge>
                            ))}
                          </div>
                        </div>
                        
                        <div className="flex items-start gap-1">
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button 
                                  variant="ghost" 
                                  size="icon" 
                                  className={cn("h-8 w-8", insight.saved && "text-yellow-500")} 
                                  onClick={() => handleToggleSaved(insight.id)}
                                >
                                  <Bookmark className="h-4 w-4" fill={insight.saved ? "currentColor" : "none"} />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent side="bottom">
                                {insight.saved ? 'Remove from saved' : 'Save insight'}
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                          
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button 
                                  variant="ghost" 
                                  size="icon" 
                                  className="h-8 w-8" 
                                  onClick={() => handleDismiss(insight.id)}
                                >
                                  <X className="h-4 w-4" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent side="bottom">
                                Dismiss insight
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        </div>
                      </div>
                      
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="mt-2 text-xs text-muted-foreground"
                          >
                            View details <ChevronRight className="ml-1 h-3 w-3" />
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-lg">
                          <DialogHeader>
                            <DialogTitle>{insight.title}</DialogTitle>
                            <DialogDescription>
                              {insight.description}
                            </DialogDescription>
                          </DialogHeader>
                          
                          <div className="space-y-4 my-2">
                            <div>
                              <h4 className="text-sm font-medium mb-1">Problem</h4>
                              <p className="text-sm text-muted-foreground">{insight.details.problem}</p>
                            </div>
                            
                            <div>
                              <h4 className="text-sm font-medium mb-1">Recommended Solution</h4>
                              <p className="text-sm text-muted-foreground">{insight.details.solution}</p>
                            </div>
                            
                            <div>
                              <h4 className="text-sm font-medium mb-1">Estimated Impact</h4>
                              <p className="text-sm text-muted-foreground">{insight.details.estimatedImpact}</p>
                            </div>
                            
                            <div>
                              <h4 className="text-sm font-medium mb-1">Implementation Steps</h4>
                              <ol className="text-sm text-muted-foreground list-decimal list-inside space-y-1">
                                {insight.details.steps.map((step, index) => (
                                  <li key={index}>{step}</li>
                                ))}
                              </ol>
                            </div>
                          </div>
                          
                          <DialogFooter className="flex sm:justify-between items-center">
                            <div className="flex items-center gap-1">
                              <span>Is this helpful? </span>
                              <Button variant="ghost" size="icon" className="h-8 w-8">
                                <ThumbsUp className="h-4 w-4" />
                              </Button>
                              <Button variant="ghost" size="icon" className="h-8 w-8">
                                <ThumbsDown className="h-4 w-4" />
                              </Button>
                            </div>
                            
                            <div className="flex gap-2 mt-2 sm:mt-0">
                              <Button 
                                variant={insight.saved ? "secondary" : "outline"}
                                onClick={() => handleToggleSaved(insight.id)}
                              >
                                {insight.saved ? "Saved" : "Save Insight"}
                              </Button>
                              <Button 
                                variant={insight.implemented ? "secondary" : "default"}
                                onClick={() => handleToggleImplemented(insight.id)}
                              >
                                {insight.implemented ? "Implemented" : "Mark as Implemented"}
                              </Button>
                            </div>
                          </DialogFooter>
                        </DialogContent>
                      </Dialog>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              {view === 'all' 
                ? "No insights match your current filters."
                : view === 'saved'
                ? "You haven't saved any insights yet."
                : "You haven't implemented any insights yet."}
            </div>
          )}
        </CardContent>
        
        {filteredInsights.length > 0 && (
          <CardFooter>
            <Button variant="outline" className="w-full">
              Show More Insights
            </Button>
          </CardFooter>
        )}
      </Card>
    </div>
  );
};

export default InsightsView;
