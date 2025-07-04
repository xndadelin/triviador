import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

export async function POST(request: Request) {
    const supabase = await createClient();
    const { room_id, assignments } = await request.json();

    const { data: authData, error: authError } = await supabase.auth.getUser();
    if (authError || !authData?.user) {
        return NextResponse.json({ error: 'not authenticated' }, { status: 401 });
    }
    const userId = authData.user.id;

    const { data: roomData, error: roomError } = await supabase
        .from('rooms')
        .select('status, host_id')
        .eq('id', room_id)
        .single();
    
    if (roomError) {
        return NextResponse.json({ error: 'failed to fetch room status' }, { status: 500 });
    }
    if (!roomData || roomData.host_id !== userId) {
        return NextResponse.json({ error: 'only the host can start the game' }, { status: 403 });
    }
    if (roomData.status === 'active') {
        return NextResponse.json({ error: 'game already started' }, { status: 400 });
    }

    const updates = await Promise.all(assignments.map(async ({ user_id, counties }: { user_id: string, counties: string[] }) => {
        const { error } = await supabase
            .from('room_players')
            .update({ counties })
            .eq('room_id', room_id)
            .eq('user_id', user_id);
        return error;
    }));

    const hasError = updates.some((e: any) => e);
    if (hasError) {
        return NextResponse.json({ error: 'failed to update some players' }, { status: 500 });
    }

    const mapState = assignments.map(({ user_id, counties }: { user_id: string, counties: string[] }) => ({ user_id, counties }));
    const { error: mapStateError } = await supabase
        .from('rooms')
        .update({ map_state: mapState, status: 'active' })
        .eq('id', room_id);
        
    if (mapStateError) {
        return NextResponse.json({ error: 'failed to update map_state' }, { status: 500 });
    }
    return NextResponse.json({ success: true });
}