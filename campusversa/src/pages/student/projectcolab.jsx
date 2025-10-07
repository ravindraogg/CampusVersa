import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Home, Code, GitBranch, Users, MessageSquare, FileText, Video, BookOpen, 
  CheckCircle, ArrowRight, ExternalLink, Play, ChevronRight, Github, 
  Trello, Slack, Figma, Database, Cloud, Terminal, Layout
} from 'lucide-react';

// Custom color palette
const primaryColor = '#7D5AFE';
const secondaryColor = '#66BB6A';

// Tools Data with comprehensive details
const collaborationTools = [
  {
    id: 'github',
    name: 'GitHub',
    category: 'Version Control',
    icon: Github,
    color: 'bg-gray-900',
    banner: 'https://placehold.co/1200x400/181717/ffffff?text=GitHub+Collaboration',
    description: 'Master version control and collaborative coding with GitHub. Perfect for team projects and open source contributions.',
    features: ['Version Control', 'Pull Requests', 'Code Review', 'Issue Tracking', 'CI/CD Integration'],
    steps: [
      {
        title: 'Create a Repository',
        description: 'Initialize a new repository for your project',
        details: 'Go to GitHub.com, click the "+" icon in the top right, select "New repository", name your project, add a description, choose public/private, and initialize with README.'
      },
      {
        title: 'Clone to Local',
        description: 'Download the repository to your computer',
        details: 'Copy the repository URL, open terminal, navigate to your desired folder, and run: git clone [repository-url]'
      },
      {
        title: 'Create Branches',
        description: 'Work on features without affecting main code',
        details: 'Use "git checkout -b feature-name" to create and switch to a new branch. This keeps your main branch stable while you develop.'
      },
      {
        title: 'Commit Changes',
        description: 'Save your work with meaningful messages',
        details: 'Stage files with "git add .", commit with "git commit -m \'Your message\'", and push with "git push origin branch-name"'
      },
      {
        title: 'Create Pull Request',
        description: 'Request to merge your changes',
        details: 'On GitHub, navigate to your repository, click "Pull requests" → "New pull request", select your branch, add description, and create PR for team review.'
      }
    ],
    videoId: 'RGOj5yH7evk',
    documentation: 'https://docs.github.com',
    tips: [
      'Write clear commit messages explaining what and why',
      'Pull from main branch regularly to avoid conflicts',
      'Use GitHub Issues to track bugs and features',
      'Add a comprehensive README.md file'
    ]
  },
  {
    id: 'trello',
    name: 'Trello',
    category: 'Project Management',
    icon: Trello,
    color: 'bg-blue-600',
    banner: 'https://placehold.co/1200x400/0052CC/ffffff?text=Trello+Project+Management',
    description: 'Organize projects with visual boards, lists, and cards. Perfect for tracking tasks and team collaboration.',
    features: ['Kanban Boards', 'Task Cards', 'Labels & Tags', 'Team Collaboration', 'Power-Ups'],
    steps: [
      {
        title: 'Create a Board',
        description: 'Set up your project workspace',
        details: 'Click "Create new board", name it after your project, choose a background, and select workspace visibility (team/private).'
      },
      {
        title: 'Add Lists',
        description: 'Organize workflow stages',
        details: 'Create lists like "To Do", "In Progress", "Review", and "Done". These represent stages in your project workflow.'
      },
      {
        title: 'Create Cards',
        description: 'Add tasks and assignments',
        details: 'Click "Add a card" in any list, name the task, add description, attach files, set due dates, and assign team members.'
      },
      {
        title: 'Use Labels & Checklists',
        description: 'Categorize and break down tasks',
        details: 'Add colored labels for priority/category, create checklists within cards for subtasks, and track progress visually.'
      },
      {
        title: 'Move Cards & Update',
        description: 'Track progress in real-time',
        details: 'Drag cards between lists as work progresses, add comments for updates, and use @mentions to notify team members.'
      }
    ],
    videoId: 'xky48zyL9iA',
    documentation: 'https://trello.com/guide',
    tips: [
      'Use colored labels to indicate priority levels',
      'Set due dates and enable calendar view',
      'Add checklists for complex tasks',
      'Integrate with Slack for notifications'
    ]
  },
  {
    id: 'figma',
    name: 'Figma',
    category: 'Design & Prototyping',
    icon: Figma,
    color: 'bg-purple-600',
    banner: 'https://placehold.co/1200x400/9333EA/ffffff?text=Figma+Design+Collaboration',
    description: 'Collaborative interface design tool for creating prototypes, wireframes, and design systems in real-time.',
    features: ['Real-time Collaboration', 'Prototyping', 'Design Systems', 'Component Libraries', 'Developer Handoff'],
    steps: [
      {
        title: 'Create a Design File',
        description: 'Start your design project',
        details: 'Click "New design file" in your project, name it appropriately. This creates a canvas where you can create frames and designs.'
      },
      {
        title: 'Create Frames',
        description: 'Set up screen layouts',
        details: 'Press "F" or select Frame tool, choose preset device sizes (Mobile, Tablet, Desktop) or create custom sizes for your screens.'
      },
      {
        title: 'Design Components',
        description: 'Build reusable design elements',
        details: 'Create buttons, cards, and UI elements. Right-click → "Create component" to make them reusable across your design.'
      },
      {
        title: 'Add Interactions',
        description: 'Create clickable prototypes',
        details: 'Switch to Prototype mode, connect frames by dragging between elements, set interaction type (on click, hover) and animation style.'
      },
      {
        title: 'Share & Collaborate',
        description: 'Get feedback from team',
        details: 'Click "Share" button, set permissions (view/edit), copy link. Team members can comment, inspect design specs, and export assets.'
      }
    ],
    videoId: 'dXQ7IHkTiMM',
    documentation: 'https://help.figma.com',
    tips: [
      'Use Auto Layout for responsive designs',
      'Create a design system with components',
      'Enable grid layouts for alignment',
      'Use plugins to boost productivity'
    ]
  },
  {
    id: 'slack',
    name: 'Slack',
    category: 'Communication',
    icon: MessageSquare,
    color: 'bg-pink-600',
    banner: 'https://placehold.co/1200x400/E01E5A/ffffff?text=Slack+Team+Communication',
    description: 'Streamline team communication with channels, direct messages, and integrations with your favorite tools.',
    features: ['Channels', 'Direct Messages', 'File Sharing', 'App Integrations', 'Video Calls'],
    steps: [
      {
        title: 'Create Workspace',
        description: 'Set up your team space',
        details: 'Visit slack.com, click "Create a new workspace", name your team, add your email, and invite team members to join.'
      },
      {
        title: 'Organize Channels',
        description: 'Create topic-based channels',
        details: 'Click "+" next to Channels, create channels like #general, #development, #design, #bugs. Use prefixes for organization.'
      },
      {
        title: 'Communicate Effectively',
        description: 'Use threads and mentions',
        details: 'Reply in threads to keep conversations organized, use @mentions to notify specific people, and react with emojis for quick feedback.'
      },
      {
        title: 'Share Files & Links',
        description: 'Collaborate on documents',
        details: 'Drag files into channels, share Google Drive links, pin important messages, and use snippets for code sharing.'
      },
      {
        title: 'Integrate Tools',
        description: 'Connect your workflow',
        details: 'Add apps like GitHub, Trello, Google Drive from App Directory. Get notifications and updates directly in Slack channels.'
      }
    ],
    videoId: 'EYqxQGmQkVw',
    documentation: 'https://slack.com/help',
    tips: [
      'Use threads to keep conversations organized',
      'Set status to show availability',
      'Create custom emojis for team culture',
      'Use /remind command for task reminders'
    ]
  },
  {
    id: 'mongodb',
    name: 'MongoDB Atlas',
    category: 'Database',
    icon: Database,
    color: 'bg-green-600',
    banner: 'https://placehold.co/1200x400/00684A/ffffff?text=MongoDB+Cloud+Database',
    description: 'Cloud database service for modern applications. Store and query data with flexible schema design.',
    features: ['Cloud Hosting', 'Flexible Schema', 'Powerful Queries', 'Real-time Analytics', 'Auto-scaling'],
    steps: [
      {
        title: 'Create Cluster',
        description: 'Set up your database',
        details: 'Sign up at mongodb.com/cloud/atlas, create a new cluster, choose free tier (M0), select cloud provider and region, and name your cluster.'
      },
      {
        title: 'Configure Access',
        description: 'Set up security',
        details: 'Add IP whitelist (allow 0.0.0.0/0 for development), create database user with username/password, and save credentials securely.'
      },
      {
        title: 'Connect Application',
        description: 'Get connection string',
        details: 'Click "Connect" → "Connect your application", copy connection string, replace <password> with your database password in your app.'
      },
      {
        title: 'Create Collections',
        description: 'Organize your data',
        details: 'In Collections tab, create database, add collections (like users, posts, products), and define your data structure.'
      },
      {
        title: 'Query Data',
        description: 'Read and write data',
        details: 'Use MongoDB Compass or code to insert documents, find data with queries, update records, and delete when needed.'
      }
    ],
    videoId: '084rmLU1UgA',
    documentation: 'https://docs.mongodb.com',
    tips: [
      'Use indexes for faster queries',
      'Design schema based on access patterns',
      'Enable backup for production data',
      'Monitor performance with Atlas dashboard'
    ]
  },
  {
    id: 'vercel',
    name: 'Vercel',
    category: 'Deployment',
    icon: Cloud,
    color: 'bg-black',
    banner: 'https://placehold.co/1200x400/000000/ffffff?text=Vercel+Deployment+Platform',
    description: 'Deploy your web applications instantly with automatic builds and global CDN. Perfect for React, Next.js, and more.',
    features: ['Instant Deployment', 'Automatic Builds', 'Custom Domains', 'Preview URLs', 'Analytics'],
    steps: [
      {
        title: 'Connect Repository',
        description: 'Link your GitHub project',
        details: 'Sign up at vercel.com, click "New Project", import your GitHub repository, and authorize Vercel to access it.'
      },
      {
        title: 'Configure Build',
        description: 'Set build settings',
        details: 'Vercel auto-detects framework, but you can customize build command, output directory, and environment variables in settings.'
      },
      {
        title: 'Deploy Project',
        description: 'Go live with one click',
        details: 'Click "Deploy" and Vercel builds your project. You get a unique URL instantly. Every push to main branch auto-deploys.'
      },
      {
        title: 'Add Custom Domain',
        description: 'Use your own domain',
        details: 'Go to Project Settings → Domains, add your domain, update DNS records at your domain registrar, and Vercel provides SSL automatically.'
      },
      {
        title: 'Monitor & Optimize',
        description: 'Track performance',
        details: 'Use Vercel Analytics to see visitor stats, check build logs for errors, and use preview deployments for testing before production.'
      }
    ],
    videoId: 'W_X0GiOburI',
    documentation: 'https://vercel.com/docs',
    tips: [
      'Enable automatic deployments for branches',
      'Use environment variables for secrets',
      'Check build logs if deployment fails',
      'Use preview URLs to test before merging'
    ]
  }
];

// Sidebar Component
const Sidebar = ({ selectedTool, setSelectedTool }) => (
  <motion.div 
    initial={{ x: -100, opacity: 0 }}
    animate={{ x: 0, opacity: 1 }}
    transition={{ duration: 0.5 }}
    className="w-72 bg-slate-900 p-6 flex flex-col shadow-2xl rounded-3xl m-4 sticky top-4 h-[calc(100vh-2rem)] overflow-y-auto"
  >
    <motion.div 
      className="mb-8"
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ delay: 0.2 }}
    >
      <div className="flex items-center space-x-3 mb-2">
        <motion.div 
          className="w-10 h-10 rounded-xl flex items-center justify-center bg-gradient-to-br from-purple-600 to-indigo-600 shadow-lg" 
          style={{ background: primaryColor }}
          whileHover={{ scale: 1.1, rotate: 10 }}
        >
          <Code className="w-6 h-6 text-white" />
        </motion.div>
        <div>
          <h1 className="text-xl font-extrabold text-white">ProjectCollab</h1>
          <p className="text-xs text-gray-400">Master collaboration tools</p>
        </div>
      </div>
    </motion.div>

    <div className="space-y-2 flex-1">
      <p className="text-xs font-semibold uppercase text-gray-400 pl-3 pt-2 pb-2">Collaboration Tools</p>
      {collaborationTools.map((tool, index) => (
        <motion.button
          key={tool.id}
          onClick={() => setSelectedTool(tool.id)}
          initial={{ x: -20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 0.3 + index * 0.1 }}
          whileHover={{ scale: 1.03, x: 5 }}
          whileTap={{ scale: 0.98 }}
          className={`w-full flex items-center space-x-3 p-4 rounded-2xl transition-all duration-300 group relative overflow-hidden ${
            selectedTool === tool.id
              ? 'bg-gradient-to-r from-slate-700 to-slate-600 text-white font-semibold shadow-xl'
              : 'text-gray-300 hover:bg-slate-800 hover:text-white'
          }`}
        >
          {selectedTool === tool.id && (
            <motion.div
              layoutId="activeTool"
              className="absolute inset-0 bg-gradient-to-r from-purple-600/20 to-indigo-600/20"
              initial={false}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
            />
          )}
          <tool.icon className={`w-5 h-5 relative z-10 ${selectedTool === tool.id ? 'text-white' : 'text-gray-400 group-hover:text-white'}`} />
          <div className="flex-1 text-left relative z-10">
            <span className="block text-sm font-semibold">{tool.name}</span>
            <span className="text-xs text-gray-400">{tool.category}</span>
          </div>
          {selectedTool === tool.id && <ChevronRight className="w-4 h-4 relative z-10" />}
        </motion.button>
      ))}
    </div>

    <div className="mt-6 p-4 bg-slate-800 rounded-xl border border-slate-700">
      <p className="text-xs text-gray-400 mb-2">Need Help?</p>
      <a href="#support" className="text-sm font-medium text-purple-400 hover:text-purple-300 flex items-center space-x-1">
        <BookOpen className="w-4 h-4" />
        <span>View Documentation</span>
      </a>
    </div>
  </motion.div>
);

// Tool Detail Component
const ToolDetail = ({ tool }) => {
  const [activeStep, setActiveStep] = useState(0);

  return (
    <motion.div 
      key={tool.id}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
      className="p-6 pt-4 space-y-6"
    >
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeIn { animation: fadeIn 0.5s ease-out forwards; }
      `}</style>

      {/* Banner Section */}
      <motion.div 
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.1 }}
        className="relative rounded-3xl overflow-hidden shadow-2xl border border-gray-100"
      >
        <img 
          src={tool.banner} 
          alt={`${tool.name} banner`}
          className="w-full h-64 object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent flex items-end">
          <div className="p-8 text-white w-full">
            <div className="flex items-center space-x-4 mb-3">
              <div className={`p-3 rounded-xl ${tool.color}`}>
                <tool.icon className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-4xl font-bold">{tool.name}</h1>
                <p className="text-sm text-gray-200">{tool.category}</p>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Overview Section */}
      <motion.div 
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="bg-white rounded-3xl shadow-xl p-8 border border-gray-100"
      >
        <h2 className="text-2xl font-bold text-gray-800 mb-4">Overview</h2>
        <p className="text-gray-600 text-lg leading-relaxed mb-6">{tool.description}</p>
        
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
          {tool.features.map((feature, idx) => (
            <motion.div 
              key={idx} 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.3 + idx * 0.05 }}
              whileHover={{ scale: 1.05, boxShadow: "0 4px 15px rgba(125, 90, 254, 0.2)" }}
              className="flex items-center space-x-2 p-3 bg-purple-50 rounded-xl border border-purple-100 cursor-default"
            >
              <CheckCircle className="w-4 h-4 text-purple-600 flex-shrink-0" />
              <span className="text-sm font-medium text-gray-700">{feature}</span>
            </motion.div>
          ))}
        </div>

        <div className="mt-6 flex space-x-3">
          <motion.a 
            href={tool.documentation}
            target="_blank"
            rel="noopener noreferrer"
            whileHover={{ y: -2 }}
            whileTap={{ scale: 0.98 }}
            className="flex items-center space-x-2 px-5 py-2.5 bg-gray-100 hover:bg-gray-200 rounded-xl font-medium text-gray-700 transition duration-200 shadow-sm"
          >
            <ExternalLink className="w-4 h-4" />
            <span>Official Docs</span>
          </motion.a>
        </div>
      </motion.div>

      {/* Step-by-Step Guide */}
      <motion.div 
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="bg-white rounded-3xl shadow-xl p-8 border border-gray-100"
      >
        <h2 className="text-2xl font-bold text-gray-800 mb-6">Step-by-Step Guide</h2>
        
        {/* Step Progress Indicator */}
        <div className="flex items-center mb-8 overflow-x-auto pb-2">
          {tool.steps.map((step, idx) => (
            <React.Fragment key={idx}>
              <motion.button
                onClick={() => setActiveStep(idx)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className={`flex items-center space-x-2 px-4 py-2 rounded-xl whitespace-nowrap transition-all duration-300 shadow-md ${
                  activeStep === idx
                    ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-semibold'
                    : activeStep > idx
                    ? 'bg-green-100 text-green-700 hover:bg-green-200'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                <span className="font-bold">{idx + 1}</span>
                <span className="text-sm font-medium hidden sm:inline">{step.title}</span>
              </motion.button>
              {idx < tool.steps.length - 1 && (
                <ArrowRight className="w-5 h-5 text-gray-300 mx-2 flex-shrink-0" />
              )}
            </React.Fragment>
          ))}
        </div>

        {/* Active Step Content */}
        <div className="border-l-4 border-purple-600 pl-6 py-4 bg-purple-50 rounded-r-xl">
          <h3 className="text-xl font-bold text-gray-800 mb-2">
            Step {activeStep + 1}: {tool.steps[activeStep].title}
          </h3>
          <p className="text-gray-600 mb-3">{tool.steps[activeStep].description}</p>
          <p className="text-gray-700 leading-relaxed bg-white p-4 rounded-lg border border-purple-100 shadow-inner">
            {tool.steps[activeStep].details}
          </p>
        </div>

        {/* Navigation Buttons */}
        <div className="flex justify-between mt-6">
          <motion.button
            onClick={() => setActiveStep(Math.max(0, activeStep - 1))}
            disabled={activeStep === 0}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="px-5 py-2.5 rounded-xl border border-gray-300 text-gray-700 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition duration-200 shadow-sm"
          >
            Previous Step
          </motion.button>
          <motion.button
            onClick={() => setActiveStep(Math.min(tool.steps.length - 1, activeStep + 1))}
            disabled={activeStep === tool.steps.length - 1}
            whileHover={{ scale: activeStep === tool.steps.length - 1 ? 1 : 1.05 }}
            whileTap={{ scale: activeStep === tool.steps.length - 1 ? 1 : 0.95 }}
            className="px-5 py-2.5 rounded-xl text-white font-medium transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-md"
            style={{ backgroundColor: activeStep === tool.steps.length - 1 ? '#9CA3AF' : primaryColor }}
          >
            {activeStep === tool.steps.length - 1 ? 'Completed!' : 'Next Step'}
          </motion.button>
        </div>
      </motion.div>

      {/* Video and Pro Tips Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Video Tutorial */}
        <motion.div 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="bg-white rounded-3xl shadow-xl p-8 border border-gray-100"
        >
          <div className="flex items-center space-x-2 mb-4">
            <Play className="w-6 h-6 text-red-600" />
            <h2 className="text-2xl font-bold text-gray-800">Video Tutorial</h2>
          </div>
          <motion.div 
            whileHover={{ scale: 1.02 }}
            className="aspect-video rounded-xl overflow-hidden shadow-lg cursor-pointer"
          >
            <iframe
              width="100%"
              height="100%"
              src={`https://www.youtube.com/embed/${tool.videoId}`}
              title={`${tool.name} Tutorial`}
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              className="w-full h-full"
            ></iframe>
          </motion.div>
        </motion.div>

        {/* Pro Tips */}
        <motion.div 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="bg-gradient-to-br from-purple-50 to-indigo-50 rounded-3xl shadow-xl p-8 border-2 border-purple-200"
        >
          <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center space-x-2">
            <Layout className="w-6 h-6 text-purple-600" />
            <span>Pro Tips</span>
          </h2>
          <div className="space-y-3">
            {tool.tips.map((tip, idx) => (
              <motion.div 
                key={idx} 
                initial={{ x: -10, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.6 + idx * 0.05 }}
                whileHover={{ scale: 1.02, x: 5 }}
                className="flex items-start space-x-3 p-4 bg-white rounded-xl shadow-sm border border-gray-100"
              >
                <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                <p className="text-gray-700">{tip}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
};

// Main App Component
const App = () => {
  const [selectedTool, setSelectedTool] = useState('github');

  const currentTool = collaborationTools.find(tool => tool.id === selectedTool);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-purple-50 to-indigo-50 font-sans">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap');
        body { font-family: 'Inter', sans-serif; }
      `}</style>
      
      <div className="flex">
        <Sidebar selectedTool={selectedTool} setSelectedTool={setSelectedTool} />
        
        <div className="flex-1 min-w-0 overflow-hidden">
          <AnimatePresence mode="wait">
            {currentTool && <ToolDetail tool={currentTool} />}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

export default App;
