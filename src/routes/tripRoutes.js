import express from 'express'
import { createTripController } from '../controllers/tripController.js'
import { authMiddleware } from '../middleware/authMiddleware.js'

const router = express.Router()

router.get('/create/:userId', authMiddleware, createTripController)

router.post('/create/:userId', authMiddleware, createTripController)

export default router
