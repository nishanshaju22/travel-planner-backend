import express from 'express'
import { authMiddleware } from '../middleware/authMiddleware.js'
import { getNotificationController } from '../controllers/notificationController.js'

const router = express.Router()
router.use(authMiddleware)

router.get('/', getNotificationController)

export default router
