import React, { useState } from 'react';
import { Droplets, Zap, Eye, Wind, Filter, Flame, Thermometer, Box, Compass, Network } from 'lucide-react';

// 1. Starch Test
export const StarchTest = () => {
    const [iodine, setIodine] = useState(false);
    return (
        <div className="p-6 bg-white rounded-3xl border border-gray-100 shadow-sm h-full flex flex-col items-center">
            <div className="flex gap-6 mb-8">
                <div className="flex flex-col items-center gap-2">
                    <div className={`w-16 h-12 bg-amber-50 rounded-lg border-2 ${iodine ? 'bg-blue-900 border-blue-950' : 'border-amber-100'} transition-colors duration-1000`}></div>
                    <span className="text-[10px] font-bold text-gray-500">Potato Slice</span>
                </div>
                <div className="flex flex-col items-center gap-2">
                    <div className={`w-16 h-12 bg-white rounded-lg border-2 ${iodine ? 'bg-blue-950 border-black' : 'border-gray-100'} transition-colors duration-1000`}></div>
                    <span className="text-[10px] font-bold text-gray-500">Bread</span>
                </div>
            </div>
            <button 
                onClick={() => setIodine(true)}
                className="px-6 py-2 bg-blue-600 text-white rounded-xl font-bold text-sm shadow-md hover:bg-blue-700 transition-all"
            >
                Add Iodine Solution
            </button>
            {iodine && <p className="mt-4 text-xs font-medium text-blue-800 animate-pulse">Blue-black color confirms presence of starch!</p>}
        </div>
    );
};

// 2. Protein Test
export const ProteinTest = () => {
    const [stage, setStage] = useState(0);
    const colors = ['bg-gray-50', 'bg-blue-100', 'bg-purple-500'];
    return (
        <div className="p-6 bg-white rounded-3xl border border-gray-100 shadow-sm h-full flex flex-col items-center">
            <div className={`w-12 h-24 border-2 border-gray-200 rounded-b-xl relative mb-8 transition-colors duration-1000 ${colors[stage]}`}>
                <div className="absolute top-0 w-full h-1/4 bg-white/30"></div>
            </div>
            <div className="flex gap-2">
                <button onClick={() => setStage(1)} className="px-3 py-1 bg-blue-50 text-blue-600 rounded-lg text-[10px] font-bold">Add CuSO4</button>
                <button onClick={() => setStage(2)} className="px-3 py-1 bg-purple-50 text-purple-600 rounded-lg text-[10px] font-bold">Add Caustic Soda</button>
            </div>
            {stage === 2 && <p className="mt-4 text-xs font-medium text-purple-800">Violet color confirms protein!</p>}
        </div>
    );
};

// 3. Fats Test
export const FatsTest = () => {
    const [rubbed, setRubbed] = useState(0);
    return (
        <div className="p-6 bg-white rounded-3xl border border-gray-100 shadow-sm h-full flex flex-col items-center">
            <div className="w-48 h-48 bg-white border border-gray-100 shadow-inner relative flex items-center justify-center overflow-hidden">
                <div 
                    className="w-24 h-24 rounded-full bg-yellow-100/50 blur-xl transition-opacity duration-500"
                    style={{ opacity: rubbed / 100 }}
                ></div>
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <span className="text-[10px] font-bold text-gray-300 uppercase tracking-widest">Filter Paper</span>
                </div>
            </div>
            <input type="range" className="w-full mt-6 accent-yellow-500" value={rubbed} onChange={(e) => setRubbed(e.target.value)} />
            <p className="mt-2 text-[10px] text-gray-400">Rub groundnut on paper to see oily patch.</p>
        </div>
    );
};

// 4. Solubility Test
export const SolubilityTest = () => {
    const [selected, setSelected] = useState(null);
    const [stirring, setStirring] = useState(false);
    const substances = [
        { name: 'Sugar', dissolves: true },
        { name: 'Sand', dissolves: false },
        { name: 'Sawdust', dissolves: false }
    ];

    const test = (sub) => {
        setSelected(sub);
        setStirring(true);
        setTimeout(() => setStirring(false), 2000);
    };

    return (
        <div className="p-6 bg-white rounded-3xl border border-gray-100 shadow-sm h-full flex flex-col items-center">
            <div className="w-20 h-32 border-4 border-blue-50 rounded-b-2xl relative mb-8 flex flex-col items-center justify-end p-2 overflow-hidden">
                <div className="absolute inset-0 bg-blue-400/10"></div>
                {selected && (
                    <div className={`transition-all duration-1000 ${selected.dissolves && !stirring ? 'opacity-0' : 'opacity-100'} ${stirring ? 'animate-bounce' : ''}`}>
                        <div className="w-4 h-4 bg-gray-400 rounded-sm"></div>
                    </div>
                )}
            </div>
            <div className="grid grid-cols-3 gap-2 w-full">
                {substances.map(s => (
                    <button key={s.name} onClick={() => test(s)} className="py-2 bg-gray-50 border rounded-xl text-[10px] font-bold">{s.name}</button>
                ))}
            </div>
        </div>
    );
};

// 5. Transparency Test
export const TransparencyTest = () => {
    const [mode, setMode] = useState('Glass');
    const opacity = { 'Glass': 'opacity-100', 'Oiled Paper': 'opacity-30', 'Wood': 'opacity-0' };
    return (
        <div className="p-6 bg-white rounded-3xl border border-gray-100 shadow-sm h-full flex flex-col items-center">
            <div className="w-full h-40 bg-gray-900 rounded-2xl relative flex items-center justify-center overflow-hidden">
                <div className="text-white font-black text-4xl animate-pulse">SECRET</div>
                <div className={`absolute inset-0 bg-white transition-all duration-500 ${opacity[mode]}`}></div>
            </div>
            <div className="grid grid-cols-3 gap-2 w-full mt-6">
                {['Glass', 'Oiled Paper', 'Wood'].map(m => (
                    <button key={m} onClick={() => setMode(m)} className={`py-2 rounded-xl text-[10px] font-bold ${mode === m ? 'bg-blue-600 text-white' : 'bg-gray-100'}`}>{m}</button>
                ))}
            </div>
        </div>
    );
};

// 6. Separation (Filtration)
export const FiltrationLab = () => {
    const [state, setState] = useState('Muddy');
    return (
        <div className="p-6 bg-white rounded-3xl border border-gray-100 shadow-sm h-full flex flex-col items-center">
            <div className="flex flex-col items-center gap-4 mb-8">
                <div className="w-16 h-12 bg-amber-900/40 border-2 border-amber-950 rounded-lg"></div>
                <Filter className="text-gray-400 animate-bounce" />
                <div className={`w-16 h-12 border-2 rounded-lg transition-colors duration-2000 ${state === 'Clean' ? 'bg-blue-100 border-blue-200' : 'bg-transparent border-gray-100'}`}></div>
            </div>
            <button onClick={() => setState('Clean')} className="px-6 py-2 bg-blue-600 text-white rounded-xl font-bold text-sm">Start Filtration</button>
        </div>
    );
};

// 7. Evaporation
export const EvaporationLab = () => {
    const [heat, setHeat] = useState(0);
    return (
        <div className="p-6 bg-white rounded-3xl border border-gray-100 shadow-sm h-full flex flex-col items-center">
            <div className="w-32 h-32 relative mb-8 flex items-center justify-center">
                <div className="absolute bottom-0 w-24 h-4 bg-gray-200 border rounded-full"></div>
                {heat > 50 && <div className="absolute bottom-6 flex flex-col gap-1 animate-bounce opacity-40"><Wind className="-rotate-90 text-blue-300" /><Wind className="-rotate-90 text-blue-300" /></div>}
                <div className={`w-20 h-10 bg-blue-400/20 border-x border-b border-blue-200 absolute bottom-4 transition-all duration-1000`} style={{ height: `${20 - (heat/10)}px` }}></div>
                {heat === 100 && <div className="absolute bottom-4 flex gap-0.5">{Array(5).fill(0).map((_,i)=><div key={i} className="w-1 h-1 bg-white rounded-full"></div>)}</div>}
            </div>
            <input type="range" value={heat} onChange={(e)=>setHeat(e.target.value)} className="w-full accent-red-600" />
            <p className="mt-2 text-[10px] font-bold text-gray-400 uppercase">Heat: {heat}°C</p>
        </div>
    );
};

// 8. Transpiration
export const TranspirationLab = () => {
    const [time, setTime] = useState(0);
    return (
        <div className="p-6 bg-white rounded-3xl border border-gray-100 shadow-sm h-full flex flex-col items-center">
            <div className="w-32 h-40 relative flex items-center justify-center bg-green-50 rounded-2xl border border-green-100 overflow-hidden">
                <Network className="text-green-600" size={80} />
                <div className={`absolute inset-2 bg-white/20 backdrop-blur-md border border-white/40 rounded-xl transition-opacity duration-1000`} style={{ opacity: time / 100 }}>
                    <div className="flex flex-wrap gap-2 p-2">
                        {Array(Math.floor(time/10)).fill(0).map((_,i)=><div key={i} className="w-1.5 h-1.5 bg-blue-400 rounded-full"></div>)}
                    </div>
                </div>
            </div>
            <input type="range" value={time} onChange={(e)=>setTime(e.target.value)} className="w-full mt-8 accent-blue-600" />
            <p className="mt-2 text-[10px] text-gray-400 italic">Watch water droplets collect inside the bag.</p>
        </div>
    );
};

// 9. Root Systems
export const RootSystems = () => {
    const [selected, setSelected] = useState(null);
    return (
        <div className="p-6 bg-white rounded-3xl border border-gray-100 shadow-sm h-full flex flex-col items-center">
            <div className="flex gap-8 mb-8">
                <button onClick={()=>setSelected('Tap')} className={`p-4 rounded-2xl border-2 transition-all ${selected === 'Tap' ? 'border-blue-600 bg-blue-50' : 'border-gray-100'}`}>
                    <div className="w-12 h-20 flex flex-col items-center">
                        <div className="w-1 h-16 bg-amber-800 rounded-full"></div>
                        <div className="w-8 h-0.5 bg-amber-800/30"></div>
                    </div>
                    <span className="text-[10px] font-bold block mt-2">Tap Root</span>
                </button>
                <button onClick={()=>setSelected('Fibrous')} className={`p-4 rounded-2xl border-2 transition-all ${selected === 'Fibrous' ? 'border-blue-600 bg-blue-50' : 'border-gray-100'}`}>
                    <div className="w-12 h-20 flex flex-wrap justify-center gap-0.5 pt-4">
                        {Array(10).fill(0).map((_,i)=><div key={i} className="w-0.5 h-12 bg-amber-800/40"></div>)}
                    </div>
                    <span className="text-[10px] font-bold block mt-2">Fibrous Root</span>
                </button>
            </div>
            {selected && <p className="text-xs font-medium text-blue-800 animate-in slide-in-from-bottom">{selected === 'Tap' ? 'Typical of Dicot plants like Mustard.' : 'Typical of Monocot plants like Grass.'}</p>}
        </div>
    );
};

// 10. Simple Circuit
export const SimpleCircuit = () => {
    const [on, setOn] = useState(false);
    return (
        <div className="p-6 bg-white rounded-3xl border border-gray-100 shadow-sm h-full flex flex-col items-center">
            <div className="w-full h-40 relative flex items-center justify-center">
                <div className={`absolute top-1/2 left-1/4 w-1/2 h-1 ${on ? 'bg-yellow-400 shadow-[0_0_10px_rgba(250,204,21,0.5)]' : 'bg-gray-300'} transition-all`}></div>
                <div className="absolute left-10 w-12 h-20 bg-gray-800 rounded-lg flex flex-col items-center justify-center text-white text-[10px] font-bold">BATTERY</div>
                <div 
                    onClick={()=>setOn(!on)}
                    className={`absolute bottom-4 right-1/2 translate-x-1/2 w-10 h-6 rounded-full cursor-pointer transition-all ${on ? 'bg-green-500' : 'bg-red-500'}`}
                >
                    <div className={`w-4 h-4 bg-white rounded-full mt-1 transition-all ${on ? 'ml-5' : 'ml-1'}`}></div>
                </div>
                <div className={`absolute right-10 w-16 h-16 rounded-full flex items-center justify-center border-4 transition-all ${on ? 'bg-yellow-100 border-yellow-400 shadow-lg' : 'bg-gray-50 border-gray-200'}`}>
                    <Zap className={on ? 'text-yellow-600' : 'text-gray-300'} />
                </div>
            </div>
            <p className="mt-8 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Toggle the switch to complete the circuit.</p>
        </div>
    );
};

// 11. Magnetic Compass
export const MagneticCompassLab = () => {
    const [rotation, setRotation] = useState(0);
    return (
        <div className="p-6 bg-white rounded-3xl border border-gray-100 shadow-sm h-full flex flex-col items-center">
            <div className="w-48 h-48 rounded-full border-8 border-gray-100 relative flex items-center justify-center shadow-inner">
                <div className="absolute inset-4 rounded-full border border-gray-100 bg-gray-50/50"></div>
                <div className="absolute top-2 font-black text-rose-600 text-xs">N</div>
                <div className="absolute bottom-2 font-black text-gray-400 text-xs">S</div>
                <div 
                    className="w-1 h-32 bg-gray-900 rounded-full relative transition-transform duration-[2000ms] ease-out"
                    style={{ transform: `rotate(${rotation}deg)` }}
                >
                    <div className="absolute top-0 w-full h-1/2 bg-rose-600 rounded-t-full"></div>
                </div>
            </div>
            <button onClick={()=>setRotation(prev => prev + 360 + Math.random()*90)} className="mt-8 px-6 py-2 bg-gray-900 text-white rounded-xl font-bold text-xs shadow-xl">Spin Compass</button>
            <p className="mt-4 text-[10px] text-gray-400 italic">The needle always aligns with the Magnetic North.</p>
        </div>
    );
};

// 12. 360-Degree Protractor
export const Protractor360Lab = () => {
    const [angle, setAngle] = useState(45);
    return (
        <div className="p-6 bg-white rounded-3xl border border-gray-100 shadow-sm h-full flex flex-col items-center">
            <div className="w-48 h-48 rounded-full border-4 border-indigo-100 relative flex items-center justify-center">
                {Array(12).fill(0).map((_,i) => (
                    <div key={i} className="absolute inset-0 flex items-start justify-center" style={{ transform: `rotate(${i*30}deg)` }}>
                        <div className="h-2 w-0.5 bg-indigo-200 mt-1"></div>
                        <span className="absolute top-3 text-[6px] font-black text-indigo-300" style={{ transform: `rotate(-${i*30}deg)` }}>{i*30}°</span>
                    </div>
                ))}
                <div className="w-1 h-20 bg-indigo-600 rounded-full origin-bottom mb-20 transition-transform duration-500" style={{ transform: `rotate(${angle}deg)` }}></div>
                <div className="absolute inset-0 flex items-center justify-center text-2xl font-black text-indigo-900">{angle}°</div>
            </div>
            <input type="range" min="0" max="360" value={angle} onChange={(e)=>setAngle(e.target.value)} className="w-full mt-8 accent-indigo-600" />
            <p className="mt-2 text-[10px] font-bold text-gray-400 uppercase">Complete Revolution</p>
        </div>
    );
};

// 13. Scratch Animation (If-Then Logic)
export const ScratchAnimationLab = () => {
    const [active, setActive] = useState(false);
    return (
        <div className="p-6 bg-white rounded-3xl border border-gray-100 shadow-sm h-full flex flex-col items-center">
            <div className="w-full h-32 bg-blue-50/50 rounded-2xl relative mb-6 flex items-center justify-center border border-blue-100 overflow-hidden">
                <div className={`transition-all duration-1000 transform ${active ? 'translate-x-20 scale-125' : '-translate-x-20'}`}>
                    <Box className={active ? 'text-orange-500' : 'text-gray-400'} size={40} />
                </div>
                <div className="absolute bottom-2 left-2 text-[8px] font-mono text-blue-400">
                    if (clicked) &#123; move(10); scale(1.2); &#125;
                </div>
            </div>
            <button onClick={()=>setActive(!active)} className="w-full py-2 bg-orange-500 text-white rounded-xl font-bold text-xs shadow-lg">Run Script Block</button>
        </div>
    );
};
