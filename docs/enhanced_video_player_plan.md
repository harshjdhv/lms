# Enhanced Video Player & Personalized Learning Plan

## Overview
This document outlines the plan to enhance the existing course video player by replacing the multiple-choice question (MCQ) system with an open-ended question/answer system. Additionally, a personalized "Learning Memory" will be introduced to track and evolve a user's learning habits, which will then be used to tailor future interactions.

## Core Features

### 1. Open-Ended Question/Answer System
**Current Logic:**
- The video player generates multiple-choice questions (MCQs) based on transcript segments.
- Users select an option, and the system evaluates it against a pre-determined correct index.

**New Logic:**
- The system will generate **open-ended questions** based on the video content.
- Users will type their answers in a text input field.
- The LLM will evaluate the user's free-text answer for conceptual understanding, providing specific feedback rather than just "Correct/Incorrect".
- **Flow**:
    1.  Video reaches a reflection point.
    2.  LLM generates a question based on transcript + user's learning profile.
    3.  User types an answer.
    4.  LLM evaluates the answer.
    5.  If incorrect, a conversational flow (Explain with AI) creates a dialogue to help the user understand.

### 2. Personalized Learning Memory
**Concept:**
- Instead of just tracking scores, the system will maintain a specific **"Learning Profile"** or **"Learning Habits"** paragraph for each user.
- This paragraph serves as a living document of the user's learning style, strengths, weaknesses, and preferences.
- **Updates**: After every significant interaction (answering a question, completing a reflection), this paragraph is updated by the LLM to reflect new insights.

**Example Learning Profile:**
> "Harsh prefers real-world analogies over abstract theories. He often struggles with specific syntax details but grasps high-level architectural concepts quickly. He responds well to encouragement and step-by-step breakdowns when stuck. He tends to rush through video content, so questions should verify detailed comprehension."

### 3. Account / Developer Debug Page
**Goal:**
- A dedicated page to visualize the "User Brain" (Learning Memory).
- Useful for both users (to see their progress) and developers (to debug the personalization logic).
- **Key Elements**:
    - **User Info**: Name, basic stats.
    - **Live Memory**: The current "Learning Habits" paragraph.
    - **Recent Interactions**: Log of recent question/answers and how they influenced the memory.

---

## Implementation Plan

### Phase 1: Database Schema Updates
We need to store the "Learning Habits" paragraph.

**File:** `packages/database/prisma/schema.prisma`

```prisma
model StudentReflectionMemory {
  // ... existing fields
  
  // New Field
  learningProfile  String? @db.Text  // The personalized paragraph describing learning habits
}
```

### Phase 2: Backend Logic (LLM Pipelines)

#### A. Question Generation (`/api/reflection/generate`)
- **Input**: Transcript Segment, `StudentReflectionMemory.learningProfile`, `User.name`.
- **Prompt Strategy**: 
    - "You are a personalized tutor for [User Name]."
    - "Considering the user's learning style: [Learning Profile]..."
    - "Generate a simple, open-ended question based on the following transcript..."
- **Output**: Pure text question (no options).

#### B. Answer Evaluation (`/api/reflection/evaluate`)
- **Input**: Question, User Answer, Transcript/Topic.
- **Prompt Strategy**:
    - "Evaluate [User Name]'s answer to the question..."
    - "Check for conceptual understanding."
    - "Provide constructive feedback."

#### C. Memory Update (New Utility/Route)
- **Trigger**: Called after `evaluate` returns.
- **Input**: Current `learningProfile`, New Interaction (Question, Answer, Result).
- **Prompt Strategy**:
    - "Read the current learning profile for [User Name]: [Current Profile]"
    - "Analyze the recent interaction: [Details]"
    - "Update the learning profile to reflect any new insights about their habits, strengths, or weaknesses. Keep it concise but descriptive."
- **Output**: Updated `learningProfile` string, saved to DB.

### Phase 3: Frontend Updates

#### A. Video Player (`ReflectionModal.tsx`)
- **UI Changes**: 
    - Remove MCQ rendering logic (radio buttons).
    - default to `Textarea` input for all questions.
    - Display the question clearly.
    - Show AI-generated feedback after submission.
- **Logic**:
    - Ensure `generate` API call handles the new non-MCQ response format.

#### B. Account / Debug Page (`apps/web/app/account/page.tsx`)
- **New Page**:
    - Fetch `User` and `StudentReflectionMemory`.
    - Display "My Learning Profile" section showing the `learningProfile` text.
    - (Optional) Toggle "Debug Mode" to see raw logs of memory updates.

---

## Next Steps
1.  **Modify Schema**: Apply Prisma migration.
2.  **Update API**: Rewrite `generate` and `evaluate` prompts.
3.  **Create Memory Updater**: Implement the logic to evolve the user profile.
4.  **Build UI**: Create the Account page and update the Modal.
