
import React, { useState } from 'react';
import { format } from 'date-fns';
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
  Search, 
  Filter, 
  Calendar, 
  ArrowUp,
  ArrowDown,
  MoreHorizontal, 
  FileText,
  Clipboard,
  Eye,
  MousePointer, 
  Keyboard, 
  Navigation
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { cn } from '@/lib/utils';

interface ActivityLogViewProps {
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

// Sample activity types
const availableActivityTypes = [
  { id: 'click', name: 'Mouse Clicks', icon: MousePointer },
  { id: 'typing', name: 'Keyboard Typing', icon: Keyboard },
  { id: 'navigation', name: 'Navigation', icon: Navigation },
  { id: 'file_access', name: 'File Operations', icon: FileText },
  { id: 'search', name: 'Search Actions', icon: Search },
  { id: 'copy_paste', name: 'Copy & Paste', icon: Clipboard },
];

// Generate sample activity log entries
const generateActivityLogEntries = (startDate: Date, endDate: Date) => {
  const activities = [];
  const diffDays = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
  
  for (let i = 0; i < 50; i++) {
    const randomDay = Math.floor(Math.random() * diffDays);
    const date = new Date(startDate);
    date.setDate(date.getDate() + randomDay);
    date.setHours(9 + Math.floor(Math.random() * 8), Math.floor(Math.random() * 60), 0, 0);
    
    const appIndex = Math.floor(Math.random() * availableApps.length);
    const typeIndex = Math.floor(Math.random() * availableActivityTypes.length);
    
    activities.push({
      id: `activity-${i}`,
      timestamp: date,
      app: availableApps[appIndex],
      type: availableActivityTypes[typeIndex],
      description: `${availableActivityTypes[typeIndex].name} in ${availableApps[appIndex].name}`,
      details: {
        title: `Sample ${availableActivityTypes[typeIndex].name}`,
        location: Math.random() > 0.5 ? 'Local' : 'Remote',
        duration: Math.floor(Math.random() * 20) + 1,
        relatedActivities: Math.floor(Math.random() * 5),
      },
      screenshot: '/placeholder.svg',
    });
  }
  
  // Sort by timestamp, newest first
  return activities.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
};

const ActivityLogView: React.FC<ActivityLogViewProps> = ({
  dateRange,
  selectedApps,
  activityTypes,
  searchQuery,
}) => {
  const [sortOrder, setSortOrder] = useState<'newest' | 'oldest'>('newest');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedEntry, setSelectedEntry] = useState<string | null>(null);
  const [localSearch, setLocalSearch] = useState(searchQuery);
  
  // Generate sample data
  const allActivities = generateActivityLogEntries(dateRange.start, dateRange.end);
  
  // Filter activities based on selected criteria
  const filteredActivities = allActivities.filter(activity => {
    // Filter by date range
    const timestamp = activity.timestamp.getTime();
    if (timestamp < dateRange.start.getTime() || timestamp > dateRange.end.getTime()) {
      return false;
    }
    
    // Filter by selected apps
    if (selectedApps.length > 0 && !selectedApps.includes(activity.app.id)) {
      return false;
    }
    
    // Filter by activity types
    if (activityTypes.length > 0 && !activityTypes.includes(activity.type.id)) {
      return false;
    }
    
    // Filter by search query (main filter from ActivityHeader)
    if (searchQuery && !activity.description.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false;
    }
    
    // Filter by local search (specific to ActivityLogView)
    if (localSearch && !activity.description.toLowerCase().includes(localSearch.toLowerCase())) {
      return false;
    }
    
    return true;
  });
  
  // Sort activities
  const sortedActivities = [...filteredActivities].sort((a, b) => {
    if (sortOrder === 'newest') {
      return b.timestamp.getTime() - a.timestamp.getTime();
    } else {
      return a.timestamp.getTime() - b.timestamp.getTime();
    }
  });
  
  // Pagination
  const itemsPerPage = 10;
  const totalPages = Math.ceil(sortedActivities.length / itemsPerPage);
  const paginatedActivities = sortedActivities.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );
  
  const toggleSortOrder = () => {
    setSortOrder(sortOrder === 'newest' ? 'oldest' : 'newest');
  };
  
  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="pb-2">
          <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
            <div>
              <CardTitle>Activity Log</CardTitle>
              <CardDescription className="mt-1">
                Detailed record of your captured activities
              </CardDescription>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-2">
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search within log..."
                  className="pl-9 h-9"
                  value={localSearch}
                  onChange={(e) => setLocalSearch(e.target.value)}
                />
              </div>
              
              <Button 
                variant="outline" 
                size="sm" 
                className="h-9"
                onClick={toggleSortOrder}
              >
                {sortOrder === 'newest' ? (
                  <>
                    <ArrowDown className="mr-1 h-4 w-4" />
                    Newest first
                  </>
                ) : (
                  <>
                    <ArrowUp className="mr-1 h-4 w-4" />
                    Oldest first
                  </>
                )}
              </Button>
            </div>
          </div>
        </CardHeader>
        
        <CardContent>
          {paginatedActivities.length > 0 ? (
            <div className="space-y-2">
              {paginatedActivities.map((activity) => (
                <Dialog key={activity.id}>
                  <div 
                    className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/30 transition-colors cursor-pointer"
                    onClick={() => setSelectedEntry(activity.id)}
                  >
                    <div className="flex items-center gap-3">
                      <div className="bg-accent/10 text-accent p-2 rounded-full">
                        <activity.type.icon className="h-4 w-4" />
                      </div>
                      
                      <div>
                        <div className="font-medium">{activity.description}</div>
                        <div className="text-sm text-muted-foreground">
                          {format(activity.timestamp, 'MMM d, yyyy - h:mm a')}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">
                        {activity.app.name}
                      </Badge>
                      
                      <DialogTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <Eye className="h-4 w-4" />
                        </Button>
                      </DialogTrigger>
                      
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem>View Details</DropdownMenuItem>
                          <DropdownMenuItem>Find Related Activities</DropdownMenuItem>
                          <DropdownMenuItem>Export as PDF</DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem className="text-destructive">Delete</DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                  
                  <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                      <DialogTitle>{activity.description}</DialogTitle>
                      <DialogDescription>
                        Recorded on {format(activity.timestamp, 'MMMM d, yyyy - h:mm a')}
                      </DialogDescription>
                    </DialogHeader>
                    
                    <div className="space-y-4">
                      <div className="rounded-md overflow-hidden border">
                        <img 
                          src={activity.screenshot} 
                          alt="Activity Screenshot" 
                          className="w-full h-auto object-cover"
                        />
                      </div>
                      
                      <div className="grid grid-cols-2 gap-3 text-sm">
                        <div>
                          <div className="text-muted-foreground">Application</div>
                          <div className="font-medium">{activity.app.name}</div>
                        </div>
                        <div>
                          <div className="text-muted-foreground">Activity Type</div>
                          <div className="font-medium">{activity.type.name}</div>
                        </div>
                        <div>
                          <div className="text-muted-foreground">Duration</div>
                          <div className="font-medium">{activity.details.duration} seconds</div>
                        </div>
                        <div>
                          <div className="text-muted-foreground">Related Activities</div>
                          <div className="font-medium">{activity.details.relatedActivities}</div>
                        </div>
                      </div>
                      
                      <div className="flex justify-end gap-2">
                        <Button variant="outline" size="sm">Add to Pattern</Button>
                        <Button variant="secondary" size="sm">View Timeline</Button>
                        <Button size="sm">Analyze</Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              No activity log entries match your search criteria.
            </div>
          )}
        </CardContent>
        
        {totalPages > 1 && (
          <CardFooter className="flex justify-between items-center py-4">
            <div className="text-sm text-muted-foreground">
              Showing {(currentPage - 1) * itemsPerPage + 1} to {Math.min(currentPage * itemsPerPage, filteredActivities.length)} of {filteredActivities.length} entries
            </div>
            
            <div className="flex gap-1">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
              >
                Previous
              </Button>
              
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
              >
                Next
              </Button>
            </div>
          </CardFooter>
        )}
      </Card>
    </div>
  );
};

export default ActivityLogView;
