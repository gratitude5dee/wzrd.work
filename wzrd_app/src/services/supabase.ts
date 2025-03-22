
import { createClient } from '@supabase/supabase-js';
import { Database } from '@/integrations/supabase/types';

// Initialize Supabase client
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

// Use explicit type annotations to prevent excessive type recursion
export const supabase = createClient<Database>(supabaseUrl, supabaseKey);

// Function to retrieve Action data based on ID
export async function getActionById(actionId: string) {
  const { data, error } = await supabase
    .from('actions')
    .select('*')
    .eq('id', actionId)
    .single();
    
  if (error) {
    throw new Error(`Error fetching action: ${error.message}`);
  }
  
  return data;
}

// Function to list all actions
export async function listActions() {
  const { data, error } = await supabase
    .from('actions')
    .select('*')
    .order('created_at', { ascending: false });
    
  if (error) {
    throw new Error(`Error fetching actions: ${error.message}`);
  }
  
  return data || [];
}

// Function to create a new action
export async function createAction(actionData: {
  name: string;
  description: string;
  steps: Array<{
    type: string;
    action: string;
    parameters?: Record<string, any>;
    target?: string;
  }>;
  prompt: string;
  expected_outcome: string;
  triggers?: string[];
  examples?: string[];
  prerequisites?: string[];
}) {
  const { data, error } = await supabase
    .from('actions')
    .insert([
      {
        name: actionData.name,
        description: actionData.description,
        steps: actionData.steps,
        prompt: actionData.prompt,
        expected_outcome: actionData.expected_outcome,
        triggers: actionData.triggers || [],
        examples: actionData.examples || [],
        prerequisites: actionData.prerequisites || [],
        created_by: (await supabase.auth.getUser()).data.user?.id || 'anonymous',
      },
    ])
    .select()
    .single();
    
  if (error) {
    throw new Error(`Error creating action: ${error.message}`);
  }
  
  return data;
}

// Function to update an existing action
export async function updateAction(
  id: string,
  actionData: {
    name?: string;
    description?: string;
    steps?: Array<{
      type: string;
      action: string;
      parameters?: Record<string, any>;
      target?: string;
    }>;
    prompt?: string;
    expected_outcome?: string;
    triggers?: string[];
    examples?: string[];
    prerequisites?: string[];
  }
) {
  const { data, error } = await supabase
    .from('actions')
    .update(actionData)
    .eq('id', id)
    .select()
    .single();
    
  if (error) {
    throw new Error(`Error updating action: ${error.message}`);
  }
  
  return data;
}

// Function to delete an action
export async function deleteAction(id: string) {
  const { error } = await supabase
    .from('actions')
    .delete()
    .eq('id', id);
    
  if (error) {
    throw new Error(`Error deleting action: ${error.message}`);
  }
  
  return true;
}

// Function to execute an action
export async function executeAction(actionId: string, userId: string) {
  try {
    // Retrieve the action details
    const action = await getActionById(actionId);
    
    if (!action) {
      throw new Error('Action not found');
    }
    
    // Call the Supabase Edge Function to execute the action
    const { data, error } = await supabase.functions.invoke('execute-action', {
      body: {
        actionId,
        userId,
        actionDetails: action,
      },
    });
    
    if (error) {
      throw new Error(`Error executing action: ${error.message}`);
    }
    
    // Return the execution result
    return data as {
      success: boolean;
      executionId: string;
      message?: string;
    };
  } catch (error) {
    console.error('Error in executeAction:', error);
    return {
      success: false,
      executionId: '',
      message: error instanceof Error ? error.message : 'Unknown error occurred',
    };
  }
}

// Function to get execution status
export async function getExecutionStatus(executionId: string) {
  try {
    const { data, error } = await supabase
      .from('action_executions')
      .select('*')
      .eq('id', executionId)
      .single();
    
    if (error) {
      throw new Error(`Error fetching execution: ${error.message}`);
    }
    
    if (!data) {
      throw new Error('Execution not found');
    }
    
    // Default values
    let progress = 0;
    
    // Try to extract progress from execution_data
    try {
      if (data.execution_data && typeof data.execution_data === 'string') {
        // Safely parse the JSON or use an empty object
        const executionData = JSON.parse(data.execution_data);
        if (typeof executionData.progress === 'number') {
          progress = executionData.progress;
        }
      } else if (data.execution_data && typeof data.execution_data === 'object') {
        // If it's already an object
        const executionData = data.execution_data as { progress?: number };
        if (typeof executionData.progress === 'number') {
          progress = executionData.progress;
        }
      }
    } catch (e) {
      // If parsing fails, calculate progress based on status
      console.warn('Error parsing execution_data:', e);
    }
    
    // If no progress has been set, estimate based on status
    if (progress === 0) {
      switch (data.status) {
        case 'queued':
          progress = 0;
          break;
        case 'processing':
          progress = 50;
          break;
        case 'completed':
          progress = 100;
          break;
        case 'failed':
          progress = 100;
          break;
        default:
          progress = 0;
      }
    }
    
    return {
      status: data.status,
      progress, // Now returns the calculated or extracted progress
      output: data.result,
      error: data.error_message,
    };
  } catch (error) {
    console.error('Error in getExecutionStatus:', error);
    return {
      status: 'error',
      progress: 0,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
    };
  }
}
