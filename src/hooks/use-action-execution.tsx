import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useStytchUser } from '@stytch/react';
import { toast } from '@/hooks/use-toast';
import { WorkflowAction } from '@/services/recordingService';

export type ExecutionStatus = 'started' | 'running' | 'completed' | 'failed' | 'cancelled';

export interface ExecutionLog {
  id?: string;
  action_id: string;
  user_id?: string;
  status: ExecutionStatus;
  start_time?: string | Date;
  end_time?: string | Date;
  duration_seconds?: number;
  checkpoints_shown: number;
  checkpoints_modified: number;
  checkpoints_cancelled: number;
  error_message?: string;
  execution_data?: any;
}

export function useActionExecution() {
  const [currentExecution, setCurrentExecution] = useState<ExecutionLog | null>(null);
  const [isExecuting, setIsExecuting] = useState(false);
  const { user } = useStytchUser();

  // Start execution of an action
  const startExecution = useCallback(async (action: WorkflowAction) => {
    if (!user) {
      toast({
        title: 'Authentication required',
        description: 'You must be logged in to execute actions.',
        variant: 'destructive'
      });
      return null;
    }

    try {
      const startTime = new Date();
      // Create the execution log object with proper typing
      const executionLog: {
        action_id: string;
        user_id: string;
        status: ExecutionStatus;
        start_time: string;
        checkpoints_shown: number;
        checkpoints_modified: number;
        checkpoints_cancelled: number;
        execution_data?: any;
      } = {
        action_id: action.id,
        user_id: user.user_id,
        status: 'started',
        start_time: startTime.toISOString(),
        checkpoints_shown: 0,
        checkpoints_modified: 0,
        checkpoints_cancelled: 0,
        execution_data: {
          action_type: action.action_type,
          action_data: action.action_data
        }
      };

      const { data, error } = await supabase
        .from('execution_logs')
        .insert(executionLog)
        .select()
        .single();

      if (error) {
        throw error;
      }

      // Convert string dates to Date objects for internal state
      if (data) {
        const formattedData: ExecutionLog = {
          ...data,
          start_time: data.start_time ? new Date(data.start_time) : undefined,
          end_time: data.end_time ? new Date(data.end_time) : undefined,
          status: data.status as ExecutionStatus
        };

        setCurrentExecution(formattedData);
        setIsExecuting(true);
        return formattedData;
      }
      
      return null;
    } catch (error) {
      console.error('Error starting execution:', error);
      toast({
        title: 'Error starting execution',
        description: 'There was a problem starting the action execution.',
        variant: 'destructive'
      });
      return null;
    }
  }, [user, toast]);

  // Update execution status and metrics
  const updateExecution = useCallback(async (
    executionId: string, 
    updates: Partial<ExecutionLog>
  ) => {
    try {
      // Convert Date objects to ISO strings for Supabase
      const formattedUpdates: Record<string, any> = {};
      Object.entries(updates).forEach(([key, value]) => {
        if (value instanceof Date) {
          formattedUpdates[key] = value.toISOString();
        } else {
          formattedUpdates[key] = value;
        }
      });

      const { error } = await supabase
        .from('execution_logs')
        .update(formattedUpdates)
        .eq('id', executionId);

      if (error) {
        throw error;
      }

      if (currentExecution && currentExecution.id === executionId) {
        setCurrentExecution(prev => {
          if (!prev) return null;
          
          // Create a proper merged object
          const updated = { ...prev };
          
          // Handle each field appropriately
          Object.entries(updates).forEach(([key, value]) => {
            (updated as any)[key] = value;
          });
          
          return updated;
        });
      }

      // If completed or failed, set isExecuting to false
      if (
        updates.status === 'completed' || 
        updates.status === 'failed' || 
        updates.status === 'cancelled'
      ) {
        setIsExecuting(false);
      }
    } catch (error) {
      console.error('Error updating execution:', error);
    }
  }, [currentExecution]);

  // Complete an execution with end time and duration
  const completeExecution = useCallback(async (
    executionId: string,
    status: 'completed' | 'failed' | 'cancelled' = 'completed',
    errorMessage?: string
  ) => {
    const endTime = new Date();
    const startTime = currentExecution?.start_time instanceof Date 
      ? currentExecution.start_time
      : currentExecution?.start_time
        ? new Date(currentExecution.start_time)
        : new Date();
    
    const durationSeconds = (endTime.getTime() - startTime.getTime()) / 1000;

    const updates: Partial<ExecutionLog> = {
      status,
      end_time: endTime,
      duration_seconds: durationSeconds
    };

    if (errorMessage) {
      updates.error_message = errorMessage;
    }

    await updateExecution(executionId, updates);

    // Record analytics data for this execution
    if (user && status === 'completed') {
      try {
        // Use appropriate types for analytics data
        const metrics = [
          {
            user_id: user.user_id,
            action_id: currentExecution?.action_id,
            metric_type: 'execution_time',
            metric_value: durationSeconds,
            context: { execution_id: executionId }
          },
          {
            user_id: user.user_id,
            action_id: currentExecution?.action_id,
            metric_type: 'time_saved',
            metric_value: durationSeconds * 2, // Simplified estimate
            context: { execution_id: executionId }
          }
        ];
        
        await supabase.from('analytics_data').insert(metrics);
      } catch (error) {
        console.error('Error recording analytics:', error);
      }
    }

    return { status, durationSeconds };
  }, [currentExecution, updateExecution, user]);

  // Record a checkpoint interaction
  const recordCheckpointInteraction = useCallback(async (
    executionId: string,
    interactionType: 'shown' | 'modified' | 'cancelled'
  ) => {
    if (!currentExecution) return;

    const updates: Partial<ExecutionLog> = {};
    
    if (interactionType === 'shown') {
      updates.checkpoints_shown = (currentExecution.checkpoints_shown || 0) + 1;
    } else if (interactionType === 'modified') {
      updates.checkpoints_modified = (currentExecution.checkpoints_modified || 0) + 1;
    } else if (interactionType === 'cancelled') {
      updates.checkpoints_cancelled = (currentExecution.checkpoints_cancelled || 0) + 1;
    }

    await updateExecution(executionId, updates);
  }, [currentExecution, updateExecution]);

  return {
    currentExecution,
    isExecuting,
    startExecution,
    updateExecution,
    completeExecution,
    recordCheckpointInteraction
  };
}
