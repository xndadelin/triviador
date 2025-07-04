"use client";

import { useState } from "react";
import { User, MapPin, ArrowLeft, Clock } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { Loading } from "@/components/Loading";
import Error from "@/components/Error";
import useGetRoom from "@/utils/hooks/useGetRoom";
import useGetUsers from "@/utils/hooks/useGetUsers";
import { useGetUser } from "@/utils/hooks/useGetUser";
import { useEffect } from "react";
import { useMapState, CountyOwner } from "@/utils/hooks/useMapState";
import Map from "@/components/Map";
import { createClient } from "@/utils/supabase/client";   

type MapStateUser = {
    user_id: string;
    counties: string[];
};

type GameMapProps = {
    users: {
        id: string;
        name: string;
        score: number;
        counties: string[];
        color?: string;
    }[];
    currentQuestion: {
        id: string;
        question: string;
        options: string[];
    } | null;
    onAnswer: (answer: string) => void;
    onNextQuestion: (countyId?: string) => void;
    onEndGame: () => void;
    attackerId: string | null;
    defenderId: string | null;
    countyOwners: Record<string, string>;
    timeLeft?: number;
    selectedCounty: string | null;
    map_state?: MapStateUser[];
};

function GameMap(props: GameMapProps) {
    const { 
        users, 
        currentQuestion, 
        onAnswer, 
        onNextQuestion, 
        onEndGame, 
        attackerId, 
        defenderId, 
        countyOwners,
        timeLeft = 15,
        selectedCounty,
        map_state = []
    } = props;
    
    const isQuestionPhase = !!currentQuestion;
    
    if (!isQuestionPhase) {
        return (
            <div className="flex-1 flex flex-col">
                <div className="p-6 flex-1 flex flex-col">
                    <div className="mb-6 bg-purple-50 p-3 rounded-lg flex items-center">
                        <div className="text-purple-700 font-semibold">
                            {users.find(u => u.id === attackerId)?.name || 'Waiting for player'}'s turn
                        </div>
                        <div className="ml-auto text-sm text-gray-600">
                            Select a territory to attack
                        </div>
                    </div>
                    <div className="flex-1 relative">
                        <Map 
                            users={users}
                            currentQuestion={null}
                            onAnswer={onAnswer}
                            onNextQuestion={onNextQuestion}
                            onEndGame={onEndGame}
                            attackerId={attackerId}
                            defenderId={defenderId}
                            countyOwners={countyOwners}
                            selectedCounty={selectedCounty}
                            map_state={map_state}
                        />
                    </div>
                </div>
            </div>
        );
    } else {
        return (
            <div className="p-6 flex-1 flex flex-col">
                <div className="mb-6 bg-purple-50 p-3 rounded-lg">
                    <div className="flex items-center justify-between">
                        <div className="text-purple-700 font-semibold">
                            Battle for: <span className="font-bold">{selectedCounty}</span>
                        </div>
                        <div className="text-sm text-red-600 font-bold">
                            Time: 00:{timeLeft.toString().padStart(2, '0')}
                        </div>
                    </div>
                    
                    <div className="mt-2 flex items-center justify-center gap-2 text-sm">
                        <span className="font-medium">
                            {users.find(u => u.id === attackerId)?.name || 'Attacker'}
                        </span>
                        <span>vs</span>
                        <span className="font-medium">
                            {users.find(u => u.id === defenderId)?.name || 'Defender'}
                        </span>
                    </div>
                </div>
                
                <div className="mb-8 text-center">
                    <h2 className="text-2xl font-bold text-gray-800 mb-4">
                        {currentQuestion.question}
                    </h2>
                    <div className="w-24 h-1 bg-purple-300 mx-auto"></div>
                </div>
                
                <div className="grid grid-cols-2 gap-4 mt-auto">
                    {currentQuestion.options.map((option, index) => (
                        <button 
                            key={index}
                            onClick={() => onAnswer(option)}
                            className="p-4 bg-white border-2 border-purple-300 rounded-lg text-lg font-medium hover:bg-purple-50 hover:border-purple-500 transition-colors"
                        >
                            {option}
                        </button>
                    ))}
                </div>
                
                <button 
                    onClick={onEndGame}
                    className="mt-8 p-2 text-sm text-gray-600 hover:text-red-600"
                >
                    End Game
                </button>
            </div>
        );
    }
}

export default function Live() {
    const { room } = useParams<{ room: string }>();
    const router = useRouter();
    
    const { room: roomData, loading: roomLoading, error: roomError } = useGetRoom(room as string);
    const { users: roomUsers, loading: usersLoading, error: usersError } = useGetUsers(room as string);
    const { user: currentUser, loading: currentUserLoading } = useGetUser();
    
    const [gameState, setGameState] = useState<{
        currentQuestion: {
            id: string;
            question: string;
            options: string[];
        } | null;
        attackerId: string | null;
        defenderId: string | null;
        countyOwners: Record<string, string>;
        timeLeft: number;
        selectedCounty: string | null;
        gameStarted: boolean;
        welcomeMessage: boolean;
        notification: {
            message: string;
            type: 'success' | 'error' | 'info';
            visible: boolean;
        };
    }>({
        currentQuestion: null,
        attackerId: null,
        defenderId: null,
        countyOwners: {},
        timeLeft: 15,
        selectedCounty: null,
        gameStarted: false,
        welcomeMessage: true,
        notification: {
            message: '',
            type: 'info',
            visible: false
        }
    });

    const [mappedUsers, setMappedUsers] = useState<Array<{
        id: string;
        name: string;
        score: number;
        counties: string[];
        color: string;
    }>>([]);
    
    useEffect(() => {
        if (roomUsers) {
            setMappedUsers(roomUsers.map(user => ({
                id: user.id,
                name: user.name || user.full_name || 'Player',
                score: Math.floor(Math.random() * 5),
                counties: [],
                color: user.color || `#${Math.floor(Math.random()*16777215).toString(16)}`
            })));
        }
    }, [roomUsers]);
    
    useEffect(() => {
        if (!roomLoading && !usersLoading && !currentUserLoading) {
            if (roomUsers && roomUsers.length > 0 && currentUser) {
                const isPlayerInRoom = roomUsers.some(user => user.id === currentUser.id);
                if (!isPlayerInRoom) {
                    router.push('/play');
                }
            }
        }
    }, [roomUsers, currentUser, roomLoading, usersLoading, currentUserLoading, router]);

    useEffect(() => {
        if (!gameState.currentQuestion) return;
        
        const timer = setInterval(() => {
            setGameState(prev => {
                if (prev.timeLeft <= 1) {
                    return {
                        ...prev,
                        currentQuestion: null,
                        timeLeft: 15
                    };
                }
                return {
                    ...prev,
                    timeLeft: prev.timeLeft - 1
                };
            });
        }, 1000);
        
        return () => clearInterval(timer);
    }, [gameState.currentQuestion]);
    const { mapState, countyOwners: realTimeOwners, playerColors, loading: mapLoading, error: mapError } = useMapState(room as string);
    
    useEffect(() => {
        if (!usersLoading && roomUsers && roomUsers.length > 0) {
            setGameState(prev => ({
                ...prev,
                attackerId: roomUsers[0]?.id || null,
                defenderId: roomUsers.length > 1 ? roomUsers[1]?.id : null,
                countyOwners: {}
            }));
        }
    }, [usersLoading, roomUsers]);
    useEffect(() => {
        if (mapState && realTimeOwners && !mapLoading && mappedUsers.length > 0) {
            const ownerMap: Record<string, string> = {};
            Object.entries(realTimeOwners).forEach(([county, info]: [string, CountyOwner]) => {
                ownerMap[county] = info.userId;
            });
            
            const userCountiesMap: Record<string, string[]> = {};
            mapState.forEach((state: MapStateUser) => {
                if (state.user_id && Array.isArray(state.counties)) {
                    const countyNames = state.counties.map(countyId => countyId);
                    userCountiesMap[state.user_id] = countyNames;
                }
            });
            
            const updatedUsers = mappedUsers.map(user => {
                const counties = userCountiesMap[user.id] || [];
                
                return {
                    ...user,
                    counties,
                    color: playerColors?.[user.id] || '#808080'
                };
            });
            
            setMappedUsers(updatedUsers);
            
            setGameState(prev => ({
                ...prev,
                countyOwners: ownerMap
            }));
        }
    }, [mapState, realTimeOwners, mapLoading, mappedUsers, playerColors]);

    const handleAnswer = async (answer: string) => {
        
        if (gameState.selectedCounty && gameState.attackerId) {
            const isCorrect = Math.random() > 0.3;
            const currentAttacker = mappedUsers.find(user => user.id === gameState.attackerId);                
            if (isCorrect) {
                    setGameState(prev => ({
                        ...prev,
                        countyOwners: {
                            ...prev.countyOwners,
                            [prev.selectedCounty as string]: prev.attackerId as string
                        },
                        currentQuestion: null,
                        timeLeft: 15,
                        notification: {
                            message: `${currentAttacker?.name} has conquered ${gameState.selectedCounty}!`,
                            type: 'success',
                            visible: true
                        }
                    }));
                    
                    setMappedUsers(prev => {
                        const newUsers = [...prev];
                        const attackerIndex = newUsers.findIndex(user => user.id === gameState.attackerId);
                        if (attackerIndex !== -1) {                                newUsers[attackerIndex] = {
                                ...newUsers[attackerIndex],
                                score: newUsers[attackerIndex].score + 1,
                                counties: [...(newUsers[attackerIndex].counties || []), gameState.selectedCounty as string]
                            };
                        }
                        return newUsers;
                    });
            } else {
                setGameState(prev => ({
                    ...prev,
                    currentQuestion: null,
                    timeLeft: 15,
                    notification: {
                        message: `${currentAttacker?.name} failed to answer correctly!`,
                        type: 'error',
                        visible: true
                    }
                }));
            }
            

            if (roomUsers && roomUsers.length > 1) {
                const currentAttackerIndex = roomUsers.findIndex(user => user.id === gameState.attackerId);
                const nextAttackerIndex = (currentAttackerIndex + 1) % roomUsers.length;
                const nextDefenderIndex = (nextAttackerIndex + 1) % roomUsers.length;
                
                setTimeout(() => {
                    setGameState(prev => ({
                        ...prev,
                        attackerId: roomUsers[nextAttackerIndex].id,
                        defenderId: roomUsers[nextDefenderIndex].id,
                        notification: {
                            message: `It's ${roomUsers[nextAttackerIndex].name || 'Next player'}'s turn!`,
                            type: 'info',
                            visible: true
                        }
                    }));
                }, 2000);
            }
            
            if (isCorrect) {
                try {
                    const supabase = createClient();
                    const { data: roomData, error: fetchError } = await supabase
                        .from("rooms")
                        .select("map_state")
                        .eq("id", room)
                        .single();
                    
                    if (fetchError) throw fetchError;

                    const currentMapState = roomData?.map_state || [];
                    const updatedMapState = [...currentMapState];

                    const attackerIndex = updatedMapState.findIndex(
                        (state: MapStateUser) => state.user_id === gameState.attackerId
                    );
                    
                    if (attackerIndex >= 0) {
                        if (!updatedMapState[attackerIndex].counties.includes(gameState.selectedCounty as string)) {
                            updatedMapState[attackerIndex].counties.push(gameState.selectedCounty as string);
                        }
                    } else {
                        updatedMapState.push({
                            user_id: gameState.attackerId as string,
                            counties: [gameState.selectedCounty as string]
                        });
                    }

                    const { error: updateError } = await supabase
                        .from("rooms")
                        .update({ map_state: updatedMapState })
                        .eq("id", room);
                    
                    if (updateError) {
                        console.error("Error updating map state:", updateError);
                    }
                } catch (error) {
                    console.error("Error in handleAnswer:", error);
                }
            }
        }
    };

    const handleNextQuestion = (selectedCountyId?: string) => {

        const countyNames: Record<string, string> = {
            'ROAB': 'Alba',
            'ROAR': 'Arad',
            'ROAG': 'Arges',
            'ROBC': 'Bacau',
            'ROBH': 'Bihor',
            'ROBN': 'Bistrita-Nasaud',
            'ROBT': 'Botosani',
            'ROBR': 'Braila',
            'ROBV': 'Brasov',
            'ROB': 'București',
            'ROBZ': 'Buzau',
            'ROCL': 'Calarasi',
            'ROCS': 'Caras-Severin',
            'ROCJ': 'Cluj',
            'ROCT': 'Constanta',
            'ROCV': 'Covasna',
            'RODB': 'Dambovita',
            'RODJ': 'Dolj',
            'ROGL': 'Galati',
            'ROGR': 'Giurgiu',
            'ROGJ': 'Gorj',
            'ROHR': 'Harghita',
            'ROHD': 'Hunedoara',
            'ROIL': 'Ialomita',
            'ROIS': 'Iasi',
            'ROIF': 'Ilfov',
            'ROMM': 'Maramures',
            'ROMH': 'Mehedinti',
            'ROMS': 'Mures',
            'RONT': 'Neamt',
            'ROOT': 'Olt',
            'ROPH': 'Prahova',
            'ROSJ': 'Salaj',
            'ROSM': 'Satu Mare',
            'ROSB': 'Sibiu',
            'ROSV': 'Suceava',
            'ROTR': 'Teleorman',
            'ROTM': 'Timis',
            'ROTL': 'Tulcea',
            'ROVL': 'Valcea',
            'ROVS': 'Vaslui',
            'ROVN': 'Vrancea'
        };

        let selectedCountyName;
        if (selectedCountyId && countyNames[selectedCountyId]) {
            selectedCountyName = countyNames[selectedCountyId];
        } else {
            const availableCounties = ['Iași', 'Suceava', 'Constanța', 'Timișoara', 'Brașov', 'Galați', 'Craiova', 'Oradea'];
            selectedCountyName = availableCounties[Math.floor(Math.random() * availableCounties.length)];
        }

        const questions = [
            {
                question: 'What is the capital of Romania?',
                options: ['Bucharest', 'Paris', 'Berlin', 'Madrid']
            },
            {
                question: 'Who wrote the novel "Ion"?',
                options: ['Liviu Rebreanu', 'Mihail Sadoveanu', 'Ion Creangă', 'George Coșbuc']
            },
            {
                question: 'In what year did Romania join the European Union?',
                options: ['2007', '2004', '2010', '2000']
            },
            {
                question: 'What is the largest river in Romania?',
                options: ['Danube', 'Olt', 'Mures', 'Siret']
            },
            {
                question: 'Which mountain range runs through Romania?',
                options: ['Carpathians', 'Alps', 'Pyrenees', 'Urals']
            }
        ];
        
        const randomQuestion = questions[Math.floor(Math.random() * questions.length)];
        
        setGameState(prev => ({
            ...prev,
            currentQuestion: {
                id: Math.random().toString(),
                question: randomQuestion.question,
                options: randomQuestion.options
            },
            selectedCounty: selectedCountyName,
            timeLeft: 15
        }));
    };

    const handleEndGame = () => {

        const winnerUser = mappedUsers.reduce((prev, current) => {
            return (prev.counties.length > current.counties.length) ? prev : current;
        }, mappedUsers[0]);

        if (confirm(`End game now? ${winnerUser?.name || 'Nobody'} is currently in the lead with ${winnerUser?.counties.length || 0} territories.`)) {

            setGameState(prev => ({
                ...prev, 
                notification: {
                    message: `Game over! ${winnerUser?.name || 'Nobody'} wins with ${winnerUser?.counties.length || 0} territories!`,
                    type: 'success',
                    visible: true
                }
            }));

            setTimeout(() => {
                router.push(`/play/${room}`);
            }, 3000);
        }
    };

    if (roomLoading || usersLoading || currentUserLoading || mapLoading) {
        return <Loading />;
    }

    if (roomError) {
        return <Error error={roomError} />;
    }

    if (usersError) {
        return <Error error={usersError} />;
    }
    
    if (mapError) {
        return <Error error={mapError} />;
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-purple-100 via-white to-yellow-100 flex flex-col">
            <div className="bg-white shadow-md p-3 flex items-center justify-between">
                <button 
                    onClick={() => router.push(`/play/${room}`)}
                    className="flex items-center text-gray-600 hover:text-purple-700"
                >
                    <ArrowLeft className="w-5 h-5 mr-1" />
                    <span>Back to room</span>
                </button>
                
                <div className="flex items-center gap-2">
                    <Clock className="w-5 h-5 text-purple-700" />
                    <span className="font-semibold text-red-600">
                        Time: 00:{gameState.timeLeft.toString().padStart(2, '0')}
                    </span>
                </div>
                
                <div className="text-lg font-bold text-purple-800">
                    {roomData?.room?.name || 'Game Room'}
                </div>
            </div>
            
            {gameState.notification.visible && (
                <div 
                    className={`mx-4 mt-4 p-3 rounded-md flex items-center justify-between ${
                        gameState.notification.type === 'success' ? 'bg-green-50 text-green-700' : 
                        gameState.notification.type === 'error' ? 'bg-red-50 text-red-700' : 
                        'bg-blue-50 text-blue-700'
                    }`}
                >
                    <span>{gameState.notification.message}</span>
                    <button 
                        onClick={() => setGameState(prev => ({
                            ...prev,
                            notification: { ...prev.notification, visible: false }
                        }))}
                        className="text-gray-400 hover:text-gray-600"
                    >
                        &times;
                    </button>
                </div>
            )}

            <div className="flex flex-1">
                <div className="w-72 bg-white shadow-md m-4 rounded-lg p-4 overflow-auto max-h-[calc(100vh-8rem)]">
                    <h3 className="font-bold text-lg mb-3 text-purple-900">Players</h3>
                    <div className="space-y-3">
                        {mappedUsers.map(user => (
                            <div 
                                key={user.id} 
                                className={`flex flex-col p-3 rounded-md border ${user.id === gameState.attackerId ? 'bg-purple-50 border-purple-300' : user.id === gameState.defenderId ? 'bg-blue-50 border-blue-300' : 'border-gray-200'}`}
                                style={{borderLeftWidth: '4px', borderLeftColor: user.color || '#808080'}}
                            >
                                <div className="flex items-center gap-2">
                                    <User className="w-8 h-8 text-gray-500 p-1 bg-gray-100 rounded-full" />
                                    <span className="font-medium">
                                        {user.name}
                                        {user.id === gameState.attackerId && ' (Attacker)'}
                                        {user.id === gameState.defenderId && ' (Defender)'}
                                    </span>
                                    
                                    <div className="ml-auto bg-purple-100 text-purple-800 text-xs font-semibold px-2 py-1 rounded-full">
                                        {user.score}
                                    </div>
                                </div>
                                
                                <div className="mt-2 ml-10">
                                    <div className="text-xs text-gray-500">Territories ({user.counties?.length || 0}):</div>
                                    <div className="flex flex-wrap gap-1 mt-1 max-h-24 overflow-y-auto">
                                        {user.counties && user.counties.length > 0 ? (
                                            user.counties.map(county => (
                                                <span 
                                                    key={county} 
                                                    className="text-xs bg-gray-100 px-1.5 py-0.5 rounded"
                                                    style={user.color ? { backgroundColor: `${user.color}30` } : {}}
                                                >
                                                    {county}
                                                </span>
                                            ))
                                        ) : (
                                            <span className="text-xs text-gray-400 italic">No territories yet</span>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="flex-1 m-4 bg-white rounded-lg shadow-md flex flex-col relative">
                    {gameState.welcomeMessage && (
                        <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center z-10">
                            <div className="bg-white p-6 rounded-lg shadow-xl max-w-md w-full">
                                <h3 className="text-2xl font-bold text-purple-800 mb-4">Welcome to Triviador!</h3>
                                <p className="mb-4">
                                    This is a map conquest game where you compete with other players to conquer territories by answering trivia questions.
                                </p>
                                <ul className="list-disc pl-5 mb-4 space-y-1">
                                    <li>Click on territories to claim them</li>
                                    <li>Answer trivia questions correctly to win territories</li>
                                    <li>The player with the most territories wins!</li>
                                </ul>
                                <button 
                                    className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 px-4 rounded-lg transition"
                                    onClick={() => setGameState(prev => ({ ...prev, welcomeMessage: false, gameStarted: true }))}
                                >
                                    Start Game
                                </button>
                            </div>
                        </div>
                    )}
                    <GameMap
                        users={mappedUsers}
                        currentQuestion={gameState.currentQuestion}
                        onAnswer={handleAnswer}
                        onNextQuestion={handleNextQuestion}
                        onEndGame={handleEndGame}
                        attackerId={gameState.attackerId}
                        defenderId={gameState.defenderId}
                        countyOwners={gameState.countyOwners}
                        timeLeft={gameState.timeLeft}
                        selectedCounty={gameState.selectedCounty}
                        map_state={mapState}
                    />
                </div>
            </div>
        </div>
    );
}