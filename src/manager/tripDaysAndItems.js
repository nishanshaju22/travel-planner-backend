import { prisma } from '../config/db.js'

// ------------------------
// Add Trip Days and item
// ------------------------
export async function addTripDays(tripId, days = []) {
	if (!days.length) return

	const createdDays = []
  	for (const d of days) {
		const day = await prisma.tripDay.create({
			data: {
				tripId,
				dayNumber: d.dayNumber,
				date: new Date(d.date),
				items: {
					create: (d.items || []).map(item => ({
						name: item.name,
						description: item.description,
						type: item.type,
						startTime: item.startTime ? new Date(item.startTime) : null,
						endTime: item.endTime ? new Date(item.endTime) : null,
						costEstimate: item.costEstimate,
						location: item.locationId ? { connect: { id: item.locationId } } : undefined,
					})),
				},
			},
			include: { items: true },
		})
		createdDays.push(day)
  	}

	return createdDays
}

export async function addTripItemsToDay(dayId, items = []) {
	if (!items.length) return []

	const createdItems = []
	for (const item of items) {
		const newItem = await prisma.itineraryItem.create({
			data: {
				dayId,
				name: item.name,
				description: item.description || null,
				type: item.type,
				startTime: item.startTime ? new Date(item.startTime) : null,
				endTime: item.endTime ? new Date(item.endTime) : null,
				costEstimate: item.costEstimate || null,
				location: item.locationId ? { connect: { id: item.locationId } } : undefined,
			},
			include: { location: true },
		})
		createdItems.push(newItem)
	}

	return createdItems
}

// -----------------------
// Get Trip Days
// -----------------------
export async function getTripDays(tripId) {
	return prisma.tripDay.findMany({
		where: { tripId },
		orderBy: { dayNumber: 'asc' },
		include: {
			items: {
				orderBy: { startTime: 'asc' },
				include: { location: true },
			},
		},
	})
}

// -----------------------
// Update Trip Item
// -----------------------
export async function updateTripItem(itemId, data) {
	const updateData = {}

	if (data.name !== undefined) updateData.name = data.name
	if (data.description !== undefined) updateData.description = data.description
	if (data.type !== undefined) updateData.type = data.type
	if (data.startTime !== undefined) {
		updateData.startTime = data.startTime ? new Date(data.startTime) : null
	}
	if (data.endTime !== undefined) {
		updateData.endTime = data.endTime ? new Date(data.endTime) : null
	}
	if (data.costEstimate !== undefined) {
		updateData.costEstimate = data.costEstimate
	}
	if (data.locationId !== undefined) {
		updateData.location = data.locationId
			? { connect: { id: data.locationId } }
			: { disconnect: true }
	}

	return prisma.itineraryItem.update({
		where: { id: itemId },
		data: updateData,
		include: { location: true },
	})
}

// -----------------------
// Delete Trip Item
// -----------------------
export async function deleteTripItem(itemId) {
	await prisma.itineraryItem.delete({
		where: { id: itemId },
	})

	return { message: 'Item deleted successfully' }
}
