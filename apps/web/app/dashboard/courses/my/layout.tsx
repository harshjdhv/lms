import { UserStoreProvider } from "@/providers/user-store-provider";
import { getCurrentUser } from "@/lib/get-current-user";
import { redirect } from "next/navigation";

export default async function MyCoursesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const dbUser = await getCurrentUser();

  if (!dbUser) {
    redirect("/auth");
  }

  if (!dbUser.hasCompletedOnboarding) {
    redirect("/onboarding");
  }

  // Map to store state
  const userState = {
    id: dbUser.id,
    email: dbUser.email,
    name: dbUser.name,
    role: dbUser.role as "STUDENT" | "TEACHER",
    image: dbUser.avatar,
  };

  return (
    <UserStoreProvider user={userState}>
      <div className="min-h-screen bg-background">
        <main>{children}</main>
      </div>
    </UserStoreProvider>
  );
}
