'use client';

import { useParams } from "next/navigation";
import Error from "@/components/Error";
import useGetRoom from "@/utils/hooks/useGetRoom";
import useGetUsers from "@/utils/hooks/useGetUsers";
import { Loading } from "@/components/Loading";
import { useGetUser } from "@/utils/hooks/useGetUser";

export default function Room() {
    const { room } = useParams();

    const { room: roomData, loading, error } = useGetRoom(room as string);
    const { users, loading: usersLoading, error: usersError } = useGetUsers(room as string);
    const { user, error: errorUser, loading: loadingError } = useGetUser()

    if (loading || usersLoading) {
        return <Loading />;
    }
    if (error) {
        return <Error error={error} />;
    }
    if (usersError) {
        return <Error error={usersError} />;
    }

    return (
        <div className="flex flex-col items-center justify-center h-screen">
            <h1 className="text-2xl font-bold mb-4">Room info</h1>
            {roomData && roomData.room ? (
                <div className="bg-white rounded-lg shadow-lg p-6 min-w-[320px] border border-gray-200 mb-6">
                    <div className="mb-2"><span className="font-semibold">ID:</span> {roomData.room.id}</div>
                    <div className="mb-2"><span className="font-semibold">Host:</span> {roomData.room.host_id}</div>
                    <div className="mb-2"><span className="font-semibold">Status:</span> {roomData.room.status}</div>
                    <div className="mb-2"><span className="font-semibold">Created at:</span> {roomData.room.created_at}</div>
                    <div className="mb-2"><span className="font-semibold">Name:</span> {roomData.room.name}</div>
                </div>
            ) : (
                <p className="text-gray-600">No room data found.</p>
            )}

            <h2 className="text-xl font-semibold mb-2">Participants</h2>
            <div className="bg-white rounded-lg shadow p-4 min-w-[320px] border border-gray-200">
                {users && users.length > 0 ? (
                    <ul>
                        {users.map((u) => (
                            <li key={u.id} className="flex items-center gap-3 py-2 border-b last:border-b-0">
                                {u.avatar_url && (
                                    <img src={u.avatar_url} alt={u.name} className="w-8 h-8 rounded-lg object-cover border" />
                                )}
                                <span className="font-medium">{u.name || u.full_name || u.id}</span>
                            </li>
                        ))}
                    </ul>
                ) : (
                    <span className="text-gray-500">No participants.</span>
                )}
            </div>
        </div>
    );
}