import React, { useState } from 'react';
import { Shapes, Scale, MoveRight, HelpCircle, PenTool } from 'lucide-react';

// 4. Roll and Slide
export const RollSlideTest = () => {
    const [activeItem, setActiveItem] = useState(null);
    const [result, setResult] = useState(null);

    const test = (type, behaves) => {
        setActiveItem(type);
        setResult(behaves);
        setTimeout(() => { setActiveItem(null); setResult(null); }, 2000);
    };

    return (
        <div className="p-6 bg-white rounded-3xl border border-gray-100 shadow-sm h-full flex flex-col items-center">
            <div className="w-full h-40 bg-gray-50 rounded-2xl mb-8 relative border border-gray-100 overflow-hidden">
                <div className="absolute bottom-0 right-0 w-full h-full bg-gradient-to-bl from-transparent via-transparent to-gray-200/50" style={{ clipPath: 'polygon(100% 0, 100% 100%, 0 100%)' }}></div>
                {activeItem && (
                    <div className={`absolute top-4 right-10 w-10 h-10 flex items-center justify-center transition-all duration-1000 transform ${result === 'rolls' ? 'translate-x-[-200px] translate-y-[80px] rotate-[-360deg]' : 'translate-x-[-200px] translate-y-[80px]'}`}>
                        {activeItem === 'ball' ? <div className="w-8 h-8 rounded-full bg-red-500 border-2 border-red-600"></div> : <div className="w-8 h-8 rounded-md bg-blue-500 border-2 border-blue-600"></div>}
                    </div>
                )}
                <div className="absolute bottom-2 left-2 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Ramp Test</div>
            </div>
            <div className="grid grid-cols-2 gap-4 w-full">
                <button onClick={() => test('ball', 'rolls')} className="p-4 rounded-2xl border border-red-100 hover:bg-red-50 flex flex-col items-center gap-2 transition-colors">
                    <div className="w-8 h-8 rounded-full bg-red-500"></div>
                    <span className="text-xs font-bold text-red-700">Test Ball</span>
                </button>
                <button onClick={() => test('block', 'slides')} className="p-4 rounded-2xl border border-blue-100 hover:bg-blue-50 flex flex-col items-center gap-2 transition-colors">
                    <div className="w-8 h-8 rounded-md bg-blue-500"></div>
                    <span className="text-xs font-bold text-blue-700">Test Block</span>
                </button>
            </div>
            {result && <div className="mt-4 animate-bounce text-sm font-black uppercase text-gray-800">It {result}!</div>}
        </div>
    );
};

// 5. Jar Estimator
export const JarEstimator = () => {
    const [beans] = useState(Math.floor(Math.random() * 20) + 15);
    const [guess, setGuess] = useState("");
    const [feedback, setFeedback] = useState("");

    const check = () => {
        const val = parseInt(guess);
        if (val === beans) setFeedback("Perfect! You estimated exactly.");
        else if (Math.abs(val - beans) < 5) setFeedback(`Close! There were ${beans}.`);
        else setFeedback(`A bit off. There were ${beans}.`);
    };

    return (
        <div className="p-6 bg-white rounded-3xl border border-gray-100 shadow-sm h-full flex flex-col items-center">
            <div className="w-24 h-32 border-4 border-blue-100 rounded-b-3xl rounded-t-lg relative mb-6 flex flex-wrap gap-1 p-2 items-end overflow-hidden">
                {Array(beans).fill(0).map((_, i) => (
                    <div key={i} className="w-2 h-2 rounded-full bg-green-500 opacity-80 shadow-sm"></div>
                ))}
            </div>
            <div className="flex flex-col gap-3 w-full">
                <input 
                    type="number" 
                    placeholder="How many beans?" 
                    className="w-full px-4 py-2 rounded-xl border border-gray-100 text-center text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                    value={guess}
                    onChange={(e) => setGuess(e.target.value)}
                />
                <button onClick={check} className="w-full py-2 bg-blue-600 text-white rounded-xl font-bold text-sm shadow-md hover:bg-blue-700">Submit Guess</button>
            </div>
            {feedback && <div className="mt-4 text-xs font-medium text-gray-600 text-center">{feedback}</div>}
        </div>
    );
};

// 6. Balance Scale
export const BalanceScale = () => {
    const [left, setLeft] = useState(0);
    const [right, setRight] = useState(0);
    const balance = left - right;

    return (
        <div className="p-6 bg-white rounded-3xl border border-gray-100 shadow-sm h-full flex flex-col items-center">
            <div className="w-full h-40 relative flex items-center justify-center">
                <div className={`w-48 h-2 bg-gray-700 rounded-full transition-transform duration-500`} style={{ transform: `rotate(${Math.min(Math.max(balance * 5, -20), 20)}deg)` }}>
                    <div className="absolute top-2 left-0 w-12 h-12 bg-gray-200 border-2 border-gray-300 rounded-full flex items-center justify-center text-[10px] font-bold">{left}kg</div>
                    <div className="absolute top-2 right-0 w-12 h-12 bg-gray-200 border-2 border-gray-300 rounded-full flex items-center justify-center text-[10px] font-bold">{right}kg</div>
                </div>
                <div className="absolute bottom-0 w-4 h-24 bg-gray-800 rounded-full"></div>
            </div>
            <div className="grid grid-cols-2 gap-4 w-full mt-4">
                <div className="flex flex-col gap-2">
                    <button onClick={() => setLeft(l => l + 1)} className="text-[10px] font-bold bg-gray-50 p-2 rounded-lg border border-gray-100">+ Add Left</button>
                    <button onClick={() => setLeft(l => Math.max(0, l - 1))} className="text-[10px] font-bold bg-gray-50 p-2 rounded-lg border border-gray-100">- Remove Left</button>
                </div>
                <div className="flex flex-col gap-2">
                    <button onClick={() => setRight(r => r + 1)} className="text-[10px] font-bold bg-gray-50 p-2 rounded-lg border border-gray-100">+ Add Right</button>
                    <button onClick={() => setRight(r => Math.max(0, r - 1))} className="text-[10px] font-bold bg-gray-50 p-2 rounded-lg border border-gray-100">- Remove Right</button>
                </div>
            </div>
        </div>
    );
};

// 7. Outline Tracer
export const OutlineTracer = () => {
    const [points, setPoints] = useState([]);
    const [drawing, setDrawing] = useState(false);

    const handleMove = (e) => {
        if (!drawing) return;
        const rect = e.currentTarget.getBoundingClientRect();
        setPoints([...points, { x: e.clientX - rect.left, y: e.clientY - rect.top }]);
    };

    return (
        <div className="p-6 bg-white rounded-3xl border border-gray-100 shadow-sm h-full flex flex-col items-center">
            <div 
                className="w-full h-48 bg-gray-50 rounded-2xl relative cursor-crosshair overflow-hidden border border-gray-100"
                onMouseDown={() => setDrawing(true)}
                onMouseUp={() => setDrawing(false)}
                onMouseMove={handleMove}
            >
                <div className="absolute inset-0 flex items-center justify-center opacity-10 pointer-events-none">
                    <Shapes size={120} />
                </div>
                <svg className="w-full h-full pointer-events-none">
                    <polyline points={points.map(p => `${p.x},${p.y}`).join(" ")} fill="none" stroke="#3b82f6" strokeWidth="3" strokeLinecap="round" />
                </svg>
            </div>
            <button onClick={() => setPoints([])} className="mt-4 text-xs font-bold text-red-500 hover:bg-red-50 px-3 py-1 rounded-lg">Clear Canvas</button>
        </div>
    );
};
