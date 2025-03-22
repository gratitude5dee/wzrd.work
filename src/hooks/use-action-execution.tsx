
import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';
import { WorkflowAction } from '@/services/recordingService';

export interface ExecutionLog {
  id?: string;
  action_id: string;
  user_id?: string;
  status: 'started' | 'running' | 'completed' | 'failed' | 'cancelled';
  start_time?: Date;
  end_time?: Date;
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
  const { user } = useAuth();

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
      const executionLog: ExecutionLog = {
        action_id: action.id,
        user_id: user.id,
        status: 'started',
        start_time: new Date(),
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

      setCurrentExecution(data);
      setIsExecuting(true);
      
      return data;
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
      const { error } = await supabase
        .from('execution_logs')
        .update(updates)
        .eq('id', executionId);

      if (error) {
        throw error;
      }

      if (currentExecution && currentExecution.id === executionId) {
        setCurrentExecution(prev => prev ? { ...prev, ...updates } : null);
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
    const startTime = currentExecution?.start_time 
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
        await supabase.from('analytics_data').insert([
          {
            user_id: user.id,
            action_id: currentExecution?.action_id,
            metric_type: 'execution_time',
            metric_value: durationSeconds,
            context: { execution_id: executionId }
          },
          {
            user_id: user.id,
            action_id: currentExecution?.action_id,
            metric_type: 'time_saved',
            metric_value: durationSeconds * 2, // Simplified estimate
            context: { execution_id: executionId }
          }
        ]);
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
