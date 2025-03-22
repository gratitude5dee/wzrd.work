
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';
import { getActionMetrics, getUserMetrics, getUsagePatterns } from '@/services/analyticsService';
import { WorkflowAction } from '@/services/recordingService';

export interface ActionAnalyticsData {
  executionCount: number;
  successRate: number;
  avgExecutionTime: number;
  estimatedTimeSaved: number;
  checkpointInteractions: {
    shown: number;
    modified: number;
    cancelled: number;
  };
}

export interface UserAnalyticsData {
  totalTimeSaved: number;
  totalExecutions: number;
  overallSuccessRate: number;
  mostUsedActions: Array<{ actionId: string; count: number }>;
  executionLogs: any[];
}

export interface UsagePatternData {
  executionCounts: Array<{ date: string; value: number }>;
  successRates: Array<{ date: string; value: number }>;
  executionTimes: Array<{ date: string; value: number }>;
}

// Add this missing type that is referenced in use-digital-assistant.tsx
export interface ActionSummary {
  id: string;
  name: string;
  description: string;
  completedSteps: number;
  totalSteps: number;
  metrics: {
    timeSaved: number;
    executionTime: number;
    successRate: number;
    automationLevel: number;
  };
  relatedActions?: Array<{ id: string; name: string }>;
}

export function useActionAnalytics(actionId?: string) {
  const [actionData, setActionData] = useState<ActionAnalyticsData | null>(null);
  const [userData, setUserData] = useState<UserAnalyticsData | null>(null);
  const [usagePatterns, setUsagePatterns] = useState<UsagePatternData | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);
  const [isSuccessDialogOpen, setIsSuccessDialogOpen] = useState<boolean>(false);
  const [currentSummary, setCurrentSummary] = useState<ActionSummary | null>(null);
  const { user } = useAuth();

  // Fetch analytics data for a specific action
  const fetchActionAnalytics = useCallback(async (id: string) => {
    if (!user) return;
    
    try {
      setIsLoading(true);
      setError(null);
      
      const metrics = await getActionMetrics(id);
      
      if (metrics) {
        setActionData(metrics);
      }
    } catch (err) {
      console.error('Error fetching action analytics:', err);
      setError(err as Error);
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  // Fetch user's overall analytics data
  const fetchUserAnalytics = useCallback(async () => {
    if (!user) return;
    
    try {
      setIsLoading(true);
      setError(null);
      
      const metrics = await getUserMetrics();
      
      if (metrics) {
        setUserData(metrics);
      }
    } catch (err) {
      console.error('Error fetching user analytics:', err);
      setError(err as Error);
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  // Fetch usage pattern data
  const fetchUsagePatterns = useCallback(async (timeframe: 'day' | 'week' | 'month' = 'week') => {
    if (!user) return;
    
    try {
      setIsLoading(true);
      setError(null);
      
      const patterns = await getUsagePatterns(timeframe);
      
      if (patterns) {
        setUsagePatterns(patterns);
      }
    } catch (err) {
      console.error('Error fetching usage patterns:', err);
      setError(err as Error);
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  // Add the missing functions needed in DigitalAssistant.tsx
  const showSuccessDialog = useCallback((summary: ActionSummary) => {
    setCurrentSummary(summary);
    setIsSuccessDialogOpen(true);
  }, []);

  const closeSuccessDialog = useCallback(() => {
    setIsSuccessDialogOpen(false);
    setCurrentSummary(null);
  }, []);

  const getActionMetrics = useCallback((id: string) => {
    fetchActionAnalytics(id);
    return actionData;
  }, [fetchActionAnalytics, actionData]);

  // Get related actions based on usage patterns
  const getRelatedActions = useCallback(async (action: WorkflowAction, limit: number = 3): Promise<Array<WorkflowAction>> => {
    if (!user) return [];
    
    try {
      // This is a simplified implementation - in a real app, you would use more sophisticated algorithms
      // Here we're just getting actions that have similar tags
      if (!action.tags || action.tags.length === 0) {
        // If no tags, get most used actions
        const { data, error } = await supabase
          .from('execution_logs')
          .select('action_id, count(*)')
          .order('count', { ascending: false })
          .limit(limit + 1); // +1 because we'll filter out the current action
        
        if (error) throw error;
        
        // Create a type-safe array for storing valid items
        const validItems: { action_id: string }[] = [];
        
        // Check if data is not null or undefined
        if (data) {
          // Loop through each item in data array
          for (let i = 0; i < data.length; i++) {
            const currentItem = data[i];
            
            // Skip null or undefined items
            if (currentItem === null || currentItem === undefined) continue;
            
            // Verify the item is an object with the expected structure
            if (
              typeof currentItem === 'object' &&
              'action_id' in currentItem &&
              typeof currentItem.action_id === 'string'
            ) {
              validItems.push({ action_id: currentItem.action_id });
            }
          }
        }
        
        // Now we can safely work with validItems - no need for additional null checks
        // since we've already validated each item before adding it to validItems
        const actionIds = validItems
          .filter(item => item.action_id !== action.id)
          .slice(0, limit)
          .map(item => item.action_id);
        
        if (actionIds.length === 0) return [];
        
        // Fetch the action details
        const { data: actions, error: actionsError } = await supabase
          .from('workflow_actions')
          .select('*')
          .in('id', actionIds);
        
        if (actionsError) throw actionsError;
        
        return actions as WorkflowAction[];
      } else {
        // Find actions with similar tags
        const { data, error } = await supabase
          .from('workflow_actions')
          .select('*')
          .neq('id', action.id)
          .overlaps('tags', action.tags || [])
          .limit(limit);
        
        if (error) throw error;
        
        return data as WorkflowAction[];
      }
    } catch (err) {
      console.error('Error getting related actions:', err);
      return [];
    }
  }, [user]);

  return {
    actionData,
    userData,
    usagePatterns,
    isLoading,
    error,
    fetchActionAnalytics,
    fetchUserAnalytics,
    fetchUsagePatterns,
    getRelatedActions,
    // Add these missing properties/methods used in DigitalAssistant.tsx
    getActionMetrics,
    isSuccessDialogOpen,
    currentSummary,
    showSuccessDialog,
    closeSuccessDialog
  };
}
