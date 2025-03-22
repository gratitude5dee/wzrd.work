
import React, { useState } from 'react';
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle,
  CardDescription
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Activity, 
  BarChart, 
  Zap, 
  Clock, 
  ArrowRight, 
  MoreHorizontal, 
  ChevronDown, 
  ChevronRight 
} from 'lucide-react';
import {
  BarChart as RechartsBarChart,
  Bar,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  PieChart,
  Pie,
  Sector
} from 'recharts';
import { cn } from '@/lib/utils';
import {
  Tooltip as UITooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';

interface PatternViewProps {
  dateRange: { start: Date; end: Date };
  selectedApps: string[];
  activityTypes: string[];
  searchQuery: string;
}

// Sample app data
const availableApps = [
  { id: 'chrome', name: 'Chrome' },
  { id: 'vscode', name: 'VS Code' },
  { id: 'slack', name: 'Slack' },
  { id: 'outlook', name: 'Outlook' },
  { id: 'excel', name: 'Excel' },
  { id: 'word', name: 'Word' },
  { id: 'powerpoint', name: 'PowerPoint' },
  { id: 'terminal', name: 'Terminal' },
];

// Sample app usage data
const appUsageData = [
  { name: 'Chrome', value: 35 },
  { name: 'VS Code', value: 25 },
  { name: 'Slack', value: 15 },
  { name: 'Outlook', value: 10 },
  { name: 'Excel', value: 8 },
  { name: 'Word', value: 4 },
  { name: 'PowerPoint', value: 2 },
  { name: 'Terminal', value: 1 },
];

// Sample workflow pattern data
const generateWorkflowPatterns = () => {
  return [
    {
      id: 'pattern-1',
      name: 'Morning Email Review',
      occurrences: 15,
      averageDuration: 22,
      apps: ['outlook', 'chrome', 'slack'],
      steps: [
        { action: 'Open Outlook', app: 'outlook' },
        { action: 'Read emails', app: 'outlook' },
        { action: 'Check links in browser', app: 'chrome' },
        { action: 'Share updates in Slack', app: 'slack' },
      ],
      timeOfDay: 'morning',
      efficiency: 0.75,
    },
    {
      id: 'pattern-2',
      name: 'Coding Session',
      occurrences: 18,
      averageDuration: 48,
      apps: ['vscode', 'chrome', 'terminal'],
      steps: [
        { action: 'Open VS Code', app: 'vscode' },
        { action: 'Terminal commands', app: 'terminal' },
        { action: 'Research in Chrome', app: 'chrome' },
        { action: 'Back to coding', app: 'vscode' },
      ],
      timeOfDay: 'afternoon',
      efficiency: 0.85,
    },
    {
      id: 'pattern-3',
      name: 'Meeting Preparation',
      occurrences: 10,
      averageDuration: 15,
      apps: ['outlook', 'powerpoint', 'excel'],
      steps: [
        { action: 'Check calendar', app: 'outlook' },
        { action: 'Update presentation', app: 'powerpoint' },
        { action: 'Review data', app: 'excel' },
      ],
      timeOfDay: 'various',
      efficiency: 0.62,
    },
    {
      id: 'pattern-4',
      name: 'Documentation Work',
      occurrences: 7,
      averageDuration: 35,
      apps: ['word', 'chrome', 'vscode'],
      steps: [
        { action: 'Open document', app: 'word' },
        { action: 'Research online', app: 'chrome' },
        { action: 'Check code references', app: 'vscode' },
        { action: 'Update document', app: 'word' },
      ],
      timeOfDay: 'afternoon',
      efficiency: 0.78,
    },
  ];
};

// Activity frequency data by hour of day
const activityByHourData = [
  { hour: '6 AM', activities: 5 },
  { hour: '7 AM', activities: 12 },
  { hour: '8 AM', activities: 25 },
  { hour: '9 AM', activities: 45 },
  { hour: '10 AM', activities: 48 },
  { hour: '11 AM', activities: 52 },
  { hour: '12 PM', activities: 38 },
  { hour: '1 PM', activities: 30 },
  { hour: '2 PM', activities: 55 },
  { hour: '3 PM', activities: 60 },
  { hour: '4 PM', activities: 40 },
  { hour: '5 PM', activities: 30 },
  { hour: '6 PM', activities: 15 },
  { hour: '7 PM', activities: 8 },
];

// Render custom app icon for steps
const AppIcon = ({ appId }: { appId: string }) => {
  const getColor = () => {
    switch (appId) {
      case 'chrome': return 'bg-blue-500';
      case 'vscode': return 'bg-blue-700';
      case 'slack': return 'bg-purple-500';
      case 'outlook': return 'bg-blue-400';
      case 'excel': return 'bg-green-600';
      case 'word': return 'bg-blue-600';
      case 'powerpoint': return 'bg-orange-600';
      case 'terminal': return 'bg-gray-800';
      default: return 'bg-gray-500';
    }
  };
  
  const app = availableApps.find(a => a.id === appId);
  
  return (
    <div className={`w-6 h-6 rounded-full flex items-center justify-center text-white ${getColor()}`}>
      {app?.name.charAt(0) || '?'}
    </div>
  );
};

// Custom colored legend
const renderColorfulLegendText = (value: string, entry: any) => {
  const { color } = entry;
  return <span style={{ color }}>{value}</span>;
};

// Custom active shape for the pie chart
const renderActiveShape = (props: any) => {
  const RADIAN = Math.PI / 180;
  const {
    cx, cy, midAngle, innerRadius, outerRadius, startAngle, endAngle,
    fill, payload, percent, value
  } = props;
  
  const sin = Math.sin(-RADIAN * midAngle);
  const cos = Math.cos(-RADIAN * midAngle);
  const sx = cx + (outerRadius + 10) * cos;
  const sy = cy + (outerRadius + 10) * sin;
  const mx = cx + (outerRadius + 30) * cos;
  const my = cy + (outerRadius + 30) * sin;
  const ex = mx + (cos >= 0 ? 1 : -1) * 22;
  const ey = my;
  const textAnchor = cos >= 0 ? 'start' : 'end';

  return (
    <g>
      <text x={cx} y={cy} dy={8} textAnchor="middle" fill={fill}>
        {payload.name}
      </text>
      <Sector
        cx={cx}
        cy={cy}
        innerRadius={innerRadius}
        outerRadius={outerRadius}
        startAngle={startAngle}
        endAngle={endAngle}
        fill={fill}
      />
      <Sector
        cx={cx}
        cy={cy}
        startAngle={startAngle}
        endAngle={endAngle}
        innerRadius={outerRadius + 6}
        outerRadius={outerRadius + 10}
        fill={fill}
      />
      <path d={`M${sx},${sy}L${mx},${my}L${ex},${ey}`} stroke={fill} fill="none" />
      <circle cx={ex} cy={ey} r={2} fill={fill} stroke="none" />
      <text x={ex + (cos >= 0 ? 1 : -1) * 12} y={ey} textAnchor={textAnchor} fill="#333">{`${value} mins`}</text>
      <text x={ex + (cos >= 0 ? 1 : -1) * 12} y={ey} dy={18} textAnchor={textAnchor} fill="#999">
        {`(${(percent * 100).toFixed(2)}%)`}
      </text>
    </g>
  );
};

const COLORS = ['#8b5cf6', '#ec4899', '#f97316', '#0ea5e9', '#14b8a6', '#8b5cf6', '#a3e635', '#fbbf24'];

const PatternView: React.FC<PatternViewProps> = ({
  dateRange,
  selectedApps,
  activityTypes,
  searchQuery,
}) => {
  const [expandedPattern, setExpandedPattern] = useState<string | null>(null);
  const [activeAppIndex, setActiveAppIndex] = useState(0);
  
  // Generate workflow patterns
  const workflowPatterns = generateWorkflowPatterns();
  
  // Filter patterns based on selected apps and search query
  const filteredPatterns = workflowPatterns.filter(pattern => {
    // Filter by selected apps
    if (selectedApps.length > 0) {
      const hasSelectedApp = pattern.apps.some(app => selectedApps.includes(app));
      if (!hasSelectedApp) return false;
    }
    
    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      const matchesName = pattern.name.toLowerCase().includes(query);
      const matchesStep = pattern.steps.some(step => 
        step.action.toLowerCase().includes(query)
      );
      
      return matchesName || matchesStep;
    }
    
    return true;
  });
  
  const handlePatternClick = (patternId: string) => {
    setExpandedPattern(prev => prev === patternId ? null : patternId);
  };
  
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Application Usage Distribution</CardTitle>
            <CardDescription>
              Time spent in each application
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    activeIndex={activeAppIndex}
                    activeShape={renderActiveShape}
                    data={appUsageData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={90}
                    fill="#8884d8"
                    dataKey="value"
                    onMouseEnter={(_, index) => setActiveAppIndex(index)}
                  >
                    {appUsageData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Activity Patterns by Hour</CardTitle>
            <CardDescription>
              When you're most active throughout the day
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <RechartsBarChart data={activityByHourData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="hour" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="activities" fill="#8b5cf6" radius={[4, 4, 0, 0]}>
                    {activityByHourData.map((entry, index) => (
                      <Cell 
                        key={`cell-${index}`} 
                        fill={entry.activities > 40 ? '#8b5cf6' : '#d8b4fe'}
                      />
                    ))}
                  </Bar>
                </RechartsBarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Detected Workflow Patterns</CardTitle>
          <CardDescription>
            Repeated sequences of actions across applications
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredPatterns.length > 0 ? (
              filteredPatterns.map(pattern => (
                <Collapsible 
                  key={pattern.id}
                  open={expandedPattern === pattern.id}
                  onOpenChange={() => handlePatternClick(pattern.id)}
                  className="border rounded-lg overflow-hidden"
                >
                  <CollapsibleTrigger asChild>
                    <div className="flex items-center justify-between p-4 cursor-pointer hover:bg-muted/50 transition-colors">
                      <div className="flex items-center gap-3">
                        <div className={cn(
                          "w-10 h-10 rounded-full flex items-center justify-center",
                          pattern.efficiency > 0.8 ? "bg-green-100 text-green-600" :
                          pattern.efficiency > 0.6 ? "bg-yellow-100 text-yellow-600" :
                          "bg-orange-100 text-orange-600"
                        )}>
                          <Activity className="h-5 w-5" />
                        </div>
                        <div>
                          <h3 className="font-medium">{pattern.name}</h3>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                            <span className="flex items-center gap-1">
                              <BarChart className="h-3 w-3" />
                              {pattern.occurrences} occurrences
                            </span>
                            <span className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              ~{pattern.averageDuration} minutes
                            </span>
                            <span className="flex items-center gap-1">
                              <Zap className="h-3 w-3" />
                              {Math.round(pattern.efficiency * 100)}% efficient
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        {pattern.apps.slice(0, 3).map(appId => (
                          <TooltipProvider key={appId}>
                            <UITooltip>
                              <TooltipTrigger>
                                <AppIcon appId={appId} />
                              </TooltipTrigger>
                              <TooltipContent>
                                {availableApps.find(a => a.id === appId)?.name || appId}
                              </TooltipContent>
                            </UITooltip>
                          </TooltipProvider>
                        ))}
                        {pattern.apps.length > 3 && (
                          <TooltipProvider>
                            <UITooltip>
                              <TooltipTrigger>
                                <div className="w-6 h-6 rounded-full bg-muted flex items-center justify-center text-muted-foreground">
                                  +{pattern.apps.length - 3}
                                </div>
                              </TooltipTrigger>
                              <TooltipContent>
                                {pattern.apps.slice(3).map(appId => (
                                  <div key={appId}>
                                    {availableApps.find(a => a.id === appId)?.name || appId}
                                  </div>
                                ))}
                              </TooltipContent>
                            </UITooltip>
                          </TooltipProvider>
                        )}
                        {expandedPattern === pattern.id ? 
                          <ChevronDown className="h-5 w-5 text-muted-foreground" /> : 
                          <ChevronRight className="h-5 w-5 text-muted-foreground" />
                        }
                      </div>
                    </div>
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    <div className="p-4 pt-0 border-t">
                      <div className="py-4">
                        <h4 className="text-sm font-medium mb-3">Workflow Steps</h4>
                        <div className="space-y-3">
                          {pattern.steps.map((step, index) => (
                            <div key={index} className="flex items-center gap-3">
                              <AppIcon appId={step.app} />
                              <div className="flex-1">
                                <div className="flex items-center">
                                  <span className="text-sm">{step.action}</span>
                                  <Badge variant="outline" className="ml-2 text-xs">
                                    {availableApps.find(a => a.id === step.app)?.name || step.app}
                                  </Badge>
                                </div>
                              </div>
                              {index < pattern.steps.length - 1 && (
                                <ArrowRight className="h-4 w-4 text-muted-foreground" />
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                      
                      <div className="pt-2 border-t flex justify-end gap-2">
                        <Button variant="outline" size="sm">View Details</Button>
                        <Button variant="secondary" size="sm">Generate Insights</Button>
                        <Button variant="accent" size="sm">Automate Workflow</Button>
                      </div>
                    </div>
                  </CollapsibleContent>
                </Collapsible>
              ))
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                No workflow patterns matching your filters were found.
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PatternView;
