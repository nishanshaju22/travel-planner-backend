import {
	createTrip,
	getAllTrips,
	getTrip,
	updateTrip,
	deleteTrip,
} from '../manager/trip.js'

async function createTripController(req, res) {
	const userId = req.params.userId
	const { name, plannedDate, plannedDuration } = req.body

	try {
		const result = await createTrip(userId, name, plannedDate, plannedDuration)
		return res.status(201).json(result)
	} catch (error) {
		return res.status(400).json({ error: error.message })
	}
}

async function getAllTripsController(req, res) {
	const userId = req.params.userId

	try {
		const result = await getAllTrips(userId)
		return res.status(200).json(result)
	} catch (error) {
		return res.status(400).json({ error: error.message })
	}
}

async function getTripController(req, res) {
	const userId = req.params.userId
	const tripId = req.params.tripId

	try {
		const result = await getTrip(userId, tripId)
		return res.status(200).json(result)
	} catch (error) {
		return res.status(404).json({ error: error.message })
	}
}

async function updateTripController(req, res) {
	const userId = req.params.userId
	const tripId = req.params.tripId
	const { name, plannedDate, plannedDuration } = req.body

	try {
		const result = await updateTrip(userId, tripId, {
			name,
			plannedDate,
			plannedDuration,
		})
		return res.status(200).json(result)
	} catch (error) {
		return res.status(400).json({ error: error.message })
	}
}

async function deleteTripController(req, res) {
	const userId = req.params.userId
	const tripId = req.params.tripId

	try {
		const result = await deleteTrip(userId, tripId)
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
