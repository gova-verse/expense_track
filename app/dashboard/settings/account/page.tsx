import { getMe } from "@/server/api-client"
import { AccountClient } from "@/components/account-client"

export default async function AccountSettingsPage() {
  const user = await getMe()

  return (
    <AccountClient user={{
      name: user.name || "",
      email: user.email,
      emailVerifiedAt: user.emailVerifiedAt ?? null,
      createdAt: user.createdAt,
    }} />
  )
}
