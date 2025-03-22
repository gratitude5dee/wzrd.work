
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
}

export interface WorkflowUnderstanding {
  id: string;
  recording_id: string;
  analysis_summary?: string;
  actions_identified?: number;
  status: 'pending' | 'processing' | 'completed' | 'error';
  created_at: string;
  updated_at: string;
}

export interface WorkflowAction {
  id: string;
  understanding_id: string;
  action_type: string;
  action_data?: any;
  confidence_score?: number;
  created_at: string;
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
      return (data?.status === 'pending' || data?.status === 'processing') ? 5000 : false;
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
