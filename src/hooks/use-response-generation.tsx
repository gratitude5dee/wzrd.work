
import { useCallback } from 'react';
import { Message } from './use-assistant-messages';
import { WorkflowAction } from '@/services/recordingService';

export function useResponseGeneration() {
  // Generate a response based on user input
  const generateResponse = useCallback((userInput: string): string => {
    // Basic response logic - would be replaced with more sophisticated AI
    const userInputLower = userInput.toLowerCase();
    
    if (userInputLower.includes('help') || userInputLower.includes('what can you do')) {
      return "I can help you understand and execute workflow actions. I can also answer questions about the current process, suggest improvements, and guide you through using WZRD. What would you like to know about?";
    }
    
    if (userInputLower.includes('execute') || userInputLower.includes('run') || userInputLower.includes('start')) {
      return "I'll help you execute that action. First, I'll explain what's happening at each step so you understand the process. Would you like me to proceed with execution or explain more details first?";
    }
    
    if (userInputLower.includes('explain') || userInputLower.includes('how')) {
      return "Let me explain how this works. The workflow automation captures your actions and turns them into repeatable sequences. Each step is recorded and can be modified, optimized, or automated. Is there a specific part you'd like me to explain in more detail?";
    }
    
    if (userInputLower.includes('checkpoint') || userInputLower.includes('confirm')) {
      return "Checkpoints are places where the system pauses to let you review and confirm what's happening. You can set your checkpoint preferences to control how frequently they appear. Would you like to change your checkpoint settings?";
    }
    
    if (userInputLower.includes('analytics') || userInputLower.includes('metrics')) {
      return "I track various metrics about your actions, including how much time you're saving and the success rate of different actions. This helps optimize your workflows over time. Would you like to see your current analytics?";
    }
    
    // Default response
    return "I understand you're interested in that. Would you like me to help you execute a workflow, explain how something works, or suggest improvements to your current process?";
  }, []);

  // Generate a response about an action
  const generateActionResponse = useCallback((action: WorkflowAction): string => {
    let response = `I found the "${action.name || 'action'}" workflow that you can execute.`;
    
    if (action.description) {
      response += `\n\n${action.description}`;
    }
    
    if (action.instructions) {
      response += `\n\nHere's how it works:\n${action.instructions}`;
    }
    
    response += "\n\nWould you like me to help you execute this action?";
    
    return response;
  }, []);

  // Create an assistant message with generated response
  const createAssistantResponse = useCallback((content: string): Message => {
    return {
      id: (Date.now() + 1).toString(),
      content,
      sender: 'assistant',
      timestamp: new Date(),
      isLoading: true // Mark as loading until video is ready
    };
  }, []);

  // Create a user message
  const createUserMessage = useCallback((content: string): Message => {
    return {
      id: Date.now().toString(),
      content,
      sender: 'user',
      timestamp: new Date()
    };
  }, []);

  // Create a checkpoint response
  const createCheckpointResponse = useCallback((
    title: string, 
    description: string,
    checkpointId: string
  ): Message => {
    return {
      id: Date.now().toString(),
      content: `📋 **Checkpoint: ${title}**\n\n${description}\n\nPlease review and confirm this step.`,
      sender: 'assistant',
      timestamp: new Date(),
      checkpointId
    };
  }, []);

  // Create a success message
  const createSuccessMessage = useCallback((
    actionName: string,
    metrics: {
      timeSaved: number;
      executionTime: number;
      successRate: number;
    }
  ): Message => {
    return {
      id: Date.now().toString(),
      content: `✅ **Success!** The action "${actionName}" has been completed successfully.\n\n⏱️ Execution time: ${metrics.executionTime.toFixed(1)} seconds\n💸 Time saved: ${metrics.timeSaved.toFixed(1)} seconds\n🎯 Success rate: ${metrics.successRate}%`,
      sender: 'assistant',
      timestamp: new Date()
    };
  }, []);

  return {
    generateResponse,
    generateActionResponse,
    createAssistantResponse,
    createUserMessage,
    createCheckpointResponse,
    createSuccessMessage
  };
}
