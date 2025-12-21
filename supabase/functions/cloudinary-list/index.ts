import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders })
    }

    try {
        const { resourceType = 'image', nextCursor } = await req.json()

        const cloudName = Deno.env.get('cloudinary_cloud_name')
        const apiKey = Deno.env.get('cloudinary_api_key')
        const apiSecret = Deno.env.get('cloudinary_api_secret')

        if (!cloudName || !apiKey || !apiSecret) {
            throw new Error('Cloudinary credentials not set')
        }

        // Use Cloudinary Admin API to list resources
        // Note: In production, you might want to use the Search API for more advanced filtering
        // or cache these results.
        let url = `https://api.cloudinary.com/v1_1/${cloudName}/resources/${resourceType}?max_results=30&type=upload`
        if (nextCursor) {
            url += `&next_cursor=${nextCursor}`
        }

        const auth = btoa(`${apiKey}:${apiSecret}`)

        const response = await fetch(url, {
            headers: {
                'Authorization': `Basic ${auth}`
            }
        })

        const data = await response.json()

        if (data.error) {
            throw new Error(data.error.message)
        }

        return new Response(
            JSON.stringify(data),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
    } catch (error) {
        return new Response(
            JSON.stringify({ error: error.message }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
        )
    }
})
