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
import {
	addTripDaysController,
	addTripItemsController,
	deleteTripItemController,
	findLocationController,
	getTripDaysController,
	updateTripItemController,
} from '../controllers/tripDaysAndItemsController.js'
import { authMiddleware } from '../middleware/authMiddleware.js'

const router = express.Router()
router.use(authMiddleware)

router.post('/', createTripController)

router.get('/', getAllTripsController)

router.get('/findLocation', findLocationController)

router.get('/:tripId', getTripController)

router.patch('/:tripId', updateTripBasicsController)

router.delete('/:tripId', deleteTripController)

router.post('/:tripId/members', addTripMembersController)

router.patch('/:tripId/members/:memberId', updateTripMemberRoleController)

router.delete('/:tripId/members/:memberId', removeTripMemberController)

router.post('/:tripId/days', addTripDaysController)

router.post('/:tripId/days/:dayId/items', addTripItemsController)

router.get('/:tripId/days', getTripDaysController)

router.patch('/:tripId/items/:itemId', updateTripItemController)

router.delete('/:tripId/items/:itemId', deleteTripItemController)


export default router
