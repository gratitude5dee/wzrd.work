
import React, { useRef, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar } from '@/components/ui/avatar';
import { Bot, SendHorizonal, Play, Pause, User } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';
import { useDigitalAssistant, Message } from '@/hooks/use-digital-assistant';

interface DigitalAssistantProps {
  actionId?: string;
  onExecuteAction?: () => void;
}

const DigitalAssistant: React.FC<DigitalAssistantProps> = ({ actionId, onExecuteAction }) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const {
    messages,
    inputValue,
    setInputValue,
    isTyping,
    videoGeneration,
    handleSendMessage,
    handleKeyDown
  } = useDigitalAssistant({ 
    onExecuteAction: onExecuteAction ? async () => onExecuteAction() : undefined 
  });

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  // Play the latest video when it becomes available
  useEffect(() => {
    const lastMessage = messages[messages.length - 1];
    if (lastMessage?.videoUrl && videoRef.current) {
      videoRef.current.src = lastMessage.videoUrl;
      videoRef.current.play().catch(err => console.error("Video play error:", err));
    }
  }, [messages]);

  return (
    <Card className="flex flex-col h-full border rounded-md overflow-hidden">
      <div className="flex items-center gap-2 border-b p-2 bg-muted/30">
        <Bot className="h-4 w-4 text-primary" />
        <h3 className="text-sm font-medium">WZRD Digital Assistant</h3>
        {actionId && (
          <Badge variant="outline" className="ml-auto text-xs">
            Action selected
          </Badge>
        )}
      </div>
      
      <div className="grid grid-rows-[auto_1fr] gap-3 p-3 h-full">
        {/* Digital twin video container */}
        <div className="relative rounded-md overflow-hidden bg-black aspect-video">
          <video 
            ref={videoRef}
            className="w-full h-full object-cover"
            autoPlay
            muted={false}
            playsInline
          />
          
          {videoGeneration.isGenerating && (
            <div className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center">
              <div className="text-white text-sm mb-2">Generating response...</div>
              <Progress value={videoGeneration.progress} className="w-3/4 h-2" />
            </div>
          )}
          
          {!videoRef.current?.src && !videoGeneration.isGenerating && (
            <div className="absolute inset-0 flex items-center justify-center">
              <Avatar className="w-16 h-16 bg-primary/20">
                <Bot className="h-8 w-8 text-primary" />
              </Avatar>
            </div>
          )}
        </div>
        
        {/* Chat messages */}
        <ScrollArea className="flex-1 pr-2">
          <div className="space-y-4">
            {messages.map((message) => (
              <MessageBubble key={message.id} message={message} />
            ))}
            
            {isTyping && (
              <div className="flex justify-start">
                <div className="bg-muted rounded-lg p-3 text-sm max-w-[80%]">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: '0ms' }}></div>
                    <div className="w-2 h-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: '200ms' }}></div>
                    <div className="w-2 h-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: '400ms' }}></div>
                  </div>
                </div>
              </div>
            )}
            
            <div ref={scrollRef}></div>
          </div>
        </ScrollArea>
      </div>
      
      <div className="border-t p-3">
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="icon"
            className="shrink-0"
            onClick={onExecuteAction}
            disabled={!actionId}
          >
            <Play className="h-4 w-4" />
          </Button>
          
          <Input
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask me anything..."
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

// Message Bubble Component
const MessageBubble: React.FC<{ message: Message }> = ({ message }) => {
  const isUser = message.sender === 'user';
  
  return (
    <div className={cn("flex", isUser ? "justify-end" : "justify-start")}>
      <div className={cn("flex gap-2 max-w-[80%]", isUser ? "flex-row-reverse" : "")}>
        {!isUser && (
          <Avatar className="h-8 w-8 bg-primary">
            <Bot className="h-4 w-4 text-primary-foreground" />
          </Avatar>
        )}
        
        {isUser && (
          <Avatar className="h-8 w-8 bg-muted">
            <User className="h-4 w-4 text-muted-foreground" />
          </Avatar>
        )}
        
        <div
          className={cn(
            "rounded-lg p-3 text-sm",
            isUser ? "bg-primary text-primary-foreground" : "bg-muted"
          )}
        >
          {message.content}
          
          {message.isLoading && (
            <div className="mt-2">
              <Badge variant="outline" className="animate-pulse">
                Generating video...
              </Badge>
            </div>
          )}
          
          <div className={cn(
            "text-xs mt-1",
            isUser ? "text-primary-foreground/70" : "text-muted-foreground"
          )}>
            {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DigitalAssistant;
