import { prisma } from '../config/db.js'
import {
	validateFutureDate,
	getUserTripOrThrow,
	assertNoTripOnDate,
	validateFriends,
	assertUserIsTripOwner,
	validateTripPreferences,
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
	budget,
	preferences = [],
) {
	const date = validateFutureDate(plannedDate)

	if (plannedDuration <= 0) {
		throw new Error('The duration must be greater than 0.')
	}

	await assertNoTripOnDate(ownerId, date)
	await validateFriends(ownerId, memberIds)
	validateTripPreferences(preferences)

	if (!Array.isArray(preferences)) {
		throw new Error('Preferences must be an array')
	}

	const trip = await prisma.trip.create({
		data: {
			name,
			ownerId,
			plannedDate: date,
			plannedDuration: Number(plannedDuration),
			budget: budget !== undefined ? Number(budget) : null,
			preferences: preferences.length > 0 ? preferences : [],
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
export async function getAllTrips(userId) {
	const trips = await prisma.trip.findMany({
		where: {
			OR: [
				{ ownerId: userId },
				{ members: { some: { userId } } },
			],
		},
		orderBy: { plannedDate: 'asc' },
		include: {
			members: {
				include: {
					user: {
						select: {
							id: true,
							name: true,
							email: true,
							createdAt: true,
							updatedAt: true,
						},
					},
				},
			},
		},
	})

	return { status: 'success', data: { trips } }
}


// ----------------------
// Get Single Trip
// ----------------------
export async function getTrip(userId, tripId) {
	const trip = await getUserTripOrThrow(userId, tripId)
	return { status: 'success', data: { trip } }
}
// ----------------------
// Update Trip
// ----------------------
export async function updateTripBasics(tripId, { name, plannedDate, plannedDuration, budget, preferences }) {
	const data = {}

	if (name !== undefined) data.name = name
	if (plannedDate !== undefined) data.plannedDate = new Date(plannedDate)
	if (plannedDuration !== undefined) {
		if (plannedDuration <= 0) throw new Error('Duration must be > 0')
		data.plannedDuration = Number(plannedDuration)
	}
	if (budget !== undefined) data.budget = Number(budget)

	if (preferences !== undefined) {
		validateTripPreferences(preferences)
		data.preferences = preferences
	}

	const updatedTrip = await prisma.trip.update({
		where: { id: tripId },
		data,
	})

	return updatedTrip
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
export async function deleteTrip(tripId) {
	await prisma.trip.delete({
		where: { id: tripId },
	})

	return {
		status: 'success',
		message: 'Trip deleted successfully.',
	}
}
