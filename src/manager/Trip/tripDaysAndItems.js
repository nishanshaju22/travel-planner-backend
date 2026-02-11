import { prisma } from '../../config/db.js'

// ------------------------------
// initialise Trip Days and item
// ------------------------------
export async function syncTripDaysWithPlan(tripId) {
	return prisma.$transaction(async(tx) => {
		const trip = await tx.trip.findUnique({
			where: { id: tripId },
			include: { days: true },
		})

		if (!trip) throw new Error('Trip not found')

		const { plannedDate, plannedDuration } = trip

		if (!plannedDate || !plannedDuration) {
			throw new Error('Trip must have plannedDate and plannedDuration')
		}

		const startDate = new Date(plannedDate)
		startDate.setHours(0, 0, 0, 0)

		// Sort existing days by dayNumber
		const existingDays = [...trip.days].sort(
			(a, b) => a.dayNumber - b.dayNumber,
		)

		const duration = plannedDuration

		// 1️⃣ Delete extra days
		if (existingDays.length > duration) {
			const extraDays = existingDays.slice(duration)

			await tx.tripDay.deleteMany({
				where: {
					id: { in: extraDays.map(d => d.id) },
				},
			})
		}

		// 2️⃣ Update existing days
		const daysToUpdate = existingDays.slice(0, duration)

		for (let i = 0; i < daysToUpdate.length; i++) {
			const correctDate = new Date(startDate)
			correctDate.setDate(startDate.getDate() + i)

			const day = daysToUpdate[i]

			if (
				day.dayNumber !== i + 1 ||
				new Date(day.date).getTime() !== correctDate.getTime()
			) {
				await tx.tripDay.update({
					where: { id: day.id },
					data: {
						dayNumber: i + 1,
						date: correctDate,
					},
				})
			}
		}

		// 3️⃣ Create missing days
		if (existingDays.length < duration) {
			for (let i = existingDays.length; i < duration; i++) {
				const newDate = new Date(startDate)
				newDate.setDate(startDate.getDate() + i)

				await tx.tripDay.create({
					data: {
						tripId,
						dayNumber: i + 1,
						date: newDate,
					},
				})
			}
		}

		return tx.tripDay.findMany({
			where: { tripId },
			orderBy: { dayNumber: 'asc' },
		})
	})
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
