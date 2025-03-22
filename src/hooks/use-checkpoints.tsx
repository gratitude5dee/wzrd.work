
import { useState, useCallback } from 'react';
import { useUserPreferences } from './use-user-preferences';
import { WorkflowAction } from '@/services/recordingService';

export interface Checkpoint {
  id: string;
  title: string;
  description: string;
  importance: number; // 1-10 scale
  step: number;
  actionData?: any;
}

export function useCheckpoints() {
  const { preferences } = useUserPreferences();
  const [currentCheckpoint, setCurrentCheckpoint] = useState<Checkpoint | null>(null);
  const [checkpointHistory, setCheckpointHistory] = useState<Checkpoint[]>([]);
  const [showCheckpoint, setShowCheckpoint] = useState(false);

  const shouldShowCheckpoint = useCallback((checkpoint: Checkpoint): boolean => {
    if (!preferences) return true;
    
    // Check if importance threshold is met
    if (checkpoint.importance < preferences.importance_threshold) {
      return false;
    }
    
    // Apply frequency filter
    switch (preferences.checkpoint_frequency) {
      case 'low':
        return checkpoint.importance >= 8; // Only show very important checkpoints
      case 'medium':
        return checkpoint.importance >= 5; // Show moderately important checkpoints
      case 'high':
        return true; // Show all checkpoints that meet the threshold
      default:
        return true;
    }
  }, [preferences]);

  const generateCheckpointsFromAction = useCallback((action: WorkflowAction): Checkpoint[] => {
    // Use checkpoints from action config if available
    if (action.checkpoint_config?.checkpoints?.length > 0) {
      return action.checkpoint_config.checkpoints.map((cp: any, index: number) => ({
        id: `${action.id}-checkpoint-${index}`,
        title: cp.title || `Checkpoint ${index + 1}`,
        description: cp.description || 'Please review this step before proceeding.',
        importance: cp.importance || 5,
        step: index + 1,
        actionData: cp.actionData
      }));
    }
    
    // Generate default checkpoints based on action type
    const checkpoints: Checkpoint[] = [];
    
    // Add action-specific checkpoints (simplified example)
    if (action.action_type === 'browser_automation') {
      checkpoints.push({
        id: `${action.id}-checkpoint-1`,
        title: 'Browser Access',
        description: 'This action will open a browser and access websites on your behalf.',
        importance: 7,
        step: 1,
        actionData: { type: 'browser_access' }
      });
    } else if (action.action_type === 'file_system') {
      checkpoints.push({
        id: `${action.id}-checkpoint-1`,
        title: 'File System Access',
        description: 'This action will create or modify files on your system.',
        importance: 8,
        step: 1,
        actionData: { type: 'file_system_access' }
      });
    }
    
    // Add a final confirmation checkpoint
    checkpoints.push({
      id: `${action.id}-checkpoint-final`,
      title: 'Confirm Execution',
      description: `Are you ready to execute "${action.name || 'this action'}"?`,
      importance: 6,
      step: checkpoints.length + 1,
      actionData: { type: 'final_confirmation' }
    });
    
    return checkpoints;
  }, []);

  const displayCheckpoint = useCallback((checkpoint: Checkpoint) => {
    if (shouldShowCheckpoint(checkpoint)) {
      setCurrentCheckpoint(checkpoint);
      setShowCheckpoint(true);
      setCheckpointHistory(prev => [...prev, checkpoint]);
      return true;
    }
    return false;
  }, [shouldShowCheckpoint]);

  const dismissCheckpoint = useCallback(() => {
    setShowCheckpoint(false);
    setCurrentCheckpoint(null);
  }, []);

  return {
    currentCheckpoint,
    showCheckpoint,
    checkpointHistory,
    shouldShowCheckpoint,
    generateCheckpointsFromAction,
    displayCheckpoint,
    dismissCheckpoint
  };
}
