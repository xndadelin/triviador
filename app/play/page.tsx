'use client';

import { useGetUser } from '@/utils/hooks/useGetUser';
import { useRouter } from 'next/navigation';
import { Loading } from '@/components/Loading';
import { useEffect, useState, useRef } from 'react';
import { LogOut, User, PlusCircle, KeyRound, Trophy } from 'lucide-react';

export default function Play() {
  const { user, loading, error } = useGetUser();
  const router = useRouter();
  const [showMenu, setShowMenu] = useState(false);
  const [logoutLoading, setLogoutLoading] = useState(false);
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

  return (
    <div className="min-h-screen w-full p-8 flex flex-col items-center justify-start relative bg-gradient-to-br from-purple-100 via-white to-yellow-100">
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
          className="w-full h-12 px-6 py-2 rounded-lg bg-[#611f69] text-white font-semibold shadow hover:bg-[#4a154b] flex items-center justify-center cursor-pointer text-base gap-2 group"
        >
          <PlusCircle className="w-6 h-6 text-white group-hover:scale-110 transition-transform" />
          Create room
        </button>
        <button
          className="w-full h-12 px-6 py-2 rounded-lg bg-white text-black border border-gray-300 font-semibold shadow hover:bg-gray-100 flex items-center justify-center cursor-pointer text-base gap-2 group"
        >
          <KeyRound className="w-6 h-6 text-[#611f69] group-hover:scale-110 transition-transform" />
          Join room
        </button>
      </div>
    </div>
  );
}