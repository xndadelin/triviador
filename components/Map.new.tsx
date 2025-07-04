"use client"

import { useState } from 'react';

type MapProps = {
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
    onNextQuestion: () => void;
    onEndGame: () => void;
    attackerId: string | null;
    defenderId: string | null;
    countyOwners?: Record<string, string>;
    selectedCounty?: string | null;
};

export default function Map(props: MapProps) {
    const { 
        users,
        currentQuestion,
        onAnswer,
        onNextQuestion,
        onEndGame,
        attackerId,
        defenderId,
        countyOwners = {},
        selectedCounty
    } = props;
    
    const [tooltip, setTooltip] = useState<{ visible: boolean, x: number, y: number, name: string }>({ 
        visible: false, 
        x: 0, 
        y: 0, 
        name: '' 
    });
    const [activeCounty, setActiveCounty] = useState<string | null>(null);
    
    const handleMouseOver = (e: React.MouseEvent<SVGElement | SVGPathElement | SVGCircleElement>, name: string) => {
        setTooltip({
            visible: true,
            x: e.clientX,
            y: e.clientY,
            name,
        });

        const target = e.currentTarget;
        if (target.id) {
            setActiveCounty(target.id);
        }
    };

    const handleMouseOut = () => {
        setTooltip(t => ({ ...t, visible: false }));
        setActiveCounty(null);
    };
    
    const handleCountyClick = (countyId: string, countyName: string) => {
        if (onNextQuestion) {
            setActiveCounty(countyId);
            onNextQuestion();
        }
    };

    const getCountyFill = (countyId: string) => {
        // Default color
        const defaultColor = "#6f9c76";
        // Hover state color
        const hoverColor = "#4a6b51";
        
        // If county is active/hovered
        if (activeCounty === countyId) {
            return hoverColor;
        }
        
        // If county is owned by a player
        if (countyOwners[countyId]) {
            const ownerId = countyOwners[countyId];
            const owner = users.find(u => u.id === ownerId);
            return owner?.color || defaultColor;
        }
        
        return defaultColor;
    };

    return (
        <div className="relative flex-1">
            {tooltip.visible && (
                <div
                    className="pointer-events-none fixed z-50 px-3 py-2 bg-black bg-opacity-80 text-white font-medium text-sm rounded shadow-xl border border-gray-700"
                    style={{
                        left: `${tooltip.x + 15}px`,
                        top: `${tooltip.y - 15}px`,
                        transform: 'translate(0, -100%)'
                    }}
                >
                    {tooltip.name}
                </div>
            )}
            <svg
                className="w-full h-full"
                fill="#6f9c76"
                height="704"
                stroke="#ffffff"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={0.5}
                version="1.2"
                viewBox="0 0 1000 704"
                width="1000"
                xmlns="http://www.w3.org/2000/svg"
            >
                <g id="features">
                    {/* Romania counties - just a few examples here */}
                    <path
                        d="M357.3 75.7l1.5 5.3 4.5 6.5 1 1.1 1.3 1.1 3.3 2.1 1.2 1.2 1 1.8-0.1 1.6-0.8 1.6-13.6 10.4-2.4 1.2-2.2 0.4-1.7-0.1-1.6-0.4-1.5-0.8-3.7-1.1-6.9-0.1-1.5 0.7-1.1 1.2-0.5 2 0.2 1.2 0.6 1 1.1 0.7 6.5 1.8 1.5 0.9 1.1 1 0.7 1.2 0.2 1.9-0.3 1.7-1.2 2.7-0.7 1.8-1.6 3.6-2.1 2.6-1.7 2.5-1.5 1.7-1.8 1-1.6 0-1.5-0.6-4.4-2.9-1.1-1.1-1.6-2-0.8-0.5-0.8 0-1 0.6-5.6 7.2-0.8 1.3-0.5 1.6-0.4 1.5-0.4 1.2-0.5 1-0.8 1-0.9 0.8-3.5 2.4-0.8 0.8-0.3 0.9 0.2 1.1 1.3 1.1 1.7 0.9 8.8 1.7 1.1 2 0.8 1.9 0.2 1.1-0.2 1-0.5 0.9-3.7 3.2-0.6 0.8-0.5 1-0.4 0.6-0.5 0.3-1.2-0.8-1.6-1.9-1.1-0.5-3.9-1.1-1.4-0.8-2.3-2.3-1.4-0.8-10.5-3-1.9 0-2.7 0.7-12.6 6.1-4.1 3.4-0.9-2.5-0.7-3.6-0.9-1.7-1.1-1-2.9-1.6-1.6-1.4-1.3-0.9-1-0.3-1 0.3-2.3 1.3-0.9 0.2-1.4-0.3-0.9 0-0.9 0-0.8 0.3-1 0.2-1.6-0.3-0.8-0.7-0.6-1.1-1.1-3-0.8-1.7-2.8-4.2-1.5-2.9-1.4-2-4-2.9-1.1-1.2-0.8-1.3-1.2-2.8-2-3.1-0.4-0.7 0.1-1 0.1-1 0.3-1 2.4-3.4 0.3-1.2 0.3-2.6 0.4-1.1 0.7-0.9 1.6-1.2 0.7-0.7 2.1-3.2 1.1-1.1 1.8-1 1.7-0.6 1.2-0.2 4.5 0.7 1.4-0.1 1.2-0.5 1.1-1.1 1.6-5.6 3-0.7 7.1 3.7 3.3 0.6 3.7-0.5 3.5-1.6 2.8-2.4 2.4-3.2 1.1-0.9 2-0.9 2.1-0.2 0.5-0.4 0.9-1.6-0.2-1-0.5-1-0.1-1.2 1.1-1.9 1.5-1.1 3.9-1.5 1.5-1.4 2.5-4.5 1.5-1.9 2-0.6 1.5-1 0 0.1 0.1 0 0-0.1 0.1 0 0-0.1 0.1-0.2 0 0.1 0 0.1 0 0.1 0 0.1 0.1 0.1 0.1 0 0.1 0 0-0.1-0.1 0 0-0.1-0.1 0 0-0.1 0.1 0 0.1 0 0 0.1 0.1 0 0-0.1-0.1 0 0-0.1 0.1 0 0.1 0 0.1 0 0-0.1 0.1 0 0 0.1 0.1 0 0 0.1 0.1 0 0.1 0 0.1 0 0.1 0 0.2-0.1 0-0.1 0.1 0 0.2-0.1 0-0.1 0.1 0 0-0.1 0-0.1 0.1 0 0-0.1 0.1 0 0.1 0 0.1 0 0.1 0 0.1 0 0-0.1 0-0.1 0-0.1 0.1 0 0.1 0 0-0.1 0.1 0 0.2-0.1 0.1 0-0.1 0 0-0.1 0-0.1-0.1 0 0 0.1-0.1-0.1-0.1-0.1 0-0.1 0-0.1-0.1-0.1 0-0.1 0-0.1 0-0.1 0-0.1 0-0.1 0-0.1 0-0.1-0.1-0.2 0-0.1 0-0.1 0-0.1-0.1-0.1 0-0.1 0-0.1 0-0.1-0.1 0 0-0.1 0-0.1 0-0.1 0-0.1 0-0.2 0-0.2 0-0.1 0-0.3-0.1-0.1 0-0.1 0-0.1-0.1-0.2 0-0.1 0-0.1-0.1-0.1 0-0.1-0.1-0.1 0-0.1 0-0.1-0.1 0-0.1 0-0.1 0-0.1 0-0.1 0-0.1 0-0.1 0 0-0.1-0.1-0.1-0.1 0 0-0.1-0.1 0 0-0.1-0.1 0-0.1 0 0-0.1 0.1-0.3 1.5-0.1 1.7 0.8 1.5 1 1.5 1 1.5 0.4 1.6-0.2 3.3-2.6 0.2-0.1 0.1-0.1 0.7-0.5 0.4-0.1 0.5 0 0.3 0.1 0.5 0.4 0.1 0 0.1 0 0.1 0 0.2 0 0.1-0.1 0.1 0 0-0.1 0.1-0.1 0-0.1 0.1 0 0-0.1 0-0.2 0-0.1 0.1-0.1 0-0.1 0.1-0.3 0.1-0.1 0.1-0.1 0.1-0.1-0.7-0.1 0-0.1-0.1-0.3 0.3-0.2 0-0.1 0-0.1 0.3-0.1 0.2-0.1 0.1-0.1 0.3-0.2 0-0.2 0.1-0.3 0.3-0.2 0.1-0.3 0.2-0.4 0-0.4-0.2-0.1-0.1-0.1-0.1 0-0.2-0.1-0.2-0.1-0.2-0.4-0.1-0.1 0.4-0.3 0.3-0.2 0.5-0.5 0.2-0.3 0-0.1-0.1-0.2 0-0.1-0.2-0.2 0-0.2 0.3-0.4-0.2 0-0.2-0.2-0.1 0 0-0.3-0.1 0-0.1-0.1 0.1-0.1 0.1 0 0-0.1 0.1 0 0.1 0 0-0.1 0.1 0 0-0.1 0.1-0.1 0.2 0 0.1-0.3 0.3-0.7 0.3 0.1 0.3-0.2-0.2-0.2 0.1-0.2 0.1-0.2-0.1-0.1-0.3-0.2-0.5-0.4 0-0.1 0.1 0 0.1-0.1 0.2 0 0-0.1-0.1 0 0.1-0.1 0-0.1 0-0.1 0.4-0.1 0.4-0.2 0.1 0 0.2-0.4 0.1-0.1 0.5 0 0.1 0.2 0.2 0 0.1-0.4 0.2-0.1 1.9 0.3 6.6 2.3 1.7 1.3 4 4.7 4.6 3.9 2.1 2.6 0.7 0.3 0.7 0.1 0.7-0.1 0.8-0.3 0.1-0.1 0.2 0 0.1 0 0.2 0.1 6.2 3.1 2-0.1 0.1-0.1 0.1 0.1 0.3 0.1z"
                        id="ROSM"
                        name="Satu Mare"
                        fill={getCountyFill('ROSM')}
                        onMouseOver={(e) => handleMouseOver(e, 'Satu Mare')}
                        onMouseOut={handleMouseOut}
                        onClick={() => handleCountyClick('ROSM', 'Satu Mare')}
                    />
                    <path
                        d="M617.7 571.5l-4.6-1.4-0.7 2 3 7.4-2.6 2.3-4.6-6.1-5.3-1.2-6.3-6.8 0-4.3 6.3-0.6 0-4.2-5-2.2 4.6-8.1 6.4-2.4 0.9 9.1 7.5 1.8-2.3 6.8 4.2 3.7-1.5 4.2z"
                        id="ROB"
                        name="Bucharest"
                        fill={getCountyFill('ROB')}
                        onMouseOver={(e) => handleMouseOver(e, 'Bucharest')}
                        onMouseOut={handleMouseOut}
                        onClick={() => handleCountyClick('ROB', 'Bucharest')}
                    />
                    <path
                        d="M793.4 578l-14.6-4.8-8.8-3.7-3.9-2.7-2.1-2.3-1.4-1.3-1.3-0.6-5.3-1.2-2.8-1.4-13.4-2.5-2.9-0.1-2.4 0.3-2.8 1.1-1.7 0.5-17.1-0.4-5.6 1.1-2.9 0-2.3-0.5-7.1-3-2.2-0.5-1.9-0.1-5.5 1-1.8-0.4-2.9-1.7-1.1-0.3-1.5 0.1-1.4 0.2-2.5 0.1-1.8-0.6-1.6-1-3.1-3.1-0.8-0.3-0.9 0.2-0.7 0.6-1.5 1.9-0.8 0.7-0.9 0.6-2.3 0.8-1.6 0.2-1.4-0.2-1.2-0.4-3.1-2.3-1.3-0.7-1.4-0.3-1.5 0.2-7.7 4.1-2.2-1.8-3.1-1.6-0.8-1.1-0.3-1.1 0.2-1.2 0.3-1.1 0.5-1.1 0.6-1 0.8-0.9 3.8-2.6 0.6-0.8 0.4-1.1-0.2-0.9-0.9-1-5.9-3.3-0.9-1.2-0.3-1.2 0-1.1-0.3-1-0.7-1.4-0.2-1.1 0-2.2-0.6-0.7-0.9-0.4-3.9-0.5-1.8-0.6 3.5-3.2 3.2-1.6 1.4-0.1 1.1 0.3 2.2 1.3 2.2 0.1 1.1-0.4 0.9-0.9 0.7-1 1.3-1.1 1.3-0.3 5.2 0.5 1.4-0.4 1.3-0.7 1-0.8 0.7-0.7 1.2-2.2 2.5-3.1 2.1 1.1 3.3 2.9 1.7 0.5 2.3 0.1 6.3-0.5 5.8 1 1 0.5 1.1 0.3 1.4 0 3.4-0.7 1.9 0.1 2.2 0.8 2.9 1.8 1.3 0.6 1.4 0 1.3-0.8 1-1.1 1.2-0.7 1.5-0.2 2.2 0.7 1.5 0.7 1.3 0.9 0.9 0.9 0.6 0.9 0.1 1 0 0.9-0.2 0.8 0 0.7 0.1 0.7 0.4 0.3 0.7 0.1 0.6-0.1 2.7-1.1 2.2-0.6 1-0.5 0.4-0.5-0.4-0.8-0.7-0.6-1.1-0.7-0.6-0.7 0-0.8 0.4-0.6 2.1-1.1 8 3.3 1.5 0.2 1.9-0.1 2.2-1.1 1.7-0.6 1.2 0.3 1.2 0.6 2.7 1 26.3 0.8 3.7-0.8 2.2-0.7 1.7-0.9 2.1-0.8 4.5-0.5 2 0.4 1.7 1.1 0.8 1 2.9 2.8-1.6 0.9-1 1.5-0.7 1.8 0.8 2.5 1.3 2.4 1.7 1.8 1.8 0.8 2.4 0.3 1.7 1 5.1 5.7 0.4 0.8-0.1 1.3-0.5 3.1-0.7 1.4 0 4.8-0.6 1.3-1.1 0.4 0.4 1.1 1.2 1.3 2.2 1.2 2.3 0.8 1.8 0.4 0.7 1 0.9 2.5 0.6 2.8 0.2 2-1.1 1.7-4 3.3-0.9 1-2.4 5.9z"
                        id="ROIL"
                        name="Ialomita"
                        fill={getCountyFill('ROIL')}
                        onMouseOver={(e) => handleMouseOver(e, 'Ialomita')}
                        onMouseOut={handleMouseOut}
                        onClick={() => handleCountyClick('ROIL', 'Ialomita')}
                    />
                    {/* Add more counties as needed */}
                </g>
            </svg>
        </div>
    );
}
