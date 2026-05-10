import React, { useState, useEffect } from 'react';
import { Thermometer, Droplets, Flame, Search, Box, Zap, Wind, Table, ChevronRight } from 'lucide-react';

// 1. Melting/Boiling Point
export const PhaseChangeLab = () => {
    const [heat, setHeat] = useState(0);
    return (
        <div className="p-6 bg-white rounded-3xl border border-gray-100 shadow-sm h-full flex flex-col items-center">
            <div className="flex gap-8 items-end h-40 mb-8">
                <div className="w-10 h-32 bg-gray-100 rounded-full relative border-2 border-gray-200">
                    <div className="absolute bottom-0 w-full bg-red-500 rounded-full transition-all duration-300" style={{ height: `${Math.min(heat, 100)}%` }}></div>
                </div>
                <div className="w-24 h-24 bg-blue-50 border-2 border-blue-200 relative flex items-center justify-center">
                    {heat < 1 ? <div className="grid grid-cols-3 gap-0.5 p-2">{Array(9).fill(0).map((_,i)=><div key={i} className="w-4 h-4 bg-blue-200 rounded-sm"></div>)}</div> : 
                     heat < 100 ? <div className="absolute bottom-0 w-full bg-blue-300/40" style={{ height: '80%' }}></div> :
                     <div className="flex flex-col gap-1 animate-bounce opacity-40"><Wind className="-rotate-90 text-blue-300" /><Wind className="-rotate-90 text-blue-300" /></div>}
                </div>
            </div>
            <input type="range" max="120" value={heat} onChange={(e)=>setHeat(e.target.value)} className="w-full accent-red-600" />
            <p className="mt-2 text-2xl font-black text-gray-800">{heat}°C</p>
            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">{heat <= 0 ? 'ICE' : heat >= 100 ? 'STEAM' : 'WATER'}</p>
        </div>
    );
};

// 2. Solutions, Suspensions, Colloids
export const MixtureLab = () => {
    const [type, setType] = useState(null);
    const mixtures = [
        { name: 'Salt in Water', type: 'True Solution', desc: 'Homogeneous, particles < 1nm, clear.', color: 'bg-blue-100/30' },
        { name: 'Chalk in Water', type: 'Suspension', desc: 'Heterogeneous, particles > 100nm, settles.', color: 'bg-gray-200' },
        { name: 'Milk in Water', type: 'Colloid', desc: 'Heterogeneous appearance, particles 1-100nm, Tyndall effect.', color: 'bg-white shadow-inner' }
    ];
    return (
        <div className="p-6 bg-white rounded-3xl border border-gray-100 shadow-sm h-full flex flex-col items-center">
            <div className="w-20 h-32 border-4 border-blue-50 rounded-b-2xl relative mb-8 overflow-hidden">
                <div className={`absolute inset-0 transition-all duration-500 ${type ? type.color : 'bg-transparent'}`}></div>
                {type?.type === 'Suspension' && <div className="absolute bottom-0 w-full h-4 bg-gray-400/40 blur-[1px]"></div>}
            </div>
            <div className="grid grid-cols-3 gap-2 w-full">
                {mixtures.map(m => (
                    <button key={m.name} onClick={()=>setType(m)} className="py-2 bg-gray-50 border rounded-xl text-[9px] font-bold">{m.name}</button>
                ))}
            </div>
            {type && (
                <div className="mt-6 p-4 bg-blue-50 rounded-2xl border border-blue-100 w-full animate-in zoom-in">
                    <h4 className="font-black text-xs text-blue-900">{type.type}</h4>
                    <p className="text-[10px] text-blue-700 mt-1">{type.desc}</p>
                </div>
            )}
        </div>
    );
};

// 3. Sublimation
export const SublimationLab = () => {
    const [heat, setHeat] = useState(false);
    return (
        <div className="p-6 bg-white rounded-3xl border border-gray-100 shadow-sm h-full flex flex-col items-center">
            <div className="relative w-32 h-40 flex items-center justify-center">
                <div className="w-24 h-1 bg-gray-300 absolute bottom-10"></div>
                <div className="w-20 h-20 bg-gray-100 border-2 border-gray-200 rounded-t-full rotate-180 absolute bottom-10"></div>
                {heat && <div className="absolute bottom-16 animate-pulse opacity-40"><Wind className="-rotate-90 text-purple-400" /></div>}
                {heat && <div className="absolute top-4 w-12 h-2 bg-purple-100/60 blur-sm rounded-full"></div>}
                <Flame className={`absolute bottom-0 ${heat ? 'text-orange-500 animate-bounce' : 'text-gray-200'}`} />
            </div>
            <button onClick={()=>setHeat(!heat)} className="mt-8 px-8 py-2 bg-gray-900 text-white rounded-xl font-bold text-sm">{heat ? 'STOP' : 'HEAT'}</button>
            <p className="mt-2 text-[10px] text-gray-400 italic">Ammonium Chloride sublimation simulation.</p>
        </div>
    );
};

// 4. Plant Tissues
export const TissueLab = () => {
    const [zoom, setZoom] = useState(1);
    const tissues = [
        { name: 'Parenchyma', desc: 'Living cells, thin walls, large vacuoles.', icon: '🟢' },
        { name: 'Collenchyma', desc: 'Thickened at corners, provides flexibility.', icon: '🟡' },
        { name: 'Sclerenchyma', desc: 'Dead cells, lignified walls, provides strength.', icon: '🟤' }
    ];
    const [active, setActive] = useState(tissues[0]);
    return (
        <div className="p-6 bg-white rounded-3xl border border-gray-100 shadow-sm h-full flex flex-col items-center">
            <div className="w-full h-40 bg-gray-900 rounded-2xl relative overflow-hidden mb-6 flex items-center justify-center">
                <div className="transition-transform duration-500" style={{ transform: `scale(${zoom})` }}>
                    <div className="grid grid-cols-4 gap-1">
                        {Array(16).fill(0).map((_,i)=><div key={i} className={`w-6 h-6 border ${active.name === 'Parenchyma' ? 'rounded-full bg-green-400/40' : active.name === 'Collenchyma' ? 'rounded-lg border-green-800 bg-green-200' : 'bg-amber-900/40 border-amber-950'}`}></div>)}
                    </div>
                </div>
            </div>
            <div className="flex gap-2 mb-6">
                {tissues.map(t => (
                    <button key={t.name} onClick={()=>setActive(t)} className={`px-3 py-1 rounded-full text-[9px] font-black ${active.name === t.name ? 'bg-green-600 text-white' : 'bg-gray-100 text-gray-500'}`}>{t.name}</button>
                ))}
            </div>
            <input type="range" min="1" max="4" step="0.1" value={zoom} onChange={(e)=>setZoom(e.target.value)} className="w-full accent-green-600" />
        </div>
    );
};

// 5. Archimedes Principle
export const ArchimedesLab = () => {
    const [submerged, setSubmerged] = useState(0);
    const weightInAir = 10;
    const currentWeight = weightInAir - (submerged / 20);
    return (
        <div className="p-6 bg-white rounded-3xl border border-gray-100 shadow-sm h-full flex flex-col items-center">
            <div className="flex gap-12 items-start h-48 mb-8">
                <div className="flex flex-col items-center">
                    <div className="w-8 h-24 bg-gray-100 rounded-b-xl border-2 border-gray-200 relative">
                        <div className="absolute top-2 w-full h-1 bg-red-500 transition-all duration-500" style={{ top: `${(currentWeight/weightInAir)*80}%` }}></div>
                        <div className="absolute -left-6 top-0 h-full flex flex-col justify-between text-[8px] font-bold text-gray-400"><span>10</span><span>5</span><span>0</span></div>
                    </div>
                    <span className="text-[10px] font-bold text-gray-500 mt-2">Spring Balance</span>
                </div>
                <div className="w-20 h-40 border-4 border-blue-50 rounded-b-2xl relative bg-blue-50/10 overflow-hidden">
                    <div className="absolute bottom-0 w-full bg-blue-400/20" style={{ height: '70%' }}></div>
                    <div className={`absolute left-1/2 -translate-x-1/2 w-8 h-12 bg-gray-700 rounded-lg shadow-lg transition-all duration-500`} style={{ top: `${submerged}%` }}></div>
                </div>
            </div>
            <input type="range" value={submerged} onChange={(e)=>setSubmerged(e.target.value)} className="w-full accent-blue-600" />
            <p className="mt-4 text-xs font-black text-blue-900">Apparent Weight: {currentWeight.toFixed(1)} N</p>
        </div>
    );
};

// 6. Reflection of Sound
export const SoundReflectionLab = () => {
    const [angle, setAngle] = useState(30);
    return (
        <div className="p-6 bg-white rounded-3xl border border-gray-100 shadow-sm h-full flex flex-col items-center">
            <div className="w-full h-40 relative flex items-center justify-center">
                <div className="w-40 h-2 bg-gray-800 rounded-full absolute bottom-0"></div>
                <div className="w-1 h-32 bg-gray-200 border-dashed absolute bottom-0"></div>
                <div className="w-32 h-1 bg-blue-600 rounded-full origin-right absolute right-1/2 bottom-0 transition-transform duration-500" style={{ transform: `rotate(${angle}deg)` }}>
                    <div className="absolute left-0 -top-4 text-blue-600 animate-pulse"><Wind size={16} /></div>
                </div>
                <div className="w-32 h-1 bg-red-600 rounded-full origin-left absolute left-1/2 bottom-0 transition-transform duration-500" style={{ transform: `rotate(-${angle}deg)` }}>
                   <div className="absolute right-0 -top-4 text-red-600 animate-pulse"><Wind size={16} className="rotate-180" /></div>
                </div>
            </div>
            <input type="range" min="10" max="80" value={angle} onChange={(e)=>setAngle(e.target.value)} className="w-full mt-10 accent-blue-600" />
            <p className="mt-2 text-[10px] font-black uppercase text-gray-500 tracking-widest">Angle of Incidence = Angle of Reflection = {angle}°</p>
        </div>
    );
};

// 7. Polynomial Zeroes
export const PolynomialLab = () => {
    const [a, setA] = useState(1);
    const [b, setB] = useState(-2);
    const zero = -b / a;
    return (
        <div className="p-6 bg-white rounded-3xl border border-gray-100 shadow-sm h-full flex flex-col items-center">
            <div className="w-full h-40 bg-gray-50 rounded-2xl relative border border-gray-100 overflow-hidden mb-6 flex items-center justify-center">
                <div className="w-full h-0.5 bg-gray-300 absolute top-1/2"></div>
                <div className="w-0.5 h-full bg-gray-300 absolute left-1/2"></div>
                <div className="w-full h-1 bg-blue-600 absolute transition-all duration-500" style={{ transform: `rotate(${Math.atan(a) * 180 / Math.PI}deg) translateY(${-b * 10}px)` }}></div>
                <div className="absolute w-2 h-2 bg-red-600 rounded-full shadow-lg" style={{ left: `${50 + zero * 10}%`, top: '50%', transform: 'translate(-50%, -50%)' }}></div>
            </div>
            <div className="text-sm font-black text-gray-800 mb-4">y = {a}x + ({b})</div>
            <div className="grid grid-cols-2 gap-4 w-full">
                <div className="flex flex-col gap-1"><span className="text-[8px] font-bold text-gray-400">Slope (a)</span><input type="number" value={a} onChange={(e)=>setA(e.target.value)} className="border rounded p-1 text-xs" /></div>
                <div className="flex flex-col gap-1"><span className="text-[8px] font-bold text-gray-400">Intercept (b)</span><input type="number" value={b} onChange={(e)=>setB(e.target.value)} className="border rounded p-1 text-xs" /></div>
            </div>
            <p className="mt-4 text-xs font-bold text-red-600">Zero of polynomial: {zero.toFixed(2)}</p>
        </div>
    );
};

// 8. Spreadsheet Formulas
export const SpreadsheetLab = () => {
    const [data, setData] = useState([10, 20, 30, 40]);
    const update = (i, v) => { const nd = [...data]; nd[i] = parseInt(v) || 0; setData(nd); };
    return (
        <div className="p-6 bg-white rounded-3xl border border-gray-100 shadow-sm h-full flex flex-col items-center">
            <div className="w-full border rounded-xl overflow-hidden mb-6">
                <table className="w-full text-[10px] text-left">
                    <thead className="bg-gray-50"><tr><th className="p-2">Cell</th><th className="p-2">Value</th></tr></thead>
                    <tbody className="divide-y">
                        {data.map((d, i) => (
                            <tr key={i}><td className="p-2 font-bold text-gray-400">A{i+1}</td><td className="p-2"><input type="number" value={d} onChange={(e)=>update(i, e.target.value)} className="w-full bg-transparent border-none focus:outline-none" /></td></tr>
                        ))}
                    </tbody>
                    <tfoot className="bg-blue-50/50 font-black">
                        <tr><td className="p-2">=SUM(A1:A4)</td><td className="p-2 text-blue-600">{data.reduce((a,b)=>a+b, 0)}</td></tr>
                        <tr><td className="p-2">=AVERAGE(A1:A4)</td><td className="p-2 text-blue-600">{data.reduce((a,b)=>a+b, 0) / 4}</td></tr>
                    </tfoot>
                </table>
            </div>
        </div>
    );
};

// 9. Animal Muscle Fibers
export const MuscleFiberLab = () => {
    const [type, setType] = useState('Striped');
    const fibers = {
        'Striped': { desc: 'Voluntary, long cylindrical cells, multi-nucleated.', color: 'bg-rose-100' },
        'Smooth': { desc: 'Involuntary, spindle-shaped, single nucleus.', color: 'bg-amber-50' },
        'Cardiac': { desc: 'Heart muscle, branched, rhythmic contraction.', color: 'bg-rose-50' }
    };
    return (
        <div className="p-6 bg-white rounded-3xl border border-gray-100 shadow-sm h-full flex flex-col items-center">
            <div className="w-full h-32 bg-gray-900 rounded-2xl relative overflow-hidden mb-6 flex flex-col items-center justify-center gap-2">
                {type === 'Striped' && Array(3).fill(0).map((_,i)=><div key={i} className="w-32 h-4 bg-rose-400 border-x-4 border-rose-600 flex gap-1 px-2">{Array(4).fill(0).map((_,j)=><div key={j} className="w-1 h-1 bg-rose-800 rounded-full mt-1"></div>)}</div>)}
                {type === 'Smooth' && Array(3).fill(0).map((_,i)=><div key={i} className="w-24 h-4 bg-amber-200 rounded-[50%] flex items-center justify-center"><div className="w-1 h-1 bg-amber-800 rounded-full"></div></div>)}
                {type === 'Cardiac' && <div className="w-32 h-20 border-2 border-rose-400 flex flex-col gap-2 p-2 relative"><div className="w-full h-1 bg-rose-500 absolute top-1/2"></div><div className="w-1 h-full bg-rose-500 absolute left-1/2"></div></div>}
            </div>
            <div className="flex gap-2 mb-4">
                {Object.keys(fibers).map(f => (
                    <button key={f} onClick={()=>setType(f)} className={`px-3 py-1 rounded-full text-[9px] font-black ${type === f ? 'bg-rose-600 text-white' : 'bg-gray-100'}`}>{f}</button>
                ))}
            </div>
            <p className="text-[10px] text-gray-500 italic text-center">{fibers[type].desc}</p>
        </div>
    );
};

// 10. Parallelogram Congruence
export const ParallelogramCongruenceLab = () => {
    const [split, setSplit] = useState(false);
    return (
        <div className="p-6 bg-white rounded-3xl border border-gray-100 shadow-sm h-full flex flex-col items-center">
            <div className="w-full h-40 relative flex items-center justify-center">
                <div className={`w-32 h-20 border-2 border-indigo-600 bg-indigo-50/50 relative transition-all duration-1000 ${split ? 'skew-x-0 border-none bg-transparent' : 'skew-x-[30deg]'}`}>
                    {!split ? (
                        <div className="absolute inset-0 border-t-2 border-r-2 border-indigo-600" style={{ clipPath: 'polygon(0 100%, 100% 0, 100% 100%)' }}></div>
                    ) : (
                        <>
                            <div className="w-24 h-24 bg-indigo-500/20 border-2 border-indigo-600 absolute -translate-x-10" style={{ clipPath: 'polygon(0 0, 100% 100%, 0 100%)' }}></div>
                            <div className="w-24 h-24 bg-rose-500/20 border-2 border-rose-500 absolute translate-x-10 rotate-180" style={{ clipPath: 'polygon(0 0, 100% 100%, 0 100%)' }}></div>
                        </>
                    )}
                </div>
            </div>
            <button onClick={()=>setSplit(!split)} className="mt-8 px-6 py-2 bg-indigo-600 text-white rounded-xl font-bold text-xs shadow-xl">{split ? 'Reset' : 'Cut along Diagonal'}</button>
            <p className="mt-4 text-[10px] text-gray-400 italic">Diagonal divides parallelogram into two congruent triangles.</p>
        </div>
    );
};

// 11. Digital Documentation Styles
export const TextStyleLab = () => {
    const [style, setStyle] = useState('Heading 1');
    const styles = {
        'Heading 1': 'text-2xl font-black text-indigo-900 border-b-2 border-indigo-100 pb-2',
        'Body Text': 'text-sm text-gray-600 leading-relaxed',
        'Emphasis': 'text-sm italic text-rose-600 font-bold',
        'Quotation': 'text-sm border-l-4 border-gray-300 pl-4 italic text-gray-500'
    };
    return (
        <div className="p-6 bg-white rounded-3xl border border-gray-100 shadow-sm h-full flex flex-col items-center">
            <div className="w-full bg-gray-50 rounded-2xl p-6 mb-6 min-h-[140px] shadow-inner overflow-auto">
                <p className={`transition-all duration-300 ${styles[style]}`}>
                    {style === 'Heading 1' ? 'Document Title' : 'This is a sample paragraph demonstrating how different styles change the appearance and semantics of a document.'}
                </p>
            </div>
            <div className="grid grid-cols-2 gap-2 w-full">
                {Object.keys(styles).map(s => (
                    <button key={s} onClick={()=>setStyle(s)} className={`py-1 rounded-lg text-[9px] font-black ${style === s ? 'bg-indigo-600 text-white shadow-md' : 'bg-white border text-gray-400'}`}>{s}</button>
                ))}
            </div>
        </div>
    );
};
