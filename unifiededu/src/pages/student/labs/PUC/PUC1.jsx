import React, { useState } from 'react';
import { Scale, Droplets, Thermometer, Zap, Play, Activity } from 'lucide-react';

// 1. Parallelogram Law of Vectors
export const ParallelogramLawLab = () => {
    const [p, setP] = useState(50);
    const [q, setQ] = useState(50);
    const [theta, setTheta] = useState(60);
    const rad = (theta * Math.PI) / 180;
    const r = Math.sqrt(p**2 + q**2 + 2*p*q*Math.cos(rad)).toFixed(1);
    return (
        <div className="p-6 bg-white rounded-3xl border border-gray-100 shadow-sm h-full flex flex-col items-center">
            <div className="w-full h-48 relative flex items-center justify-center mb-8 bg-gray-50 rounded-2xl border">
                <svg className="w-full h-full p-4 overflow-visible">
                    <defs><marker id="arrow" markerWidth="10" markerHeight="10" refX="5" refY="5" orient="auto"><path d="M0,0 L10,5 L0,10 Z" fill="#4f46e5"/></marker></defs>
                    <line x1="50%" y1="50%" x2={`calc(50% + ${p}px)`} y2="50%" stroke="#4f46e5" strokeWidth="2" markerEnd="url(#arrow)" />
                    <line x1="50%" y1="50%" x2={`calc(50% + ${q * Math.cos(rad)}px)`} y2={`calc(50% - ${q * Math.sin(rad)}px)`} stroke="#4f46e5" strokeWidth="2" markerEnd="url(#arrow)" />
                    <line x1="50%" y1="50%" x2={`calc(50% + ${p + q * Math.cos(rad)}px)`} y2={`calc(50% - ${q * Math.sin(rad)}px)`} stroke="#f43f5e" strokeWidth="2" strokeDasharray="4" markerEnd="url(#arrow)" />
                </svg>
            </div>
            <div className="grid grid-cols-2 gap-4 w-full text-[10px]">
                <div className="flex flex-col gap-1"><span>Force P: {p}N</span><input type="range" max="100" value={p} onChange={(e)=>setP(parseInt(e.target.value))} /></div>
                <div className="flex flex-col gap-1"><span>Force Q: {q}N</span><input type="range" max="100" value={q} onChange={(e)=>setQ(parseInt(e.target.value))} /></div>
                <div className="flex flex-col gap-1 col-span-2"><span>Angle (θ): {theta}°</span><input type="range" max="180" value={theta} onChange={(e)=>setTheta(parseInt(e.target.value))} /></div>
            </div>
            <p className="mt-6 text-sm font-black text-rose-600">Resultant (R) = {r} N</p>
        </div>
    );
};

// 2. Surface Tension (Capillary Rise)
export const CapillaryRiseLab = () => {
    const [radius, setRadius] = useState(0.5);
    const tension = 0.072;
    const density = 1000;
    const g = 9.8;
    const height = (2 * tension) / (radius / 1000 * density * g) * 100;
    return (
        <div className="p-6 bg-white rounded-3xl border border-gray-100 shadow-sm h-full flex flex-col items-center">
            <div className="w-full h-40 bg-blue-50/30 rounded-2xl relative flex items-end justify-center mb-8 border-b-4 border-blue-200">
                <div className="w-4 h-full bg-white/40 border-x-2 border-gray-200 relative">
                    <div className="absolute bottom-0 w-full bg-blue-400 transition-all duration-500" style={{ height: `${height * 2}%` }}></div>
                </div>
            </div>
            <div className="flex flex-col gap-2 w-full">
                <label className="text-[10px] font-bold text-gray-500">Capillary Radius (r): {radius} mm</label>
                <input type="range" min="0.1" max="1.5" step="0.1" value={radius} onChange={(e)=>setRadius(e.target.value)} className="w-full accent-blue-600" />
            </div>
            <p className="mt-4 text-xs font-black text-indigo-900">Rise (h) = 2T / rρg = <span className="text-blue-600">{height.toFixed(2)} cm</span></p>
        </div>
    );
};

// 3. Specific Heat Capacity (Calorimetry)
export const CalorimetryLab = () => {
    const [mass, setMass] = useState(50);
    const [temp, setTemp] = useState(80);
    const waterTemp = 25;
    const finalTemp = ( (mass * 0.1 * temp) + (100 * 1 * waterTemp) ) / (mass * 0.1 + 100);
    return (
        <div className="p-6 bg-white rounded-3xl border border-gray-100 shadow-sm h-full flex flex-col items-center">
            <div className="flex gap-8 items-end h-40 mb-8">
                <div className="w-16 h-24 bg-gray-200 border-4 border-gray-300 rounded-b-xl relative overflow-hidden flex items-center justify-center">
                   <div className="text-[8px] font-black text-gray-500">HOT METAL</div>
                   <div className="absolute top-0 w-full h-full bg-red-500/20 animate-pulse"></div>
                </div>
                <div className="w-24 h-32 bg-blue-50 border-4 border-blue-200 rounded-b-xl relative">
                    <div className="absolute bottom-0 w-full bg-blue-400/20 h-full"></div>
                    <div className="absolute top-2 w-full text-center text-xs font-black text-blue-900">{finalTemp.toFixed(1)}°C</div>
                </div>
            </div>
            <div className="grid grid-cols-1 gap-4 w-full">
                <div className="flex flex-col gap-1"><span>Metal Mass: {mass}g</span><input type="range" min="10" max="100" value={mass} onChange={(e)=>setMass(e.target.value)} /></div>
                <div className="flex flex-col gap-1"><span>Metal Temp: {temp}°C</span><input type="range" min="40" max="100" value={temp} onChange={(e)=>setTemp(e.target.value)} /></div>
            </div>
        </div>
    );
};

// 4. C Programming (Simple Interest)
export const CProgrammingLab = () => {
    const [p, setP] = useState(1000);
    const [r, setR] = useState(5);
    const [t, setT] = useState(2);
    const si = (p * r * t) / 100;
    return (
        <div className="p-6 bg-white rounded-3xl border border-gray-100 shadow-sm h-full flex flex-col items-center">
            <div className="w-full bg-gray-900 rounded-xl p-4 font-mono text-[9px] text-green-400 mb-6 shadow-xl min-h-[150px]">
                <p>#include &lt;stdio.h&gt;</p>
                <p>int main() &#123;</p>
                <p className="ml-4">float P={p}, R={r}, T={t};</p>
                <p className="ml-4 text-white">float SI = (P * R * T) / 100;</p>
                <p className="ml-4 text-yellow-400">printf("Simple Interest: %.2f", SI);</p>
                <p>&#125;</p>
                <div className="mt-4 pt-2 border-t border-white/10 text-white">
                    Output: <span className="text-green-400">{si.toFixed(2)}</span>
                </div>
            </div>
            <div className="grid grid-cols-3 gap-2 w-full">
                <input type="number" value={p} onChange={(e)=>setP(e.target.value)} className="border rounded p-1 text-xs" placeholder="P" />
                <input type="number" value={r} onChange={(e)=>setR(e.target.value)} className="border rounded p-1 text-xs" placeholder="R" />
                <input type="number" value={t} onChange={(e)=>setT(e.target.value)} className="border rounded p-1 text-xs" placeholder="T" />
            </div>
        </div>
    );
};

// 5. Viscosity (Stoke's Law)
export const ViscosityLab = () => {
    const [radius, setRadius] = useState(2);
    const eta = 0.5; // Viscosity of glycerin
    const terminalVelocity = (2 * (radius/1000)**2 * (7800 - 1260) * 9.8) / (9 * eta) * 100;
    return (
        <div className="p-6 bg-white rounded-3xl border border-gray-100 shadow-sm h-full flex flex-col items-center">
            <div className="w-16 h-48 bg-amber-100/30 border-x-2 border-gray-200 relative overflow-hidden mb-8">
                <div className="absolute w-4 h-4 bg-gray-600 rounded-full left-1/2 -translate-x-1/2 animate-[fall_3s_infinite_linear]" style={{ width: `${radius*2}px`, height: `${radius*2}px` }}></div>
            </div>
            <input type="range" min="1" max="5" value={radius} onChange={(e)=>setRadius(e.target.value)} className="w-full accent-amber-600" />
            <p className="mt-4 text-[10px] font-black">Terminal Velocity: {terminalVelocity.toFixed(2)} cm/s</p>
            <style>{`@keyframes fall { 0% { top: -20px; } 100% { top: 100%; } }`}</style>
        </div>
    );
};

// 6. Boyle's Law (P-V Relationship)
export const BoylesLawLab = () => {
    const [volume, setVolume] = useState(50);
    const k = 5000;
    const pressure = (k / volume).toFixed(1);
    return (
        <div className="p-6 bg-white rounded-3xl border border-gray-100 shadow-sm h-full flex flex-col items-center">
            <div className="w-32 h-40 border-2 border-gray-300 relative mb-8 flex items-end">
                <div className="w-full bg-blue-100/40 border-t-4 border-gray-800 transition-all duration-500" style={{ height: `${volume}%` }}></div>
            </div>
            <input type="range" min="10" max="90" value={volume} onChange={(e)=>setVolume(e.target.value)} className="w-full accent-blue-600" />
            <div className="mt-6 grid grid-cols-2 gap-4 w-full text-center">
                <div><span className="text-[8px] font-bold text-gray-400">Volume (V)</span><div className="text-lg font-black">{volume} mL</div></div>
                <div><span className="text-[8px] font-bold text-gray-400">Pressure (P)</span><div className="text-lg font-black text-indigo-600">{pressure} atm</div></div>
            </div>
        </div>
    );
};

// 7. Sonometer
export const SonometerLab = () => {
    const [len, setLen] = useState(40);
    const tension = 20;
    const mu = 0.01;
    const freq = ( (1 / (2 * len/100)) * Math.sqrt(tension / mu) ).toFixed(0);
    return (
        <div className="p-6 bg-white rounded-3xl border border-gray-100 shadow-sm h-full flex flex-col items-center">
            <div className="w-full h-12 bg-amber-800/20 rounded-xl relative mb-8 flex items-center px-4">
                <div className="w-full h-0.5 bg-gray-400 shadow-[0_0_5px_white]"></div>
                <div className="absolute h-16 w-4 bg-amber-900/40 border-2 border-amber-950 rounded -top-2 transition-all" style={{ left: `${len}%` }}></div>
            </div>
            <input type="range" min="10" max="90" value={len} onChange={(e)=>setLen(e.target.value)} className="w-full accent-amber-900" />
            <p className="mt-4 text-sm font-black">Fundamental Frequency: <span className="text-rose-600">{freq} Hz</span></p>
        </div>
    );
};

// 8. Anion Analysis (Carbonate)
export const AnionAnalysisLab = () => {
    const [reagent, setReagent] = useState(false);
    return (
        <div className="p-6 bg-white rounded-3xl border border-gray-100 shadow-sm h-full flex flex-col items-center">
            <div className="w-16 h-32 border-4 border-gray-100 rounded-b-2xl relative mb-8 overflow-hidden bg-white">
                {reagent && <div className="absolute bottom-2 w-full flex flex-col items-center gap-1"><div className="w-4 h-4 bg-gray-100 rounded-full animate-bounce"></div><div className="w-4 h-4 bg-gray-100 rounded-full animate-bounce delay-75"></div></div>}
                <div className="absolute bottom-0 w-full h-8 bg-blue-50/20"></div>
            </div>
            <button onClick={()=>setReagent(true)} className="px-6 py-2 bg-indigo-600 text-white rounded-xl font-bold text-xs">Add dil. HCl</button>
            {reagent && <p className="mt-4 text-[10px] font-black text-indigo-900 uppercase">Brisk Effervescence (CO₂ gas)</p>}
        </div>
    );
};

// 9. Glass Tube Techniques
export const GlassTubeLab = () => {
    const [action, setAction] = useState(null);
    return (
        <div className="p-6 bg-white rounded-3xl border border-gray-100 shadow-sm h-full flex flex-col items-center">
            <div className="w-full h-32 bg-gray-900 rounded-2xl relative mb-6 flex items-center justify-center overflow-hidden">
                <div 
                    className={`w-40 h-2 bg-blue-100/40 rounded-full transition-all duration-1000 ${action === 'Bend' ? 'rotate-45' : action === 'Cut' ? 'w-20' : ''}`}
                    style={{ filter: action === 'Polish' ? 'blur(1px)' : 'none' }}
                ></div>
                {action === 'Bend' && <Flame className="absolute text-orange-500 animate-pulse" />}
            </div>
            <div className="grid grid-cols-3 gap-2 w-full">
                <button onClick={()=>setAction('Cut')} className="py-2 bg-gray-100 rounded-xl text-[10px] font-bold">Cutting</button>
                <button onClick={()=>setAction('Bend')} className="py-2 bg-gray-100 rounded-xl text-[10px] font-bold">Bending</button>
                <button onClick={()=>setAction('Polish')} className="py-2 bg-gray-100 rounded-xl text-[10px] font-bold">Polishing</button>
            </div>
            <p className="mt-4 text-[10px] text-gray-400 italic">Simulating basic laboratory glassworking skills.</p>
        </div>
    );
};

// 10. Flowering Plants (Angiosperms)
export const PlantFloweringLab = () => {
    const [part, setPart] = useState(null);
    const parts = [
        { name: 'Calyx', desc: 'Outer whorl, protects the bud (Sepals).', color: 'bg-green-500' },
        { name: 'Corolla', desc: 'Colorful part to attract pollinators (Petals).', color: 'bg-rose-500' },
        { name: 'Androecium', desc: 'Male reproductive part (Stamen).', color: 'bg-yellow-400' },
        { name: 'Gynoecium', desc: 'Female reproductive part (Carpel).', color: 'bg-rose-900' }
    ];
    return (
        <div className="p-6 bg-white rounded-3xl border border-gray-100 shadow-sm h-full flex flex-col items-center">
            <div className="w-full h-40 bg-green-50 rounded-2xl relative flex items-center justify-center mb-6 overflow-hidden">
                <div className="w-24 h-24 rounded-full border-4 border-green-200 relative flex items-center justify-center">
                    {parts.map((p, i) => (
                        <div 
                            key={p.name} 
                            onClick={()=>setPart(p)}
                            className={`absolute w-12 h-16 rounded-full opacity-40 cursor-pointer hover:opacity-100 transition-opacity ${p.color}`}
                            style={{ transform: `rotate(${i*90}deg) translateY(-20px)` }}
                        ></div>
                    ))}
                    <div className="w-4 h-4 bg-yellow-600 rounded-full"></div>
                </div>
            </div>
            {part ? (
                <div className="p-4 bg-gray-50 rounded-2xl border w-full animate-in zoom-in">
                    <h4 className="text-xs font-black uppercase text-gray-800">{part.name}</h4>
                    <p className="text-[10px] text-gray-500 mt-1">{part.desc}</p>
                </div>
            ) : <p className="text-[10px] text-gray-400 italic">Click flower parts to identify.</p>}
        </div>
    );
};
