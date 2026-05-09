# Project Context: CampusVersa

## 🚀 Overview
**CampusVersa** is a unified educational management and compliance platform designed to streamline institutional operations and automate accreditation processes (NAAC/NIRF). It leverages advanced AI for data extraction, real-time communication for collaboration, and automated verification systems for academic integrity.

---

## 🏗️ Technical Architecture

### **Backend (Node.js/Express)**
- **API Design**: RESTful architecture handling complex workflows for multiple user roles (Super Admin, Institute Admin, Faculty, Student).
- **Database**: MongoDB with Mongoose, utilizing a structured schema for institutes, faculty, students, and compliance metrics.
- **Real-time Engine**: Socket.io implementation with room-based isolation (Institute -> Role -> Department) for instant notifications and updates.
- **AI Engine**: Hybrid integration using **Google Gemini 1.5/2.0** and **OpenAI (GPT-4o)** with deterministic local fallbacks.
  - *Timetable Generation*: AI-driven scheduling based on faculty availability and course requirements.
  - *Data Extraction*: Automated parsing of NIRF/NAAC data from unstructured PDFs and CSVs using advanced LLMs.
  - *Insight Generation*: Actionable suggestions for improving institutional accreditation scores.
- **Verification Service**: Integration with **SerpApi (Google Scholar)** to verify faculty research publications in real-time.

### **Frontend (React/Vite)**
- **Framework**: React 19 with Vite for high-performance development and builds.
- **Styling**: Tailwind CSS for responsive, modern UI components.
- **Animations**: Framer Motion for smooth micro-interactions and transitions.
- **Visualization**: Recharts for institutional data analytics and performance tracking.
- **State Management**: React Router for navigation and role-based access control (RBAC).

---

## 👥 User Hierarchy & Detailed Features

### **1. Super Admin (Platform Governance)**
*   **Global Ecosystem Management**: Streamlined onboarding workflow for new institutes with multi-stage verification and approval.
*   **Advanced Analytics**: Real-time global telemetry tracking platform growth, institutional performance, and system health.
*   **Scholarship Hub**: Master management of central and state government schemes (Minority, SC/ST, AICTE) with eligibility filtering.
*   **Audit & Security**: Comprehensive audit logs capturing every administrative action for accountability and system integrity.
*   **Broadcast System**: Centralized megaphone for platform-wide announcements to all institutional tiers.
*   **Grievance Resolution**: Master control panel for resolving platform-wide technical and institutional support tickets.

### **2. Institute Admin (Institutional Control)**
*   **Departmental Management**: Full control over institutional hierarchy, department creation, and resource allocation.
*   **Team Access Control**: Delegation mechanism to grant administrative privileges to HODs or senior faculty for specific modules.
*   **Compliance Command Center**: Dedicated hub for NIRF/NAAC data parsing, accreditation score tracking, and document archival.
*   **AI Timetable Engine**: Automated weekly scheduling with conflict detection and faculty availability mapping.
*   **Custom Branding**: Full UI personalization including institute-specific themes, logos, and custom landing page configurations.

### **3. Faculty (Academic & Administrative)**
*   **Academic Dashboard**: Real-time tracking of class schedules, today's load, and student attendance trends.
*   **Research Integrity Hub**: AI-powered bulk research upload with real-time **Google Scholar (SerpApi)** verification and profile synchronization.
*   **Mentorship & Performance**: Deep-dive analytics to identify "Top Performers" and students who "Need Attention" based on CGPA and attendance thresholds.
*   **Form & Assessment Builder**: Integrated tool to create custom surveys, feedback forms, and technical assessments for students.
*   **SSR Contribution**: Direct interface for updating Self-Study Reports (SSR) and providing metrics for NIRF/NAAC institutional accreditation.

### **4. Student (Learning & Career Growth)**
*   **Career Accelerator Suite**:
    *   *AI Resume Builder*: Automated generation of industry-standard resumes based on student profile data.
    *   *Mock Interview Suite*: Multi-role (SDE, DA, PM) practice for technical and HR interviews with real-time AI feedback and performance analytics.
    *   *Problem Solving Arena*: Integrated environment for DSA and logic practice with 100+ curated problems.
    *   *Project Collab*: Networking hub for peer-to-peer collaboration on real-world projects.
*   **Earning & Employment**: Integrated **Freelance Hub** connected to the **Adzuna API** for real-time global job and internship searches.
*   **Financial Aid Hub**: Advanced scholarship explorer with built-in **Eligibility Logic** (Income, Marks, Category, Religion) for central and state schemes.
*   **Personalized Roadmap**: AI-generated career paths for Web Development, AI/ML, DSA, and other tech domains.
*   **Multilingual Translation Hub**: AI-powered translation across 12+ Indian languages (Hindi, Tamil, Telugu, Kannada, Bengali, etc.) with TTS read-aloud. Uses **Gemini AI** for context-aware educational translations.
*   **Accessibility Toolkit**: Text-to-Speech engine with voice/speed/pitch controls, Speech-to-Text voice note-taker, and display customization (font size, high contrast, dyslexia-friendly fonts, dark mode). Uses browser-native **Web Speech API**.
*   **Virtual Labs**: Interactive science simulations (Physics: Pendulum, Chemistry: pH Scale, Biology: Cell Explorer) with adjustable parameters and AI-powered explanations. Runs entirely in-browser via **HTML5 Canvas**.
*   **Academic Mirror**: Instant access to timetables, subject-wise attendance logs, and SGPA/CGPA visualizations.
*   **AI Support**: 24/7 access to an integrated **AI Chatbot** for academic and platform assistance.


---

## ✨ Core Features Built

### **1. AI-Powered Compliance Automation**
- **Deep NIRF/NAAC Parser**: Upload official documents (PDF/CSV), and the AI extracts structured data for:
  - *Student Strength & Diversity*: Enrollment, state-wise diversity, and inclusivity metrics.
  - *Faculty Details*: PhD counts, teaching/industry experience, and gender diversity.
  - *Financial Resources*: Capital and operational expenditure breakdown (Library, Equipment, Salaries).
  - *Research Performance*: Publications (Scopus, Web of Science, Google Scholar), Citations (h-index), Patents, and Consultancy funding.
  - *Graduation Outcomes*: Placement rates, median salaries, and higher studies tracking.
- **Accreditation Assistant**: Generates actionable, criterion-specific suggestions to help institutes improve their NAAC/NIRF rankings.

### **2. Academic Integrity & Verification**
- **Research Bulk Upload & Verification**: Faculty can upload publications in bulk. The system uses AI to parse metadata and SerpApi to cross-reference with Google Scholar, ensuring academic integrity.
- **Aadhaar Identity Verification**: Integrated support for identity verification within the institutional framework to prevent fraud.

### **3. Dynamic Scheduling & Management**
- **Smart Timetable**: AI-generated weekly schedules that prevent conflicts and optimize resource allocation across departments.
- **Global Grievance Redressal**: A centralized system for tracking, managing, and resolving institutional and student grievances with status updates.
- **Institutional Notice Board**: Role-specific and department-specific notice system for instant dissemination of information.

### **4. Data-Driven Insights & Analytics**
- **Analytics Dashboards**: High-fidelity visual representation of department metrics, student diversity, research trends, and financial health.
- **Real-time Reminders**: Automated notification system for faculty regarding class schedules and pending administrative tasks.

### **5. Institutional Governance & Personalization**
- **Team Access Control**: Advanced mechanism for institutes to delegate administrative privileges to specific faculty members (e.g., Department Heads or Compliance Officers).
- **Custom Institutional Branding**: Institutes can personalize the platform with their own logos and brand colors, ensuring a seamless experience across their ecosystem.
- **Role-Based Access Control (RBAC)**: Fine-grained permissions ensuring data security and integrity across all user tiers.

---

## 📁 Repository Structure
- `/backend`: Express server, Mongoose models, AI integration logic (Gemini/OpenAI), and Socket.io handlers.
- `/unifiededu`: React frontend with role-specific dashboards, Framer Motion animations, and Recharts analytics.
- `/uploads`: Temporary storage for document processing (PDF/CSV parsing).


