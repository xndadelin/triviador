import { createClient } from '@/utils/supabase/server';
import { NextResponse } from 'next/server';

const getRandomColor = () => {
    const colors = ['red', 'blue', 'green', 'yellow', 'purple', 'orange', 'pink', 'cyan', 'lime', 'teal'];
    return colors[Math.floor(Math.random() * colors.length)];
}

export async function POST(request: Request) {
    const url = new URL(request.url);
    const room_id = url.searchParams.get('room_id')
    const user_id = url.searchParams.get('user_id')

    if(!room_id || !user_id) {
        return NextResponse.json({
            error: 'there is missing room_id or user_id'
        }, { status: 500 } )
    }

    const supabase = await createClient();

    const { data: dataExists, error: errorExists } = await supabase
        .from('room_players')
        .select('user_id')
        .eq('room_id', room_id)
        .eq('user_id', user_id)
        .single();

    if (errorExists) {
        return NextResponse.json({
            error: 'there is an error checking if the user is already in the room'
        }, { status: 500 });
        return ;
    }

    if (dataExists) {
        return NextResponse.json({
            error: 'user is already in the room'
        }, { status: 400 });
        return ;
    }

    const { data: existingColors, error: colorError } = await supabase
        .from('room_players')
        .select('color')
        .eq('room_id', room_id);
    
    if (colorError) {
        return NextResponse.json({
            error: 'hey! there has been an error fetching the existing colors'
        }, { status: 500 });
    }

    const usedColors = new Set(existingColors.map(player => player.color));
    let randomColor = getRandomColor();

    while(!usedColors.has(randomColor)) {
        randomColor = getRandomColor()
    }

    const { data: insertInRoom, error: errorInsert } = await supabase
        .from('room_players')
        .insert({
            user_id,
            color: randomColor,
            room_id
        })
    
    if(errorInsert) {
        return NextResponse.json({
            error: 'hi! there has been an error trying to add you to your room, please try again later'
        }, { status: 500 } )
    }

    return NextResponse.json({
        status: 200
    })
}
