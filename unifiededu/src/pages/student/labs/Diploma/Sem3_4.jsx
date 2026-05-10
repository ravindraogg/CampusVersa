import React, { useState } from 'react';
import { Play, Zap, Cpu, Database, Network, Box } from 'lucide-react';

// 1. Python List Operations
export const PythonListLab = () => {
    const [list, setList] = useState([1, 2, 3]);
    return (
        <div className="p-6 bg-white rounded-3xl border border-gray-100 shadow-sm h-full flex flex-col items-center">
            <div className="w-full bg-gray-900 rounded-xl p-4 font-mono text-[10px] text-green-400 mb-6 min-h-[100px]">
                <p># Python List Operations</p>
                <p className="text-white mt-2">my_list = {JSON.stringify(list)}</p>
                <p className="mt-2 text-gray-500"># Click buttons to manipulate</p>
            </div>
            <div className="grid grid-cols-2 gap-2 w-full">
                <button onClick={()=>setList([...list, list.length + 1])} className="py-2 bg-indigo-600 text-white rounded-xl font-bold text-[9px]">.append({list.length + 1})</button>
                <button onClick={()=>setList(list.slice(0, -1))} className="py-2 bg-red-600 text-white rounded-xl font-bold text-[9px]">.pop()</button>
                <button onClick={()=>setList([...list].reverse())} className="py-2 bg-gray-700 text-white rounded-xl font-bold text-[9px]">.reverse()</button>
                <button onClick={()=>setList([0, ...list])} className="py-2 bg-green-700 text-white rounded-xl font-bold text-[9px]">.insert(0, 0)</button>
            </div>
        </div>
    );
};

// 2. Logic Gates (Digital Electronics)
export const LogicGateLab = () => {
    const [a, setA] = useState(0);
    const [b, setB] = useState(0);
    const [gate, setGate] = useState('AND');
    const out = gate === 'AND' ? a & b : gate === 'OR' ? a | b : gate === 'XOR' ? a ^ b : gate === 'NAND' ? !(a & b) & 1 : 0;
    return (
        <div className="p-6 bg-white rounded-3xl border border-gray-100 shadow-sm h-full flex flex-col items-center">
            <div className="w-full h-32 relative flex items-center justify-center mb-8">
                <div className="flex flex-col gap-8 mr-12">
                    <button onClick={()=>setA(a?0:1)} className={`w-8 h-8 rounded-full border-2 flex items-center justify-center font-black text-xs ${a ? 'bg-green-500 text-white' : 'bg-gray-100'}`}>{a}</button>
                    <button onClick={()=>setB(b?0:1)} className={`w-8 h-8 rounded-full border-2 flex items-center justify-center font-black text-xs ${b ? 'bg-green-500 text-white' : 'bg-gray-100'}`}>{b}</button>
                </div>
                <div className="px-6 py-4 bg-gray-900 text-white rounded-2xl font-black text-xl shadow-xl">{gate}</div>
                <div className="w-12 h-0.5 bg-gray-400 absolute right-4"></div>
                <div className={`w-10 h-10 rounded-full border-4 ml-12 flex items-center justify-center font-black text-xl transition-all ${out ? 'bg-yellow-400 border-yellow-500 shadow-lg' : 'bg-gray-50 border-gray-100'}`}>{out}</div>
            </div>
            <div className="grid grid-cols-4 gap-1 w-full">
                {['AND', 'OR', 'XOR', 'NAND'].map(g => (
                    <button key={g} onClick={()=>setGate(g)} className={`py-1 rounded-lg text-[9px] font-black ${gate === g ? 'bg-indigo-600 text-white' : 'bg-gray-100'}`}>{g}</button>
                ))}
            </div>
        </div>
    );
};

// 3. 7-Segment Display (Microcontroller Interfacing)
export const SevenSegmentLab = () => {
    const [val, setVal] = useState(0);
    const segments = {
        0: [1,1,1,1,1,1,0], 1: [0,1,1,0,0,0,0], 2: [1,1,0,1,1,0,1], 
        3: [1,1,1,1,0,0,1], 4: [0,1,1,0,0,1,1], 5: [1,0,1,1,0,1,1]
    };
    const s = segments[val] || [0,0,0,0,0,0,0];
    return (
        <div className="p-6 bg-white rounded-3xl border border-gray-100 shadow-sm h-full flex flex-col items-center">
            <div className="relative w-20 h-32 mb-8">
                <div className={`absolute top-0 w-full h-2 rounded-full transition-colors ${s[0]?'bg-red-600 shadow-[0_0_10px_red]':'bg-gray-100'}`}></div>
                <div className={`absolute top-0 right-0 w-2 h-1/2 rounded-full transition-colors ${s[1]?'bg-red-600 shadow-[0_0_10px_red]':'bg-gray-100'}`}></div>
                <div className={`absolute bottom-0 right-0 w-2 h-1/2 rounded-full transition-colors ${s[2]?'bg-red-600 shadow-[0_0_10px_red]':'bg-gray-100'}`}></div>
                <div className={`absolute bottom-0 w-full h-2 rounded-full transition-colors ${s[3]?'bg-red-600 shadow-[0_0_10px_red]':'bg-gray-100'}`}></div>
                <div className={`absolute bottom-0 left-0 w-2 h-1/2 rounded-full transition-colors ${s[4]?'bg-red-600 shadow-[0_0_10px_red]':'bg-gray-100'}`}></div>
                <div className={`absolute top-0 left-0 w-2 h-1/2 rounded-full transition-colors ${s[5]?'bg-red-600 shadow-[0_0_10px_red]':'bg-gray-100'}`}></div>
                <div className={`absolute top-1/2 w-full h-2 rounded-full -translate-y-1/2 transition-colors ${s[6]?'bg-red-600 shadow-[0_0_10px_red]':'bg-gray-100'}`}></div>
            </div>
            <div className="flex gap-1">
                {[0,1,2,3,4,5].map(v => (
                    <button key={v} onClick={()=>setVal(v)} className={`w-8 h-8 rounded-lg border-2 font-black ${val === v ? 'bg-red-600 text-white' : 'bg-gray-50'}`}>{v}</button>
                ))}
            </div>
            <p className="mt-4 text-[10px] text-gray-400 italic">8051/Arduino 7-segment multiplexing simulation.</p>
        </div>
    );
};

// 4. DBMS Constraints
export const DBMSConstraintLab = () => {
    const [query, setQuery] = useState('');
    const [error, setError] = useState(null);
    const run = () => {
        if (query.toUpperCase().includes('PRIMARY KEY')) setError(null);
        else setError("Error: PRIMARY KEY constraint missing!");
    };
    return (
        <div className="p-6 bg-white rounded-3xl border border-gray-100 shadow-sm h-full flex flex-col items-center">
            <div className="w-full bg-gray-900 rounded-xl p-4 font-mono text-[10px] text-green-400 mb-6 shadow-xl min-h-[120px]">
                <p># Create Table with Constraints</p>
                <textarea 
                    value={query} 
                    onChange={(e)=>setQuery(e.target.value)}
                    className="w-full bg-transparent border-none outline-none text-white mt-2 resize-none"
                    placeholder="CREATE TABLE Student (..."
                    rows={4}
                />
            </div>
            {error && <p className="mb-4 text-[10px] font-black text-red-500 uppercase">{error}</p>}
            {!error && query.includes('PRIMARY') && <p className="mb-4 text-[10px] font-black text-green-500 uppercase tracking-widest">Table Created Successfully!</p>}
            <button onClick={run} className="px-8 py-2 bg-indigo-600 text-white rounded-xl font-bold text-xs">Execute DDL</button>
        </div>
    );
};

// 5. Python Dictionary Operations
export const DictionaryLab = () => {
    const [dict, setDict] = useState({ name: 'Alice', age: 20 });
    return (
        <div className="p-6 bg-white rounded-3xl border border-gray-100 shadow-sm h-full flex flex-col items-center">
            <div className="w-full bg-gray-900 rounded-xl p-4 font-mono text-[10px] text-blue-400 mb-6">
                <p># Dictionary Manipulations</p>
                <p className="text-white mt-2">student = {JSON.stringify(dict)}</p>
            </div>
            <div className="grid grid-cols-2 gap-2 w-full">
                <button onClick={()=>setDict({...dict, grade: 'A'})} className="py-2 bg-indigo-600 text-white rounded-xl font-bold text-[9px]">Add Grade</button>
                <button onClick={()=>{const {age, ...rest} = dict; setDict(rest);}} className="py-2 bg-red-600 text-white rounded-xl font-bold text-[9px]">Delete Age</button>
                <button onClick={()=>setDict({...dict, name: 'Bob'})} className="py-2 bg-gray-700 text-white rounded-xl font-bold text-[9px]">Update Name</button>
                <button onClick={()=>setDict({name: 'Alice', age: 20})} className="py-2 bg-blue-900 text-white rounded-xl font-bold text-[9px]">Reset</button>
            </div>
        </div>
    );
};

// 6. Recursion (Factorial)
export const RecursionLab = () => {
    const [n, setN] = useState(5);
    const fact = (num) => (num <= 1 ? 1 : num * fact(num - 1));
    return (
        <div className="p-6 bg-white rounded-3xl border border-gray-100 shadow-sm h-full flex flex-col items-center">
            <div className="w-full bg-gray-50 rounded-xl p-4 mb-6 border flex flex-col items-center">
                <div className="text-3xl font-black text-indigo-900">{n}! = {fact(n)}</div>
                <p className="text-[10px] text-gray-400 mt-2 font-mono">def fact(n): return 1 if n&lt;=1 else n*fact(n-1)</p>
            </div>
            <input type="range" min="0" max="10" value={n} onChange={(e)=>setN(parseInt(e.target.value))} className="w-full accent-indigo-600" />
            <p className="mt-4 text-[10px] text-gray-400 uppercase font-black">Recursive Depth Simulation</p>
        </div>
    );
};

// 7. OS Installation (Disk Partitioning)
export const OSInstallationLab = () => {
    const [partitions, setPartitions] = useState([{ name: 'C:', size: 100, used: 40 }]);
    return (
        <div className="p-6 bg-white rounded-3xl border border-gray-100 shadow-sm h-full flex flex-col items-center">
            <div className="w-full space-y-4 mb-6">
                {partitions.map((p, i) => (
                    <div key={i} className="w-full bg-gray-100 rounded-lg p-3 border">
                        <div className="flex justify-between text-[10px] font-black mb-1"><span>{p.name} (NTFS)</span><span>{p.size} GB</span></div>
                        <div className="w-full h-2 bg-white rounded-full overflow-hidden">
                            <div className="h-full bg-blue-600" style={{ width: `${(p.used/p.size)*100}%` }}></div>
                        </div>
                    </div>
                ))}
            </div>
            <button onClick={()=>setPartitions([...partitions, { name: `D:`, size: 50, used: 0 }])} className="w-full py-2 bg-indigo-600 text-white rounded-xl font-bold text-xs shadow-lg">Create New Partition</button>
        </div>
    );
};

// 8. Linux Shell Simulator
export const LinuxShellLab = () => {
    const [cmd, setCmd] = useState('');
    const [output, setOutput] = useState(['user@linux:~$ ']);
    const run = () => {
        let out = '';
        if (cmd === 'ls') out = 'Documents  Downloads  Pictures  Public';
        else if (cmd === 'pwd') out = '/home/user';
        else if (cmd === 'whoami') out = 'root';
        else out = `bash: ${cmd}: command not found`;
        setOutput([...output, cmd, out, 'user@linux:~$ ']);
        setCmd('');
    };
    return (
        <div className="p-6 bg-white rounded-3xl border border-gray-100 shadow-sm h-full flex flex-col items-center">
            <div className="w-full bg-gray-900 rounded-xl p-4 font-mono text-[9px] text-gray-300 mb-4 h-40 overflow-auto shadow-2xl border-t-8 border-gray-800">
                {output.map((line, i) => <p key={i}>{line}</p>)}
            </div>
            <div className="flex gap-2 w-full">
                <input 
                    value={cmd} 
                    onChange={(e)=>setCmd(e.target.value)} 
                    onKeyPress={(e)=>e.key==='Enter'&&run()}
                    className="flex-1 bg-gray-100 border rounded-xl p-2 text-xs font-mono" 
                    placeholder="ls, pwd, whoami..."
                />
                <button onClick={run} className="px-4 py-2 bg-indigo-600 text-white rounded-xl font-black text-[10px]">Enter</button>
            </div>
        </div>
    );
};

// 9. Half Adder (Digital)
export const HalfAdderLab = () => {
    const [a, setA] = useState(0);
    const [b, setB] = useState(0);
    const sum = a ^ b;
    const carry = a & b;
    return (
        <div className="p-6 bg-white rounded-3xl border border-gray-100 shadow-sm h-full flex flex-col items-center">
            <div className="flex items-center gap-8 mb-8">
                <div className="flex flex-col gap-4">
                    <button onClick={()=>setA(a?0:1)} className={`w-8 h-8 rounded-lg font-black text-xs ${a?'bg-indigo-600 text-white shadow-md':'bg-gray-100'}`}>{a}</button>
                    <button onClick={()=>setB(b?0:1)} className={`w-8 h-8 rounded-lg font-black text-xs ${b?'bg-indigo-600 text-white shadow-md':'bg-gray-100'}`}>{b}</button>
                </div>
                <div className="px-6 py-4 bg-gray-900 text-white rounded-2xl font-black text-xs relative">
                    HALF ADDER
                    <div className="absolute -right-8 top-1/4 h-0.5 w-8 bg-gray-400"></div>
                    <div className="absolute -right-8 bottom-1/4 h-0.5 w-8 bg-gray-400"></div>
                </div>
                <div className="flex flex-col gap-4">
                    <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center font-black text-xs ${sum?'bg-yellow-400 border-yellow-500 shadow-lg':'bg-gray-50'}`}>{sum}</div>
                    <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center font-black text-xs ${carry?'bg-orange-400 border-orange-500 shadow-lg':'bg-gray-50'}`}>{carry}</div>
                </div>
            </div>
            <div className="flex gap-4 text-[8px] font-black uppercase text-gray-400">
                <span>Sum (S)</span><span>Carry (C)</span>
            </div>
        </div>
    );
};

// 10. Stepper Motor Interfacing
export const StepperMotorLab = () => {
    const [speed, setSpeed] = useState(0);
    const [dir, setDir] = useState(1);
    return (
        <div className="p-6 bg-white rounded-3xl border border-gray-100 shadow-sm h-full flex flex-col items-center">
            <div className="w-32 h-32 relative mb-8 flex items-center justify-center">
                <div className="w-32 h-32 rounded-full border-8 border-gray-100 shadow-inner"></div>
                <div className="absolute inset-2 rounded-full border border-gray-100 flex items-center justify-center">
                    <div 
                        className="w-1 h-14 bg-indigo-600 rounded-full origin-bottom mb-14"
                        style={{ 
                            animation: speed > 0 ? `spin ${2 / speed}s linear infinite` : 'none',
                            transform: `rotate(${dir === 1 ? 0 : 180}deg)`
                        }}
                    ></div>
                </div>
            </div>
            <div className="flex flex-col gap-4 w-full">
                <div className="flex justify-between items-center"><span className="text-[10px] font-bold text-gray-500">Speed</span><input type="range" max="10" value={speed} onChange={(e)=>setSpeed(parseInt(e.target.value))} className="w-32 accent-indigo-600" /></div>
                <button onClick={()=>setDir(d=>-d)} className="py-2 bg-gray-900 text-white rounded-xl font-bold text-xs">Reverse Direction</button>
            </div>
            <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
        </div>
    );
};
