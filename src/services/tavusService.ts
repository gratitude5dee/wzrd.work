
import { useToast } from "@/hooks/use-toast";

// Tavus API configuration
const TAVUS_API_KEY = import.meta.env.VITE_TAVUS_API_KEY || '';
const TAVUS_API_URL = 'https://api.tavus.io/v2';

// Types for Tavus API responses
export interface TavusReplicaResponse {
  id: string;
  name: string;
  status: string;
  created_at: string;
}

export interface TavusVideoResponse {
  id: string;
  status: string;
  video_url: string;
  thumbnail_url: string;
  created_at: string;
}

export interface TavusGenerationStatus {
  isGenerating: boolean;
  progress: number;
  videoUrl: string | null;
  error: string | null;
}

// Service class for Tavus integration
export class TavusService {
  private apiKey: string;

  constructor(apiKey: string = TAVUS_API_KEY) {
    this.apiKey = apiKey;
    if (!this.apiKey) {
      console.warn('Tavus API key is not set. Using mock data.');
    }
  }

  // Get available replicas (digital twins)
  async getReplicas(): Promise<TavusReplicaResponse[]> {
    if (!this.apiKey) {
      return this.getMockReplicas();
    }

    try {
      const response = await fetch(`${TAVUS_API_URL}/replicas`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch replicas: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching replicas:', error);
      return this.getMockReplicas();
    }
  }

  // Generate a video from text using a specific replica
  async generateVideo(replicaId: string, text: string): Promise<string> {
    if (!this.apiKey) {
      return this.getMockVideoUrl(text);
    }

    try {
      const response = await fetch(`${TAVUS_API_URL}/videos`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          replica_id: replicaId,
          script: text,
          webhook_url: null // Optional callback URL for status updates
        })
      });

      if (!response.ok) {
        throw new Error(`Failed to generate video: ${response.statusText}`);
      }

      const data = await response.json();
      return data.id; // Return the video ID for status polling
    } catch (error) {
      console.error('Error generating video:', error);
      return this.getMockVideoUrl(text);
    }
  }

  // Check the status of a video generation
  async checkVideoStatus(videoId: string): Promise<TavusVideoResponse> {
    if (!this.apiKey) {
      return this.getMockVideoStatus();
    }

    try {
      const response = await fetch(`${TAVUS_API_URL}/videos/${videoId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`Failed to check video status: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error checking video status:', error);
      return this.getMockVideoStatus();
    }
  }

  // Mock methods for development without API key
  private getMockReplicas(): TavusReplicaResponse[] {
    return [
      {
        id: 'replica_123',
        name: 'WZRD Assistant',
        status: 'active',
        created_at: new Date().toISOString()
      }
    ];
  }

  private getMockVideoUrl(text: string): string {
    // For development, return a mock video ID
    return 'mock_video_123';
  }

  private getMockVideoStatus(): TavusVideoResponse {
    return {
      id: 'mock_video_123',
      status: 'completed',
      video_url: 'https://storage.googleapis.com/tavus-dev-public/sample_videos/welcome_to_tavus.mp4',
      thumbnail_url: 'https://storage.googleapis.com/tavus-dev-public/sample_videos/welcome_to_tavus_thumbnail.jpg',
      created_at: new Date().toISOString()
    };
  }
}

// Singleton instance
const tavusService = new TavusService();
export default tavusService;
