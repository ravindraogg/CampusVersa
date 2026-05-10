import React, { useState } from 'react';
import { Play, Network, Layers, Shield, Database, Brain, Terminal, Cpu } from 'lucide-react';

// Subject: Data Structures with Algorithms (22MCA16)
// 1. Binary Search Tree (BST) Traversal
export const BSTLab = () => {
    const [order, setOrder] = useState('Inorder');
    const result = {
        'Inorder': '10 → 20 → 30 → 40 → 50',
        'Preorder': '30 → 20 → 10 → 40 → 50',
        'Postorder': '10 → 20 → 50 → 40 → 30'
    };
    return (
        <div className="p-6 bg-white rounded-3xl border border-gray-100 shadow-sm h-full flex flex-col items-center">
            <div className="w-full h-40 relative flex items-center justify-center mb-8">
                <div className="w-10 h-10 bg-gray-900 text-white rounded-full flex items-center justify-center font-black text-xs z-10">30</div>
                <div className="absolute top-1/2 left-1/4 -translate-y-full w-8 h-8 bg-indigo-600 text-white rounded-full flex items-center justify-center font-black text-[10px]">20</div>
                <div className="absolute top-1/2 right-1/4 -translate-y-full w-8 h-8 bg-indigo-600 text-white rounded-full flex items-center justify-center font-black text-[10px]">40</div>
                <div className="absolute bottom-4 left-4 w-6 h-6 bg-indigo-400 text-white rounded-full flex items-center justify-center font-black text-[8px]">10</div>
                <div className="absolute bottom-4 right-4 w-6 h-6 bg-indigo-400 text-white rounded-full flex items-center justify-center font-black text-[8px]">50</div>
                <svg className="absolute inset-0 pointer-events-none">
                    <line x1="50%" y1="50%" x2="25%" y2="25%" stroke="#cbd5e1" strokeWidth="1" />
                    <line x1="50%" y1="50%" x2="75%" y2="25%" stroke="#cbd5e1" strokeWidth="1" />
                </svg>
            </div>
            <div className="flex gap-1 w-full mb-6">
                {['Inorder', 'Preorder', 'Postorder'].map(o => (
                    <button key={o} onClick={()=>setOrder(o)} className={`flex-1 py-1 rounded-lg text-[8px] font-black transition-all ${order === o ? 'bg-indigo-600 text-white shadow-md' : 'bg-gray-50 text-gray-400'}`}>{o}</button>
                ))}
            </div>
            <div className="w-full bg-gray-900 rounded-xl p-3 font-mono text-[9px] text-green-400 text-center uppercase tracking-widest">{result[order]}</div>
        </div>
    );
};

// 2. Cryptography (RSA Algorithm)
export const RSALab = () => {
    const [msg, setMsg] = useState(12);
    const p = 3, q = 11, n = 33, e = 3;
    const encrypted = Math.pow(msg, e) % n;
    return (
        <div className="p-6 bg-white rounded-3xl border border-gray-100 shadow-sm h-full flex flex-col items-center">
            <div className="w-full flex flex-col gap-3 mb-8">
                <div className="p-3 bg-gray-50 rounded-2xl border flex items-center justify-between">
                    <span className="text-[8px] font-black text-gray-400">PLAIN TEXT (M)</span>
                    <input type="number" value={msg} onChange={(e)=>setMsg(parseInt(e.target.value)||0)} className="w-12 border-none bg-transparent font-black text-right outline-none" />
                </div>
                <div className="flex justify-center"><Shield className="text-indigo-400 animate-pulse" /></div>
                <div className="p-3 bg-indigo-900 rounded-2xl text-white flex items-center justify-between shadow-xl">
                    <span className="text-[8px] font-black text-white/50">CIPHER TEXT (C)</span>
                    <span className="font-black">C = {msg}^{e} mod {n} = {encrypted}</span>
                </div>
            </div>
            <p className="text-[8px] text-gray-400 italic">n = p*q (3*11=33) | e=3 | Public Key (3, 33)</p>
        </div>
    );
};

// 3. Advanced DBMS (Nested Queries & Joins)
export const SQLPG_Lab = () => {
    const [query, setQuery] = useState('SELECT * FROM Students JOIN Marks ON ...');
    return (
        <div className="p-6 bg-white rounded-3xl border border-gray-100 shadow-sm h-full flex flex-col items-center">
            <div className="w-full bg-gray-900 rounded-xl p-4 font-mono text-[10px] text-green-400 mb-6 shadow-xl min-h-[120px]">
                <p className="text-gray-500">-- PG Database Lab</p>
                <textarea 
                    value={query} 
                    onChange={(e)=>setQuery(e.target.value)}
                    className="w-full bg-transparent border-none outline-none text-white mt-2 resize-none"
                    rows={3}
                />
                <div className="mt-4 pt-2 border-t border-white/10">
                   <table className="w-full text-[8px] text-white">
                       <thead><tr className="text-gray-500 border-b border-white/5"><td>ID</td><td>NAME</td><td>MARK</td></tr></thead>
                       <tbody><tr><td>101</td><td>Ravi</td><td>95</td></tr><tr><td>102</td><td>Asha</td><td>88</td></tr></tbody>
                   </table>
                </div>
            </div>
            <button className="w-full py-2 bg-indigo-600 text-white rounded-xl font-bold text-xs flex items-center justify-center gap-2">Execute PG-SQL <Play size={12} /></button>
        </div>
    );
};

// 4. K-Means Clustering (Data Mining)
export const KMeansLab = () => {
    const [points, setPoints] = useState([
        { x: 20, y: 30, c: 0 }, { x: 40, y: 50, c: 0 },
        { x: 70, y: 80, c: 1 }, { x: 90, y: 60, c: 1 }
    ]);
    const cluster = () => {
        setPoints(points.map(p => ({ ...p, c: p.x > 50 ? 1 : 0 })));
    };
    return (
        <div className="p-6 bg-white rounded-3xl border border-gray-100 shadow-sm h-full flex flex-col items-center">
            <div className="w-full h-40 bg-gray-50 rounded-2xl relative mb-6 border overflow-hidden">
                {points.map((p, i) => (
                    <div 
                        key={i} 
                        className={`absolute w-3 h-3 rounded-full transition-colors duration-500 ${p.c === 0 ? 'bg-rose-500 shadow-[0_0_5px_rose]' : 'bg-indigo-500 shadow-[0_0_5px_indigo]'}`}
                        style={{ left: `${p.x}%`, top: `${p.y}%` }}
                    ></div>
                ))}
                <div className="absolute left-1/2 h-full w-0.5 bg-gray-200 border-dashed"></div>
            </div>
            <button onClick={cluster} className="w-full py-2 bg-gray-900 text-white rounded-xl font-bold text-xs">Run E-Step (Cluster)</button>
            <p className="mt-4 text-[10px] text-gray-400 italic">Iterative centroid refinement simulation.</p>
        </div>
    );
};

// 5. CNN Layer Visualization (Deep Learning)
export const CNNLab = () => {
    const [layer, setLayer] = useState(0);
    const layers = ['Input (28x28)', 'Conv2D (3x3)', 'MaxPooling', 'Dense (Softmax)'];
    return (
        <div className="p-6 bg-white rounded-3xl border border-gray-100 shadow-sm h-full flex flex-col items-center">
            <div className="w-full h-32 flex items-center justify-around mb-8 gap-1">
                {layers.map((l, i) => (
                    <div key={i} className="flex flex-col items-center">
                        <div 
                            className={`w-10 h-10 rounded-lg border-2 flex items-center justify-center transition-all
                                ${layer === i ? 'bg-indigo-600 border-indigo-700 shadow-xl scale-110' : 'bg-gray-50 border-gray-100'}`}
                        >
                            <Layers size={16} className={layer === i ? 'text-white' : 'text-gray-300'} />
                        </div>
                        <span className={`text-[6px] mt-2 font-black uppercase text-center ${layer === i ? 'text-indigo-900' : 'text-gray-400'}`}>{l}</span>
                    </div>
                ))}
            </div>
            <button onClick={()=>setLayer((layer+1)%4)} className="w-full py-2 bg-indigo-600 text-white rounded-xl font-bold text-xs">Next Layer Activation</button>
            <div className="mt-4 w-full grid grid-cols-8 gap-1">
                {Array(16).fill(0).map((_,i)=><div key={i} className="h-4 bg-indigo-900/10 rounded" style={{ opacity: Math.random() }}></div>)}
            </div>
        </div>
    );
};

// 6. Microservices Service Registry
export const MicroservicesLab = () => {
    const [services, setServices] = useState(['Auth', 'Payments']);
    return (
        <div className="p-6 bg-white rounded-3xl border border-gray-100 shadow-sm h-full flex flex-col items-center">
            <div className="w-full bg-gray-50 border rounded-2xl p-4 mb-6">
                <div className="flex items-center gap-2 mb-4">
                    <Database className="text-indigo-600" size={16} />
                    <span className="text-[10px] font-black uppercase text-indigo-900">Consul/Eureka Registry</span>
                </div>
                <div className="space-y-2">
                    {services.map(s => (
                        <div key={s} className="flex items-center justify-between bg-white p-2 rounded-lg border shadow-sm animate-in slide-in-from-left">
                            <span className="text-[10px] font-bold">{s}-service:v1</span>
                            <div className="flex items-center gap-1"><div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></div><span className="text-[8px] text-green-600 font-black">UP</span></div>
                        </div>
                    ))}
                </div>
            </div>
            <button onClick={()=>setServices([...services, 'Order-' + (services.length+1)])} className="w-full py-2 bg-gray-900 text-white rounded-xl font-bold text-xs">+ Register Instance</button>
        </div>
    );
};
