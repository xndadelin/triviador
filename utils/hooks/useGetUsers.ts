import { useState, useEffect } from 'react';

export default function useGetUsers(roomId: string) {
    const [users, setUsers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!roomId) {
            setUsers([]);
            setLoading(false);
            setError('Room ID is required.');
            return;
        }
        setLoading(true);
        setError(null);
        (async () => {
            try {
                const res = await fetch(`/api/users?room_id=${encodeURIComponent(roomId)}`);
                const data = await res.json();
                if (data.error) {
                    setError(data.error);
                    setUsers([]);
                } else {
                    setUsers(data.users || []);
                }
            } catch (e) {
                setError('Failed to fetch users.');
                setUsers([]);
            } finally {
                setLoading(false);
            }
        })();
    }, [roomId]);

    return { users, loading, error };
}
