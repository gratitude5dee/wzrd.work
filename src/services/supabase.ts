
import { supabase } from "@/integrations/supabase/client";
import { Tables, TablesInsert, TablesUpdate } from "@/integrations/supabase/types";

// Function to retrieve Action data based on ID
export async function getActionById(actionId: string) {
  const { data, error } = await supabase
    .from('workflow_actions')
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
    .from('workflow_actions')
    .select('*')
    .order('created_at', { ascending: false });
    
  if (error) {
    throw new Error(`Error fetching actions: ${error.message}`);
  }
  
  return data || [];
}

// Function to create a new action
export async function createAction(actionData: TablesInsert<'workflow_actions'>) {
  const { data, error } = await supabase
    .from('workflow_actions')
    .insert([actionData])
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
  actionData: TablesUpdate<'workflow_actions'>
) {
  const { data, error } = await supabase
    .from('workflow_actions')
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
    .from('workflow_actions')
    .delete()
    .eq('id', id);
    
  if (error) {
    throw new Error(`Error deleting action: ${error.message}`);
  }
  
  return true;
}

// Function to execute an action
export async function executeAction(
  actionId: string, 
  userId: string
) {
  try {
    // Retrieve the action details
    const action = await getActionById(actionId);
    
    if (!action) {
      throw new Error('Action not found');
    }
    
    // Create an execution log entry
    const { data: executionData, error: executionError } = await supabase
      .from('action_executions')
      .insert({
        action_id: actionId,
        user_id: userId,
        status: 'processing',
        progress: 0
      })
      .select()
      .single();
    
    if (executionError) {
      throw new Error(`Error creating execution log: ${executionError.message}`);
    }
    
    // Call the Supabase Edge Function to execute the action
    const { data, error } = await supabase.functions.invoke('execute-action', {
      body: {
        actionId,
        userId,
        executionId: executionData.id,
        actionDetails: action,
      },
    });
    
    if (error) {
      throw new Error(`Error executing action: ${error.message}`);
    }
    
    // Return the execution result
    return executionData;
  } catch (error) {
    console.error('Error in executeAction:', error);
    throw error;
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
    
    // Calculate progress based on status
    let progress = 0;
    
    // Try to extract progress from execution_data
    if (data.execution_data) {
      const executionData = typeof data.execution_data === 'string' 
        ? JSON.parse(data.execution_data) 
        : data.execution_data;
      
      if (typeof executionData.progress === 'number') {
        progress = executionData.progress;
      }
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
      progress,
      result: data.result,
      error_message: data.error_message,
    };
  } catch (error) {
    console.error('Error in getExecutionStatus:', error);
    throw error;
  }
}

// Function to get all actions
export async function getActions(userId?: string) {
  try {
    let query = supabase.from('workflow_actions').select('*');
    
    // If userId is provided, filter by created_by
    if (userId) {
      query = query.eq('created_by', userId);
    }
    
    const { data, error } = await query.order('created_at', { ascending: false });
    
    if (error) {
      throw new Error(`Error fetching actions: ${error.message}`);
    }
    
    return data || [];
  } catch (error) {
    console.error('Error in getActions:', error);
    throw error;
  }
}

// Function to get action executions
export async function getActionExecutions(userId?: string) {
  try {
    let query = supabase.from('action_executions').select(`
      *,
      workflow_actions(name, description)
    `);
    
    // If userId is provided, filter by user_id
    if (userId) {
      query = query.eq('user_id', userId);
    }
    
    const { data, error } = await query.order('created_at', { ascending: false });
    
    if (error) {
      throw new Error(`Error fetching action executions: ${error.message}`);
    }
    
    return data || [];
  } catch (error) {
    console.error('Error in getActionExecutions:', error);
    throw error;
  }
}
