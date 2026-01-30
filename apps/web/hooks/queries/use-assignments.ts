import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

export interface Assignment {
  id: string;
  title: string;
  content: string;
  attachmentUrl?: string | null;
  status: "ACTIVE" | "REVIEW" | "STOPPED";
  dueDate?: string | null;
  createdAt: string;
  course: {
    title: string;
  };
  submissions?: {
    id: string;
    status: "PENDING" | "APPROVED" | "REJECTED";
    attachmentUrl: string;
    feedback?: string | null;
  }[];
  _count?: {
    submissions: number;
  };
}

export const assignmentKeys = {
  all: ["assignments"] as const,
  lists: () => [...assignmentKeys.all, "list"] as const,
  list: (filters: string) => [...assignmentKeys.lists(), { filters }] as const,
  details: () => [...assignmentKeys.all, "detail"] as const,
  detail: (id: string) => [...assignmentKeys.details(), id] as const,
};

async function fetchAssignments(): Promise<Assignment[]> {
  const res = await fetch("/api/assignments");
  if (!res.ok) throw new Error("Failed to fetch assignments");
  return res.json();
}

export function useAssignments() {
  return useQuery({
    queryKey: assignmentKeys.lists(),
    queryFn: fetchAssignments,
    staleTime: 2 * 60 * 1000, // 2 minutes - assignments can change frequently
    refetchOnWindowFocus: true,
    refetchOnReconnect: true,
  });
}

export function useSubmitAssignment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      assignmentId,
      attachmentUrl,
    }: {
      assignmentId: string;
      attachmentUrl: string;
    }) => {
      const res = await fetch("/api/assignments/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ assignmentId, attachmentUrl }),
      });
      if (!res.ok) throw new Error("Failed to submit");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: assignmentKeys.all });
    },
  });
}

export function useUpdateAssignmentStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const res = await fetch("/api/assignments/update", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status }),
      });
      if (!res.ok) throw new Error("Failed to update");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: assignmentKeys.all });
    },
  });
}
