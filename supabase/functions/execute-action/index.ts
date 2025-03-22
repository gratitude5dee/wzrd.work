
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.9.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Get environment variables
const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';

// Initialize Supabase client with service role for admin privileges
const supabase = createClient(supabaseUrl, supabaseServiceKey);

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    if (req.method !== 'POST') {
      return new Response(JSON.stringify({ error: 'Method not allowed' }), {
        status: 405,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Extract the request data
    const { actionId, executionId, userId } = await req.json();
    
    if (!actionId) {
      return new Response(JSON.stringify({ error: 'Missing required fields: actionId' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Get the action details
    const { data: action, error: actionError } = await supabase
      .from('workflow_actions')
      .select('*')
      .eq('id', actionId)
      .single();
    
    if (actionError) {
      console.error('Error fetching action:', actionError);
      return new Response(JSON.stringify({ error: 'Action not found' }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Create a new execution log if not provided
    let execId = executionId;
    
    if (!execId && userId) {
      const { data: execData, error: execError } = await supabase
        .from('execution_logs')
        .insert({
          action_id: actionId,
          user_id: userId,
          status: 'running',
          start_time: new Date().toISOString(),
          checkpoints_shown: 0,
          checkpoints_modified: 0,
          checkpoints_cancelled: 0
        })
        .select()
        .single();
      
      if (execError) {
        console.error('Error creating execution log:', execError);
      } else {
        execId = execData.id;
      }
    }

    // Simulate execution steps (in a real implementation, this would execute the actual action)
    const steps = action.checkpoint_config?.checkpoints || [];
    const totalSteps = steps.length > 0 ? steps.length : 3; // Default to 3 steps if none defined
    
    // Update execution status to running
    if (execId) {
      await supabase
        .from('execution_logs')
        .update({ status: 'running' })
        .eq('id', execId);
    }
    
    // Simulate successful execution
    const executionTime = action.estimated_time_seconds || 60;
    const stepTime = executionTime / totalSteps;
    
    // Complete the execution
    if (execId) {
      const endTime = new Date().toISOString();
      
      await supabase
        .from('execution_logs')
        .update({
          status: 'completed',
          end_time: endTime,
          duration_seconds: executionTime
        })
        .eq('id', execId);
      
      // Add analytics data for time saved
      if (userId) {
        await supabase
          .from('analytics_data')
          .insert([
            {
              user_id: userId,
              action_id: actionId,
              metric_type: 'execution_time',
              metric_value: executionTime,
              context: { execution_id: execId }
            },
            {
              user_id: userId,
              action_id: actionId,
              metric_type: 'time_saved',
              metric_value: executionTime * 2, // Simplified estimate
              context: { execution_id: execId }
            }
          ]);
      }
    }

    return new Response(JSON.stringify({ 
      success: true, 
      executionId: execId,
      message: 'Action executed successfully',
      execution: {
        totalSteps,
        executionTime,
        completedAt: new Date().toISOString()
      }
    }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Error in execute-action function:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});
