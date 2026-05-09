import React, { useState, useMemo, Fragment, useEffect } from 'react';
import { Search, ArrowLeft, ArrowRight, Play, Clock, Code, Users, Briefcase, Trophy, Zap, AlertTriangle, Heart } from 'lucide-react';

// --- Original Roadmaps (unchanged) ---
const originalRoadmapData = {
  'Frontend': {
    title: 'Frontend Developer',
    description: 'Comprehensive 2025 guide: Foundations → Tools → Frameworks → Advanced UI/UX → Mobile/PWA → Optimization.',
    path: [
      {
        level: 1,
        description: 'Build web basics. Essential for all developers.',
        nodes: [
          { title: 'HTML Basics', url: 'https://www.youtube.com/watch?v=Gs5yi3Hi5qo' },
          { title: 'CSS Fundamentals', url: 'https://www.youtube.com/watch?v=QeslNHmTObk' },
          { title: 'JavaScript ES6+', url: 'https://www.youtube.com/watch?v=UBcvoBzOOCc' },
        ],
      },
      { level: 2, description: 'Project: Static site to apply basics.', nodes: [{ title: 'Checkpoint: Web Foundations', type: 'checkpoint' }] },
      { level: 3, description: 'Version control for teamwork.', nodes: [{ title: 'Git & GitHub', url: 'https://www.youtube.com/watch?v=vA5TTz6BXhY' }] },
      {
        level: 4,
        description: 'Modern JS enhancements.',
        nodes: [
          { title: 'TypeScript Basics', url: 'https://www.youtube.com/watch?v=K01hLNDdqg4' },
          { title: 'npm Package Manager', url: 'https://www.youtube.com/watch?v=fqlFpNg99S0' },
        ],
      },
      { level: 5, description: 'Pick your framework path.', nodes: [{ title: 'Choose a Framework', type: 'choice' }] },
      {
        level: 6,
        description: 'Core framework mastery.',
        nodes: [
          { title: 'React Full Course', url: 'https://www.youtube.com/watch?v=TtPXvEcE11E' },
          { title: 'Vue.js Full Course', url: 'https://www.youtube.com/watch?v=ymXJlPeM-qI' },
          { title: 'Angular Full Course', url: 'https://www.youtube.com/watch?v=muVjufQBK7M' },
        ],
      },
      { level: 7, description: 'SSR for better performance.', nodes: [{ title: 'Next.js Full Course', url: 'https://www.youtube.com/watch?v=6jQdZcYY8OY' }] },
      { level: 8, description: 'Rapid styling.', nodes: [{ title: 'Tailwind CSS Full Course', url: 'https://www.youtube.com/watch?v=6biMWgD6_JY' }] },
      { level: 9, description: 'Project: Deploy SPA.', nodes: [{ title: 'Checkpoint: Modern Frontend Apps', type: 'checkpoint' }] },
      {
        level: 10,
        description: 'Testing & Perf.',
        nodes: [
          { title: 'React Testing Library', url: 'https://www.youtube.com/watch?v=0MMDQLgy5MU' },
          { title: 'Performance Optimization', url: 'https://www.youtube.com/watch?v=LuQ8VWh6eYE' },
        ],
      },
      {
        level: 11,
        description: 'Extend to mobile/web apps.',
        nodes: [
          { title: 'React Native Basics', url: 'https://www.youtube.com/watch?v=J50gwzwLvAk' },
          { title: 'PWA Development', url: 'https://www.youtube.com/watch?v=9t9l1Q4vQeA' },
        ],
      },
    ],
  },
  'React': {
    title: 'React Developer',
    description: '2025 React mastery: Core → State/Routing → UI → Advanced → Deployment.',
    path: [
      { level: 1, description: 'Prerequisites check.', nodes: [{ title: 'JS (ES6+), HTML, CSS', type: 'checkpoint' }] },
      { level: 2, description: 'Hooks & components.', nodes: [{ title: 'Core React Concepts', url: 'https://www.youtube.com/watch?v=TtPXvEcE11E' }] },
      { level: 3, description: 'State options.', nodes: [{ title: 'State Management', type: 'choice' }] },
      {
        level: 4,
        description: 'Global state impl.',
        nodes: [
          { title: 'Zustand', url: 'https://www.youtube.com/watch?v=bFhNFs9SLAA' },
          { title: 'Redux Toolkit', url: 'https://www.youtube.com/watch?v=QgK_-G-hWeA' },
          { title: 'React Context API', url: 'https://www.youtube.com/watch?v=PPA_PwCNZiQ' },
        ],
      },
      { level: 5, description: 'SPA navigation.', nodes: [{ title: 'Routing with React Router', url: 'https://www.youtube.com/watch?v=kXlDTBW-eQ4' }] },
      { level: 6, description: 'UI libraries.', nodes: [{ title: 'Component Libraries', type: 'choice' }] },
      {
        level: 7,
        description: 'Integrate UI.',
        nodes: [
          { title: 'Material UI', url: 'https://www.youtube.com/watch?v=RnHJJNqwSoQ' },
          { title: 'shadcn/ui', url: 'https://www.youtube.com/watch?v=zQpVrf8qKHQ' },
        ],
      },
      { level: 8, description: 'Full-stack React.', nodes: [{ title: 'Meta-Framework: Next.js', url: 'https://www.youtube.com/watch?v=6jQdZcYY8OY' }] },
      { level: 9, description: 'Project: Auth app.', nodes: [{ title: 'Checkpoint: Advanced React Developer', type: 'checkpoint' }] },
      {
        level: 10,
        description: 'Server-side & Deploy.',
        nodes: [
          { title: 'React Server Components', url: 'https://www.youtube.com/watch?v=1QXqWQ0yNfg' },
          { title: 'Vercel Deployment', url: 'https://www.youtube.com/watch?v=3izAncxuO78' },
        ],
      },
      { level: 11, description: 'Modern extras.', nodes: [{ title: 'React with AI/ML Basics', url: 'https://www.youtube.com/watch?v=example-ai-react' }] },
    ],
  },
  'Backend': {
    title: 'Backend Developer',
    description: '2025 Backend: Languages → DBs → APIs → Security → Scaling.',
    path: [
      { level: 1, description: 'Language choice.', nodes: [{ title: 'Choose a Language', type: 'choice' }] },
      {
        level: 2,
        description: 'Runtime basics.',
        nodes: [
          { title: 'Node.js Full Course', url: 'https://www.youtube.com/watch?v=PCcMF1xTQO0' },
          { title: 'Python (Django) Full Course', url: 'https://www.youtube.com/watch?v=hw3Cttc9qZQ' },
          { title: 'Go Full Course', url: 'https://www.youtube.com/watch?v=lbPThhcfn10' },
        ],
      },
      { level: 3, description: 'DB choice.', nodes: [{ title: 'Databases', type: 'choice' }] },
      {
        level: 4,
        description: 'Data handling.',
        nodes: [
          { title: 'PostgreSQL Tutorial', url: 'https://www.youtube.com/watch?v=IcJvVUln-KY' },
          { title: 'MongoDB Crash Course', url: 'https://www.youtube.com/watch?v=Zndy6PfyLLM' },
        ],
      },
      { level: 5, description: 'API style.', nodes: [{ title: 'APIs', type: 'choice' }] },
      {
        level: 6,
        description: 'API building.',
        nodes: [
          { title: 'REST API Concepts', url: 'https://www.youtube.com/watch?v=38GNKtclDdE' },
          { title: 'GraphQL Tutorial', url: 'https://www.youtube.com/watch?v=BNYwj0ZvU1U' },
        ]
      },
      { level: 7, description: 'Secure access.', nodes: [{ title: 'Authentication (JWT)', url: 'https://www.youtube.com/watch?v=I11jbMOCY0c' }] },
      { level: 8, description: 'Project: CRUD API.', nodes: [{ title: 'Checkpoint: Server-Side Logic', type: 'checkpoint' }] },
      {
        level: 9,
        description: 'Scaling tools.',
        nodes: [
          { title: 'Express.js Full Course', url: 'https://www.youtube.com/watch?v=fBzm9zja2Y8' },
          { title: 'Redis Caching', url: 'https://www.youtube.com/watch?v=Xw1Lv66noEY' },
        ],
      },
      { level: 10, description: 'Advanced arch.', nodes: [{ title: 'Microservices Basics', url: 'https://www.youtube.com/watch?v=example-micro' }] },
    ],
  },
  'Full Stack': {
    title: 'Full Stack Developer',
    description: '2025 Full-Stack: Frontend → Backend → Integration → Deployment.',
    path: [
      { level: 1, description: 'Frontend start.', nodes: [{ title: 'Start with Frontend Path', type: 'checkpoint' }] },
      { level: 2, description: 'UI layer.', nodes: [{ title: 'HTML, CSS, JavaScript', url: 'https://www.youtube.com/watch?v=UBcvoBzOOCc' }] },
      { level: 3, description: 'Version control.', nodes: [{ title: 'Git & GitHub', url: 'https://www.youtube.com/watch?v=vA5TTz6BXhY' }] },
      { level: 4, description: 'Framework + Style.', nodes: [{ title: 'React & Tailwind CSS', url: 'https://www.youtube.com/watch?v=IJ85kCdqWao' }] },
      { level: 5, description: 'Backend shift.', nodes: [{ title: 'Transition to Backend', type: 'checkpoint' }] },
      { level: 6, description: 'JS backend.', nodes: [{ title: 'Node.js (Recommended)', url: 'https://www.youtube.com/watch?v=PCcMF1xTQO0' }] },
      { level: 7, description: 'API server.', nodes: [{ title: 'Express.js', url: 'https://www.youtube.com/watch?v=fBzm9zja2Y8' }] },
      { level: 8, description: 'Data storage.', nodes: [{ title: 'Databases: PostgreSQL', url: 'https://www.youtube.com/watch?v=IcJvVUln-KY' }] },
      { level: 9, description: 'Unified stack.', nodes: [{ title: 'Full Stack Framework: Next.js', url: 'https://www.youtube.com/watch?v=6jQdZcYY8OY' }] },
      { level: 10, description: 'Deploy full app.', nodes: [{ title: 'Checkpoint: You are Full Stack!', type: 'checkpoint' }] },
      {
        level: 11,
        description: 'Secure & test.',
        nodes: [
          { title: 'Full-Stack Security', url: 'https://www.youtube.com/watch?v=example-fs-sec' },
          { title: 'End-to-End Testing', url: 'https://www.youtube.com/watch?v=example-e2e' },
        ],
      },
    ],
  },
  'DevOps': {
    title: 'DevOps Engineer',
    description: '2025 DevOps: OS → Containers → CI/CD → IaC → Monitoring → Cloud.',
    path: [
      {
        level: 1,
        description: 'CLI comfort.',
        nodes: [
          { title: 'Linux Basics', url: 'https://www.youtube.com/watch?v=HKp_Vn8H-K4' },
          { title: 'Shell Scripting', url: 'https://www.youtube.com/watch?v=PNhq_4d-5ek' },
        ],
      },
      { level: 2, description: 'Data flow.', nodes: [{ title: 'Networking Fundamentals', url: 'https://www.youtube.com/watch?v=_IOZ8_cPgu8' }] },
      {
        level: 3,
        description: 'Containerize.',
        nodes: [
          { title: 'Docker Full Course', url: 'https://www.youtube.com/watch?v=pg884pZFK0A' },
          { title: 'Kubernetes Course', url: 'https://www.youtube.com/watch?v=EV47Oxwet6Y' },
        ],
      },
      { level: 4, description: 'Pipeline choice.', nodes: [{ title: 'CI/CD Tools', type: 'choice' }] },
      {
        level: 5,
        description: 'Automate builds.',
        nodes: [
          { title: 'Jenkins CI/CD', url: 'https://www.youtube.com/watch?v=ecTqBWP4k88' },
          { title: 'GitHub Actions', url: 'https://www.youtube.com/watch?v=qoalS5ae7fk' },
        ],
      },
      { level: 6, description: 'Code infra.', nodes: [{ title: 'Infrastructure as Code', type: 'choice' }] },
      {
        level: 7,
        description: 'Manage resources.',
        nodes: [
          { title: 'Terraform Tutorial', url: 'https://www.youtube.com/watch?v=ULG6M9ETwKY' },
          { title: 'Ansible Tutorial', url: 'https://www.youtube.com/watch?v=GAv9I7atBG8' },
        ],
      },
      { level: 8, description: 'System health.', nodes: [{ title: 'Monitoring: Prometheus', url: 'https://www.youtube.com/watch?v=zFd6nzvbEhk' }] },
      {
        level: 9,
        description: 'Cloud & Security.',
        nodes: [
          { title: 'AWS DevOps', url: 'https://www.youtube.com/watch?v=fFaAPD8b6Mk' },
          { title: 'Security Best Practices', url: 'https://www.youtube.com/watch?v=5m_E0oCDgTw' },
        ],
      },
      { level: 10, description: 'Emerging: AI Ops.', nodes: [{ title: 'AI in DevOps Basics', url: 'https://www.youtube.com/watch?v=example-ai-ops' }] },
    ],
  },
};

// --- New Roadmaps Added ---
const newRoadmapData = {
  'Mobile Development': {
    title: 'Mobile Developer',
    description: '2025 Mobile Dev: Cross-platform → Native → UI/UX → Backend Integration → Deployment.',
    path: [
      { level: 1, description: 'Choose platform.', nodes: [{ title: 'Choose Framework', type: 'choice' }] },
      {
        level: 2,
        description: 'Cross-platform mastery.',
        nodes: [
          { title: 'React Native Full Course', url: 'https://www.youtube.com/watch?v=J50gwzwLvAk' },
          { title: 'Flutter Full Course', url: 'https://www.youtube.com/watch?v=3kaGC_DrUnw' },
        ],
      },
      { level: 3, description: 'Native development.', nodes: [{ title: 'iOS/Swift Basics', type: 'checkpoint' }] },
      { level: 4, description: 'UI/UX for mobile.', nodes: [{ title: 'Mobile UI Design', url: 'https://www.youtube.com/watch?v=example-mobile-ui' }] },
      { level: 5, description: 'Integrate APIs.', nodes: [{ title: 'Mobile Backend Integration', url: 'https://www.youtube.com/watch?v=example-mobile-backend' }] },
      { level: 6, description: 'Testing & Deploy.', nodes: [{ title: 'App Store Deployment', type: 'checkpoint' }] },
    ],
  },
  'Game Development': {
    title: 'Game Developer',
    description: '2025 Game Dev: Engines → Scripting → Assets → Multiplayer → Publishing.',
    path: [
      { level: 1, description: 'Choose engine.', nodes: [{ title: 'Choose Engine', type: 'choice' }] },
      {
        level: 2,
        description: 'Engine mastery.',
        nodes: [
          { title: 'Unity Full Course', url: 'https://www.youtube.com/watch?v=example-unity-full' },
          { title: 'Unreal Engine Full Course', url: 'https://www.youtube.com/watch?v=example-unreal-full' },
        ],
      },
      { level: 3, description: 'Scripting basics.', nodes: [{ title: 'C# for Unity', url: 'https://www.youtube.com/watch?v=example-csharp-unity' }] },
      { level: 4, description: 'Assets & Animation.', nodes: [{ title: 'Blender for Games', url: 'https://www.youtube.com/watch?v=example-blender-games' }] },
      { level: 5, description: 'Multiplayer features.', nodes: [{ title: 'Photon Networking', url: 'https://www.youtube.com/watch?v=example-photon' }] },
      { level: 6, description: 'Publish & Monetize.', nodes: [{ title: 'Steam Publishing', type: 'checkpoint' }] },
    ],
  },
  'Cloud Computing': {
    title: 'Cloud Engineer',
    description: '2025 Cloud: Fundamentals → Services → Security → Automation.',
    path: [
      { level: 1, description: 'Cloud basics.', nodes: [{ title: 'Cloud Fundamentals', url: 'https://www.youtube.com/watch?v=wdvXbwvejck' }] },
      { level: 2, description: 'Choose provider.', nodes: [{ title: 'Choose Provider', type: 'choice' }] },
      {
        level: 3,
        description: 'Core services.',
        nodes: [
          { title: 'AWS EC2/S3', url: 'https://www.youtube.com/watch?v=example-aws-core' },
          { title: 'Azure VMs/Storage', url: 'https://www.youtube.com/watch?v=example-azure-core' },
        ],
      },
      { level: 4, description: 'Security & Compliance.', nodes: [{ title: 'IAM & Security Groups', url: 'https://www.youtube.com/watch?v=example-cloud-sec' }] },
      { level: 5, description: 'Automation.', nodes: [{ title: 'CloudFormation/Terraform', url: 'https://www.youtube.com/watch?v=ULG6M9ETwKY' }] },
      { level: 6, description: 'Advanced deployment.', nodes: [{ title: 'Serverless Apps', type: 'checkpoint' }] },
    ],
  },
  'System & Network': {
    title: 'Systems & Network Engineer',
    description: '2025 Sys/Net: OS → Networking → Security → Monitoring.',
    path: [
      { level: 1, description: 'OS basics.', nodes: [{ title: 'Linux Fundamentals', url: 'https://www.youtube.com/watch?v=HKp_Vn8H-K4' }] },
      { level: 2, description: 'Networking core.', nodes: [{ title: 'TCP/IP & Routing', url: 'https://www.youtube.com/watch?v=_IOZ8_cPgu8' }] },
      { level: 3, description: 'Security essentials.', nodes: [{ title: 'Firewall & VPN', url: 'https://www.youtube.com/watch?v=5m_E0oCDgTw' }] },
      { level: 4, description: 'Monitoring tools.', nodes: [{ title: 'Nagios/Zabbix', url: 'https://www.youtube.com/watch?v=example-monitoring' }] },
      { level: 5, description: 'Advanced config.', nodes: [{ title: 'Load Balancing', type: 'checkpoint' }] },
    ],
  },
  'Data Science': {
    title: 'Data Scientist',
    description: '2025 DS: Python → Stats → ML → Visualization.',
    path: [
      { level: 1, description: 'Python for DS.', nodes: [{ title: 'Python DS Basics', url: 'https://www.youtube.com/watch?v=example-python-ds' }] },
      { level: 2, description: 'Statistics.', nodes: [{ title: 'Stats for DS', url: 'https://www.youtube.com/watch?v=example-stats-ds' }] },
      { level: 3, description: 'ML algorithms.', nodes: [{ title: 'Scikit-Learn Course', url: 'https://www.youtube.com/watch?v=example-scikit' }] },
      { level: 4, description: 'Visualization.', nodes: [{ title: 'Matplotlib/Seaborn', url: 'https://www.youtube.com/watch?v=example-viz' }] },
      { level: 5, description: 'Projects.', nodes: [{ title: 'DS Portfolio', type: 'checkpoint' }] },
    ],
  },
  'Blockchain': {
    title: 'Blockchain Developer',
    description: '2025 Blockchain: Fundamentals → Solidity → DApps → Security.',
    path: [
      { level: 1, description: 'Blockchain basics.', nodes: [{ title: 'Blockchain Intro', url: 'https://www.youtube.com/watch?v=example-blockchain-intro' }] },
      { level: 2, description: 'Ethereum/Solidity.', nodes: [{ title: 'Solidity Full Course', url: 'https://www.youtube.com/watch?v=example-solidity' }] },
      { level: 3, description: 'Smart contracts.', nodes: [{ title: 'Smart Contract Dev', url: 'https://www.youtube.com/watch?v=example-smart-contract' }] },
      { level: 4, description: 'DApps.', nodes: [{ title: 'Build DApp', url: 'https://www.youtube.com/watch?v=example-dapp' }] },
      { level: 5, description: 'Security audit.', nodes: [{ title: 'Blockchain Security', type: 'checkpoint' }] },
    ],
  },
};

// --- Combined Roadmap Data ---
const roadmapData = { ...originalRoadmapData, ...newRoadmapData };

// --- Motivational Flow Data (unchanged) ---
const motivationalFlow = {
  title: 'Your Path to Dev Success in 2025',
  description: 'Hard Work → Consistent Practice → Real Projects → Community → Career Success. Overcome challenges, stay passionate – factors like consistency and growth mindset drive you forward!',
  path: [
    {
      level: 1,
      description: 'Start with commitment – daily effort builds momentum.',
      nodes: [
        { title: 'Dedicate Time', icon: Clock, type: 'motivation' },
        { title: 'Factor: Set Goals', icon: Zap, type: 'factor', subtitle: 'Daily 1hr → Habit' },
      ],
    },
    { 
      level: 2, 
      description: 'Practice turns knowledge into skill – code daily.',
      nodes: [
        { title: 'Practice Coding', icon: Code, type: 'motivation' },
        { title: 'Factor: Overcome Bugs', icon: AlertTriangle, type: 'factor', subtitle: 'Debug → Learn' },
      ] 
    },
    { 
      level: 3, 
      description: 'Projects showcase your abilities – build portfolio pieces.',
      nodes: [
        { title: 'Build Projects', icon: Briefcase, type: 'motivation' },
        { title: 'Factor: Iterate Fast', icon: Zap, type: 'factor', subtitle: 'MVP → Refine' },
      ] 
    },
    { 
      level: 4, 
      description: 'Connect with others – feedback accelerates growth.',
      nodes: [
        { title: 'Join Communities', icon: Users, type: 'motivation' },
        { title: 'Factor: Network Actively', icon: Heart, type: 'factor', subtitle: 'Share → Collaborate' },
      ] 
    },
    { 
      level: 5, 
      description: 'Apply skills – success follows preparation.',
      nodes: [
        { title: 'Land Your Job!', icon: Trophy, type: 'motivation' },
        { title: 'Factor: Continuous Learning', icon: Code, type: 'factor', subtitle: 'Adapt → Thrive' },
      ] 
    },
  ],
};

// --- Helper Components ---
const RoadmapNode = ({ title, url, type = 'topic', icon, subtitle, theme }) => {
  const isCheckpoint = type === 'checkpoint';
  const isChoice = type === 'choice';
  const isMotivation = type === 'motivation';
  const isFactor = type === 'factor';
  const primaryColor = theme?.primary || '#7D5AFE';
  const secondaryColor = theme?.secondary || '#66BB6A';

  const baseClasses = "text-center p-4 m-2 rounded-2xl shadow-lg font-bold text-sm flex flex-col items-center justify-center transition-all duration-300 cursor-pointer border break-words max-w-full";
  
  // Dynamic styles based on type and theme
  let nodeStyle = {};
  
  if (isMotivation) {
    nodeStyle = { backgroundColor: 'white', color: '#1F2937', borderColor: '#E5E7EB' };
  } else if (isFactor) {
    nodeStyle = { backgroundColor: '#EFF6FF', color: '#1E3A8A', borderColor: '#BFDBFE' };
  } else if (isCheckpoint) {
    nodeStyle = { background: 'linear-gradient(to right, #374151, #111827)', color: 'white', borderColor: '#4B5563' };
  } else if (isChoice) {
    nodeStyle = { background: 'linear-gradient(to right, #C084FC, #EC4899)', color: 'white', borderColor: '#D8B4FE' };
  } else {
    // Topic: Use main theme gradient
    nodeStyle = { background: `linear-gradient(to right, ${primaryColor}, ${secondaryColor})`, color: 'white', borderColor: primaryColor };
  }

  const hoverClass = isMotivation ? "hover:scale-110" : "hover:scale-105";

  let IconComp = null;
  if (isMotivation) {
    IconComp = icon ? React.createElement(icon, { className: "w-10 h-10 mb-3 text-gray-600" }) : null;
  } else if (isFactor) {
    IconComp = icon ? React.createElement(icon, { className: "w-5 h-5 mb-1 text-blue-600" }) : null;
  }

  // Styles for width to prevent overflow
  const layoutStyle = {
    minWidth: isMotivation || isFactor ? 'auto' : '140px',
    width: isMotivation || isFactor ? '100%' : 'auto', 
    maxWidth: '220px', 
    minHeight: isMotivation ? '140px' : '60px',
    ...nodeStyle
  };

  const nodeContent = (
    <div className={`${baseClasses} ${hoverClass}`} style={layoutStyle}>
      {IconComp}
      {url ? <Play className="w-5 h-5 mb-1" /> : null}
      <div className={isMotivation ? "text-base mt-1 font-bold" : isFactor ? "text-xs font-medium" : "text-sm"}>{title}</div>
      {subtitle && <div className="text-xs opacity-80 mt-1 italic">{subtitle}</div>}
    </div>
  );

  if (url) {
    return <a href={url} target="_blank" rel="noopener noreferrer" className="no-underline">{nodeContent}</a>;
  }
  return nodeContent;
};

const FlowVisualization = ({ flow, isMotivational = false, theme }) => {
  const [currentLevel, setCurrentLevel] = useState(0);
  const [viewMode, setViewMode] = useState('step');
  const maxLevel = flow.path.length - 1;
  const primaryColor = theme?.primary || '#7D5AFE';
  const secondaryColor = theme?.secondary || '#66BB6A';

  const goPrev = () => setCurrentLevel(prev => Math.max(0, prev - 1));
  const goNext = () => setCurrentLevel(prev => Math.min(maxLevel, prev + 1));
  const toggleView = () => setViewMode(viewMode === 'step' ? 'full' : 'step');

  // --- FIXED: Responsive Motivational Flow ---
  if (isMotivational) {
    return (
      <div className="flex flex-col items-center animate-fade-in w-full">
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-4 text-gray-900">
          {flow.title}
        </h2>
        <p className="text-gray-600 text-center mb-12 max-w-4xl px-4">{flow.description}</p>
        
        {/* Changed from fixed flex-row to responsive flex-col (mobile) -> flex-row (desktop) */}
        <div className="flex flex-col lg:flex-row items-center justify-center w-full max-w-6xl gap-0 lg:gap-4">
          {flow.path.map((level, levelIndex) => (
            <Fragment key={level.level || levelIndex}>
              <div className="flex flex-col items-center w-full lg:w-auto">
                {level.description && (
                  <div className="bg-white border border-gray-200 shadow-sm rounded-xl p-3 mb-3 max-w-xs text-center">
                    <p className="text-gray-600 text-xs">{level.description}</p>
                  </div>
                )}
                <div className="flex flex-col items-center space-y-4 mb-4 w-full">
                  {level.nodes.map((node, idx) => (
                    <RoadmapNode key={node.title || idx} {...node} theme={theme} />
                  ))}
                </div>
              </div>
              
              {/* Connector: Vertical Line on Mobile, Horizontal on Desktop */}
              {levelIndex < flow.path.length - 1 && (
                <div className="flex items-center justify-center my-2 lg:my-0">
                  {/* Vertical Line (Mobile) */}
                  <div className="w-1 h-12 bg-gray-300 rounded-full lg:hidden"></div>
                  {/* Horizontal Line (Desktop) */}
                  <div className="hidden lg:block h-1 w-16 bg-gray-300 rounded-full"></div>
                </div>
              )}
            </Fragment>
          ))}
        </div>
      </div>
    );
  }

  // --- Standard Roadmap Visualization ---
  const renderLevel = (level, levelIndex) => (
    <div key={level.level || levelIndex} className="flex flex-col items-center mb-8 w-full">
      {level.description && (
        <div className={`p-4 rounded-xl mb-4 text-center max-w-2xl border ${isMotivational ? 'bg-green-50 border-green-200' : 'bg-blue-50 border-blue-200'}`}>
          <p className={`${isMotivational ? 'text-green-800' : 'text-blue-800'}`}>{level.description}</p>
        </div>
      )}
      <div className="flex flex-wrap justify-center items-center gap-4 w-full">
        {level.nodes.map((node, idx) => (
          <RoadmapNode key={node.title || idx} {...node} theme={theme} />
        ))}
      </div>
    </div>
  );

  return (
    <div className="flex flex-col items-center animate-fade-in w-full">
      <h2 
        className="text-3xl font-bold text-center mb-2 bg-clip-text text-transparent"
        style={{ backgroundImage: `linear-gradient(to right, ${primaryColor}, ${secondaryColor})` }}
      >
        {flow.title}
      </h2>
      <p className="text-gray-600 text-center mb-10 max-w-2xl px-4">{flow.description}</p>
      
      <button 
        onClick={toggleView}
        className="mb-6 px-6 py-2 text-white rounded-xl transition-all hover:scale-105 shadow-lg"
        style={{ background: `linear-gradient(to right, ${primaryColor}, ${secondaryColor})` }}
      >
        {viewMode === 'step' ? 'Full Flow View' : 'Step-by-Step'}
      </button>

      {viewMode === 'step' ? (
        <>
          {renderLevel(flow.path[currentLevel], currentLevel)}
          <div className="flex gap-4 mb-8">
            <button onClick={goPrev} disabled={currentLevel === 0} className="px-6 py-2 bg-gray-200 text-gray-800 rounded-xl disabled:opacity-50 flex items-center gap-2 hover:bg-gray-300 shadow-sm transition-colors">
              <ArrowLeft size={16} /> Prev
            </button>
            <span className="text-gray-600 self-center font-medium">Step {currentLevel + 1} / {maxLevel + 1}</span>
            <button 
              onClick={goNext} 
              disabled={currentLevel === maxLevel} 
              className="px-6 py-2 text-white rounded-xl disabled:opacity-50 flex items-center gap-2 shadow-lg transition-colors"
              style={{ backgroundColor: primaryColor }}
            >
              Next <ArrowRight size={16} />
            </button>
          </div>
        </>
      ) : (
        <div className="flex flex-col items-center w-full space-y-4">
          {flow.path.map((level, levelIndex) => (
            <Fragment key={level.level || levelIndex}>
              {levelIndex > 0 && (
                <div 
                  className="h-16 w-1 rounded-full" 
                  style={{ background: `linear-gradient(to bottom, ${primaryColor}50, ${secondaryColor}50)` }}
                ></div>
              )}
              {renderLevel(level, levelIndex)}
            </Fragment>
          ))}
        </div>
      )}
    </div>
  );
};

const SearchScreen = ({ onSelectRoadmap, onSearch, searchResults, theme }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const primaryColor = theme?.primary || '#7D5AFE';
  const secondaryColor = theme?.secondary || '#66BB6A';

  const handleSearch = (value) => {
    setSearchTerm(value);
    onSearch(value);
  };

  useEffect(() => {
    if (searchResults.length === 1 && searchTerm) {
      onSelectRoadmap(searchResults[0]);
    }
  }, [searchResults, searchTerm, onSelectRoadmap]);

  return (
    <div className="text-center animate-fade-in">
      <header className="mb-12 px-4">
        <h1 
          className="text-4xl md:text-6xl font-bold mb-4 bg-clip-text text-transparent"
          style={{ backgroundImage: `linear-gradient(to right, ${primaryColor}, ${secondaryColor})` }}
        >
          Developer Roadmaps 2025
        </h1>
        <p className="text-lg md:text-xl text-gray-600">Student-friendly guides to tech mastery. Easy steps, real projects!</p>
      </header>
      <div className="relative max-w-xl mx-auto mb-8 px-4">
        <Search className="absolute left-8 top-1/2 -translate-y-1/2 text-gray-400" size={24} />
        <input
          type="text"
          placeholder="Search roadmap (e.g., React, DevOps, Blockchain)..."
          onChange={(e) => handleSearch(e.target.value)}
          className="bg-white border-2 border-gray-200 rounded-xl pl-12 pr-4 py-4 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 w-full text-lg shadow-lg"
          style={{ '--tw-ring-color': primaryColor }}
        />
        <style>{`
          input:focus {
            box-shadow: 0 0 0 2px ${primaryColor} !important;
            border-color: transparent;
          }
        `}</style>
      </div>
      {searchResults.length > 1 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-4xl mx-auto mb-20 px-4">
          {searchResults.map(key => (
            <button
              key={key}
              onClick={() => onSelectRoadmap(key)}
              className="px-8 py-4 rounded-xl font-semibold transition-all bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 transform hover:scale-105 shadow-md"
              style={{ ':hover': { borderColor: primaryColor, color: primaryColor } }}
              onMouseEnter={(e) => {
                e.target.style.borderColor = primaryColor;
                e.target.style.color = primaryColor;
              }}
              onMouseLeave={(e) => {
                e.target.style.borderColor = '#e5e7eb';
                e.target.style.color = '#374151';
              }}
            >
              {roadmapData[key].title}
            </button>
          ))}
        </div>
      )}

      <div className="max-w-7xl mx-auto mb-16 px-4">
        <FlowVisualization flow={motivationalFlow} isMotivational={true} theme={theme} />
      </div>
    </div>
  );
};

// --- Main App Component ---
export default function Roadmap({ theme }) {
  const [selectedRoadmapKey, setSelectedRoadmapKey] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  
  const primaryColor = theme?.primary || '#7D5AFE';
  const secondaryColor = theme?.secondary || '#66BB6A';

  const searchResults = useMemo(() => {
    if (!searchTerm) {
      return Object.keys(roadmapData);
    }
    return Object.keys(roadmapData).filter(key =>
      roadmapData[key].title.toLowerCase().includes(searchTerm.toLowerCase()) || key.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [searchTerm]);

  const currentRoadmap = selectedRoadmapKey ? roadmapData[selectedRoadmapKey] : null;

  return (
    <div className="bg-gradient-to-br from-gray-50 via-white to-gray-100 text-gray-900 min-h-screen font-sans p-2 md:p-8 overflow-x-hidden">
      <style>{`
        @keyframes fade-in {
            from { opacity: 0; transform: translateY(20px); }
            to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in { animation: fade-in 0.6s ease-out forwards; }
      `}</style>
      <div className="max-w-7xl mx-auto w-full">
        {currentRoadmap ? (
          <div className="relative w-full">
            <button 
              onClick={() => setSelectedRoadmapKey(null)} 
              className="absolute -top-6 left-0 flex items-center gap-2 bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 font-semibold py-3 px-6 rounded-xl transition-all shadow-md z-10"
            >
              <ArrowLeft size={20} /> Back to Home
            </button>
            <div className="bg-white/80 backdrop-blur-md p-4 md:p-8 rounded-2xl shadow-2xl mt-12 border border-white/50 w-full overflow-hidden">
              <FlowVisualization flow={currentRoadmap} theme={theme} />
            </div>
          </div>
        ) : (
          <SearchScreen onSelectRoadmap={setSelectedRoadmapKey} onSearch={setSearchTerm} searchResults={searchResults} theme={theme} />
        )}
        <footer className="text-center text-gray-500 mt-16 text-sm border-t border-gray-200 pt-8 px-4">
          <p>🌟 Click yellow boxes for 2025 YouTube courses. Step-by-step for easy learning. Build, practice, succeed!</p>
          <p>Created for students | Educational use only</p>
        </footer>
      </div>
    </div>
  );
}