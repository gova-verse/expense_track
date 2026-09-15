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
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { loginSchema } from "@/lib/validations"
import { z } from "zod"
import { useState, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { authClient } from "@/lib/auth-client"

function LoginFormContent({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const verified = searchParams.get("verified")
  const reset = searchParams.get("reset")

  const [error, setError] = useState<string | null>(null)
  const [requiresVerification, setRequiresVerification] = useState(false)
  const [verificationEmail, setVerificationEmail] = useState<string | null>(null)
  const [resendStatus, setResendStatus] = useState<"idle" | "sending" | "sent">("idle")

  const form = useForm<z.infer<typeof loginSchema>>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  })

  async function onSubmit(formData: z.infer<typeof loginSchema>) {
    setError(null)
    setRequiresVerification(false)
    setResendStatus("idle")

    const { error: authError } = await authClient.signIn.email({
      email: formData.email,
      password: formData.password,
    })

    if (authError) {
      setError(authError.message || "Failed to login")
      return
    }
    router.push("/dashboard")
  }

  async function handleResendVerification() {
    if (!verificationEmail) return
    setResendStatus("sending")
    await fetch('/api/auth/resend-verification', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: verificationEmail }),
    })
    setResendStatus("sent")
  }

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card>
        <CardHeader>
          <CardTitle>Login to your account</CardTitle>
          <CardDescription>
            Enter your email below to login to your account
          </CardDescription>
        </CardHeader>
        <CardContent>
          {verified === "true" && (
            <div className="rounded-md bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-800 p-3 text-sm font-medium text-green-700 dark:text-green-400 text-center mb-4">
              Email verified successfully! You can now sign in.
            </div>
          )}
          {reset === "success" && (
            <div className="rounded-md bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-800 p-3 text-sm font-medium text-green-700 dark:text-green-400 text-center mb-4">
              Password reset successfully! You can now sign in with your new password.
            </div>
          )}
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <FieldGroup>
              <Field>
                <FieldLabel htmlFor="email">Email</FieldLabel>
                <Input
                  id="email"
                  type="email"
                  placeholder="m@example.com"
                  {...form.register("email")}
                />
                {form.formState.errors.email && (
                  <FieldDescription className="text-destructive text-sm">{form.formState.errors.email.message}</FieldDescription>
                )}
              </Field>
              <Field>
                <div className="flex items-center">
                  <FieldLabel htmlFor="password">Password</FieldLabel>
                  <Link
                    href="/forgot-password"
                    className="ml-auto inline-block text-sm underline-offset-4 hover:underline"
                  >
                    Forgot your password?
                  </Link>
                </div>
                <Input id="password" type="password" {...form.register("password")} />
                {form.formState.errors.password && (
                  <FieldDescription className="text-destructive text-sm">{form.formState.errors.password.message}</FieldDescription>
                )}
              </Field>

              {error && (
                <div className="text-sm font-medium text-destructive">{error}</div>
              )}

              {requiresVerification && (
                <Button
                  type="button"
                  variant="outline"
                  className="w-full"
                  onClick={handleResendVerification}
                  disabled={resendStatus === "sending" || resendStatus === "sent"}
                >
                  {resendStatus === "sending"
                    ? "Sending..."
                    : resendStatus === "sent"
                      ? "Verification email sent!"
                      : "Resend verification email"}
                </Button>
              )}

              <Field>
                <Button type="submit" disabled={form.formState.isSubmitting}>
                  {form.formState.isSubmitting ? "Logging in..." : "Login"}
                </Button>
                <Button variant="outline" type="button" asChild>
                  <a href="#" onClick={(e) => { e.preventDefault(); authClient.signIn.social({ provider: 'google' }) }}>Login with Google</a>
                </Button>

                <FieldDescription className="text-center">
                  Don&apos;t have an account? <Link href="/signup">Sign up</Link>
                </FieldDescription>
              </Field>
            </FieldGroup>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}

export function LoginForm(props: React.ComponentProps<"div">) {
  return (
    <Suspense fallback={
      <Card>
        <CardHeader>
          <CardTitle>Loading...</CardTitle>
        </CardHeader>
      </Card>
    }>
      <LoginFormContent {...props} />
    </Suspense>
  )
}
