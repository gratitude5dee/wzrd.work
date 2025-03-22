
import { supabase } from '@/integrations/supabase/client';
import { WorkflowAction } from './recordingService';

// Define types for analytics metrics
export interface AnalyticsMetric {
  id?: string;
  user_id?: string;
  action_id?: string;
  metric_type: string;
  metric_value?: number;
  context?: any;
  created_at?: string;
}

/**
 * Record an analytics metric
 */
export async function recordMetric(metric: Omit<AnalyticsMetric, 'id' | 'created_at'>) {
  try {
    // Ensure user_id is included
    let updatedMetric = { ...metric };
    
    if (!updatedMetric.user_id) {
      const { data: userData } = await supabase.auth.getUser();
      if (userData?.user) {
        updatedMetric.user_id = userData.user.id;
      } else {
        throw new Error('User not authenticated');
      }
    }

    // Now insert with required user_id field
    const { data, error } = await supabase
      .from('analytics_data')
      .insert({
        user_id: updatedMetric.user_id,
        action_id: updatedMetric.action_id,
        metric_type: updatedMetric.metric_type,
        metric_value: updatedMetric.metric_value,
        context: updatedMetric.context
      });

    if (error) {
      throw error;
    }
    
    return data;
  } catch (error) {
    console.error('Error recording metric:', error);
    throw error;
  }
}

/**
 * Get metrics for a specific action
 */
export async function getActionMetrics(actionId: string) {
  try {
    // Get execution counts
    const { data: executionData, error: executionError } = await supabase
      .from('execution_logs')
      .select('*')
      .eq('action_id', actionId);
    
    if (executionError) throw executionError;
    
    // Calculate success rate
    const totalExecutions = executionData?.length || 0;
    const successfulExecutions = executionData?.filter(log => log.status === 'completed')?.length || 0;
    const successRate = totalExecutions > 0 ? (successfulExecutions / totalExecutions) * 100 : 0;
    
    // Calculate avg execution time
    const executionTimes = executionData
      ?.filter(log => log.duration_seconds)
      ?.map(log => log.duration_seconds || 0) || [];
      
    const avgExecutionTime = executionTimes.length > 0
      ? executionTimes.reduce((sum, time) => sum + time, 0) / executionTimes.length
      : 0;
    
    // Get time saved metrics
    const { data: timeSavedData, error: timeSavedError } = await supabase
      .from('analytics_data')
      .select('metric_value')
      .eq('action_id', actionId)
      .eq('metric_type', 'time_saved');
    
    if (timeSavedError) throw timeSavedError;
    
    const estimatedTimeSaved = timeSavedData
      ?.reduce((sum, item) => sum + (item.metric_value || 0), 0) || 0;
    
    // Get checkpoint interactions - safely handle array access
    const checkpointShown = executionData && Array.isArray(executionData)
      ? executionData.reduce((sum, log) => sum + (log.checkpoints_shown || 0), 0)
      : 0;
    
    const checkpointModified = executionData && Array.isArray(executionData)
      ? executionData.reduce((sum, log) => sum + (log.checkpoints_modified || 0), 0)
      : 0;
    
    const checkpointCancelled = executionData && Array.isArray(executionData)
      ? executionData.reduce((sum, log) => sum + (log.checkpoints_cancelled || 0), 0)
      : 0;
    
    return {
      executionCount: totalExecutions,
      successRate,
      avgExecutionTime,
      estimatedTimeSaved,
      checkpointInteractions: {
        shown: checkpointShown,
        modified: checkpointModified,
        cancelled: checkpointCancelled
      }
    };
  } catch (error) {
    console.error('Error getting action metrics:', error);
    throw error;
  }
}

/**
 * Get overall metrics for a user
 */
export async function getUserMetrics() {
  try {
    const { data: userData } = await supabase.auth.getUser();
    if (!userData?.user) {
      throw new Error('User not authenticated');
    }
    
    const userId = userData.user.id;
    
    // Get all execution logs
    const { data: executionLogs, error: executionError } = await supabase
      .from('execution_logs')
      .select('*')
      .eq('user_id', userId);
    
    if (executionError) throw executionError;
    
    // Calculate metrics
    const totalExecutions = executionLogs?.length || 0;
    const successfulExecutions = executionLogs?.filter(log => log.status === 'completed')?.length || 0;
    const overallSuccessRate = totalExecutions > 0 ? (successfulExecutions / totalExecutions) * 100 : 0;
    
    // Get time saved metrics
    const { data: timeSavedData, error: timeSavedError } = await supabase
      .from('analytics_data')
      .select('metric_value')
      .eq('user_id', userId)
      .eq('metric_type', 'time_saved');
    
    if (timeSavedError) throw timeSavedError;
    
    const totalTimeSaved = timeSavedData
      ?.reduce((sum, item) => sum + (item.metric_value || 0), 0) || 0;
    
    // Get most used actions - safety checks for Array.isArray
    const actionCounts: Record<string, number> = {};
    if (executionLogs && Array.isArray(executionLogs)) {
      executionLogs.forEach(log => {
        if (log.action_id) {
          actionCounts[log.action_id] = (actionCounts[log.action_id] || 0) + 1;
        }
      });
    }
    
    const mostUsedActions = Object.entries(actionCounts)
      .map(([actionId, count]) => ({ actionId, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);
    
    return {
      totalTimeSaved,
      totalExecutions,
      overallSuccessRate,
      mostUsedActions,
      executionLogs: executionLogs || []
    };
  } catch (error) {
    console.error('Error getting user metrics:', error);
    throw error;
  }
}

/**
 * Get usage pattern data for visualization
 */
export async function getUsagePatterns(timeframe: 'day' | 'week' | 'month' = 'week') {
  try {
    const { data: userData } = await supabase.auth.getUser();
    if (!userData?.user) {
      throw new Error('User not authenticated');
    }
    
    const userId = userData.user.id;
    
    // Get date range based on timeframe
    const now = new Date();
    let startDate = new Date();
    
    switch (timeframe) {
      case 'day':
        startDate.setDate(now.getDate() - 1);
        break;
      case 'week':
        startDate.setDate(now.getDate() - 7);
        break;
      case 'month':
        startDate.setMonth(now.getMonth() - 1);
        break;
    }
    
    // Get execution logs within timeframe
    const { data: executionLogs, error: executionError } = await supabase
      .from('execution_logs')
      .select('*')
      .eq('user_id', userId)
      .gte('created_at', startDate.toISOString())
      .lte('created_at', now.toISOString());
    
    if (executionError) throw executionError;
    
    // Group by date - type safety for executionLogs
    const executionsByDate: Record<string, any[]> = {};
    
    if (executionLogs && Array.isArray(executionLogs)) {
      executionLogs.forEach(log => {
        if (log.created_at) {
          const date = new Date(log.created_at).toISOString().split('T')[0];
          executionsByDate[date] = executionsByDate[date] || [];
          executionsByDate[date].push(log);
        }
      });
    }
    
    // Calculate metrics for each date
    const executionCounts: Array<{ date: string; value: number }> = [];
    const successRates: Array<{ date: string; value: number }> = [];
    const executionTimes: Array<{ date: string; value: number }> = [];
    
    Object.entries(executionsByDate).forEach(([date, logs]) => {
      // Execution count
      executionCounts.push({
        date,
        value: logs.length
      });
      
      // Success rate
      const successfulExecutions = logs.filter(log => log.status === 'completed').length;
      successRates.push({
        date,
        value: logs.length > 0 ? (successfulExecutions / logs.length) * 100 : 0
      });
      
      // Average execution time
      const times = logs
        .filter(log => log.duration_seconds)
        .map(log => log.duration_seconds || 0);
        
      executionTimes.push({
        date,
        value: times.length > 0 ? times.reduce((sum, time) => sum + time, 0) / times.length : 0
      });
    });
    
    // Sort by date
    const sortByDate = (a: { date: string }, b: { date: string }) => 
      new Date(a.date).getTime() - new Date(b.date).getTime();
      
    executionCounts.sort(sortByDate);
    successRates.sort(sortByDate);
    executionTimes.sort(sortByDate);
    
    return {
      executionCounts,
      successRates,
      executionTimes
    };
  } catch (error) {
    console.error('Error getting usage patterns:', error);
    throw error;
  }
}
