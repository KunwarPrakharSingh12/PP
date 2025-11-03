import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { message } = await req.json();
    const GOOGLE_AI_API_KEY = Deno.env.get('GOOGLE_AI_API_KEY');

    if (!GOOGLE_AI_API_KEY) {
      throw new Error('GOOGLE_AI_API_KEY is not configured');
    }

    console.log('Sending message to Gemini API:', message);

    const models = ["gemini-2.0-flash", "gemini-2.0-flash-lite"];
    const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

    let saw429 = false;

    const callModel = async (model: string) => {
      return fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${GOOGLE_AI_API_KEY}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text: message }] }],
          }),
        },
      );
    };

    for (const model of models) {
      for (let attempt = 0; attempt < 3; attempt++) {
        const response = await callModel(model);
        if (response.ok) {
          const data = await response.json();
          console.log('Gemini API response received from', model, 'attempt', attempt + 1);
          const reply = data.candidates?.[0]?.content?.parts?.[0]?.text || 'Sorry, I could not generate a response.';
          return new Response(
            JSON.stringify({ reply }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        const errorText = await response.text();
        console.error(`Gemini API error (model=${model} attempt=${attempt + 1}):`, response.status, errorText);

        if (response.status === 429) {
          saw429 = true;
          if (attempt < 2) {
            const backoff = 500 * Math.pow(2, attempt) + Math.floor(Math.random() * 300);
            await sleep(backoff);
            continue;
          } else {
            break; // try next model
          }
        } else {
          // Non-rate-limit error; try next model
          break;
        }
      }
    }

    if (saw429) {
      return new Response(
        JSON.stringify({ 
          error: 'Rate limit exceeded. Please wait a moment and try again.',
          userMessage: 'The AI is receiving too many requests. Please wait 30-60 seconds before trying again.'
        }),
        { 
          status: 429,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    throw new Error('Gemini API error: All attempts failed');
  } catch (error) {
    console.error('Error in chat function:', error);
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});
