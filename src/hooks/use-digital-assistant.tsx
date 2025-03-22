
import { useEffect, useCallback } from 'react';
import { useAssistantMessages, Message } from './use-assistant-messages';
import { useVideoGeneration } from './use-video-generation';
import { useResponseGeneration } from './use-response-generation';

interface UseDigitalAssistantProps {
  onExecuteAction?: (action: string) => Promise<void>;
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
    addWelcomeMessage
  } = useAssistantMessages();

  const {
    replica,
    videoGeneration,
    loadReplicas,
    generateVideoForMessage
  } = useVideoGeneration();

  const {
    generateResponse,
    createAssistantResponse,
    createUserMessage
  } = useResponseGeneration();

  // Load the available replicas on mount
  useEffect(() => {
    loadReplicas();
  }, [loadReplicas]);

  // Function to add a welcome message
  useEffect(() => {
    if (replica && messages.length === 0) {
      const welcomeMessage = addWelcomeMessage();
      generateVideoForMessage(welcomeMessage, updateMessage);
    }
  }, [replica, messages.length, addWelcomeMessage, generateVideoForMessage, updateMessage]);

  // Function to send a message as the user
  const sendMessage = useCallback(async (content: string) => {
    if (!content.trim()) return;
    
    // Add user message
    const userMessage = createUserMessage(content);
    addMessage(userMessage);
    setInputValue('');
    
    // Show typing indicator
    setIsTyping(true);
    
    // Simulate assistant response (would be replaced with actual AI logic)
    setTimeout(() => {
      const assistantMessage = createAssistantResponse(generateResponse(content));
      addMessage(assistantMessage);
      setIsTyping(false);
      
      // Generate video for this message
      generateVideoForMessage(assistantMessage, updateMessage);
    }, 1500);
  }, [
    addMessage, 
    setInputValue, 
    setIsTyping, 
    createUserMessage, 
    createAssistantResponse, 
    generateResponse, 
    generateVideoForMessage, 
    updateMessage
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
    sendMessage
  };
}

// Re-export the Message type to maintain backward compatibility
export type { Message } from './use-assistant-messages';
