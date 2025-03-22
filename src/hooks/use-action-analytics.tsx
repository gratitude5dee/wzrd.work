
import { useState, useEffect, useCallback } from 'react';
import { calculateTimelineData } from '@/services/timeSavedService';
import { getActionExecutions, getActions } from '@/services/supabase';

export interface ActionData {
  id: string;
  created_at: string;
  user_id: string;
  name: string;
  description: string;
  pattern: string[];
  script: string;
  success_rate: number;
  average_execution_time: number;
  category: string;
}

export interface ExecutionLog {
  id: string;
  created_at: string;
  action_id: string;
  user_id: string;
  success: boolean;
  time_saved: number;
  execution_time: number;
  input: string;
  output: string;
}

export interface TimelineDataPoint {
  date: string;
  value: number;
  count: number;
}

export interface UserAnalyticsData {
  totalActions: number;
  totalExecutions: number;
  overallSuccessRate: number;
  totalTimeSaved: number;
  averageExecutionTime: number;
  executionLogs: ExecutionLog[];
}

export interface UsagePatternData {
  timelineData: TimelineDataPoint[];
  executionTimes: { date: string; value: number; count: number }[];
  executionCounts: { date: string; value: number; count: number }[];
  successRates: { date: string; value: number; count: number }[];
}

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
  relatedActions?: { id: string; name: string }[];
}

export const getRelatedActions = (actionId: string, allActions: ActionData[]): ActionData[] => {
  if (!allActions || allActions.length === 0) return [];
  
  const action = allActions.find(a => a.id === actionId);
  if (!action) return [];

  // Find actions with similar patterns
  const relatedByPattern = allActions.filter(item => {
    if (!item || !action) return false;
    return item.id !== actionId && 
           item.pattern && 
           action.pattern && 
           item.pattern.some(p => action.pattern.includes(p));
  });

  // Sort by success rate and execution time
  const sortedActions = relatedByPattern.sort((a, b) => {
    const successRateDiff = b.success_rate - a.success_rate;
    if (successRateDiff !== 0) {
      return successRateDiff;
    }
    return a.average_execution_time - b.average_execution_time;
  });

  return sortedActions;
};

const useActionAnalytics = (userId: string | undefined) => {
  const [userData, setUserData] = useState<UserAnalyticsData | null>(null);
  const [usagePatterns, setUsagePatterns] = useState<UsagePatternData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSuccessDialogOpen, setIsSuccessDialogOpen] = useState(false);
  const [currentSummary, setCurrentSummary] = useState<ActionSummary | null>(null);

  useEffect(() => {
    if (!userId) {
      console.warn("No user ID provided to useActionAnalytics hook.");
      return;
    }

    const fetchAnalyticsData = async () => {
      setLoading(true);
      setError(null);

      try {
        // Fetch all actions and executions for the user
        const [actions, executions] = await Promise.all([
          getActions(userId),
          getActionExecutions(userId)
        ]);

        if (!actions || !executions) {
          throw new Error("Failed to fetch actions or executions.");
        }

        // Calculate analytics
        const totalActions = actions.length;
        const totalExecutions = executions.length;
        const successfulExecutions = executions.filter(log => log.success).length;
        const overallSuccessRate = totalExecutions > 0 ? (successfulExecutions / totalExecutions) * 100 : 0;

        const totalTimeSaved = executions.reduce((sum, log) => sum + (log.time_saved || 0), 0);
        const totalExecutionTime = executions.reduce((sum, log) => sum + log.execution_time, 0);
        const averageExecutionTime = totalExecutions > 0 ? totalExecutionTime / totalExecutions : 0;

        // Set user analytics data
        setUserData({
          totalActions,
          totalExecutions,
          overallSuccessRate,
          totalTimeSaved,
          averageExecutionTime,
          executionLogs: executions
        });

        // Calculate timeline data for usage patterns
        const timelineData = calculateTimelineData(executions);

        // Structure execution times for chart
        const executionTimes = timelineData.map(item => ({
          date: item.date,
          value: item.value,
          count: item.count
        }));

        // Create execution counts and success rates
        const executionCounts = timelineData.map(item => ({
          date: item.date,
          value: item.count,
          count: item.count
        }));

        const successRates = timelineData.map(item => {
          // Calculate success rate for this date
          const dateExecutions = executions.filter(log => {
            const logDate = new Date(log.created_at).toISOString().split('T')[0];
            return logDate === item.date;
          });
          
          const successCount = dateExecutions.filter(log => log.success).length;
          const rate = dateExecutions.length > 0 ? (successCount / dateExecutions.length) * 100 : 0;
          
          return {
            date: item.date,
            value: rate,
            count: dateExecutions.length
          };
        });

        // Set usage patterns data
        setUsagePatterns({
          timelineData,
          executionTimes,
          executionCounts,
          successRates
        });

      } catch (err: any) {
        setError(err.message || "Failed to fetch analytics data.");
        console.error("Error fetching action analytics:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchAnalyticsData();

  }, [userId]);

  // Function to show success dialog
  const showSuccessDialog = useCallback((summary: ActionSummary) => {
    setCurrentSummary(summary);
    setIsSuccessDialogOpen(true);
  }, []);

  // Function to close success dialog
  const closeSuccessDialog = useCallback(() => {
    setIsSuccessDialogOpen(false);
  }, []);

  // Function to get metrics for a specific action
  const getActionMetrics = useCallback((actionId: string) => {
    if (!userData || !userData.executionLogs) return null;
    
    const actionLogs = userData.executionLogs.filter(log => log.action_id === actionId);
    
    if (actionLogs.length === 0) return null;
    
    const successCount = actionLogs.filter(log => log.success).length;
    const successRate = (successCount / actionLogs.length) * 100;
    const timeSaved = actionLogs.reduce((sum, log) => sum + (log.time_saved || 0), 0);
    const executionTime = actionLogs.reduce((sum, log) => sum + log.execution_time, 0) / actionLogs.length;
    
    return {
      timeSaved,
      executionTime,
      successRate,
      automationLevel: Math.min(90, 30 + successRate / 2), // Estimate based on success rate
      executionCount: actionLogs.length
    };
  }, [userData]);

  return { 
    userData, 
    usagePatterns, 
    loading, 
    error,
    isSuccessDialogOpen,
    currentSummary,
    showSuccessDialog,
    closeSuccessDialog,
    getActionMetrics,
    getRelatedActions 
  };
};

export default useActionAnalytics;
