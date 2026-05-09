import React, { useState, useCallback } from 'react';
import axios from 'axios';
import {
  Languages, ArrowRight, Volume2, Copy, Check, Loader2,
  RotateCcw, Sparkles, ChevronDown, BookOpen, VolumeX
} from 'lucide-react';

const API_URL = import.meta.env.VITE_BACK_URI;

// --- Indian Language Database ---
const LANGUAGES = [
  { code: 'hi', name: 'Hindi', native: 'हिन्दी', script: 'Devanagari' },
  { code: 'ta', name: 'Tamil', native: 'தமிழ்', script: 'Tamil' },
  { code: 'te', name: 'Telugu', native: 'తెలుగు', script: 'Telugu' },
  { code: 'kn', name: 'Kannada', native: 'ಕನ್ನಡ', script: 'Kannada' },
  { code: 'ml', name: 'Malayalam', native: 'മലയാളം', script: 'Malayalam' },
  { code: 'bn', name: 'Bengali', native: 'বাংলা', script: 'Bengali' },
  { code: 'mr', name: 'Marathi', native: 'मराठी', script: 'Devanagari' },
  { code: 'gu', name: 'Gujarati', native: 'ગુજરાતી', script: 'Gujarati' },
  { code: 'pa', name: 'Punjabi', native: 'ਪੰਜਾਬੀ', script: 'Gurmukhi' },
  { code: 'or', name: 'Odia', native: 'ଓଡ଼ିଆ', script: 'Odia' },
  { code: 'as', name: 'Assamese', native: 'অসমীয়া', script: 'Bengali' },
  { code: 'ur', name: 'Urdu', native: 'اردو', script: 'Nastaliq' },
  { code: 'en', name: 'English', native: 'English', script: 'Latin' },
];

// --- Quick Phrases for Education ---
const QUICK_PHRASES = [
  "What is the difference between mitosis and meiosis?",
  "Explain Newton's second law of motion.",
  "Define the concept of demand and supply in economics.",
  "What are the main causes of the French Revolution?",
  "Explain photosynthesis in simple terms.",
  "What is Ohm's Law?",
];

const TranslationHub = ({ theme }) => {
  const primaryColor = theme?.primary || '#2E5843';

  const [sourceText, setSourceText] = useState('');
  const [translatedText, setTranslatedText] = useState('');
  const [sourceLang, setSourceLang] = useState('en');
  const [targetLang, setTargetLang] = useState('hi');
  const [isTranslating, setIsTranslating] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [showSourceDropdown, setShowSourceDropdown] = useState(false);
  const [showTargetDropdown, setShowTargetDropdown] = useState(false);
  const [error, setError] = useState('');
  const [charCount, setCharCount] = useState(0);

  const handleTranslate = useCallback(async () => {
    if (!sourceText.trim()) return;
    setIsTranslating(true);
    setError('');
    setTranslatedText('');

    try {
      const srcName = LANGUAGES.find(l => l.code === sourceLang)?.name || 'English';
      const tgtName = LANGUAGES.find(l => l.code === targetLang)?.name || 'Hindi';

      const systemInstruction = `You are an expert educational translator. 
RULES:
1. Preserve all technical/scientific terms accurately.
2. Use simple, student-friendly language.
3. Keep formatting (bullet points, numbering) intact.
4. If the text contains mathematical formulas, keep them in their original notation.
5. Return ONLY the translated text, no explanations or meta-commentary.`;

      const prompt = `Translate the following text from ${srcName} to ${tgtName}:\n\n${sourceText}`;

      const response = await axios.post(`${API_URL}/api/ai/generate`, {
        prompt,
        systemInstruction,
        model: "gemini-2.0-flash"
      });

      setTranslatedText(response.data.text);
    } catch (err) {
      console.error('Translation error:', err);
      setError('Translation failed. Please check your internet connection and try again.');
    } finally {
      setIsTranslating(false);
    }
  }, [sourceText, sourceLang, targetLang]);

  const handleCopy = () => {
    navigator.clipboard.writeText(translatedText);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  const handleSpeak = () => {
    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      return;
    }

    const utterance = new SpeechSynthesisUtterance(translatedText);
    const tgtLang = LANGUAGES.find(l => l.code === targetLang);

    // Map language codes to BCP-47 tags for speech synthesis
    const langMap = {
      'hi': 'hi-IN', 'ta': 'ta-IN', 'te': 'te-IN', 'kn': 'kn-IN',
      'ml': 'ml-IN', 'bn': 'bn-IN', 'mr': 'mr-IN', 'gu': 'gu-IN',
      'pa': 'pa-IN', 'or': 'or-IN', 'as': 'as-IN', 'ur': 'ur-IN', 'en': 'en-IN'
    };

    utterance.lang = langMap[targetLang] || 'en-IN';
    utterance.rate = 0.9;
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    setIsSpeaking(true);
    window.speechSynthesis.speak(utterance);
  };

  const swapLanguages = () => {
    const temp = sourceLang;
    setSourceLang(targetLang);
    setTargetLang(temp);
    if (translatedText) {
      setSourceText(translatedText);
      setTranslatedText('');
    }
  };

  const handleTextChange = (e) => {
    const text = e.target.value;
    if (text.length <= 5000) {
      setSourceText(text);
      setCharCount(text.length);
    }
  };

  const LanguageSelector = ({ value, onChange, show, setShow, label }) => (
    <div className="relative">
      <button
        onClick={() => setShow(!show)}
        className="flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm font-bold text-gray-700 hover:border-gray-400 transition-all shadow-sm min-w-[160px] justify-between"
      >
        <span className="flex items-center gap-2">
          <span className="text-lg">{LANGUAGES.find(l => l.code === value)?.native}</span>
          <span className="text-gray-400 text-xs">{LANGUAGES.find(l => l.code === value)?.name}</span>
        </span>
        <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${show ? 'rotate-180' : ''}`} />
      </button>
      {show && (
        <div className="absolute z-50 top-full mt-2 w-64 bg-white rounded-2xl shadow-2xl border border-gray-100 p-2 max-h-72 overflow-y-auto custom-scrollbar animate-in fade-in slide-in-from-top-2">
          <p className="text-[10px] font-bold text-gray-400 uppercase px-3 py-1 tracking-wider">{label}</p>
          {LANGUAGES.map(lang => (
            <button
              key={lang.code}
              onClick={() => { onChange(lang.code); setShow(false); }}
              className={`w-full text-left px-3 py-2.5 rounded-xl flex items-center gap-3 transition-colors text-sm ${
                value === lang.code ? 'bg-gray-100 font-bold text-gray-900' : 'hover:bg-gray-50 text-gray-700'
              }`}
            >
              <span className="text-lg w-8 text-center">{lang.native.charAt(0)}</span>
              <div>
                <p className="font-bold text-sm">{lang.name}</p>
                <p className="text-[10px] text-gray-400">{lang.native} • {lang.script}</p>
              </div>
              {value === lang.code && <Check className="w-4 h-4 ml-auto text-green-600" />}
            </button>
          ))}
        </div>
      )}
    </div>
  );

  return (
    <div className="animate-in fade-in duration-500 pb-10">
      {/* Header */}
      <div className="mb-6 md:mb-8">
        <h2 className="text-xl md:text-2xl font-bold text-gray-900 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: primaryColor }}>
            <Languages className="w-5 h-5 text-white" />
          </div>
          AI Translation Hub
        </h2>
        <p className="text-sm text-gray-500 mt-1 ml-[52px]">
          Translate educational content to your local language using AI. Supports 12+ Indian languages.
        </p>
      </div>

      {/* Language Selector Row */}
      <div className="flex flex-col sm:flex-row items-center gap-3 mb-6">
        <LanguageSelector
          value={sourceLang}
          onChange={setSourceLang}
          show={showSourceDropdown}
          setShow={(v) => { setShowSourceDropdown(v); setShowTargetDropdown(false); }}
          label="Source Language"
        />
        <button
          onClick={swapLanguages}
          className="p-2.5 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-500 transition-all hover:rotate-180 duration-300"
          title="Swap Languages"
        >
          <RotateCcw className="w-4 h-4" />
        </button>
        <LanguageSelector
          value={targetLang}
          onChange={setTargetLang}
          show={showTargetDropdown}
          setShow={(v) => { setShowTargetDropdown(v); setShowSourceDropdown(false); }}
          label="Target Language"
        />
      </div>

      {/* Translation Area */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
        {/* Source */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm flex flex-col overflow-hidden">
          <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
            <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Source Text</span>
            <span className="text-[10px] text-gray-400 font-mono">{charCount} / 5000</span>
          </div>
          <textarea
            value={sourceText}
            onChange={handleTextChange}
            placeholder="Type or paste your educational content here...\n\nExamples:\n• Textbook paragraphs\n• Assignment questions\n• Lecture notes"
            className="flex-1 p-5 text-sm text-gray-800 resize-none outline-none min-h-[240px] leading-relaxed bg-transparent placeholder:text-gray-300"
          />
        </div>

        {/* Target */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm flex flex-col overflow-hidden relative">
          <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
            <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Translation</span>
            <div className="flex items-center gap-2">
              {translatedText && (
                <>
                  <button
                    onClick={handleSpeak}
                    className={`p-1.5 rounded-lg transition-colors ${isSpeaking ? 'bg-red-100 text-red-600' : 'hover:bg-gray-100 text-gray-400'}`}
                    title={isSpeaking ? "Stop Speaking" : "Read Aloud"}
                  >
                    {isSpeaking ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                  </button>
                  <button
                    onClick={handleCopy}
                    className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 transition-colors"
                    title="Copy Translation"
                  >
                    {isCopied ? <Check className="w-4 h-4 text-green-600" /> : <Copy className="w-4 h-4" />}
                  </button>
                </>
              )}
            </div>
          </div>
          <div className="flex-1 p-5 text-sm text-gray-800 min-h-[240px] leading-relaxed overflow-y-auto custom-scrollbar whitespace-pre-wrap">
            {isTranslating ? (
              <div className="flex flex-col items-center justify-center h-full text-gray-400 gap-3">
                <Loader2 className="w-8 h-8 animate-spin" style={{ color: primaryColor }} />
                <p className="text-sm font-medium">Translating with AI...</p>
              </div>
            ) : translatedText ? (
              translatedText
            ) : error ? (
              <div className="flex items-center justify-center h-full text-red-500 text-sm font-medium">{error}</div>
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-gray-300 text-center gap-2">
                <Languages className="w-10 h-10 opacity-30" />
                <p className="text-sm">Translation will appear here</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Translate Button */}
      <button
        onClick={handleTranslate}
        disabled={isTranslating || !sourceText.trim()}
        className="w-full sm:w-auto px-8 py-3.5 rounded-xl text-white font-bold text-sm flex items-center justify-center gap-2 shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98]"
        style={{ backgroundColor: primaryColor }}
      >
        {isTranslating ? (
          <><Loader2 className="w-4 h-4 animate-spin" /> Translating...</>
        ) : (
          <><Sparkles className="w-4 h-4" /> Translate with AI <ArrowRight className="w-4 h-4" /></>
        )}
      </button>

      {/* Quick Phrases */}
      <div className="mt-8">
        <h3 className="text-sm font-bold text-gray-700 mb-3 flex items-center gap-2">
          <BookOpen className="w-4 h-4 text-gray-400" />
          Quick Educational Phrases
        </h3>
        <div className="flex flex-wrap gap-2">
          {QUICK_PHRASES.map((phrase, idx) => (
            <button
              key={idx}
              onClick={() => { setSourceText(phrase); setCharCount(phrase.length); }}
              className="px-3 py-2 bg-white border border-gray-200 rounded-xl text-xs font-medium text-gray-600 hover:bg-gray-50 hover:border-gray-300 transition-all hover:shadow-sm active:scale-95"
            >
              {phrase.length > 50 ? phrase.substring(0, 50) + '...' : phrase}
            </button>
          ))}
        </div>
      </div>

      {/* Info Banner */}
      <div className="mt-8 p-5 rounded-2xl border border-blue-100 bg-blue-50/50 flex items-start gap-4">
        <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center shrink-0">
          <Sparkles className="w-5 h-5 text-blue-600" />
        </div>
        <div>
          <h4 className="text-sm font-bold text-blue-900 mb-1">AI-Powered Accuracy</h4>
          <p className="text-xs text-blue-700 leading-relaxed">
            Translations are powered by Google Gemini AI, optimized for educational content.
            Technical terms are preserved in context. Use the "Read Aloud" feature for pronunciation help.
          </p>
        </div>
      </div>
    </div>
  );
};

export default TranslationHub;
