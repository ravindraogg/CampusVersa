import React, { useState } from 'react';
import { Play, Code2, Terminal, Cpu } from 'lucide-react';

// Subject: C Programming Lab (22POPL13/23)
// 1. Solve simple computational problems using arithmetic operators
export const ArithmeticLab = () => {
    const [a, setA] = useState(10);
    const [b, setB] = useState(5);
    return (
        <div className="p-6 bg-white rounded-3xl border border-gray-100 shadow-sm h-full flex flex-col items-center">
            <div className="w-full bg-gray-900 rounded-xl p-4 font-mono text-[10px] text-green-400 mb-6 min-h-[120px] shadow-2xl">
                <p>#include &lt;stdio.h&gt;</p>
                <p>int main() &#123;</p>
                <p className="ml-4 text-white">int a = {a}, b = {b};</p>
                <p className="ml-4">printf("Add: %d\n", a + b);</p>
                <p className="ml-4">printf("Mul: %d\n", a * b);</p>
                <p>&#125;</p>
                <div className="mt-4 pt-2 border-t border-white/10 text-white">
                    Output:<br/>
                    Add: {a + b}<br/>
                    Mul: {a * b}
                </div>
            </div>
            <div className="grid grid-cols-2 gap-4 w-full">
                <div className="flex flex-col gap-1"><span>Value A</span><input type="number" value={a} onChange={(e)=>setA(parseInt(e.target.value)||0)} className="border rounded p-1 text-xs" /></div>
                <div className="flex flex-col gap-1"><span>Value B</span><input type="number" value={b} onChange={(e)=>setB(parseInt(e.target.value)||0)} className="border rounded p-1 text-xs" /></div>
            </div>
        </div>
    );
};

// 2. Programs using if-else and switch-case for decision making
export const DecisionLab = () => {
    const [choice, setChoice] = useState(1);
    const results = { 1: "Monday", 2: "Tuesday", 3: "Wednesday", 4: "Thursday", 5: "Friday" };
    return (
        <div className="p-6 bg-white rounded-3xl border border-gray-100 shadow-sm h-full flex flex-col items-center">
            <div className="w-full bg-gray-900 rounded-xl p-4 font-mono text-[10px] text-blue-400 mb-6 shadow-xl">
                <p>switch(day) &#123;</p>
                <p className="ml-4">case 1: printf("Monday"); break;</p>
                <p className="ml-4">...</p>
                <p>&#125;</p>
                <div className="mt-4 p-2 bg-white/5 rounded text-white border border-white/10">
                    Day: {choice} -&gt; {results[choice] || "Invalid"}
                </div>
            </div>
            <div className="flex gap-2">
                {[1,2,3,4,5].map(d => (
                    <button key={d} onClick={()=>setChoice(d)} className={`w-8 h-8 rounded-lg font-black text-xs ${choice === d ? 'bg-indigo-600 text-white' : 'bg-gray-100'}`}>{d}</button>
                ))}
            </div>
        </div>
    );
};

// 3. Implementation of loops for series calculation
export const SeriesLoopLab = () => {
    const [n, setN] = useState(5);
    const sum = (n * (n + 1)) / 2;
    return (
        <div className="p-6 bg-white rounded-3xl border border-gray-100 shadow-sm h-full flex flex-col items-center">
            <div className="w-full bg-gray-900 rounded-xl p-4 font-mono text-[10px] text-yellow-400 mb-6">
                <p>for(int i=1; i&lt;={n}; i++) &#123;</p>
                <p className="ml-4">sum += i;</p>
                <p>&#125;</p>
                <div className="mt-4 text-white">
                    Iteration Trace: {Array.from({length: n}, (_, i) => i + 1).join(' + ')} = <span className="text-green-400 font-black">{sum}</span>
                </div>
            </div>
            <input type="range" min="1" max="20" value={n} onChange={(e)=>setN(parseInt(e.target.value))} className="w-full accent-yellow-600" />
            <p className="mt-2 text-[10px] font-bold text-gray-400 uppercase tracking-widest">N = {n}</p>
        </div>
    );
};
