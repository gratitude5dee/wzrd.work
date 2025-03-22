
import { useState, useCallback, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';

export interface Message {
  id: string;
  content: string;
  sender: 'user' | 'assistant';
  videoUrl?: string;
  timestamp: Date;
  actions?: string[];
  isLoading?: boolean;
  checkpointId?: string; // New: reference to checkpoint if message is a checkpoint
  actionData?: any; // New: contains data about the action being performed
}

export interface CheckpointDecision {
  checkpointId: string;
  action: 'proceed' | 'modify' | 'cancel';
  context: string;
  timestamp: Date;
}

export function useAssistantMessages() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [savedDecisions, setSavedDecisions] = useState<Record<string, CheckpointDecision>>({});
  const { user } = useAuth();

  // Load saved decisions from user preferences
  const loadSavedDecisions = useCallback(async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('user_preferences')
        .select('saved_decisions')
        .eq('user_id', user.id)
        .single();
      
      if (error) {
        console.error('Error loading user preferences:', error);
        return;
      }
      
      if (data && data.saved_decisions) {
        // Ensure we're parsing this correctly for the expected structure
        let decisions;
        if (typeof data.saved_decisions === 'string') {
          decisions = JSON.parse(data.saved_decisions);
        } else if (typeof data.saved_decisions === 'object') {
          decisions = data.saved_decisions;
        } else {
          console.error('Unexpected format for saved_decisions:', data.saved_decisions);
          return;
        }
          
        setSavedDecisions(decisions as Record<string, CheckpointDecision>);
      }
    } catch (error) {
      console.error('Error loading saved decisions:', error);
    }
  }, [user]);

  // Save a decision to user preferences
  const saveDecision = useCallback(async (decision: CheckpointDecision) => {
    if (!user) return;
    
    try {
      const newSavedDecisions = {
        ...savedDecisions,
        [decision.checkpointId]: decision
      };
      
      // Ensure we're correctly passing the saved_decisions as JSON
      const { error } = await supabase
        .from('user_preferences')
        .upsert({
          user_id: user.id,
          saved_decisions: JSON.stringify(newSavedDecisions)
        });
      
      if (error) {
        console.error('Error saving decision:', error);
        toast({
          title: "Failed to save decision",
          description: "Your preference couldn't be saved.",
          variant: "destructive"
        });
        return;
      }
      
      setSavedDecisions(newSavedDecisions);
      toast({
        title: "Decision saved",
        description: "Your preference has been saved for similar actions."
      });
    } catch (error) {
      console.error('Error saving decision:', error);
    }
  }, [user, savedDecisions, toast]);

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

  // Add a checkpoint message
  const addCheckpointMessage = useCallback((checkpointData: {
    id: string;
    title: string;
    description: string;
    actionData: any;
  }) => {
    const checkpointMessage: Message = {
      id: Date.now().toString(),
      content: `📋 **Checkpoint: ${checkpointData.title}**\n\n${checkpointData.description}\n\nPlease review and confirm this step.`,
      sender: 'assistant',
      timestamp: new Date(),
      checkpointId: checkpointData.id,
      actionData: checkpointData.actionData
    };
    
    addMessage(checkpointMessage);
    return checkpointMessage;
  }, [addMessage]);

  // Check if there's a saved decision for a checkpoint
  const getSavedDecision = useCallback((checkpointId: string): CheckpointDecision | null => {
    return savedDecisions[checkpointId] || null;
  }, [savedDecisions]);

  // Load user preferences on mount
  useEffect(() => {
    if (user) {
      loadSavedDecisions();
    }
  }, [user, loadSavedDecisions]);

  return {
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
    getSavedDecision,
    savedDecisions
  };
}
