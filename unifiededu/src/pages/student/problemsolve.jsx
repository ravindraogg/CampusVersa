import React, { useState } from 'react';
import { 
  Search, ExternalLink, Code2, Terminal, 
  Filter, ChevronLeft, ChevronRight, CheckCircle2 
} from 'lucide-react';

// --- DATASET: 100+ Problems ---
const PROBLEM_SET = [
  // --- LEETCODE (Top Interview Questions) ---
  { id: 1, title: "Two Sum", platform: "LeetCode", difficulty: "Easy", topic: "Array", url: "https://leetcode.com/problems/two-sum/" },
  { id: 2, title: "Add Two Numbers", platform: "LeetCode", difficulty: "Medium", topic: "Linked List", url: "https://leetcode.com/problems/add-two-numbers/" },
  { id: 3, title: "Longest Substring Without Repeating Characters", platform: "LeetCode", difficulty: "Medium", topic: "String", url: "https://leetcode.com/problems/longest-substring-without-repeating-characters/" },
  { id: 4, title: "Median of Two Sorted Arrays", platform: "LeetCode", difficulty: "Hard", topic: "Binary Search", url: "https://leetcode.com/problems/median-of-two-sorted-arrays/" },
  { id: 5, title: "Longest Palindromic Substring", platform: "LeetCode", difficulty: "Medium", topic: "DP", url: "https://leetcode.com/problems/longest-palindromic-substring/" },
  { id: 6, title: "Zigzag Conversion", platform: "LeetCode", difficulty: "Medium", topic: "String", url: "https://leetcode.com/problems/zigzag-conversion/" },
  { id: 7, title: "Reverse Integer", platform: "LeetCode", difficulty: "Medium", topic: "Math", url: "https://leetcode.com/problems/reverse-integer/" },
  { id: 8, title: "String to Integer (atoi)", platform: "LeetCode", difficulty: "Medium", topic: "String", url: "https://leetcode.com/problems/string-to-integer-atoi/" },
  { id: 9, title: "Palindrome Number", platform: "LeetCode", difficulty: "Easy", topic: "Math", url: "https://leetcode.com/problems/palindrome-number/" },
  { id: 10, title: "Regular Expression Matching", platform: "LeetCode", difficulty: "Hard", topic: "DP", url: "https://leetcode.com/problems/regular-expression-matching/" },
  { id: 11, title: "Container With Most Water", platform: "LeetCode", difficulty: "Medium", topic: "Array", url: "https://leetcode.com/problems/container-with-most-water/" },
  { id: 12, title: "Integer to Roman", platform: "LeetCode", difficulty: "Medium", topic: "Math", url: "https://leetcode.com/problems/integer-to-roman/" },
  { id: 13, title: "Roman to Integer", platform: "LeetCode", difficulty: "Easy", topic: "Math", url: "https://leetcode.com/problems/roman-to-integer/" },
  { id: 14, title: "Longest Common Prefix", platform: "LeetCode", difficulty: "Easy", topic: "String", url: "https://leetcode.com/problems/longest-common-prefix/" },
  { id: 15, title: "3Sum", platform: "LeetCode", difficulty: "Medium", topic: "Array", url: "https://leetcode.com/problems/3sum/" },
  { id: 16, title: "3Sum Closest", platform: "LeetCode", difficulty: "Medium", topic: "Array", url: "https://leetcode.com/problems/3sum-closest/" },
  { id: 17, title: "Letter Combinations of a Phone Number", platform: "LeetCode", difficulty: "Medium", topic: "Backtracking", url: "https://leetcode.com/problems/letter-combinations-of-a-phone-number/" },
  { id: 18, title: "4Sum", platform: "LeetCode", difficulty: "Medium", topic: "Array", url: "https://leetcode.com/problems/4sum/" },
  { id: 19, title: "Remove Nth Node From End of List", platform: "LeetCode", difficulty: "Medium", topic: "Linked List", url: "https://leetcode.com/problems/remove-nth-node-from-end-of-list/" },
  { id: 20, title: "Valid Parentheses", platform: "LeetCode", difficulty: "Easy", topic: "Stack", url: "https://leetcode.com/problems/valid-parentheses/" },
  { id: 21, title: "Merge Two Sorted Lists", platform: "LeetCode", difficulty: "Easy", topic: "Linked List", url: "https://leetcode.com/problems/merge-two-sorted-lists/" },
  { id: 22, title: "Generate Parentheses", platform: "LeetCode", difficulty: "Medium", topic: "Backtracking", url: "https://leetcode.com/problems/generate-parentheses/" },
  { id: 23, title: "Merge k Sorted Lists", platform: "LeetCode", difficulty: "Hard", topic: "Heap", url: "https://leetcode.com/problems/merge-k-sorted-lists/" },
  { id: 24, title: "Swap Nodes in Pairs", platform: "LeetCode", difficulty: "Medium", topic: "Linked List", url: "https://leetcode.com/problems/swap-nodes-in-pairs/" },
  { id: 25, title: "Reverse Nodes in k-Group", platform: "LeetCode", difficulty: "Hard", topic: "Linked List", url: "https://leetcode.com/problems/reverse-nodes-in-k-group/" },
  { id: 26, title: "Remove Duplicates from Sorted Array", platform: "LeetCode", difficulty: "Easy", topic: "Array", url: "https://leetcode.com/problems/remove-duplicates-from-sorted-array/" },
  { id: 27, title: "Remove Element", platform: "LeetCode", difficulty: "Easy", topic: "Array", url: "https://leetcode.com/problems/remove-element/" },
  { id: 28, title: "Find the Index of the First Occurrence in a String", platform: "LeetCode", difficulty: "Easy", topic: "String", url: "https://leetcode.com/problems/find-the-index-of-the-first-occurrence-in-a-string/" },
  { id: 29, title: "Divide Two Integers", platform: "LeetCode", difficulty: "Medium", topic: "Math", url: "https://leetcode.com/problems/divide-two-integers/" },
  { id: 30, title: "Substring with Concatenation of All Words", platform: "LeetCode", difficulty: "Hard", topic: "String", url: "https://leetcode.com/problems/substring-with-concatenation-of-all-words/" },
  { id: 31, title: "Next Permutation", platform: "LeetCode", difficulty: "Medium", topic: "Array", url: "https://leetcode.com/problems/next-permutation/" },
  { id: 32, title: "Longest Valid Parentheses", platform: "LeetCode", difficulty: "Hard", topic: "DP", url: "https://leetcode.com/problems/longest-valid-parentheses/" },
  { id: 33, title: "Search in Rotated Sorted Array", platform: "LeetCode", difficulty: "Medium", topic: "Binary Search", url: "https://leetcode.com/problems/search-in-rotated-sorted-array/" },
  { id: 34, title: "Find First and Last Position of Element in Sorted Array", platform: "LeetCode", difficulty: "Medium", topic: "Binary Search", url: "https://leetcode.com/problems/find-first-and-last-position-of-element-in-sorted-array/" },
  { id: 35, title: "Search Insert Position", platform: "LeetCode", difficulty: "Easy", topic: "Binary Search", url: "https://leetcode.com/problems/search-insert-position/" },
  { id: 36, title: "Valid Sudoku", platform: "LeetCode", difficulty: "Medium", topic: "Matrix", url: "https://leetcode.com/problems/valid-sudoku/" },
  { id: 37, title: "Sudoku Solver", platform: "LeetCode", difficulty: "Hard", topic: "Backtracking", url: "https://leetcode.com/problems/sudoku-solver/" },
  { id: 38, title: "Count and Say", platform: "LeetCode", difficulty: "Medium", topic: "String", url: "https://leetcode.com/problems/count-and-say/" },
  { id: 39, title: "Combination Sum", platform: "LeetCode", difficulty: "Medium", topic: "Backtracking", url: "https://leetcode.com/problems/combination-sum/" },
  { id: 40, title: "Combination Sum II", platform: "LeetCode", difficulty: "Medium", topic: "Backtracking", url: "https://leetcode.com/problems/combination-sum-ii/" },
  { id: 41, title: "First Missing Positive", platform: "LeetCode", difficulty: "Hard", topic: "Array", url: "https://leetcode.com/problems/first-missing-positive/" },
  { id: 42, title: "Trapping Rain Water", platform: "LeetCode", difficulty: "Hard", topic: "Two Pointers", url: "https://leetcode.com/problems/trapping-rain-water/" },
  { id: 43, title: "Multiply Strings", platform: "LeetCode", difficulty: "Medium", topic: "Math", url: "https://leetcode.com/problems/multiply-strings/" },
  { id: 44, title: "Wildcard Matching", platform: "LeetCode", difficulty: "Hard", topic: "DP", url: "https://leetcode.com/problems/wildcard-matching/" },
  { id: 45, title: "Jump Game II", platform: "LeetCode", difficulty: "Medium", topic: "DP", url: "https://leetcode.com/problems/jump-game-ii/" },
  { id: 46, title: "Permutations", platform: "LeetCode", difficulty: "Medium", topic: "Backtracking", url: "https://leetcode.com/problems/permutations/" },
  { id: 47, title: "Permutations II", platform: "LeetCode", difficulty: "Medium", topic: "Backtracking", url: "https://leetcode.com/problems/permutations-ii/" },
  { id: 48, title: "Rotate Image", platform: "LeetCode", difficulty: "Medium", topic: "Matrix", url: "https://leetcode.com/problems/rotate-image/" },
  { id: 49, title: "Group Anagrams", platform: "LeetCode", difficulty: "Medium", topic: "String", url: "https://leetcode.com/problems/group-anagrams/" },
  { id: 50, title: "Pow(x, n)", platform: "LeetCode", difficulty: "Medium", topic: "Math", url: "https://leetcode.com/problems/powx-n/" },
  
  // --- CODECHEF (Beginner to Advanced) ---
  { id: 101, title: "Life, the Universe, and Everything (TEST)", platform: "CodeChef", difficulty: "Easy", topic: "Basic", url: "https://www.codechef.com/problems/TEST" },
  { id: 102, title: "Enormous Input Test (INTEST)", platform: "CodeChef", difficulty: "Easy", topic: "IO", url: "https://www.codechef.com/problems/INTEST" },
  { id: 103, title: "ATM (HS08TEST)", platform: "CodeChef", difficulty: "Easy", topic: "Math", url: "https://www.codechef.com/problems/HS08TEST" },
  { id: 104, title: "Factorial (FCTRL)", platform: "CodeChef", difficulty: "Medium", topic: "Math", url: "https://www.codechef.com/problems/FCTRL" },
  { id: 105, title: "Small Factorials (FCTRL2)", platform: "CodeChef", difficulty: "Easy", topic: "BigInt", url: "https://www.codechef.com/problems/FCTRL2" },
  { id: 106, title: "Turbo Sort (TSORT)", platform: "CodeChef", difficulty: "Easy", topic: "Sorting", url: "https://www.codechef.com/problems/TSORT" },
  { id: 107, title: "Sum of Digits (FLOW006)", platform: "CodeChef", difficulty: "Easy", topic: "Math", url: "https://www.codechef.com/problems/FLOW006" },
  { id: 108, title: "Find Remainder (FLOW002)", platform: "CodeChef", difficulty: "Easy", topic: "Math", url: "https://www.codechef.com/problems/FLOW002" },
  { id: 109, title: "First and Last Digit (FLOW004)", platform: "CodeChef", difficulty: "Easy", topic: "Math", url: "https://www.codechef.com/problems/FLOW004" },
  { id: 110, title: "Lucky Four (LUCKFOUR)", platform: "CodeChef", difficulty: "Easy", topic: "Basic", url: "https://www.codechef.com/problems/LUCKFOUR" },
  { id: 111, title: "Reverse The Number (FLOW007)", platform: "CodeChef", difficulty: "Easy", topic: "Math", url: "https://www.codechef.com/problems/FLOW007" },
  { id: 112, title: "Helping Chef (FLOW008)", platform: "CodeChef", difficulty: "Easy", topic: "Basic", url: "https://www.codechef.com/problems/FLOW008" },
  { id: 113, title: "Valid Triangles (FLOW013)", platform: "CodeChef", difficulty: "Easy", topic: "Geometry", url: "https://www.codechef.com/problems/FLOW013" },
  { id: 114, title: "Packaging Cupcakes (MUFFINS3)", platform: "CodeChef", difficulty: "Easy", topic: "Math", url: "https://www.codechef.com/problems/MUFFINS3" },
  { id: 115, title: "Chef and Remissness (REMISS)", platform: "CodeChef", difficulty: "Easy", topic: "Basic", url: "https://www.codechef.com/problems/REMISS" },
  { id: 116, title: "The Lead Game (TLG)", platform: "CodeChef", difficulty: "Easy", topic: "Array", url: "https://www.codechef.com/problems/TLG" },
  { id: 117, title: "Second Largest (FLOW017)", platform: "CodeChef", difficulty: "Easy", topic: "Sorting", url: "https://www.codechef.com/problems/FLOW017" },
  { id: 118, title: "Small Factorial (FLOW018)", platform: "CodeChef", difficulty: "Easy", topic: "Math", url: "https://www.codechef.com/problems/FLOW018" },
  { id: 119, title: "Finding Square Roots (FSQRT)", platform: "CodeChef", difficulty: "Easy", topic: "Math", url: "https://www.codechef.com/problems/FSQRT" },
  { id: 120, title: "Chef and Operators (CHOPRT)", platform: "CodeChef", difficulty: "Easy", topic: "Basic", url: "https://www.codechef.com/problems/CHOPRT" },
  { id: 121, title: "Mahasena (AMR15A)", platform: "CodeChef", difficulty: "Easy", topic: "Array", url: "https://www.codechef.com/problems/AMR15A" },
  { id: 122, title: "Puppy and Sum (PPSUM)", platform: "CodeChef", difficulty: "Easy", topic: "Math", url: "https://www.codechef.com/problems/PPSUM" },
  { id: 123, title: "Sum OR Difference (DIFFSUM)", platform: "CodeChef", difficulty: "Easy", topic: "Basic", url: "https://www.codechef.com/problems/DIFFSUM" },
  { id: 124, title: "Decrement OR Increment (DECINC)", platform: "CodeChef", difficulty: "Easy", topic: "Basic", url: "https://www.codechef.com/problems/DECINC" },
  { id: 125, title: "Lapindromes (LAPIN)", platform: "CodeChef", difficulty: "Easy", topic: "String", url: "https://www.codechef.com/problems/LAPIN" },
  { id: 126, title: "Number Mirror (START01)", platform: "CodeChef", difficulty: "Easy", topic: "IO", url: "https://www.codechef.com/problems/START01" },
  { id: 127, title: "Chef and SnackDown (KTTABLE)", platform: "CodeChef", difficulty: "Easy", topic: "Array", url: "https://www.codechef.com/problems/KTTABLE" },
  { id: 128, title: "Ciel and Receipt (CIELRCPT)", platform: "CodeChef", difficulty: "Easy", topic: "Greedy", url: "https://www.codechef.com/problems/CIELRCPT" },
  { id: 129, title: "Fit Squares in Triangle (TRISQ)", platform: "CodeChef", difficulty: "Easy", topic: "Math", url: "https://www.codechef.com/problems/TRISQ" },
  { id: 130, title: "Closing the Tweets (TWEET)", platform: "CodeChef", difficulty: "Medium", topic: "Implementation", url: "https://www.codechef.com/problems/TWEET" },
  
  // ... more placeholders to simulate 100+ feel
  { id: 131, title: "Add Two Numbers II", platform: "LeetCode", difficulty: "Medium", topic: "Linked List", url: "https://leetcode.com/problems/add-two-numbers-ii/" },
  { id: 132, title: "Number of Islands", platform: "LeetCode", difficulty: "Medium", topic: "Graph", url: "https://leetcode.com/problems/number-of-islands/" },
  { id: 133, title: "Valid Anagram", platform: "LeetCode", difficulty: "Easy", topic: "String", url: "https://leetcode.com/problems/valid-anagram/" },
  { id: 134, title: "Climbing Stairs", platform: "LeetCode", difficulty: "Easy", topic: "DP", url: "https://leetcode.com/problems/climbing-stairs/" },
  { id: 135, title: "Maximum Subarray", platform: "LeetCode", difficulty: "Easy", topic: "Array", url: "https://leetcode.com/problems/maximum-subarray/" },
  { id: 136, title: "Length of Last Word", platform: "LeetCode", difficulty: "Easy", topic: "String", url: "https://leetcode.com/problems/length-of-last-word/" },
  { id: 137, title: "Plus One", platform: "LeetCode", difficulty: "Easy", topic: "Math", url: "https://leetcode.com/problems/plus-one/" },
  { id: 138, title: "Add Binary", platform: "LeetCode", difficulty: "Easy", topic: "Math", url: "https://leetcode.com/problems/add-binary/" },
  { id: 139, title: "Sqrt(x)", platform: "LeetCode", difficulty: "Easy", topic: "Math", url: "https://leetcode.com/problems/sqrt-x/" },
  { id: 140, title: "Remove Duplicates from Sorted List", platform: "LeetCode", difficulty: "Easy", topic: "Linked List", url: "https://leetcode.com/problems/remove-duplicates-from-sorted-list/" }
];
const ITEMS_PER_PAGE = 10;

const ProblemSolvingArena = ({ theme }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [activePlatform, setActivePlatform] = useState("All");
  const [currentPage, setCurrentPage] = useState(1);

  // Filter Logic
  const filteredProblems = PROBLEM_SET.filter(problem => {
    const matchesSearch = problem.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          problem.topic.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesPlatform = activePlatform === "All" || problem.platform === activePlatform;
    return matchesSearch && matchesPlatform;
  });

  // Pagination Logic
  const totalPages = Math.ceil(filteredProblems.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const currentProblems = filteredProblems.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  const getDifficultyColor = (diff) => {
    switch (diff.toLowerCase()) {
      case 'easy': return 'bg-green-100 text-green-700 border-green-200';
      case 'medium': return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      case 'hard': return 'bg-red-100 text-red-700 border-red-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const getPlatformIcon = (platform) => {
    if (platform === 'LeetCode') return <Code2 size={14} className="text-orange-500" />;
    if (platform === 'CodeChef') return <Terminal size={14} className="text-brown-600" />; 
    return <Code2 size={14} />;
  };

  return (
    <div className="bg-white rounded-2xl md:rounded-[2rem] p-4 md:p-6 shadow-sm border border-gray-100">
      
      {/* --- HEADER & FILTERS --- */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <h2 className="text-xl md:text-2xl font-bold text-gray-900">Problem Arena</h2>
          <p className="text-gray-500 text-xs md:text-sm mt-1">
            Master DSA with curated problems.
          </p>
        </div>
        
        {/* Platform Toggles - Scrollable on mobile */}
        <div className="flex items-center gap-2 bg-gray-50 p-1 rounded-xl border border-gray-200 overflow-x-auto no-scrollbar whitespace-nowrap">
          {['All', 'LeetCode', 'CodeChef'].map(platform => (
            <button
              key={platform}
              onClick={() => { setActivePlatform(platform); setCurrentPage(1); }}
              className={`px-3 md:px-4 py-1.5 md:py-2 rounded-lg text-xs md:text-sm font-bold transition-all ${
                activePlatform === platform 
                  ? 'shadow-sm text-white' 
                  : 'text-gray-500 hover:text-gray-900 hover:bg-white'
              }`}
              style={{
                backgroundColor: activePlatform === platform ? theme.primary : 'transparent'
              }}
            >
              {platform}
            </button>
          ))}
        </div>
      </div>

      {/* --- SEARCH BAR --- */}
      <div className="relative mb-6">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
        <input 
          type="text" 
          placeholder="Search problems..." 
          value={searchTerm}
          onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
          className="w-full pl-10 pr-4 py-2.5 md:py-3 text-sm bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-opacity-50 transition-all"
          style={{ focusRingColor: theme.primary }}
        />
      </div>

      {/* --- DESKTOP VIEW: TABLE (Hidden on Mobile) --- */}
      <div className="hidden md:block overflow-x-auto rounded-xl border border-gray-100">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200">
              <th className="p-4 text-xs font-bold text-gray-500 uppercase tracking-wider">#</th>
              <th className="p-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Title</th>
              <th className="p-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Platform</th>
              <th className="p-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Difficulty</th>
              <th className="p-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Topic</th>
              <th className="p-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {currentProblems.map((problem) => (
              <tr key={problem.id} className="hover:bg-gray-50 transition-colors group">
                <td className="p-4 text-sm text-gray-400 font-medium">#{problem.id}</td>
                <td className="p-4"><span className="font-bold text-gray-800 text-sm">{problem.title}</span></td>
                <td className="p-4">
                  <div className="flex items-center gap-2 text-xs font-bold text-gray-600">
                    {getPlatformIcon(problem.platform)} {problem.platform}
                  </div>
                </td>
                <td className="p-4">
                  <span className={`px-2 py-1 rounded-md text-[10px] font-bold uppercase border ${getDifficultyColor(problem.difficulty)}`}>
                    {problem.difficulty}
                  </span>
                </td>
                <td className="p-4">
                  <span className="bg-gray-100 text-gray-600 px-2 py-1 rounded text-xs font-medium">{problem.topic}</span>
                </td>
                <td className="p-4 text-right">
                  <a href={problem.url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-xs font-bold hover:underline" style={{ color: theme.primary }}>
                    Solve <ExternalLink size={12} />
                  </a>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* --- MOBILE VIEW: CARDS (Visible only on Mobile) --- */}
      <div className="md:hidden flex flex-col gap-3">
        {currentProblems.map((problem) => (
          <div key={problem.id} className="border border-gray-100 rounded-xl p-4 bg-gray-50/30 flex flex-col gap-3 shadow-sm">
            
            {/* Row 1: Title and ID */}
            <div className="flex justify-between items-start gap-2">
               <h3 className="font-bold text-gray-800 text-sm leading-tight">{problem.title}</h3>
               <span className="text-[10px] font-mono text-gray-400 shrink-0">#{problem.id}</span>
            </div>

            {/* Row 2: Badges (Scrollable horizontally if needed) */}
            <div className="flex flex-wrap gap-2 items-center">
              <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase border ${getDifficultyColor(problem.difficulty)}`}>
                {problem.difficulty}
              </span>
              <div className="flex items-center gap-1 px-2 py-0.5 rounded bg-white border border-gray-200 text-[10px] font-bold text-gray-600">
                 {getPlatformIcon(problem.platform)} {problem.platform}
              </div>
              <span className="bg-gray-100 text-gray-500 px-2 py-0.5 rounded text-[10px] font-medium border border-gray-200">
                {problem.topic}
              </span>
            </div>

            {/* Row 3: Action Button (Bottom of Card) */}
            <a 
              href={problem.url} 
              target="_blank" 
              rel="noopener noreferrer"
              className="mt-1 w-full flex items-center justify-center gap-2 py-2.5 rounded-lg text-xs font-bold text-white transition-transform active:scale-95 shadow-sm"
              style={{ backgroundColor: theme.primary }}
            >
              Solve Problem <ExternalLink size={12} />
            </a>
          </div>
        ))}
      </div>

      {/* Empty State */}
      {currentProblems.length === 0 && (
        <div className="p-8 text-center text-gray-500 italic text-sm">
          No problems found matching your search.
        </div>
      )}

      {/* --- PAGINATION (Responsive) --- */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between mt-6 pt-4 border-t border-gray-100">
          <p className="text-xs text-gray-500 hidden md:block">
            Page <span className="font-bold">{currentPage}</span> of {totalPages}
          </p>
          
          <div className="flex items-center justify-between w-full md:w-auto gap-2">
            <button 
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="flex-1 md:flex-none flex items-center justify-center gap-1 p-2 md:px-3 border border-gray-200 rounded-lg text-xs font-medium disabled:opacity-50 disabled:bg-gray-50"
            >
              <ChevronLeft size={14} /> Prev
            </button>
            
            <span className="text-xs font-bold text-gray-700 md:hidden">
              {currentPage} / {totalPages}
            </span>

            <button 
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="flex-1 md:flex-none flex items-center justify-center gap-1 p-2 md:px-3 border border-gray-200 rounded-lg text-xs font-medium disabled:opacity-50 disabled:bg-gray-50"
            >
              Next <ChevronRight size={14} />
            </button>
          </div>
        </div>
      )}

    </div>
  );
};

export default ProblemSolvingArena;