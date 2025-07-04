import { useEffect, useState } from 'react';
import { createClient } from '@/utils/supabase/client';

export type MapStateUser = {
  user_id: string;
  counties: string[];
};

export type CountyOwner = {
  userId: string;
  color: string;
};

export const useMapState = (roomId: string) => {
  const [mapState, setMapState] = useState<MapStateUser[]>([]);
  const [countyOwners, setCountyOwners] = useState<Record<string, CountyOwner>>({});
  const [playerColors, setPlayerColors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!roomId) {
      setError("room id is required");
      setLoading(false);
      return;
    }

    const supabase = createClient();
    
    const fetchInitialData = async () => {
      try {
        const { data: roomData, error: roomError } = await supabase
          .from("rooms")
          .select("map_state")
          .eq("id", roomId)
          .single();

        if (roomError) throw roomError;

        const { data: roomPlayers, error: playersError } = await supabase
          .from("room_players")
          .select("user_id, color")
          .eq("room_id", roomId);

        if (playersError) throw playersError;

        processMapData(roomData.map_state || [], roomPlayers || []);
        setLoading(false);
      } catch (error: any) {
        console.error("error fetching map data:", error);
        setError(error.message);
        setLoading(false);
      }
    };

    const processMapData = (
      mapStateData: MapStateUser[], 
      players: { user_id: string; color: string }[]
    ) => {
      const owners: Record<string, CountyOwner> = {};
      const colors: Record<string, string> = {};
      
      players.forEach(player => {
        colors[player.user_id] = player.color;
      });
      
      mapStateData.forEach(userState => {
        const userColor = players.find(player => 
          player.user_id === userState.user_id
        )?.color || "#808080";
        
        userState.counties.forEach(county => {
          owners[county] = {
            userId: userState.user_id,
            color: userColor
          };
        });
      });
      
      setMapState(mapStateData);
      setCountyOwners(owners);
      setPlayerColors(colors);
    };

    fetchInitialData();

    const roomSubscription = supabase
      .channel('rooms_changes')
      .on('postgres_changes', 
        { 
          event: 'UPDATE', 
          schema: 'public', 
          table: 'rooms',
          filter: `id=eq.${roomId}`
        }, 
        (payload: { new: { map_state: MapStateUser[] } }) => {
          if (payload.new && payload.new.map_state) {
            const newMapState = payload.new.map_state;
            
            supabase
              .from("room_players")
              .select("user_id, color")
              .eq("room_id", roomId)
              .then(({ data }: { data: { user_id: string, color: string }[] | null }) => {
                if (data) {
                  processMapData(newMapState, data);
                }
              });
          }
        }
      )
      .subscribe();
      
    const playersSubscription = supabase
      .channel('room_players_changes')
      .on('postgres_changes', 
        { 
          event: '*', 
          schema: 'public', 
          table: 'room_players',
          filter: `room_id=eq.${roomId}`
        }, 
        () => {
          supabase
            .from("rooms")
            .select("map_state")
            .eq("id", roomId)
            .single()
            .then(({ data: roomData }: { data: { map_state: MapStateUser[] } | null }) => {
              if (roomData) {
                supabase
                  .from("room_players")
                  .select("user_id, color")
                  .eq("room_id", roomId)
                  .then(({ data: playerData }: { data: { user_id: string, color: string }[] | null }) => {
                    if (playerData) {
                      processMapData(roomData.map_state || [], playerData);
                    }
                  });
              }
            });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(roomSubscription);
      supabase.removeChannel(playersSubscription);
    };
  }, [roomId]);

  return { mapState, countyOwners, playerColors, loading, error };
}
