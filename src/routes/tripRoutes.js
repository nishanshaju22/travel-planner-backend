import express from 'express'
import {
	createTripController,
	getAllTripsController,
	getTripController,
	deleteTripController,
	updateTripBasicsController,
} from '../controllers/tripController.js'
import {
	addTripMembersController,
	removeTripMemberController,
	updateTripMemberRoleController,
} from '../controllers/tripMemberController.js'
import { authMiddleware } from '../middleware/authMiddleware.js'

const router = express.Router()
router.use(authMiddleware)

router.post('/user/:userId/trips', createTripController)

router.get('/user/:userId/trips', getAllTripsController)

router.get('/user/:userId/trips/:tripId', getTripController)

router.patch('/user/:userId/trips/:tripId', updateTripBasicsController)

router.delete('/user/:userId/trips/:tripId', deleteTripController)

router.post('/user/:userId/trips/:tripId/members', addTripMembersController)

router.patch('/user/:userId/trips/:tripId/members/:memberId', updateTripMemberRoleController)

router.delete('/user/:userId/trips/:tripId/members/:memberId', removeTripMemberController)

export default router
