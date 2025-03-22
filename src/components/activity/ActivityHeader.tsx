
import React, { useState } from 'react';
import { DatePickerWithRange } from '@/components/ui/date-range-picker';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Search, 
  X, 
  Filter,
  Calendar,
  ListFilter
} from 'lucide-react';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Card,
  CardContent,
} from "@/components/ui/card";

interface ActivityHeaderProps {
  dateRange: {start: Date, end: Date};
  onDateRangeChange: (range: {start: Date, end: Date}) => void;
  selectedApps: string[];
  onAppFilterChange: (apps: string[]) => void;
  activityTypes: string[];
  onActivityTypeFilterChange: (types: string[]) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
}

// Sample app data - would come from API in real app
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

// Sample activity types - would come from API in real app
const availableActivityTypes = [
  { id: 'click', name: 'Mouse Clicks' },
  { id: 'typing', name: 'Keyboard Typing' },
  { id: 'navigation', name: 'Navigation' },
  { id: 'file_access', name: 'File Operations' },
  { id: 'search', name: 'Search Actions' },
  { id: 'copy_paste', name: 'Copy & Paste' },
];

const ActivityHeader: React.FC<ActivityHeaderProps> = ({
  dateRange,
  onDateRangeChange,
  selectedApps,
  onAppFilterChange,
  activityTypes,
  onActivityTypeFilterChange,
  searchQuery,
  onSearchChange
}) => {
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  
  const handleRemoveApp = (appId: string) => {
    onAppFilterChange(selectedApps.filter(id => id !== appId));
  };
  
  const handleRemoveActivityType = (typeId: string) => {
    onActivityTypeFilterChange(activityTypes.filter(id => id !== typeId));
  };
  
  const handleClearFilters = () => {
    onAppFilterChange([]);
    onActivityTypeFilterChange([]);
    onSearchChange('');
  };
  
  const totalFiltersApplied = selectedApps.length + activityTypes.length + (searchQuery ? 1 : 0);
  
  return (
    <Card className="border-border/30 bg-background/50 backdrop-blur-sm">
      <CardContent className="p-4">
        <div className="flex flex-col space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold">Activity</h2>
            
            {totalFiltersApplied > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleClearFilters}
                className="text-muted-foreground hover:text-foreground"
              >
                Clear all filters
                <X className="ml-2 h-4 w-4" />
              </Button>
            )}
          </div>
          
          <div className="flex flex-wrap gap-2 items-center">
            <div className="relative flex-1 min-w-[200px]">
              <Search className={`absolute left-2.5 top-2.5 h-4 w-4 ${isSearchFocused ? 'text-primary' : 'text-muted-foreground'}`} />
              <Input
                placeholder="Search activities..."
                className="pl-9 bg-background"
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                onFocus={() => setIsSearchFocused(true)}
                onBlur={() => setIsSearchFocused(false)}
              />
            </div>
            
            <DatePickerWithRange
              date={{
                from: dateRange.start,
                to: dateRange.end,
              }}
              onDateChange={(range) => {
                if (range?.from && range?.to) {
                  onDateRangeChange({
                    start: range.from,
                    end: range.to
                  });
                }
              }}
            />
            
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="gap-1">
                  <Filter className="h-4 w-4" />
                  <span>Apps</span>
                  {selectedApps.length > 0 && (
                    <Badge variant="accent" className="ml-1">
                      {selectedApps.length}
                    </Badge>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-[200px] p-0" align="end">
                <Command>
                  <CommandInput placeholder="Search apps..." />
                  <CommandList>
                    <CommandEmpty>No results found.</CommandEmpty>
                    <CommandGroup>
                      {availableApps.map((app) => (
                        <CommandItem
                          key={app.id}
                          onSelect={() => {
                            if (selectedApps.includes(app.id)) {
                              handleRemoveApp(app.id);
                            } else {
                              onAppFilterChange([...selectedApps, app.id]);
                            }
                          }}
                        >
                          <div className={`mr-2 h-4 w-4 rounded-sm border ${
                            selectedApps.includes(app.id) 
                              ? 'bg-primary border-primary text-primary-foreground' 
                              : 'border-primary/20'
                          }`}>
                            {selectedApps.includes(app.id) && (
                              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
                                <polyline points="20 6 9 17 4 12"></polyline>
                              </svg>
                            )}
                          </div>
                          <span>{app.name}</span>
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
            
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="gap-1">
                  <ListFilter className="h-4 w-4" />
                  <span>Activity Types</span>
                  {activityTypes.length > 0 && (
                    <Badge variant="accent" className="ml-1">
                      {activityTypes.length}
                    </Badge>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-[220px] p-0" align="end">
                <Command>
                  <CommandInput placeholder="Search types..." />
                  <CommandList>
                    <CommandEmpty>No results found.</CommandEmpty>
                    <CommandGroup>
                      {availableActivityTypes.map((type) => (
                        <CommandItem
                          key={type.id}
                          onSelect={() => {
                            if (activityTypes.includes(type.id)) {
                              handleRemoveActivityType(type.id);
                            } else {
                              onActivityTypeFilterChange([...activityTypes, type.id]);
                            }
                          }}
                        >
                          <div className={`mr-2 h-4 w-4 rounded-sm border ${
                            activityTypes.includes(type.id) 
                              ? 'bg-primary border-primary text-primary-foreground' 
                              : 'border-primary/20'
                          }`}>
                            {activityTypes.includes(type.id) && (
                              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
                                <polyline points="20 6 9 17 4 12"></polyline>
                              </svg>
                            )}
                          </div>
                          <span>{type.name}</span>
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
          </div>
          
          {totalFiltersApplied > 0 && (
            <div className="flex flex-wrap gap-1.5 pt-2">
              {selectedApps.map(appId => {
                const app = availableApps.find(a => a.id === appId);
                return app ? (
                  <Badge key={app.id} variant="outline" className="gap-1 py-1 bg-background/80">
                    {app.name}
                    <button 
                      onClick={() => handleRemoveApp(app.id)}
                      className="ml-1 rounded-full hover:bg-muted-foreground/20 p-0.5"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ) : null;
              })}
              
              {activityTypes.map(typeId => {
                const type = availableActivityTypes.find(t => t.id === typeId);
                return type ? (
                  <Badge key={type.id} variant="outline" className="gap-1 py-1 bg-background/80">
                    {type.name}
                    <button 
                      onClick={() => handleRemoveActivityType(type.id)}
                      className="ml-1 rounded-full hover:bg-muted-foreground/20 p-0.5"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ) : null;
              })}
              
              {searchQuery && (
                <Badge variant="outline" className="gap-1 py-1 bg-background/80">
                  Search: {searchQuery}
                  <button 
                    onClick={() => onSearchChange('')}
                    className="ml-1 rounded-full hover:bg-muted-foreground/20 p-0.5"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              )}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default ActivityHeader;
