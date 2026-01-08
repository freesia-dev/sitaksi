import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const MAX_STORAGE_BYTES = 950 * 1024 * 1024 // 950MB threshold
const BUCKET_NAME = 'dokumentasi'

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    
    // Get auth token from request
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Missing authorization header' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Create client with user's auth
    const supabaseUser = createClient(supabaseUrl, Deno.env.get('SUPABASE_PUBLISHABLE_KEY')!, {
      global: { headers: { Authorization: authHeader } }
    })

    // Create service client for admin operations
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey)

    // Get user from token
    const { data: { user }, error: userError } = await supabaseUser.auth.getUser()
    if (userError || !user) {
      return new Response(
        JSON.stringify({ error: 'Invalid auth token' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const formData = await req.formData()
    const file = formData.get('file') as File
    const taksasiId = formData.get('taksasi_id') as string | null

    if (!file) {
      return new Response(
        JSON.stringify({ error: 'No file provided' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Calculate current storage usage
    const { data: storageFiles, error: storageError } = await supabaseAdmin
      .from('storage_files')
      .select('id, file_path, file_size, taksasi_id, created_at')
      .order('created_at', { ascending: true })

    if (storageError) {
      console.error('Error fetching storage files:', storageError)
      return new Response(
        JSON.stringify({ error: 'Failed to check storage' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const totalUsage = (storageFiles || []).reduce((sum, f) => sum + (f.file_size || 0), 0)
    const fileBuffer = await file.arrayBuffer()
    const fileSize = fileBuffer.byteLength

    // Check if we need to free up space
    if (totalUsage + fileSize > MAX_STORAGE_BYTES) {
      // Get taksasi with status 'selesai' - only delete from completed ones
      const { data: completedTaksasi } = await supabaseAdmin
        .from('taksasi')
        .select('id')
        .eq('status', 'selesai')

      const completedIds = new Set((completedTaksasi || []).map(t => t.id))
      
      // Filter files from completed taksasi only, sorted by oldest first
      const deletableFiles = (storageFiles || [])
        .filter(f => f.taksasi_id && completedIds.has(f.taksasi_id))
        .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())

      let freedSpace = 0
      const neededSpace = (totalUsage + fileSize) - MAX_STORAGE_BYTES

      for (const oldFile of deletableFiles) {
        if (freedSpace >= neededSpace) break

        // Delete from storage
        const { error: deleteStorageError } = await supabaseAdmin.storage
          .from(BUCKET_NAME)
          .remove([oldFile.file_path])

        if (!deleteStorageError) {
          // Delete from tracking table
          await supabaseAdmin
            .from('storage_files')
            .delete()
            .eq('id', oldFile.id)

          freedSpace += oldFile.file_size || 0
          console.log(`Deleted old file: ${oldFile.file_path}, freed ${oldFile.file_size} bytes`)
        }
      }

      // Check if we freed enough space
      if (freedSpace < neededSpace) {
        return new Response(
          JSON.stringify({ 
            error: 'Storage full. Cannot delete more files because remaining files are from draft or in-progress taksasi.',
            suggestion: 'Mark some taksasi as "selesai" to allow cleanup of their documentation.'
          }),
          { status: 507, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }
    }

    // Generate unique file path
    const timestamp = Date.now()
    const randomId = crypto.randomUUID().substring(0, 8)
    const ext = file.name.split('.').pop() || 'jpg'
    const filePath = `${user.id}/${timestamp}-${randomId}.${ext}`

    // Upload file
    const { error: uploadError } = await supabaseAdmin.storage
      .from(BUCKET_NAME)
      .upload(filePath, fileBuffer, {
        contentType: file.type,
        upsert: false
      })

    if (uploadError) {
      console.error('Upload error:', uploadError)
      return new Response(
        JSON.stringify({ error: 'Failed to upload file' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Track the file
    const { error: trackError } = await supabaseAdmin
      .from('storage_files')
      .insert({
        file_path: filePath,
        file_size: fileSize,
        taksasi_id: taksasiId || null,
        user_id: user.id
      })

    if (trackError) {
      console.error('Track error:', trackError)
      // File uploaded but not tracked - not critical, continue
    }

    // Get public URL
    const { data: urlData } = supabaseAdmin.storage
      .from(BUCKET_NAME)
      .getPublicUrl(filePath)

    return new Response(
      JSON.stringify({ 
        url: urlData.publicUrl,
        path: filePath,
        size: fileSize
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Unexpected error:', error)
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})