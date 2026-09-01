import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

/**
 * DELETE /api/delete-account
 * Deletes the currently authenticated user from Supabase Auth.
 * Requires SUPABASE_SERVICE_ROLE_KEY (server-side only, never exposed to client).
 */
export async function DELETE(request: Request) {
    try {
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
        const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

        if (!supabaseUrl || !serviceRoleKey) {
            return NextResponse.json(
                { error: "Server is not configured for account deletion." },
                { status: 500 }
            )
        }

        // Create a regular client to identify the current user from their cookie/token
        const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || ""
        const userClient = createClient(supabaseUrl, anonKey)

        // Get the auth token from the Authorization header
        const authHeader = request.headers.get("Authorization")
        if (authHeader) {
            userClient.auth.setSession({ access_token: authHeader.replace("Bearer ", ""), refresh_token: "" })
        }

        const { data: { user }, error: userError } = await userClient.auth.getUser(
            authHeader ? authHeader.replace("Bearer ", "") : undefined
        )

        if (userError || !user) {
            return NextResponse.json(
                { error: "Not authenticated. Please log in again." },
                { status: 401 }
            )
        }

        // Use the admin client with service role key to delete the user
        const adminClient = createClient(supabaseUrl, serviceRoleKey, {
            auth: { autoRefreshToken: false, persistSession: false }
        })

        const { error: deleteError } = await adminClient.auth.admin.deleteUser(user.id)

        if (deleteError) {
            console.error("Delete user error:", deleteError)
            return NextResponse.json(
                { error: deleteError.message },
                { status: 500 }
            )
        }

        return NextResponse.json({ success: true }, { status: 200 })
    } catch (err: any) {
        console.error("Unexpected delete account error:", err)
        return NextResponse.json(
            { error: "An unexpected error occurred." },
            { status: 500 }
        )
    }
}