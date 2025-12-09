import React, { useState, useRef, useEffect } from 'react';
import { GoogleGenerativeAI } from "@google/generative-ai";
import { Send, Bot, User, Trash2, Sparkles, X } from 'lucide-react';
import ReactMarkdown from 'react-markdown'; 

// --- CONFIGURATION ---
// ⚠️ NOTE: In production, never store API keys in frontend code. Use environment variables.
// Replace this with your actual key if not using .env
const GOV_API_KEY = import.meta.env.VITE_GOV_API_KEY; 

const genAI = new GoogleGenerativeAI(GOV_API_KEY);

const MOCK_SCHEMAS = {
  Faculty: "Fields: Name, FID (Faculty ID), Designation, Department, Email, Phone, Research (Papers, Citations), Work History.",
  Student: "Fields: Name, SID (Student ID), Roll Number, Department, Semester, Section, CGPA, Attendance (%), Course Enrollments.",
  Institute: "Fields: Name, Code, AISHE Code, Address, Accreditation (NAAC Grade), Total Students, Total Faculty.",
  Course: "Fields: Name, Code, Credits, Department, Semester, Syllabus, Resources."
};

const CompleteChatbot = () => {
  const [question, setQuestion] = useState('');
  const [messages, setMessages] = useState([
    {
      role: 'bot',
      content: 'Hello! I\'m your CampusVersa AI Assistant. I can help you with course studies, assignments, or understanding our database structure. Ask me anything!'
    }
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  // Scroll to bottom of messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const generateAIResponse = async (userQuery) => {
    try {
      // Use 'gemini-1.5-flash' for stability
      const model = genAI.getGenerativeModel({ model: "gemini-2.5-pro" });

      // Context injection for the AI
      const systemPrompt = `
        You are an intelligent Institute Assistant for the CampusVersa platform.
        
        Here is the schema structure of our database to help you answer technical questions:
        ${JSON.stringify(MOCK_SCHEMAS)}

        Your capabilities:
        1. Explain database structures (Students, Faculty, Courses).
        2. Help with academic queries (e.g., "How to submit assignments", "Course help").
        3. Be polite, professional, and concise.
        4. Format your responses nicely using Markdown (bolding, lists, code blocks).
        
        User Question: ${userQuery}
      `;

      const result = await model.generateContent(systemPrompt);
      const response = await result.response;
      return response.text();
    } catch (error) {
      console.error("Gemini Error:", error);
      return "I'm having trouble connecting to the AI brain right now. Please check your internet connection or API key.";
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!question.trim()) return;

    // 1. Add User Message
    const userMsg = { role: 'user', content: question };
    setMessages(prev => [...prev, userMsg]);
    setQuestion('');
    setIsLoading(true);

    // 2. Get AI Response
    const answer = await generateAIResponse(question);

    // 3. Add Bot Message
    setMessages(prev => [...prev, { role: 'bot', content: answer }]);
    setIsLoading(false);
  };

  const clearChat = () => {
    setMessages([
      {
        role: 'bot',
        content: 'Chat cleared. How can I help you now?'
      }
    ]);
  };

  const askPredefined = (text) => {
    setQuestion(text);
  };

  return (
    <div className="flex flex-col h-full bg-gray-50 font-sans text-gray-800">
      
      {/* Header */}
      <div className="bg-[#2E5843] text-white p-4 flex items-center justify-between shadow-md shrink-0">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-white/20 rounded-full">
            <Sparkles className="w-5 h-5 text-yellow-300" />
          </div>
          <div>
            <h1 className="font-bold text-lg leading-tight">Campus AI</h1>
            <p className="text-xs text-green-100 opacity-90">Powered by Gemini Pro</p>
          </div>
        </div>
        <button 
          onClick={clearChat} 
          className="p-2 hover:bg-white/10 rounded-full transition-colors text-white/80 hover:text-white"
          title="Clear Chat"
        >
          <Trash2 className="w-5 h-5" />
        </button>
      </div>

      {/* Chat Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar bg-[#F2F5F3]">
        {messages.map((msg, index) => (
          <div 
            key={index} 
            className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            {msg.role === 'bot' && (
              <div className="w-8 h-8 rounded-full bg-[#2E5843] flex items-center justify-center shrink-0 mt-1">
                <Bot className="w-5 h-5 text-white" />
              </div>
            )}
            
            <div className={`max-w-[80%] p-3.5 rounded-2xl text-sm leading-relaxed shadow-sm ${
              msg.role === 'user' 
                ? 'bg-white text-gray-800 border border-gray-200 rounded-tr-none' 
                : 'bg-[#D4E7DD] text-[#1F2937] rounded-tl-none'
            }`}>
              {/* FIX: Wrapper div handles the classNames */}
              <div className="prose prose-sm max-w-none break-words">
                <ReactMarkdown>{msg.content}</ReactMarkdown>
              </div>
            </div>

            {msg.role === 'user' && (
              <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center shrink-0 mt-1">
                <User className="w-5 h-5 text-gray-600" />
              </div>
            )}
          </div>
        ))}
        
        {isLoading && (
          <div className="flex gap-3 justify-start">
            <div className="w-8 h-8 rounded-full bg-[#2E5843] flex items-center justify-center shrink-0">
              <Bot className="w-5 h-5 text-white" />
            </div>
            <div className="bg-[#D4E7DD] p-4 rounded-2xl rounded-tl-none flex gap-1 items-center">
              <div className="w-2 h-2 bg-[#2E5843] rounded-full animate-bounce" style={{ animationDelay: '0s' }}></div>
              <div className="w-2 h-2 bg-[#2E5843] rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
              <div className="w-2 h-2 bg-[#2E5843] rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Quick Suggestions (Horizontal Scroll) */}
      <div className="bg-white border-t border-gray-100 p-3">
        <div className="flex gap-2 overflow-x-auto no-scrollbar pb-2">
          {["Course Help", "Submit Assignment", "Faculty Info", "Student Schema"].map((suggestion) => (
            <button
              key={suggestion}
              onClick={() => askPredefined(`Tell me about ${suggestion}`)}
              className="px-3 py-1.5 bg-gray-50 border border-gray-200 rounded-full text-xs font-medium text-gray-600 hover:bg-[#2E5843] hover:text-white hover:border-[#2E5843] transition-colors whitespace-nowrap"
            >
              {suggestion}
            </button>
          ))}
        </div>

        {/* Input Area */}
        <form onSubmit={handleSubmit} className="flex gap-2 items-center mt-1">
          <input
            type="text"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder="Ask something..."
            className="flex-1 bg-gray-50 border border-gray-200 text-gray-800 text-sm rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#2E5843]/50 focus:border-[#2E5843] transition-all"
            disabled={isLoading}
          />
          <button 
            type="submit" 
            disabled={isLoading || !question.trim()}
            className="p-3 bg-[#2E5843] text-white rounded-xl hover:bg-[#234433] disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-md active:scale-95"
          >
            <Send className="w-5 h-5" />
          </button>
        </form>
      </div>
    </div>
  );
};

export default CompleteChatbot;