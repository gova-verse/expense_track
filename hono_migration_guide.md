# Migrating from Next.js Server Actions to Hono

This guide will walk you through migrating your Next.js backend (currently using Server Actions in `app/actions/`) to a **Hono** API. 

The best way to integrate Hono with a Next.js application is by running Hono inside an API route (`app/api/[[...route]]/route.ts`) and using **Hono RPC** on the frontend. This gives you the speed of Hono while keeping the strict end-to-end type safety you currently enjoy with Server Actions.

---

## 1. Installation

First, install Hono and the Zod validator (assuming you use Zod for validation based on your `package.json`):

```bash
pnpm add hono @hono/zod-validator
```

---

## 2. Setting up the Hono API

Instead of having scattered server actions, you will create a centralized API. 
Create a new directory called `server` at the root of your project to hold your Hono app.

### A. Create the Main Hono App
Create `server/index.ts`:

```typescript
import { Hono } from 'hono'
import { transactionsRouter } from './routes/transactions'
import { authRouter } from './routes/auth'
// ... import other routers

const app = new Hono().basePath('/api')

// Attach your routers
const routes = app
  .route('/transactions', transactionsRouter)
  .route('/auth', authRouter)

// Export the type of your API for the frontend RPC client
export type AppType = typeof routes
export default app
```

### B. Expose Hono to Next.js
Next.js needs to route API requests to your Hono app. 
Create a catch-all route at `app/api/[[...route]]/route.ts`:

```typescript
import { handle } from 'hono/vercel'
import app from '@/server/index'

// This allows Hono to handle all requests sent to /api/*
export const GET = handle(app)
export const POST = handle(app)
export const PUT = handle(app)
export const DELETE = handle(app)
export const PATCH = handle(app)
```

---

## 3. Migrating an Action to a Hono Route

Let's look at how to migrate one of your files, for example, `actions/transactions.ts`.

**Old Way (Server Action):**
```typescript
'use server'
import { z } from 'zod'
import { db } from '@/db'

const schema = z.object({ amount: z.number(), description: z.string() })

export async function createTransaction(formData: FormData) {
  const data = schema.parse(Object.fromEntries(formData))
  await db.insert(transactions).values(data)
  return { success: true }
}
```

**New Way (Hono Route):**
Create `server/routes/transactions.ts`:

```typescript
import { Hono } from 'hono'
import { zValidator } from '@hono/zod-validator'
import { z } from 'zod'
import { db } from '@/db'
import { transactions } from '@/db/schema'

export const transactionsRouter = new Hono()
  .post(
    '/',
    // Hono handles validation automatically!
    zValidator('json', z.object({
      amount: z.number(),
      description: z.string()
    })),
    async (c) => {
      const data = c.req.valid('json')
      
      // Perform DB operations
      await db.insert(transactions).values(data)
      
      return c.json({ success: true, message: "Transaction created" })
    }
  )
  .get('/', async (c) => {
    const allTransactions = await db.select().from(transactions)
    return c.json(allTransactions)
  })
```

---

## 4. Setting up the RPC Client (Frontend)

Hono RPC allows you to call your API from React with full autocomplete, just like Server Actions.

Create `lib/rpc.ts`:
```typescript
import { hc } from 'hono/client'
import { AppType } from '@/server/index'

// Create the client
export const client = hc<AppType>(process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000')
```

---

## 5. Updating your React Components

Now, replace your Server Action calls with the Hono RPC client.

**Old Way:**
```tsx
import { createTransaction } from '@/app/actions/transactions'

// Inside component:
<form action={createTransaction}>...
```

**New Way (Hono RPC):**
Using Hono RPC is best paired with **React Query** for state management, or you can just use standard async functions.

```tsx
import { client } from '@/lib/rpc'
import { useState } from 'react'

export function TransactionForm() {
  const [loading, setLoading] = useState(false)

  const onSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    // client.api.transactions.$post is fully typed based on your Hono router!
    const response = await client.api.transactions.$post({
      json: {
        amount: 100,
        description: "Groceries"
      }
    })

    const result = await response.json()
    console.log(result) // { success: true, message: "..." }
    setLoading(false)
  }

  return (
    <form onSubmit={onSubmit}>
       {/* form fields */}
    </form>
  )
}
```

> [!IMPORTANT]
> **Authentication:** In Server Actions, you likely checked cookies/sessions directly. In Hono, you should create a middleware (`server/middleware/auth.ts`) that checks the session cookie and attaches the user to the Hono context (`c.set('user', user)`). You can then apply this middleware to protected routes.

## Summary of the Migration Path
1. Keep the Next.js frontend intact.
2. Build your API inside the new `server/` directory using Hono.
3. Use `app/api/[[...route]]/route.ts` as the single entry point.
4. Go through `app/actions/*.ts` one by one, moving the logic to Hono routes.
5. Update your client components to use the `hc` (Hono Client) instead of importing server actions.
