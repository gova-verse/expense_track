import { getAuthenticatedUser } from "@/app/actions/settings"
import { AccountClient } from "@/components/account-client"

export default async function AccountSettingsPage() {
  const user = await getAuthenticatedUser()
  
  return (
    <AccountClient user={{
      name: user.name || "",
      email: user.email,
      emailVerifiedAt: user.emailVerifiedAt ? user.emailVerifiedAt.toISOString() : null,
      createdAt: user.createdAt.toISOString(),
    }} />
  )
}
