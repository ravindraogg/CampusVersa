import React, { useState } from 'react';
import { Network, Zap, Play, Box, CheckCircle2, Shield, Globe, Terminal } from 'lucide-react';

// Subject: Computer Networks Lab (21CSL55)
// 1. Three-node point-to-point network simulation
export const NetworkSimLab = () => {
    const [status, setStatus] = useState('idle');
    const send = () => {
        setStatus('sending');
        setTimeout(()=>setStatus('delivered'), 2000);
    };
    return (
        <div className="p-6 bg-white rounded-3xl border border-gray-100 shadow-sm h-full flex flex-col items-center">
            <div className="w-full h-32 relative flex items-center justify-between px-8 mb-8">
                <div className="w-10 h-10 bg-gray-900 rounded-xl text-white flex items-center justify-center text-[10px] font-black z-10">N1</div>
                <div className="flex-1 h-0.5 bg-gray-200 relative mx-2">
                   {status === 'sending' && <div className="absolute top-1/2 -translate-y-1/2 w-4 h-4 bg-indigo-600 rounded-full animate-[ping_1s_infinite] shadow-[0_0_10px_indigo]"></div>}
                   {status === 'sending' && <div className="absolute top-1/2 -translate-y-1/2 w-4 h-4 bg-indigo-500 rounded-full animate-[move_2s_linear]"></div>}
                </div>
                <div className="w-10 h-10 bg-gray-900 rounded-xl text-white flex items-center justify-center text-[10px] font-black z-10">N2</div>
            </div>
            <button onClick={send} disabled={status === 'sending'} className="px-8 py-2 bg-indigo-600 text-white rounded-xl font-bold text-xs shadow-xl disabled:opacity-50">Transmit Data</button>
            <p className="mt-4 text-[10px] font-black text-indigo-900 uppercase tracking-widest">{status === 'delivered' ? 'Packet Delivered (ACK received)' : status}</p>
            <style>{`@keyframes move { 0% { left: 0%; } 100% { left: 100%; } }`}</style>
        </div>
    );
};

// 2. Software Testing (Selenium/Unit Testing style)
export const SoftwareTestingLab = () => {
    const [testState, setTestState] = useState('idle');
    const runTests = () => {
        setTestState('running');
        setTimeout(()=>setTestState('passed'), 3000);
    };
    return (
        <div className="p-6 bg-white rounded-3xl border border-gray-100 shadow-sm h-full flex flex-col items-center">
            <div className="w-full bg-gray-900 rounded-xl p-4 font-mono text-[10px] text-green-400 mb-6 shadow-xl min-h-[120px]">
                <p className="text-gray-500"># Selenium Test Suite</p>
                <p>driver.get("campusversa.edu");</p>
                <p>assert "Dashboard" in driver.title;</p>
                {testState === 'running' && <p className="mt-4 animate-pulse">Running boundary value analysis...</p>}
                {testState === 'passed' && <p className="mt-4 text-green-400 font-black">TEST PASSED: 12/12 scenarios OK</p>}
            </div>
            <button onClick={runTests} className="w-full py-2 bg-green-600 text-white rounded-xl font-bold text-xs flex items-center justify-center gap-2">
                {testState === 'passed' ? <CheckCircle2 size={14} /> : <Play size={14} />} 
                {testState === 'passed' ? 'Rerun Regression' : 'Run Test Suite'}
            </button>
        </div>
    );
};

// 3. React Component Lifecycle (Web Dev)
export const ReactLifecycleLab = () => {
    const [count, setCount] = useState(0);
    const [log, setLog] = useState(['init: component mounted']);
    const increment = () => {
        setCount(c => c + 1);
        setLog(l => [`update: state changed to ${count + 1}`, ...l.slice(0, 3)]);
    };
    return (
        <div className="p-6 bg-white rounded-3xl border border-gray-100 shadow-sm h-full flex flex-col items-center">
            <div className="w-full bg-indigo-50 p-4 rounded-2xl border border-indigo-100 mb-6 text-center">
                <span className="text-[8px] font-black text-indigo-400 uppercase">State Counter</span>
                <div className="text-3xl font-black text-indigo-900">{count}</div>
            </div>
            <div className="w-full bg-gray-900 rounded-xl p-4 font-mono text-[8px] text-gray-400 mb-6 min-h-[80px]">
                {log.map((entry, i) => <p key={i} className={i === 0 ? 'text-white' : ''}>{entry}</p>)}
            </div>
            <button onClick={increment} className="px-8 py-2 bg-indigo-600 text-white rounded-xl font-bold text-xs shadow-lg">Increment State</button>
        </div>
    );
};

// 4. Distance Vector Routing (21CSL55)
export const DistanceVectorLab = () => {
    const [node, setNode] = useState('A');
    const tables = {
        'A': { 'A': 0, 'B': 2, 'C': 5 },
        'B': { 'A': 2, 'B': 0, 'C': 1 },
        'C': { 'A': 5, 'B': 1, 'C': 0 }
    };
    return (
        <div className="p-6 bg-white rounded-3xl border border-gray-100 shadow-sm h-full flex flex-col items-center">
            <div className="w-full bg-gray-900 rounded-xl overflow-hidden mb-6 shadow-xl border border-white/10">
                <div className="bg-gray-800 p-2 text-[10px] font-black text-white flex justify-between items-center">
                    <span>ROUTING TABLE: NODE {node}</span>
                    <Terminal size={12} />
                </div>
                <table className="w-full text-[10px] text-left">
                    <thead className="bg-white/5 text-gray-400"><tr><th className="p-2">Dest</th><th className="p-2">Cost</th><th className="p-2">Next Hop</th></tr></thead>
                    <tbody className="divide-y divide-white/5 text-gray-200">
                        {Object.entries(tables[node]).map(([dest, cost]) => (
                            <tr key={dest}><td className="p-2 font-bold">{dest}</td><td className="p-2">{cost}</td><td className="p-2">{cost === 0 ? '-' : 'via B'}</td></tr>
                        ))}
                    </tbody>
                </table>
            </div>
            <div className="flex gap-2 w-full">
                {['A', 'B', 'C'].map(n => (
                    <button key={n} onClick={()=>setNode(n)} className={`flex-1 py-2 rounded-xl text-xs font-bold ${node === n ? 'bg-indigo-600 text-white' : 'bg-gray-100'}`}>Node {n}</button>
                ))}
            </div>
            <p className="mt-4 text-[10px] text-gray-400 italic">Bellman-Ford distributed routing simulation.</p>
        </div>
    );
};

// 5. Leaky Bucket Algorithm (21CSL55)
export const LeakyBucketLab = () => {
    const [buffer, setBuffer] = useState(0);
    const capacity = 100;
    const leakRate = 10;
    const incoming = 40;

    const tick = () => {
        setBuffer(b => Math.max(0, b + incoming - leakRate));
    };

    return (
        <div className="p-6 bg-white rounded-3xl border border-gray-100 shadow-sm h-full flex flex-col items-center">
            <div className="w-24 h-40 border-x-4 border-b-4 border-gray-200 rounded-b-2xl relative overflow-hidden bg-gray-50 mb-8">
                <div className="absolute bottom-0 w-full bg-indigo-500/60 transition-all duration-1000" style={{ height: `${buffer}%` }}></div>
                {buffer > capacity && <div className="absolute inset-0 bg-red-500/20 animate-pulse flex items-center justify-center text-[10px] font-black text-red-600 rotate-45 uppercase">Overflow</div>}
            </div>
            <div className="grid grid-cols-2 gap-2 w-full">
                <button onClick={tick} className="py-2 bg-indigo-600 text-white rounded-xl font-bold text-xs">Inject 40 Packets</button>
                <button onClick={()=>setBuffer(0)} className="py-2 bg-gray-100 text-gray-500 rounded-xl font-bold text-xs">Reset</button>
            </div>
            <p className="mt-4 text-[10px] font-black text-indigo-900 uppercase">Buffer: {buffer} / {capacity} (Leak Rate: {leakRate}p/s)</p>
        </div>
    );
};

// 6. Full Stack Architecture (Web Dev)
export const FullStackLab = () => {
    const [layer, setLayer] = useState('Client');
    return (
        <div className="p-6 bg-white rounded-3xl border border-gray-100 shadow-sm h-full flex flex-col items-center">
            <div className="w-full flex flex-col gap-2 mb-6">
                {['Client (React)', 'API (Express)', 'Database (MongoDB)'].map(l => (
                    <div 
                        key={l} 
                        className={`p-3 rounded-xl border-2 transition-all cursor-pointer flex items-center justify-between
                            ${layer === l.split(' ')[0] ? 'bg-indigo-600 border-indigo-700 text-white shadow-lg translate-x-2' : 'bg-white border-gray-100 text-gray-400'}`}
                        onClick={()=>setLayer(l.split(' ')[0])}
                    >
                        <span className="text-[10px] font-black uppercase">{l}</span>
                        {layer === l.split(' ')[0] && <Activity size={14} className="animate-pulse" />}
                    </div>
                ))}
            </div>
            <div className="w-full p-4 bg-gray-50 rounded-2xl border text-[10px] text-gray-600 italic">
                {layer === 'Client' && "Handles UI rendering and user interactions via React state."}
                {layer === 'API' && "Processes business logic and routes requests to the database."}
                {layer === 'Database' && "Stores persistent data using structured or unstructured models."}
            </div>
        </div>
    );
};
