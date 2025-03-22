
import { useState, useCallback } from 'react';

export interface Message {
  id: string;
  content: string;
  sender: 'user' | 'assistant';
  videoUrl?: string;
  timestamp: Date;
  actions?: string[];
  isLoading?: boolean;
}

export function useAssistantMessages() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  // Add a message to the chat
  const addMessage = useCallback((message: Message) => {
    setMessages(prev => [...prev, message]);
  }, []);

  // Update a specific message
  const updateMessage = useCallback((id: string, updates: Partial<Message>) => {
    setMessages(prev => 
      prev.map(msg => 
        msg.id === id ? { ...msg, ...updates } : msg
      )
    );
  }, []);

  // Add a welcome message
  const addWelcomeMessage = useCallback(() => {
    const welcomeMessage: Message = {
      id: Date.now().toString(),
      content: `Hello! I'm your WZRD digital assistant. I can help you understand and execute workflow actions. What would you like to do today?`,
      sender: 'assistant',
      timestamp: new Date(),
      isLoading: true
    };
    
    addMessage(welcomeMessage);
    return welcomeMessage;
  }, [addMessage]);

  return {
    messages,
    setMessages,
    inputValue,
    setInputValue,
    isTyping,
    setIsTyping,
    addMessage,
    updateMessage,
    addWelcomeMessage
  };
}
