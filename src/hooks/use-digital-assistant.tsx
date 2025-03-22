
import { useCallback, useState, useEffect } from 'react';
import { useAssistantMessages, Message } from './use-assistant-messages';
import { useVideoGeneration } from './use-video-generation';
import { useResponseGeneration } from './use-response-generation';
import { useUserPreferences } from './use-user-preferences';
import { useCheckpoints, Checkpoint } from './use-checkpoints';
import { useActionExecution } from './use-action-execution';
import { useActionAnalytics, ActionSummary } from './use-action-analytics';
import { useAvailableActions, WorkflowAction } from '@/services/recordingService';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';

interface UseDigitalAssistantProps {
  onExecuteAction?: () => Promise<void>;
}

export interface CheckpointOptions {
  title: string;
  description: string;
  severity: 'info' | 'warning' | 'critical';
  actionName?: string;
  screenshotUrl?: string;
}

export interface CheckpointHandlers {
  onProceed: () => void;
  onModify: () => void;
  onCancel: () => void;
}

export function useDigitalAssistant({ onExecuteAction }: UseDigitalAssistantProps = {}) {
  const {
    messages, 
    setMessages,
    inputValue, 
    setInputValue,
    isTyping, 
    setIsTyping,
    addMessage,
    updateMessage,
    addWelcomeMessage,
    addCheckpointMessage,
    saveDecision,
    getSavedDecision
  } = useAssistantMessages();

  const {
    replica,
    videoGeneration,
    loadReplicas,
    generateVideoForMessage
  } = useVideoGeneration();

  const {
    generateResponse,
    generateActionResponse,
    createAssistantResponse,
    createUserMessage,
    createCheckpointResponse,
    createSuccessMessage
  } = useResponseGeneration();

  const { preferences } = useUserPreferences();
  
  const {
    currentCheckpoint,
    isCheckpointOpen,
    showCheckpoint: displayCheckpointValue,
    generateCheckpointsFromAction,
    displayCheckpoint: showCheckpointInternal,
    dismissCheckpoint,
    handleProceed,
    handleModify,
    handleCancel,
    closeCheckpoint
  } = useCheckpoints();

  const {
    currentExecution,
    isExecuting,
    startExecution,
    updateExecution,
    completeExecution,
    recordCheckpointInteraction
  } = useActionExecution();

  const {
    actionData,
    userData,
    usagePatterns,
    isLoading: analyticsLoading,
    error: analyticsError,
    fetchActionAnalytics,
    fetchUserAnalytics,
    fetchUsagePatterns,
    getRelatedActions,
    // Add these missing properties from useActionAnalytics
    getActionMetrics,
    isSuccessDialogOpen,
    currentSummary,
    showSuccessDialog,
    closeSuccessDialog
  } = useActionAnalytics();

  const { user } = useAuth();
  const { data: availableActions } = useAvailableActions();
  
  const [selectedAction, setSelectedAction] = useState<WorkflowAction | null>(null);

  // Load replicas on mount
  useEffect(() => {
    loadReplicas();
  }, [loadReplicas]);

  // Function to show a checkpoint with options
  const showCheckpoint = useCallback((
    options: CheckpointOptions,
    handlers?: CheckpointHandlers
  ) => {
    const checkpoint: Checkpoint = {
      id: `checkpoint-${Date.now()}`,
      title: options.title,
      description: options.description,
      importance: 8, // High importance
      step: 1,
      actionData: { actionName: options.actionName },
      severity: options.severity
    };

    // Show the checkpoint
    showCheckpointInternal(checkpoint);
    
    // If handlers are provided, override the default ones
    if (handlers) {
      // This is a placeholder for actual implementation
      // In a real scenario, we would need to store these handlers and use them
      // when the checkpoint is acted upon
      const originalHandleProceed = handleProceed;
      const originalHandleModify = handleModify;
      const originalHandleCancel = handleCancel;
      
      // TODO: In a real implementation, we would override these handlers
      // but the current implementation doesn't support dynamic handler replacement
    }
    
    return true;
  }, [handleProceed, handleModify, handleCancel, showCheckpointInternal]);

  // Find action based on user input
  const findRelevantAction = useCallback((input: string) => {
    if (!availableActions || availableActions.length === 0) return null;
    
    const inputLower = input.toLowerCase();
    
    // Look for exact matches in action names
    const exactMatch = availableActions.find(action => 
      action.name?.toLowerCase() === inputLower
    );
    
    if (exactMatch) return exactMatch;
    
    // Look for partial matches in names and descriptions
    const partialMatches = availableActions.filter(action => 
      (action.name?.toLowerCase().includes(inputLower) || 
       action.description?.toLowerCase().includes(inputLower))
    );
    
    return partialMatches.length > 0 ? partialMatches[0] : null;
  }, [availableActions]);

  // Function to send a message as the user
  const sendMessage = useCallback(async (content: string) => {
    if (!content.trim()) return;
    
    // Add user message
    const userMessage = createUserMessage(content);
    addMessage(userMessage);
    setInputValue('');
    
    // Show typing indicator
    setIsTyping(true);
    
    // Check if message is related to an action
    const relevantAction = findRelevantAction(content);
    
    let responseContent = '';
    if (relevantAction) {
      responseContent = generateActionResponse(relevantAction);
      setSelectedAction(relevantAction);
    } else {
      responseContent = generateResponse(content);
    }
    
    // Create assistant response
    const assistantMessage = createAssistantResponse(responseContent);
    
    // Simulate delay for natural conversation flow
    setTimeout(() => {
      addMessage(assistantMessage);
      setIsTyping(false);
      
      // Generate video for this message
      generateVideoForMessage(assistantMessage, updateMessage);
      
      // If this is an action execution request, start the action
      if (
        content.toLowerCase().includes('execute') || 
        content.toLowerCase().includes('run') || 
        content.toLowerCase().includes('start')
      ) {
        if (relevantAction) {
          setTimeout(() => {
            executeActionWithCheckpoints(relevantAction);
          }, 2000);
        }
      }
    }, 1500);
  }, [
    addMessage, 
    setInputValue, 
    setIsTyping, 
    findRelevantAction,
    generateActionResponse, 
    generateResponse, 
    createAssistantResponse, 
    createUserMessage, 
    generateVideoForMessage, 
    updateMessage
  ]);

  // Execute an action with checkpoints - only define but don't call yet
  const executeActionWithCheckpoints = useCallback(async (action: WorkflowAction) => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "You need to be logged in to execute actions",
        variant: "destructive"
      });
      return;
    }
    
    try {
      // Start execution tracking
      const execution = await startExecution(action);
      if (!execution) return;
      
      // Set the action as selected
      setSelectedAction(action);
      
      // Generate checkpoints for this action
      const actionCheckpoints = generateCheckpointsFromAction(action);
      
      // Add a message indicating action execution is starting
      const startMessage = createAssistantResponse(
        `I'm starting execution of "${action.name || 'the action'}" now. I'll guide you through each step and ask for confirmation at important points.`
      );
      addMessage(startMessage);
      generateVideoForMessage(startMessage, updateMessage);
      
      // Process checkpoints sequentially
      let cancelled = false;
      for (let i = 0; i < actionCheckpoints.length; i++) {
        const checkpoint = actionCheckpoints[i];
        
        // Check saved decisions
        const savedDecision = getSavedDecision(checkpoint.id);
        if (savedDecision && savedDecision.action === 'proceed') {
          // Skip checkpoint, user previously chose to auto-proceed
          continue;
        }
        
        // Show checkpoint
        const checkpointMessage = addCheckpointMessage({
          id: checkpoint.id,
          title: checkpoint.title,
          description: checkpoint.description,
          actionData: checkpoint.actionData
        });
        
        generateVideoForMessage(checkpointMessage, updateMessage);
        
        // Record that a checkpoint was shown
        if (execution.id) {
          await recordCheckpointInteraction(execution.id, 'shown');
        }
        
        // Wait for user response (simulated here)
        // In a real implementation, this would await user input
        // For demo purposes, we automatically proceed after a delay
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
      
      if (cancelled) {
        // Handle cancellation
        if (execution.id) {
          await completeExecution(execution.id, 'cancelled');
        }
        
        const cancelMessage = createAssistantResponse(
          "Action execution has been cancelled. Let me know if you'd like to try again or if you need any assistance."
        );
        addMessage(cancelMessage);
        generateVideoForMessage(cancelMessage, updateMessage);
        return;
      }
      
      // Execute the action via the edge function
      const response = await supabase.functions.invoke('execute-action', {
        body: {
          actionId: action.id,
          executionId: execution.id,
          userId: user.id
        }
      });
      
      if (response.error) {
        throw new Error(response.error.message || 'Failed to execute action');
      }
      
      // Complete the execution
      let status = 'completed';
      let durationSeconds = 0;
      
      if (execution.id) {
        const result = await completeExecution(execution.id, 'completed');
        status = result.status;
        durationSeconds = result.durationSeconds;
      }
      
      // Create success message and show success dialog
      const metrics = {
        timeSaved: durationSeconds * 2, // Simplified estimate
        executionTime: durationSeconds,
        successRate: 100, // Simplified for this example
        automationLevel: 80 // Simplified for this example
      };
      
      const successMessage = createSuccessMessage(
        action.name || 'Action',
        metrics
      );
      addMessage(successMessage);
      generateVideoForMessage(successMessage, updateMessage);
      
      // Prepare and show success dialog
      const summary: ActionSummary = {
        id: action.id,
        name: action.name || 'Action',
        description: action.description || 'Action completed successfully',
        completedSteps: actionCheckpoints.length,
        totalSteps: actionCheckpoints.length,
        metrics: metrics,
        relatedActions: availableActions
          ?.filter(a => a.id !== action.id)
          .slice(0, 3)
          .map(a => ({ id: a.id, name: a.name || `Action ${a.id.slice(0, 8)}` }))
      };
      
      showSuccessDialog(summary);
    } catch (error) {
      console.error("Error executing action:", error);
      toast({
        title: "Execution failed",
        description: error instanceof Error ? error.message : "Unknown error occurred",
        variant: "destructive"
      });
      
      if (currentExecution?.id) {
        completeExecution(
          currentExecution.id,
          'failed',
          error instanceof Error ? error.message : "Unknown error"
        );
      }
      
      const errorMessage = createAssistantResponse(
        `I apologize, but there was an error executing the action: ${error instanceof Error ? error.message : "Unknown error occurred"}. Is there anything else I can help you with?`
      );
      addMessage(errorMessage);
      generateVideoForMessage(errorMessage, updateMessage);
    }
  }, [
    user,
    addMessage,
    startExecution,
    generateCheckpointsFromAction,
    getSavedDecision,
    addCheckpointMessage,
    generateVideoForMessage,
    updateMessage,
    recordCheckpointInteraction,
    completeExecution,
    createAssistantResponse,
    currentExecution,
    createSuccessMessage,
    availableActions,
    showSuccessDialog,
    toast
  ]);

  // Function to handle message submission
  const handleSendMessage = useCallback(() => {
    if (inputValue.trim()) {
      sendMessage(inputValue);
    }
  }, [inputValue, sendMessage]);

  // Function to handle key press
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  }, [handleSendMessage]);

  return {
    messages,
    inputValue,
    setInputValue,
    isTyping,
    videoGeneration,
    handleSendMessage,
    handleKeyDown,
    sendMessage,
    // Checkpoint-related
    currentCheckpoint,
    showCheckpoint,
    isCheckpointOpen,
    handleProceed,
    handleModify,
    handleCancel,
    closeCheckpoint,
    // Success dialog-related
    isSuccessDialogOpen,
    currentSummary,
    showSuccessDialog,
    closeSuccessDialog,
    getActionMetrics,
    // Action-related
    isExecuting,
    selectedAction,
    executeActionWithCheckpoints
  };
}

// Re-export the Message type to maintain backward compatibility
export type { Message } from './use-assistant-messages';
