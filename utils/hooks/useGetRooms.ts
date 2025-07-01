import { useState, useEffect } from 'react';


function useGetRooms() {
    const [rooms, setRooms] = useState<any | null>(null);
    const [error, setError] = useState<any | null>(null);
    const [loading, setLoading] = useState<boolean>(false);

    useEffect(() => {
        const fetchRooms = async () => {
            setLoading(true);
            try {
                const result = await fetch('/api/rooms/get', {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                });

                if (!result.ok) {
                    const errorData = await result.json();
                    setError(errorData.error);
                    setRooms(null);
                } else {
                    const data = await result.json();
                    setRooms(data.rooms);
                    setError(null);
                }
            } catch (e) {
                if (e instanceof Error) {
                    setError(`${e.message}`);
                } else {
                    setError('an unexpected error occurred');
                }
                setRooms(null);
            } finally {
                setLoading(false);
            }
        };

        fetchRooms();
    }, []);

    return { rooms, error, loading };
}

export default useGetRooms;