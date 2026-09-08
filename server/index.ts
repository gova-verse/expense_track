import { Hono } from 'hono'
import { transactions } from './routes/transactions'
import { accounts } from './routes/accounts'
import { categories } from './routes/categories'
import { auth } from './routes/auth'
import { budgets } from './routes/budgets'
import { settings } from './routes/settings'
import { transfers } from './routes/transfers'

const app = new Hono().basePath('/api')

const routes = app
  .route('/transactions', transactions)
  .route('/accounts', accounts)
  .route('/categories', categories)
  .route('/auth', auth)
  .route('/budgets', budgets)
  .route('/settings', settings)
  .route('/transfers', transfers)

// Export the fully-typed app for use with Hono's RPC client (`hono/client`)
export type AppType = typeof routes

export default app
