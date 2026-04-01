import type { FastifyInstance } from 'fastify'
import { authController } from '../controllers/auth-controller.js'

export default async function authRoutes(app: FastifyInstance) {
  // POST /api/v1/auth/login
  app.post('/login', authController.login)

  // POST /api/v1/auth/refresh
  app.post('/refresh', authController.refresh)

  // POST /api/v1/auth/logout
  app.post('/logout', authController.logout)
}
