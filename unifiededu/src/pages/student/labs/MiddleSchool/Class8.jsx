import React, { useState } from 'react';
import { Eye, Flame, Droplets, Zap, Box, Compass, Play, Activity, Network, Wind } from 'lucide-react';

// 1. Bread Mould
export const BreadMouldLab = () => {
    const [zoom, setZoom] = useState(1);
    return (
        <div className="p-6 bg-white rounded-3xl border border-gray-100 shadow-sm h-full flex flex-col items-center">
            <div className="w-full h-40 bg-gray-50 rounded-2xl relative overflow-hidden border border-gray-100 mb-6">
                <div className="absolute inset-0 flex items-center justify-center transition-transform duration-500" style={{ transform: `scale(${zoom})` }}>
                    <div className="w-20 h-16 bg-white border shadow-sm flex flex-wrap gap-1 p-2">
                        {Array(20).fill(0).map((_,i)=><div key={i} className="w-2 h-2 bg-green-900/30 rounded-full blur-[2px]"></div>)}
                        {zoom > 2 && <Network className="text-gray-400 absolute opacity-40 animate-pulse" />}
                    </div>
                </div>
            </div>
            <input type="range" min="1" max="5" step="0.1" value={zoom} onChange={(e)=>setZoom(e.target.value)} className="w-full accent-green-600" />
            <p className="mt-2 text-[10px] text-gray-400">Magnify to see hyphae and sporangia.</p>
        </div>
    );
};

// 2. Combustion (Air Necessity)
export const CombustionLab = () => {
    const [covered, setCovered] = useState(false);
    const [out, setOut] = useState(false);
    return (
        <div className="p-6 bg-white rounded-3xl border border-gray-100 shadow-sm h-full flex flex-col items-center">
            <div className="w-full h-40 relative flex items-center justify-center mb-6">
                <div className={`w-2 h-10 bg-amber-100 rounded-full relative ${out ? 'opacity-20' : ''}`}>
                    {!out && <Flame className="absolute -top-6 -left-2 text-orange-500 animate-bounce" />}
                </div>
                {covered && (
                    <div className="absolute w-24 h-32 border-4 border-blue-50/40 bg-blue-50/10 rounded-t-3xl transition-all duration-[3000ms]"></div>
                )}
            </div>
            <button 
                onClick={() => {setCovered(true); setTimeout(()=>setOut(true), 3000);}}
                className="px-6 py-2 bg-gray-900 text-white rounded-xl font-bold text-sm"
                disabled={covered}
            >
                Cover with Glass Jar
            </button>
            {out && <p className="mt-4 text-xs font-medium text-red-600">Flame extinguished due to lack of oxygen!</p>}
        </div>
    );
};

// 3. Candle Zones
export const CandleZonesLab = () => {
    const [active, setActive] = useState(null);
    const zones = [
        { id: 'outer', name: 'Non-luminous (Outer)', desc: 'Complete combustion, hottest part.', color: 'text-blue-500' },
        { id: 'middle', name: 'Luminous (Middle)', desc: 'Partial combustion, moderately hot.', color: 'text-yellow-500' },
        { id: 'inner', name: 'Dark (Inner)', desc: 'Unburnt wax vapors, least hot.', color: 'text-gray-500' }
    ];
    return (
        <div className="p-6 bg-white rounded-3xl border border-gray-100 shadow-sm h-full flex flex-col items-center">
            <div className="relative w-20 h-40 flex flex-col items-center justify-end">
                <div className="w-4 h-16 bg-gray-100 rounded-t-lg"></div>
                <div onClick={()=>setActive(zones[0])} className="absolute bottom-20 w-12 h-20 bg-blue-400/20 rounded-full blur-md cursor-pointer hover:scale-110 transition-transform"></div>
                <div onClick={()=>setActive(zones[1])} className="absolute bottom-20 w-8 h-16 bg-yellow-400/40 rounded-full blur-sm cursor-pointer hover:scale-110 transition-transform"></div>
                <div onClick={()=>setActive(zones[2])} className="absolute bottom-20 w-4 h-10 bg-gray-800/40 rounded-full cursor-pointer hover:scale-110 transition-transform"></div>
            </div>
            {active ? (
                <div className="mt-6 p-4 bg-gray-50 rounded-2xl border border-gray-100 w-full animate-in zoom-in">
                    <h4 className={`font-black text-xs ${active.color}`}>{active.name}</h4>
                    <p className="text-[10px] text-gray-500 mt-1">{active.desc}</p>
                </div>
            ) : <p className="mt-6 text-[10px] text-gray-400 italic">Click on a flame zone to explore.</p>}
        </div>
    );
};

// 4. Liquid Pressure
export const PressureLab = () => {
    const [water, setWater] = useState(100);
    return (
        <div className="p-6 bg-white rounded-3xl border border-gray-100 shadow-sm h-full flex flex-col items-center">
            <div className="w-20 h-48 border-4 border-blue-50 rounded-2xl relative bg-blue-50/10 overflow-hidden mb-6">
                <div className="absolute bottom-0 w-full bg-blue-400/20 transition-all duration-500" style={{ height: `${water}%` }}></div>
                <div className="absolute right-0 top-1/4 w-1 h-1 bg-blue-400 rounded-full shadow-[5px_5px_10px_rgba(59,130,246,0.3)]" style={{ opacity: water > 75 ? 1 : 0 }}></div>
                <div className="absolute right-0 top-2/4 w-1 h-1 bg-blue-400 rounded-full shadow-[15px_15px_15px_rgba(59,130,246,0.3)]" style={{ opacity: water > 50 ? 1 : 0 }}></div>
                <div className="absolute right-0 top-3/4 w-1 h-1 bg-blue-400 rounded-full shadow-[25px_25px_20px_rgba(59,130,246,0.3)]" style={{ opacity: water > 25 ? 1 : 0 }}></div>
            </div>
            <button onClick={()=>setWater(w => Math.max(0, w - 10))} className="px-6 py-2 bg-blue-600 text-white rounded-xl font-bold text-sm">Open Holes</button>
        </div>
    );
};

// 5. Friction Lab
export const FrictionLab = () => {
    const [surface, setSurface] = useState('Smooth');
    const [pulling, setPulling] = useState(false);
    return (
        <div className="p-6 bg-white rounded-3xl border border-gray-100 shadow-sm h-full flex flex-col items-center">
            <div className="w-full h-32 bg-gray-50 rounded-2xl relative mb-6 overflow-hidden border border-gray-100">
                <div className={`absolute bottom-0 w-full h-4 transition-colors ${surface === 'Smooth' ? 'bg-blue-100' : 'bg-gray-400'}`}></div>
                <div className={`absolute bottom-4 left-4 w-12 h-12 bg-indigo-600 rounded-lg shadow-md transition-all duration-1000 ${pulling ? 'translate-x-40' : ''}`}></div>
            </div>
            <div className="flex gap-2 mb-4">
                <button onClick={()=>setSurface('Smooth')} className={`px-4 py-1 rounded-full text-[10px] font-bold ${surface === 'Smooth' ? 'bg-blue-600 text-white' : 'bg-gray-100'}`}>Smooth (Glass)</button>
                <button onClick={()=>setSurface('Rough')} className={`px-4 py-1 rounded-full text-[10px] font-bold ${surface === 'Rough' ? 'bg-gray-700 text-white' : 'bg-gray-100'}`}>Rough (Sandpaper)</button>
            </div>
            <button onClick={()=>{setPulling(true); setTimeout(()=>setPulling(false), 2000);}} className="px-6 py-2 bg-gray-900 text-white rounded-xl font-bold text-sm">Pull Block</button>
        </div>
    );
};

// 6. Electroplating
export const ElectroplatingLab = () => {
    const [on, setOn] = useState(false);
    const [plated, setPlated] = useState(0);
    return (
        <div className="p-6 bg-white rounded-3xl border border-gray-100 shadow-sm h-full flex flex-col items-center">
            <div className="w-40 h-32 border-4 border-blue-50 rounded-b-2xl relative flex items-center justify-around overflow-hidden mb-6">
                <div className="absolute inset-0 bg-blue-400/5"></div>
                <div className="w-2 h-20 bg-orange-400 rounded-full shadow-lg"><span className="text-[6px] font-black text-white ml-0.5">Cu</span></div>
                <div className={`w-4 h-20 rounded-full transition-colors duration-[5000ms] ${on ? 'bg-orange-300' : 'bg-gray-400'}`}><span className="text-[6px] font-black text-white ml-1">Key</span></div>
            </div>
            <button onClick={()=>setOn(!on)} className={`px-8 py-2 rounded-xl font-black text-sm shadow-md ${on ? 'bg-red-600 text-white' : 'bg-green-600 text-white'}`}>{on ? 'STOP' : 'START'}</button>
        </div>
    );
};

// 7. Static Charge
export const StaticChargeLab = () => {
    const [charged, setCharged] = useState(0);
    return (
        <div className="p-6 bg-white rounded-3xl border border-gray-100 shadow-sm h-full flex flex-col items-center">
            <div className="w-full h-40 relative flex items-center justify-center mb-6 bg-gray-50 rounded-2xl border border-gray-100">
                <div className={`w-16 h-20 bg-red-500 rounded-full transition-transform ${charged > 50 ? '-translate-x-10' : ''}`}></div>
                <div className="flex flex-wrap gap-1 w-20">
                    {Array(20).fill(0).map((_,i)=><div key={i} className={`w-1 h-1 bg-gray-300 rounded-full transition-all duration-500 ${charged > 50 ? '-translate-x-20 rotate-45' : ''}`}></div>)}
                </div>
            </div>
            <input type="range" value={charged} onChange={(e)=>setCharged(e.target.value)} className="w-full accent-red-600" />
            <p className="mt-2 text-[10px] text-gray-400">Rub the balloon to charge it!</p>
        </div>
    );
};

// 8. Python Interest Calculator
export const PythonLab = () => {
    const [p, setP] = useState(1000);
    const [r, setR] = useState(5);
    const [t, setT] = useState(2);
    return (
        <div className="p-6 bg-white rounded-3xl border border-gray-100 shadow-sm h-full flex flex-col items-center">
            <div className="w-full bg-gray-900 rounded-xl p-4 font-mono text-[10px] text-green-400 mb-6 shadow-xl">
                <p># Simple Interest Program</p>
                <p>P = {p}</p><p>R = {r}</p><p>T = {t}</p>
                <p className="text-white mt-2">SI = (P * R * T) / 100</p>
                <p className="text-yellow-400 mt-2">Result: {(p * r * t) / 100}</p>
            </div>
            <div className="grid grid-cols-3 gap-2 w-full">
                <div className="flex flex-col gap-1"><span className="text-[8px] font-bold text-gray-400">P</span><input type="number" value={p} onChange={(e)=>setP(e.target.value)} className="w-full border rounded p-1 text-[10px]" /></div>
                <div className="flex flex-col gap-1"><span className="text-[8px] font-bold text-gray-400">R</span><input type="number" value={r} onChange={(e)=>setR(e.target.value)} className="w-full border rounded p-1 text-[10px]" /></div>
                <div className="flex flex-col gap-1"><span className="text-[8px] font-bold text-gray-400">T</span><input type="number" value={t} onChange={(e)=>setT(e.target.value)} className="w-full border rounded p-1 text-[10px]" /></div>
            </div>
        </div>
    );
};

// 9. Pulse Rate
export const PulseLab = () => {
    const [pulse, setPulse] = useState(72);
    const [active, setActive] = useState(false);
    return (
        <div className="p-6 bg-white rounded-3xl border border-gray-100 shadow-sm h-full flex flex-col items-center">
            <div className="flex flex-col items-center mb-8">
                <Activity className={`w-16 h-16 text-red-500 ${active ? 'animate-ping' : ''}`} />
                <div className="text-4xl font-black text-gray-800 mt-4">{pulse} <span className="text-xs text-gray-400">BPM</span></div>
            </div>
            <div className="flex gap-2 w-full">
                <button onClick={()=>{setActive(true); setPulse(110); setTimeout(()=>setActive(false), 5000);}} className="flex-1 py-2 bg-red-600 text-white rounded-xl font-bold text-xs">Run (Exercise)</button>
                <button onClick={()=>setPulse(72)} className="flex-1 py-2 bg-gray-100 text-gray-600 rounded-xl font-bold text-xs">Rest</button>
            </div>
        </div>
    );
};

// 10. Area of Circle (Sectors)
export const CircleAreaLab = () => {
    const [split, setSplit] = useState(false);
    return (
        <div className="p-6 bg-white rounded-3xl border border-gray-100 shadow-sm h-full flex flex-col items-center">
            <div className="w-full h-40 relative flex items-center justify-center">
                {!split ? (
                    <div className="w-32 h-32 rounded-full border-4 border-indigo-600 relative overflow-hidden">
                        {Array(8).fill(0).map((_,i) => (
                            <div key={i} className="absolute inset-0 origin-center border-r border-indigo-200" style={{ transform: `rotate(${i*45}deg)` }}></div>
                        ))}
                    </div>
                ) : (
                    <div className="flex gap-0.5">
                        {Array(8).fill(0).map((_,i) => (
                            <div key={i} className={`w-8 h-16 bg-indigo-500/20 border-2 border-indigo-500 ${i%2===0 ? 'rounded-t-full' : 'rounded-b-full'}`}></div>
                        ))}
                    </div>
                )}
            </div>
            <button onClick={()=>setSplit(!split)} className="mt-8 px-6 py-2 bg-indigo-600 text-white rounded-xl font-bold text-xs shadow-xl">{split ? 'Reassemble Circle' : 'Cut into Sectors'}</button>
            <p className="mt-4 text-[10px] text-gray-400 italic">Notice how the sectors form an approximate rectangle (Base = πr, Height = r).</p>
        </div>
    );
};

// 11. Magnetic Field Lines (ICSE)
export const MagneticFieldLab = () => {
    const [show, setShow] = useState(false);
    return (
        <div className="p-6 bg-white rounded-3xl border border-gray-100 shadow-sm h-full flex flex-col items-center">
            <div className="w-full h-40 bg-gray-50 rounded-2xl relative flex items-center justify-center border border-gray-100 overflow-hidden">
                <div className="w-32 h-8 bg-gray-900 rounded flex items-center justify-between px-4 text-white font-black text-xs">
                    <span>N</span><div className="flex-1 h-0.5 bg-white/20 mx-2"></div><span>S</span>
                </div>
                {show && (
                    <svg className="absolute inset-0 w-full h-full pointer-events-none">
                        <ellipse cx="50%" cy="50%" rx="80" ry="40" fill="none" stroke="#6366f1" strokeWidth="1" strokeDasharray="4 2" className="animate-[pulse_2s_infinite]" />
                        <ellipse cx="50%" cy="50%" rx="100" ry="60" fill="none" stroke="#6366f1" strokeWidth="1" strokeDasharray="4 2" className="animate-[pulse_3s_infinite]" />
                    </svg>
                )}
            </div>
            <button onClick={()=>setShow(!show)} className="mt-8 px-6 py-2 bg-gray-900 text-white rounded-xl font-bold text-xs">Spread Iron Filings</button>
        </div>
    );
};

// 12. Atomic Models (ICSE)
export const AtomicModelLab = () => {
    const [electrons, setElectrons] = useState(2);
    return (
        <div className="p-6 bg-white rounded-3xl border border-gray-100 shadow-sm h-full flex flex-col items-center">
            <div className="w-48 h-48 relative flex items-center justify-center">
                <div className="w-8 h-8 bg-rose-500 rounded-full flex items-center justify-center text-white font-black text-[10px] shadow-lg shadow-rose-200 z-10">P+N</div>
                <div className="absolute w-32 h-32 border-2 border-dashed border-blue-200 rounded-full"></div>
                {Array(electrons).fill(0).map((_,i) => (
                    <div 
                        key={i} 
                        className="absolute w-3 h-3 bg-indigo-600 rounded-full shadow-[0_0_10px_indigo] animate-[spin_4s_linear_infinite]"
                        style={{ 
                            transform: `rotate(${i * (360/electrons)}deg) translateX(64px)`,
                            animationDelay: `${i * 0.5}s`
                        }}
                    ></div>
                ))}
            </div>
            <div className="flex gap-4 mt-8">
                <button onClick={()=>setElectrons(e => Math.max(1, e-1))} className="w-10 h-10 bg-gray-100 rounded-xl font-black">-</button>
                <div className="flex flex-col items-center">
                    <span className="text-[8px] font-black text-gray-400">ELECTRONS</span>
                    <span className="text-xl font-black">{electrons}</span>
                </div>
                <button onClick={()=>setElectrons(e => Math.min(8, e+1))} className="w-10 h-10 bg-indigo-600 text-white rounded-xl font-black">+</button>
            </div>
        </div>
    );
};
