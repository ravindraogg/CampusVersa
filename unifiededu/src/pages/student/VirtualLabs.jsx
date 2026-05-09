import React, { useState, useRef, useEffect, useCallback } from 'react';
import axios from 'axios';
import {
  FlaskConical, Atom, Leaf, Beaker, ChevronRight, ArrowLeft,
  Play, Pause, RotateCcw, Sparkles, Loader2, Info, Sliders
} from 'lucide-react';

const API_URL = import.meta.env.VITE_BACK_URI;

// --- PENDULUM SIMULATION ---
const PendulumLab = ({ theme }) => {
  const canvasRef = useRef(null);
  const animRef = useRef(null);
  const stateRef = useRef({ angle: Math.PI / 4, angularVel: 0, running: true });
  const [length, setLength] = useState(200);
  const [gravity, setGravity] = useState(9.8);
  const [damping, setDamping] = useState(0.999);
  const [isRunning, setIsRunning] = useState(true);
  const [aiExplanation, setAiExplanation] = useState('');
  const [aiLoading, setAiLoading] = useState(false);

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const W = canvas.width, H = canvas.height;
    const pivotX = W / 2, pivotY = 60;
    const st = stateRef.current;

    if (st.running) {
      const g = gravity / 60;
      const angularAcc = (-g / (length / 80)) * Math.sin(st.angle);
      st.angularVel += angularAcc;
      st.angularVel *= damping;
      st.angle += st.angularVel;
    }

    const bobX = pivotX + (length) * Math.sin(st.angle);
    const bobY = pivotY + (length) * Math.cos(st.angle);

    ctx.clearRect(0, 0, W, H);

    // Background grid
    ctx.strokeStyle = '#f0f0f0';
    ctx.lineWidth = 1;
    for (let i = 0; i < W; i += 40) { ctx.beginPath(); ctx.moveTo(i, 0); ctx.lineTo(i, H); ctx.stroke(); }
    for (let i = 0; i < H; i += 40) { ctx.beginPath(); ctx.moveTo(0, i); ctx.lineTo(W, i); ctx.stroke(); }

    // Pivot
    ctx.fillStyle = '#374151';
    ctx.fillRect(pivotX - 30, pivotY - 6, 60, 12);
    ctx.beginPath(); ctx.arc(pivotX, pivotY, 6, 0, Math.PI * 2); ctx.fill();

    // String
    ctx.beginPath(); ctx.moveTo(pivotX, pivotY); ctx.lineTo(bobX, bobY);
    ctx.strokeStyle = '#6B7280'; ctx.lineWidth = 2; ctx.stroke();

    // Trail
    ctx.beginPath(); ctx.arc(pivotX, pivotY, length, Math.PI / 2 - 0.8, Math.PI / 2 + 0.8);
    ctx.strokeStyle = 'rgba(99, 102, 241, 0.15)'; ctx.lineWidth = 1; ctx.setLineDash([4, 4]); ctx.stroke();
    ctx.setLineDash([]);

    // Bob shadow
    ctx.beginPath(); ctx.arc(bobX + 3, bobY + 3, 18, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(0,0,0,0.08)'; ctx.fill();

    // Bob
    const grad = ctx.createRadialGradient(bobX - 4, bobY - 4, 2, bobX, bobY, 18);
    grad.addColorStop(0, theme?.primary || '#6366f1');
    grad.addColorStop(1, '#4338ca');
    ctx.beginPath(); ctx.arc(bobX, bobY, 18, 0, Math.PI * 2);
    ctx.fillStyle = grad; ctx.fill();
    ctx.strokeStyle = 'rgba(255,255,255,0.3)'; ctx.lineWidth = 2; ctx.stroke();

    // Info text
    ctx.fillStyle = '#6B7280'; ctx.font = '11px Inter, sans-serif';
    ctx.fillText(`θ = ${(st.angle * 180 / Math.PI).toFixed(1)}°`, 12, H - 30);
    ctx.fillText(`ω = ${st.angularVel.toFixed(4)} rad/s`, 12, H - 14);

    animRef.current = requestAnimationFrame(draw);
  }, [length, gravity, damping, theme]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (canvas) { canvas.width = canvas.offsetWidth; canvas.height = canvas.offsetHeight; }
    animRef.current = requestAnimationFrame(draw);
    return () => { if (animRef.current) cancelAnimationFrame(animRef.current); };
  }, [draw]);

  const toggleRunning = () => {
    stateRef.current.running = !stateRef.current.running;
    setIsRunning(!isRunning);
  };

  const resetSim = () => {
    stateRef.current = { angle: Math.PI / 4, angularVel: 0, running: true };
    setIsRunning(true);
  };

  const askAI = async () => {
    setAiLoading(true);
    try {
      const prompt = `Explain the physics of a simple pendulum in 4-5 concise bullet points for a student. Current simulation: length=${(length/80).toFixed(1)}m, gravity=${gravity}m/s², damping=${damping}. What happens if length increases? Keep it under 150 words.`;
      
      const response = await axios.post(`${API_URL}/api/ai/generate`, {
        prompt,
        model: "gemini-2.0-flash"
      });
      
      setAiExplanation(response.data.text);
    } catch { setAiExplanation('Could not connect to AI. Please try again later.'); }
    finally { setAiLoading(false); }
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
          <canvas ref={canvasRef} className="w-full" style={{ height: '380px' }} />
        </div>
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5 space-y-5">
          <h4 className="text-sm font-bold text-gray-700 flex items-center gap-2"><Sliders className="w-4 h-4 text-gray-400" /> Controls</h4>
          <div>
            <label className="text-xs font-bold text-gray-500 flex justify-between mb-1"><span>String Length</span><span>{(length/80).toFixed(1)}m</span></label>
            <input type="range" min="80" max="300" value={length} onChange={e => setLength(+e.target.value)} className="w-full h-2 rounded-full" style={{ accentColor: theme?.primary }} />
          </div>
          <div>
            <label className="text-xs font-bold text-gray-500 flex justify-between mb-1"><span>Gravity</span><span>{gravity} m/s²</span></label>
            <input type="range" min="1" max="20" step="0.1" value={gravity} onChange={e => setGravity(+e.target.value)} className="w-full h-2 rounded-full" style={{ accentColor: theme?.primary }} />
          </div>
          <div>
            <label className="text-xs font-bold text-gray-500 flex justify-between mb-1"><span>Damping</span><span>{damping}</span></label>
            <input type="range" min="0.98" max="1" step="0.001" value={damping} onChange={e => setDamping(+e.target.value)} className="w-full h-2 rounded-full" style={{ accentColor: theme?.primary }} />
          </div>
          <div className="flex gap-2 pt-2">
            <button onClick={toggleRunning} className="flex-1 py-2.5 rounded-xl text-white font-bold text-xs flex items-center justify-center gap-1 active:scale-95" style={{ backgroundColor: theme?.primary }}>
              {isRunning ? <><Pause className="w-3.5 h-3.5" /> Pause</> : <><Play className="w-3.5 h-3.5" /> Play</>}
            </button>
            <button onClick={resetSim} className="flex-1 py-2.5 rounded-xl bg-gray-100 text-gray-700 font-bold text-xs flex items-center justify-center gap-1 hover:bg-gray-200 active:scale-95">
              <RotateCcw className="w-3.5 h-3.5" /> Reset
            </button>
          </div>
          <button onClick={askAI} disabled={aiLoading} className="w-full py-2.5 rounded-xl bg-indigo-50 text-indigo-700 font-bold text-xs flex items-center justify-center gap-1 hover:bg-indigo-100 disabled:opacity-50 active:scale-95 border border-indigo-100">
            {aiLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />} Ask AI to Explain
          </button>
        </div>
      </div>
      {aiExplanation && (
        <div className="p-4 bg-indigo-50 border border-indigo-100 rounded-2xl text-sm text-indigo-900 leading-relaxed whitespace-pre-wrap">
          <p className="font-bold text-xs text-indigo-600 mb-2 flex items-center gap-1"><Sparkles className="w-3 h-3" /> AI Explanation</p>
          {aiExplanation}
        </div>
      )}
    </div>
  );
};

// --- PH SCALE SIMULATION ---
const PhScaleLab = ({ theme }) => {
  const [selectedSolution, setSelectedSolution] = useState(null);
  const [aiExplanation, setAiExplanation] = useState('');
  const [aiLoading, setAiLoading] = useState(false);

  const solutions = [
    { name: 'Battery Acid', ph: 1, color: '#DC2626' },
    { name: 'Lemon Juice', ph: 2, color: '#EA580C' },
    { name: 'Vinegar', ph: 3, color: '#F97316' },
    { name: 'Tomato Juice', ph: 4, color: '#FB923C' },
    { name: 'Black Coffee', ph: 5, color: '#FBBF24' },
    { name: 'Milk', ph: 6.5, color: '#A3E635' },
    { name: 'Pure Water', ph: 7, color: '#22C55E' },
    { name: 'Sea Water', ph: 8, color: '#2DD4BF' },
    { name: 'Baking Soda', ph: 9, color: '#38BDF8' },
    { name: 'Milk of Magnesia', ph: 10, color: '#60A5FA' },
    { name: 'Ammonia', ph: 11, color: '#818CF8' },
    { name: 'Bleach', ph: 13, color: '#A78BFA' },
  ];

  const askAI = async () => {
    if (selectedSolution === null) return;
    setAiLoading(true);
    try {
      const sol = solutions[selectedSolution];
      const prompt = `Explain the pH of ${sol.name} (pH ${sol.ph}) in 3-4 bullet points for a chemistry student. Why is it ${sol.ph < 7 ? 'acidic' : sol.ph > 7 ? 'basic' : 'neutral'}? What ions are present? Keep under 120 words.`;
      
      const response = await axios.post(`${API_URL}/api/ai/generate`, {
        prompt,
        model: "gemini-2.0-flash"
      });
      
      setAiExplanation(response.data.text);
    } catch { setAiExplanation('Connection error. Please try again.'); }
    finally { setAiLoading(false); }
  };

  return (
    <div className="space-y-4">
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5">
        {/* pH Scale Bar */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-red-600">ACIDIC (0)</span>
            <span className="text-xs font-bold text-green-600">NEUTRAL (7)</span>
            <span className="text-xs font-bold text-purple-600">BASIC (14)</span>
          </div>
          <div className="h-8 rounded-full overflow-hidden flex shadow-inner">
            {[...Array(14)].map((_, i) => {
              const hue = (i / 14) * 280;
              return <div key={i} className="flex-1 relative" style={{ backgroundColor: `hsl(${hue}, 70%, 55%)` }}>
                {selectedSolution !== null && Math.round(solutions[selectedSolution].ph) === i + 1 && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-4 h-4 bg-white border-2 border-gray-800 rounded-full shadow-lg animate-bounce" />
                )}
              </div>;
            })}
          </div>
        </div>

        {/* Solution Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
          {solutions.map((sol, idx) => (
            <button
              key={idx}
              onClick={() => setSelectedSolution(idx)}
              className={`p-3 rounded-xl border-2 text-left transition-all active:scale-95 ${selectedSolution === idx ? 'shadow-lg scale-[1.02]' : 'border-gray-200 hover:border-gray-300'}`}
              style={selectedSolution === idx ? { borderColor: sol.color, backgroundColor: sol.color + '15' } : {}}
            >
              <div className="w-6 h-6 rounded-full mb-2 shadow-sm" style={{ backgroundColor: sol.color }} />
              <p className="text-xs font-bold text-gray-800 truncate">{sol.name}</p>
              <p className="text-[10px] text-gray-400 font-mono">pH {sol.ph}</p>
            </button>
          ))}
        </div>

        {selectedSolution !== null && (
          <div className="mt-4 p-4 rounded-xl border border-gray-100 bg-gray-50 flex items-center justify-between">
            <div>
              <p className="text-sm font-bold text-gray-800">{solutions[selectedSolution].name}</p>
              <p className="text-xs text-gray-500">pH {solutions[selectedSolution].ph} — {solutions[selectedSolution].ph < 7 ? 'Acidic' : solutions[selectedSolution].ph > 7 ? 'Basic' : 'Neutral'}</p>
            </div>
            <button onClick={askAI} disabled={aiLoading} className="px-4 py-2 rounded-xl bg-indigo-50 text-indigo-700 font-bold text-xs flex items-center gap-1 hover:bg-indigo-100 disabled:opacity-50 border border-indigo-100 active:scale-95">
              {aiLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />} Explain
            </button>
          </div>
        )}
      </div>
      {aiExplanation && (
        <div className="p-4 bg-indigo-50 border border-indigo-100 rounded-2xl text-sm text-indigo-900 leading-relaxed whitespace-pre-wrap">
          <p className="font-bold text-xs text-indigo-600 mb-2 flex items-center gap-1"><Sparkles className="w-3 h-3" /> AI Explanation</p>
          {aiExplanation}
        </div>
      )}
    </div>
  );
};

// --- CELL EXPLORER ---
const CellExplorerLab = ({ theme }) => {
  const [selectedOrganelle, setSelectedOrganelle] = useState(null);
  const [aiExplanation, setAiExplanation] = useState('');
  const [aiLoading, setAiLoading] = useState(false);

  const organelles = [
    { name: 'Nucleus', emoji: '🟣', desc: 'Control center containing DNA', x: 50, y: 45, color: '#7C3AED' },
    { name: 'Mitochondria', emoji: '🔴', desc: 'Powerhouse — produces ATP energy', x: 30, y: 35, color: '#DC2626' },
    { name: 'Ribosome', emoji: '🟡', desc: 'Protein synthesis factory', x: 70, y: 30, color: '#EAB308' },
    { name: 'Endoplasmic Reticulum', emoji: '🟢', desc: 'Transport network for proteins', x: 65, y: 55, color: '#16A34A' },
    { name: 'Golgi Apparatus', emoji: '🟠', desc: 'Packages and ships proteins', x: 35, y: 65, color: '#EA580C' },
    { name: 'Cell Membrane', emoji: '🔵', desc: 'Protective boundary layer', x: 50, y: 85, color: '#2563EB' },
    { name: 'Lysosome', emoji: '⚪', desc: 'Digestive system of the cell', x: 75, y: 70, color: '#6B7280' },
    { name: 'Vacuole', emoji: '🫧', desc: 'Storage for water and nutrients', x: 25, y: 50, color: '#06B6D4' },
  ];

  const askAI = async (org) => {
    setAiLoading(true);
    try {
      const prompt = `Explain the ${org.name} organelle in an animal cell. Include: function, structure, importance. 4 bullet points, under 100 words. Student-friendly language.`;
      
      const response = await axios.post(`${API_URL}/api/ai/generate`, {
        prompt,
        model: "gemini-2.0-flash"
      });
      
      setAiExplanation(response.data.text);
    } catch { setAiExplanation('Connection error. Please try again.'); }
    finally { setAiLoading(false); }
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Cell Visualization */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-200 shadow-sm p-6 relative" style={{ minHeight: '380px' }}>
          {/* Cell body */}
          <div className="absolute inset-8 rounded-[50%] border-4 border-blue-200 bg-gradient-to-br from-blue-50 to-cyan-50" />
          {/* Nucleus */}
          <div className="absolute rounded-full border-4 border-purple-300 bg-purple-100" style={{ left: '42%', top: '35%', width: '80px', height: '80px' }}>
            <div className="absolute inset-2 rounded-full bg-purple-200 opacity-50" />
          </div>
          {/* Organelle dots */}
          {organelles.map((org, idx) => (
            <button
              key={idx}
              onClick={() => { setSelectedOrganelle(idx); setAiExplanation(''); }}
              className={`absolute z-10 transition-all hover:scale-125 active:scale-95 ${selectedOrganelle === idx ? 'scale-125 animate-pulse' : ''}`}
              style={{ left: `${org.x}%`, top: `${org.y}%`, transform: 'translate(-50%, -50%)' }}
              title={org.name}
            >
              <span className="text-2xl drop-shadow-md">{org.emoji}</span>
            </button>
          ))}
        </div>

        {/* Info Panel */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5 space-y-3">
          <h4 className="text-sm font-bold text-gray-700">Cell Organelles</h4>
          <p className="text-xs text-gray-400">Tap an organelle on the cell to learn about it</p>
          <div className="space-y-2 max-h-[260px] overflow-y-auto custom-scrollbar pr-1">
            {organelles.map((org, idx) => (
              <button
                key={idx}
                onClick={() => { setSelectedOrganelle(idx); setAiExplanation(''); }}
                className={`w-full text-left p-3 rounded-xl border transition-all flex items-center gap-3 ${selectedOrganelle === idx ? 'border-blue-300 bg-blue-50 shadow-sm' : 'border-gray-100 hover:border-gray-200 hover:bg-gray-50'}`}
              >
                <span className="text-lg">{org.emoji}</span>
                <div className="min-w-0">
                  <p className="text-xs font-bold text-gray-800 truncate">{org.name}</p>
                  <p className="text-[10px] text-gray-400 truncate">{org.desc}</p>
                </div>
              </button>
            ))}
          </div>
          {selectedOrganelle !== null && (
            <button onClick={() => askAI(organelles[selectedOrganelle])} disabled={aiLoading} className="w-full py-2.5 rounded-xl bg-indigo-50 text-indigo-700 font-bold text-xs flex items-center justify-center gap-1 hover:bg-indigo-100 disabled:opacity-50 border border-indigo-100 active:scale-95">
              {aiLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />} Deep Dive with AI
            </button>
          )}
        </div>
      </div>
      {aiExplanation && (
        <div className="p-4 bg-indigo-50 border border-indigo-100 rounded-2xl text-sm text-indigo-900 leading-relaxed whitespace-pre-wrap">
          <p className="font-bold text-xs text-indigo-600 mb-2 flex items-center gap-1"><Sparkles className="w-3 h-3" /> AI Explanation — {organelles[selectedOrganelle]?.name}</p>
          {aiExplanation}
        </div>
      )}
    </div>
  );
};

// --- MAIN VIRTUAL LABS COMPONENT ---
const LABS = [
  { id: 'pendulum', title: 'Simple Pendulum', subject: 'Physics', description: 'Explore oscillation, gravity, and damping with an interactive pendulum.', icon: Atom, color: 'bg-indigo-50 text-indigo-600 border-indigo-100', component: PendulumLab },
  { id: 'phscale', title: 'pH Scale Explorer', subject: 'Chemistry', description: 'Test different solutions and learn about acidity, neutrality, and alkalinity.', icon: Beaker, color: 'bg-emerald-50 text-emerald-600 border-emerald-100', component: PhScaleLab },
  { id: 'cell', title: 'Cell Structure', subject: 'Biology', description: 'Explore the animal cell and learn about each organelle interactively.', icon: Leaf, color: 'bg-pink-50 text-pink-600 border-pink-100', component: CellExplorerLab },
];

const VirtualLabs = ({ theme }) => {
  const [activeLab, setActiveLab] = useState(null);
  const primaryColor = theme?.primary || '#2E5843';

  if (activeLab) {
    const lab = LABS.find(l => l.id === activeLab);
    const LabComponent = lab.component;
    return (
      <div className="animate-in fade-in duration-500 pb-10">
        <button onClick={() => setActiveLab(null)} className="mb-5 flex items-center gap-2 text-sm font-bold text-gray-500 hover:text-gray-900 transition-colors">
          <ArrowLeft className="w-4 h-4" /> Back to Virtual Labs
        </button>
        <div className="mb-5">
          <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">{lab.title} <span className="text-xs font-bold px-2 py-1 rounded-lg bg-gray-100 text-gray-500">{lab.subject}</span></h2>
          <p className="text-sm text-gray-500 mt-1">{lab.description}</p>
        </div>
        <LabComponent theme={theme} />
      </div>
    );
  }

  return (
    <div className="animate-in fade-in duration-500 pb-10">
      <div className="mb-6 md:mb-8">
        <h2 className="text-xl md:text-2xl font-bold text-gray-900 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: primaryColor }}>
            <FlaskConical className="w-5 h-5 text-white" />
          </div>
          Virtual Labs
        </h2>
        <p className="text-sm text-gray-500 mt-1 ml-[52px]">Interactive science experiments you can run on any device — no physical lab required.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
        {LABS.map(lab => (
          <div key={lab.id} onClick={() => setActiveLab(lab.id)} className={`group bg-white rounded-2xl p-5 md:p-6 border shadow-sm hover:shadow-xl transition-all cursor-pointer flex flex-col justify-between min-h-[200px] ${lab.color}`}>
            <div>
              <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-4 bg-white/80 shadow-sm">
                <lab.icon className="w-6 h-6" />
              </div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-1">{lab.subject}</p>
              <h3 className="text-lg font-bold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">{lab.title}</h3>
              <p className="text-xs text-gray-500 leading-relaxed">{lab.description}</p>
            </div>
            <div className="mt-5 pt-3 border-t border-gray-100 flex items-center text-sm font-bold text-gray-900 group-hover:text-blue-600 transition-colors">
              Start Experiment <ChevronRight className="w-4 h-4 ml-1" />
            </div>
          </div>
        ))}
      </div>

      <div className="mt-8 p-5 rounded-2xl border border-orange-100 bg-orange-50/50 flex items-start gap-4">
        <div className="w-10 h-10 rounded-xl bg-orange-100 flex items-center justify-center shrink-0">
          <Info className="w-5 h-5 text-orange-600" />
        </div>
        <div>
          <h4 className="text-sm font-bold text-orange-900 mb-1">Hands-on Learning, Anywhere</h4>
          <p className="text-xs text-orange-700 leading-relaxed">
            These simulations run entirely in your browser — no downloads needed. Adjust parameters,
            observe results in real-time, and use the "Ask AI" button to get instant explanations.
          </p>
        </div>
      </div>
    </div>
  );
};

export default VirtualLabs;
