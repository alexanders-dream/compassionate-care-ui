
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

        const { email, password, name, role, bio, image_url, is_public, system_role } = await req.json()

        // 1. Validation
        if (!email || !password) {
            throw new Error('Email and password are required')
        }
        if (password.length < 6) {
            throw new Error('Password must be at least 6 characters')
        }

        let userId: string | null = null;
        let authUserDeleted = false;

        try {
            console.log(`Creating user with Role: ${system_role}`)

            // 2. Create Auth User
            const { data: userData, error: userError } = await supabaseClient.auth.admin.createUser({
                email,
                password,
                email_confirm: true,
                user_metadata: { full_name: name }
            })

            if (userError) {
                console.error('Auth User Creation Error:', userError)
                throw userError
            }
            if (!userData.user) throw new Error('Failed to create user object')

            userId = userData.user.id

            // A helper to rollback if subsequent steps fail
            const rollback = async () => {
                if (userId && !authUserDeleted) {
                    console.warn(`Rolling back creation for user ${userId}...`)
                    const { error: delError } = await supabaseClient.auth.admin.deleteUser(userId)
                    if (delError) {
                        console.error('CRITICAL: Failed to rollback user creation:', delError)
                    } else {
                        authUserDeleted = true;
                        console.log('Rollback successful.')
                    }
                }
            }

            try {
                // 3. Create Profile (Upsert to handle potential triggers)
                const { error: profileError } = await supabaseClient
                    .from('profiles')
                    .upsert(
                        {
                            user_id: userId,
                            full_name: name,
                            email: email
                        },
                        { onConflict: 'user_id' }
                    )

                if (profileError) throw new Error(`Profile creation failed: ${profileError.message}`)

                // 4. Assign System Role (RBAC) - Upsert to override any default role
                if (system_role) {
                    const { error: roleError } = await supabaseClient
                        .from('user_roles')
                        .upsert(
                            {
                                user_id: userId,
                                role: system_role
                            },
                            { onConflict: 'user_id' }
                        )

                    if (roleError) throw new Error(`Role assignment failed: ${roleError.message}`)
                }

                // 5. Create Public Team Member Entry
                const { data: teamMember, error: teamError } = await supabaseClient
                    .from('team_members')
                    .insert({
                        user_id: userId,
                        name: name,
                        role: role || 'System User',
                        bio: bio || '',
                        image_url: image_url || null,
                        is_public: is_public ?? true,
                        display_order: 100 // Default to end
                    })
                    .select()
                    .single()

                if (teamError) throw new Error(`Team member creation failed: ${teamError.message}`)

                // Success!
                return new Response(
                    JSON.stringify({ user: userData.user, teamMember, message: "User created successfully" }),
                    { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
                )

            } catch (innerError) {
                // If any step 3-5 fails, ROLLBACK
                await rollback()
                throw innerError
            }

        } catch (error) {
            console.error('Operation Failed:', error)
            return new Response(
                JSON.stringify({ error: (error as Error).message }),
                { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
            )
        }
    } catch (error) {
        console.error('General Error:', error)
        return new Response(
            JSON.stringify({ error: (error as Error).message }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
        )
    }
})
