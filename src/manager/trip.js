import { prisma } from '../config/db.js'
import { validateFutureDate, getUserTripOrThrow, assertNoTripOnDate } from '../utils/tripValidators.js'

export async function createTrip(ownerId, name, plannedDate, plannedDuration, memberIds = []) {
	const date = validateFutureDate(plannedDate)

	if (plannedDuration <= 0) {
		throw new Error('The duration must be greater than 0.')
	}

	await assertNoTripOnDate(prisma, ownerId, date)

	// Validate members are friends
	const owner = await prisma.user.findUnique({
		where: { id: ownerId },
		include: { friends: true },
	})

	const friendIds = owner.friends.map(f => f.id)
	const invalidMembers = memberIds.filter(id => !friendIds.includes(id))
	if (invalidMembers.length > 0) {
		throw new Error('All members must be friends of the trip owner.')
	}

	const trip = await prisma.trip.create({
		data: {
			name,
			ownerId,
			plannedDate: date,
			plannedDuration: Number(plannedDuration),
			members: {
				connect: memberIds.map(id => ({ id })),
			},
		},
		include: {
			members: true,
		},
	})

	return {
		status: 'success',
		data: { trip },
	}
}

export async function getAllTrips(ownerId) {
	const trips = await prisma.trip.findMany({
		where: { ownerId },
		orderBy: { plannedDate: 'asc' },
		include: { members: true },
	})

	return {
		status: 'success',
		data: { trips },
	}
}

export async function getTrip(ownerId, tripId) {
	const trip = await getUserTripOrThrow(prisma, ownerId, tripId)
	const tripDetal = await prisma.trip.findUnique({
		where: { id: trip.id },
		include: { members: true, accommodations: true, days: true  },
	})

	return {
		status: 'success',
		data: { trip: tripDetal },
	}
}

export async function updateTrip(ownerId, tripId, days = [], accommodations = [], 
								{ name, plannedDate, plannedDuration, memberIds, budget }) {
	// Ensure the trip exists and belongs to the owner
	const trip = await getUserTripOrThrow(prisma, ownerId, tripId)

	const data = {}

	// Update basic fields
	if (name !== undefined) {
		data.name = name
	}

	if (plannedDate !== undefined) {
		const date = validateFutureDate(plannedDate)
		await assertNoTripOnDate(prisma, ownerId, date, tripId)
		data.plannedDate = date
	}

	if (plannedDuration !== undefined) {
		if (plannedDuration <= 0) throw new Error('The duration must be greater than 0.')
		data.plannedDuration = Number(plannedDuration)
	}

	if (budget !== undefined) {
		data.budget = Number(budget)
	}

	// Update members if provided
	if (memberIds !== undefined) {
		const owner = await prisma.user.findUnique({
			where: { id: ownerId },
			include: { friends: true },
		})

		const friendIds = owner.friends.map(f => f.id)
		const invalidMembers = memberIds.filter(id => !friendIds.includes(id))
		if (invalidMembers.length > 0) {
			throw new Error('All members must be friends of the trip owner.')
		}

		data.members = { set: memberIds.map(id => ({ id })) }
	}

	// Update Trip Days if provided
	if (days.length > 0) {
		// Example: fully replace days (remove old & create new)
		data.days = {
			deleteMany: {}, // removes all existing TripDay for this trip
			create: days.map(d => ({
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
			})),
		}
	}

	// Update Accommodations if provided
	if (accommodations.length > 0) {
		data.accommodations = {
			deleteMany: {}, // removes existing accommodations
			create: accommodations.map(a => ({
				name: a.name,
				type: a.type,
				checkIn: new Date(a.checkIn),
				checkOut: new Date(a.checkOut),
				cost: a.cost ? Number(a.cost) : null,
				location: { connect: { id: a.locationId } },
			})),
		}
	}

	// Perform update
	const updatedTrip = await prisma.trip.update({
		where: { id: tripId },
		data,
		include: {
			members: true,
			days: { include: { items: { include: { location: true } } } },
			accommodations: { include: { location: true } },
		},
	})

	return { status: 'success', data: { trip: updatedTrip } }
}

export async function deleteTrip(ownerId, tripId) {
	await getUserTripOrThrow(prisma, ownerId, tripId)

	await prisma.trip.delete({
		where: { id: tripId },
	})

	return {
		status: 'success',
		message: 'Trip deleted successfully.',
	}
}
