# SkillSwap 🤝
> **"Learn. Teach. Exchange. Grow."**
>
> *Your skills can help someone. Someone else's skills can help you.*

SkillSwap is a **100% FREE student-to-student skill exchange platform** designed to break down barriers to education. Rather than paying expensive course fees or subscription paywalls, students teach what they know and learn what they desire through reciprocal exchange.

---

## 🌟 Core Philosophy: 100% Free Forever
- ❌ **No Premium Tiers**
- ❌ **No Subscriptions**
- ❌ **No Paywalls or Paid Courses**
- ❌ **No Credit or Token Systems**
- ✅ **100% Free Peer-to-Peer Learning for All Students**

---

## 🚀 Key Features

### 1. Smart Bilateral Skill Matching
- **Reciprocal Matching Engine**: Intelligently pairs students where Student A teaches what Student B wants to learn, and Student B teaches what Student A wants to learn.
- Considers skill compatibility, proficiency levels (Beginner, Intermediate, Advanced), availability, and campus affiliation.

### 2. Live WebRTC Learning Sessions
- **Peer-to-Peer Audio/Video & Screen Sharing**: Real-time interactive sessions right in the browser.
- **Collaborative Notes**: Live-synchronized session scratchpad shared between mentor and student.
- **In-Session Chat & Hand-Raise Queue**: Fallbacks to audio-only and text-only modes when bandwidth is constrained.

### 3. Real-Time Chat & Direct Messaging
- Instant 1-on-1 messaging powered by Socket.IO.
- Typing indicators, online status, session invitations, and student profile preview.

### 4. Interactive Coding Playground
- In-browser code editor with instant test runner for algorithm challenges.
- Sandboxed evaluation environment with timeout boundaries.

### 5. English & Communication Practice
- Conversation topic cards, speech prompt drills, and AI-powered grammar/vocabulary feedback.

### 6. AI Learning Assistant
- **AI Doubt Assistant**: Clear step-by-step explanations for tricky academic and technical questions.
- **Roadmap Generator**: Structured week-by-week learning curriculums for any technology or topic.
- **Session Prep**: Automated discussion points and cheat sheets tailored to upcoming sessions.
- **Local Fallback Engine**: Works seamlessly out of the box even without external third-party API keys!

### 7. Question Hub & Student Communities
- Public Q&A forum with tags, upvotes, and answer acceptance.
- Themed study groups (e.g. "Full-Stack Web Devs", "Machine Learning Cohort") and campus discussion boards.

### 8. Trust, Badges & Moderation
- Verified student badges, star ratings, and peer reviews.
- Role-based Admin Control Panel with moderation queues for reported content and user management.

---

## 💻 Tech Stack

| Layer | Technologies |
|---|---|
| **Frontend** | React 19, TypeScript, Vite, Tailwind CSS, React Router v7, TanStack Query, Lucide Icons, Socket.IO Client |
| **Backend** | Node.js, Express.js (TypeScript), Socket.IO, Prisma ORM, Safe Code Sandbox |
| **Database** | SQLite (zero-config local dev), PostgreSQL 16 (production container ready) |
| **Real-Time** | WebSockets (Socket.IO) & WebRTC (Mesh Audio/Video/Screen) |
| **Container** | Docker, Docker Compose, Multi-stage Node & Nginx builds |

---

## ⚡ Quick Start (Local Development)

### Prerequisites
- Node.js 18+ (Node 20 recommended)
- npm or yarn

### 1. Clone & Install Dependencies
```bash
git clone https://github.com/your-username/skillswap.git
cd skillswap
npm install
```

### 2. Initialize Database & Seed Sample Data
SkillSwap comes pre-configured with SQLite for instant local execution without installing external database servers:
```bash
# Push database schema & populate with 20 demo university students, skills, and Q&As
npm run db:setup
```

### 3. Start Development Servers
```bash
npm run dev
```
- **Frontend SPA**: [http://localhost:5173](http://localhost:5173)
- **Backend API**: [http://localhost:5000](http://localhost:5000)

---

## 🔑 Demo Accounts

Use any of these pre-seeded accounts to test the platform:

| Role | Email | Password | College / Details |
|---|---|---|---|
| **Student (Demo)** | `demo@skillswap.edu` | `student123` | UC Berkeley — Teaches React & Python, Learns UI/UX |
| **Admin (Moderator)** | `admin@skillswap.edu` | `admin123` | MIT — Administrator & Moderator |
| **Student** | `marcus@skillswap.edu` | `student123` | Stanford — Teaches UI/UX, Learns Python (*Direct Match with Alex!*) |
| **Student** | `priya@skillswap.edu` | `student123` | CMU — Teaches Machine Learning & PyTorch |
| **Student** | `elena@skillswap.edu` | `student123` | MIT — Teaches Cybersecurity & Rust |

---

## 🐳 Running with Docker

To run the entire production stack (PostgreSQL, Backend API, and Nginx Frontend):
```bash
docker compose up --build
```
- **Application**: [http://localhost:80](http://localhost:80)
- **API**: [http://localhost:5000/api](http://localhost:5000/api)

---

## 🧪 Running Automated Tests

Run backend integration and unit tests:
```bash
npm --prefix backend run test
```

Build all packages for production:
```bash
npm run build
```

---

## 📁 Repository Structure

```
/skillswap
├── frontend/             # React SPA (Vite, Tailwind, React Router)
├── backend/              # Express API & Socket.IO server
│   ├── prisma/           # Prisma schema & seed script (dev.db)
│   └── src/
│       ├── routes/       # API endpoint handlers
│       ├── services/     # Match engine, AI, Sockets, Sandbox
│       └── middleware/   # JWT auth, role validation
├── shared/               # Shared TypeScript types and constants
├── database/             # PostgreSQL production schema & docs
├── docker/               # Dockerfiles & Nginx reverse proxy
├── docs/                 # System architecture, API, and Security guides
└── docker-compose.yml    # Full-stack container orchestration
```

---

## 📄 License
MIT — Built with ❤️ for students worldwide.
