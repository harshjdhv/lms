import { Suspense } from "react";
import { getCurrentUser } from "@/lib/get-current-user";
import { AccountForm } from "@/features/account/account-form";
import { Separator } from "@workspace/ui/components/separator";

export default async function AccountPage() {
    const user = await getCurrentUser();

    if (!user) {
        return null;
    }

    return (
        <div className="flex flex-1 flex-col gap-4 p-4 md:p-8 pt-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Settings</h2>
                    <p className="text-muted-foreground">
                        Manage your account settings and profile preferences.
                    </p>
                </div>
            </div>
            <Separator className="my-4" />
            <div className="w-full max-w-7xl mx-auto">
                <Suspense fallback={<div>Loading account details...</div>}>
                    <AccountForm user={user} />
                </Suspense>
            </div>
        </div>
    );
}
