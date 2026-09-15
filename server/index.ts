import { Hono } from 'hono'
import { transactions } from './routes/transactions'
import { accounts } from './routes/accounts'
import { categories } from './routes/categories'
import { budgets } from './routes/budgets'
import { settings } from './routes/settings'
import { transfers } from './routes/transfers'
import { authMiddleware } from './middleware/auth'

const app = new Hono().basePath('/api')


app.use('/transactions/*', authMiddleware)
app.use('/accounts/*', authMiddleware)
app.use('/categories/*', authMiddleware)
app.use('/budgets/*', authMiddleware)
app.use('/settings/*', authMiddleware)
app.use('/transfers/*', authMiddleware)

const routes = app
  .route('/transactions', transactions)
  .route('/accounts', accounts)
  .route('/categories', categories)
  .route('/budgets', budgets)
  .route('/settings', settings)
  .route('/transfers', transfers)


export type AppType = typeof routes

export default app
