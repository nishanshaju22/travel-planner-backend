import { assertAccommodationBelongsToTrip } from '../../utils/tripValidators.js'
import { prisma } from '../../config/db.js'

export async function addTripAccommodations(tripId, accommodations = []) {
	if (!accommodations.length) return

	const created = []
	for (const a of accommodations) {
		const accom = await prisma.accommodation.create({
			data: {
				trip: { connect: { id: tripId } },
				name: a.name,
				type: a.type,
				checkIn: new Date(a.checkIn),
				checkOut: new Date(a.checkOut),
				cost: a.cost ? Number(a.cost) : null,
				location: { connect: { id: a.locationId } },
			},
			include: { location: true },
		})
		created.push(accom)
	}

	return created
}

export async function updateTripAccommodation(
	accommodationId,
	tripId,
	data,
) {
	await assertAccommodationBelongsToTrip(accommodationId, tripId)

	const updateData = {}

	if (data.name !== undefined) updateData.name = data.name
	if (data.type !== undefined) updateData.type = data.type
	if (data.checkIn !== undefined)
		updateData.checkIn = new Date(data.checkIn)
	if (data.checkOut !== undefined)
		updateData.checkOut = new Date(data.checkOut)
	if (data.cost !== undefined)
		updateData.cost = data.cost !== null ? Number(data.cost) : null
	if (data.locationId !== undefined)
		updateData.location = { connect: { id: data.locationId } }

	const updated = await prisma.accommodation.update({
		where: { id: accommodationId },
		data: updateData,
		include: { location: true },
	})

	return updated
}

export async function deleteTripAccommodation(
	accommodationId,
	tripId,
) {
	await assertAccommodationBelongsToTrip(accommodationId, tripId)

	await prisma.accommodation.delete({
		where: { id: accommodationId },
	})

	return { message: 'Accommodation deleted successfully' }
}
