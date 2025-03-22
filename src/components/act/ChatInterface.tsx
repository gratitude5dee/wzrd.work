
import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Send, BrainCog, Robot, User, DownloadCloud } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Message {
  id: string;
  content: string;
  sender: 'user' | 'assistant';
  timestamp: Date;
}

interface ChatInterfaceProps {
  actionId?: string;
  onExecuteAction?: () => void;
}

const ChatInterface: React.FC<ChatInterfaceProps> = ({
  actionId,
  onExecuteAction
}) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      content: 'Hello! I\'m your digital assistant. I can help you execute and customize actions. Select an action to get started.',
      sender: 'assistant',
      timestamp: new Date()
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    if (scrollAreaRef.current) {
      const scrollArea = scrollAreaRef.current;
      scrollArea.scrollTop = scrollArea.scrollHeight;
    }
  }, [messages]);

  // Add a welcome message when an action is selected
  useEffect(() => {
    if (actionId) {
      setMessages(prev => [
        ...prev,
        {
          id: Date.now().toString(),
          content: `Action selected! I can help you execute this action or customize it to fit your needs. What would you like to do?`,
          sender: 'assistant',
          timestamp: new Date()
        }
      ]);
    }
  }, [actionId]);

  const handleSendMessage = () => {
    if (!inputValue.trim()) return;

    // Add user message
    const userMessage: Message = {
      id: Date.now().toString(),
      content: inputValue,
      sender: 'user',
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    
    // Simulate assistant typing
    setIsTyping(true);
    
    // Simulate assistant response after a delay
    setTimeout(() => {
      const assistantMessage: Message = {
        id: (Date.now() + 100).toString(),
        content: getAssistantResponse(inputValue, !!actionId),
        sender: 'assistant',
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, assistantMessage]);
      setIsTyping(false);
    }, 1500);
  };

  // Simple response logic - in a real app, this would be connected to a real AI
  const getAssistantResponse = (userInput: string, hasActionSelected: boolean): string => {
    const input = userInput.toLowerCase();
    
    if (input.includes('execute') || input.includes('run') || input.includes('start')) {
      if (hasActionSelected && onExecuteAction) {
        setTimeout(() => onExecuteAction(), 500);
        return "Starting the execution now! I'll guide you through each step.";
      } else {
        return "Please select an action first before executing.";
      }
    }
    
    if (input.includes('how') && input.includes('work')) {
      return "I can help you automate tasks by executing predefined actions. Select an action from the list, and I'll guide you through the process or customize it for you.";
    }
    
    if (input.includes('hello') || input.includes('hi') || input.includes('hey')) {
      return "Hello! How can I help you today? I can execute actions or help you customize them.";
    }
    
    if (input.includes('thank')) {
      return "You're welcome! Is there anything else I can help you with?";
    }
    
    if (input.includes('custom') || input.includes('modify') || input.includes('change')) {
      return "I can help you customize this action. What specific changes would you like to make?";
    }
    
    return "I'm here to help you execute and customize actions. Let me know what you'd like to do, or just say 'run' to execute the selected action.";
  };

  return (
    <div className="flex flex-col h-full border rounded-md overflow-hidden">
      <div className="flex items-center justify-between p-3 border-b bg-muted/30">
        <div className="flex items-center gap-2">
          <Robot className="h-5 w-5 text-primary" />
          <span className="font-medium text-sm">Action Assistant</span>
        </div>
        
        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
          <DownloadCloud className="h-4 w-4" />
        </Button>
      </div>
      
      <ScrollArea 
        className="flex-1 p-4" 
        ref={scrollAreaRef}
      >
        <div className="space-y-4">
          {messages.map(message => (
            <div
              key={message.id}
              className={cn(
                "flex gap-3 max-w-[80%]",
                message.sender === 'user' ? "ml-auto flex-row-reverse" : ""
              )}
            >
              <div 
                className={cn(
                  "flex items-center justify-center h-8 w-8 rounded-full flex-shrink-0",
                  message.sender === 'user' 
                    ? "bg-primary text-primary-foreground" 
                    : "bg-secondary text-secondary-foreground"
                )}
              >
                {message.sender === 'user' ? (
                  <User className="h-4 w-4" />
                ) : (
                  <BrainCog className="h-4 w-4" />
                )}
              </div>
              
              <div 
                className={cn(
                  "rounded-lg p-3 text-sm",
                  message.sender === 'user' 
                    ? "bg-primary text-primary-foreground" 
                    : "bg-muted"
                )}
              >
                {message.content}
                <div 
                  className={cn(
                    "text-xs mt-1 text-right",
                    message.sender === 'user' 
                      ? "text-primary-foreground/80" 
                      : "text-muted-foreground"
                  )}
                >
                  {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>
            </div>
          ))}
          
          {isTyping && (
            <div className="flex gap-3 max-w-[80%]">
              <div className="flex items-center justify-center h-8 w-8 rounded-full flex-shrink-0 bg-secondary text-secondary-foreground">
                <BrainCog className="h-4 w-4" />
              </div>
              
              <div className="rounded-lg p-3 text-sm bg-muted flex items-center">
                <div className="flex space-x-1">
                  <div className="w-2 h-2 rounded-full bg-primary animate-pulse"></div>
                  <div className="w-2 h-2 rounded-full bg-primary animate-pulse animation-delay-500"></div>
                  <div className="w-2 h-2 rounded-full bg-primary animate-pulse animation-delay-1000"></div>
                </div>
              </div>
            </div>
          )}
        </div>
      </ScrollArea>
      
      <div className="p-3 border-t">
        <form 
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage();
          }}
          className="flex gap-2"
        >
          <Input
            placeholder="Type your message..."
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            className="flex-1"
          />
          <Button 
            type="submit" 
            size="icon"
            disabled={!inputValue.trim() || isTyping}
          >
            <Send className="h-4 w-4" />
          </Button>
        </form>
      </div>
    </div>
  );
};

export default ChatInterface;
