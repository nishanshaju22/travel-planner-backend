import {
	addTripAccommodations,
	updateTripAccommodation,
	deleteTripAccommodation,
} from '../../manager/Trip/tripAccommodations.js'

export async function addTripAccommodationController(req, res) {
	const { tripId } = req.params
	const { accommodations } = req.body

	if (!Array.isArray(accommodations) || accommodations.length === 0) {
		return res.status(400).json({ error: 'Accommodations array is required' })
	}

	try {
		const created = await addTripAccommodations(tripId, accommodations)

		return res.status(201).json({
			status: 'success',
			data: { accommodations: created },
		})
	} catch (error) {
		return res.status(400).json({ error: error.message })
	}
}

export async function updateTripAccommodationController(req, res) {
	const { tripId, accommodationId } = req.params
	const updateData = req.body

	try {
		const updated = await updateTripAccommodation(
			accommodationId,
			tripId,
			updateData,
		)

		return res.status(200).json({
			status: 'success',
			data: { accommodation: updated },
		})
	} catch (error) {
		return res.status(400).json({ error: error.message })
	}
}

export async function deleteTripAccommodationController(req, res) {
	const { tripId, accommodationId } = req.params

	try {
		await deleteTripAccommodation(accommodationId, tripId)

		return res.status(200).json({
			status: 'success',
			message: 'Accommodation deleted successfully',
		})
	} catch (error) {
		return res.status(400).json({ error: error.message })
	}
}
