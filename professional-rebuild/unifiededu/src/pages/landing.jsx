import React, { useState, useEffect, useRef } from 'react';
import { FileText, Map, Code, BookOpen, Mic, Users, Trophy, ArrowRight, Check, X, ChevronsRight } from 'lucide-react';
import { Link } from 'react-router-dom';
// Particle class for canvas animation
class Particle {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.size = Math.random() * 3 + 1;
        this.speedX = Math.random() * 2 - 1;
        this.speedY = Math.random() * 2 - 1;
        this.color = `hsl(${Math.random() * 60 + 200}, 100%, 70%)`; // Shades of blue/violet
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


// New Background & Mouse FX Component
const InteractiveBackground = ({ mousePosition }) => {
    const canvasRef = useRef(null);
    const particlesRef = useRef([]);

    // The existing stars for general ambiance
    const stars = Array.from({ length: 50 }).map((_, i) => (
        <div
            key={`star-${i}`}
            className="star"
            style={{
                left: `${Math.random() * 100}%`,
                animationDuration: `${Math.random() * 5 + 5}s`,
                animationDelay: `${Math.random() * 10}s`,
            }}
        />
    ));

    // Effect for animation loop setup (runs once)
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

    // Effect for adding particles on mouse move
    useEffect(() => {
        if (mousePosition.x && mousePosition.y && particlesRef.current.length < 200) { // Cap particles
             for (let i = 0; i < 3; i++) {
                particlesRef.current.push(new Particle(mousePosition.x, mousePosition.y));
            }
        }
    }, [mousePosition]);

    // Moon Parallax
    const moonParallaxStyle = {
        transition: 'transform 0.5s ease-out',
        transform: `translateX(${(mousePosition.x - window.innerWidth / 2) * 0.1}px) translateY(${(mousePosition.y - window.innerHeight / 2) * 0.1}px)`
    };

    return (
        <div className="fixed top-0 left-0 w-full h-full pointer-events-none z-0">
            {stars}
            <div className="moon" style={moonParallaxStyle}>🌙</div>
            <canvas ref={canvasRef} className="absolute top-0 left-0" />
        </div>
    );
};

import bookImage from '../assets/book1.jpg';
// A simple component for the new logo
const Logo = () => (
  <div className="flex items-center gap-4"> {/* increased gap */}
    {/* Bigger circular logo */}
    <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-cyan-400"> 
      <img src={bookImage} alt="Logo" className="w-full h-full object-cover" />
    </div>
    {/* Bigger text */}
    <span className="text-3xl md:text-4xl font-bold text-white tracking-wider">
      CampusVersa
    </span>
  </div>
);


// A simple component for animated circular progress graphs
const CircularProgress = ({ percentage, size, strokeWidth, color }) => {
  const [progress, setProgress] = useState(0);
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (progress / 100) * circumference;

  useEffect(() => {
    const animation = requestAnimationFrame(() => setProgress(percentage));
    return () => cancelAnimationFrame(animation);
  }, [percentage]);

  return (
    <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
      <svg className="absolute" width={size} height={size}>
        <circle stroke="#374232" fill="transparent" strokeWidth={strokeWidth} r={radius} cx={size / 2} cy={size / 2} />
        <circle
          stroke={color}
          fill="transparent"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          r={radius}
          cx={size / 2}
          cy={size / 2}
          style={{ strokeDasharray: circumference, strokeDashoffset: offset, transition: 'stroke-dashoffset 1.5s ease-out', transform: 'rotate(-90deg)', transformOrigin: '50% 50%' }}
        />
      </svg>
      <div className="absolute text-center">
        <span className="text-4xl font-black" style={{ color }}>{`${percentage}%`}</span>
        <p className="text-sm text-gray-400">Success Rate</p>
      </div>
    </div>
  );
};

const CampusVersaLanding = () => {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const sectionsRef = useRef([]);

  const features = [
    { icon: FileText, title: "AI Resume Builder" }, { icon: Map, title: "Personalized Roadmaps" }, { icon: Code, title: "Targeted Problem Solving" },
    { icon: BookOpen, title: "Interactive Module Notes" }, { icon: Mic, title: "Mock Interviews" }, { icon: Users, title: "Project Collaboration" },
  ];
  
  const comparisonData = [
    { feature: "AI-Powered Resume Analysis", us: true, others: true }, { feature: "Personalized Career Roadmaps", us: true, others: false },
    { feature: "Company-Specific Problem Sets", us: true, others: true }, { feature: "Interactive Learning Modules", us: true, others: false },
    { feature: "AI & Peer Mock Interviews", us: true, others: false }, { feature: "Collaborative Project Platform", us: true, others: false },
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
    <div className="relative min-h-screen bg-linear-to-br from-[#000000] via-[#0c0c1a] to-[#1a1a2e] text-white overflow-x-hidden">
      <style>{`
        .section-fade-in { opacity: 0; transform: translateY(40px); transition: opacity 0.8s ease-out, transform 0.8s ease-out; }
        .section-fade-in.is-visible { opacity: 1; transform: translateY(0); }
        @keyframes float { 0%, 100% { transform: translateY(0px); } 50% { transform: translateY(-20px); } }
        .animate-float { animation: float 6s ease-in-out infinite; }
        .gradient-text { background: linear-gradient(135deg, #06b6d4, #3b82f6, #8b5cf6); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; }
        .glass-card { background: rgba(26, 26, 46, 0.4); backdrop-filter: blur(20px); border: 1px solid rgba(59, 130, 246, 0.2); transition: transform 0.3s ease, box-shadow 0.3s ease, border-color 0.3s ease; }
        .glass-card:hover { transform: perspective(1000px) rotateX(5deg) rotateY(-5deg) scale3d(1.05, 1.05, 1.05); box-shadow: 0 20px 40px rgba(0,0,0,0.3); border-color: rgba(59, 130, 246, 0.5); }
        .table-row-enter { opacity: 0; transform: translateX(-20px); transition: opacity 0.5s ease-out, transform 0.5s ease-out; }
        .is-visible .table-row-enter { opacity: 1; transform: translateX(0); }
        #cursor-glow { position: fixed; width: 500px; height: 500px; border-radius: 50%; background: radial-gradient(circle, rgba(59, 130, 246, 0.08) 0%, rgba(59, 130, 246, 0) 60%); pointer-events: none; transform: translate(-50%, -50%); transition: top 0.1s ease-out, left 0.1s ease-out; z-index: 9999; }

        /* Background Animations */
        @keyframes fall { 0% { transform: translateY(-100px) rotate(45deg); opacity: 1; } 100% { transform: translateY(100vh) rotate(45deg); opacity: 0; } }
        @keyframes rotate { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        .star { position: absolute; top: 0; width: 1px; height: 80px; background: linear-gradient(to bottom, rgba(255, 255, 255, 0.6), transparent); animation-name: fall; animation-timing-function: linear; animation-iteration-count: infinite; }
        .moon { position: fixed; top: 15%; right: 10%; font-size: 5rem; opacity: 0.3; animation: rotate 120s linear infinite; z-index: 0; }
      `}</style>

      <InteractiveBackground mousePosition={mousePosition} />
      <div id="cursor-glow" style={{ left: `${mousePosition.x}px`, top: `${mousePosition.y}px` }}></div>

      <header className="fixed top-0 left-0 w-full z-50 p-6 flex justify-between items-center bg-black/30 backdrop-blur-lg border-b border-blue-500/10">
        <Logo />
        <Link to="/auth">
        <button className="group px-6 py-2 bg-white/5 hover:bg-white/10 rounded-xl font-semibold transition-all duration-300 flex items-center justify-center gap-2 text-white">
            Get Started <ChevronsRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
        </button>
        </Link>
      </header>

      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-cyan-500/10 rounded-full blur-3xl animate-float" style={parallaxStyle(0.02)}/>
        <div className="absolute top-1/3 right-10 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-float" style={{ animationDelay: '2s', ...parallaxStyle(0.03) }} />
        <div className="absolute bottom-20 left-1/4 w-80 h-80 bg-violet-500/10 rounded-full blur-3xl animate-float" style={{ animationDelay: '4s', ...parallaxStyle(0.01) }} />
      </div>

      <section ref={el => sectionsRef.current[0] = el} className="section-fade-in relative min-h-screen flex items-center justify-center px-4 pt-24 text-center z-10">
        <div style={parallaxStyle(-0.02)}>
          <h1 className="text-6xl md:text-8xl font-black mb-6 leading-tight">
            Unlock Your Future with <span className="gradient-text">CampusVersa</span>
          </h1>
          <p className="text-xl md:text-2xl text-gray-400 mb-12 max-w-3xl mx-auto">
            Climb the ladder of success, one skill at a time. Transform your career journey with AI-powered tools and personalized guidance.
          </p>
          <Link to="/auth">
          <button className="group px-10 py-5 bg-linear-to-r from-cyan-500 via-blue-500 to-violet-500 rounded-2xl font-bold text-lg hover:shadow-2xl hover:shadow-blue-500/50 transition-all duration-300 hover:scale-105 flex items-center justify-center gap-3 mx-auto">
            Start Your Journey <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </button>
          </Link>
        </div>
      </section>

      <section ref={el => sectionsRef.current[1] = el} className="section-fade-in relative py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-5xl md:text-6xl font-black mb-6">A <span className="gradient-text">Unified</span> Education Platform</h2>
            <p className="text-xl text-gray-400 max-w-3xl mx-auto">All the tools you need to succeed, seamlessly integrated in one place.</p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-8 text-center">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <div key={index} className="flex flex-col items-center gap-4 group">
                  <div className="w-24 h-24 glass-card rounded-3xl flex items-center justify-center group-hover:scale-110! transition-all duration-300">
                    <Icon className="w-10 h-10 text-cyan-400" />
                  </div>
                  <p className="font-semibold text-gray-300">{feature.title}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section ref={el => sectionsRef.current[2] = el} className="section-fade-in relative py-20 px-4">
        <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-16 items-center">
          <div className="text-center lg:text-left">
            <h2 className="text-5xl md:text-6xl font-black mb-6">Data-Driven <span className="gradient-text">Success</span></h2>
            <p className="text-xl text-gray-400 mb-8 leading-relaxed">Our platform is engineered for results. We track key metrics to ensure our students are not just learning, but are also achieving their career goals at an industry-leading rate.</p>
            <div className="grid grid-cols-2 gap-8 text-center">
                <div className="glass-card p-6 rounded-2xl"><div className="text-4xl font-bold gradient-text">45%</div><div className="text-gray-400">Faster Job Placement</div></div>
                <div className="glass-card p-6 rounded-2xl"><div className="text-4xl font-bold gradient-text">80%</div><div className="text-gray-400">Higher Interview Rate</div></div>
            </div>
          </div>
          <div className="flex justify-center items-center"><CircularProgress percentage={95} size={300} strokeWidth={20} color="#06b6d4" /></div>
        </div>
      </section>
      
      <section ref={el => sectionsRef.current[3] = el} className="section-fade-in relative py-20 px-4">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16"><h2 className="text-5xl md:text-6xl font-black mb-6">The <span className="gradient-text">Clear</span> Advantage</h2><p className="text-xl text-gray-400 max-w-3xl mx-auto">See how our integrated approach provides more value than piecing together separate services.</p></div>
          <div className="glass-card rounded-3xl overflow-hidden">
            <table className="w-full text-left">
              <thead><tr className="border-b border-blue-400/20"><th className="p-6 text-lg font-bold">Feature</th><th className="p-6 text-lg font-bold text-center w-40">CampusVersa</th><th className="p-6 text-lg font-bold text-center w-40">Other Platforms</th></tr></thead>
              <tbody>
                {comparisonData.map((item, index) => (
                  <tr key={index} className="table-row-enter border-b border-blue-400/10 last:border-0 hover:bg-white/5 transition-colors duration-300" style={{transitionDelay: `${index * 100}ms`}}>
                    <td className="p-6 font-medium text-gray-300">{item.feature}</td>
                    <td className="p-6 text-center">{item.us ? <Check className="w-8 h-8 text-cyan-400 mx-auto bg-cyan-500/20 p-1 rounded-full" /> : <X className="w-6 h-6 text-gray-600 mx-auto" />}</td>
                    <td className="p-6 text-center">{item.others ? <Check className="w-8 h-8 text-cyan-400 mx-auto bg-cyan-500/20 p-1 rounded-full" /> : <X className="w-8 h-8 text-red-500 mx-auto bg-red-500/20 p-1 rounded-full" />}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>
      
      <section ref={el => sectionsRef.current[4] = el} className="section-fade-in relative py-32 px-4 text-center">
        <Trophy className="w-24 h-24 text-yellow-400 mx-auto mb-8 animate-float" />
        <h2 className="text-5xl md:text-6xl font-black mb-6">Ready to <span className="gradient-text">Reach Your Goal</span>?</h2>
        <p className="text-xl text-gray-300 mb-12 max-w-3xl mx-auto">You've seen the path. You've seen the tools. Now it's time to take the first step. Build the skills, experience, and confidence to land your dream job.</p>
        <Link to="/auth">
        <button className="group px-12 py-5 bg-linear-to-r from-cyan-500 via-blue-500 to-violet-500 rounded-2xl font-bold text-lg hover:shadow-2xl hover:shadow-blue-500/50 transition-all duration-300 hover:scale-105 flex items-center justify-center gap-3 mx-auto">
          Start Your Journey Now 🚀 <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
        </button>
        </Link>
      </section>

      <footer className="relative py-12 px-4 border-t border-blue-500/10">
        <p className="text-center text-gray-600">© 2024 CampusVersa.</p>
      </footer>
    </div>
  );
};

export default CampusVersaLanding;

