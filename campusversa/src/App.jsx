import React, { useState, useEffect } from 'react';

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

const CuriousExplorer = ({ focusedField }) => {
    const isPasswordFocused = focusedField === 'password' || focusedField === 'confirmPassword';
    const isTyping = !!focusedField && !isPasswordFocused;
    const isBlinking = useBlink(isTyping);

    const eyePosition = {
        transition: 'transform 0.4s ease',
        transform: isPasswordFocused ? 'translateX(-7px)' : (focusedField ? 'translateX(7px)' : 'translateX(0px)'),
    };
    const headTilt = {
        transition: 'transform 0.4s ease',
        transform: isPasswordFocused ? 'rotate(-8deg)' : (focusedField ? 'rotate(8deg)' : 'rotate(0deg)'),
        transformOrigin: '50% 100%',
    };
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

const ShySprout = ({ focusedField }) => {
    const isPasswordFocused = focusedField === 'password' || focusedField === 'confirmPassword';
    const isTyping = !!focusedField && !isPasswordFocused;
    const isBlinking = useBlink(isTyping);

    const eyePosition = {
        transition: 'transform 0.5s cubic-bezier(0.68, -0.55, 0.27, 1.55)',
        transform: isPasswordFocused ? 'translateX(-10px)' : (focusedField ? 'translateX(10px)' : 'translateX(0)'),
        transformOrigin: 'center center',
    };
    const leafWiggle = {
        transition: 'transform 0.4s ease-in-out',
        transform: focusedField ? 'rotate(15deg)' : 'rotate(0deg)',
        transformOrigin: 'bottom center'
    };
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

const CosmicCreature = ({ focusedField }) => {
    const isPasswordFocused = focusedField === 'password' || focusedField === 'confirmPassword';
    const isTyping = !!focusedField && !isPasswordFocused;
    const isBlinking = useBlink(isTyping);

    const eyePosition = {
        transition: 'transform 0.4s ease',
        transform: isPasswordFocused ? 'translateX(-8px)' : (focusedField ? 'translateX(8px)' : 'translateX(0px)'),
    };
    const bodyWobble = {
        transition: 'transform 0.4s ease',
        transform: focusedField ? 'scale(1.02, 0.98)' : 'scale(1)',
        transformOrigin: 'bottom center',
    };
     const browStyle = {
        transition: 'opacity 0.3s ease',
        opacity: isPasswordFocused ? 1 : 0
    };
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

const WobblyPudding = ({ focusedField }) => {
    const isPasswordFocused = focusedField === 'password' || focusedField === 'confirmPassword';
    const isTyping = !!focusedField && !isPasswordFocused;
    const isBlinking = useBlink(isTyping);

    const bodyWobble = {
        transition: 'transform 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)',
        transform: focusedField ? 'translateX(5px) rotate(3deg)' : 'translateX(0) rotate(0deg)',
        transformOrigin: 'bottom center',
    };
     const eyePosition = {
        transition: 'transform 0.4s ease',
        transform: isPasswordFocused ? 'translateX(-8px)' : (focusedField ? 'translateX(8px)' : 'translateX(0px)'),
    };
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

const SparkleBot = ({ focusedField }) => {
    const isPasswordFocused = focusedField === 'password' || focusedField === 'confirmPassword';
    const isTyping = !!focusedField && !isPasswordFocused;
    const isBlinking = useBlink(isTyping);

    const eyePosition = {
        transition: 'transform 0.4s ease',
        transform: isPasswordFocused ? 'translateX(-8px)' : (focusedField ? 'translateX(8px)' : 'translateX(0px)'),
    };
    const headTilt = {
        transition: 'transform 0.4s ease',
        transform: focusedField ? 'rotate(10deg)' : 'rotate(0deg)',
        transformOrigin: '50% 90%',
    };
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
        <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
            {icon}
        </div>
        <input
            id={id} name={id} type={type} placeholder={placeholder} value={value}
            onChange={onChange} onFocus={() => onFocus(id)} onBlur={onBlur}
            className="w-full pl-10 pr-3 py-2 text-gray-700 bg-stone-100 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition"
            required
        />
    </div>
);

export default function App() {
    const [authMode, setAuthMode] = useState('signup');
    const [userType, setUserType] = useState('student');
    const [focusedField, setFocusedField] = useState(null);
    const [characterLineup, setCharacterLineup] = useState([]);
    const [guidanceMessage, setGuidanceMessage] = useState('');


    useEffect(() => {
        const shuffled = [...characters].sort(() => 0.5 - Math.random());
        setCharacterLineup(shuffled.slice(0, 5)); 
    }, []);

    useEffect(() => {
        if (!focusedField) {
            if (authMode === 'login') {
                setGuidanceMessage("Welcome back! Let's get you signed in.");
            } else {
                setGuidanceMessage("New here? Let's get you set up!");
            }
            return;
        }

        let newMessage = '';

if (authMode === 'login') {
    switch (focusedField) {
        case 'email':
            newMessage = "Great! And an email for contact.";
            break;
        case 'password':
            newMessage = "Keep it secret, keep it safe!";
            break;
        default:
            newMessage = "Let's get you signed in.";
    }
} else { // signup mode
    if (userType === 'student') {
        switch (focusedField) {
            case 'name':
                newMessage = "Nice to meet you! What's your name?";
                break;
            case 'usn':
                newMessage = "Got it. Please enter your USN.";
                break;
            case 'aadhaar':
                newMessage = "Perfect. Please provide your Aadhaar number.";
                break;
            case 'email':
                newMessage = "We'll need your email too.";
                break;
            case 'mobile':
                newMessage = "Awesome! Can I get your mobile number?";
                break;
            case 'password':
                newMessage = "Time to set your password! I'll close my eyes.";
                break;
            default:
                newMessage = "Just a few details to get started.";
        }
    } else { // institute
        switch (focusedField) {
            case 'name':
                newMessage = "What's your institute name?";
                break;
            case 'aisheCode':
                newMessage = "What's the AISHE code?";
                break;
            case 'email':
                newMessage = "We'll need your email too.";
                break;
            case 'phone':
                newMessage = "And a phone number for contact.";
                break;
            case 'password':
                newMessage = "Great! Time to set a strong password.";
                break;
            default:
                newMessage = "Let's get your institute registered.";
        }
    }
}

        setGuidanceMessage(newMessage);

    }, [focusedField, authMode, userType]);

    const [formData, setFormData] = useState({
        name: '', aisheCode: '', email: '', phone: '', usn: '', aadhaar: '', mobile: '', password: '', confirmPassword: '',
    });

    const handleInputChange = (e) => setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
    const handleFocus = (id) => setFocusedField(id);
    const handleBlur = () => setFocusedField(null);

    const icons = {
        user: <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-400"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>,
        mail: <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-400"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline></svg>,
        lock: <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-400"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>,
        idCard: <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-400"><rect x="2" y="5" width="20" height="14" rx="2"/><line x1="2" y1="10" x2="22" y2="10"/></svg>,
        phone: <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-400"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path></svg>,
        building: <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-400"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><line x1="9" y1="3" x2="9" y2="21"></line><line x1="15" y1="3" x2="15" y2="21"></line><line x1="3" y1="9" x2="21" y2="9"></line><line x1="3" y1="15" x2="21" y2="15"></line></svg>,
    };

    const commonProps = { onChange: handleInputChange, onFocus: handleFocus, onBlur: handleBlur };

    return (
        <div className="min-h-screen bg-stone-200 flex items-center justify-center p-4 font-sans">
            <div className="w-full max-w-5xl grid grid-cols-1 md:grid-cols-2 bg-white rounded-2xl shadow-2xl overflow-hidden">
                <div className="hidden md:flex flex-col items-center justify-center p-8 text-white text-center relative" style={{ backgroundColor: '#374232' }}>
                    <div className="absolute top-8 text-center">
                        <h1 className="text-3xl font-bold mb-2">Welcome!</h1>
                        <p className="opacity-90 max-w-sm mx-auto">Our friends are here to help you get started.</p>
                    </div>

                    <div 
                        className="absolute top-1/3 left-1/2 -translate-x-1/2 z-30 transition-all duration-300 w-48"
                        style={{ opacity: guidanceMessage ? 1 : 0, transform: guidanceMessage ? 'translate(-50%, 0)' : 'translate(-50%, 10px)'}}
                    >
                        <div className="bg-white text-gray-800 rounded-lg py-2 px-4 shadow-xl relative">
                            <p className="font-semibold text-sm">{guidanceMessage}</p>
                            <div className="absolute left-1/2 -bottom-2 w-4 h-4 bg-white transform -translate-x-1/2 rotate-45"></div>
                        </div>
                    </div>
                    
                     <div className="flex items-end justify-center w-full -space-x-24 mt-28">
                        {characterLineup.map((CharacterComponent, index) => {
                            let sizeClass = "w-40 h-40";
                            let style = {};
                            if (index === 2) {
                                sizeClass = "w-52 h-52";
                                style = { transform: 'translateY(-2rem) scale(1.1)', zIndex: 20 };
                            } else if (index === 1 || index === 3) {
                                sizeClass = "w-44 h-44";
                                style = { zIndex: 10 };
                            }
                            return (
                                <div key={index} className={`relative ${sizeClass}`} style={style}>
                                    <svg viewBox="0 0 200 200" className="w-full h-full">
                                        <CharacterComponent focusedField={focusedField} />
                                    </svg>
                                </div>
                            );
                        })}
                    </div>
                </div>

                <div className="p-8 md:p-12">
                    <div className="mb-6">
                        <div className="flex bg-stone-100 rounded-lg p-1">
                            <button onClick={() => setAuthMode('signup')} className={`w-1/2 py-2 rounded-md font-semibold transition-colors ${authMode === 'signup' ? 'bg-emerald-600 text-white shadow' : 'text-gray-600'}`}>Sign Up</button>
                            <button onClick={() => setAuthMode('login')} className={`w-1/2 py-2 rounded-md font-semibold transition-colors ${authMode === 'login' ? 'bg-emerald-600 text-white shadow' : 'text-gray-600'}`}>Login</button>
                        </div>
                    </div>

                    {authMode === 'signup' && (
                        <div className="mb-6">
                            <div className="flex border-b">
                                <button onClick={() => setUserType('student')} className={`flex-1 pb-2 text-center font-medium transition-colors ${userType === 'student' ? 'text-emerald-700 border-b-2 border-emerald-700' : 'text-gray-500'}`}>I'm a Student</button>
                                <button onClick={() => setUserType('institute')} className={`flex-1 pb-2 text-center font-medium transition-colors ${userType === 'institute' ? 'text-emerald-700 border-b-2 border-emerald-700' : 'text-gray-500'}`}>I'm an Institute</button>
                            </div>
                        </div>
                    )}
                    
                    <form onSubmit={(e) => e.preventDefault()}>
                        {authMode === 'login' ? (
                            <>
                                <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">Login to Your Account</h2>
                                <InputField id="email" type="email" placeholder="Email Address" icon={icons.mail} value={formData.email} {...commonProps} />
                                <InputField id="password" type="password" placeholder="Password" icon={icons.lock} value={formData.password} {...commonProps} />
                            </>
                        ) : userType === 'student' ? (
                            <>
                                <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">Create Student Account</h2>
                                <InputField id="name" type="text" placeholder="Full Name" icon={icons.user} value={formData.name} {...commonProps} />
                                <InputField id="usn" type="text" placeholder="USN" icon={icons.idCard} value={formData.usn} {...commonProps} />
                                <InputField id="aadhaar" type="text" placeholder="Aadhaar Number" icon={icons.idCard} value={formData.aadhaar} {...commonProps} />
                                <InputField id="email" type="email" placeholder="Email Address" icon={icons.mail} value={formData.email} {...commonProps} />
                                <InputField id="mobile" type="tel" placeholder="Mobile Number" icon={icons.phone} value={formData.mobile} {...commonProps} />
                                <InputField id="password" type="password" placeholder="Create Password" icon={icons.lock} value={formData.password} {...commonProps} />
                            </>
                        ) : (
                            <>
                                <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">Create Institute Account</h2>
                                <InputField id="name" type="text" placeholder="Institute Name" icon={icons.building} value={formData.name} {...commonProps} />
                                <InputField id="aisheCode" type="text" placeholder="AISHE Code" icon={icons.idCard} value={formData.aisheCode} {...commonProps} />
                                <InputField id="email" type="email" placeholder="Institute Email" icon={icons.mail} value={formData.email} {...commonProps} />
                                <InputField id="phone" type="tel" placeholder="Contact Phone" icon={icons.phone} value={formData.phone} {...commonProps} />
                                <InputField id="password" type="password" placeholder="Create Password" icon={icons.lock} value={formData.password} {...commonProps} />
                            </>
                        )}
                        <button type="submit" className="w-full bg-emerald-600 text-white font-bold py-3 px-4 rounded-md hover:bg-emerald-700 transition-colors duration-300 mt-4">
                            {authMode === 'login' ? 'Login' : 'Sign Up'}
                        </button>
                    </form>

                    <div className="mt-6 text-center">
                        <p className="text-sm text-gray-500">
                            {authMode === 'signup' ? 'Already have an account? ' : "Don't have an account? "}
                            <button onClick={() => setAuthMode(authMode === 'signup' ? 'login' : 'signup')} className="font-semibold text-emerald-700 hover:underline">
                                {authMode === 'signup' ? 'Login' : 'Sign Up'}
                            </button>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}

