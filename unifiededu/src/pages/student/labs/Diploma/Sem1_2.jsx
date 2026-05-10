import React, { useState } from 'react';
import { Zap, Play, Network, Layout, Smartphone, FileCode } from 'lucide-react';

// 1. IT Skills - Largest of Three Numbers (Algorithm)
export const LargestNumberLab = () => {
    const [nums, setNums] = useState([10, 45, 23]);
    const largest = Math.max(...nums);
    return (
        <div className="p-6 bg-white rounded-3xl border border-gray-100 shadow-sm h-full flex flex-col items-center">
            <div className="w-full bg-gray-900 rounded-xl p-4 font-mono text-[10px] text-green-400 mb-6">
                <p># Find Largest of Three</p>
                <p>Numbers: [{nums.join(', ')}]</p>
                <div className="mt-4 p-2 bg-white/5 rounded border border-white/10 text-white">
                    <p>IF A &gt; B AND A &gt; C THEN PRINT A</p>
                    <p>ELSE IF B &gt; C THEN PRINT B</p>
                    <p>ELSE PRINT C</p>
                </div>
                <p className="text-yellow-400 mt-4 font-black">Output: {largest}</p>
            </div>
            <div className="grid grid-cols-3 gap-2 w-full">
                {nums.map((n, i) => (
                    <input key={i} type="number" value={n} onChange={(e)=>{const nn=[...nums]; nn[i]=parseInt(e.target.value)||0; setNums(nn);}} className="w-full border rounded p-1 text-xs text-center" />
                ))}
            </div>
        </div>
    );
};

// 2. Kirchhoff's Current Law (KCL)
export const KCLLab = () => {
    const [i1, setI1] = useState(5);
    const [i2, setI2] = useState(3);
    const i3 = i1 + i2;
    return (
        <div className="p-6 bg-white rounded-3xl border border-gray-100 shadow-sm h-full flex flex-col items-center">
            <div className="w-full h-40 relative flex items-center justify-center">
                <div className="w-1 h-20 bg-gray-400 absolute top-0 left-1/2 -translate-x-1/2"></div>
                <div className="w-1 h-20 bg-gray-400 absolute bottom-0 left-1/4"></div>
                <div className="w-1 h-20 bg-gray-400 absolute bottom-0 right-1/4"></div>
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-4 h-4 bg-gray-900 rounded-full z-10"></div>
                
                <div className="absolute top-4 left-[55%] text-blue-600 font-black text-xs">I₁ = {i1}A</div>
                <div className="absolute bottom-4 left-[15%] text-red-600 font-black text-xs">I₂ = {i2}A</div>
                <div className="absolute bottom-4 right-[15%] text-green-600 font-black text-xs">I₃ = {i3}A</div>
            </div>
            <div className="grid grid-cols-2 gap-4 w-full mt-6">
                <div className="flex flex-col gap-1"><span className="text-[8px] font-bold text-gray-400">Incoming I₁</span><input type="range" max="20" value={i1} onChange={(e)=>setI1(parseInt(e.target.value))} className="accent-blue-600" /></div>
                <div className="flex flex-col gap-1"><span className="text-[8px] font-bold text-gray-400">Incoming I₂</span><input type="range" max="20" value={i2} onChange={(e)=>setI2(parseInt(e.target.value))} className="accent-red-600" /></div>
            </div>
            <p className="mt-4 text-xs font-black text-gray-800">Σ I_in = Σ I_out | <span className="text-green-600">{i1} + {i2} = {i3}</span></p>
        </div>
    );
};

// 3. Android App UI Simulation (MIT App Inventor style)
export const AndroidSimLab = () => {
    const [color, setColor] = useState('bg-white');
    const [text, setText] = useState('Hello World');
    return (
        <div className="p-6 bg-white rounded-3xl border border-gray-100 shadow-sm h-full flex flex-col items-center">
            <div className="w-32 h-56 bg-gray-900 rounded-[2rem] border-4 border-gray-800 p-2 relative shadow-2xl">
                <div className={`w-full h-full rounded-2xl ${color} flex items-center justify-center p-2 text-center transition-colors duration-500`}>
                    <span className="text-xs font-bold text-gray-800">{text}</span>
                </div>
                <div className="absolute bottom-2 left-1/2 -translate-x-1/2 w-8 h-1 bg-gray-700 rounded-full"></div>
            </div>
            <div className="grid grid-cols-2 gap-2 w-full mt-6">
                <button onClick={()=>setColor('bg-red-400')} className="py-1 bg-red-100 text-red-600 rounded-lg text-[9px] font-bold">Red Background</button>
                <button onClick={()=>setColor('bg-blue-400')} className="py-1 bg-blue-100 text-blue-600 rounded-lg text-[9px] font-bold">Blue Background</button>
                <input value={text} onChange={(e)=>setText(e.target.value)} className="col-span-2 border rounded p-1 text-[10px]" placeholder="Change text..." />
            </div>
        </div>
    );
};

// 4. HTML/CSS Formatting
export const HTMLLab = () => {
    const [bold, setBold] = useState(false);
    const [italic, setItalic] = useState(false);
    return (
        <div className="p-6 bg-white rounded-3xl border border-gray-100 shadow-sm h-full flex flex-col items-center">
            <div className="w-full bg-gray-50 rounded-xl p-4 min-h-[100px] flex items-center justify-center mb-6 border border-dashed border-gray-200">
                <p className={`${bold ? 'font-bold' : ''} ${italic ? 'italic' : ''} text-lg text-indigo-900 transition-all`}>Format this Text</p>
            </div>
            <div className="w-full bg-gray-900 rounded-xl p-4 font-mono text-[9px] text-gray-400 mb-6">
                <p>&lt;style&gt;</p>
                <p className="ml-4">p &#123; </p>
                <p className="ml-8 text-white">{bold ? 'font-weight: bold;' : ''} {italic ? 'font-style: italic;' : ''}</p>
                <p className="ml-4">&#125;</p>
                <p>&lt;/style&gt;</p>
                <p>&lt;p&gt;Format this Text&lt;/p&gt;</p>
            </div>
            <div className="flex gap-2">
                <button onClick={()=>setBold(!bold)} className={`px-4 py-1 rounded-xl text-xs font-black ${bold ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-500'}`}>B</button>
                <button onClick={()=>setItalic(!italic)} className={`px-4 py-1 rounded-xl text-xs italic font-black ${italic ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-500'}`}>I</button>
            </div>
        </div>
    );
};

// 5. Advanced Flowchart (Looping)
export const FlowchartAdvancedLab = () => {
    const [count, setCount] = useState(0);
    return (
        <div className="p-6 bg-white rounded-3xl border border-gray-100 shadow-sm h-full flex flex-col items-center">
            <div className="flex flex-col items-center gap-1 scale-90">
                <div className="px-4 py-1 bg-gray-900 text-white rounded text-[8px] font-black">START</div>
                <div className="w-0.5 h-2 bg-gray-200"></div>
                <div className="px-4 py-1 bg-blue-100 border border-blue-200 rounded text-[8px] font-black">COUNT = {count}</div>
                <div className="w-0.5 h-2 bg-gray-200"></div>
                <div className="px-4 py-3 bg-amber-100 border-2 border-amber-400 rotate-45 flex items-center justify-center text-[6px] font-black"><span className="-rotate-45">COUNT &lt; 5?</span></div>
                <div className="w-0.5 h-2 bg-gray-200"></div>
                <div className="px-4 py-1 bg-green-100 border border-green-200 rounded text-[8px] font-black">INCREMENT COUNT</div>
                <div className="w-0.5 h-2 bg-gray-200"></div>
                <div className="px-4 py-1 bg-gray-900 text-white rounded text-[8px] font-black">END</div>
            </div>
            <button onClick={()=>setCount(c => (c+1)%6)} className="mt-4 px-6 py-2 bg-indigo-600 text-white rounded-xl font-bold text-xs shadow-lg">Run Iteration</button>
        </div>
    );
};

// 6. Multimeter Testing (DC Voltage)
export const MultimeterLab = () => {
    const [voltage, setVoltage] = useState(0);
    const [probe, setProbe] = useState(false);
    return (
        <div className="p-6 bg-white rounded-3xl border border-gray-100 shadow-sm h-full flex flex-col items-center">
            <div className="w-40 h-48 bg-yellow-400 rounded-3xl border-4 border-yellow-500 p-4 relative shadow-2xl flex flex-col items-center">
                <div className="w-full h-12 bg-gray-800 rounded-lg mb-4 flex items-center justify-center text-green-400 font-mono text-xl shadow-inner">
                    {probe ? voltage.toFixed(2) : "0.00"}
                </div>
                <div className="w-20 h-20 rounded-full border-4 border-gray-300 relative flex items-center justify-center">
                    <div className="w-1 h-10 bg-gray-900 rounded-full origin-bottom mb-10 rotate-45"></div>
                </div>
                <div className="mt-4 flex gap-4">
                    <div className="w-4 h-4 bg-red-600 rounded-full shadow-md"></div>
                    <div className="w-4 h-4 bg-black rounded-full shadow-md"></div>
                </div>
            </div>
            <div className="flex gap-2 mt-6 w-full">
                <button onClick={()=>setProbe(!probe)} className={`flex-1 py-2 rounded-xl text-xs font-black ${probe ? 'bg-red-600 text-white' : 'bg-gray-100'}`}>{probe ? 'Detach Probes' : 'Attach Probes'}</button>
                <input type="range" max="12" step="0.5" value={voltage} onChange={(e)=>setVoltage(parseFloat(e.target.value))} className="w-1/2" />
            </div>
        </div>
    );
};

// 7. Scratch Logic Builder
export const ScratchGameLab = () => {
    const [blocks, setBlocks] = useState(['Move 10', 'Turn 15']);
    return (
        <div className="p-6 bg-white rounded-3xl border border-gray-100 shadow-sm h-full flex flex-col items-center">
            <div className="w-full bg-blue-50 rounded-2xl p-4 mb-6 min-h-[140px] border border-blue-100">
                <div className="flex flex-col gap-1">
                    <div className="px-3 py-2 bg-indigo-600 text-white rounded-lg text-[9px] font-black shadow-sm">when flag clicked</div>
                    {blocks.map((b, i) => (
                        <div key={i} className="px-3 py-2 bg-blue-400 text-white rounded-lg text-[9px] font-black ml-4 shadow-sm border-l-4 border-blue-600">{b}</div>
                    ))}
                    <div className="px-3 py-2 bg-orange-400 text-white rounded-lg text-[9px] font-black ml-4 shadow-sm">say "Game Over!"</div>
                </div>
            </div>
            <button onClick={()=>setBlocks([...blocks, 'Go to x:0 y:0'])} className="w-full py-2 bg-gray-900 text-white rounded-xl font-bold text-xs">+ Add Logic Block</button>
        </div>
    );
};
