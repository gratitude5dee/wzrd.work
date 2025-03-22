
import { useState, useEffect, useCallback } from 'react';
import tavusService, { TavusReplicaResponse, TavusGenerationStatus } from '@/services/tavusService';
import { useToast } from '@/hooks/use-toast';

export interface Message {
  id: string;
  content: string;
  sender: 'user' | 'assistant';
  videoUrl?: string;
  timestamp: Date;
  actions?: string[];
  isLoading?: boolean;
}

interface UseDigitalAssistantProps {
  onExecuteAction?: (action: string) => Promise<void>;
}

export function useDigitalAssistant({ onExecuteAction }: UseDigitalAssistantProps = {}) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [replica, setReplica] = useState<TavusReplicaResponse | null>(null);
  const [videoGeneration, setVideoGeneration] = useState<TavusGenerationStatus>({
    isGenerating: false,
    progress: 0,
    videoUrl: null,
    error: null
  });
  const { toast } = useToast();

  // Load the available replicas on mount
  useEffect(() => {
    const loadReplicas = async () => {
      try {
        const replicas = await tavusService.getReplicas();
        if (replicas.length > 0) {
          setReplica(replicas[0]); // Use the first available replica
        }
      } catch (error) {
        console.error('Failed to load replicas:', error);
        toast({
          title: 'Error',
          description: 'Failed to load digital assistant replicas',
          variant: 'destructive'
        });
      }
    };

    loadReplicas();
  }, [toast]);

  // Function to add a welcome message
  useEffect(() => {
    if (replica && messages.length === 0) {
      const welcomeMessage: Message = {
        id: Date.now().toString(),
        content: `Hello! I'm your WZRD digital assistant. I can help you understand and execute workflow actions. What would you like to do today?`,
        sender: 'assistant',
        timestamp: new Date(),
        isLoading: true
      };
      
      setMessages([welcomeMessage]);
      
      // Generate video for welcome message
      generateVideoForMessage(welcomeMessage);
    }
  }, [replica]);

  // Function to send a message as the user
  const sendMessage = useCallback(async (content: string) => {
    if (!content.trim()) return;
    
    // Add user message
    const userMessage: Message = {
      id: Date.now().toString(),
      content,
      sender: 'user',
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    
    // Show typing indicator
    setIsTyping(true);
    
    // Simulate assistant response (would be replaced with actual AI logic)
    setTimeout(() => {
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: generateResponse(content),
        sender: 'assistant',
        timestamp: new Date(),
        isLoading: true // Mark as loading until video is ready
      };
      
      setMessages(prev => [...prev, assistantMessage]);
      setIsTyping(false);
      
      // Generate video for this message
      generateVideoForMessage(assistantMessage);
    }, 1500);
  }, []);

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

  // Function to generate a video for a message
  const generateVideoForMessage = useCallback(async (message: Message) => {
    if (!replica || message.sender !== 'assistant') return;
    
    try {
      setVideoGeneration({
        isGenerating: true,
        progress: 0,
        videoUrl: null,
        error: null
      });
      
      // Start video generation
      const videoId = await tavusService.generateVideo(replica.id, message.content);
      
      // Poll for status
      const pollingInterval = setInterval(async () => {
        try {
          const status = await tavusService.checkVideoStatus(videoId);
          
          if (status.status === 'completed') {
            clearInterval(pollingInterval);
            
            // Update the message with the video URL
            setMessages(prev => 
              prev.map(msg => 
                msg.id === message.id 
                  ? { ...msg, videoUrl: status.video_url, isLoading: false } 
                  : msg
              )
            );
            
            setVideoGeneration({
              isGenerating: false,
              progress: 100,
              videoUrl: status.video_url,
              error: null
            });
          } else if (status.status === 'failed') {
            clearInterval(pollingInterval);
            throw new Error('Video generation failed');
          } else {
            // Update progress (estimated)
            setVideoGeneration(prev => ({
              ...prev,
              progress: Math.min(prev.progress + 10, 90)
            }));
          }
        } catch (error) {
          clearInterval(pollingInterval);
          console.error('Error checking video status:', error);
          
          setVideoGeneration({
            isGenerating: false,
            progress: 0,
            videoUrl: null,
            error: 'Failed to generate video'
          });
          
          // Mark message as no longer loading
          setMessages(prev => 
            prev.map(msg => 
              msg.id === message.id ? { ...msg, isLoading: false } : msg
            )
          );
        }
      }, 2000);
      
    } catch (error) {
      console.error('Error generating video:', error);
      
      setVideoGeneration({
        isGenerating: false,
        progress: 0,
        videoUrl: null,
        error: 'Failed to generate video'
      });
      
      // Mark message as no longer loading
      setMessages(prev => 
        prev.map(msg => 
          msg.id === message.id ? { ...msg, isLoading: false } : msg
        )
      );
    }
  }, [replica]);

  // Helper to generate responses
  const generateResponse = (userInput: string): string => {
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
  };

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
