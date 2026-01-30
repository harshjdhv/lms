# Mentor-Mentee System Implementation Plan

## Overview
A comprehensive mentor/mentee system for the LMS platform that enables:
- **Teachers (Mentors)**: Select and manage mentees, define document requirements, track submissions
- **Students (Mentees)**: View assigned mentor, see required documents, submit documents

## Database Schema

### New Tables

#### 1. Mentorship
```prisma
model Mentorship {
  id        String   @id @default(uuid())
  mentorId  String   // Teacher
  menteeId  String   // Student
  status    MentorshipStatus @default(ACTIVE)
  notes     String?  // Mentor's private notes about mentee
  
  mentor    User     @relation("MentorRelation", fields: [mentorId], references: [id], onDelete: Cascade)
  mentee    User     @relation("MenteeRelation", fields: [menteeId], references: [id], onDelete: Cascade)
  
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  
  @@unique([mentorId, menteeId])
  @@index([mentorId])
  @@index([menteeId])
}

enum MentorshipStatus {
  ACTIVE
  INACTIVE
  COMPLETED
}
```

#### 2. DocumentRequirement
```prisma
model DocumentRequirement {
  id          String   @id @default(uuid())
  title       String
  description String?
  dueDate     DateTime?
  isRequired  Boolean  @default(true)
  mentorId    String   // Created by this teacher
  
  mentor      User     @relation("MentorDocuments", fields: [mentorId], references: [id], onDelete: Cascade)
  submissions DocumentSubmission[]
  
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  
  @@index([mentorId])
}
```

#### 3. DocumentSubmission
```prisma
model DocumentSubmission {
  id            String   @id @default(uuid())
  requirementId String
  studentId     String
  fileUrl       String
  fileName      String
  fileSize      Int?
  status        DocumentStatus @default(PENDING)
  feedback      String?  // Teacher feedback
  
  requirement   DocumentRequirement @relation(fields: [requirementId], references: [id], onDelete: Cascade)
  student       User     @relation("StudentDocuments", fields: [studentId], references: [id], onDelete: Cascade)
  
  submittedAt   DateTime @default(now())
  reviewedAt    DateTime?
  
  @@unique([requirementId, studentId])
  @@index([requirementId])
  @@index([studentId])
}

enum DocumentStatus {
  PENDING
  APPROVED
  REJECTED
  REVISION_REQUESTED
}
```

## API Endpoints

### Mentorship APIs
- `GET /api/mentorship` - Get mentorship data (mentor for students, mentees for teachers)
- `POST /api/mentorship` - Create mentorship (teacher only)
- `DELETE /api/mentorship/[id]` - Remove mentorship (teacher only)
- `GET /api/mentorship/available-students` - Get unassigned students (teacher only)

### Document Requirement APIs
- `GET /api/documents/requirements` - List document requirements
- `POST /api/documents/requirements` - Create requirement (teacher only)
- `PATCH /api/documents/requirements/[id]` - Update requirement
- `DELETE /api/documents/requirements/[id]` - Delete requirement

### Document Submission APIs
- `GET /api/documents/submissions` - Get submissions (filtered by role)
- `POST /api/documents/submissions` - Submit document (student only)
- `PATCH /api/documents/submissions/[id]` - Review/update status (teacher only)

## Page Structure

### Teacher View: `/dashboard/mentorship`
- Overview dashboard with stats
- Mentee management section (add/remove mentees)
- Document requirements management
- Submissions review panel

### Student View: `/dashboard/mentorship`
- Mentor information card
- Required documents list with status
- Document submission interface
- Progress tracker

## UI Components

1. **MenteeCard** - Displays mentee info with quick actions
2. **MenteeSelector** - Modal to select students as mentees
3. **DocumentRequirementForm** - Create/edit document requirements
4. **DocumentRequirementsList** - List view of requirements
5. **DocumentSubmissionCard** - Student's submission interface
6. **DocumentReviewPanel** - Teacher's review interface
7. **MentorshipStats** - Dashboard statistics
8. **MentorCard** - Student's view of their mentor
