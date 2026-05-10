import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Brain, Mic, Play, Clock, BarChart, FileText, CheckCircle, ArrowRight, XCircle, ChevronRight, Sparkles, Trophy, Target, Zap, TrendingUp, Code
} from 'lucide-react';

// Mock Data for different job roles and question types
const interviewData = {
  'Software Engineer': {
    aiInterview: {
      questions: [
        { id: 1, text: "Explain the difference between a process and a thread.", type: "technical" },
        { id: 2, text: "Tell me about a time you faced a difficult bug. How did you solve it?", type: "behavioral" },
        { id: 3, text: "What is polymorphism? Give a real-world example.", type: "technical" },
        { id: 4, text: "Describe a project you are proud of. What was your role?", type: "behavioral" }
      ],
      tips: [
        'Speak clearly and at a moderate pace.',
        'Use the STAR method for behavioral questions.',
        'If you don\'t know the answer, explain your thought process.',
        'Practice with common technical concepts for your role.'
      ]
    },
    aptitudeTest: {
      questions: [
        { id: 101, text: "If a train traveling at 60 km/h crosses a pole in 9 seconds, what is the length of the train?", section: "Quantitative Aptitude", answer: "150m", options: ["120m", "150m", "180m", "200m"] },
        { id: 102, text: "Find the odd one out: Car, Bus, Bicycle, Truck.", section: "Logical Reasoning", answer: "Bicycle", options: ["Car", "Bus", "Bicycle", "Truck"] },
        { id: 103, text: "Choose the synonym for 'Abundant'.", section: "Verbal Ability", answer: "Plentiful", options: ["Scarce", "Plentiful", "Rare", "Limited"] }
      ]
    },
    mockTest: {
      name: 'Data Structures & Algorithms',
      questions: [
        { id: 201, text: "What is the time complexity of binary search?", options: ["O(n)", "O(log n)", "O(n^2)", "O(n log n)"], answer: "O(log n)" },
        { id: 202, text: "Which data structure uses a LIFO principle?", options: ["Queue", "Stack", "Array", "Linked List"], answer: "Stack" },
        { id: 203, text: "Explain the concept of a hash collision.", options: [], answer: "", type: "descriptive" },
        { id: 204, text: "Write a function to reverse a linked list.", options: [], answer: "", type: "coding" }
      ],
      progress: {
        accuracy: '85%',
        timePerQuestion: '2.5 min'
      }
    }
  },
  'Data Analyst': {
    aiInterview: {
      questions: [
        { id: 1, text: "Explain the difference between supervised and unsupervised learning.", type: "technical" },
        { id: 2, text: "Describe a time you used data to influence a business decision.", type: "behavioral" }
      ],
      tips: [
        'Be prepared to discuss your portfolio projects in detail.',
        'Demonstrate an understanding of statistical concepts.',
        'Clearly articulate your problem-solving process.'
      ]
    },
    aptitudeTest: {
      questions: [
        { id: 101, text: "Calculate the median of the following dataset: 5, 8, 12, 4, 7.", section: "Quantitative Aptitude", answer: "7", options: ["5", "7", "8", "12"] },
        { id: 102, text: "In a code language, if FAME is coded as 4583, how is FUME coded?", section: "Logical Reasoning", answer: "4683", options: ["4583", "4683", "4386", "3458"] }
      ]
    },
    mockTest: {
      name: 'SQL & Database Concepts',
      questions: [
        { id: 201, text: "What is the primary key in a database?", options: ["A unique identifier", "A foreign key", "A common field"], answer: "A unique identifier" }
      ],
      progress: {
        accuracy: '92%',
        timePerQuestion: '1.8 min'
      }
    }
  },
  'Product Manager': {
    aiInterview: {
      questions: [
        { id: 1, text: "How would you improve the user experience of a popular app like Spotify?", type: "product strategy" },
        { id: 2, text: "Tell me about a time you had to say 'no' to a feature request from a key stakeholder.", type: "behavioral" }
      ],
      tips: [
        'Focus on user-centric problem-solving.',
        'Use frameworks like AARRR or HEART.',
        'Be ready to discuss trade-offs and prioritization.'
      ]
    },
    aptitudeTest: {
      questions: [
        { id: 101, text: "What is the next number in the series: 1, 4, 9, 16, ...", section: "Logical Reasoning", answer: "25", options: ["20", "25", "36", "49"] }
      ]
    },
    mockTest: {
      name: 'Product Management Fundamentals',
      questions: [
        { id: 201, text: "What does MVP stand for in product development?", options: ["Minimum Viable Product", "Most Valuable Player", "Main Product Vision"], answer: "Minimum Viable Product" }
      ],
      progress: {
        accuracy: '78%',
        timePerQuestion: '3.1 min'
      }
    }
  }
};

const mockSections = [
  { id: 'aiInterview', title: 'AI Interview', icon: Mic, description: 'Simulate real interviews with AI-generated questions.', gradient: 'from-purple-500 to-indigo-600' },
  { id: 'aptitudeTest', title: 'Aptitude Tests', icon: Clock, description: 'Timed tests on logical, verbal, and quant skills.', gradient: 'from-green-500 to-emerald-600' },
  { id: 'mockTest', title: 'General Tests', icon: FileText, description: 'Subject-specific mock tests with progress tracking.', gradient: 'from-blue-500 to-cyan-600' }
];

// --- Test Questions Component ---

const TestQuestions = ({ questions, testType, onFinish, theme }) => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [isSubmitted, setIsSubmitted] = useState(false);

  const currentQuestion = questions[currentQuestionIndex];
  const primaryColor = theme?.primary || '#7D5AFE';

  const handleAnswerChange = (questionId, value) => {
    setAnswers({
      ...answers,
      [questionId]: value,
    });
  };

  const handleSubmit = () => {
    setIsSubmitted(true);
  };

  const isCorrect = (question) => {
    if (question.type === "descriptive" || question.type === "coding") return null;
    return String(answers[question.id]).toLowerCase() === String(question.answer).toLowerCase();
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-3xl shadow-2xl p-4 md:p-8 border border-gray-100"
    >
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 border-b pb-4 gap-4">
        <div className="flex items-center space-x-3">
          <motion.div 
            className="w-10 h-10 md:w-12 md:h-12 rounded-2xl flex items-center justify-center flex-shrink-0"
            style={{ backgroundColor: primaryColor }}
            whileHover={{ scale: 1.05, rotate: 5 }}
          >
            <FileText className="w-5 h-5 md:w-6 md:h-6 text-white" />
          </motion.div>
          <div>
            <h2 className="text-xl md:text-2xl font-bold text-gray-800">{testType}</h2>
            <p className="text-xs md:text-sm text-gray-500">Question {currentQuestionIndex + 1} of {questions.length}</p>
          </div>
        </div>
        <motion.button 
          onClick={onFinish}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="w-full md:w-auto flex items-center justify-center space-x-2 px-5 py-2.5 bg-gradient-to-r from-red-500 to-rose-600 text-white rounded-xl hover:shadow-lg transition-all duration-200 shadow-md"
        >
          <XCircle className="w-5 h-5" />
          <span className="font-medium">Exit Test</span>
        </motion.button>
      </div>

      <div className="flex flex-col md:flex-row md:space-x-6 gap-6 md:gap-0">
        {/* Question Navigation Sidebar */}
        <motion.div 
          initial={{ x: -20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="w-full md:w-1/4 bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl p-5 border border-gray-200 order-2 md:order-1"
        >
          <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center space-x-2">
            <Target className="w-5 h-5" style={{ color: primaryColor }} />
            <span>Progress</span>
          </h3>
          <div className="grid grid-cols-5 sm:grid-cols-6 md:grid-cols-3 lg:grid-cols-4 gap-2">
            {questions.map((q, index) => (
              <motion.button
                key={q.id}
                onClick={() => setCurrentQuestionIndex(index)}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-sm transition-all duration-200 shadow-sm
                  ${index === currentQuestionIndex ? 'text-white shadow-lg ring-2' :
                     isSubmitted && isCorrect(q) ? 'bg-gradient-to-br from-green-500 to-emerald-600 text-white shadow-md' :
                     isSubmitted && answers[q.id] && isCorrect(q) === false ? 'bg-gradient-to-br from-red-500 to-rose-600 text-white shadow-md' :
                     answers[q.id] ? 'bg-gray-400 text-white shadow-sm' : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-300'
                  }`}
                style={index === currentQuestionIndex ? { backgroundColor: primaryColor, ringColor: primaryColor } : {}}
              >
                {index + 1}
              </motion.button>
            ))}
          </div>
          {isSubmitted && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-6 p-4 rounded-xl bg-white shadow-md border border-gray-200"
            >
              <p className="text-sm text-gray-700 font-bold mb-3 flex items-center space-x-2">
                <Sparkles className="w-4 h-4" style={{ color: primaryColor }} />
                <span>Legend</span>
              </p>
              {/* Legend Items */}
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 rounded-lg bg-green-500"></div>
                  <span className="text-xs text-gray-600">Correct</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 rounded-lg bg-red-500"></div>
                  <span className="text-xs text-gray-600">Incorrect</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 rounded-lg bg-gray-400"></div>
                  <span className="text-xs text-gray-600">Attempted</span>
                </div>
              </div>
            </motion.div>
          )}
        </motion.div>

        {/* Question Content */}
        <motion.div 
          initial={{ x: 20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="w-full md:w-3/4 order-1 md:order-2"
        >
          <AnimatePresence mode="wait">
            <motion.div 
              key={currentQuestionIndex}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="p-5 md:p-7 bg-gradient-to-br from-gray-50 via-white to-gray-100 rounded-2xl mb-6 border border-gray-200 shadow-sm"
            >
              <div className="flex flex-wrap items-center justify-between mb-4 gap-2">
                <h3 className="text-lg md:text-xl font-bold text-gray-800">Question {currentQuestionIndex + 1}</h3>
                <motion.div 
                  whileHover={{ scale: 1.05 }}
                  className="px-3 py-1 bg-gray-100 rounded-full text-xs md:text-sm font-semibold flex items-center space-x-1"
                  style={{ color: primaryColor }}
                >
                  {currentQuestion.type === 'coding' && <Code className="w-4 h-4" />}
                  {currentQuestion.type === 'descriptive' && <FileText className="w-4 h-4" />}
                  {(currentQuestion.type === 'coding' || currentQuestion.type === 'descriptive') ? currentQuestion.type : 'Multiple Choice'}
                </motion.div>
              </div>
              <p className="text-gray-700 text-base md:text-lg leading-relaxed">{currentQuestion.text}</p>
            </motion.div>
          </AnimatePresence>

          {/* Options/Input Area */}
          {currentQuestion.options && currentQuestion.options.length > 0 ? (
            <div className="space-y-3">
              {currentQuestion.options.map((option, index) => (
                <motion.button
                  key={index}
                  onClick={() => handleAnswerChange(currentQuestion.id, option)}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  whileHover={{ scale: 1.02, x: 5 }}
                  whileTap={{ scale: 0.98 }}
                  className={`w-full text-left p-4 md:p-5 rounded-xl border-2 transition-all duration-200 relative overflow-hidden
                    ${answers[currentQuestion.id] === option ? 'text-white font-semibold shadow-md' :
                      isSubmitted && option === currentQuestion.answer ? 'bg-green-100 border-green-500 text-green-900 font-semibold shadow-md' :
                      'bg-white border-gray-200 hover:shadow-md text-gray-700'
                    }
                    ${isSubmitted && answers[currentQuestion.id] === option && option !== currentQuestion.answer ? 'bg-red-100 !border-red-500 !text-red-900' : ''}
                    ${isSubmitted ? 'cursor-not-allowed' : 'cursor-pointer'}
                  `}
                  style={answers[currentQuestion.id] === option ? { backgroundColor: primaryColor, borderColor: primaryColor } : {}}
                  disabled={isSubmitted}
                >
                  <div className="flex items-center space-x-3">
                    <motion.div 
                      className={`w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0
                        ${answers[currentQuestion.id] === option ? 'border-white bg-white' :
                          isSubmitted && option === currentQuestion.answer ? 'border-green-600 bg-green-600' :
                          isSubmitted && answers[currentQuestion.id] === option ? 'border-red-600 bg-red-600' :
                          'border-gray-300'
                        }`}
                      whileHover={{ scale: 1.1 }}
                    >
                      {(answers[currentQuestion.id] === option || (isSubmitted && option === currentQuestion.answer)) && (
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          className="w-2 h-2 rounded-full"
                          style={{ backgroundColor: answers[currentQuestion.id] === option ? primaryColor : 'white' }}
                        />
                      )}
                    </motion.div>
                    <span className="text-sm md:text-base">{option}</span>
                  </div>
                </motion.button>
              ))}
            </div>
          ) : (
            <motion.textarea
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="w-full h-56 p-5 border-2 border-gray-200 rounded-2xl text-gray-700 focus:outline-none focus:ring-2 shadow-sm resize-none font-mono text-sm"
              style={{ '--tw-ring-color': primaryColor }}
              placeholder={currentQuestion.type === "coding" ? "// Write your code here..." : "Type your detailed answer here..."}
              value={answers[currentQuestion.id] || ""}
              onChange={(e) => handleAnswerChange(currentQuestion.id, e.target.value)}
              disabled={isSubmitted}
            ></motion.textarea>
          )}

          {/* Navigation and Submit Buttons */}
          <div className="flex justify-between mt-6">
            <motion.button
              onClick={() => setCurrentQuestionIndex(Math.max(0, currentQuestionIndex - 1))}
              disabled={currentQuestionIndex === 0}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-4 py-3 md:px-6 rounded-xl border-2 border-gray-300 text-gray-700 font-medium hover:bg-gray-50 hover:border-gray-400 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-sm text-sm md:text-base"
            >
              Previous
            </motion.button>
            {currentQuestionIndex < questions.length - 1 ? (
              <motion.button
                onClick={() => setCurrentQuestionIndex(currentQuestionIndex + 1)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-4 py-3 md:px-6 rounded-xl text-white font-semibold hover:shadow-lg transition-all duration-200 shadow-md text-sm md:text-base"
                style={{ backgroundColor: primaryColor }}
              >
                Next Question
              </motion.button>
            ) : (
              <motion.button
                onClick={handleSubmit}
                disabled={isSubmitted}
                whileHover={{ scale: isSubmitted ? 1 : 1.05 }}
                whileTap={{ scale: isSubmitted ? 1 : 0.95 }}
                className="px-4 py-3 md:px-6 rounded-xl text-white font-semibold transition-all duration-200 shadow-md disabled:opacity-50 disabled:cursor-not-allowed text-sm md:text-base"
                style={{ background: isSubmitted ? '#9CA3AF' : primaryColor }}
              >
                {isSubmitted ? 'Submitted' : 'Submit Test'}
              </motion.button>
            )}
          </div>
          
          {/* Result Section */}
          {isSubmitted && (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-8 p-5 md:p-7 rounded-2xl border-2 shadow-xl"
              style={{ borderColor: `${primaryColor}33`, backgroundColor: `${primaryColor}0D` }} 
            >
              <div className="flex items-center space-x-3 mb-6">
                <motion.div
                  initial={{ rotate: 0 }}
                  animate={{ rotate: 360 }}
                  transition={{ duration: 0.5 }}
                  className="w-10 h-10 md:w-12 md:h-12 rounded-2xl flex items-center justify-center flex-shrink-0"
                  style={{ backgroundColor: primaryColor }}
                >
                  <Trophy className="w-5 h-5 md:w-6 md:h-6 text-white" />
                </motion.div>
                <div>
                  <h3 className="text-xl md:text-2xl font-bold" style={{ color: primaryColor }}>Test Results</h3>
                  <p className="text-sm text-gray-600">Review your performance</p>
                </div>
              </div>
              {/* Question Review List */}
              {questions.map((q, index) => (
                <motion.div 
                  key={q.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="mb-5 pb-5 border-b last:border-b-0 border-gray-200"
                >
                  <p className="font-semibold text-gray-800 mb-3 flex items-start space-x-2">
                    <span className="bg-gray-100 rounded-lg px-2 py-1 text-sm font-bold flex-shrink-0" style={{ color: primaryColor }}>Q{index + 1}</span>
                    <span className="text-sm md:text-base">{q.text}</span>
                  </p>
                  {/* Answers Display Logic same as before */}
                  {q.type === "descriptive" || q.type === "coding" ? (
                    <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
                      <p className="text-gray-700 text-sm flex items-center space-x-2">
                        <Sparkles className="w-4 h-4 text-yellow-600" />
                        <span className="italic">Awaiting detailed evaluation.</span>
                      </p>
                      {answers[q.id] && (
                        <div className="mt-3 p-3 bg-white rounded-lg border text-xs font-mono whitespace-pre-wrap">{answers[q.id]}</div>
                      )}
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-2 sm:space-y-0 sm:space-x-3 p-3 bg-white rounded-lg border border-gray-200">
                        <span className="text-gray-600 text-sm">Your Answer:</span>
                        <span className="font-medium text-gray-800 break-all">{answers[q.id] || "No Answer"}</span>
                        {isCorrect(q) ? (
                          <CheckCircle className="w-5 h-5 text-green-600 sm:ml-auto" />
                        ) : (
                          <XCircle className="w-5 h-5 text-red-600 sm:ml-auto" />
                        )}
                      </div>
                      {!isCorrect(q) && (
                        <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-2 sm:space-y-0 sm:space-x-3 p-3 bg-green-50 rounded-lg border border-green-200">
                          <span className="text-green-700 text-sm">Correct Answer:</span>
                          <span className="font-semibold text-green-800 break-all">{q.answer}</span>
                        </div>
                      )}
                    </div>
                  )}
                </motion.div>
              ))}
              <motion.button
                onClick={onFinish}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="w-full mt-6 px-6 py-4 rounded-xl text-white font-semibold hover:shadow-xl transition-all duration-200 flex items-center justify-center space-x-2"
                style={{ backgroundColor: primaryColor }}
              >
                <ArrowRight className="w-5 h-5" />
                <span>Return to Dashboard</span>
              </motion.button>
            </motion.div>
          )}
        </motion.div>
      </div>
    </motion.div>
  );
};

// --- Section Components with Theme ---

const AIInterviewSection = ({ data, theme }) => {
  const primaryColor = theme?.primary || '#7D5AFE';
  
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-3xl shadow-2xl p-6 md:p-8 border border-gray-100"
    >
      <div className="flex items-center space-x-3 mb-6">
        <motion.div 
          className="w-12 h-12 md:w-14 md:h-14 rounded-2xl flex items-center justify-center flex-shrink-0"
          style={{ backgroundColor: primaryColor }}
          whileHover={{ scale: 1.05, rotate: 5 }}
        >
          <Mic className="w-6 h-6 md:w-7 md:h-7 text-white" />
        </motion.div>
        <div>
          <h2 className="text-xl md:text-2xl font-bold text-gray-800">AI Interview Experience</h2>
          <p className="text-xs md:text-sm text-gray-500">Practice with intelligent feedback</p>
        </div>
      </div>

      <div className="space-y-4 mb-8">
        <p className="text-gray-600 leading-relaxed">Simulate a real HR or technical interview with AI-generated questions and receive instant, personalized feedback on your performance.</p>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="flex items-center space-x-2 px-6 py-3 text-white font-semibold rounded-xl hover:shadow-xl transition-all duration-200 shadow-md w-full md:w-auto justify-center md:justify-start"
          style={{ backgroundColor: primaryColor }}
          onClick={() => alert("Starting AI Interview...")}
        >
          <Play className="w-5 h-5" />
          <span>Start Interview</span>
          <Sparkles className="w-4 h-4" />
        </motion.button>
      </div>

      <div className="mb-8">
        <h3 className="text-lg md:text-xl font-bold text-gray-800 mb-4 flex items-center space-x-2">
          <Zap className="w-5 h-5" style={{ color: primaryColor }} />
          <span>Sample Questions</span>
        </h3>
        <div className="space-y-3">
          {data.questions.map((q, index) => (
            <motion.div
              key={q.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ scale: 1.02, x: 5 }}
              className="p-4 md:p-5 bg-gray-50 rounded-xl border border-gray-100 flex items-start space-x-3 shadow-sm hover:shadow-md transition-all duration-200"
            >
              <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-1" />
              <div className="flex-1">
                <p className="text-gray-700 font-medium text-sm md:text-base">{q.text}</p>
                <span className="inline-block mt-2 px-3 py-1 bg-white rounded-full text-xs font-semibold border" style={{ color: primaryColor, borderColor: `${primaryColor}40` }}>
                  {q.type}
                </span>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </motion.div>
  );
};

const AptitudeTestSection = ({ data, handleStartTest, theme }) => {
  const primaryColor = theme?.primary || '#7D5AFE';
  
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-3xl shadow-2xl p-6 md:p-8 border border-gray-100"
    >
      <div className="flex items-center space-x-3 mb-6">
        <motion.div 
          className="w-12 h-12 md:w-14 md:h-14 rounded-2xl flex items-center justify-center flex-shrink-0"
          style={{ backgroundColor: primaryColor }}
          whileHover={{ scale: 1.05, rotate: 5 }}
        >
          <Clock className="w-6 h-6 md:w-7 md:h-7 text-white" />
        </motion.div>
        <div>
          <h2 className="text-xl md:text-2xl font-bold text-gray-800">Mock Aptitude Tests</h2>
          <p className="text-xs md:text-sm text-gray-500">Timed assessments to boost your skills</p>
        </div>
      </div>

      <p className="text-gray-600 mb-6 leading-relaxed">Master logical reasoning, quantitative aptitude, and verbal skills with our comprehensive timed tests. Track your progress and improve systematically.</p>
      
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className="flex items-center space-x-2 px-6 py-3 text-white font-semibold rounded-xl hover:shadow-xl transition-all duration-200 mb-8 shadow-md w-full md:w-auto justify-center md:justify-start"
        style={{ backgroundColor: primaryColor }}
        onClick={handleStartTest}
      >
        <Play className="w-5 h-5" />
        <span>Start Aptitude Test</span>
        <Sparkles className="w-4 h-4" />
      </motion.button>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Simplified Cards without complex specific gradients */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gray-50 p-5 rounded-2xl border-2 border-gray-200 shadow-md"
        >
          <div className="flex items-center space-x-2 mb-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: primaryColor }}>
              <Target className="w-5 h-5 text-white" />
            </div>
            <h4 className="font-bold text-gray-800 text-lg">Test Sections</h4>
          </div>
          <ul className="space-y-2">
            {['Logical Reasoning', 'Quantitative Aptitude', 'Verbal Ability'].map((section, index) => (
              <motion.li
                key={index}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 + index * 0.1 }}
                className="flex items-center space-x-2 text-gray-700"
              >
                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: primaryColor }}></div>
                <span className="text-sm font-medium">{section}</span>
              </motion.li>
            ))}
          </ul>
        </motion.div>
      </div>
    </motion.div>
  );
};

const MockTestSection = ({ data, handleStartTest, theme }) => {
  const primaryColor = theme?.primary || '#7D5AFE';

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-3xl shadow-2xl p-6 md:p-8 border border-gray-100"
    >
      <div className="flex items-center space-x-3 mb-6">
        <motion.div 
          className="w-12 h-12 md:w-14 md:h-14 rounded-2xl flex items-center justify-center flex-shrink-0"
          style={{ backgroundColor: primaryColor }}
          whileHover={{ scale: 1.05, rotate: 5 }}
        >
          <FileText className="w-6 h-6 md:w-7 md:h-7 text-white" />
        </motion.div>
        <div>
          <h2 className="text-xl md:text-2xl font-bold text-gray-800">General Mock Tests</h2>
          <p className="text-xs md:text-sm text-gray-500">{data.name}</p>
        </div>
      </div>

      <p className="text-gray-600 mb-6 leading-relaxed">Subject-specific and placement-oriented tests designed to help you track progress, identify weak areas, and excel in your target domain.</p>
      
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className="flex items-center space-x-2 px-6 py-3 text-white font-semibold rounded-xl hover:shadow-xl transition-all duration-200 mb-8 shadow-md w-full md:w-auto justify-center md:justify-start"
        style={{ backgroundColor: primaryColor }}
        onClick={handleStartTest}
      >
        <Play className="w-5 h-5" />
        <span>Start Mock Test</span>
        <Sparkles className="w-4 h-4" />
      </motion.button>
    </motion.div>
  );
};

// --- Main App Component ---

const MockInterview = ({ theme }) => {
  const [selectedRole, setSelectedRole] = useState('Software Engineer');
  const [activeSection, setActiveSection] = useState('aiInterview');
  const [isTestActive, setIsTestActive] = useState(false);

  const primaryColor = theme?.primary || '#7D5AFE';
  const currentRoleData = interviewData[selectedRole];

  const handleStartTest = () => {
    setIsTestActive(true);
  };

  const handleFinishTest = () => {
    setIsTestActive(false);
  };

  const renderContent = () => {
    if (isTestActive) {
      if (activeSection === 'aptitudeTest') {
        return <TestQuestions questions={currentRoleData.aptitudeTest.questions} testType="Aptitude Test" onFinish={handleFinishTest} theme={theme} />;
      } else if (activeSection === 'mockTest') {
        return <TestQuestions questions={currentRoleData.mockTest.questions} testType={currentRoleData.mockTest.name} onFinish={handleFinishTest} theme={theme} />;
      }
    }

    switch (activeSection) {
      case 'aiInterview':
        return <AIInterviewSection data={currentRoleData.aiInterview} theme={theme} />;
      case 'aptitudeTest':
        return <AptitudeTestSection data={currentRoleData.aptitudeTest} handleStartTest={handleStartTest} theme={theme} />;
      case 'mockTest':
        return <MockTestSection data={currentRoleData.mockTest} handleStartTest={handleStartTest} theme={theme} />;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap');
        body { 
          font-family: 'Inter', sans-serif;
        }
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
        }
        .float-animation {
          animation: float 3s ease-in-out infinite;
        }
      `}</style>
      
      <div className="flex flex-col md:flex-row">
        {/* Navigation Sidebar */}
        <motion.div 
          initial={{ x: -100, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="w-full md:w-80 bg-white p-4 md:p-6 flex flex-col shadow-lg md:shadow-2xl rounded-none md:rounded-3xl m-0 md:m-4 md:sticky md:top-4 md:h-[calc(100vh-2rem)] border-b md:border border-gray-100 z-10"
        >
          <motion.div 
            className="mb-6 md:mb-8"
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            <div className="flex items-center space-x-3 mb-3">
              <motion.div 
                className="w-10 h-10 md:w-12 md:h-12 rounded-2xl flex items-center justify-center shadow-lg float-animation flex-shrink-0"
                style={{ backgroundColor: primaryColor }}
                whileHover={{ scale: 1.1, rotate: 10 }}
              >
                <Brain className="w-6 h-6 md:w-7 md:h-7 text-white" />
              </motion.div>
              <div>
                <h1 className="text-lg md:text-xl font-extrabold text-gray-800">InterviewPro</h1>
                <p className="text-xs text-gray-500">Master your interviews</p>
              </div>
            </div>
          </motion.div>

          <div className="flex md:flex-col overflow-x-auto md:overflow-visible space-x-2 md:space-x-0 md:space-y-2 flex-1 pb-2 md:pb-0 hide-scrollbar">
            <p className="text-xs font-bold uppercase text-gray-400 pl-3 pt-2 pb-2 hidden md:flex items-center space-x-2">
              <Sparkles className="w-3 h-3" />
              <span>Test Categories</span>
            </p>
            {mockSections.map((section, index) => (
              <motion.button
                key={section.id}
                onClick={() => {
                  setActiveSection(section.id);
                  setIsTestActive(false);
                }}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 + index * 0.1 }}
                className={`flex-shrink-0 md:w-full flex items-center space-x-2 md:space-x-3 p-3 md:p-4 rounded-xl md:rounded-2xl transition-all duration-300 group relative overflow-hidden ${
                  activeSection === section.id
                    ? 'text-white font-semibold shadow-md md:shadow-xl'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900 border border-gray-100 md:border-transparent hover:border-gray-200'
                }`}
                style={activeSection === section.id ? { backgroundColor: primaryColor } : {}}
              >
                {activeSection === section.id && (
                  <motion.div
                    layoutId="activeSection"
                    className="absolute inset-0 bg-white/10 hidden md:block"
                    initial={false}
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  />
                )}
                <div 
                  className={`w-8 h-8 md:w-11 md:h-11 rounded-lg md:rounded-xl flex items-center justify-center relative z-10 ${
                    activeSection === section.id 
                      ? 'bg-white/20' 
                      : 'bg-gray-100 group-hover:bg-white border border-gray-200'
                  }`}
                >
                  {React.createElement(section.icon, { 
                    className: `w-4 h-4 md:w-6 md:h-6 ${activeSection === section.id ? 'text-white' : 'text-gray-500'}` 
                  })}
                </div>
                <div className="md:flex-1 text-left relative z-10">
                  <span className="block text-sm font-semibold whitespace-nowrap">{section.title}</span>
                  <span className={`text-xs hidden md:block ${activeSection === section.id ? 'text-white/80' : 'text-gray-400'}`}>{section.description.split('.')[0]}</span>
                </div>
                {activeSection === section.id && (
                  <div className="relative z-10 hidden md:block">
                    <ChevronRight className="w-5 h-5 text-white" />
                  </div>
                )}
              </motion.button>
            ))}
          </div>
        </motion.div>
        
        {/* Main Content Area */}
        <div className="flex-1 min-w-0 p-4 md:p-6">
          <motion.div 
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="bg-white rounded-3xl shadow-lg md:shadow-2xl p-5 md:p-7 mb-6 md:mb-8 border border-gray-100"
          >
            <div className="flex items-center justify-between mb-5">
              <div>
                <h1 className="text-xl md:text-2xl font-bold text-gray-900 flex items-center space-x-2">
                  <span>Select Your Target Role</span>
                  <motion.div
                    animate={{ rotate: [0, 10, -10, 0] }}
                    transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
                  >
                    <Sparkles className="w-5 h-5 md:w-6 md:h-6" style={{ color: primaryColor }} />
                  </motion.div>
                </h1>
                <p className="text-xs md:text-sm text-gray-500 mt-1">Choose a role to see customized interview content</p>
              </div>
            </div>
            <div className="flex flex-wrap gap-2 md:gap-3">
              {Object.keys(interviewData).map((role, index) => (
                <motion.button
                  key={role}
                  onClick={() => {
                    setSelectedRole(role);
                    setIsTestActive(false);
                  }}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.1 }}
                  whileHover={{ scale: 1.05, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                  className={`px-4 py-2 md:px-6 md:py-3 rounded-xl text-sm md:text-base font-semibold transition-all duration-300 shadow-sm md:shadow-md ${
                    selectedRole === role
                      ? 'text-white shadow-lg'
                      : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                  }`}
                  style={selectedRole === role ? { backgroundColor: primaryColor } : {}}
                >
                  {role}
                </motion.button>
              ))}
            </div>
          </motion.div>

          <AnimatePresence mode="wait">
            <motion.div
              key={activeSection + selectedRole + isTestActive}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              {renderContent()}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

export default MockInterview;
