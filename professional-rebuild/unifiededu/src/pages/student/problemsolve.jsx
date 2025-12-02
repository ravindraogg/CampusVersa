import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Code2, Globe, Terminal, Cpu, Award, BookOpen, 
  ExternalLink, CheckCircle, ArrowRight, Play, ChevronRight, 
  Flame, Swords, Database, Layout, Star, Trophy, Target
} from 'lucide-react';

// --- BRANDING COLORS & DATA ---
const primaryColor = '#7D5AFE';

// Data: Coding Platforms for Students
const codingPlatforms = [
  {
    id: 'leetcode',
    name: 'LeetCode',
    category: 'Interview Prep & DSA',
    icon: Code2,
    color: 'bg-yellow-600',
    banner: 'https://placehold.co/1200x400/FFA116/ffffff?text=LeetCode+Mastery',
    link: 'https://leetcode.com/',
    description: 'The industry standard for technical interview preparation. LeetCode offers a massive collection of algorithmic problems used by top tech companies like Google, Amazon, and Meta.',
    features: ['Top Interview Questions', 'Daily Challenges', 'Contests', 'Detailed Editorials', 'Company-Specific Tags'],
    steps: [
      {
        title: 'Create an Account',
        description: 'Sign up to track progress.',
        details: 'Go to LeetCode.com and sign up. It saves your submissions and tracks your acceptance rate, which is crucial for motivation.'
      },
      {
        title: 'Start with "Easy"',
        description: 'Build confidence first.',
        details: 'Filter problems by "Difficulty: Easy" and "Topic: Array". Solve the "Two Sum" problem to get a feel for the platform.'
      },
      {
        title: 'Follow a Study Plan',
        description: 'Structured learning path.',
        details: 'Navigate to the "Study Plan" section. Start with "LeetCode 75" or "Top Interview 150" to cover essential patterns systematically.'
      },
      {
        title: 'Participate in Contests',
        description: 'Test speed and accuracy.',
        details: 'Join the Weekly Contest (Sundays). It simulates real interview pressure with a timer and new unseen problems.'
      }
    ],
    videoId: '95ZtPsM1pIg', // Placeholder ID for a "How to use LeetCode" video
    tips: [
      'Don\'t give up if you can\'t solve it immediately; try for 20 mins then read the solution.',
      'Focus on "Patterns" (Sliding Window, Two Pointers) rather than memorizing code.',
      'Always analyze the Time and Space Complexity of your solution.'
    ]
  },
  {
    id: 'codechef',
    name: 'CodeChef',
    category: 'Competitive Programming',
    icon: Trophy,
    color: 'bg-amber-800', // Brownish for CodeChef
    banner: 'https://placehold.co/1200x400/5B4638/ffffff?text=CodeChef+Competitions',
    link: 'https://www.codechef.com/',
    description: 'A platform dedicated to competitive programming. Known for its intense contests (Starters, Long Challenges) and a vibrant community of problem solvers.',
    features: ['Monthly Contests', 'Star Ratings', 'Discuss Forums', 'Problem Sets by Difficulty', 'Certifications'],
    steps: [
      {
        title: 'Register & Setup',
        description: 'Join the chefs.',
        details: 'Create an account. Set up your IDE preferences. CodeChef supports over 50+ programming languages.'
      },
      {
        title: 'Practice Section',
        description: 'Beginner friendly start.',
        details: 'Go to "Practice" -> "Beginner". Solve problems with high submission counts to build momentum.'
      },
      {
        title: 'Join "Starters"',
        description: 'Rated contests for all.',
        details: 'Participate in "Starters" contests (Wednesdays). These are specifically designed for beginners to start their rating journey.'
      },
      {
        title: 'Upsolve',
        description: 'Learn from mistakes.',
        details: 'After every contest, solve the problems you couldn\'t solve during the contest using the editorials. This is how you grow.'
      }
    ],
    videoId: 'qM7_-i77FpM', 
    tips: [
      'Focus on mathematics and logic building.',
      'Read the problem statement very carefully; edge cases are tricky here.',
      'Aim to increase your "Star Rating" to demonstrate proficiency.'
    ]
  },
  {
    id: 'gfg',
    name: 'GeeksforGeeks',
    category: 'Computer Science Core',
    icon: BookOpen,
    color: 'bg-green-600',
    banner: 'https://placehold.co/1200x400/2F8D46/ffffff?text=GeeksforGeeks+Learn',
    link: 'https://www.geeksforgeeks.org/',
    description: 'A massive library of articles and practice problems covering everything from Data Structures to System Design. It is the Wikipedia of coding interview prep.',
    features: ['Topic-wise Articles', 'Practice Portal', 'Company Archives', 'Structured Courses', 'Interview Experiences'],
    steps: [
      {
        title: 'Read Articles',
        description: 'Understand concepts first.',
        details: 'Search for any topic (e.g., "Linked List"). Read the detailed article explanation before jumping into code.'
      },
      {
        title: 'Practice Portal',
        description: 'Apply what you learned.',
        details: 'Go to practice.geeksforgeeks.org. Filter by company (e.g., Amazon, Microsoft) to see what they ask.'
      },
      {
        title: 'Problem of the Day',
        description: 'Consistency is key.',
        details: 'Solve the POTD (Problem of the Day) to earn Geek Bits and keep your streak alive.'
      }
    ],
    videoId: 'H_1xM-8t6e4', 
    tips: [
      'Use GFG to read "Interview Experiences" of others.',
      'Great for learning standard algorithms (Sorting, Searching) implementation.',
      'Their "Must Do Coding Questions" list is legendary.'
    ]
  },
  {
    id: 'freecodecamp',
    name: 'freeCodeCamp',
    category: 'Web Development',
    icon: Flame,
    color: 'bg-slate-900',
    banner: 'https://placehold.co/1200x400/0a0a23/ffffff?text=freeCodeCamp+Certifications',
    link: 'https://www.freecodecamp.org/',
    description: 'A non-profit interactive learning web platform. It offers free certifications in Responsive Web Design, JavaScript Algorithms, Python, and more.',
    features: ['Free Certifications', 'Interactive Editor', 'Project-Based Learning', 'Huge YouTube Library', 'Forum Support'],
    steps: [
      {
        title: 'Choose a Path',
        description: 'Pick a certification.',
        details: 'We recommend starting with "Responsive Web Design" if you are new, or "JavaScript Algorithms" if you know HTML/CSS.'
      },
      {
        title: 'Complete Challenges',
        description: 'Small, bite-sized lessons.',
        details: 'Read the lesson on the left, write code in the middle, and see the output on the right. Pass tests to move forward.'
      },
      {
        title: 'Build Projects',
        description: 'Prove your skills.',
        details: 'To claim a certificate, you must build 5 required projects from scratch. This builds your portfolio.'
      }
    ],
    videoId: 'n2ieIzp95uA', 
    tips: [
      'Don\'t skip the projects; they are the most valuable part.',
      'Use their forum if you get stuck; the community is very helpful.',
      'Add the certifications to your LinkedIn profile.'
    ]
  },
  {
    id: 'codewars',
    name: 'Codewars',
    category: 'Gamified Practice',
    icon: Swords,
    color: 'bg-red-700',
    banner: 'https://placehold.co/1200x400/B1361E/ffffff?text=Codewars+Dojo',
    link: 'https://www.codewars.com/',
    description: 'Improve your skills by training with others on real code challenges. It is highly gamified with ranks (Kyu) and honor points.',
    features: ['Community Solutions', 'Kata (Challenges)', 'Rank System (Kyu)', 'Multiple Languages', 'Test Driven Dev'],
    steps: [
      {
        title: 'Initiation',
        description: 'Prove you are a coder.',
        details: 'To sign up, you must solve a simple debug challenge in your chosen language.'
      },
      {
        title: 'Train on Kata',
        description: 'Solve challenges.',
        details: 'Choose a "Kata" (problem). 8 Kyu is easiest, 1 Kyu is hardest. Solve it to gain Honor.'
      },
      {
        title: 'Compare Solutions',
        description: 'Best feature of Codewars.',
        details: 'After solving, you can see how *others* solved it. This is amazing for learning one-liners and best practices.'
      }
    ],
    videoId: '241j_eWJb-I', 
    tips: [
      'Look at the "Best Practices" solution after every problem.',
      'Great for mastering language syntax and standard libraries.',
      'Fun way to take a break from serious DSA grinding.'
    ]
  },
  {
    id: 'hackerrank',
    name: 'HackerRank',
    category: 'Skill Verification',
    icon: Terminal,
    color: 'bg-green-700',
    banner: 'https://placehold.co/1200x400/2EC866/ffffff?text=HackerRank+Skills',
    link: 'https://www.hackerrank.com/',
    description: ' widely used by companies for technical assessments. It offers specialized kits like the "Interview Preparation Kit" and domain-specific practice (SQL, AI).',
    features: ['Skill Badges', 'Interview Prep Kit', 'SQL Practice', 'Jobs Board', 'Contests'],
    steps: [
      {
        title: 'Earn Badges',
        description: 'Get verified.',
        details: 'Solve challenges in "Problem Solving" or "Python" to earn stars (Gold/Silver/Bronze) and badges for your resume.'
      },
      {
        title: 'Interview Prep Kit',
        description: 'Curated list.',
        details: 'Go to the "Interview Preparation Kit". It has curated challenges sorted by topic (Arrays, Dicts, Graphs).'
      },
      {
        title: 'Learn SQL',
        description: 'Best place for SQL.',
        details: 'HackerRank has one of the best SQL practice sections for beginners. Highly recommended for backend roles.'
      }
    ],
    videoId: 'JbQzXh60K1o', 
    tips: [
      'Get your "Problem Solving (Intermediate)" certificate.',
      'Many companies use HackerRank for OA (Online Assessments), so getting familiar with the UI is helpful.'
    ]
  }
];

// --- COMPONENTS ---

// Sidebar Navigation
const Sidebar = ({ selectedPlatform, setSelectedPlatform }) => (
  <motion.div 
    initial={{ x: -100, opacity: 0 }}
    animate={{ x: 0, opacity: 1 }}
    transition={{ duration: 0.5 }}
    className="w-full md:w-80 bg-slate-900 p-6 flex flex-col shadow-2xl md:rounded-3xl md:m-4 md:h-[calc(100vh-2rem)] sticky top-0 md:top-4 z-20"
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
          whileHover={{ scale: 1.1, rotate: 10 }}
        >
          <Code2 className="w-6 h-6 text-white" />
        </motion.div>
        <div>
          <h1 className="text-xl font-extrabold text-white">Problem Solving</h1>
          <p className="text-xs text-gray-400">Coding Practice Hub</p>
        </div>
      </div>
    </motion.div>

    <div className="space-y-2 flex-1 overflow-y-auto pr-2 custom-scrollbar">
      <p className="text-xs font-semibold uppercase text-gray-400 pl-3 pt-2 pb-2">Platforms</p>
      {codingPlatforms.map((platform, index) => (
        <motion.button
          key={platform.id}
          onClick={() => setSelectedPlatform(platform.id)}
          initial={{ x: -20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 0.3 + index * 0.1 }}
          whileHover={{ scale: 1.03, x: 5 }}
          whileTap={{ scale: 0.98 }}
          className={`w-full flex items-center space-x-3 p-4 rounded-2xl transition-all duration-300 group relative overflow-hidden text-left ${
            selectedPlatform === platform.id
              ? 'bg-gradient-to-r from-slate-700 to-slate-600 text-white font-semibold shadow-xl'
              : 'text-gray-300 hover:bg-slate-800 hover:text-white'
          }`}
        >
          {selectedPlatform === platform.id && (
            <motion.div
              layoutId="activeTool"
              className="absolute inset-0 bg-gradient-to-r from-purple-600/20 to-indigo-600/20"
              initial={false}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
            />
          )}
          <platform.icon className={`w-5 h-5 relative z-10 ${selectedPlatform === platform.id ? 'text-white' : 'text-gray-400 group-hover:text-white'}`} />
          <div className="flex-1 relative z-10">
            <span className="block text-sm font-semibold">{platform.name}</span>
            <span className="text-[10px] text-gray-400 uppercase tracking-wider">{platform.category}</span>
          </div>
          {selectedPlatform === platform.id && <ChevronRight className="w-4 h-4 relative z-10" />}
        </motion.button>
      ))}
    </div>
  </motion.div>
);

// Detail View
const PlatformDetail = ({ platform }) => {
  const [activeTab, setActiveTab] = useState('overview'); // overview | steps

  return (
    <motion.div 
      key={platform.id}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
      className="p-4 md:p-8 space-y-6 md:space-y-8 max-w-7xl mx-auto"
    >
      {/* Dynamic Header Banner */}
      <motion.div 
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.1 }}
        className="relative rounded-3xl overflow-hidden shadow-2xl border border-gray-100 group"
      >
        <div className={`absolute inset-0 ${platform.color} opacity-90 mix-blend-multiply`}></div>
        <img 
          src={platform.banner} 
          alt={`${platform.name} banner`}
          className="w-full h-48 md:h-64 object-cover grayscale group-hover:grayscale-0 transition-all duration-700"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent flex items-end">
          <div className="p-6 md:p-10 text-white w-full flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-white/10 backdrop-blur-md rounded-2xl border border-white/20">
                <platform.icon className="w-8 h-8 md:w-12 md:h-12 text-white" />
              </div>
              <div>
                <h1 className="text-3xl md:text-5xl font-bold tracking-tight">{platform.name}</h1>
                <p className="text-sm md:text-base text-gray-200 mt-1 font-medium bg-white/10 inline-block px-3 py-1 rounded-full">{platform.category}</p>
              </div>
            </div>
            
            <motion.a
              href={platform.link}
              target="_blank"
              rel="noopener noreferrer"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="flex items-center space-x-2 px-6 py-3 bg-white text-gray-900 rounded-xl font-bold shadow-lg hover:shadow-white/25 transition-all"
            >
              <span>Visit Platform</span>
              <ExternalLink className="w-4 h-4" />
            </motion.a>
          </div>
        </div>
      </motion.div>

      {/* Main Content Area */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column: Description & Features */}
        <div className="lg:col-span-2 space-y-6">
          <motion.div 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-3xl shadow-xl p-8 border border-gray-100"
          >
            <div className="flex items-center space-x-2 mb-4">
              <Globe className="w-5 h-5 text-purple-600" />
              <h2 className="text-xl font-bold text-gray-800">What is {platform.name}?</h2>
            </div>
            <p className="text-gray-600 text-lg leading-relaxed mb-8">
              {platform.description}
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {platform.features.map((feature, idx) => (
                <div key={idx} className="flex items-center space-x-3 p-3 bg-slate-50 rounded-xl border border-slate-100 hover:border-purple-200 transition-colors">
                  <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                  <span className="font-medium text-gray-700">{feature}</span>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Step by Step Guide */}
          <motion.div 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="bg-white rounded-3xl shadow-xl p-8 border border-gray-100"
          >
            <div className="flex items-center space-x-2 mb-6">
              <Target className="w-5 h-5 text-red-500" />
              <h2 className="text-xl font-bold text-gray-800">How to Start</h2>
            </div>
            
            <div className="space-y-6 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-slate-300 before:to-transparent">
              {platform.steps.map((step, idx) => (
                <div key={idx} className="relative flex items-start group is-active">
                  <div className="absolute left-0 ml-5 -translate-x-1/2 translate-y-0.5 w-4 h-4 rounded-full border-4 border-white bg-slate-300 group-hover:bg-purple-500 transition-colors shadow-sm"></div>
                  <div className="ml-10 w-full">
                    <h3 className="text-lg font-bold text-gray-900">{idx + 1}. {step.title}</h3>
                    <p className="text-sm font-medium text-purple-600 mb-1">{step.description}</p>
                    <p className="text-gray-600 text-sm leading-relaxed bg-slate-50 p-3 rounded-lg border border-slate-100 mt-2">
                      {step.details}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Right Column: Tips & Advice */}
        <div className="lg:col-span-1 space-y-6">
          {/* Pro Tips */}
          <motion.div 
            initial={{ x: 20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="bg-gradient-to-br from-indigo-900 to-slate-900 text-white rounded-3xl shadow-2xl p-6 border border-indigo-700 relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 -mt-4 -mr-4 w-24 h-24 bg-purple-500 blur-3xl rounded-full opacity-50"></div>
            
            <div className="flex items-center space-x-2 mb-6 relative z-10">
              <Star className="w-5 h-5 text-yellow-400 fill-yellow-400" />
              <h2 className="text-lg font-bold">Pro Tips for Students</h2>
            </div>

            <div className="space-y-4 relative z-10">
              {platform.tips.map((tip, idx) => (
                <div key={idx} className="flex items-start space-x-3">
                  <div className="w-1.5 h-1.5 rounded-full bg-purple-400 mt-2 flex-shrink-0"></div>
                  <p className="text-indigo-100 text-sm leading-relaxed">{tip}</p>
                </div>
              ))}
            </div>
            
            <div className="mt-8 pt-6 border-t border-indigo-800/50">
              <p className="text-xs text-indigo-300 italic">
                "Consistency is more important than intensity. Practice daily."
              </p>
            </div>
          </motion.div>

          {/* Quick Stats or Placeholder Visual */}
          <motion.div 
             initial={{ x: 20, opacity: 0 }}
             animate={{ x: 0, opacity: 1 }}
             transition={{ delay: 0.5 }}
             className="bg-white rounded-3xl shadow-lg p-6 border border-gray-100 flex flex-col items-center text-center"
          >
             <Trophy className="w-12 h-12 text-yellow-500 mb-3" />
             <h3 className="font-bold text-gray-800">Gamify Learning</h3>
             <p className="text-sm text-gray-500 mt-2 mb-4">Most of these platforms use streaks and ratings. Use them to your advantage!</p>
             <div className="w-full bg-gray-100 rounded-full h-2.5 dark:bg-gray-700">
                <div className="bg-purple-600 h-2.5 rounded-full" style={{ width: '70%' }}></div>
             </div>
             <p className="text-xs text-gray-400 mt-2 self-end">Your Potential</p>
          </motion.div>

        </div>
      </div>
    </motion.div>
  );
};

// --- MAIN LAYOUT ---
const ProjectColab = () => {
  const [selectedPlatform, setSelectedPlatform] = useState('leetcode');

  const currentPlatform = codingPlatforms.find(p => p.id === selectedPlatform);

  return (
    <div className="min-h-screen bg-slate-50 font-sans flex flex-col md:flex-row">
      {/* Sidebar Navigation */}
      <Sidebar selectedPlatform={selectedPlatform} setSelectedPlatform={setSelectedPlatform} />
      
      {/* Main Content Area */}
      <div className="flex-1 min-w-0 overflow-y-auto h-screen scroll-smooth">
        <AnimatePresence mode="wait">
          {currentPlatform && <PlatformDetail platform={currentPlatform} />}
        </AnimatePresence>
        
        {/* Footer */}
        <div className="p-8 text-center text-gray-400 text-sm">
          <p>Remember: Tools don't make the developer. Practice does.</p>
        </div>
      </div>
    </div>
  );
};

export default ProjectColab;