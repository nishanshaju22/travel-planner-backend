import { prisma } from '../config/db.js'
import {
	validateFutureDate,
	getUserTripOrThrow,
	assertNoTripOnDate,
	validateFriends,
	assertUserIsTripOwner,
} from '../utils/tripValidators.js'

// ----------------------
// Create Trip
// ----------------------
export async function createTrip(
	ownerId,
	name,
	plannedDate,
	plannedDuration,
	memberIds = [],
) {
	const date = validateFutureDate(plannedDate)

	if (plannedDuration <= 0) {
		throw new Error('The duration must be greater than 0.')
	}

	await assertNoTripOnDate(ownerId, date)
	await validateFriends(ownerId, memberIds)

	const trip = await prisma.trip.create({
		data: {
			name,
			ownerId,
			plannedDate: date,
			plannedDuration: Number(plannedDuration),
			members: {
				create: [
					{ userId: ownerId, role: 'OWNER' },
					...memberIds.map(id => ({
						userId: id,
						role: 'VIEWER',
					})),
				],
			},
		},
		include: {
			members: { include: { user: true } },
		},
	})

	return { status: 'success', data: { trip } }
}

// ----------------------
// Get All Trips
// ----------------------
export async function getAllTrips(ownerId) {
	const trips = await prisma.trip.findMany({
		where: {
			OR: [
				{ ownerId },
				{ members: { some: { userId: ownerId } } },
			],
		},
		orderBy: { plannedDate: 'asc' },
		include: {
			members: { include: { user: true } },
		},
	})

	return { status: 'success', data: { trips } }
}

// ----------------------
// Get Single Trip
// ----------------------
export async function getTrip(ownerId, tripId) {
	await getUserTripOrThrow(ownerId, tripId)

	const trip = await prisma.trip.findUnique({
		where: { id: tripId },
		include: {
			members: { include: { user: true } },
			accommodations: { include: { location: true } },
			days: {
				include: {
					items: { include: { location: true } },
				},
			},
		},
	})

	return { status: 'success', data: { trip } }
}

// ----------------------
// Update Trip
// ----------------------
export async function updateTripBasics(tripId, userId, { name, plannedDate, plannedDuration, budget }) {
	const data = {}

	await assertUserIsTripOwner(userId, tripId)

	if (name !== undefined) data.name = name
	if (plannedDate !== undefined) data.plannedDate = new Date(plannedDate)
	if (plannedDuration !== undefined) {
		if (plannedDuration <= 0) throw new Error('Duration must be > 0')
		data.plannedDuration = Number(plannedDuration)
	}
	if (budget !== undefined) data.budget = Number(budget)

	const updatedTrip = await prisma.trip.update({
		where: { id: tripId },
		data,
	})

	return updatedTrip
}


// -----------------------
// Update Trip Preferences
// -----------------------
export async function addTripPreferences(tripId, preferences = []) {

	const trip = await prisma.trip.findUnique({ where: { id: tripId } })

	const existingPrefs = trip.preference || []
	const updatedPrefs = Array.from(new Set([...existingPrefs, ...preferences]))

	const updatedTrip = await prisma.trip.update({
		where: { id: tripId },
		data: { preference: updatedPrefs },
	})

	return updatedTrip
}

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

export async function addTripAccommodations(tripId, accommodations = []) {
	if (!accommodations.length) return

	const created = []
	for (const a of accommodations) {
		const accom = await prisma.accommodation.create({
			data: {
				tripId,
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


// ----------------------
// Delete Trip
// ----------------------
export async function deleteTrip(ownerId, tripId) {
	await getUserTripOrThrow(ownerId, tripId)

	await prisma.trip.delete({
		where: { id: tripId },
	})

	return {
		status: 'success',
		message: 'Trip deleted successfully.',
	}
}
