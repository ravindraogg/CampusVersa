import React, { useState } from 'react';
import { Play, Network, Layers, Shield, Database, Brain, Terminal, Cpu, Globe, Rocket, Search, FileText, CheckCircle2 } from 'lucide-react';

// 1. Cloud Native (Docker Container Sim)
export const DockerLab = () => {
    const [running, setRunning] = useState(false);
    return (
        <div className="p-6 bg-white rounded-3xl border border-gray-100 shadow-sm h-full flex flex-col items-center">
            <div className="w-full bg-gray-900 rounded-xl p-4 font-mono text-[9px] text-blue-400 mb-8 min-h-[100px] shadow-2xl">
                <p>$ docker build -t pg-app .</p>
                <p>$ docker run -d -p 80:80 pg-app</p>
                {running && <p className="mt-4 text-green-400 animate-pulse">CONTAINER ID: 77a82b9c ... RUNNING</p>}
            </div>
            <button onClick={()=>setRunning(!running)} className={`px-8 py-2 rounded-xl font-bold text-xs transition-all ${running ? 'bg-red-600 text-white' : 'bg-indigo-600 text-white shadow-xl'}`}>
                {running ? 'Stop Container' : 'Deploy Container'}
            </button>
            <div className="mt-6 flex gap-2">
                <div className={`w-3 h-3 rounded-full ${running ? 'bg-green-500 shadow-[0_0_10px_green]' : 'bg-gray-200'}`}></div>
                <div className={`w-3 h-3 rounded-full ${running ? 'bg-green-500 shadow-[0_0_10px_green]' : 'bg-gray-200'}`}></div>
            </div>
        </div>
    );
};

// 2. Blockchain (Hash Visualization)
export const BlockchainLab = () => {
    const [data, setData] = useState('TX_001');
    const hash = btoa(data).slice(0, 16);
    return (
        <div className="p-6 bg-white rounded-3xl border border-gray-100 shadow-sm h-full flex flex-col items-center">
            <div className="w-full space-y-4 mb-8">
                <div className="p-4 bg-gray-50 rounded-2xl border-2 border-dashed flex flex-col gap-2">
                    <span className="text-[8px] font-black text-gray-400 uppercase">Block 001 Data</span>
                    <input value={data} onChange={(e)=>setData(e.target.value)} className="w-full bg-transparent font-bold text-indigo-900 outline-none" />
                </div>
                <div className="flex justify-center"><Layers className="text-gray-300" /></div>
                <div className="p-4 bg-gray-900 rounded-2xl shadow-xl">
                    <span className="text-[8px] font-black text-gray-400 uppercase">SHA-256 Hash</span>
                    <div className="text-[10px] font-mono text-green-400 break-all mt-1">{hash}...</div>
                </div>
            </div>
            <p className="text-[8px] text-gray-400 text-center uppercase tracking-widest font-black">Immutability Proof via Cryptographic Hashing.</p>
        </div>
    );
};

// 3. Research Paper Drafting
export const ResearchLab = () => {
    const [sections, setSections] = useState(0);
    const names = ['Abstract', 'Introduction', 'Methodology', 'Results', 'Conclusion'];
    return (
        <div className="p-6 bg-white rounded-3xl border border-gray-100 shadow-sm h-full flex flex-col items-center">
            <div className="w-full h-40 bg-gray-50 rounded-2xl p-4 relative mb-6 border-2 border-gray-100">
                <div className="flex flex-col gap-2">
                    {names.slice(0, sections).map(n => (
                        <div key={n} className="flex items-center gap-2 animate-in slide-in-from-left">
                            <CheckCircle2 size={12} className="text-green-500" />
                            <span className="text-[10px] font-bold text-gray-700">{n} Drafted</span>
                        </div>
                    ))}
                    {sections === 0 && <span className="text-[10px] text-gray-400 italic">No sections drafted yet.</span>}
                </div>
            </div>
            <button onClick={()=>setSections(s => Math.min(5, s+1))} className="px-6 py-2 bg-indigo-600 text-white rounded-xl font-bold text-xs shadow-lg flex items-center gap-2"><FileText size={14} /> Add Next Section</button>
        </div>
    );
};

// 4. PG Dissertation Defense
export const DefenseLab = () => {
    const [defending, setDefending] = useState(false);
    return (
        <div className="p-6 bg-white rounded-3xl border border-gray-100 shadow-sm h-full flex flex-col items-center justify-center">
            {!defending ? (
                <div className="text-center">
                    <Rocket className="w-16 h-16 mx-auto mb-4 text-indigo-600 animate-bounce" />
                    <button onClick={()=>setDefending(true)} className="px-8 py-2 bg-gray-900 text-white rounded-xl font-black text-sm uppercase tracking-widest">Start Thesis Defense</button>
                </div>
            ) : (
                <div className="text-center animate-in zoom-in">
                    <Globe className="w-16 h-16 mx-auto mb-4 text-green-500 animate-spin-slow" />
                    <h2 className="text-xl font-black text-indigo-900">MASTER'S DEGREE</h2>
                    <p className="text-[10px] font-black text-gray-400 mt-2 uppercase">Postgraduate Education Successfully Completed.</p>
                </div>
            )}
        </div>
    );
};

// 5. Sentiment Analysis (NLP)
export const SentimentAnalysisLab = () => {
    const [text, setText] = useState('This virtual lab is amazing!');
    const score = text.toLowerCase().includes('amazing') || text.toLowerCase().includes('good') ? 'Positive' : 'Negative';
    return (
        <div className="p-6 bg-white rounded-3xl border border-gray-100 shadow-sm h-full flex flex-col items-center">
            <div className="w-full bg-gray-50 border rounded-2xl p-4 mb-6">
                <span className="text-[8px] font-black text-gray-400 uppercase">Input Sentence</span>
                <textarea 
                    value={text} 
                    onChange={(e)=>setText(e.target.value)}
                    className="w-full bg-transparent border-none outline-none font-bold text-indigo-900 mt-2 resize-none"
                    rows={2}
                />
            </div>
            <div className={`w-full p-4 rounded-xl text-center font-black transition-all ${score === 'Positive' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                Result: {score}
            </div>
            <p className="mt-4 text-[10px] text-gray-400 italic">VADER/TextBlob sentiment classification simulation.</p>
        </div>
    );
};

// 6. Big Data (MapReduce Simulation)
export const MapReduceLab = () => {
    const [phase, setPhase] = useState('Input');
    return (
        <div className="p-6 bg-white rounded-3xl border border-gray-100 shadow-sm h-full flex flex-col items-center">
            <div className="w-full h-32 flex items-center justify-between mb-8 px-4">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center font-black text-[8px] transition-all ${phase === 'Map' ? 'bg-indigo-600 text-white scale-110 shadow-lg' : 'bg-gray-100 text-gray-400'}`}>MAP</div>
                <ArrowRight className="text-gray-200" />
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center font-black text-[8px] transition-all ${phase === 'Shuffle' ? 'bg-indigo-600 text-white scale-110 shadow-lg' : 'bg-gray-100 text-gray-400'}`}>SHUFFLE</div>
                <ArrowRight className="text-gray-200" />
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center font-black text-[8px] transition-all ${phase === 'Reduce' ? 'bg-indigo-600 text-white scale-110 shadow-lg' : 'bg-gray-100 text-gray-400'}`}>REDUCE</div>
            </div>
            <div className="flex gap-2 w-full">
                {['Map', 'Shuffle', 'Reduce'].map(p => (
                    <button key={p} onClick={()=>setPhase(p)} className={`flex-1 py-2 rounded-xl text-[10px] font-black ${phase === p ? 'bg-indigo-600 text-white shadow-md' : 'bg-gray-100 text-gray-400'}`}>{p}</button>
                ))}
            </div>
        </div>
    );
};

// 7. Hyperparameter Tuning (Deep Learning)
export const HyperparameterLab = () => {
    const [lr, setLr] = useState(0.01);
    const accuracy = (100 - (Math.abs(lr - 0.001) * 1000)).toFixed(1);
    return (
        <div className="p-6 bg-white rounded-3xl border border-gray-100 shadow-sm h-full flex flex-col items-center">
            <div className="w-full h-40 bg-gray-900 rounded-2xl relative mb-6 flex flex-col items-center justify-center">
                <div className="text-4xl font-black text-green-400">{accuracy}%</div>
                <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-2">Model Accuracy</div>
                <Activity size={40} className="text-indigo-500/20 absolute inset-0 m-auto animate-pulse" />
            </div>
            <div className="w-full space-y-4">
                <div className="flex justify-between text-[10px] font-black text-gray-500"><span>Learning Rate (η)</span><span>{lr}</span></div>
                <input type="range" min="0.0001" max="0.1" step="0.0001" value={lr} onChange={(e)=>setLr(parseFloat(e.target.value))} className="w-full accent-indigo-600" />
            </div>
        </div>
    );
};
