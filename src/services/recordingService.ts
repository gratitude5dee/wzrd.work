import { supabase } from "@/integrations/supabase/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "@/hooks/use-toast";

// Types
export interface ScreenRecording {
  id: string;
  user_id: string;
  title: string;
  description?: string;
  status: 'pending' | 'processing' | 'completed' | 'error';
  created_at: string;
  updated_at: string;
  raw_data?: any; // Using any to allow accessing nested properties
}

export interface WorkflowUnderstanding {
  id: string;
  recording_id: string;
  analysis_summary?: string;
  actions_identified?: number;
  status: 'pending' | 'processing' | 'completed' | 'error';
  created_at: string;
  updated_at: string;
  gemini_response?: any; // Added to fix the error
}

export interface WorkflowAction {
  id: string;
  understanding_id: string;
  action_type: string;
  action_data?: any;
  confidence_score?: number;
  created_at: string;
  thumbnail_url?: string; // URL for the action thumbnail
  name?: string; // Name of the action
  description?: string; // Description of the action
  instructions?: string; // Instructions for how to execute the action
  tags?: string[]; // Tags for filtering
}

// Function to submit a new recording
export async function submitRecording(title: string, description: string, rawData: any) {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      throw new Error("You must be logged in to submit a recording");
    }

    const response = await supabase.functions.invoke('submit-recording', {
      body: {
        title,
        description,
        rawData,
        userId: user.id
      }
    });

    if (response.error) {
      throw new Error(response.error.message || "Failed to submit recording");
    }

    return response.data;
  } catch (error) {
    console.error("Error submitting recording:", error);
    throw error;
  }
}

// Hook to get all recordings for the current user
export function useRecordings() {
  return useQuery({
    queryKey: ['recordings'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('screen_recordings')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as ScreenRecording[];
    }
  });
}

// Hook to get a specific recording by ID
export function useRecording(id: string) {
  return useQuery({
    queryKey: ['recording', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('screen_recordings')
        .select(`
          *,
          workflow_understandings (
            *,
            workflow_actions (*)
          )
        `)
        .eq('id', id)
        .single();
      
      if (error) throw error;
      return data;
    },
    enabled: !!id
  });
}

// Hook to get workflow understanding for a recording
export function useWorkflowUnderstanding(recordingId: string) {
  return useQuery({
    queryKey: ['workflow_understanding', recordingId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('workflow_understandings')
        .select('*')
        .eq('recording_id', recordingId)
        .single();
      
      if (error) throw error;
      return data as WorkflowUnderstanding;
    },
    enabled: !!recordingId
  });
}

// Hook to get workflow actions for an understanding
export function useWorkflowActions(understandingId: string) {
  return useQuery({
    queryKey: ['workflow_actions', understandingId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('workflow_actions')
        .select('*')
        .eq('understanding_id', understandingId);
      
      if (error) throw error;
      return data as WorkflowAction[];
    },
    enabled: !!understandingId
  });
}

// Hook to check recording status and poll if still processing
export function useRecordingStatus(id: string) {
  return useQuery({
    queryKey: ['recording_status', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('screen_recordings')
        .select('id, status, updated_at')
        .eq('id', id)
        .single();
      
      if (error) throw error;
      return data as Pick<ScreenRecording, 'id' | 'status' | 'updated_at'>;
    },
    enabled: !!id,
    refetchInterval: (data) => {
      // Poll every 5 seconds if status is pending or processing
      if (data && (data.status === 'pending' || data.status === 'processing')) {
        return 5000;
      }
      return false;
    }
  });
}

// Hook to submit a recording with React Query
export function useSubmitRecording() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (variables: { title: string; description: string; rawData: any }) => {
      return submitRecording(variables.title, variables.description, variables.rawData);
    },
    onSuccess: () => {
      toast({
        title: "Recording submitted",
        description: "Your screen recording has been submitted for processing",
      });
      queryClient.invalidateQueries({ queryKey: ['recordings'] });
    },
    onError: (error: Error) => {
      toast({
        title: "Error submitting recording",
        description: error.message,
        variant: "destructive",
      });
    }
  });
}

// Function to manually trigger processing for a recording
export async function triggerProcessing(recordingId: string) {
  try {
    const response = await supabase.functions.invoke('process-recording', {
      body: { recordingId }
    });

    if (response.error) {
      throw new Error(response.error.message || "Failed to trigger processing");
    }

    return response.data;
  } catch (error) {
    console.error("Error triggering processing:", error);
    throw error;
  }
}

// Hook to trigger processing with React Query
export function useTriggerProcessing() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (recordingId: string) => {
      return triggerProcessing(recordingId);
    },
    onSuccess: (_, recordingId) => {
      toast({
        title: "Processing started",
        description: "The recording is now being analyzed",
      });
      queryClient.invalidateQueries({ queryKey: ['recording', recordingId] });
      queryClient.invalidateQueries({ queryKey: ['recording_status', recordingId] });
    },
    onError: (error: Error) => {
      toast({
        title: "Error starting processing",
        description: error.message,
        variant: "destructive",
      });
    }
  });
}

// Function to fetch all available actions
export async function fetchAvailableActions(): Promise<WorkflowAction[]> {
  try {
    const { data, error } = await supabase
      .from('workflow_actions')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data as WorkflowAction[];
  } catch (error) {
    console.error("Error fetching available actions:", error);
    throw error;
  }
}

// Hook to get all available actions
export function useAvailableActions(filters?: { tags?: string[], search?: string }) {
  return useQuery({
    queryKey: ['available_actions', filters],
    queryFn: async () => {
      let query = supabase
        .from('workflow_actions')
        .select('*')
        .order('created_at', { ascending: false });
      
      // Apply search filter if provided
      if (filters?.search) {
        query = query.or(`name.ilike.%${filters.search}%,description.ilike.%${filters.search}%`);
      }
      
      // Apply tag filter if provided
      if (filters?.tags && filters.tags.length > 0) {
        // This is a simplified approach - in a real app, you might need a more sophisticated filtering method for tags
        query = query.contains('tags', filters.tags);
      }
      
      const { data, error } = await query;
      
      if (error) throw error;
      return data as WorkflowAction[];
    }
  });
}

// Function to execute an action
export async function executeAction(actionId: string): Promise<{ success: boolean; message: string }> {
  try {
    const response = await supabase.functions.invoke('execute-action', {
      body: { actionId }
    });

    if (response.error) {
      throw new Error(response.error.message || "Failed to execute action");
    }

    return { success: true, message: "Action executed successfully" };
  } catch (error) {
    console.error("Error executing action:", error);
    throw error;
  }
}

// Hook to execute an action with React Query
export function useExecuteAction() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (actionId: string) => {
      return executeAction(actionId);
    },
    onSuccess: () => {
      toast({
        title: "Action executed",
        description: "The action has been executed successfully",
      });
      // Invalidate actions query to reflect any changes
      queryClient.invalidateQueries({ queryKey: ['available_actions'] });
    },
    onError: (error: Error) => {
      toast({
        title: "Error executing action",
        description: error.message,
        variant: "destructive",
      });
    }
  });
}
