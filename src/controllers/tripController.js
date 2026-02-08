import {
	createTrip,
	getAllTrips,
	getTrip,
	deleteTrip,
	updateTripBasics,
} from '../manager/trip.js'

import { assertUserIsTripOwner } from '../utils/tripValidators.js'

async function createTripController(req, res) {
	const ownerId = req.user.id
	const { name, plannedDate, plannedDuration, memberIds, budget, preferences } = req.body

	try {
		const result = await createTrip(ownerId, name, plannedDate,
			plannedDuration, memberIds, budget, preferences)
		return res.status(201).json(result)
	} catch (error) {
		return res.status(400).json({ error: error.message })
	}
}

async function getAllTripsController(req, res) {
	const userId = req.user.id

	try {
		const result = await getAllTrips(userId)
		return res.status(200).json(result)
	} catch (error) {
		return res.status(400).json({ error: error.message })
	}
}

async function getTripController(req, res) {
	const userId = req.user.id
	const tripId = req.params.tripId

	try {
		const result = await getTrip(userId, tripId)
		return res.status(200).json(result)
	} catch (error) {
		return res.status(404).json({ error: error.message })
	}
}

async function updateTripBasicsController(req, res) {
	const userId = req.user.id
	const tripId = req.params.tripId
	const { name, plannedDate, plannedDuration, budget, preferences } = req.body

	try {
		await assertUserIsTripOwner(userId, tripId)

		const result = await updateTripBasics(tripId, {
			name,
			plannedDate,
			plannedDuration,
			budget,
			preferences,
		})
		return res.status(200).json(result)
	} catch (error) {
		return res.status(400).json({ error: error.message })
	}
}

async function deleteTripController(req, res) {
	const ownerId = req.user.id
	const tripId = req.params.tripId


	try {
		await assertUserIsTripOwner(ownerId, tripId)

		const result = await deleteTrip(tripId)
		return res.status(200).json(result)
	} catch (error) {
		return res.status(404).json({ error: error.message })
	}
}

export {
	createTripController,
	getAllTripsController,
	getTripController,
	deleteTripController,
	updateTripBasicsController,
}
