"use client";

import React, { useEffect, useRef, useState } from "react";
import confetti from "canvas-confetti";
import { FaPlay, FaCog } from "react-icons/fa";

interface SpinningWheelProps {
    items: string[];
    onFinish: (winner: string) => void;
}

const SpinningWheel: React.FC<SpinningWheelProps> = ({ items, onFinish }) => {
    const [angle, setAngle] = useState(0);
    const [spinning, setSpinning] = useState(false);
    const [totalRotation, setTotalRotation] = useState(0);
    const canvasRef = useRef<HTMLCanvasElement>(null);

    const spin = () => {
        if (items.length < 2) {
            alert("Adicione pelo menos dois itens para rodar a roleta.");
            return;
        }

        // Melhorar a rotação com mais variabilidade
        const minSpins = 8 + Math.random() * 4; // Entre 8 e 12 voltas
        const extraRotation = Math.random() * 360; // Rotação extra aleatória
        const newRotation = minSpins * 360 + extraRotation;
        
        // Acumular rotação total para evitar que a roleta "enfraqueça"
        const finalRotation = totalRotation + newRotation;
        setTotalRotation(finalRotation);
        setAngle(finalRotation);
        setSpinning(true);

        // Corrigir o cálculo do índice do vencedor
        const normalizedAngle = (360 - (finalRotation % 360)) % 360;
        const anglePerItem = 360 / items.length;
        const winnerIndex = Math.floor(normalizedAngle / anglePerItem) % items.length;
        const winner = items[winnerIndex];

        setTimeout(() => {
            setSpinning(false);
            
            // Confetti imediato da roleta
            confetti({
                particleCount: 100,
                spread: 70,
                origin: { y: 0.6 },
                colors: ['#FFD700', '#FF6B6B', '#4ECDC4', '#45B7D1']
            });

            // Chamar onFinish que irá lidar com o foco e confetti adicional
            onFinish(winner);
        }, 4000);
    };

    const colors = [
        "#EF4444",
        "#3B82F6",
        "#10B981",
        "#F59E0B",
        "#8B5CF6",
        "#EC4899",
        "#06B6D4",
        "#84CC16",
        "#F97316",
        "#6366F1",
    ];

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext("2d");
        if (!ctx) return;
        
        const radius = canvas.width / 2;
        const anglePerItem = (2 * Math.PI) / items.length;

        ctx.clearRect(0, 0, canvas.width, canvas.height);

        items.forEach((item, index) => {
            const startAngle = index * anglePerItem;
            const endAngle = startAngle + anglePerItem;
            const color = colors[index % colors.length];

            const gradient = ctx.createRadialGradient(radius, radius, 0, radius, radius, radius);
            gradient.addColorStop(0, color);
            gradient.addColorStop(1, color + "CC");

            ctx.beginPath();
            ctx.moveTo(radius, radius);
            ctx.arc(radius, radius, radius - 5, startAngle, endAngle);
            ctx.fillStyle = gradient;
            ctx.fill();

            ctx.strokeStyle = "#ffffff";
            ctx.lineWidth = 2;
            ctx.stroke();

            ctx.save();
            ctx.translate(radius, radius);
            ctx.rotate(startAngle + anglePerItem / 2);
            ctx.textAlign = "right";
            ctx.fillStyle = "#ffffff";
            ctx.font = "bold 12px Inter, sans-serif";
            ctx.shadowColor = "rgba(0, 0, 0, 0.5)";
            ctx.shadowBlur = 2;
            ctx.shadowOffsetX = 1;
            ctx.shadowOffsetY = 1;

            const maxWidth = radius - 30;
            let displayText = item;

            if (ctx.measureText(displayText).width > maxWidth) {
                while (ctx.measureText(displayText + "...").width > maxWidth && displayText.length > 1) {
                    displayText = displayText.slice(0, -1);
                }
                displayText += "...";
            }

            ctx.fillText(displayText, radius - 15, 5);
            ctx.restore();
        });

        ctx.beginPath();
        ctx.arc(radius, radius, radius - 2, 0, 2 * Math.PI);
        ctx.strokeStyle = "#e5e7eb";
        ctx.lineWidth = 4;
        ctx.stroke();
    }, [items, colors]);

    return (
        <div className="flex flex-col items-center space-y-6 p-6">
            {/* Container da Roleta */}
            <div className="relative">
                {/* Sombra de fundo */}
                <div className="absolute inset-0 bg-gradient-to-br from-blue-500/20 to-purple-600/20 rounded-full blur-xl transform scale-110"></div>
                
                {/* Ponteiro elegante */}
                <div className="absolute top-1/2 right-0 z-10 transform translate-x-1/2 -translate-y-1/2">
                    <div className="w-0 h-0 border-l-[20px] border-l-transparent border-r-[20px] border-r-transparent border-t-[30px] border-t-yellow-500 rotate-90 drop-shadow-lg">
                    </div>
                    <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-0 h-0 border-l-[18px] border-l-transparent border-r-[18px] border-r-transparent border-t-[28px] border-t-yellow-400 rotate-90">
                    </div>
                </div>

                <div className="relative bg-white dark:bg-gray-800 p-4 rounded-full shadow-2xl border-4 border-gray-200 dark:border-gray-600">
                    <canvas
                        ref={canvasRef}
                        width={320}
                        height={320}
                        style={{
                            transition: spinning ? "transform 4s cubic-bezier(0.25, 0.46, 0.45, 0.94)" : "none",
                            transform: `rotate(${angle}deg)`,
                        }}
                        className="rounded-full shadow-inner"
                    />
                </div>

                {/* Centro da roleta */}
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-12 h-12 bg-gradient-to-br from-gray-700 to-gray-900 rounded-full shadow-lg border-4 border-white dark:border-gray-200 z-20 flex items-center justify-center">
                    {spinning ? (
                        <FaCog className="text-white text-lg animate-spin" />
                    ) : (
                        <div className="w-3 h-3 bg-white rounded-full"></div>
                    )}
                </div>
            </div>

            {/* Botão de girar redesenhado */}
            <button
                onClick={spin}
                disabled={spinning}
                className={`group relative overflow-hidden px-8 py-4 rounded-2xl font-bold text-lg transition-all duration-300 transform ${spinning
                    ? 'bg-gradient-to-r from-gray-400 to-gray-500 cursor-not-allowed scale-95'
                    : 'bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 hover:scale-105 hover:shadow-xl active:scale-95'
                    } text-white shadow-lg`}
            >
                {/* Efeito de brilho no hover */}
                <div className={`absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent transform -skew-x-12 ${spinning ? '' : 'group-hover:animate-pulse'}`}></div>
                <div className="relative flex items-center gap-3">
                    {spinning ? (
                        <>
                            <FaCog className="animate-spin" />
                            <span>Girando...</span>
                        </>
                    ) : (
                        <>
                            <FaPlay />
                            <span>Girar Roleta</span>
                        </>
                    )}
                </div>
            </button>

            {/* Indicador de itens */}
            <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm px-4 py-2 rounded-full shadow-md border border-gray-200 dark:border-gray-600">
                <p className="text-sm text-gray-600 dark:text-gray-300 font-medium">
                    {items.length} {items.length === 1 ? 'item' : 'itens'} na roleta
                </p>
            </div>
        </div>
    );
};

export default SpinningWheel;