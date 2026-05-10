import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Atom, Beaker, Leaf, Brain, Zap, Microscope, Network, Box, Shield, Trash2, Droplet } from 'lucide-react';

// --- PENDULUM SIMULATION ---
export const PendulumLab = ({ theme }) => {
  const canvasRef = useRef(null);
  const animRef = useRef(null);
  const stateRef = useRef({ angle: Math.PI / 4, angularVel: 0, running: true });
  const [length, setLength] = useState(200);
  const [gravity, setGravity] = useState(9.8);
  const [damping, setDamping] = useState(0.999);
  const [isRunning, setIsRunning] = useState(true);

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
    ctx.strokeStyle = '#f0f0f0';
    ctx.lineWidth = 1;
    for (let i = 0; i < W; i += 40) { ctx.beginPath(); ctx.moveTo(i, 0); ctx.lineTo(i, H); ctx.stroke(); }
    for (let i = 0; i < H; i += 40) { ctx.beginPath(); ctx.moveTo(0, i); ctx.lineTo(W, i); ctx.stroke(); }

    ctx.fillStyle = '#374151';
    ctx.fillRect(pivotX - 30, pivotY - 6, 60, 12);
    ctx.beginPath(); ctx.arc(pivotX, pivotY, 6, 0, Math.PI * 2); ctx.fill();

    ctx.beginPath(); ctx.moveTo(pivotX, pivotY); ctx.lineTo(bobX, bobY);
    ctx.strokeStyle = '#6B7280'; ctx.lineWidth = 2; ctx.stroke();

    const grad = ctx.createRadialGradient(bobX - 4, bobY - 4, 2, bobX, bobY, 18);
    grad.addColorStop(0, theme?.primary || '#6366f1');
    grad.addColorStop(1, '#4338ca');
    ctx.beginPath(); ctx.arc(bobX, bobY, 18, 0, Math.PI * 2);
    ctx.fillStyle = grad; ctx.fill();

    animRef.current = requestAnimationFrame(draw);
  }, [length, gravity, damping, theme]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (canvas) { canvas.width = canvas.offsetWidth; canvas.height = canvas.offsetHeight; }
    animRef.current = requestAnimationFrame(draw);
    return () => { if (animRef.current) cancelAnimationFrame(animRef.current); };
  }, [draw]);

  return (
    <div className="flex flex-col gap-6">
      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-4 h-[350px]">
        <canvas ref={canvasRef} className="w-full h-full rounded-2xl cursor-crosshair" />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100">
              <label className="text-xs font-bold text-gray-500 block mb-2">Length (cm)</label>
              <input type="range" min="100" max="250" value={length} onChange={(e) => setLength(parseInt(e.target.value))} className="w-full accent-indigo-600" />
          </div>
          <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100">
              <label className="text-xs font-bold text-gray-500 block mb-2">Gravity (m/s²)</label>
              <input type="range" min="1" max="20" step="0.1" value={gravity} onChange={(e) => setGravity(parseFloat(e.target.value))} className="w-full accent-indigo-600" />
          </div>
          <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100 flex items-end">
              <button onClick={() => { stateRef.current.running = !stateRef.current.running; setIsRunning(!isRunning); }} className="w-full py-2 bg-indigo-600 text-white rounded-xl font-bold">{isRunning ? 'Pause' : 'Resume'}</button>
          </div>
      </div>
    </div>
  );
};

// --- PH SCALE EXPLORER ---
export const PhScaleLab = ({ theme }) => {
  const [ph, setPh] = useState(7);
  const solutions = [
    { name: 'Battery Acid', ph: 0 }, { name: 'Lemon Juice', ph: 2 }, { name: 'Milk', ph: 6 },
    { name: 'Water', ph: 7 }, { name: 'Baking Soda', ph: 9 }, { name: 'Bleach', ph: 13 }
  ];

  const getColor = (v) => {
    if (v < 3) return '#ef4444'; if (v < 6) return '#f97316'; if (v === 7) return '#10b981';
    if (v < 11) return '#3b82f6'; return '#6366f1';
  };

  return (
    <div className="p-8 bg-white rounded-3xl border border-gray-100 shadow-sm h-full flex flex-col items-center">
      <div className="w-32 h-48 border-4 border-gray-200 rounded-b-3xl relative mb-8 overflow-hidden">
          <div className="absolute bottom-0 w-full transition-all duration-700" style={{ height: '70%', backgroundColor: getColor(ph), opacity: 0.4 }}></div>
      </div>
      <div className="text-5xl font-black mb-8" style={{ color: getColor(ph) }}>pH {ph}</div>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3 w-full">
          {solutions.map(s => (
              <button key={s.name} onClick={() => setPh(s.ph)} className="py-2 bg-gray-50 border border-gray-100 rounded-xl text-xs font-bold hover:bg-gray-100 transition-colors">{s.name}</button>
          ))}
      </div>
    </div>
  );
};

// --- CELL EXPLORER ---
export const CellExplorerLab = () => {
  const [active, setActive] = useState(null);
  const organelles = [
    { id: 'nucleus', name: 'Nucleus', desc: 'The brain of the cell, contains DNA.', color: '#ef4444' },
    { id: 'mito', name: 'Mitochondria', desc: 'Powerhouse of the cell, produces energy.', color: '#f59e0b' },
    { id: 'ribo', name: 'Ribosomes', desc: 'Protein factories.', color: '#3b82f6' }
  ];

  return (
    <div className="p-8 bg-white rounded-3xl border border-gray-100 shadow-sm h-full flex flex-col items-center">
      <div className="w-64 h-64 bg-emerald-50 border-4 border-emerald-200 rounded-full relative mb-8 flex items-center justify-center">
          <div onClick={() => setActive(organelles[0])} className="w-16 h-16 bg-red-400 rounded-full border-2 border-red-600 cursor-pointer hover:scale-110 transition-transform"></div>
          <div onClick={() => setActive(organelles[1])} className="absolute top-10 right-10 w-8 h-12 bg-orange-400 rounded-full border-2 border-orange-600 cursor-pointer hover:scale-110 transition-transform rotate-45"></div>
      </div>
      {active ? (
          <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100 w-full animate-in zoom-in">
              <h4 className="font-bold text-gray-900">{active.name}</h4>
              <p className="text-xs text-gray-500 mt-1">{active.desc}</p>
          </div>
      ) : <p className="text-sm text-gray-400 italic">Click on an organelle to learn more.</p>}
    </div>
  );
};
