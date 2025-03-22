
import { supabase } from '@/integrations/supabase/client';

/**
 * Calculate a projection of time saved based on current patterns
 * @param userId The user ID to calculate projections for
 * @param timeframe The timeframe for the projection ('month' | 'year')
 */
export async function calculateProjectedSavings(userId: string, timeframe: 'month' | 'year') {
  try {
    // Get all execution logs
    const { data: executionLogs, error } = await supabase
      .from('execution_logs')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(100);
    
    if (error) throw error;
    
    // If no logs, return zeros
    if (!executionLogs || executionLogs.length === 0) {
      return {
        projectedTimeSaved: 0,
        dailyAverage: 0,
        growthRate: 0
      };
    }
    
    // Group logs by date
    type LogsByDate = Record<string, Array<any>>;
    const logsByDate = executionLogs.reduce((acc: LogsByDate, log) => {
      const date = new Date(log.created_at).toDateString();
      if (!acc[date]) {
        acc[date] = [];
      }
      acc[date].push(log);
      return acc;
    }, {} as LogsByDate);
    
    // Calculate daily average time saved
    const dailyTimeSaved = Object.entries(logsByDate).map(([date, logs]) => {
      const timeSaved = logs.reduce((sum, log) => {
        return sum + (log.duration_seconds || 0);
      }, 0);
      return { date, timeSaved };
    });
    
    // Calculate the average daily time saved
    const dailyAverage = dailyTimeSaved.reduce((sum, day) => sum + day.timeSaved, 0) / 
      Math.max(1, dailyTimeSaved.length);
    
    // Calculate projections based on timeframe
    const projectedDays = timeframe === 'month' ? 30 : 365;
    const projectedTimeSaved = dailyAverage * projectedDays;
    
    // Calculate growth rate if we have enough data
    let growthRate = 0;
    if (dailyTimeSaved.length > 10) {
      const firstHalf = dailyTimeSaved.slice(0, Math.floor(dailyTimeSaved.length / 2));
      const secondHalf = dailyTimeSaved.slice(Math.floor(dailyTimeSaved.length / 2));
      
      const firstHalfAvg = firstHalf.reduce((sum, day) => sum + day.timeSaved, 0) / 
        Math.max(1, firstHalf.length);
      const secondHalfAvg = secondHalf.reduce((sum, day) => sum + day.timeSaved, 0) / 
        Math.max(1, secondHalf.length);
      
      growthRate = firstHalfAvg === 0 ? 0 : ((secondHalfAvg - firstHalfAvg) / firstHalfAvg) * 100;
    }
    
    return {
      projectedTimeSaved,
      dailyAverage,
      growthRate
    };
  } catch (error) {
    console.error('Error calculating projected savings:', error);
    throw error;
  }
}

/**
 * Get analytics for time saved by category
 * @param userId The user ID to get category breakdown for
 */
export async function getTimeSavedByCategory(userId: string) {
  try {
    // Get all workflow actions created by the user to identify categories
    const { data: actions, error: actionsError } = await supabase
      .from('workflow_actions')
      .select('id, name, tags')
      .eq('user_id', userId);
    
    if (actionsError) throw actionsError;
    
    // Get execution logs for those actions
    const { data: executionLogs, error: logsError } = await supabase
      .from('execution_logs')
      .select('*')
      .eq('user_id', userId);
    
    if (logsError) throw logsError;
    
    // If no data, return empty array
    if (!actions || !executionLogs) {
      return [];
    }
    
    // Group actions by primary tag/category
    const actionsByCategory: Record<string, { id: string, name: string }[]> = {};
    
    actions.forEach(action => {
      if (!action.tags || action.tags.length === 0) {
        const category = 'Uncategorized';
        if (!actionsByCategory[category]) {
          actionsByCategory[category] = [];
        }
        actionsByCategory[category].push({
          id: action.id,
          name: action.name
        });
      } else {
        // Use the first tag as the primary category
        const category = action.tags[0];
        if (!actionsByCategory[category]) {
          actionsByCategory[category] = [];
        }
        actionsByCategory[category].push({
          id: action.id,
          name: action.name
        });
      }
    });
    
    // Calculate time saved per category
    const categorySavings = Object.entries(actionsByCategory).map(([category, categoryActions]) => {
      const actionIds = categoryActions.map(a => a.id);
      
      const categoryLogs = executionLogs.filter(log => 
        actionIds.includes(log.action_id) && log.status === 'completed'
      );
      
      const timeSaved = categoryLogs.reduce((sum, log) => sum + (log.duration_seconds || 0), 0);
      
      return {
        category,
        timeSaved,
        actionCount: categoryActions.length,
        executionCount: categoryLogs.length
      };
    });
    
    // Sort by time saved descending
    return categorySavings.sort((a, b) => b.timeSaved - a.timeSaved);
  } catch (error) {
    console.error('Error getting time saved by category:', error);
    throw error;
  }
}

/**
 * Get milestones achieved and upcoming for a user
 * @param userId The user ID to get milestones for
 */
export async function getUserMilestones(userId: string) {
  try {
    // Get total time saved
    const { data: analytics, error: analyticsError } = await supabase
      .from('analytics_data')
      .select('metric_value')
      .eq('user_id', userId)
      .eq('metric_type', 'time_saved');
    
    if (analyticsError) throw analyticsError;
    
    // Calculate total time saved
    const totalTimeSaved = analytics
      ? analytics.reduce((sum, item) => sum + (item.metric_value || 0), 0)
      : 0;
    
    // Define milestones in seconds
    const milestones = [
      { id: 1, threshold: 60, label: '1 minute saved' },
      { id: 2, threshold: 300, label: '5 minutes saved' },
      { id: 3, threshold: 900, label: '15 minutes saved' },
      { id: 4, threshold: 1800, label: '30 minutes saved' },
      { id: 5, threshold: 3600, label: '1 hour saved' },
      { id: 6, threshold: 7200, label: '2 hours saved' },
      { id: 7, threshold: 18000, label: '5 hours saved' },
      { id: 8, threshold: 28800, label: '8 hours saved' },
      { id: 9, threshold: 86400, label: '1 day saved' },
      { id: 10, threshold: 259200, label: '3 days saved' },
      { id: 11, threshold: 432000, label: '5 days saved' },
      { id: 12, threshold: 864000, label: '10 days saved' }
    ];
    
    // Mark milestones as achieved or upcoming
    const markedMilestones = milestones.map(milestone => ({
      ...milestone,
      achieved: totalTimeSaved >= milestone.threshold,
      date: totalTimeSaved >= milestone.threshold ? new Date().toISOString() : null
    }));
    
    return {
      achieved: markedMilestones.filter(m => m.achieved),
      upcoming: markedMilestones.filter(m => !m.achieved),
      totalTimeSaved
    };
  } catch (error) {
    console.error('Error getting user milestones:', error);
    throw error;
  }
}
