# CampusVersa API Documentation

This document provides an overview of the key API endpoints available in the CampusVersa backend.

## Authentication

All protected routes require a Bearer Token in the Authorization header.
Header: `Authorization: Bearer <token>`

## Student API

### Registration
- Endpoint: `/student/register`
- Method: `POST`
- Description: Registers an independent student. Captures referral source via `utm_source`.

### Login
- Endpoint: `/student/login`
- Method: `POST`
- Description: Authenticates a student and returns a JWT token.

### Profile
- Endpoint: `/student/me`
- Method: `GET`
- Description: Returns the logged-in student's profile data.

### Update Profile
- Endpoint: `/student/update-profile`
- Method: `POST`
- Description: Updates student metadata including preferred language and academic info.

## Faculty API

### Login
- Endpoint: `/faculty/login`
- Method: `POST`
- Description: Authenticates a faculty member.

### My Courses
- Endpoint: `/faculty/my-courses`
- Method: `GET`
- Description: Returns courses assigned to the logged-in faculty.

### Student Evaluation
- Endpoint: `/faculty/evaluation/bulk-update`
- Method: `POST`
- Description: Bulk updates marks or attendance for a specific course.

## Institute API

### Register Request
- Endpoint: `/institute/register`
- Method: `POST`
- Description: Submits a request for an institute to be onboarded. Captures referral source.

### Login
- Endpoint: `/institute/login`
- Method: `POST`
- Description: Authenticates an institute administrator or authorized faculty member.

## AI Intelligence API

### AI Generation Proxy
- Endpoint: `/api/ai/generate`
- Method: `POST`
- Description: Proxies requests to configured LLM providers (Gemini/OpenAI). Supports system instructions and custom prompts.

### Performance Analysis
- Endpoint: `/student/performance/analyze`
- Method: `POST`
- Description: Uses AI to analyze a student's academic profile and provide improvement insights.

## Career & Jobs API

### Job Search
- Endpoint: `/api/student-jobs/search`
- Method: `POST`
- Description: Searches for jobs and freelance opportunities based on student skills using the Adzuna API.

---
Back to [README.md](README.md)
