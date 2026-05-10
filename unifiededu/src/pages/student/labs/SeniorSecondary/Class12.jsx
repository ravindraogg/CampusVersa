import React, { useState } from 'react';
import { Zap, Eye, RotateCcw, Box, Network, Activity, Search, Play, Table, Flame } from 'lucide-react';

// 1. Metre Bridge
export const MetreBridgeLab = () => {
    const [pos, setPos] = useState(50);
    const knownR = 10;
    const unknownR = (knownR * (100 - pos) / pos).toFixed(2);
    return (
        <div className="p-6 bg-white rounded-3xl border border-gray-100 shadow-sm h-full flex flex-col items-center">
            <div className="w-full h-24 bg-gray-100 rounded-full relative mb-8 flex items-center px-4 border border-gray-200">
                <div className="w-full h-1 bg-amber-800 rounded-full"></div>
                <div className="absolute h-10 w-0.5 bg-gray-900 transition-all duration-300" style={{ left: `${pos}%` }}>
                    <div className="w-4 h-4 bg-gray-900 rounded-full -ml-2 -mt-4 shadow-lg"></div>
                </div>
            </div>
            <input type="range" min="1" max="99" value={pos} onChange={(e)=>setPos(e.target.value)} className="w-full accent-amber-800" />
            <div className="mt-8 grid grid-cols-2 gap-4 w-full">
                <div className="bg-gray-50 p-4 rounded-2xl border text-center">
                    <span className="text-[8px] font-black text-gray-400">Length (l)</span>
                    <div className="text-xl font-black text-amber-900">{pos} cm</div>
                </div>
                <div className="bg-gray-50 p-4 rounded-2xl border text-center">
                    <span className="text-[8px] font-black text-gray-400">Unknown (X)</span>
                    <div className="text-xl font-black text-indigo-600">{unknownR} Ω</div>
                </div>
            </div>
        </div>
    );
};

// 2. Potentiometer (EMF Comparison)
export const PotentiometerLab = () => {
    const [activeCell, setActiveCell] = useState(1);
    const [l1, setL1] = useState(40);
    const [l2, setL2] = useState(60);
    return (
        <div className="p-6 bg-white rounded-3xl border border-gray-100 shadow-sm h-full flex flex-col items-center">
            <div className="flex gap-4 mb-8">
                <button onClick={()=>setActiveCell(1)} className={`px-4 py-2 rounded-xl text-xs font-bold ${activeCell === 1 ? 'bg-blue-600 text-white shadow-md' : 'bg-gray-100'}`}>Cell E1</button>
                <button onClick={()=>setActiveCell(2)} className={`px-4 py-2 rounded-xl text-xs font-bold ${activeCell === 2 ? 'bg-red-600 text-white shadow-md' : 'bg-gray-100'}`}>Cell E2</button>
            </div>
            <div className="w-full h-2 bg-gray-200 rounded-full relative mb-12">
                <div className={`absolute h-4 w-4 rounded-full -top-1 transition-all duration-500 ${activeCell === 1 ? 'bg-blue-600' : 'bg-red-600'}`} style={{ left: `${activeCell === 1 ? l1 : l2}%` }}></div>
            </div>
            <p className="text-sm font-black text-gray-800">EMF Ratio (E1/E2) = l1/l2 = <span className="text-indigo-600">{(l1/l2).toFixed(2)}</span></p>
        </div>
    );
};

// 3. P-N Junction (I-V Characteristics)
export const PNJunctionLab = () => {
    const [voltage, setVoltage] = useState(0);
    const isForward = voltage >= 0;
    const current = isForward ? (voltage > 0.7 ? (Math.exp(voltage-0.7)*10).toFixed(1) : 0) : 0;
    return (
        <div className="p-6 bg-white rounded-3xl border border-gray-100 shadow-sm h-full flex flex-col items-center">
            <div className="w-full h-40 bg-gray-50 rounded-2xl relative border flex items-center justify-center mb-8 overflow-hidden">
                <div className="w-full h-0.5 bg-gray-300 absolute top-1/2"></div>
                <div className="w-0.5 h-full bg-gray-300 absolute left-1/2"></div>
                <svg className="w-full h-full absolute inset-0">
                    <path d={`M 50% 50% Q 60% 50% 100% 0`} fill="none" stroke="#4f46e5" strokeWidth="2" strokeDasharray="4" />
                </svg>
                <div className="absolute w-2 h-2 bg-red-600 rounded-full transition-all duration-300" style={{ left: `${50 + voltage*5}%`, top: `${50 - current/2}%` }}></div>
            </div>
            <input type="range" min="-10" max="10" step="0.1" value={voltage} onChange={(e)=>setVoltage(parseFloat(e.target.value))} className="w-full accent-indigo-600" />
            <div className="grid grid-cols-2 gap-4 w-full mt-4">
                <div className="text-center"><span className="text-[8px] font-black text-gray-400">Voltage (V)</span><div className="text-xl font-black">{voltage}V</div></div>
                <div className="text-center"><span className="text-[8px] font-black text-gray-400">Current (mA)</span><div className="text-xl font-black text-indigo-600">{current}mA</div></div>
            </div>
        </div>
    );
};

// 4. Titration (KMnO4)
export const TitrationKMnO4Lab = () => {
    const [drops, setDrops] = useState(0);
    const endPoint = 25;
    return (
        <div className="p-6 bg-white rounded-3xl border border-gray-100 shadow-sm h-full flex flex-col items-center">
            <div className="flex gap-8 items-end mb-8">
                <div className="w-4 h-48 bg-purple-900/40 rounded-full relative overflow-hidden">
                    <div className="absolute bottom-0 w-full bg-purple-900 transition-all" style={{ height: `${100 - drops*4}%` }}></div>
                </div>
                <div className="w-20 h-24 border-4 border-gray-100 rounded-b-2xl relative overflow-hidden">
                    <div className={`absolute inset-0 transition-colors duration-1000 ${drops >= endPoint ? 'bg-purple-200' : 'bg-transparent'}`}></div>
                </div>
            </div>
            <button onClick={()=>setDrops(d=>d+1)} className="px-6 py-2 bg-purple-600 text-white rounded-xl font-bold text-sm shadow-md">Titrate</button>
            {drops >= endPoint && <p className="mt-4 text-xs font-black text-purple-600 animate-pulse">End Point: Persistent Light Pink</p>}
        </div>
    );
};

// 5. Functional Groups (Simulated)
export const FunctionalGroupLab = () => {
    const [reagent, setReagent] = useState(null);
    const tests = [
        { name: 'FeCl3 Test', group: 'Phenolic', result: 'Violet Coloration', color: 'bg-purple-900/40' },
        { name: "2,4-DNP Test", group: 'Carbonyl', result: 'Orange PPT', color: 'bg-orange-500/40' },
        { name: "Litmus Test", group: 'Carboxylic', result: 'Blue to Red', color: 'bg-red-600/40' }
    ];
    return (
        <div className="p-6 bg-white rounded-3xl border border-gray-100 shadow-sm h-full flex flex-col items-center">
            <div className={`w-20 h-32 border-4 border-gray-100 rounded-b-2xl relative mb-8 overflow-hidden transition-colors duration-1000 ${reagent ? reagent.color : 'bg-transparent'}`}>
                {reagent && <div className="absolute top-2 left-1/2 -translate-x-1/2 w-2 h-2 bg-white rounded-full animate-bounce"></div>}
            </div>
            <div className="grid grid-cols-1 gap-2 w-full">
                {tests.map(t => (
                    <button key={t.name} onClick={()=>setReagent(t)} className="py-2 bg-gray-50 border rounded-xl text-[10px] font-bold hover:bg-indigo-50">{t.name}</button>
                ))}
            </div>
            {reagent && <p className="mt-4 text-xs font-black text-indigo-900">{reagent.result} confirms {reagent.group} group.</p>}
        </div>
    );
};

// 6. DNA Isolation
export const DNAIsolationLab = () => {
    const [step, setStep] = useState(0);
    const steps = ['Grind Material', 'Add Detergent & Salt', 'Filter Extract', 'Add Chilled Ethanol'];
    return (
        <div className="p-6 bg-white rounded-3xl border border-gray-100 shadow-sm h-full flex flex-col items-center">
            <div className="w-full h-40 bg-green-50 rounded-2xl relative overflow-hidden flex items-center justify-center mb-6">
                {step === 0 && <Box className="text-green-800 animate-bounce" />}
                {step === 1 && <Droplets className="text-blue-600 animate-pulse" />}
                {step === 2 && <Search className="text-gray-400" />}
                {step === 3 && <div className="flex flex-col items-center"><div className="w-1 h-20 bg-white/80 rounded-full blur-[1px] animate-pulse"></div><span className="text-[8px] font-black text-green-900 mt-2">DNA FIBERS</span></div>}
            </div>
            <div className="flex flex-col gap-2 w-full">
                {steps.map((s,i)=><div key={i} className={`text-[9px] font-bold p-2 rounded-lg border transition-all ${step === i ? 'bg-green-600 text-white border-green-700 shadow-md scale-105' : 'bg-gray-50 text-gray-400'}`}>{i+1}. {s}</div>)}
            </div>
            <button onClick={()=>setStep(s=>Math.min(steps.length-1, s+1))} className="mt-6 px-8 py-2 bg-gray-900 text-white rounded-xl font-bold text-xs">Next Step</button>
        </div>
    );
};

// 7. SQL Terminal
export const SQLTerminalLab = () => {
    const [query, setQuery] = useState('');
    const [data, setData] = useState([{id: 1, name: 'John', age: 17}, {id: 2, name: 'Alice', age: 18}]);
    const run = () => {
        if(query.toUpperCase().includes('SELECT')) return;
        if(query.toUpperCase().includes('DELETE')) setData([]);
        if(query.toUpperCase().includes('UPDATE')) setData(d => d.map(x => ({...x, age: 19})));
    };
    return (
        <div className="p-6 bg-white rounded-3xl border border-gray-100 shadow-sm h-full flex flex-col items-center">
            <div className="w-full bg-gray-900 rounded-xl p-4 font-mono text-[10px] text-green-400 mb-6 shadow-xl min-h-[150px]">
                <p># MySQL Terminal</p>
                <div className="mt-2 text-white border-b border-white/10 pb-2 flex gap-2"><span>mysql&gt;</span><input value={query} onChange={(e)=>setQuery(e.target.value)} className="bg-transparent border-none outline-none w-full" placeholder="Type SQL..." /></div>
                <div className="mt-4">
                    <p className="text-gray-500 mb-2">Student Table:</p>
                    <table className="w-full border-t border-white/10 mt-2">
                        <thead><tr className="text-white"><th>ID</th><th>Name</th><th>Age</th></tr></thead>
                        <tbody className="text-center">{data.map(d=><tr key={d.id}><td>{d.id}</td><td>{d.name}</td><td>{d.age}</td></tr>)}</tbody>
                    </table>
                </div>
            </div>
            <button onClick={run} className="px-8 py-2 bg-indigo-600 text-white rounded-xl font-bold text-xs">Execute Query</button>
        </div>
    );
};

// 8. Pulse Activity (Advanced)
export const PulseAdvancedLab = () => {
    const [pulse, setPulse] = useState(72);
    const [exc, setExc] = useState(0);
    return (
        <div className="p-6 bg-white rounded-3xl border border-gray-100 shadow-sm h-full flex flex-col items-center">
            <div className="flex flex-col items-center mb-8">
                <Activity className={`w-16 h-16 text-red-500 transition-all`} style={{ transform: `scale(${1 + exc/100})`, animation: `pulse ${1/(1 + exc/100)}s infinite` }} />
                <div className="text-4xl font-black text-gray-800 mt-4">{Math.round(72 + exc*0.5)} <span className="text-xs text-gray-400">BPM</span></div>
            </div>
            <input type="range" value={exc} onChange={(e)=>setExc(e.target.value)} className="w-full accent-red-600" />
            <p className="mt-2 text-[10px] text-gray-400">Increase exercise intensity to see pulse rate change.</p>
            <style>{`@keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.5; } }`}</style>
        </div>
    );
};
