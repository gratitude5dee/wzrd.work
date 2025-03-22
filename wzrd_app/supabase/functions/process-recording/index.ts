
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.9.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Handle CORS preflight requests
function handleCors(req: Request): Response | null {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }
  return null;
}

// Get environment variables
const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';
const geminiApiKey = Deno.env.get('GEMINI_API_KEY') || '';

// Initialize Supabase client with service role for admin privileges
const supabase = createClient(supabaseUrl, supabaseServiceKey);

serve(async (req) => {
  // Handle CORS
  const corsResponse = handleCors(req);
  if (corsResponse) return corsResponse;

  try {
    // Validate request
    if (req.method !== 'POST') {
      return new Response(JSON.stringify({ error: 'Method not allowed' }), {
        status: 405,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Parse request body
    const { recordingId } = await req.json();
    
    if (!recordingId) {
      return new Response(JSON.stringify({ error: 'Recording ID is required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    console.log(`Processing recording: ${recordingId}`);

    // Update recording status to processing
    const { error: updateError } = await supabase
      .from('screen_recordings')
      .update({ status: 'processing' })
      .eq('id', recordingId);
    
    if (updateError) {
      console.error('Error updating recording status:', updateError);
      return new Response(JSON.stringify({ error: 'Failed to update recording status' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Begin background processing with EdgeRuntime.waitUntil
    EdgeRuntime.waitUntil(processRecording(recordingId));

    return new Response(JSON.stringify({ 
      success: true, 
      message: 'Processing started',
      recordingId
    }), {
      status: 202,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Error in process-recording function:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});

async function processRecording(recordingId: string): Promise<void> {
  try {
    console.log(`Starting background processing for recording: ${recordingId}`);
    
    // Fetch the recording data
    const { data: recording, error: fetchError } = await supabase
      .from('screen_recordings')
      .select('*')
      .eq('id', recordingId)
      .single();
    
    if (fetchError || !recording) {
      console.error('Error fetching recording:', fetchError);
      await updateRecordingStatus(recordingId, 'error');
      return;
    }

    // Extract and process the raw data
    const rawData = recording.raw_data;
    if (!rawData) {
      console.error('No raw data found in recording');
      await updateRecordingStatus(recordingId, 'error');
      return;
    }

    // Process the raw data into a format suitable for Gemini
    const processedData = processRawData(rawData);
    
    // Create a workflow understanding record
    const { data: understanding, error: createError } = await supabase
      .from('workflow_understandings')
      .insert({
        recording_id: recordingId,
        processed_data: processedData,
        status: 'processing'
      })
      .select()
      .single();
    
    if (createError || !understanding) {
      console.error('Error creating workflow understanding:', createError);
      await updateRecordingStatus(recordingId, 'error');
      return;
    }

    console.log(`Created workflow understanding: ${understanding.id}`);

    // Analyze the processed data with Gemini API
    const geminiResponse = await analyzeWithGemini(processedData);
    
    // Extract actions and insights from the Gemini response
    const { actions, summary } = parseGeminiResponse(geminiResponse);
    
    // Update the workflow understanding with the Gemini response
    const { error: updateUnderstandingError } = await supabase
      .from('workflow_understandings')
      .update({
        gemini_response: geminiResponse,
        actions_identified: actions.length,
        analysis_summary: summary,
        status: 'completed'
      })
      .eq('id', understanding.id);
    
    if (updateUnderstandingError) {
      console.error('Error updating workflow understanding:', updateUnderstandingError);
      await updateRecordingStatus(recordingId, 'error');
      return;
    }

    // Insert extracted actions into workflow_actions table
    if (actions.length > 0) {
      const actionsToInsert = actions.map(action => ({
        understanding_id: understanding.id,
        action_type: action.type,
        action_data: action.data,
        confidence_score: action.confidence
      }));

      const { error: insertActionsError } = await supabase
        .from('workflow_actions')
        .insert(actionsToInsert);
      
      if (insertActionsError) {
        console.error('Error inserting workflow actions:', insertActionsError);
        // Continue processing even if action insertion fails
      }
    }

    // Update recording status to completed
    await updateRecordingStatus(recordingId, 'completed');
    
    console.log(`Completed processing for recording: ${recordingId}`);
  } catch (error) {
    console.error('Error in background processing:', error);
    await updateRecordingStatus(recordingId, 'error');
  }
}

async function updateRecordingStatus(recordingId: string, status: string): Promise<void> {
  const { error } = await supabase
    .from('screen_recordings')
    .update({ status })
    .eq('id', recordingId);
  
  if (error) {
    console.error(`Error updating recording status to ${status}:`, error);
  }
}

function processRawData(rawData: any): any {
  // Process the raw screen recording data into a format suitable for Gemini
  // This will depend on the structure of your raw data from screenpipe
  
  // Example processing logic:
  try {
    const events = rawData.events || [];
    
    // Extract key interactions like clicks, keypresses, navigation, etc.
    const processedEvents = events.map((event: any) => {
      // Extract relevant information based on event type
      return {
        type: event.type,
        timestamp: event.timestamp,
        target: event.target,
        value: event.value,
        // Add more fields as needed
      };
    });

    // Group events by sequence or context
    const sequences = [];
    let currentSequence = [];
    
    for (const event of processedEvents) {
      currentSequence.push(event);
      
      // Logic to determine when to start a new sequence
      // Example: start a new sequence after a page navigation
      if (event.type === 'navigation') {
        sequences.push([...currentSequence]);
        currentSequence = [];
      }
    }
    
    if (currentSequence.length > 0) {
      sequences.push(currentSequence);
    }

    return {
      events: processedEvents,
      sequences,
      metadata: {
        totalEvents: processedEvents.length,
        duration: rawData.duration || 0,
        // Add more metadata as needed
      }
    };
  } catch (error) {
    console.error('Error processing raw data:', error);
    return {
      events: [],
      sequences: [],
      metadata: { error: error.message }
    };
  }
}

async function analyzeWithGemini(processedData: any): Promise<any> {
  try {
    // Construct a prompt for Gemini based on the processed data
    const promptContent = createGeminiPrompt(processedData);
    
    // Call the Gemini API
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${geminiApiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              {
                text: promptContent
              }
            ]
          }
        ],
        generationConfig: {
          temperature: 0.2,
          topP: 0.8,
          topK: 40,
          maxOutputTokens: 2048
        }
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Gemini API error: ${response.status} - ${errorText}`);
    }

    const result = await response.json();
    return result;
  } catch (error) {
    console.error('Error calling Gemini API:', error);
    throw error;
  }
}

function createGeminiPrompt(processedData: any): string {
  // Create a well-structured prompt for Gemini based on the processed data
  const { events, sequences, metadata } = processedData;
  
  // Start with system instruction
  let prompt = `
You are a workflow analysis assistant. I'll provide you with a sequence of user interactions from a screen recording.
Your task is to:
1. Identify distinct actions and workflows
2. Determine repetitive patterns that could be automated
3. Provide a clear summary of the user's workflow
4. Suggest potential automation opportunities

The interaction data includes: event types, timestamps, targets, and values.

Please analyze the following screen recording data and return your analysis in this JSON format:
{
  "actions": [
    {
      "type": "identified_action_type",
      "description": "detailed description of the action",
      "steps": ["step 1", "step 2", ...],
      "frequency": number_of_occurrences,
      "automationPotential": 0-10_scale,
      "confidence": 0-1_confidence_score
    }
  ],
  "patterns": [
    {
      "description": "pattern description",
      "occurrences": number_of_occurrences,
      "actions": ["action1", "action2", ...]
    }
  ],
  "summary": "overall workflow summary text",
  "automationOpportunities": [
    {
      "description": "automation opportunity",
      "impact": "high/medium/low",
      "implementation": "brief implementation suggestion"
    }
  ]
}

Here is the interaction data:
`;

  // Add metadata
  prompt += `\nMetadata:\n${JSON.stringify(metadata, null, 2)}\n\n`;
  
  // Add sample of events (limit to avoid token limits)
  const eventSample = events.slice(0, 100);
  prompt += `\nEvents (sample of ${eventSample.length} out of ${events.length}):\n${JSON.stringify(eventSample, null, 2)}\n\n`;
  
  // Add sequences information
  prompt += `\nSequences (${sequences.length}):\n`;
  sequences.forEach((sequence: any, index: number) => {
    prompt += `Sequence ${index + 1}: ${sequence.length} events\n`;
    // Add first and last few events of each sequence as examples
    if (sequence.length > 0) {
      const start = sequence.slice(0, Math.min(3, sequence.length));
      const end = sequence.length > 3 ? sequence.slice(-3) : [];
      
      prompt += `Start: ${JSON.stringify(start)}\n`;
      if (end.length > 0) {
        prompt += `End: ${JSON.stringify(end)}\n`;
      }
    }
  });

  return prompt;
}

function parseGeminiResponse(geminiResponse: any): { actions: any[], summary: string } {
  try {
    // Extract the content from the Gemini response
    const content = geminiResponse?.candidates?.[0]?.content?.parts?.[0]?.text || '';
    
    // Try to extract JSON content from the response
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    
    if (jsonMatch) {
      const jsonContent = JSON.parse(jsonMatch[0]);
      
      // Extract actions and summary
      const actions = (jsonContent.actions || []).map((action: any) => ({
        type: action.type || 'unknown',
        data: {
          description: action.description,
          steps: action.steps,
          frequency: action.frequency,
          automationPotential: action.automationPotential
        },
        confidence: action.confidence || 0.5
      }));
      
      const summary = jsonContent.summary || 'No summary available';
      
      return { actions, summary };
    }
    
    // Fallback for non-JSON responses
    return {
      actions: [],
      summary: 'Failed to parse Gemini response format. Raw response: ' + content.substring(0, 200) + '...'
    };
  } catch (error) {
    console.error('Error parsing Gemini response:', error);
    return {
      actions: [],
      summary: 'Error parsing Gemini response: ' + error.message
    };
  }
}
