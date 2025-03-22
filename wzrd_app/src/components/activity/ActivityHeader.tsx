import React from 'react';
import { DatePickerWithRange } from "@/components/ui/date-range-picker";
import { DateRange } from 'react-day-picker';
import { Input } from "@/components/ui/input";
import { Search, Filter, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";

interface ActivityHeaderProps {
  dateRange: DateRange;
  onDateRangeChange: (range: DateRange) => void;
  selectedApps: string[];
  onAppFilterChange: (apps: string[]) => void;
  activityTypes: string[];
  onActivityTypeFilterChange: (types: string[]) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
}

// Sample application options for the filter
const APP_OPTIONS = [
  { label: 'Chrome', value: 'chrome' },
  { label: 'VS Code', value: 'vscode' },
  { label: 'Slack', value: 'slack' },
  { label: 'Terminal', value: 'terminal' },
  { label: 'Notion', value: 'notion' },
  { label: 'Figma', value: 'figma' },
  { label: 'Zoom', value: 'zoom' },
  { label: 'Excel', value: 'excel' },
];

// Sample activity types for the filter
const ACTIVITY_TYPES = [
  { label: 'Clicks', value: 'click' },
  { label: 'Typing', value: 'typing' },
  { label: 'Navigation', value: 'navigation' },
  { label: 'Scrolling', value: 'scrolling' },
  { label: 'File Operations', value: 'file' },
];

const ActivityHeader: React.FC<ActivityHeaderProps> = ({
  dateRange,
  onDateRangeChange,
  selectedApps,
  onAppFilterChange,
  activityTypes,
  onActivityTypeFilterChange,
  searchQuery,
  onSearchChange,
}) => {
  // Handle application filter changes
  const handleAppCheckboxChange = (appValue: string, checked: boolean) => {
    if (checked) {
      onAppFilterChange([...selectedApps, appValue]);
    } else {
      onAppFilterChange(selectedApps.filter(app => app !== appValue));
    }
  };

  // Handle activity type filter changes
  const handleActivityTypeCheckboxChange = (activityValue: string, checked: boolean) => {
    if (checked) {
      onActivityTypeFilterChange([...activityTypes, activityValue]);
    } else {
      onActivityTypeFilterChange(activityTypes.filter(type => type !== activityValue));
    }
  };

  // Clear all filters
  const clearAllFilters = () => {
    onAppFilterChange([]);
    onActivityTypeFilterChange([]);
    onDateRangeChange({ from: undefined, to: undefined });
    onSearchChange('');
  };

  // Format the date range for display
  const formatDateRangeText = () => {
    if (!dateRange.from) return "Select date range";
    
    const fromDate = dateRange.from.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    });
    
    if (!dateRange.to) return fromDate;
    
    const toDate = dateRange.to.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    });
    
    return `${fromDate} - ${toDate}`;
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <h1 className="text-2xl font-semibold">Activity</h1>
        
        <div className="flex items-center gap-2">
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search activities..."
              className="pl-9"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
            />
          </div>
          
          <DatePickerWithRange
            date={dateRange}
            onDateChange={onDateRangeChange}
          />
        </div>
      </div>
      
      <div className="flex flex-wrap items-center gap-2">
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" size="sm" className="flex items-center gap-1">
              <Filter className="h-3.5 w-3.5" />
              <span>Applications</span>
              {selectedApps.length > 0 && (
                <Badge 
                  variant="secondary" 
                  className="ml-1 px-1 py-0 h-5 min-w-5 flex items-center justify-center text-xs"
                >
                  {selectedApps.length}
                </Badge>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-64 p-2" align="start">
            <div className="space-y-2">
              <div className="font-medium text-sm mb-2">Filter by Application</div>
              <div className="space-y-2 max-h-64 overflow-y-auto pr-2">
                {APP_OPTIONS.map((app) => (
                  <div key={app.value} className="flex items-center space-x-2">
                    <Checkbox
                      id={`app-${app.value}`}
                      checked={selectedApps.includes(app.value)}
                      onCheckedChange={(checked) => 
                        handleAppCheckboxChange(app.value, checked === true)
                      }
                    />
                    <label
                      htmlFor={`app-${app.value}`}
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      {app.label}
                    </label>
                  </div>
                ))}
              </div>
              <div className="flex justify-between pt-2 border-t">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => onAppFilterChange([])}
                  className="text-xs h-7"
                >
                  Clear
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => onAppFilterChange(APP_OPTIONS.map(app => app.value))}
                  className="text-xs h-7"
                >
                  Select All
                </Button>
              </div>
            </div>
          </PopoverContent>
        </Popover>
        
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" size="sm" className="flex items-center gap-1">
              <Filter className="h-3.5 w-3.5" />
              <span>Activity Types</span>
              {activityTypes.length > 0 && (
                <Badge 
                  variant="secondary" 
                  className="ml-1 px-1 py-0 h-5 min-w-5 flex items-center justify-center text-xs"
                >
                  {activityTypes.length}
                </Badge>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-64 p-2" align="start">
            <div className="space-y-2">
              <div className="font-medium text-sm mb-2">Filter by Activity Type</div>
              <div className="space-y-2">
                {ACTIVITY_TYPES.map((activity) => (
                  <div key={activity.value} className="flex items-center space-x-2">
                    <Checkbox
                      id={`activity-${activity.value}`}
                      checked={activityTypes.includes(activity.value)}
                      onCheckedChange={(checked) => 
                        handleActivityTypeCheckboxChange(activity.value, checked === true)
                      }
                    />
                    <label
                      htmlFor={`activity-${activity.value}`}
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      {activity.label}
                    </label>
                  </div>
                ))}
              </div>
              <div className="flex justify-between pt-2 border-t">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => onActivityTypeFilterChange([])}
                  className="text-xs h-7"
                >
                  Clear
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => onActivityTypeFilterChange(ACTIVITY_TYPES.map(type => type.value))}
                  className="text-xs h-7"
                >
                  Select All
                </Button>
              </div>
            </div>
          </PopoverContent>
        </Popover>
        
        {/* Display active filters */}
        <div className="flex flex-wrap gap-1.5">
          {selectedApps.map(app => {
            const appOption = APP_OPTIONS.find(a => a.value === app);
            return (
              <Badge 
                key={`app-badge-${app}`} 
                variant="outline"
                className="flex items-center gap-1 px-2 py-1 bg-primary-foreground"
              >
                <span className="text-xs">{appOption?.label || app}</span>
                <button 
                  className="text-muted-foreground hover:text-foreground" 
                  onClick={() => handleAppCheckboxChange(app, false)}
                >
                  <span className="sr-only">Remove</span>
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg" className="h-3 w-3">
                    <path d="M9 3L3 9M3 3L9 9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </button>
              </Badge>
            );
          })}
          
          {activityTypes.map(type => {
            const typeOption = ACTIVITY_TYPES.find(t => t.value === type);
            return (
              <Badge 
                key={`type-badge-${type}`} 
                variant="outline"
                className="flex items-center gap-1 px-2 py-1 bg-primary-foreground"
              >
                <span className="text-xs">{typeOption?.label || type}</span>
                <button 
                  className="text-muted-foreground hover:text-foreground" 
                  onClick={() => handleActivityTypeCheckboxChange(type, false)}
                >
                  <span className="sr-only">Remove</span>
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg" className="h-3 w-3">
                    <path d="M9 3L3 9M3 3L9 9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </button>
              </Badge>
            );
          })}
          
          {dateRange.from && (
            <Badge 
              variant="outline"
              className="flex items-center gap-1 px-2 py-1 bg-primary-foreground"
            >
              <span className="text-xs">{formatDateRangeText()}</span>
              <button 
                className="text-muted-foreground hover:text-foreground" 
                onClick={() => onDateRangeChange({ from: undefined, to: undefined })}
              >
                <span className="sr-only">Remove</span>
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg" className="h-3 w-3">
                  <path d="M9 3L3 9M3 3L9 9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
            </Badge>
          )}
          
          {(selectedApps.length > 0 || activityTypes.length > 0 || dateRange.from || searchQuery) && (
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={clearAllFilters}
              className="text-xs h-7"
            >
              Clear all
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ActivityHeader;
