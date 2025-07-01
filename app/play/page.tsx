'use client';

import { useGetUser } from '@/utils/hooks/useGetUser';
import { useRouter } from 'next/navigation';
import { Loading } from '@/components/Loading';
import { useEffect } from 'react';

export default function Play() {
  const { user, loading, error } = useGetUser();
  const router = useRouter();
  useEffect(() => {
    if (!loading && !user) {
      router.push('/');
    }
  }, [user, loading, router]);

  if (loading) return <Loading />;
  if (error) return (
    <div className="flex items-center justify-center min-h-screen w-full">
      <span className="text-red-600 font-semibold text-lg">{error as string}</span>
    </div>
  );
  if (!user) return null;

  return (
    <div className="min-h-screen w-full p-8">
      <span className="block text-green-700 font-semibold text-lg mt-4">
        Welcome{user?.user_metadata?.full_name ? `, ${user.user_metadata.full_name}` : ''}! You are logged in!
      </span>
    </div>
  );
}