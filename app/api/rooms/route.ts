import { NextResponse } from "next/server";
import { createClient } from '@/utils/supabase/server'

const getRandomColor = () => {
    const colors = ['red', 'blue', 'green', 'yellow', 'purple', 'orange', 'pink', 'cyan', 'lime', 'teal'];
    return colors[Math.floor(Math.random() * colors.length)];
}

export async function POST(request: Request) {
    try {
        const supabase = await createClient();
        const {
            data: { user },
            error: userError
        } = await supabase.auth.getUser();

        if (userError || !user) {
            NextResponse.json({
                error: 'User not authenticated.'
            }, { status: 401 });
            return;
        }

        const { data, error } = await supabase
            .from('rooms')
            .insert({
                host_id: user.id,
                name: `Room ${Date.now()}`,
                status: 'pending'
            })
            .select()
            .single();

        if (!data) {
            return NextResponse.json({
                error: 'Room creation failed.'
            }, { status: 500 });
        }
        
        const { data: existingColors, error: colorError } = await supabase
            .from('room_players')
            .select('color')
            .eq('room_id', data.id);   

        if (colorError) {
            return NextResponse.json({
                error: 'An error occurred while fetching existing colors.'
            }, { status: 500 });
        }

        const usedColors = new Set(existingColors.map(player => player.color));
        let color = getRandomColor();
        while (usedColors.has(color)) {
            color = getRandomColor();
        }

        const { data: roomData, error: roomError } = await supabase
            .from('room_players')
            .insert({
                room_id: data.id,
                user_id: user.id,
                color: color,
            })
            .select()
            .single();

        if (!roomData) {
            return NextResponse.json({
                error: 'User could not be added to the room.'
            }, { status: 500 });
        }

        if (roomError) {
            return NextResponse.json({
                error: 'An error occurred while adding the user to the room.'
            }, { status: 500 });
        }

        if (error) {
            return NextResponse.json({
                error: 'An error occurred while creating the room.'
            }, { status: 500 });
        }

        return NextResponse.json({
            room: data,
        }, { status: 201 });

    } catch (e) {
        return NextResponse.json({
            error: 'An unexpected error occurred while creating the room.'
        }, { status: 500 });
    }
}

export async function GET(request: Request) {
    try {
        const url = new URL(request.url);
        const room_id = url.searchParams.get('room_id');

        if (!room_id) {
            return NextResponse.json({ error: 'Missing room_id' }, { status: 400 });
        }

        const supabase = await createClient();
        const {
            data: { user },
            error: userError
        } = await supabase.auth.getUser();

        if (userError || !user) {
            return NextResponse.json({
                error: 'User not authenticated.'
            }, { status: 401 });
        }

        const { data: playerData, error: playerError } = await supabase
            .from('room_players')
            .select('room_id')
            .eq('user_id', user.id)
            .eq('room_id', room_id);

        if (playerError) {
            return NextResponse.json({
                error: 'An error occurred while fetching player data.'
            }, { status: 500 });
        }

        if (!playerData || playerData.length === 0) {
            return NextResponse.json({
                error: 'User is not a player in this room.'
            }, { status: 403 });
        }

        const { data: roomData, error: roomError } = await supabase
            .from('rooms')
            .select('*')
            .eq('id', room_id)
            .single();

        if (roomError || !roomData) {
            return NextResponse.json({
                error: 'Room not found.'
            }, { status: 404 });
        }

        return NextResponse.json({ room: roomData }, { status: 200 });
    } catch(e) {
        return NextResponse.json({
            error: 'An unexpected error occurred while fetching room.'
        }, { status: 500 });
    }
}