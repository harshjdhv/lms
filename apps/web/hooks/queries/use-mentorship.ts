/**
 * @file use-mentorship.ts
 * @description React Query hooks for mentorship system - managing mentor-mentee relationships,
 * document requirements, document submissions, and document folders.
 * @module Apps/Web/Hooks/Queries/Mentorship
 */

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

// ==========================================
// TYPES
// ==========================================

export type MentorshipStatus = "ACTIVE" | "INACTIVE" | "COMPLETED";
export type DocumentStatus =
  | "PENDING"
  | "APPROVED"
  | "REJECTED"
  | "REVISION_REQUESTED";

export interface MentorUser {
  id: string;
  name: string | null;
  email: string;
  avatar: string | null;
  expertise: string | null;
  title: string | null;
}

export interface MenteeUser {
  id: string;
  name: string | null;
  email: string;
  avatar: string | null;
  studentId: string | null;
  grade: string | null;
  semester: string | null;
}

export interface Mentorship {
  id: string;
  mentorId: string;
  menteeId: string;
  status: MentorshipStatus;
  notes: string | null;
  createdAt: string;
  mentor?: MentorUser;
  mentee?: MenteeUser;
}

export interface DocumentFolder {
  id: string;
  name: string;
  description: string | null;
  color: string | null;
  icon: string | null;
  position: number;
  mentorId: string;
  createdAt: string;
  _count?: {
    requirements: number;
  };
  stats?: {
    totalRequirements: number;
    totalSubmissions: number;
  };
}

export interface DocumentRequirement {
  id: string;
  title: string;
  description: string | null;
  dueDate: string | null;
  isRequired: boolean;
  category: string | null;
  mentorId: string;
  folderId: string | null;
  createdAt: string;
  folder?: {
    id: string;
    name: string;
    color: string | null;
    icon: string | null;
  } | null;
  _count?: {
    submissions: number;
  };
  submissions?: DocumentSubmission[];
}

export interface DocumentSubmission {
  id: string;
  requirementId: string;
  studentId: string;
  fileUrl: string;
  fileName: string;
  fileSize: number | null;
  status: DocumentStatus;
  feedback: string | null;
  submittedAt: string;
  reviewedAt: string | null;
  requirement?: DocumentRequirement;
  student?: MenteeUser;
}

export interface MentorshipData {
  mentor: MentorUser | null;
  mentees: (Mentorship & { mentee: MenteeUser })[];
  requirements: DocumentRequirement[];
  submissions: DocumentSubmission[];
  folders: DocumentFolder[];
  stats: {
    totalMentees: number;
    activeMentees: number;
    pendingDocuments: number;
    completedDocuments: number;
  };
}

export interface AcademicSubject {
  id: string;
  formId: string;
  subjectName: string;
  totalMarks: number | null;
  ia1Marks: number | null;
  ia2Marks: number | null;
  finalMarks: number | null;
  position: number;
}

export interface SemesterAcademicForm {
  id: string;
  studentId: string;
  mentorId: string | null;
  semester: string;
  courseCertificates: string[];
  submittedAt: string | null;
  updatedAt: string;
  subjects: AcademicSubject[];
  student?: MenteeUser;
}

// ==========================================
// QUERY KEYS
// ==========================================

export const mentorshipKeys = {
  all: ["mentorship"] as const,
  data: () => [...mentorshipKeys.all, "data"] as const,
  mentees: () => [...mentorshipKeys.all, "mentees"] as const,
  availableStudents: () =>
    [...mentorshipKeys.all, "available-students"] as const,
  folders: () => [...mentorshipKeys.all, "folders"] as const,
  folder: (id: string) => [...mentorshipKeys.folders(), id] as const,
  requirements: () => [...mentorshipKeys.all, "requirements"] as const,
  requirement: (id: string) => [...mentorshipKeys.requirements(), id] as const,
  submissions: () => [...mentorshipKeys.all, "submissions"] as const,
  submission: (id: string) => [...mentorshipKeys.submissions(), id] as const,
  academicForms: (studentId?: string) =>
    [...mentorshipKeys.all, "academic-forms", studentId ?? "self"] as const,
};

// ==========================================
// FETCH FUNCTIONS
// ==========================================

async function fetchMentorshipData(): Promise<MentorshipData> {
  const res = await fetch("/api/mentorship");
  if (!res.ok) {
    const error = await res.json().catch(() => ({}));
    throw new Error(error.message || "Failed to fetch mentorship data");
  }
  return res.json();
}

async function fetchAvailableStudents(): Promise<MenteeUser[]> {
  const res = await fetch("/api/mentorship/available-students");
  if (!res.ok) throw new Error("Failed to fetch available students");
  return res.json();
}

async function fetchFolders(): Promise<DocumentFolder[]> {
  const res = await fetch("/api/documents/folders");
  if (!res.ok) throw new Error("Failed to fetch folders");
  return res.json();
}

async function fetchRequirements(): Promise<DocumentRequirement[]> {
  const res = await fetch("/api/documents/requirements");
  if (!res.ok) throw new Error("Failed to fetch requirements");
  return res.json();
}

async function fetchSubmissions(): Promise<DocumentSubmission[]> {
  const res = await fetch("/api/documents/submissions");
  if (!res.ok) throw new Error("Failed to fetch submissions");
  return res.json();
}

async function fetchAcademicForms(studentId?: string): Promise<SemesterAcademicForm[]> {
  const searchParams = new URLSearchParams();
  if (studentId) {
    searchParams.set("studentId", studentId);
  }

  const url = searchParams.size
    ? `/api/mentorship/academic-forms?${searchParams.toString()}`
    : "/api/mentorship/academic-forms";

  const res = await fetch(url);
  if (!res.ok) {
    const error = await res.json().catch(() => ({}));
    throw new Error(error.message || "Failed to fetch academic forms");
  }
  return res.json();
}

// ==========================================
// QUERY HOOKS
// ==========================================

export function useMentorshipData() {
  return useQuery({
    queryKey: mentorshipKeys.data(),
    queryFn: fetchMentorshipData,
    staleTime: 3 * 60 * 1000, // 3 minutes
  });
}

export function useAvailableStudents() {
  return useQuery({
    queryKey: mentorshipKeys.availableStudents(),
    queryFn: fetchAvailableStudents,
    staleTime: 1 * 60 * 1000, // 1 minute - students can be assigned quickly
  });
}

export function useDocumentFolders() {
  return useQuery({
    queryKey: mentorshipKeys.folders(),
    queryFn: fetchFolders,
    staleTime: 3 * 60 * 1000,
  });
}

export function useDocumentRequirements() {
  return useQuery({
    queryKey: mentorshipKeys.requirements(),
    queryFn: fetchRequirements,
    staleTime: 3 * 60 * 1000,
  });
}

export function useDocumentSubmissions() {
  return useQuery({
    queryKey: mentorshipKeys.submissions(),
    queryFn: fetchSubmissions,
    staleTime: 2 * 60 * 1000,
  });
}

export function useAcademicForms(studentId?: string) {
  return useQuery({
    queryKey: mentorshipKeys.academicForms(studentId),
    queryFn: () => fetchAcademicForms(studentId),
    staleTime: 2 * 60 * 1000,
  });
}

// ==========================================
// MUTATION HOOKS
// ==========================================

// Add a mentee
export function useAddMentee() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (menteeId: string) => {
      const res = await fetch("/api/mentorship", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ menteeId }),
      });
      if (!res.ok) {
        const error = await res.json().catch(() => ({}));
        throw new Error(error.message || "Failed to add mentee");
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: mentorshipKeys.all });
    },
  });
}

// Remove a mentee
export function useRemoveMentee() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (mentorshipId: string) => {
      const res = await fetch(`/api/mentorship/${mentorshipId}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Failed to remove mentee");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: mentorshipKeys.all });
    },
  });
}

// Update mentorship notes
export function useUpdateMentorshipNotes() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, notes }: { id: string; notes: string }) => {
      const res = await fetch(`/api/mentorship/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ notes }),
      });
      if (!res.ok) throw new Error("Failed to update notes");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: mentorshipKeys.data() });
    },
  });
}

// ==========================================
// FOLDER MUTATIONS
// ==========================================

// Create document folder
export function useCreateFolder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: {
      name: string;
      description?: string;
      color?: string;
      icon?: string;
    }) => {
      const res = await fetch("/api/documents/folders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Failed to create folder");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: mentorshipKeys.all });
    },
  });
}

// Update document folder
export function useUpdateFolder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      ...data
    }: {
      id: string;
      name?: string;
      description?: string;
      color?: string;
      icon?: string;
      position?: number;
    }) => {
      const res = await fetch(`/api/documents/folders/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Failed to update folder");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: mentorshipKeys.all });
    },
  });
}

// Delete document folder
export function useDeleteFolder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/documents/folders/${id}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Failed to delete folder");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: mentorshipKeys.all });
    },
  });
}

// ==========================================
// REQUIREMENT MUTATIONS
// ==========================================

// Create document requirement
export function useCreateRequirement() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: {
      title: string;
      description?: string;
      dueDate?: string;
      isRequired?: boolean;
      category?: string;
      folderId?: string;
    }) => {
      const res = await fetch("/api/documents/requirements", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Failed to create requirement");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: mentorshipKeys.all });
    },
  });
}

// Update document requirement
export function useUpdateRequirement() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      ...data
    }: {
      id: string;
      title?: string;
      description?: string;
      dueDate?: string;
      isRequired?: boolean;
      category?: string;
      folderId?: string | null;
    }) => {
      const res = await fetch(`/api/documents/requirements/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Failed to update requirement");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: mentorshipKeys.requirements(),
      });
    },
  });
}

// Delete document requirement
export function useDeleteRequirement() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/documents/requirements/${id}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Failed to delete requirement");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: mentorshipKeys.all });
    },
  });
}

// Submit document (student)
export function useSubmitDocument() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: {
      requirementId: string;
      fileUrl: string;
      fileName: string;
      fileSize?: number;
    }) => {
      const res = await fetch("/api/documents/submissions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Failed to submit document");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: mentorshipKeys.all });
    },
  });
}

// Review document submission (teacher)
export function useReviewSubmission() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      status,
      feedback,
    }: {
      id: string;
      status: DocumentStatus;
      feedback?: string;
    }) => {
      const res = await fetch(`/api/documents/submissions/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status, feedback }),
      });
      if (!res.ok) throw new Error("Failed to review submission");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: mentorshipKeys.all });
    },
  });
}

export function useSubmitAcademicForm() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: {
      semester: string;
      courseCertificates: string[];
      subjects: Array<{
        subjectName: string;
        totalMarks?: number | null;
        ia1Marks?: number | null;
        ia2Marks?: number | null;
        finalMarks?: number | null;
      }>;
    }) => {
      const res = await fetch("/api/mentorship/academic-forms", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const error = await res.json().catch(() => ({}));
        throw new Error(error.message || "Failed to save academic form");
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: mentorshipKeys.academicForms() });
      queryClient.invalidateQueries({ queryKey: mentorshipKeys.all });
    },
  });
}
