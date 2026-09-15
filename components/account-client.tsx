"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { updateProfileSchema, changePasswordSchema } from "@/lib/validations"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field"
import { CheckCircleIcon, WarningCircleIcon, Trash } from "@phosphor-icons/react"
import { useRouter } from "next/navigation"
import { authClient } from "@/lib/auth-client"
import { ConfirmDialog } from "@/components/ui/confirm-dialog"

interface AccountUser {
  name: string
  email: string
  emailVerifiedAt: string | null
  createdAt: string
}

export function AccountClient({ user }: { user: AccountUser }) {
  const router = useRouter()
  const [profileSuccess, setProfileSuccess] = useState(false)
  const [profileError, setProfileError] = useState<string | null>(null)
  const [passwordSuccess, setPasswordSuccess] = useState(false)
  const [passwordError, setPasswordError] = useState<string | null>(null)

  const [deleting, setDeleting] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [deleteError, setDeleteError] = useState<string | null>(null)

  const profileForm = useForm<z.infer<typeof updateProfileSchema>>({
    resolver: zodResolver(updateProfileSchema),
    defaultValues: { name: user.name },
  })

  const passwordForm = useForm<z.infer<typeof changePasswordSchema>>({
    resolver: zodResolver(changePasswordSchema),
    defaultValues: { currentPassword: "", newPassword: "", confirmPassword: "" },
  })

  async function onProfileSubmit(data: z.infer<typeof updateProfileSchema>) {
    setProfileError(null)
    setProfileSuccess(false)
    const result = await fetch('/api/settings/profile', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    }).then(r => r.json())
    if (result.success) {
      setProfileSuccess(true)
      router.refresh()
    } else {
      setProfileError(result.error || "Failed to update profile")
    }
  }

  async function onPasswordSubmit(data: z.infer<typeof changePasswordSchema>) {
    setPasswordError(null)
    setPasswordSuccess(false)
    const { error } = await authClient.changePassword({
      newPassword: data.newPassword,
      currentPassword: data.currentPassword,
      revokeOtherSessions: true,
    })

    if (!error) {
      setPasswordSuccess(true)
      passwordForm.reset()
    } else {
      setPasswordError(error.message || "Failed to change password")
    }
  }

  const handleDeleteAccount = () => {
    setShowDeleteConfirm(true)
    setDeleteError(null)
  }

  const performDeleteAccount = async () => {
    setDeleting(true)
    try {
      const res = await fetch('/api/settings/account', { method: 'DELETE' })
      if (res.ok) {
        window.location.href = '/login'
      } else {
        setDeleteError('Failed to delete account. Please try again.')
        setDeleting(false)
      }
    } catch {
      setDeleteError('Something went wrong. Please try again.')
      setDeleting(false)
    }
  }

  const memberSince = new Date(user.createdAt).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  })

  return (
    <div className="space-y-8">
      {}
      <div>
        <h3 className="text-lg font-medium">Profile</h3>
        <p className="text-sm text-muted-foreground">
          Your personal account information.
        </p>
      </div>
      <Separator />

      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-muted-foreground">Email</span>
            <p className="font-medium">{user.email}</p>
          </div>
          <div>
            <span className="text-muted-foreground">Member since</span>
            <p className="font-medium">{memberSince}</p>
          </div>
          <div>
            <span className="text-muted-foreground">Email verification</span>
            <p className="font-medium flex items-center gap-1.5">
              {user.emailVerifiedAt ? (
                <>
                  <CheckCircleIcon className="h-4 w-4 text-green-600" weight="fill" />
                  Verified
                </>
              ) : (
                <>
                  <WarningCircleIcon className="h-4 w-4 text-amber-500" weight="fill" />
                  Not verified
                </>
              )}
            </p>
          </div>
        </div>
      </div>

      {}
      <div>
        <h3 className="text-lg font-medium">Personal Information</h3>
        <p className="text-sm text-muted-foreground">
          Update your display name.
        </p>
      </div>
      <Separator />

      <form onSubmit={profileForm.handleSubmit(onProfileSubmit)}>
        <FieldGroup>
          <Field>
            <FieldLabel htmlFor="name">Full name</FieldLabel>
            <Input id="name" {...profileForm.register("name")} />
            {profileForm.formState.errors.name && (
              <FieldDescription className="text-destructive text-sm">{profileForm.formState.errors.name.message}</FieldDescription>
            )}
          </Field>
          {profileSuccess && (
            <div className="rounded-md bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-800 p-3 text-sm font-medium text-green-700 dark:text-green-400">
              Profile updated successfully.
            </div>
          )}
          {profileError && (
            <div className="text-sm font-medium text-destructive">{profileError}</div>
          )}
          <Button type="submit" disabled={profileForm.formState.isSubmitting} className="w-fit">
            {profileForm.formState.isSubmitting ? "Saving..." : "Save changes"}
          </Button>
        </FieldGroup>
      </form>

      {}
      <div>
        <h3 className="text-lg font-medium">Password & Security</h3>
        <p className="text-sm text-muted-foreground">
          Change your password. You&apos;ll need your current password to set a new one.
        </p>
      </div>
      <Separator />

      <form onSubmit={passwordForm.handleSubmit(onPasswordSubmit)}>
        <FieldGroup>
          <Field>
            <FieldLabel htmlFor="current-password">Current password</FieldLabel>
            <Input id="current-password" type="password" {...passwordForm.register("currentPassword")} />
            {passwordForm.formState.errors.currentPassword && (
              <FieldDescription className="text-destructive text-sm">{passwordForm.formState.errors.currentPassword.message}</FieldDescription>
            )}
          </Field>
          <Field>
            <FieldLabel htmlFor="new-password">New password</FieldLabel>
            <Input id="new-password" type="password" {...passwordForm.register("newPassword")} />
            {passwordForm.formState.errors.newPassword && (
              <FieldDescription className="text-destructive text-sm">{passwordForm.formState.errors.newPassword.message}</FieldDescription>
            )}
            <FieldDescription>
              Must be at least 8 characters with 1 uppercase, 1 lowercase and 1 number.
            </FieldDescription>
          </Field>
          <Field>
            <FieldLabel htmlFor="confirm-new-password">Confirm new password</FieldLabel>
            <Input id="confirm-new-password" type="password" {...passwordForm.register("confirmPassword")} />
            {passwordForm.formState.errors.confirmPassword && (
              <FieldDescription className="text-destructive text-sm">{passwordForm.formState.errors.confirmPassword.message}</FieldDescription>
            )}
          </Field>
          {passwordSuccess && (
            <div className="rounded-md bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-800 p-3 text-sm font-medium text-green-700 dark:text-green-400">
              Password changed successfully.
            </div>
          )}
          {passwordError && (
            <div className="text-sm font-medium text-destructive">{passwordError}</div>
          )}
          <Button type="submit" disabled={passwordForm.formState.isSubmitting} className="w-fit">
            {passwordForm.formState.isSubmitting ? "Changing..." : "Change password"}
          </Button>
        </FieldGroup>
      </form>

      {}
      <div className="pt-8">
        <div>
          <h3 className="text-lg font-medium text-red-600 dark:text-red-500">Danger Zone</h3>
          <p className="text-sm text-muted-foreground">
            Permanently delete your account and all associated data.
          </p>
        </div>
        <Separator className="my-4 bg-red-100 dark:bg-red-900/30" />

        <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between p-4 border rounded-lg border-red-100 dark:border-red-900/30 bg-red-50/50 dark:bg-red-900/10">
          <div className="flex gap-4">
            <div className="p-2 bg-red-100 dark:bg-red-900/30 rounded-full self-start">
              <Trash className="w-6 h-6 text-red-600 dark:text-red-500" />
            </div>
            <div>
              <h4 className="font-medium text-red-600 dark:text-red-500">Delete Account</h4>
              <p className="text-sm text-muted-foreground mt-1 max-w-md">
                Permanently delete your account and all associated data. This action cannot be undone.
              </p>
            </div>
          </div>
          <Button variant="destructive" onClick={handleDeleteAccount} disabled={deleting} className="shrink-0">
            {deleting ? 'Deleting...' : 'Delete Account'}
          </Button>
        </div>
      </div>
      
      <ConfirmDialog 
        open={showDeleteConfirm} 
        onOpenChange={(open) => {
          if (!open) {
            setShowDeleteConfirm(false)
            setDeleteError(null)
          }
        }}
        title="Delete Account"
        description="⚠️ This will permanently delete your account and ALL your data (transactions, accounts, budgets). This cannot be undone."
        onConfirm={performDeleteAccount}
        isPending={deleting}
        error={deleteError}
      />
    </div>
  )
}
