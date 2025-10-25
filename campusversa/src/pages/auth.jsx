import React, { useState, useEffect } from 'react';
import { User, Mail, Lock, Award, Phone, Building, ChevronsRight } from 'lucide-react'; 
// We will import useNavigate (the modern equivalent of programmatic Link) here.
import { useNavigate } from 'react-router-dom';

// A custom hook for a natural blinking effect
const useBlink = (isTyping) => {
    const [isBlinking, setIsBlinking] = useState(false);
    useEffect(() => {
        let blinkTimeout;
        if (isTyping) {
            const blink = () => {
                setIsBlinking(true);
                setTimeout(() => {
                    setIsBlinking(false);
                    // Schedule the next blink at a random interval
                    blinkTimeout = setTimeout(blink, Math.random() * 5000 + 2000);
                }, 150);
            };
            blinkTimeout = setTimeout(blink, Math.random() * 3000 + 1000);
        }
        return () => clearTimeout(blinkTimeout);
    }, [isTyping]);
    return isBlinking;
};


// --- MAIN CHARACTER COMPONENTS ---

const CuriousExplorer = ({ focusedField, mousePosition, index, interactionPhase }) => {
    const isPasswordFocused = focusedField === 'password' || focusedField === 'confirmPassword';
    const isBlinking = useBlink(!isPasswordFocused);

    const getTransform = () => {
        if (isPasswordFocused) return { eye: 'translateX(-10px)', head: 'rotate(-8deg)' };
        
        if (interactionPhase === 'glancing') {
            const talkTransforms = {
                0: { eye: 'translateX(10px)', head: 'rotate(8deg)' },   // Look right
                1: { eye: 'translateX(10px)', head: 'rotate(8deg)' },   // Look right
                2: { eye: 'translateX(0px)', head: 'rotate(0deg)' },   // Look forward
                3: { eye: 'translateX(-10px)', head: 'rotate(-8deg)' },  // Look left
                4: { eye: 'translateX(-10px)', head: 'rotate(-8deg)' },  // Look left
            };
            return talkTransforms[index] || { eye: 'translateX(0px)', head: 'rotate(0deg)'};
        }

        if (interactionPhase === 'watchingInput') {
            return { eye: 'translateX(15px)', head: 'rotate(10deg)' }; // All look right towards the form
        }

        // Watch mouse during 'idle' phase
        const lookX = ((mousePosition.x / window.innerWidth) - 0.5) * 25;
        const headTiltAngle = ((mousePosition.x / window.innerWidth) - 0.5) * 15;
        return { eye: `translateX(${lookX}px)`, head: `rotate(${headTiltAngle}deg)`};
    };

    const transforms = getTransform();

    const eyePosition = { transition: 'transform 0.25s ease', transform: transforms.eye };
    const headTilt = { transition: 'transform 0.25s ease', transform: transforms.head, transformOrigin: '50% 100%' };
    const mouthPath = isPasswordFocused ? "M95 130 L 105 130" : "M95 125 Q 100 135, 105 125";
    const eyeLidTransform = isBlinking ? 'scaleY(0.1)' : 'scaleY(1)';

    return (
        <g transform="translate(0, 10)">
            <ellipse cx="100" cy="185" rx="55" ry="8" fill="#000" opacity="0.15" />
            <path d="M 60 185 C 40 100, 160 100, 140 185 Z" fill="#FBBF24" stroke="#92400E" strokeWidth="4" />
            <g style={headTilt}>
                <path d="M 70 140 C 50 80, 150 80, 130 140 Z" fill="#FCD34D" stroke="#92400E" strokeWidth="4" />
                <g style={eyePosition}>
                    <circle cx="85" cy="110" r="18" fill="white" stroke="#92400E" strokeWidth="2.5" />
                    <circle cx="115" cy="110" r="18" fill="white" stroke="#92400E" strokeWidth="2.5" />
                    <g style={{ transform: eyeLidTransform, transformOrigin: 'center', transition: 'transform 0.1s ease-in-out' }}>
                        <circle cx="88" cy="112" r="8" fill="#92400E" />
                        <circle cx="118" cy="112" r="8" fill="#92400E" />
                    </g>
                    {isPasswordFocused && (
                        <>
                           <path d="M 70 95 L 95 98" stroke="#92400E" strokeWidth="4" strokeLinecap="round" />
                           <path d="M 130 95 L 105 98" stroke="#92400E" strokeWidth="4" strokeLinecap="round" />
                        </>
                    )}
                </g>
                <path d={mouthPath} stroke="#92400E" strokeWidth="3" fill="none" strokeLinecap="round"/>
            </g>
             <path d="M50 50 L 55 30 L 60 50 Z" fill="#FCD34D" stroke="#92400E" strokeWidth="3" transform="translate(45, 20) rotate(15)" />
        </g>
    );
};

const ShySprout = ({ focusedField, mousePosition, index, interactionPhase }) => {
    const isPasswordFocused = focusedField === 'password' || focusedField === 'confirmPassword';
    const isBlinking = useBlink(!isPasswordFocused);

    const getEyeTransform = () => {
        if (isPasswordFocused) return 'translateX(-12px)';
        if (interactionPhase === 'glancing') {
            const talkTransforms = {
                0: 'translateX(12px)', 1: 'translateX(12px)', 2: 'translateX(0px)',
                3: 'translateX(-12px)', 4: 'translateX(-12px)',
            };
            return talkTransforms[index] || 'translateX(0px)';
        }
        if (interactionPhase === 'watchingInput') {
            return 'translateX(15px)';
        }
        const lookX = ((mousePosition.x / window.innerWidth) - 0.5) * 25;
        return `translateX(${lookX}px)`;
    };

    const eyePosition = { transition: 'transform 0.25s ease', transform: getEyeTransform() };
    const leafWiggle = { transition: 'transform 0.3s ease-in-out', transform: !!focusedField ? 'rotate(15deg)' : 'rotate(0deg)', transformOrigin: 'bottom center' };
    const mouthPath = isPasswordFocused ? "M 100 155 C 105 150, 110 150, 115 155" : "M 100 150 C 105 155, 110 155, 115 150";
    const eyeLidTransform = isBlinking ? 'scaleY(0.1)' : 'scaleY(1)';

    return (
        <g>
            <ellipse cx="100" cy="180" rx="60" ry="10" fill="#000" opacity="0.1" />
            <path d="M 50 180 C 50 100, 150 100, 150 180 Z" fill="#A7F3D0" stroke="#047857" strokeWidth="4" />
            <g style={leafWiggle}>
                <path d="M 90 60 C 70 40, 110 20, 110 60 C 120 30, 130 50, 110 60 Z" fill="#34D399" stroke="#047857" strokeWidth="4" />
            </g>
            <g style={eyePosition}>
                 <g style={{ transform: eyeLidTransform, transformOrigin: 'center', transition: 'transform 0.1s ease-in-out' }}>
                    <circle cx="90" cy="130" r="10" fill="#047857" />
                    <circle cx="120" cy="130" r="10" fill="#047857" />
                 </g>
            </g>
            {isPasswordFocused && <path d="M 80 120 L 100 125 M 130 120 L 110 125" stroke="#047857" strokeWidth="3" fill="none" strokeLinecap="round"/>}
            <path d={mouthPath} stroke="#047857" strokeWidth="3" fill="none" strokeLinecap="round" />
        </g>
    );
};

const CosmicCreature = ({ focusedField, mousePosition, index, interactionPhase }) => {
    const isPasswordFocused = focusedField === 'password' || focusedField === 'confirmPassword';
    const isBlinking = useBlink(!isPasswordFocused);

    const getEyeTransform = () => {
        if (isPasswordFocused) return 'translateX(-10px)';
        if (interactionPhase === 'glancing') {
            const talkTransforms = {
                0: 'translateX(10px)', 1: 'translateX(10px)', 2: 'translateX(0px)',
                3: 'translateX(-10px)', 4: 'translateX(-10px)',
            };
            return talkTransforms[index] || 'translateX(0px)';
        }
        if (interactionPhase === 'watchingInput') {
            return 'translateX(15px)';
        }
        const lookX = ((mousePosition.x / window.innerWidth) - 0.5) * 20;
        return `translateX(${lookX}px)`;
    };
    
    const eyePosition = { transition: 'transform 0.25s ease', transform: getEyeTransform() };
    const bodyWobble = { transition: 'transform 0.3s ease', transform: !!focusedField ? 'scale(1.02, 0.98)' : 'scale(1)', transformOrigin: 'bottom center' };
    const browStyle = { transition: 'opacity 0.3s ease', opacity: isPasswordFocused ? 1 : 0 };
    const eyeLidTransform = isBlinking ? 'scaleY(0.1)' : 'scaleY(1)';
    
    return (
        <g style={bodyWobble}>
            <ellipse cx="100" cy="180" rx="70" ry="10" fill="#000" opacity="0.2" />
            <path d="M 50 180 C 20 100, 180 100, 150 180 Z" fill="#4C1D95" stroke="#2E1065" strokeWidth="4" />
            <circle cx="70" cy="150" r="4" fill="#FDE047" />
            <circle cx="130" cy="140" r="6" fill="#FDE047" />
            <circle cx="100" cy="110" r="3" fill="#FDE047" />
            
            <g style={eyePosition}>
                <circle cx="80" cy="125" r="22" fill="#F5F3FF" stroke="#2E1065" strokeWidth="2"/>
                <circle cx="120" cy="125" r="22" fill="#F5F3FF" stroke="#2E1065" strokeWidth="2"/>
                <g style={{ transform: eyeLidTransform, transformOrigin: 'center', transition: 'transform 0.1s ease-in-out' }}>
                    <circle cx="80" cy="125" r="12" fill="#2E1065" />
                    <circle cx="120" cy="125" r="12" fill="#2E1065" />
                </g>
            </g>
            <g style={browStyle}>
                <line x1="65" y1="105" x2="95" y2="100" stroke="#F5F3FF" strokeWidth="4" strokeLinecap="round"/>
                <line x1="105" y1="100" x2="135" y2="105" stroke="#F5F3FF" strokeWidth="4" strokeLinecap="round"/>
            </g>
        </g>
    );
};

const WobblyPudding = ({ focusedField, mousePosition, index, interactionPhase }) => {
    const isPasswordFocused = focusedField === 'password' || focusedField === 'confirmPassword';
    const isBlinking = useBlink(!isPasswordFocused);

    const getTransforms = () => {
        if (isPasswordFocused) return { body: 'translateX(0) rotate(0deg)', eye: 'translateX(-10px)' };
        if (interactionPhase === 'glancing') {
            const talkTransforms = {
                0: { body: 'translateX(5px) rotate(3deg)', eye: 'translateX(10px)' },
                1: { body: 'translateX(5px) rotate(3deg)', eye: 'translateX(10px)' },
                2: { body: 'translateX(0) rotate(0deg)', eye: 'translateX(0px)' },
                3: { body: 'translateX(-5px) rotate(-3deg)', eye: 'translateX(-10px)' },
                4: { body: 'translateX(-5px) rotate(-3deg)', eye: 'translateX(-10px)' },
            };
            return talkTransforms[index] || { body: 'translateX(0) rotate(0deg)', eye: 'translateX(0px)' };
        }
        if (interactionPhase === 'watchingInput') {
            return { body: 'translateX(5px) rotate(3deg)', eye: 'translateX(15px)' };
        }
        const lookX = ((mousePosition.x / window.innerWidth) - 0.5) * 20;
        const bodyWobbleAngle = ((mousePosition.x / window.innerWidth) - 0.5) * 8;
        return { body: `translateX(0) rotate(${bodyWobbleAngle}deg)`, eye: `translateX(${lookX}px)` };
    };

    const transforms = getTransforms();

    const bodyWobble = { transition: 'transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)', transform: transforms.body, transformOrigin: 'bottom center' };
    const eyePosition = { transition: 'transform 0.25s ease', transform: transforms.eye };
    const mouthPath = isPasswordFocused ? "M 95 155 Q 100 145, 105 155" : "M 95 150 Q 100 155, 105 150";
    const eyeLidTransform = isBlinking ? 'scaleY(0.1)' : 'scaleY(1)';

    return (
        <g style={bodyWobble}>
             <ellipse cx="100" cy="180" rx="70" ry="10" fill="#000" opacity="0.1" />
            <path d="M 50 180 C 50 100, 150 100, 150 180 Z" fill="#F9A8D4" stroke="#9D174D" strokeWidth="4"/>
            <g style={eyePosition}>
                <g style={{ transform: eyeLidTransform, transformOrigin: 'center', transition: 'transform 0.1s ease-in-out' }}>
                    <circle cx="80" cy="125" r="10" fill="#9D174D" />
                    <circle cx="120" cy="125" r="10" fill="#9D174D" />
                </g>
                {isPasswordFocused && <path d="M 70 110 L 90 115 M 130 110 L 110 115" stroke="#9D174D" strokeWidth="3" fill="none" strokeLinecap="round"/>}
            </g>
            <path d={mouthPath} stroke="#9D174D" strokeWidth="4" fill="none" strokeLinecap="round" />
        </g>
    );
};

const SparkleBot = ({ focusedField, mousePosition, index, interactionPhase }) => {
    const isPasswordFocused = focusedField === 'password' || focusedField === 'confirmPassword';
    const isBlinking = useBlink(!isPasswordFocused);

    const getTransforms = () => {
        if (isPasswordFocused) return { eye: 'translateX(-10px)', head: 'rotate(0deg)' };
        if (interactionPhase === 'glancing') {
            const talkTransforms = {
                0: { eye: 'translateX(10px)', head: 'rotate(10deg)' },
                1: { eye: 'translateX(10px)', head: 'rotate(10deg)' },
                2: { eye: 'translateX(0px)', head: 'rotate(0deg)' },
                3: { eye: 'translateX(-10px)', head: 'rotate(-10deg)' },
                4: { eye: 'translateX(-10px)', head: 'rotate(-10deg)' },
            };
            return talkTransforms[index] || { eye: 'translateX(0px)', head: 'rotate(0deg)' };
        }
        if (interactionPhase === 'watchingInput') {
            return { eye: 'translateX(15px)', head: 'rotate(10deg)' };
        }
        const lookX = ((mousePosition.x / window.innerWidth) - 0.5) * 20;
        const headTiltAngle = ((mousePosition.x / window.innerWidth) - 0.5) * 15;
        return { eye: `translateX(${lookX}px)`, head: `rotate(${headTiltAngle}deg)` };
    };

    const transforms = getTransforms();

    const eyePosition = { transition: 'transform 0.25s ease', transform: transforms.eye };
    const headTilt = { transition: 'transform 0.25s ease', transform: transforms.head, transformOrigin: '50% 90%' };
    const eyeLidTransform = isBlinking ? 'scaleY(0.1)' : 'scaleY(1)';

    return (
        <g>
            <ellipse cx="100" cy="180" rx="65" ry="10" fill="#000" opacity="0.15" />
            <path d="M 60 180 A 40 80 0 0 1 140 180 Z" fill="#E0E7FF" stroke="#4338CA" strokeWidth="4" />
            <g style={headTilt}>
                <rect x="70" y="70" width="60" height="60" rx="15" fill="#C7D2FE" stroke="#4338CA" strokeWidth="4" />
                <g style={eyePosition}>
                    <g style={{ transform: eyeLidTransform, transformOrigin: 'center', transition: 'transform 0.1s ease-in-out' }}>
                        <rect x="80" y="95" width="10" height="20" rx="3" fill="#4338CA" />
                        <rect x="110" y="95" width="10" height="20" rx="3" fill="#4338CA" />
                    </g>
                    {isPasswordFocused && (
                        <>
                           <path d="M 75 90 L 95 85" stroke="#4338CA" strokeWidth="4" fill="none" strokeLinecap="round" />
                           <path d="M 125 90 L 105 85" stroke="#4338CA" strokeWidth="4" fill="none" strokeLinecap="round" />
                        </>
                    )}
                </g>
            </g>
        </g>
    );
};

const characters = [CuriousExplorer, ShySprout, CosmicCreature, WobblyPudding, SparkleBot];

const InputField = ({ id, type, placeholder, icon, value, onChange, onFocus, onBlur }) => (
    <div className="relative mb-4">
        <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none">
            {React.cloneElement(icon, { className: 'text-gray-400' })}
        </div>
        <input
            id={id} name={id} type={type} placeholder={placeholder} value={value}
            onChange={onChange} onFocus={() => onFocus(id)} onBlur={onBlur}
            className="w-full pl-12 pr-4 py-3 text-white bg-slate-800/50 rounded-lg border border-blue-500/20 focus:outline-none focus:ring-2 focus:ring-cyan-500 transition placeholder:text-gray-400"
            required
        />
    </div>
);

export default function App() {
    const [authMode, setAuthMode] = useState('signup');
    const [userType, setUserType] = useState('student');
    const [focusedField, setFocusedField] = useState(null);
    const [interactionPhase, setInteractionPhase] = useState('idle');
    const [characterLineup, setCharacterLineup] = useState([]);
    const [guidanceMessage, setGuidanceMessage] = useState('');
    const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
    
    // Initialize useNavigate hook
    const navigate = useNavigate();

    useEffect(() => {
        const shuffled = [...characters].sort(() => 0.5 - Math.random());
        setCharacterLineup(shuffled.slice(0, 5)); 
    }, []);
    
    useEffect(() => {
        const handleMouseMove = (e) => {
            setMousePosition({ x: e.clientX, y: e.clientY });
        };
        window.addEventListener('mousemove', handleMouseMove);
        return () => window.removeEventListener('mousemove', handleMouseMove);
    }, []);

    useEffect(() => {
        if (focusedField) {
            setInteractionPhase('glancing');
            const timer = setTimeout(() => {
                setInteractionPhase('watchingInput');
            }, 800); // Glance at each other for 0.8s

            return () => clearTimeout(timer);
        } else {
            setInteractionPhase('idle');
        }
    }, [focusedField]);

    useEffect(() => {
        const baseMessage = authMode === 'login' ? "Welcome back! Let's get you signed in." : "New here? Let's get you set up!";
        if (!focusedField) {
            setGuidanceMessage(baseMessage);
            return;
        }

        let newMessage = '';
        if (authMode === 'login') {
            if (focusedField === 'email') newMessage = "Great! What's your email?";
            else if (focusedField === 'password') newMessage = "Keep it secret, keep it safe!";
            else newMessage = baseMessage;
        } else { // signup
            const studentMessages = {
                name: "Nice to meet you! What's your name?", usn: "Got it. Please enter your USN.",
                email: "We'll need your email too.",
                mobile: "Awesome! Can I get your mobile number?", password: "Time to set a password! I'll close my eyes.",
            };
            const instituteMessages = {
                name: "What's your institute name?", aisheCode: "What's the AISHE code?",
                email: "We'll need your institute's email.", phone: "And a phone number for contact.",
                password: "Great! Time to set a strong password.",
            };
            newMessage = (userType === 'student' ? studentMessages[focusedField] : instituteMessages[focusedField]) || "Just a few details to get started.";
        }
        setGuidanceMessage(newMessage);
    }, [focusedField, authMode, userType]);

    const [formData, setFormData] = useState({
        name: '', aisheCode: '', email: '', phone: '', usn: '', mobile: '', password: '', confirmPassword: '',
    });

    const handleInputChange = (e) => setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
    const handleFocus = (id) => setFocusedField(id);
    const handleBlur = () => setFocusedField(null);
    

    // --- REDIRECTION LOGIC IMPLEMENTATION (Direct useNavigate call) ---
    const handleSubmit = (e) => {
        e.preventDefault();
        
        let targetPath = '';

        // Logic to determine the correct dashboard path
        // Students go to /dashboard (as requested)
        if (userType === 'institute') {
            targetPath = '/institute/dashboard';
        } else { // 'student' is the default
            targetPath = '/dashboard';
        }

        // 1. Simulate Auth success logic here (e.g., API call succeeds)
        console.log(`Auth successful. Attempting to navigate to: ${targetPath}`);
        
        // 2. Perform the actual programmatic navigation using useNavigate
        navigate(targetPath);
    };
    // ----------------------------------------

    const icons = {
        user: <User size={20} />, mail: <Mail size={20} />, lock: <Lock size={20} />,
        idCard: <Award size={20} />, phone: <Phone size={20} />, building: <Building size={20} />,
    };

    const commonProps = { onChange: handleInputChange, onFocus: handleFocus, onBlur: handleBlur };
    
    // RENDER AUTH FORM
    return (
        <div className="min-h-screen bg-gradient-to-br from-[#000000] via-[#0c0c1a] to-[#1a1a2e] flex items-center justify-center p-4 font-sans text-white">
            <div className="w-full max-w-5xl grid grid-cols-1 md:grid-cols-2 bg-slate-900/20 backdrop-blur-lg border border-cyan-400/40 rounded-2xl overflow-hidden">
                <div className="hidden md:flex flex-col items-center justify-center p-8 text-center relative">
                    <div className="absolute top-8 text-center">
                        <h1 className="text-3xl font-bold mb-2">Welcome to CampusVersa!</h1>
                        <p className="opacity-80 max-w-sm mx-auto">Our friends are here to help you get started on your journey.</p>
                    </div>
                    <div className="absolute top-1/3 left-1/2 -translate-x-1/2 z-30 transition-all duration-300 w-52" style={{ opacity: guidanceMessage ? 1 : 0, transform: `translate(-50%, ${guidanceMessage ? '0' : '10px'})` }}>
                        <div className="bg-slate-800 rounded-lg py-2 px-4 shadow-xl relative border border-blue-500/30">
                            <p className="font-semibold text-sm">{guidanceMessage}</p>
                            <div className="absolute left-1/2 -bottom-2 w-4 h-4 bg-slate-800 transform -translate-x-1/2 rotate-45"></div>
                        </div>
                    </div>
                    <div className="flex items-end justify-center w-full -space-x-24 mt-28">
                        {characterLineup.map((CharacterComponent, index) => {
                            let sizeClass = "w-40 h-40";
                            let style = {};
                            if (index === 2) { // Center character
                                sizeClass = "w-52 h-52";
                                style = { transform: 'translateY(-2rem) scale(1.1)', zIndex: 20 };
                            } else if (index === 1 || index === 3) {
                                sizeClass = "w-44 h-44";
                                style = { zIndex: 10 };
                            }
                            return (
                                <div key={index} className={`relative ${sizeClass}`} style={style}>
                                    <svg viewBox="0 0 200 200" className="w-full h-full">
                                        <CharacterComponent 
                                            focusedField={focusedField} 
                                            mousePosition={mousePosition} 
                                            index={index}
                                            interactionPhase={interactionPhase} 
                                        />
                                    </svg>
                                </div>
                            );
                        })}
                    </div>
                </div>
                <div className="p-8 md:p-12">
                    <div className="mb-6">
                        <div className="flex bg-slate-800/50 rounded-lg p-1 border border-blue-500/20">
                            <button onClick={() => setAuthMode('signup')} className={`w-1/2 py-2 rounded-md font-semibold transition-all ${authMode === 'signup' ? 'bg-blue-600 text-white shadow-md' : 'text-gray-300'}`}>Sign Up</button>
                            <button onClick={() => setAuthMode('login')} className={`w-1/2 py-2 rounded-md font-semibold transition-all ${authMode === 'login' ? 'bg-blue-600 text-white shadow-md' : 'text-gray-300'}`}>Login</button>
                        </div>
                    </div>
                    {authMode === 'signup' && (
                        <div className="mb-6"><div className="flex border-b border-blue-500/20">
                            <button onClick={() => setUserType('student')} className={`flex-1 pb-2 text-center font-medium transition-colors ${userType === 'student' ? 'text-cyan-400 border-b-2 border-cyan-400' : 'text-gray-400'}`}>I'm a Student</button>
                            <button onClick={() => setUserType('institute')} className={`flex-1 pb-2 text-center font-medium transition-colors ${userType === 'institute' ? 'text-cyan-400 border-b-2 border-cyan-400' : 'text-gray-400'}`}>I'm an Institute</button>
                        </div></div>
                    )}
                    <form onSubmit={handleSubmit}>
                        {authMode === 'login' ? ( <>
                            <h2 className="text-3xl font-bold mb-6 text-center">Login to Your Account</h2>
                            <InputField id="email" type="email" placeholder="Email Address" icon={icons.mail} value={formData.email} {...commonProps} />
                            <InputField id="password" type="password" placeholder="Password" icon={icons.lock} value={formData.password} {...commonProps} />
                        </> ) : userType === 'student' ? ( <>
                            <h2 className="text-3xl font-bold mb-6 text-center">Create Student Account</h2>
                            <InputField id="name" type="text" placeholder="Full Name" icon={icons.user} value={formData.name} {...commonProps} />
                            <InputField id="usn" type="text" placeholder="USN" icon={icons.idCard} value={formData.usn} {...commonProps} />
                            <InputField id="email" type="email" placeholder="Email Address" icon={icons.mail} value={formData.email} {...commonProps} />
                            <InputField id="mobile" type="tel" placeholder="Mobile Number" icon={icons.phone} value={formData.mobile} {...commonProps} />
                            <InputField id="password" type="password" placeholder="Create Password" icon={icons.lock} value={formData.password} {...commonProps} />
                        </> ) : ( <>
                            <h2 className="text-3xl font-bold mb-6 text-center">Create Institute Account</h2>
                            <InputField id="name" type="text" placeholder="Institute Name" icon={icons.building} value={formData.name} {...commonProps} />
                            <InputField id="aisheCode" type="text" placeholder="AISHE Code" icon={icons.idCard} value={formData.aisheCode} {...commonProps} />
                            <InputField id="email" type="email" placeholder="Institute Email" icon={icons.mail} value={formData.email} {...commonProps} />
                            <InputField id="phone" type="tel" placeholder="Contact Phone" icon={icons.phone} value={formData.phone} {...commonProps} />
                            <InputField id="password" type="password" placeholder="Create Password" icon={icons.lock} value={formData.password} {...commonProps} />
                        </> )}
                        <button type="submit" className="w-full bg-gradient-to-r from-cyan-500 via-blue-500 to-violet-500 text-white font-bold py-3 px-4 rounded-lg hover:shadow-lg hover:shadow-blue-500/50 transition-all duration-300 mt-4 flex items-center justify-center gap-2">
                            {authMode === 'login' ? 'Login' : 'Create Account'} <ChevronsRight size={20} />
                        </button>
                    </form>
                    <div className="mt-6 text-center">
                        <p className="text-sm text-gray-400">
                            {authMode === 'signup' ? 'Already have an account? ' : "Don't have an account? "}
                            <button onClick={() => setAuthMode(authMode === 'signup' ? 'login' : 'signup')} className="font-semibold text-cyan-400 hover:underline">
                                {authMode === 'signup' ? 'Login' : 'Sign Up'}
                            </button>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
