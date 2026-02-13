import express from 'express'
import {
	createTripController,
	getAllTripsController,
	getTripController,
	deleteTripController,
	updateTripBasicsController,
} from '../controllers/trip/tripController.js'
import {
	addTripMembersController,
	removeTripMemberController,
	updateTripMemberRoleController,
} from '../controllers/trip/tripMemberController.js'
import {
	syncTripDaysWithPlanController,
	addTripItemsController,
	deleteTripItemController,
	findLocationController,
	getTripDaysController,
	updateTripItemController,
} from '../controllers/trip/tripDaysAndItemsController.js'
import {
	addTripAccommodationController,
	updateTripAccommodationController,
	deleteTripAccommodationController,
} from '../controllers/trip/tripAccommodationsController.js'
import { authMiddleware } from '../middleware/authMiddleware.js'

const router = express.Router()
router.use(authMiddleware)

router.post('/', createTripController)

router.get('/', getAllTripsController)

router.get('/findLocation', findLocationController)

router.get('/:tripId', getTripController)

router.patch('/:tripId', updateTripBasicsController)

router.delete('/:tripId', deleteTripController)

router.post('/:tripId/days/initialise', syncTripDaysWithPlanController)

router.post('/:tripId/members', addTripMembersController)

router.patch('/:tripId/members/:memberId', updateTripMemberRoleController)

router.delete('/:tripId/members/:memberId', removeTripMemberController)

router.post('/:tripId/accommodations', addTripAccommodationController)

router.put('/:tripId/accommodations/:accommodationId', updateTripAccommodationController)

router.delete('/:tripId/accommodations/:accommodationId', deleteTripAccommodationController)

router.post('/:tripId/days/:dayId/items', addTripItemsController)

router.get('/:tripId/days', getTripDaysController)

router.patch('/:tripId/items/:itemId', updateTripItemController)

router.delete('/:tripId/items/:itemId', deleteTripItemController)


export default router
