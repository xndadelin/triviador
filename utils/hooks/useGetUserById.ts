import { createClient } from "@/utils/supabase/client";
import { useEffect, useState } from "react"; 
import { User } from "@supabase/supabase-js";

function useGetUserById(userId: string) {
    const [user, setUser] = useState<User | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState<Boolean>(false);

    useEffect(() => {
        const fetchUser = async () => {
            setLoading(true);
            try {
                const supabase = createClient();
                const { data, error } = await supabase
                    .from("users")
                    .select("*")
                    .eq("id", userId)
                    .single();

                if (error) throw error;
                setUser(data as User);
            } catch (err) {
                setError(err instanceof Error ? err.message : "Unknown error");
            } finally {
                setLoading(false);
            }
        };

        if (userId) {
            fetchUser();
        }
    }, [userId]);

    return { user, error, loading };
}

export default useGetUserById;