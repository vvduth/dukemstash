import { connection } from "next/server";
import { Calendar } from "lucide-react";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { getProfileStats } from "@/lib/db/profile";
import { UserAvatar } from "@/components/UserAvatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { ICON_MAP, type IconName } from "@/lib/constants/icon-map";
import { ChangePasswordForm } from "@/components/profile/ChangePasswordForm";
import { DeleteAccountButton } from "@/components/profile/DeleteAccountButton";

export default async function ProfilePage() {
  await connection();

  const session = await auth();
  const user = session?.user?.email
    ? await prisma.user.findUnique({ where: { email: session.user.email } })
    : null;

  if (!user) return null;

  const stats = await getProfileStats(user.id);
  const hasPassword = !!user.password;

  const joinedDate = user.createdAt.toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });

  return (
    <div className="p-6 space-y-8 max-w-3xl mx-auto">
      {/* Page header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground">Profile</h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          Manage your account settings
        </p>
      </div>

      {/* User info */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center gap-4">
            <UserAvatar
              name={user.name}
              image={user.image}
              size="lg"
              className="w-16 h-16 text-xl"
            />
            <div className="space-y-1">
              <h2 className="text-lg font-semibold text-foreground">
                {user.name ?? "User"}
              </h2>
              <p className="text-sm text-muted-foreground">{user.email}</p>
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <Calendar className="h-3 w-3" />
                <span>Joined {joinedDate}</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Usage stats */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Usage</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="rounded-lg border p-3">
              <p className="text-2xl font-bold text-foreground">
                {stats.totalItems}
              </p>
              <p className="text-xs text-muted-foreground">Total items</p>
            </div>
            <div className="rounded-lg border p-3">
              <p className="text-2xl font-bold text-foreground">
                {stats.totalCollections}
              </p>
              <p className="text-xs text-muted-foreground">Collections</p>
            </div>
          </div>

          {stats.typeBreakdown.length > 0 && (
            <>
              <Separator />
              <div>
                <p className="text-sm font-medium text-foreground mb-3">
                  Items by type
                </p>
                <div className="space-y-2">
                  {stats.typeBreakdown
                    .sort((a, b) => b.count - a.count)
                    .map((type) => {
                      const Icon = ICON_MAP[type.icon as IconName];
                      return (
                        <div
                          key={type.name}
                          className="flex items-center justify-between"
                        >
                          <div className="flex items-center gap-2">
                            {Icon && (
                              <Icon
                                className="h-4 w-4"
                                style={{ color: type.color }}
                              />
                            )}
                            <span className="text-sm capitalize">
                              {type.name}s
                            </span>
                          </div>
                          <span className="text-sm text-muted-foreground">
                            {type.count}
                          </span>
                        </div>
                      );
                    })}
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Account actions */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Account</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {hasPassword && (
            <div>
              <h3 className="text-sm font-medium text-foreground mb-1">
                Password
              </h3>
              <p className="text-xs text-muted-foreground mb-3">
                Update your password to keep your account secure
              </p>
              <ChangePasswordForm />
            </div>
          )}

          {hasPassword && <Separator />}

          <div>
            <h3 className="text-sm font-medium text-destructive mb-1">
              Danger zone
            </h3>
            <p className="text-xs text-muted-foreground mb-3">
              Permanently delete your account and all associated data
            </p>
            <DeleteAccountButton />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
