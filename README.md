# Smart Grievance Redressal & Fake Complaint Detection System

A modern, AI-powered civic grievance management platform that allows citizens to report public problems and enables government officers to investigate, prioritize, assign, and resolve them efficiently.

## Features
- **Public Portal**: Responsive homepage with civic infrastructure hero, process overview, FAQ, and dual portal access.
- **Citizen Portal**:
  - Secure registration, authentication, and profile management.
  - Interactive citizen dashboard with real-time statistics.
  - Structured grievance filing with photo evidence preview and automated AI category suggestion.
  - Detailed complaint tracking with `#GRV...` tracking codes and milestone progress timeline.
- **Government Portal**:
  - Unified workspace for department officers and supervisory administrators.
  - Elegant deep-navy/royal-blue sidebar layout.
  - Comprehensive assigned complaints management with live status updates and remarks.
  - **AI Review Center**: Semantic duplicate complaint detection with Jaccard similarity scoring, suspicious evidence review, and public safety priority recommendations.
  - **Graph-Free Reports**: Operational metric cards, priority breakdown tables, and departmental completion benchmarks.
  - Geographic Locality Map view.

## Technology Stack
- **Frontend**: React 19 (JavaScript / JSX), Vite, Tailwind CSS v4, Lucide Icons, Sonner.
- **Backend**: Node.js, Express.js.
- **Database**: MongoDB with Mongoose models.
- **Authentication**: JWT (JSON Web Tokens) with bcrypt password hashing and role-based guards (`citizen`, `officer`, `admin`).

## How to Run

### 1. Start the Backend API (Port 5000)
```bash
cd backend
npm install
npm start
```

### 2. Start the Frontend (Port 8080)
```bash
npm run dev
```

Open your browser at: `http://localhost:8080`
