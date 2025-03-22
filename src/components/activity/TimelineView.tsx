
import React, { useState } from 'react';
import { format } from 'date-fns';
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle
} from '@/components/ui/card';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { 
  ChevronRight, 
  ChevronDown, 
  Clock, 
  MousePointer, 
  Keyboard, 
  Navigation,
  FileText,
  Search as SearchIcon,
  Copy
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent
} from '@/components/ui/chart';
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip as RechartsTooltip,
  XAxis,
  YAxis,
} from 'recharts';

interface TimelineViewProps {
  dateRange: { start: Date; end: Date };
  selectedApps: string[];
  activityTypes: string[];
  searchQuery: string;
}

// Sample data - in a real app, this would come from an API
const generateSampleData = (start: Date, end: Date) => {
  const daysBetween = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
  const data = [];
  
  for (let i = 0; i < daysBetween; i++) {
    const date = new Date(start);
    date.setDate(date.getDate() + i);
    
    data.push({
      date: format(date, 'yyyy-MM-dd'),
      clicks: Math.floor(Math.random() * 100) + 50,
      typing: Math.floor(Math.random() * 80) + 20,
      navigation: Math.floor(Math.random() * 60) + 10,
      fileOperations: Math.floor(Math.random() * 30) + 5,
      searchActions: Math.floor(Math.random() * 25) + 3,
      copyPaste: Math.floor(Math.random() * 40) + 15,
    });
  }
  
  return data;
};

// Generate sample timeline events
const generateTimelineEvents = (date: Date) => {
  const hours = [];
  // Generate 8 hours of work, starting from 9 AM
  for (let i = 0; i < 8; i++) {
    const hour = new Date(date);
    hour.setHours(9 + i, 0, 0, 0);
    
    const events = [];
    // 3-7 events per hour
    const eventCount = Math.floor(Math.random() * 5) + 3;
    
    for (let j = 0; j < eventCount; j++) {
      const eventTime = new Date(hour);
      eventTime.setMinutes(Math.floor(Math.random() * 60));
      
      const appIndex = Math.floor(Math.random() * availableApps.length);
      const typeIndex = Math.floor(Math.random() * availableActivityTypes.length);
      
      events.push({
        id: `event-${i}-${j}`,
        time: eventTime,
        app: availableApps[appIndex],
        type: availableActivityTypes[typeIndex],
        content: `Sample ${availableActivityTypes[typeIndex].name} in ${availableApps[appIndex].name}`,
        screenshot: `/placeholder.svg`,
      });
    }
    
    // Sort events by time
    events.sort((a, b) => a.time.getTime() - b.time.getTime());
    
    hours.push({
      hour,
      events,
    });
  }
  
  return hours;
};

// Sample apps and activity types from ActivityHeader
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

const availableActivityTypes = [
  { id: 'click', name: 'Mouse Clicks' },
  { id: 'typing', name: 'Keyboard Typing' },
  { id: 'navigation', name: 'Navigation' },
  { id: 'file_access', name: 'File Operations' },
  { id: 'search', name: 'Search Actions' },
  { id: 'copy_paste', name: 'Copy & Paste' },
];

// Get the appropriate icon for an activity type
const getActivityTypeIcon = (typeId: string) => {
  switch (typeId) {
    case 'click':
      return <MousePointer className="h-4 w-4" />;
    case 'typing':
      return <Keyboard className="h-4 w-4" />;
    case 'navigation':
      return <Navigation className="h-4 w-4" />;
    case 'file_access':
      return <FileText className="h-4 w-4" />;
    case 'search':
      return <SearchIcon className="h-4 w-4" />;
    case 'copy_paste':
      return <Copy className="h-4 w-4" />;
    default:
      return <Clock className="h-4 w-4" />;
  }
};

const TimelineView: React.FC<TimelineViewProps> = ({
  dateRange,
  selectedApps,
  activityTypes,
  searchQuery,
}) => {
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [expandedHours, setExpandedHours] = useState<{ [key: string]: boolean }>({});
  const [selectedEvent, setSelectedEvent] = useState<string | null>(null);
  
  // Generate sample chart data based on date range
  const activityData = generateSampleData(dateRange.start, dateRange.end);
  
  // Filter chartData based on selected activity types or show all if none selected
  const chartData = activityData.map(day => {
    const filteredDay: { [key: string]: any } = { date: day.date };
    
    if (activityTypes.length === 0) {
      // No filters, include all types
      return day;
    }
    
    // Include only selected activity types
    if (activityTypes.includes('click')) filteredDay.clicks = day.clicks;
    if (activityTypes.includes('typing')) filteredDay.typing = day.typing;
    if (activityTypes.includes('navigation')) filteredDay.navigation = day.navigation;
    if (activityTypes.includes('file_access')) filteredDay.fileOperations = day.fileOperations;
    if (activityTypes.includes('search')) filteredDay.searchActions = day.searchActions;
    if (activityTypes.includes('copy_paste')) filteredDay.copyPaste = day.copyPaste;
    
    return filteredDay;
  });
  
  // Generate timeline events for the selected date
  let timelineEvents = selectedDate ? generateTimelineEvents(selectedDate) : [];
  
  // Filter timeline events if apps or activity types are selected
  if (selectedApps.length > 0 || activityTypes.length > 0 || searchQuery) {
    timelineEvents = timelineEvents.map(hour => {
      let filteredEvents = hour.events;
      
      if (selectedApps.length > 0) {
        filteredEvents = filteredEvents.filter(event => 
          selectedApps.includes(event.app.id)
        );
      }
      
      if (activityTypes.length > 0) {
        filteredEvents = filteredEvents.filter(event => 
          activityTypes.includes(event.type.id)
        );
      }
      
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        filteredEvents = filteredEvents.filter(event => 
          event.content.toLowerCase().includes(query) ||
          event.app.name.toLowerCase().includes(query) ||
          event.type.name.toLowerCase().includes(query)
        );
      }
      
      return {
        ...hour,
        events: filteredEvents
      };
    });
  }
  
  const toggleHour = (hourKey: string) => {
    setExpandedHours(prev => ({
      ...prev,
      [hourKey]: !prev[hourKey]
    }));
  };
  
  const handleDateClick = (date: string) => {
    setSelectedDate(new Date(date));
    // Reset expanded hours when changing date
    setExpandedHours({});
  };
  
  const handleEventClick = (eventId: string) => {
    setSelectedEvent(prev => prev === eventId ? null : eventId);
  };
  
  return (
    <div className="flex flex-col space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Activity Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[300px]">
            <ChartContainer
              config={{
                clicks: { label: "Mouse Clicks", color: "#8b5cf6" },
                typing: { label: "Keyboard Typing", color: "#ec4899" },
                navigation: { label: "Navigation", color: "#f97316" },
                fileOperations: { label: "File Operations", color: "#0ea5e9" },
                searchActions: { label: "Search Actions", color: "#14b8a6" },
                copyPaste: { label: "Copy & Paste", color: "#8b5cf6" },
              }}
            >
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="date" 
                  tick={{ fontSize: 12 }} 
                  tickMargin={10}
                />
                <YAxis tick={{ fontSize: 12 }} />
                <ChartTooltip content={<ChartTooltipContent nameKey="name" />} />
                
                {(activityTypes.length === 0 || activityTypes.includes('click')) && (
                  <Line 
                    type="monotone" 
                    dataKey="clicks" 
                    name="clicks" 
                    stroke="#8b5cf6" 
                    activeDot={{ r: 8, onClick: (data) => handleDateClick(data.payload.date) }}
                    strokeWidth={2}
                  />
                )}
                {(activityTypes.length === 0 || activityTypes.includes('typing')) && (
                  <Line 
                    type="monotone" 
                    dataKey="typing" 
                    name="typing" 
                    stroke="#ec4899" 
                    activeDot={{ r: 8, onClick: (data) => handleDateClick(data.payload.date) }}
                    strokeWidth={2}
                  />
                )}
                {(activityTypes.length === 0 || activityTypes.includes('navigation')) && (
                  <Line 
                    type="monotone" 
                    dataKey="navigation" 
                    name="navigation" 
                    stroke="#f97316" 
                    activeDot={{ r: 8, onClick: (data) => handleDateClick(data.payload.date) }}
                    strokeWidth={2}
                  />
                )}
                {(activityTypes.length === 0 || activityTypes.includes('file_access')) && (
                  <Line 
                    type="monotone" 
                    dataKey="fileOperations" 
                    name="fileOperations" 
                    stroke="#0ea5e9" 
                    activeDot={{ r: 8, onClick: (data) => handleDateClick(data.payload.date) }}
                    strokeWidth={2}
                  />
                )}
                {(activityTypes.length === 0 || activityTypes.includes('search')) && (
                  <Line 
                    type="monotone" 
                    dataKey="searchActions" 
                    name="searchActions" 
                    stroke="#14b8a6" 
                    activeDot={{ r: 8, onClick: (data) => handleDateClick(data.payload.date) }}
                    strokeWidth={2}
                  />
                )}
                {(activityTypes.length === 0 || activityTypes.includes('copy_paste')) && (
                  <Line 
                    type="monotone" 
                    dataKey="copyPaste" 
                    name="copyPaste" 
                    stroke="#8b5cf6" 
                    activeDot={{ r: 8, onClick: (data) => handleDateClick(data.payload.date) }}
                    strokeWidth={2}
                  />
                )}
              </LineChart>
            </ChartContainer>
          </div>
          <div className="text-xs text-center mt-2 text-muted-foreground">
            Click on any data point to view detailed timeline for that day
          </div>
        </CardContent>
      </Card>
      
      {selectedDate && (
        <Card>
          <CardHeader className="pb-3">
            <div className="flex justify-between items-center">
              <CardTitle>
                Timeline for {format(selectedDate, 'MMMM d, yyyy')}
              </CardTitle>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => setSelectedDate(null)}
              >
                Close
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {timelineEvents.map((hour, index) => {
                const hourKey = `hour-${index}`;
                const isExpanded = expandedHours[hourKey] ?? false;
                
                // Skip hours with no events after filtering
                if (hour.events.length === 0) return null;
                
                return (
                  <div key={hourKey} className="border rounded-md overflow-hidden">
                    <div 
                      className="flex items-center justify-between p-3 bg-muted/30 cursor-pointer"
                      onClick={() => toggleHour(hourKey)}
                    >
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium">
                          {format(hour.hour, 'h:mm a')}
                        </span>
                        <Badge variant="outline" className="ml-2">
                          {hour.events.length} activities
                        </Badge>
                      </div>
                      {isExpanded ? 
                        <ChevronDown className="h-5 w-5 text-muted-foreground" /> : 
                        <ChevronRight className="h-5 w-5 text-muted-foreground" />
                      }
                    </div>
                    
                    {isExpanded && (
                      <div className="divide-y">
                        {hour.events.map((event) => (
                          <div key={event.id} className="p-3">
                            <div 
                              className={`flex justify-between items-start cursor-pointer ${
                                selectedEvent === event.id ? 'pb-3' : ''
                              }`}
                              onClick={() => handleEventClick(event.id)}
                            >
                              <div className="flex items-start gap-3">
                                <div className="flex flex-col items-center">
                                  <div className="text-xs text-muted-foreground">
                                    {format(event.time, 'h:mm a')}
                                  </div>
                                  <div className="mt-1 bg-accent/15 text-accent rounded-full p-1.5">
                                    {getActivityTypeIcon(event.type.id)}
                                  </div>
                                </div>
                                
                                <div>
                                  <div className="flex items-center gap-2">
                                    <Badge variant="outline" className="bg-background">
                                      {event.app.name}
                                    </Badge>
                                    <Badge variant="outline" className="bg-background">
                                      {event.type.name}
                                    </Badge>
                                  </div>
                                  <p className="mt-1 text-sm">{event.content}</p>
                                </div>
                              </div>
                              
                              <Button 
                                variant="ghost" 
                                size="sm" 
                                className="h-6 w-6 p-0"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleEventClick(event.id);
                                }}
                              >
                                {selectedEvent === event.id ? 
                                  <ChevronDown className="h-4 w-4" /> : 
                                  <ChevronRight className="h-4 w-4" />
                                }
                              </Button>
                            </div>
                            
                            {selectedEvent === event.id && (
                              <div className="animate-fade-in mt-2">
                                <div className="border rounded-md overflow-hidden">
                                  <img 
                                    src={event.screenshot} 
                                    alt="Screenshot" 
                                    className="w-full h-auto max-h-[200px] object-cover"
                                  />
                                </div>
                                <div className="mt-2 flex gap-2 justify-end">
                                  <Button variant="outline" size="sm">
                                    View Details
                                  </Button>
                                  <TooltipProvider>
                                    <Tooltip>
                                      <TooltipTrigger asChild>
                                        <Button variant="secondary" size="sm">
                                          Analyze Pattern
                                        </Button>
                                      </TooltipTrigger>
                                      <TooltipContent>
                                        <p>Find similar patterns in your workflow</p>
                                      </TooltipContent>
                                    </Tooltip>
                                  </TooltipProvider>
                                </div>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
              
              {timelineEvents.filter(hour => hour.events.length > 0).length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  No activities found for the selected filters.
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default TimelineView;
