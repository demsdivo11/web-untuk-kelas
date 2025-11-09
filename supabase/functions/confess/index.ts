import { createClient } from 'npm:@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
}

interface ConfessRequest {
  sender?: string
  recipient: string
  from_class?: string
  message: string
  song_name?: string
  song_artist?: string
  song_spotify_id?: string
  is_anonymous?: boolean
  is_class_secret?: boolean
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Initialize Supabase client
    const supabaseClient = createClient(
  Deno.env.get('PROJECT_URL') ?? '',
  Deno.env.get('SERVICE_ROLE_KEY') ?? ''
)


    if (req.method === 'POST') {
      // Create new confession
      const body: ConfessRequest = await req.json()
      
      // Validate required fields
      if (!body.recipient || !body.message) {
        return new Response(
          JSON.stringify({ error: 'Recipient and message are required' }),
          { 
            status: 400, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        )
      }

      // Insert confession into database
      const { data, error } = await supabaseClient
        .from('confessions')
        .insert([{
          sender: body.sender || null,
          recipient: body.recipient,
          from_class: body.from_class || null,
          message: body.message,
          song_name: body.song_name || null,
          song_artist: body.song_artist || null,
          song_spotify_id: body.song_spotify_id || null,
          is_anonymous: body.is_anonymous || false,
          is_class_secret: body.is_class_secret || false
        }])
        .select()

      if (error) {
        console.error('Supabase insert error:', error)
        return new Response(
          JSON.stringify({ error: error.message }),
          { 
            status: 500, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        )
      }

      return new Response(
        JSON.stringify({ 
          success: true, 
          message: 'Confession created successfully',
          data: data[0]
        }),
        { 
          status: 201, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    if (req.method === 'GET') {
      // Get all confessions
      const { data, error } = await supabaseClient
        .from('confessions')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Supabase fetch error:', error)
        return new Response(
          JSON.stringify({ error: error.message }),
          { 
            status: 500, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        )
      }

      return new Response(
        JSON.stringify({ 
          success: true, 
          data: data 
        }),
        { 
          status: 200, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    return new Response(
      JSON.stringify({ error: 'Method not allowed' }),
      { 
        status: 405, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )

  } catch (error) {
    console.error('Confess function error:', error)
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})
