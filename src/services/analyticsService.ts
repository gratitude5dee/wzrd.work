
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

export interface AnalyticsMetric {
  id?: string;
  user_id?: string;
  action_id?: string;
  metric_type: string;
  metric_value: number;
  context?: any;
  created_at?: string;
}

export interface ActionMetrics {
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

// Track an analytics metric
export async function trackMetric(metric: Omit<AnalyticsMetric, 'id' | 'created_at'>) {
  try {
    const { error } = await supabase
      .from('analytics_data')
      .insert(metric);
    
    if (error) throw error;
    
    return true;
  } catch (error) {
    console.error('Error tracking metric:', error);
    return false;
  }
}

// Get metrics for a specific action
export async function getActionMetrics(actionId: string): Promise<ActionMetrics | null> {
  try {
    // Get execution logs for this action
    const { data: executionLogs, error: executionError } = await supabase
      .from('execution_logs')
      .select('*')
      .eq('action_id', actionId);
    
    if (executionError) throw executionError;
    
    if (!executionLogs || executionLogs.length === 0) {
      return {
        executionCount: 0,
        successRate: 0,
        avgExecutionTime: 0,
        estimatedTimeSaved: 0,
        checkpointInteractions: {
          shown: 0,
          modified: 0,
          cancelled: 0
        }
      };
    }
    
    // Calculate metrics
    const executionCount = executionLogs.length;
    const successfulExecutions = executionLogs.filter(log => log.status === 'completed');
    const successRate = (successfulExecutions.length / executionCount) * 100;
    
    // Calculate average execution time (only for completed executions)
    const executionTimes = successfulExecutions
      .filter(log => log.duration_seconds)
      .map(log => log.duration_seconds || 0);
    
    const avgExecutionTime = executionTimes.length > 0
      ? executionTimes.reduce((sum, time) => sum + time, 0) / executionTimes.length
      : 0;
    
    // Calculate time saved (simplified estimation)
    const estimatedTimeSaved = avgExecutionTime * successfulExecutions.length * 2;
    
    // Calculate checkpoint interactions
    const checkpointInteractions = {
      shown: executionLogs.reduce((sum, log) => sum + (log.checkpoints_shown || 0), 0),
      modified: executionLogs.reduce((sum, log) => sum + (log.checkpoints_modified || 0), 0),
      cancelled: executionLogs.reduce((sum, log) => sum + (log.checkpoints_cancelled || 0), 0)
    };
    
    return {
      executionCount,
      successRate,
      avgExecutionTime,
      estimatedTimeSaved,
      checkpointInteractions
    };
  } catch (error) {
    console.error('Error getting action metrics:', error);
    toast({
      title: 'Error loading metrics',
      description: 'Failed to load action metrics data.',
      variant: 'destructive'
    });
    return null;
  }
}

// Get overall user metrics
export async function getUserMetrics() {
  try {
    // Get metrics data for the current user
    const { data: userData, error: userError } = await supabase
      .from('analytics_data')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (userError) throw userError;
    
    // Get execution logs for the current user
    const { data: executionLogs, error: executionError } = await supabase
      .from('execution_logs')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (executionError) throw executionError;
    
    // Calculate overall metrics
    const totalTimeSaved = userData
      .filter(data => data.metric_type === 'time_saved')
      .reduce((sum, data) => sum + (data.metric_value || 0), 0);
    
    const totalExecutions = executionLogs.length;
    const successfulExecutions = executionLogs.filter(log => log.status === 'completed');
    const overallSuccessRate = totalExecutions > 0
      ? (successfulExecutions.length / totalExecutions) * 100
      : 0;
    
    // Get most used actions
    const actionUsageCounts: Record<string, number> = {};
    executionLogs.forEach(log => {
      if (log.action_id) {
        actionUsageCounts[log.action_id] = (actionUsageCounts[log.action_id] || 0) + 1;
      }
    });
    
    const mostUsedActions = Object.entries(actionUsageCounts)
      .map(([actionId, count]) => ({ actionId, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);
    
    return {
      totalTimeSaved,
      totalExecutions,
      overallSuccessRate,
      mostUsedActions,
      executionLogs: executionLogs.slice(0, 10) // Latest 10 executions
    };
  } catch (error) {
    console.error('Error getting user metrics:', error);
    toast({
      title: 'Error loading metrics',
      description: 'Failed to load user metrics data.',
      variant: 'destructive'
    });
    return null;
  }
}

// Get usage patterns over time
export async function getUsagePatterns(timeframe: 'day' | 'week' | 'month' = 'week') {
  try {
    let timeFilter: string;
    
    switch (timeframe) {
      case 'day':
        timeFilter = 'created_at > now() - interval \'24 hours\'';
        break;
      case 'month':
        timeFilter = 'created_at > now() - interval \'30 days\'';
        break;
      case 'week':
      default:
        timeFilter = 'created_at > now() - interval \'7 days\'';
    }
    
    // Get execution data within timeframe
    const { data, error } = await supabase
      .from('execution_logs')
      .select('*')
      .order('created_at', { ascending: true })
      .filter('created_at', 'gt', `now() - interval '${timeframe === 'day' ? '1' : timeframe === 'week' ? '7' : '30'} days'`);
    
    if (error) throw error;
    
    if (!data || data.length === 0) {
      return {
        executionCounts: [],
        successRates: [],
        executionTimes: []
      };
    }
    
    // Group data by day for charting
    const executionsByDay: Record<string, any[]> = {};
    
    data.forEach(log => {
      const date = new Date(log.created_at).toISOString().split('T')[0];
      if (!executionsByDay[date]) {
        executionsByDay[date] = [];
      }
      executionsByDay[date].push(log);
    });
    
    // Format data for charts
    const executionCounts = Object.entries(executionsByDay).map(([date, logs]) => ({
      date,
      value: logs.length
    }));
    
    const successRates = Object.entries(executionsByDay).map(([date, logs]) => {
      const successfulLogs = logs.filter(log => log.status === 'completed');
      return {
        date,
        value: logs.length > 0 ? (successfulLogs.length / logs.length) * 100 : 0
      };
    });
    
    const executionTimes = Object.entries(executionsByDay).map(([date, logs]) => {
      const completedLogs = logs.filter(log => log.status === 'completed' && log.duration_seconds);
      const avgTime = completedLogs.length > 0
        ? completedLogs.reduce((sum, log) => sum + (log.duration_seconds || 0), 0) / completedLogs.length
        : 0;
      return {
        date,
        value: avgTime
      };
    });
    
    return {
      executionCounts,
      successRates,
      executionTimes
    };
  } catch (error) {
    console.error('Error getting usage patterns:', error);
    toast({
      title: 'Error loading usage data',
      description: 'Failed to load usage pattern data.',
      variant: 'destructive'
    });
    return null;
  }
}
