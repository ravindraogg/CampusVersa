import React, { useState } from 'react';
import { Flame, Droplets, Zap, Eye, Search, MoveRight, RotateCcw, Box, Network, Activity } from 'lucide-react';

// 1. Quicklime and Water (Exothermic)
export const ExothermicLab = () => {
    const [water, setWater] = useState(false);
    return (
        <div className="p-6 bg-white rounded-3xl border border-gray-100 shadow-sm h-full flex flex-col items-center">
            <div className="w-24 h-32 border-4 border-gray-200 rounded-b-2xl relative mb-8 flex items-end justify-center p-2 overflow-hidden bg-white shadow-inner">
                <div className="w-full h-8 bg-gray-200 rounded-sm mb-1"></div>
                {water && <div className="absolute inset-0 bg-blue-400/20 animate-in fade-in duration-500"></div>}
                {water && <div className="absolute top-1/2 flex flex-col gap-1 animate-bounce opacity-40 text-red-400"><Activity size={16} /><Activity size={16} /></div>}
            </div>
            <button onClick={()=>setWater(true)} className="px-6 py-2 bg-blue-600 text-white rounded-xl font-bold text-sm shadow-md">Add Water to CaO</button>
            {water && <p className="mt-4 text-xs font-black text-red-600 animate-pulse">Temperature Rising! Exothermic Reaction.</p>}
        </div>
    );
};

// 2. Reactivity Series (Displacement)
export const ReactivityLab = () => {
    const [metal, setMetal] = useState(null);
    const reactions = [
        { name: 'Zn in CuSO4', reacts: true, color: 'bg-blue-600/30', final: 'bg-gray-100' },
        { name: 'Cu in ZnSO4', reacts: false, color: 'bg-gray-100', final: 'bg-gray-100' },
        { name: 'Fe in CuSO4', reacts: true, color: 'bg-blue-600/30', final: 'bg-green-600/30' }
    ];
    const [status, setStatus] = useState("Drop a metal into the solution");
    const test = (r) => {
        setMetal(r);
        setStatus("Waiting...");
        setTimeout(() => { setStatus(r.reacts ? `Reaction occurred! ${r.name}` : "No Reaction."); }, 2000);
    };
    return (
        <div className="p-6 bg-white rounded-3xl border border-gray-100 shadow-sm h-full flex flex-col items-center">
            <div className={`w-20 h-32 border-4 border-gray-100 rounded-b-2xl relative mb-8 overflow-hidden transition-colors duration-[3000ms] ${metal && status.includes('Reaction') ? metal.final : metal ? metal.color : 'bg-transparent'}`}>
                {metal && !status.includes('Reaction') && <div className="absolute top-2 left-1/2 -translate-x-1/2 w-4 h-4 bg-gray-400 rounded-full animate-bounce"></div>}
            </div>
            <div className="grid grid-cols-1 gap-2 w-full">
                {reactions.map(r => (
                    <button key={r.name} onClick={()=>test(r)} className="py-2 bg-gray-50 border rounded-xl text-[10px] font-bold hover:bg-blue-50">{r.name}</button>
                ))}
            </div>
            <p className="mt-4 text-[10px] font-black text-gray-500 uppercase">{status}</p>
        </div>
    );
};

// 3. Stomata Observation
export const StomataLab = () => {
    const [zoom, setZoom] = useState(1);
    return (
        <div className="p-6 bg-white rounded-3xl border border-gray-100 shadow-sm h-full flex flex-col items-center">
            <div className="w-full h-40 bg-gray-900 rounded-2xl relative overflow-hidden mb-6 flex items-center justify-center">
                <div className="transition-transform duration-500" style={{ transform: `scale(${zoom})` }}>
                    <div className="grid grid-cols-4 gap-4">
                        {Array(8).fill(0).map((_,i)=>(
                            <div key={i} className="w-10 h-16 border-2 border-green-800 rounded-full bg-green-400/20 relative flex items-center justify-center">
                                <div className="w-2 h-10 bg-green-900/40 rounded-full"></div>
                                <div className="absolute w-1 h-1 bg-black rounded-full" style={{ opacity: zoom > 2 ? 1 : 0 }}></div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
            <input type="range" min="1" max="5" step="0.1" value={zoom} onChange={(e)=>setZoom(e.target.value)} className="w-full accent-green-600" />
            <p className="mt-2 text-[10px] text-gray-400">Magnify leaf peel to observe guard cells and stomata.</p>
        </div>
    );
};

// 4. Ohm's Law (V = IR)
export const OhmsLawLab = () => {
    const [v, setV] = useState(2);
    const r = 10;
    const i = (v / r).toFixed(2);
    return (
        <div className="p-6 bg-white rounded-3xl border border-gray-100 shadow-sm h-full flex flex-col items-center">
            <div className="grid grid-cols-2 gap-8 w-full mb-8">
                <div className="bg-gray-50 p-4 rounded-2xl border flex flex-col items-center">
                    <span className="text-[8px] font-black uppercase text-gray-400 mb-2">Ammeter (I)</span>
                    <div className="text-2xl font-black text-indigo-600">{i}A</div>
                </div>
                <div className="bg-gray-50 p-4 rounded-2xl border flex flex-col items-center">
                    <span className="text-[8px] font-black uppercase text-gray-400 mb-2">Voltmeter (V)</span>
                    <div className="text-2xl font-black text-red-600">{v}V</div>
                </div>
            </div>
            <div className="w-full space-y-4">
                <div className="flex flex-col gap-2">
                    <label className="text-[10px] font-bold text-gray-500">Adjust Voltage (V)</label>
                    <input type="range" min="0" max="12" step="0.5" value={v} onChange={(e)=>setV(e.target.value)} className="w-full accent-indigo-600" />
                </div>
            </div>
            <p className="mt-8 text-xs font-black text-gray-800">Resistance (R) = V / I = <span className="text-blue-600">{r} Ω</span></p>
        </div>
    );
};

// 5. Resistors in Series/Parallel
export const ResistorNetworkLab = () => {
    const [mode, setMode] = useState('Series');
    const r1 = 10, r2 = 20;
    const req = mode === 'Series' ? r1 + r2 : (r1 * r2) / (r1 + r2);
    return (
        <div className="p-6 bg-white rounded-3xl border border-gray-100 shadow-sm h-full flex flex-col items-center">
            <div className="w-full h-32 bg-gray-50 rounded-2xl relative mb-8 flex items-center justify-center p-4 border border-gray-100">
                {mode === 'Series' ? (
                    <div className="flex items-center gap-1 w-full justify-center">
                        <div className="w-10 h-0.5 bg-gray-400"></div>
                        <div className="px-2 py-1 bg-indigo-600 text-white rounded text-[8px] font-bold">10Ω</div>
                        <div className="w-4 h-0.5 bg-gray-400"></div>
                        <div className="px-2 py-1 bg-indigo-600 text-white rounded text-[8px] font-bold">20Ω</div>
                        <div className="w-10 h-0.5 bg-gray-400"></div>
                    </div>
                ) : (
                    <div className="flex flex-col gap-4 items-center">
                        <div className="flex items-center gap-1">
                             <div className="w-10 h-0.5 bg-gray-400"></div>
                             <div className="px-2 py-1 bg-indigo-600 text-white rounded text-[8px] font-bold">10Ω</div>
                             <div className="w-10 h-0.5 bg-gray-400"></div>
                        </div>
                        <div className="flex items-center gap-1">
                             <div className="w-10 h-0.5 bg-gray-400"></div>
                             <div className="px-2 py-1 bg-indigo-600 text-white rounded text-[8px] font-bold">20Ω</div>
                             <div className="w-10 h-0.5 bg-gray-400"></div>
                        </div>
                    </div>
                )}
            </div>
            <div className="flex gap-2 w-full">
                <button onClick={()=>setMode('Series')} className={`flex-1 py-2 rounded-xl text-xs font-bold ${mode === 'Series' ? 'bg-indigo-600 text-white shadow-md' : 'bg-gray-100'}`}>Series</button>
                <button onClick={()=>setMode('Parallel')} className={`flex-1 py-2 rounded-xl text-xs font-bold ${mode === 'Parallel' ? 'bg-indigo-600 text-white shadow-md' : 'bg-gray-100'}`}>Parallel</button>
            </div>
            <p className="mt-6 text-sm font-black text-indigo-900">Req = {req.toFixed(2)} Ω</p>
        </div>
    );
};

// 6. Focal Length (Concave Mirror)
export const FocalLengthLab = () => {
    const [u, setU] = useState(40);
    const f = 20;
    const v = (1 / ((1/f) - (1/u)));
    return (
        <div className="p-6 bg-white rounded-3xl border border-gray-100 shadow-sm h-full flex flex-col items-center">
            <div className="w-full h-40 bg-gray-900 rounded-2xl relative overflow-hidden mb-6 flex items-center p-4">
                <div className="w-2 h-20 bg-gray-300 rounded-l-full absolute right-4 shadow-[0_0_20px_#fff]"></div>
                <div className="absolute left-10 flex flex-col items-center transition-all duration-300" style={{ transform: `translateX(${u*2}px)` }}>
                    <div className="w-2 h-10 bg-orange-500 shadow-[0_0_10px_#f97316]"></div>
                    <span className="text-[8px] font-bold text-white mt-1">Object</span>
                </div>
                {u > f && (
                    <div className="absolute right-20 flex flex-col items-center transition-all duration-300" style={{ transform: `translateX(${-v*1.5}px) scaleY(${-v/u})` }}>
                        <div className="w-1.5 h-10 bg-indigo-400 opacity-60"></div>
                        <span className="text-[8px] font-bold text-white mt-1">Image</span>
                    </div>
                )}
            </div>
            <input type="range" min="25" max="100" value={u} onChange={(e)=>setU(e.target.value)} className="w-full accent-orange-600" />
            <div className="grid grid-cols-2 gap-4 w-full mt-4 text-[10px] font-black uppercase text-gray-500">
                <div>Object Dist (u): {u}cm</div>
                <div>Image Dist (v): {v.toFixed(1)}cm</div>
            </div>
        </div>
    );
};

// 7. Refraction (Glass Slab)
export const RefractionLab = () => {
    const [angle, setAngle] = useState(30);
    return (
        <div className="p-6 bg-white rounded-3xl border border-gray-100 shadow-sm h-full flex flex-col items-center">
            <div className="w-full h-48 relative flex items-center justify-center">
                <div className="w-40 h-24 bg-blue-100/30 border-2 border-blue-200 rounded-sm backdrop-blur-sm relative z-10">
                     <div className="absolute inset-0 flex items-center justify-center text-[10px] font-black text-blue-800/20 uppercase tracking-widest">Glass Slab</div>
                </div>
                <div className="absolute w-1 h-64 bg-gray-200 border-dashed z-0"></div>
                <div className="absolute w-80 h-1 bg-red-600 origin-center transition-all duration-500" style={{ transform: `rotate(${angle}deg) translateX(-40px)` }}></div>
                <div className="absolute w-40 h-1 bg-red-600 origin-center transition-all duration-500 z-20" style={{ transform: `rotate(${angle/1.5}deg) scaleX(1.2)` }}></div>
            </div>
            <input type="range" min="0" max="60" value={angle} onChange={(e)=>setAngle(e.target.value)} className="w-full mt-8 accent-red-600" />
            <p className="mt-2 text-[10px] font-black text-gray-500 uppercase tracking-widest">Lateral Shift Simulation</p>
        </div>
    );
};

// 8. Tangents to Circle
export const TangentsLab = () => {
    const [pos, setPos] = useState({ x: 100, y: 0 });
    const r = 50;
    const d = Math.sqrt(pos.x**2 + pos.y**2);
    const length = Math.sqrt(d**2 - r**2);
    return (
        <div className="p-6 bg-white rounded-3xl border border-gray-100 shadow-sm h-full flex flex-col items-center">
            <div className="w-full h-48 bg-gray-50 rounded-2xl relative border flex items-center justify-center overflow-hidden mb-6" onMouseMove={(e)=>{const rect=e.currentTarget.getBoundingClientRect(); setPos({x: e.clientX-rect.left-rect.width/2, y: e.clientY-rect.top-rect.height/2})}}>
                <div className="w-24 h-24 rounded-full border-2 border-blue-600 relative"></div>
                <div className="absolute w-2 h-2 bg-red-600 rounded-full" style={{ transform: `translate(${pos.x}px, ${pos.y}px)` }}></div>
                {d > r && (
                    <svg className="absolute inset-0 w-full h-full pointer-events-none">
                        <line x1="50%" y1="50%" x2={`calc(50% + ${pos.x}px)`} y2={`calc(50% + ${pos.y}px)`} stroke="#ddd" strokeDasharray="4" />
                    </svg>
                )}
            </div>
            <p className="text-xs font-black text-blue-900">Tangent Length (PT) = <span className="text-red-600">{length.toFixed(1)} units</span></p>
            <p className="text-[10px] text-gray-400 mt-2">Move your mouse to change point P.</p>
        </div>
    );
};

// 9. Action of Heat on FeSO4
export const FeSO4Lab = () => {
    const [heat, setHeat] = useState(false);
    return (
        <div className="p-6 bg-white rounded-3xl border border-gray-100 shadow-sm h-full flex flex-col items-center">
            <div className="w-16 h-32 border-x-4 border-b-4 border-gray-100 rounded-b-2xl relative mb-8 flex flex-col items-center justify-end p-2">
                <div className={`w-full h-8 transition-colors duration-[4000ms] ${heat ? 'bg-amber-800' : 'bg-green-200'} rounded-sm`}></div>
                {heat && <div className="absolute top-4 flex flex-col gap-1 animate-bounce opacity-40"><Wind className="-rotate-90 text-gray-400" /><Wind className="-rotate-90 text-gray-400" /></div>}
            </div>
            <button onClick={()=>setHeat(!heat)} className="px-6 py-2 bg-gray-900 text-white rounded-xl font-bold text-sm">Heat Crystals</button>
            <p className="mt-4 text-[10px] text-gray-400 italic text-center">Green crystals turn brown. SO2 and SO3 gases are evolved with characteristic smell.</p>
        </div>
    );
};

// 10. CO2 in Respiration
export const RespirationLab = () => {
    const [blow, setBlow] = useState(false);
    return (
        <div className="p-6 bg-white rounded-3xl border border-gray-100 shadow-sm h-full flex flex-col items-center">
            <div className="w-20 h-32 border-4 border-gray-100 rounded-b-2xl relative mb-8 overflow-hidden">
                <div className={`absolute inset-0 transition-colors duration-[3000ms] ${blow ? 'bg-white shadow-[inset_0_0_20px_rgba(0,0,0,0.1)]' : 'bg-blue-50/20'}`}></div>
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1 h-20 bg-gray-300"></div>
            </div>
            <button onClick={()=>setBlow(true)} className="px-6 py-2 bg-blue-600 text-white rounded-xl font-bold text-sm">Exhale into Lime Water</button>
            {blow && <p className="mt-4 text-xs font-black text-gray-600 animate-pulse">Lime water turns Milky!</p>}
        </div>
    );
};

// 11. Light Through Prism
export const PrismLab = () => {
    const [angle, setAngle] = useState(45);
    const colors = ['#ff0000', '#ffa500', '#ffff00', '#008000', '#0000ff', '#4b0082', '#ee82ee'];
    return (
        <div className="p-6 bg-white rounded-3xl border border-gray-100 shadow-sm h-full flex flex-col items-center">
            <div className="w-full h-48 relative flex items-center justify-center overflow-hidden bg-gray-900 rounded-2xl">
                <div className="w-32 h-32 bg-blue-400/20 border-2 border-blue-400/40" style={{ clipPath: 'polygon(50% 0%, 0% 100%, 100% 100%)' }}></div>
                <div className="absolute w-60 h-0.5 bg-white origin-right right-1/2 top-1/2 -translate-y-4 transition-transform" style={{ transform: `rotate(${angle}deg)` }}></div>
                {angle > 30 && (
                    <div className="absolute left-1/2 top-1/2 -translate-y-4">
                        {colors.map((c, i) => (
                            <div key={i} className="w-40 h-1 origin-left transition-all duration-700" style={{ backgroundColor: c, transform: `rotate(${(i-3)*2}deg)` }}></div>
                        ))}
                    </div>
                )}
            </div>
            <input type="range" min="20" max="60" value={angle} onChange={(e)=>setAngle(e.target.value)} className="w-full mt-8 accent-white" />
            <p className="mt-2 text-[10px] text-gray-400 uppercase tracking-widest font-black">Dispersion of Light</p>
        </div>
    );
};

// 12. BPT Theorem
export const BPTLab = () => {
    const [h, setH] = useState(50);
    return (
        <div className="p-6 bg-white rounded-3xl border border-gray-100 shadow-sm h-full flex flex-col items-center">
            <div className="w-full h-48 relative flex items-center justify-center border-b-2 border-gray-100">
                <div className="w-40 h-40 border-2 border-indigo-600 relative" style={{ clipPath: 'polygon(50% 0%, 0% 100%, 100% 100%)' }}>
                    <div className="absolute w-full h-0.5 bg-rose-500 shadow-sm" style={{ top: `${h}%` }}></div>
                </div>
            </div>
            <input type="range" min="20" max="80" value={h} onChange={(e)=>setH(e.target.value)} className="w-full mt-8 accent-rose-500" />
            <div className="grid grid-cols-2 gap-4 w-full mt-6 text-[10px] font-black">
                <div className="text-indigo-600">AD/DB = {(h/(100-h)).toFixed(2)}</div>
                <div className="text-rose-600">AE/EC = {(h/(100-h)).toFixed(2)}</div>
            </div>
        </div>
    );
};

// 13. Database Table (OpenOffice Base)
export const DatabaseLab = () => {
    const [rows, setRows] = useState([{ id: 1, name: 'Alice', age: 15 }, { id: 2, name: 'Bob', age: 16 }]);
    return (
        <div className="p-6 bg-white rounded-3xl border border-gray-100 shadow-sm h-full flex flex-col items-center">
            <div className="w-full bg-gray-50 border rounded-xl overflow-hidden mb-4">
                <div className="bg-gray-800 text-white p-2 text-[8px] font-black flex justify-between">
                    <span>TABLE: STUDENTS</span>
                    <Table size={10} />
                </div>
                <table className="w-full text-[10px]">
                    <thead className="bg-gray-100 border-b"><tr><th className="p-2">ID</th><th className="p-2">NAME</th><th className="p-2">AGE</th></tr></thead>
                    <tbody className="divide-y">
                        {rows.map(r => (
                            <tr key={r.id}><td className="p-2">{r.id}</td><td className="p-2">{r.name}</td><td className="p-2">{r.age}</td></tr>
                        ))}
                    </tbody>
                </table>
            </div>
            <button onClick={()=>setRows([...rows, { id: rows.length+1, name: 'New User', age: 14 }])} className="w-full py-2 bg-indigo-600 text-white rounded-xl font-bold text-xs">+ Insert Row (SQL)</button>
        </div>
    );
};

// 14. Blog Publishing
export const BlogLab = () => {
    const [published, setPublished] = useState(false);
    return (
        <div className="p-6 bg-white rounded-3xl border border-gray-100 shadow-sm h-full flex flex-col items-center">
            <div className="w-full bg-gray-50 border rounded-xl p-4 mb-4 min-h-[120px]">
                {published ? (
                    <div className="animate-in fade-in slide-in-from-top">
                        <h3 className="text-sm font-black text-indigo-900 border-b pb-2 mb-2">My First Lab Blog</h3>
                        <p className="text-[10px] text-gray-600">Published on: {new Date().toLocaleDateString()}</p>
                        <p className="text-[10px] mt-2 leading-relaxed">Today I learned about chemical reactions in the virtual lab! It was amazing to see crystals change color...</p>
                    </div>
                ) : (
                    <div className="flex flex-col gap-2">
                        <div className="w-full h-4 bg-gray-200 rounded"></div>
                        <div className="w-full h-12 bg-gray-200 rounded"></div>
                        <div className="w-20 h-4 bg-gray-200 rounded"></div>
                    </div>
                )}
            </div>
            <button onClick={()=>setPublished(!published)} className={`w-full py-2 rounded-xl font-bold text-xs shadow-md transition-all ${published ? 'bg-red-50 text-red-600' : 'bg-gray-900 text-white'}`}>{published ? 'Unpublish' : 'Publish to Web'}</button>
        </div>
    );
};
