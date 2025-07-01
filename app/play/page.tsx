'use client';

import { useGetUser } from '@/utils/hooks/useGetUser';
import { useRouter } from 'next/navigation';
import { Loading } from '@/components/Loading';
import { useEffect, useState, useRef } from 'react';
import { LogOut, User, PlusCircle, KeyRound, Trophy } from 'lucide-react';
import JoinRoom from '@/components/JoinRoom';
import useGetRooms from '@/utils/hooks/useGetRooms';

export default function Play() {
  const { user, loading, error } = useGetUser();
  const { rooms, error: roomsError, loading: roomsLoading } = useGetRooms();
  const router = useRouter();
  const [showMenu, setShowMenu] = useState(false);
  const [logoutLoading, setLogoutLoading] = useState(false);
  const [createLoading, setCreateLoading] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    if (!loading && !user) {
      router.push('/');
    }
  }, [user, loading, router]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !(menuRef.current as any).contains(event.target)) {
        setShowMenu(false);
      }
    }
    if (showMenu) {
      document.addEventListener('mousedown', handleClickOutside);
    } else {
      document.removeEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showMenu]);

  if (loading || logoutLoading) return <Loading />;
  if (error) return (
    <div className="text-red-600 font-semibold p-4">
      {typeof error === 'string' ? error : 'An unexpected error occurred.'}
    </div>
  );
  if (!user) return null;

  const handleLogout = async () => {
    setLogoutLoading(true);
    try {
      const supabase = await import('@/utils/supabase/client').then(mod => mod.createClient());
      await supabase.auth.signOut();
      router.push('/');
    } catch (e) {
      console.error('oups, error during logout:', e);
    } finally {
      setLogoutLoading(false);
    }
  };

  const handleCreateRoom = async () => {
    setCreateLoading(true);
    try {
      const res = await fetch('/api/rooms', { method: 'POST' });
      const data = await res.json();
      if (data.room.id) {
        router.push(`/play/${data.room.id}`);
      } else {
        alert(data.error);
      }
    } catch (e) {
      alert('Unexpected error creating room');
    } finally {
      setCreateLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full p-8 flex flex-col items-center justify-start relative">
      <div className="absolute top-6 right-8 z-20">
        <button
          className=""
          onClick={() => setShowMenu((v) => !v)}
        >
          {user?.user_metadata?.avatar_url ? (
            <img
              src={user.user_metadata.avatar_url}
              alt="Profile"
              className="w-12 h-12 rounded-lg object-cover border-2 border-purple-700 shadow-lg"
            />
          ) : (
            <User className="w-10 h-10 text-[#611f69] border-2 border-purple-700 rounded-lg bg-white shadow-lg p-1" />
          )}
        </button>
        {showMenu && (
          <div ref={menuRef} className="absolute right-0 mt-2 w-44 bg-white rounded-xl shadow-2xl border border-gray-200 py-2 z-30">
            <button
              className="flex items-center gap-2 w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition cursor-pointer"
              onClick={handleLogout}
            >
              <LogOut className="w-4 h-4" />
              Logout
            </button>
          </div>
        )}
      </div>

      <div className="flex flex-col items-center mt-8 mb-8">
        <Trophy className="w-10 h-10 text-yellow-500 mb-2" />
        <span className="block text-purple-800 font-extrabold text-2xl drop-shadow mb-1">
          Welcome{user?.user_metadata?.full_name ? `, ${user.user_metadata.full_name}` : ''}!
        </span>
        <span className="text-gray-600 text-base font-medium">You are logged in!</span>
      </div>

      <div className="flex flex-col gap-4 w-full max-w-xs">
        <button
          className="w-full h-12 px-6 py-2 rounded-lg bg-[#611f69] text-white font-semibold shadow hover:bg-[#4a154b] flex items-center justify-center cursor-pointer text-base gap-2 group disabled:opacity-60"
          onClick={handleCreateRoom}
          disabled={createLoading}
        >
          <PlusCircle className="w-6 h-6 text-white group-hover:scale-110 transition-transform" />
          {createLoading ? 'Creating...' : 'Create room'}
        </button>
        <JoinRoom user_id={user.id} />
      </div>

      <div className="mt-8 mx-auto text-center max-w-[700px]">
        <h2 className="text-2xl font-bold mb-6 text-purple-800">Your rooms</h2>
        {roomsLoading ? (
          <div className="text-gray-500 italic">Loading your rooms...</div>
        ) : roomsError ? (
          <div className="text-red-600 font-medium">{roomsError}</div>
        ) : rooms && rooms.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {rooms.map((room: any) => (
              <div key={room.id} className="p-6 bg-white rounded-lg shadow-md border border-gray-300">
                <h3 className="text-lg font-semibold text-purple-700">{room.name}</h3>
                <p className="text-sm text-gray-500">Room ID: {room.id}</p>
                <button
                  onClick={() => router.push(`/play/${room.id}`)}
                  className="mt-4 px-4 py-2 bg-purple-600 text-white rounded-lg shadow hover:bg-purple-700 transition cursor-pointer"
                >
                  Go to room
                </button>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-gray-500 italic">You have no rooms yet. Create one to get started!</div>
        )}
      </div>
    </div>
  );
}