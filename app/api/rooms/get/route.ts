import { createClient } from "@/utils/supabase/server"; 
import { NextResponse } from "next/server";

export const GET = async (request: Request) => {
    const supabase = await createClient();
    const { data: user, error: userError } = await supabase.auth.getUser();

    if (userError) {
        return NextResponse.json({
            error: 'ops! there has been an error trying to verify your auth!'
        }, { status: 500 });
    }

    const { data: roomsData, error: roomsError } = await supabase
        .from('rooms')
        .select('*')
        .eq('host_id', user.user.id);

    if (roomsError) {
        return NextResponse.json({
            error: 'there has been an error fetching the rooms where you are the host'
        }, { status: 500 });
    }

    return NextResponse.json({
        rooms: roomsData
    }, { status: 200 });
};