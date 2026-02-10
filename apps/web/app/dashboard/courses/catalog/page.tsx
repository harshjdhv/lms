import { redirect } from "next/navigation";

export default async function CourseCatalogPage() {
    redirect("/dashboard/courses/my");
}
