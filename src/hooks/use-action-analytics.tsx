import { useState, useEffect } from 'react';
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

        // Set usage patterns data
        setUsagePatterns({
          timelineData,
          executionTimes
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

  return { userData, usagePatterns, loading, error };
};

export default useActionAnalytics;
