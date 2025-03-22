
import { supabase } from '@/integrations/supabase/client';
import { ActionData, ExecutionLog } from '@/hooks/use-action-analytics';

/**
 * Get all actions for a specific user
 */
export const getActions = async (userId: string): Promise<ActionData[]> => {
  try {
    const { data, error } = await supabase
      .from('workflow_actions')
      .select('*')
      .eq('user_id', userId);
      
    if (error) throw error;
    
    // Transform the data to match the ActionData interface
    const transformedData = (data || []).map(item => ({
      id: item.id,
      created_at: item.created_at,
      user_id: userId, // Assuming user_id might be missing or different in the raw data
      name: item.name || '',
      description: item.description || '',
      pattern: item.tags || [], // Using tags as pattern
      script: item.instructions || '', // Using instructions as script
      success_rate: item.confidence_score || 0,
      average_execution_time: item.estimated_time_seconds || 0,
      category: item.action_type || ''
    }));
    
    return transformedData;
  } catch (error) {
    console.error('Error fetching actions:', error);
    return [];
  }
};

/**
 * Get all action executions for a specific user
 */
export const getActionExecutions = async (userId: string): Promise<ExecutionLog[]> => {
  try {
    const { data, error } = await supabase
      .from('execution_logs')
      .select('*')
      .eq('user_id', userId);
      
    if (error) throw error;
    
    // Transform the data to match the ExecutionLog interface
    const transformedData = (data || []).map(item => ({
      id: item.id,
      created_at: item.created_at,
      action_id: item.action_id,
      user_id: item.user_id,
      success: item.status === 'completed', // Assuming 'completed' means success
      time_saved: item.duration_seconds ? item.duration_seconds * 2 : 0, // Estimating time saved as 2x duration
      execution_time: item.duration_seconds || 0,
      input: item.execution_data?.input || '',
      output: item.execution_data?.output || ''
    }));
    
    return transformedData;
  } catch (error) {
    console.error('Error fetching action executions:', error);
    return [];
  }
};
