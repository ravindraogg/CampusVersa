import React, { useState } from 'react';
import { Brain, Cloud, Rocket, CheckCircle2, Search, Zap, Code2, Globe } from 'lucide-react';

// 1. A* Search Algorithm (AI)
export const AStarSearchLab = () => {
    const [path, setPath] = useState([]);
    const find = () => {
        setPath(['Start', 'Node A', 'Node C', 'Goal']);
    };
    return (
        <div className="p-6 bg-white rounded-3xl border border-gray-100 shadow-sm h-full flex flex-col items-center">
            <div className="w-full h-32 bg-gray-50 rounded-2xl relative mb-8 flex items-center justify-center border-2 border-dashed border-gray-200">
                <div className="flex gap-2">
                    {path.map((p, i) => (
                        <div key={i} className="flex items-center gap-2">
                            <div className="px-3 py-1 bg-gray-900 text-white rounded-lg text-[8px] font-black animate-in zoom-in">{p}</div>
                            {i < path.length - 1 && <span className="text-gray-300">→</span>}
                        </div>
                    ))}
                    {path.length === 0 && <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">A* Pathfinding Idle</span>}
                </div>
            </div>
            <button onClick={find} className="px-8 py-2 bg-indigo-600 text-white rounded-xl font-bold text-xs shadow-xl flex items-center gap-2"><Search size={14} /> Calculate Opt. Path</button>
            <p className="mt-4 text-[10px] text-gray-400 italic">f(n) = g(n) + h(n) heuristic evaluation.</p>
        </div>
    );
};

// 2. Cloud Resource Allocation (AWS/Azure style)
export const CloudAllocationLab = () => {
    const [instances, setInstances] = useState(2);
    return (
        <div className="p-6 bg-white rounded-3xl border border-gray-100 shadow-sm h-full flex flex-col items-center">
            <div className="w-full grid grid-cols-4 gap-2 mb-8">
                {Array(8).fill(0).map((_, i) => (
                    <div key={i} className={`h-12 rounded-xl border-2 flex items-center justify-center transition-all ${i < instances ? 'bg-indigo-600 border-indigo-700 shadow-lg' : 'bg-gray-50 border-gray-100 opacity-30'}`}>
                        <Cpu size={16} className={i < instances ? 'text-white' : 'text-gray-300'} />
                    </div>
                ))}
            </div>
            <div className="flex items-center gap-4 w-full">
                <button onClick={()=>setInstances(i => Math.max(0, i-1))} className="flex-1 py-2 bg-gray-100 text-gray-500 rounded-xl font-bold text-xs">- Scale Down</button>
                <button onClick={()=>setInstances(i => Math.min(8, i+1))} className="flex-1 py-2 bg-indigo-600 text-white rounded-xl font-bold text-xs shadow-md">+ Scale Up</button>
            </div>
            <p className="mt-4 text-xs font-black text-indigo-900 uppercase">Active Instances: {instances}</p>
        </div>
    );
};

// 3. Project Architecture (Full Stack)
export const ProjectArchLab = () => {
    const [layer, setLayer] = useState('Frontend');
    const components = {
        'Frontend': ['React', 'Tailwind', 'Lucide'],
        'Backend': ['Node.js', 'Express', 'JWT'],
        'Database': ['MongoDB', 'Redis', 'S3']
    };
    return (
        <div className="p-6 bg-white rounded-3xl border border-gray-100 shadow-sm h-full flex flex-col items-center">
            <div className="w-full flex flex-col gap-2 mb-8">
                {['Frontend', 'Backend', 'Database'].map(l => (
                    <div key={l} onClick={()=>setLayer(l)} className={`p-3 rounded-2xl border transition-all cursor-pointer ${layer === l ? 'bg-gray-900 border-gray-900 shadow-xl translate-x-2' : 'bg-white border-gray-100'}`}>
                        <div className="flex items-center justify-between">
                            <span className={`text-xs font-black ${layer === l ? 'text-white' : 'text-gray-400'}`}>{l}</span>
                            {layer === l && <CheckCircle2 size={14} className="text-green-400" />}
                        </div>
                        {layer === l && (
                            <div className="flex gap-1 mt-2">
                                {components[l].map(c => <span key={c} className="px-2 py-0.5 bg-white/10 rounded text-[6px] text-gray-400">{c}</span>)}
                            </div>
                        )}
                    </div>
                ))}
            </div>
            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest italic">Capstone Project Stack Designer.</p>
        </div>
    );
};
