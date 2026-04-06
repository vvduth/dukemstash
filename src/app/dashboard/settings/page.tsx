import { connection } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChangePasswordForm } from "@/components/profile/ChangePasswordForm";
import { DeleteAccountButton } from "@/components/profile/DeleteAccountButton";
import { EditorPreferencesForm } from "@/components/settings/EditorPreferencesForm";
import { BillingSection } from "@/components/dashboard/BillingSection";

export default async function SettingsPage() {
  await connection();

  const session = await auth();
  const user = session?.user?.id
    ? await prisma.user.findUnique({
        where: { id: session.user.id },
        select: { id: true, password: true, isPro: true },
      })
    : null;

  if (!user) return null;

  const hasPassword = !!user.password;

  return (
    <div className="p-6 space-y-8 max-w-3xl mx-auto">
      {/* Page header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground">Settings</h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          Manage your account settings
        </p>
      </div>

      {/* Billing */}
      <BillingSection isPro={user.isPro} email={session!.user!.email!} />

      {/* Editor preferences */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Editor</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-xs text-muted-foreground mb-4">
            Customize the code editor appearance and behavior
          </p>
          <EditorPreferencesForm />
        </CardContent>
      </Card>

      {/* Change password */}
      {hasPassword && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Password</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground mb-3">
              Update your password to keep your account secure
            </p>
            <ChangePasswordForm />
          </CardContent>
        </Card>
      )}

      {/* Danger zone */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base text-destructive">
            Danger zone
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-xs text-muted-foreground mb-3">
            Permanently delete your account and all associated data
          </p>
          <DeleteAccountButton />
        </CardContent>
      </Card>
    </div>
  );
}
