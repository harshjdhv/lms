# LMS Feature Roadmap

This document outlines the planned feature set for the LMS, categorized into foundational essentials and premium standout features.

## 🏛️ Base Essentials
*The foundational blocks every solid LMS needs.*

### 1. Smart Course Management
*   **Module/Unit Structure**: Drag-and-drop course builder for instructors.
*   **Rich Content Support**: Embed videos, PDFs, and rich text lessons seamlessly.
*   **Progress Tracking**: Visual progress bars for students at both the course and module levels.

### 2. Assignment & Grading Hub
*   **Submission Types**: Support for file uploads, GitHub repo links (great for coding), or inline text.
*   **Rubrics**: Transparent grading criteria that students can see before submitting.
*   **Feedback Loop**: Inline comments on submissions (like Google Docs) for detailed feedback.

### 3. Assessment Engine
*   **Quiz Builder**: Multiple choice, true/false, and open-ended questions.
*   **Auto-grading**: Instant results for objective questions.
*   **Timed Exams**: Strict countdown timers for tests.

### 4. Student Schedule
*   **Calendar View**: Combine assignment due dates, live class sessions, and personal study blocks.
*   **Upcoming Deadlines**: A widget on the dashboard showing the next 3 days of deliverables.

### 5. Community & Communication
*   **Course Forums**: Threaded discussions for each course.
*   **Announcements**: Global or course-specific blasts from instructors.

---

## ✨ Cool Standout Features
*Features to give the app a "Wow" factor and modern feel.*

### 1. AI Teaching Assistant (The "Jarvis" of Learning)
*   **Context-Aware Chat**: An AI chat widget that knows the specific content of the *current* lesson. Students can ask, "Can you explain this concept simply?" or "Generate a quiz for me based on this page."
*   **Auto-Summaries**: Button to "Summarize this lecture" for quick revision.

### 2. "Flow State" / Focus Mode
*   A toggle that hides all UI chrome (sidebar, header), turns on Do Not Disturb, and perhaps plays lo-fi background music (optional). Great for deep reading or exam taking.

### 3. Interactive "Playgrounds"
*   **Code**: Embed a code editor (Monaco) directly in the lesson so students can run code without leaving the browser.
*   **Design**: Embed a whiteboard (like tldraw) for students to sketch ideas or collaborate.

### 4. Gamification & Stats
*   **Streak Tracking**: "Days learned in a row" fire icon in the header.
*   **Leaderboards**: Optional opt-in leaderboards for most active students or highest quiz scores.
*   **Study Analytics**: A "Spotify Wrapped" style view for students (e.g., "You were most productive on Tuesdays" or "You spent 12 hours on React this week").

### 5. Spotlight / Global Command Menu (`Cmd+K`)
*   Expand the existing command menu to be super powerful.
*   **Actions**: "Go to Grades", "Draft new assignment".
*   **Deep Search**: Search for specific content within lessons (e.g., "Search for 'Javascript'").

### 6. Social "Study Rooms"
*   Virtual voice/video channels (like Discord) where students can "sit" and study together.
*   **Who's Online**: See who else is currently viewing the same lesson.

---

## 🚀 Immediate "Low Hanging Fruit"
*Quick wins to improve the current `layout.tsx` and UI.*

*   **Breadcrumbs**: Auto-generated based on the path (e.g., `Courses > CS101 > Week 1`).
*   **Global Search Trigger**: A magnifying glass icon or a search bar that opens the Command Menu.
*   **Notifications Bell**: For graded assignments or new announcements.
