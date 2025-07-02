'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/utils/supabase/client';

export default function useGetRoom(roomId: string) {
    const [room, setRoom] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    if (!roomId) {
        return { room: null, loading: false, error: 'Room ID is required.' };
    }

    useEffect(() => {
        const supabase = createClient(); 

        const fetchRoom = async () => {
            try {
                const response = await fetch(`/api/rooms?room_id=${encodeURIComponent(roomId)}`, {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json'
                    }
                })
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                const data = await response.json();
                if (data.error) {
                    throw new Error(data.error);
                }

                setRoom(data);
                setLoading(false);
            } catch (err) {
                setError('Failed to fetch room data. + ' + (err instanceof Error ? err.message : 'Unknown error'));
                setLoading(false);
            }
        }
        fetchRoom();

        const channel = supabase 
            .channel('rooms')
            .on('postgres_changes', {
                event: '*',
                schema: 'public',
                table: 'rooms',
                filter: `id=eq.${roomId}`
            }, (payload) => {
                console.log('Realtime event:', payload);
                setRoom(payload.new || null);
            })
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [roomId]);

    return { room, loading, error };

}