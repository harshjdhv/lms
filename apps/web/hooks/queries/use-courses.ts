import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

export interface CourseWithMeta {
  id: string;
  title: string;
  description: string | null;
  imageUrl: string | null;
  isPublished: boolean;
  teacherId: string;
  createdAt: Date | string;
  updatedAt: Date | string;
  teacher?: { name: string | null };
  _count?: { chapters: number };
}

export interface Chapter {
  id: string;
  title: string;
  description: string | null;
  videoUrl: string | null;
  position: number;
  isPublished: boolean;
  isFree: boolean;
  courseId: string;
}

export const courseKeys = {
  all: ["courses"] as const,
  lists: () => [...courseKeys.all, "list"] as const,
  list: (filter: string) => [...courseKeys.lists(), filter] as const,
  available: () => [...courseKeys.all, "available"] as const,
  my: () => [...courseKeys.all, "my"] as const,
  details: () => [...courseKeys.all, "detail"] as const,
  detail: (id: string) => [...courseKeys.details(), id] as const,
};

async function fetchAvailableCourses(): Promise<CourseWithMeta[]> {
  const res = await fetch("/api/courses/available");
  if (!res.ok) throw new Error("Failed to fetch courses");
  return res.json();
}

async function fetchMyCourses(): Promise<CourseWithMeta[]> {
  const res = await fetch("/api/courses/my");
  if (!res.ok) throw new Error("Failed to fetch courses");
  return res.json();
}

async function fetchCourse(
  courseId: string,
): Promise<CourseWithMeta & { chapters: Chapter[] }> {
  const res = await fetch(`/api/courses/${courseId}`);
  if (!res.ok) throw new Error("Failed to fetch course");
  return res.json();
}

export function useAvailableCourses(options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: courseKeys.available(),
    queryFn: fetchAvailableCourses,
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: true,
    ...options,
  });
}

export function useMyCourses() {
  return useQuery({
    queryKey: courseKeys.my(),
    queryFn: fetchMyCourses,
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: true,
  });
}

export function useCourse(
  courseId: string,
  initialData?: CourseWithMeta & { chapters: Chapter[] },
) {
  return useQuery({
    queryKey: courseKeys.detail(courseId),
    queryFn: () => fetchCourse(courseId),
    initialData,
    staleTime: 5 * 60 * 1000,
  });
}

export function useEnrollCourse() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (courseId: string) => {
      const res = await fetch(`/api/courses/${courseId}/enroll`, {
        method: "POST",
      });
      if (!res.ok) throw new Error("Failed to enroll");
      return res.json();
    },
    onSuccess: () => {
      // Invalidate both available and my courses lists
      queryClient.invalidateQueries({ queryKey: courseKeys.available() });
      queryClient.invalidateQueries({ queryKey: courseKeys.my() });
    },
  });
}

export function useEnrollCourseViaBody() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (courseId: string) => {
      const res = await fetch("/api/courses/enroll", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ courseId }),
      });
      if (!res.ok) throw new Error("Failed to enroll");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: courseKeys.available() });
      queryClient.invalidateQueries({ queryKey: courseKeys.my() });
      queryClient.invalidateQueries({ queryKey: ["assignments"] }); // New enrollments may bring new assignments
    },
  });
}
