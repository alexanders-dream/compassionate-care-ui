import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { crypto } from "https://deno.land/std@0.177.0/crypto/mod.ts";

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders })
    }

    try {
        const { paramsToSign } = await req.json()
        const apiSecret = Deno.env.get('cloudinary_api_secret')

        if (!apiSecret) {
            throw new Error('cloudinary_api_secret not set')
        }

        // Sort parameters by key
        const sortedKeys = Object.keys(paramsToSign).sort()

        // Create the string to sign: key=value&key=value...
        const stringToSign = sortedKeys
            .map((key) => `${key}=${paramsToSign[key]}`)
            .join('&') + apiSecret

        // Generate SHA-1 signature
        const encoder = new TextEncoder();
        const data = encoder.encode(stringToSign);
        const hashBuffer = await crypto.subtle.digest('SHA-1', data);
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        const signature = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');

        return new Response(
            JSON.stringify({ signature }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
    } catch (error) {
        return new Response(
            JSON.stringify({ error: error.message }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
        )
    }
})
