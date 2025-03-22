
import { supabase } from '@/integrations/supabase/client';
import { ActionData, ExecutionLog } from '@/hooks/use-action-analytics';
import { Json } from '@/integrations/supabase/types';

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
    const transformedData: ActionData[] = (data || []).map(item => ({
      id: item.id,
      created_at: item.created_at,
      user_id: userId,
      name: item.name || '',
      description: item.description || '',
      pattern: Array.isArray(item.tags) ? item.tags : [], 
      script: item.instructions || '',
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
    const transformedData: ExecutionLog[] = (data || []).map(item => {
      // Safely handle potentially undefined or malformed execution_data
      let inputValue = '';
      let outputValue = '';
      
      if (item.execution_data) {
        if (typeof item.execution_data === 'object' && !Array.isArray(item.execution_data)) {
          // Handle case where execution_data is an object
          const execData = item.execution_data as Record<string, any>;
          inputValue = typeof execData.input === 'string' ? execData.input : '';
          outputValue = typeof execData.output === 'string' ? execData.output : '';
        } else if (typeof item.execution_data === 'string') {
          // Handle case where execution_data might be a JSON string
          try {
            const parsedData = JSON.parse(item.execution_data);
            if (typeof parsedData === 'object' && parsedData !== null) {
              inputValue = typeof parsedData.input === 'string' ? parsedData.input : '';
              outputValue = typeof parsedData.output === 'string' ? parsedData.output : '';
            }
          } catch (e) {
            // If JSON parsing fails, leave as empty strings
          }
        }
      }
      
      return {
        id: item.id,
        created_at: item.created_at,
        action_id: item.action_id,
        user_id: item.user_id,
        success: item.status === 'completed', // Assuming 'completed' means success
        time_saved: item.duration_seconds ? item.duration_seconds * 2 : 0, // Estimating time saved as 2x duration
        execution_time: item.duration_seconds || 0,
        input: inputValue,
        output: outputValue
      };
    });
    
    return transformedData;
  } catch (error) {
    console.error('Error fetching action executions:', error);
    return [];
  }
};
