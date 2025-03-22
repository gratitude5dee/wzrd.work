
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
    
    // Transform the data to match the ActionData interface using explicit type annotation
    // to prevent deep type instantiation
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
    
    // Transform the data to match the ExecutionLog interface using explicit type 
    // annotation to prevent deep type instantiation
    const transformedData: ExecutionLog[] = (data || []).map(item => {
      // Handle execution_data parsing
      let inputValue = '';
      let outputValue = '';
      
      if (item.execution_data) {
        try {
          const execData = typeof item.execution_data === 'string' 
            ? JSON.parse(item.execution_data) 
            : item.execution_data;
              
          if (execData) {
            inputValue = execData.input || '';
            outputValue = execData.output || '';
          }
        } catch (e) {
          console.error('Error parsing execution data:', e);
        }
      }
      
      return {
        id: item.id,
        created_at: item.created_at,
        action_id: item.action_id,
        user_id: item.user_id,
        success: item.status === 'completed', 
        time_saved: item.duration_seconds ? item.duration_seconds * 2 : 0,
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

/**
 * Execute an action with Surf integration
 */
export const executeAction = async (
  actionId: string, 
  userId: string,
  input?: string
): Promise<{ executionId: string; success: boolean; message: string }> => {
  try {
    const { data, error } = await supabase.functions.invoke('execute-action', {
      body: { 
        actionId, 
        userId,
        input,
        useSurf: true // Flag to use Surf Computer Agent
      }
    });
    
    if (error) throw error;
    
    return {
      executionId: data.executionId || '',
      success: data.success || false,
      message: data.message || 'Action execution requested'
    };
  } catch (error) {
    console.error('Error executing action:', error);
    return {
      executionId: '',
      success: false,
      message: `Error: ${error instanceof Error ? error.message : 'Unknown error occurred'}`
    };
  }
};

/**
 * Get execution status updates for a specific execution
 */
export const getExecutionStatus = async (executionId: string): Promise<{
  status: string;
  progress: number;
  output?: string;
  error?: string;
}> => {
  try {
    const { data, error } = await supabase
      .from('execution_logs')
      .select('*')
      .eq('id', executionId)
      .single();
    
    if (error) throw error;
    
    // Extract output from execution data if available
    let output = '';
    let outputError = '';
    let progressValue = 0;
    
    if (data.execution_data) {
      try {
        const execData = typeof data.execution_data === 'string' 
          ? JSON.parse(data.execution_data) 
          : data.execution_data;
                
        if (execData) {
          output = execData.output || '';
          outputError = execData.error || '';
          // Use progress from execution_data if available
          if (typeof execData.progress === 'number') {
            progressValue = execData.progress;
          }
        }
      } catch (e) {
        console.error('Error parsing execution data:', e);
      }
    }
    
    // Calculate progress based on status if not available in execution_data
    if (progressValue === 0) {
      if (data.status === 'completed') {
        progressValue = 100;
      } else if (data.status === 'running') {
        progressValue = 50;
      } else if (data.status === 'started') {
        progressValue = 10;
      }
    }
    
    return {
      status: data.status || 'unknown',
      progress: progressValue,
      output,
      error: data.error_message || outputError || undefined
    };
  } catch (error) {
    console.error('Error fetching execution status:', error);
    return {
      status: 'error',
      progress: 0,
      error: `Error: ${error instanceof Error ? error.message : 'Unknown error occurred'}`
    };
  }
};
