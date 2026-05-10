import React, { useState, useEffect } from 'react';
import { Sparkles, Leaf, Droplets, Shapes, RotateCcw, Play, CheckCircle2, MapPin, Compass, Network } from 'lucide-react';

// 1. Sense of Smell (Ants)
export const AntSenseLab = () => {
    const [sugar, setSugar] = useState(false);
    const [ants, setAnts] = useState([]);
    
    useEffect(() => {
        if (sugar && ants.length < 15) {
            const timer = setInterval(() => {
                setAnts(prev => [...prev, { id: Date.now(), x: Math.random() * 80 + 10, y: Math.random() * 80 + 10 }]);
            }, 300);
            return () => clearInterval(timer);
        }
    }, [sugar, ants]);

    return (
        <div className="p-6 bg-white rounded-3xl border border-gray-100 shadow-sm h-full flex flex-col items-center">
            <div className="w-full h-48 bg-amber-50/30 border border-amber-100 rounded-2xl relative overflow-hidden mb-6">
                {sugar && <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-4 h-4 bg-white rounded-full shadow-sm animate-pulse"></div>}
                {ants.map(ant => (
                    <div key={ant.id} className="absolute w-1 h-1 bg-gray-900 rounded-full transition-all duration-1000" style={{ left: `${ant.x}%`, top: `${ant.y}%` }}></div>
                ))}
            </div>
            <button 
                onClick={() => setSugar(true)}
                className="px-6 py-2 bg-amber-600 text-white rounded-xl font-bold text-sm"
            >
                Drop Sugar Cube
            </button>
            <p className="mt-4 text-[10px] text-gray-400 text-center italic">Ants detect the sugar using their sense of smell and begin to gather.</p>
        </div>
    );
};

// 2. Seed Germination
export const GerminationLab = () => {
    const [day, setDay] = useState(0);
    return (
        <div className="p-6 bg-white rounded-3xl border border-gray-100 shadow-sm h-full flex flex-col items-center">
            <div className="w-full h-40 flex items-end justify-center gap-4 mb-6 bg-gray-50 rounded-2xl border border-gray-100 p-4">
                <div className="flex flex-col items-center">
                    <div className="w-12 h-4 bg-gray-200 rounded-full mb-1 relative">
                        {day >= 1 && <div className="absolute -top-1 left-1/2 w-1 h-2 bg-green-200 rounded-full"></div>}
                        {day >= 2 && <div className="absolute -top-4 left-1/2 w-0.5 h-4 bg-green-400"></div>}
                        {day >= 3 && <Leaf className="absolute -top-6 left-1/4 text-green-600 w-4 h-4" />}
                    </div>
                    <span className="text-[8px] font-bold text-gray-400">Cotton</span>
                </div>
            </div>
            <input type="range" max="5" value={day} onChange={(e) => setDay(parseInt(e.target.value))} className="w-full accent-green-600" />
            <p className="mt-2 text-xs font-black text-green-700">Day {day}</p>
        </div>
    );
};

// 3. Floatation Test
export const FloatationLab = () => {
    const items = [
        { name: 'Metal Key', floats: false, icon: '🔑' },
        { name: 'Plastic Ball', floats: true, icon: '⚽' },
        { name: 'Dry Leaf', floats: true, icon: '🍂' },
        { name: 'Stone', floats: false, icon: '🪨' }
    ];
    const [active, setActive] = useState(null);
    return (
        <div className="p-6 bg-white rounded-3xl border border-gray-100 shadow-sm h-full flex flex-col items-center">
            <div className="w-32 h-40 border-4 border-blue-50 rounded-b-3xl relative mb-8 flex items-center justify-center overflow-hidden">
                <div className="absolute inset-0 bg-blue-400/10"></div>
                {active && (
                    <div className={`text-3xl transition-all duration-1000 transform ${active.floats ? '-translate-y-10' : 'translate-y-10'}`}>
                        {active.icon}
                    </div>
                )}
            </div>
            <div className="grid grid-cols-2 gap-2 w-full">
                {items.map(it => (
                    <button key={it.name} onClick={() => setActive(it)} className="py-2 bg-gray-50 border rounded-xl text-[10px] font-bold hover:bg-blue-50 transition-colors">{it.name}</button>
                ))}
            </div>
        </div>
    );
};

// 4. Angle Tester
export const AngleTester = () => {
    const [angle, setAngle] = useState(90);
    return (
        <div className="p-6 bg-white rounded-3xl border border-gray-100 shadow-sm h-full flex flex-col items-center">
            <div className="w-48 h-48 relative flex items-center justify-center mb-8 border-2 border-dashed border-gray-100 rounded-full">
                <div className="w-32 h-1 bg-amber-800 rounded-full origin-right absolute right-1/2"></div>
                <div 
                    className="w-32 h-1 bg-amber-800 rounded-full origin-left absolute left-1/2 transition-transform duration-500"
                    style={{ transform: `rotate(-${angle}deg)` }}
                ></div>
                <div className="absolute text-xl font-black text-amber-900">{angle}°</div>
            </div>
            <input type="range" min="0" max="180" value={angle} onChange={(e)=>setAngle(e.target.value)} className="w-full accent-amber-600" />
            <p className="mt-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                {angle < 90 ? 'Acute Angle' : angle == 90 ? 'Right Angle' : 'Obtuse Angle'}
            </p>
        </div>
    );
};

// 5. Magic Top (Color Mixing)
export const MagicTop = () => {
    const [spinning, setSpinning] = useState(false);
    return (
        <div className="p-6 bg-white rounded-3xl border border-gray-100 shadow-sm h-full flex flex-col items-center">
            <div className={`w-32 h-32 rounded-full relative overflow-hidden mb-8 border-4 border-gray-100 transition-all duration-[3000ms] ease-in-out ${spinning ? 'rotate-[1080deg] scale-95' : ''}`}>
                <div className="absolute inset-0 grid grid-cols-2 grid-rows-2">
                    <div className="bg-red-500"></div><div className="bg-blue-500"></div>
                    <div className="bg-green-500"></div><div className="bg-yellow-500"></div>
                </div>
                {spinning && <div className="absolute inset-0 bg-white/60 backdrop-blur-sm"></div>}
            </div>
            <button onClick={() => {setSpinning(true); setTimeout(()=>setSpinning(false), 3000);}} className="px-6 py-2 bg-indigo-600 text-white rounded-xl font-bold text-sm shadow-md">Spin the Top</button>
            <p className="mt-4 text-[10px] text-gray-400 text-center italic">When spinning fast, the colors mix to appear almost white.</p>
        </div>
    );
};

// 6. Scratch Basics
export const ScratchBasics = () => {
    const [pos, setPos] = useState({ x: 0, y: 0 });
    const move = (dx, dy) => setPos(p => ({ x: Math.min(Math.max(p.x + dx, -80), 80), y: Math.min(Math.max(p.y + dy, -40), 40) }));
    return (
        <div className="p-6 bg-white rounded-3xl border border-gray-100 shadow-sm h-full flex flex-col items-center">
            <div className="w-full h-32 bg-blue-50/30 border border-blue-100 rounded-2xl relative mb-6 flex items-center justify-center">
                <div className="w-10 h-10 bg-orange-400 rounded-xl flex items-center justify-center text-white transition-all duration-300" style={{ transform: `translate(${pos.x}px, ${pos.y}px)` }}>
                    <Play size={20} />
                </div>
            </div>
            <div className="grid grid-cols-2 gap-2 w-full">
                <button onClick={()=>move(20,0)} className="py-2 bg-blue-600 text-white rounded-xl font-bold text-[10px]">Move 10 Steps</button>
                <button onClick={()=>setPos({x:0,y:0})} className="py-2 bg-gray-100 text-gray-600 rounded-xl font-bold text-[10px]">Go to Center</button>
            </div>
        </div>
    );
};

// 7. Map Pointing
export const MapPointing = () => {
    const [score, setScore] = useState(0);
    const targets = [{ name: 'District HQ', x: 20, y: 30 }, { name: 'State Forest', x: 70, y: 50 }, { name: 'River Mouth', x: 40, y: 80 }];
    const [active, setActive] = useState(0);
    const click = (i) => { if(i === active) { setScore(s=>s+1); setActive(a=>a+1); } };

    if (active === targets.length) return <div className="p-6 bg-white rounded-3xl border border-gray-100 shadow-sm h-full flex flex-col items-center justify-center text-green-600 font-black"><CheckCircle2 size={40} className="mb-2" /> Geography Master!</div>;

    return (
        <div className="p-6 bg-white rounded-3xl border border-gray-100 shadow-sm h-full flex flex-col items-center">
            <p className="text-xs font-bold text-gray-500 mb-4">Find: <span className="text-blue-600 uppercase tracking-widest">{targets[active].name}</span></p>
            <div className="w-full h-40 bg-gray-100 rounded-2xl relative border border-gray-200 cursor-crosshair">
                {targets.map((t, i) => (
                    <div key={i} onClick={()=>click(i)} className="absolute w-8 h-8 -translate-x-1/2 -translate-y-1/2 flex items-center justify-center" style={{ left: `${t.x}%`, top: `${t.y}%` }}>
                        <MapPin className={i < active ? 'text-green-500' : 'text-transparent'} />
                    </div>
                ))}
            </div>
        </div>
    );
};

// 8. Flowchart Logic
export const FlowchartLab = () => {
    const [step, setStep] = useState(0);
    const steps = ['Start', 'Boil Water', 'Add Tea Leaves', 'Add Milk', 'Serve'];
    return (
        <div className="p-6 bg-white rounded-3xl border border-gray-100 shadow-sm h-full flex flex-col items-center">
            <div className="flex flex-col items-center gap-2">
                {steps.map((s, i) => (
                    <React.Fragment key={i}>
                        <div className={`px-4 py-2 rounded-xl border-2 text-[10px] font-bold transition-all ${step >= i ? 'bg-blue-600 text-white border-blue-700 shadow-md scale-105' : 'bg-gray-50 text-gray-400 border-gray-100'}`}>{s}</div>
                        {i < steps.length - 1 && <div className={`w-0.5 h-4 ${step > i ? 'bg-blue-600' : 'bg-gray-100'}`}></div>}
                    </React.Fragment>
                ))}
            </div>
            <button onClick={()=>setStep(s=>Math.min(steps.length-1, s+1))} className="mt-6 px-6 py-2 bg-gray-900 text-white rounded-xl font-bold text-xs">Next Step</button>
        </div>
    );
};
