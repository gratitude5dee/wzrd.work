
import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar, Clock, Search, Activity, Lightbulb } from "lucide-react";
import TimelineView from './TimelineView';
import PatternView from './PatternView';
import ActivityLogView from './ActivityLogView';
import InsightsView from './InsightsView';
import ActivityHeader from './ActivityHeader';

const ActivityTab: React.FC = () => {
  const [dateRange, setDateRange] = useState<{start: Date, end: Date}>({
    start: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // One week ago
    end: new Date()
  });
  
  const [selectedApps, setSelectedApps] = useState<string[]>([]);
  const [activityTypes, setActivityTypes] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  
  const handleDateRangeChange = (range: {start: Date, end: Date}) => {
    setDateRange(range);
  };
  
  const handleAppFilter = (apps: string[]) => {
    setSelectedApps(apps);
  };
  
  const handleActivityTypeFilter = (types: string[]) => {
    setActivityTypes(types);
  };
  
  const handleSearch = (query: string) => {
    setSearchQuery(query);
  };
  
  return (
    <div className="flex flex-col h-full space-y-4">
      <ActivityHeader 
        dateRange={dateRange}
        onDateRangeChange={handleDateRangeChange}
        selectedApps={selectedApps}
        onAppFilterChange={handleAppFilter}
        activityTypes={activityTypes}
        onActivityTypeFilterChange={handleActivityTypeFilter}
        searchQuery={searchQuery}
        onSearchChange={handleSearch}
      />
      
      <Tabs defaultValue="timeline" className="flex-1 flex flex-col">
        <TabsList className="grid grid-cols-4 w-full">
          <TabsTrigger value="timeline" className="flex items-center gap-2">
            <Clock className="h-4 w-4" />
            <span>Timeline</span>
          </TabsTrigger>
          <TabsTrigger value="patterns" className="flex items-center gap-2">
            <Activity className="h-4 w-4" />
            <span>Patterns</span>
          </TabsTrigger>
          <TabsTrigger value="activity-log" className="flex items-center gap-2">
            <Search className="h-4 w-4" />
            <span>Activity Log</span>
          </TabsTrigger>
          <TabsTrigger value="insights" className="flex items-center gap-2">
            <Lightbulb className="h-4 w-4" />
            <span>Insights</span>
          </TabsTrigger>
        </TabsList>
        
        <div className="flex-1 overflow-hidden">
          <TabsContent value="timeline" className="h-full overflow-auto p-2">
            <TimelineView 
              dateRange={dateRange} 
              selectedApps={selectedApps}
              activityTypes={activityTypes}
              searchQuery={searchQuery}
            />
          </TabsContent>
          
          <TabsContent value="patterns" className="h-full overflow-auto p-2">
            <PatternView 
              dateRange={dateRange} 
              selectedApps={selectedApps}
              activityTypes={activityTypes}
              searchQuery={searchQuery}
            />
          </TabsContent>
          
          <TabsContent value="activity-log" className="h-full overflow-auto p-2">
            <ActivityLogView 
              dateRange={dateRange} 
              selectedApps={selectedApps}
              activityTypes={activityTypes}
              searchQuery={searchQuery}
            />
          </TabsContent>
          
          <TabsContent value="insights" className="h-full overflow-auto p-2">
            <InsightsView 
              dateRange={dateRange} 
              selectedApps={selectedApps}
              activityTypes={activityTypes}
              searchQuery={searchQuery}
            />
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
};

export default ActivityTab;
