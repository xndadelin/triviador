"use client";

import { useEffect, useState } from "react";
import { createClient } from "../supabase/client";
import type { User } from "@supabase/supabase-js";

export function useGetUser() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUser = async () => {
      const supabase = await createClient();
      const { data: { user }, error } = await supabase.auth.getUser();
      if (error) {
        setUser(null);
        setError(error.message);
      } else {
        setUser(user);
      }
      setLoading(false);
    };
    fetchUser();
  }, []);

  return { user, loading, error };
}