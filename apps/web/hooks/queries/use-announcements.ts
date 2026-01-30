import { useQuery, useQueryClient } from "@tanstack/react-query";

export interface Announcement {
  id: string;
  title: string;
  content: string;
  imageUrl: string;
  createdAt: string;
  course: {
    title: string;
  };
}

export const announcementKeys = {
  all: ["announcements"] as const,
  lists: () => [...announcementKeys.all, "list"] as const,
  list: (filters: string) =>
    [...announcementKeys.lists(), { filters }] as const,
};

async function fetchAnnouncements(): Promise<Announcement[]> {
  const res = await fetch("/api/announcements");
  if (!res.ok) throw new Error("Failed to fetch announcements");
  return res.json();
}

export function useAnnouncements() {
  return useQuery({
    queryKey: announcementKeys.lists(),
    queryFn: fetchAnnouncements,
    staleTime: 5 * 60 * 1000, // 5 minutes - announcements don't change often
    refetchOnWindowFocus: true,
    refetchOnReconnect: true,
  });
}

export function useInvalidateAnnouncements() {
  const queryClient = useQueryClient();
  return () =>
    queryClient.invalidateQueries({ queryKey: announcementKeys.all });
}
