import {
	createTrip,
	getAllTrips,
	getTrip,
	updateTrip,
	deleteTrip,
} from '../manager/trip.js'

async function createTripController(req, res) {
	const ownerId = req.params.userId
	const { name, plannedDate, plannedDuration, memberIds } = req.body

	try {
		const result = await createTrip(ownerId, name, plannedDate, plannedDuration, memberIds)
		return res.status(201).json(result)
	} catch (error) {
		return res.status(400).json({ error: error.message })
	}
}

async function getAllTripsController(req, res) {
	const ownerId = req.params.userId

	try {
		const result = await getAllTrips(ownerId)
		return res.status(200).json(result)
	} catch (error) {
		return res.status(400).json({ error: error.message })
	}
}

async function getTripController(req, res) {
	const ownerId = req.params.userId
	const tripId = req.params.tripId

	try {
		const result = await getTrip(ownerId, tripId)
		return res.status(200).json(result)
	} catch (error) {
		return res.status(404).json({ error: error.message })
	}
}

async function updateTripController(req, res) {
	const ownerId = req.params.userId
	const tripId = req.params.tripId
	const { name, plannedDate, plannedDuration, memberIds, budget, days, accommodations } = req.body

	try {
		const result = await updateTrip(ownerId, tripId, days,
			accommodations, {
				name,
				plannedDate,
				plannedDuration,
				memberIds,
				budget,
			})
		return res.status(200).json(result)
	} catch (error) {
		return res.status(400).json({ error: error.message })
	}
}

async function deleteTripController(req, res) {
	const ownerId = req.params.userId
	const tripId = req.params.tripId

	try {
		const result = await deleteTrip(ownerId, tripId)
		return res.status(200).json(result)
	} catch (error) {
		return res.status(404).json({ error: error.message })
	}
}

export {
	createTripController,
	getAllTripsController,
	getTripController,
	updateTripController,
	deleteTripController,
}
