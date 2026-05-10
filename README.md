# CampusVersa - Unified AI Education Ecosystem

CampusVersa is a comprehensive educational management and AI-enhanced learning platform designed to bridge the gap between traditional institutions and independent learners. It provides a multi-tenant architecture supporting Students, Faculty, and Institute Administrators with integrated AI tools for personalized learning and governance.

## Architecture

<img width="1504" height="1344" alt="arch" src="https://github.com/user-attachments/assets/b8725095-797e-463d-97a3-2688a334d4cc" />

## Key Features

### For Students
- Virtual Labs: Interactive simulations for science and engineering experiments with AI-driven explanations.
- AI Performance Coach: Data-driven insights into academic performance and improvement areas.
- Multilingual Support: Platform accessibility in over 13 regional Indian languages including Hindi, Tamil, and Telugu.
- Career Roadmap & Job Search: Automated career guidance and integrated job search via the Adzuna API.
- Text-to-Speech: Regional language narration for educational content.

### For Faculty
- SSR Management: Automated Self-Study Report generation for accreditation.
- Evaluation System: Digital grading and marks management with real-time analytics.
- Schedule Management: Personalized timetables and class reminders.
- Performance Tracking: Monitoring student progress across departments.

### For Institutes
- Governance Dashboard: Real-time analytics on institute performance, NIRF rankings, and NAAC accreditation.
- Access Control: Secure management of authorized faculty and student records.
- Global Search: Unified search across all institutional data points.
- UTM Referral Tracking: Built-in analytics to track onboarding sources and referral campaigns.

## Tech Stack

### Frontend
- React.js
- Tailwind CSS
- Lucide React (Icons)
- Framer Motion (Animations)
- Axios & Fetch API

### Backend
- Node.js & Express.js
- MongoDB & Mongoose (Database)
- JSON Web Tokens (Authentication)
- Bcrypt.js (Security)

### AI & Integrations
- Google Gemini AI (Primary)
- OpenAI GPT-4 (Fallback)
- Ollama / ngrok (Local LLM Support)
- Adzuna API (Job Data)

## Project Structure

- /unifiededu: React frontend application.
- /backend: Express.js server and database models.
- /backend/models: Mongoose schemas for Students, Faculty, Institutes, etc.

## Documentation

For detailed information on API endpoints and data structures, please refer to the [API Documentation](api_docs.md).

## Installation

### Backend
1. Navigate to the backend directory.
2. Install dependencies: npm install
3. Configure .env file with MONGO_URI, JWT_SECRET, and AI API keys.
4. Start the server: npm run dev

### Frontend
1. Navigate to the unifiededu directory.
2. Install dependencies: npm install
3. Configure .env file with VITE_BACKEND_URL.
4. Start the development server: npm run dev

## License
Proprietary. All rights reserved.
