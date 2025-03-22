
import { useCallback } from 'react';
import { Message } from './use-assistant-messages';

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
    
    // Default response
    return "I understand you're interested in that. Would you like me to help you execute a workflow, explain how something works, or suggest improvements to your current process?";
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

  return {
    generateResponse,
    createAssistantResponse,
    createUserMessage
  };
}
