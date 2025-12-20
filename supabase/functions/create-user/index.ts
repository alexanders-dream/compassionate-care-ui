
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders })
    }

    try {
        const supabaseClient = createClient(
            Deno.env.get('SUPABASE_URL') ?? '',
            Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
        )

        const { email, password, name, role, bio, image_url, is_public, system_role } = await req.json()

        if (!email || !password) {
            throw new Error('Email and password are required')
        }

        // 1. Create User
        const { data: userData, error: userError } = await supabaseClient.auth.admin.createUser({
            email,
            password,
            email_confirm: true,
            user_metadata: { full_name: name }
        })

        if (userError) throw userError
        if (!userData.user) throw new Error('Failed to create user')

        const userId = userData.user.id

        // 2. Create Profile
        const { error: profileError } = await supabaseClient
            .from('profiles')
            .insert({
                user_id: userId,
                full_name: name,
                email: email
            })

        if (profileError) {
            console.error('Error creating profile:', profileError)
            // clean up user?
        }

        // 3. Assign System Role
        // 3. Assign System Role
        if (system_role) {
            console.log(`Assigning role ${system_role} to user ${userId}`)
            const { error: roleError } = await supabaseClient
                .from('user_roles')
                .insert({
                    user_id: userId,
                    role: system_role
                })

            if (roleError) {
                console.error('Error assigning role:', roleError)
                throw new Error(`Failed to assign role: ${roleError.message}`)
            }
        }

        // 4. Create Team Member Entry
        const { data: teamMember, error: teamError } = await supabaseClient
            .from('team_members')
            .insert({
                user_id: userId,
                name: name,
                role: role || 'System User',
                bio: bio || '',
                image_url: image_url || null,
                is_public: is_public ?? true,
                display_order: 100
            })
            .select()
            .single()

        if (teamError) console.error('Error creating team member:', teamError)

        return new Response(
            JSON.stringify({ user: userData.user, teamMember }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
        )

    } catch (error) {
        return new Response(
            JSON.stringify({ error: (error as Error).message }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
        )
    }
})
