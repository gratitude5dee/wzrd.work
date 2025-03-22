
import { supabase } from '@/integrations/supabase/client';
import { ActionData, ExecutionLog } from '@/hooks/use-action-analytics';

/**
 * Get all actions for a specific user
 */
export const getActions = async (userId: string): Promise<ActionData[]> => {
  try {
    // Using a type assertion to handle type issues with Supabase client
    const { data, error } = await supabase
      .from('workflow_actions')
      .select('*')
      .eq('user_id', userId);
      
    if (error) throw error;
    return (data || []) as ActionData[];
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
    // Using a type assertion to handle type issues with Supabase client
    const { data, error } = await supabase
      .from('execution_logs')
      .select('*')
      .eq('user_id', userId);
      
    if (error) throw error;
    return (data || []) as ExecutionLog[];
  } catch (error) {
    console.error('Error fetching action executions:', error);
    return [];
  }
};
