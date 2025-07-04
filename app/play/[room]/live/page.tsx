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
    onNextQuestion: (countyId?: string) => void;
    onEndGame: () => void;
    attackerId: string | null;
    defenderId: string | null;
    countyOwners: Record<string, string>;
    timeLeft?: number;
    selectedCounty: string | null;
    map_state?: MapStateUser[];
    currentUser?: {
        id: string;
        name?: string;
    } | null;
};

function GameMap(props: GameMapProps) {
    const { 
        users, 
        onNextQuestion, 
        onEndGame, 
        attackerId, 
        defenderId, 
        countyOwners,
        selectedCounty,
        map_state = [],
        currentUser
    } = props;
    
    return (
        <div className="h-full w-full flex justify-center items-center">                <Map 
                users={users}
                currentQuestion={null}
                onNextQuestion={onNextQuestion}
                onEndGame={onEndGame}
                attackerId={attackerId}
                defenderId={defenderId}
                countyOwners={countyOwners}
                selectedCounty={selectedCounty}
                map_state={map_state}
                currentUser={currentUser}
            />
            
            {!props.currentQuestion && attackerId && (
                <div className="absolute top-10 left-1/2 transform -translate-x-1/2 bg-purple-50 p-1.5 px-2 rounded-lg flex items-center shadow-sm text-sm">
                    <div className="text-purple-700 font-semibold">
                        {users.find(u => u.id === attackerId)?.name || 'Waiting for player'}'s turn
                    </div>
                    <div className="ml-2 text-xs text-gray-600">
                        {props.currentUser && props.currentUser.id === attackerId 
                            ? 'Select a territory to attack' 
                            : 'Waiting for player to select a territory'}
                    </div>
                </div>
            )}
        </div>
    );
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
        showLeaderboard: boolean;
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
        showLeaderboard: false,
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
        if (!gameState.selectedCounty || !gameState.attackerId) {
            return;
        }
        
        if (currentUser && gameState.attackerId !== currentUser.id) {
            setGameState(prev => ({
                ...prev,
                notification: {
                    message: "It's not your turn!",
                    type: 'error',
                    visible: true
                }
            }));
            return;
        }
        
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
                if (attackerIndex !== -1) {
                    newUsers[attackerIndex] = {
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
    };

    const handleNextQuestion = (selectedCountyId?: string) => {
        const countyNames: Record<string, string> = {
            'ROAB': 'Alba',
            'ROAR': 'Arad',
            'ROAG': 'Arges',
            'ROBC': 'Bacau',
            'ROBH': 'Bihor',
            'ROBN': 'Bistrita-nasaud',
            'ROBT': 'Botosani',
            'ROBR': 'Braila',
            'ROBV': 'Brasov',
            'ROB': 'Bucharest',
            'ROBZ': 'Buzau',
            'ROCL': 'Calarasi',
            'ROCS': 'Caras-severin',
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
            'ROSM': 'Satu mare',
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
            const availableCountyCodes = Object.keys(countyNames);
            const randomCountyCode = availableCountyCodes[Math.floor(Math.random() * availableCountyCodes.length)];
            selectedCountyName = countyNames[randomCountyCode];
        }

        const questions = [
            {
                question: 'What is the capital of Romania?',
                options: ['Bucharest', 'Paris', 'Berlin', 'Madrid']
            },
            {
                question: 'Who wrote the novel "Ion"?',
                options: ['Liviu rebreanu', 'Mihail sadoveanu', 'Ion creangă', 'George coșbuc']
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
                notification: {                        message: `Game over! ${winnerUser?.name || 'Nobody'} wins with ${winnerUser?.counties.length || 0} territories!`,
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
        <div className="min-h-screen bg-gradient-to-br from-purple-100 via-white to-yellow-100">
            <div className="fixed inset-0 z-0">
                <GameMap
                    users={mappedUsers}
                    currentQuestion={null}
                    onNextQuestion={handleNextQuestion}
                    onEndGame={handleEndGame}
                    attackerId={gameState.attackerId}
                    defenderId={gameState.defenderId}
                    countyOwners={gameState.countyOwners}
                    timeLeft={gameState.timeLeft}
                    selectedCounty={gameState.selectedCounty}
                    map_state={mapState}
                    currentUser={currentUser}
                />
            </div>

            <div className="fixed top-0 left-0 right-0 bg-white bg-opacity-90 shadow-sm p-1.5 flex items-center justify-between z-10 text-sm">
                <button 
                    onClick={() => router.push(`/play/${room}`)}
                    className="flex items-center text-gray-600 hover:text-purple-700"
                >
                    <ArrowLeft className="w-4 h-4 mr-0.5" />
                    <span>Back</span>
                </button>
                
                <div className="text-base font-bold text-purple-800">
                    {roomData?.room?.name || 'Game room'}
                </div>
                
                <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1">
                        <Clock className="w-4 h-4 text-purple-700" />
                        <span className="font-semibold text-red-600">
                            {gameState.timeLeft.toString().padStart(2, '0')}s
                        </span>
                    </div>
                    <button 
                        onClick={() => setGameState(prev => ({ ...prev, showLeaderboard: !prev.showLeaderboard }))}
                        className="bg-purple-100 hover:bg-purple-200 text-purple-800 py-1 px-1.5 rounded-md flex items-center gap-1 text-xs"
                    >
                        <User className="w-3 h-3" />
                        <span>Players</span>
                    </button>
                </div>
            </div>
            
            {gameState.notification.visible && (
                <div 
                    className={`fixed top-10 left-1/2 transform -translate-x-1/2 p-2 text-sm rounded-md flex items-center justify-between shadow-lg z-20 max-w-md w-full ${
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
                        className="text-gray-400 hover:text-gray-600 ml-1"
                    >
                        &times;
                    </button>
                </div>
            )}

            {gameState.showLeaderboard && (
                <div className="fixed inset-0 bg-black bg-opacity-30 flex items-start justify-end z-30" onClick={() => setGameState(prev => ({ ...prev, showLeaderboard: false }))}>
                    <div className="w-72 bg-white shadow-xl h-screen overflow-auto p-3 pt-10" onClick={e => e.stopPropagation()}>
                        <div className="flex justify-between items-center mb-3 sticky top-0 bg-white pt-1 pb-2 border-b">
                            <h3 className="font-bold text-base text-purple-900">Players</h3>
                            <button 
                                onClick={() => setGameState(prev => ({ ...prev, showLeaderboard: false }))}
                                className="text-gray-500 hover:text-gray-700"
                            >
                                &times;
                            </button>
                        </div>
                        <div className="space-y-2 text-sm">
                            {mappedUsers.map(user => (
                                <div 
                                    key={user.id} 
                                    className={`flex flex-col p-2 rounded-md border ${user.id === gameState.attackerId ? 'bg-purple-50 border-purple-300' : user.id === gameState.defenderId ? 'bg-blue-50 border-blue-300' : 'border-gray-200'}`}
                                    style={{borderLeftWidth: '3px', borderLeftColor: user.color || '#808080'}}
                                >
                                    <div className="flex items-center gap-1.5">
                                        <User className="w-6 h-6 text-gray-500 p-1 bg-gray-100 rounded-full" />
                                        <span className="font-medium text-xs">
                                            {user.name}
                                            {user.id === gameState.attackerId && ' (Attacker)'}
                                            {user.id === gameState.defenderId && ' (Defender)'}
                                        </span>
                                        
                                        <div className="ml-auto bg-purple-100 text-purple-800 text-xs font-semibold px-1.5 py-0.5 rounded-full">
                                            {user.score}
                                        </div>
                                    </div>
                                    
                                    <div className="mt-1 ml-7">
                                        <div className="text-xs text-gray-500">Territories ({user.counties?.length || 0}):</div>
                                        <div className="flex flex-wrap gap-1 mt-0.5 max-h-16 overflow-y-auto">
                                            {user.counties && user.counties.length > 0 ? (
                                                user.counties.map(county => (
                                                    <span 
                                                        key={county} 
                                                        className="text-xs bg-gray-100 px-1 py-0 rounded"
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
                </div>
            )}

            {gameState.currentQuestion && (
                <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-40">
                    <div className="bg-white rounded-lg shadow-xl p-4 max-w-xl w-full mx-4 transform transition-all">
                        <div className="mb-3 bg-purple-50 p-2 rounded-md">
                            <div className="flex items-center justify-between">
                                <div className="text-purple-700 font-semibold text-sm">
                                    Battle for {gameState.selectedCounty && <span className="font-bold">{gameState.selectedCounty}</span>}
                                </div>
                                <div className="text-xs text-red-600 font-bold">
                                    Time: {gameState.timeLeft.toString().padStart(2, '0')}s
                                </div>
                            </div>
                            
                            <div className="mt-1 flex items-center justify-center gap-1 text-xs">
                                <span className="font-medium">
                                    {mappedUsers.find(u => u.id === gameState.attackerId)?.name || 'Attacker'}
                                </span>
                                <span>vs</span>
                                <span className="font-medium">
                                    {mappedUsers.find(u => u.id === gameState.defenderId)?.name || 'Defender'}
                                </span>
                            </div>
                        </div>
                        
                        <div className="mb-4 text-center">
                            <h2 className="text-lg font-bold text-gray-800 mb-2">
                                {gameState.currentQuestion.question}
                            </h2>
                            <div className="w-16 h-0.5 bg-purple-300 mx-auto"></div>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mt-auto">
                            {gameState.currentQuestion.options.map((option, index) => (
                                <button 
                                    key={index}
                                    onClick={() => handleAnswer(option)}
                                    disabled={!!currentUser && gameState.attackerId !== currentUser.id}
                                    className={`p-2 border rounded-md text-base font-medium transition-colors ${
                                        currentUser && gameState.attackerId !== currentUser.id
                                        ? 'bg-gray-100 border-gray-300 text-gray-500 cursor-not-allowed'
                                        : 'bg-white border-purple-300 hover:bg-purple-50 hover:border-purple-500'
                                    }`}
                                >
                                    {option}
                                    {currentUser && gameState.attackerId !== currentUser.id && index === 0 && (
                                        <span className="block text-xs mt-1 text-red-500">
                                            (Only {mappedUsers.find(u => u.id === gameState.attackerId)?.name} can answer)
                                        </span>
                                    )}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {gameState.welcomeMessage && (
                <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50">
                    <div className="bg-white p-4 rounded-md shadow-lg max-w-sm w-full mx-4">
                        <h3 className="text-xl font-bold text-purple-800 mb-3">Welcome to Triviador!</h3>
                        <p className="mb-3 text-sm">
                            This is a map conquest game where you compete with other players to conquer territories by answering trivia questions.
                        </p>
                        <ul className="list-disc pl-5 mb-3 space-y-0.5 text-sm">
                            <li>Click on territories to claim them</li>
                            <li>Answer trivia questions correctly to win territories</li>
                            <li>The player with the most territories wins!</li>
                        </ul>
                        <button 
                            className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded-md text-sm transition"
                            onClick={() => setGameState(prev => ({ ...prev, welcomeMessage: false, gameStarted: true }))}
                        >
                            Start game
                        </button>
                    </div>
                </div>
            )}

            {currentUser && roomData?.owner_id === currentUser.id && (
                <button 
                    onClick={handleEndGame}
                    className="fixed bottom-2 right-2 bg-white hover:bg-red-50 text-red-600 font-medium px-2 py-1 text-xs rounded-md shadow-sm z-10 border border-red-200 opacity-80 hover:opacity-100"
                >
                    End game
                </button>
            )}
        </div>
    );
}