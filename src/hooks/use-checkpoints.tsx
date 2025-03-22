import { useState, useCallback } from 'react';
import { CheckpointOptions } from '@/components/act/checkpoint/CheckpointDialog';

export interface CheckpointSettings {
  frequency: 'low' | 'medium' | 'high';
  importanceThreshold: 'low' | 'medium' | 'high';
  savePreferences: boolean;
}

export interface CheckpointPreference {
  actionId: string;
  checkpointId: string;
  decision: 'proceed' | 'modify' | 'cancel';
  alwaysUse: boolean;
}

interface UseCheckpointsProps {
  actionId?: string;
  initialSettings?: CheckpointSettings;
}

export function useCheckpoints({ 
  actionId,
  initialSettings = { 
    frequency: 'medium', 
    importanceThreshold: 'medium',
    savePreferences: true
  }
}: UseCheckpointsProps = {}) {
  const [isCheckpointOpen, setIsCheckpointOpen] = useState(false);
  const [currentCheckpoint, setCurrentCheckpoint] = useState<CheckpointOptions | null>(null);
  const [checkpointSettings, setCheckpointSettings] = useState<CheckpointSettings>(initialSettings);
  const [checkpointPreferences, setCheckpointPreferences] = useState<CheckpointPreference[]>([]);
  const [checkpointCallbacks, setCheckpointCallbacks] = useState<{
    onProceed?: () => void;
    onModify?: () => void;
    onCancel?: () => void;
  }>({});

  // Show a checkpoint
  const showCheckpoint = useCallback((
    options: CheckpointOptions,
    callbacks: {
      onProceed?: () => void;
      onModify?: () => void;
      onCancel?: () => void;
    } = {}
  ) => {
    // Check if we have a saved preference for this checkpoint
    if (actionId && checkpointSettings.savePreferences) {
      const savedPreference = checkpointPreferences.find(
        pref => pref.actionId === actionId && pref.checkpointId === options.title && pref.alwaysUse
      );

      if (savedPreference) {
        // Auto-execute the preferred action based on saved preference
        if (savedPreference.decision === 'proceed' && callbacks.onProceed) {
          callbacks.onProceed();
          return;
        } else if (savedPreference.decision === 'modify' && callbacks.onModify) {
          callbacks.onModify();
          return;
        } else if (savedPreference.decision === 'cancel' && callbacks.onCancel) {
          callbacks.onCancel();
          return;
        }
      }
    }

    // Otherwise show the checkpoint
    setCurrentCheckpoint(options);
    setCheckpointCallbacks(callbacks);
    setIsCheckpointOpen(true);
  }, [actionId, checkpointSettings.savePreferences, checkpointPreferences]);

  // Handle proceeding with action
  const handleProceed = useCallback(() => {
    if (currentCheckpoint && checkpointCallbacks.onProceed) {
      // Save preference if needed
      if (actionId && checkpointSettings.savePreferences) {
        const newPreference: CheckpointPreference = {
          actionId,
          checkpointId: currentCheckpoint.title,
          decision: 'proceed',
          alwaysUse: true // This would be toggled by a checkbox in the dialog
        };
        setCheckpointPreferences(prev => 
          [...prev.filter(p => 
            !(p.actionId === actionId && p.checkpointId === currentCheckpoint.title)
          ), newPreference]
        );
      }
      
      checkpointCallbacks.onProceed();
    }
    setIsCheckpointOpen(false);
  }, [actionId, currentCheckpoint, checkpointCallbacks, checkpointSettings]);

  // Handle modifying the action
  const handleModify = useCallback(() => {
    if (currentCheckpoint && checkpointCallbacks.onModify) {
      // Save preference if needed
      if (actionId && checkpointSettings.savePreferences) {
        const newPreference: CheckpointPreference = {
          actionId,
          checkpointId: currentCheckpoint.title,
          decision: 'modify',
          alwaysUse: true
        };
        setCheckpointPreferences(prev => 
          [...prev.filter(p => 
            !(p.actionId === actionId && p.checkpointId === currentCheckpoint.title)
          ), newPreference]
        );
      }
      
      checkpointCallbacks.onModify();
    }
    setIsCheckpointOpen(false);
  }, [actionId, currentCheckpoint, checkpointCallbacks, checkpointSettings]);

  // Handle canceling the action
  const handleCancel = useCallback(() => {
    if (currentCheckpoint && checkpointCallbacks.onCancel) {
      // Save preference if needed
      if (actionId && checkpointSettings.savePreferences) {
        const newPreference: CheckpointPreference = {
          actionId,
          checkpointId: currentCheckpoint.title,
          decision: 'cancel',
          alwaysUse: true
        };
        setCheckpointPreferences(prev => 
          [...prev.filter(p => 
            !(p.actionId === actionId && p.checkpointId === currentCheckpoint.title)
          ), newPreference]
        );
      }
      
      checkpointCallbacks.onCancel();
    }
    setIsCheckpointOpen(false);
  }, [actionId, currentCheckpoint, checkpointCallbacks, checkpointSettings]);

  // Update checkpoint settings
  const updateSettings = useCallback((newSettings: Partial<CheckpointSettings>) => {
    setCheckpointSettings(prev => ({ ...prev, ...newSettings }));
  }, []);

  // Close the checkpoint dialog
  const closeCheckpoint = useCallback(() => {
    setIsCheckpointOpen(false);
  }, []);

  return {
    isCheckpointOpen,
    currentCheckpoint,
    checkpointSettings,
    showCheckpoint,
    handleProceed,
    handleModify,
    handleCancel,
    closeCheckpoint,
    updateSettings
  };
}
