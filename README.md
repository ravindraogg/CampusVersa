# CampusVersa – Unified Education Platform (SIH Project)

## 1. Project Overview

CampusVersa is a role-based, real-time Unified Education Platform developed as part of Smart India Hackathon (SIH). The system connects **Students, Faculty, Institutes, and Central Admin** under a single digital ecosystem to manage academics, compliance, analytics, communication, and AI-assisted features.

The platform is designed to solve fragmentation in academic data, poor communication flows, and lack of real-time visibility across stakeholders.

---

## 2. System Actors & Responsibilities

### 2.1 Student

* Login only (no self-registration)
* View dashboard, attendance, timetable, courses
* Academic performance & CGPA visualization
* Career & skill tools (Resume Builder, Mock Interviews, Problem Solving, Freelance Hub, Projects)
* KYC submission
* Real-time notices & alerts

### 2.2 Faculty

* Login via institute provisioning
* Manage students, courses, attendance, evaluation
* Department-level analytics
* SSR & compliance-related inputs
* Post notices & reminders
* View personalized timetable

### 2.3 Institute (Admin)

* Institute onboarding & authentication
* Faculty creation & access control
* Student management
* Timetable & course management
* NAAC / accreditation metadata
* Theme customization (branding)
* Real-time notices broadcast

### 2.4 Super Admin (Central Authority)

* Institute onboarding & approvals
* Global search (Institute / Faculty / Student)
* Accreditation tracking (NAAC, AISHE, NIRF)
* Grievance handling
* System-wide analytics & logs

---

## 3. High-Level Architecture

```
Frontend (React + Vite)
   |
   | REST APIs + WebSockets
   |
Backend (Node.js + Express)
   |
   | MongoDB (Primary Data Store)
   |
Socket.IO (Realtime Layer)
```

* **REST APIs** handle CRUD, authentication, dashboards
* **Socket.IO** enables real-time notices, alerts, updates
* **JWT-based authentication** per role
* **Theme & branding** dynamically injected per institute

---

## 4. Frontend Architecture

### 4.1 Routing Layer (App.jsx)

The routing layer defines clear, role-isolated navigation paths:

* `/student/*` → Student Module
* `/fc/*` → Faculty Module
* `/in/*` → Institute Module
* `/ad/*` → Admin Module

Each role has its own authentication, dashboard, and protected routes.

---

### 4.2 Student Module

**Key Components**

* `StudentDashboard.jsx`
* `StudentAttendanceSection.jsx`
* `StudentPerformanceSection.jsx`
* `StudentTimetableSection.jsx`
* `StudentCoursesSection.jsx`
* `StudentKYC.jsx`
* Career tools: Resume, Roadmap, Mock Interview, Projects, Freelance

**Core Features**

* Dynamic dashboard with CGPA & attendance analytics
* VTU-based grading logic
* Real-time notices via Socket.IO
* Mobile-first responsive navigation
* Auto theme sync with institute branding

**Security**

* JWT stored in localStorage
* Auto logout on 401/403

---

### 4.3 Faculty Module

**Key Components**

* `FacultyDashboard.jsx`
* `FacultyProfile.jsx`
* `FacultyCourses.jsx`
* `FacultyStudent.jsx`
* `FacultySchedule.jsx`
* `FacultyEvaluation.jsx`
* `FacultySSR.jsx`

**Core Features**

* Department analytics (attendance, CGPA distribution)
* Student performance monitoring
* Notice & reminder system
* Personalized timetable
* SSR & compliance readiness

---

### 4.4 Institute Module

**Key Components**

* `indashboard.jsx`
* `DepartmentPage.jsx`
* `FacultyPage.jsx`
* `StudentPage.jsx`
* `Timetable.jsx`
* `CoursesPage.jsx`
* `NIRFPage.jsx`
* `NoticePage.jsx`

**Core Features**

* Institute overview dashboard
* Faculty & student lifecycle management
* Theme & logo customization
* Access control (authorized faculty admins)
* Accreditation (NAAC) metadata
* Analytics per department

---

### 4.5 Admin Module (Super Admin)

**Key Components**

* `adminpanel.jsx`

**Core Features**

* Global search across all entities
* Institute onboarding & manual creation
* Accreditation upload & verification
* Institute deep analytics (students, faculty, departments)
* Grievance & support handling
* System activity logs

This module acts as the **governance and compliance backbone** of CampusVersa.

---

## 5. Backend Architecture

### 5.1 Server Overview

* Node.js + Express
* Modular route separation per role
* JWT-based authentication middleware
* Centralized error handling

### 5.2 Authentication Model

| Role      | Token Storage  | Middleware      |
| --------- | -------------- | --------------- |
| Student   | studentToken   | verifyStudent   |
| Faculty   | facultyToken   | verifyFaculty   |
| Institute | instituteToken | verifyInstitute |
| Admin     | adminToken     | verifyAdmin     |

---

### 5.3 Realtime System (Socket.IO)

**Events**

* `join_room`
* `receive_notice`
* `receive_alert`

**Room Strategy**

* Institute-level rooms
* Role + department scoping

This ensures:

* No data leakage across institutes
* Targeted notifications

---

## 6. Data Model Overview (Conceptual)

### Core Entities

* Institute (IID)
* Faculty (FID)
* Student (SID, APAAR ID)
* Courses
* Timetables
* Attendance
* Academic Records
* Notices
* Accreditation

Relationships are normalized and indexed for performance.

---

## 7. Security Considerations

* Role-based access control
* JWT expiration handling
* Auto redirect on unauthorized access
* Server-side validation
* Restricted admin actions

---

## 8. Scalability & Extensibility

* Micro-feature based component structure
* Plug-in ready AI modules
* Easy integration with government APIs (NAAC, NIRF, AISHE)
* Horizontal scaling for Socket.IO

---

## 9. SIH Alignment & Innovation

* Unified education ecosystem
* Real-time academic governance
* Compliance-ready architecture
* AI-first design philosophy
* Scalable for national-level rollout

---

## 10. Conclusion

CampusVersa is not just a college ERP. It is a **governance-grade education platform** built with real-world constraints, compliance needs, and scalability in mind. The architecture supports future AI integrations, national education policies, and seamless multi-role collaboration.

This documentation reflects a **software engineering-grade system**, suitable for hackathon evaluation, production hardening, and long-term deployment.
