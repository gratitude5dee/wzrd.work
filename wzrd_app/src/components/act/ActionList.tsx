
import React, { useState } from 'react';
import { useAvailableActions } from '@/services/recordingService';
import { Search, Tag, ListFilter, Clock } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { WorkflowAction } from '@/services/recordingService';
import { cn } from '@/lib/utils';

interface ActionListProps {
  onSelectAction: (action: WorkflowAction) => void;
  selectedActionId?: string;
}

const ActionList: React.FC<ActionListProps> = ({ onSelectAction, selectedActionId }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [showFilters, setShowFilters] = useState(false);

  const { data: actions, isLoading, error } = useAvailableActions({
    search: searchQuery,
    tags: selectedTags
  });

  // Get all unique tags from actions
  const allTags = React.useMemo(() => {
    if (!actions) return [];
    const tags = new Set<string>();
    actions.forEach(action => {
      action.tags?.forEach(tag => tags.add(tag));
    });
    return Array.from(tags);
  }, [actions]);

  const toggleTag = (tag: string) => {
    setSelectedTags(prev => 
      prev.includes(tag) 
        ? prev.filter(t => t !== tag) 
        : [...prev, tag]
    );
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-pulse flex flex-col items-center">
          <div className="h-12 w-12 rounded-full bg-primary/20 mb-2"></div>
          <div className="h-4 w-24 bg-muted rounded"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 text-center text-destructive">
        <p>Error loading actions</p>
        <p className="text-sm text-muted-foreground">{error instanceof Error ? error.message : 'Unknown error'}</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <div className="p-4 border-b">
        <div className="relative">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search actions..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 pr-4"
          />
        </div>
        
        <div className="flex items-center justify-between mt-3">
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => setShowFilters(!showFilters)}
            className="gap-1"
          >
            <ListFilter className="h-4 w-4" />
            Filters
          </Button>
          
          <span className="text-sm text-muted-foreground">
            {actions?.length || 0} actions
          </span>
        </div>
        
        {showFilters && (
          <div className="mt-3 space-y-2">
            <h4 className="text-sm font-medium">Tags</h4>
            <div className="flex flex-wrap gap-2">
              {allTags.map(tag => (
                <Badge 
                  key={tag}
                  variant={selectedTags.includes(tag) ? "default" : "outline"}
                  className="cursor-pointer"
                  onClick={() => toggleTag(tag)}
                >
                  <Tag className="mr-1 h-3 w-3" />
                  {tag}
                </Badge>
              ))}
              {allTags.length === 0 && (
                <span className="text-sm text-muted-foreground">No tags available</span>
              )}
            </div>
          </div>
        )}
      </div>
      
      <ScrollArea className="flex-1">
        <div className="p-4 grid grid-cols-1 gap-3">
          {actions && actions.length > 0 ? (
            actions.map(action => (
              <Card 
                key={action.id}
                className={cn(
                  "overflow-hidden cursor-pointer hover:border-primary/50 transition-all",
                  selectedActionId === action.id && "border-primary shadow-sm"
                )}
                onClick={() => onSelectAction(action)}
              >
                <CardContent className="p-3">
                  <div className="flex gap-3">
                    <div className="h-16 w-16 bg-muted rounded-md flex-shrink-0 overflow-hidden">
                      {action.thumbnail_url ? (
                        <img 
                          src={action.thumbnail_url} 
                          alt={action.name || 'Action thumbnail'} 
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="h-full w-full flex items-center justify-center bg-primary/10">
                          <Tag className="h-8 w-8 text-primary/60" />
                        </div>
                      )}
                    </div>
                    
                    <div className="flex flex-col flex-1 min-w-0">
                      <h3 className="font-medium text-sm truncate">
                        {action.name || `Action ${action.id.slice(0, 8)}`}
                      </h3>
                      <p className="text-xs text-muted-foreground line-clamp-2 mt-1">
                        {action.description || 'No description available'}
                      </p>
                      
                      <div className="flex items-center mt-2 gap-3">
                        <div className="flex items-center text-xs text-muted-foreground">
                          <Clock className="h-3 w-3 mr-1" />
                          {new Date(action.created_at).toLocaleDateString()}
                        </div>
                        
                        {action.tags && action.tags.length > 0 && (
                          <div className="flex gap-1 overflow-hidden">
                            {action.tags.slice(0, 2).map(tag => (
                              <Badge key={tag} variant="secondary" className="text-xs px-1">
                                {tag}
                              </Badge>
                            ))}
                            {action.tags.length > 2 && (
                              <Badge variant="secondary" className="text-xs px-1">
                                +{action.tags.length - 2}
                              </Badge>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            <div className="text-center p-6">
              <p className="text-muted-foreground">No actions found</p>
              <p className="text-sm mt-1">Try adjusting your search or filters</p>
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  );
};

export default ActionList;
