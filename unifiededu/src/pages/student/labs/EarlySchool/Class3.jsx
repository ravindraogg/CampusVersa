import React, { useState } from 'react';
import { Bird, Droplets, Leaf, Trophy, CheckCircle2, RotateCcw, Network, Utensils, Coins, Users, Paintbrush } from 'lucide-react';

// 8. Animal Classifier
export const AnimalClassifier = () => {
    const animals = [
        { name: 'Cow', habitat: 'Land', icon: '🐄' },
        { name: 'Shark', habitat: 'Water', icon: '🦈' },
        { name: 'Eagle', habitat: 'Air', icon: '🦅' },
        { name: 'Frog', habitat: 'Land', icon: '🐸' },
    ];
    const [active, setActive] = useState(0);
    const [score, setScore] = useState(0);

    const classify = (h) => {
        if (animals[active].habitat === h) setScore(s => s + 1);
        if (active < animals.length - 1) setActive(active + 1);
        else setActive('done');
    };

    if (active === 'done') {
        return (
            <div className="p-6 bg-white rounded-3xl border border-gray-100 shadow-sm h-full flex flex-col items-center justify-center">
                <Trophy className="w-12 h-12 text-yellow-500 mb-2" />
                <div className="text-xl font-bold">Classified {score}/{animals.length}</div>
                <button onClick={() => {setActive(0); setScore(0);}} className="mt-4 text-xs font-bold text-blue-600 underline">Try Again</button>
            </div>
        );
    }

    return (
        <div className="p-6 bg-white rounded-3xl border border-gray-100 shadow-sm h-full flex flex-col items-center">
            <div className="text-6xl mb-6 animate-bounce">{animals[active].icon}</div>
            <div className="grid grid-cols-3 gap-2 w-full">
                {['Land', 'Water', 'Air'].map(h => (
                    <button key={h} onClick={() => classify(h)} className="py-2 bg-gray-50 border border-gray-100 rounded-xl text-[10px] font-bold hover:bg-blue-50 hover:border-blue-200 transition-all">{h}</button>
                ))}
            </div>
        </div>
    );
};

// 9. Water Solubility
export const WaterSolubility = () => {
    const items = [
        { name: 'Sugar', dissolves: true, color: 'bg-white' },
        { name: 'Sand', dissolves: false, color: 'bg-orange-200' },
        { name: 'Salt', dissolves: true, color: 'bg-gray-50' }
    ];
    const [selected, setSelected] = useState(null);
    const [status, setStatus] = useState("Add an item to the water");

    const add = (item) => {
        setSelected(item);
        setStatus("Stirring...");
        setTimeout(() => {
            setStatus(item.dissolves ? `${item.name} dissolved completely!` : `${item.name} settled at the bottom.`);
        }, 1500);
    };

    return (
        <div className="p-6 bg-white rounded-3xl border border-gray-100 shadow-sm h-full flex flex-col items-center">
            <div className="w-20 h-28 border-4 border-blue-100 rounded-b-2xl rounded-t-lg relative mb-6 bg-blue-50/30 overflow-hidden">
                <div className="absolute bottom-0 w-full bg-blue-400/20 h-3/4"></div>
                {selected && (
                    <div className={`absolute w-full bottom-0 flex flex-wrap gap-0.5 p-1 transition-opacity duration-1000 ${selected.dissolves && status.includes('dissolved') ? 'opacity-0' : 'opacity-100'}`}>
                         {Array(10).fill(0).map((_, i) => <div key={i} className={`w-2 h-2 rounded-full ${selected.color} shadow-sm`}></div>)}
                    </div>
                )}
            </div>
            <div className="grid grid-cols-3 gap-2 w-full">
                {items.map(it => (
                    <button key={it.name} onClick={() => add(it)} className="py-2 bg-gray-50 border border-gray-100 rounded-xl text-[10px] font-bold hover:bg-blue-50 transition-all">{it.name}</button>
                ))}
            </div>
            <div className="mt-4 text-[10px] font-medium text-blue-800 text-center h-4">{status}</div>
        </div>
    );
};

// 10. Leaf Texture
export const LeafTexture = () => {
    const [revealed, setRevealed] = useState(0);

    return (
        <div className="p-6 bg-white rounded-3xl border border-gray-100 shadow-sm h-full flex flex-col items-center">
            <div className="w-full h-40 bg-gray-50 rounded-2xl relative overflow-hidden border border-gray-100">
                <div className="absolute inset-0 flex items-center justify-center opacity-5">
                    <Leaf size={100} />
                </div>
                <div className="absolute inset-0 flex items-center justify-center text-green-600 transition-opacity duration-500" style={{ opacity: revealed / 100 }}>
                    <Network size={100} />
                </div>
            </div>
            <div className="w-full mt-6 space-y-2">
                <input type="range" className="w-full accent-green-600" value={revealed} onChange={(e) => setRevealed(e.target.value)} />
            </div>
        </div>
    );
};

// 11. Utensil Matcher
export const UtensilMatcher = () => {
    const items = [{ name: 'Pan', icon: '🍳' }, { name: 'Spoon', icon: '🥄' }, { name: 'Pot', icon: '🏺' }, { name: 'Knife', icon: '🔪' }];
    const [matches, setMatches] = useState({});
    return (
        <div className="p-6 bg-white rounded-3xl border border-gray-100 shadow-sm h-full flex flex-col items-center">
            <div className="grid grid-cols-2 gap-4">
                {items.map(it => (
                    <button key={it.name} onClick={() => setMatches({...matches, [it.name]: true})} className={`p-4 bg-gray-50 rounded-2xl flex flex-col items-center gap-2 border ${matches[it.name] ? 'bg-green-50 border-green-200' : 'border-gray-100'}`}>
                        <div className="text-3xl">{it.icon}</div>
                        <span className="text-[10px] font-bold text-gray-500">{it.name}</span>
                    </button>
                ))}
            </div>
        </div>
    );
};

// 12. Token Math
export const TokenMath = () => {
    const [tens, setTens] = useState(0);
    const [ones, setOnes] = useState(0);
    return (
        <div className="p-6 bg-white rounded-3xl border border-gray-100 shadow-sm h-full flex flex-col items-center">
            <div className="text-4xl font-black text-blue-600 mb-8">{tens * 10 + ones}</div>
            <div className="flex gap-4 mb-8">
                <button onClick={() => setTens(t => Math.min(9, t + 1))} className="p-4 bg-orange-50 rounded-xl border border-orange-100 text-orange-600 font-bold">+10</button>
                <button onClick={() => setOnes(o => Math.min(9, o + 1))} className="p-4 bg-blue-50 rounded-xl border border-blue-100 text-blue-600 font-bold">+1</button>
            </div>
        </div>
    );
};

// 13. Bead Sharer
export const BeadSharer = () => {
    const [total] = useState(12);
    const [groups, setGroups] = useState([[], [], []]);
    const share = (i) => {
        const used = groups.reduce((acc, c) => acc + c.length, 0);
        if (used < total) {
            const ng = [...groups]; ng[i] = [...ng[i], 1]; setGroups(ng);
        }
    };
    return (
        <div className="p-6 bg-white rounded-3xl border border-gray-100 shadow-sm h-full flex flex-col items-center">
            <div className="grid grid-cols-3 gap-4 w-full">
                {groups.map((g, i) => (
                    <div key={i} onClick={() => share(i)} className="h-20 bg-gray-50 border-2 border-dashed border-gray-200 rounded-2xl flex flex-wrap gap-1 p-2 cursor-pointer">
                        {g.map((_, j) => <div key={j} className="w-2 h-2 rounded-full bg-purple-600"></div>)}
                    </div>
                ))}
            </div>
        </div>
    );
};

// 14. Mini Paint
export const MiniPaint = () => {
    const [shapes, setShapes] = useState([]);
    const add = (e) => {
        const rect = e.currentTarget.getBoundingClientRect();
        setShapes([...shapes, { x: e.clientX - rect.left, y: e.clientY - rect.top }]);
    };
    return (
        <div className="p-6 bg-white rounded-3xl border border-gray-100 shadow-sm h-full flex flex-col items-center">
            <div className="w-full h-40 bg-gray-50 border rounded-2xl relative overflow-hidden" onClick={add}>
                {shapes.map((s, i) => <div key={i} className="absolute w-4 h-4 rounded-full bg-blue-500/50" style={{ left: s.x - 8, top: s.y - 8 }} />)}
            </div>
            <button onClick={() => setShapes([])} className="mt-4 text-[10px] text-red-500">Clear</button>
        </div>
    );
};
