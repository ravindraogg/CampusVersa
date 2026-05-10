import React, { useState } from 'react';
import { Zap, Eye, RotateCcw, Box, Network, Activity, Search, Play, Table, Flame } from 'lucide-react';

// 1. Meter Bridge (Specific Resistance)
export const MeterBridgeSpecLab = () => {
    const [l, setL] = useState(50);
    const R = 2; // Known resistance
    const S = (R * (100 - l) / l).toFixed(2);
    const radius = 0.02; // cm
    const length = 50; // cm
    const rho = (parseFloat(S) * Math.PI * radius**2 / length).toFixed(6);
    return (
        <div className="p-6 bg-white rounded-3xl border border-gray-100 shadow-sm h-full flex flex-col items-center">
            <div className="w-full h-2 bg-amber-800 rounded-full relative mb-8">
                <div className="absolute h-8 w-1 bg-gray-900 -top-3 transition-all duration-300" style={{ left: `${l}%` }}></div>
            </div>
            <input type="range" min="5" max="95" value={l} onChange={(e)=>setL(e.target.value)} className="w-full accent-amber-900" />
            <div className="mt-8 grid grid-cols-2 gap-4 w-full">
                <div className="bg-gray-50 p-4 rounded-2xl border text-center">
                    <span className="text-[8px] font-black text-gray-400">Resistance (S)</span>
                    <div className="text-xl font-black text-indigo-600">{S} Ω</div>
                </div>
                <div className="bg-gray-50 p-4 rounded-2xl border text-center">
                    <span className="text-[8px] font-black text-gray-400">Spec. Resistance (ρ)</span>
                    <div className="text-[10px] font-black text-rose-600">{rho} Ω·cm</div>
                </div>
            </div>
        </div>
    );
};

// 2. Transistor Characteristics (CE Mode)
export const TransistorLab = () => {
    const [vce, setVce] = useState(0);
    const [ib, setIb] = useState(50); // microA
    const ic = (ib * 0.1 * (vce > 0.7 ? (vce - 0.7) * 2 : 0)).toFixed(1);
    return (
        <div className="p-6 bg-white rounded-3xl border border-gray-100 shadow-sm h-full flex flex-col items-center">
            <div className="w-full h-40 bg-gray-900 rounded-2xl relative mb-8 overflow-hidden flex items-center justify-center">
                <div className="w-full h-0.5 bg-gray-700 absolute top-1/2"></div>
                <div className="w-0.5 h-full bg-gray-700 absolute left-1/2"></div>
                <svg className="w-full h-full absolute inset-0">
                    <path d={`M 50% 50% L ${50 + vce*5}% ${50 - ic/2}%`} fill="none" stroke="#22c55e" strokeWidth="2" />
                </svg>
            </div>
            <div className="grid grid-cols-2 gap-4 w-full">
                <div className="flex flex-col gap-1"><span className="text-[8px] font-bold text-gray-400">V_CE (V)</span><input type="range" max="10" step="0.1" value={vce} onChange={(e)=>setVce(e.target.value)} /></div>
                <div className="flex flex-col gap-1"><span className="text-[8px] font-bold text-gray-400">I_B (μA)</span><input type="range" max="100" value={ib} onChange={(e)=>setIb(e.target.value)} /></div>
            </div>
            <p className="mt-4 text-xs font-black text-green-500">I_C: {ic} mA</p>
        </div>
    );
};

// 3. Diffraction Grating (Wavelength)
export const DiffractionLab = () => {
    const [d, setD] = useState(50); // distance to screen
    const [n, setN] = useState(1); // order
    const lambda = 650e-7; // 650nm in cm
    const gratingN = 6000; // lines per cm
    const a = 1 / gratingN;
    const x = (n * lambda * d / a).toFixed(2);
    return (
        <div className="p-6 bg-white rounded-3xl border border-gray-100 shadow-sm h-full flex flex-col items-center">
            <div className="w-full h-32 bg-black rounded-2xl relative mb-8 flex items-center justify-center">
                <div className="w-1 h-full bg-red-600/20 absolute left-1/2 blur-[2px]"></div>
                <div className="w-1 h-full bg-red-600/40 absolute transition-all" style={{ left: `calc(50% + ${x*5}px)` }}></div>
                <div className="w-1 h-full bg-red-600/40 absolute transition-all" style={{ left: `calc(50% - ${x*5}px)` }}></div>
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-4 h-4 bg-red-600 rounded-full shadow-[0_0_20px_red]"></div>
            </div>
            <input type="range" min="10" max="100" value={d} onChange={(e)=>setD(e.target.value)} className="w-full accent-red-600" />
            <p className="mt-4 text-[10px] text-gray-500 uppercase tracking-widest">Fringe Separation: {x} cm</p>
        </div>
    );
};

// 4. C++ OOP (Inheritance)
export const CPPLab = () => {
    const [type, setType] = useState('Circle');
    return (
        <div className="p-6 bg-white rounded-3xl border border-gray-100 shadow-sm h-full flex flex-col items-center">
            <div className="w-full bg-gray-900 rounded-xl p-4 font-mono text-[9px] text-blue-400 mb-6 shadow-xl min-h-[160px]">
                <p>class Shape &#123; ... &#125;;</p>
                <p className="mt-2 text-white">class {type} : public Shape &#123;</p>
                <p className="ml-4">void draw() &#123; cout &lt;&lt; "Drawing {type}"; &#125;</p>
                <p>&#125;;</p>
                <div className="mt-6 w-full flex justify-center">
                    <div className={`w-12 h-12 border-2 border-green-500 animate-pulse ${type === 'Circle' ? 'rounded-full' : ''}`}></div>
                </div>
            </div>
            <div className="flex gap-2">
                <button onClick={()=>setType('Circle')} className={`px-4 py-1 rounded-xl text-xs font-black ${type === 'Circle' ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-500'}`}>Circle</button>
                <button onClick={()=>setType('Square')} className={`px-4 py-1 rounded-xl text-xs font-black ${type === 'Square' ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-500'}`}>Square</button>
            </div>
        </div>
    );
};

// 5. Zener Diode (Voltage Regulation)
export const ZenerDiodeLab = () => {
    const [vin, setVin] = useState(5);
    const vz = 6.2;
    const vout = vin > vz ? vz : vin;
    return (
        <div className="p-6 bg-white rounded-3xl border border-gray-100 shadow-sm h-full flex flex-col items-center">
            <div className="grid grid-cols-2 gap-8 w-full mb-8">
                <div className="bg-gray-50 p-4 rounded-2xl border text-center">
                    <span className="text-[8px] font-black text-gray-400">Input (Vin)</span>
                    <div className="text-xl font-black">{vin}V</div>
                </div>
                <div className="bg-gray-50 p-4 rounded-2xl border text-center">
                    <span className="text-[8px] font-black text-gray-400">Output (Vout)</span>
                    <div className={`text-xl font-black ${vin > vz ? 'text-green-600' : 'text-indigo-600'}`}>{vout.toFixed(1)}V</div>
                </div>
            </div>
            <input type="range" max="15" step="0.1" value={vin} onChange={(e)=>setVin(parseFloat(e.target.value))} className="w-full accent-indigo-600" />
            <p className="mt-4 text-[10px] text-gray-400 italic">Observe Vout stabilization after Zener breakdown ({vz}V).</p>
        </div>
    );
};

// 6. Logic Gates (Universal NAND)
export const UniversalGateLab = () => {
    const [a, setA] = useState(0);
    const [b, setB] = useState(0);
    const out = !(a & b) & 1;
    return (
        <div className="p-6 bg-white rounded-3xl border border-gray-100 shadow-sm h-full flex flex-col items-center">
            <div className="flex items-center gap-12 mb-8 h-24">
                <div className="flex flex-col gap-4">
                    <button onClick={()=>setA(a?0:1)} className={`w-8 h-8 rounded-full font-black text-xs ${a ? 'bg-indigo-600 text-white' : 'bg-gray-100'}`}>{a}</button>
                    <button onClick={()=>setB(b?0:1)} className={`w-8 h-8 rounded-full font-black text-xs ${b ? 'bg-indigo-600 text-white' : 'bg-gray-100'}`}>{b}</button>
                </div>
                <div className="px-6 py-4 bg-gray-900 text-white rounded-2xl font-black relative">
                    NAND
                    <div className="absolute -right-2 top-1/2 -translate-y-1/2 w-2 h-2 bg-gray-900 rounded-full border border-white"></div>
                </div>
                <div className={`w-10 h-10 rounded-full border-4 flex items-center justify-center font-black ${out ? 'bg-yellow-400 border-yellow-500' : 'bg-gray-50'}`}>{out}</div>
            </div>
            <p className="text-[10px] text-gray-400 uppercase tracking-widest font-bold">Universal NAND Gate Truth Table</p>
        </div>
    );
};

// 7. Potentiometer (Internal Resistance)
export const InternalResistanceLab = () => {
    const [l1, setL1] = useState(60); // Open circuit
    const [l2, setL2] = useState(40); // Closed circuit
    const R = 10;
    const r = (R * (l1 - l2) / l2).toFixed(2);
    return (
        <div className="p-6 bg-white rounded-3xl border border-gray-100 shadow-sm h-full flex flex-col items-center">
            <div className="w-full space-y-6 mb-8">
                <div className="flex flex-col gap-1"><span className="text-[8px] font-bold text-gray-400">Balancing Length l1: {l1}cm</span><input type="range" min="50" max="100" value={l1} onChange={(e)=>setL1(e.target.value)} /></div>
                <div className="flex flex-col gap-1"><span className="text-[8px] font-bold text-gray-400">Balancing Length l2: {l2}cm</span><input type="range" min="10" max="50" value={l2} onChange={(e)=>setL2(e.target.value)} /></div>
            </div>
            <p className="text-sm font-black text-indigo-900">Internal Resistance (r) = <span className="text-rose-600">{r} Ω</span></p>
        </div>
    );
};

// 8. Organic Synthesis (Aspirin Simulation)
export const AspirinSynthesisLab = () => {
    const [stage, setStage] = useState(0);
    const stages = ['Salicylic Acid + Acetic Anhydride', 'Add Conc. H₂SO₄', 'Heat at 50°C', 'Ice Bath Crystallization'];
    return (
        <div className="p-6 bg-white rounded-3xl border border-gray-100 shadow-sm h-full flex flex-col items-center">
            <div className="w-full h-32 bg-blue-50/20 rounded-2xl relative mb-6 flex items-center justify-center p-4">
                {stage === 0 && <Droplets className="text-blue-400 animate-pulse" />}
                {stage === 1 && <Flame className="text-red-500 animate-bounce" />}
                {stage === 2 && <Thermometer className="text-orange-500" />}
                {stage === 3 && <Box className="text-indigo-400 animate-in zoom-in" />}
            </div>
            <div className="w-full space-y-2">
                {stages.map((s,i)=><div key={i} className={`text-[9px] font-bold p-2 rounded-lg border transition-all ${stage === i ? 'bg-indigo-600 text-white shadow-lg' : 'bg-gray-50 text-gray-400'}`}>{s}</div>)}
            </div>
            <button onClick={()=>setStage(s=>Math.min(3, s+1))} className="mt-6 px-8 py-2 bg-gray-900 text-white rounded-xl font-bold text-xs">Next Phase</button>
        </div>
    );
};

// 9. Focal Length (Convex Mirror)
export const ConvexMirrorLab = () => {
    const [u, setU] = useState(30);
    const f = 15;
    const v = (1 / ((1/f) - (1/u)));
    return (
        <div className="p-6 bg-white rounded-3xl border border-gray-100 shadow-sm h-full flex flex-col items-center">
            <div className="w-full h-40 bg-gray-900 rounded-2xl relative overflow-hidden mb-6 flex items-center p-4">
                <div className="w-2 h-20 bg-gray-300 rounded-r-full absolute right-4 shadow-[0_0_20px_#fff]"></div>
                <div className="absolute left-10 flex flex-col items-center transition-all duration-300" style={{ transform: `translateX(${u}px)` }}>
                    <div className="w-2 h-10 bg-green-500 shadow-[0_0_10px_#22c55e]"></div>
                </div>
                <div className="absolute right-4 flex flex-col items-center transition-all duration-300" style={{ transform: `translateX(${-v}px) scaleY(${v/u})` }}>
                    <div className="w-1.5 h-10 bg-indigo-400 opacity-60"></div>
                </div>
            </div>
            <input type="range" min="10" max="60" value={u} onChange={(e)=>setU(e.target.value)} className="w-full accent-green-600" />
            <p className="mt-4 text-[10px] font-black uppercase text-gray-500">Virtual, Erect and Diminished Image</p>
        </div>
    );
};

// 10. Refractive Index of Liquid
export const LiquidRefractiveLab = () => {
    const [h, setH] = useState(10);
    const hReal = 15;
    const mu = (hReal / h).toFixed(2);
    return (
        <div className="p-6 bg-white rounded-3xl border border-gray-100 shadow-sm h-full flex flex-col items-center">
            <div className="w-32 h-40 border-4 border-blue-50 rounded-b-2xl relative bg-blue-50/10 mb-8 overflow-hidden">
                <div className="absolute bottom-0 w-full bg-blue-400/20 h-full"></div>
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 w-4 h-0.5 bg-gray-900"></div>
                <div className="absolute left-1/2 -translate-x-1/2 w-4 h-0.5 bg-rose-600 transition-all duration-500" style={{ bottom: `${h*2}px` }}></div>
            </div>
            <input type="range" min="8" max="14" step="0.1" value={h} onChange={(e)=>setH(e.target.value)} className="w-full accent-blue-600" />
            <p className="mt-4 text-xs font-black text-indigo-900">Refractive Index (μ) = Real Depth / Apparent Depth = <span className="text-rose-600">{mu}</span></p>
        </div>
    );
};

// 11. KMnO4 vs FAS (Titration)
export const TitrationLab = () => {
    const [volume, setVolume] = useState(0);
    const endPoint = 20.5;
    return (
        <div className="p-6 bg-white rounded-3xl border border-gray-100 shadow-sm h-full flex flex-col items-center">
            <div className="flex gap-12 items-start mb-8">
                <div className="w-4 h-48 bg-gray-50 border-x border-gray-200 relative">
                    <div className="absolute top-0 w-full bg-purple-500/40" style={{ height: `${100 - (volume*2)}%` }}></div>
                    <div className="absolute -left-6 top-0 h-full flex flex-col justify-between text-[6px] font-bold text-gray-400"><span>0</span><span>25</span><span>50</span></div>
                </div>
                <div className="w-20 h-24 border-x-4 border-b-4 border-gray-100 rounded-b-xl relative bg-white overflow-hidden mt-24">
                    <div className={`absolute inset-0 transition-colors duration-500 ${volume >= endPoint ? 'bg-rose-200/50' : 'bg-transparent'}`}></div>
                    <div className="absolute bottom-0 w-full bg-blue-50/20" style={{ height: '40%' }}></div>
                </div>
            </div>
            <button onClick={()=>setVolume(v => Math.min(25, v + 0.1))} className="w-full py-2 bg-purple-600 text-white rounded-xl font-bold text-xs">Add Titrant (0.1mL)</button>
            {volume >= endPoint && <p className="mt-4 text-[10px] font-black text-rose-600 uppercase">End Point Reached! (Light Pink)</p>}
        </div>
    );
};

// 12. Salt Analysis (Anion/Cation)
export const SaltAnalysisLab = () => {
    const [test, setTest] = useState(null);
    return (
        <div className="p-6 bg-white rounded-3xl border border-gray-100 shadow-sm h-full flex flex-col items-center">
            <div className="w-16 h-24 bg-gray-50 border-2 border-gray-100 rounded-lg relative mb-6 flex items-center justify-center">
                {test === 'NaOH' && <div className="w-full h-full bg-blue-100/40 animate-pulse"></div>}
                {test === 'HCl' && <div className="flex flex-col gap-1 animate-bounce"><Droplets className="text-gray-300" /></div>}
            </div>
            <div className="grid grid-cols-2 gap-2 w-full">
                <button onClick={()=>setTest('NaOH')} className="py-2 bg-gray-100 rounded-xl text-[9px] font-bold">Add NaOH</button>
                <button onClick={()=>setTest('HCl')} className="py-2 bg-gray-100 rounded-xl text-[9px] font-bold">Add dil. HCl</button>
            </div>
            {test && <p className="mt-4 text-[10px] text-indigo-900 font-bold uppercase">{test === 'NaOH' ? 'Ammonia smell (NH4+)' : 'Brisk effervescence (CO3 2-)'}</p>}
        </div>
    );
};

// 13. Pollination (Mechanisms)
export const PollinationLab = () => {
    const [agent, setAgent] = useState('Bee');
    return (
        <div className="p-6 bg-white rounded-3xl border border-gray-100 shadow-sm h-full flex flex-col items-center">
            <div className="w-full h-40 bg-green-50 rounded-2xl relative flex items-center justify-center mb-6 overflow-hidden">
                <div className="w-16 h-16 bg-rose-500 rounded-full absolute left-4"></div>
                <div className="w-16 h-16 bg-rose-500 rounded-full absolute right-4"></div>
                <div className={`absolute transition-all duration-[2000ms] ${agent === 'Bee' ? 'animate-bounce' : 'translate-x-40'}`}>
                    {agent === 'Bee' ? <Activity className="text-yellow-600" /> : <Wind className="text-blue-300" />}
                </div>
            </div>
            <div className="flex gap-2">
                <button onClick={()=>setAgent('Bee')} className={`px-4 py-1 rounded-xl text-[10px] font-black ${agent === 'Bee' ? 'bg-yellow-500 text-white' : 'bg-gray-100'}`}>Entomophily (Bee)</button>
                <button onClick={()=>setAgent('Wind')} className={`px-4 py-1 rounded-xl text-[10px] font-black ${agent === 'Wind' ? 'bg-blue-500 text-white' : 'bg-gray-100'}`}>Anemophily (Wind)</button>
            </div>
        </div>
    );
};
