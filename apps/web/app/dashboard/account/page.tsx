import { Suspense } from "react";
import { getCurrentUser } from "@/lib/get-current-user";
import { AccountForm } from "@/features/account/account-form";

export default async function AccountPage() {
    const user = await getCurrentUser();

    if (!user) {
        return null;
    }

    return (
        <div className="flex w-full min-w-0 flex-col">
            <Suspense fallback={<div className="flex flex-1 items-center justify-center p-12 text-sm text-muted-foreground">Loading…</div>}>
                <AccountForm user={user} />
            </Suspense>
        </div>
    );
}
