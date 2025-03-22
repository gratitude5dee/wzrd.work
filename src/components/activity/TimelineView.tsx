
import React, { useState } from 'react';
import { DateRange } from 'react-day-picker';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Clock, MousePointer, Keyboard, Navigation, Info, ExternalLink } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { format } from 'date-fns';

// Types for our timeline data
interface TimelineEvent {
  id: string;
  timestamp: Date;
  application: string;
  activityType: string;
  description: string;
  screenshotUrl?: string;
  duration?: number;
  importance: 'low' | 'medium' | 'high';
}

interface TimelineGroup {
  date: Date;
  events: TimelineEvent[];
}

interface TimelineViewProps {
  dateRange: DateRange;
  selectedApps: string[];
  activityTypes: string[];
  searchQuery: string;
}

const TimelineView: React.FC<TimelineViewProps> = ({
  dateRange,
  selectedApps,
  activityTypes,
  searchQuery
}) => {
  // Mock timeline data - in a real application, this would come from an API
  const [timelineData, setTimelineData] = useState<TimelineGroup[]>([
    {
      date: new Date(Date.now() - 86400000), // Yesterday
      events: [
        {
          id: '1',
          timestamp: new Date(Date.now() - 86400000 + 32400000), // 9 AM yesterday
          application: 'chrome',
          activityType: 'navigation',
          description: 'Browsed https://docs.google.com/',
          screenshotUrl: 'https://placehold.co/600x400',
          duration: 1200, // 20 minutes
          importance: 'medium'
        },
        {
          id: '2',
          timestamp: new Date(Date.now() - 86400000 + 39600000), // 11 AM yesterday
          application: 'vscode',
          activityType: 'typing',
          description: 'Edited main.tsx, added new component structure',
          screenshotUrl: 'https://placehold.co/600x400',
          duration: 3600, // 1 hour
          importance: 'high'
        },
        {
          id: '3',
          timestamp: new Date(Date.now() - 86400000 + 50400000), // 2 PM yesterday
          application: 'slack',
          activityType: 'click',
          description: 'Participated in team discussion about project timeline',
          screenshotUrl: 'https://placehold.co/600x400',
          duration: 1800, // 30 minutes
          importance: 'medium'
        }
      ]
    },
    {
      date: new Date(), // Today
      events: [
        {
          id: '4',
          timestamp: new Date(Date.now() - 18000000), // 5 hours ago
          application: 'figma',
          activityType: 'click',
          description: 'Created new design for Activity Dashboard',
          screenshotUrl: 'https://placehold.co/600x400',
          duration: 5400, // 1.5 hours
          importance: 'high'
        },
        {
          id: '5',
          timestamp: new Date(Date.now() - 7200000), // 2 hours ago
          application: 'terminal',
          activityType: 'typing',
          description: 'Ran npm install and project setup commands',
          screenshotUrl: 'https://placehold.co/600x400',
          duration: 600, // 10 minutes
          importance: 'low'
        },
        {
          id: '6',
          timestamp: new Date(Date.now() - 3600000), // 1 hour ago
          application: 'notion',
          activityType: 'typing',
          description: 'Updated project documentation with new features',
          screenshotUrl: 'https://placehold.co/600x400',
          duration: 1800, // 30 minutes
          importance: 'medium'
        },
        {
          id: '7',
          timestamp: new Date(Date.now() - 1800000), // 30 minutes ago
          application: 'zoom',
          activityType: 'navigation',
          description: 'Team meeting to discuss progress',
          screenshotUrl: 'https://placehold.co/600x400',
          duration: 1800, // 30 minutes
          importance: 'medium'
        }
      ]
    }
  ]);

  // Filter the timeline data based on user selections
  const filteredTimelineData = timelineData
    .map(group => {
      // Filter events based on all criteria
      const filteredEvents = group.events.filter(event => {
        // Date range filter
        if (dateRange.from && event.timestamp < dateRange.from) return false;
        if (dateRange.to && event.timestamp > dateRange.to) return false;
        
        // App filter
        if (selectedApps.length > 0 && !selectedApps.includes(event.application)) return false;
        
        // Activity type filter
        if (activityTypes.length > 0 && !activityTypes.includes(event.activityType)) return false;
        
        // Search query filter (case insensitive)
        if (searchQuery && !event.description.toLowerCase().includes(searchQuery.toLowerCase())) return false;
        
        return true;
      });

      return {
        date: group.date,
        events: filteredEvents
      };
    })
    .filter(group => group.events.length > 0); // Remove empty groups

  // Helper function to format duration in a readable way
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
        return <Info className="h-4 w-4" />;
    }
  };

  // Helper function to get color for importance
  const getImportanceColor = (importance: 'low' | 'medium' | 'high') => {
    switch (importance) {
      case 'low':
        return 'text-gray-400';
      case 'medium':
        return 'text-blue-500';
      case 'high':
        return 'text-purple-500';
    }
  };

  return (
    <ScrollArea className="h-full max-h-[calc(100vh-250px)]">
      <div className="space-y-8 p-2">
        {filteredTimelineData.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64">
            <Clock className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium">No activities found</h3>
            <p className="text-sm text-muted-foreground text-center max-w-md mt-2">
              Try adjusting your filters or selecting a different date range to see more activities.
            </p>
          </div>
        ) : (
          filteredTimelineData.map((group, groupIndex) => (
            <div key={groupIndex} className="relative">
              <div className="sticky top-0 z-10 mb-4 bg-background/95 backdrop-blur">
                <div className="flex items-center">
                  <div className="flex-1 flex items-center">
                    <Badge variant="outline" className="text-xs font-mono px-2 py-0.5">
                      {format(group.date, 'EEEE, MMMM d, yyyy')}
                    </Badge>
                    <div className="h-px flex-1 mx-2 bg-border"></div>
                  </div>
                </div>
              </div>
              
              <div className="space-y-4 pl-0 sm:pl-6">
                {group.events.map((event, eventIndex) => (
                  <div key={event.id} className="relative">
                    {/* Timeline connector */}
                    {eventIndex < group.events.length - 1 && (
                      <div className="absolute left-[19px] top-10 bottom-0 w-0.5 bg-border hidden sm:block" />
                    )}
                    
                    <div className="flex gap-4">
                      {/* Timeline dot and time */}
                      <div className="flex-none hidden sm:flex flex-col items-center mt-1">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 ${getImportanceColor(event.importance)}`}>
                          {getActivityIcon(event.activityType)}
                        </div>
                        <span className="text-xs font-mono text-muted-foreground mt-1">
                          {format(event.timestamp, 'HH:mm')}
                        </span>
                      </div>
                      
                      {/* Card with event details */}
                      <Card className="flex-1 transition-all duration-200 hover:shadow-md">
                        <CardHeader className="p-4 pb-2">
                          <div className="flex justify-between items-start">
                            <div>
                              <div className="flex items-center gap-2">
                                <Badge 
                                  variant="outline"
                                  className="capitalize text-xs"
                                >{event.application}</Badge>
                                
                                <Badge 
                                  variant="outline"
                                  className="capitalize text-xs flex items-center gap-1"
                                >
                                  {getActivityIcon(event.activityType)}
                                  {event.activityType}
                                </Badge>
                                
                                <span className="text-xs font-mono text-muted-foreground sm:hidden">
                                  {format(event.timestamp, 'HH:mm')}
                                </span>
                              </div>
                              <CardTitle className="text-sm mt-2 font-medium">
                                {event.description}
                              </CardTitle>
                            </div>
                            
                            {event.duration && (
                              <Badge variant="secondary" className="flex-none">
                                <Clock className="mr-1 h-3 w-3" /> 
                                {formatDuration(event.duration)}
                              </Badge>
                            )}
                          </div>
                        </CardHeader>
                        
                        {event.screenshotUrl && (
                          <CardContent className="p-4 pt-2">
                            <div className="relative aspect-video w-full overflow-hidden rounded-md bg-muted">
                              <img 
                                src={event.screenshotUrl} 
                                alt="Activity screenshot" 
                                className="object-cover transition-all hover:scale-105"
                              />
                              <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 hover:opacity-100 transition-opacity">
                                <Button 
                                  variant="outline" 
                                  size="sm" 
                                  className="absolute bottom-2 right-2 bg-background/80 backdrop-blur-sm"
                                >
                                  <ExternalLink className="h-3.5 w-3.5 mr-1" />
                                  <span className="text-xs">View Details</span>
                                </Button>
                              </div>
                            </div>
                          </CardContent>
                        )}
                      </Card>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))
        )}
      </div>
    </ScrollArea>
  );
};

export default TimelineView;
