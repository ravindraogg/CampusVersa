import React, { useState } from 'react';
import { Ruler, Thermometer, Droplets, Zap, Eye, RotateCcw, Box, Wind, Sparkles, Play } from 'lucide-react';

// 1. Vernier Callipers
export const VernierLab = () => {
    const [pos, setPos] = useState(0);
    const mainScale = (pos / 10).toFixed(1);
    const vernierScale = (pos % 10);
    return (
        <div className="p-6 bg-white rounded-3xl border border-gray-100 shadow-sm h-full flex flex-col items-center">
            <div className="w-full h-32 bg-gray-50 rounded-2xl relative border border-gray-100 overflow-hidden mb-6 flex items-center">
                <div className="h-10 bg-gray-300 w-full absolute top-1/2 -translate-y-1/2 flex items-center px-2">
                    {Array(20).fill(0).map((_,i)=><div key={i} className="w-0.5 h-4 bg-gray-500 ml-4"></div>)}
                </div>
                <div className="h-12 bg-gray-800 w-24 absolute top-1/2 -translate-y-1/2 rounded shadow-xl transition-all duration-300" style={{ left: `${pos*2}%` }}>
                    <div className="flex justify-between px-1 mt-1 text-[6px] text-white font-bold"><span>0</span><span>5</span><span>10</span></div>
                </div>
            </div>
            <input type="range" max="40" value={pos} onChange={(e)=>setPos(e.target.value)} className="w-full accent-gray-900" />
            <div className="mt-6 text-center">
                <p className="text-xs font-black text-gray-800">Reading: {mainScale} + ({vernierScale} × 0.01) cm</p>
                <p className="text-lg font-black text-indigo-600">{(parseFloat(mainScale) + vernierScale*0.01).toFixed(2)} cm</p>
            </div>
        </div>
    );
};

// 2. Screw Gauge
export const ScrewGaugeLab = () => {
    const [rot, setRot] = useState(0);
    const pitchScale = Math.floor(rot / 100);
    const headScale = rot % 100;
    return (
        <div className="p-6 bg-white rounded-3xl border border-gray-100 shadow-sm h-full flex flex-col items-center">
            <div className="w-full h-32 relative flex items-center justify-center mb-6">
                <div className="w-40 h-8 bg-gray-200 rounded-l-full relative border-2 border-gray-300">
                    <div className="absolute right-0 h-full w-0.5 bg-gray-400"></div>
                </div>
                <div className="w-16 h-12 bg-gray-800 rounded shadow-xl transition-transform duration-300" style={{ transform: `rotate(${rot * 3.6}deg)` }}>
                    <div className="h-full w-0.5 bg-white/20 mx-auto"></div>
                </div>
            </div>
            <input type="range" max="500" value={rot} onChange={(e)=>setRot(e.target.value)} className="w-full accent-indigo-600" />
            <p className="mt-4 text-xs font-black">Diameter: {pitchScale}mm + {headScale} × 0.01mm = <span className="text-blue-600">{(pitchScale + headScale*0.01).toFixed(2)}mm</span></p>
        </div>
    );
};

// 3. Simple Pendulum (Advanced)
export const PendulumAdvancedLab = () => {
    const [length, setLength] = useState(50);
    const g = 9.8;
    const period = (2 * Math.PI * Math.sqrt(length/100 / g)).toFixed(2);
    return (
        <div className="p-6 bg-white rounded-3xl border border-gray-100 shadow-sm h-full flex flex-col items-center">
            <div className="w-full h-48 bg-gray-50 rounded-2xl relative overflow-hidden mb-6 flex justify-center">
                <div className="w-1 h-2 bg-gray-800"></div>
                <div className="w-0.5 bg-gray-400 origin-top transition-all duration-1000 animate-[pendulum_2s_infinite_ease-in-out]" style={{ height: `${length}%` }}>
                    <div className="w-4 h-4 bg-indigo-600 rounded-full absolute bottom-0 -left-2 shadow-lg"></div>
                </div>
            </div>
            <input type="range" min="20" max="80" value={length} onChange={(e)=>setLength(e.target.value)} className="w-full accent-indigo-600" />
            <p className="mt-4 text-sm font-black text-gray-800">Length: {length}cm | Time Period (T): {period}s</p>
            <style>{`@keyframes pendulum { 0%, 100% { transform: rotate(30deg); } 50% { transform: rotate(-30deg); } }`}</style>
        </div>
    );
};

// 4. Titration (NaOH vs Oxalic Acid)
export const TitrationLab = () => {
    const [drops, setDrops] = useState(0);
    const endPoint = 20;
    return (
        <div className="p-6 bg-white rounded-3xl border border-gray-100 shadow-sm h-full flex flex-col items-center">
            <div className="flex gap-12 items-end mb-8">
                <div className="w-4 h-48 bg-blue-50 border-2 border-blue-100 rounded-full relative">
                    <div className="absolute bottom-0 w-full bg-blue-200/40 transition-all" style={{ height: `${100 - (drops*4)}%` }}></div>
                </div>
                <div className="w-20 h-24 border-4 border-gray-100 rounded-b-2xl relative overflow-hidden">
                    <div className={`absolute inset-0 transition-colors duration-1000 ${drops >= endPoint ? 'bg-pink-400/40' : 'bg-transparent'}`}></div>
                    <div className="absolute bottom-0 w-full h-8 bg-blue-50/50"></div>
                </div>
            </div>
            <button onClick={()=>setDrops(d=>d+1)} className="px-6 py-2 bg-indigo-600 text-white rounded-xl font-bold text-sm shadow-md">Add Drop</button>
            {drops >= endPoint && <p className="mt-4 text-xs font-black text-pink-600 animate-pulse">End Point Reached! (Pink Coloration)</p>}
        </div>
    );
};

// 5. Chemical Equilibrium
export const EquilibriumLab = () => {
    const [conc, setConc] = useState(1);
    return (
        <div className="p-6 bg-white rounded-3xl border border-gray-100 shadow-sm h-full flex flex-col items-center">
            <div className="w-24 h-32 border-4 border-gray-100 rounded-b-2xl relative mb-8 overflow-hidden transition-colors duration-1000" style={{ backgroundColor: `rgba(153, 27, 27, ${conc/10})` }}>
                <div className="absolute inset-0 bg-red-900/10"></div>
            </div>
            <div className="flex flex-col gap-2 w-full">
                <label className="text-[10px] font-bold text-gray-500">Concentration of Fe³⁺</label>
                <input type="range" min="1" max="10" value={conc} onChange={(e)=>setConc(e.target.value)} className="w-full accent-red-800" />
            </div>
            <p className="mt-4 text-[10px] text-gray-400 italic">Observe the deepening of blood-red color as equilibrium shifts.</p>
        </div>
    );
};

// 6. Potato Osmometer
export const OsmosisLab = () => {
    const [time, setTime] = useState(0);
    return (
        <div className="p-6 bg-white rounded-3xl border border-gray-100 shadow-sm h-full flex flex-col items-center">
            <div className="w-32 h-40 bg-blue-50 rounded-2xl relative flex items-center justify-center p-4 border border-blue-100 mb-8">
                <div className="w-20 h-24 bg-amber-100 rounded-b-xl border-4 border-amber-200 relative overflow-hidden">
                    <div className="absolute bottom-0 w-full bg-blue-600/30 transition-all duration-[5000ms]" style={{ height: `${20 + time*5}%` }}></div>
                </div>
            </div>
            <button onClick={()=>setTime(t=>Math.min(10, t+1))} className="px-6 py-2 bg-indigo-600 text-white rounded-xl font-bold text-sm">Wait 1 Hour</button>
            <p className="mt-4 text-[10px] text-gray-400 italic text-center">Sugar solution inside the potato attracts water from the beaker via osmosis.</p>
        </div>
    );
};

// 7. Python n+nn+nnn
export const PythonMathLab = () => {
    const [n, setN] = useState(5);
    const nn = parseInt(`${n}${n}`);
    const nnn = parseInt(`${n}${n}${n}`);
    return (
        <div className="p-6 bg-white rounded-3xl border border-gray-100 shadow-sm h-full flex flex-col items-center">
            <div className="w-full bg-gray-900 rounded-xl p-4 font-mono text-[10px] text-green-400 mb-6 shadow-xl">
                <p># Compute n + nn + nnn</p>
                <p>n = int(input()) # {n}</p>
                <p className="text-white mt-2">val = n + int(str(n)*2) + int(str(n)*3)</p>
                <p className="text-yellow-400 mt-2">print(val) # {n + nn + nnn}</p>
            </div>
            <input type="number" value={n} onChange={(e)=>setN(e.target.value)} className="w-full border rounded p-2 text-sm text-center font-black" placeholder="Enter n" />
        </div>
    );
};

// 8. Armstrong Number
export const ArmstrongLab = () => {
    const [num, setNum] = useState(153);
    const digits = num.toString().split('').map(Number);
    const sum = digits.reduce((acc, d) => acc + d**3, 0);
    const isArmstrong = sum === parseInt(num);
    return (
        <div className="p-6 bg-white rounded-3xl border border-gray-100 shadow-sm h-full flex flex-col items-center">
            <div className="w-full bg-gray-900 rounded-xl p-4 font-mono text-[10px] text-green-400 mb-6">
                <p># Armstrong Checker (3 digits)</p>
                <div className="flex gap-2 mt-2">
                    {digits.map((d,i)=><div key={i} className="px-2 py-1 bg-white/10 rounded text-white">{d}³</div>)}
                </div>
                <p className="text-white mt-2">Sum = {sum}</p>
                <p className={`${isArmstrong ? 'text-green-400' : 'text-red-400'} mt-2 font-black`}>{isArmstrong ? 'YES, IT IS ARMSTRONG' : 'NO, IT IS NOT'}</p>
            </div>
            <input type="number" value={num} onChange={(e)=>setNum(e.target.value)} className="w-full border rounded p-2 text-sm text-center font-black" />
        </div>
    );
};
