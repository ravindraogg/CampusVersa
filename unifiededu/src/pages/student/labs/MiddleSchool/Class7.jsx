import React, { useState } from 'react';
import { Sun, Thermometer, Flame, Droplets, Zap, Eye, RotateCcw, Box, Wind, Sparkles } from 'lucide-react';

// 1. Photosynthesis (Black Paper)
export const PhotosynthesisLab = () => {
    const [covered, setCovered] = useState(false);
    const [iodine, setIodine] = useState(false);
    return (
        <div className="p-6 bg-white rounded-3xl border border-gray-100 shadow-sm h-full flex flex-col items-center">
            <div className="w-full h-40 bg-green-50 rounded-2xl relative flex items-center justify-center mb-6 overflow-hidden">
                <Sun className="absolute top-2 right-2 text-yellow-400 animate-pulse" />
                <div className={`w-32 h-20 bg-green-500 rounded-[2rem] relative border-2 border-green-600 transition-colors duration-1000 ${iodine ? 'bg-blue-900' : ''}`}>
                    {covered && !iodine && <div className="absolute inset-y-0 left-1/3 right-1/3 bg-gray-900 shadow-xl"></div>}
                    {iodine && <div className={`absolute inset-y-0 left-1/3 right-1/3 ${covered ? 'bg-green-500' : 'bg-blue-900'}`}></div>}
                </div>
            </div>
            <div className="flex gap-2">
                {!covered && <button onClick={() => setCovered(true)} className="px-4 py-2 bg-gray-900 text-white rounded-xl text-xs font-bold">Cover Part of Leaf</button>}
                {covered && <button onClick={() => setIodine(true)} className="px-4 py-2 bg-blue-600 text-white rounded-xl text-xs font-bold">Test with Iodine</button>}
            </div>
            {iodine && <p className="mt-4 text-[10px] text-gray-400 italic text-center">The covered part remains green/brown (no starch), while the exposed part turns blue-black.</p>}
        </div>
    );
};

// 2. Thermometer Lab
export const ThermometerLab = () => {
    const [temp, setTemp] = useState(25);
    return (
        <div className="p-6 bg-white rounded-3xl border border-gray-100 shadow-sm h-full flex flex-col items-center">
            <div className="flex gap-8 items-end h-40 mb-8">
                <div className="w-8 h-32 bg-gray-100 rounded-full relative border-2 border-gray-200">
                    <div className="absolute bottom-0 w-full bg-red-500 rounded-full transition-all duration-500" style={{ height: `${temp}%` }}></div>
                    <div className="absolute -right-8 top-0 h-full flex flex-col justify-between text-[8px] font-bold text-gray-400">
                        <span>100</span><span>75</span><span>50</span><span>25</span><span>0</span>
                    </div>
                </div>
                <div className="w-20 h-24 bg-blue-100 border-2 border-blue-200 rounded-b-xl relative">
                    <div className="absolute bottom-0 w-full bg-blue-400/20" style={{ height: '80%' }}></div>
                    <div className="text-[10px] font-bold text-blue-800 text-center mt-2">Hot Water</div>
                </div>
            </div>
            <input type="range" value={temp} onChange={(e)=>setTemp(e.target.value)} className="w-full accent-red-600" />
            <p className="mt-2 text-xl font-black text-gray-800">{temp}°C</p>
        </div>
    );
};

// 3. Heat Conduction
export const ConductionLab = () => {
    const [heat, setHeat] = useState(0);
    const drops = [20, 50, 80];
    return (
        <div className="p-6 bg-white rounded-3xl border border-gray-100 shadow-sm h-full flex flex-col items-center">
            <div className="w-full h-24 bg-gray-200 rounded-full relative mb-8 flex items-center p-2">
                <div className="w-4 h-4 bg-red-500 rounded-full animate-pulse shadow-lg shadow-red-200"></div>
                {drops.map((d, i) => (
                    <div key={i} className={`w-3 h-3 bg-amber-100 rounded-full absolute transition-all duration-1000 ${heat > d ? 'translate-y-20 opacity-0' : ''}`} style={{ left: `${d}%` }}></div>
                ))}
                <div className="absolute left-4 right-4 h-1 bg-gray-400 -z-10"></div>
            </div>
            <button onClick={() => setHeat(h => h + 10)} className="px-6 py-2 bg-red-600 text-white rounded-xl font-bold text-sm">Heat the Rod</button>
        </div>
    );
};

// 4. Litmus Test
export const LitmusLab = () => {
    const [paper, setPaper] = useState('blue');
    const [result, setResult] = useState(null);
    const test = (type) => {
        if (type === 'Acid') setResult(paper === 'blue' ? 'red' : 'red');
        else setResult(paper === 'red' ? 'blue' : 'blue');
    };
    return (
        <div className="p-6 bg-white rounded-3xl border border-gray-100 shadow-sm h-full flex flex-col items-center">
            <div className="flex gap-4 mb-8">
                <div className={`w-4 h-24 rounded-sm shadow-sm transition-colors duration-500 ${result || (paper === 'blue' ? 'bg-blue-500' : 'bg-red-500')}`}></div>
            </div>
            <div className="flex gap-2 mb-4">
                <button onClick={()=>setPaper('blue')} className="px-3 py-1 bg-blue-50 text-blue-600 rounded-lg text-[10px] font-bold">Use Blue Litmus</button>
                <button onClick={()=>setPaper('red')} className="px-3 py-1 bg-red-50 text-red-600 rounded-lg text-[10px] font-bold">Use Red Litmus</button>
            </div>
            <div className="grid grid-cols-2 gap-2 w-full">
                <button onClick={()=>test('Acid')} className="py-2 bg-gray-50 border rounded-xl text-[10px] font-bold">Dip in Lemon Juice</button>
                <button onClick={()=>test('Base')} className="py-2 bg-gray-50 border rounded-xl text-[10px] font-bold">Dip in Soap Sol.</button>
            </div>
        </div>
    );
};

// 5. Turmeric Indicator
export const TurmericLab = () => {
    const [color, setColor] = useState('bg-yellow-400');
    return (
        <div className="p-6 bg-white rounded-3xl border border-gray-100 shadow-sm h-full flex flex-col items-center">
            <div className={`w-32 h-32 rounded-2xl shadow-inner transition-colors duration-1000 ${color} mb-8 flex items-center justify-center`}>
                <span className="text-[10px] font-black uppercase text-white/50 tracking-widest">Turmeric Paper</span>
            </div>
            <div className="grid grid-cols-2 gap-2 w-full">
                <button onClick={()=>setColor('bg-yellow-400')} className="py-2 bg-yellow-50 text-yellow-700 rounded-xl text-[10px] font-bold">Add Acid (Lemon)</button>
                <button onClick={()=>setColor('bg-red-600')} className="py-2 bg-red-50 text-red-700 rounded-xl text-[10px] font-bold">Add Base (Soap)</button>
            </div>
        </div>
    );
};

// 6. Magnesium Burning
export const MagnesiumLab = () => {
    const [burning, setBurning] = useState(false);
    const [ash, setAsh] = useState(false);
    return (
        <div className="p-6 bg-white rounded-3xl border border-gray-100 shadow-sm h-full flex flex-col items-center">
            <div className="w-full h-40 bg-gray-900 rounded-2xl relative flex items-center justify-center overflow-hidden mb-6">
                {!ash ? (
                    <div className={`w-32 h-1 bg-gray-300 shadow-[0_0_20px_rgba(255,255,255,0.5)] transition-all ${burning ? 'scale-x-0 opacity-0 duration-[3000ms] shadow-[0_0_100px_#fff]' : ''}`}></div>
                ) : (
                    <div className="w-16 h-4 bg-white/40 blur-sm rounded-full"></div>
                )}
                {burning && <div className="absolute inset-0 bg-white/20 animate-pulse"></div>}
            </div>
            <button 
                onClick={() => {setBurning(true); setTimeout(()=>{setBurning(false); setAsh(true);}, 3000);}}
                className="px-6 py-2 bg-gray-700 text-white rounded-xl font-bold text-sm disabled:opacity-50"
                disabled={burning || ash}
            >
                Burn Ribbon
            </button>
            {ash && <button onClick={()=>{setAsh(false); setBurning(false);}} className="mt-4 text-[10px] text-blue-600 font-bold underline">Reset</button>}
        </div>
    );
};

// 7. Iron & CuSO4
export const ChemicalChangeLab = () => {
    const [nail, setNail] = useState(false);
    return (
        <div className="p-6 bg-white rounded-3xl border border-gray-100 shadow-sm h-full flex flex-col items-center">
            <div className="w-24 h-32 border-4 border-blue-50 rounded-b-2xl relative mb-8 overflow-hidden">
                <div className={`absolute inset-0 transition-colors duration-[5000ms] ${nail ? 'bg-green-600/30' : 'bg-blue-600/30'}`}></div>
                {nail && <div className="absolute top-1/2 left-1/2 -translate-x-1/2 w-2 h-20 bg-amber-800 rounded-full shadow-lg"></div>}
            </div>
            <button onClick={()=>setNail(true)} className="px-6 py-2 bg-blue-600 text-white rounded-xl font-bold text-sm">Drop Iron Nail</button>
        </div>
    );
};

// 8. Electromagnet
export const ElectromagnetLab = () => {
    const [on, setOn] = useState(false);
    const pins = [1, 2, 3, 4, 5];
    return (
        <div className="p-6 bg-white rounded-3xl border border-gray-100 shadow-sm h-full flex flex-col items-center">
            <div className="w-full h-40 relative flex items-center justify-center">
                <div className="w-32 h-4 bg-gray-700 rounded-full relative">
                    <div className="absolute inset-0 flex gap-0.5 px-2">
                        {Array(20).fill(0).map((_,i)=><div key={i} className={`w-0.5 h-6 -mt-1 border-x border-orange-400 ${on ? 'opacity-100' : 'opacity-40'}`}></div>)}
                    </div>
                </div>
                <div className="absolute bottom-4 flex gap-2">
                    {pins.map(p => (
                        <div key={p} className={`w-1 h-4 bg-gray-400 transition-all duration-500 ${on ? '-translate-y-24 rotate-45' : ''}`}></div>
                    ))}
                </div>
            </div>
            <button onClick={()=>setOn(!on)} className={`px-8 py-2 rounded-xl font-black text-sm shadow-md transition-all ${on ? 'bg-red-600 text-white' : 'bg-gray-100 text-gray-500'}`}>{on ? 'OFF' : 'ON'}</button>
        </div>
    );
};

// 9. Newton's Disc
export const NewtonDiscLab = () => {
    const [spinning, setSpinning] = useState(false);
    const colors = ['#ff0000', '#ff7f00', '#ffff00', '#00ff00', '#0000ff', '#4b0082', '#8b00ff'];
    return (
        <div className="p-6 bg-white rounded-3xl border border-gray-100 shadow-sm h-full flex flex-col items-center">
            <div className={`w-40 h-40 rounded-full relative overflow-hidden mb-8 border-4 border-gray-100 transition-all duration-[2000ms] ease-in-out ${spinning ? 'rotate-[1440deg]' : ''}`}>
                <div className="absolute inset-0">
                    {colors.map((c, i) => (
                        <div key={i} className="absolute inset-0 origin-center" style={{ backgroundColor: c, clipPath: `polygon(50% 50%, ${50 + 50 * Math.cos((i * 360/7) * Math.PI/180)}% ${50 + 50 * Math.sin((i * 360/7) * Math.PI/180)}%, ${50 + 50 * Math.cos(((i+1) * 360/7) * Math.PI/180)}% ${50 + 50 * Math.sin(((i+1) * 360/7) * Math.PI/180)}%)` }}></div>
                    ))}
                </div>
                {spinning && <div className="absolute inset-0 bg-white/80 backdrop-blur-sm"></div>}
            </div>
            <button onClick={()=>{setSpinning(true); setTimeout(()=>setSpinning(false), 3000);}} className="px-6 py-2 bg-indigo-600 text-white rounded-xl font-bold text-sm">Spin Disc</button>
        </div>
    );
};

// 10. Congruence by Superposition
export const CongruenceLab = () => {
    const [overlap, setOverlap] = useState(0);
    return (
        <div className="p-6 bg-white rounded-3xl border border-gray-100 shadow-sm h-full flex flex-col items-center">
            <div className="w-full h-40 relative flex items-center justify-center">
                <div className="w-24 h-24 bg-blue-500/20 border-2 border-blue-500 absolute rotate-12"></div>
                <div 
                    className="w-24 h-24 bg-rose-500/20 border-2 border-rose-500 absolute transition-all duration-1000"
                    style={{ 
                        transform: `translate(${100 - overlap}% , -${overlap}%) rotate(${12 - (overlap * 0.12)}deg)`,
                        left: `${overlap}%`,
                        opacity: 0.8
                    }}
                ></div>
            </div>
            <input type="range" value={overlap} onChange={(e)=>setOverlap(e.target.value)} className="w-full mt-8 accent-indigo-600" />
            <p className="mt-2 text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                {overlap > 95 ? 'Triangles are Congruent!' : 'Drag to check Superposition'}
            </p>
        </div>
    );
};

// 11. Basic HTML Page (Web Dev)
export const HTMLLab = () => {
    const [code, setCode] = useState('<h1>Hello World</h1>\n<ul>\n  <li>Apples</li>\n  <li>Oranges</li>\n</ul>');
    return (
        <div className="p-6 bg-white rounded-3xl border border-gray-100 shadow-sm h-full flex flex-col items-center">
            <div className="w-full bg-gray-900 rounded-xl p-4 font-mono text-[10px] text-green-400 mb-6 shadow-xl min-h-[100px]">
                <textarea 
                    value={code} 
                    onChange={(e)=>setCode(e.target.value)}
                    className="w-full bg-transparent border-none outline-none text-white resize-none"
                    rows={4}
                />
            </div>
            <div className="w-full bg-white border border-gray-100 rounded-xl p-4 min-h-[100px] shadow-inner overflow-auto">
                <span className="text-[8px] font-black text-gray-300 uppercase absolute mt-[-28px]">Preview</span>
                <div dangerouslySetInnerHTML={{ __html: code }} className="text-xs prose prose-sm max-w-none" />
            </div>
        </div>
    );
};
