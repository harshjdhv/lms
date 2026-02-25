<p align="center">
  <img src="https://img.shields.io/badge/Next.js-16-black?style=for-the-badge&logo=next.js" alt="Next.js" />
  <img src="https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react&logoColor=white" alt="React" />
  <img src="https://img.shields.io/badge/TypeScript-5.7-3178C6?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript" />
  <img src="https://img.shields.io/badge/Supabase-Auth-3FCF8E?style=for-the-badge&logo=supabase&logoColor=white" alt="Supabase" />
  <img src="https://img.shields.io/badge/Prisma-ORM-2D3748?style=for-the-badge&logo=prisma&logoColor=white" alt="Prisma" />
  <img src="https://img.shields.io/badge/Turborepo-Monorepo-EF4444?style=for-the-badge&logo=turborepo&logoColor=white" alt="Turborepo" />
</p>

# ConnectX LMS

> **Knowledge, Beautifully Organized.** — The AI-powered learning management system that feels less like a tool and more like a superpower.

ConnectX is a full-stack, production-ready LMS built with modern web technologies. It provides an intelligent, adaptive learning experience for students and a powerful course management platform for educators — all wrapped in a premium, Apple-inspired UI.

---

## ✨ Features

### 🎓 For Students
- **Course Enrollment & Progress Tracking** — Browse available courses, enroll, and track completion across chapters
- **AI-Powered Smart Reflections** — Adaptive quizzes generated from video transcripts that learn your strengths and weaknesses over time
- **Personalized Learning Memory** — The system remembers your learning pace, preferred style, confidence level, and topic mastery
- **Assignment Submissions** — Submit assignments with file attachments and receive teacher feedback
- **Real-time Chat** — Direct messaging with teachers and peers with online presence tracking
- **Mentorship Program** — Get paired with mentors for document reviews and academic guidance

### 👩‍🏫 For Teachers
- **Course Builder** — Create courses with chapters, video content, attachments, and transcript-based quizzes
- **Drag & Drop Chapter Ordering** — Reorder course content intuitively with DnD Kit
- **Assignment & Grading Management** — Create assignments with deadlines, review submissions, and provide feedback
- **Announcements** — Broadcast updates to enrolled students per course
- **Mentorship Dashboard** — Manage mentees, set document requirements, and review submissions
- **Student Analytics** — View enrollment data, submission rates, and course engagement

### 🤖 AI & Intelligence
- **Smart Reflection Engine** — Generates context-aware quiz questions from video transcripts using AI
- **Adaptive Difficulty** — Questions adjust based on your `StudentReflectionMemory` profile
- **Remediation Paths** — AI suggests targeted review material when you struggle with a topic
- **Topic-Level Mastery Tracking** — Per-topic accuracy, streak tracking, and confidence scoring

### 🔐 Platform
- **Role-Based Access Control (RBAC)** — Distinct experiences for `STUDENT`, `TEACHER`, and `ADMIN` roles
- **Supabase Authentication** — Email/password auth with SSR cookie-based sessions
- **Onboarding Flow** — New users are guided through profile setup and learning preference configuration
- **Global Command Menu** — `⌘K` quick-access navigation across the entire app
- **Dark/Light Mode** — Full theme support via `next-themes`
- **Vercel Analytics** — Built-in production analytics

---

## 🏗️ Architecture

This project is a **Turborepo monorepo** with the following structure:

```
connectx-lms/
├── apps/
│   └── web/                    # Next.js 16 application (App Router)
│       ├── app/
│       │   ├── api/            # 30+ API routes
│       │   ├── auth/           # Authentication pages
│       │   ├── dashboard/      # Protected dashboard (role-based)
│       │   │   ├── account/
│       │   │   ├── assignments/
│       │   │   ├── community/
│       │   │   ├── courses/
│       │   │   ├── grades/
│       │   │   ├── mentorship/
│       │   │   └── schedule/
│       │   ├── forgot-password/
│       │   ├── landing/
│       │   └── onboarding/
│       ├── components/         # React components
│       ├── hooks/              # Custom hooks & React Query keys
│       ├── lib/                # Utilities (Supabase client, auth helpers)
│       └── providers/          # Context providers (User store, React Query)
│
├── packages/
│   ├── database/               # Prisma schema + client
│   │   └── prisma/
│   │       └── schema.prisma   # 18 models, PostgreSQL
│   ├── ui/                     # Shared component library (55+ components)
│   │   └── src/components/     # shadcn/ui + custom components
│   ├── eslint-config/          # Shared ESLint configuration
│   └── typescript-config/      # Shared TypeScript configuration
│
├── turbo.json                  # Turborepo pipeline configuration
└── package.json                # Root workspace configuration
```

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| **Framework** | [Next.js 16](https://nextjs.org/) (App Router, Turbopack) |
| **Language** | [TypeScript 5.7](https://www.typescriptlang.org/) |
| **UI Library** | [React 19](https://react.dev/) |
| **Styling** | [Tailwind CSS 4](https://tailwindcss.com/) |
| **Component Library** | [shadcn/ui](https://ui.shadcn.com/) (55+ components) |
| **Animations** | [Framer Motion 12](https://www.framer.com/motion/) |
| **State Management** | [Zustand 5](https://zustand-demo.pmnd.rs/) + [React Query 5](https://tanstack.com/query) |
| **Forms** | [React Hook Form 7](https://react-hook-form.com/) + [Zod 4](https://zod.dev/) |
| **Database** | [PostgreSQL](https://www.postgresql.org/) (via Supabase) |
| **ORM** | [Prisma 6](https://www.prisma.io/) |
| **Authentication** | [Supabase Auth](https://supabase.com/auth) (SSR) |
| **Drag & Drop** | [dnd-kit](https://dndkit.com/) |
| **Icons** | [Lucide React](https://lucide.dev/) |
| **Monorepo** | [Turborepo 2](https://turbo.build/) |
| **Package Manager** | [Bun 1.2](https://bun.sh/) |
| **Analytics** | [Vercel Analytics](https://vercel.com/analytics) |
| **Deployment** | [Vercel](https://vercel.com/) |

---

## 🚀 Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) >= 20
- [Bun](https://bun.sh/) >= 1.2
- A [Supabase](https://supabase.com/) project (for PostgreSQL + Auth)

### 1. Clone the Repository

```bash
git clone https://github.com/your-username/connectx-lms.git
cd connectx-lms
```

### 2. Install Dependencies

```bash
bun install
```

### 3. Configure Environment Variables

Create a `.env` file inside `packages/database/`:

```env
DATABASE_URL="postgresql://..."
DIRECT_URL="postgresql://..."
```

Create a `.env.local` file inside `apps/web/`:

```env
NEXT_PUBLIC_SUPABASE_URL="https://your-project.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="your-anon-key"
```

### 4. Generate Prisma Client & Push Schema

```bash
# Generate the Prisma client
bun run --filter @workspace/database db:generate

# Push schema to your database (first time only)
bun run --filter @workspace/database db:push
```

### 5. Start the Development Server

```bash
bun run dev
```

The app will be running at **[http://localhost:3000](http://localhost:3000)**.

---

## 📡 API Routes

The application exposes **30+ API routes** under `apps/web/app/api/`:

| Category | Endpoint | Description |
|----------|----------|-------------|
| **Courses** | `GET /api/courses` | List all courses |
| | `GET /api/courses/available` | Browse enrollable courses |
| | `GET /api/courses/my` | Get user's enrolled/taught courses |
| | `POST /api/courses/enroll` | Enroll in a course |
| | `PATCH /api/courses/[courseId]` | Update course details |
| **Assignments** | `GET /api/assignments` | List assignments |
| | `POST /api/assignments/submit` | Submit an assignment |
| | `PATCH /api/assignments/update` | Update assignment status |
| **Announcements** | `GET /api/announcements` | List announcements |
| **Chat** | `GET/POST /api/chat` | Direct messaging |
| **Reflection (AI)** | `POST /api/reflection/generate` | Generate quiz from transcript |
| | `POST /api/reflection/evaluate` | Evaluate student answers |
| | `POST /api/reflection/remediate` | Get remediation suggestions |
| | `POST /api/reflection/chat` | AI-powered reflection chat |
| | `POST /api/smart-reflection` | Smart adaptive quiz |
| **Mentorship** | `GET/POST /api/mentorship` | Manage mentorships |
| | `GET /api/mentorship/available-students` | Find unassigned students |
| **Documents** | `GET/POST /api/documents/requirements` | Document requirements |
| | `GET/POST /api/documents/submissions` | Document submissions |
| **User** | `GET/PATCH /api/user/profile` | User profile |
| | `POST /api/user/complete-onboarding` | Complete onboarding |
| | `GET /api/user/learning-memory` | Get learning memory |

---

## 🗄️ Database Schema

The PostgreSQL database consists of **18 models** managed by Prisma:

```
User ─────────────┬───── Course ────── Chapter ────── UserProgress
  │                │        │               │
  │                │        │               └── ReflectionPoint
  │                │        │
  │                │        ├── Attachment
  │                │        ├── Announcement
  │                │        ├── Assignment ──── AssignmentSubmission
  │                │        └── Enrollment
  │                │
  ├── Chat ────────┴── Message
  ├── UserPresence
  ├── StudentReflectionMemory
  ├── Mentorship
  ├── DocumentRequirement ──── DocumentSubmission
  └── (Roles: STUDENT | TEACHER | ADMIN)
```

### Key Enums
- **UserRole**: `STUDENT` · `TEACHER` · `ADMIN`
- **AssignmentStatus**: `ACTIVE` · `REVIEW` · `STOPPED`
- **SubmissionStatus**: `PENDING` · `APPROVED` · `REJECTED`
- **MentorshipStatus**: `ACTIVE` · `INACTIVE` · `COMPLETED`
- **DocumentStatus**: `PENDING` · `APPROVED` · `REJECTED` · `REVISION_REQUESTED`

---

## 📦 Workspace Packages

### `@workspace/ui`
Shared component library with **55+ components** built on shadcn/ui:

```
accordion · alert-dialog · avatar · badge · breadcrumb · button
calendar · card · carousel · chart · checkbox · collapsible
command · context-menu · dialog · drawer · dropdown-menu · empty
field · form · hover-card · input · input-group · input-otp
item · kbd · label · menubar · navigation-menu · pagination
popover · progress · radio-group · resizable · scroll-area
select · separator · sheet · sidebar · skeleton · slider
sonner · spinner · switch · table · tabs · textarea
toggle · toggle-group · tooltip  ... and more
```

**Usage:**
```tsx
import { Button } from "@workspace/ui/components/button"
import { Card } from "@workspace/ui/components/card"
```

### `@workspace/database`
Prisma client and schema package:

```tsx
import { prisma } from "@workspace/database"

const users = await prisma.user.findMany()
```

---

## 🧪 Scripts

| Command | Description |
|---------|-------------|
| `bun run dev` | Start all apps in development mode (Turbopack) |
| `bun run build` | Build all apps and packages |
| `bun run lint` | Lint all apps and packages |
| `bun run format` | Format all files with Prettier |
| `bun run --filter web dev` | Start only the web app |
| `bun run --filter @workspace/database db:generate` | Generate Prisma client |
| `bun run --filter @workspace/database db:push` | Push schema to database |
| `bun run --filter @workspace/database db:studio` | Open Prisma Studio |

---

## 🌐 Deployment

The app is designed for deployment on **Vercel**:

1. Connect your GitHub repository to Vercel
2. Set the root directory to `apps/web`
3. Add environment variables (`DATABASE_URL`, `DIRECT_URL`, Supabase keys)
4. Vercel will automatically detect the Turborepo setup

**Production URL:** [https://lms.harshjdhv.com](https://lms.harshjdhv.com)

---

## 🤝 Adding UI Components

To add new shadcn/ui components:

```bash
bunx shadcn@latest add <component-name> -c apps/web
```

Components are automatically placed in `packages/ui/src/components/`.

---

## 📝 License

This project is private and proprietary.

---

<p align="center">
  <sub>Built with ❤️ by the ConnectX team · UI components from <a href="https://componentry.fun">componentry.fun</a></sub>
</p>
