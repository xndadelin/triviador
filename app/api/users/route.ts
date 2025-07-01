import { cookies } from "next/headers";
import { createClient } from "@/utils/supabase/server";

export async function GET(request: Request) {
    try {
        const url = new URL(request.url);
        const room_id = url.searchParams.get('room_id');
        if (!room_id) {
            return new Response(JSON.stringify({ error: 'Missing room_id' }), { status: 400 });
        }

        const supabase = await createClient();  
        const { data: players, error: playersError } = await supabase
            .from('room_players')
            .select('user_id')
            .eq('room_id', room_id);

        if (playersError) {
            return new Response(JSON.stringify({ error: 'Could not fetch players' }), { status: 500 });
        }
        if (!players || players.length === 0) {
            return new Response(JSON.stringify({ users: [] }), { status: 200 });
        }

        const userIds = players.map(p => p.user_id);

        const { data: users, error: usersError } = await supabase
            .from('users')
            .select('id, full_name, avatar_url')
            .in('id', userIds);

        if (usersError) {
            console.error('Error fetching users:', usersError);
            return new Response(JSON.stringify({ error: 'Could not fetch users' }), { status: 500 });
        }

        return new Response(JSON.stringify({ users }), { status: 200 });
    } catch (e) {
        return new Response(JSON.stringify({ error: 'An unexpected error occurred while fetching user data.' }), { status: 500 });
    }
}