import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  Volume2, VolumeX, Mic, MicOff, Type, Eye, Moon, Sun,
  Settings, Play, Pause, SkipForward, SkipBack, Trash2,
  Copy, Check, Save, Sparkles, Info, Accessibility as AccessibilityIcon,
  ChevronRight, ZoomIn, ZoomOut, Contrast, Headphones
} from 'lucide-react';

// --- ACCESSIBILITY TOOLS COMPONENT ---
const AccessibilityTools = ({ theme }) => {
  const primaryColor = theme?.primary || '#2E5843';

  const [activeModule, setActiveModule] = useState(null);

  // --- TTS State ---
  const [ttsText, setTtsText] = useState('');
  const [ttsRate, setTtsRate] = useState(1.0);
  const [ttsPitch, setTtsPitch] = useState(1.0);
  const [ttsVoice, setTtsVoice] = useState(null);
  const [availableVoices, setAvailableVoices] = useState([]);
  const [isTtsSpeaking, setIsTtsSpeaking] = useState(false);
  const [isTtsPaused, setIsTtsPaused] = useState(false);

  // --- STT State ---
  const [isListening, setIsListening] = useState(false);
  const [sttTranscript, setSttTranscript] = useState('');
  const [sttNotes, setSttNotes] = useState([]);
  const [sttInterim, setSttInterim] = useState('');
  const [isCopied, setIsCopied] = useState(false);
  const recognitionRef = useRef(null);

  // --- Display Settings State ---
  const [fontSize, setFontSize] = useState(16);
  const [highContrast, setHighContrast] = useState(false);
  const [dyslexiaFont, setDyslexiaFont] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [lineSpacing, setLineSpacing] = useState(1.6);

  // Load voices
  useEffect(() => {
    const loadVoices = () => {
      const voices = window.speechSynthesis.getVoices();
      // Prefer Indian English or Hindi voices
      const sorted = voices.sort((a, b) => {
        if (a.lang.includes('IN')) return -1;
        if (b.lang.includes('IN')) return 1;
        return 0;
      });
      setAvailableVoices(sorted);
      if (sorted.length > 0 && !ttsVoice) {
        setTtsVoice(sorted.find(v => v.lang.includes('en')) || sorted[0]);
      }
    };

    loadVoices();
    window.speechSynthesis.onvoiceschanged = loadVoices;
    return () => { window.speechSynthesis.cancel(); };
  }, []);

  // --- TTS Functions ---
  const handleTtsSpeak = () => {
    if (!ttsText.trim()) return;
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(ttsText);
    utterance.rate = ttsRate;
    utterance.pitch = ttsPitch;
    if (ttsVoice) utterance.voice = ttsVoice;

    utterance.onstart = () => { setIsTtsSpeaking(true); setIsTtsPaused(false); };
    utterance.onend = () => { setIsTtsSpeaking(false); setIsTtsPaused(false); };
    utterance.onerror = () => { setIsTtsSpeaking(false); setIsTtsPaused(false); };

    window.speechSynthesis.speak(utterance);
  };

  const handleTtsPause = () => {
    if (isTtsPaused) {
      window.speechSynthesis.resume();
      setIsTtsPaused(false);
    } else {
      window.speechSynthesis.pause();
      setIsTtsPaused(true);
    }
  };

  const handleTtsStop = () => {
    window.speechSynthesis.cancel();
    setIsTtsSpeaking(false);
    setIsTtsPaused(false);
  };

  // --- STT Functions ---
  const startListening = useCallback(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert('Speech Recognition is not supported in this browser. Please use Chrome or Edge.');
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'en-IN';

    recognition.onresult = (event) => {
      let interim = '';
      let final = '';
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          final += transcript + ' ';
        } else {
          interim += transcript;
        }
      }
      if (final) {
        setSttTranscript(prev => prev + final);
      }
      setSttInterim(interim);
    };

    recognition.onerror = (event) => {
      console.error('STT Error:', event.error);
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognitionRef.current = recognition;
    recognition.start();
    setIsListening(true);
  }, []);

  const stopListening = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
    setIsListening(false);
    setSttInterim('');
  };

  const saveNote = () => {
    if (sttTranscript.trim()) {
      setSttNotes(prev => [...prev, {
        id: Date.now(),
        text: sttTranscript.trim(),
        timestamp: new Date().toLocaleTimeString()
      }]);
      setSttTranscript('');
    }
  };

  const handleCopyTranscript = () => {
    navigator.clipboard.writeText(sttTranscript);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  // --- Module Cards ---
  const MODULES = [
    {
      id: 'tts',
      title: 'Read Aloud',
      subtitle: 'Text-to-Speech Engine',
      description: 'Convert any text to natural speech. Ideal for students with visual impairments or reading difficulties.',
      icon: Volume2,
      color: 'bg-purple-50 text-purple-600 border-purple-100',
      iconBg: 'bg-purple-100'
    },
    {
      id: 'stt',
      title: 'Voice Notes',
      subtitle: 'Speech-to-Text Recorder',
      description: 'Dictate notes using your voice. Perfect for students with motor disabilities or during lectures.',
      icon: Mic,
      color: 'bg-blue-50 text-blue-600 border-blue-100',
      iconBg: 'bg-blue-100'
    },
    {
      id: 'display',
      title: 'Display Settings',
      subtitle: 'Visual Adjustments',
      description: 'Customize font size, contrast, line spacing, and enable dyslexia-friendly mode.',
      icon: Eye,
      color: 'bg-amber-50 text-amber-600 border-amber-100',
      iconBg: 'bg-amber-100'
    }
  ];

  // --- Render TTS Module ---
  const renderTTS = () => (
    <div className="animate-in fade-in space-y-6">
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-gray-100 bg-gray-50/50">
          <h3 className="text-sm font-bold text-gray-700 flex items-center gap-2">
            <Headphones className="w-4 h-4 text-purple-500" /> Read Aloud Engine
          </h3>
          <p className="text-xs text-gray-400 mt-0.5">Paste any textbook content, notes, or questions below</p>
        </div>
        <textarea
          value={ttsText}
          onChange={(e) => setTtsText(e.target.value)}
          placeholder="Paste your study material, textbook paragraphs, or assignment questions here...\n\nThe AI will read it aloud in a natural voice."
          className="w-full p-5 text-sm text-gray-800 resize-none outline-none min-h-[180px] leading-relaxed bg-transparent placeholder:text-gray-300"
        />
      </div>

      {/* Controls */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5 space-y-5">
        {/* Voice Selector */}
        <div>
          <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 block">Voice</label>
          <select
            value={ttsVoice?.name || ''}
            onChange={(e) => setTtsVoice(availableVoices.find(v => v.name === e.target.value))}
            className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none focus:border-gray-400 transition-colors"
          >
            {availableVoices.map((v, i) => (
              <option key={i} value={v.name}>
                {v.name} ({v.lang})
              </option>
            ))}
          </select>
        </div>

        {/* Sliders */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 flex justify-between">
              <span>Speed</span>
              <span className="text-gray-400">{ttsRate.toFixed(1)}x</span>
            </label>
            <input
              type="range" min="0.5" max="2" step="0.1"
              value={ttsRate}
              onChange={(e) => setTtsRate(parseFloat(e.target.value))}
              className="w-full accent-purple-600 h-2 rounded-full"
            />
          </div>
          <div>
            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 flex justify-between">
              <span>Pitch</span>
              <span className="text-gray-400">{ttsPitch.toFixed(1)}</span>
            </label>
            <input
              type="range" min="0.5" max="2" step="0.1"
              value={ttsPitch}
              onChange={(e) => setTtsPitch(parseFloat(e.target.value))}
              className="w-full accent-purple-600 h-2 rounded-full"
            />
          </div>
        </div>

        {/* Playback Buttons */}
        <div className="flex items-center gap-3 pt-2">
          {!isTtsSpeaking ? (
            <button
              onClick={handleTtsSpeak}
              disabled={!ttsText.trim()}
              className="flex-1 sm:flex-none px-6 py-3 rounded-xl text-white font-bold text-sm flex items-center justify-center gap-2 shadow-lg hover:shadow-xl transition-all disabled:opacity-50 active:scale-95"
              style={{ backgroundColor: primaryColor }}
            >
              <Play className="w-4 h-4" /> Start Reading
            </button>
          ) : (
            <>
              <button
                onClick={handleTtsPause}
                className="px-5 py-3 rounded-xl bg-amber-100 text-amber-700 font-bold text-sm flex items-center gap-2 hover:bg-amber-200 transition-all active:scale-95"
              >
                {isTtsPaused ? <Play className="w-4 h-4" /> : <Pause className="w-4 h-4" />}
                {isTtsPaused ? 'Resume' : 'Pause'}
              </button>
              <button
                onClick={handleTtsStop}
                className="px-5 py-3 rounded-xl bg-red-100 text-red-700 font-bold text-sm flex items-center gap-2 hover:bg-red-200 transition-all active:scale-95"
              >
                <VolumeX className="w-4 h-4" /> Stop
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );

  // --- Render STT Module ---
  const renderSTT = () => (
    <div className="animate-in fade-in space-y-6">
      {/* Microphone Area */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 flex flex-col items-center gap-4">
        <button
          onClick={isListening ? stopListening : startListening}
          className={`w-20 h-20 rounded-full flex items-center justify-center transition-all shadow-xl active:scale-95 ${
            isListening ? 'bg-red-500 animate-pulse scale-110' : 'hover:scale-105'
          }`}
          style={!isListening ? { backgroundColor: primaryColor } : {}}
        >
          {isListening ? <MicOff className="w-8 h-8 text-white" /> : <Mic className="w-8 h-8 text-white" />}
        </button>
        <div className="text-center">
          <p className="text-sm font-bold text-gray-800">
            {isListening ? 'Listening... Speak now' : 'Tap to start dictating'}
          </p>
          <p className="text-xs text-gray-400 mt-0.5">
            {isListening ? 'Tap again to stop recording' : 'Uses your device microphone'}
          </p>
        </div>

        {/* Live Waveform Indicator */}
        {isListening && (
          <div className="flex items-center gap-1">
            {[...Array(7)].map((_, i) => (
              <div
                key={i}
                className="w-1.5 bg-red-500 rounded-full animate-pulse"
                style={{
                  height: `${12 + Math.random() * 20}px`,
                  animationDelay: `${i * 0.1}s`,
                  animationDuration: `${0.5 + Math.random() * 0.5}s`
                }}
              />
            ))}
          </div>
        )}
      </div>

      {/* Transcript Display */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-gray-100 bg-gray-50/50 flex justify-between items-center">
          <h3 className="text-sm font-bold text-gray-700">Live Transcript</h3>
          <div className="flex items-center gap-2">
            {sttTranscript && (
              <>
                <button
                  onClick={handleCopyTranscript}
                  className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 transition-colors"
                >
                  {isCopied ? <Check className="w-4 h-4 text-green-600" /> : <Copy className="w-4 h-4" />}
                </button>
                <button
                  onClick={saveNote}
                  className="px-3 py-1.5 rounded-lg text-xs font-bold text-white flex items-center gap-1 shadow-sm active:scale-95"
                  style={{ backgroundColor: primaryColor }}
                >
                  <Save className="w-3 h-3" /> Save Note
                </button>
              </>
            )}
          </div>
        </div>
        <div className="p-5 min-h-[120px] text-sm text-gray-800 leading-relaxed">
          {sttTranscript || sttInterim ? (
            <>
              <span>{sttTranscript}</span>
              <span className="text-gray-400 italic">{sttInterim}</span>
            </>
          ) : (
            <p className="text-gray-300 text-center py-6">Your dictation will appear here in real time...</p>
          )}
        </div>
      </div>

      {/* Saved Notes */}
      {sttNotes.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-sm font-bold text-gray-700 flex items-center gap-2">
            <Save className="w-4 h-4 text-gray-400" /> Saved Notes ({sttNotes.length})
          </h3>
          {sttNotes.map(note => (
            <div key={note.id} className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm group">
              <div className="flex justify-between items-start mb-2">
                <span className="text-[10px] font-bold text-gray-400">{note.timestamp}</span>
                <button
                  onClick={() => setSttNotes(prev => prev.filter(n => n.id !== note.id))}
                  className="p-1 rounded hover:bg-red-50 text-gray-300 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              </div>
              <p className="text-sm text-gray-700 leading-relaxed">{note.text}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  // --- Render Display Settings Module ---
  const renderDisplaySettings = () => {
    const previewStyle = {
      fontSize: `${fontSize}px`,
      lineHeight: lineSpacing,
      fontFamily: dyslexiaFont ? "'OpenDyslexic', 'Comic Sans MS', sans-serif" : 'inherit',
      backgroundColor: darkMode ? '#1a1a2e' : highContrast ? '#000' : '#fff',
      color: darkMode ? '#e0e0e0' : highContrast ? '#fff' : '#1f2937',
    };

    return (
      <div className="animate-in fade-in space-y-6">
        {/* Controls */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5 space-y-5">
          {/* Font Size */}
          <div>
            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3 flex justify-between">
              <span className="flex items-center gap-2"><ZoomIn className="w-3.5 h-3.5" /> Font Size</span>
              <span className="text-gray-400">{fontSize}px</span>
            </label>
            <div className="flex items-center gap-3">
              <button onClick={() => setFontSize(Math.max(12, fontSize - 2))} className="p-2 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors">
                <ZoomOut className="w-4 h-4 text-gray-600" />
              </button>
              <input
                type="range" min="12" max="32" step="1"
                value={fontSize}
                onChange={(e) => setFontSize(parseInt(e.target.value))}
                className="flex-1 h-2 rounded-full"
                style={{ accentColor: primaryColor }}
              />
              <button onClick={() => setFontSize(Math.min(32, fontSize + 2))} className="p-2 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors">
                <ZoomIn className="w-4 h-4 text-gray-600" />
              </button>
            </div>
          </div>

          {/* Line Spacing */}
          <div>
            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3 flex justify-between">
              <span>Line Spacing</span>
              <span className="text-gray-400">{lineSpacing.toFixed(1)}</span>
            </label>
            <input
              type="range" min="1.2" max="3" step="0.1"
              value={lineSpacing}
              onChange={(e) => setLineSpacing(parseFloat(e.target.value))}
              className="w-full h-2 rounded-full"
              style={{ accentColor: primaryColor }}
            />
          </div>

          {/* Toggle Options */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
            <button
              onClick={() => setHighContrast(!highContrast)}
              className={`p-4 rounded-xl border-2 flex flex-col items-center gap-2 transition-all ${
                highContrast ? 'border-amber-500 bg-amber-50' : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <Contrast className={`w-5 h-5 ${highContrast ? 'text-amber-600' : 'text-gray-400'}`} />
              <span className="text-xs font-bold text-gray-700">High Contrast</span>
              <span className={`text-[10px] font-bold ${highContrast ? 'text-amber-600' : 'text-gray-400'}`}>
                {highContrast ? 'ON' : 'OFF'}
              </span>
            </button>

            <button
              onClick={() => setDyslexiaFont(!dyslexiaFont)}
              className={`p-4 rounded-xl border-2 flex flex-col items-center gap-2 transition-all ${
                dyslexiaFont ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <Type className={`w-5 h-5 ${dyslexiaFont ? 'text-blue-600' : 'text-gray-400'}`} />
              <span className="text-xs font-bold text-gray-700">Dyslexia Font</span>
              <span className={`text-[10px] font-bold ${dyslexiaFont ? 'text-blue-600' : 'text-gray-400'}`}>
                {dyslexiaFont ? 'ON' : 'OFF'}
              </span>
            </button>

            <button
              onClick={() => setDarkMode(!darkMode)}
              className={`p-4 rounded-xl border-2 flex flex-col items-center gap-2 transition-all ${
                darkMode ? 'border-indigo-500 bg-indigo-50' : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              {darkMode ? <Moon className="w-5 h-5 text-indigo-600" /> : <Sun className="w-5 h-5 text-gray-400" />}
              <span className="text-xs font-bold text-gray-700">Dark Mode</span>
              <span className={`text-[10px] font-bold ${darkMode ? 'text-indigo-600' : 'text-gray-400'}`}>
                {darkMode ? 'ON' : 'OFF'}
              </span>
            </button>
          </div>
        </div>

        {/* Live Preview */}
        <div className="rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="p-3 bg-gray-50 border-b border-gray-100">
            <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Live Preview</span>
          </div>
          <div className="p-6 transition-all duration-300" style={previewStyle}>
            <h3 style={{ fontSize: `${fontSize + 4}px`, fontWeight: 'bold', marginBottom: '12px' }}>
              Newton's Second Law of Motion
            </h3>
            <p style={{ marginBottom: '10px' }}>
              The acceleration of an object is directly proportional to the net force acting on it and
              inversely proportional to its mass. This is expressed mathematically as F = ma.
            </p>
            <p>
              Where F is the net force (in Newtons), m is the mass (in kilograms), and a is the
              acceleration (in meters per second squared). This law forms the foundation of classical mechanics.
            </p>
          </div>
        </div>
      </div>
    );
  };

  // --- Main Layout ---
  if (activeModule) {
    return (
      <div className="animate-in fade-in duration-500 pb-10">
        <button
          onClick={() => setActiveModule(null)}
          className="mb-6 flex items-center gap-2 text-sm font-bold text-gray-500 hover:text-gray-900 transition-colors"
        >
          <SkipBack className="w-4 h-4" /> Back to Accessibility Hub
        </button>
        {activeModule === 'tts' && renderTTS()}
        {activeModule === 'stt' && renderSTT()}
        {activeModule === 'display' && renderDisplaySettings()}
      </div>
    );
  }

  return (
    <div className="animate-in fade-in duration-500 pb-10">
      {/* Header */}
      <div className="mb-6 md:mb-8">
        <h2 className="text-xl md:text-2xl font-bold text-gray-900 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: primaryColor }}>
            <AccessibilityIcon className="w-5 h-5 text-white" />
          </div>
          Accessibility Toolkit
        </h2>
        <p className="text-sm text-gray-500 mt-1 ml-[52px]">
          Tools designed to make learning inclusive for every student, regardless of ability.
        </p>
      </div>

      {/* Module Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
        {MODULES.map(mod => (
          <div
            key={mod.id}
            onClick={() => setActiveModule(mod.id)}
            className={`group bg-white rounded-2xl p-5 md:p-6 border shadow-sm hover:shadow-xl transition-all cursor-pointer flex flex-col justify-between min-h-[200px] ${mod.color}`}
          >
            <div>
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 ${mod.iconBg}`}>
                <mod.icon className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-1 group-hover:text-blue-600 transition-colors">
                {mod.title}
              </h3>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">{mod.subtitle}</p>
              <p className="text-xs text-gray-500 leading-relaxed">{mod.description}</p>
            </div>
            <div className="mt-5 pt-3 border-t border-gray-100 flex items-center text-sm font-bold text-gray-900 group-hover:text-blue-600 transition-colors">
              Open Tool <ChevronRight className="w-4 h-4 ml-1" />
            </div>
          </div>
        ))}
      </div>

      {/* Info Banner */}
      <div className="mt-8 p-5 rounded-2xl border border-emerald-100 bg-emerald-50/50 flex items-start gap-4">
        <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center shrink-0">
          <Info className="w-5 h-5 text-emerald-600" />
        </div>
        <div>
          <h4 className="text-sm font-bold text-emerald-900 mb-1">Inclusive by Design</h4>
          <p className="text-xs text-emerald-700 leading-relaxed">
            All accessibility tools use native browser APIs — no data leaves your device.
            Speech recognition works best in Chrome or Edge browsers. These tools comply with
            WCAG 2.1 accessibility standards.
          </p>
        </div>
      </div>
    </div>
  );
};

export default AccessibilityTools;
