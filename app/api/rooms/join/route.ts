import { createClient } from '@/utils/supabase/server';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
    const url = new URL(request.url);
    const user_id = url.searchParams.get('user_id');
    const code = url.searchParams.get('code');

    if (!user_id || !code) {
        return NextResponse.json({
            error: 'there is missing user_id or code'
        }, { status: 400 });
    }

    const supabase = await createClient();

    const { data: room, error: roomError } = await supabase
        .from('rooms')
        .select('id')
        .eq('code', code)
        .single();

    if (roomError || !room) {
        return NextResponse.json({
            error: 'invalid room code'
        }, { status: 400 });
    }

    const room_id = room.id;

    const { data: dataExists, error: errorExists } = await supabase
        .from('room_players')
        .select('user_id')
        .eq('room_id', room_id)
        .eq('user_id', user_id)
        .single();

    if (errorExists && errorExists.code !== 'PGRST116'){
        return NextResponse.json({
            error: 'there is an error checking if the user is already in the room'
        }, { status: 500 });
    }

    if (dataExists) {
        return NextResponse.json({
            error: 'user is already in the room'
        }, { status: 400 });
    }

    const { data: existingColors, error: colorError } = await supabase
        .from('room_players')
        .select('color')
        .eq('room_id', room_id);

    if (colorError || !existingColors) {
        return NextResponse.json({
            error: 'hey! there has been an error fetching the existing colors'
        }, { status: 500 });
    }

    const usedColors = new Set(existingColors.map((player: { color: string }) => player.color));
    const availableColors = ['red', 'blue', 'green', 'yellow', 'purple', 'orange', 'pink', 'cyan', 'lime', 'teal'].filter(color => !usedColors.has(color));

    if (availableColors.length === 0) {
        return NextResponse.json({
            error: 'no available colors for the room'
        }, { status: 500 });
    }

    const randomColor = availableColors[Math.floor(Math.random() * availableColors.length)];

    const { data: insertInRoom, error: errorInsert } = await supabase
        .from('room_players')
        .insert({
            user_id,
            color: randomColor,
            room_id
        });

    if (errorInsert) {
        return NextResponse.json({
            error: 'hi! there has been an error trying to add you to your room, please try again later'
        }, { status: 500 });
    }

    return NextResponse.json({
        message: 'user successfully added to the room',
        status: 200,
        room_id: room_id
    });
}
