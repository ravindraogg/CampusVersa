import React, { useState, useEffect, useCallback } from 'react';
import {
  Home, User, GraduationCap, Calendar, Bell, Search, Settings, Grid, TrendingUp, BookOpen, Star, Package, Send, Zap, Activity, Mail, Phone, MapPin, Edit3, Save, X, ClipboardCheck, Camera, Link, Code, Award, Target, Lightbulb, ChevronLeft, ChevronRight, Plus
} from 'lucide-react';
// Assuming Recharts is available in the environment for professional charting
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

// --- Data & Helpers ---

// Custom color palette
const primaryColor = '#7D5AFE'; // Line 1 (Purple)
const secondaryColor = '#66BB6A'; // Line 2 (Green)
const accentColor = '#4DD0E1'; 

// Event Label Colors
const eventLabels = {
    STUDY: { color: 'bg-blue-500', text: 'text-blue-500' },
    MEETING: { color: 'bg-red-500', text: 'text-red-500' },
    PERSONAL: { color: 'bg-green-500', text: 'text-green-500' },
    DEADLINE: { color: 'bg-yellow-500', text: 'text-yellow-500' },
};

// Modified Sidebar Menu (Renamed 'Teachers' to 'Faculty')
const navItems = [
  { name: 'Dashboard', icon: Home, link: '#dashboard' },
  { name: 'Student Profile', icon: User, link: '#profile' },
  { name: 'Faculty', icon: GraduationCap, link: '#faculty' }, // RENAMED
  { name: 'Events', icon: Calendar, link: '#events' }, 
  { name: 'Learning', icon: BookOpen, link: '#learning' },
  { name: 'Explore', icon: Star, link: '#explore' },
  { name: 'Calendar', icon: Calendar, link: '#calendar' },
  { name: 'Notification', icon: Bell, link: '#notification' },
];

// Dummy data for stat cards (Student POV)
const studentStats = [
  { title: 'Total Classes Attended', value: '185', change: '+12% from last month', icon: Zap, bgColor: 'bg-red-500/10 text-red-500' },
  { title: 'Current GPA', value: '4.8', change: 'On track for 5.0', icon: TrendingUp, bgColor: 'bg-green-500/10 text-green-500' },
  { title: 'Assignments Completed', value: '94%', change: '2 tasks pending', icon: Package, bgColor: 'bg-yellow-500/10 text-yellow-500' },
  { title: 'Study Hours Logged', value: '35', change: 'Weekly average', icon: Activity, bgColor: 'bg-purple-500/10 text-purple-500' },
];

// Dummy data for upcoming events (Dashboard summary only)
const upcomingEvents = [
  { day: '3', date: 'WED', title: 'Science Fair Project Due', time: '10:00 AM' },
  { day: '28', date: 'SAT', title: 'College App Workshop', time: '2:30 PM' },
  { day: '25', date: 'FRI', title: 'History Quiz', time: 'All Day' },
];

// Data for Recharts Academic Growth Graph
const rawDataPoints = {
    gpa: [25, 40, 30, 55, 45, 60, 50, 75],
    target: [15, 20, 10, 35, 25, 40, 30, 55],
    weeks: ['W1', 'W2', 'W3', 'W4', 'W5', 'W6', 'W7', 'W8'],
};

const academicData = rawDataPoints.weeks.map((week, index) => ({
    name: week,
    'Current GPA': rawDataPoints.gpa[index],
    'Target Score': rawDataPoints.target[index],
}));


// Student Profile Dummy Data (Updated with Indian Name)
const initialProfileData = {
    firstName: 'Ananya',
    lastName: 'Sharma',
    studentId: '21BCE1029', // Updated to look more like a college ID
    program: 'Computer Science',
    dob: '05/11/2005',
    joinDate: '01/08/2023',
    email: 'ananya.sharma@college.edu',
    phone: '987-654-3210',
    address: '45 Lotus Tower, Pune, MH',
    avatarUrl: 'https://placehold.co/120x120/7D5AFE/ffffff?text=AS',
    bannerColor: '#7D5AFE',
    currentSem: 'Fall 2025', // Added semester/year data
};

// Teacher Data for Current Semester (Updated with Indian names, titles, and subject codes)
const currentTeachers = [
  { name: 'Dr. Rohan Gupta', title: 'Professor', subject: 'Machine Learning', code: 'CS601', avatar: 'https://placehold.co/40x40/66BB6A/ffffff?text=RG', link: '#ml-res' },
  { name: 'Prof. Lakshmi Rao', title: 'Faculty', subject: 'Operating Systems', code: 'CS402', avatar: 'https://placehold.co/40x40/4DD0E1/ffffff?text=LR', link: '#os-res' },
  { name: 'Dr. Vivek Menon', title: 'Professor', subject: 'Digital Logic Design', code: 'EC305', avatar: 'https://placehold.co/40x40/FF8A65/ffffff?text=VM', link: '#logic-res' },
  { name: 'Ms. Priya Singh', title: 'Faculty', subject: 'Advanced Calculus', code: 'MA104', avatar: 'https://placehold.co/40x40/BA68C8/ffffff?text=PS', link: '#calc-res' },
];

// Data for the dedicated Events Page
const dedicatedEvents = [
    { 
        title: 'TechnoNova Fest 2025', 
        tag: 'Cultural & Tech', 
        date: '25th - 28th October', 
        location: 'College Auditorium', 
        icon: Award, 
        color: 'bg-red-500/10 text-red-500', 
        details: 'Annual college fest featuring music, drama, and tech competitions.',
        action: 'Register Now',
        actionLink: '#fest-register'
    },
    { 
        title: 'CodeSprint Hackathon', 
        tag: 'Coding Competition', 
        date: '15th November', 
        location: 'Computer Science Block', 
        icon: Code, 
        color: 'bg-blue-500/10 text-blue-500', 
        details: '24-hour hackathon challenging teams to build innovative solutions.',
        action: 'View Details',
        actionLink: '#hackathon-details'
    },
    { 
        title: 'Higher Ed Seminar Series', 
        tag: 'Academic', 
        date: '2nd, 9th, 16th December', 
        location: 'Zoom/Online', 
        icon: GraduationCap, 
        color: 'bg-green-500/10 text-green-500', 
        details: 'Guidance sessions on international Master\'s and PhD applications.',
        action: 'Join Webinar',
        actionLink: '#seminar-join'
    },
    { 
        title: 'Startup Pitch Day', 
        tag: 'Entrepreneurship', 
        date: '5th December', 
        location: 'Innovation Center', 
        icon: Zap, 
        color: 'bg-yellow-500/10 text-yellow-500', 
        details: 'Students present their business ideas to a panel of venture capitalists.',
        action: 'Submit Idea',
        actionLink: '#pitch-submit'
    },
];

// Resources Data for Learning Page
const semesterResources = [
    { subject: 'Machine Learning', link: '#ml-notes', type: 'Notes & Slides' },
    { subject: 'Operating Systems', link: '#os-videos', type: 'Video Lectures' },
    { subject: 'Digital Logic Design', link: '#dld-qbank', type: 'Question Bank' },
    { subject: 'Advanced Calculus', link: '#calc-solutions', type: 'Solution Manual' },
];

const guidanceTopics = [
    { title: 'Placement Preparation', icon: Target, description: 'Practice interviews, resume building, and company specific tests.' },
    // Changed 'Bulb' to 'Lightbulb'
    { title: 'Research Opportunities', icon: Lightbulb, description: 'Find faculty projects, write research proposals, and publish papers.' },
];

// Initial User Calendar Events
const initialUserEvents = [
    { id: 1, date: '2025-01-08', title: 'OS Midterm Prep', label: 'STUDY' },
    { id: 2, date: '2025-01-24', title: 'ML Project Deadline', label: 'DEADLINE' },
    { id: 3, date: '2025-02-15', title: 'Club Meeting', label: 'MEETING' },
];

// Initial Notification Data (System and Student-Added)
const initialNotifications = [
    { id: 101, title: 'New Assignment Posted', message: 'CS601: Machine Learning assignment 3 is now available.', time: '2 mins ago', unread: true, type: 'assignment' },
    { id: 102, title: 'Exam Schedule Update', message: 'Final exam schedule confirmed. Check the events tab.', time: '1 hour ago', unread: true, type: 'system' },
    { id: 103, title: 'Faculty Change', message: 'Prof. Rao added new lecture notes to OS402 resources.', time: '1 day ago', unread: false, type: 'resource' },
];

// --- Utility Components ---

const ChevronDown = (props) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6"/></svg>
);


// Placeholder for Clock icon (FIXED SVG SYNTAX)
const Clock = (props) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10"/>
        <polyline points="12 6 12 12 16 14"/>
    </svg>
);

const FixedDetail = ({ label, value, icon: Icon }) => (
    <div className="flex flex-col space-y-2 p-4 bg-purple-50 rounded-xl shadow-sm">
        <label className="text-xs text-purple-600 uppercase font-semibold flex items-center space-x-2">
            <Icon className="w-4 h-4" style={{ color: primaryColor }}/>
            <span>{label}</span>
        </label>
        <p className="text-base font-medium text-gray-800">{value}</p>
    </div>
);

// --- MODAL Component for Editing ---
const EditModal = ({ title, value, onSave, onClose, type, fieldName }) => {
    const [inputValue, setInputValue] = useState(value);

    const handleSave = () => {
        onSave(fieldName, inputValue);
        onClose();
    };

    const inputElement = (type) => {
        switch (type) {
            case 'color':
                return (
                    <input
                        type="color"
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        className="w-full h-10 cursor-pointer"
                    />
                );
            case 'url':
                return (
                    <input
                        type="url"
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        placeholder="Enter image URL"
                        className="w-full p-2 border rounded-md focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition duration-150"
                    />
                );
            default:
                return null;
        }
    };

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-xl shadow-2xl w-full max-w-sm">
                <div className="flex justify-between items-center mb-4 border-b pb-2">
                    <h3 className="text-xl font-bold text-gray-800">{title}</h3>
                    <button onClick={onClose} className="text-gray-500 hover:text-gray-800">
                        <X className="w-5 h-5" />
                    </button>
                </div>
                {inputElement(type)}
                <div className="mt-6 flex justify-end space-x-3">
                    <button onClick={onClose} className="px-4 py-2 text-gray-600 border rounded-xl hover:bg-gray-100">
                        Cancel
                    </button>
                    <button onClick={handleSave} className="px-4 py-2 text-white rounded-xl" style={{ background: primaryColor }}>
                        Save
                    </button>
                </div>
            </div>
        </div>
    );
};

// --- Calendar Logic ---

const CalendarPage = ({ userEvents, setUserEvents, primaryColor }) => {
    const today = new Date();
    const [currentDate, setCurrentDate] = useState(today);
    const [modalOpen, setModalOpen] = useState(false);
    const [newEvent, setNewEvent] = useState({ title: '', date: '', label: 'STUDY' });

    const currentMonth = currentDate.getMonth();
    const currentYear = currentDate.getFullYear();
    const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
    const monthDisplay = monthNames[currentMonth];
    
    // Calendar calculation logic
    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
    const firstDayOfWeek = new Date(currentYear, currentMonth, 1).getDay(); // 0 (Sun) to 6 (Sat)
    const startOffset = (firstDayOfWeek === 0 ? 6 : firstDayOfWeek - 1); // Adjust for Monday start

    const calendarDays = [];
    for (let i = 0; i < startOffset; i++) { calendarDays.push(null); }
    for (let i = 1; i <= daysInMonth; i++) { calendarDays.push(i); }

    // Navigation handlers
    const prevMonth = () => setCurrentDate(new Date(currentYear, currentMonth - 1, 1));
    const nextMonth = () => setCurrentDate(new Date(currentYear, currentMonth + 1, 1));

    // Event handlers
    const handleAddEvent = (e) => {
        e.preventDefault();
        if (newEvent.title && newEvent.date) {
            const dateObj = new Date(newEvent.date);
            // Ensure date is formatted consistently (YYYY-MM-DD)
            const dateStr = dateObj.toISOString().split('T')[0]; 
            const newEventData = {
                ...newEvent,
                date: dateStr,
                id: Date.now(),
            };
            setUserEvents(prev => [...prev, newEventData]);
            setNewEvent({ title: '', date: '', label: 'STUDY' });
            setModalOpen(false);
        }
    };
    
    // Filter events for the current month display
    const eventsForDisplay = userEvents.filter(event => {
        const date = new Date(event.date);
        return date.getMonth() === currentMonth && date.getFullYear() === currentYear;
    });

    const eventsByDay = eventsForDisplay.reduce((acc, event) => {
        const day = new Date(event.date).getDate();
        if (!acc[day]) acc[day] = [];
        acc[day].push(event);
        return acc;
    }, {});

    const AddEventModal = () => (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-xl shadow-2xl w-full max-w-lg">
                <h3 className="text-xl font-bold text-gray-800 mb-4 border-b pb-2">Add New Calendar Event</h3>
                <form onSubmit={handleAddEvent} className="space-y-4">
                    <input
                        type="text"
                        placeholder="Event Title (e.g., Study CS402, Meeting with Prof.)"
                        value={newEvent.title}
                        onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })}
                        className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                        required
                    />
                    <input
                        type="date"
                        value={newEvent.date}
                        onChange={(e) => setNewEvent({ ...newEvent, date: e.target.value })}
                        className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                        required
                    />
                    
                    <div className="flex flex-col space-y-2">
                        <label className="text-sm font-medium text-gray-700">Event Label:</label>
                        <div className="flex space-x-3 overflow-x-auto pb-2">
                            {Object.entries(eventLabels).map(([key, value]) => (
                                <button
                                    key={key}
                                    type="button"
                                    onClick={() => setNewEvent({ ...newEvent, label: key })}
                                    className={`px-4 py-2 text-sm rounded-full font-semibold border transition duration-150 whitespace-nowrap ${
                                        newEvent.label === key 
                                            ? `${value.color} text-white border-transparent shadow-md`
                                            : `border-gray-300 ${value.text} hover:bg-gray-100`
                                    }`}
                                >
                                    {key}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="flex justify-end space-x-3 pt-4">
                        <button type="button" onClick={() => setModalOpen(false)} className="px-4 py-2 text-gray-600 border rounded-xl hover:bg-gray-100">
                            Cancel
                        </button>
                        <button type="submit" className="px-4 py-2 text-white rounded-xl font-semibold" style={{ background: primaryColor }}>
                            <Plus className="w-4 h-4 inline-block mr-1" />
                            Add Event
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );

    return (
        <div className="p-6 pt-0 space-y-6">
            {modalOpen && <AddEventModal />}
            
            <div className="bg-white p-6 rounded-2xl shadow-xl">
                {/* Calendar Header and Navigation */}
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-3xl font-bold text-gray-800">{monthDisplay} {currentYear}</h1>
                    <div className="flex items-center space-x-3">
                        <button 
                            onClick={prevMonth} 
                            className="p-2 rounded-full text-gray-700 hover:bg-gray-100 transition duration-150"
                        >
                            <ChevronLeft className="w-5 h-5" />
                        </button>
                        <button 
                            onClick={() => setCurrentDate(today)} 
                            className="px-4 py-2 text-sm font-medium rounded-xl text-purple-600 border border-purple-600 hover:bg-purple-50"
                        >
                            Today
                        </button>
                        <button 
                            onClick={nextMonth} 
                            className="p-2 rounded-full text-gray-700 hover:bg-gray-100 transition duration-150"
                        >
                            <ChevronRight className="w-5 h-5" />
                        </button>
                        <button 
                            onClick={() => setModalOpen(true)}
                            className="px-4 py-2 text-sm font-medium rounded-xl text-white flex items-center space-x-1"
                            style={{ background: primaryColor }}
                        >
                            <Plus className="w-4 h-4" />
                            <span>Add Event</span>
                        </button>
                    </div>
                </div>

                {/* Calendar Grid */}
                <div className="grid grid-cols-7 border-t border-l border-gray-200">
                    {/* Day Headers */}
                    {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map((day) => (
                        <div key={day} className="py-3 px-2 text-sm font-semibold text-gray-600 text-center border-b border-r border-gray-200 bg-gray-50">
                            {day.slice(0, 3)}
                        </div>
                    ))}
                    
                    {/* Calendar Cells */}
                    {calendarDays.map((date, index) => {
                        const cellDate = date ? new Date(currentYear, currentMonth, date) : null;
                        const isToday = cellDate && cellDate.toDateString() === today.toDateString();
                        const events = date ? eventsByDay[date] || [] : [];

                        return (
                            <div
                                key={index}
                                className={`h-32 border-b border-r border-gray-200 p-2 text-sm relative transition duration-100
                                    ${date ? 'bg-white hover:bg-purple-50' : 'bg-gray-50 text-gray-400 cursor-default'}
                                `}
                            >
                                <div className={`font-bold w-6 h-6 rounded-full flex items-center justify-center mb-1 ${isToday ? 'bg-purple-600 text-white' : 'text-gray-700'}`}>
                                    {date}
                                </div>
                                <div className="space-y-0.5 overflow-y-auto max-h-20">
                                    {events.map(event => (
                                        <div key={event.id} className={`text-xs font-medium px-1.5 py-0.5 rounded-md truncate text-white ${eventLabels[event.label]?.color || 'bg-gray-300'}`}>
                                            {event.title}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
            
            {/* Legend/Event List */}
            <div className="bg-white p-6 rounded-2xl shadow-xl">
                <h2 className="text-xl font-semibold text-gray-800 mb-4">Event Legend</h2>
                <div className="flex flex-wrap gap-4">
                    {Object.entries(eventLabels).map(([key, value]) => (
                        <div key={key} className="flex items-center space-x-2">
                            <span className={`w-3 h-3 rounded-full ${value.color}`}></span>
                            <span className="text-sm font-medium text-gray-700">{key}</span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

// --- Notification Logic ---

const NotificationModal = ({ notifications, onClose, primaryColor, markAllAsRead }) => {
    const unreadCount = notifications.filter(n => n.unread).length;

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-xl shadow-2xl w-full max-w-2xl h-[90vh] flex flex-col">
                <div className="flex justify-between items-center mb-4 border-b pb-2">
                    <h3 className="text-2xl font-bold text-gray-800">Notifications ({unreadCount} Unread)</h3>
                    <button onClick={onClose} className="text-gray-500 hover:text-gray-800">
                        <X className="w-6 h-6" />
                    </button>
                </div>

                <div className="flex justify-end mb-4">
                    <button 
                        onClick={markAllAsRead} 
                        className="text-sm font-medium text-purple-600 hover:text-purple-800 flex items-center space-x-1"
                        disabled={unreadCount === 0}
                    >
                        <ClipboardCheck className="w-4 h-4" />
                        <span>Mark all as read</span>
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto space-y-3 pr-2">
                    {notifications.length === 0 ? (
                        <div className="text-center p-12 text-gray-500">
                            <Bell className="w-10 h-10 mx-auto mb-4" />
                            <p className="font-medium">You're all caught up! No new notifications.</p>
                        </div>
                    ) : (
                        notifications.map((n) => (
                            <div
                                key={n.id}
                                className={`p-4 rounded-xl flex items-start space-x-4 border transition duration-150 ${
                                    n.unread ? 'bg-purple-50 border-purple-200 shadow-sm' : 'bg-white border-gray-100'
                                } hover:shadow-md cursor-pointer`}
                            >
                                <div className={`p-2 rounded-full ${n.unread ? 'bg-purple-600' : 'bg-gray-300'}`}>
                                    {n.type === 'assignment' && <Code className="w-5 h-5 text-white" />}
                                    {n.type === 'system' && <Zap className="w-5 h-5 text-white" />}
                                    {n.type === 'resource' && <BookOpen className="w-5 h-5 text-white" />}
                                </div>
                                <div className="flex-1">
                                    <h4 className={`text-base font-semibold ${n.unread ? 'text-gray-800' : 'text-gray-600'}`}>
                                        {n.title}
                                    </h4>
                                    <p className="text-sm text-gray-600 mt-0.5">{n.message}</p>
                                    <p className="text-xs text-gray-400 mt-1">{n.time}</p>
                                </div>
                                {n.unread && (
                                    <div className="w-3 h-3 bg-red-500 rounded-full flex-shrink-0 mt-1" title="Unread"></div>
                                )}
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
};

const NotificationPopup = ({ notification, onClose }) => {
    // Custom class for slide-in animation
    const animationClass = 'animate-slideInFromLeft';
    
    useEffect(() => {
        const timer = setTimeout(onClose, 5000); // Auto-hide after 5 seconds
        return () => clearTimeout(timer);
    }, [onClose]);

    return (
        <div 
            className={`fixed top-4 left-4 z-50 transition-all duration-500 ${animationClass}`}
        >
            <style jsx="true">{`
                @keyframes slideInFromLeft {
                    0% { transform: translateX(-100%); opacity: 0; }
                    100% { transform: translateX(0); opacity: 1; }
                }
                .animate-slideInFromLeft {
                    animation: slideInFromLeft 0.5s ease-out forwards;
                }
            `}</style>
            <div className="bg-white p-4 rounded-xl shadow-xl border-l-4 w-80 flex items-center space-x-3 cursor-pointer" style={{ borderColor: primaryColor }} onClick={onClose}>
                <Bell className="w-5 h-5 text-purple-600 flex-shrink-0" />
                <div>
                    <h4 className="text-sm font-semibold text-gray-800 truncate">{notification.title}</h4>
                    <p className="text-xs text-gray-600 truncate">{notification.message}</p>
                    <p className="text-xs text-gray-400 mt-0.5">{notification.time}</p>
                </div>
                <button onClick={onClose} className="p-1 rounded-full text-gray-400 hover:bg-gray-100 flex-shrink-0">
                    <X className="w-4 h-4" />
                </button>
            </div>
        </div>
    );
};


// --- Site Layout Components ---

const Sidebar = ({ activeItem, setActiveItem }) => (
  // Updated background to a dark slate, matching auth page theme
  <div className="w-64 bg-slate-900 p-6 flex flex-col justify-between shadow-xl rounded-2xl m-3 sticky top-3 h-[calc(100vh-1.5rem)]">
    <div>
      {/* Logo Area */}
      <div className="flex items-center space-x-3 mb-10 p-2">
        <div className="w-10 h-10 rounded-xl overflow-hidden flex items-center justify-center bg-white">
  <img
    src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRyUYcIKz03Y7_p6D1phD5BqSo1C5NjcM13fuI9_TpUGPl7CZ4LJvZ-7cqVwL1fr4px_ww&usqp=CAU"
    alt="BIT Logo"
    className="w-full h-full object-contain"
  />
</div>

        <h1 className="text-xl font-extrabold text-white">BIT</h1>
      </div>

      {/* Main Menu */}
      <div className="space-y-2">
        <p className="text-xs font-semibold uppercase text-gray-400 pl-3 pt-4 pb-2">Main Menu</p>
        {navItems.map((item) => (
          <a
            key={item.name}
            href={item.link}
            onClick={() => setActiveItem(item.name)}
            className={`flex items-center space-x-3 p-3 rounded-xl transition-all duration-200 group ${
              activeItem === item.name
                ? 'bg-slate-700 text-white font-semibold shadow-inner' // Active state
                : 'text-gray-300 hover:bg-slate-800 hover:text-white' // Normal state
            }`}
          >
            <item.icon className={`w-5 h-5 ${activeItem === item.name ? 'text-white' : 'text-gray-400 group-hover:text-white'}`} />
            <span>{item.name}</span>
          </a>
        ))}
      </div>
    </div>
    
    {/* Removed the bottom illustration and user card */}
  </div>
);


const Header = ({ currentSem, unreadCount, openNotificationModal }) => (
  <div className="flex justify-between items-center p-6 bg-white shadow-sm rounded-xl m-6 mt-3 mb-4">
    {/* Left: Search Bar & Current Sem/Year */}
    <div className="flex items-center space-x-6 w-1/3">
      {/* Search Bar */}
      <div className="flex items-center space-x-2 flex-1">
        <Search className="w-5 h-5 text-gray-400" />
        <input
          type="text"
          placeholder="Search here..."
          className="flex-1 outline-none text-gray-700 bg-transparent placeholder-gray-400"
        />
      </div>
      {/* Current Sem/Year */}
      <div className="text-sm font-semibold text-purple-600 whitespace-nowrap">
        {currentSem}
      </div>
    </div>

    {/* Right: Icons and Profile (Updated with Indian Name) */}
    <div className="flex items-center space-x-6">
      <div className="flex items-center space-x-4">
        {/* Notification Bell with unread count */}
        <button className="relative p-1" onClick={openNotificationModal}>
            <Bell className="w-5 h-5 text-gray-500 hover:text-purple-600 cursor-pointer" />
            {unreadCount > 0 && (
                <span className="absolute top-0 right-0 block h-3 w-3 rounded-full ring-2 ring-white bg-red-500 text-white text-xs font-bold transform translate-x-1 -translate-y-1">
                </span>
            )}
        </button>

        <Grid className="w-5 h-5 text-gray-500 hover:text-purple-600 cursor-pointer" />
      </div>

      <div className="h-6 w-px bg-gray-200" />

      <div className="flex items-center space-x-2">
        <img
          src="https://placehold.co/40x40/7D5AFE/ffffff?text=AS"
          alt="Profile"
          className="w-10 h-10 rounded-full border-2 border-purple-300"
        />
        <div>
          <p className="text-sm font-semibold text-gray-900">A. Sharma</p>
          <p className="text-xs text-gray-500">Student</p>
        </div>
        <ChevronDown className="w-4 h-4 text-gray-500" />
      </div>
    </div>
  </div>
);

const StatCard = ({ title, value, change, icon: Icon, bgColor }) => (
  <div className="bg-white p-5 rounded-xl shadow-md flex items-start space-x-4 flex-1 transition duration-300 hover:shadow-lg">
    <div className={`p-3 rounded-xl ${bgColor}`}>
      <Icon className="w-5 h-5" />
    </div>
    <div>
      <p className="text-sm text-gray-500">{title}</p>
      <h2 className="2xl font-bold text-gray-800">{value}</h2>
      <p className="text-xs mt-1 font-medium text-gray-500">{change}</p>
    </div>
  </div>
);

// Recharts Component for Academic Growth
const AcademicGrowthChart = ({ title, legendItems, primaryColor, secondaryColor, data }) => {
    
    // Custom tooltip content to display data neatly
    const CustomTooltip = ({ active, payload, label }) => {
      if (active && payload && payload.length) {
        return (
          <div className="p-3 bg-white/90 border border-gray-200 rounded-lg shadow-xl text-xs backdrop-blur-sm">
            <p className="font-bold text-gray-800 mb-1">{label}</p>
            {payload.map((p, i) => (
                <p key={i} style={{ color: p.color }} className="font-medium">
                    {p.name}: {p.value}%
                </p>
            ))}
          </div>
        );
      }
      return null;
    };

    return (
        <div className="bg-white p-6 rounded-xl shadow-md h-full">
            <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-gray-800">{title}</h3>
                <div className="flex space-x-4 text-sm">
                    {legendItems.map((item, index) => (
                        <div key={index} className="flex items-center space-x-1">
                            <span className="w-2 h-2 rounded-full" style={{ backgroundColor: index === 0 ? primaryColor : secondaryColor }}></span>
                            <span className="text-gray-500">{item}</span>
                        </div>
                    ))}
                    <select className="text-xs text-gray-500 border rounded-md px-2 py-1">
                        <option>2025</option>
                        <option>2024</option>
                    </select>
                </div>
            </div>

            <ResponsiveContainer width="100%" height={260}>
                <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <defs>
                        {/* Gradient for Current GPA */}
                        <linearGradient id="colorPrimary" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor={primaryColor} stopOpacity={0.5}/>
                            <stop offset="95%" stopColor={primaryColor} stopOpacity={0}/>
                        </linearGradient>
                        {/* Gradient for Target Score */}
                        <linearGradient id="colorSecondary" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor={secondaryColor} stopOpacity={0.5}/>
                            <stop offset="95%" stopColor={secondaryColor} stopOpacity={0}/>
                        </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="name" stroke="#a0aec0" tickLine={false} axisLine={false} />
                    <YAxis stroke="#a0aec0" domain={[0, 100]} tickFormatter={(value) => `${value}%`} axisLine={false} tickLine={false} />
                    <Tooltip content={<CustomTooltip />} />
                    
                    {/* Current GPA Area */}
                    <Area 
                        type="monotone" 
                        dataKey="Current GPA" 
                        stroke={primaryColor} 
                        strokeWidth={3}
                        fillOpacity={1} 
                        fill="url(#colorPrimary)" 
                        dot={{ r: 4, fill: primaryColor, strokeWidth: 2 }}
                        activeDot={{ r: 6 }}
                    />
                    
                    {/* Target Score Area */}
                    <Area 
                        type="monotone" 
                        dataKey="Target Score" 
                        stroke={secondaryColor} 
                        strokeWidth={3}
                        fillOpacity={1} 
                        fill="url(#colorSecondary)" 
                        dot={{ r: 4, fill: secondaryColor, strokeWidth: 2 }}
                        activeDot={{ r: 6 }}
                    />
                </AreaChart>
            </ResponsiveContainer>
        </div>
    );
};

// Component for displaying current teachers (Restyled for vertical stacking)
const CurrentTeachersCard = ({ teachers }) => (
    <div className="bg-white p-6 rounded-xl shadow-md col-span-12">
        <h3 className="text-lg font-semibold text-gray-800 mb-6">Current Semester Faculty</h3>
        
        {/* Using simple space-y for vertical stacking, one card per row */}
        <div className="flex flex-col space-y-4">
            {teachers.map((teacher, index) => (
                <div 
                    key={index} 
                    // Card takes full width, maximum sensible size is set
                    className="w-full max-w-2xl p-5 bg-white rounded-xl shadow-lg border border-gray-100 transition duration-300 hover:shadow-xl hover:scale-[1.005]"
                >
                    <div className="flex items-start space-x-3 mb-4">
                        <img 
                            src={teacher.avatar} 
                            alt={teacher.name} 
                            className="w-12 h-12 rounded-full object-cover border-2" 
                            style={{ borderColor: primaryColor }} // Thematic avatar border
                        />
                        <div>
                            <p className="text-sm text-gray-500 font-medium">{teacher.title}</p>
                            <p className="text-lg font-bold text-gray-800">{teacher.name}</p>
                        </div>
                    </div>

                    <div className="space-y-3 mb-4 p-3 rounded-lg bg-purple-50 border-l-4" style={{ borderColor: primaryColor }}>
                        {/* Subject Handling */}
                        <div className="flex justify-between items-center text-sm">
                            <span className="font-semibold text-gray-700">{teacher.subject}</span>
                            <span className="px-2 py-0.5 text-xs font-bold rounded-full text-white" style={{ backgroundColor: primaryColor }}>
                                {teacher.code}
                            </span>
                        </div>
                    </div>
                    
                    {/* Resource Link Button */}
                    <a 
                        href={teacher.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-center space-x-2 text-sm text-white hover:opacity-90 font-medium transition duration-200 p-2 rounded-xl"
                        style={{ backgroundColor: primaryColor }}
                    >
                        <Link className="w-4 h-4" />
                        <span>Lecture Resources</span>
                    </a>
                </div>
            ))}
        </div>
    </div>
);


const SubjectGrowthChart = () => {
    const subjects = [
        { name: 'Math', growth: 78, target: 85, color: 'bg-indigo-500' },
        { name: 'Physics', growth: 65, target: 80, color: 'bg-red-500' },
        { name: 'English', growth: 90, target: 95, color: 'bg-green-500' },
        { name: 'History', growth: 72, target: 75, color: 'bg-yellow-500' },
    ];
    return (
        <div className="bg-white p-6 rounded-xl shadow-md col-span-12 lg:col-span-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-6">Subject-wise Growth</h3>
            <div className="space-y-4">
                {subjects.map((subject, index) => (
                    <div key={index} className="flex flex-col">
                        <div className="flex justify-between text-sm font-medium mb-1">
                            <span className="text-gray-700">{subject.name}</span>
                            <span className="text-gray-500">{subject.growth}% (Target: {subject.target}%)</span>
                        </div>
                        <div className="w-full bg-gray-100 rounded-full h-2.5">
                            <div
                                className={`h-2.5 rounded-full ${subject.color}`}
                                style={{ width: `${subject.growth}%`, transition: 'width 1s ease-out' }}
                            ></div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

const UpcomingEventsCard = ({ events }) => (
  <div className="bg-white p-6 rounded-xl shadow-md">
    <div className="flex justify-between items-center mb-4">
      <h3 className="text-lg font-semibold text-gray-800">Upcoming Events</h3>
      <button className="text-sm font-medium text-purple-600 hover:text-purple-800">
        View All
      </button>
    </div>

    <div className="space-y-4">
      {events.map((event, index) => (
        <div key={index} className="flex space-x-4 items-center border-b pb-4 last:border-b-0 last:pb-0">
          {/* Date box */}
          <div className="flex flex-col items-center justify-center w-12 h-14 rounded-xl bg-purple-50 p-1">
            <span className="text-lg font-bold text-purple-600">{event.day}</span>
            <span className="text-xs text-gray-500">{event.date}</span>
          </div>
          {/* Event details */}
          <div>
            <p className="text-sm font-semibold text-gray-800">{event.title}</p>
            <p className="text-xs text-gray-500 mt-0.5">{event.time}</p>
          </div>
        </div>
      ))}
    </div>

    <button className="w-full mt-6 py-2 rounded-xl text-white font-medium" style={{ background: primaryColor }}>
      + New Event
    </button>
  </div>
);

const HigherEducationCard = () => (
    <div className="bg-white p-6 rounded-xl shadow-md col-span-12 lg:col-span-6">
        <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-gray-800">Higher Education Progress</h3>
            <Star className="w-5 h-5 text-yellow-500" fill="currentColor" />
        </div>

        <p className="text-sm text-gray-600 mb-4">You are tracking toward your goal university. Keep up the GPA!</p>

        <div className="space-y-3">
            <div className="flex justify-between items-center text-sm font-medium">
                <span className="text-gray-700 flex items-center space-x-2"><Zap className="w-4 h-4 text-pink-500"/> Target GPA: 4.5</span>
                <span className="text-pink-500 font-bold">In Progress</span>
            </div>
            <div className="w-full bg-gray-100 rounded-full h-2">
                <div className="h-2 rounded-full bg-pink-500" style={{ width: '85%' }}></div>
            </div>

            <div className="flex justify-between items-center text-sm font-medium pt-3">
                <span className="text-gray-700 flex items-center space-x-2"><Send className="w-4 h-4 text-blue-500"/> Applications Sent</span>
                <span className="text-blue-500 font-bold">3/5 Completed</span>
            </div>
            <div className="w-full bg-gray-100 rounded-full h-2">
                <div className="h-2 rounded-full bg-blue-500" style={{ width: '60%' }}></div>
            </div>
        </div>

        <button className="w-full mt-6 py-2 text-purple-600 font-medium border border-purple-600 rounded-xl hover:bg-purple-50 transition duration-200">
            Explore University Matches
        </button>
    </div>
);

// --- New Daily Thought Card Component for Dashboard ---
const DailyThoughtCard = ({ studentName }) => {
    const [thought, setThought] = useState("The greatest pleasure in life is doing what people say you cannot do.");
    const [isEditing, setIsEditing] = useState(false);

    return (
        <div 
            className="p-6 rounded-xl border-4 border-dashed bg-white shadow-md flex flex-col justify-between h-full"
            style={{ borderColor: primaryColor + '40' }} // Light purple dash border
        >
            <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center space-x-2">
                    <BookOpen className="w-5 h-5 text-purple-600" />
                    <span>Daily Thought</span>
                </h3>

                {isEditing ? (
                    <textarea
                        value={thought}
                        onChange={(e) => setThought(e.target.value)}
                        className="w-full min-h-[100px] p-2 text-md italic text-gray-700 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 transition"
                        placeholder="Write your thought here..."
                    />
                ) : (
                    <p className="text-xl italic text-gray-700 leading-relaxed transition duration-300">
                        "{thought}"
                    </p>
                )}
            </div>
            
            <div className="mt-4 flex justify-between items-center pt-3 border-t border-gray-100">
                <p className="text-sm font-medium text-gray-500">
                    — {studentName}
                </p>
                <button
                    onClick={() => setIsEditing(!isEditing)}
                    className="flex items-center space-x-1 text-sm font-medium px-3 py-1 rounded-xl transition duration-200"
                    style={{ color: primaryColor, backgroundColor: primaryColor + '10' }}
                >
                    {isEditing ? (
                        <>
                            <Save className="w-4 h-4" />
                            <span>Save</span>
                        </>
                    ) : (
                        <>
                            <Edit3 className="w-4 h-4" />
                            <span>Edit</span>
                        </>
                    )}
                </button>
            </div>
        </div>
    );
};


// --- Updated Calendar Mockup for Dashboard (to show user events) ---
const CalendarMockup = ({ userEvents }) => {
    const today = new Date();
    const currentMonth = today.getMonth();
    const currentYear = today.getFullYear();

    // Map user events to a set of dates for the current month
    const currentMonthEvents = userEvents
        .filter(event => {
            const date = new Date(event.date);
            return date.getMonth() === currentMonth && date.getFullYear() === currentYear;
        })
        .map(event => new Date(event.date).getDate());

    // Generate month details dynamically (January is only for mock-up consistency)
    const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
    const month = monthNames[currentMonth];
    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
    const firstDayOfWeek = new Date(currentYear, currentMonth, 1).getDay(); // 0 (Sun) to 6 (Sat)
    const startOffset = (firstDayOfWeek === 0 ? 6 : firstDayOfWeek - 1); // Adjust for Monday start (0=Mon, 6=Sun)

    const calendarDays = [];
    for (let i = 0; i < startOffset; i++) { calendarDays.push(null); }
    for (let i = 1; i <= daysInMonth; i++) { calendarDays.push(i); }

    return (
        <div className="bg-white p-6 rounded-xl shadow-md col-span-12 lg:col-span-6">
            <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-semibold text-gray-800">School Calendar</h3>
                <div className="flex items-center space-x-3 text-sm font-medium">
                    <span className="text-purple-600">{month}</span>
                    <span className="text-gray-500">{currentYear}</span>
                </div>
            </div>
            <div className="grid grid-cols-7 gap-1 text-center">
                {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day) => (
                    <div key={day} className="text-sm font-semibold text-gray-500 mb-2">
                        {day}
                    </div>
                ))}
                {/* Render calendar days */}
                {calendarDays.map((date, index) => {
                    const isEventDay = date && currentMonthEvents.includes(date);
                    const isToday = date === today.getDate() && currentMonth === today.getMonth();

                    return (
                        <div
                            key={index}
                            className={`p-1.5 rounded-xl text-sm font-medium cursor-default transition duration-150 relative ${
                                date
                                    ? 'text-gray-700'
                                    : 'text-gray-300 pointer-events-none'
                            } ${isToday ? 'bg-purple-600 text-white shadow-lg font-bold' : ''} 
                              ${isEventDay && !isToday ? 'bg-purple-100 text-purple-700 font-semibold border-2 border-purple-300' : ''}
                            `}
                        >
                            {date}
                            {isEventDay && !isToday && (
                                <span className="absolute bottom-0 right-0 w-1 h-1 bg-purple-600 rounded-full"></span>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
};


// --- StudentProfile Component with Editable Avatar/Banner ---

const StudentProfile = ({ primaryColor }) => {
    const [profile, setProfile] = useState(initialProfileData);
    const [isEditingContact, setIsEditingContact] = useState(false);
    const [editContactData, setEditContactData] = useState(initialProfileData);
    const [modal, setModal] = useState(null); // { type: 'avatar' | 'banner', fieldName: 'string' }

    const handleContactEdit = (field, value) => {
        setEditContactData(prev => ({ ...prev, [field]: value }));
    };

    const handleContactSave = () => {
        setProfile(editContactData);
        setIsEditingContact(false);
    };

    const handleModalSave = (field, value) => {
        setProfile(prev => ({ ...prev, [field]: value }));
    };

    const EditableField = ({ label, value, icon: Icon, fieldName, isEditing }) => (
        <div className="flex flex-col space-y-2 p-4 bg-white border border-gray-200 rounded-xl shadow-sm">
            <label className="text-xs text-purple-600 uppercase font-semibold flex items-center space-x-2">
                <Icon className="w-4 h-4" style={{ color: primaryColor }}/>
                <span>{label}</span>
            </label>
            {isEditing ? (
                <input
                    type="text"
                    value={editContactData[fieldName]}
                    onChange={(e) => handleContactEdit(fieldName, e.target.value)}
                    className="text-base font-medium text-gray-800 border-b border-gray-300 focus:outline-none focus:border-purple-500 transition duration-150"
                />
            ) : (
                <p className="text-base font-medium text-gray-800">{value}</p>
            )}
        </div>
    );

    // --- Profile Card Components ---

    const ProfileCardHeader = () => (
        <div 
            className="p-8 pb-16 relative rounded-t-2xl group cursor-pointer" 
            style={{ background: `linear-gradient(135deg, ${profile.bannerColor} 0%, ${profile.bannerColor}E0 100%)` }}
            onClick={() => setModal({ type: 'color', fieldName: 'bannerColor', value: profile.bannerColor, title: 'Edit Banner Color' })}
        >
            <div className="flex items-center space-x-3 absolute top-4 right-4 text-white opacity-0 group-hover:opacity-100 transition duration-300">
                <Camera className="w-4 h-4" />
                <span className="text-sm font-medium">Edit Banner</span>
            </div>
            
            {/* Using flex-start for avatar alignment, fixed spacing */}
            <div className="flex items-start space-x-6">
                
                {/* Editable Avatar - Adjusted margin top for better vertical alignment */}
                <div 
                    className="relative w-32 h-32 rounded-full border-4 border-white shadow-lg group/avatar mt-2"
                    onClick={(e) => {
                        e.stopPropagation(); // Prevent card banner click
                        setModal({ type: 'url', fieldName: 'avatarUrl', value: profile.avatarUrl, title: 'Edit Avatar URL' });
                    }}
                >
                    <img
                        src={profile.avatarUrl}
                        alt="Student Profile"
                        className="w-full h-full rounded-full object-cover"
                        onError={(e) => { e.target.onerror = null; e.target.src = "https://placehold.co/120x120/7D5AFE/ffffff?text=AS" }}
                    />
                    <div className="absolute inset-0 rounded-full bg-black/50 flex items-center justify-center opacity-0 group-hover/avatar:opacity-100 transition duration-300">
                        <Camera className="w-6 h-6 text-white" />
                    </div>
                </div>

                {/* Information block (Name H1, then Branch/ID line) */}
                <div className="mt-4 space-y-2">
                    {/* H1 Tag with bold Student Name */}
                    <h1 className="text-4xl font-extrabold text-white">
                        {profile.firstName} {profile.lastName}
                    </h1>
                    
                    {/* Program | Student ID line */}
                    <p className="text-lg font-medium text-white opacity-90">
                        {profile.program} | Student ID: {profile.studentId}
                    </p>
                </div>
            </div>
        </div>
    );

    return (
        <div className="p-6 pt-0 space-y-6 max-w-5xl mx-auto">
            {/* Render Modal if active */}
            {modal && (
                <EditModal
                    title={modal.title}
                    value={modal.value}
                    onSave={handleModalSave}
                    onClose={() => setModal(null)}
                    type={modal.type}
                    fieldName={modal.fieldName}
                />
            )}

            {/* ID Card Header / Bio Section */}
            <div className="bg-white rounded-2xl shadow-xl overflow-hidden relative">
                <ProfileCardHeader />

                {/* Fixed Details (College Record) */}
                <div className="bg-white p-6 pt-16 -mt-12 rounded-t-2xl">
                    <h3 className="text-xl font-semibold text-gray-800 mb-4 border-b pb-2">College Record</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <FixedDetail label="Date of Birth" value={profile.dob} icon={Calendar} />
                        <FixedDetail label="Program Enrollment" value={profile.program} icon={GraduationCap} />
                        <FixedDetail label="Date Joined" value={profile.joinDate} icon={Clock} />
                    </div>
                </div>
            </div>

            {/* Editable Contact Details */}
            <div className="bg-white p-6 rounded-2xl shadow-xl">
                <div className="flex justify-between items-center mb-6 border-b pb-2">
                    <h3 className="text-xl font-semibold text-gray-800">Personal Contact Information</h3>
                    <button 
                        onClick={() => {
                            if (isEditingContact) {
                                // Cancel editing, revert temporary changes
                                setEditContactData(profile);
                            }
                            setIsEditingContact(!isEditingContact);
                        }}
                        className={`px-4 py-2 text-sm font-medium rounded-xl flex items-center space-x-2 transition duration-200 ${
                            isEditingContact 
                                ? 'bg-red-500 hover:bg-red-600 text-white' 
                                : 'text-purple-600 border border-purple-600 hover:bg-purple-50'
                        }`}
                    >
                        {isEditingContact ? (
                            <>
                                <X className="w-4 h-4" />
                                <span>Cancel</span>
                            </>
                        ) : (
                            <>
                                <Edit3 className="w-4 h-4" />
                                <span>Edit Details</span>
                            </>
                        )}
                    </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <EditableField label="Email Address" value={profile.email} icon={Mail} fieldName="email" isEditing={isEditingContact} />
                    <EditableField label="Phone Number" value={profile.phone} icon={Phone} fieldName="phone" isEditing={isEditingContact} />
                    <EditableField label="Residential Address" value={profile.address} icon={MapPin} fieldName="address" isEditing={isEditingContact} />
                </div>

                {isEditingContact && (
                    <div className="flex justify-end mt-6">
                        <button
                            onClick={handleContactSave}
                            className="px-6 py-3 text-white font-semibold rounded-xl flex items-center space-x-2 shadow-lg hover:shadow-xl transition duration-200"
                            style={{ background: primaryColor }}
                        >
                            <Save className="w-4 h-4" />
                            <span>Save Changes</span>
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

// --- Other Page Components (Simplified for brevity) ---

const FacultyPage = ({ teachers }) => (
    <div className="p-6 pt-0 space-y-6">
        <CurrentTeachersCard teachers={teachers} />
    </div>
);

const EventsPage = ({ events, primaryColor }) => (
    <div className="p-6 pt-0 space-y-6">
        <p className="text-lg text-gray-600">Don't miss out on upcoming fests, hackathons, and academic seminars designed to boost your college experience.</p>
        
        {/* Event Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {events.map((event, index) => {
                const Icon = event.icon;
                const isPrimaryEvent = event.tag.includes('Fest') || event.tag.includes('Hackathon');
                return (
                    <div key={index} className={`p-6 rounded-xl shadow-lg border-t-4 transition duration-300 hover:shadow-2xl ${isPrimaryEvent ? 'bg-white' : 'bg-gray-50'}`} 
                        style={{ borderColor: primaryColor }}
                    >
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center space-x-3">
                                <div className={`p-3 rounded-full ${event.color}`}>
                                    <Icon className="w-5 h-5" style={{ color: isPrimaryEvent ? primaryColor : undefined }}/>
                                </div>
                                <span className="text-sm font-semibold text-gray-600">{event.tag}</span>
                            </div>
                            <div className="text-xs font-medium px-3 py-1 rounded-full text-white" style={{ backgroundColor: primaryColor }}>
                                Upcoming
                            </div>
                        </div>

                        <h2 className="text-xl font-bold text-gray-800 mb-2">{event.title}</h2>
                        <p className="text-sm text-gray-600 mb-4">{event.details}</p>

                        <div className="space-y-2 border-t pt-4 border-dashed border-gray-200">
                            <div className="flex items-center text-sm text-gray-700 space-x-2">
                                <Calendar className="w-4 h-4 text-purple-500" />
                                <span className="font-medium">{event.date}</span>
                            </div>
                            <div className="flex items-center text-sm text-gray-700 space-x-2">
                                <MapPin className="w-4 h-4 text-purple-500" />
                                <span className="font-medium">{event.location}</span>
                            </div>
                        </div>

                        <a 
                            href={event.actionLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="mt-6 block w-full text-center py-2 rounded-xl text-white font-semibold transition duration-200 hover:opacity-90"
                            style={{ backgroundColor: primaryColor }}
                        >
                            {event.action}
                        </a>
                    </div>
                );
            })}
        </div>

        {/* Call to Action for Organizers */}
        <div className="p-6 bg-purple-50 rounded-xl border-2 border-dashed" style={{ borderColor: primaryColor }}>
            <h3 className="text-xl font-bold text-purple-800 flex items-center space-x-2">
                <ClipboardCheck className="w-6 h-6" />
                <span>Organize an Event</span>
            </h3>
            <p className="text-gray-600 mt-2">Have an idea for a new club event or competition? Submit your proposal through the student council portal.</p>
            <button className="mt-4 px-4 py-2 text-sm font-semibold rounded-xl text-white" style={{ backgroundColor: primaryColor }}>
                Submit Proposal
            </button>
        </div>
    </div>
);

const LearningPage = ({ resources, guidance, primaryColor }) => (
    <div className="p-6 pt-0 space-y-8">
        {/* 1. Semester Resources */}
        <div className="bg-white p-6 rounded-2xl shadow-xl">
            <h2 className="text-2xl font-semibold text-gray-800 mb-6 border-b pb-2">Current Semester Resources</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {resources.map((res, index) => (
                    <a
                        key={index}
                        href={res.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-4 rounded-xl border border-gray-200 hover:shadow-md transition duration-200 flex flex-col justify-between"
                    >
                        <p className="text-lg font-bold text-gray-800 mb-1">{res.subject}</p>
                        <div className="flex justify-between items-center text-sm">
                            <span className="text-purple-600 font-medium">{res.type}</span>
                            <Link className="w-4 h-4 text-gray-500" />
                        </div>
                    </a>
                ))}
            </div>
        </div>

        {/* 2. Extra Guidance (Placement & Research) */}
        <div className="bg-white p-6 rounded-2xl shadow-xl">
            <h2 className="2xl font-semibold text-gray-800 mb-6 border-b pb-2">Career & Growth Guidance</h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {guidance.map((topic, index) => {
                    const Icon = topic.icon;
                    return (
                        <div key={index} className="flex flex-col p-6 rounded-xl border-l-4" style={{ borderColor: primaryColor, backgroundColor: primaryColor + '08' }}>
                            <Icon className="w-8 h-8 mb-3" style={{ color: primaryColor }} />
                            <h3 className="text-xl font-bold text-gray-800 mb-2">{topic.title}</h3>
                            <p className="text-gray-600 mb-4">{topic.description}</p>
                            <button
                                className="mt-auto px-4 py-2 text-sm font-semibold rounded-xl text-white w-full"
                                style={{ backgroundColor: primaryColor }}
                            >
                                Start Guide
                            </button>
                        </div>
                    );
                })}
            </div>
        </div>

        {/* 3. Daily Thought Writing (Moved to Dashboard) - Placeholder on Learning Page */}
        <div className="text-center p-8 bg-gray-100 rounded-xl border-2 border-dashed border-gray-300">
            <p className="text-gray-600">Daily Thought Writing is featured on the main **Dashboard** for quick access.</p>
        </div>
    </div>
);

// --- New Explore Page Component ---
const exploreFeatures = [
  { 
    title: 'AI Resume Builder', 
    tag: 'Career Tool',
    details: 'Create a professional resume tailored to job descriptions in minutes.',
    icon: Award,
    color: 'bg-purple-500/10 text-purple-500',
    action: 'Launch Tool',
    actionLink: '#resume-builder',
  },
  { 
    title: 'Personalized Roadmaps', 
    tag: 'Guidance',
    details: 'Get step-by-step guidance and custom learning paths for your dream career.',
    icon: Target,
    color: 'bg-green-500/10 text-green-500',
    action: 'Find Your Path',
    actionLink: '#roadmaps',
  },
  { 
    title: 'Targeted Problem Solving', 
    tag: 'Practice',
    details: 'Sharpen your coding skills with curated problems from top companies.',
    icon: Code,
    color: 'bg-red-500/10 text-red-500',
    action: 'Start Solving',
    actionLink: '#problems',
  },
  { 
    title: 'Interactive Module Notes', 
    tag: 'Learning',
    details: 'Access comprehensive notes with quizzes to reinforce your learning.',
    icon: BookOpen,
    color: 'bg-blue-500/10 text-blue-500',
    action: 'View Notes',
    actionLink: '#notes',
  },
  { 
    title: 'Mock Interviews', 
    tag: 'Preparation',
    details: 'Simulate real-world interviews with AI or peers and get instant feedback.',
    icon: User,
    color: 'bg-pink-500/10 text-pink-500',
    action: 'Practice Now',
    actionLink: '#interviews',
  },
  { 
    title: 'Project Collaboration', 
    tag: 'Experience',
    details: 'Build your portfolio by collaborating on real-world projects with teammates.',
    icon: Grid,
    color: 'bg-yellow-500/10 text-yellow-500',
    action: 'Find a Project',
    actionLink: '#projects',
  },
];

const ExplorePage = ({ primaryColor }) => (
    <div className="p-6 pt-0 animate-fadeIn">
        <style>{`
            @keyframes fadeIn {
                from { opacity: 0; transform: translateY(10px); }
                to { opacity: 1; transform: translateY(0); }
            }
            .animate-fadeIn { animation: fadeIn 0.5s ease-out forwards; }
        `}</style>
         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {exploreFeatures.map((feature, index) => {
                const Icon = feature.icon;
                return (
                    <div key={index} className="p-6 rounded-xl shadow-lg border-t-4 bg-white transition duration-300 hover:shadow-2xl" 
                        style={{ borderColor: primaryColor }}
                    >
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center space-x-3">
                                <div className={`p-3 rounded-full ${feature.color}`}>
                                    <Icon className="w-5 h-5" style={{ color: primaryColor }}/>
                                </div>
                                <span className="text-sm font-semibold text-gray-600">{feature.tag}</span>
                            </div>
                            <div className="text-xs font-medium px-3 py-1 rounded-full text-white" style={{ backgroundColor: primaryColor }}>
                                Feature
                            </div>
                        </div>

                        <h2 className="text-xl font-bold text-gray-800 mb-2">{feature.title}</h2>
                        <p className="text-sm text-gray-600 mb-4 h-16">{feature.details}</p>

                        <div className="border-t pt-4 border-dashed border-gray-200">
                             <a 
                                href={feature.actionLink}
                                className="mt-2 block w-full text-center py-2 rounded-xl text-white font-semibold transition duration-200 hover:opacity-90"
                                style={{ backgroundColor: primaryColor }}
                            >
                                {feature.action}
                            </a>
                        </div>
                    </div>
                );
            })}
        </div>
    </div>
);


// Dashboard Content component (extracted for routing)
const DashboardContent = ({ studentStats, academicData, upcomingEvents, primaryColor, secondaryColor, studentName, userEvents }) => (
    <div className="p-6 pt-0 space-y-6">
        {/* Row 2: Stat Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {studentStats.map((stat, index) => (
                <StatCard key={index} {...stat} />
            ))}
        </div>

        {/* Row 3: Main Performance Graphs and Events (Split 3/4 and 1/4) */}
        <div className="grid grid-cols-12 gap-6">
            <div className="col-span-12 lg:col-span-9">
                <AcademicGrowthChart
                    title="Academics Growth (GPA & Average Score)"
                    legendItems={['Current GPA', 'Target Score']}
                    primaryColor={primaryColor}
                    secondaryColor={secondaryColor}
                    data={academicData}
                />
            </div>

            <div className="col-span-12 lg:col-span-3">
                <UpcomingEventsCard events={upcomingEvents} />
            </div>
        </div>

        {/* Row 4: Subject Growth, Calendar, Higher Ed (Split 1/2 and 1/2) */}
        <div className="grid grid-cols-12 gap-6">
            <div className="col-span-12 lg:col-span-6 space-y-6">
                <SubjectGrowthChart />
                {/* Replaced 'Increase your knowledge by learning' card with Daily Thought Card */}
                <DailyThoughtCard studentName={studentName} /> 
            </div>

            <HigherEducationCard />
        </div>

        {/* Row 5: Dashboard Calendar (Using the updated Mockup with user events) */}
        <div className="grid grid-cols-12 gap-6">
            <div className="col-span-12">
                <CalendarMockup userEvents={userEvents} />
            </div>
        </div>
    </div>
);


// --- Main App Component (Routing Logic Added) ---

const App = () => {
  const [activeItem, setActiveItem] = useState('Dashboard');
  const [userEvents, setUserEvents] = useState(initialUserEvents);
  const [notifications, setNotifications] = useState(initialNotifications);
  const [isNotificationModalOpen, setIsNotificationModalOpen] = useState(false);
  const [liveNotification, setLiveNotification] = useState(null);
  
  // Combine first and last name for the thought card signature
  const studentFullName = `${initialProfileData.firstName} ${initialProfileData.lastName}`;

  const unreadCount = notifications.filter(n => n.unread).length;

  // Function to simulate a new notification arriving (e.g., triggered by a button or timer)
  const pushNewNotification = useCallback((newNotif) => {
    setNotifications(prev => [newNotif, ...prev]);
    setLiveNotification(newNotif);
  }, []);

  // Handler for opening the modal (called from Header Bell icon and Sidebar link)
  const openNotificationModal = () => {
      setIsNotificationModalOpen(true);
      setActiveItem('Notification'); // Set sidebar to notification when modal opens
  };
  
  const closeNotificationModal = () => {
      setIsNotificationModalOpen(false);
      // Optional: change active item back to Dashboard if it was Notification
      if (activeItem === 'Notification') {
          setActiveItem('Dashboard'); 
      }
  };

  // Handler for marking all notifications as read
  const markAllAsRead = () => {
      setNotifications(notifications.map(n => ({ ...n, unread: false })));
  };

  // Simulate a notification arrival shortly after load
  useEffect(() => {
    const timer = setTimeout(() => {
        pushNewNotification({ 
            id: Date.now(), 
            title: 'New Event Added', 
            message: 'A new Hackathon was added to the Events schedule!', 
            time: 'Just now', 
            unread: true, 
            type: 'system' 
        });
    }, 2000);
    return () => clearTimeout(timer);
  }, [pushNewNotification]);


  const renderContent = () => {
    switch (activeItem) {
        case 'Student Profile':
            return <StudentProfile primaryColor={primaryColor} />;
        case 'Faculty':
            return <FacultyPage teachers={currentTeachers} />;
        case 'Events':
            return <EventsPage events={dedicatedEvents} primaryColor={primaryColor} />;
        case 'Learning': // Handle the new 'Learning' tab
            return <LearningPage 
                        resources={semesterResources} 
                        guidance={guidanceTopics} 
                        primaryColor={primaryColor} 
                    />;
        case 'Explore':
            return <ExplorePage primaryColor={primaryColor} />;
        case 'Calendar': // Handle the new 'Calendar' tab
            return <CalendarPage userEvents={userEvents} setUserEvents={setUserEvents} primaryColor={primaryColor} />;
        case 'Notification':
             // When 'Notification' is clicked in the sidebar, we open the modal
            if (!isNotificationModalOpen) {
                setIsNotificationModalOpen(true);
            }
            return <div className="p-6 pt-0 text-gray-500">
                <p className="text-xl">Viewing Notifications</p>
                <p className="mt-2">The full list of notifications is shown in the popup window. Close the popup to return to the dashboard.</p>
            </div>;

        case 'Dashboard':
        default:
            return (
                <DashboardContent 
                    studentStats={studentStats}
                    academicData={academicData}
                    upcomingEvents={upcomingEvents}
                    primaryColor={primaryColor}
                    secondaryColor={secondaryColor}
                    studentName={studentFullName} // Pass full name to dashboard
                    userEvents={userEvents} // Pass user events to dashboard
                />
            );
    }
  };

  const getPageTitle = () => {
    if (activeItem === 'Student Profile') return 'Student Profile';
    if (activeItem === 'Faculty') return 'Faculty Directory';
    if (activeItem === 'Events') return 'Upcoming College Events';
    if (activeItem === 'Learning') return 'Learning & Growth Hub';
    if (activeItem === 'Explore') return 'Explore CampusVersa Features';
    if (activeItem === 'Calendar') return 'My Personal Calendar';
    if (activeItem === 'Notification') return 'Notifications';
    return 'Student Dashboard';
  };

  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      <style>{`
        /* Custom font import for better aesthetic */
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;800&display=swap');
        body { font-family: 'Inter', sans-serif; }
      `}</style>
      <div className="flex">
        {/* Sidebar */}
        <Sidebar activeItem={activeItem} setActiveItem={setActiveItem} />

        {/* Main Content Area */}
        <div className="flex-1 min-w-0 overflow-hidden pt-3 pr-3">
          {/* Header - Pass unread count and modal handler */}
          <Header 
            currentSem={initialProfileData.currentSem} 
            unreadCount={unreadCount} 
            openNotificationModal={openNotificationModal}
          />

          {/* Dashboard Title and Actions */}
          <div className="px-6 py-4 flex justify-between items-center">
            <h1 className="text-3xl font-bold text-gray-800">{getPageTitle()}</h1>
            <div className="flex space-x-3">
              <button className="flex items-center space-x-2 px-4 py-2 text-sm font-medium rounded-xl text-white shadow-lg" style={{ background: primaryColor }}>
                <User className="w-4 h-4" />
                <span>My Profile</span>
              </button>
            </div>
          </div>

          {/* Live Notification Popup */}
          {liveNotification && (
              <NotificationPopup 
                  notification={liveNotification} 
                  onClose={() => setLiveNotification(null)}
              />
          )}

          {/* Dynamic Content */}
          {renderContent()}

          {/* Notification Modal (Always on top when open) */}
          {isNotificationModalOpen && (
              <NotificationModal 
                  notifications={notifications} 
                  onClose={closeNotificationModal}
                  primaryColor={primaryColor}
                  markAllAsRead={markAllAsRead}
              />
          )}
        </div>
      </div>
    </div>
  );
};

export default App;

