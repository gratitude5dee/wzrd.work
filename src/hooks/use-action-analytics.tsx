
import { useState, useCallback, useEffect } from 'react';
import { ActionSummary, ActionMetrics } from '@/components/act/success/SuccessDialog';

interface ActionAnalytics {
  totalRuns: number;
  successfulRuns: number;
  failedRuns: number;
  averageExecutionTime: number; // seconds
  totalTimeSaved: number; // seconds
  checkpointDecisions: {
    proceed: number;
    modify: number;
    cancel: number;
  };
  history: Array<{
    date: Date;
    executionTime: number;
    success: boolean;
  }>;
}

interface UseActionAnalyticsProps {
  actionId?: string;
}

export function useActionAnalytics({ actionId }: UseActionAnalyticsProps = {}) {
  const [analytics, setAnalytics] = useState<Record<string, ActionAnalytics>>({});
  const [currentSummary, setCurrentSummary] = useState<ActionSummary | null>(null);
  const [isSuccessDialogOpen, setIsSuccessDialogOpen] = useState(false);

  // Load analytics from localStorage on mount
  useEffect(() => {
    const storedAnalytics = localStorage.getItem('wzrd-action-analytics');
    if (storedAnalytics) {
      try {
        const parsed = JSON.parse(storedAnalytics);
        // Convert date strings back to Date objects
        Object.values(parsed).forEach((action: any) => {
          if (action.history) {
            action.history.forEach((entry: any) => {
              entry.date = new Date(entry.date);
            });
          }
        });
        setAnalytics(parsed);
      } catch (error) {
        console.error('Failed to parse stored analytics:', error);
      }
    }
  }, []);

  // Save analytics to localStorage whenever they change
  useEffect(() => {
    if (Object.keys(analytics).length > 0) {
      localStorage.setItem('wzrd-action-analytics', JSON.stringify(analytics));
    }
  }, [analytics]);

  // Record a new action execution
  const recordExecution = useCallback((
    id: string, 
    success: boolean, 
    executionTime: number,
    checkpointDecision?: 'proceed' | 'modify' | 'cancel'
  ) => {
    setAnalytics(prev => {
      const actionAnalytics = prev[id] || {
        totalRuns: 0,
        successfulRuns: 0,
        failedRuns: 0,
        averageExecutionTime: 0,
        totalTimeSaved: 0,
        checkpointDecisions: {
          proceed: 0,
          modify: 0,
          cancel: 0
        },
        history: []
      };

      // Update run counters
      const newTotalRuns = actionAnalytics.totalRuns + 1;
      const newSuccessfulRuns = success 
        ? actionAnalytics.successfulRuns + 1 
        : actionAnalytics.successfulRuns;
      const newFailedRuns = !success 
        ? actionAnalytics.failedRuns + 1 
        : actionAnalytics.failedRuns;

      // Calculate new average execution time
      const totalExecutionTime = actionAnalytics.averageExecutionTime * actionAnalytics.totalRuns;
      const newAverageExecutionTime = (totalExecutionTime + executionTime) / newTotalRuns;

      // Update checkpoint decisions if applicable
      const checkpointDecisions = { ...actionAnalytics.checkpointDecisions };
      if (checkpointDecision) {
        checkpointDecisions[checkpointDecision]++;
      }

      // Calculate time saved (assuming manual execution would take 3x the time)
      // This is a simplified metric and could be made more sophisticated
      const timeSaved = success ? executionTime * 2 : 0; // 3x total - actual time
      const newTotalTimeSaved = actionAnalytics.totalTimeSaved + timeSaved;

      // Add to history
      const history = [
        ...actionAnalytics.history,
        { date: new Date(), executionTime, success }
      ].slice(-30); // Keep only the last 30 entries

      return {
        ...prev,
        [id]: {
          totalRuns: newTotalRuns,
          successfulRuns: newSuccessfulRuns,
          failedRuns: newFailedRuns,
          averageExecutionTime: newAverageExecutionTime,
          totalTimeSaved: newTotalTimeSaved,
          checkpointDecisions,
          history
        }
      };
    });
  }, []);

  // Show the success dialog
  const showSuccessDialog = useCallback((summary: ActionSummary) => {
    setCurrentSummary(summary);
    setIsSuccessDialogOpen(true);

    // Record this successful execution
    if (summary.id) {
      recordExecution(
        summary.id,
        true,
        summary.metrics?.executionTime || 10
      );
    }
  }, [recordExecution]);

  // Get analytics for a specific action
  const getActionAnalytics = useCallback((id: string): ActionAnalytics | null => {
    return analytics[id] || null;
  }, [analytics]);

  // Get metrics for a specific action
  const getActionMetrics = useCallback((id: string): ActionMetrics | null => {
    const actionData = analytics[id];
    if (!actionData) return null;

    return {
      timeSaved: actionData.totalTimeSaved,
      executionTime: actionData.averageExecutionTime,
      successRate: actionData.totalRuns === 0 
        ? 0 
        : Math.round((actionData.successfulRuns / actionData.totalRuns) * 100),
      automationLevel: 85 // This would be calculated based on how much of the action was automated
    };
  }, [analytics]);

  return {
    isSuccessDialogOpen,
    currentSummary,
    showSuccessDialog,
    closeSuccessDialog: () => setIsSuccessDialogOpen(false),
    recordExecution,
    getActionAnalytics,
    getActionMetrics
  };
}
