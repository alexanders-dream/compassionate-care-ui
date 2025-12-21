import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req: Request) => {
    // Handle CORS
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders })
    }

    try {
        const supabaseClient = createClient(
            Deno.env.get('SUPABASE_URL') ?? '',
            Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
        )

        const { userId, email, password } = await req.json()

        // 1. Validation
        if (!userId) {
            throw new Error('User ID is required')
        }
        if (!email && !password) {
            throw new Error('At least one of email or password must be provided')
        }
        if (password && password.length < 6) {
            throw new Error('Password must be at least 6 characters')
        }

        console.log(`Updating user: ${userId}, Email change: ${!!email}, Password change: ${!!password}`)

        // 2. Build update object
        const updateData: { email?: string; password?: string } = {}
        if (email) updateData.email = email
        if (password) updateData.password = password

        // 3. Update Auth User
        const { data: userData, error: userError } = await supabaseClient.auth.admin.updateUserById(
            userId,
            updateData
        )

        if (userError) {
            console.error('Auth User Update Error:', userError)
            throw userError
        }

        const errors: string[] = []

        // 4. Update Profile email if email changed
        if (email) {
            const { error: profileError } = await supabaseClient
                .from('profiles')
                .update({ email: email, updated_at: new Date().toISOString() })
                .eq('user_id', userId)

            if (profileError) {
                console.error('Profile Update Error:', profileError)
                errors.push(`Profile email update failed: ${profileError.message}`)
            }
        }

        // Response
        if (errors.length > 0) {
            return new Response(
                JSON.stringify({
                    user: userData.user,
                    warning: "User updated but some details failed.",
                    errors
                }),
                { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
            )
        }

        return new Response(
            JSON.stringify({
                user: userData.user,
                message: "User updated successfully",
                emailUpdated: !!email,
                passwordUpdated: !!password
            }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
        )

    } catch (error) {
        console.error('General Error:', error)
        return new Response(
            JSON.stringify({ error: (error as Error).message }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
        )
    }
})
