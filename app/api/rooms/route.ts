import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createClient } from '@/utils/supabase/server'

export async function POST(request: Request) {
    try {
        const supabase = createClient(cookies());
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
                owner_id: user.id,
                name: `Room ${Date.now()}`,
                status: 'waiting'
            })
            .select()
            .single();

        if (error) {
            return NextResponse.json({
                error: 'An error occurred while creating the room.'
            }, { status: 500 });
        }

        if (data) {
            return NextResponse.json({
                id: data.id,
            }, { status: 201 });
        } else {
            return NextResponse.json({
                error: 'Room creation failed.'
            }, { status: 500 });
        }
    } catch (e) {
        return NextResponse.json({
            error: 'An unexpected error occurred while creating the room.'
        }, { status: 500 });
    }
}