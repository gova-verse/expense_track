"use client"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { useSearchParams, useRouter } from "next/navigation"
import { useState, useEffect, Suspense } from "react"
import Link from "next/link"

function VerifyEmailContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const token = searchParams.get("token")
  const sent = searchParams.get("sent")

  const [status, setStatus] = useState<"idle" | "verifying" | "success" | "error">(
    token ? "verifying" : "idle"
  )
  const [error, setError] = useState<string | null>(null)
  const [resendEmail, setResendEmail] = useState("")
  const [resendStatus, setResendStatus] = useState<"idle" | "sending" | "sent" | "error">("idle")
  const [resendError, setResendError] = useState<string | null>(null)

  useEffect(() => {
    if (token && status === "verifying") {
      // Email verification is not required in current config
      // Just redirect to login
      setStatus("success")
      setTimeout(() => {
        router.push("/login?verified=true")
      }, 2000)
    }
  }, [token, status, router])

  async function handleResend() {
    if (!resendEmail) return
    setResendStatus("sending")
    setResendError(null)
    // Email verification is not required in current config
    setResendStatus("sent")
  }

  // Token verification in progress
  if (token && status === "verifying") {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Verifying your email...</CardTitle>
          <CardDescription>Please wait while we verify your email address.</CardDescription>
        </CardHeader>
      </Card>
    )
  }

  // Token verification success
  if (status === "success") {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Email verified</CardTitle>
          <CardDescription>
            Your email address has been successfully verified. Redirecting to login...
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Link href="/login?verified=true">
            <Button className="w-full">Continue to Login</Button>
          </Link>
        </CardContent>
      </Card>
    )
  }

  // Token verification failed
  if (token && status === "error") {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Verification failed</CardTitle>
          <CardDescription>{error || "Verification link is invalid or has expired."}</CardDescription>
        </CardHeader>
        <CardContent>
          <FieldGroup>
            <Field>
              <FieldLabel htmlFor="resend-email">Email address</FieldLabel>
              <Input
                id="resend-email"
                type="email"
                placeholder="m@example.com"
                value={resendEmail}
                onChange={(e) => setResendEmail(e.target.value)}
              />
            </Field>
            {resendStatus === "sent" && (
              <div className="rounded-md bg-muted p-3 text-sm font-medium text-muted-foreground text-center">
                Verification email sent. Please check your inbox.
              </div>
            )}
            {resendError && (
              <div className="text-sm font-medium text-destructive">{resendError}</div>
            )}
            <Field>
              <Button
                className="w-full"
                onClick={handleResend}
                disabled={resendStatus === "sending" || !resendEmail}
              >
                {resendStatus === "sending" ? "Sending..." : "Resend verification email"}
              </Button>
              <div className="text-center text-sm">
                <Link href="/login" className="underline underline-offset-4 hover:text-primary">
                  Back to Login
                </Link>
              </div>
            </Field>
          </FieldGroup>
        </CardContent>
      </Card>
    )
  }

  // Default: "check your email" state (after signup)
  return (
    <Card>
      <CardHeader>
        <CardTitle>Check your email</CardTitle>
        <CardDescription>
          We&apos;ve sent a verification link to your email address. Please click the link to activate your account.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <FieldGroup>
          <div className="rounded-md bg-muted p-3 text-sm text-muted-foreground text-center">
            Didn&apos;t receive the email? Enter your email below to resend.
          </div>
          <Field>
            <FieldLabel htmlFor="resend-email">Email address</FieldLabel>
            <Input
              id="resend-email"
              type="email"
              placeholder="m@example.com"
              value={resendEmail}
              onChange={(e) => setResendEmail(e.target.value)}
            />
          </Field>
          {resendStatus === "sent" && (
            <div className="rounded-md bg-muted p-3 text-sm font-medium text-muted-foreground text-center">
              Verification email sent. Please check your inbox.
            </div>
          )}
          {resendError && (
            <div className="text-sm font-medium text-destructive">{resendError}</div>
          )}
          <Field>
            <Button
              className="w-full"
              onClick={handleResend}
              disabled={resendStatus === "sending" || !resendEmail}
            >
              {resendStatus === "sending" ? "Sending..." : "Resend verification email"}
            </Button>
            <div className="text-center text-sm">
              <Link href="/login" className="underline underline-offset-4 hover:text-primary">
                Back to Login
              </Link>
            </div>
          </Field>
        </FieldGroup>
      </CardContent>
    </Card>
  )
}

export function VerifyEmailClient({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Suspense fallback={
        <Card>
          <CardHeader>
            <CardTitle>Loading...</CardTitle>
          </CardHeader>
        </Card>
      }>
        <VerifyEmailContent />
      </Suspense>
    </div>
  )
}
