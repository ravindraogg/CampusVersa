import React, { useState } from 'react';
import { Play, Network, Layers, ArrowRight, Activity, Zap } from 'lucide-react';

// Subject: Data Structures Lab (21CSL35)
// 1. Stack implementation (Infix to Postfix)
export const StackInfixLab = () => {
    const [infix, setInfix] = useState('A+B*C');
    const getPostfix = (inf) => {
        // Mock transformation for visualization
        if (inf === 'A+B*C') return 'ABC*+';
        if (inf === 'A+B') return 'AB+';
        return '...';
    };
    return (
        <div className="p-6 bg-white rounded-3xl border border-gray-100 shadow-sm h-full flex flex-col items-center">
            <div className="w-full flex flex-col gap-4 mb-8">
                <div className="p-4 bg-gray-50 rounded-2xl border text-center relative overflow-hidden">
                    <span className="text-[8px] font-black text-gray-400 absolute top-2 left-4">INFIX</span>
                    <div className="text-xl font-black text-indigo-900">{infix}</div>
                </div>
                <div className="flex justify-center"><ArrowRight className="text-gray-300" /></div>
                <div className="p-4 bg-indigo-600 rounded-2xl text-center relative overflow-hidden shadow-lg">
                    <span className="text-[8px] font-black text-white/50 absolute top-2 left-4">POSTFIX</span>
                    <div className="text-xl font-black text-white">{getPostfix(infix)}</div>
                </div>
            </div>
            <div className="flex gap-2">
                {['A+B', 'A+B*C'].map(ex => (
                    <button key={ex} onClick={()=>setInfix(ex)} className="px-4 py-2 bg-gray-100 rounded-xl text-xs font-bold">{ex}</button>
                ))}
            </div>
        </div>
    );
};

// 2. Singly Linked List operations
export const LinkedListLab = () => {
    const [list, setList] = useState([10, 20]);
    return (
        <div className="p-6 bg-white rounded-3xl border border-gray-100 shadow-sm h-full flex flex-col items-center">
            <div className="flex items-center gap-2 mb-8 overflow-x-auto w-full p-4">
                {list.map((n, i) => (
                    <React.Fragment key={i}>
                        <div className="flex flex-col items-center">
                            <div className="w-12 h-12 bg-gray-900 text-white rounded-xl flex flex-col items-center justify-center border-b-4 border-indigo-500 shadow-xl">
                                <span className="text-xs font-black">{n}</span>
                                <span className="text-[6px] text-gray-400">PTR</span>
                            </div>
                        </div>
                        {i < list.length - 1 && <ArrowRight size={16} className="text-indigo-400 shrink-0" />}
                    </React.Fragment>
                ))}
                {list.length > 0 && <div className="text-[8px] font-black text-red-500 ml-2">NULL</div>}
            </div>
            <div className="grid grid-cols-2 gap-2 w-full">
                <button onClick={()=>setList([Math.floor(Math.random()*100), ...list])} className="py-2 bg-indigo-600 text-white rounded-xl text-[10px] font-bold">Insert Front</button>
                <button onClick={()=>setList(list.slice(1))} className="py-2 bg-gray-100 text-gray-500 rounded-xl text-[10px] font-bold">Delete Front</button>
            </div>
        </div>
    );
};

// Subject: ADA Lab (21CSL45)
// 3. Dijkstra’s Algorithm (Shortest Path)
export const DijkstraLab = () => {
    const [target, setTarget] = useState('B');
    const paths = { 'B': 10, 'C': 15, 'D': 25 };
    return (
        <div className="p-6 bg-white rounded-3xl border border-gray-100 shadow-sm h-full flex flex-col items-center">
            <div className="w-full h-40 relative flex items-center justify-center mb-8 bg-gray-50 rounded-2xl border border-dashed">
                <div className="w-8 h-8 bg-gray-900 rounded-full text-white flex items-center justify-center text-xs font-black absolute left-4">A</div>
                <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center text-xs font-black absolute top-4 right-12 transition-all ${target === 'B' ? 'bg-green-500 border-green-600 text-white shadow-lg scale-110' : 'bg-white text-gray-400'}`}>B</div>
                <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center text-xs font-black absolute bottom-4 right-12 transition-all ${target === 'C' ? 'bg-green-500 border-green-600 text-white shadow-lg scale-110' : 'bg-white text-gray-400'}`}>C</div>
                
                <svg className="absolute inset-0 pointer-events-none">
                    <line x1="15%" y1="50%" x2="70%" y2="20%" stroke={target === 'B' ? '#22c55e' : '#cbd5e1'} strokeWidth={target === 'B' ? '4' : '1'} />
                    <line x1="15%" y1="50%" x2="70%" y2="80%" stroke={target === 'C' ? '#22c55e' : '#cbd5e1'} strokeWidth={target === 'C' ? '4' : '1'} />
                </svg>
            </div>
            <div className="flex gap-2 w-full">
                {['B', 'C'].map(node => (
                    <button key={node} onClick={()=>setTarget(node)} className={`flex-1 py-2 rounded-xl text-xs font-bold ${target === node ? 'bg-indigo-600 text-white shadow-md' : 'bg-gray-100'}`}>Target {node}</button>
                ))}
            </div>
            <p className="mt-4 text-xs font-black text-indigo-900">Shortest Path to {target}: <span className="text-green-600">{paths[target]} units</span></p>
        </div>
    );
};

// 4. Circular Queue (21CSL35)
export const CircularQueueLab = () => {
    const [q, setQ] = useState([10, 20, 30, null, null]);
    const [front, setFront] = useState(0);
    const [rear, setRear] = useState(2);
    const size = 5;

    const enqueue = () => {
        const nextRear = (rear + 1) % size;
        if (nextRear === front) return alert('Queue Full');
        const newQ = [...q];
        newQ[nextRear] = Math.floor(Math.random() * 90) + 10;
        setQ(newQ);
        setRear(nextRear);
    };

    const dequeue = () => {
        if (front === rear && q[front] === null) return alert('Queue Empty');
        const newQ = [...q];
        newQ[front] = null;
        setQ(newQ);
        if (front !== rear) setFront((front + 1) % size);
    };

    return (
        <div className="p-6 bg-white rounded-3xl border border-gray-100 shadow-sm h-full flex flex-col items-center">
            <div className="w-full h-40 relative flex items-center justify-center mb-8">
                {q.map((val, i) => (
                    <div 
                        key={i} 
                        className={`absolute w-12 h-12 border-4 rounded-xl flex items-center justify-center font-black transition-all duration-500
                            ${val ? 'bg-indigo-600 border-indigo-700 text-white shadow-lg' : 'bg-gray-50 border-gray-100 text-gray-300'}
                            ${front === i ? 'ring-4 ring-green-400 ring-offset-2' : ''}
                            ${rear === i ? 'ring-4 ring-rose-400 ring-offset-2' : ''}`}
                        style={{ 
                            transform: `rotate(${i * (360/size)}deg) translateY(-60px) rotate(-${i * (360/size)}deg)` 
                        }}
                    >
                        {val || '-'}
                    </div>
                ))}
                <div className="text-[8px] font-black uppercase text-gray-400 text-center">
                    <div className="flex items-center gap-1 mb-1"><div className="w-2 h-2 bg-green-400 rounded-full"></div> FRONT</div>
                    <div className="flex items-center gap-1"><div className="w-2 h-2 bg-rose-400 rounded-full"></div> REAR</div>
                </div>
            </div>
            <div className="flex gap-2 w-full">
                <button onClick={enqueue} className="flex-1 py-2 bg-indigo-600 text-white rounded-xl font-bold text-xs shadow-md">Enqueue</button>
                <button onClick={dequeue} className="flex-1 py-2 bg-gray-100 text-gray-500 rounded-xl font-bold text-xs">Dequeue</button>
            </div>
        </div>
    );
};

// 5. Quick Sort Performance (21CSL45)
export const QuickSortPerformanceLab = () => {
    const [size, setSize] = useState(1000);
    const time = (size * Math.log2(size) / 100000).toFixed(4);
    return (
        <div className="p-6 bg-white rounded-3xl border border-gray-100 shadow-sm h-full flex flex-col items-center">
            <div className="w-full h-40 bg-gray-900 rounded-2xl relative mb-6 overflow-hidden flex items-end p-4 gap-0.5">
                {Array(20).fill(0).map((_,i) => (
                    <div 
                        key={i} 
                        className="flex-1 bg-indigo-500/40 rounded-t" 
                        style={{ height: `${Math.random()*80 + 20}%` }}
                    ></div>
                ))}
                <div className="absolute inset-0 bg-gradient-to-t from-gray-900 to-transparent"></div>
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center">
                    <div className="text-3xl font-black text-white">{time}s</div>
                    <div className="text-[8px] font-black text-indigo-400 uppercase tracking-widest">Execution Time (O(n log n))</div>
                </div>
            </div>
            <div className="w-full space-y-4">
                <div className="flex justify-between text-[10px] font-bold text-gray-500"><span>Input Size (n)</span><span>{size} elements</span></div>
                <input type="range" min="100" max="10000" step="100" value={size} onChange={(e)=>setSize(e.target.value)} className="w-full accent-indigo-600" />
            </div>
        </div>
    );
};

// 6. 0/1 Knapsack (21CSL45)
export const KnapsackLab = () => {
    const [capacity, setCapacity] = useState(10);
    const items = [
        { w: 2, v: 10 }, { w: 3, v: 15 }, { w: 5, v: 40 }
    ];
    const [selected, setSelected] = useState([]);
    const totalW = selected.reduce((a,b)=>a+items[b].w, 0);
    const totalV = selected.reduce((a,b)=>a+items[b].v, 0);

    const toggle = (i) => {
        if (selected.includes(i)) setSelected(selected.filter(x => x !== i));
        else if (totalW + items[i].w <= capacity) setSelected([...selected, i]);
        else alert('Capacity Exceeded!');
    };

    return (
        <div className="p-6 bg-white rounded-3xl border border-gray-100 shadow-sm h-full flex flex-col items-center">
            <div className="w-full bg-gray-50 rounded-2xl p-4 mb-6 border">
                <div className="flex justify-between text-[10px] font-black mb-4">
                    <span className="text-indigo-900">KNAPSACK (CAP: {capacity})</span>
                    <span className={totalW > capacity ? 'text-red-500' : 'text-green-600'}>W: {totalW} / V: {totalV}</span>
                </div>
                <div className="w-full h-4 bg-white rounded-full overflow-hidden border">
                    <div className="h-full bg-indigo-600 transition-all duration-500" style={{ width: `${(totalW/capacity)*100}%` }}></div>
                </div>
            </div>
            <div className="grid grid-cols-3 gap-2 w-full">
                {items.map((it, i) => (
                    <button 
                        key={i} 
                        onClick={()=>toggle(i)}
                        className={`p-3 rounded-xl border-2 transition-all flex flex-col items-center ${selected.includes(i) ? 'bg-indigo-600 border-indigo-700 text-white shadow-lg scale-105' : 'bg-white border-gray-100 text-gray-500'}`}
                    >
                        <div className="text-[10px] font-black">V: {it.v}</div>
                        <div className="text-[8px] opacity-60">W: {it.w}</div>
                    </button>
                ))}
            </div>
        </div>
    );
};
