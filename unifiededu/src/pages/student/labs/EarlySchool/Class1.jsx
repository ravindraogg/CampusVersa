import React, { useState, useRef, useEffect } from 'react';
import { Shapes, Hash, Ruler, PenTool, CheckCircle2, RotateCcw } from 'lucide-react';

// 1. Shape Sorter
export const ShapeSorter = () => {
  const shapes = ['circle', 'square', 'triangle'];
  const [items, setItems] = useState([
    { id: 1, type: 'circle', color: '#ef4444' },
    { id: 2, type: 'square', color: '#3b82f6' },
    { id: 3, type: 'triangle', color: '#10b981' },
    { id: 4, type: 'circle', color: '#f59e0b' },
  ]);
  const [sorted, setSorted] = useState({ circle: 0, square: 0, triangle: 0 });

  const drop = (type) => {
    const first = items.find(i => i.type === type);
    if (first) {
      setItems(items.filter(i => i.id !== first.id));
      setSorted({ ...sorted, [type]: sorted[type] + 1 });
    }
  };

  return (
    <div className="p-6 bg-white rounded-3xl border border-gray-100 shadow-sm h-full flex flex-col items-center">
      <div className="flex gap-4 mb-8 h-20 items-center">
        {items.map(item => (
          <div 
            key={item.id} 
            className={`w-12 h-12 cursor-pointer transition-transform hover:scale-110 active:scale-90`}
            style={{ 
                backgroundColor: item.color,
                borderRadius: item.type === 'circle' ? '50%' : item.type === 'square' ? '8px' : '0',
                clipPath: item.type === 'triangle' ? 'polygon(50% 0%, 0% 100%, 100% 100%)' : 'none'
            }}
            onClick={() => drop(item.type)}
          />
        ))}
        {items.length === 0 && <div className="text-green-600 font-bold flex items-center gap-2 animate-bounce"><CheckCircle2 /> All Sorted!</div>}
      </div>
      <div className="grid grid-cols-3 gap-8 w-full">
        {shapes.map(s => (
          <div key={s} className="border-2 border-dashed border-gray-200 rounded-2xl p-4 flex flex-col items-center gap-2">
            <div className="text-[10px] font-bold uppercase text-gray-400">{s} Bin</div>
            <div className="text-2xl font-black text-gray-700">{sorted[s]}</div>
          </div>
        ))}
      </div>
      <p className="text-[10px] text-gray-400 mt-6 text-center italic">Tap the shapes above to sort them into the correct bins.</p>
    </div>
  );
};

// 2. Bead Counter
export const BeadCounter = () => {
  const [count, setCount] = useState(0);
  const [beads, setBeads] = useState(Array(9).fill(false));

  const toggleBead = (idx) => {
    const newBeads = [...beads];
    newBeads[idx] = !newBeads[idx];
    setBeads(newBeads);
    setCount(newBeads.filter(b => b).length);
  };

  return (
    <div className="p-6 bg-white rounded-3xl border border-gray-100 shadow-sm h-full flex flex-col items-center justify-center">
      <div className="text-5xl font-black text-blue-600 mb-8">{count}</div>
      <div className="grid grid-cols-3 gap-4">
        {beads.map((active, i) => (
          <button 
            key={i}
            onClick={() => toggleBead(i)}
            className={`w-12 h-12 rounded-full transition-all duration-300 shadow-sm border-2 ${active ? 'bg-blue-500 border-blue-600 scale-110 shadow-blue-200' : 'bg-gray-50 border-gray-100 hover:border-blue-200'}`}
          />
        ))}
      </div>
      <button onClick={() => {setBeads(Array(9).fill(false)); setCount(0);}} className="mt-8 text-xs font-bold text-gray-400 hover:text-red-500 flex items-center gap-1 transition-colors">
        <RotateCcw className="w-3 h-3" /> Reset
      </button>
    </div>
  );
};

// 3. HandSpan Measurement
export const HandSpanMeasure = () => {
  const [hands, setHands] = useState(0);

  return (
    <div className="p-6 bg-white rounded-3xl border border-gray-100 shadow-sm h-full flex flex-col items-center">
      <div className="w-full h-32 bg-amber-50 rounded-2xl mb-8 flex items-center justify-center border border-amber-100 relative overflow-hidden">
        <div className="font-bold text-amber-800 text-sm">Table Top</div>
        <div className="absolute bottom-4 left-4 right-4 h-1 bg-amber-200 rounded-full"></div>
        <div className="absolute bottom-6 left-4 flex">
           {Array(hands).fill(0).map((_, i) => (
             <div key={i} className="w-10 h-10 -ml-2 text-amber-600 animate-in slide-in-from-left-2 fade-in">
               <PenTool className="rotate-90" />
             </div>
           ))}
        </div>
      </div>
      <div className="flex flex-col items-center gap-4">
        <div className="text-xs font-bold text-gray-500 uppercase tracking-widest">Measure with Handspans</div>
        <div className="flex gap-2">
            <button onClick={() => setHands(h => Math.min(h + 1, 8))} className="px-4 py-2 bg-amber-100 text-amber-700 rounded-xl font-bold hover:bg-amber-200">+ Add Span</button>
            <button onClick={() => setHands(0)} className="px-4 py-2 bg-gray-100 text-gray-700 rounded-xl font-bold hover:bg-gray-200">Reset</button>
        </div>
        <div className="mt-4 text-sm font-medium text-gray-600">The table is <span className="font-bold text-amber-700">{hands}</span> hand-spans wide.</div>
      </div>
    </div>
  );
};
