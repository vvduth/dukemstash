import { verifyEmailToken } from "@/lib/db/verification"
import { CheckCircle, XCircle } from "lucide-react"
import Link from "next/link"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

export default async function VerifyEmailPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>
}) {
  const { token } = await searchParams

  if (!token) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <Card className="w-full max-w-sm text-center">
          <CardHeader>
            <XCircle className="h-12 w-12 text-destructive mx-auto mb-2" />
            <CardTitle>Invalid Link</CardTitle>
            <CardDescription>No verification token provided.</CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/sign-in" className="inline-flex w-full items-center justify-center rounded-lg bg-primary text-primary-foreground text-sm font-medium h-8 px-2.5 transition-all hover:bg-primary/80">
              Go to Sign In
            </Link>
          </CardContent>
        </Card>
      </div>
    )
  }

  const result = await verifyEmailToken(token)

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <Card className="w-full max-w-sm text-center">
        <CardHeader>
          {result.success ? (
            <>
              <CheckCircle className="h-12 w-12 text-emerald-500 mx-auto mb-2" />
              <CardTitle>Email Verified</CardTitle>
              <CardDescription>Your email has been verified. You can now sign in.</CardDescription>
            </>
          ) : (
            <>
              <XCircle className="h-12 w-12 text-destructive mx-auto mb-2" />
              <CardTitle>Verification Failed</CardTitle>
              <CardDescription>{result.error}</CardDescription>
            </>
          )}
        </CardHeader>
        <CardContent>
          <Link href="/sign-in" className="inline-flex w-full items-center justify-center rounded-lg bg-primary text-primary-foreground text-sm font-medium h-8 px-2.5 transition-all hover:bg-primary/80">
            Go to Sign In
          </Link>
        </CardContent>
      </Card>
    </div>
  )
}
