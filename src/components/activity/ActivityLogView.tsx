
import React, { useState } from 'react';
import { DateRange } from 'react-day-picker';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  Check, 
  ChevronDown, 
  ChevronLeft, 
  ChevronRight, 
  Clock, 
  ExternalLink, 
  Filter, 
  Eye,
  MousePointer,
  Keyboard,
  Navigation
} from "lucide-react";
import { format } from 'date-fns';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuCheckboxItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";

interface ActivityLogViewProps {
  dateRange: DateRange;
  selectedApps: string[];
  activityTypes: string[];
  searchQuery: string;
}

// Types for activity log
interface ActivityLogEntry {
  id: string;
  timestamp: Date;
  application: string;
  activityType: string;
  description: string;
  duration?: number;
  screenshot?: string;
  metadata?: Record<string, any>;
}

const ActivityLogView: React.FC<ActivityLogViewProps> = ({
  dateRange,
  selectedApps,
  activityTypes,
  searchQuery
}) => {
  // State for pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  
  // State for column visibility
  const [visibleColumns, setVisibleColumns] = useState({
    timestamp: true,
    application: true,
    activityType: true,
    description: true,
    duration: true,
    actions: true,
  });
  
  // State for detail dialog
  const [selectedActivity, setSelectedActivity] = useState<ActivityLogEntry | null>(null);
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);
  
  // Mock activity log data - in a real application, this would come from an API
  const [activityLogData, setActivityLogData] = useState<ActivityLogEntry[]>(
    Array(50).fill(null).map((_, index) => {
      const daysAgo = Math.floor(Math.random() * 14); // Random day in the last 2 weeks
      const hoursAgo = Math.floor(Math.random() * 24); // Random hour in the day
      
      const applications = ['chrome', 'vscode', 'slack', 'terminal', 'notion', 'figma', 'zoom', 'excel'];
      const activityTypesOptions = ['click', 'typing', 'navigation', 'scrolling'];
      
      const descriptionTemplates = [
        'Opened {app} application',
        'Edited document in {app}',
        'Navigated to website in {app}',
        'Ran command in {app}',
        'Created new file in {app}',
        'Switched between tabs in {app}',
        'Searched for content in {app}',
        'Reviewed messages in {app}'
      ];
      
      const application = applications[Math.floor(Math.random() * applications.length)];
      const type = activityTypesOptions[Math.floor(Math.random() * activityTypesOptions.length)];
      const description = descriptionTemplates[Math.floor(Math.random() * descriptionTemplates.length)]
        .replace('{app}', application);
      
      return {
        id: `log-${index}`,
        timestamp: new Date(Date.now() - (daysAgo * 24 * 3600 * 1000) - (hoursAgo * 3600 * 1000)),
        application: application,
        activityType: type,
        description: description,
        duration: Math.floor(Math.random() * 600) + 10, // 10-610 seconds
        screenshot: Math.random() > 0.3 ? 'https://placehold.co/600x400' : undefined,
        metadata: {
          url: type === 'navigation' ? 'https://example.com' : undefined,
          keystrokes: type === 'typing' ? Math.floor(Math.random() * 200) + 10 : undefined,
          clicks: type === 'click' ? Math.floor(Math.random() * 10) + 1 : undefined,
          fileType: application === 'vscode' ? '.tsx' : undefined,
        }
      };
    })
  );
  
  // Filter the activity log data
  const filteredData = activityLogData.filter(entry => {
    // Date range filter
    if (dateRange.from && entry.timestamp < dateRange.from) return false;
    if (dateRange.to && entry.timestamp > dateRange.to) return false;
    
    // App filter
    if (selectedApps.length > 0 && !selectedApps.includes(entry.application)) return false;
    
    // Activity type filter
    if (activityTypes.length > 0 && !activityTypes.includes(entry.activityType)) return false;
    
    // Search query filter (case insensitive)
    if (searchQuery && !entry.description.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    
    return true;
  });
  
  // Sort filtered data by timestamp (newest first)
  const sortedData = [...filteredData].sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
  
  // Paginate the data
  const totalPages = Math.ceil(sortedData.length / pageSize);
  const paginatedData = sortedData.slice((currentPage - 1) * pageSize, currentPage * pageSize);
  
  // Helper functions
  const formatDuration = (seconds?: number) => {
    if (!seconds) return '-';
    if (seconds < 60) return `${seconds}s`;
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ${seconds % 60}s`;
    
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${hours}h ${minutes}m`;
  };
  
  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'click':
        return <MousePointer className="h-4 w-4" />;
      case 'typing':
        return <Keyboard className="h-4 w-4" />;
      case 'navigation':
        return <Navigation className="h-4 w-4" />;
      default:
        return <Eye className="h-4 w-4" />;
    }
  };
  
  const handleViewDetails = (activity: ActivityLogEntry) => {
    setSelectedActivity(activity);
    setDetailDialogOpen(true);
  };
  
  const toggleColumnVisibility = (column: keyof typeof visibleColumns) => {
    setVisibleColumns(prev => ({
      ...prev,
      [column]: !prev[column]
    }));
  };
  
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div className="text-sm text-muted-foreground">
          {filteredData.length} activities found
        </div>
        
        <div className="flex items-center gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="h-8 flex items-center gap-1">
                <Filter className="h-3.5 w-3.5" />
                <span>Columns</span>
                <ChevronDown className="h-3.5 w-3.5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-40">
              <DropdownMenuLabel>Toggle Columns</DropdownMenuLabel>
              <DropdownMenuSeparator />
              
              <DropdownMenuCheckboxItem
                checked={visibleColumns.timestamp}
                onCheckedChange={() => toggleColumnVisibility('timestamp')}
              >
                Timestamp
              </DropdownMenuCheckboxItem>
              
              <DropdownMenuCheckboxItem
                checked={visibleColumns.application}
                onCheckedChange={() => toggleColumnVisibility('application')}
              >
                Application
              </DropdownMenuCheckboxItem>
              
              <DropdownMenuCheckboxItem
                checked={visibleColumns.activityType}
                onCheckedChange={() => toggleColumnVisibility('activityType')}
              >
                Activity Type
              </DropdownMenuCheckboxItem>
              
              <DropdownMenuCheckboxItem
                checked={visibleColumns.description}
                onCheckedChange={() => toggleColumnVisibility('description')}
              >
                Description
              </DropdownMenuCheckboxItem>
              
              <DropdownMenuCheckboxItem
                checked={visibleColumns.duration}
                onCheckedChange={() => toggleColumnVisibility('duration')}
              >
                Duration
              </DropdownMenuCheckboxItem>
              
              <DropdownMenuCheckboxItem
                checked={visibleColumns.actions}
                onCheckedChange={() => toggleColumnVisibility('actions')}
              >
                Actions
              </DropdownMenuCheckboxItem>
            </DropdownMenuContent>
          </DropdownMenu>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="h-8 w-16 flex justify-between items-center">
                <span>{pageSize}</span>
                <ChevronDown className="h-3.5 w-3.5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Rows per page</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {[10, 25, 50, 100].map(size => (
                <DropdownMenuItem 
                  key={size}
                  onClick={() => {
                    setPageSize(size);
                    setCurrentPage(1); // Reset to page 1 when changing page size
                  }}
                >
                  {size}
                  {pageSize === size && <Check className="h-4 w-4 ml-2" />}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
      
      <div className="border rounded-md">
        <ScrollArea className="h-[calc(100vh-360px)]">
          <Table>
            <TableHeader className="bg-muted/50 sticky top-0">
              <TableRow>
                {visibleColumns.timestamp && <TableHead className="w-36">Timestamp</TableHead>}
                {visibleColumns.application && <TableHead>Application</TableHead>}
                {visibleColumns.activityType && <TableHead>Activity Type</TableHead>}
                {visibleColumns.description && <TableHead className="min-w-[200px]">Description</TableHead>}
                {visibleColumns.duration && <TableHead className="w-28">Duration</TableHead>}
                {visibleColumns.actions && <TableHead className="w-20 text-right">Actions</TableHead>}
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedData.length === 0 ? (
                <TableRow>
                  <TableCell 
                    colSpan={Object.values(visibleColumns).filter(Boolean).length} 
                    className="h-24 text-center"
                  >
                    No activities found.
                  </TableCell>
                </TableRow>
              ) : (
                paginatedData.map(activity => (
                  <TableRow key={activity.id} className="group hover:bg-muted/50">
                    {visibleColumns.timestamp && (
                      <TableCell className="font-mono text-xs">
                        {format(activity.timestamp, 'yyyy-MM-dd HH:mm:ss')}
                      </TableCell>
                    )}
                    
                    {visibleColumns.application && (
                      <TableCell>
                        <Badge variant="outline" className="capitalize">
                          {activity.application}
                        </Badge>
                      </TableCell>
                    )}
                    
                    {visibleColumns.activityType && (
                      <TableCell>
                        <Badge 
                          variant="outline"
                          className="capitalize flex items-center gap-1 w-fit"
                        >
                          {getActivityIcon(activity.activityType)}
                          <span>{activity.activityType}</span>
                        </Badge>
                      </TableCell>
                    )}
                    
                    {visibleColumns.description && (
                      <TableCell className="font-medium">
                        {activity.description}
                      </TableCell>
                    )}
                    
                    {visibleColumns.duration && (
                      <TableCell>
                        <div className="flex items-center gap-1 text-sm">
                          <Clock className="h-3.5 w-3.5 text-muted-foreground" />
                          <span>{formatDuration(activity.duration)}</span>
                        </div>
                      </TableCell>
                    )}
                    
                    {visibleColumns.actions && (
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 opacity-70 group-hover:opacity-100"
                          onClick={() => handleViewDetails(activity)}
                        >
                          <ExternalLink className="h-4 w-4" />
                          <span className="sr-only">View details</span>
                        </Button>
                      </TableCell>
                    )}
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </ScrollArea>
      </div>
      
      {/* Pagination controls */}
      <div className="flex items-center justify-between">
        <div className="text-sm text-muted-foreground">
          Showing {(currentPage - 1) * pageSize + 1} to {Math.min(currentPage * pageSize, filteredData.length)} of {filteredData.length} entries
        </div>
        
        <div className="flex items-center gap-1">
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8"
            onClick={() => setCurrentPage(1)}
            disabled={currentPage === 1}
          >
            <ChevronLeft className="h-4 w-4" />
            <ChevronLeft className="h-4 w-4 -ml-2" />
            <span className="sr-only">First page</span>
          </Button>
          
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8"
            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
          >
            <ChevronLeft className="h-4 w-4" />
            <span className="sr-only">Previous page</span>
          </Button>
          
          {[...Array(Math.min(totalPages, 5))].map((_, i) => {
            // Show 5 page buttons centered around current page
            let pageNumber;
            
            if (totalPages <= 5) {
              pageNumber = i + 1;
            } else {
              const start = Math.max(1, Math.min(currentPage - 2, totalPages - 4));
              pageNumber = start + i;
            }
            
            return (
              <Button
                key={pageNumber}
                variant={currentPage === pageNumber ? "default" : "outline"}
                size="sm"
                className="h-8 w-8 p-0"
                onClick={() => setCurrentPage(pageNumber)}
              >
                {pageNumber}
              </Button>
            );
          })}
          
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8"
            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
            disabled={currentPage === totalPages}
          >
            <ChevronRight className="h-4 w-4" />
            <span className="sr-only">Next page</span>
          </Button>
          
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8"
            onClick={() => setCurrentPage(totalPages)}
            disabled={currentPage === totalPages}
          >
            <ChevronRight className="h-4 w-4" />
            <ChevronRight className="h-4 w-4 -ml-2" />
            <span className="sr-only">Last page</span>
          </Button>
        </div>
      </div>
      
      {/* Detail Dialog */}
      <Dialog open={detailDialogOpen} onOpenChange={setDetailDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          {selectedActivity && (
            <>
              <DialogHeader>
                <DialogTitle>Activity Details</DialogTitle>
                <DialogDescription>
                  Detailed information about the selected activity
                </DialogDescription>
              </DialogHeader>
              
              <div className="mt-4 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h4 className="text-sm font-medium text-muted-foreground mb-1">Timestamp</h4>
                    <p className="font-mono text-sm">
                      {format(selectedActivity.timestamp, 'EEEE, MMMM d, yyyy')}
                      <br />
                      {format(selectedActivity.timestamp, 'h:mm:ss a')}
                    </p>
                  </div>
                  
                  <div>
                    <h4 className="text-sm font-medium text-muted-foreground mb-1">Duration</h4>
                    <p className="font-mono text-sm flex items-center gap-1">
                      <Clock className="h-3.5 w-3.5" />
                      {formatDuration(selectedActivity.duration)}
                    </p>
                  </div>
                  
                  <div>
                    <h4 className="text-sm font-medium text-muted-foreground mb-1">Application</h4>
                    <Badge variant="outline" className="capitalize">
                      {selectedActivity.application}
                    </Badge>
                  </div>
                  
                  <div>
                    <h4 className="text-sm font-medium text-muted-foreground mb-1">Activity Type</h4>
                    <Badge 
                      variant="outline"
                      className="capitalize flex items-center gap-1 w-fit"
                    >
                      {getActivityIcon(selectedActivity.activityType)}
                      <span>{selectedActivity.activityType}</span>
                    </Badge>
                  </div>
                </div>
                
                <div>
                  <h4 className="text-sm font-medium text-muted-foreground mb-1">Description</h4>
                  <p className="text-sm">{selectedActivity.description}</p>
                </div>
                
                {selectedActivity.metadata && Object.keys(selectedActivity.metadata).length > 0 && (
                  <div>
                    <h4 className="text-sm font-medium text-muted-foreground mb-1">Additional Details</h4>
                    <div className="bg-muted rounded-md p-3 font-mono text-xs">
                      <pre>{JSON.stringify(selectedActivity.metadata, null, 2)}</pre>
                    </div>
                  </div>
                )}
                
                {selectedActivity.screenshot && (
                  <div>
                    <h4 className="text-sm font-medium text-muted-foreground mb-1">Screenshot</h4>
                    <div className="border rounded-md overflow-hidden">
                      <img 
                        src={selectedActivity.screenshot} 
                        alt="Activity screenshot"
                        className="w-full object-cover"
                      />
                    </div>
                  </div>
                )}
              </div>
              
              <DialogFooter className="mt-4">
                <Button onClick={() => setDetailDialogOpen(false)}>Close</Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ActivityLogView;
