import { prisma } from '../config/db.js'

export function validateFutureDate(dateInput) {
	const date = new Date(dateInput)

	if (isNaN(date)) {
		throw new Error('Please provide a valid date.')
	}

	if (date < new Date()) {
		throw new Error('The planned date must be in the future.')
	}

	return date
}

export function getDayRange(date) {
	const start = new Date(date)
	start.setHours(0, 0, 0, 0)

	const end = new Date(date)
	end.setHours(23, 59, 59, 999)

	return { start, end }
}

export async function getUserTripOrThrow(ownerId, tripId) {
	const trip = await prisma.trip.findFirst({
		where: {
			id: tripId,
			ownerId,
		},
		include: { members: true },
	})

	if (!trip) throw new Error('Trip not found.')

	return trip
}


export async function assertNoTripOnDate(ownerId, date, excludeTripId = null) {
	const { start, end } = getDayRange(date)

	const trip = await prisma.trip.findFirst({
		where: {
			ownerId, // updated field
			plannedDate: { gte: start, lte: end },
			...(excludeTripId && { NOT: { id: excludeTripId } }),
		},
	})

	if (trip) throw new Error('You already have a trip planned for this date.')
}

export async function assertUserIsTripOwner(userId, tripId) {
	const trip = await prisma.trip.findUnique({
		where: { id: tripId },
		select: { ownerId: true },
	})

	if (!trip) {
		throw new Error('Trip not found')
	}

	if (trip.ownerId !== userId) {
		throw new Error('User is not the owner of this trip')
	}
}

export async function validateFriends(ownerId, memberIds = []) {
	if (!memberIds.length) return

	const friendships = await prisma.friendship.findMany({
		where: {
			userId: ownerId,
			status: 'ACCEPTED',
		},
	})

	const friendIds = friendships.map(f => f.friendId)
	const invalidMembers = memberIds.filter(id => !friendIds.includes(id))

	if (invalidMembers.length > 0) {
		throw new Error('All members must be friends of the trip owner.')
	}
}
