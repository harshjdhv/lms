"use server";

import { z } from "zod";
import { getCurrentUser } from "@/lib/get-current-user";
import { prisma } from "@workspace/database";
import { revalidatePath } from "next/cache";

const userSchema = z.object({
  name: z.string().min(2).optional(),
  bio: z.string().optional(),
  phone: z.string().optional(),
  // Teacher specific
  expertise: z.string().optional(),
  title: z.string().optional(),
  // Student specific
  studentId: z.string().optional(),
  grade: z.string().optional(),
  semester: z.string().optional(),
});

export type UserUpdateInput = z.infer<typeof userSchema>;

export async function updateUser(data: UserUpdateInput) {
  const user = await getCurrentUser();

  if (!user) {
    throw new Error("Unauthorized");
  }

  const validatedData = userSchema.parse(data);

  try {
    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: {
        ...validatedData,
      },
    });

    revalidatePath("/dashboard/account");
    revalidatePath("/dashboard"); // To update sidebar avatar/name if changed

    return { success: true, user: updatedUser };
  } catch (error) {
    console.error("Failed to update user:", error);
    return { success: false, error: "Failed to update profile" };
  }
}
