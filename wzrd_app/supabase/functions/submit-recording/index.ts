
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
    const { title, description, rawData, userId } = await req.json();
    
    if (!title || !rawData || !userId) {
      return new Response(JSON.stringify({ error: 'Missing required fields: title, rawData, userId' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Insert the recording into the database
    const { data: recording, error: insertError } = await supabase
      .from('screen_recordings')
      .insert({
        user_id: userId,
        title,
        description,
        raw_data: rawData,
        status: 'pending'
      })
      .select()
      .single();
    
    if (insertError) {
      console.error('Error inserting recording:', insertError);
      return new Response(JSON.stringify({ error: 'Failed to save recording' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Trigger the processing function
    const processingResponse = await fetch(`${supabaseUrl}/functions/v1/process-recording`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${supabaseServiceKey}`
      },
      body: JSON.stringify({ recordingId: recording.id })
    });

    if (!processingResponse.ok) {
      console.warn('Warning: Failed to trigger processing function automatically', await processingResponse.text());
      // Continue anyway since the recording is saved
    }

    return new Response(JSON.stringify({ 
      success: true, 
      recordingId: recording.id,
      message: 'Recording submitted and processing started'
    }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Error in submit-recording function:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});
