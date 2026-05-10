import React, { useState } from 'react';
import { Apple, Users, Carrot, Home, Flame, Table, FileJson, CheckCircle2, RotateCcw, Leaf } from 'lucide-react';

// 15. Food Mapper
export const FoodMapper = () => {
    const items = [{ name: 'Apple', source: 'Plant', icon: '🍎' }, { name: 'Milk', source: 'Animal', icon: '🥛' }, { name: 'Egg', source: 'Animal', icon: '🥚' }, { name: 'Wheat', source: 'Plant', icon: '🌾' }];
    const [idx, setIdx] = useState(0);
    const [done, setDone] = useState(false);
    const match = () => { if (idx < items.length - 1) setIdx(idx + 1); else setDone(true); };

    if (done) return <div className="p-6 bg-white rounded-3xl border border-gray-100 shadow-sm h-full flex flex-col items-center justify-center text-green-600 font-black"><CheckCircle2 size={40} className="mb-2" /> Mapping Complete!</div>;

    return (
        <div className="p-6 bg-white rounded-3xl border border-gray-100 shadow-sm h-full flex flex-col items-center">
            <div className="text-6xl mb-8">{items[idx].icon}</div>
            <div className="grid grid-cols-2 gap-4 w-full">
                <button onClick={match} className="py-3 bg-green-50 border border-green-100 rounded-2xl text-xs font-bold text-green-700 flex flex-col items-center gap-1"><Leaf size={16}/> Plant</button>
                <button onClick={match} className="py-3 bg-orange-50 border border-orange-100 rounded-2xl text-xs font-bold text-orange-700 flex flex-col items-center gap-1"><Users size={16}/> Animal</button>
            </div>
        </div>
    );
};

// 16. Freshness Test
export const FreshnessTest = () => {
    const veggies = [{ name: 'Tomato', fresh: true, icon: '🍅' }, { name: 'Old Spinach', fresh: false, icon: '🌿' }, { name: 'Fresh Carrot', fresh: true, icon: '🥕' }];
    const [results, setResults] = useState({});
    return (
        <div className="p-6 bg-white rounded-3xl border border-gray-100 shadow-sm h-full flex flex-col items-center">
            <div className="grid grid-cols-3 gap-4">
                {veggies.map((v, i) => (
                    <button key={i} onClick={() => setResults({...results, [i]: v.fresh ? 'Fresh' : 'Spoiled'})} className={`p-4 rounded-2xl border-2 transition-all flex flex-col items-center gap-2 ${results[i] === 'Fresh' ? 'bg-green-50 border-green-200' : results[i] === 'Spoiled' ? 'bg-red-50 border-red-200' : 'bg-gray-50 border-gray-100'}`}>
                        <div className="text-2xl">{v.icon}</div>
                        <div className="text-[9px] font-black uppercase text-gray-500">{results[i] || 'Inspect'}</div>
                    </button>
                ))}
            </div>
        </div>
    );
};

// 17. House Builder
export const HouseBuilder = () => {
    const [stage, setStage] = useState(0);
    const stages = ['Foundation', 'Walls', 'Roof', 'Complete'];
    return (
        <div className="p-6 bg-white rounded-3xl border border-gray-100 shadow-sm h-full flex flex-col items-center">
            <div className="w-full h-32 bg-gray-50 rounded-2xl mb-6 relative flex items-end justify-center">
                {stage >= 1 && <div className="w-24 h-1.5 bg-gray-400 rounded-full"></div>}
                {stage >= 2 && <div className="absolute bottom-1.5 w-20 h-12 bg-amber-100 border-x-4 border-t-4 border-amber-800"></div>}
                {stage >= 3 && <div className="absolute bottom-[54px] w-24 h-8 bg-amber-900" style={{ clipPath: 'polygon(50% 0%, 0% 100%, 100% 100%)' }}></div>}
            </div>
            <button onClick={() => setStage(s => Math.min(3, s + 1))} className="w-full py-2 bg-amber-600 text-white rounded-xl font-bold text-sm">Add {stages[stage + 1] || 'Finish'}</button>
        </div>
    );
};

// 18. Spice Riddle
export const SpiceRiddle = () => {
    const riddles = [{ text: "I am yellow and help heal wounds.", answer: "Turmeric" }, { text: "I am small and black, and make food spicy.", answer: "Black Pepper" }];
    const [idx, setIdx] = useState(0);
    const [rev, setRev] = useState(false);
    return (
        <div className="p-6 bg-white rounded-3xl border border-gray-100 shadow-sm h-full flex flex-col items-center text-center">
            <p className="text-sm font-bold text-gray-700 mb-4">"{riddles[idx].text}"</p>
            {rev ? <div className="p-2 bg-amber-50 rounded-xl text-amber-900 font-bold mb-4">{riddles[idx].answer}</div> : <button onClick={() => setRev(true)} className="px-4 py-1 bg-gray-900 text-white rounded-full text-xs mb-4">Reveal</button>}
            <button onClick={() => {setIdx((idx+1)%riddles.length); setRev(false);}} className="text-[10px] text-gray-400 flex items-center gap-1"><RotateCcw size={10}/>Next</button>
        </div>
    );
};

// 19. Matchstick Tables
export const MatchstickTables = () => {
    const [groups, setGroups] = useState(2);
    return (
        <div className="p-6 bg-white rounded-3xl border border-gray-100 shadow-sm h-full flex flex-col items-center">
            <div className="text-2xl font-black text-blue-600 mb-6">{groups} x 3 = {groups * 3}</div>
            <div className="flex gap-2 mb-6">
                {Array(groups).fill(0).map((_, i) => (
                    <div key={i} className="flex gap-0.5 p-1 bg-gray-50 border rounded-lg">
                        {Array(3).fill(0).map((_, j) => <div key={j} className="w-0.5 h-6 bg-amber-500"></div>)}
                    </div>
                ))}
            </div>
            <button onClick={() => setGroups(g => Math.min(5, g + 1))} className="w-full py-2 bg-blue-600 text-white rounded-xl font-bold text-xs">+ Add Group</button>
        </div>
    );
};

// 20. Fraction Folder
export const FractionFolder = () => {
    const [folds, setFolds] = useState(0);
    return (
        <div className="p-6 bg-white rounded-3xl border border-gray-100 shadow-sm h-full flex flex-col items-center">
            <div className="w-40 h-24 bg-white border-2 border-blue-200 rounded flex overflow-hidden">
                <div className="flex-1 border-r border-blue-100 flex items-center justify-center text-blue-800 font-bold text-xs">{folds === 0 ? '1' : folds === 1 ? '1/2' : '1/4'}</div>
                {folds >= 1 && <div className="flex-1 border-r border-blue-100 flex items-center justify-center text-blue-800 font-bold text-xs">1/2</div>}
                {folds >= 2 && <><div className="flex-1 border-r border-blue-100 flex items-center justify-center text-blue-800 font-bold text-xs">1/4</div><div className="flex-1 flex items-center justify-center text-blue-800 font-bold text-xs">1/4</div></>}
            </div>
            <div className="mt-6 flex gap-1">
                <button onClick={() => setFolds(1)} className="px-3 py-1 bg-gray-100 rounded text-[10px] font-bold">1/2</button>
                <button onClick={() => setFolds(2)} className="px-3 py-1 bg-gray-100 rounded text-[10px] font-bold">1/4</button>
                <button onClick={() => setFolds(0)} className="px-3 py-1 bg-gray-100 rounded text-[10px] font-bold text-red-500">Reset</button>
            </div>
        </div>
    );
};

// 4. Formatting in Word (NCERT)
export const WordFormattingLab = () => {
    const [bold, setBold] = useState(false);
    const [italic, setItalic] = useState(false);
    const [color, setColor] = useState('text-gray-900');
    return (
        <div className="p-6 bg-white rounded-3xl border border-gray-100 shadow-sm h-full flex flex-col items-center">
            <div className="w-full bg-gray-50 rounded-2xl p-8 mb-6 min-h-[120px] flex items-center justify-center border-2 border-dashed border-gray-200">
                <p className={`text-2xl transition-all ${bold ? 'font-black' : ''} ${italic ? 'italic' : ''} ${color}`}>
                    Style this Text!
                </p>
            </div>
            <div className="flex flex-wrap gap-2 justify-center">
                <button onClick={()=>setBold(!bold)} className={`px-4 py-1 rounded-xl text-xs font-black ${bold ? 'bg-indigo-600 text-white shadow-lg' : 'bg-gray-100 text-gray-500'}`}>B</button>
                <button onClick={()=>setItalic(!italic)} className={`px-4 py-1 rounded-xl text-xs italic font-black ${italic ? 'bg-indigo-600 text-white shadow-lg' : 'bg-gray-100 text-gray-500'}`}>I</button>
                <button onClick={()=>setColor('text-red-500')} className="w-6 h-6 rounded-full bg-red-500 shadow-sm hover:scale-110 transition-transform"></button>
                <button onClick={()=>setColor('text-blue-500')} className="w-6 h-6 rounded-full bg-blue-500 shadow-sm hover:scale-110 transition-transform"></button>
                <button onClick={()=>setColor('text-green-500')} className="w-6 h-6 rounded-full bg-green-500 shadow-sm hover:scale-110 transition-transform"></button>
                <button onClick={()=>setColor('text-gray-900')} className="w-6 h-6 rounded-full bg-gray-900 shadow-sm hover:scale-110 transition-transform"></button>
            </div>
        </div>
    );
};

// 5. Map Pointing (State Board KA)
export const MapPointingLab = () => {
    const [selected, setSelected] = useState(null);
    const districts = [
        { id: 'blr', name: 'Bengaluru', x: '60%', y: '80%' },
        { id: 'mys', name: 'Mysuru', x: '50%', y: '85%' },
        { id: 'hub', name: 'Hubballi', x: '40%', y: '40%' },
    ];
    return (
        <div className="p-6 bg-white rounded-3xl border border-gray-100 shadow-sm h-full flex flex-col items-center">
            <div className="w-full aspect-square bg-indigo-50 rounded-2xl relative mb-6 border-2 border-indigo-100 overflow-hidden">
                <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle,rgba(79,70,229,0.1)_1px,transparent_1px)] bg-[size:20px_20px]"></div>
                {districts.map(d => (
                    <button 
                        key={d.id}
                        onClick={()=>setSelected(d.name)}
                        className={`absolute w-3 h-3 -translate-x-1/2 -translate-y-1/2 rounded-full transition-all ${selected === d.name ? 'bg-red-500 scale-150 shadow-[0_0_10px_red]' : 'bg-indigo-600 hover:scale-125'}`}
                        style={{ left: d.x, top: d.y }}
                    />
                ))}
            </div>
            <p className="text-xs font-black text-indigo-900 uppercase tracking-widest">
                {selected ? `District: ${selected}` : 'Click markers to identify districts'}
            </p>
        </div>
    );
};
