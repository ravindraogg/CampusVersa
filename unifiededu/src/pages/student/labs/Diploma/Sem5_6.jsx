import React, { useState } from 'react';
import { Network, Zap, Play, Box, CheckCircle2, FileText, Search } from 'lucide-react';

// 1. PLC Ladder Logic (AND Gate)
export const LadderLogicLab = () => {
    const [sw1, setSw1] = useState(false);
    const [sw2, setSw2] = useState(false);
    const out = sw1 && sw2;
    return (
        <div className="p-6 bg-white rounded-3xl border border-gray-100 shadow-sm h-full flex flex-col items-center">
            <div className="w-full h-40 bg-gray-50 rounded-2xl relative p-8 border border-gray-100 mb-6">
                <div className="flex items-center justify-between w-full h-full relative">
                    <div className="w-0.5 h-full bg-gray-900 absolute left-0"></div>
                    <div className="w-0.5 h-full bg-gray-900 absolute right-0"></div>
                    
                    <div className="flex-1 flex items-center gap-8 px-4">
                        <button onClick={()=>setSw1(!sw1)} className={`w-8 h-8 border-2 flex items-center justify-center font-black text-xs transition-all ${sw1 ? 'bg-green-500 border-green-600 text-white shadow-lg' : 'bg-white'}`}>I:0/0</button>
                        <div className="h-0.5 flex-1 bg-gray-300"></div>
                        <button onClick={()=>setSw2(!sw2)} className={`w-8 h-8 border-2 flex items-center justify-center font-black text-xs transition-all ${sw2 ? 'bg-green-500 border-green-600 text-white shadow-lg' : 'bg-white'}`}>I:0/1</button>
                        <div className="h-0.5 flex-1 bg-gray-300"></div>
                        <div className={`w-10 h-10 rounded-full border-2 flex items-center justify-center font-black text-[10px] transition-all ${out ? 'bg-yellow-400 border-yellow-500 shadow-[0_0_15px_rgba(250,204,21,0.5)]' : 'bg-white'}`}>O:0/0</div>
                    </div>
                </div>
            </div>
            <p className="text-[10px] text-gray-400 italic">Ladder Diagram for AND Logic in Industrial Automation.</p>
        </div>
    );
};

// 2. Bottle Filling Automation
export const BottleFillingLab = () => {
    const [level, setLevel] = useState(0);
    const [active, setActive] = useState(false);
    const fill = () => {
        setActive(true);
        const timer = setInterval(() => {
            setLevel(l => {
                if (l >= 100) { clearInterval(timer); setActive(false); return 100; }
                return l + 10;
            });
        }, 300);
    };
    return (
        <div className="p-6 bg-white rounded-3xl border border-gray-100 shadow-sm h-full flex flex-col items-center">
            <div className="w-full h-40 bg-gray-900 rounded-2xl relative mb-8 flex flex-col items-center p-4">
                <div className="w-16 h-2 bg-gray-700 rounded-full mb-4"></div>
                <div className="w-12 h-24 border-2 border-white/20 rounded-b-xl relative overflow-hidden bg-white/5">
                    <div className="absolute bottom-0 w-full bg-blue-400/40 transition-all duration-300" style={{ height: `${level}%` }}></div>
                </div>
                {active && <div className="absolute top-8 w-1 h-8 bg-blue-300 animate-pulse"></div>}
            </div>
            <div className="flex gap-2 w-full">
                <button onClick={fill} disabled={active} className="flex-1 py-2 bg-green-600 text-white rounded-xl font-bold text-xs shadow-md disabled:opacity-50">Start Process</button>
                <button onClick={()=>{setLevel(0); setActive(false);}} className="px-4 py-2 bg-gray-100 text-gray-500 rounded-xl font-bold text-xs">Reset</button>
            </div>
        </div>
    );
};

// 3. Project Literature Survey
export const ProjectSurveyLab = () => {
    const [papers, setPapers] = useState(0);
    return (
        <div className="p-6 bg-white rounded-3xl border border-gray-100 shadow-sm h-full flex flex-col items-center">
            <div className="w-full h-32 bg-gray-50 rounded-2xl relative mb-6 flex items-center justify-center border-2 border-dashed border-gray-200">
                <div className="flex flex-wrap gap-2 p-4 justify-center">
                    {Array(papers).fill(0).map((_,i)=><FileText key={i} className="text-indigo-600 animate-in zoom-in" size={24} />)}
                    {papers === 0 && <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">No Sources Added</span>}
                </div>
            </div>
            <button onClick={()=>setPapers(p=>Math.min(10, p+1))} className="px-6 py-2 bg-gray-900 text-white rounded-xl font-bold text-xs flex items-center gap-2"><Search size={14} /> Add Research Paper</button>
            <p className="mt-4 text-[10px] font-black text-indigo-900 uppercase">Confidence Score: {papers * 10}%</p>
        </div>
    );
};

// 4. Project Final Submission
export const ProjectSubmissionLab = () => {
    const [submitting, setSubmitting] = useState(false);
    const [done, setDone] = useState(false);
    return (
        <div className="p-6 bg-white rounded-3xl border border-gray-100 shadow-sm h-full flex flex-col items-center justify-center">
            {!done ? (
                <div className="text-center">
                    <FileText className={`w-16 h-16 mx-auto mb-4 text-gray-300 ${submitting ? 'animate-bounce text-indigo-600' : ''}`} />
                    <button 
                        onClick={()=>{setSubmitting(true); setTimeout(()=>{setSubmitting(false); setDone(true);}, 3000);}}
                        className="px-8 py-2 bg-indigo-600 text-white rounded-xl font-bold text-sm shadow-xl"
                    >
                        Submit Final Report
                    </button>
                </div>
            ) : (
                <div className="text-center animate-in zoom-in">
                    <CheckCircle2 className="w-16 h-16 mx-auto mb-4 text-green-500" />
                    <h3 className="font-black text-green-600 uppercase tracking-widest">Graduated!</h3>
                    <p className="text-[10px] text-gray-400 mt-2">Diploma Course Completed successfully.</p>
                </div>
            )}
        </div>
    );
};

// 5. Star-Delta Starter (Electrical)
export const StarDeltaLab = () => {
    const [mode, setMode] = useState('OFF');
    return (
        <div className="p-6 bg-white rounded-3xl border border-gray-100 shadow-sm h-full flex flex-col items-center">
            <div className="w-full h-40 bg-gray-50 rounded-2xl relative mb-6 flex items-center justify-center p-4">
                <div className="flex gap-4">
                    <div className={`w-12 h-12 rounded-xl border-4 flex items-center justify-center font-black text-[10px] transition-all ${mode === 'Star' ? 'bg-yellow-400 border-yellow-600 scale-110 shadow-lg' : 'bg-white'}`}>STAR</div>
                    <div className={`w-12 h-12 rounded-xl border-4 flex items-center justify-center font-black text-[10px] transition-all ${mode === 'Delta' ? 'bg-green-500 border-green-600 text-white scale-110 shadow-lg' : 'bg-white'}`}>DELTA</div>
                </div>
                <div className="absolute top-2 right-2 flex flex-col items-center">
                    <Zap className={mode !== 'OFF' ? 'text-orange-500 animate-pulse' : 'text-gray-200'} />
                    <span className="text-[8px] font-black uppercase text-gray-400">Motor</span>
                </div>
            </div>
            <div className="flex gap-2 w-full">
                <button onClick={()=>setMode('Star')} className="flex-1 py-2 bg-indigo-600 text-white rounded-xl font-bold text-xs">Start (Star)</button>
                <button onClick={()=>setMode('Delta')} className="flex-1 py-2 bg-green-600 text-white rounded-xl font-bold text-xs">Switch to Delta</button>
                <button onClick={()=>setMode('OFF')} className="flex-1 py-2 bg-red-600 text-white rounded-xl font-bold text-xs">Stop</button>
            </div>
        </div>
    );
};

// 6. Web Deployment (Vercel/Firebase)
export const WebDeploymentLab = () => {
    const [log, setLog] = useState(['Waiting for deployment...']);
    const deploy = () => {
        setLog(l => [...l, 'Building project...', 'Optimizing assets...', 'Uploading to Edge...']);
        setTimeout(()=>setLog(l => [...l, '✅ Deployment Successful!', 'URL: https://my-app.vercel.app']), 2000);
    };
    return (
        <div className="p-6 bg-white rounded-3xl border border-gray-100 shadow-sm h-full flex flex-col items-center">
            <div className="w-full bg-gray-900 rounded-xl p-4 font-mono text-[9px] text-gray-300 mb-6 h-32 overflow-auto shadow-inner">
                {log.map((l, i) => <p key={i} className={l.includes('✅') ? 'text-green-400' : ''}>{l}</p>)}
            </div>
            <button onClick={deploy} className="w-full py-2 bg-indigo-600 text-white rounded-xl font-bold text-xs flex items-center justify-center gap-2 shadow-lg"><Network size={14} /> Deploy to Production</button>
        </div>
    );
};

// 7. Software Testing (Unit Testing)
export const SoftwareTestingLab = () => {
    const [test, setTest] = useState(null);
    return (
        <div className="p-6 bg-white rounded-3xl border border-gray-100 shadow-sm h-full flex flex-col items-center">
            <div className="w-full bg-gray-50 border rounded-xl p-4 mb-6">
                <p className="text-[10px] font-mono mb-2">test("adds 1 + 2 to equal 3", () =&gt; &#123;</p>
                <p className="text-[10px] font-mono ml-4">expect(sum(1, 2)).toBe(3);</p>
                <p className="text-[10px] font-mono">&#125;);</p>
            </div>
            <button onClick={()=>setTest(true)} className="w-full py-2 bg-green-600 text-white rounded-xl font-bold text-xs shadow-md">Run Jest Tests</button>
            {test && (
                <div className="mt-4 flex items-center gap-2 p-2 bg-green-50 border border-green-100 rounded-lg w-full animate-in slide-in-from-top">
                    <CheckCircle2 size={16} className="text-green-600" />
                    <span className="text-[10px] font-black text-green-700">PASS: sum.test.js (100%)</span>
                </div>
            )}
        </div>
    );
};

// 8. Entrepreneurship (Business Plan)
export const EntrepreneurshipLab = () => {
    const [stage, setStage] = useState(0);
    const steps = ['Ideation', 'Market Research', 'Prototyping', 'Funding'];
    return (
        <div className="p-6 bg-white rounded-3xl border border-gray-100 shadow-sm h-full flex flex-col items-center">
            <div className="flex gap-2 w-full mb-8">
                {steps.map((s, i) => (
                    <div key={i} className={`flex-1 h-2 rounded-full transition-colors ${stage >= i ? 'bg-indigo-600 shadow-[0_0_10px_rgba(79,70,229,0.3)]' : 'bg-gray-100'}`}></div>
                ))}
            </div>
            <div className="w-full bg-indigo-50 border border-indigo-100 rounded-2xl p-6 text-center mb-6 min-h-[100px] flex flex-col items-center justify-center">
                <h4 className="text-xs font-black text-indigo-900 uppercase tracking-widest">{steps[stage]}</h4>
                <p className="text-[10px] text-indigo-600 mt-2 italic">Building the next unicorn...</p>
            </div>
            <button onClick={()=>setStage(s=>Math.min(3, s+1))} className="w-full py-2 bg-gray-900 text-white rounded-xl font-bold text-xs">Next Phase</button>
        </div>
    );
};
