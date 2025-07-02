'use client';

import { useParams } from "next/navigation";
import Error from "@/components/Error";
import useGetRoom from "@/utils/hooks/useGetRoom";
import useGetUsers from "@/utils/hooks/useGetUsers";
import { Loading } from "@/components/Loading";
import { useGetUser } from "@/utils/hooks/useGetUser";
import useGetUserById from '@/utils/hooks/useGetUserById';
import { User as SupabaseUser } from '@supabase/supabase-js';

type User = SupabaseUser & {
    avatar_url?: string;
    name?: string;
    full_name?: string;
};

export default function Room() {
    const { room } = useParams();
    const { room: roomData, loading, error } = useGetRoom(room as string);
    const { users, loading: usersLoading, error: usersError } = useGetUsers(room as string);
    const { user, error: errorUser, loading: loadingError } = useGetUser()
    const hostId = roomData?.room?.host_id;
    const { user: host, loading: hostLoading, error: hostError } = useGetUserById(hostId || '') as { user: User | null, loading: boolean, error: string | null };

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
        <div className="min-h-screen p-6 bg-gray-50">
            <div className="max-w-4xl mx-auto">
                <div className="mb-8 text-center">
                    <h1 className="text-3xl font-bold text-gray-800">Room</h1>
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 grid-flow-row auto-rows-fr">
                    <div className="lg:col-span-2">
                        <div className="bg-white rounded-lg shadow-md p-6 h-full flex flex-col">
                            <h2 className="text-xl font-semibold mb-4 pb-2 border-b border-gray-200">Room information</h2>
                            {roomData && roomData.room ? (
                                <div className="space-y-4">
                                    <div className="flex flex-col">
                                        <span className="text-sm text-gray-500">Name</span>
                                        <span className="font-medium">{roomData.room.name}</span>
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="text-sm text-gray-500">Room ID</span>
                                        <span className="font-medium text-sm font-mono bg-gray-100 p-1 rounded">{roomData.room.id}</span>
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="text-sm text-gray-500">Status</span>
                                        <span className="font-medium">
                                            <span className={`inline-block w-2 h-2 rounded-full mr-2 ${
                                                roomData.room.status === 'pending' ? 'bg-yellow-400' : 
                                                roomData.room.status === 'active' ? 'bg-green-500' : 'bg-gray-400'
                                            }`}></span>
                                            {roomData.room.status}
                                        </span>
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="text-sm text-gray-500">Created</span>
                                        <span className="font-medium">{new Date(roomData.room.created_at).toLocaleString()}</span>
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="text-sm text-gray-500">Host</span>
                                        {hostLoading ? (
                                            <div className="flex items-center gap-2 py-1">
                                                <div className="animate-pulse bg-gray-200 h-10 w-10 rounded-lg"></div>
                                                <div className="animate-pulse bg-gray-200 h-5 w-24 rounded"></div>
                                            </div>
                                        ) : hostError ? (
                                            <span className="text-red-500">Error loading host</span>
                                        ) : host ? (
                                            <div className="flex items-center gap-3 py-1">
                                                {host.avatar_url ? (
                                                    <img src={host.avatar_url} alt={host.name} className="w-10 h-10 rounded-lg object-cover border border-gray-200" />
                                                ) : (
                                                    <div className="w-10 h-10 rounded-lg bg-gray-200 flex items-center justify-center text-gray-500 font-medium">
                                                        {(host.name || host.full_name || 'U').charAt(0).toUpperCase()}
                                                    </div>
                                                )}
                                                <span className="font-medium">{host.name || host.full_name || 'Unknown Host'}</span>
                                            </div>
                                        ) : (
                                            <span className="text-gray-500">Host not found</span>
                                        )}
                                    </div>
                                </div>
                            ) : (
                                <div className="py-8 text-center text-gray-500">
                                    <p>No room data found.</p>
                                </div>
                            )}
                        </div>
                    </div>
                    <div className="lg:col-span-1">
                        <div className="bg-white rounded-lg shadow-md p-6 h-full flex flex-col">
                            <h2 className="text-xl font-semibold mb-4 pb-2 border-b border-gray-200">
                                Participants
                                {users && users.length > 0 && (
                                    <span className="ml-2 px-2 py-0.5 text-sm bg-gray-100 text-gray-600 rounded-full">{users.length}</span>
                                )}
                            </h2>
                            <div className="flex-1 overflow-y-auto max-h-80">
                                {users && users.length > 0 ? (
                                    <ul className="space-y-2">
                                        {users.map((u) => (
                                            <li key={u.id} className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded-lg">
                                                {u.avatar_url ? (
                                                    <img src={u.avatar_url} alt={u.name} className="w-9 h-9 rounded-lg object-cover border border-gray-200" />
                                                ) : (
                                                    <div className="w-9 h-9 rounded-lg bg-gray-200 flex items-center justify-center text-gray-500 font-medium">
                                                        {(u.name || u.full_name || 'U').charAt(0).toUpperCase()}
                                                    </div>
                                                )}
                                                <span className="font-medium text-sm">{u.name || u.full_name || u.id}</span>
                                            </li>
                                        ))}
                                    </ul>
                                ) : (
                                    <div className="py-8 text-center text-gray-500">
                                        <p>No participants yet.</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
                <div className="mt-8 flex justify-center">
                    {user?.id === roomData.room.host_id ? (
                        <button
                            className="px-8 py-3 bg-green-600 text-white font-semibold rounded-lg shadow-sm hover:bg-green-700 transition flex items-center justify-center gap-2"
                            onClick={() => alert('clicked lol')}
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                            </svg>
                            Start Game
                        </button>
                    ) : (
                        <div className="px-6 py-4 bg-gray-100 text-gray-600 rounded-lg shadow-sm border border-gray-200">
                            <div className="flex items-center gap-2">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-yellow-500" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                                </svg>
                                <span className="font-medium">Waiting for host to start the game...</span>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
