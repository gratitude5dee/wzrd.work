
import { useState, useCallback } from 'react';
import tavusService, { TavusReplicaResponse, TavusGenerationStatus } from '@/services/tavusService';
import { useToast } from '@/hooks/use-toast';
import { Message } from './use-assistant-messages';

export function useVideoGeneration() {
  const [replica, setReplica] = useState<TavusReplicaResponse | null>(null);
  const [videoGeneration, setVideoGeneration] = useState<TavusGenerationStatus>({
    isGenerating: false,
    progress: 0,
    videoUrl: null,
    error: null
  });
  const { toast } = useToast();

  // Load the available replicas
  const loadReplicas = useCallback(async () => {
    try {
      const replicas = await tavusService.getReplicas();
      if (replicas.length > 0) {
        setReplica(replicas[0]); // Use the first available replica
      }
      return replicas[0] || null;
    } catch (error) {
      console.error('Failed to load replicas:', error);
      toast({
        title: 'Error',
        description: 'Failed to load digital assistant replicas',
        variant: 'destructive'
      });
      return null;
    }
  }, [toast]);

  // Generate a video for a message
  const generateVideoForMessage = useCallback(async (
    message: Message, 
    updateMessageCallback: (id: string, updates: Partial<Message>) => void
  ) => {
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
            updateMessageCallback(message.id, { 
              videoUrl: status.video_url, 
              isLoading: false 
            });
            
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
          updateMessageCallback(message.id, { isLoading: false });
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
      updateMessageCallback(message.id, { isLoading: false });
    }
  }, [replica]);

  return {
    replica,
    setReplica,
    videoGeneration,
    loadReplicas,
    generateVideoForMessage
  };
}
