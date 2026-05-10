import React, { useState, useEffect, useRef } from 'react';
import { 
  FileText, Map, Code, BookOpen, Mic, Users, Trophy, ArrowRight, 
  ChevronsRight, X, GraduationCap, School, Briefcase, Sun, Moon, Rocket 
} from 'lucide-react';
import { Link } from 'react-router-dom';
import bookImage from '../assets/logo.png';

// --- PARTICLE CLASS (Adaptive Color) ---
class Particle {
    constructor(x, y, isDarkMode) {
        this.x = x;
        this.y = y;
        this.size = Math.random() * 3 + 1;
        this.speedX = Math.random() * 2 - 1;
        this.speedY = Math.random() * 2 - 1;
        // Darker blue for Light Mode, Lighter blue/violet for Dark Mode
        const hue = Math.random() * 60 + 200;
        this.color = isDarkMode 
            ? `hsl(${hue}, 100%, 70%)` 
            : `hsl(${hue}, 80%, 40%)`; 
    }
    update() {
        this.x += this.speedX;
        this.y += this.speedY;
        if (this.size > 0.1) this.size -= 0.03;
    }
    draw(ctx) {
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
    }
}

// --- BACKGROUND COMPONENT (Adaptive) ---
const InteractiveBackground = ({ mousePosition, isDarkMode }) => {
    const canvasRef = useRef(null);
    const particlesRef = useRef([]);

    // Stars only visible in Dark Mode
    const stars = Array.from({ length: 50 }).map((_, i) => (
        <div
            key={`star-${i}`}
            className={`star ${!isDarkMode ? 'opacity-0' : 'opacity-100'}`}
            style={{
                left: `${Math.random() * 100}%`,
                animationDuration: `${Math.random() * 5 + 5}s`,
                animationDelay: `${Math.random() * 10}s`,
                transition: 'opacity 1s ease'
            }}
        />
    ));

    useEffect(() => {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        let animationFrameId;

        const handleResize = () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        };
        window.addEventListener('resize', handleResize);
        handleResize();

        const animate = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            for (let i = 0; i < particlesRef.current.length; i++) {
                particlesRef.current[i].update();
                particlesRef.current[i].draw(ctx);
                if (particlesRef.current[i].size <= 0.1) {
                    particlesRef.current.splice(i, 1);
                    i--;
                }
            }
            animationFrameId = requestAnimationFrame(animate);
        };
        animate();

        return () => {
            window.removeEventListener('resize', handleResize);
            cancelAnimationFrame(animationFrameId);
        }
    }, []);

    useEffect(() => {
        if (mousePosition.x && mousePosition.y && particlesRef.current.length < 200) {
             for (let i = 0; i < 3; i++) {
                particlesRef.current.push(new Particle(mousePosition.x, mousePosition.y, isDarkMode));
            }
        }
    }, [mousePosition, isDarkMode]);

    const moonParallaxStyle = {
        transition: 'transform 0.5s ease-out, opacity 1s ease',
        transform: `translateX(${(mousePosition.x - window.innerWidth / 2) * 0.1}px) translateY(${(mousePosition.y - window.innerHeight / 2) * 0.1}px)`,
        opacity: isDarkMode ? 0.3 : 0 // Hide moon in light mode
    };

    return (
        <div className="fixed top-0 left-0 w-full h-full pointer-events-none z-0">
            {stars}
            <div className="moon flex items-center justify-center opacity-30" style={moonParallaxStyle}><Moon className="w-32 h-32" /></div>
            <canvas ref={canvasRef} className="absolute top-0 left-0" />
        </div>
    );
};

// --- LOGO COMPONENT ---
const Logo = ({ isDarkMode }) => (
  <div className="flex items-center gap-3">
    <div className="w-10 h-10 md:w-12 md:h-12 overflow-hidden rounded-xl shadow-sm"> 
      <img src={bookImage} alt="Logo" className="w-full h-full object-cover" />
    </div>
    <span className={`text-2xl md:text-3xl font-bold tracking-wider transition-colors duration-500 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
      CampusVersa
    </span>
  </div>
);

// --- AUTH SELECTION MODAL ---
const AuthModal = ({ isOpen, onClose, isDarkMode }) => {
    if (!isOpen) return null;

    const roles = [
        { title: "Student", path: "/student/auth", icon: GraduationCap, color: "from-cyan-400 to-blue-500" },
        { title: "Faculty", path: "/fc/auth", icon: Briefcase, color: "from-purple-400 to-pink-500" },
        { title: "Institute", path: "/in/auth", icon: School, color: "from-amber-400 to-orange-500" },
    ];

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
            <div 
                className={`relative w-full max-w-lg rounded-3xl p-8 transform transition-all animate-in fade-in zoom-in-95 duration-200 shadow-2xl ${
                    isDarkMode ? 'bg-[#1a1a2e]/90 border border-blue-500/20 text-white' : 'bg-white border border-gray-100 text-slate-900'
                }`}
            >
                <button 
                    onClick={onClose} 
                    className={`absolute top-4 right-4 p-2 rounded-full transition-colors ${
                        isDarkMode ? 'hover:bg-white/10 text-gray-400' : 'hover:bg-gray-100 text-gray-500'
                    }`}
                >
                    <X className="w-6 h-6" />
                </button>
                
                <h2 className="text-3xl font-bold text-center mb-2">Choose Account Type</h2>
                <p className={`text-center mb-8 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Select how you want to log in to CampusVersa</p>

                <div className="grid gap-4">
                    {roles.map((role) => (
                        <Link 
                            key={role.title} 
                            to={role.path}
                            className={`group relative overflow-hidden rounded-2xl p-4 border transition-all duration-300 hover:transform hover:scale-[1.02] shadow-sm hover:shadow-md ${
                                isDarkMode 
                                    ? 'bg-white/5 border-white/10 hover:border-white/30' 
                                    : 'bg-gray-50 border-gray-100 hover:border-blue-200 hover:bg-white'
                            }`}
                        >
                            <div className={`absolute inset-0 opacity-0 group-hover:opacity-10 bg-gradient-to-r ${role.color} transition-opacity duration-300`} />
                            <div className="flex items-center gap-4 relative z-10">
                                <div className={`p-3 rounded-xl bg-gradient-to-br ${role.color} bg-opacity-20 text-white shadow-sm`}>
                                    <role.icon className="w-6 h-6" />
                                </div>
                                <div className="flex-1 text-left">
                                    <h3 className={`text-xl font-bold ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>{role.title} Portal</h3>
                                    <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Access features for {role.title.toLowerCase()}s</p>
                                </div>
                                <ArrowRight className={`w-5 h-5 transition-all ${isDarkMode ? 'text-gray-500 group-hover:text-white' : 'text-gray-400 group-hover:text-blue-600'} group-hover:translate-x-1`} />
                            </div>
                        </Link>
                    ))}
                </div>
            </div>
        </div>
    );
};

// --- MAIN LANDING COMPONENT ---
const CampusVersaLanding = () => {
  // Defaulting to FALSE (Light Mode) as requested
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const sectionsRef = useRef([]);

  const features = [
    { icon: FileText, title: "AI Resume Builder" }, 
    { icon: Map, title: "Personalized Roadmaps" }, 
    { icon: Code, title: "Targeted Problem Solving" },
    { icon: BookOpen, title: "Interactive Module Notes" }, 
    { icon: Mic, title: "Mock Interviews" }, 
    { icon: Users, title: "Project Collaboration" },
  ];
  
  useEffect(() => {
    const handleScroll = () => {
      sectionsRef.current.forEach(section => {
        if (section) {
          const rect = section.getBoundingClientRect();
          if (rect.top < window.innerHeight * 0.75) section.classList.add('is-visible');
        }
      });
    };
    
    const handleMouseMove = (e) => setMousePosition({ x: e.clientX, y: e.clientY });

    window.addEventListener('scroll', handleScroll);
    window.addEventListener('mousemove', handleMouseMove);
    handleScroll();
    
    return () => {
        window.removeEventListener('scroll', handleScroll);
        window.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);

  const parallaxStyle = (factor) => ({
    transform: `translateX(${ (mousePosition.x - window.innerWidth / 2) * factor}px) translateY(${ (mousePosition.y - window.innerHeight / 2) * factor}px)`
  });

  return (
    <div className={`relative min-h-screen transition-colors duration-700 overflow-x-hidden ${
        isDarkMode 
            ? 'bg-gradient-to-br from-[#000000] via-[#0c0c1a] to-[#1a1a2e] text-white' 
            : 'bg-gradient-to-br from-blue-50 via-white to-indigo-50 text-slate-900'
    }`}>
      <style>{`
        .section-fade-in { opacity: 0; transform: translateY(40px); transition: opacity 0.8s ease-out, transform 0.8s ease-out; }
        .section-fade-in.is-visible { opacity: 1; transform: translateY(0); }
        @keyframes float { 0%, 100% { transform: translateY(0px); } 50% { transform: translateY(-20px); } }
        .animate-float { animation: float 6s ease-in-out infinite; }
        
        .gradient-text { 
            background: linear-gradient(135deg, #06b6d4, #3b82f6, #8b5cf6); 
            -webkit-background-clip: text; 
            -webkit-text-fill-color: transparent; 
            background-clip: text; 
        }

        /* Adaptive Glass Card */
        .glass-card { 
            background: ${isDarkMode ? 'rgba(26, 26, 46, 0.4)' : 'rgba(255, 255, 255, 0.7)'}; 
            backdrop-filter: blur(20px); 
            border: 1px solid ${isDarkMode ? 'rgba(59, 130, 246, 0.2)' : 'rgba(255, 255, 255, 0.8)'}; 
            box-shadow: ${isDarkMode ? 'none' : '0 10px 30px -10px rgba(0,0,0,0.1)'};
            transition: transform 0.3s ease, box-shadow 0.3s ease, border-color 0.3s ease; 
        }
        .glass-card:hover { 
            transform: perspective(1000px) rotateX(2deg) rotateY(-2deg) scale3d(1.02, 1.02, 1.02); 
            box-shadow: ${isDarkMode ? '0 20px 40px rgba(0,0,0,0.3)' : '0 20px 40px rgba(59, 130, 246, 0.15)'}; 
            border-color: rgba(59, 130, 246, 0.5); 
        }

        #cursor-glow { 
            position: fixed; width: 500px; height: 500px; border-radius: 50%; 
            background: radial-gradient(circle, ${isDarkMode ? 'rgba(59, 130, 246, 0.08)' : 'rgba(59, 130, 246, 0.05)'} 0%, rgba(59, 130, 246, 0) 60%); 
            pointer-events: none; transform: translate(-50%, -50%); transition: top 0.1s ease-out, left 0.1s ease-out; z-index: 9999; 
        }

        @keyframes fall { 0% { transform: translateY(-100px) rotate(45deg); opacity: 1; } 100% { transform: translateY(100vh) rotate(45deg); opacity: 0; } }
        @keyframes rotate { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        .star { position: absolute; top: 0; width: 1px; height: 80px; background: linear-gradient(to bottom, rgba(255, 255, 255, 0.6), transparent); animation-name: fall; animation-timing-function: linear; animation-iteration-count: infinite; }
        .moon { position: fixed; top: 15%; right: 10%; font-size: 5rem; opacity: 0.3; animation: rotate 120s linear infinite; z-index: 0; }
      `}</style>

      <InteractiveBackground mousePosition={mousePosition} isDarkMode={isDarkMode} />
      <div id="cursor-glow" style={{ left: `${mousePosition.x}px`, top: `${mousePosition.y}px` }}></div>
      
      {/* Auth Modal */}
      <AuthModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} isDarkMode={isDarkMode} />

      <header 
        className={`fixed top-0 left-0 w-full z-50 p-4 md:p-6 flex justify-between items-center backdrop-blur-lg border-b transition-colors duration-500 ${
            isDarkMode ? 'bg-black/30 border-blue-500/10' : 'bg-white/70 border-gray-200'
        }`}
      >
        <Logo isDarkMode={isDarkMode} />
        
        <div className="flex items-center gap-4">
            {/* Theme Toggle Button */}
            <button 
                onClick={() => setIsDarkMode(!isDarkMode)}
                className={`p-2.5 rounded-full transition-all duration-300 shadow-sm hover:scale-110 ${
                    isDarkMode ? 'bg-white/10 text-yellow-300 hover:bg-white/20' : 'bg-slate-100 text-orange-500 hover:bg-slate-200'
                }`}
                aria-label="Toggle Theme"
            >
                {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>

            <button 
                onClick={() => setIsAuthModalOpen(true)}
                className={`hidden md:flex group px-6 py-2 rounded-xl font-semibold transition-all duration-300 items-center justify-center gap-2 cursor-pointer ${
                    isDarkMode ? 'bg-white/5 hover:bg-white/10 text-white' : 'bg-slate-900 text-white hover:bg-slate-800 shadow-lg shadow-slate-900/20'
                }`}
            >
                Get Started <ChevronsRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>
        </div>
      </header>

      {/* Floating Blobs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className={`absolute top-20 left-10 w-72 h-72 rounded-full blur-3xl animate-float transition-colors duration-700 ${isDarkMode ? 'bg-cyan-500/10' : 'bg-cyan-400/20'}`} style={parallaxStyle(0.02)}/>
        <div className={`absolute top-1/3 right-10 w-96 h-96 rounded-full blur-3xl animate-float transition-colors duration-700 ${isDarkMode ? 'bg-blue-500/10' : 'bg-blue-400/20'}`} style={{ animationDelay: '2s', ...parallaxStyle(0.03) }} />
        <div className={`absolute bottom-20 left-1/4 w-80 h-80 rounded-full blur-3xl animate-float transition-colors duration-700 ${isDarkMode ? 'bg-violet-500/10' : 'bg-violet-400/20'}`} style={{ animationDelay: '4s', ...parallaxStyle(0.01) }} />
      </div>

      {/* Hero Section */}
      <section ref={el => sectionsRef.current[0] = el} className="section-fade-in relative min-h-screen flex items-center justify-center px-4 pt-24 text-center z-10">
        <div style={parallaxStyle(-0.02)}>
          <h1 className={`text-5xl md:text-7xl lg:text-8xl font-black mb-6 leading-tight transition-colors duration-500 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
            Unlock Your Future with <span className="gradient-text">CampusVersa</span>
          </h1>
          <p className={`text-xl md:text-2xl mb-12 max-w-3xl mx-auto transition-colors duration-500 ${isDarkMode ? 'text-gray-400' : 'text-slate-600'}`}>
            Climb the ladder of success, one skill at a time. Transform your career journey with AI-powered tools and personalized guidance.
          </p>
          <button 
            onClick={() => setIsAuthModalOpen(true)}
            className="group px-10 py-5 bg-gradient-to-r from-cyan-500 via-blue-500 to-violet-500 rounded-2xl font-bold text-lg text-white hover:shadow-2xl hover:shadow-blue-500/50 transition-all duration-300 hover:scale-105 flex items-center justify-center gap-3 mx-auto cursor-pointer"
          >
            Start Your Journey <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
      </section>

      {/* Features Grid */}
      <section ref={el => sectionsRef.current[1] = el} className="section-fade-in relative py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className={`text-4xl md:text-6xl font-black mb-6 transition-colors duration-500 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>A <span className="gradient-text">Unified</span> Education Platform</h2>
            <p className={`text-xl max-w-3xl mx-auto transition-colors duration-500 ${isDarkMode ? 'text-gray-400' : 'text-slate-600'}`}>All the tools you need to succeed, seamlessly integrated in one place.</p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-8 text-center">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <div key={index} className="flex flex-col items-center gap-4 group">
                  <div className={`w-24 h-24 glass-card rounded-3xl flex items-center justify-center group-hover:scale-110! transition-all duration-300`}>
                    <Icon className="w-10 h-10 text-cyan-500" />
                  </div>
                  <p className={`font-semibold transition-colors duration-500 ${isDarkMode ? 'text-gray-300' : 'text-slate-700'}`}>{feature.title}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>
      
      {/* CTA Section */}
      <section ref={el => sectionsRef.current[2] = el} className="section-fade-in relative py-32 px-4 text-center">
        <Trophy className="w-24 h-24 text-yellow-400 mx-auto mb-8 animate-float" />
        <h2 className={`text-4xl md:text-6xl font-black mb-6 transition-colors duration-500 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>Ready to <span className="gradient-text">Reach Your Goal</span>?</h2>
        <p className={`text-xl mb-12 max-w-3xl mx-auto transition-colors duration-500 ${isDarkMode ? 'text-gray-300' : 'text-slate-600'}`}>You've seen the path. You've seen the tools. Now it's time to take the first step. Build the skills, experience, and confidence to land your dream job.</p>
        <button 
          onClick={() => setIsAuthModalOpen(true)}
          className="group px-12 py-5 bg-gradient-to-r from-cyan-500 via-blue-500 to-violet-500 rounded-2xl font-bold text-lg text-white hover:shadow-2xl hover:shadow-blue-500/50 transition-all duration-300 hover:scale-105 flex items-center justify-center gap-3 mx-auto cursor-pointer"
        >
          Start Your Journey Now <Rocket className="w-6 h-6 inline-block ml-2 animate-bounce" /> <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
        </button>
      </section>

      <footer className={`relative py-12 px-4 border-t transition-colors duration-500 ${isDarkMode ? 'border-blue-500/10' : 'border-gray-200 bg-white/50'}`}>
        <p className={`text-center ${isDarkMode ? 'text-gray-600' : 'text-slate-400'}`}>© 2025 CampusVersa.</p>
      </footer>
    </div>
  );
};

export default CampusVersaLanding;
