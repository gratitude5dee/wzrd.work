
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.9.0";
import OpenAI from "https://esm.sh/openai@4.20.1";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Get environment variables
const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';
const openaiApiKey = Deno.env.get('OPENAI_API_KEY') || '';
const e2bApiKey = Deno.env.get('E2B_API_KEY') || '';

// Initialize Supabase client with service role for admin privileges
const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: openaiApiKey
});

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
    const { actionId, userId, input, useSurf = false } = await req.json();
    
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

    // Create a new execution log entry
    const { data: execData, error: execError } = await supabase
      .from('execution_logs')
      .insert({
        action_id: actionId,
        user_id: userId,
        status: 'running',
        start_time: new Date().toISOString(),
        execution_data: { 
          input: input || '',
          useSurf,
          e2bApiKey: e2bApiKey ? 'configured' : 'missing'
        },
        checkpoints_shown: 0,
        checkpoints_modified: 0,
        checkpoints_cancelled: 0
      })
      .select()
      .single();
    
    if (execError) {
      console.error('Error creating execution log:', execError);
      return new Response(JSON.stringify({ error: 'Failed to create execution log' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    const execId = execData.id;

    // Launch background processing using EdgeRuntime.waitUntil
    const processAction = async () => {
      try {
        console.log(`Starting to process action ${actionId} for user ${userId}`);
        
        // Update progress to 10%
        await supabase
          .from('execution_logs')
          .update({ 
            progress: 10,
            execution_data: { 
              ...execData.execution_data, 
              status: 'preparing' 
            }
          })
          .eq('id', execId);
        
        // If using Surf, delegate task to OpenAI with Computer Use API
        if (useSurf && openaiApiKey) {
          console.log('Using OpenAI Computer Use API for action execution');
          
          // Extract instructions from the action
          const instructions = action.instructions || 'Perform the requested action efficiently.';
          
          // Update progress to 20%
          await supabase
            .from('execution_logs')
            .update({ 
              progress: 20,
              execution_data: { 
                ...execData.execution_data, 
                status: 'communicating_with_ai' 
              }
            })
            .eq('id', execId);
          
          try {
            // Simulate OpenAI Computer Use API interaction
            // In a real implementation, this would be replaced with the actual OpenAI API call
            console.log('Simulating OpenAI Computer Use API interaction');
            
            // Update progress to 50%
            await supabase
              .from('execution_logs')
              .update({ 
                progress: 50,
                execution_data: { 
                  ...execData.execution_data, 
                  status: 'executing_on_desktop' 
                }
              })
              .eq('id', execId);
            
            // Simulate completion after a short delay
            await new Promise(resolve => setTimeout(resolve, 2000));
            
            // Update progress to 90%
            await supabase
              .from('execution_logs')
              .update({ 
                progress: 90,
                execution_data: { 
                  ...execData.execution_data, 
                  status: 'finalizing' 
                }
              })
              .eq('id', execId);
            
            // Simulate completion after a short delay
            await new Promise(resolve => setTimeout(resolve, 1000));
            
            // Mark execution as completed
            const endTime = new Date().toISOString();
            const executionTime = action.estimated_time_seconds || 60;
            
            await supabase
              .from('execution_logs')
              .update({
                status: 'completed',
                end_time: endTime,
                duration_seconds: executionTime,
                progress: 100,
                execution_data: {
                  ...execData.execution_data,
                  output: `Action '${action.name}' executed successfully using Surf Computer Use Agent.`,
                  status: 'completed'
                }
              })
              .eq('id', execId);
            
            console.log(`Action ${actionId} completed successfully`);
            
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
          } catch (error) {
            console.error('Error during OpenAI Computer Use API interaction:', error);
            
            // Mark execution as failed
            await supabase
              .from('execution_logs')
              .update({
                status: 'failed',
                end_time: new Date().toISOString(),
                error_message: `AI error: ${error.message || 'Unknown error'}`,
                execution_data: {
                  ...execData.execution_data,
                  error: error.message || 'Unknown error',
                  status: 'failed'
                }
              })
              .eq('id', execId);
          }
        } else {
          // Execute standard action without Surf integration
          // Simulate successful execution
          const executionTime = action.estimated_time_seconds || 60;
          const stepTime = executionTime / 5;
          
          // Simulate progress updates
          for (let step = 1; step <= 5; step++) {
            await new Promise(resolve => setTimeout(resolve, stepTime * 200)); // Accelerated for testing
            
            await supabase
              .from('execution_logs')
              .update({ 
                progress: step * 20,
                execution_data: { 
                  ...execData.execution_data, 
                  status: `step_${step}` 
                }
              })
              .eq('id', execId);
          }
          
          // Complete the execution
          const endTime = new Date().toISOString();
          
          await supabase
            .from('execution_logs')
            .update({
              status: 'completed',
              end_time: endTime,
              duration_seconds: executionTime,
              execution_data: {
                ...execData.execution_data,
                output: `Action '${action.name}' executed successfully.`,
                status: 'completed'
              }
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
      } catch (error) {
        console.error('Error in background task:', error);
        
        // Update execution log with error
        await supabase
          .from('execution_logs')
          .update({
            status: 'failed',
            end_time: new Date().toISOString(),
            error_message: error.message || 'Unknown error',
            execution_data: {
              ...execData.execution_data,
              error: error.message || 'Unknown error',
              status: 'failed'
            }
          })
          .eq('id', execId);
      }
    };

    // Start background processing
    try {
      EdgeRuntime.waitUntil(processAction());
    } catch (error) {
      console.error('Failed to start background task:', error);
      // Continue execution even if background task fails to start
    }

    return new Response(JSON.stringify({ 
      success: true, 
      executionId: execId,
      message: 'Action execution started',
      execution: {
        id: execId,
        status: 'running',
        action: {
          id: action.id,
          name: action.name
        }
      }
    }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Error in execute-action function:', error);
    return new Response(JSON.stringify({ error: error.message || 'Unknown error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});
