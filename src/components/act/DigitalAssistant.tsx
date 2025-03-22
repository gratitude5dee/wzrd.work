
import React, { useRef, useEffect, useState } from 'react';
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
import CheckpointDialog from './checkpoint/CheckpointDialog';
import SuccessDialog from './success/SuccessDialog';
import { useCheckpoints } from '@/hooks/use-checkpoints';
import { useActionAnalytics } from '@/hooks/use-action-analytics';
import { toast } from '@/hooks/use-toast';

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
    handleKeyDown,
    sendMessage
  } = useDigitalAssistant({ 
    onExecuteAction: onExecuteAction ? async () => {
      // When executing an action, first show a checkpoint
      showActionCheckpoint();
    } : undefined 
  });

  // Checkpoint system integration
  const {
    isCheckpointOpen,
    currentCheckpoint,
    showCheckpoint,
    handleProceed,
    handleModify,
    handleCancel,
    closeCheckpoint
  } = useCheckpoints({ actionId });

  // Success page and analytics integration
  const {
    isSuccessDialogOpen,
    currentSummary,
    showSuccessDialog,
    closeSuccessDialog,
    getActionMetrics
  } = useActionAnalytics({ actionId });

  // Function to show a checkpoint for action execution
  const showActionCheckpoint = () => {
    showCheckpoint(
      {
        title: "Confirm Action Execution",
        description: "You're about to execute an automated workflow that will interact with your system. Please confirm you want to proceed.",
        severity: "info",
        actionName: "Document Processing Workflow"
      },
      {
        onProceed: async () => {
          toast({
            title: "Action execution started",
            description: "The digital assistant will guide you through each step"
          });
          
          // Add a message from the assistant acknowledging the action
          sendMessage("I'm starting the document processing workflow now. I'll guide you through each step and keep you informed of progress.");
          
          // Execute the action
          if (onExecuteAction) await onExecuteAction();
          
          // After some time, simulate a completion and show success dialog
          setTimeout(() => {
            showSuccessDialog({
              id: actionId || "default-action",
              name: "Document Processing Workflow",
              description: "Successfully processed and categorized all documents in the inbox folder.",
              completedSteps: 5,
              totalSteps: 5,
              metrics: {
                timeSaved: 120, // 2 minutes saved
                executionTime: 30, // 30 seconds to execute
                successRate: 100,
                automationLevel: 90
              },
              relatedActions: [
                { id: "action-1", name: "Send Processed Documents" },
                { id: "action-2", name: "Generate Summary Report" }
              ]
            });
          }, 5000);
        },
        onModify: () => {
          // Send a message to the assistant about modifying the action
          sendMessage("I'd like to modify how this action works before running it.");
        },
        onCancel: () => {
          toast({
            title: "Action cancelled",
            description: "The workflow execution has been cancelled",
            variant: "destructive"
          });
        }
      }
    );
  };

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

  // Function to handle running an action again from the success dialog
  const handleRunAgain = () => {
    closeSuccessDialog();
    showActionCheckpoint();
  };

  // Function to handle modifying an action from the success dialog
  const handleModifyAction = () => {
    closeSuccessDialog();
    // This would open action editing UI
    sendMessage("I'd like to help you modify this action to better suit your needs. What changes would you like to make?");
  };

  // Function to handle sharing results from the success dialog
  const handleShareResults = () => {
    closeSuccessDialog();
    // This would open a share dialog
    toast({
      title: "Share feature",
      description: "Sharing functionality would be implemented here",
    });
  };

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
            onClick={() => showActionCheckpoint()}
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

      {/* Checkpoint Dialog */}
      {currentCheckpoint && (
        <CheckpointDialog
          isOpen={isCheckpointOpen}
          options={currentCheckpoint}
          onProceed={handleProceed}
          onModify={handleModify}
          onCancel={handleCancel}
          onClose={closeCheckpoint}
        />
      )}

      {/* Success Dialog */}
      {currentSummary && (
        <SuccessDialog
          isOpen={isSuccessDialogOpen}
          onClose={closeSuccessDialog}
          onRunAgain={handleRunAgain}
          onModify={handleModifyAction}
          onShare={handleShareResults}
          summary={currentSummary}
        />
      )}
    </Card>
  );
};

// Message Bubble Component - kept the same
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
