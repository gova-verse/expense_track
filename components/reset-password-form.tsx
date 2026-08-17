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
import { resetPasswordSchema } from "@/lib/validations"
import { resetPassword } from "@/app/actions/auth"
import { z } from "zod"
import { useState, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"

function ResetPasswordContent({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const token = searchParams.get("token")
  const [error, setError] = useState<string | null>(null)

  const form = useForm<z.infer<typeof resetPasswordSchema>>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      token: token || "",
      password: "",
      confirmPassword: "",
    },
  })

  async function onSubmit(data: z.infer<typeof resetPasswordSchema>) {
    setError(null)
    const result = await resetPassword(data)
    if (!result.success) {
      setError(result.error || "Failed to reset password")
      return
    }
    router.push("/login?reset=success")
  }

  if (!token) {
    return (
      <div className={cn("flex flex-col gap-6", className)} {...props}>
        <Card>
          <CardHeader>
            <CardTitle>Invalid reset link</CardTitle>
            <CardDescription>
              This password reset link is invalid. Please request a new one.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/forgot-password">
              <Button className="w-full">Request new reset link</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card>
        <CardHeader>
          <CardTitle>Reset your password</CardTitle>
          <CardDescription>
            Enter your new password below.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <FieldGroup>
              <Field>
                <FieldLabel htmlFor="password">New password</FieldLabel>
                <Input id="password" type="password" {...form.register("password")} />
                {form.formState.errors.password && (
                  <FieldDescription className="text-destructive text-sm">{form.formState.errors.password.message}</FieldDescription>
                )}
                <FieldDescription>
                  Must be at least 8 characters with 1 uppercase, 1 lowercase and 1 number.
                </FieldDescription>
              </Field>
              <Field>
                <FieldLabel htmlFor="confirm-password">Confirm password</FieldLabel>
                <Input id="confirm-password" type="password" {...form.register("confirmPassword")} />
                {form.formState.errors.confirmPassword && (
                  <FieldDescription className="text-destructive text-sm">{form.formState.errors.confirmPassword.message}</FieldDescription>
                )}
              </Field>

              {error && (
                <div className="text-sm font-medium text-destructive">{error}</div>
              )}

              <Field>
                <Button type="submit" className="w-full" disabled={form.formState.isSubmitting}>
                  {form.formState.isSubmitting ? "Resetting..." : "Reset Password"}
                </Button>
                <div className="text-center text-sm">
                  <Link href="/login" className="underline underline-offset-4 hover:text-primary">
                    Back to Login
                  </Link>
                </div>
              </Field>
            </FieldGroup>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}

export function ResetPasswordForm(props: React.ComponentProps<"div">) {
  return (
    <Suspense fallback={
      <Card>
        <CardHeader>
          <CardTitle>Loading...</CardTitle>
        </CardHeader>
      </Card>
    }>
      <ResetPasswordContent {...props} />
    </Suspense>
  )
}
