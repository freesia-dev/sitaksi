import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const MAX_STORAGE_BYTES = 1024 * 1024 * 1024 // 1GB total capacity

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!

    // Verify auth
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Missing authorization header' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const supabaseUser = createClient(supabaseUrl, Deno.env.get('SUPABASE_ANON_KEY')!, {
      global: { headers: { Authorization: authHeader } }
    })

    const { data: { user }, error: userError } = await supabaseUser.auth.getUser()
    if (userError || !user) {
      return new Response(
        JSON.stringify({ error: 'Invalid auth token' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey)

    // Get storage usage
    const { data: storageFiles, error: storageError } = await supabaseAdmin
      .from('storage_files')
      .select('file_size, taksasi_id')

    if (storageError) {
      return new Response(
        JSON.stringify({ error: 'Failed to get storage stats' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const totalUsed = (storageFiles || []).reduce((sum, f) => sum + (f.file_size || 0), 0)
    const totalFiles = (storageFiles || []).length

    // Get count of files by taksasi status
    const taksasiIds = [...new Set((storageFiles || []).map(f => f.taksasi_id).filter(Boolean))]
    
    let draftFiles = 0
    let selesaiFiles = 0

    if (taksasiIds.length > 0) {
      const { data: taksasiData } = await supabaseAdmin
        .from('taksasi')
        .select('id, status')
        .in('id', taksasiIds)

      const statusMap = new Map((taksasiData || []).map(t => [t.id, t.status]))
      
      for (const file of storageFiles || []) {
        const status = statusMap.get(file.taksasi_id)
        if (status === 'draft') draftFiles++
        else if (status === 'selesai') selesaiFiles++
      }
    }

    return new Response(
      JSON.stringify({
        used_bytes: totalUsed,
        total_bytes: MAX_STORAGE_BYTES,
        used_mb: Math.round(totalUsed / (1024 * 1024) * 100) / 100,
        total_mb: MAX_STORAGE_BYTES / (1024 * 1024),
        percentage: Math.round((totalUsed / MAX_STORAGE_BYTES) * 10000) / 100,
        total_files: totalFiles,
        draft_files: draftFiles,
        selesai_files: selesaiFiles
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Error:', error)
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})