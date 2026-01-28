import { cache } from "react";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@workspace/database";
import { redirect } from "next/navigation";

export const getCurrentUser = cache(async () => {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return null;
  }

  const dbUser = await prisma.user.findUnique({
    where: { email: user.email! },
  });

  return dbUser;
});
