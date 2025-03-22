
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
  severity: 'info' | 'warning' | 'critical'; // Make severity required to match CheckpointOptions
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
    // Add a safe check for the checkpoint_config property
    // Use type assertion to access the property that might not be in the type definition
    const actionWithConfig = action as WorkflowAction & { checkpoint_config?: { checkpoints: any[] } };
    
    // Check if checkpoint_config exists and has valid checkpoints array
    if (actionWithConfig.checkpoint_config && 
        Array.isArray(actionWithConfig.checkpoint_config.checkpoints)) {
      
      return actionWithConfig.checkpoint_config.checkpoints.map((cp: any, index: number) => ({
        id: `${action.id}-checkpoint-${index}`,
        title: cp.title || `Checkpoint ${index + 1}`,
        description: cp.description || 'Please review this step before proceeding.',
        importance: cp.importance || 5,
        step: index + 1,
        actionData: cp.actionData,
        severity: cp.severity || 'info'
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
        actionData: { type: 'browser_access' },
        severity: 'info'
      });
    } else if (action.action_type === 'file_system') {
      checkpoints.push({
        id: `${action.id}-checkpoint-1`,
        title: 'File System Access',
        description: 'This action will create or modify files on your system.',
        importance: 8,
        step: 1,
        actionData: { type: 'file_system_access' },
        severity: 'warning'
      });
    }
    
    // Add a final confirmation checkpoint
    checkpoints.push({
      id: `${action.id}-checkpoint-final`,
      title: 'Confirm Execution',
      description: `Are you ready to execute "${action.name || 'this action'}"?`,
      importance: 6,
      step: checkpoints.length + 1,
      actionData: { type: 'final_confirmation' },
      severity: 'info'
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

  // Add handlers for checkpoint actions
  const handleProceed = useCallback(() => {
    // Implementation for proceeding after checkpoint
    dismissCheckpoint();
  }, [dismissCheckpoint]);

  const handleModify = useCallback(() => {
    // Implementation for modifying at checkpoint
    dismissCheckpoint();
  }, [dismissCheckpoint]);

  const handleCancel = useCallback(() => {
    // Implementation for canceling at checkpoint
    dismissCheckpoint();
  }, [dismissCheckpoint]);

  const closeCheckpoint = useCallback(() => {
    dismissCheckpoint();
  }, [dismissCheckpoint]);

  return {
    currentCheckpoint,
    showCheckpoint,
    checkpointHistory,
    shouldShowCheckpoint,
    generateCheckpointsFromAction,
    displayCheckpoint,
    dismissCheckpoint,
    // Add these missing properties that DigitalAssistant.tsx expects
    isCheckpointOpen: showCheckpoint,
    handleProceed,
    handleModify,
    handleCancel,
    closeCheckpoint
  };
}
