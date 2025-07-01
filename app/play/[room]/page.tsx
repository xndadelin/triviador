'use client';

import { useParams } from "next/navigation";
import Error from "@/components/Error";
import useGetRoom from "@/utils/hooks/useGetRoom";
import { Loading } from "@/components/Loading";

export default function Room() {
    const { room } = useParams();
    const { room: roomData, loading, error } = useGetRoom(room as string);
    if (loading) {
        return <Loading />;
    }
    if (error) {
        return <Error error={error} />;
    }

    return (
        <div className="flex flex-col items-center justify-center h-screen">
            <h1 className="text-2xl font-bold mb-4">Room info</h1>
            {roomData && roomData.room ? (
                <div className="bg-white rounded-lg shadow-lg p-6 min-w-[320px] border border-gray-200">
                    <div className="mb-2"><span className="font-semibold">ID:</span> {roomData.room.id}</div>
                    <div className="mb-2"><span className="font-semibold">Host:</span> {roomData.room.host_id}</div>
                    <div className="mb-2"><span className="font-semibold">Status:</span> {roomData.room.status}</div>
                    <div className="mb-2"><span className="font-semibold">Created at:</span> {roomData.room.created_at}</div>
                    <div className="mb-2"><span className="font-semibold">Name:</span> {roomData.room.name}</div>
                </div>
            ) : (
                <p className="text-gray-600">No room data found.</p>
            )}
        </div>
    );
}