import { createTrip } from '../manager/trip.js'

async function createTripController(req, res) {
    const userId = req.params.userId;
	const { name, plannedDate, plannedDuration } = req.body

	try {
		const result = await createTrip(userId, name, plannedDate, plannedDuration)
		return res.status(201).json(result)
	} catch (error) {
		return res.status(400).json({ error: error.message })
	}
}

export { createTripController }