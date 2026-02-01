import express from 'express'
import { createTripController,getAllTripsController, getTripController, updateTripController, deleteTripController } from '../controllers/tripController.js'
import { authMiddleware } from '../middleware/authMiddleware.js'

const router = express.Router()
router.use(authMiddleware)

router.post('/user/:userId/trips', createTripController)

router.get('/user/:userId/trips', getAllTripsController)

router.get('/user/:userId/trips/:tripId', getTripController)

router.patch('/user/:userId/trips/:tripId', updateTripController)

router.delete('/user/:userId/trips/:tripId', deleteTripController)

export default router
