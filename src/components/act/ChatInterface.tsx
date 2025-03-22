
import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Bot, SendHorizonal, Play } from 'lucide-react';
import { Avatar } from '@/components/ui/avatar';
import { useToast } from '@/hooks/use-toast';

interface ChatInterfaceProps {
  actionId?: string;
  onExecuteAction?: () => void;
}

interface Message {
  id: string;
  content: string;
  sender: 'user' | 'assistant';
  timestamp: Date;
}

const ChatInterface: React.FC<ChatInterfaceProps> = ({ actionId, onExecuteAction }) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      content: 'Hello! I can help you execute and understand workflow actions. Select an action to get started.',
      sender: 'assistant',
      timestamp: new Date()
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const { toast } = useToast();
  
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
    
    // Simulate assistant response
    setTimeout(() => {
      const responseMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: actionId 
          ? `I can help you with the selected action. Would you like me to explain how it works or execute it now?`
          : `Please select an action from the list first, and I'll help you understand and execute it.`,
        sender: 'assistant',
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, responseMessage]);
    }, 1000);
  };
  
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };
  
  const handleExecuteAction = () => {
    if (!actionId) {
      toast({
        title: "No action selected",
        description: "Please select an action to execute",
        variant: "destructive"
      });
      return;
    }
    
    if (onExecuteAction) {
      onExecuteAction();
      
      // Add system message about execution
      const executionMessage: Message = {
        id: Date.now().toString(),
        content: "Executing the selected action now...",
        sender: 'assistant',
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, executionMessage]);
    }
  };

  return (
    <Card className="flex flex-col h-full border rounded-md overflow-hidden">
      <div className="flex items-center gap-2 border-b p-2 bg-muted/30">
        <Bot className="h-4 w-4 text-primary" />
        <h3 className="text-sm font-medium">AI Assistant</h3>
      </div>
      
      <ScrollArea className="flex-1 p-3">
        <div className="space-y-4">
          {messages.map(message => (
            <div
              key={message.id}
              className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`flex gap-2 max-w-[80%] ${message.sender === 'user' ? 'flex-row-reverse' : ''}`}>
                {message.sender === 'assistant' && (
                  <Avatar className="h-8 w-8 bg-primary">
                    <Bot className="h-4 w-4 text-primary-foreground" />
                  </Avatar>
                )}
                
                <div
                  className={`rounded-lg p-3 text-sm ${
                    message.sender === 'user'
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted'
                  }`}
                >
                  {message.content}
                  <div className={`text-xs mt-1 ${
                    message.sender === 'user' ? 'text-primary-foreground/70' : 'text-muted-foreground'
                  }`}>
                    {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </ScrollArea>
      
      <div className="border-t p-3">
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="icon"
            className="shrink-0"
            onClick={handleExecuteAction}
            disabled={!actionId}
          >
            <Play className="h-4 w-4" />
          </Button>
          
          <Input
            value={inputValue}
            onChange={e => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type a message..."
            className="flex-1"
          />
          
          <Button
            variant="default"
            size="icon"
            className="shrink-0"
            onClick={handleSendMessage}
            disabled={!inputValue.trim()}
          >
            <SendHorizonal className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </Card>
  );
};

export default ChatInterface;
